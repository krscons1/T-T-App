import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Sarvam AI Configuration
    SARVAM_API_KEY: str = os.getenv("SARVAM_API_KEY", "")
    SARVAM_BASE_URL: str = "https://api.sarvam.ai"
    
    # Alternative Translation APIs
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GOOGLE_TRANSLATE_KEY: str = os.getenv("GOOGLE_TRANSLATE_KEY", "")
    
    # File Upload Settings
    MAX_FILE_SIZE: int = 100 * 1024 * 1024  # 100MB
    UPLOAD_DIR: str = "uploads"
    ALLOWED_EXTENSIONS: list = [".mp3", ".wav", ".mp4", ".avi", ".mov", ".mkv"]
    
    # CORS Settings
    ALLOWED_ORIGINS: list = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    class Config:
        env_file = ".env"

settings = Settings() 