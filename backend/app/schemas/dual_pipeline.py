from pydantic import BaseModel
from typing import Optional, Dict, Any

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