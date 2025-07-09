#!/usr/bin/env python3
"""
Test script to demonstrate the enhanced dual pipeline system.
This shows how the system automatically creates optimal transcripts instead of just adding to QC queue.
"""

import asyncio
import json
from app.services.dual_pipeline_service import dual_pipeline_service

# Sample data based on your example
SAMPLE_TRANSCRIPTS = {
    "pipeline1": "Let me sing a குட்டி ஸ்டோரி, pay attention, listen to me.  என்ன நான் இங்கிலீஷ்? Just listen bro.  பலவித problems will come and go. கொஞ்சம் ஜில் பண்ணு மாப்பி. Together man.",
    "pipeline2": "Let me sing a good story, pay attention listen to me.\n No no he is listening.\n Just listen.\nLet me sing a good story, pay attention listen to me.\nIf you want take guitar or smell attention leave it baby.\nLife is very short நண்பா. Always be happy.\nபலவித problems will come and go.\nகொஞ்சம் ஜீவனமா பீ.\nTogether man."
}

async def test_enhanced_system():
    """Test the enhanced dual pipeline system"""
    print("🧪 Testing Enhanced Dual Pipeline System")
    print("=" * 50)
    
    # Simulate the comparison and optimal transcript creation
    print("\n1️⃣ Comparing transcripts...")
    comparison_result = dual_pipeline_service._compare_transcripts(
        SAMPLE_TRANSCRIPTS["pipeline1"],
        SAMPLE_TRANSCRIPTS["pipeline2"]
    )
    
    print(f"   • Similarity score: {comparison_result['similarity_score']:.3f}")
    print(f"   • Match: {comparison_result['match']}")
    print(f"   • Reason: {comparison_result['reason']}")
    
    # Show detailed analysis
    comparison_analysis = comparison_result.get('comparison_analysis', {})
    print(f"\n2️⃣ Detailed Analysis:")
    print(f"   • Has significant issues: {comparison_analysis.get('has_significant_issues', False)}")
    print(f"   • Word count difference: {comparison_analysis.get('word_count_difference', 0)}")
    print(f"   • Common words ratio: {comparison_analysis.get('common_words_ratio', 0):.3f}")
    
    # Show missing words
    missing_p1 = comparison_analysis.get('missing_words_pipeline1', [])
    missing_p2 = comparison_analysis.get('missing_words_pipeline2', [])
    print(f"\n3️⃣ Missing Words Analysis:")
    print(f"   • Missing in Pipeline 1: {len(missing_p1)} words")
    if missing_p1:
        print(f"     - {missing_p1[:3]}...")
    print(f"   • Missing in Pipeline 2: {len(missing_p2)} words")
    if missing_p2:
        print(f"     - {missing_p2[:3]}...")
    
    # Show incorrect transcriptions
    incorrect = comparison_analysis.get('incorrect_transcriptions', [])
    print(f"\n4️⃣ Incorrect Transcriptions:")
    print(f"   • Found {len(incorrect)} potential incorrect transcriptions")
    for i, inc in enumerate(incorrect[:3]):
        print(f"     - Position {inc['position']}: '{inc['pipeline1_word']}' vs '{inc['pipeline2_word']}' (similarity: {inc['similarity']:.2f})")
    
    # Test optimal transcript creation
    print(f"\n5️⃣ Creating Optimal Transcript...")
    try:
        optimal_transcript = await dual_pipeline_service._create_optimal_transcript_automatically(
            SAMPLE_TRANSCRIPTS["pipeline1"],
            SAMPLE_TRANSCRIPTS["pipeline2"],
            comparison_result
        )
        
        print(f"✅ Optimal transcript created successfully!")
        print(f"   • Length: {len(optimal_transcript)} characters")
        print(f"   • Word count: {len(optimal_transcript.split())} words")
        print(f"\n📝 Optimal Transcript Preview:")
        print(f"   {optimal_transcript[:200]}...")
        
        # Test QC requirement
        qc_required = dual_pipeline_service._should_require_qc(comparison_result, optimal_transcript)
        print(f"\n6️⃣ QC Requirement:")
        print(f"   • QC Required: {qc_required}")
        if not qc_required:
            print("   ✅ System can handle this automatically - no manual QC needed!")
        else:
            print("   ⚠️  Manual QC review recommended")
        
    except Exception as e:
        print(f"❌ Error creating optimal transcript: {e}")
    
    print(f"\n🎯 Key Improvements:")
    print("   • Automatic optimal transcript creation")
    print("   • Intelligent merging of both pipelines")
    print("   • Specific error corrections (e.g., 'good story' → 'குட்டி ஸ்டோரி')")
    print("   • Only routes to QC when truly necessary")
    print("   • Focuses on creating the best possible transcript automatically")

if __name__ == "__main__":
    asyncio.run(test_enhanced_system()) 