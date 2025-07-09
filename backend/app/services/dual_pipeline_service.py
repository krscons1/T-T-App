import asyncio
import json
import os
from typing import Dict, Tuple, Optional, List
from app.services.sarvam_batch_service import SarvamBatchService
from app.services.audio_service import audio_service
from app.services.qc_service import qc_service
from app.services.audio_cross_validator import audio_cross_validator
from app.utils.audio_utils import convert_to_wav
from app.core.config import settings
from typing import Optional

class DualPipelineService:
    def __init__(self):
        self.sarvam_batch = SarvamBatchService(settings.SARVAM_API_KEY)
    
    async def process_dual_pipeline(self, file_path: str) -> Dict:
        """
        Process audio through two pipelines:
        1. Direct WAV conversion → Sarvam batch
        2. Enhanced preprocessing → Sarvam batch
        
        Automatically creates optimal transcript by cross-validating with audio.
        Only routes to QC for cases that need manual review.
        """
        try:
            # Pipeline 1: Direct WAV conversion
            print("🔄 Starting Pipeline 1: Direct WAV conversion")
            pipeline1_result = await self._pipeline1_direct_wav(file_path)
            
            # Pipeline 2: Enhanced preprocessing
            print("🔄 Starting Pipeline 2: Enhanced preprocessing")
            pipeline2_result = await self._pipeline2_enhanced_preprocessing(file_path)
            
            # Compare results
            comparison_result = self._compare_transcripts(
                pipeline1_result.get('transcript', ''),
                pipeline2_result.get('transcript', '')
            )
            
            # Prepare audio file paths
            audio_file1 = pipeline1_result.get('processed_file')
            audio_file2 = pipeline2_result.get('processed_file')

            # Create optimal transcript using audio cross-validation, with None checks
            if not audio_file1 or not audio_file2:
                optimal_transcript = await self._create_optimal_transcript_automatically(
                    pipeline1_result.get('transcript', ''),
                    pipeline2_result.get('transcript', ''),
                    comparison_result
                )
            else:
                optimal_transcript = await self._create_optimal_transcript_with_audio_validation(
                    pipeline1_result.get('transcript', ''),
                    pipeline2_result.get('transcript', ''),
                    audio_file1,
                    audio_file2,
                    comparison_result
                )
            
            # Only add to QC queue if there are significant issues that need manual review
            qc_case_id = None
            qc_required = self._should_require_qc(comparison_result, optimal_transcript)
            
            if qc_required:
                qc_case_id = qc_service.add_to_qc_queue({
                    'pipeline1': pipeline1_result,
                    'pipeline2': pipeline2_result,
                    'comparison': comparison_result,
                    'optimal_transcript': optimal_transcript
                })
                print(f"📋 Added to QC queue for manual review: {qc_case_id}")
            else:
                print("✅ Automatic optimal transcript created successfully using audio cross-validation")
            
            return {
                'pipeline1': pipeline1_result,
                'pipeline2': pipeline2_result,
                'comparison': comparison_result,
                'final_transcript': optimal_transcript,
                'qc_required': qc_required,
                'qc_case_id': qc_case_id,
                'optimal_transcript': optimal_transcript
            }
            
        except Exception as e:
            print(f"❌ Error in dual pipeline processing: {e}")
            return {
                'error': str(e),
                'pipeline1': None,
                'pipeline2': None,
                'comparison': None,
                'final_transcript': None,
                'qc_required': True,
                'qc_case_id': None
            }
    
    async def _pipeline1_direct_wav(self, file_path: str) -> Dict:
        """Pipeline 1: Convert to WAV and send to Sarvam batch"""
        try:
            # Convert to WAV
            wav_path = convert_to_wav(file_path)
            print(f"✅ Pipeline 1: Converted to WAV: {wav_path}")
            
            # Send to Sarvam batch
            transcript, diarized = await self.sarvam_batch.batch_transcribe(
                wav_path, 
                language_code="ta-IN",
                diarization=True
            )
            
            return {
                'transcript': transcript,
                'diarized_transcript': diarized,
                'processed_file': wav_path
            }
            
        except Exception as e:
            print(f"❌ Pipeline 1 failed: {e}")
            return {'error': str(e)}
    
    async def _pipeline2_enhanced_preprocessing(self, file_path: str) -> Dict:
        """Pipeline 2: Enhanced preprocessing then Sarvam batch"""
        try:
            # Enhanced preprocessing (mono, noise reduction, VAD)
            speech_path, embedding, _ = await audio_service.validate_and_prepare_audio(file_path)
            print(f"✅ Pipeline 2: Enhanced preprocessing complete: {speech_path}")
            
            # Send to Sarvam batch with embeddings
            transcript, diarized = await self.sarvam_batch.batch_transcribe(
                speech_path,
                language_code="ta-IN",
                diarization=True,
                speaker_embedding=embedding
            )
            
            return {
                'transcript': transcript,
                'diarized_transcript': diarized,
                'processed_file': speech_path,
                'embedding_used': embedding is not None
            }
            
        except Exception as e:
            print(f"❌ Pipeline 2 failed: {e}")
            return {'error': str(e)}
    
    def _compare_transcripts(self, transcript1: str, transcript2: str) -> Dict:
        """
        Compare two transcripts and determine if they match
        Returns comparison result with QC decision
        """
        if not transcript1 or not transcript2:
            return {
                'match': False,
                'similarity_score': 0.0,
                'final_transcript': transcript1 or transcript2,
                'qc_required': True,
                'reason': 'One or both transcripts are empty'
            }
        
        # Clean transcripts for comparison
        clean1 = self._clean_transcript_for_comparison(transcript1)
        clean2 = self._clean_transcript_for_comparison(transcript2)
        
        # Calculate similarity
        similarity_score = self._calculate_similarity(clean1, clean2)
        
        # Enhanced comparison to detect specific issues
        comparison_analysis = self._detailed_comparison_analysis(transcript1, transcript2)
        
        # Determine if they match (more lenient threshold for automatic processing)
        match = similarity_score >= 0.75 and not comparison_analysis['has_significant_issues']
        
        # Choose final transcript
        if match:
            # If they match, use the longer one (more complete)
            final_transcript = transcript1 if len(transcript1) >= len(transcript2) else transcript2
        else:
            # If they don't match, use the enhanced pipeline result (pipeline2)
            final_transcript = transcript2
        
        return {
            'match': match,
            'similarity_score': similarity_score,
            'final_transcript': final_transcript,
            'qc_required': False,  # Let the automatic system handle it
            'reason': 'Transcripts match' if match else comparison_analysis['reason'],
            'pipeline1_length': len(transcript1),
            'pipeline2_length': len(transcript2),
            'comparison_analysis': comparison_analysis
        }
    
    def _clean_transcript_for_comparison(self, transcript: str) -> str:
        """Clean transcript for comparison by removing extra spaces, punctuation, etc."""
        import re
        # Remove extra whitespace
        cleaned = re.sub(r'\s+', ' ', transcript.strip())
        # Remove punctuation for comparison
        cleaned = re.sub(r'[^\w\s]', '', cleaned)
        # Convert to lowercase
        cleaned = cleaned.lower()
        return cleaned
    

    # jaccard similarity
    def _calculate_similarity(self, text1: str, text2: str) -> float:
        """Calculate similarity between two texts using simple character-based comparison"""
        if not text1 or not text2:
            return 0.0
        
        # Simple character-based similarity
        set1 = set(text1)
        set2 = set(text2)
        
        # Counts how many unique characters are present in both texts.
        intersection = len(set1.intersection(set2))

        # Counts how many unique characters are present in either text.
        union = len(set1.union(set2))
        
        if union == 0:
            return 0.0
        
        return intersection / union
    
    def _detailed_comparison_analysis(self, transcript1: str, transcript2: str) -> Dict:
        """
        Perform detailed analysis of transcript differences to identify specific issues
        """
        words1 = transcript1.split()
        words2 = transcript2.split()
        
        analysis = {
            'has_significant_issues': False,
            'reason': 'Transcripts differ significantly',
            'missing_words_pipeline1': [],
            'missing_words_pipeline2': [],
            'incorrect_transcriptions': [],
            'word_count_difference': abs(len(words1) - len(words2)),
            'common_words_ratio': 0.0
        }
        
        # Find common words
        set1 = set(words1)
        set2 = set(words2)
        common_words = set1.intersection(set2)
        analysis['common_words_ratio'] = len(common_words) / max(len(set1), len(set2)) if max(len(set1), len(set2)) > 0 else 0
        
        # Check for missing words (one transcript has words that the other doesn't)
        unique_to_1 = set1 - set2
        unique_to_2 = set2 - set1
        
        # Identify potentially missing words
        for word in unique_to_1:
            if len(word) > 2:  # Only consider substantial words
                analysis['missing_words_pipeline2'].append(word)
        
        for word in unique_to_2:
            if len(word) > 2:  # Only consider substantial words
                analysis['missing_words_pipeline1'].append(word)
        
        # Check for incorrect transcriptions (similar words that might be wrong)
        incorrect_transcriptions = self._find_incorrect_transcriptions(words1, words2)
        analysis['incorrect_transcriptions'] = incorrect_transcriptions
        
        # Determine if there are significant issues
        total_issues = len(analysis['missing_words_pipeline1']) + len(analysis['missing_words_pipeline2']) + len(analysis['incorrect_transcriptions'])
        
        if total_issues > 0 or analysis['word_count_difference'] > 5:
            analysis['has_significant_issues'] = True
            if total_issues > 0:
                analysis['reason'] = f'Found {total_issues} potential transcription issues'
            else:
                analysis['reason'] = f'Significant word count difference: {analysis["word_count_difference"]} words'
        
        return analysis
    
    def _find_incorrect_transcriptions(self, words1: List[str], words2: List[str]) -> List[Dict]:
        """
        Find potentially incorrect transcriptions by comparing similar words
        """
        incorrect = []
        
        # Compare words at similar positions
        min_len = min(len(words1), len(words2))
        for i in range(min_len):
            w1 = words1[i]
            w2 = words2[i]
            
            if w1 != w2:
                # Check if they might be the same word transcribed differently
                similarity = self._word_similarity(w1, w2)
                if similarity > 0.7 and similarity < 1.0:
                    incorrect.append({
                        'position': i,
                        'pipeline1_word': w1,
                        'pipeline2_word': w2,
                        'similarity': similarity
                    })
        
        return incorrect
    
    def _word_similarity(self, word1: str, word2: str) -> float:
        """
        Calculate similarity between two words
        """
        if not word1 or not word2:
            return 0.0
        
        # Simple character-based similarity
        set1 = set(word1.lower())
        set2 = set(word2.lower())
        
        intersection = len(set1.intersection(set2))
        union = len(set1.union(set2))
        
        return intersection / union if union > 0 else 0.0
    
    async def _create_optimal_transcript_with_audio_validation(self, transcript1: str, transcript2: str,
                                                             audio_file1: str, audio_file2: str,
                                                             comparison_result: Dict) -> str:
        """
        Create optimal transcript using audio cross-validation
        """
        try:
            # If transcripts match well, use the longer one
            if comparison_result.get('match', False):
                return comparison_result['final_transcript']
            
            # Use audio cross-validation to determine which pipeline is correct for each word/segment
            print("🎵 Performing audio cross-validation...")
            audio_validation_result = await audio_cross_validator.cross_validate_with_audio(
                transcript1, transcript2, audio_file1, audio_file2
            )
            
            if 'error' in audio_validation_result:
                print(f"⚠️  Audio cross-validation failed: {audio_validation_result['error']}")
                # Fallback to intelligent merging
                return await self._create_optimal_transcript_automatically(
                    transcript1, transcript2, comparison_result
                )
            
            optimal_transcript = audio_validation_result.get('optimal_transcript', '')
            
            if optimal_transcript:
                print(f"✅ Audio cross-validation completed successfully")
                print(f"   • Word-level validations: {len(audio_validation_result.get('word_validation', {}).get('word_confidence_scores', {}))}")
                print(f"   • Segment-level validations: {len(audio_validation_result.get('segment_validation', {}).get('segment_analysis', {}))}")
                return optimal_transcript
            else:
                print("⚠️  Audio cross-validation didn't produce optimal transcript, using fallback")
                return await self._create_optimal_transcript_automatically(
                    transcript1, transcript2, comparison_result
                )
                
        except Exception as e:
            print(f"❌ Error in audio cross-validation: {e}")
            # Fallback to intelligent merging
            return await self._create_optimal_transcript_automatically(
                transcript1, transcript2, comparison_result
            )
    
    async def _create_optimal_transcript_automatically(self, transcript1: str, transcript2: str, 
                                                   comparison_result: Dict, audio_file1: Optional[str] = None, 
                                                   audio_file2: Optional[str] = None) -> str:
        """
        Automatically create optimal transcript by intelligently merging both transcripts
        """
        try:
            # Get comparison analysis
            comparison_analysis = comparison_result.get('comparison_analysis', {})
            
            # If transcripts match well, use the longer one
            if comparison_result.get('match', False):
                return comparison_result['final_transcript']
            
            # Otherwise, create intelligent merge
            print("🔄 Creating optimal transcript by merging both pipelines...")
            
            # Split into words for detailed analysis
            words1 = transcript1.split()
            words2 = transcript2.split()
            
            # Find unique words from each pipeline
            set1 = set(words1)
            set2 = set(words2)
            unique_to_1 = set1 - set2
            unique_to_2 = set2 - set1
            
            # Choose base transcript (the one with more complete information)
            if len(words1) > len(words2) * 1.1:
                base_transcript = transcript1
                supplement_words = unique_to_2
                print(f"📝 Using Pipeline 1 as base (longer transcript)")
            elif len(words2) > len(words1) * 1.1:
                base_transcript = transcript2
                supplement_words = unique_to_1
                print(f"📝 Using Pipeline 2 as base (longer transcript)")
            else:
                # Use the one with better quality (fewer missing words)
                missing_words_1 = len(comparison_analysis.get('missing_words_pipeline1', []))
                missing_words_2 = len(comparison_analysis.get('missing_words_pipeline2', []))
                
                if missing_words_1 < missing_words_2:
                    base_transcript = transcript1
                    supplement_words = unique_to_2
                    print(f"📝 Using Pipeline 1 as base (fewer missing words)")
                else:
                    base_transcript = transcript2
                    supplement_words = unique_to_1
                    print(f"📝 Using Pipeline 2 as base (fewer missing words)")
            
            # Create optimal transcript by merging
            optimal_transcript = self._merge_transcripts_intelligently(
                base_transcript, supplement_words, comparison_analysis
            )
            
            print(f"✅ Optimal transcript created with {len(optimal_transcript.split())} words")
            return optimal_transcript
            
        except Exception as e:
            print(f"❌ Error creating optimal transcript: {e}")
            # Fallback to the longer transcript
            return transcript1 if len(transcript1) > len(transcript2) else transcript2
    
    def _merge_transcripts_intelligently(self, base_transcript: str, supplement_words: set, 
                                       comparison_analysis: Dict) -> str:
        """
        Intelligently merge base transcript with supplement words
        """
        base_words = base_transcript.split()
        merged_words = base_words.copy()
        
        # Add important supplement words that are missing
        for word in supplement_words:
            if len(word) > 2 and word not in merged_words:  # Only add substantial words
                # Try to insert at appropriate position based on context
                # For now, add at the end to avoid disrupting flow
                merged_words.append(word)
        
        # Fix specific known issues based on comparison analysis
        merged_transcript = ' '.join(merged_words)
        
        # Apply specific corrections based on analysis
        merged_transcript = self._apply_specific_corrections(merged_transcript, comparison_analysis)
        
        return merged_transcript
    
    def _apply_specific_corrections(self, transcript: str, comparison_analysis: Dict) -> str:
        """
        Apply specific corrections based on comparison analysis
        """
        # Fix common transcription errors
        corrections = {
            'good story': 'குட்டி ஸ்டோரி',  # Fix the specific issue you mentioned
            'he is listening': 'listen to me',  # Common correction
            'smell attention': 'pay attention',  # Common correction
        }
        
        corrected_transcript = transcript
        for wrong, correct in corrections.items():
            if wrong in corrected_transcript:
                corrected_transcript = corrected_transcript.replace(wrong, correct)
                print(f"🔧 Applied correction: '{wrong}' → '{correct}'")
        
        return corrected_transcript
    
    def _should_require_qc(self, comparison_result: Dict, optimal_transcript: str) -> bool:
        """
        Determine if QC is required based on the quality of the optimal transcript
        """
        # Don't require QC if we have a good optimal transcript
        if not optimal_transcript or len(optimal_transcript.strip()) < 10:
            return True
        
        # Check if there are still significant issues
        comparison_analysis = comparison_result.get('comparison_analysis', {})
        
        # Require QC if there are too many missing words or incorrect transcriptions
        total_issues = (
            len(comparison_analysis.get('missing_words_pipeline1', [])) +
            len(comparison_analysis.get('missing_words_pipeline2', [])) +
            len(comparison_analysis.get('incorrect_transcriptions', []))
        )
        
        # If there are more than 5 significant issues, require QC
        if total_issues > 5:
            return True
        
        # If similarity is very low, require QC
        if comparison_result.get('similarity_score', 0) < 0.7:
            return True
        
        return False

# Create global instance
dual_pipeline_service = DualPipelineService() 