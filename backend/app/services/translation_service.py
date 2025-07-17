import httpx
import os
from app.schemas.transcription import TranslationResponse
from app.core.config import settings

class SarvamTranslateHandler:
    def __init__(self):
        self.base_url = getattr(settings, 'SARVAM_BASE_URL', os.getenv('SARVAM_BASE_URL', 'https://api.sarvam.ai'))
        self.api_key = getattr(settings, 'SARVAM_API_KEY', os.getenv('SARVAM_API_KEY', 'YOUR_API_KEY'))
        self.headers = {"api-subscription-key": self.api_key}

    async def translate_text(self, text: str, source_lang: str = "ta-IN", target_lang: str = "en-IN") -> TranslationResponse:
        """
        Translate text using Sarvam AI's sarvam-translate:v1 model with chunking for large texts.
        """
        url = f"{self.base_url}/translate"
        max_length = 2000  # Sarvam-Translate:v1 chunk limit

        def chunk_text(text, max_length=2000):
            chunks = []
            while len(text) > max_length:
                split_index = text.rfind(" ", 0, max_length)
                if split_index == -1:
                    split_index = max_length
                chunks.append(text[:split_index].strip())
                text = text[split_index:].lstrip()
            if text:
                chunks.append(text.strip())
            return chunks

        text_chunks = chunk_text(text, max_length)
        translated_chunks = []

        async with httpx.AsyncClient() as client:
            for chunk in text_chunks:
                payload = {
                    "input": chunk,
                    "source_language_code": source_lang,
                    "target_language_code": target_lang,
                    "speaker_gender": "Male",
                    "mode": "formal",
                    "model": "sarvam-translate:v1"
                }
                response = await client.post(
                    url,
                    headers={**self.headers, "Content-Type": "application/json"},
                    json=payload,
                    timeout=30.0
                )
                response.raise_for_status()
                result = response.json()
                translated_chunks.append(result.get('translated_text', ''))

        full_translation = "\n".join(translated_chunks)
        return TranslationResponse(
            original_text=text,
            translated_text=full_translation,
            source_language=source_lang,
            target_language=target_lang,
            confidence=None
        ) 