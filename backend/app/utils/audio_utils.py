# Audio processing utilities 
import os
import numpy as np
import librosa
import soundfile as sf
from scipy.signal import butter, lfilter
from pydub import AudioSegment
from pydub.silence import detect_nonsilent
import resampy
import noisereduce as nr
import torchaudio
from app.core.config import settings
import subprocess
from pyannote.audio import Pipeline

SAMPLE_RATE = 16000
VAD_MODE     = 2               # 0-3
EMB_WINDOW   = 'whole'

# load once per worker

# Initialize speechbrain embedder with error handling - make it optional
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

# Initialize pyannote models with error handling - make it optional
pn_model = None
pn_infer = None
try:
    from pyannote.audio import Model, Inference
    if settings.HUGGINGFACE_AUTH_TOKEN:
        print(f"🔑 Attempting to load pyannote model with token: {settings.HUGGINGFACE_AUTH_TOKEN[:10]}...")
        pn_model = Model.from_pretrained("pyannote/embedding", 
                                        use_auth_token=settings.HUGGINGFACE_AUTH_TOKEN)
        pn_infer = Inference(pn_model, window=EMB_WINDOW)
        print("✅ Successfully loaded pyannote embedding model with authentication")
    else:
        print("⚠️  HUGGINGFACE_AUTH_TOKEN not set. Pyannote model will not be available.")
except ImportError:
    print("⚠️  pyannote.audio not installed. Pyannote model will not be available.")
    print("💡 To install pyannote.audio, you may need to:")
    print("   1. Install Visual Studio Build Tools")
    print("   2. Install CMake")
    print("   3. Run: pip install pyannote.audio")
except Exception as e:
    print(f"❌ Error loading pyannote embedding model: {e}")
    print("💡 You may need to:")
    print("   1. Visit https://hf.co/pyannote/embedding to accept the user conditions")
    print("   2. Check if your token has the right permissions")
    print("   3. Try logging in with: huggingface-cli login")
    print("Speaker embedding extraction will be disabled.")

def resample_audio(file_path, target_sr=16000):
    y, sr = librosa.load(file_path, sr=None)
    print(f"[resample_audio] Original duration: {len(y)/sr:.2f}s, Sample rate: {sr}")
    y_resampled = librosa.resample(y, orig_sr=sr, target_sr=target_sr)
    print(f"[resample_audio] Resampled duration: {len(y_resampled)/target_sr:.2f}s, Sample rate: {target_sr}")
    return y_resampled, target_sr

def normalize_amplitude(audio):
    rms = np.sqrt(np.mean(audio ** 2))
    normalized_audio = audio / (rms + 1e-6)
    result = normalized_audio * 0.1
    print(f"[normalize_amplitude] Duration: {len(result)/16000:.2f}s")
    return result  # Keep it within [-1, 1]

def trim_silence(audio, sr, top_db=40):
    trimmed_audio, _ = librosa.effects.trim(audio, top_db=top_db)
    print(f"[trim_silence] Duration after trim: {len(trimmed_audio)/sr:.2f}s")
    return trimmed_audio

def remove_quiet_sections(audio, sr, db_threshold=40):
    temp_file = "temp.wav"
    sf.write(temp_file, audio, sr)
    segment = AudioSegment.from_wav(temp_file)
    nonsilent_ranges = detect_nonsilent(segment, min_silence_len=200, silence_thresh=-db_threshold)
    cleaned = AudioSegment.empty()
    for start, end in nonsilent_ranges:
        cleaned += segment[start:end]
    cleaned.export(temp_file, format="wav")
    y, _ = librosa.load(temp_file, sr=sr)
    os.remove(temp_file)
    print(f"[remove_quiet_sections] Duration after remove: {len(y)/sr:.2f}s")
    return y

def high_pass_filter(audio, sr, cutoff=85):
    nyquist = 0.5 * sr
    norm_cutoff = cutoff / nyquist
    b, a = butter(1, norm_cutoff, btype='high', analog=False)
    result = lfilter(b, a, audio)
    print(f"[high_pass_filter] Duration: {len(result)/sr:.2f}s")
    return result

def convert_to_wav(input_path):
    """Convert any audio file to WAV format and return the new path."""
    wav_path = os.path.splitext(input_path)[0] + "_converted.wav"
    try:
        audio = AudioSegment.from_file(input_path)
        audio = audio.set_channels(1)  # force mono for compatibility
        audio.export(wav_path, format="wav")
        print(f"[convert_to_wav] Converted {input_path} to {wav_path}")
        return wav_path
    except Exception as e:
        print(f"[convert_to_wav] Error converting {input_path} to WAV: {e}")
        return input_path

