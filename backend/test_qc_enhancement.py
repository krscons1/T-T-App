#!/usr/bin/env python3
"""
Test script to demonstrate the enhanced QC system with audio cross-validation.
This script simulates the QC process for the transcription example you provided.
"""

import asyncio
import json
from app.services.qc_service import qc_service

# Sample data based on your example
SAMPLE_QC_DATA = {
    "pipeline1": {
        "transcript": "Let me sing a குட்டி ஸ்டோரி, pay attention, listen to me.  என்ன நான் இங்கிலீஷ்? Just listen bro.  பலவித problems will come and go. கொஞ்சம் ஜில் பண்ணு மாப்பி. Together man.  டிசைன் டிசைனா ப்ராப்ளம்ஸ் வில் கம் அண்ட் கோ கொஞ்சம் ஜில் பண்ணு மாப்பி. நோ டென்ஷன் பேபி! ஸ்பீடா போனா கவனம் மஸ்டே ஸ்லோவா போனா ஸ்டெடியும் மஸ்டே ஹே  ஓ ஆங்கர் ஆல்வேஸ் மிஸரி பேபி\nபிரண்ட்ஸ் ஆ நின்னா பவர்ஃபுல் மாப்பி\nஹேட்டர்ஸ் ஆர் கோன்னா ஹேட் பட் இக்னோர் ஃபேமிலி\nநெகட்டிவிட்டி யாரா தள்ளிவை பேபி Focus on what you dream and don't worry my baby.\nPositivity உன்ன லிப்ட் பண்ணும் baby.\nLife is very short நண்பா, always be happy.  வெரி மெனி ப்ராப்ளம்ஸ் வில் கம் அண்ட் கோ கொஞ்சம் சில் பண்ணு மாத்தி ஸ்டுடென்ட்ஸ்  டிசைன் டிசைனா ப்ராப்ளம்ஸ் வில் கம் அண்ட் கோ கொஞ்சம் ஜில் பண்ணு மாப்பி. நோ டென்ஷன் பேபி!  ஹார்ட் வொர்க்கும் வேணும், ஸ்மார்ட் வொர்க்கும் வேணும், செல்ஃப் மோட்டிவேஷன் அது நீதானே! எஜுகேஷன் வேணும், டெடிகேஷன் வேணும், செல்ஃப் வேல்யுவேஷன் அத பண்ணி பாரேன். \nடோன்ட் பி த பர்சன் ஸ்ப்ரெடிங் ஹேட்ரேட் மாத்தி. \nபின்னாடி பேசுறது ரொம்ப கிராப்பி. \nஆல்வேஸ் பி பொலைட் அண்ட் ஜஸ்ட் டோன்ட் பி நாஸ்டி. \nயூ பி த ரீசன் டு மேக் சம் ஒன் ஹாப்பி. Life is very short நண்பா.\nAlways be happy.\nபலவித problems will come and go.\nகொஞ்சம் சில் பண்ணு மாப்பி.\nOne last time.  டிசைன் டிசைனா ப்ராப்ளம்ஸ் வில் கம் அண்ட் கோ கொஞ்சம் சில் பண்ணு மாப்பி. ஏ தட் வாஸ் மை குட்டி ஸ்டோரி ஹவ் வாஸ் மை குட்டி ஸ்டோரி தட் வாஸ் மை குட்டி ஸ்டோரி  Just awesome  no tension  ஏபே!",
        "processed_file": "C:\\Users\\LENOVO\\Desktop\\T-Tamil\\T-T-App\\backend\\downloads\\1751705376_Kutti-Story-MassTamilan.io_converted.wav",
        "error": None,
        "embedding_used": None
    },
    "pipeline2": {
        "transcript": "Let me sing a good story, pay attention listen to me.\n No no easy.\n Just listen.\nLet me sing a good story, pay attention listen to me.\nIf you want take guitar or flute no tension leave it baby.\nLife is very short நண்பா. Always be happy.\nபலவித problems will come and go.\nகொஞ்சம் ஜீவனமா பீ.\nTogether man.  டிசைன் டிசைனா ப்ராப்ளம்ஸ் வில் கம் அண்ட் கோ கொஞ்சம் ஜூல் பண்ணு மாப்பி. நோ டென்ஷன் பேபி. ஸ்பீடா போனா கவனம் மஸ்டே, ஸ்லோவா போனா ஸ்டேடியம் மஸ்டே.   ஓ ஆங்கிள் ஆல்வேஸ் மிஸ்டரி பேபி பிரண்ட்ஸ் ஆ நின்னா பவர்ஃபுல் மாப்பி ஹேட்டர்ஸ் ஆர் கோன்னா ஹேட் பட் ஹேட் நாட் அம் மீ நெகட்டிவிட்டிய மாத்த லீவை பேபி Focus on what you dream and don't worry my baby. \nPositivity உனக்கு ஒன்னும் இல்ல ஒன்னும் இல்ல baby. \nLife is very short நண்பா. \nAlways be happy. வெரி மெனி ப்ராப்ளம்ஸ் வித் மெட்டல் கொஞ்சம் சில் பண்ணுமா பீ.  டிசைன் டிசைனா ப்ராப்ளம்ஸ் வில் கம் அண்ட் கோ கொஞ்சம் ஜூல் பண்ணு மாப்பி. நோ டென்ஷன். ஹார்ட் வொர்க்கும் வேணும், ஸ்மார்ட் வொர்க்கும் வேணும், செல்ப் மோட்டிவேஷன் அது நீதானே! எஜுகேஷன் வேணும், டெடிகேஷன் வேணும், செல்ஃப் வேல்யுவேஷன் அத பண்ணி பாரு. Don't be the person spreading hatred மாத்திரி. பின்னாடி பேசுறது ரொம்ப கிராப்பி. Always be polite and just don't be nasty.\nYou be the reason to make someone happy.\nLife is very short நண்பா.\nAlways be happy. பலவித ப்ராப்ளம்ஸ் இருக்கும் என்று கொஞ்சம் சில் பண்ணு மாப்பி.  டிசைன் டிசைனர் ப்ராப்ளம்ஸ் வில் கம் அண்ட் கோ கொஞ்சம் சில் பண்ணு மாப்பி.\nஏ தட் வாஸ் மை குட்டி ஸ்டோரி ஹவ் வாஸ் மை குட்டி ஸ்டோரி தட் வாஸ் மை குட்டி ஸ்டோரி ஹவ் வாஸ் மை குட்டி ஸ்டோரி ஜஸ்ட் ஆசம் நா. நோ டென்ஷன். ஏய் பே.",
        "processed_file": "C:\\Users\\LENOVO\\Desktop\\T-Tamil\\T-T-App\\backend\\downloads\\1751705376_Kutti-Story-MassTamilan.io_speech.wav",
        "error": None,
        "embedding_used": True
    },
    "comparison": {
        "match": True,
        "similarity_score": 0.9814814814814815,
        "final_transcript": "Let me sing a good story, pay attention listen to me.\n No no easy.\n Just listen.\nLet me sing a good story, pay attention listen to me.\nIf you want take guitar or flute no tension leave it baby.\nLife is very short நண்பா. Always be happy.\nபலவித problems will come and go.\nகொஞ்சம் ஜீவனமா பீ.\nTogether man.  டிசைன் டிசைனா ப்ராப்ளம்ஸ் வில் கம் அண்ட் கோ கொஞ்சம் ஜூல் பண்ணு மாப்பி. நோ டென்ஷன் பேபி. ஸ்பீடா போனா கவனம் மஸ்டே, ஸ்லோவா போனா ஸ்டேடியம் மஸ்டே.   ஓ ஆங்கிள் ஆல்வேஸ் மிஸ்டரி பேபி பிரண்ட்ஸ் ஆ நின்னா பவர்ஃபுல் மாப்பி ஹேட்டர்ஸ் ஆர் கோன்னா ஹேட் பட் ஹேட் நாட் அம் மீ நெகட்டிவிட்டிய மாத்த லீவை பேபி Focus on what you dream and don't worry my baby. \nPositivity உனக்கு ஒன்னும் இல்ல ஒன்னும் இல்ல baby. \nLife is very short நண்பா. \nAlways be happy. வெரி மெனி ப்ராப்ளம்ஸ் வித் மெட்டல் கொஞ்சம் சில் பண்ணுமா பீ.  டிசைன் டிசைனா ப்ராப்ளம்ஸ் வில் கம் அண்ட் கோ கொஞ்சம் ஜூல் பண்ணு மாப்பி. நோ டென்ஷன். ஹார்ட் வொர்க்கும் வேணும், ஸ்மார்ட் வொர்க்கும் வேணும், செல்ப் மோட்டிவேஷன் அது நீதானே! எஜுகேஷன் வேணும், டெடிகேஷன் வேணும், செல்ஃப் வேல்யுவேஷன் அத பண்ணி பாரு. Don't be the person spreading hatred மாத்திரி. பின்னாடி பேசுறது ரொம்ப கிராப்பி. Always be polite and just don't be nasty.\nYou be the reason to make someone happy.\nLife is very short நண்பா.\nAlways be happy. பலவித ப்ராப்ளம்ஸ் இருக்கும் என்று கொஞ்சம் சில் பண்ணு மாப்பி.  டிசைன் டிசைனர் ப்ராப்ளம்ஸ் வில் கம் அண்ட் கோ கொஞ்சம் சில் பண்ணு மாப்பி.\nஏ தட் வாஸ் மை குட்டி ஸ்டோரி ஹவ் வாஸ் மை குட்டி ஸ்டோரி தட் வாஸ் மை குட்டி ஸ்டோரி ஹவ் வாஸ் மை குட்டி ஸ்டோரி ஜஸ்ட் ஆசம் நா. நோ டென்ஷன். ஏய் பே.",
        "qc_required": False,
        "reason": "Transcripts match",
        "pipeline1_length": 1388,
        "pipeline2_length": 1517
    }
}

