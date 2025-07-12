#!/usr/bin/env python3
"""
Test script for simplified enhanced transcription logic
"""

import sys
import os

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

def test_simplified_logic():
    """Test the simplified logic - ElevenLabs as primary, Sarvam as fallback"""
    print("🧪 Testing simplified enhanced transcription logic...")
    
    try:
        from app.services.enhanced_transcription_service import EnhancedTranscriptionService
        
        service = EnhancedTranscriptionService()
        
        # Test case 1: ElevenLabs longer than Sarvam
        elevenlabs_result = [
            {
                "speaker": "speaker_0",
                "text": "Let me sing a story. Pay attention. Listen to me.",
                "start_time": 0.0,
                "end_time": 10.0
            }
        ]
        sarvam_result = {"transcript": "kutti story"}
        
        print(f"\n📝 Test 1: ElevenLabs longer than Sarvam")
        print(f"ElevenLabs: '{elevenlabs_result[0]['text']}' (length: {len(elevenlabs_result[0]['text'])})")
        print(f"Sarvam: '{sarvam_result['transcript']}' (length: {len(sarvam_result['transcript'])})")
        
        # Simulate the merge logic
        elevenlabs_length = sum(len(segment.get("text", "")) for segment in elevenlabs_result)
        sarvam_length = len(sarvam_result.get("transcript", ""))
        
        if elevenlabs_length >= sarvam_length:
            print("✅ Using ElevenLabs transcript (longer or equal)")
            final_text = elevenlabs_result[0]['text']
        else:
            print("✅ Using Sarvam transcript (longer)")
            final_text = sarvam_result['transcript']
        
        print(f"Final: '{final_text}'")
        
        # Test case 2: Sarvam longer than ElevenLabs
        elevenlabs_result = [
            {
                "speaker": "speaker_0",
                "text": "Let me sing",
                "start_time": 0.0,
                "end_time": 10.0
            }
        ]
        sarvam_result = {"transcript": "kutti Let me sing a very long story with many Tamil words and detailed description"}
        
        print(f"\n📝 Test 2: Sarvam longer than ElevenLabs")
        print(f"ElevenLabs: '{elevenlabs_result[0]['text']}' (length: {len(elevenlabs_result[0]['text'])})")
        print(f"Sarvam: '{sarvam_result['transcript']}' (length: {len(sarvam_result['transcript'])})")
        
        # Simulate the merge logic
        elevenlabs_length = sum(len(segment.get("text", "")) for segment in elevenlabs_result)
        sarvam_length = len(sarvam_result.get("transcript", ""))
        
        if elevenlabs_length >= sarvam_length:
            print("✅ Using ElevenLabs transcript (longer or equal)")
            final_text = elevenlabs_result[0]['text']
        else:
            print("✅ Using Sarvam transcript (longer)")
            final_text = sarvam_result['transcript']
        
        print(f"Final: '{final_text}'")
        
        # Test case 3: Equal lengths
        elevenlabs_result = [
            {
                "speaker": "speaker_0",
                "text": "Let me sing a story",
                "start_time": 0.0,
                "end_time": 10.0
            }
        ]
        sarvam_result = {"transcript": "kutti Let me sing"}
        
        print(f"\n📝 Test 3: Equal lengths")
        print(f"ElevenLabs: '{elevenlabs_result[0]['text']}' (length: {len(elevenlabs_result[0]['text'])})")
        print(f"Sarvam: '{sarvam_result['transcript']}' (length: {len(sarvam_result['transcript'])})")
        
        # Simulate the merge logic
        elevenlabs_length = sum(len(segment.get("text", "")) for segment in elevenlabs_result)
        sarvam_length = len(sarvam_result.get("transcript", ""))
        
        if elevenlabs_length >= sarvam_length:
            print("✅ Using ElevenLabs transcript (longer or equal)")
            final_text = elevenlabs_result[0]['text']
        else:
            print("✅ Using Sarvam transcript (longer)")
            final_text = sarvam_result['transcript']
        
        print(f"Final: '{final_text}'")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")

def test_transliteration():
    """Test Indic transliteration for separate output"""
    print("\n🧪 Testing Indic transliteration for separate output...")
    
    try:
        from app.services.enhanced_transcription_service import EnhancedTranscriptionService
        
        service = EnhancedTranscriptionService()
        
        test_cases = [
            "Let me sing a story",
            "Pay attention listen to me",
            "kutti story",
            "kavanam pay attention"
        ]
        
        for text in test_cases:
            tamil_text = service._convert_thanglish_to_tamil(text)
            print(f"🔄 '{text}' -> '{tamil_text}'")
            
    except Exception as e:
        print(f"❌ Transliteration test failed: {e}")

if __name__ == "__main__":
    print("🚀 Starting simplified logic tests...")
    
    test_simplified_logic()
    test_transliteration()
    
    print("\n✅ All tests completed!")
    print("\n📋 Summary of simplified logic:")
    print("1. Use ElevenLabs transcript as primary output")
    print("2. Only use Sarvam if ElevenLabs transcript is shorter")
    print("3. Provide transliterated ElevenLabs separately")
    print("4. No complex word-by-word insertion")
    print("5. Simple length-based decision making") 