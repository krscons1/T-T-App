import torch
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
try:
    from IndicTransToolkit.processor import IndicProcessor
except ImportError:
    IndicProcessor = None
    print("⚠️ IndicTransToolkit not installed. Install with: pip install git+https://github.com/AI4Bharat/IndicTrans2.git")

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

MODEL_NAME = "ai4bharat/indictrans2-indic-en-dist-200M"
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, trust_remote_code=True)

model_kwargs = {
    "trust_remote_code": True,
    "torch_dtype": torch.float16 if torch.cuda.is_available() else torch.float32,
}
try:
    model_kwargs["attn_implementation"] = "flash_attention_2"
except Exception:
    pass

model = AutoModelForSeq2SeqLM.from_pretrained(
    MODEL_NAME,
    **model_kwargs
).to(DEVICE)

if IndicProcessor:
    ip = IndicProcessor(inference=True)
else:
    ip = None

def translate_text(text, src_lang="hin_Deva", tgt_lang="eng_Latn"):
    if not ip:
        raise ImportError("IndicTransToolkit is not installed.")
    batch = ip.preprocess_batch([text], src_lang=src_lang, tgt_lang=tgt_lang)
    inputs = tokenizer(
        batch,
        truncation=True,
        padding="longest",
        return_tensors="pt",
        return_attention_mask=True,
    ).to(DEVICE)
    with torch.no_grad():
        generated_tokens = model.generate(
            **inputs,
            use_cache=True,
            min_length=0,
            max_length=256,
            num_beams=5,
            num_return_sequences=1,
        )
    generated_texts = tokenizer.batch_decode(
        generated_tokens,
        skip_special_tokens=True,
        clean_up_tokenization_spaces=True,
    )
    translations = ip.postprocess_batch(generated_texts, lang=tgt_lang)
    return translations[0] if translations else ""

def translate_batch(texts, src_lang="hin_Deva", tgt_lang="eng_Latn"):
    if not ip:
        raise ImportError("IndicTransToolkit is not installed.")
    batch = ip.preprocess_batch(texts, src_lang=src_lang, tgt_lang=tgt_lang)
    inputs = tokenizer(
        batch,
        truncation=True,
        padding="longest",
        return_tensors="pt",
        return_attention_mask=True,
    ).to(DEVICE)
    with torch.no_grad():
        generated_tokens = model.generate(
            **inputs,
            use_cache=True,
            min_length=0,
            max_length=256,
            num_beams=5,
            num_return_sequences=1,
        )
    generated_texts = tokenizer.batch_decode(
        generated_tokens,
        skip_special_tokens=True,
        clean_up_tokenization_spaces=True,
    )
    translations = ip.postprocess_batch(generated_texts, lang=tgt_lang)
    return translations 