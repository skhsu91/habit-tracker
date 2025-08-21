# Google Calendar Integration Setup

This guide will help you set up Google Calendar integration for your Habit Tracker application.

## Overview

The Google Calendar integration allows your habit tracker to:
- Show upcoming events in the "Planned for Today" section
- Display real-time calendar data instead of mock events
- Keep your habits and calendar events synchronized

## Prerequisites

1. A Google account with Google Calendar access
2. A Google Cloud Console project

## Setup Steps

### 1. Create a Google Cloud Console Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click on it and press "Enable"

### 2. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client ID"
3. If prompted, configure the OAuth consent screen:
   - Choose "External" user type
   - Fill in the required application information
   - Add your email to test users
4. Choose "Web application" as the application type
5. Add authorized redirect URIs:
   - `http://localhost:8080/auth/google/callback` (for local development)
6. Download the credentials JSON file

### 3. Configure Your Application

1. Rename the downloaded credentials file to `google_calendar_credentials.json`
2. Place it in your backend directory: `/Users/andyhsu/habit-tracker/backend/google_calendar_credentials.json`
3. **Important**: Add this file to your `.gitignore` to keep credentials secure

### 4. Test the Integration

1. Restart your backend server
2. Go to your habit tracker frontend
3. Navigate to the Overview tab
4. In the "Planned for Today" section, you should see a "Connect Calendar" button
5. Click the button to authorize access to your Google Calendar
6. After authorization, your upcoming events will appear in the section

## Security Notes

- **Never commit credentials files to version control**
- The `google_calendar_credentials.json` file contains sensitive information
- For production deployment, use environment variables or secure credential storage
- The OAuth token will be automatically refreshed when needed

## Troubleshooting

### "Calendar source not initialized" message
- Ensure the `google_calendar_credentials.json` file is in the correct location
- Check that the Google Calendar API is enabled in your Google Cloud project

### "Failed to generate authorization URL" error
- Verify the credentials file format is correct
- Ensure the OAuth 2.0 client is configured for web applications
- Check that the redirect URI matches exactly

### Authorization callback issues
- Make sure the redirect URI in your Google Cloud Console matches the backend URL
- Ensure both frontend and backend servers are running

## Current Status

✅ **Backend Integration**: Complete - Google Calendar API calls implemented
✅ **Frontend UI**: Complete - Authentication status and connect button added
⚠️ **OAuth Flow**: Partially implemented - requires credentials file setup
⚠️ **Token Storage**: Basic implementation - production apps should use secure storage

## Next Steps

1. Set up your Google Cloud project and download credentials
2. Test the OAuth flow
3. Verify that real calendar events appear in the "Planned for Today" section
4. Consider implementing refresh token handling for production use

---

**Note**: This integration uses Google's OAuth 2.0 flow and requires user consent to access calendar data. The application only requests read-only access to calendar events.
