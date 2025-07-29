from difflib import SequenceMatcher
from typing import List, Dict
import numpy as np

def compute_diff(final: str, user: str) -> List[Dict]:
    matcher = SequenceMatcher(None, final, user)
    changes = []
    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        changes.append({
            "op": tag,
            "text": user[j1:j2] if tag != 'delete' else final[i1:i2]
        })
    return changes

def wer(ref: str, hyp: str) -> float:
    ref_words = ref.split()
    hyp_words = hyp.split()
    d = np.zeros((len(ref_words)+1, len(hyp_words)+1), dtype=int)
    for i in range(len(ref_words)+1):
        d[i][0] = i
    for j in range(len(hyp_words)+1):
        d[0][j] = j
    for i in range(1, len(ref_words)+1):
        for j in range(1, len(hyp_words)+1):
            if ref_words[i-1] == hyp_words[j-1]:
                d[i][j] = d[i-1][j-1]
            else:
                d[i][j] = 1 + min(d[i-1][j], d[i][j-1], d[i-1][j-1])
    return d[len(ref_words)][len(hyp_words)] / max(len(ref_words), 1)

def cer(ref: str, hyp: str) -> float:
    ref_chars = list(ref)
    hyp_chars = list(hyp)
    d = np.zeros((len(ref_chars)+1, len(hyp_chars)+1), dtype=int)
    for i in range(len(ref_chars)+1):
        d[i][0] = i
    for j in range(len(hyp_chars)+1):
        d[0][j] = j
    for i in range(1, len(ref_chars)+1):
        for j in range(1, len(hyp_chars)+1):
            if ref_chars[i-1] == hyp_chars[j-1]:
                d[i][j] = d[i-1][j-1]
            else:
                d[i][j] = 1 + min(d[i-1][j], d[i][j-1], d[i-1][j-1])
    return d[len(ref_chars)][len(hyp_chars)] / max(len(ref_chars), 1)
