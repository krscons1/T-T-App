from pydantic import BaseModel
from typing import List

class DiffRequest(BaseModel):
    final_transcription: str
    user_transcription: str
    mode: str = "line"  # 'line' or 'word', default to 'line'

class DiffChange(BaseModel):
    op: str  # 'equal', 'insert', 'delete', 'replace'
    text: str

class DiffResponse(BaseModel):
    changes: List[DiffChange]
    wer: float  # Word Error Rate
    cer: float  # Character Error Rate
    summary: str
