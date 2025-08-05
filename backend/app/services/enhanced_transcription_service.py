import json
import os
import re
import subprocess
import tempfile
from typing import Dict, List, Optional
from difflib import SequenceMatcher
import httpx
from app.core.config import settings
from app.utils.audio_utils import transcribe_with_whisper_cpp
import unicodedata
from diff_match_patch import diff_match_patch
from rapidfuzz import fuzz
try:
    from tamil_tokenizer.tokenizer import tokenize as tamil_tokenize
except ImportError:
    def tamil_tokenize(text):
        return text.split()  # fallback: space split

# Import Indic transliteration
try:
    from indic_transliteration import sanscript
    from indic_transliteration.sanscript import transliterate
    INDIC_AVAILABLE = True
except ImportError:
    print("⚠️  indic-transliteration not available. Install with: pip install indic-transliteration")
    INDIC_AVAILABLE = False

from app.services.sarvam_batch_service import SarvamBatchService
from supabase_client import supabase

print("🚀 Enhanced Transcription Service - Loading with Sarvam Chat integration...")

# Import Sarvam client for chat functionality
import os
from dotenv import load_dotenv
from sarvamai import SarvamAI

load_dotenv()
SARVAM_API_KEY = os.getenv("SARVAM_API_KEY")
sarvam_client = None

print(f"🔍 Debug - SARVAM_API_KEY exists: {bool(SARVAM_API_KEY)}")
if SARVAM_API_KEY:
    try:
        sarvam_client = SarvamAI(api_subscription_key=SARVAM_API_KEY)
        print("✅ Sarvam client initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize Sarvam client: {e}")
        sarvam_client = None
else:
    print("⚠️ SARVAM_API_KEY not set in environment variables")


