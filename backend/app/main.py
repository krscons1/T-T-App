from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn

from app.core.config import settings
from app.api.routes import transcription, translation

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

# Include routers
app.include_router(
    transcription.router, 
    prefix="/api/v1/transcription", 
    tags=["transcription"]
)

app.include_router(
    translation.router,
    prefix="/api/v1/translation",
    tags=["translation"]
)

@app.get("/")
async def root():
    return {
        "message": "Tamil Transcriptor API", 
        "version": "1.0.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    ) 