from fastapi import APIRouter
from .routes import (
    transcription_router, 
    translation_router, 
    enhanced_transcription_router,
    accuracy_assessment_router
)

# Create main API router
api_router = APIRouter()

# Include all route modules
api_router.include_router(transcription_router)
api_router.include_router(translation_router)
api_router.include_router(enhanced_transcription_router)
api_router.include_router(accuracy_assessment_router, prefix="/api/v1/accuracy", tags=["accuracy-assessment"])