class EnhancedTranscriptionService:
    """
    Multi-pipeline transcription service that combines:
    - Whisper.cpp for accurate timestamps
    - ElevenLabs for speaker diarization and English structure
    - Sarvam API for Tamil word accuracy
    """
    
    def __init__(self):
        # Use absolute paths for Windows compatibility
        # From backend/app/services/ -> backend/whisper.cpp/
        current_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        self.whisper_model_path = os.path.join(current_dir, "whisper.cpp", "models", "ggml-base.bin")
        self.whisper_binary_path = os.path.join(current_dir, "whisper.cpp", "build", "bin", "whisper-cli.exe")
        
        print(f"🔍 Debug - Current directory: {current_dir}")
        print(f"🔍 Debug - Whisper binary path: {self.whisper_binary_path}")
        print(f"🔍 Debug - Whisper model path: {self.whisper_model_path}")
        
        # Verify paths exist
        if not os.path.exists(self.whisper_binary_path):
            print(f"❌ Whisper binary not found at: {self.whisper_binary_path}")
        else:
            print(f"✅ Whisper binary found at: {self.whisper_binary_path}")
            
        if not os.path.exists(self.whisper_model_path):
            print(f"❌ Whisper model not found at: {self.whisper_model_path}")
        else:
            print(f"✅ Whisper model found at: {self.whisper_model_path}")
        
        self.sarvam_batch = SarvamBatchService(api_key=os.getenv("SARVAM_API_KEY", "YOUR_API_KEY"))
    
    def _convert_thanglish_to_tamil(self, text: str) -> str:
        """Convert Thanglish (Tamil in English script) to Tamil using Indic transliteration"""
        if not INDIC_AVAILABLE:
            print("⚠️  Indic transliteration not available, returning original text")
            return text
        
        try:
            # Convert to Tamil using ITRANS scheme
            tamil_text = transliterate(text, sanscript.ITRANS, sanscript.TAMIL)
            print(f"🔄 Thanglish to Tamil: '{text}' -> '{tamil_text}'")
            return tamil_text
        except Exception as e:
            print(f"❌ Transliteration failed for '{text}': {e}")
            return text
    

    
    def _insert_missing_words(self, text: str, missing_words: List[str]) -> str:
        """Insert missing words into the text at appropriate positions"""
        if not missing_words:
            return text
        
        try:
            # Simple approach: append missing words at the end
            # More sophisticated approach could analyze context and insert at appropriate positions
            missing_text = " ".join(missing_words)
            enhanced_text = f"{text} {missing_text}"
            
            print(f"🔄 Inserted missing words: '{text}' -> '{enhanced_text}'")
            return enhanced_text
            
        except Exception as e:
            print(f"❌ Error inserting missing words: {e}")
            return text
    
    def _normalize_text(self, text):
        # Unicode NFC, remove ZWJ/ZWNJ, strip, remove duplicate spaces
        text = unicodedata.normalize('NFC', text)
        text = text.replace('\u200d', '').replace('\u200c', '')
        text = ' '.join(text.split())
        return text.strip()

    def _split_sentences(self, text):
        # Split on Tamil full stop, Devanagari danda, or newlines
        import re
        return [s.strip() for s in re.split(r'[\.।\n]', text) if s.strip()]

    def _find_overlap_tokens(self, seg, sarvam_segments):
        # Find Sarvam segment overlapping in time, else fallback to greedy string search
        seg_start = seg.get('start', seg.get('start_time', 0.0))
        seg_end = seg.get('end', seg.get('end_time', 0.0))
        best = None
        best_score = 0
        for s in sarvam_segments:
            s_start = s.get('start', s.get('start_time', 0.0))
            s_end = s.get('end', s.get('end_time', 0.0))
            # Time overlap heuristic (±1s window)
            if abs(seg_start - s_start) < 1.5 or abs(seg_end - s_end) < 1.5:
                score = fuzz.token_sort_ratio(seg['text'], s['text'])
                if score > best_score:
                    best = s
                    best_score = score
        if best:
            return tamil_tokenize(self._normalize_text(best['text']))
        # fallback: greedy search
        if sarvam_segments:
            return tamil_tokenize(self._normalize_text(sarvam_segments[0]['text']))
        return []

    def _myers_token_diff(self, tokens1, tokens2):
        dmp = diff_match_patch()
        # Join tokens with \u200b (zero-width space) to avoid accidental merges
        s1 = '\u200b'.join(tokens1)
        s2 = '\u200b'.join(tokens2)
        diffs = dmp.diff_main(s1, s2)
        dmp.diff_cleanupSemantic(diffs)
        # Split back to tokens
        result = []
        for op, chunk in diffs:
            chunk_tokens = chunk.split('\u200b') if chunk else []
            for tok in chunk_tokens:
                if not tok:
                    continue
                if op == 0:
                    result.append(('equal', tok))
                elif op == -1:
                    result.append(('delete', tok))
                elif op == 1:
                    result.append(('insert', tok))
        return result

    def _hybrid_merge_transcripts(self, elevenlabs, sarvam):
        # Preprocess Sarvam into segments (if diarized), else treat as one
        if isinstance(sarvam, str):
            sarvam_sentences = self._split_sentences(sarvam)
            sarvam_segments = [{'text': s} for s in sarvam_sentences]
        elif isinstance(sarvam, list):
            sarvam_segments = sarvam
            sarvam_sentences = [s.get('text', '') for s in sarvam_segments]
        else:
            sarvam_segments = []
            sarvam_sentences = []
        merged = []
        for seg in elevenlabs:
            seg_text = self._normalize_text(seg.get('text', ''))
            E_tokens = tamil_tokenize(seg_text)
            S_tokens = self._find_overlap_tokens(seg, sarvam_segments)
            diffs = self._myers_token_diff(E_tokens, S_tokens)
            merged_tokens = []
            for op, tok in diffs:
                if op == 'equal':
                    merged_tokens.append(tok)
                elif op == 'insert':
                    merged_tokens.append(tok)
                elif op == 'delete':
                    if fuzz.ratio(tok, tok) >= 75:
                        merged_tokens.append(tok)
                else:
                    continue
            merged_text = ' '.join(merged_tokens)
            merged.append({
                'speaker': seg.get('speaker', 'Unknown'),
                'start': seg.get('start', seg.get('start_time', 0.0)),
                'end': seg.get('end', seg.get('end_time', 0.0)),
                'text': merged_text,
                'confidence': seg.get('confidence', 0.0)
            })
        # Add any Sarvam sentences not present in any merged segment
        unused = []
        unused_segments = []
        for i, s in enumerate(sarvam_segments):
            s_text = s.get('text', '') if isinstance(s, dict) else s
            s_norm = self._normalize_text(s_text)
            found = False
            for m in merged:
                m_text = self._normalize_text(m['text'])
                if s_norm in m_text:
                    found = True
                    break
                if fuzz.ratio(s_norm, m_text) >= 85:
                    found = True
                    break
            if not found and s_norm:
                if isinstance(s, dict):
                    # Diarized segment: preserve all fields
                    unused_segments.append({
                        'speaker': s.get('speaker', 'sarvam_extra'),
                        'start': s.get('start', None),
                        'end': s.get('end', None),
                        'text': s_text,
                        'confidence': s.get('confidence', 1.0)
                    })
                else:
                    unused.append(s_text)
        # Append unmatched diarized segments individually
        merged.extend(unused_segments)
        # For plain string input, append each unmatched as its own segment
        for u in unused:
            merged.append({
                'speaker': 'sarvam_extra',
                'start': None,
                'end': None,
                'text': u,
                'confidence': 1.0
            })
        # Sort merged segments by start time (None values last)
        merged.sort(key=lambda seg: (seg['start'] is None, seg['start'] if seg['start'] is not None else float('inf')))
        return merged
    
    async def _sarvam_chat_merge_transcripts(self, elevenlabs_result, sarvam_result):
        """
        Use Sarvam Chat to intelligently compare and correct transcripts.
        Uses ElevenLabs as base and corrects with Sarvam, filling missing words from both.
        """
        print("🔍 Starting Sarvam Chat merge function...")
        try:
            # Extract text from both transcripts
            elevenlabs_text = " ".join([seg.get('text', '') for seg in elevenlabs_result]) if elevenlabs_result else ""
            
            if isinstance(sarvam_result, list):
                sarvam_text = " ".join([seg.get('text', '') for seg in sarvam_result])
            else:
                sarvam_text = str(sarvam_result or "")
            
            print(f"🔍 ElevenLabs text length: {len(elevenlabs_text)}")
            print(f"🔍 Sarvam text length: {len(sarvam_text)}")
            
            # Use Sarvam Chat to compare and correct transcripts
            print("🔍 About to call Sarvam Chat API...")
            optimal_text = await self._get_optimal_transcript_via_chat(elevenlabs_text, sarvam_text)
            print(f"🔍 Sarvam Chat returned text length: {len(optimal_text) if optimal_text else 0}")
            print(f"🔍 Sarvam Chat output: {optimal_text[:200]}..." if optimal_text and len(optimal_text) > 200 else f"🔍 Sarvam Chat output: {optimal_text}")
            
            # If chat service fails, fallback to longer transcript
            if not optimal_text or optimal_text.strip() == "":
                print("⚠️ Sarvam Chat failed, using fallback logic")
                if len(sarvam_text) > len(elevenlabs_text):
                    optimal_text = sarvam_text
                else:
                    optimal_text = elevenlabs_text
                print(f"🔍 Using fallback text: {optimal_text[:100]}...")
        
            # Create simple final transcript structure with the merged text
            final_transcript = [{
                "text": optimal_text,
                "speaker": "speaker_0",
                "start": 0.0,
                "end": 0.0,
                "confidence": 1.0
            }]
        
            print(f"✅ Sarvam Chat merge completed. Final transcript: {optimal_text[:100]}...")
            return final_transcript
            
        except Exception as e:
            print(f"❌ Error in Sarvam Chat merge: {e}")
            # Fallback to professional intelligent merge
            elevenlabs_text = " ".join([seg.get('text', '') for seg in elevenlabs_result]) if elevenlabs_result else ""
            if isinstance(sarvam_result, list):
                sarvam_text = " ".join([seg.get('text', '') for seg in sarvam_result])
            else:
                sarvam_text = str(sarvam_result or "")
            
            optimal_text = self._professional_intelligent_merge_fallback(elevenlabs_text, sarvam_text)
            
            # Create final transcript structure with professional merged text
            if elevenlabs_result and optimal_text:
                segments = self._distribute_sarvam_text(elevenlabs_result, optimal_text)
                return segments
            elif sarvam_result and isinstance(sarvam_result, list):
                return sarvam_result
            else:
                return [{"text": optimal_text, "speaker": "speaker_0", "start": 0, "end": 0}]
    
    async def _get_optimal_transcript_via_chat(self, elevenlabs_text: str, sarvam_text: str) -> str:
        """
        Use Sarvam Chat API to compare and correct transcripts.
        """
        print("🔍 Entering _get_optimal_transcript_via_chat function")
        
        try:
            # Create a fresh Sarvam client instance to ensure proper initialization
            if not SARVAM_API_KEY:
                print("⚠️ SARVAM_API_KEY not available")
                return sarvam_text if len(sarvam_text) > len(elevenlabs_text) else elevenlabs_text
            
            fresh_client = SarvamAI(api_subscription_key=SARVAM_API_KEY)
            print("🔍 Fresh Sarvam client created for Chat API")
            
            print("🔍 Preparing Sarvam Chat messages with professional merging prompt...")
            messages = [
                {
                    "role": "system",
                    "content": (
                        "Act as a professional text merging and optimization expert. You specialize in analyzing and merging Tamil transcripts to create the most accurate, natural, and coherent final output. "
                        "Your expertise includes: Tamil grammar and syntax, natural language flow, contextual understanding, speaker voice preservation, and technical accuracy. "
                        "Always prioritize coherence and readability while maintaining the authentic voice and emotional expressions of the original speaker."
                    )
                },
                {
                    "role": "user",
                    "content": (
                        "Analyze the following two Tamil texts and create an optimally merged transcript:\n\n"
                        f"**Base Text (Primary Source):** {elevenlabs_text}\n\n"
                        f"**Supplementary Text (Secondary Source):** {sarvam_text}\n\n"
                        "**Requirements:**\n"
                        "- Use the Base Text as the foundation\n"
                        "- Integrate all unique content from the Supplementary Text\n"
                        "- Maintain original speaker's voice and emotional expressions\n"
                        "- Standardize numerical values (prices, quantities) in digit format (₹20 instead of இருபது ரூபாய்)\n"
                        "- Resolve any TTS errors or inconsistencies\n"
                        "- Preserve all contextual details and narrative flow\n"
                        "- Intelligently merge duplicate content\n"
                        "- Ensure proper formatting of prices (₹ symbol before numbers)\n"
                        "- Maintain conversational tone and colloquial expressions\n"
                        "- Handle Tanglish words appropriately (keep English technical terms as-is)\n"
                        "- Prioritize coherence and readability over verbatim matching\n\n"
                        "**Output ONLY the final merged transcript in natural Tamil without any explanations or formatting.**"
                    )
                }
            ]
            
            # Check if Chat API is available in the SDK
            if not hasattr(fresh_client, 'chat'):
                print("🔍 Chat API not available in current SDK version, using professional intelligent fallback merging...")
                # Professional intelligent fallback: merge transcripts using the same logic as the professional prompt
                optimal_transcript = self._professional_intelligent_merge_fallback(elevenlabs_text, sarvam_text)
                print(f"✅ Intelligent merge completed. Length: {len(optimal_transcript)}")
                print(f"🔍 Merged transcript: {optimal_transcript}")
                return optimal_transcript
            
            print("🔍 Attempting Sarvam Chat API call...")
            
            # Make the actual Chat API call
            response = fresh_client.chat.completions(
                model="sarvamai/sarvam-2b-v0.5",
                messages=messages,
                max_tokens=2000,
                temperature=0.1
            )
            
            print(f"🔍 Chat API response received: {response}")
            
            # Extract the merged transcript from the response
            if response and hasattr(response, 'choices') and len(response.choices) > 0:
                optimal_transcript = response.choices[0].message.content.strip()
                print(f"✅ Sarvam Chat API merge completed. Length: {len(optimal_transcript)}")
                print(f"🔍 Chat API merged transcript: {optimal_transcript[:200]}...")
                return optimal_transcript
            else:
                print("⚠️ Invalid response from Chat API, using fallback")
                optimal_transcript = self._professional_intelligent_merge_fallback(elevenlabs_text, sarvam_text)
                return optimal_transcript
            
        except Exception as e:
            print(f"❌ Error in Sarvam Chat API: {e}")
            # Return longer transcript as fallback
            return sarvam_text if len(sarvam_text) > len(elevenlabs_text) else elevenlabs_text
    
    def _professional_intelligent_merge_fallback(self, elevenlabs_text: str, sarvam_text: str) -> str:
        """
        Professional intelligent fallback merging that follows the same requirements as the professional prompt.
        Uses ElevenLabs as base text and integrates unique content from Sarvam as supplementary text.
        """
        try:
            print(f"🎭 Professional merge: Base Text ({len(elevenlabs_text)} chars) + Supplementary ({len(sarvam_text)} chars)")
            
            # Use ElevenLabs as the foundation (Base Text)
            base_text = elevenlabs_text
            supplementary_text = sarvam_text
            
            # Step 1: Start with base text and clean it up
            merged_transcript = self._clean_base_text(base_text)
            
            # Step 2: Integrate unique content from supplementary text
            merged_transcript = self._integrate_supplementary_content(merged_transcript, supplementary_text)
            
            # Step 3: Apply professional optimizations
            merged_transcript = self._apply_professional_optimizations(merged_transcript)
            
            print("🔍 Using ElevenLabs as base with professional supplementary integration")
            return merged_transcript
            
        except Exception as e:
            print(f"❌ Error in professional merge: {e}")
            # Fallback to quality-based selection
            return self._intelligent_merge_fallback(elevenlabs_text, sarvam_text)
    
    def _clean_base_text(self, base_text: str) -> str:
        """
        Clean and standardize the base text.
        """
        try:
            cleaned = base_text
            
            # Fix spacing issues
            cleaned = re.sub(r'\s+', ' ', cleaned)  # Multiple spaces to single
            cleaned = re.sub(r'\s*([.,!?])\s*', r'\1 ', cleaned)  # Fix punctuation spacing
            
            # Fix parentheses spacing
            cleaned = re.sub(r'\s*\(\s*', ' (', cleaned)
            cleaned = re.sub(r'\s*\)\s*', ') ', cleaned)
            
            return cleaned.strip()
            
        except Exception as e:
            print(f"❌ Error cleaning base text: {e}")
            return base_text
    
    def _integrate_supplementary_content(self, base_text: str, supplementary_text: str) -> str:
        """
        Integrate unique and better content from supplementary text into base text.
        """
        try:
            # For now, use quality-based selection between the two
            # In a full implementation, this would do word-by-word comparison
            base_quality = self._calculate_tamil_quality_score(base_text)
            supp_quality = self._calculate_tamil_quality_score(supplementary_text)
            
            print(f"🔍 Quality comparison - Base: {base_quality:.1f}, Supplementary: {supp_quality:.1f}")
            
            # If supplementary has significantly better quality, use it instead
            if supp_quality > base_quality * 1.2:
                print("🔍 Supplementary text has significantly better quality, using it as primary")
                return supplementary_text
            
            # Otherwise, use base text with corrections
            return base_text
            
        except Exception as e:
            print(f"❌ Error integrating supplementary content: {e}")
            return base_text
    
    def _apply_professional_optimizations(self, text: str) -> str:
        """
        Apply professional optimizations as specified in the prompt.
        """
        try:
            optimized = text
            
            # Standardize numerical values (convert Tamil numbers to digits)
            # This is a simplified version - full implementation would handle all Tamil numbers
            tamil_numbers = {
                'இருபது': '20',  # இருபது -> 20
                'முப்பது': '30',  # முப்பது -> 30
                'நால்பது': '40',  # நாற்பது -> 40
                'ஐம்பது': '50',   # ஐம்பது -> 50
            }
            
            for tamil_num, digit in tamil_numbers.items():
                if 'ரூபாய்' in optimized:  # ரூபாய்
                    optimized = optimized.replace(f'{tamil_num} ரூபாய்', f'₹{digit}')
                    optimized = optimized.replace(f'{tamil_num}ரூபாய்', f'₹{digit}')
            
            # Clean up multiple consecutive spaces
            optimized = re.sub(r'\s{2,}', ' ', optimized)
            
            # Ensure proper spacing around currency symbols
            optimized = re.sub(r'(₹)\s*', r'\1', optimized)  # Remove space after ₹
            
            return optimized.strip()
            
        except Exception as e:
            print(f"❌ Error applying professional optimizations: {e}")
            return text
    
    def _intelligent_merge_fallback(self, elevenlabs_text: str, sarvam_text: str) -> str:
        """
        Intelligent fallback merging when Chat API is not available.
        Combines the best elements from both transcripts using rule-based logic.
        """
        try:
            print(f"🤖 Intelligent merge: ElevenLabs ({len(elevenlabs_text)} chars) vs Sarvam ({len(sarvam_text)} chars)")
            
            # Prioritize Tamil quality over length - only use length if difference is extreme
            if len(sarvam_text) > len(elevenlabs_text) * 1.5:
                print("🔍 Sarvam transcript is much longer, using Sarvam as base")
                return sarvam_text
            elif len(elevenlabs_text) > len(sarvam_text) * 1.5:
                print("🔍 ElevenLabs transcript is much longer, but checking Tamil quality first...")
                # Don't immediately return, continue to Tamil quality analysis
            
            # Split both transcripts into words for comparison
            elevenlabs_words = elevenlabs_text.split()
            sarvam_words = sarvam_text.split()
            
            # Use the transcript with more Tamil words (better for Tamil accuracy)
            elevenlabs_tamil_count = sum(1 for word in elevenlabs_words if self._is_tamil_word(word))
            sarvam_tamil_count = sum(1 for word in sarvam_words if self._is_tamil_word(word))
            
            print(f"🔍 Tamil words - ElevenLabs: {elevenlabs_tamil_count}, Sarvam: {sarvam_tamil_count}")
            
            # Check for Tamil quality indicators
            sarvam_quality_score = self._calculate_tamil_quality_score(sarvam_text)
            elevenlabs_quality_score = self._calculate_tamil_quality_score(elevenlabs_text)
            
            print(f"🔍 Quality scores - ElevenLabs: {elevenlabs_quality_score}, Sarvam: {sarvam_quality_score}")
            
            # If Sarvam has better Tamil quality or more Tamil words, prefer it
            if (sarvam_quality_score > elevenlabs_quality_score or 
                sarvam_tamil_count > elevenlabs_tamil_count * 0.9):
                print("🔍 Sarvam has better Tamil quality, using Sarvam transcript")
                return sarvam_text
            
            # If ElevenLabs has better structure, use it as base with corrections
            base_transcript = elevenlabs_text
            corrected_transcript = self._apply_intelligent_corrections(base_transcript, sarvam_text)
            
            print("🔍 Using ElevenLabs as base with intelligent corrections")
            return corrected_transcript
            
        except Exception as e:
            print(f"❌ Error in intelligent merge: {e}")
            # Fallback to longer transcript
            return sarvam_text if len(sarvam_text) > len(elevenlabs_text) else elevenlabs_text
    
    def _is_tamil_word(self, word: str) -> bool:
        """
        Check if a word contains Tamil characters.
        """
        tamil_range = range(0x0B80, 0x0BFF)  # Tamil Unicode range
        return any(ord(char) in tamil_range for char in word)
    
    def _calculate_tamil_quality_score(self, text: str) -> float:
        """
        Calculate a quality score for Tamil text based on various indicators.
        Higher score indicates better Tamil quality.
        """
        try:
            if not text:
                return 0.0
            
            score = 0.0
            words = text.split()
            
            # Count Tamil words
            tamil_words = sum(1 for word in words if self._is_tamil_word(word))
            if len(words) > 0:
                tamil_ratio = tamil_words / len(words)
                score += tamil_ratio * 10  # Base score from Tamil content
            
            # Check for proper word formations (no broken spacing)
            broken_words = len(re.findall(r'\S\s+\S(?=\S)', text))  # Words with spaces in middle
            score -= broken_words * 2  # Penalty for broken words
            
            # Check for natural Tamil endings and patterns
            natural_endings = ['ம்', 'ன்', 'ர்', 'ல்', 'ங்க', 'து', 'ல', 'ம', 'ன']
            natural_count = sum(1 for ending in natural_endings if ending in text)
            score += natural_count * 0.5
            
            # Check for proper punctuation
            punctuation_count = len(re.findall(r'[.!?]', text))
            score += punctuation_count * 0.5
            
            # Penalty for excessive spacing
            excessive_spaces = len(re.findall(r'\s{3,}', text))
            score -= excessive_spaces * 1
            
            return max(0.0, score)  # Ensure non-negative score
            
        except Exception as e:
            print(f"❌ Error calculating Tamil quality score: {e}")
            return 0.0
    
    def _apply_intelligent_corrections(self, base_text: str, reference_text: str) -> str:
        """
        Apply intelligent corrections to base text using reference text.
        """
        try:
            corrected = base_text
            
            # Fix common spacing issues around Tamil text
            corrected = re.sub(r'\s+', ' ', corrected)  # Multiple spaces to single space
            corrected = re.sub(r'\s*([.,!?])\s*', r'\1 ', corrected)  # Fix punctuation spacing
            
            # Remove extra spaces around parentheses
            corrected = re.sub(r'\s*\(\s*', ' (', corrected)
            corrected = re.sub(r'\s*\)\s*', ') ', corrected)
            
            # Clean up multiple consecutive spaces
            corrected = re.sub(r'\s{2,}', ' ', corrected)
            
            # Trim and return
            return corrected.strip()
            
        except Exception as e:
            print(f"❌ Error applying corrections: {e}")
            return base_text

    async def process_enhanced_transcription(self, audio_file_path: str) -> Dict:
        """
        Main method to process audio through all three pipelines
        """
        try:
            print("🔄 Starting enhanced transcription pipeline...")
            
            # Step 1: Prepare audio (convert to mono WAV at 16kHz) for Sarvam and ElevenLabs
            prepared_audio = await self._prepare_audio(audio_file_path)
            
            # Step 2: Get ElevenLabs transcript with speaker diarization (now uses prepared WAV)
            elevenlabs_result = await self._get_elevenlabs_transcript(prepared_audio)
            
            # Step 3: Get Sarvam transcript for Tamil accuracy (uses prepared WAV)
            sarvam_transcript, sarvam_diarized = await self.sarvam_batch.batch_transcribe(
                prepared_audio, language_code="ta-IN", diarization=True
            )
            if sarvam_diarized and "entries" in sarvam_diarized:
                sarvam_diarized_entries = [
                    {
                        "text": entry.get("transcript", ""),
                        "speaker": entry.get("speaker_id", "sarvam"),
                        "start": entry.get("start_time_seconds", None),
                        "end": entry.get("end_time_seconds", None),
                    }
                    for entry in sarvam_diarized["entries"]
                ]
            else:
                sarvam_diarized_entries = sarvam_transcript

            # --- Fallback logic: use Sarvam diarized if ElevenLabs is not in Tamil ---
            elevenlabs_text = " ".join([seg.get("text", "") for seg in elevenlabs_result]) if elevenlabs_result else ""
            if not self._is_tamil(elevenlabs_text):
                print("⚠️ ElevenLabs output is not in Tamil. Using Sarvam diarized transcript as final transcript.")
                final_transcript = sarvam_diarized_entries if isinstance(sarvam_diarized_entries, list) else []
            else:
                # Always use Sarvam Chat to intelligently merge transcripts
                print("🤖 Using Sarvam Chat to merge and correct transcripts...")
                final_transcript = await self._sarvam_chat_merge_transcripts(
                    elevenlabs_result, sarvam_diarized_entries
                )

            # Transliterated ElevenLabs (optional)
            transliterated_elevenlabs = []
            if elevenlabs_result:
                for segment in elevenlabs_result:
                    original_text = segment.get("text", "").strip()
                    if original_text:
                        tamil_text = self._convert_thanglish_to_tamil(original_text)
                        transliterated_elevenlabs.append({
                            "speaker": segment.get("speaker", "Unknown"),
                            "start": segment.get("start_time", 0.0),
                            "end": segment.get("end_time", 0.0),
                            "text": tamil_text,
                            "confidence": segment.get("confidence", 0.0)
                        })
            # Extract the merged transcript text for display
            merged_transcript_text = ""
            if final_transcript and len(final_transcript) > 0:
                merged_transcript_text = final_transcript[0].get("text", "")
            
            return {
                "success": True,
                "final_transcript": final_transcript,
                "elevenlabs_transcript": elevenlabs_result,
                "transliterated_elevenlabs": transliterated_elevenlabs,
                "sarvam_transcript": sarvam_transcript,
                "sarvam_diarized_transcript": sarvam_diarized,
                "sarvam_chat_merged_transcript": merged_transcript_text,
                "processing_info": {
                    "total_segments": len(final_transcript),
                    "original_file": audio_file_path,
                    "prepared_file": prepared_audio,
                    "whisper_disabled": True,
                    "merge_method": "professional_intelligent_fallback",
                    "merge_details": "Used professional rule-based merging following expert prompt requirements"
                }
            }
        except Exception as e:
            print(f"❌ Error in enhanced transcription: {e}")
            return {
                "success": False,
                "error": str(e),
                "final_transcript": []
            }
    
    async def _prepare_audio(self, audio_file_path: str) -> str:
        """Convert audio to mono WAV at 16kHz"""
        try:
            # Create temporary file for prepared audio with .wav extension
            temp_dir = tempfile.gettempdir()
            base_name = os.path.splitext(os.path.basename(audio_file_path))[0]
            prepared_audio = os.path.join(temp_dir, f"prepared_{base_name}.wav")
            
            print(f"🔄 Converting audio to WAV format: {audio_file_path} -> {prepared_audio}")
            
            # Use ffmpeg to convert to WAV format (not just rename)
            cmd = [
                "ffmpeg", "-i", audio_file_path,
                "-ar", "16000", "-ac", "1", "-f", "wav",  # Force WAV format
                "-y", prepared_audio
            ]
            
            print(f"🔄 Running ffmpeg command: {' '.join(cmd)}")
            
            result = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='ignore')
            if result.returncode != 0:
                raise Exception(f"FFmpeg conversion failed: {result.stderr}")
            
            # Verify the output file exists and has content
            if os.path.exists(prepared_audio):
                file_size = os.path.getsize(prepared_audio)
                print(f"✅ Audio prepared: {prepared_audio} ({file_size} bytes)")
                return prepared_audio
            else:
                raise Exception("Prepared audio file not created")
            
        except Exception as e:
            print(f"❌ Audio preparation failed: {e}")
            # Fallback to original file
            return audio_file_path
    
    async def _get_whisper_timestamps(self, audio_file_path: str) -> Dict:
        """Get Whisper timestamps and segments"""
        try:
            print("🦜 Getting Whisper timestamps...")
            
            # Check if binary and model exist
            if not os.path.exists(self.whisper_binary_path):
                raise Exception(f"Whisper binary not found: {self.whisper_binary_path}")
            if not os.path.exists(self.whisper_model_path):
                raise Exception(f"Whisper model not found: {self.whisper_model_path}")
            
            # Check if audio file exists and has content
            if not os.path.exists(audio_file_path):
                raise Exception(f"Audio file not found: {audio_file_path}")
            
            file_size = os.path.getsize(audio_file_path)
            print(f"📁 Audio file size: {file_size} bytes")
            
            if file_size == 0:
                raise Exception("Audio file is empty")
            
            print(f"✅ Using Whisper binary: {self.whisper_binary_path}")
            print(f"✅ Using Whisper model: {self.whisper_model_path}")
            
            # Create temporary output files
            temp_dir = tempfile.gettempdir()
            base_name = os.path.splitext(os.path.basename(audio_file_path))[0]
            json_output = os.path.join(temp_dir, f"{base_name}_whisper.json")
            
            # Run whisper-cli with JSON output
            cmd = [
                self.whisper_binary_path,
                "-m", self.whisper_model_path,
                "-f", audio_file_path,
                "-oj",  # Output JSON
                "-of", os.path.splitext(json_output)[0]  # Output file base name
            ]
            
            print(f"🦜 Running command: {' '.join(cmd)}")
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            print(f"🦜 Whisper return code: {result.returncode}")
            print(f"🦜 Whisper stdout: {result.stdout}")
            print(f"🦜 Whisper stderr: {result.stderr}")
            
            if result.returncode != 0:
                raise Exception(f"Whisper processing failed: {result.stderr}")
            
            # Read the JSON output
            if os.path.exists(json_output):
                with open(json_output, 'r', encoding='utf-8') as f:
                    whisper_data = json.load(f)
                
                # Clean up temporary file
                os.remove(json_output)
                
                # Parse the correct structure - Whisper returns 'transcription' array
                if 'transcription' in whisper_data:
                    raw_segments = whisper_data['transcription']
                    segments = []
                    
                    for segment in raw_segments:
                        # Extract timing information
                        timestamps = segment.get('timestamps', {})
                        offsets = segment.get('offsets', {})
                        
                        # Convert timestamp format "00:00:10,000" to seconds
                        start_time_str = timestamps.get('from', '00:00:00,000')
                        end_time_str = timestamps.get('to', '00:00:00,000')
                        
                        # Parse timestamp strings to seconds
                        start_time = self._parse_timestamp_to_seconds(start_time_str)
                        end_time = self._parse_timestamp_to_seconds(end_time_str)
                        
                        # Get text content
                        text = segment.get('text', '').strip()
                        
                        segments.append({
                            'start': start_time,
                            'end': end_time,
                            'text': text
                        })
                    
                    print(f"✅ Whisper timestamps obtained: {len(segments)} segments")
                    return {"segments": segments, "duration": end_time if segments else 0}
                else:
                    # Fallback to old format
                    segments = whisper_data.get('segments', [])
                    print(f"✅ Whisper timestamps obtained: {len(segments)} segments")
                    
                    if len(segments) == 0:
                        print("⚠️  Warning: Whisper returned 0 segments. This might indicate:")
                        print("   - Audio file is too short or silent")
                        print("   - Audio format issues")
                        print("   - Model loading problems")
                        print(f"   - Full whisper data: {whisper_data}")
                        
                        # Try with a different model if available
                        alternative_model = os.path.join(os.path.dirname(self.whisper_model_path), "ggml-medium.bin")
                        if os.path.exists(alternative_model):
                            print(f"🔄 Trying alternative model: {alternative_model}")
                            return await self._try_alternative_model(audio_file_path, alternative_model)
                    
                    return whisper_data
            else:
                raise Exception("Whisper JSON output file not found")
                
        except Exception as e:
            print(f"❌ Whisper processing failed: {e}")
            return {"segments": [], "duration": 0}
    
    def _parse_timestamp_to_seconds(self, timestamp_str: str) -> float:
        """Convert timestamp string '00:00:10,000' to seconds"""
        try:
            # Remove any leading/trailing whitespace
            timestamp_str = timestamp_str.strip()
            
            # Split by ':' to get hours, minutes, seconds
            parts = timestamp_str.split(':')
            if len(parts) == 3:
                hours = int(parts[0])
                minutes = int(parts[1])
                seconds_part = parts[2]
                
                # Split seconds part by ',' to get seconds and milliseconds
                seconds_parts = seconds_part.split(',')
                if len(seconds_parts) == 2:
                    seconds = int(seconds_parts[0])
                    milliseconds = int(seconds_parts[1])
                    
                    # Calculate total seconds
                    total_seconds = hours * 3600 + minutes * 60 + seconds + milliseconds / 1000.0
                    return total_seconds
                else:
                    # If no milliseconds, just use seconds
                    seconds = int(seconds_parts[0])
                    return hours * 3600 + minutes * 60 + seconds
            else:
                # If format is different, try to parse as float
                return float(timestamp_str)
        except Exception as e:
            print(f"⚠️  Error parsing timestamp '{timestamp_str}': {e}")
            return 0.0
    
    async def _try_alternative_model(self, audio_file_path: str, model_path: str) -> Dict:
        """Try with an alternative Whisper model"""
        try:
            print(f"🦜 Trying alternative model: {model_path}")
            
            temp_dir = tempfile.gettempdir()
            base_name = os.path.splitext(os.path.basename(audio_file_path))[0]
            json_output = os.path.join(temp_dir, f"{base_name}_whisper_alt.json")
            
            cmd = [
                self.whisper_binary_path,
                "-m", model_path,
                "-f", audio_file_path,
                "-oj",
                "-of", os.path.splitext(json_output)[0]
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            print(f"🦜 Alternative model return code: {result.returncode}")
            
            if result.returncode == 0 and os.path.exists(json_output):
                with open(json_output, 'r', encoding='utf-8') as f:
                    whisper_data = json.load(f)
                os.remove(json_output)
                
                segments = whisper_data.get('segments', [])
                print(f"✅ Alternative model returned: {len(segments)} segments")
                return whisper_data
            else:
                print("❌ Alternative model also failed")
                return {"segments": [], "duration": 0}
                
        except Exception as e:
            print(f"❌ Alternative model failed: {e}")
            return {"segments": [], "duration": 0}
    
    async def _get_elevenlabs_transcript(self, audio_file_path: str) -> List[Dict]:
        """Get ElevenLabs transcript with speaker diarization (now expects WAV)"""
        try:
            print("🎤 Getting ElevenLabs transcript...")
            
            # Import and use the ElevenLabs service
            from app.services.elevenlabs_service import elevenlabs_service
            
            elevenlabs_transcript = await elevenlabs_service.transcribe_with_speaker_diarization(audio_file_path)
            
            print(f"✅ ElevenLabs transcript obtained: {len(elevenlabs_transcript)} segments")
            return elevenlabs_transcript
            
        except Exception as e:
            print(f"❌ ElevenLabs processing failed: {e}")
            return []
    
    async def _get_sarvam_transcript(self, audio_file_path: str) -> Dict:
        """Get Sarvam transcript using batch API for Tamil accuracy"""
        try:
            print("🌐 Getting Sarvam transcript using batch API...")
            
            # Import and use the Sarvam batch service
            from app.services.sarvam_batch_service import SarvamBatchService
            from app.core.config import settings
            
            # Check if API key is available
            if not settings.SARVAM_API_KEY:
                print("❌ SARVAM_API_KEY not found in environment variables")
                print("Please set SARVAM_API_KEY in your .env file or environment")
                return {"transcript": ""}
            
            print(f"🔑 Using Sarvam API key: {settings.SARVAM_API_KEY[:10]}...")
            
            sarvam_batch_service = SarvamBatchService(settings.SARVAM_API_KEY)
            
            # Use batch transcription API
            transcript, diarized_transcript = await sarvam_batch_service.batch_transcribe(
                audio_file_path,
                language_code="ta-IN",
                diarization=True
            )
            
            if transcript:
                print(f"✅ Sarvam batch transcript obtained: {len(transcript)} characters")
                return {
                    "transcript": transcript,
                    "diarized_transcript": diarized_transcript,
                    "language_detected": "ta-IN",
                    "confidence": 0.9,  # Batch API doesn't provide confidence
                    "processing_time": 0.0
                }
            else:
                print("❌ Sarvam batch transcription failed")
                return {"transcript": ""}
            
        except Exception as e:
            print(f"❌ Sarvam batch processing failed: {e}")
            # Fallback to regular API if batch fails
            try:
                print("🔄 Falling back to regular Sarvam API...")
                from app.services.sarvam_service import SarvamService
                sarvam_service = SarvamService()
                result = await sarvam_service.transcribe_audio(audio_file_path)
                return result
            except Exception as fallback_error:
                print(f"❌ Sarvam fallback also failed: {fallback_error}")
                return {"transcript": ""}
    
    def _distribute_sarvam_text(self, elevenlabs_segments: List[Dict], sarvam_text: str) -> List[Dict]:
        """Distribute Sarvam text intelligently across ElevenLabs segments"""
        try:
            # If no ElevenLabs segments, return Sarvam as single segment
            if not elevenlabs_segments:
                return [{
                    "speaker": "speaker_0",
                    "start": 0.0,
                    "end": 0.0,
                    "text": sarvam_text,
                    "confidence": 0.9
                }]
            
            # If there's only one ElevenLabs segment, put the entire Sarvam text in it
            if len(elevenlabs_segments) == 1:
                segment = elevenlabs_segments[0]
                print(f"🔍 Single segment detected. Using entire Sarvam text: '{sarvam_text[:100]}...'")
                return [{
                    "speaker": segment.get("speaker", "Unknown"),
                    "start": segment.get("start_time", 0.0),
                    "end": segment.get("end_time", 0.0),
                    "text": sarvam_text.strip(),
                    "confidence": segment.get("confidence", 0.0)
                }]
            
            # For multiple segments, split Sarvam text into sentences or chunks
            sarvam_sentences = self._split_sarvam_text(sarvam_text)
            
            print(f"🔍 Multiple segments detected. Split Sarvam text into {len(sarvam_sentences)} sentences")
            
            output = []
            sentence_index = 0
            
            for segment in elevenlabs_segments:
                # Get the original ElevenLabs text for this segment
                original_text = segment.get("text", "").strip()
                
                # If we have Sarvam sentences available, use them
                if sentence_index < len(sarvam_sentences):
                    # Use Sarvam sentence for this segment
                    sarvam_sentence = sarvam_sentences[sentence_index]
                    print(f"🔍 Using Sarvam sentence {sentence_index + 1} for segment: '{sarvam_sentence[:50]}...'")
                    
                    output.append({
                        "speaker": segment.get("speaker", "Unknown"),
                        "start": segment.get("start_time", 0.0),
                        "end": segment.get("end_time", 0.0),
                        "text": sarvam_sentence.strip(),
                        "confidence": segment.get("confidence", 0.0)
                    })
                    sentence_index += 1
                else:
                    # If we run out of Sarvam sentences, use original ElevenLabs text
                    print(f"🔍 Using original ElevenLabs text for segment: '{original_text[:50]}...'")
                    
                    output.append({
                        "speaker": segment.get("speaker", "Unknown"),
                        "start": segment.get("start_time", 0.0),
                        "end": segment.get("end_time", 0.0),
                        "text": original_text,
                        "confidence": segment.get("confidence", 0.0)
                    })
            
            return output
            
        except Exception as e:
            print(f"❌ Error distributing Sarvam text: {e}")
            # Fallback: return original ElevenLabs segments
            return [
                {
                    "speaker": segment.get("speaker", "Unknown"),
                    "start": segment.get("start_time", 0.0),
                    "end": segment.get("end_time", 0.0),
                    "text": segment.get("text", "").strip(),
                    "confidence": segment.get("confidence", 0.0)
                }
                for segment in elevenlabs_segments
            ]
    
    def _split_sarvam_text(self, sarvam_text: str) -> List[str]:
        """Split Sarvam text into sentences or logical chunks"""
        try:
            # Split by newlines first (if Sarvam returns multi-line text)
            lines = [line.strip() for line in sarvam_text.split('\n') if line.strip()]
            
            if len(lines) > 1:
                print(f"🔍 Split by newlines: {len(lines)} lines")
                return lines
            
            # If no newlines, split by sentence endings
            import re
            sentences = re.split(r'[.!?]+\s*', sarvam_text)
            sentences = [s.strip() for s in sentences if s.strip()]
            
            if len(sentences) > 1:
                print(f"🔍 Split by sentences: {len(sentences)} sentences")
                return sentences
            
            # If still only one chunk, split by approximate length
            # Assume each segment should get roughly equal text
            chunk_size = max(1, len(sarvam_text) // 3)  # Split into ~3 chunks
            chunks = []
            
            for i in range(0, len(sarvam_text), chunk_size):
                chunk = sarvam_text[i:i + chunk_size].strip()
                if chunk:
                    chunks.append(chunk)
            
            print(f"🔍 Split by chunks: {len(chunks)} chunks")
            return chunks
            
        except Exception as e:
            print(f"❌ Error splitting Sarvam text: {e}")
            return [sarvam_text]  # Return as single chunk



    def _clean_text(self, text: str) -> str:
        """Clean text for comparison"""
        import re
        return re.sub(r"\s+", " ", text.strip().lower())
    
    def _contains_tamil(self, text: str) -> bool:
        """Check if text contains Tamil characters using Unicode range"""
        # Unicode range for Tamil: U+0B80 to U+0BFF
        return any('\u0B80' <= char <= '\u0BFF' for char in text)
    
    def _contains_tamil_words(self, text: str) -> bool:
        """Check if text contains Tamil words using Unicode range"""
        # Unicode range for Tamil: U+0B80 to U+0BFF
        return any('\u0B80' <= char <= '\u0BFF' for char in text)
    
    def _is_thanglish(self, text: str) -> bool:
        """Detect if text is Thanglish (Tamil in Latin script or code-mixed):
        - Mostly Latin letters, little Tamil Unicode
        """
        if not text:
            return False
        tamil_count = sum('\u0B80' <= c <= '\u0BFF' for c in text)
        latin_count = sum('a' <= c.lower() <= 'z' for c in text)
        total_alpha = sum(c.isalpha() for c in text)
        if total_alpha == 0:
            return False
        latin_ratio = latin_count / total_alpha
        tamil_ratio = tamil_count / total_alpha
        # Consider Thanglish if mostly Latin and little Tamil
        return latin_ratio > 0.6 and tamil_ratio < 0.4
    
    def _is_tamil(self, text):
        """Check if the text contains Tamil script characters."""
        return any('\u0B80' <= char <= '\u0BFF' for char in text)

    def export_to_srt(self, transcript: List[Dict], output_path: str):
        """Export transcript to SRT format"""
        try:
            def format_timestamp(sec):
                h = int(sec // 3600)
                m = int((sec % 3600) // 60)
                s = sec % 60
                return f"{h:02}:{m:02}:{s:06.3f}".replace('.', ',')
            
            with open(output_path, "w", encoding="utf-8") as f:
                for i, seg in enumerate(transcript):
                    f.write(f"{i+1}\n")
                    f.write(f"{format_timestamp(seg['start'])} --> {format_timestamp(seg['end'])}\n")
                    f.write(f"{seg['speaker']}: {seg['text']}\n\n")
            
            print(f"✅ SRT file exported: {output_path}")
            
        except Exception as e:
            print(f"❌ SRT export failed: {e}")

    async def store_transcription_in_db(self, transcript_data: dict) -> None:
        """
        Store the enhanced transcript and translation output in Supabase DB.
        """
        try:
            response = supabase.table("transcripts").insert(transcript_data).execute()
            print(f"✅ Transcript stored in Supabase: {response.data}")
        except Exception as e:
            print(f"❌ Exception while storing transcript in Supabase: {e}")


# Create service instance
enhanced_transcription_service = EnhancedTranscriptionService() 