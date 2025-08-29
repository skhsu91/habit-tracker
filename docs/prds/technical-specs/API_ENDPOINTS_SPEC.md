# 🔌 API Endpoints Specification
*Technical Implementation for Habit Tracker REST API*

## 📋 **Document Overview**

| Field | Value |
|-------|-------|
| **Document Type** | API Technical Specification |
| **Component** | FastAPI Backend Endpoints |
| **Version** | 2.0 |
| **Created** | January 2025 |
| **Status** | Implementation Ready |

---

## 🚀 **Existing API Endpoints (Production Ready)**

### **Tab-Specific Data Endpoints**
```typescript
// High-performance endpoints optimized for frontend tabs:

GET /api/tabs/overview
// Returns: Daily metrics, recent events, upcoming habits
// Performance: < 200ms, server-side aggregation
// Cache: 5 minutes

GET /api/tabs/habits?search=&category=&sort=&limit=&offset=
// Returns: Filtered and paginated habit list
// Performance: < 200ms, server-side filtering
// Cache: 1 minute

GET /api/tabs/analytics?timeRange=&categories=
// Returns: Chart data, category breakdowns, trends
// Performance: < 500ms, pre-computed aggregations
// Cache: 15 minutes
```

### **General Habit Endpoints**
```typescript
GET /api/habits
// Returns: All habits with optional filtering
// Parameters: source?, date_from?, date_to?, active_only?

GET /api/habits/today
// Returns: Today's habits with completion status

GET /api/habits/recent?days=7
// Returns: Habits from last N days

GET /api/sources
// Returns: Available data sources and their status
```

### **Google Calendar Integration**
```typescript
GET /api/calendar/auth
// Initiates Google OAuth flow

GET /api/calendar/events?date_from=&date_to=
// Returns: Calendar events for date range

POST /api/calendar/sync
// Triggers manual calendar sync
```

---

## 🆕 **New API Endpoints (To Implement)**

### **Habit Management CRUD**
```typescript
POST /api/habits
Content-Type: application/json
{
  "name": "Morning workout",
  "duration": 30,
  "date": "2025-01-15T07:00:00.000Z",
  "primary_categories": ["health"],
  "specific_tags": ["exercise", "workout"],
  "context_tags": ["health-positive", "stress-relief"],
  "social_context": ["solo"],
  "location_tags": ["home"],
  "participants": [],
  "description": "30-minute home workout routine",
  "is_template": false
}
// Returns: Created habit object with generated ID
// Validation: Tag hierarchy, required fields, duplicates

PUT /api/habits/{id}
Content-Type: application/json
{
  "name": "Updated habit name",
  "duration": 45,
  // ... partial update fields
}
// Returns: Updated habit object
// Validation: User ownership, valid ID, tag constraints

DELETE /api/habits/{id}
// Soft delete: Sets is_active = false
// Returns: 204 No Content
// Validation: User ownership, exists and active

PATCH /api/habits/{id}/restore
// Restores soft-deleted habit
// Returns: Restored habit object
```

### **Habit Templates**
```typescript
GET /api/habits/templates
// Returns: Predefined habit templates by category
Response: {
  "financial": [
    {
      "name": "Take public transport",
      "duration": 30,
      "primary_categories": ["transportation", "financial"],
      "specific_tags": ["public-transport"],
      "context_tags": ["cost-effective"]
    }
  ],
  "health": [...],
  "social": [...]
}

POST /api/habits/from-template
{
  "template_id": "public_transport_template",
  "overrides": {
    "name": "Bus to work",
    "date": "2025-01-15T08:00:00.000Z"
  }
}
// Returns: Created habit from template with overrides
```

### **Tag Management & Validation**
```typescript
GET /api/tags/categories
// Returns: Complete tag hierarchy
Response: {
  "primary": {
    "health": {
      "icon": "🏥",
      "description": "Physical & mental wellness",
      "specific_tags": ["exercise", "workout", "nutrition", ...]
    },
    // ... other categories
  },
  "context": {
    "lifestyle_impact": ["health-positive", "cost-effective", ...],
    "social_context": ["solo", "friends", "family", ...],
    "location": ["home", "outdoors", "public-space", ...]
  }
}

POST /api/tags/validate
{
  "primary_categories": ["health", "learning"],
  "specific_tags": ["exercise", "career-skills"],
  "context_tags": ["skill-building"]
}
// Returns: Validation result with suggestions
Response: {
  "valid": true,
  "warnings": [],
  "suggestions": ["health-positive", "goal-aligned"],
  "conflicts": []
}

GET /api/tags/suggestions?name=reading&categories=learning
// Returns: AI-powered tag suggestions based on habit name
Response: {
  "suggested_primary": ["learning"],
  "suggested_specific": ["self-help", "career-skills"],
  "suggested_context": ["skill-building", "goal-aligned"]
}
```

