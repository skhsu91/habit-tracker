from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel

class HabitEvent(BaseModel):
    id: str
    name: str
    date: str  # ISO format datetime string
    participants: Optional[List[str]] = None
    duration: int  # in minutes
    categories: List[str]
    source: Optional[str] = None  # Track which data source this came from

class DataSource(ABC):
    """Abstract base class for all habit data sources"""
    
    def __init__(self, name: str):
        self.name = name
    
    @abstractmethod
    async def fetch_all_habits(self) -> List[HabitEvent]:
        """Fetch all habit events from this source"""
        pass
    
    @abstractmethod
    async def fetch_habits_by_date_range(self, start_date: datetime, end_date: datetime) -> List[HabitEvent]:
        """Fetch habits within a specific date range"""
        pass
    
    @abstractmethod
    async def is_available(self) -> bool:
        """Check if this data source is available and configured"""
        pass
    
    async def fetch_recent_habits(self, days: int = 7) -> List[HabitEvent]:
        """Fetch habits from the last N days (default implementation)"""
        end_date = datetime.now()
        start_date = end_date.replace(hour=0, minute=0, second=0, microsecond=0)
        start_date = start_date - timedelta(days=days)
        
        return await self.fetch_habits_by_date_range(start_date, end_date)
    
    def add_source_metadata(self, habits: List[HabitEvent]) -> List[HabitEvent]:
        """Add source metadata to habit events"""
        for habit in habits:
            habit.source = self.name
        return habits
