import re
import spacy
import spacy.cli
from typing import List, Tuple
from indicnlp.normalize.indic_normalize import IndicNormalizerFactory

class TextProcessor:
    def __init__(self):
        try:
            self.nlp_en = spacy.load("en_core_web_sm")
        except OSError:
            spacy.cli.download("en_core_web_sm")
            self.nlp_en = spacy.load("en_core_web_sm")
        self.tamil_normalizer = IndicNormalizerFactory().get_normalizer("ta")

    def preprocess_tamil_text(self, text: str) -> str:
        normalized_text = self.tamil_normalizer.normalize(text)
        normalized_text = re.sub(r'\s+', ' ', normalized_text).strip()
        return normalized_text 