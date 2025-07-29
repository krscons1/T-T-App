from fastapi import APIRouter
from .routes import transcription_router, translation_router, enhanced_transcription_router, diff_router

# Create main API router
api_router = APIRouter()

# Include all route modules
api_router.include_router(transcription_router)
api_router.include_router(translation_router)
api_router.include_router(enhanced_transcription_router)
api_router.include_router(diff_router)