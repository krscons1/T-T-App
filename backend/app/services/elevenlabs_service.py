import os
import tempfile
import time
import sys
from typing import Dict, List
import aiofiles
import asyncio
import httpx
from app.core.config import settings


class ElevenLabsService:
    """
    ElevenLabs API service for speaker diarization and transcription using REST API
    Supports multiple audio formats including MP3, WAV, M4A, etc.
    """
    
    def __init__(self):
        self.api_key = settings.ELEVENLABS_API_KEY
        self.base_url = "https://api.elevenlabs.io/v1"
        self.available = bool(self.api_key)
        
        if not self.available:
            print("⚠️ ElevenLabs API key not set")
    
    async def transcribe_with_speaker_diarization(self, audio_file_path: str) -> List[Dict]:
        try:
            if not self.available:
                return self._get_mock_transcript()

            print("🎤 Calling ElevenLabs REST API...")
            
            # Get file extension to determine MIME type
            file_extension = os.path.splitext(audio_file_path)[1].lower()
            mime_type = self._get_mime_type(file_extension)
            
            print(f"📁 Processing file: {audio_file_path} (format: {file_extension})")
            
            # Prepare the multipart form data
            async with aiofiles.open(audio_file_path, 'rb') as f:
                audio_data = await f.read()
            
            # Use original filename with proper MIME type
            original_filename = os.path.basename(audio_file_path)
            
            files = {
                'file': (original_filename, audio_data, mime_type)
            }
            
            # Try different configurations for better Tamil support
            configs_to_try = [
                {
                    'model_id': 'scribe_v1',
                    'language_code': 'ta',  # Tamil
                    'tag_audio_events': 'true',
                    'diarize': 'true',
                    'num_speakers': '2',
                    'timestamps_granularity': 'word'
                },
                {
                    'model_id': 'scribe_v1',
                    'language_code': 'auto',  # Auto-detect
                    'tag_audio_events': 'true',
                    'diarize': 'true',
                    'num_speakers': '2',
                    'timestamps_granularity': 'word'
                },
                {
                    'model_id': 'scribe_v1',
                    'language_code': 'en',  # English (fallback)
                    'tag_audio_events': 'true',
                    'diarize': 'true',
                    'num_speakers': '2',
                    'timestamps_granularity': 'word'
                }
            ]
            
            headers = {
                'xi-api-key': self.api_key
            }
            
            print(f"🎤 Sending {len(audio_data)} bytes to ElevenLabs API...")
            
            async with httpx.AsyncClient() as client:
                for i, config in enumerate(configs_to_try):
                    print(f"🎤 Trying configuration {i+1}: {config}")
                    
                    response = await client.post(
                        f"{self.base_url}/speech-to-text",
                        headers=headers,
                        files=files,
                        data=config,
                        timeout=300.0
                    )
                    
                    print(f"🎤 ElevenLabs API response: {response.status_code}")
                    
                    if response.status_code == 200:
                        result = response.json()
                        print(f"✅ ElevenLabs transcription successful with config {i+1}")
                        print(f"🔍 Raw ElevenLabs response: {result}")
                        
                        parsed_result = self._parse_transcription_result(result)
                        
                        # Check if the result contains actual speech content
                        if self._has_meaningful_content(parsed_result):
                            print(f"✅ Found meaningful content with config {i+1}")
                            return parsed_result
                        else:
                            print(f"⚠️ Config {i+1} returned no meaningful content, trying next...")
                    else:
                        print(f"❌ ElevenLabs API error with config {i+1}: {response.status_code} - {response.text}")
                
                # If all configs failed, return empty result instead of mock
                print("❌ All ElevenLabs configurations failed")
                return []
                    
        except Exception as e:
            print(f"❌ ElevenLabs failed: {e}")
            return []

    def _get_mime_type(self, file_extension: str) -> str:
        """Get MIME type based on file extension"""
        mime_types = {
            '.mp3': 'audio/mpeg',
            '.wav': 'audio/wav',
            '.m4a': 'audio/mp4',
            '.aac': 'audio/aac',
            '.ogg': 'audio/ogg',
            '.flac': 'audio/flac',
            '.webm': 'audio/webm',
            '.mp4': 'video/mp4',
            '.avi': 'video/x-msvideo',
            '.mov': 'video/quicktime'
        }
        
        return mime_types.get(file_extension, 'audio/mpeg')

    def _parse_transcription_result(self, transcription) -> List[Dict]:
        segments = []
        
        print(f"🔍 Parsing ElevenLabs result: {transcription}")
        
        # Handle the REST API response format
        if 'words' in transcription:
            # Group words by speaker
            current_speaker = None
            current_segment = None
            
            for word in transcription['words']:
                speaker = word.get('speaker_id', 'Unknown')
                text = word.get('text', '')
                start_time = word.get('start', 0.0)
                end_time = word.get('end', 0.0)
                
                print(f"🔍 Word: '{text}' by speaker {speaker} at {start_time}-{end_time}")
                
                # Start new segment if speaker changes
                if speaker != current_speaker:
                    if current_segment:
                        segments.append(current_segment)
                    
                    current_speaker = speaker
                    current_segment = {
                        'speaker': f"speaker_{speaker}",
                        'text': text,
                        'start_time': start_time,
                        'end_time': end_time
                    }
                else:
                    # Continue current segment
                    if current_segment:
                        current_segment['text'] += ' ' + text
                        current_segment['end_time'] = end_time
            
            # Add the last segment
            if current_segment:
                segments.append(current_segment)
        
        # Handle alternative response format with segments
        elif 'segments' in transcription:
            for segment in transcription['segments']:
                segments.append({
                    'speaker': f"speaker_{segment.get('speaker_id', '0')}",
                    'text': segment.get('text', ''),
                    'start_time': segment.get('start', 0.0),
                    'end_time': segment.get('end', 0.0)
                })
        
        # Handle simple text response
        elif 'text' in transcription:
            segments.append({
                'speaker': 'speaker_0',
                'text': transcription['text'],
                'start_time': 0.0,
                'end_time': 0.0
            })
        
        print(f"🔍 Parsed {len(segments)} segments")
        for i, segment in enumerate(segments):
            print(f"🔍 Segment {i}: {segment}")
        
        return segments

    def _get_mock_transcript(self) -> List[Dict]:
        return [
            {"speaker": "Speaker 1", "text": "Mock line 1", "start_time": 0.0, "end_time": 2.0},
            {"speaker": "Speaker 2", "text": "Mock line 2", "start_time": 2.0, "end_time": 4.0}
        ]

    def _has_meaningful_content(self, segments: List[Dict]) -> bool:
        """Check if the transcription contains meaningful content (not just language detection)"""
        meaningful_keywords = [
            'speaker', 'in tamil', '(in tamil)', 'language', 'tamil'
        ]
        
        for segment in segments:
            text = segment.get('text', '').lower()
            
            # If text contains only language detection keywords, it's not meaningful
            if any(keyword in text for keyword in meaningful_keywords):
                if len(text.split()) <= 3:  # Very short text with language keywords
                    continue
            
            # If we find any text that's not just language detection, it's meaningful
            if text and len(text.split()) > 3:
                return True
        
        return False

# Create instance
elevenlabs_service = ElevenLabsService()