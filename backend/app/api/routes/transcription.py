from fastapi import APIRouter, UploadFile, File, HTTPException, Query
import os
import time
import aiofiles
from pathlib import Path
from app.services.sarvam_batch_service import SarvamBatchService

from app.core.config import settings
from app.services.sarvam_service import sarvam_service
from app.services.audio_service import audio_service
from app.services.dual_pipeline_service import dual_pipeline_service
from app.services.qc_service import qc_service
from app.schemas.transcription import ProcessFileResponse
from app.schemas.dual_pipeline import DualPipelineResponse
from app.utils.audio_utils import preprocess_audio
import soundfile as sf

router = APIRouter()

async def save_uploaded_file(file: UploadFile) -> str:
    """Save uploaded file to downloads directory"""
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
    
    # Save file to backend/downloads
    download_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../downloads'))
    os.makedirs(download_dir, exist_ok=True)
    file_path = os.path.join(download_dir, f"{int(time.time())}_{file.filename}")
    
    async with aiofiles.open(file_path, 'wb') as f:
        await f.write(contents)
    
    return str(file_path)

@router.post("/transcribe", response_model=ProcessFileResponse)
async def transcribe_and_translate_file(
    file: UploadFile = File(...),
    diarization: bool = Query(False, description="Enable speaker diarization if supported")
):
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
            language_code="ta-IN",
            with_diarization=diarization
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
            file_type=file_type,
            diarized_transcript=transcription_result.diarized_transcript
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
async def batch_transcribe_file(file: UploadFile = File(...), language_code: str = "ta-IN", diarization: bool = Query(False, description="Enable speaker diarization if supported")):
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
    # Preprocess audio
    processed_path = preprocess_audio(tmp_path)
    if not processed_path:
        os.unlink(tmp_path)
        raise HTTPException(status_code=500, detail="Audio preprocessing failed.")
    # Print duration of preprocessed audio only if it's a .wav file
    if processed_path.lower().endswith('.wav'):
        y, sr = sf.read(processed_path)
        print(f"[batch_transcribe_file] Preprocessed audio duration: {len(y)/sr:.2f}s")
    else:
        print(f"[batch_transcribe_file] Skipping duration logging for non-wav file: {processed_path}")
    # Start batch process
    # Log the raw response from Sarvam
    print(f"[batch_transcribe_file] Calling Sarvam batch_transcribe with: {processed_path}, language_code={language_code}, diarization={diarization}")
    response = await sarvam_batch.batch_transcribe(processed_path, language_code=language_code, diarization=diarization)
    print(f"[batch_transcribe_file] Raw Sarvam response: {response}")
    # Unpack response as before
    if isinstance(response, tuple) and len(response) == 2:
        transcript, diarized_transcript = response
    else:
        transcript = response
        diarized_transcript = None
    # Clean up temp files
    for path in [tmp_path, processed_path]:
        if isinstance(path, str) and path and os.path.exists(path):
            try:
                os.unlink(path)
            except Exception as e:
                print(f"Failed to delete {path}: {e}")
    return {
        "transcript": transcript,
        "diarized_transcript": diarized_transcript
    }

@router.post("/batch_transcribe_embed")
async def batch_transcribe_file(file: UploadFile = File(...)):
    tmp = await save_uploaded_file(file)
    speech_path, embedding, _ = await audio_service.validate_and_prepare_audio(tmp)

    sarvam_batch = SarvamBatchService(settings.SARVAM_API_KEY)
    transcript, diarized = await sarvam_batch.batch_transcribe(
            speech_path, language_code="ta-IN",
            diarization=True, speaker_embedding=embedding)

    return {"transcript": transcript, "diarized_transcript": diarized}

