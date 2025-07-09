#!/usr/bin/env python3
"""
Test script to demonstrate the audio cross-validation system.
This shows how the system uses speech recognition models to compare transcripts with actual audio.
"""

import asyncio
import json
from app.services.audio_cross_validator import audio_cross_validator

# Sample data based on your example
SAMPLE_DATA = {
    "transcript1": "Let me sing a குட்டி ஸ்டோரி, pay attention, listen to me.  என்ன நான் இங்கிலீஷ்? Just listen bro.  பலவித problems will come and go. கொஞ்சம் ஜில் பண்ணு மாப்பி. Together man.",
    "transcript2": "Let me sing a good story, pay attention listen to me.\n No no he is listening.\n Just listen.\nLet me sing a good story, pay attention listen to me.\nIf you want take guitar or smell attention leave it baby.\nLife is very short நண்பா. Always be happy.\nபலவித problems will come and go.\nகொஞ்சம் ஜீவனமா பீ.\nTogether man.",
    "audio_file1": "C:\\Users\\LENOVO\\Desktop\\T-Tamil\\T-T-App\\backend\\downloads\\1751705376_Kutti-Story-MassTamilan.io_converted.wav",
    "audio_file2": "C:\\Users\\LENOVO\\Desktop\\T-Tamil\\T-T-App\\backend\\downloads\\1751705376_Kutti-Story-MassTamilan.io_speech.wav"
}

async def test_audio_cross_validation():
    """Test the audio cross-validation system"""
    print("🧪 Testing Audio Cross-Validation System")
    print("=" * 50)
    
    print("\n1️⃣ Loading speech recognition models...")
    print("   • Whisper model for word-level validation")
    print("   • Wav2Vec2 model for segment-level validation")
    
    # Test audio cross-validation
    print("\n2️⃣ Performing audio cross-validation...")
    try:
        validation_result = await audio_cross_validator.cross_validate_with_audio(
            SAMPLE_DATA["transcript1"],
            SAMPLE_DATA["transcript2"],
            SAMPLE_DATA["audio_file1"],
            SAMPLE_DATA["audio_file2"]
        )
        
        if 'error' in validation_result:
            print(f"❌ Audio cross-validation failed: {validation_result['error']}")
            print("💡 This is expected if audio files don't exist or models aren't loaded")
        else:
            print("✅ Audio cross-validation completed successfully!")
            
            # Show word-level validation results
            word_validation = validation_result.get('word_validation', {})
            word_confidence_scores = word_validation.get('word_confidence_scores', {})
            
            print(f"\n3️⃣ Word-Level Validation Results:")
            print(f"   • Total words analyzed: {len(word_confidence_scores)}")
            print(f"   • Pipeline 1 correct words: {len(word_validation.get('pipeline1_correct_words', []))}")
            print(f"   • Pipeline 2 correct words: {len(word_validation.get('pipeline2_correct_words', []))}")
            print(f"   • Uncertain words: {len(word_validation.get('uncertain_words', []))}")
            
            # Show some example word validations
            print(f"\n📝 Example Word Validations:")
            for i, (word_id, confidence_data) in enumerate(list(word_confidence_scores.items())[:5]):
                word1 = confidence_data.get('pipeline1_word', '')
                word2 = confidence_data.get('pipeline2_word', '')
                conf1 = confidence_data.get('pipeline1_confidence', 0)
                conf2 = confidence_data.get('pipeline2_confidence', 0)
                
                print(f"   • Word {word_id}: '{word1}' (conf: {conf1:.2f}) vs '{word2}' (conf: {conf2:.2f})")
                if conf1 > conf2:
                    print(f"     → Pipeline 1 is more confident")
                elif conf2 > conf1:
                    print(f"     → Pipeline 2 is more confident")
                else:
                    print(f"     → Similar confidence")
            
            # Show segment-level validation results
            segment_validation = validation_result.get('segment_validation', {})
            segment_analysis = segment_validation.get('segment_analysis', {})
            
            print(f"\n4️⃣ Segment-Level Validation Results:")
            print(f"   • Total segments analyzed: {len(segment_analysis)}")
            print(f"   • Pipeline 1 correct segments: {len(segment_validation.get('pipeline1_correct_segments', []))}")
            print(f"   • Pipeline 2 correct segments: {len(segment_validation.get('pipeline2_correct_segments', []))}")
            
            # Show optimal transcript
            optimal_transcript = validation_result.get('optimal_transcript', '')
            print(f"\n5️⃣ Optimal Transcript (Audio Cross-Validated):")
            print(f"   • Length: {len(optimal_transcript)} characters")
            print(f"   • Word count: {len(optimal_transcript.split())} words")
            print(f"\n📝 Preview:")
            print(f"   {optimal_transcript[:200]}...")
            
            # Show audio analysis
            audio_analysis = validation_result.get('audio_analysis', {})
            print(f"\n6️⃣ Audio Analysis:")
            print(f"   • Audio 1 duration: {audio_analysis.get('audio1_duration', 0):.2f}s")
            print(f"   • Audio 2 duration: {audio_analysis.get('audio2_duration', 0):.2f}s")
            print(f"   • Sample rate: {audio_analysis.get('sample_rate', 0)} Hz")
    
    except Exception as e:
        print(f"❌ Audio cross-validation error: {e}")
        print("💡 This is expected in test environment without actual audio files")
    
    print(f"\n🎯 Key Features of Audio Cross-Validation:")
    print("   • Uses Whisper model for word-level audio validation")
    print("   • Uses Wav2Vec2 model for segment-level audio validation")
    print("   • Compares each word/segment with actual audio")
    print("   • Chooses the most confident transcription for each word")
    print("   • Creates optimal transcript based on audio evidence")
    print("   • No manual corrections - everything based on audio analysis")

if __name__ == "__main__":
    asyncio.run(test_audio_cross_validation()) 