import os
import numpy as np
import librosa
import torch
import torchaudio
from typing import Dict, List, Tuple, Optional
import whisper
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor
import soundfile as sf
from app.core.config import settings

class AudioCrossValidator:
    def __init__(self):
        """Initialize audio cross-validator with speech recognition models"""
        self.whisper_model = None
        self.wav2vec_model = None
        self.wav2vec_processor = None
        self._load_models()
    
    def _load_models(self):
        """Load speech recognition models for cross-validation"""
        try:
            print("🔄 Loading Whisper base model for audio cross-validation (faster processing)...")
            self.whisper_model = whisper.load_model("base")
            print("✅ Whisper base model loaded successfully")
        except Exception as e:
            print(f"⚠️  Whisper model loading failed: {e}")
            self.whisper_model = None
        
        try:
            print("🔄 Loading Wav2Vec2 model for detailed audio analysis...")
            # Use a valid Wav2Vec2 model for Tamil
            model_name = "facebook/wav2vec2-large-xlsr-53"
            self.wav2vec_model = Wav2Vec2ForCTC.from_pretrained(model_name)
            self.wav2vec_processor = Wav2Vec2Processor.from_pretrained(model_name)
            print("✅ Wav2Vec2 model loaded successfully")
        except Exception as e:
            print(f"⚠️  Wav2Vec2 model loading failed: {e}")
            print("💡 Trying alternative model...")
            try:
                # Fallback to a more general model
                model_name = "facebook/wav2vec2-base"
                self.wav2vec_model = Wav2Vec2ForCTC.from_pretrained(model_name)
                self.wav2vec_processor = Wav2Vec2Processor.from_pretrained(model_name)
                print("✅ Wav2Vec2 fallback model loaded successfully")
            except Exception as e2:
                print(f"⚠️  Wav2Vec2 fallback model also failed: {e2}")
                self.wav2vec_model = None
                self.wav2vec_processor = None
    
    async def cross_validate_with_audio(self, transcript1: str, transcript2: str, 
                                      audio_file1: str, audio_file2: str) -> Dict:
        """
        Cross-validate transcripts with audio to determine which pipeline is correct for each segment
        """
        try:
            print("🎵 Starting audio cross-validation...")
            
            # Check if audio files exist
            if not os.path.exists(audio_file1) or not os.path.exists(audio_file2):
                return {'error': 'Audio files not found'}
            
            # Load audio files
            try:
                audio1, sr1 = librosa.load(audio_file1, sr=16000)
                audio2, sr2 = librosa.load(audio_file2, sr=16000)
            except Exception as e:
                return {'error': f'Failed to load audio files: {e}'}
            
            # Perform word-level cross-validation
            word_validation = await self._validate_words_with_audio(
                transcript1, transcript2, audio1, audio2
            )
            
            # Perform segment-level cross-validation
            segment_validation = await self._validate_segments_with_audio(
                transcript1, transcript2, audio1, audio2
            )
            
            # Create optimal transcript based on audio validation
            optimal_transcript = self._create_optimal_transcript_from_validation(
                transcript1, transcript2, word_validation, segment_validation
            )
            
            return {
                'word_validation': word_validation,
                'segment_validation': segment_validation,
                'optimal_transcript': optimal_transcript,
                'audio_analysis': {
                    'audio1_duration': float(len(audio1) / sr1),
                    'audio2_duration': float(len(audio2) / sr2),
                    'sample_rate': int(sr1)
                }
            }
            
        except Exception as e:
            print(f"❌ Error in audio cross-validation: {e}")
            return {'error': str(e)}
    
    async def _validate_words_with_audio(self, transcript1: str, transcript2: str, 
                                       audio1: np.ndarray, audio2: np.ndarray) -> Dict:
        """
        Validate individual words with audio using speech recognition
        """
        words1 = transcript1.split()
        words2 = transcript2.split()
        
        validation_results = {
            'pipeline1_correct_words': [],
            'pipeline2_correct_words': [],
            'uncertain_words': [],
            'word_confidence_scores': {}
        }
        
        # Use Whisper for word-level validation
        if self.whisper_model:
            try:
                print("🔍 Using Whisper base model for word-level validation...")
                # Transcribe audio segments with Whisper base model (faster processing)
                whisper_result1 = self.whisper_model.transcribe(audio1, language="ta", fp16=False)
                whisper_result2 = self.whisper_model.transcribe(audio2, language="ta", fp16=False)
                
                whisper_text1 = whisper_result1['text'].lower()
                whisper_text2 = whisper_result2['text'].lower()
                
                print(f"📝 Whisper transcription 1: {whisper_text1[:100]}...")
                print(f"📝 Whisper transcription 2: {whisper_text2[:100]}...")
                
                # Compare each word with Whisper transcription
                for i, (word1, word2) in enumerate(zip(words1, words2)):
                    if i >= len(words1) or i >= len(words2):
                        break
                    
                    # Check which word matches better with Whisper
                    confidence1 = self._calculate_word_confidence(word1, whisper_text1)
                    confidence2 = self._calculate_word_confidence(word2, whisper_text2)
                    
                    validation_results['word_confidence_scores'][i] = {
                        'pipeline1_word': word1,
                        'pipeline2_word': word2,
                        'pipeline1_confidence': confidence1,
                        'pipeline2_confidence': confidence2
                    }
                    
                    # Determine which pipeline is correct for this word
                    if confidence1 > confidence2 + 0.1:  # Pipeline 1 is more confident
                        validation_results['pipeline1_correct_words'].append({
                            'position': i,
                            'word': word1,
                            'confidence': confidence1
                        })
                    elif confidence2 > confidence1 + 0.1:  # Pipeline 2 is more confident
                        validation_results['pipeline2_correct_words'].append({
                            'position': i,
                            'word': word2,
                            'confidence': confidence2
                        })
                    else:  # Uncertain
                        validation_results['uncertain_words'].append({
                            'position': i,
                            'pipeline1_word': word1,
                            'pipeline2_word': word2,
                            'confidence_diff': abs(confidence1 - confidence2)
                        })
                
                print(f"✅ Word-level validation completed: {len(validation_results['word_confidence_scores'])} words analyzed")
                
            except Exception as e:
                print(f"⚠️  Whisper word validation failed: {e}")
                # Fallback to simple comparison
                validation_results = self._fallback_word_validation(words1, words2)
        else:
            print("⚠️  Whisper model not available, using fallback validation")
            validation_results = self._fallback_word_validation(words1, words2)
        
        return validation_results
    
    def _fallback_word_validation(self, words1: List[str], words2: List[str]) -> Dict:
        """
        Fallback word validation when speech recognition models are not available
        """
        validation_results = {
            'pipeline1_correct_words': [],
            'pipeline2_correct_words': [],
            'uncertain_words': [],
            'word_confidence_scores': {}
        }
        
        # Simple fallback: use word length and character similarity
        for i, (word1, word2) in enumerate(zip(words1, words2)):
            if i >= len(words1) or i >= len(words2):
                break
            
            # Simple confidence based on word characteristics
            confidence1 = min(1.0, len(word1) / 10.0)  # Longer words get higher confidence
            confidence2 = min(1.0, len(word2) / 10.0)
            
            validation_results['word_confidence_scores'][i] = {
                'pipeline1_word': word1,
                'pipeline2_word': word2,
                'pipeline1_confidence': confidence1,
                'pipeline2_confidence': confidence2
            }
            
            if confidence1 > confidence2:
                validation_results['pipeline1_correct_words'].append({
                    'position': i,
                    'word': word1,
                    'confidence': confidence1
                })
            elif confidence2 > confidence1:
                validation_results['pipeline2_correct_words'].append({
                    'position': i,
                    'word': word2,
                    'confidence': confidence2
                })
            else:
                validation_results['uncertain_words'].append({
                    'position': i,
                    'pipeline1_word': word1,
                    'pipeline2_word': word2,
                    'confidence_diff': abs(confidence1 - confidence2)
                })
        
        return validation_results
    
    async def _validate_segments_with_audio(self, transcript1: str, transcript2: str, 
                                          audio1: np.ndarray, audio2: np.ndarray) -> Dict:
        """
        Validate transcript segments with audio using Wav2Vec2
        """
        validation_results = {
            'pipeline1_correct_segments': [],
            'pipeline2_correct_segments': [],
            'segment_analysis': {}
        }
        
        # Use Wav2Vec2 for segment-level validation
        if self.wav2vec_model and self.wav2vec_processor:
            try:
                print("🔍 Using Wav2Vec2 for segment-level validation...")
                # Process audio with Wav2Vec2
                inputs1 = self.wav2vec_processor(audio1, sampling_rate=16000, return_tensors="pt")
                inputs2 = self.wav2vec_processor(audio2, sampling_rate=16000, return_tensors="pt")
                
                with torch.no_grad():
                    logits1 = self.wav2vec_model(**inputs1).logits
                    logits2 = self.wav2vec_model(**inputs2).logits
                
                # Decode predictions
                predicted_ids1 = torch.argmax(logits1, dim=-1)
                predicted_ids2 = torch.argmax(logits2, dim=-1)
                
                transcription1 = self.wav2vec_processor.batch_decode(predicted_ids1)
                transcription2 = self.wav2vec_processor.batch_decode(predicted_ids2)
                
                # Compare segments
                segments1 = self._split_into_segments(transcript1)
                segments2 = self._split_into_segments(transcript2)
                
                for i, (seg1, seg2) in enumerate(zip(segments1, segments2)):
                    if i >= len(segments1) or i >= len(segments2):
                        break
                    
                    # Calculate confidence for each segment
                    confidence1 = self._calculate_segment_confidence(seg1, transcription1[0])
                    confidence2 = self._calculate_segment_confidence(seg2, transcription2[0])
                    
                    validation_results['segment_analysis'][i] = {
                        'pipeline1_segment': seg1,
                        'pipeline2_segment': seg2,
                        'pipeline1_confidence': confidence1,
                        'pipeline2_confidence': confidence2
                    }
                    
                    # Determine which pipeline is correct for this segment
                    if confidence1 > confidence2:
                        validation_results['pipeline1_correct_segments'].append({
                            'position': i,
                            'segment': seg1,
                            'confidence': confidence1
                        })
                    else:
                        validation_results['pipeline2_correct_segments'].append({
                            'position': i,
                            'segment': seg2,
                            'confidence': confidence2
                        })
                
                print(f"✅ Segment-level validation completed: {len(validation_results['segment_analysis'])} segments analyzed")
                
            except Exception as e:
                print(f"⚠️  Wav2Vec2 segment validation failed: {e}")
                # Fallback to simple segment comparison
                validation_results = self._fallback_segment_validation(transcript1, transcript2)
        else:
            print("⚠️  Wav2Vec2 model not available, using fallback segment validation")
            validation_results = self._fallback_segment_validation(transcript1, transcript2)
        
        return validation_results
    
    def _fallback_segment_validation(self, transcript1: str, transcript2: str) -> Dict:
        """
        Fallback segment validation when Wav2Vec2 model is not available
        """
        validation_results = {
            'pipeline1_correct_segments': [],
            'pipeline2_correct_segments': [],
            'segment_analysis': {}
        }
        
        # Split into segments
        segments1 = self._split_into_segments(transcript1)
        segments2 = self._split_into_segments(transcript2)
        
        # Simple fallback: use segment length and word count
        for i, (seg1, seg2) in enumerate(zip(segments1, segments2)):
            if i >= len(segments1) or i >= len(segments2):
                break
            
            # Simple confidence based on segment characteristics
            confidence1 = min(1.0, len(seg1) / 100.0)  # Longer segments get higher confidence
            confidence2 = min(1.0, len(seg2) / 100.0)
            
            validation_results['segment_analysis'][i] = {
                'pipeline1_segment': seg1,
                'pipeline2_segment': seg2,
                'pipeline1_confidence': confidence1,
                'pipeline2_confidence': confidence2
            }
            
            if confidence1 > confidence2:
                validation_results['pipeline1_correct_segments'].append({
                    'position': i,
                    'segment': seg1,
                    'confidence': confidence1
                })
            else:
                validation_results['pipeline2_correct_segments'].append({
                    'position': i,
                    'segment': seg2,
                    'confidence': confidence2
                })
        
        return validation_results
    
    def _calculate_word_confidence(self, word: str, reference_text: str) -> float:
        """
        Calculate confidence score for a word against reference text
        """
        if not word or not reference_text:
            return 0.0
        
        # Simple string matching with normalization
        word_clean = word.lower().strip()
        reference_clean = reference_text.lower()
        
        # Check if word appears in reference text
        if word_clean in reference_clean:
            return 1.0
        
        # Check for partial matches
        for ref_word in reference_clean.split():
            if word_clean in ref_word or ref_word in word_clean:
                return 0.8
        
        # Check for character-level similarity
        char_similarity = self._calculate_char_similarity(word_clean, reference_clean)
        return char_similarity
    
    def _calculate_segment_confidence(self, segment: str, reference_text: str) -> float:
        """
        Calculate confidence score for a segment against reference text
        """
        if not segment or not reference_text:
            return 0.0
        
        segment_clean = segment.lower().strip()
        reference_clean = reference_text.lower()
        
        # Check for exact match
        if segment_clean in reference_clean:
            return 1.0
        
        # Check for word overlap
        segment_words = set(segment_clean.split())
        reference_words = set(reference_clean.split())
        
        if segment_words and reference_words:
            overlap = len(segment_words.intersection(reference_words))
            total = len(segment_words.union(reference_words))
            return overlap / total if total > 0 else 0.0
        
        return 0.0
    
    def _calculate_char_similarity(self, word1: str, word2: str) -> float:
        """
        Calculate character-level similarity between two words
        """
        if not word1 or not word2:
            return 0.0
        
        set1 = set(word1)
        set2 = set(word2)
        
        intersection = len(set1.intersection(set2))
        union = len(set1.union(set2))
        
        return intersection / union if union > 0 else 0.0
    
    def _split_into_segments(self, text: str, max_segment_length: int = 50) -> List[str]:
        """
        Split text into segments for analysis
        """
        words = text.split()
        segments = []
        current_segment = []
        current_length = 0
        
        for word in words:
            if current_length + len(word) > max_segment_length and current_segment:
                segments.append(' '.join(current_segment))
                current_segment = [word]
                current_length = len(word)
            else:
                current_segment.append(word)
                current_length += len(word) + 1
        
        if current_segment:
            segments.append(' '.join(current_segment))
        
        return segments
    
    def _create_optimal_transcript_from_validation(self, transcript1: str, transcript2: str,
                                                 word_validation: Dict, segment_validation: Dict) -> str:
        """
        Create optimal transcript based on audio cross-validation results
        """
        words1 = transcript1.split()
        words2 = transcript2.split()
        
        optimal_words = []
        word_confidence = word_validation.get('word_confidence_scores', {})
        
        # Use word-level validation to choose correct words
        for i in range(max(len(words1), len(words2))):
            if i in word_confidence:
                confidence_data = word_confidence[i]
                confidence1 = confidence_data.get('pipeline1_confidence', 0)
                confidence2 = confidence_data.get('pipeline2_confidence', 0)
                
                # Choose the word with higher confidence
                if confidence1 > confidence2 + 0.05:  # Pipeline 1 is more confident
                    if i < len(words1):
                        optimal_words.append(words1[i])
                elif confidence2 > confidence1 + 0.05:  # Pipeline 2 is more confident
                    if i < len(words2):
                        optimal_words.append(words2[i])
                else:  # Similar confidence, use the longer/more complete word
                    word1 = words1[i] if i < len(words1) else ""
                    word2 = words2[i] if i < len(words2) else ""
                    optimal_words.append(word1 if len(word1) >= len(word2) else word2)
            else:
                # No validation data, use the word from the longer transcript
                if i < len(words1) and i < len(words2):
                    optimal_words.append(words1[i] if len(words1[i]) >= len(words2[i]) else words2[i])
                elif i < len(words1):
                    optimal_words.append(words1[i])
                elif i < len(words2):
                    optimal_words.append(words2[i])
        
        optimal_transcript = ' '.join(optimal_words)
        
        # Apply segment-level corrections if available
        segment_corrections = segment_validation.get('segment_analysis', {})
        if segment_corrections:
            optimal_transcript = self._apply_segment_corrections(optimal_transcript, segment_corrections)
        
        return optimal_transcript
    
    def _apply_segment_corrections(self, transcript: str, segment_corrections: Dict) -> str:
        """
        Apply segment-level corrections based on audio validation
        """
        # This is a simplified version - in practice, you'd want more sophisticated
        # segment matching and replacement logic
        corrected_transcript = transcript
        
        for segment_id, correction_data in segment_corrections.items():
            pipeline1_segment = correction_data.get('pipeline1_segment', '')
            pipeline2_segment = correction_data.get('pipeline2_segment', '')
            confidence1 = correction_data.get('pipeline1_confidence', 0)
            confidence2 = correction_data.get('pipeline2_confidence', 0)
            
            # If one pipeline is significantly more confident, use that segment
            if confidence1 > confidence2 + 0.1 and pipeline1_segment in corrected_transcript:
                # Replace with pipeline1 segment
                pass  # Implementation would replace segments
            elif confidence2 > confidence1 + 0.1 and pipeline2_segment in corrected_transcript:
                # Replace with pipeline2 segment
                pass  # Implementation would replace segments
        
        return corrected_transcript

# Create global instance
audio_cross_validator = AudioCrossValidator() 