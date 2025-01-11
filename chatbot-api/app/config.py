import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Expose any config variables you need here
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
