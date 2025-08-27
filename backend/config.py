"""
Configuration settings for the Habit Tracker backend.

This file contains configuration constants that would otherwise be stored
in environment variables. This makes the application easier to set up
and more reliable across different environments.
"""

# Google Sheets Configuration
GOOGLE_SHEETS_ID = "1XNStkzcSwSxsPQ6-XRNL1wCjwfc1MQeEhDRJOPB2u1s"

# Google Calendar Configuration
GOOGLE_CALENDAR_CREDENTIALS_FILE = "google_calendar_credentials.json"
GOOGLE_CALENDAR_TOKEN_FILE = "google_calendar_token.json"

# Server Configuration
API_HOST = "0.0.0.0"
API_PORT = 8000
FRONTEND_URL = "http://localhost:3000"

# Data Source Configuration
DEFAULT_DATA_SOURCE = "simple_google_sheets"  # Options: "mock", "simple_google_sheets", "google_sheets_api"

# API Configuration
CORS_ORIGINS = [
    "http://localhost:3000",  # React dev server
    "http://127.0.0.1:3000",  # Alternative localhost
]

# Debug Settings
DEBUG_MODE = True
VERBOSE_LOGGING = True