### **Bulk Operations**
```typescript
POST /api/habits/bulk
{
  "operation": "update",
  "habit_ids": ["id1", "id2", "id3"],
  "updates": {
    "primary_categories": ["health", "personal"]
  }
}
// Returns: Bulk operation results with success/failure per ID

POST /api/habits/bulk
{
  "operation": "delete",
  "habit_ids": ["id1", "id2"],
  "permanent": false  // Soft delete by default
}
// Returns: Bulk deletion results

POST /api/habits/duplicate
{
  "source_id": "habit123",
  "modifications": {
    "name": "Evening workout",
    "date": "2025-01-15T19:00:00.000Z"
  }
}
// Returns: Duplicated habit with modifications
```

---

## 📊 **Enhanced Analytics Endpoints**

### **Lifestyle Insights**
```typescript
GET /api/analytics/lifestyle?timeRange=30d&categories=all
// Returns: Comprehensive lifestyle balance analysis
Response: {
  "financial_wellness": {
    "cost_saving_percentage": 85,
    "cost_saving_activities": [
      {"activity": "public_transport", "count": 12, "estimated_savings": 48}
    ],
    "spending_activities": [...],
    "monthly_insight": "You saved ~$240 through smart choices"
  },
  "health_balance": {
    "physical_health_percentage": 65,
    "mental_health_percentage": 35,
    "activities": {...},
    "goal_progress": {...}
  },
  "social_connections": {...},
  "learning_progress": {...}
}

GET /api/analytics/correlations?tags=public-transport,friends
// Returns: Cross-tag correlation analysis
Response: {
  "combinations": [
    {
      "tags": ["public-transport", "friends"],
      "frequency": 8,
      "insights": {
        "average_savings": 12,
        "social_time_increase": "20%",
        "satisfaction_score": 4.2
      }
    }
  ],
  "suggestions": [
    "Combine learning with social activities 2x/week to maximize both goals"
  ]
}

GET /api/analytics/predictions?horizon=7d
// Returns: AI-powered habit predictions and recommendations
Response: {
  "recommendations": [
    {
      "type": "balance_alert",
      "message": "You haven't tracked financial habits this week",
      "suggested_habits": ["Take public transport", "Cook at home"]
    },
    {
      "type": "streak_opportunity", 
      "message": "3 more public transit trips = 100% monthly goal",
      "progress": 85
    }
  ]
}
```

### **Pattern Recognition**
```typescript
GET /api/analytics/patterns?pattern_type=temporal&timeRange=90d
// Returns: Temporal patterns in habit execution
Response: {
  "daily_patterns": {
    "morning_habits": ["workout", "coffee", "planning"],
    "evening_habits": ["cooking", "reading", "reflection"]
  },
  "weekly_patterns": {
    "monday": {"energy_level": "high", "focus_areas": ["health", "work"]},
    "friday": {"energy_level": "medium", "focus_areas": ["social", "leisure"]}
  },
  "seasonal_trends": {...}
}

GET /api/analytics/streaks
// Returns: Habit streaks and consistency metrics
Response: {
  "current_streaks": [
    {"category": "learning", "days": 21, "longest": 35},
    {"category": "health", "days": 12, "longest": 28}
  ],
  "consistency_scores": {
    "overall": 78,
    "by_category": {...}
  }
}
```

---

## 🔐 **Authentication & Authorization**

### **Middleware Requirements**
```python
# Authentication middleware for all endpoints:
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer

security = HTTPBearer()

async def get_current_user(token: str = Depends(security)):
    # Validate Google OAuth token or session token
    # Return user object or raise HTTPException(401)
    pass

# Apply to all habit endpoints:
@app.get("/api/habits")
async def get_habits(user = Depends(get_current_user)):
    # Filter habits by user_id
    pass
```

### **Rate Limiting**
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

# Different limits per endpoint type:
@limiter.limit("100/minute")  # Read operations
@app.get("/api/habits")

@limiter.limit("30/minute")   # Write operations  
@app.post("/api/habits")

@limiter.limit("10/minute")   # Bulk operations
@app.post("/api/habits/bulk")
```

---

## ⚡ **Performance Optimization**

### **Caching Strategy**
```python
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend

# Cache configuration:
cache_configs = {
    "/api/tabs/overview": {"expire": 300},      # 5 minutes
    "/api/tabs/habits": {"expire": 60},         # 1 minute  
    "/api/tabs/analytics": {"expire": 900},     # 15 minutes
    "/api/tags/categories": {"expire": 3600},   # 1 hour
}

@cache(expire=300)
async def get_overview_data(user_id: str):
    # Cached expensive aggregation queries
    pass
```

### **Database Query Optimization**
```python
# Use connection pooling:
from sqlalchemy.pool import QueuePool

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,
    max_overflow=0,
    pool_pre_ping=True
)

