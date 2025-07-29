from .transcription import router as transcription_router
from .translation import router as translation_router
from .enhanced_transcription import router as enhanced_transcription_router
from .diff import router as diff_router

__all__ = [
    "transcription_router",
    "translation_router", 
    "enhanced_transcription_router",
    "diff_router"
]