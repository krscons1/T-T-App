from fastapi import APIRouter
from app.schemas.diff import DiffRequest, DiffResponse, DiffChange
from app.utils.diff_utils import compute_diff, wer, cer

router = APIRouter()

@router.post("/transcription/diff", response_model=DiffResponse)
async def diff_transcriptions(request: DiffRequest):
    changes = [DiffChange(**change) for change in compute_diff(request.final_transcription, request.user_transcription)]
    wer_score = wer(request.final_transcription, request.user_transcription)
    cer_score = cer(request.final_transcription, request.user_transcription)
    summary = f"WER: {wer_score:.2%}, CER: {cer_score:.2%}"
    return DiffResponse(
        changes=changes,
        wer=wer_score,
        cer=cer_score,
        summary=summary
    )
