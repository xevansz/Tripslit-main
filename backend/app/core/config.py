"""Configuration settings for the application."""

import logging
import os
from pathlib import Path

from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent.parent.parent
load_dotenv(ROOT_DIR / ".env")

_logger = logging.getLogger(__name__)

# Database
MONGO_URL = os.environ.get("MONGO_URL", "")
DB_NAME = os.environ.get("DB_NAME", "tripsplit")
USE_DUMMY_DB = os.environ.get("USE_DUMMY_DB", "true").lower() == "true"

# JWT
JWT_SECRET = os.environ.get("JWT_SECRET", "tripsplit_secret")
JWT_ALG = "HS256"

if JWT_SECRET == "tripsplit_secret":
    _logger.warning("Using default JWT_SECRET — set JWT_SECRET env var in production!")

# External Services
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

# CORS
CORS_ORIGINS = ["*"]
