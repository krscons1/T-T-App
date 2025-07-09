import ffmpeg
import os
import tempfile
from pathlib import Path
from typing import Tuple
from app.utils.audio_utils import preprocess_audio, to_mono_wav, reduce_noise, extract_embedding, vad_trim_pyannote
from app.core.config import settings

sb_embedder = None
try:
    from speechbrain.pretrained import EncoderClassifier
    sb_embedder = EncoderClassifier.from_hparams(
        source='speechbrain/spkrec-ecapa-voxceleb',
        run_opts={'device': 'cpu'})
    print("✅ Successfully loaded speechbrain embedder")
except ImportError:
    print("⚠️  speechbrain not installed. Speaker embedding will be disabled.")
    print("💡 To install speechbrain, you may need to:")
    print("   1. Install Visual Studio Build Tools")
    print("   2. Install CMake")
    print("   3. Run: pip install speechbrain")
except Exception as e:
    print(f"❌ Error loading speechbrain embedder: {e}")
    print("Speaker embedding extraction will be disabled.")

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
    async def validate_and_prepare_audio(file_path: str):
        try:
            wav = to_mono_wav(file_path)
            clean = reduce_noise(wav)
            # VAD trim with pyannote.audio (16kHz)
            speech = vad_trim_pyannote(clean, token=settings.HUGGINGFACE_AUTH_TOKEN)
            embedding = extract_embedding(speech)
            return speech, embedding, "audio"
        except Exception as e:
            print(f"Warning: Enhanced audio processing failed: {e}")
            print("Falling back to basic audio processing...")
            # Fallback to basic processing
            processed_path = preprocess_audio(file_path)
            return processed_path, None, "audio"

audio_service = AudioService() 