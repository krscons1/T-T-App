from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any
from pydantic import BaseModel

from app.services.accuracy_assessment_service import accuracy_assessment_service

router = APIRouter()

class AccuracyAssessmentRequest(BaseModel):
    enhanced_transcript: str
    tested_transcript: str
    detailed_diff: bool = False

@router.post("/assess-accuracy", response_model=Dict[str, Any])
async def assess_accuracy(request: AccuracyAssessmentRequest):
    """
    Assess the accuracy of an enhanced transcript against a tested/verified transcript.
    
    Args:
        enhanced_transcript: The transcript from the enhanced pipeline
        tested_transcript: The verified/corrected transcript from tester
        detailed_diff: Whether to include detailed character-level differences
        
    Returns:
        Dictionary containing accuracy metrics and optionally detailed differences
    """
    try:
        # Calculate accuracy metrics
        metrics = accuracy_assessment_service.calculate_accuracy_metrics(
            enhanced_transcript=request.enhanced_transcript,
            tested_transcript=request.tested_transcript
        )
        
        result = {"metrics": metrics}
        
        # Add detailed differences if requested
        if request.detailed_diff:
            differences = accuracy_assessment_service.get_detailed_differences(
                enhanced=request.enhanced_transcript,
                tested=request.tested_transcript
            )
            result["differences"] = differences
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error assessing accuracy: {str(e)}")

# Add this router to your main FastAPI app in app/main.py
