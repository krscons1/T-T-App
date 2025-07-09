import os
import json
import time
import librosa
import numpy as np
from typing import Dict, List, Optional, Tuple
from datetime import datetime
from app.services.sarvam_batch_service import SarvamBatchService
from app.services.audio_cross_validator import audio_cross_validator
from app.core.config import settings

class QCService:
    def __init__(self):
        self.qc_queue_dir = os.path.join(os.path.dirname(__file__), '../../qc_queue')
        os.makedirs(self.qc_queue_dir, exist_ok=True)
        self.sarvam_batch = SarvamBatchService(settings.SARVAM_API_KEY)
    
    def add_to_qc_queue(self, dual_pipeline_result: Dict) -> str:
        """
        Add a case to QC queue when transcripts don't match
        Returns the QC case ID
        """
        qc_case_id = f"qc_{int(time.time())}_{os.getpid()}"
        
        qc_case = {
            'qc_case_id': qc_case_id,
            'timestamp': datetime.now().isoformat(),
            'status': 'pending',
            'dual_pipeline_result': dual_pipeline_result,
            'qc_notes': '',
            'final_decision': None,
            'processed_by': None,
            'processed_at': None,
            'audio_cross_validation': None,
            'optimal_transcript': None
        }
        
        # Save to QC queue
        qc_file_path = os.path.join(self.qc_queue_dir, f"{qc_case_id}.json")
        with open(qc_file_path, 'w', encoding='utf-8') as f:
            json.dump(qc_case, f, indent=2, ensure_ascii=False)
        
        print(f"📋 Added to QC queue: {qc_case_id}")
        return qc_case_id
    
    async def perform_audio_cross_validation(self, qc_case_id: str) -> Dict:
        """
        Perform audio cross-validation to identify and correct transcription errors
        """
        try:
            # Get QC case
            qc_case = self._get_qc_case(qc_case_id)
            if not qc_case:
                return {'error': 'QC case not found'}
            
            dual_result = qc_case['dual_pipeline_result']
            pipeline1 = dual_result.get('pipeline1', {})
            pipeline2 = dual_result.get('pipeline2', {})
            
            # Get audio files
            audio_file1 = pipeline1.get('processed_file')
            audio_file2 = pipeline2.get('processed_file')
            
            if not audio_file1 or not audio_file2:
                return {'error': 'Audio files not found'}
            
            # Perform audio cross-validation using the new system
            cross_validation_result = await audio_cross_validator.cross_validate_with_audio(
                pipeline1.get('transcript', ''),
                pipeline2.get('transcript', ''),
                audio_file1,
                audio_file2
            )
            
            if 'error' in cross_validation_result:
                return cross_validation_result
            
            # Get optimal transcript from audio cross-validation
            optimal_transcript = cross_validation_result.get('optimal_transcript', '')
            
            # Update QC case with results
            qc_case.update({
                'audio_cross_validation': cross_validation_result,
                'optimal_transcript': optimal_transcript,
                'status': 'audio_validated'
            })
            
            self._save_qc_case(qc_case_id, qc_case)
            
            return {
                'cross_validation': cross_validation_result,
                'optimal_transcript': optimal_transcript,
                'qc_case_id': qc_case_id
            }
            
        except Exception as e:
            print(f"❌ Error in audio cross-validation: {e}")
            return {'error': str(e)}
    
    async def _analyze_transcript_accuracy(self, transcript1: str, transcript2: str, 
                                         audio_file1: str, audio_file2: str) -> Dict:
        """
        Analyze transcript accuracy by comparing with audio characteristics
        """
        try:
            # Load audio files
            audio1, sr1 = librosa.load(audio_file1, sr=None)
            audio2, sr2 = librosa.load(audio_file2, sr=None)
            
            # Analyze audio characteristics
            audio_analysis = {
                'audio1': {
                    'duration': float(len(audio1) / sr1),
                    'sample_rate': int(sr1),
                    'energy': float(np.mean(audio1**2)),
                    'zero_crossings': int(np.sum(librosa.zero_crossings(audio1))),
                    'spectral_centroid': float(np.mean(librosa.feature.spectral_centroid(y=audio1, sr=sr1)))
                },
                'audio2': {
                    'duration': float(len(audio2) / sr2),
                    'sample_rate': int(sr2),
                    'energy': float(np.mean(audio2**2)),
                    'zero_crossings': int(np.sum(librosa.zero_crossings(audio2))),
                    'spectral_centroid': float(np.mean(librosa.feature.spectral_centroid(y=audio2, sr=sr2)))
                }
            }
            
            # Analyze transcript differences
            transcript_analysis = self._analyze_transcript_differences(transcript1, transcript2)
            
            # Identify potential errors based on audio characteristics
            error_indicators = self._identify_error_indicators(transcript_analysis, audio_analysis)
            
            return {
                'audio_analysis': audio_analysis,
                'transcript_analysis': transcript_analysis,
                'error_indicators': error_indicators,
                'recommendations': self._generate_correction_recommendations(transcript_analysis, error_indicators)
            }
            
        except Exception as e:
            print(f"❌ Error analyzing transcript accuracy: {e}")
            return {'error': str(e)}
    
    def _analyze_transcript_differences(self, transcript1: str, transcript2: str) -> Dict:
        """
        Analyze differences between two transcripts
        """
        # Split into words for detailed comparison
        words1 = transcript1.split()
        words2 = transcript2.split()
        
        # Find common words and differences
        set1 = set(words1)
        set2 = set(words2)
        
        common_words = set1.intersection(set2)
        unique_to_1 = set1 - set2
        unique_to_2 = set2 - set1
        
        # Analyze word-level differences
        word_analysis = {
            'total_words_1': len(words1),
            'total_words_2': len(words2),
            'common_words': len(common_words),
            'unique_to_pipeline1': list(unique_to_1),
            'unique_to_pipeline2': list(unique_to_2),
            'similarity_ratio': len(common_words) / max(len(set1), len(set2)) if max(len(set1), len(set2)) > 0 else 0
        }
        
        # Identify potential missing words
        missing_words = self._identify_missing_words(words1, words2)
        
        return {
            'word_analysis': word_analysis,
            'missing_words': missing_words,
            'transcript1_words': words1,
            'transcript2_words': words2
        }
    
    def _identify_missing_words(self, words1: List[str], words2: List[str]) -> Dict:
        """
        Identify potentially missing words by analyzing context and patterns
        """
        missing_words = {
            'pipeline1_missing': [],
            'pipeline2_missing': [],
            'context_gaps': []
        }
        
        # Find gaps in transcription
        for i, (w1, w2) in enumerate(zip(words1, words2)):
            if w1 != w2:
                # Check if this looks like a missing word
                if len(w1) < len(w2) and w1 in w2:
                    missing_words['pipeline1_missing'].append({
                        'position': i,
                        'expected': w2,
                        'found': w1
                    })
                elif len(w2) < len(w1) and w2 in w1:
                    missing_words['pipeline2_missing'].append({
                        'position': i,
                        'expected': w1,
                        'found': w2
                    })
        
        return missing_words
    
    def _identify_error_indicators(self, transcript_analysis: Dict, audio_analysis: Dict) -> Dict:
        """
        Identify potential error indicators based on audio and transcript analysis
        """
        indicators = {
            'audio_quality_issues': [],
            'transcription_confidence': 'medium',
            'suggested_corrections': []
        }
        
        # Check audio quality
        audio1 = audio_analysis['audio1']
        audio2 = audio_analysis['audio2']
        
        if audio1['energy'] < 0.01 or audio2['energy'] < 0.01:
            indicators['audio_quality_issues'].append('Low audio energy detected')
        
        if abs(audio1['duration'] - audio2['duration']) > 5:
            indicators['audio_quality_issues'].append('Significant duration difference between pipelines')
        
        # Analyze transcript confidence
        similarity = transcript_analysis['word_analysis']['similarity_ratio']
        if similarity > 0.9:
            indicators['transcription_confidence'] = 'high'
        elif similarity > 0.7:
            indicators['transcription_confidence'] = 'medium'
        else:
            indicators['transcription_confidence'] = 'low'
        
        return indicators
    
    def _generate_correction_recommendations(self, transcript_analysis: Dict, error_indicators: Dict) -> List[str]:
        """
        Generate recommendations for transcript corrections
        """
        recommendations = []
        
        # Based on missing words analysis
        missing_words = transcript_analysis.get('missing_words', {})
        if missing_words.get('pipeline1_missing'):
            recommendations.append("Pipeline 1 appears to have missing words - consider using Pipeline 2 as base")
        
        if missing_words.get('pipeline2_missing'):
            recommendations.append("Pipeline 2 appears to have missing words - consider using Pipeline 1 as base")
        
        # Based on audio quality
        if error_indicators.get('audio_quality_issues'):
            recommendations.append("Audio quality issues detected - manual review recommended")
        
        # Based on confidence level
        confidence = error_indicators.get('transcription_confidence', 'medium')
        if confidence == 'low':
            recommendations.append("Low confidence in transcription - manual review required")
        elif confidence == 'high':
            recommendations.append("High confidence - automated correction should be safe")
        
        return recommendations
    
    def _create_optimal_transcript(self, transcript1: str, transcript2: str, 
                                 cross_validation_result: Dict) -> str:
        """
        Create an optimal transcript by combining the best parts from both pipelines
        """
        try:
            analysis = cross_validation_result.get('transcript_analysis', {})
            word_analysis = analysis.get('word_analysis', {})
            
            # If one transcript is significantly longer, it likely has more complete information
            if word_analysis['total_words_1'] > word_analysis['total_words_2'] * 1.2:
                base_transcript = transcript1
                supplement_transcript = transcript2
            elif word_analysis['total_words_2'] > word_analysis['total_words_1'] * 1.2:
                base_transcript = transcript2
                supplement_transcript = transcript1
            else:
                # Use the one with higher similarity to common words
                base_transcript = transcript1 if word_analysis['similarity_ratio'] >= 0.5 else transcript2
                supplement_transcript = transcript2 if base_transcript == transcript1 else transcript1
            
            # Merge transcripts intelligently
            optimal_transcript = self._merge_transcripts_intelligently(base_transcript, supplement_transcript, analysis)
            
            return optimal_transcript
            
        except Exception as e:
            print(f"❌ Error creating optimal transcript: {e}")
            # Fallback to the longer transcript
            return transcript1 if len(transcript1) > len(transcript2) else transcript2
    
    def _merge_transcripts_intelligently(self, base_transcript: str, supplement_transcript: str, 
                                       analysis: Dict) -> str:
        """
        Intelligently merge two transcripts to create an optimal version
        """
        words1 = analysis.get('transcript1_words', [])
        words2 = analysis.get('transcript2_words', [])
        
        # Find unique words from supplement that might be missing in base
        unique_to_2 = analysis.get('word_analysis', {}).get('unique_to_pipeline2', [])
        
        # Create a merged version
        merged_words = []
        base_words = base_transcript.split()
        
        # Add words from base transcript
        merged_words.extend(base_words)
        
        # Add unique words from supplement that might be important
        for word in unique_to_2:
            if word not in merged_words and len(word) > 2:  # Only add substantial words
                # Try to insert at appropriate position based on context
                merged_words.append(word)
        
        return ' '.join(merged_words)
    
    def _get_qc_case(self, qc_case_id: str) -> Optional[Dict]:
        """Get a specific QC case"""
        qc_file_path = os.path.join(self.qc_queue_dir, f"{qc_case_id}.json")
        if not os.path.exists(qc_file_path):
            return None
        
        try:
            with open(qc_file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error reading QC case {qc_case_id}: {e}")
            return None
    
    def _save_qc_case(self, qc_case_id: str, qc_case: Dict) -> bool:
        """Save a QC case"""
        qc_file_path = os.path.join(self.qc_queue_dir, f"{qc_case_id}.json")
        try:
            with open(qc_file_path, 'w', encoding='utf-8') as f:
                json.dump(qc_case, f, indent=2, ensure_ascii=False)
            return True
        except Exception as e:
            print(f"Error saving QC case {qc_case_id}: {e}")
            return False
    
    def get_qc_queue(self) -> List[Dict]:
        """Get all pending QC cases"""
        qc_cases = []
        for filename in os.listdir(self.qc_queue_dir):
            if filename.endswith('.json'):
                file_path = os.path.join(self.qc_queue_dir, filename)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        qc_case = json.load(f)
                        if qc_case.get('status') in ['pending', 'audio_validated']:
                            qc_cases.append(qc_case)
                except Exception as e:
                    print(f"Error reading QC case {filename}: {e}")
        
        return sorted(qc_cases, key=lambda x: x['timestamp'])
    
    def update_qc_case(self, qc_case_id: str, qc_notes: str, final_decision: str, processed_by: str) -> bool:
        """Update a QC case with decision"""
        qc_file_path = os.path.join(self.qc_queue_dir, f"{qc_case_id}.json")
        
        if not os.path.exists(qc_file_path):
            return False
        
        try:
            with open(qc_file_path, 'r', encoding='utf-8') as f:
                qc_case = json.load(f)
            
            qc_case.update({
                'status': 'completed',
                'qc_notes': qc_notes,
                'final_decision': final_decision,
                'processed_by': processed_by,
                'processed_at': datetime.now().isoformat()
            })
            
            with open(qc_file_path, 'w', encoding='utf-8') as f:
                json.dump(qc_case, f, indent=2, ensure_ascii=False)
            
            print(f"✅ Updated QC case: {qc_case_id}")
            return True
            
        except Exception as e:
            print(f"Error updating QC case {qc_case_id}: {e}")
            return False
    
    def get_qc_stats(self) -> Dict:
        """Get QC queue statistics"""
        total_cases = 0
        pending_cases = 0
        completed_cases = 0
        audio_validated_cases = 0
        
        for filename in os.listdir(self.qc_queue_dir):
            if filename.endswith('.json'):
                total_cases += 1
                file_path = os.path.join(self.qc_queue_dir, filename)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        qc_case = json.load(f)
                        status = qc_case.get('status', 'pending')
                        if status == 'pending':
                            pending_cases += 1
                        elif status == 'completed':
                            completed_cases += 1
                        elif status == 'audio_validated':
                            audio_validated_cases += 1
                except:
                    pass
        
        return {
            'total_cases': total_cases,
            'pending_cases': pending_cases,
            'completed_cases': completed_cases,
            'audio_validated_cases': audio_validated_cases
        }

# Create global instance
qc_service = QCService() 