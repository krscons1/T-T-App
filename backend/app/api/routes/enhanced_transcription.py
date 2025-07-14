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
    try:
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")
        
        # Check file size (limit to 100MB)
        file_size = 0
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1])
        
        try:
            content = await file.read()
            file_size = len(content)
            if file_size > 100 * 1024 * 1024:  # 100MB
                raise HTTPException(status_code=400, detail="File too large. Maximum size is 100MB")
            
            temp_file.write(content)
            temp_file.close()
            
            print(f"📁 Processing file: {file.filename} ({file_size} bytes)")
            print(f"📁 File format: {os.path.splitext(file.filename)[1]}")
            
            # Process through enhanced transcription pipeline
            result = await enhanced_transcription_service.process_enhanced_transcription(temp_file.name)
            
            if not result["success"]:
                raise HTTPException(status_code=500, detail=f"Processing failed: {result.get('error', 'Unknown error')}")
            
            # Export to SRT if requested
            if export_srt and result["final_transcript"]:
                srt_path = os.path.join(tempfile.gettempdir(), f"{os.path.splitext(file.filename)[0]}_enhanced.srt")
                enhanced_transcription_service.export_to_srt(result["final_transcript"], srt_path)
                result["srt_file_path"] = srt_path
            
            # Clean up temporary file
            os.unlink(temp_file.name)
            
            return result
            
        except Exception as e:
            # Clean up on error
            if os.path.exists(temp_file.name):
                os.unlink(temp_file.name)
            raise e
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Enhanced transcription API error: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


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