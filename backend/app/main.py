from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn

from app.core.config import settings
from app.api import api_router

# Create FastAPI app
app = FastAPI(
    title="Tamil Transcriptor API",
    description="API for transcribing Tamil audio/video and translating to English",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include main API router
app.include_router(api_router)

@app.get("/")
async def root():
    return {
        "message": "Tamil Transcriptor API", 
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "transcription": "/api/v1/transcription",
            "translation": "/api/v1/translation", 
            "enhanced_transcription": "/api/v1/enhanced-transcription"
        }
    }

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    ) 