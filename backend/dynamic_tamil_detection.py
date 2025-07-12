import json
import re
from difflib import SequenceMatcher
from typing import List, Dict, Tuple


def contains_tamil(text: str) -> bool:
    """Check if text contains Tamil characters using Unicode range"""
    # Unicode range for Tamil: U+0B80 to U+0BFF
    return any('\u0B80' <= char <= '\u0BFF' for char in text)


def clean_text(text: str) -> str:
    """Clean text for comparison"""
    return re.sub(r"\s+", " ", text.strip().lower())


def best_sarvam_match(eleven_line: str, sarvam_lines: List[str]) -> Tuple[str, float]:
    """Find the best matching Sarvam line for an ElevenLabs segment"""
    best_line = ""
    best_score = 0.0
    
    for sarvam_line in sarvam_lines:
        score = SequenceMatcher(None, clean_text(eleven_line), clean_text(sarvam_line)).ratio()
        if score > best_score:
            best_score = score
            best_line = sarvam_line
    
    return best_line, best_score


def merge_transcripts_with_dynamic_tamil_detection(
    elevenlabs_transcript: List[Dict],
    sarvam_transcript: str
) -> List[Dict]:
    """
    Merge transcripts using ElevenLabs as base and Sarvam for Tamil accuracy.
    
    Args:
        elevenlabs_transcript: List of segments from ElevenLabs with speaker diarization
        sarvam_transcript: Raw text transcript from Sarvam API
    
    Returns:
        List of merged transcript segments
    """
    # Split Sarvam text into lines
    sarvam_lines = [line.strip() for line in sarvam_transcript.split('\n') if line.strip()]
    
    print(f"📊 ElevenLabs segments: {len(elevenlabs_transcript)}")
    print(f"📊 Sarvam lines: {len(sarvam_lines)}")
    
    merged_output = []
    
    # Use ElevenLabs transcript as base
    for segment in elevenlabs_transcript:
        original_text = segment.get("text", "").strip()
        
        if not original_text:
            continue
        
        # Find best Sarvam match for this ElevenLabs segment
        best_sarvam_line, score = best_sarvam_match(original_text, sarvam_lines)
        
        # Apply dynamic Tamil phrase detection
        if score > 0.6 and contains_tamil(best_sarvam_line):
            final_text = best_sarvam_line.strip()
            print(f"🔄 Replaced: '{original_text[:50]}...' -> '{final_text[:50]}...' (score: {score:.2f})")
        else:
            final_text = original_text.strip()
        
        merged_output.append({
            "speaker": segment.get("speaker", "Unknown"),
            "start_time": segment.get("start_time", 0.0),
            "end_time": segment.get("end_time", 0.0),
            "text": final_text,
            "confidence": segment.get("confidence", 0.0),
            "similarity_score": score if score > 0.6 and contains_tamil(best_sarvam_line) else 0.0
        })
    
    print(f"✅ Transcript merged: {len(merged_output)} segments")
    return merged_output


def process_transcript_data(data_file: str, output_file: str = "optimized_transcript.json"):
    """
    Process transcript data from JSON file and apply dynamic Tamil detection.
    
    Args:
        data_file: Path to JSON file containing transcript data
        output_file: Path to save the optimized transcript
    """
    try:
        # Load data
        with open(data_file, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        elevenlabs_transcript = data.get("elevenlabs_transcript", [])
        sarvam_transcript = data.get("sarvam_transcript", "")
        
        if not elevenlabs_transcript:
            print("❌ No ElevenLabs transcript found in data")
            return
        
        if not sarvam_transcript:
            print("❌ No Sarvam transcript found in data")
            return
        
        # Merge transcripts
        merged_output = merge_transcripts_with_dynamic_tamil_detection(
            elevenlabs_transcript, sarvam_transcript
        )
        
        # Save output
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(merged_output, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Optimized transcript saved to: {output_file}")
        
        # Print statistics
        tamil_segments = sum(1 for seg in merged_output if seg.get("similarity_score", 0) > 0)
        print(f"📊 Statistics:")
        print(f"   - Total segments: {len(merged_output)}")
        print(f"   - Tamil-enhanced segments: {tamil_segments}")
        print(f"   - Enhancement rate: {(tamil_segments/len(merged_output)*100):.1f}%")
        
    except Exception as e:
        print(f"❌ Error processing transcript data: {e}")


def create_sample_data():
    """Create sample transcript data for testing"""
    sample_data = {
        "elevenlabs_transcript": [
            {
                "speaker": "Speaker 1",
                "start_time": 0.0,
                "end_time": 5.0,
                "text": "Hello, how are you today?",
                "confidence": 0.95
            },
            {
                "speaker": "Speaker 2", 
                "start_time": 5.0,
                "end_time": 10.0,
                "text": "I am doing well, thank you",
                "confidence": 0.92
            },
            {
                "speaker": "Speaker 1",
                "start_time": 10.0,
                "end_time": 15.0,
                "text": "வணக்கம், நீங்கள் எப்படி இருக்கிறீர்கள்?",
                "confidence": 0.88
            }
        ],
        "sarvam_transcript": """
        Hello, how are you today?
        I am doing well, thank you
        வணக்கம், நீங்கள் எப்படி இருக்கிறீர்கள்?
        """
    }
    
    with open("sample_transcript_data.json", "w", encoding="utf-8") as f:
        json.dump(sample_data, f, indent=2, ensure_ascii=False)
    
    print("✅ Sample data created: sample_transcript_data.json")


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        # Process specific file
        data_file = sys.argv[1]
        output_file = sys.argv[2] if len(sys.argv) > 2 else "optimized_transcript.json"
        process_transcript_data(data_file, output_file)
    else:
        # Create sample data and process it
        print("🔧 Creating sample data for testing...")
        create_sample_data()
        print("🔧 Processing sample data...")
        process_transcript_data("sample_transcript_data.json") 