@router.post("/dual_pipeline", response_model=DualPipelineResponse)
async def dual_pipeline_transcribe(file: UploadFile = File(...)):
    """
    Dual pipeline transcription with comparison and QC routing.
    
    Processes audio through two pipelines:
    1. Direct WAV conversion → Sarvam batch
    2. Enhanced preprocessing → Sarvam batch
    
    Compares results and routes to QC if they don't match.
    """
    try:
        # Save uploaded file
        file_path = await save_uploaded_file(file)
        
        # Process through dual pipeline
        result = await dual_pipeline_service.process_dual_pipeline(file_path)
        
        return DualPipelineResponse(**result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dual pipeline processing failed: {str(e)}")
    
    finally:
        # Clean up uploaded file
        try:
            if 'file_path' in locals():
                os.unlink(file_path)
        except:
            pass

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Tamil Transcriptor API"} 

@router.get("/qc/queue")
async def get_qc_queue():
    """Get all pending QC cases"""
    return {
        "qc_cases": qc_service.get_qc_queue(),
        "stats": qc_service.get_qc_stats()
    }

@router.post("/qc/update/{qc_case_id}")
async def update_qc_case(
    qc_case_id: str,
    qc_notes: str,
    final_decision: str,
    processed_by: str
):
    """Update a QC case with decision"""
    success = qc_service.update_qc_case(qc_case_id, qc_notes, final_decision, processed_by)
    if not success:
        raise HTTPException(status_code=404, detail=f"QC case {qc_case_id} not found")
    
    return {"message": f"QC case {qc_case_id} updated successfully"}

@router.get("/qc/stats")
async def get_qc_stats():
    """Get QC queue statistics"""
    return qc_service.get_qc_stats()

@router.post("/qc/audio_validation/{qc_case_id}")
async def perform_audio_cross_validation(qc_case_id: str):
    """
    Perform audio cross-validation for a specific QC case.
    
    This endpoint:
    1. Analyzes the audio files from both pipelines
    2. Cross-checks transcripts with audio characteristics
    3. Identifies missing words and transcription errors
    4. Creates an optimal transcript by combining the best parts
    """
    try:
        result = await qc_service.perform_audio_cross_validation(qc_case_id)
        
        if 'error' in result:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return {
            "message": "Audio cross-validation completed successfully",
            "qc_case_id": qc_case_id,
            "cross_validation": result['cross_validation'],
            "optimal_transcript": result['optimal_transcript']
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audio cross-validation failed: {str(e)}")

@router.get("/qc/case/{qc_case_id}")
async def get_qc_case(qc_case_id: str):
    """Get a specific QC case with all details"""
    qc_case = qc_service._get_qc_case(qc_case_id)
    if not qc_case:
        raise HTTPException(status_code=404, detail=f"QC case {qc_case_id} not found")
    
    return qc_case

@router.post("/qc/auto_correct/{qc_case_id}")
async def auto_correct_transcript(qc_case_id: str):
    """
    Automatically correct transcript using audio cross-validation and return optimal version.
    
    This endpoint:
    1. Performs audio cross-validation if not already done
    2. Creates an optimal transcript by merging the best parts
    3. Returns the corrected transcript
    """
    try:
        # First perform audio cross-validation if not already done
        qc_case = qc_service._get_qc_case(qc_case_id)
        if not qc_case:
            raise HTTPException(status_code=404, detail=f"QC case {qc_case_id} not found")
        
        # If audio validation not done yet, do it
        if not qc_case.get('audio_cross_validation'):
            validation_result = await qc_service.perform_audio_cross_validation(qc_case_id)
            if 'error' in validation_result:
                raise HTTPException(status_code=400, detail=validation_result['error'])
        
        # Get the optimal transcript
        optimal_transcript = qc_case.get('optimal_transcript')
        if not optimal_transcript:
            # Re-get the case after validation
            qc_case = qc_service._get_qc_case(qc_case_id)
            optimal_transcript = qc_case.get('optimal_transcript', '')
        
        return {
            "message": "Transcript auto-corrected successfully",
            "qc_case_id": qc_case_id,
            "corrected_transcript": optimal_transcript,
            "original_pipeline1": qc_case['dual_pipeline_result']['pipeline1'].get('transcript', ''),
            "original_pipeline2": qc_case['dual_pipeline_result']['pipeline2'].get('transcript', ''),
            "correction_analysis": qc_case.get('audio_cross_validation', {})
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Auto-correction failed: {str(e)}") 