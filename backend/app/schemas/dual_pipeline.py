from pydantic import BaseModel
from typing import Optional, Dict, Any, List

class PipelineResult(BaseModel):
    transcript: Optional[str] = None
    diarized_transcript: Optional[Dict] = None
    processed_file: Optional[str] = None
    error: Optional[str] = None
    embedding_used: Optional[bool] = None

class ComparisonResult(BaseModel):
    match: bool
    similarity_score: float
    final_transcript: str
    qc_required: bool
    reason: str
    pipeline1_length: int
    pipeline2_length: int

class DualPipelineResponse(BaseModel):
    pipeline1: PipelineResult
    pipeline2: PipelineResult
    comparison: ComparisonResult
    final_transcript: str
    qc_required: bool
    qc_case_id: Optional[str] = None
    error: Optional[str] = None

class TranscriptSegment(BaseModel):
    speaker: str
    start: float
    end: float
    text: str
    confidence: float

class EnhancedTranscriptionResponse(BaseModel):
    success: bool
    final_transcript: List[Dict[str, Any]]
    elevenlabs_transcript: List[Dict[str, Any]]
    transliterated_elevenlabs: List[TranscriptSegment]
    sarvam_transcript: Optional[str] = None
    sarvam_diarized_transcript: Optional[Any] = None
    processing_info: Dict[str, Any]
    error: Optional[str] = None 