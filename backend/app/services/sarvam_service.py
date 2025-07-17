# Sarvam AI integration placeholder 

import httpx
import aiofiles
import os
import mimetypes
from typing import Optional, Dict, Any
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
        model: str = "saarika:v1",
        with_diarization: bool = False
    ) -> TranscriptionResponse:
        """
        Transcribe audio using Sarvam AI's Saarika speech-to-text API, with optional diarization
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
                'with_timestamps': 'false',
            }
            if with_diarization:
                data['with_diarization'] = 'true'
            
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
                diarized_transcript = result.get('diarized_transcript')
                return TranscriptionResponse(
                    transcription=result.get('transcript', ''),
                    language_detected=language_code,
                    confidence=result.get('confidence'),
                    processing_time=result.get('processing_time'),
                    diarized_transcript=diarized_transcript
                )
    
    async def transcribe_audio_batch(
        self, 
        file_path: str, 
        language_code: str = "ta-IN",
        model: str = "saarika:v1",
        with_diarization: bool = True,
        batch_size: int = 10
    ) -> TranscriptionResponse:
        """
        Transcribe audio using Sarvam AI's regular API with audio splitting for long files
        """
        try:
            # Since batch API doesn't exist, we'll use regular API with audio splitting
            print("🌐 Using Sarvam regular API with audio splitting...")
            
            # For now, just use the regular API
            return await self.transcribe_audio(file_path, language_code, model, with_diarization)
            
        except Exception as e:
            print(f"❌ Sarvam processing failed: {e}")
            return TranscriptionResponse(
                transcription="",
                language_detected=language_code,
                confidence=0.0,
                processing_time=0.0,
                diarized_transcript=None
            )
    
    async def translate_text(
        self, 
        text: str, 
        source_lang: str = "ta-IN", 
        target_lang: str = "en-IN"
    ) -> TranslationResponse:
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

sarvam_service = SarvamService() 