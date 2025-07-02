import ffmpeg
import os
import tempfile
from pathlib import Path
from typing import Tuple

class AudioService:
    @staticmethod
    async def extract_audio_from_video(video_path: str) -> str:
        """
        Extract audio from video file using FFmpeg
        """
        # Create temporary audio file
        temp_dir = tempfile.gettempdir()
        audio_filename = f"extracted_audio_{os.getpid()}.wav"
        audio_path = os.path.join(temp_dir, audio_filename)
        
        try:
            # Extract audio using ffmpeg-python
            (
                ffmpeg
                .input(video_path)
                .output(audio_path, acodec='pcm_s16le', ac=1, ar='16000')
                .overwrite_output()
                .run(quiet=True)
            )
            return audio_path
        except ffmpeg.Error as e:
            raise Exception(f"Error extracting audio: {str(e)}")
    
    @staticmethod
    def is_video_file(filename: str) -> bool:
        """
        Check if file is a video file
        """
        video_extensions = {'.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv'}
        return Path(filename).suffix.lower() in video_extensions
    
    @staticmethod
    def is_audio_file(filename: str) -> bool:
        """
        Check if file is an audio file
        """
        audio_extensions = {'.mp3', '.wav', '.aac', '.ogg', '.m4a'}
        return Path(filename).suffix.lower() in audio_extensions
    
    @staticmethod
    async def validate_and_prepare_audio(file_path: str) -> Tuple[str, str]:
        """
        Validate file and prepare audio for transcription
        Returns: (audio_path, file_type)
        """
        filename = os.path.basename(file_path)
        
        if AudioService.is_audio_file(filename):
            return file_path, "audio"
        elif AudioService.is_video_file(filename):
            audio_path = await AudioService.extract_audio_from_video(file_path)
            return audio_path, "video"
        else:
            raise ValueError("Unsupported file format")

audio_service = AudioService() 