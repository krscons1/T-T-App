#!/usr/bin/env python3
"""
Test script for Indic transliteration functionality
"""

import sys
import os

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

try:
    from indic_transliteration import sanscript
    from indic_transliteration.sanscript import transliterate
    print("✅ indic-transliteration library imported successfully")
except ImportError as e:
    print(f"❌ Failed to import indic-transliteration: {e}")
    print("Please install with: pip install indic-transliteration")
    sys.exit(1)

def test_thanglish_to_tamil():
    """Test Thanglish to Tamil conversion"""
    print("\n🧪 Testing Thanglish to Tamil conversion...")
    
    test_cases = [
        "nan ungalai nesikkiren",  # I love you
        "kutti",  # child
        "kathai",  # story
        "paattu",  # song
        "vanakkam",  # hello
        "nandri",  # thank you
        "tamil",  # tamil
        "let me sing a story",  # mixed English and Thanglish
    ]
    
    for thanglish in test_cases:
        try:
            tamil = transliterate(thanglish, sanscript.ITRANS, sanscript.TAMIL)
            print(f"🔄 '{thanglish}' -> '{tamil}'")
        except Exception as e:
            print(f"❌ Failed to convert '{thanglish}': {e}")

def test_missing_word_detection():
    """Test missing word detection logic"""
    print("\n🧪 Testing missing word detection...")
    
    # Simulate ElevenLabs transcript (missing "kutti")
    elevenlabs_text = "let me sing a story"
    
    # Simulate Sarvam transcript (has "kutti")
    sarvam_text = "kutti let me sing a story"
    
    # Convert both to Tamil
    elevenlabs_tamil = transliterate(elevenlabs_text, sanscript.ITRANS, sanscript.TAMIL)
    sarvam_tamil = transliterate(sarvam_text, sanscript.ITRANS, sanscript.TAMIL)
    
    print(f"ElevenLabs: '{elevenlabs_text}' -> '{elevenlabs_tamil}'")
    print(f"Sarvam: '{sarvam_text}' -> '{sarvam_tamil}'")
    
    # Find missing words
    import re
    elevenlabs_words = set(re.findall(r'\b[\w\u0B80-\u0BFF]+\b', elevenlabs_tamil.lower()))
    sarvam_words = set(re.findall(r'\b[\w\u0B80-\u0BFF]+\b', sarvam_tamil.lower()))
    
    missing_words = sarvam_words - elevenlabs_words
    
    print(f"ElevenLabs words: {elevenlabs_words}")
    print(f"Sarvam words: {sarvam_words}")
    print(f"Missing words: {missing_words}")

def test_enhanced_service():
    """Test the enhanced transcription service methods"""
    print("\n🧪 Testing enhanced transcription service...")
    
    try:
        from app.services.enhanced_transcription_service import EnhancedTranscriptionService
        
        service = EnhancedTranscriptionService()
        
        # Test Thanglish to Tamil conversion
        test_text = "nan ungalai nesikkiren"
        tamil_text = service._convert_thanglish_to_tamil(test_text)
        print(f"Service conversion: '{test_text}' -> '{tamil_text}'")
        
        # Test missing word detection
        elevenlabs_text = "let me sing a story"
        sarvam_text = "kutti let me sing a story"
        missing_words = service._find_missing_words(elevenlabs_text, sarvam_text)
        print(f"Missing words: {missing_words}")
        
        # Test inserting missing words
        enhanced_text = service._insert_missing_words(tamil_text, missing_words)
        print(f"Enhanced text: '{enhanced_text}'")
        
    except Exception as e:
        print(f"❌ Service test failed: {e}")

if __name__ == "__main__":
    print("🚀 Starting Indic transliteration tests...")
    
    test_thanglish_to_tamil()
    test_missing_word_detection()
    test_enhanced_service()
    
    print("\n✅ All tests completed!") 