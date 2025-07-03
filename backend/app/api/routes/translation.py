from fastapi import APIRouter, HTTPException
from app.schemas.translation import TranslationRequest, TranslationResponse
import time
import os
from sarvamai import SarvamAI
from dotenv import load_dotenv
import logging

router = APIRouter()

# Load environment variables
load_dotenv()
SARVAM_API_KEY = os.getenv("SARVAM_API_KEY")
client = SarvamAI(api_subscription_key=SARVAM_API_KEY)

# Language code mapping for SarvamAI
LANG_CODE_MAP = {
    "tam_Taml": "ta-IN",
    "eng_Latn": "en-IN",
    "hin_Deva": "hi-IN",
    # Add more mappings as needed
}

@router.post("/translate", response_model=TranslationResponse)
def translate(request: TranslationRequest):
    start_time = time.time()
    try:
        source_lang = LANG_CODE_MAP.get(request.source_lang, request.source_lang)
        target_lang = LANG_CODE_MAP.get(request.target_lang, request.target_lang)
        response = client.text.translate(
            input=request.text,
            source_language_code=source_lang,
            target_language_code=target_lang,
            speaker_gender="Male",  # You can update this to use request.speaker_gender if you add it to the schema
            model="sarvam-translate:v1"
        )
        logging.warning(f"SarvamAI response: {response}")
        translated_text = getattr(response, 'translated_text', '')
        processing_time = time.time() - start_time
        return TranslationResponse(
            original_text=request.text,
            translated_text=translated_text,
            detected_proper_nouns=[],
            code_switching_detected=False,
            processing_time=processing_time
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}") 