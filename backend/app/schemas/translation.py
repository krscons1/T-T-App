# Pydantic schemas for translation 
from pydantic import BaseModel, Field
from typing import List, Optional

class TranslationRequest(BaseModel):
    text: str = Field(..., description="Text to translate")
    source_lang: str = Field(default="tam_Taml", description="Source language code")
    target_lang: str = Field(default="eng_Latn", description="Target language code")
    preserve_proper_nouns: bool = Field(default=True, description="Preserve proper nouns")
    handle_thanglish: bool = Field(default=True, description="Handle Thanglish code-switching")

class BatchTranslationRequest(BaseModel):
    texts: List[str] = Field(..., description="List of texts to translate")
    source_lang: str = Field(default="tam_Taml", description="Source language code")
    target_lang: str = Field(default="eng_Latn", description="Target language code")
    preserve_proper_nouns: bool = Field(default=True, description="Preserve proper nouns")
    handle_thanglish: bool = Field(default=True, description="Handle Thanglish code-switching")

class TranslationResponse(BaseModel):
    original_text: str
    translated_text: str
    detected_proper_nouns: List[str]
    code_switching_detected: bool
    processing_time: float 