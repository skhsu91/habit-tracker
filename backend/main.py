from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from pydantic import BaseModel
import os
from dotenv import load_dotenv

# Import our data source architecture
from data_sources.manager import DataSourceManager
from data_sources.base import HabitEvent

# Import tag validation utilities
from utils.tag_validation import TagValidator, TagValidationResult, validate_tags, suggest_tags

# Load environment variables
load_dotenv()

app = FastAPI(title="Habit Tracker API", version="1.0.0")

# Initialize data source manager
data_manager = DataSourceManager()

# Configure CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DailyMetrics(BaseModel):
    total_events: int
    total_duration: int
    categories_count: Dict[str, int]
    average_duration: float

class DashboardData(BaseModel):
    daily_metrics: DailyMetrics
    recent_events: List[HabitEvent]
    upcoming_today: List[str]  # Placeholder for future events
    available_sources: List[str]  # Show which data sources are available

@app.get("/")
async def root():
    available_sources = await data_manager.get_available_sources()
    return {
        "message": "Habit Tracker API", 
        "version": "1.0.0",
        "available_sources": available_sources
    }

@app.get("/api/sources")
async def get_data_sources():
    """Get available data sources"""
    return {
        "available_sources": await data_manager.get_available_sources(),
        "primary_source": data_manager.primary_source.name if data_manager.primary_source else None
    }

@app.get("/api/habits", response_model=List[HabitEvent])
async def get_all_habits(source: Optional[str] = Query(None, description="Data source to fetch from")):
    """Get all habit events from specified source or primary source"""
    try:
        if source == "all":
            return await data_manager.fetch_habits_from_all_sources()
        else:
            return await data_manager.fetch_all_habits(source)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching habits: {str(e)}")

@app.get("/api/habits/today", response_model=List[HabitEvent])
async def get_today_habits(source: Optional[str] = Query(None, description="Data source to fetch from")):
    """Get habits for today"""
    try:
        today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = today_start + timedelta(days=1)
        return await data_manager.fetch_habits_by_date_range(today_start, today_end, source)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching today's habits: {str(e)}")

@app.get("/api/habits/recent", response_model=List[HabitEvent])
async def get_recent_habits(
    days: int = Query(7, ge=1, le=365, description="Number of days to look back"),
    source: Optional[str] = Query(None, description="Data source to fetch from")
):
    """Get habits from the last N days"""
    try:
        return await data_manager.fetch_recent_habits(days, source)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching recent habits: {str(e)}")

