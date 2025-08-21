from typing import List, Optional
from datetime import datetime, timedelta
import os
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from .base import DataSource, HabitEvent

class GoogleSheetsDataSource(DataSource):
    """Google Sheets integration for habit data"""
    
    def __init__(self, sheet_id: str, credentials_path: Optional[str] = None):
        super().__init__("google_sheets")
        self.sheet_id = sheet_id
        self.credentials_path = credentials_path
        self.service = None
        self.scopes = ['https://www.googleapis.com/auth/spreadsheets.readonly']
    
    async def _get_service(self):
        """Initialize Google Sheets service"""
        if self.service is None:
            if self.credentials_path and os.path.exists(self.credentials_path):
                credentials = Credentials.from_service_account_file(
                    self.credentials_path, scopes=self.scopes
                )
                self.service = build('sheets', 'v4', credentials=credentials)
            else:
                raise ValueError("Google Sheets credentials not found or not configured")
        return self.service
    
    async def is_available(self) -> bool:
        """Check if Google Sheets is configured and accessible"""
        # For now, return False since Google Sheets dependencies are disabled
        return False
    
    async def fetch_all_habits(self) -> List[HabitEvent]:
        """Fetch all habits from Google Sheets"""
        # For now, return empty list since Google Sheets dependencies are disabled
        return []
    
    async def fetch_habits_by_date_range(self, start_date: datetime, end_date: datetime) -> List[HabitEvent]:
        """Fetch habits within a specific date range"""
        # For now, return empty list since Google Sheets dependencies are disabled
        return []