async def test_qc_enhancement():
    """Test the enhanced QC system"""
    print("🧪 Testing Enhanced QC System with Audio Cross-Validation")
    print("=" * 60)
    
    # 1. Add to QC queue (simulating a case where transcripts don't match perfectly)
    print("\n1️⃣ Adding case to QC queue...")
    qc_case_id = qc_service.add_to_qc_queue(SAMPLE_QC_DATA)
    print(f"✅ Added to QC queue: {qc_case_id}")
    
    # 2. Perform audio cross-validation
    print("\n2️⃣ Performing audio cross-validation...")
    try:
        validation_result = await qc_service.perform_audio_cross_validation(qc_case_id)
        
        if 'error' in validation_result:
            print(f"❌ Audio cross-validation failed: {validation_result['error']}")
            print("💡 This is expected if audio files don't exist in the test environment")
        else:
            print("✅ Audio cross-validation completed successfully")
            print(f"📊 Cross-validation analysis: {json.dumps(validation_result['cross_validation'], indent=2)}")
            print(f"📝 Optimal transcript: {validation_result['optimal_transcript'][:200]}...")
    
    except Exception as e:
        print(f"❌ Audio cross-validation error: {e}")
        print("💡 This is expected in test environment without actual audio files")
    
    # 3. Demonstrate the enhanced comparison analysis
    print("\n3️⃣ Demonstrating enhanced comparison analysis...")
    from app.services.dual_pipeline_service import dual_pipeline_service
    
    transcript1 = SAMPLE_QC_DATA['pipeline1']['transcript']
    transcript2 = SAMPLE_QC_DATA['pipeline2']['transcript']
    
    # Use the enhanced comparison analysis
    comparison_analysis = dual_pipeline_service._detailed_comparison_analysis(transcript1, transcript2)
    
    print("🔍 Detailed Comparison Analysis:")
    print(f"   • Has significant issues: {comparison_analysis['has_significant_issues']}")
    print(f"   • Reason: {comparison_analysis['reason']}")
    print(f"   • Word count difference: {comparison_analysis['word_count_difference']}")
    print(f"   • Common words ratio: {comparison_analysis['common_words_ratio']:.2f}")
    
    print("\n📝 Missing words analysis:")
    print(f"   • Missing in Pipeline 1: {len(comparison_analysis['missing_words_pipeline1'])} words")
    print(f"   • Missing in Pipeline 2: {len(comparison_analysis['missing_words_pipeline2'])} words")
    
    if comparison_analysis['missing_words_pipeline1']:
        print(f"   • Pipeline 1 missing: {comparison_analysis['missing_words_pipeline1'][:5]}...")
    
    if comparison_analysis['missing_words_pipeline2']:
        print(f"   • Pipeline 2 missing: {comparison_analysis['missing_words_pipeline2'][:5]}...")
    
    print("\n🔍 Incorrect transcriptions:")
    print(f"   • Found {len(comparison_analysis['incorrect_transcriptions'])} potential incorrect transcriptions")
    
    for i, incorrect in enumerate(comparison_analysis['incorrect_transcriptions'][:3]):
        print(f"   • Position {incorrect['position']}: '{incorrect['pipeline1_word']}' vs '{incorrect['pipeline2_word']}' (similarity: {incorrect['similarity']:.2f})")
    
    # 4. Show QC queue status
    print("\n4️⃣ QC Queue Status:")
    qc_stats = qc_service.get_qc_stats()
    print(f"   • Total cases: {qc_stats['total_cases']}")
    print(f"   • Pending cases: {qc_stats['pending_cases']}")
    print(f"   • Completed cases: {qc_stats['completed_cases']}")
    print(f"   • Audio validated cases: {qc_stats['audio_validated_cases']}")
    
    print("\n🎯 Key Issues Identified in Your Example:")
    print("   • Pipeline 1: 'குட்டி ஸ்டோரி' (correct) vs Pipeline 2: 'good story' (incorrect)")
    print("   • Pipeline 1: Missing words after 'Just listen bro'")
    print("   • Pipeline 2: More complete transcription but with some inaccuracies")
    print("   • Both pipelines have different word choices for same audio segments")
    
    print("\n✅ Enhanced QC System Features:")
    print("   • Audio cross-validation to identify missing words")
    print("   • Intelligent transcript merging")
    print("   • Detailed comparison analysis")
    print("   • Automatic error detection and correction")
    print("   • Quality control workflow management")

if __name__ == "__main__":
    asyncio.run(test_qc_enhancement()) 