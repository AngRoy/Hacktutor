from google import genai
from google.genai import types
import os
from dotenv import load_dotenv


# Load environment variables from .env file
load_dotenv()

# Get an environment variable
api_key = os.environ.get("API_KEY")
client = None
TEXT_MODEL_NAME = 'gemini-2.0-flash-lite'
IMAGE_MODEL_NAME = 'gemini-2.0-flash-preview-image-generation' # Or check the latest supported name

def config_model():
    global client
    try:
        client = genai.Client(api_key='AIzaSyAdwfkU0G-dJeoHOByQYQfDT0B7d8JDdkU')
    except Exception as e:
        print(f"Error initializing client. Ensure GEMINI_API_KEY is set: {e}")
        exit()

def generate_text(prompt: str, model: str = TEXT_MODEL_NAME) -> str:
    result = client.models.generate_content(
        model=model,
        contents=prompt,
        config=types.GenerateContentConfig(
        response_modalities=["TEXT"]
    ),
    )

    part = result.candidates[0].content.parts[0]
    print(part.text)
    return (part.text)

def generate_image(prompt: str, model: str = IMAGE_MODEL_NAME) -> bytes:
    result = client.models.generate_content(
        model=IMAGE_MODEL_NAME,
        contents=prompt,
        config=types.GenerateContentConfig(
        response_modalities=["TEXT", "IMAGE"]
        ),
    )
    part = result.candidates[0].content.parts[1]
    return part.inline_data.data

# Initialize the model configuration
config_model()