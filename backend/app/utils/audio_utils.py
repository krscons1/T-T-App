# Audio processing utilities 
import os
import numpy as np
import librosa
import soundfile as sf
from scipy.signal import butter, lfilter
from pydub import AudioSegment
from pydub.silence import detect_nonsilent

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