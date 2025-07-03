# Translation service placeholder 

import torch
from transformers import NllbTokenizer, M2M100ForConditionalGeneration
import logging

class NLLBModelHandler:
    def __init__(self, model_name: str = "facebook/nllb-200-distilled-600M"):
        self.model_name = model_name
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = None
        self.tokenizer = None
        self.load_model()

    def load_model(self):
        try:
            self.tokenizer = NllbTokenizer.from_pretrained(
                self.model_name,
                src_lang="tam_Taml",
                tgt_lang="eng_Latn"
            )
            self.model = M2M100ForConditionalGeneration.from_pretrained(
                self.model_name
            ).to(self.device)
            logging.info(f"Model loaded successfully: {self.model_name}")
        except Exception as e:
            logging.error(f"Error loading model: {e}")
            raise

    def translate_text(self, text: str, src_lang: str = "tam_Taml", tgt_lang: str = "eng_Latn") -> str:
        try:
            self.tokenizer.src_lang = src_lang
            self.tokenizer.tgt_lang = tgt_lang
            inputs = self.tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=512)
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            with torch.no_grad():
                generated_tokens = self.model.generate(
                    **inputs,
                    forced_bos_token_id=self.tokenizer.lang_code_to_id[tgt_lang],
                    max_length=512,
                    num_beams=5,
                    early_stopping=True
                )
            translation = self.tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)[0]
            return translation
        except Exception as e:
            logging.error(f"Translation error: {e}")
            return f"Translation failed: {str(e)}" 