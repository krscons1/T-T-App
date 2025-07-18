import os
from dotenv import load_dotenv
from sarvamai import SarvamAI

load_dotenv()

SARVAM_API_KEY = os.getenv("SARVAM_API_KEY")
if not SARVAM_API_KEY:
    raise ValueError("SARVAM_API_KEY is not set in the environment or .env file")
client = SarvamAI(api_subscription_key=SARVAM_API_KEY)

def get_more_accurate_translation(transcribed_text: str, translated_text: str) -> str:
    """
    Use Sarvam LLM to compare the original Tamil and the initial English translation,
    and output a grammatically correct, natural, and contextually adapted English translation.
    Only output the improved English translation as a single, natural passage. Do NOT include any explanations, headings, markdown, or extra comments.
    """
    messages = [
        {
            "role": "system",
            "content": (
                "You are a professional literary translator. Your job is to compare the original Tamil passage and the initial English translation provided. "
                "If the initial translation is inaccurate, awkward, ungrammatical, or misses cultural nuance, rewrite it completely to be accurate, natural, and idiomatic in English, as if it were originally written by a native English speaker. "
                "Pay special attention to grammar, sentence structure, and clarity. Make sure each sentence is meaningful and the passage flows naturally. "
                "When translating metaphors or medical references, use the most natural and idiomatic English phrasing, even if it means rewording the literal meaning for clarity. "
                "If the initial translation is already perfect, you may return it as is. "
                "Do NOT include any explanations, bullet points, headings, markdown, or meta-comments. "
                "Do NOT mention that you are revising or improving the translation. "
                "Only output the improved English translation as a single, natural English passage."
            )
        },
        {
            "role": "user",
            "content": (
                f"Original Tamil passage:\n{transcribed_text}\n\n"
                f"Initial English translation:\n{translated_text}\n\n"
                "Please compare both and provide the most accurate, grammatically correct, and natural English translation possible. Only output the improved translation as a single passage."
            )
        }
    ]
    response = client.chat.completions(
        messages=messages,
        temperature=0.2
    )
    return response.choices[0].message.content 