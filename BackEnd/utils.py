from gtts import gTTS
from io import BytesIO
from base64 import b64encode

def generate_audio(prompt: str):
    tts = gTTS(prompt)
    buf = BytesIO()
    tts.write_to_fp(buf)
    audio_bytes = buf.getvalue()
    base64_audio = b64encode(audio_bytes).decode("utf-8")
    return base64_audio
