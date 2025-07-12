#!/usr/bin/env python3
"""
Test script for fixed Sarvam text distribution
"""

import sys
import os

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

def test_sarvam_distribution():
    """Test the Sarvam text distribution logic"""
    print("🧪 Testing Sarvam text distribution...")
    
    try:
        from app.services.enhanced_transcription_service import EnhancedTranscriptionService
        
        service = EnhancedTranscriptionService()
        
        # Test case 1: Sarvam text with newlines
        elevenlabs_segments = [
            {
                "speaker": "speaker_0",
                "text": "Let me sing a story",
                "start_time": 0.0,
                "end_time": 10.0
            },
            {
                "speaker": "speaker_1", 
                "text": "Pay attention",
                "start_time": 10.0,
                "end_time": 20.0
            },
            {
                "speaker": "speaker_0",
                "text": "Listen to me",
                "start_time": 20.0,
                "end_time": 30.0
            }
        ]
        
        sarvam_text = """குழந்தை Let me sing a story.
கவனம் Pay attention.
கேள்வி Listen to me."""
        
        print(f"\n📝 Test 1: Sarvam text with newlines")
        print(f"ElevenLabs segments: {len(elevenlabs_segments)}")
        print(f"Sarvam text: '{sarvam_text}'")
        
        result = service._distribute_sarvam_text(elevenlabs_segments, sarvam_text)
        
        print(f"🔍 Distribution result:")
        for i, segment in enumerate(result):
            print(f"  Segment {i}: {segment['speaker']} - '{segment['text'][:50]}...'")
        
        # Test case 2: Sarvam text with sentences
        sarvam_text = "குழந்தை Let me sing a story. கவனம் Pay attention. கேள்வி Listen to me."
        
        print(f"\n📝 Test 2: Sarvam text with sentences")
        print(f"Sarvam text: '{sarvam_text}'")
        
        result = service._distribute_sarvam_text(elevenlabs_segments, sarvam_text)
        
        print(f"🔍 Distribution result:")
        for i, segment in enumerate(result):
            print(f"  Segment {i}: {segment['speaker']} - '{segment['text'][:50]}...'")
        
        # Test case 3: Long Sarvam text
        sarvam_text = "மக்களால் சேர்ந்தப்பட்ட அரசுக்கு அதிகாரம் இல்ல. இங்க அதிகாரப்படிதான் நடக்குது. அதிகார சண்டையும் பதவி நலனுக்காகவும் போட்டி போட்டுக்கொண்டு இன்று அரசு செய்யும் நிலைமைதான் இந்த புலிச்சர்ல இருக்குது."
        
        print(f"\n📝 Test 3: Long Sarvam text")
        print(f"Sarvam text: '{sarvam_text[:50]}...'")
        
        result = service._distribute_sarvam_text(elevenlabs_segments, sarvam_text)
        
        print(f"🔍 Distribution result:")
        for i, segment in enumerate(result):
            print(f"  Segment {i}: {segment['speaker']} - '{segment['text'][:50]}...'")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")

def test_text_splitting():
    """Test the text splitting logic"""
    print("\n🧪 Testing text splitting logic...")
    
    try:
        from app.services.enhanced_transcription_service import EnhancedTranscriptionService
        
        service = EnhancedTranscriptionService()
        
        # Test case 1: Text with newlines
        text = """குழந்தை Let me sing a story.
கவனம் Pay attention.
கேள்வி Listen to me."""
        
        print(f"\n📝 Test 1: Text with newlines")
        print(f"Input: '{text}'")
        result = service._split_sarvam_text(text)
        print(f"Split into {len(result)} parts:")
        for i, part in enumerate(result):
            print(f"  Part {i}: '{part}'")
        
        # Test case 2: Text with sentences
        text = "குழந்தை Let me sing a story. கவனம் Pay attention. கேள்வி Listen to me."
        
        print(f"\n📝 Test 2: Text with sentences")
        print(f"Input: '{text}'")
        result = service._split_sarvam_text(text)
        print(f"Split into {len(result)} parts:")
        for i, part in enumerate(result):
            print(f"  Part {i}: '{part}'")
        
        # Test case 3: Long text without clear breaks
        text = "மக்களால் சேர்ந்தப்பட்ட அரசுக்கு அதிகாரம் இல்ல இங்க அதிகாரப்படிதான் நடக்குது அதிகார சண்டையும் பதவி நலனுக்காகவும் போட்டி போட்டுக்கொண்டு இன்று அரசு செய்யும் நிலைமைதான் இந்த புலிச்சர்ல இருக்குது"
        
        print(f"\n📝 Test 3: Long text without clear breaks")
        print(f"Input: '{text[:50]}...'")
        result = service._split_sarvam_text(text)
        print(f"Split into {len(result)} parts:")
        for i, part in enumerate(result):
            print(f"  Part {i}: '{part[:50]}...'")
        
    except Exception as e:
        print(f"❌ Text splitting test failed: {e}")

if __name__ == "__main__":
    print("🚀 Starting Sarvam distribution tests...")
    
    test_text_splitting()
    test_sarvam_distribution()
    
    print("\n✅ All tests completed!")
    print("\n📋 Summary of fixes:")
    print("1. Fixed Sarvam text distribution across segments")
    print("2. Added intelligent text splitting by newlines, sentences, or chunks")
    print("3. Prevents same text from being repeated across all segments")
    print("4. Maintains speaker information from ElevenLabs")
    print("5. Provides fallback to original ElevenLabs text if needed") 