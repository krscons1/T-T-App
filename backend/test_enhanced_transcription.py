#!/usr/bin/env python3
"""
Test script for Enhanced Transcription Pipeline
This demonstrates the multi-pipeline approach combining:
- Whisper.cpp for timestamps
- ElevenLabs for speaker diarization  
- Sarvam API for Tamil accuracy
"""

import asyncio
import os
import sys
from pathlib import Path

# Add the app directory to Python path
sys.path.append(str(Path(__file__).parent / "app"))

from app.services.enhanced_transcription_service import enhanced_transcription_service


async def test_enhanced_transcription():
    """Test the enhanced transcription pipeline"""
    
    print("🧪 Testing Enhanced Transcription Pipeline")
    print("=" * 50)
    
    # Test with a sample audio file
    # You can replace this with your actual audio file path
    test_audio_path = "C:/Users/Lenovo/Desktop/T-T/T-T-App/backend/downloads/1752294521_Kutti Story Master 320 Kbps_converted.wav"
    
    if not os.path.exists(test_audio_path):
        print(f"❌ Test audio file not found: {test_audio_path}")
        print("Please update the test_audio_path variable with a valid audio file.")
        return
    
    print(f"📁 Processing: {test_audio_path}")
    print(f"📊 File size: {os.path.getsize(test_audio_path) / (1024*1024):.2f} MB")
    
    try:
        # Process through enhanced transcription pipeline
        result = await enhanced_transcription_service.process_enhanced_transcription(test_audio_path)
        
        if result["success"]:
            print("\n✅ Enhanced Transcription Completed Successfully!")
            print("=" * 50)
            
            # Display processing info
            processing_info = result.get("processing_info", {})
            print(f"🎯 Total segments: {processing_info.get('total_segments', 0)}")
            print(f"⏱️  Audio duration: {processing_info.get('audio_duration', 0):.2f} seconds")
            print(f"🦜 Whisper model: {processing_info.get('whisper_model', 'Unknown')}")
            
            # Display final transcript
            final_transcript = result.get("final_transcript", [])
            print(f"\n📝 Final Transcript ({len(final_transcript)} segments):")
            print("-" * 50)
            
            for i, segment in enumerate(final_transcript[:5]):  # Show first 5 segments
                print(f"{i+1}. [{segment['start']:.2f}s - {segment['end']:.2f}s] {segment['speaker']}: {segment['text']}")
            
            if len(final_transcript) > 5:
                print(f"... and {len(final_transcript) - 5} more segments")
            
            # Export to SRT if requested
            export_srt = input("\n💾 Export to SRT file? (y/n): ").lower().strip() == 'y'
            if export_srt:
                srt_path = "test_enhanced_transcript.srt"
                enhanced_transcription_service.export_to_srt(final_transcript, srt_path)
                print(f"✅ SRT file exported: {srt_path}")
            
            # Display component results
            print(f"\n🔍 Component Results:")
            print(f"   🦜 Whisper segments: {len(result.get('whisper_segments', []))}")
            print(f"   🎤 ElevenLabs segments: {len(result.get('elevenlabs_transcript', []))}")
            print(f"   🌐 Sarvam transcript length: {len(result.get('sarvam_transcript', ''))} chars")
            
        else:
            print(f"❌ Processing failed: {result.get('error', 'Unknown error')}")
            
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()


async def test_individual_components():
    """Test individual components of the pipeline"""
    
    print("\n🧪 Testing Individual Components")
    print("=" * 50)
    
    test_audio_path = "C:/Users/Lenovo/Desktop/T-T/T-T-App/backend/downloads/1752294521_Kutti Story Master 320 Kbps_converted.wav"
    
    if not os.path.exists(test_audio_path):
        print(f"❌ Test audio file not found: {test_audio_path}")
        return
    
    try:
        # Test audio preparation
        print("1️⃣ Testing audio preparation...")
        prepared_audio = await enhanced_transcription_service._prepare_audio(test_audio_path)
        print(f"   ✅ Prepared audio: {prepared_audio}")
        
        # Test Whisper timestamps
        print("\n2️⃣ Testing Whisper timestamps...")
        whisper_result = await enhanced_transcription_service._get_whisper_timestamps(prepared_audio)
        print(f"   ✅ Whisper segments: {len(whisper_result.get('segments', []))}")
        
        # Test ElevenLabs
        print("\n3️⃣ Testing ElevenLabs...")
        elevenlabs_result = await enhanced_transcription_service._get_elevenlabs_transcript(prepared_audio)
        print(f"   ✅ ElevenLabs segments: {len(elevenlabs_result)}")
        
        # Test Sarvam
        print("\n4️⃣ Testing Sarvam...")
        sarvam_result = await enhanced_transcription_service._get_sarvam_transcript(prepared_audio)
        print(f"   ✅ Sarvam transcript length: {len(sarvam_result.get('transcript', ''))}")
        
        # Test merging
        print("\n5️⃣ Testing transcript merging...")
        merged_result = await enhanced_transcription_service._merge_transcripts(
            whisper_result, elevenlabs_result, sarvam_result
        )
        print(f"   ✅ Merged segments: {len(merged_result)}")
        
    except Exception as e:
        print(f"❌ Component test failed: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    print("🚀 Enhanced Transcription Pipeline Test")
    print("=" * 50)
    
    # Run tests
    asyncio.run(test_enhanced_transcription())
    asyncio.run(test_individual_components())
    
    print("\n✨ Test completed!") 