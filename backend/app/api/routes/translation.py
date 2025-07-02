from fastapi import APIRouter

router = APIRouter()

@router.get("/translate")
def translate():
    return {"message": "Translation endpoint"} 