def preprocess_audio(file_path):
    if not os.path.exists(file_path):
        print(f"[preprocess_audio] File does not exist: {file_path}")
        raise FileNotFoundError(f"File does not exist: {file_path}")
    try:
        wav_path = convert_to_wav(file_path)
        if not os.path.exists(wav_path):
            print(f"[preprocess_audio] WAV conversion failed: {wav_path}")
            raise FileNotFoundError(f"WAV conversion failed: {wav_path}")
        # Skip all further processing, just return the WAV path
        print(f"[preprocess_audio] Only WAV conversion applied. Output: {wav_path}")
        return wav_path
    except Exception as e:
        print(f"[preprocess_audio] Error: {e}. Returning original file path.")
        return file_path 

def to_mono_wav(path:str)->str:
    if path.lower().endswith(".wav") and torchaudio.info(path).num_channels==1:
        return path
    y, sr = torchaudio.load(path)
    y = y.mean(0)              # force mono
    y = resampy.resample(y.numpy(), sr, SAMPLE_RATE)
    wav_path = os.path.splitext(path)[0] + "_mono.wav"
    sf.write(wav_path, y, SAMPLE_RATE)
    return wav_path

def reduce_noise(wav_path:str)->str:
    y, sr = librosa.load(wav_path, sr=SAMPLE_RATE)
    reduced = nr.reduce_noise(y=y, sr=sr, stationary=True)
    out = wav_path.replace("_mono.wav", "_clean.wav")
    sf.write(out, reduced, sr)
    return out

def extract_embedding(wav_path:str)->np.ndarray:
    if sb_embedder is None:
        print("⚠️  speechbrain embedder not available. Returning dummy embedding.")
        # Return a dummy embedding of appropriate size (192 for speechbrain)
        return np.zeros(192)
    
    try:
        emb = sb_embedder.encode_batch(torchaudio.load(wav_path)[0]).squeeze().numpy()
        return emb 
    except Exception as e:
        print(f"❌ Error extracting embedding: {e}")
        # Return a dummy embedding as fallback
        return np.zeros(192) 

def transcribe_with_whisper_cpp(audio_path, model_path, binary_path, language="ta"):
    """
    Transcribe audio using whisper.cpp (whisper-server.exe) via subprocess.
    Returns the transcript as a string.
    Raises RuntimeError if the binary is missing or the subprocess fails.
    """
    import os
    import subprocess
    abs_binary_path = os.path.abspath(binary_path)
    try:
        result = subprocess.run(
            [abs_binary_path, "-m", model_path, "-f", audio_path, "--language", language],
            capture_output=True, text=True, check=True
        )
        return result.stdout
    except FileNotFoundError:
        raise RuntimeError(f"whisper.cpp binary not found at: {abs_binary_path}")
    except subprocess.CalledProcessError as e:
        # Raise with stderr so the error message is visible
        raise RuntimeError(f"whisper.cpp failed: {e.stderr.strip()}")
    except Exception as e:
        raise RuntimeError(f"whisper.cpp failed: {e}")

def vad_trim_pyannote(wav_path, token):
    """
    Trim audio using pyannote.audio VAD pipeline. Returns path to trimmed 16kHz audio.
    """
    pipeline = Pipeline.from_pretrained("pyannote/voice-activity-detection", use_auth_token=token)
    vad_result = pipeline(wav_path)
    speech_segments = [(segment.start, segment.end) for segment in vad_result.get_timeline()]
    if not speech_segments:
        print("⚠️  No speech detected by pyannote VAD. Returning original file.")
        return wav_path
    audio, sr = sf.read(wav_path)
    speech_audio = np.concatenate([
        audio[int(start * sr):int(end * sr)] for start, end in speech_segments
    ])
    # Resample to 16kHz if needed
    if sr != 16000:
        import librosa
        speech_audio = librosa.resample(speech_audio, orig_sr=sr, target_sr=16000)
        sr = 16000
    out_path = wav_path.replace(".wav", "_speech.wav")
    sf.write(out_path, speech_audio, sr, subtype='PCM_16')
    print(f"[vad_trim_pyannote] Trimmed with pyannote VAD: {out_path}")
    return out_path 