# Optimize queries with proper indexing:
async def get_filtered_habits(
    user_id: str, 
    categories: List[str] = None,
    search: str = None,
    limit: int = 50,
    offset: int = 0
):
    query = """
    SELECT * FROM ht_calendar_events 
    WHERE user_id = $1 AND is_active = true
    AND ($2 = '' OR name ILIKE $2)
    AND ($3::text[] IS NULL OR primary_categories && $3)
    ORDER BY date DESC
    LIMIT $4 OFFSET $5
    """
    # Uses indexes: idx_habits_user_date_active, idx_habits_primary_categories
```

### **Response Compression & Pagination**
```python
from fastapi.responses import ORJSONResponse
from fastapi.middleware.gzip import GZipMiddleware

app.add_middleware(GZipMiddleware, minimum_size=1000)

# Consistent pagination response format:
class PaginatedResponse(BaseModel):
    items: List[Any]
    total_count: int
    page: int
    page_size: int
    has_next: bool
    has_previous: bool

@app.get("/api/habits", response_class=ORJSONResponse)
async def get_habits_paginated(...) -> PaginatedResponse:
    # Return compressed JSON with pagination metadata
    pass
```

---

## 🧪 **Testing & Validation**

### **API Test Coverage**
```python
import pytest
from fastapi.testclient import TestClient

class TestHabitCRUD:
    def test_create_habit_success(self, client: TestClient, auth_headers):
        response = client.post(
            "/api/habits",
            json={
                "name": "Test workout",
                "duration": 30,
                "primary_categories": ["health"]
            },
            headers=auth_headers
        )
        assert response.status_code == 201
        assert response.json()["name"] == "Test workout"

    def test_create_habit_invalid_tags(self, client: TestClient, auth_headers):
        response = client.post(
            "/api/habits", 
            json={
                "name": "Test",
                "primary_categories": ["invalid_category"]
            },
            headers=auth_headers
        )
        assert response.status_code == 422
        assert "Invalid category" in response.json()["detail"]

    def test_get_habits_filtered(self, client: TestClient, auth_headers):
        response = client.get(
            "/api/habits?category=health&limit=10",
            headers=auth_headers
        )
        assert response.status_code == 200
        assert len(response.json()["items"]) <= 10
```

### **Performance Benchmarks**
```python
# Load testing with locust:
from locust import HttpUser, task, between

class HabitTrackerUser(HttpUser):
    wait_time = between(1, 3)
    
    def on_start(self):
        # Authenticate user
        pass
    
    @task(3)
    def view_overview(self):
        self.client.get("/api/tabs/overview")
    
    @task(2) 
    def browse_habits(self):
        self.client.get("/api/tabs/habits?limit=20")
    
    @task(1)
    def create_habit(self):
        self.client.post("/api/habits", json={...})

# Target: 1000 concurrent users, < 200ms average response time
```

---

## 📚 **Error Handling & Documentation**

### **Standardized Error Responses**
```python
from fastapi import HTTPException
from pydantic import BaseModel

class ErrorResponse(BaseModel):
    error_code: str
    message: str
    details: Optional[Dict] = None
    timestamp: datetime

# Common error responses:
HTTP_400_BAD_REQUEST = {
    "error_code": "VALIDATION_ERROR",
    "message": "Request validation failed"
}

HTTP_404_NOT_FOUND = {
    "error_code": "HABIT_NOT_FOUND", 
    "message": "Habit with specified ID does not exist"
}

HTTP_409_CONFLICT = {
    "error_code": "DUPLICATE_HABIT",
    "message": "Similar habit already exists for this time period"
}
```

### **OpenAPI Documentation**
```python
from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi

app = FastAPI(
    title="Habit Tracker API",
    description="Comprehensive habit tracking with AI-powered insights",
    version="2.0.0",
    contact={
        "name": "Development Team",
        "email": "dev@habittracker.app"
    }
)

# Auto-generated interactive docs at /docs
# Redoc documentation at /redoc
```

---

## ✅ **Implementation Checklist**

### **Backend Development**
- [ ] Implement new CRUD endpoints with validation
- [ ] Add enhanced tag management endpoints
- [ ] Create lifestyle analytics endpoints
- [ ] Set up caching and rate limiting
- [ ] Add comprehensive error handling

### **Database Integration**
- [ ] Update database schema with new columns
- [ ] Create necessary indexes for performance
- [ ] Implement soft delete functionality
- [ ] Add data validation constraints

### **Testing & QA**
- [ ] Unit tests for all new endpoints
- [ ] Integration tests with database
- [ ] Load testing for performance validation
- [ ] Security testing for authentication

### **Documentation**
- [ ] Complete OpenAPI specification
- [ ] API usage examples and tutorials
- [ ] Error code reference guide
- [ ] Performance benchmarking results

---

*This API specification provides the complete backend foundation for enhanced habit tracking with manual creation, advanced analytics, and comprehensive tag management.*
