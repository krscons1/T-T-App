from fastapi import APIRouter, UploadFile, File, HTTPException
import os
import time
import aiofiles
from pathlib import Path
from app.services.sarvam_batch_service import SarvamBatchService

from app.core.config import settings
from app.services.sarvam_service import sarvam_service
from app.services.audio_service import audio_service
from app.schemas.transcription import ProcessFileResponse

router = APIRouter()

async def save_uploaded_file(file: UploadFile) -> str:
    """Save uploaded file to temporary directory"""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
    
    # Validate file size
    contents = await file.read()
    if len(contents) > settings.MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large")
    
    # Check file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"File type {file_ext} not supported"
        )
    
    # Save file
    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(exist_ok=True)
    
    file_path = upload_dir / f"{int(time.time())}_{file.filename}"
    
    async with aiofiles.open(file_path, 'wb') as f:
        await f.write(contents)
    
    return str(file_path)

@router.post("/transcribe", response_model=ProcessFileResponse)
async def transcribe_and_translate_file(file: UploadFile = File(...)):
    """
    Main endpoint to transcribe and translate uploaded audio/video files
    """
    start_time = time.time()
    temp_files = []
    
    try:
        # Save uploaded file
        file_path = await save_uploaded_file(file)
        temp_files.append(file_path)
        
        # Validate and prepare audio
        audio_path, file_type = await audio_service.validate_and_prepare_audio(file_path)
        if audio_path != file_path:
            temp_files.append(audio_path)
        
        # Transcribe audio using Sarvam AI
        transcription_result = await sarvam_service.transcribe_audio(
            audio_path, 
            language_code="ta-IN"
        )
        
        # Translate transcribed text
        translation_result = await sarvam_service.translate_text(
            transcription_result.transcription,
            source_lang="ta-IN",
            target_lang="en-IN"
        )
        
        processing_time = time.time() - start_time
        
        return ProcessFileResponse(
            filename=file.filename or "unknown",
            transcription=transcription_result.transcription,
            translation=translation_result.translated_text,
            processing_time=processing_time,
            file_type=file_type
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        # Clean up temporary files
        for temp_file in temp_files:
            try:
                os.unlink(temp_file)
            except:
                pass

@router.post("/batch_transcribe")
async def batch_transcribe_file(file: UploadFile = File(...), language_code: str = "ta-IN"):
    """
    Endpoint to handle long audio files using Sarvam batch API.
    Returns the transcript directly.
    """
    import tempfile
    import shutil
    sarvam_batch = SarvamBatchService(settings.SARVAM_API_KEY)
    # Save uploaded file to a temp location
    with tempfile.NamedTemporaryFile(delete=False, suffix=Path(file.filename).suffix) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name
    # Start batch process
    transcript = await sarvam_batch.batch_transcribe(tmp_path, language_code=language_code)
    # Clean up temp file
    os.unlink(tmp_path)
    return {
        "transcript": transcript
    }

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Tamil Transcriptor API"} 