from typing import List, Dict, Any
from datetime import datetime, timedelta
from .base import DataSource, HabitEvent
from .mock_data import MockDataSource
from .google_sheets import GoogleSheetsDataSource
from .simple_sheets import SimpleGoogleSheetsDataSource
from .google_calendar import GoogleCalendarSource
import os

class DataSourceManager:
    """Manages multiple data sources and provides unified access to habit data"""
    
    def __init__(self):
        self.sources: List[DataSource] = []
        self.primary_source: DataSource = None
        self.calendar_source: GoogleCalendarSource = None  # Dedicated calendar source
        self._initialize_sources()
    
    def _initialize_sources(self):
        """Initialize and configure available data sources"""
        
        # Always add mock data source for development
        mock_source = MockDataSource()
        self.sources.append(mock_source)
        self.primary_source = mock_source  # Default to mock for now
        
        # Try to add Simple Google Sheets (CSV-based, no auth needed)
        sheet_id = os.getenv('GOOGLE_SHEETS_ID')
        
        if sheet_id:
            try:
                simple_sheets_source = SimpleGoogleSheetsDataSource(sheet_id)
                self.sources.append(simple_sheets_source)
                print(f"Added Simple Google Sheets source with ID: {sheet_id}")
                # Make Google Sheets the primary source since it's working!
                self.primary_source = simple_sheets_source
            except Exception as e:
                print(f"Failed to initialize Simple Google Sheets source: {e}")
        
        # Try to add full Google Sheets API if configured with service account
        credentials_path = os.getenv('GOOGLE_SERVICE_ACCOUNT_FILE')
        
        if sheet_id and credentials_path:
            try:
                sheets_source = GoogleSheetsDataSource(sheet_id, credentials_path)
                self.sources.append(sheets_source)
                print(f"Added full Google Sheets API source")
            except Exception as e:
                print(f"Failed to initialize Google Sheets API source: {e}")
        
        # Try to add Google Calendar source for upcoming events
        try:
            calendar_source = GoogleCalendarSource()
            self.calendar_source = calendar_source
            print(f"Added Google Calendar source for upcoming events")
        except Exception as e:
            print(f"Failed to initialize Google Calendar source: {e}")
    
    async def get_available_sources(self) -> List[str]:
        """Get list of available data source names"""
        available = []
        for source in self.sources:
            if await source.is_available():
                available.append(source.name)
        return available
    
    async def fetch_all_habits(self, source_name: str = None) -> List[HabitEvent]:
        """Fetch all habits from specified source or primary source"""
        source = self._get_source(source_name)
        if source and await source.is_available():
            return await source.fetch_all_habits()
        return []
    
    async def fetch_habits_by_date_range(self, start_date: datetime, end_date: datetime, source_name: str = None) -> List[HabitEvent]:
        """Fetch habits within date range from specified source or primary source"""
        source = self._get_source(source_name)
        if source and await source.is_available():
            return await source.fetch_habits_by_date_range(start_date, end_date)
        return []
    
    async def fetch_habits_from_all_sources(self) -> List[HabitEvent]:
        """Fetch habits from all available sources and merge them"""
        all_habits = []
        
        for source in self.sources:
            if await source.is_available():
                try:
                    habits = await source.fetch_all_habits()
                    all_habits.extend(habits)
                except Exception as e:
                    print(f"Error fetching from {source.name}: {e}")
        
        # Remove duplicates based on ID (prefer newer sources)
        seen_ids = set()
        unique_habits = []
        
        # Reverse to prioritize later sources (like Google Sheets over mock)
        for habit in reversed(all_habits):
            if habit.id not in seen_ids:
                seen_ids.add(habit.id)
                unique_habits.append(habit)
        
        return list(reversed(unique_habits))  # Restore original order
    
    async def fetch_recent_habits(self, days: int = 7, source_name: str = None) -> List[HabitEvent]:
        """Fetch recent habits from specified source or primary source"""
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        return await self.fetch_habits_by_date_range(start_date, end_date, source_name)
    
    def _get_source(self, source_name: str = None) -> DataSource:
        """Get source by name or return primary source"""
        if source_name:
            for source in self.sources:
                if source.name == source_name:
                    return source
            return None
        return self.primary_source
    
    def add_source(self, source: DataSource):
        """Add a new data source"""
        self.sources.append(source)
    
    def set_primary_source(self, source_name: str):
        """Set the primary data source by name"""
        source = self._get_source(source_name)
        if source:
            self.primary_source = source
            return True
        return False
    
    async def get_upcoming_today(self) -> List[str]:
        """Get upcoming events for today from Google Calendar"""
        if self.calendar_source:
            try:
                return await self.calendar_source.get_upcoming_today()
            except Exception as e:
                print(f"Error fetching upcoming events from Google Calendar: {e}")
        
        # Fallback to mock data if Google Calendar is not available
        return ["Evening meditation", "Reading session"]  # Mock upcoming events
