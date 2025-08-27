from typing import List, Optional
from datetime import datetime, timedelta
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from supabase import create_client, Client
from .base import DataSource, HabitEvent
from config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_TABLE_NAME


class SupabaseDataSource(DataSource):
    """Supabase PostgreSQL integration for habit data"""
    
    def __init__(self):
        super().__init__("supabase")
        self.supabase: Optional[Client] = None
        self.table_name = SUPABASE_TABLE_NAME
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize Supabase client"""
        try:
            if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
                raise ValueError("Supabase URL or service role key not configured")
            
            self.supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
            print(f"✅ Supabase client initialized for table: {self.table_name}")
            
        except Exception as e:
            print(f"❌ Failed to initialize Supabase client: {e}")
            self.supabase = None
    
    async def is_available(self) -> bool:
        """Check if Supabase is available and accessible"""
        if not self.supabase:
            return False
        
        try:
            # Simple test query to check connectivity
            response = self.supabase.table(self.table_name).select("id").limit(1).execute()
            return True
        except Exception as e:
            print(f"❌ Supabase connectivity test failed: {e}")
            return False
    
    async def fetch_all_habits(self) -> List[HabitEvent]:
        """Fetch all habit events from Supabase"""
        if not self.supabase:
            return []
        
        try:
            response = self.supabase.table(self.table_name).select("*").execute()
            
            habits = []
            for row in response.data:
                habit = self._row_to_habit_event(row)
                if habit:
                    habits.append(habit)
            
            return self.add_source_metadata(habits)
            
        except Exception as e:
            print(f"❌ Failed to fetch habits from Supabase: {e}")
            return []
    
    async def fetch_habits_by_date_range(self, start_date: datetime, end_date: datetime) -> List[HabitEvent]:
        """Fetch habits within a specific date range from Supabase"""
        if not self.supabase:
            return []
        
        try:
            # Convert to ISO format for Supabase
            start_iso = start_date.isoformat()
            end_iso = end_date.isoformat()
            
            response = (self.supabase.table(self.table_name)
                       .select("*")
                       .gte("date", start_iso)
                       .lte("date", end_iso)
                       .order("date")
                       .execute())
            
            habits = []
            for row in response.data:
                habit = self._row_to_habit_event(row)
                if habit:
                    habits.append(habit)
            
            return self.add_source_metadata(habits)
            
        except Exception as e:
            print(f"❌ Failed to fetch habits by date range from Supabase: {e}")
            return []
    
    def _row_to_habit_event(self, row: dict) -> Optional[HabitEvent]:
        """Convert Supabase row to HabitEvent"""
        try:
            return HabitEvent(
                id=row["id"],
                name=row["name"],
                date=row["date"],
                participants=row.get("participants"),  # This is already a list from PostgreSQL array
                duration=row["duration"],
                categories=row["categories"],  # This is already a list from PostgreSQL array
                source=self.name
            )
        except Exception as e:
            print(f"❌ Failed to convert row to HabitEvent: {e}, Row: {row}")
            return None
    
    async def create_habit(self, habit: HabitEvent) -> bool:
        """Create a new habit event in Supabase"""
        if not self.supabase:
            return False
        
        try:
            # Convert HabitEvent to dict for Supabase
            habit_data = {
                "id": habit.id,
                "name": habit.name,
                "date": habit.date,
                "participants": habit.participants,
                "duration": habit.duration,
                "categories": habit.categories
            }
            
            response = self.supabase.table(self.table_name).insert(habit_data).execute()
            print(f"✅ Created habit in Supabase: {habit.name}")
            return True
            
        except Exception as e:
            print(f"❌ Failed to create habit in Supabase: {e}")
            return False
    
    async def test_connection(self) -> dict:
        """Test the Supabase connection and return status"""
        if not self.supabase:
            return {
                "status": "error",
                "message": "Supabase client not initialized",
                "available": False
            }
        
        try:
            # Test basic connectivity
            response = self.supabase.table(self.table_name).select("id").limit(1).execute()
            
            # Count total records
            count_response = self.supabase.table(self.table_name).select("id", count="exact").execute()
            record_count = count_response.count
            
            return {
                "status": "success",
                "message": f"Connected to Supabase table '{self.table_name}'",
                "available": True,
                "table_name": self.table_name,
                "record_count": record_count
            }
            
        except Exception as e:
            return {
                "status": "error", 
                "message": f"Supabase connection test failed: {str(e)}",
                "available": False
            }
