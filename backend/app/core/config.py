"""Configuration settings for the application."""

import os
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent.parent.parent
load_dotenv(ROOT_DIR / ".env")

# Database
MONGO_URL = os.environ.get("MONGO_URL", "")
DB_NAME = os.environ.get("DB_NAME", "tripsplit")
USE_DUMMY_DB = os.environ.get("USE_DUMMY_DB", "true").lower() == "true"

# JWT
JWT_SECRET = os.environ.get("JWT_SECRET", "tripsplit_secret")
JWT_ALG = "HS256"

# External Services
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")

# CORS
CORS_ORIGINS = ["*"]
