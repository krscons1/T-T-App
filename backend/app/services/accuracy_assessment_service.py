from typing import Dict, List, Tuple, Optional
import re
import json
from difflib import SequenceMatcher
from diff_match_patch import diff_match_patch
import numpy as np
from rapidfuzz import fuzz

class AccuracyAssessmentService:
    def __init__(self):
        self.dmp = diff_match_patch()
        
    def calculate_accuracy_metrics(
        self,
        enhanced_transcript: str,
        tested_transcript: str
    ) -> Dict[str, float]:
        """
        Calculate various accuracy metrics between enhanced and tested transcripts.
        
        Args:
            enhanced_transcript: The transcript from the enhanced pipeline
            tested_transcript: The verified/corrected transcript from tester
            
        Returns:
            Dict containing various accuracy metrics
        """
        # Basic text normalization
        enhanced = self._normalize_text(enhanced_transcript)
        tested = self._normalize_text(tested_transcript)
        
        # Calculate word-level metrics
        word_metrics = self._calculate_word_level_metrics(enhanced, tested)
        
        # Calculate character-level metrics
        char_metrics = self._calculate_char_level_metrics(enhanced, tested)
        
        # Calculate semantic similarity
        semantic_similarity = self._calculate_semantic_similarity(enhanced, tested)
        
        # Calculate WER (Word Error Rate)
        wer = self._calculate_wer(enhanced, tested)
        
        # Combine all metrics
        metrics = {
            **word_metrics,
            **char_metrics,
            "semantic_similarity": semantic_similarity,
            "word_error_rate": wer,
            "overall_accuracy": self._calculate_overall_accuracy(
                word_metrics, char_metrics, semantic_similarity, wer
            )
        }
        
        return metrics
    
    def _calculate_word_level_metrics(
        self, enhanced: str, tested: str
    ) -> Dict[str, float]:
        """Calculate word-level accuracy metrics."""
        enhanced_words = enhanced.split()
        tested_words = tested.split()
        
        # Calculate word error rate using Levenshtein distance
        word_error_rate = fuzz.ratio(enhanced_words, tested_words) / 100.0
        
        # Calculate word accuracy
        matcher = SequenceMatcher(None, enhanced_words, tested_words)
        matching_blocks = matcher.get_matching_blocks()
        
        total_matching_words = sum(block.size for block in matching_blocks)
        total_words = max(len(enhanced_words), len(tested_words))
        
        word_accuracy = total_matching_words / total_words if total_words > 0 else 0
        
        return {
            "word_accuracy": word_accuracy,
            "word_error_rate": 1 - word_accuracy,
            "matching_words": total_matching_words,
            "total_words": total_words,
            "word_similarity_ratio": word_error_rate,
        }
    
    def _calculate_char_level_metrics(
        self, enhanced: str, tested: str
    ) -> Dict[str, float]:
        """Calculate character-level accuracy metrics."""
        # Calculate character error rate using Levenshtein distance
        char_similarity = fuzz.ratio(enhanced, tested) / 100.0
        
        # Get detailed character differences
        diffs = self.dmp.diff_main(enhanced, tested)
        self.dmp.diff_cleanupSemantic(diffs)
        
        # Count differences
        insertions = sum(len(text) for op, text in diffs if op == 1)
        deletions = sum(len(text) for op, text in diffs if op == -1)
        matches = sum(len(text) for op, text in diffs if op == 0)
        
        total_chars = max(len(enhanced), len(tested))
        char_accuracy = matches / total_chars if total_chars > 0 else 0
        
        return {
            "character_accuracy": char_accuracy,
            "character_error_rate": 1 - char_accuracy,
            "character_similarity_ratio": char_similarity,
            "insertions": insertions,
            "deletions": deletions,
            "matches": matches,
            "total_characters": total_chars
        }
    
    def _calculate_semantic_similarity(self, text1: str, text2: str) -> float:
        """Calculate semantic similarity between two texts using fuzzy matching."""
        # Simple token sort ratio for semantic similarity
        return fuzz.token_sort_ratio(text1, text2) / 100.0
    
    def _calculate_wer(self, reference: str, hypothesis: str) -> float:
        """Calculate Word Error Rate (WER)."""
        ref_words = reference.split()
        hyp_words = hypothesis.split()
        
        # Build the cost matrix
        d = np.zeros((len(ref_words) + 1, len(hyp_words) + 1))
        d[:, 0] = np.arange(len(ref_words) + 1)
        d[0, :] = np.arange(len(hyp_words) + 1)
        
        for i in range(1, len(ref_words) + 1):
            for j in range(1, len(hyp_words) + 1):
                if ref_words[i-1] == hyp_words[j-1]:
                    d[i][j] = d[i-1][j-1]
                else:
                    substitution = d[i-1][j-1] + 1
                    insertion = d[i][j-1] + 1
                    deletion = d[i-1][j] + 1
                    d[i][j] = min(substitution, insertion, deletion)
        
        # WER = (S + D + I) / N = (S + D + I) / (S + D + C)
        # S = substitutions, D = deletions, I = insertions, C = correct words
        return d[len(ref_words)][len(hyp_words)] / len(ref_words) if ref_words else 0
    
    def _calculate_overall_accuracy(
        self,
        word_metrics: Dict[str, float],
        char_metrics: Dict[str, float],
        semantic_similarity: float,
        wer: float
    ) -> float:
        """Calculate overall accuracy score from multiple metrics."""
        # Weighted average of different metrics
        weights = {
            'word_accuracy': 0.4,
            'character_accuracy': 0.3,
            'semantic_similarity': 0.3
        }
        
        overall = (
            word_metrics['word_accuracy'] * weights['word_accuracy'] +
            char_metrics['character_accuracy'] * weights['character_accuracy'] +
            semantic_similarity * weights['semantic_similarity']
        )
        
        # Penalize for high WER
        overall *= (1 - min(wer, 1.0))  # Cap WER at 100%
        
        return max(0.0, min(1.0, overall))  # Ensure between 0 and 1
    
    def _normalize_text(self, text: str) -> str:
        """Normalize text for comparison."""
        if not text:
            return ""
            
        # Convert to lowercase
        text = text.lower()
        
        # Remove extra whitespace
        text = ' '.join(text.split())
        
        # Normalize punctuation (optional, can be customized based on requirements)
        text = re.sub(r'[\.,!?;:]+', '', text)
        
        return text.strip()

    def get_detailed_differences(
        self, enhanced: str, tested: str
    ) -> List[Dict[str, any]]:
        """
        Get detailed differences between transcripts.
        
        Returns:
            List of difference segments with type and content
        """
        diffs = self.dmp.diff_main(enhanced, tested)
        self.dmp.diff_cleanupSemantic(diffs)
        
        result = []
        for op, text in diffs:
            if op == 0:  # No change
                result.append({"type": "equal", "text": text})
            elif op == -1:  # Deletion (in tested but not in enhanced)
                result.append({"type": "deletion", "text": text})
            elif op == 1:  # Insertion (in enhanced but not in tested)
                result.append({"type": "insertion", "text": text})
                
        return result

# Singleton instance
accuracy_assessment_service = AccuracyAssessmentService()
