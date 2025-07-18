from fastapi import APIRouter, HTTPException
from app.schemas.transcription import TranslationRequest, TranslationResponse
import time
import os
from app.services.sarvam_service import sarvam_service
from dotenv import load_dotenv
import logging
import httpx
from app.services.sarvam_chat_service import get_more_accurate_translation

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

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

async def paraphrase_with_gemini(formal_text: str) -> str:
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
    headers = {"Content-Type": "application/json", "X-goog-api-key": GEMINI_API_KEY}
    prompt = (
        "You are a professional paraphraser. Rewrite the following text from a formal tone into a friendly, natural, and conversational tone—similar to how a person would casually explain it. "
        "Keep the meaning accurate, simplify the sentence structures, and avoid sounding robotic, stiff, or overly professional. Eliminate formal words and replace them with everyday language.\n"
        "Return only the paraphrased text, without any introduction, explanation, or extra content.\n\n"
        f"{formal_text}"
    )
    data = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ]
    }
    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, json=data, timeout=30)
        response.raise_for_status()
        result = response.json()
        return result["candidates"][0]["content"]["parts"][0]["text"]

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
        # Improved translation using Sarvam LLM chat completion
        improved_translation = get_more_accurate_translation(request.text, response.translated_text)
        # Paraphrase the improved translation
        improved_paraphrased_text = None
        try:
            improved_paraphrased_text = await paraphrase_with_gemini(improved_translation)
        except Exception as e:
            logging.error(f"Gemini paraphrasing failed: {e}")
        # Paraphrase the original translation (optional, keep for backward compatibility)
        paraphrased_text = None
        try:
            paraphrased_text = await paraphrase_with_gemini(response.translated_text)
        except Exception as e:
            logging.error(f"Gemini paraphrasing failed: {e}")
        # Return all fields
        return TranslationResponse(
            original_text=response.original_text,
            translated_text=response.translated_text,
            source_language=response.source_language,
            target_language=response.target_language,
            confidence=response.confidence,
            paraphrased_text=paraphrased_text,
            improved_translation=improved_translation,
            improved_paraphrased_text=improved_paraphrased_text
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}") 