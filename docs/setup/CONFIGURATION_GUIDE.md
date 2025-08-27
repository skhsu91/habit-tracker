# 🔧 Configuration Guide - Habit Tracker

## 📋 **Configuration Overview**

As of January 16, 2025, the Habit Tracker now uses a centralized configuration file instead of environment variables for easier setup and management.

## 📁 **Configuration File: `/backend/config.py`**

### **Current Settings:**
```python
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

# CORS Configuration
CORS_ORIGINS = [
    "http://localhost:3000",  # React dev server
    "http://127.0.0.1:3000",  # Alternative localhost
]
```

## ⚙️ **How to Modify Configuration**

### **Change Data Source:**
- **Mock Data**: Set `DEFAULT_DATA_SOURCE = "mock"`
- **Google Sheets**: Set `DEFAULT_DATA_SOURCE = "simple_google_sheets"`
- **Advanced Google Sheets API**: Set `DEFAULT_DATA_SOURCE = "google_sheets_api"`

### **Change Google Sheets:**
- Update `GOOGLE_SHEETS_ID` with your sheet ID
- Sheet must be publicly viewable or have CSV export enabled

### **Change Server Port:**
- Update `API_PORT = 8001` (or any available port)
- Update `FRONTEND_URL` if frontend runs on different port

## 🚀 **Startup Process**

### **Data Source Loading:**
When the backend starts, you'll see these status messages:
```
✅ Added Simple Google Sheets source with ID: 1XNStkzcSwSxsPQ6-XRNL1wCjwfc1MQeEhDRJOPB2u1s
📊 Set Simple Google Sheets as primary data source
✅ Added Google Calendar source for upcoming events
```

### **Troubleshooting:**
- **❌ Failed to initialize Simple Google Sheets source**: Check if sheet ID is correct and sheet is publicly accessible
- **🧪 Using mock data as primary source**: Check `DEFAULT_DATA_SOURCE` setting in config
- **⚠️ No Google Sheets ID configured**: `GOOGLE_SHEETS_ID` is empty or None

## 📊 **Benefits of Config File Approach**

### **✅ Advantages:**
- **No Environment Variables**: Everything stored in version-controlled files
- **Easy Modifications**: Just edit `config.py` and restart server
- **Clear Documentation**: All settings visible in one place
- **Team Collaboration**: Configuration shared across development environments
- **Quick Switching**: Easy to switch between data sources for testing

### **🔧 Migration from Environment Variables:**
- **Before**: `export GOOGLE_SHEETS_ID="..."`
- **After**: Edit `GOOGLE_SHEETS_ID` in `config.py`

## 🎯 **Next Steps**

1. **Google Calendar OAuth**: Follow `GOOGLE_CALENDAR_SETUP.md` to set up OAuth credentials
2. **Custom Sheets**: Update `GOOGLE_SHEETS_ID` to point to your own habit tracking sheet
3. **Production Deployment**: Consider environment-specific config files for production

---

*Configuration system implemented January 16, 2025 for improved reliability and ease of use.*
