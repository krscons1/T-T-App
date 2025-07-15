from transformers import pipeline

# Load the translation pipeline once at module level
translation_pipe = pipeline(
    "translation",
    model="ai4bharat/indictrans2-en-indic-1B",
    trust_remote_code=True
)

def translate_text(text, src_lang="eng_Latn", tgt_lang="tam_Taml"):
    """
    Translate a single string from src_lang to tgt_lang.
    """
    result = translation_pipe(text, src_lang=src_lang, tgt_lang=tgt_lang)
    return result[0]['translation_text']

def translate_batch(texts, src_lang="eng_Latn", tgt_lang="tam_Taml"):
    """
    Translate a list of strings from src_lang to tgt_lang.
    """
    results = translation_pipe(texts, src_lang=src_lang, tgt_lang=tgt_lang)
    return [r['translation_text'] for r in results] 