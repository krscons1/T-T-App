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

# Import Indic transliteration
try:
    from indic_transliteration import sanscript
    from indic_transliteration.sanscript import transliterate
    INDIC_AVAILABLE = True
except ImportError:
    print("⚠️  indic-transliteration not available. Install with: pip install indic-transliteration")
    INDIC_AVAILABLE = False


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
    
    def _find_missing_words(self, elevenlabs_text: str, sarvam_text: str) -> List[str]:
        """Find words that are in Sarvam but missing in ElevenLabs transcript"""
        try:
            # Convert ElevenLabs text to Tamil
            elevenlabs_tamil = self._convert_thanglish_to_tamil(elevenlabs_text)
            
            # Convert Sarvam text to Tamil (in case it's also in transliteration)
            sarvam_tamil = self._convert_thanglish_to_tamil(sarvam_text)
            
            # Split into words
            elevenlabs_words = set(re.findall(r'\b[\w\u0B80-\u0BFF]+\b', elevenlabs_tamil.lower()))
            sarvam_words = set(re.findall(r'\b[\w\u0B80-\u0BFF]+\b', sarvam_tamil.lower()))
            
            # Find missing words (in Sarvam but not in ElevenLabs)
            missing_words = sarvam_words - elevenlabs_words
            
            print(f"🔍 ElevenLabs words: {len(elevenlabs_words)}")
            print(f"🔍 Sarvam words: {len(sarvam_words)}")
            print(f"🔍 Missing words: {len(missing_words)}")
            print(f"🔍 Missing words list: {list(missing_words)[:10]}")  # Show first 10
            
            return list(missing_words)
            
        except Exception as e:
            print(f"❌ Error finding missing words: {e}")
            return []
    
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
    
    def _insert_missing_tamil_words(self, elevenlabs_text: str, sarvam_text: str) -> str:
        """Insert missing Tamil words word-by-word into ElevenLabs transcript"""
        try:
            # Extract Tamil words from Sarvam text
            sarvam_tamil_words = self._extract_tamil_words_from_sarvam(sarvam_text)
            
            # Extract Tamil words from ElevenLabs text
            elevenlabs_tamil_words = self._extract_tamil_words_from_elevenlabs(elevenlabs_text)
            
            # Find missing Tamil words
            missing_tamil_words = sarvam_tamil_words - elevenlabs_tamil_words
            
            print(f"🔍 ElevenLabs Tamil words: {elevenlabs_tamil_words}")
            print(f"🔍 Sarvam Tamil words: {sarvam_tamil_words}")
            print(f"🔍 Missing Tamil words: {missing_tamil_words}")
            
            if not missing_tamil_words:
                return elevenlabs_text
            
            # Insert missing words intelligently
            enhanced_text = self._insert_words_intelligently(elevenlabs_text, missing_tamil_words)
            
            print(f"🔄 Enhanced text: '{elevenlabs_text}' -> '{enhanced_text}'")
            return enhanced_text
            
        except Exception as e:
            print(f"❌ Error inserting missing Tamil words: {e}")
            return elevenlabs_text
    
    def _insert_words_intelligently(self, text: str, missing_words: set) -> str:
        """Insert missing words intelligently into the text"""
        try:
            # Convert text to words
            words = text.split()
            
            # Look for common Tamil word patterns to insert missing words
            # For example, if "kutti" is missing, look for "story" and insert before it
            enhanced_words = []
            
            for i, word in enumerate(words):
                enhanced_words.append(word)
                
                # Check if we should insert missing words after this word
                if word.lower() in ["story", "kathai", "paattu", "song"]:
                    # Insert missing words that might be related to the story
                    for missing_word in missing_words:
                        if missing_word in ["குழந்தை", "குட்டி", "கதை", "பாட்டு"]:  # child, story, song
                            if missing_word not in enhanced_words:
                                enhanced_words.append(missing_word)
                                print(f"🔄 Inserted '{missing_word}' after '{word}'")
                
                elif word.lower() in ["attention", "listen", "pay"]:
                    # Insert missing words that might be related to attention
                    for missing_word in missing_words:
                        if missing_word in ["கவனம்", "கேள்வி", "செவி"]:  # attention, listen
                            if missing_word not in enhanced_words:
                                enhanced_words.append(missing_word)
                                print(f"🔄 Inserted '{missing_word}' after '{word}'")
            
            # If we still have missing words, append them at the end
            remaining_missing = missing_words - set(enhanced_words)
            if remaining_missing:
                enhanced_words.extend(remaining_missing)
                print(f"🔄 Appended remaining words: {remaining_missing}")
            
            return " ".join(enhanced_words)
            
        except Exception as e:
            print(f"❌ Error in intelligent word insertion: {e}")
            # Fallback: append all missing words at the end
            missing_text = " ".join(missing_words)
            return f"{text} {missing_text}"
    
    def _extract_tamil_words_from_sarvam(self, sarvam_text: str) -> set:
        """Extract Tamil words from Sarvam transcript"""
        try:
            # Convert Thanglish to Tamil using Indic transliteration
            tamil_text = self._convert_thanglish_to_tamil(sarvam_text)
            
            # Extract Tamil Unicode words
            tamil_words = set(re.findall(r'\b[\u0B80-\u0BFF]+\b', tamil_text))
            
            print(f"🔍 Extracted {len(tamil_words)} Tamil words from Sarvam")
            return tamil_words
            
        except Exception as e:
            print(f"❌ Error extracting Tamil words from Sarvam: {e}")
            return set()
    
    def _extract_tamil_words_from_elevenlabs(self, elevenlabs_text: str) -> set:
        """Extract Tamil words from ElevenLabs transcript"""
        try:
            # Convert Thanglish to Tamil using Indic transliteration
            tamil_text = self._convert_thanglish_to_tamil(elevenlabs_text)
            
            # Extract Tamil Unicode words
            tamil_words = set(re.findall(r'\b[\u0B80-\u0BFF]+\b', tamil_text))
            
            print(f"🔍 Extracted {len(tamil_words)} Tamil words from ElevenLabs")
            return tamil_words
            
        except Exception as e:
            print(f"❌ Error extracting Tamil words from ElevenLabs: {e}")
            return set()
    
    async def process_enhanced_transcription(self, audio_file_path: str) -> Dict:
        """
        Main method to process audio through all three pipelines
        """
        try:
            print("🔄 Starting enhanced transcription pipeline...")
            
            # Step 1: Prepare audio (convert to mono WAV at 16kHz) for Sarvam only
            prepared_audio = await self._prepare_audio(audio_file_path)
            
            # Step 2: Get ElevenLabs transcript with speaker diarization (uses original file)
            elevenlabs_result = await self._get_elevenlabs_transcript(audio_file_path)
            
            # Step 3: Get Sarvam transcript for Tamil accuracy (uses prepared WAV)
            sarvam_result = await self._get_sarvam_transcript(prepared_audio)
            
            # Step 4: Merge results (ElevenLabs as base, Sarvam for Tamil accuracy)
            final_transcript = await self._merge_transcripts(
                elevenlabs_result, sarvam_result
            )
            
            # Create transliterated ElevenLabs transcript
            transliterated_elevenlabs = []
            for segment in elevenlabs_result:
                original_text = segment.get("text", "").strip()
                if original_text:
                    # Convert to Tamil using Indic transliteration
                    tamil_text = self._convert_thanglish_to_tamil(original_text)
                    transliterated_elevenlabs.append({
                        "speaker": segment.get("speaker", "Unknown"),
                        "start": segment.get("start_time", 0.0),
                        "end": segment.get("end_time", 0.0),
                        "text": tamil_text,
                        "confidence": segment.get("confidence", 0.0)
                    })
            
            return {
                "success": True,
                "final_transcript": final_transcript,
                "elevenlabs_transcript": elevenlabs_result,
                "transliterated_elevenlabs": transliterated_elevenlabs,
                "sarvam_transcript": sarvam_result.get("transcript", ""),
                "processing_info": {
                    "total_segments": len(final_transcript),
                    "original_file": audio_file_path,
                    "prepared_file": prepared_audio,
                    "whisper_disabled": True
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
            
            result = subprocess.run(cmd, capture_output=True, text=True)
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
        """Get ElevenLabs transcript with speaker diarization"""
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
    
    async def _merge_transcripts(
        self, 
        elevenlabs_result: List[Dict], 
        sarvam_result: Dict
    ) -> List[Dict]:
        """Merge transcripts using ElevenLabs as base and Sarvam for Tamil accuracy with word-by-word insertion"""
        try:
            print("🔗 Merging transcripts with ElevenLabs as base and word-by-word Tamil insertion...")
            
            sarvam_text = sarvam_result.get("transcript", "")
            
            # Split Sarvam text into lines
            sarvam_lines = [line.strip() for line in sarvam_text.split('\n') if line.strip()]
            
            print(f"📊 ElevenLabs segments: {len(elevenlabs_result)}")
            print(f"📊 Sarvam lines: {len(sarvam_lines)}")
            
            # Combine all Sarvam text for missing word detection
            full_sarvam_text = " ".join(sarvam_lines)
            
            output = []
            
            # Use ElevenLabs transcript as base
            for segment in elevenlabs_result:
                original_text = segment.get("text", "").strip()
                
                if not original_text:
                    continue
                
                # Find missing Tamil words using word-by-word comparison
                enhanced_text = self._insert_missing_tamil_words(original_text, full_sarvam_text)
                
                output.append({
                    "speaker": segment.get("speaker", "Unknown"),
                    "start": segment.get("start_time", 0.0),
                    "end": segment.get("end_time", 0.0),
                    "text": enhanced_text,
                    "confidence": segment.get("confidence", 0.0)
                })
            
            print(f"✅ Transcript merged with word-by-word Tamil insertion: {len(output)} segments")
            return output
            
        except Exception as e:
            print(f"❌ Transcript merging failed: {e}")
            return []

    def _fuzzy_replace_tamil_words(self, base_text: str, sarvam_lines: List[str]) -> str:
        """Replace Tamil words/phrases in base_text using targeted word matching from sarvam_lines."""
        # Flatten Sarvam transcript and extract Tamil + English words
        sarvam_text = " ".join(sarvam_lines).lower()
        
        # Better regex to capture complete Tamil words
        sarvam_words = re.findall(r"\b[\w\u0B80-\u0BFF]+\b", sarvam_text)
        
        # Get Tamil words from Sarvam for debugging
        tamil_words = [word for word in sarvam_words if self._contains_tamil(word)]
        
        print(f"🔍 Debug: Processing text with {len(sarvam_words)} Sarvam words")
        print(f"🔍 Debug: Found {len(tamil_words)} Tamil words in Sarvam")
        print(f"🔍 Debug: Sample Tamil words: {tamil_words[:10]}")
        
        # Apply targeted word replacement
        corrected_text = self._patch_transcript_text(base_text, sarvam_words)
        
        return corrected_text

    def _find_closest_sarvam_match(self, word: str, sarvam_words: List[str], threshold: float = 0.7) -> str:
        """Find the closest Sarvam match with high threshold for precision"""
        best_match = word
        highest_score = 0
        
        # Skip if word is too short or already Tamil
        if len(word) < 3 or self._contains_tamil(word):
            return word
        
        # Debug: Show what we're looking for
        print(f"🔍 Looking for word: '{word}'")
        
        for sarvam_word in sarvam_words:
            # Only consider Sarvam words that contain Tamil characters
            if not self._contains_tamil(sarvam_word):
                continue
                
            score = SequenceMatcher(None, word.lower(), sarvam_word.lower()).ratio()
            if score > highest_score:
                best_match = sarvam_word
                highest_score = score
        
        # Only replace if we found a good Tamil match
        if highest_score >= threshold and best_match != word:
            print(f"🔄 Word replaced: '{word}' -> '{best_match}' (score: {highest_score:.2f})")
            return best_match
        else:
            if highest_score > 0.5:  # Show close matches for debugging
                print(f"⚠️ Close match: '{word}' -> '{best_match}' (score: {highest_score:.2f}) - below threshold")
            return word

    def _patch_transcript_text(self, text: str, sarvam_words: List[str]) -> str:
        """Patch transcript text by replacing Tamil transliterations with proper Tamil words"""
        import re
        
        # Tokenize text (words with hyphens/apostrophes and punctuation)
        tokens = re.findall(r"\b[\w'-]+\b|[.,!?;]", text)
        corrected_tokens = []
        
        for token in tokens:
            if re.match(r"[.,!?;]", token):  # Punctuation
                corrected_tokens.append(token)
            else:
                corrected_word = self._find_closest_sarvam_match(token, sarvam_words)
                corrected_tokens.append(corrected_word)
        
        # Join and clean up spacing around punctuation
        result = ' '.join(corrected_tokens)
        result = result.replace(" .", ".").replace(" ,", ",").replace(" ?", "?")
        result = result.replace(" !", "!").replace(" ;", ";")
        
        return result

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


# Create service instance
enhanced_transcription_service = EnhancedTranscriptionService() 