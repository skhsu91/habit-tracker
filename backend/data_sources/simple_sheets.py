import pandas as pd
import requests
from typing import List
from datetime import datetime, timedelta
import json
import re
from .base import DataSource, HabitEvent

class SimpleGoogleSheetsDataSource(DataSource):
    """Simple Google Sheets integration using CSV export (no authentication needed)"""
    
    def __init__(self, sheet_id: str):
        super().__init__("google_sheets_simple")
        self.sheet_id = sheet_id
        # Google Sheets CSV export URL format
        self.csv_url = f"https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv"
    
    async def is_available(self) -> bool:
        """Check if the Google Sheet is accessible"""
        try:
            response = requests.get(self.csv_url, timeout=10)
            return response.status_code == 200 and len(response.content) > 0
        except Exception as e:
            print(f"Google Sheets availability check failed: {e}")
            return False
    
    def _parse_categories(self, categories_str: str) -> List[str]:
        """Parse the categories string into a list of clean category names"""
        if not categories_str or categories_str.lower() in ['none', 'null', '']:
            return []
        
        try:
            # Handle your format: ["`workout","exercise","self-care`"]
            # Remove outer brackets and quotes, then split by comma
            categories_str = categories_str.strip('[]')
            
            # Use regex to find all quoted strings
            matches = re.findall(r'["`]([^"`]+)["`]', categories_str)
            if matches:
                return [cat.strip() for cat in matches]
            
            # Fallback: simple comma split
            categories = [cat.strip().strip('"`') for cat in categories_str.split(',')]
            return [cat for cat in categories if cat]
            
        except Exception as e:
            print(f"Error parsing categories '{categories_str}': {e}")
            return []
    
    def _parse_participants(self, participants_str: str) -> List[str]:
        """Parse participants string into list"""
        if not participants_str or participants_str.lower() in ['none', 'null', '']:
            return None
        
        try:
            # Split by comma and clean up
            participants = [p.strip() for p in participants_str.split(',')]
            return [p for p in participants if p and p.lower() != 'none']
        except Exception:
            return None
    
    async def fetch_all_habits(self) -> List[HabitEvent]:
        """Fetch all habits from Google Sheets CSV export"""
        try:
            print(f"Fetching data from: {self.csv_url}")
            
            # Download CSV data
            response = requests.get(self.csv_url, timeout=30)
            response.raise_for_status()
            
            # Read CSV into pandas DataFrame
            from io import StringIO
            df = pd.read_csv(StringIO(response.text))
            
            print(f"Loaded {len(df)} rows from Google Sheets")
            print(f"Columns: {list(df.columns)}")
            
            habits = []
            for index, row in df.iterrows():
                try:
                    # Parse your specific data format
                    habit = HabitEvent(
                        id=str(row['ID']),
                        name=str(row['Name']),
                        date=str(row['Date']).strip('"'),  # Remove quotes around date
                        participants=self._parse_participants(str(row['Participants'])),
                        duration=int(float(row['Duration'])) if pd.notna(row['Duration']) else 0,
                        categories=self._parse_categories(str(row['Categories'])),
                        source=self.name
                    )
                    habits.append(habit)
                    print(f"Parsed habit: {habit.name} on {habit.date} with categories {habit.categories}")
                    
                except Exception as e:
                    print(f"Error parsing row {index}: {row.to_dict()}")
                    print(f"Error: {e}")
                    continue
            
            print(f"Successfully parsed {len(habits)} habits")
            return habits
            
        except Exception as e:
            print(f"Error fetching from Google Sheets: {e}")
            return []
    
    async def fetch_habits_by_date_range(self, start_date: datetime, end_date: datetime) -> List[HabitEvent]:
        """Fetch habits within a specific date range"""
        all_habits = await self.fetch_all_habits()
        
        filtered_habits = []
        for habit in all_habits:
            try:
                # Parse the ISO format date
                habit_date = datetime.fromisoformat(habit.date.replace('Z', '+00:00'))
                if start_date <= habit_date <= end_date:
                    filtered_habits.append(habit)
            except Exception as e:
                print(f"Error parsing date for habit {habit.id}: {habit.date}, Error: {e}")
                continue
        
        return filtered_habits

