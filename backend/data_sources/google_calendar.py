"""
Google Calendar Integration for Habit Tracker

This module integrates with Google Calendar API to fetch upcoming events
for the "Planned for Today" section of the dashboard.
"""

import os
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from .base import DataSource, HabitEvent

class GoogleCalendarEvent:
    """Represents a Google Calendar event with relevant fields"""
    
    def __init__(self, event_data: Dict[str, Any]):
        self.id = event_data.get('id', '')
        self.summary = event_data.get('summary', 'Untitled Event')
        self.description = event_data.get('description', '')
        self.location = event_data.get('location', '')
        
        # Handle start time - could be date or dateTime
        start = event_data.get('start', {})
        if 'dateTime' in start:
            self.start_time = datetime.fromisoformat(start['dateTime'].replace('Z', '+00:00'))
            self.all_day = False
        elif 'date' in start:
            self.start_time = datetime.fromisoformat(start['date'] + 'T00:00:00')
            self.all_day = True
        else:
            self.start_time = datetime.now()
            self.all_day = False
            
        # Handle end time
        end = event_data.get('end', {})
        if 'dateTime' in end:
            self.end_time = datetime.fromisoformat(end['dateTime'].replace('Z', '+00:00'))
        elif 'date' in end:
            self.end_time = datetime.fromisoformat(end['date'] + 'T23:59:59')
        else:
            self.end_time = self.start_time + timedelta(hours=1)  # Default 1 hour duration
    
    def get_duration_minutes(self) -> int:
        """Calculate duration in minutes"""
        if self.all_day:
            return 0  # All day events don't have a specific duration
        return int((self.end_time - self.start_time).total_seconds() / 60)
    
    def is_today(self) -> bool:
        """Check if event is today"""
        today = datetime.now().date()
        return self.start_time.date() == today
    
    def is_upcoming_today(self) -> bool:
        """Check if event is upcoming today (hasn't started yet)"""
        now = datetime.now()
        return self.is_today() and self.start_time > now
    
    def format_time(self) -> str:
        """Format the time for display"""
        if self.all_day:
            return "All day"
        return self.start_time.strftime("%I:%M %p").lstrip('0')
    
    def to_display_string(self) -> str:
        """Convert to display string for upcoming events"""
        time_str = self.format_time()
        if self.location:
            return f"{time_str} - {self.summary} ({self.location})"
        return f"{time_str} - {self.summary}"


class GoogleCalendarSource(DataSource):
    """Google Calendar data source for fetching upcoming events"""
    
    def __init__(self):
        super().__init__()
        self.name = "google_calendar"
        self.credentials_file = "google_calendar_credentials.json"
        self.token_file = "google_calendar_token.json"
        self.scopes = ['https://www.googleapis.com/auth/calendar.readonly']
        self.service = None
        
    async def initialize(self) -> bool:
        """Initialize Google Calendar service with authentication"""
        try:
            creds = self._get_credentials()
            if creds:
                self.service = build('calendar', 'v3', credentials=creds)
                return True
            return False
        except Exception as e:
            print(f"Failed to initialize Google Calendar: {e}")
            return False
    
    def _get_credentials(self) -> Optional[Credentials]:
        """Get or refresh Google Calendar credentials"""
        creds = None
        
        # Load existing token if available
        if os.path.exists(self.token_file):
            try:
                creds = Credentials.from_authorized_user_file(self.token_file, self.scopes)
            except Exception as e:
                print(f"Error loading token: {e}")
        
        # If there are no valid credentials, try to refresh or get new ones
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                try:
                    creds.refresh(Request())
                except Exception as e:
                    print(f"Error refreshing token: {e}")
                    return None
            else:
                # No valid credentials, would need OAuth flow
                # For now, return None - this would require user authorization
                print("No valid Google Calendar credentials found. OAuth flow needed.")
                return None
            
            # Save the credentials for the next run
            try:
                with open(self.token_file, 'w') as token:
                    token.write(creds.to_json())
            except Exception as e:
                print(f"Error saving token: {e}")
        
        return creds
    
    async def get_events(self, start_date: datetime, end_date: datetime) -> List[HabitEvent]:
        """Fetch events from Google Calendar (not used for habits, but kept for interface compatibility)"""
        return []  # We don't convert calendar events to habit events
    
    async def get_upcoming_today(self) -> List[str]:
        """Get upcoming events for today formatted as strings"""
        if not self.service:
            await self.initialize()
            if not self.service:
                return []
        
        try:
            # Get today's date range
            now = datetime.now()
            start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
            end_of_day = now.replace(hour=23, minute=59, second=59, microsecond=999999)
            
            # Format for Google Calendar API (RFC3339)
            time_min = start_of_day.isoformat() + 'Z'
            time_max = end_of_day.isoformat() + 'Z'
            
            # Call Google Calendar API
            events_result = self.service.events().list(
                calendarId='primary',
                timeMin=time_min,
                timeMax=time_max,
                maxResults=20,
                singleEvents=True,
                orderBy='startTime'
            ).execute()
            
            events = events_result.get('items', [])
            upcoming_events = []
            
            for event_data in events:
                calendar_event = GoogleCalendarEvent(event_data)
                if calendar_event.is_upcoming_today():
                    upcoming_events.append(calendar_event.to_display_string())
            
            return upcoming_events
            
        except HttpError as error:
            print(f"Google Calendar API error: {error}")
            return []
        except Exception as e:
            print(f"Error fetching Google Calendar events: {e}")
            return []
    
    async def test_connection(self) -> bool:
        """Test if Google Calendar connection is working"""
        if not self.service:
            return await self.initialize()
        
        try:
            # Try to get calendar list as a simple test
            calendars = self.service.calendarList().list().execute()
            return len(calendars.get('items', [])) > 0
        except Exception as e:
            print(f"Google Calendar connection test failed: {e}")
            return False

    def get_auth_url(self) -> Optional[str]:
        """Get the authorization URL for OAuth flow"""
        if not os.path.exists(self.credentials_file):
            print("Google Calendar credentials file not found. Please set up OAuth credentials.")
            return None
        
        try:
            flow = Flow.from_client_secrets_file(
                self.credentials_file,
                scopes=self.scopes,
                redirect_uri='http://localhost:8080/auth/google/callback'
            )
            
            auth_url, _ = flow.authorization_url(
                access_type='offline',
                include_granted_scopes='true'
            )
            
            return auth_url
        except Exception as e:
            print(f"Error generating auth URL: {e}")
            return None
