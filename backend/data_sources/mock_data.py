from typing import List
from datetime import datetime, timedelta
from .base import DataSource, HabitEvent

class MockDataSource(DataSource):
    """Mock data source for development and testing"""
    
    def __init__(self):
        super().__init__("mock_data")
        self._sample_data = [
            HabitEvent(
                id="cal_001",
                name="Morning Workout",
                date="2025-01-14T06:00:00.000Z",
                participants=None,
                duration=60,
                categories=["fitness", "morning"],
                source=self.name
            ),
            HabitEvent(
                id="cal_002", 
                name="Grocery Shopping",
                date="2025-01-14T10:30:00.000Z",
                participants=None,
                duration=45,
                categories=["food", "errands"],
                source=self.name
            ),
            HabitEvent(
                id="cal_003",
                name="Cooking Dinner",
                date="2025-01-14T18:00:00.000Z",
                participants=["partner"],
                duration=90,
                categories=["food", "cooking"],
                source=self.name
            ),
            HabitEvent(
                id="cal_004",
                name="Interview Study",
                date="2025-01-14T20:00:00.000Z",
                participants=None,
                duration=120,
                categories=["career", "learning"],
                source=self.name
            ),
            HabitEvent(
                id="cal_005",
                name="Evening Run",
                date="2025-01-13T19:00:00.000Z",
                participants=None,
                duration=30,
                categories=["fitness", "cardio"],
                source=self.name
            ),
            HabitEvent(
                id="cal_006",
                name="Meal Prep",
                date="2025-01-13T14:00:00.000Z",
                participants=None,
                duration=120,
                categories=["food", "cooking", "prep"],
                source=self.name
            )
        ]
    
    async def is_available(self) -> bool:
        """Mock data is always available"""
        return True
    
    async def fetch_all_habits(self) -> List[HabitEvent]:
        """Return all mock data"""
        return self._sample_data.copy()
    
    async def fetch_habits_by_date_range(self, start_date: datetime, end_date: datetime) -> List[HabitEvent]:
        """Filter mock data by date range"""
        filtered_habits = []
        
        for habit in self._sample_data:
            try:
                habit_date = datetime.fromisoformat(habit.date.replace('Z', '+00:00'))
                if start_date <= habit_date <= end_date:
                    filtered_habits.append(habit)
            except Exception:
                continue
        
        return filtered_habits

