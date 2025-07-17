# Pydantic schemas for transcription 
from pydantic import BaseModel
from typing import Optional

class TranscriptionRequest(BaseModel):
    language_code: str = "ta-IN"  # Tamil India
    model: str = "saarika:v1"
    with_timestamps: bool = False

class TranscriptionResponse(BaseModel):
    transcription: str
    language_detected: str
    confidence: Optional[float] = None
    processing_time: Optional[float] = None
    diarized_transcript: Optional[dict] = None  # Add diarization support

class TranslationRequest(BaseModel):
    text: str
    source_language: str = "ta-IN"
    target_language: str = "en-IN"
    model: str = "sarvam-translate:v1"

class TranslationResponse(BaseModel):
    original_text: str
    translated_text: str
    source_language: str
    target_language: str
    confidence: Optional[float] = None
    paraphrased_text: Optional[str] = None

class ProcessFileResponse(BaseModel):
    filename: str
    transcription: str
    translation: str
    processing_time: float
    file_type: str
    diarized_transcript: Optional[dict] = None  # Add diarization support 