# Sarvam AI integration placeholder 

import httpx
import aiofiles
import os
import mimetypes
from typing import Optional
from app.core.config import settings
from app.schemas.transcription import TranscriptionResponse, TranslationResponse

class SarvamService:
    def __init__(self):
        self.base_url = settings.SARVAM_BASE_URL
        self.api_key = settings.SARVAM_API_KEY
        self.headers = {
            "api-subscription-key": self.api_key
        }
    
    async def transcribe_audio(
        self, 
        file_path: str, 
        language_code: str = "ta-IN",
        model: str = "saarika:v1"
    ) -> TranscriptionResponse:
        """
        Transcribe audio using Sarvam AI's Saarika speech-to-text API
        """
        url = f"{self.base_url}/speech-to-text"
        
        async with aiofiles.open(file_path, 'rb') as audio_file:
            file_bytes = await audio_file.read()
            filename = os.path.basename(file_path)
            mime_type, _ = mimetypes.guess_type(filename)
            if not mime_type:
                mime_type = "application/octet-stream"
            files = {
                'file': (filename, file_bytes, mime_type)
            }
            data = {
                'model': model,
                'language_code': language_code,
                'with_timestamps': 'false'
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    url, 
                    headers=self.headers, 
                    files=files,
                    data=data,
                    timeout=60.0
                )
                print("Sarvam API response:", response.status_code, response.text)  # Debug print
                response.raise_for_status()
                result = response.json()
                
                return TranscriptionResponse(
                    transcription=result.get('transcript', ''),
                    language_detected=language_code,
                    confidence=result.get('confidence'),
                    processing_time=result.get('processing_time')
                )
    
    async def translate_text(
        self, 
        text: str, 
        source_lang: str = "ta-IN", 
        target_lang: str = "en-IN"
    ) -> TranslationResponse:
        """
        Translate text using Sarvam AI's Mayura translation API
        """
        url = f"{self.base_url}/translate"
        
        payload = {
            "input": text,
            "source_language_code": source_lang,
            "target_language_code": target_lang,
            "speaker_gender": "Male",
            "mode": "formal",
            "model": "mayura:v1"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                headers={**self.headers, "Content-Type": "application/json"},
                json=payload,
                timeout=30.0
            )
            print("Sarvam API response (translate):", response.status_code, response.text)  # Debug print
            response.raise_for_status()
            result = response.json()
            
            return TranslationResponse(
                original_text=text,
                translated_text=result.get('translated_text', ''),
                source_language=source_lang,
                target_language=target_lang,
                confidence=result.get('confidence')
            )

sarvam_service = SarvamService() 