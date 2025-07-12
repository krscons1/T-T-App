#!/usr/bin/env python3
"""
Test script to debug ElevenLabs API response
"""

import sys
import os

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

def test_elevenlabs_api():
    """Test ElevenLabs API directly"""
    print("🧪 Testing ElevenLabs API directly...")
    
    try:
        from app.services.elevenlabs_service import ElevenLabsService
        
        service = ElevenLabsService()
        
        # Check if API key is available
        if not service.available:
            print("❌ ElevenLabs API key not set")
            print("Please set ELEVENLABS_API_KEY in your environment")
            return
        
        print(f"✅ ElevenLabs API key available: {service.api_key[:10]}...")
        
        # Test with a small audio file if available
        test_audio_path = "test_audio.mp3"  # You'll need to provide this
        if os.path.exists(test_audio_path):
            print(f"📁 Testing with audio file: {test_audio_path}")
            # This would call the actual API
            # result = await service.transcribe_with_speaker_diarization(test_audio_path)
            # print(f"Result: {result}")
        else:
            print("⚠️ No test audio file found. Create test_audio.mp3 to test API.")
        
    except Exception as e:
        print(f"❌ ElevenLabs test failed: {e}")

def test_mock_response():
    """Test parsing with mock response"""
    print("\n🧪 Testing with mock ElevenLabs response...")
    
    try:
        from app.services.elevenlabs_service import ElevenLabsService
        
        service = ElevenLabsService()
        
        # Mock response that might be causing the issue
        mock_response = {
            "words": [
                {
                    "text": "Speaker",
                    "speaker_id": "0",
                    "start": 0.0,
                    "end": 0.5
                },
                {
                    "text": "1:",
                    "speaker_id": "0", 
                    "start": 0.5,
                    "end": 1.0
                },
                {
                    "text": "In",
                    "speaker_id": "0",
                    "start": 1.0,
                    "end": 1.5
                },
                {
                    "text": "Tamil.",
                    "speaker_id": "0",
                    "start": 1.5,
                    "end": 2.0
                }
            ]
        }
        
        print(f"🔍 Mock response: {mock_response}")
        result = service._parse_transcription_result(mock_response)
        print(f"🔍 Parsed result: {result}")
        
    except Exception as e:
        print(f"❌ Mock test failed: {e}")

def test_language_detection():
    """Test different language settings"""
    print("\n🧪 Testing different language settings...")
    
    try:
        from app.services.elevenlabs_service import ElevenLabsService
        
        service = ElevenLabsService()
        
        # Test different language codes
        language_codes = ['en', 'ta', 'auto']
        
        for lang in language_codes:
            print(f"🔍 Testing language code: {lang}")
            # This would be used in the API call
            data = {
                'model_id': 'scribe_v1',
                'language_code': lang,
                'tag_audio_events': 'true',
                'diarize': 'true',
                'num_speakers': '2',
                'timestamps_granularity': 'word'
            }
            print(f"🔍 Data: {data}")
        
    except Exception as e:
        print(f"❌ Language test failed: {e}")

if __name__ == "__main__":
    print("🚀 Starting ElevenLabs API debug tests...")
    
    test_elevenlabs_api()
    test_mock_response()
    test_language_detection()
    
    print("\n✅ All tests completed!")
    print("\n📋 Debugging steps:")
    print("1. Check if ELEVENLABS_API_KEY is set")
    print("2. Check if the API key is valid")
    print("3. Check if the audio file is properly formatted")
    print("4. Check if the language detection is working")
    print("5. Check the raw API response format") 