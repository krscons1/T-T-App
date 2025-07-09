from fastapi import APIRouter, HTTPException
from app.schemas.transcription import TranslationRequest, TranslationResponse
import time
import os
from app.services.sarvam_service import sarvam_service
from dotenv import load_dotenv
import logging

router = APIRouter()

# Load environment variables
load_dotenv()

# Language code mapping for SarvamAI
LANG_CODE_MAP = {
    "tam_Taml": "ta-IN",
    "eng_Latn": "en-IN",
    "hin_Deva": "hi-IN",
    # Add more mappings as needed
}

@router.post("/translate", response_model=TranslationResponse)
async def translate(request: TranslationRequest):
    start_time = time.time()
    try:
        source_lang = LANG_CODE_MAP.get(request.source_language, request.source_language)
        target_lang = LANG_CODE_MAP.get(request.target_language, request.target_language)
        
        # Use the existing SarvamService
        response = await sarvam_service.translate_text(
            text=request.text,
            source_lang=source_lang,
            target_lang=target_lang
        )
        
        logging.warning(f"SarvamAI response: {response}")
        processing_time = time.time() - start_time
        
        # Update the response with processing time
        response.processing_time = processing_time
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}") 