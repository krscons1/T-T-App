#!/usr/bin/env python3
"""
Test script for word-by-word Tamil word insertion
"""

import sys
import os

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

def test_word_by_word_insertion():
    """Test the word-by-word Tamil word insertion"""
    print("🧪 Testing word-by-word Tamil word insertion...")
    
    try:
        from app.services.enhanced_transcription_service import EnhancedTranscriptionService
        
        service = EnhancedTranscriptionService()
        
        # Test case 1: Missing "kutti" (child)
        elevenlabs_text = "Let me sing a story"
        sarvam_text = "kutti Let me sing a story"
        
        print(f"\n📝 Test 1:")
        print(f"ElevenLabs: '{elevenlabs_text}'")
        print(f"Sarvam: '{sarvam_text}'")
        
        enhanced_text = service._insert_missing_tamil_words(elevenlabs_text, sarvam_text)
        print(f"Enhanced: '{enhanced_text}'")
        
        # Test case 2: Missing "kavanam" (attention)
        elevenlabs_text = "Pay attention listen to me"
        sarvam_text = "kavanam Pay attention listen to me"
        
        print(f"\n📝 Test 2:")
        print(f"ElevenLabs: '{elevenlabs_text}'")
        print(f"Sarvam: '{sarvam_text}'")
        
        enhanced_text = service._insert_missing_tamil_words(elevenlabs_text, sarvam_text)
        print(f"Enhanced: '{enhanced_text}'")
        
        # Test case 3: Multiple missing words
        elevenlabs_text = "Let me sing a story pay attention"
        sarvam_text = "kutti Let me sing a kathai pay kavanam attention"
        
        print(f"\n📝 Test 3:")
        print(f"ElevenLabs: '{elevenlabs_text}'")
        print(f"Sarvam: '{sarvam_text}'")
        
        enhanced_text = service._insert_missing_tamil_words(elevenlabs_text, sarvam_text)
        print(f"Enhanced: '{enhanced_text}'")
        
        # Test case 4: No missing words
        elevenlabs_text = "Let me sing a story"
        sarvam_text = "Let me sing a story"
        
        print(f"\n📝 Test 4:")
        print(f"ElevenLabs: '{elevenlabs_text}'")
        print(f"Sarvam: '{sarvam_text}'")
        
        enhanced_text = service._insert_missing_tamil_words(elevenlabs_text, sarvam_text)
        print(f"Enhanced: '{enhanced_text}'")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")

def test_transliteration():
    """Test Indic transliteration"""
    print("\n🧪 Testing Indic transliteration...")
    
    try:
        from app.services.enhanced_transcription_service import EnhancedTranscriptionService
        
        service = EnhancedTranscriptionService()
        
        test_cases = [
            "kutti",
            "kavanam", 
            "kathai",
            "paattu",
            "Let me sing a story",
            "Pay attention listen to me"
        ]
        
        for text in test_cases:
            tamil_text = service._convert_thanglish_to_tamil(text)
            print(f"🔄 '{text}' -> '{tamil_text}'")
            
    except Exception as e:
        print(f"❌ Transliteration test failed: {e}")

def test_tamil_word_extraction():
    """Test Tamil word extraction"""
    print("\n🧪 Testing Tamil word extraction...")
    
    try:
        from app.services.enhanced_transcription_service import EnhancedTranscriptionService
        
        service = EnhancedTranscriptionService()
        
        # Test Sarvam text
        sarvam_text = "kutti Let me sing a kathai pay kavanam attention"
        sarvam_words = service._extract_tamil_words_from_sarvam(sarvam_text)
        print(f"🔍 Sarvam Tamil words: {sarvam_words}")
        
        # Test ElevenLabs text
        elevenlabs_text = "Let me sing a story pay attention"
        elevenlabs_words = service._extract_tamil_words_from_elevenlabs(elevenlabs_text)
        print(f"🔍 ElevenLabs Tamil words: {elevenlabs_words}")
        
        # Find missing words
        missing_words = sarvam_words - elevenlabs_words
        print(f"🔍 Missing Tamil words: {missing_words}")
        
    except Exception as e:
        print(f"❌ Tamil word extraction test failed: {e}")

if __name__ == "__main__":
    print("🚀 Starting word-by-word insertion tests...")
    
    test_transliteration()
    test_tamil_word_extraction()
    test_word_by_word_insertion()
    
    print("\n✅ All tests completed!") 