"""
Configuration settings for the Habit Tracker backend.

This file contains non-sensitive configuration constants. 
Sensitive values (API keys, secrets) are loaded from environment variables.
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Google Sheets Configuration
GOOGLE_SHEETS_ID = "1XNStkzcSwSxsPQ6-XRNL1wCjwfc1MQeEhDRJOPB2u1s"

# Google Calendar Configuration
GOOGLE_CALENDAR_CREDENTIALS_FILE = "google_calendar_credentials.json"
GOOGLE_CALENDAR_TOKEN_FILE = "google_calendar_token.json"

# Supabase Configuration
SUPABASE_URL = "https://tprmeubgiatqbbwfkcdt.supabase.co"  # Public URL - safe to commit
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")  # Secret - use environment variable
SUPABASE_TABLE_NAME = "ht-calendar-events"

# Server Configuration
API_HOST = "0.0.0.0"
API_PORT = 8000
FRONTEND_URL = "http://localhost:3000"

# Data Source Configuration
DEFAULT_DATA_SOURCE = "supabase"  # Options: "supabase", "simple_google_sheets", "google_sheets_api", "mock"

# API Configuration
CORS_ORIGINS = [
    "http://localhost:3000",  # React dev server
    "http://127.0.0.1:3000",  # Alternative localhost
]

# Debug Settings
DEBUG_MODE = True
VERBOSE_LOGGING = True