@app.get("/api/metrics/daily", response_model=DailyMetrics)
async def get_daily_metrics(source: Optional[str] = Query(None, description="Data source to fetch from")):
    """Get daily metrics for the last 24 hours"""
    try:
        last_24h = datetime.now() - timedelta(hours=24)
        now = datetime.now()
        recent_habits = await data_manager.fetch_habits_by_date_range(last_24h, now, source)
        
        if not recent_habits:
            return DailyMetrics(
                total_events=0,
                total_duration=0,
                categories_count={},
                average_duration=0.0
            )
        
        total_duration = sum(habit.duration for habit in recent_habits)
        categories_count = {}
        
        for habit in recent_habits:
            for category in habit.categories:
                categories_count[category] = categories_count.get(category, 0) + 1
        
        return DailyMetrics(
            total_events=len(recent_habits),
            total_duration=total_duration,
            categories_count=categories_count,
            average_duration=total_duration / len(recent_habits)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating daily metrics: {str(e)}")

@app.get("/api/dashboard", response_model=DashboardData)
async def get_dashboard_data(source: Optional[str] = Query(None, description="Data source to fetch from")):
    """Get comprehensive dashboard data"""
    try:
        daily_metrics = await get_daily_metrics(source)
        recent_events = await get_recent_habits(7, source)
        available_sources = await data_manager.get_available_sources()
        
        # Get upcoming events from Google Calendar (or fallback to mock)
        upcoming_today = await data_manager.get_upcoming_today()
        
        return DashboardData(
            daily_metrics=daily_metrics,
            recent_events=recent_events,
            upcoming_today=upcoming_today,
            available_sources=available_sources
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching dashboard data: {str(e)}")

@app.get("/api/analytics/categories")
async def get_category_analytics(source: Optional[str] = Query(None, description="Data source to fetch from")):
    """Get analytics data for categories"""
    try:
        habits = await data_manager.fetch_all_habits(source)
        category_stats = {}
        
        for habit in habits:
            for category in habit.categories:
                if category not in category_stats:
                    category_stats[category] = {
                        "count": 0,
                        "total_duration": 0,
                        "events": []
                    }
                
                category_stats[category]["count"] += 1
                category_stats[category]["total_duration"] += habit.duration
                category_stats[category]["events"].append({
                    "name": habit.name,
                    "date": habit.date,
                    "duration": habit.duration
                })
        
        # Calculate averages
        for category in category_stats:
            stats = category_stats[category]
            stats["average_duration"] = stats["total_duration"] / stats["count"] if stats["count"] > 0 else 0
        
        return category_stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching category analytics: {str(e)}")

@app.get("/api/analytics/trends")
async def get_trend_analytics(
    days: int = Query(30, ge=1, le=365, description="Number of days to analyze"),
    source: Optional[str] = Query(None, description="Data source to fetch from")
):
    """Get trend data for charts"""
    try:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        habits = await data_manager.fetch_habits_by_date_range(start_date, end_date, source)
        
        # Group by date for trend analysis
        daily_trends = {}
        
        for habit in habits:
            try:
                date_str = habit.date[:10]  # Extract YYYY-MM-DD
                
                if date_str not in daily_trends:
                    daily_trends[date_str] = {
                        "date": date_str,
                        "total_events": 0,
                        "total_duration": 0,
                        "categories": set()
                    }
                
                daily_trends[date_str]["total_events"] += 1
                daily_trends[date_str]["total_duration"] += habit.duration
                daily_trends[date_str]["categories"].update(habit.categories)
            except Exception as e:
                print(f"Error processing habit {habit.id}: {e}")
                continue
        
        # Convert sets to lists for JSON serialization
        for date in daily_trends:
            daily_trends[date]["categories"] = list(daily_trends[date]["categories"])
            daily_trends[date]["unique_categories"] = len(daily_trends[date]["categories"])
        
        # Sort by date
        sorted_trends = sorted(daily_trends.values(), key=lambda x: x["date"])
        return sorted_trends
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching trend analytics: {str(e)}")

# Tab-Specific API Endpoints for Better Architecture

@app.get("/api/tabs/overview")
async def get_overview_tab_data(source: Optional[str] = Query(None, description="Data source to fetch from")):
    """
    Get all data needed for the Overview tab in one optimized call
    Returns: Complete overview data including metrics, recent events, and upcoming events
    """
    try:
        # This reuses the existing dashboard endpoint but with a clearer name and purpose
        daily_metrics = await get_daily_metrics(source)
        recent_events = await get_recent_habits(7, source)
        available_sources = await data_manager.get_available_sources()
        upcoming_today = await data_manager.get_upcoming_today()
        
        return DashboardData(
            daily_metrics=daily_metrics,
            recent_events=recent_events,
            upcoming_today=upcoming_today,
            available_sources=available_sources
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching overview data: {str(e)}")

@app.get("/api/tabs/habits")
async def get_habits_tab_data(
    source: Optional[str] = Query(None, description="Data source to fetch from"),
    search: Optional[str] = Query(None, description="Search term for filtering habits"),
    category: Optional[str] = Query(None, description="Category to filter by"),
    sort_by: Optional[str] = Query("date", description="Field to sort by: date, duration, name"),
    sort_order: Optional[str] = Query("desc", description="Sort order: asc, desc"),
    limit: Optional[int] = Query(None, ge=1, le=1000, description="Maximum number of habits to return")
):
    """
    Get optimized data for the All Habits tab with built-in filtering and sorting
    Returns: Filtered and sorted habits with metadata
    """
    try:
        # Get all habits from the data source
        all_habits = await data_manager.fetch_all_habits(source)
        
        # Apply server-side filtering
        filtered_habits = all_habits
        
        if search:
            search_lower = search.lower()
            filtered_habits = [
                habit for habit in filtered_habits
                if search_lower in habit.name.lower() or 
                   any(search_lower in cat.lower() for cat in habit.categories)
            ]
        
        if category:
            filtered_habits = [
                habit for habit in filtered_habits
                if category in habit.categories
            ]
        
        # Apply server-side sorting
        if sort_by == "date":
            filtered_habits.sort(
                key=lambda x: x.date, 
                reverse=(sort_order == "desc")
            )
        elif sort_by == "duration":
            filtered_habits.sort(
                key=lambda x: x.duration, 
                reverse=(sort_order == "desc")
            )
        elif sort_by == "name":
            filtered_habits.sort(
                key=lambda x: x.name.lower(), 
                reverse=(sort_order == "desc")
            )
        
        # Apply limit if specified
        if limit:
            filtered_habits = filtered_habits[:limit]
        
        # Get available categories for filter dropdown
        all_categories = set()
        for habit in all_habits:
            all_categories.update(habit.categories)
        
        return {
            "habits": filtered_habits,
            "total_count": len(all_habits),
            "filtered_count": len(filtered_habits),
            "available_categories": sorted(list(all_categories)),
            "applied_filters": {
                "search": search,
                "category": category,
                "sort_by": sort_by,
                "sort_order": sort_order,
                "limit": limit
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching habits tab data: {str(e)}")

@app.get("/api/tabs/analytics")
async def get_analytics_tab_data(
    source: Optional[str] = Query(None, description="Data source to fetch from"),
    time_range: int = Query(30, ge=1, le=365, description="Number of days to analyze"),
    category_filter: Optional[str] = Query(None, description="Filter analytics by specific category"),
    include_trends: bool = Query(True, description="Include trend data in response"),
    include_categories: bool = Query(True, description="Include category analytics in response")
):
    """
    Get optimized data for the Analytics tab with flexible filtering options
    Returns: Category analytics, trend data, and summary statistics
    """
    try:
        result = {}
        
        if include_categories:
            # Get category analytics (optionally filtered)
            category_data = await get_category_analytics(source)
            
            # Apply category filter if specified
            if category_filter and category_filter in category_data:
                result["category_analytics"] = {category_filter: category_data[category_filter]}
            else:
                result["category_analytics"] = category_data
        
        if include_trends:
            # Get trend analytics for the specified time range
            result["trend_analytics"] = await get_trend_analytics(time_range, source)
        
        # Add summary statistics
        if include_categories and "category_analytics" in result:
            categories = result["category_analytics"]
            result["summary"] = {
                "total_categories": len(categories),
                "total_events": sum(cat["count"] for cat in categories.values()),
                "total_duration": sum(cat["total_duration"] for cat in categories.values()),
                "average_events_per_category": sum(cat["count"] for cat in categories.values()) / len(categories) if categories else 0,
                "time_range_days": time_range,
                "category_filter": category_filter
            }
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching analytics tab data: {str(e)}")

# Tag Validation and Management Endpoints
@app.post("/api/tags/validate")
async def validate_habit_tags(tags: List[str]):
    """
    Validate tags against PRD requirements
    Returns validation results with errors, warnings, and suggestions
    """
    try:
        result = validate_tags(tags)
        return {
            "is_valid": result.is_valid,
            "normalized_tags": result.normalized_tags,
            "errors": result.errors,
            "warnings": result.warnings,
            "suggestions": result.suggestions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error validating tags: {str(e)}")

@app.get("/api/tags/suggest")
async def suggest_tags_for_habit(
    habit_name: str = Query(..., description="Habit name to suggest tags for"),
    limit: int = Query(5, ge=1, le=20, description="Maximum number of tag suggestions")
):
    """
    Get tag suggestions based on habit name
    Uses keyword matching to suggest appropriate tags from the approved set
    """
    try:
        suggestions = suggest_tags(habit_name, limit)
        return {
            "habit_name": habit_name,
            "suggested_tags": suggestions,
            "validation_rules": {
                "requires_umbrella_tag": True,
                "must_be_kebab_case": True,
                "approved_umbrellas": ["health", "food", "home", "transportation"]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error suggesting tags: {str(e)}")

@app.get("/api/tags/approved")
async def get_approved_tags():
    """
    Get the complete approved tag set organized by hierarchy
    Useful for building tag auto-complete and validation UIs
    """
    try:
        from utils.tag_validation import APPROVED_TAGS, UMBRELLA_TAGS, TAG_HIERARCHY, CONTEXTUAL_TAGS
        
        return {
            "umbrella_tags": list(UMBRELLA_TAGS),
            "all_approved_tags": list(APPROVED_TAGS),
            "tag_hierarchy": TAG_HIERARCHY,
            "contextual_tags": list(CONTEXTUAL_TAGS),
            "format_requirements": {
                "case_format": "kebab-case",
                "requires_umbrella": True,
                "allows_multiple_umbrellas": True
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching approved tags: {str(e)}")

# Google Calendar Authentication Endpoints
@app.get("/api/calendar/auth-status")
async def get_calendar_auth_status():
    """Check Google Calendar authentication status"""
    try:
        if data_manager.calendar_source:
            is_connected = await data_manager.calendar_source.test_connection()
            return {"authenticated": is_connected, "message": "Connected" if is_connected else "Not authenticated"}
        return {"authenticated": False, "message": "Calendar source not initialized"}
    except Exception as e:
        return {"authenticated": False, "message": f"Error checking auth status: {str(e)}"}

@app.get("/api/calendar/auth-url")
async def get_calendar_auth_url():
    """Get Google Calendar OAuth authorization URL"""
    try:
        if data_manager.calendar_source:
            auth_url = data_manager.calendar_source.get_auth_url()
            if auth_url:
                return {"auth_url": auth_url}
            else:
                raise HTTPException(status_code=500, detail="Failed to generate authorization URL. Make sure credentials file is configured.")
        raise HTTPException(status_code=500, detail="Calendar source not initialized")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating auth URL: {str(e)}")

@app.get("/auth/google/callback")
async def google_calendar_callback(code: str, state: str = None):
    """Handle Google Calendar OAuth callback"""
    try:
        # This would need to be implemented in the GoogleCalendarSource
        # For now, return a simple success message
        return RedirectResponse(url="http://localhost:3000?calendar_auth=success")
    except Exception as e:
        return RedirectResponse(url=f"http://localhost:3000?calendar_auth=error&message={str(e)}")

@app.get("/api/calendar/upcoming")
async def get_upcoming_calendar_events():
    """Get upcoming calendar events (for testing)"""
    try:
        upcoming = await data_manager.get_upcoming_today()
        return {"upcoming_events": upcoming}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching upcoming events: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
