from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
import os
import tempfile
from typing import Dict
from app.services.enhanced_transcription_service import enhanced_transcription_service
from app.schemas.dual_pipeline import EnhancedTranscriptionResponse

router = APIRouter(prefix="/api/v1/enhanced-transcription", tags=["Enhanced Transcription"])


@router.post("/process", response_model=EnhancedTranscriptionResponse)
async def process_enhanced_transcription(
    file: UploadFile = File(...),
    export_srt: bool = False
):
    """
    Process audio through enhanced transcription pipeline:
    - ElevenLabs for speaker diarization (uses original file - supports MP3, WAV, etc.)
    - Sarvam API for Tamil accuracy (uses prepared WAV)
    - Dynamic Tamil phrase detection with improved matching
    - Whisper disabled for faster processing
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    temp_file_path = None
    try:
        # Create a temporary file to store the upload
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as temp_file:
            content = await file.read()
            file_size = len(content)
            if file_size > 1024 * 1024 * 1024:  # 1024MB
                raise HTTPException(status_code=400, detail="File too large. Maximum size is 1024MB")
            
            temp_file.write(content)
            temp_file_path = temp_file.name

        print(f"📁 Processing file: {file.filename} ({file_size} bytes)")
        print(f"📁 File format: {os.path.splitext(file.filename)[1]}")
        
        # Process through enhanced transcription pipeline
        result = await enhanced_transcription_service.process_enhanced_transcription(temp_file_path)
        
        if not result["success"]:
            raise HTTPException(status_code=500, detail=f"Processing failed: {result.get('error', 'Unknown error')}")

        # Store in Supabase DB
        await enhanced_transcription_service.store_transcription_in_db({
            "filename": file.filename,
            "final_transcript": result["final_transcript"],
            "elevenlabs_transcript": result["elevenlabs_transcript"],
            "transliterated_elevenlabs": result["transliterated_elevenlabs"],
            "sarvam_transcript": result["sarvam_transcript"],
            "sarvam_diarized_transcript": result["sarvam_diarized_transcript"],
            "processing_info": result["processing_info"]
        })
        
        # Export to SRT if requested
        if export_srt and result["final_transcript"]:
            srt_path = os.path.join(tempfile.gettempdir(), f"{os.path.splitext(file.filename)[0]}_enhanced.srt")
            enhanced_transcription_service.export_to_srt(result["final_transcript"], srt_path)
            result["srt_file_path"] = srt_path
        
        return result

    except Exception as e:
        print(f"❌ Enhanced transcription API error: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        # Ensure the temporary file is always removed
        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)


@router.get("/status")
async def get_enhanced_transcription_status() -> Dict:
    """
    Get status of enhanced transcription service
    """
    return {
        "status": "operational",
        "service": "Enhanced Transcription Pipeline",
        "components": {
            "elevenlabs": "Available",
            "sarvam_api": "Available",
            "ffmpeg": "Available",
            "whisper_cpp": "Disabled"
        },
        "features": [
            "Speaker diarization (ElevenLabs)",
            "Tamil word accuracy from Sarvam API",
            "Dynamic Tamil phrase detection with improved matching",
            "Automatic language detection",
            "SRT export capability",
            "Fast processing (Whisper disabled)"
        ],
        "pipeline": {
            "step1": "ElevenLabs - Speaker diarization using original file",
            "step2": "Sarvam API - Tamil accuracy using prepared WAV",
            "step3": "Merge with dynamic Tamil phrase detection",
            "step4": "Output enhanced transcript"
        }
    } 