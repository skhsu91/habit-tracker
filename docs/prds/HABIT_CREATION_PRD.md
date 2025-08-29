# ✏️ Habit Creation & Management PRD
*Product Requirements Document for User-Generated Habit Creation with Database Integration*

## 📋 **Document Overview**

| Field | Value |
|-------|-------|
| **Document Type** | Product Requirements Document (PRD) |
| **Project** | Habit Creation Interface |
| **Version** | 1.0 |
| **Created** | August 27, 2024 |
| **Status** | Draft |
| **Owner** | Development Team |

---

## 🎯 **Executive Summary**

Enable users to manually create, edit, and manage their own habits through an intuitive interface, with data persisted to the Supabase database and integrated with the existing analytics and tracking system.

### **Key Objectives:**
- **User Empowerment**: Allow users to create custom habits beyond calendar imports
- **Database Integration**: Store user-created habits in Supabase with proper data modeling
- **Tag Validation**: Enforce existing tag hierarchy for consistent categorization
- **Seamless Integration**: New habits appear in all existing views (Overview, All Habits, Analytics)
- **Data Integrity**: Maintain consistency with existing habit data structure

---

## 🔍 **Current State Analysis**

### **✅ Existing Foundation:**
- **Database**: Supabase PostgreSQL with `ht-calendar-events` table (PRIMARY), Google Sheets CSV fallback, Mock data
- **AI-Powered Ingestion**: n8n workflow with GPT-4o-mini agent using Google Calendar MCP + Supabase MCP for automated habit processing
- **Tag System**: Implemented hierarchical validation system in `backend/utils/tag_validation.py` with 4 umbrella categories
- **UI Components**: Professional dark mode design system with polished components
- **Data Flow**: Complete FastAPI backend with tab-specific endpoints (`/api/tabs/overview`, `/api/tabs/habits`, `/api/tabs/analytics`) 
- **Analytics**: Interactive Chart.js analytics with category breakdowns, trends, and server-side filtering
- **Google Calendar Integration**: OAuth-enabled with timezone-aware event display (both frontend and n8n workflow)
- **Configuration Management**: Centralized config system with environment variable support for secrets

### **🎯 Enhanced Tagging System Requirements:**
The current tag system needs significant expansion to track comprehensive lifestyle patterns including:
- **Financial Impact**: Spending vs. saving behaviors (delivery vs. pickup, public transport vs. driving)
- **Social Interactions**: Different types of social activities and contexts
- **Personal Development**: Learning goals (career vs. relationships vs. general knowledge)
- **Health & Wellness**: Physical activity types, mental health activities
- **Lifestyle Balance**: Work-life integration, leisure activities, personal enrichment
- **Transportation Patterns**: Cost-effective vs. convenient transportation choices
- **Goal Alignment**: Activities that support specific life improvement goals

### **❌ Current Limitations:**
- **Single Ingestion Source**: Habits currently only come from AI-powered n8n workflow processing Google Calendar events
- **No Manual User Input**: Cannot create, update, or delete habits manually through frontend UI
- **Limited Tag Set**: Current system has only 4 umbrella categories (health, food, home, transportation)
- **Missing Creation UI**: No frontend interface for habit creation despite backend validation infrastructure
- **AI Dependency**: All habit ingestion relies on n8n workflow availability and Google Calendar event creation

### **🎯 Gap Analysis:**
| Missing Feature | Current State | Desired State |
|----------------|---------------|---------------|
| Manual Habit Creation | AI workflow only via Calendar | Frontend UI + AI workflow dual sources |
| Direct Habit Editing | No CRUD endpoints | Full REST API with PUT/DELETE endpoints |
| Tag Categories | 4 basic umbrellas | 10 comprehensive lifestyle categories |
| Ingestion Flexibility | n8n workflow dependency | Multiple ingestion methods (UI, API, n8n) |
| User Workflow | AI-processed habits only | User-controlled + AI-assisted habit management |

---

## 🏗️ **Technical Architecture**

### **Current Database Schema (Supabase PostgreSQL):**
```sql
-- Current ht-calendar-events table structure (populated by n8n workflow):
CREATE TABLE "public"."ht-calendar-events" (
    id TEXT PRIMARY KEY,                          -- Google Calendar event ID or generated UUID
    name TEXT NOT NULL,                           -- Habit/event name (from Calendar summary)
    date TEXT NOT NULL,                           -- ISO datetime string (2025-01-14T06:00:00.000Z)
    participants TEXT[],                          -- Array of participant names (nullable)
    duration INTEGER NOT NULL,                    -- Duration in minutes
    categories TEXT[] NOT NULL,                   -- Array of tags/categories (processed by AI)
    
    -- Automatically populated by n8n workflow:
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Current indexes:
CREATE INDEX idx_calendar_events_date ON "ht-calendar-events" (date);
CREATE INDEX idx_calendar_events_categories ON "ht-calendar-events" USING GIN (categories);
```

### **Proposed Schema Extensions for Manual Habits:**
```sql
-- Required extensions for user-created habits:
ALTER TABLE "ht-calendar-events" ADD COLUMN IF NOT EXISTS:
  created_by VARCHAR(50) DEFAULT 'n8n_ai',         -- 'user', 'n8n_ai', 'calendar_direct'
  habit_type VARCHAR(20) DEFAULT 'ai_processed',   -- 'manual', 'ai_processed', 'calendar_import'
  is_template BOOLEAN DEFAULT false,               -- For preset habits
  user_id VARCHAR(100),                           -- Future multi-user support
  is_active BOOLEAN DEFAULT true,                 -- Soft delete capability
  source_reference VARCHAR(200),                  -- Google Calendar event ID or workflow run ID
  
  -- Enhanced tagging system:
  primary_categories TEXT[],                      -- New 10-category system
  specific_tags TEXT[],                           -- Activity-specific tags
  context_tags TEXT[],                            -- Lifestyle impact tags
  social_context TEXT[],                          -- Social situation tags
  location_tags TEXT[],                           -- Location/setting tags
  
  -- AI processing metadata:
  ai_confidence DECIMAL(3,2),                     -- AI tagging confidence (0.00-1.00)
  ai_model_version VARCHAR(50),                   -- GPT model used for processing
  processing_notes TEXT;                          -- AI reasoning/notes

-- Performance indexes:
CREATE INDEX IF NOT EXISTS idx_habits_user_active ON "ht-calendar-events" (user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_habits_created_by ON "ht-calendar-events" (created_by);
CREATE INDEX IF NOT EXISTS idx_habits_primary_categories ON "ht-calendar-events" USING GIN (primary_categories);
CREATE INDEX IF NOT EXISTS idx_habits_date_active ON "ht-calendar-events" (date, is_active);
CREATE INDEX IF NOT EXISTS idx_habits_habit_type ON "ht-calendar-events" (habit_type);
```

### **API Endpoints:**
```typescript
// MISSING endpoints to add to backend/main.py:
POST   /api/habits              // Create new habit
PUT    /api/habits/{id}         // Update existing habit  
DELETE /api/habits/{id}         // Soft delete habit
GET    /api/habits/templates    // Get habit templates
POST   /api/habits/validate     // Validate habit data

// EXISTING endpoints that work well:
GET    /api/habits              // Get all habits (with optional source filter)
GET    /api/habits/today        // Get today's habits
GET    /api/habits/recent       // Get habits from last N days
GET    /api/tabs/overview       // Complete overview data (daily metrics, recent events, upcoming)
GET    /api/tabs/habits         // Optimized habits with filtering (search, category, sort, limit)
GET    /api/tabs/analytics      // Analytics with time range and category filters
GET    /api/sources             // Available data sources
GET    /api/calendar/*          // Google Calendar integration endpoints

// Tag validation utilities available in backend/utils/tag_validation.py:
// - TagValidator.validate_and_normalize()
// - TagValidator.suggest_tags_for_habit_name()
// - validate_tags() and normalize_tags() convenience functions
```

### **Current Data Ingestion Architecture (n8n Workflow):**
```
AI-Powered Habit Processing Pipeline:
┌─────────────────────────────────┐
│ Google Calendar                 │
│ "Habit Tracking" calendar       │
│ (User creates calendar events)  │
└─────────────┬───────────────────┘
              │
┌─────────────▼───────────────────┐
│ n8n Workflow Trigger            │
│ • Polls calendar for new events │
│ • Webhook/schedule based        │
└─────────────┬───────────────────┘
              │
┌─────────────▼───────────────────┐
│ Google Calendar MCP             │
│ • Fetches event details         │
│ • Provides context to AI        │
└─────────────┬───────────────────┘
              │
┌─────────────▼───────────────────┐
│ GPT-4o-mini AI Agent            │
│ • Analyzes event name/details   │
│ • Applies tagging rules         │
│ • Determines categories         │
│ • Extracts participants/duration│
└─────────────┬───────────────────┘
              │
┌─────────────▼───────────────────┐
│ Supabase MCP                    │
│ • Inserts processed habits      │
│ • Updates existing entries      │
│ • Maintains data consistency    │
└─────────────┬───────────────────┘
              │
┌─────────────▼───────────────────┐
│ Frontend Display                │
│ • Reads from Supabase           │
│ • Shows processed habits        │
│ • Analytics and insights        │
└─────────────────────────────────┘
```

### **Frontend Components (To Be Built):**
```
Habit Creation Flow
├── HabitCreationForm.tsx       // Main creation interface (NEW)
├── TagSelector.tsx             // Interactive tag selection with validation (NEW)
├── DurationPicker.tsx          // Time duration input component (NEW)
├── RecurrenceSelector.tsx      // Future: recurring habit setup
├── HabitTemplates.tsx          // Preset habit quick-creation (NEW)
└── FormValidation.tsx          // Real-time validation feedback (NEW)

Habit Management
├── HabitEditModal.tsx          // Edit existing habits (NEW)
├── HabitDeleteConfirm.tsx      // Confirmation dialog (NEW)
├── HabitQuickActions.tsx       // Mark complete, edit, delete (NEW)
├── DataSourceIndicator.tsx     // Show if habit is AI-processed vs user-created (NEW)
└── HabitBulkActions.tsx        // Future: bulk operations
```

---

## 🎨 **User Experience Design**

### **Habit Creation Flow:**
```
1. Entry Point
   ├── "Add Habit" button in All Habits view
   ├── "Create Habit" in Overview empty state
   └── Quick action from templates

2. Creation Form
   ├── Habit Name (required, max 100 chars)
   ├── Category Selection (tag validation)
   ├── Duration (minutes, optional default)
   ├── Description (optional, max 500 chars)
   ├── Date/Time (defaults to now)
   └── Save/Cancel actions

3. Confirmation
   ├── Success message with habit details
   ├── "Add Another" quick action
   └── Return to habits list with new habit highlighted
```

### **Form Validation Rules:**
| Field | Validation | Error Message |
|-------|------------|---------------|
| **Name** | Required, 3-100 chars, no special chars | "Habit name must be 3-100 characters" |
| **Categories** | Min 1 umbrella tag, valid tags only | "Select at least one main category" |
| **Duration** | Positive integer, max 1440 min (24hr) | "Duration must be between 1-1440 minutes" |
| **Date** | Valid date, not more than 1 year past | "Please select a valid date" |
| **Participants** | Optional, comma-separated, max 200 chars | "Participants list too long" |

### **Enhanced Tag Hierarchy System:**

#### **🏷️ Primary Categories (Umbrellas) - Select 1+ Required:**
```
├── 🏥 health          // Physical & mental wellness
├── 🍽️ food           // Nutrition, cooking, dining
├── 🏠 home           // Household, maintenance, organization
├── 🚌 transportation  // Movement, travel, commuting
├── 👥 social         // Interpersonal interactions
├── 🎓 learning       // Knowledge acquisition, skill development
├── 🎮 leisure        // Entertainment, hobbies, relaxation
├── 💼 career         // Professional development, work-related
├── 💰 financial      // Money management, spending patterns
└── 🌱 personal       // Self-improvement, habits, routines
```

#### **🎯 Specific Activity Tags - Contextual Selection:**

**Health & Wellness:**
```
├── exercise          // Active physical movement
├── outdoor-activity  // Fresh air, nature-based activities
├── mental-health     // Stress relief, emotional wellness
├── nutrition         // Healthy eating choices
├── sleep-hygiene     // Rest and recovery
├── mindfulness       // Meditation, breathing, presence
└── medical-care      // Healthcare appointments, prevention
```

**Social Interactions:**
```
├── friends           // Hanging out with friends
├── family           // Time with family members
├── romantic         // Partner/relationship activities
├── networking       // Professional social connections
├── community        // Neighborhood, volunteer activities
├── group-activity   // Organized social events
└── date-night       // Romantic outings
```

**Learning & Development:**
```
├── career-skills    // Professional development
├── relationship-skills // Improving personal relationships
├── hobby-learning   // New hobbies, creative skills
├── academic         // Formal education, courses
├── self-help        // Personal development books/content
├── practical-skills // Life skills (cooking, repair, etc.)
└── language         // Language learning
```

**Leisure & Entertainment:**
```
├── reading          // Books, articles, recreational reading
├── entertainment    // Movies, shows, games
├── hobbies          // Personal interests, crafts
├── sports-watching  // Spectator sports
├── cultural         // Museums, art, concerts
├── gaming           // Video games, board games
└── relaxation       // Downtime, rest activities
```

**Financial Behavior:**
```
├── cost-saving      // Choices that save money
├── cost-spending    // Choices that cost more money
├── investment       // Long-term financial planning
├── budgeting        // Financial tracking, planning
├── shopping         // Purchasing decisions
└── financial-learning // Money management education
```

**Transportation Choices:**
```
├── public-transport // Bus, train, metro usage
├── walking          // Walking as transportation
├── cycling          // Bike for transportation
├── driving          // Car usage
├── rideshare        // Uber, Lyft, etc.
└── delivery-pickup  // Delivery vs. pickup choices
```

#### **🎨 Context Tags - Multi-Select for Nuanced Tracking:**

**Lifestyle Impact:**
```
├── health-positive   // Supports physical/mental health
├── cost-effective    // Saves money or provides value
├── time-efficient    // Efficient use of time
├── social-bonding    // Strengthens relationships
├── skill-building    // Develops new capabilities
├── stress-relief     // Reduces stress, promotes relaxation
├── goal-aligned      // Supports personal goals
└── spontaneous       // Unplanned, flexible activities
```

**Social Context:**
```
├── solo             // Individual activity
├── partner          // With romantic partner
├── friends          // With friends
├── family           // With family
├── colleagues       // Work-related social
├── group            // Larger group activity
└── community        // Neighborhood/community involvement
```

**Location & Setting:**
```
├── home             // At home
├── outdoors         // Outside, nature
├── public-space     // Restaurants, bars, venues
├── workplace        // Office, work environment
├── transit          // While traveling/commuting
├── online           // Digital/virtual activity
└── local            // Within neighborhood/local area
```

### **🎯 Example Habit Tagging for Your Use Cases:**

```
1. "Reading relationship book"
   Primary: [learning] 
   Specific: [relationship-skills, self-help]
   Context: [skill-building, goal-aligned, solo, home]

2. "Reading career development book"  
   Primary: [learning, career]
   Specific: [career-skills, self-help]
   Context: [skill-building, goal-aligned, solo]

3. "Taking bus to hang with friends"
   Primary: [social, transportation]
   Specific: [friends, public-transport]  
   Context: [social-bonding, cost-effective, local]

4. "Hiking"
   Primary: [health, leisure]
   Specific: [exercise, outdoor-activity]
   Context: [health-positive, stress-relief, outdoors]

5. "Picnic with friends via bus"
   Primary: [social, food, transportation]
   Specific: [friends, group-activity, public-transport]
   Context: [social-bonding, cost-effective, outdoors]

6. "Driving for takeout vs delivery"
   Primary: [food, transportation, financial]
   Specific: [cost-saving, driving, delivery-pickup]
   Context: [cost-effective, time-efficient]

7. "Taking bus to bar with friends"
   Primary: [social, transportation, leisure]
   Specific: [friends, public-transport, entertainment]
   Context: [social-bonding, cost-effective, public-space]
```

### **Enhanced Habit Templates:**
```
💰 Financial Wellness
├── 🚌 Take public transport (save money) - [transportation, financial, public-transport, cost-effective]
├── 🥡 Pickup vs delivery (save fees) - [food, financial, cost-saving, time-efficient] 
├── 🏪 Shop local vs online (support community) - [financial, shopping, community, local]
└── 📊 Review spending habits - [financial, budgeting, goal-aligned, home]

👥 Social Connection  
├── 📞 Call family member - [social, family, social-bonding, solo]
├── 🍻 Happy hour with colleagues - [social, leisure, colleagues, public-space]
├── 🎲 Game night with friends - [social, leisure, friends, group, home]
└── 💑 Date night planning - [social, romantic, partner, social-bonding]

🎓 Personal Development
├── 📖 Read relationship book - [learning, relationship-skills, skill-building, solo]
├── 💼 Professional skill course - [learning, career, career-skills, skill-building]
├── 🍳 Learn new recipe - [learning, food, practical-skills, home]
└── 🗣️ Practice language - [learning, language, skill-building, goal-aligned]

🏃 Health & Wellness
├── 🥾 Nature hike - [health, leisure, exercise, outdoor-activity, stress-relief]
├── 🧘 Morning meditation - [health, personal, mindfulness, stress-relief, home]
├── 🚶 Walking meeting - [health, career, exercise, outdoor-activity, work]
└── 🥗 Meal prep Sunday - [health, food, nutrition, health-positive, home]

🎮 Leisure & Balance
├── 📚 Recreational reading - [leisure, learning, reading, relaxation, solo]
├── 🎨 Creative hobby time - [leisure, personal, hobbies, skill-building, home]
├── 🎬 Movie night (social) - [leisure, social, entertainment, friends, social-bonding]
└── 🌅 Sunset walk - [leisure, health, outdoor-activity, relaxation, solo]
```

---

## 📱 **User Interface Specifications**

### **Add Habit Button Placement:**
- **All Habits View**: Primary CTA button in top-right
- **Overview Page**: Secondary action when no habits today
- **Floating Action Button**: Bottom-right for quick access (mobile)

### **Creation Form Layout:**
```
[Habit Creation Modal]
┌─────────────────────────────────┐
│ ✕ Create New Habit            │
├─────────────────────────────────┤
│ Habit Name *                    │
│ [Text Input Field____________]  │
│                                 │
│ Categories *                    │
│ [Tag Selection Interface]       │
│                                 │
│ Duration (minutes)              │
│ [Number Input] [Presets: 15|30|60] │
│                                 │
│ Date & Time                     │
│ [Date Picker] [Time Picker]     │
│                                 │
│ Description (optional)          │
│ [Textarea________________]      │
│                                 │
│ Participants (optional)         │
│ [Text Input Field____________]  │
│                                 │
│ [Cancel]           [Save Habit] │
└─────────────────────────────────┘
```

### **Enhanced Tag Selection Interface:**
```
Comprehensive Tag Selection (Progressive Disclosure)
┌─────────────────────────────────┐
│ Primary Categories (select 1+) *│
│ ☑ 🎓 learning  ☐ 💰 financial  │
│ ☐ 👥 social    ☐ 🚌 transport   │
│ ☐ 🏥 health    ☐ 🎮 leisure     │
│ ☐ 🍽️ food      ☐ 💼 career     │
│ ☐ 🏠 home      ☐ 🌱 personal    │
├─────────────────────────────────┤
│ Specific Activity Tags          │
│ (filtered by primary selection) │
│ ☑ relationship-skills           │
│ ☑ self-help                    │
│ ☐ career-skills                │
│ ☐ academic                     │
│ ☐ practical-skills             │
├─────────────────────────────────┤
│ 🎯 Lifestyle Impact (optional)  │
│ ☑ skill-building               │
│ ☑ goal-aligned                 │
│ ☐ health-positive              │
│ ☐ cost-effective               │
│ ☐ social-bonding               │
│ ☐ stress-relief                │
├─────────────────────────────────┤
│ 👥 Social Context (optional)    │
│ ☑ solo      ☐ partner         │
│ ☐ friends   ☐ family           │
│ ☐ colleagues ☐ group           │
├─────────────────────────────────┤
│ 📍 Location & Setting (optional)│
│ ☑ home      ☐ outdoors        │
│ ☐ public-space ☐ workplace     │
│ ☐ transit   ☐ online           │
└─────────────────────────────────┘

Smart Tag Suggestions (based on combinations):
┌─────────────────────────────────┐
│ 💡 Suggested for this habit:    │
│ [+ cost-effective] [+ local]    │
│ [+ time-efficient]              │
└─────────────────────────────────┘
```

### **Advanced Tag Analytics Preview:**
Show users how their tags will create meaningful insights:
```
Analytics Preview (Real-time as user selects tags):
┌─────────────────────────────────┐
│ 📊 This habit will contribute to:│
│                                 │
│ 🎓 Learning Progress: +1        │
│ 💰 Cost-Saving Choices: +1      │
│ 👥 Social Connections: +1       │
│ 🌱 Personal Growth Goals: +1    │
│                                 │
│ 📈 Weekly Insights:             │
│ • Skills development tracking   │
│ • Financial behavior patterns   │
│ • Social activity balance       │
│ • Transportation cost analysis  │
└─────────────────────────────────┘
```

---

## 🔧 **Implementation Requirements**

### **Phase 1: Dual-Source Foundation (2-3 weeks)**
- [ ] **Database Schema**: Extend Supabase table to distinguish AI-processed vs user-created habits
- [ ] **Backend APIs**: Implement missing CRUD endpoints (POST, PUT, DELETE /api/habits)
- [ ] **Enhanced Tag System**: Migrate from 4-category to 10-category system in tag_validation.py
- [ ] **Data Source Coordination**: Ensure n8n workflow and manual creation don't conflict
- [ ] **Frontend Form**: Create habit creation UI leveraging existing design system
- [x] **n8n AI Pipeline**: Fully operational with GPT-4o-mini + MCPs ✅
- [x] **Validation Infrastructure**: Tag validation system already implemented ✅

### **Phase 2: Enhanced UX (1-2 weeks)**
- [ ] **Templates**: Pre-defined habit templates for quick creation
- [ ] **Analytics UI Enhancement**: Add filtering dropdowns to existing analytics (already identified as HIGH PRIORITY)
- [ ] **Bulk Actions**: Edit/delete multiple habits
- [x] **Search & Filter**: Server-side search and filtering already implemented in /api/tabs/habits ✅
- [x] **Sorting Options**: Sort by date, name, category, duration already available ✅
- [ ] **Quick Actions**: Mark complete, edit, duplicate from habit list

### **Phase 3: Advanced Features (2-3 weeks)**
- [ ] **Lifestyle Analytics**: Implement comprehensive financial/social/learning insights dashboard
- [ ] **Recurring Habits**: Daily/weekly/monthly habit scheduling
- [ ] **Advanced Analytics**: Cross-category correlations and predictive insights
- [x] **Data Export**: CSV/JSON export already planned as HIGH PRIORITY ✅
- [ ] **Multi-user Support**: Prepare for user accounts and sharing
- [ ] **Mobile Optimization**: Polish for React Native migration (already planned as MEDIUM PRIORITY)

---

## 🎯 **Feature Specifications**

### **Core Features:**

#### **1. Habit Creation**
- **Form Fields**: Name, categories, duration, date/time, description, participants
- **Validation**: Real-time feedback with clear error messages
- **Auto-save**: Draft saving to prevent data loss
- **Templates**: Quick-start options for common habits

#### **2. Habit Editing**
- **In-line Editing**: Quick edit name/duration from habit list
- **Full Edit Modal**: Complete form for detailed changes
- **Change History**: Track modifications (future enhancement)
- **Bulk Edit**: Select multiple habits for category changes

#### **3. Habit Management**
- **Soft Delete**: Mark habits as inactive rather than permanent deletion
- **Duplicate**: Create copy of existing habit with modifications
- **Archive**: Hide old habits while preserving analytics data
- **Restore**: Undelete accidentally removed habits

#### **4. Integration**
- **Analytics**: User habits included in all charts and metrics
- **Search**: Global search across all habits (imported + created)
- **Filtering**: Category, date range, source type filters
- **Export**: Include user habits in data export functionality

---

## 📊 **Lifestyle Analytics & Insights**

### **🎯 Goal-Oriented Analytics Dashboard:**

#### **💰 Financial Wellness Tracking:**
```
Financial Impact Analytics:
┌─────────────────────────────────┐
│ 💰 Monthly Financial Behavior   │
├─────────────────────────────────┤
│ 📈 Cost-Saving Choices: 85%     │
│ ├── Public transport: 12 times  │
│ ├── Pickup vs delivery: 8 times │
│ ├── Local shopping: 5 times     │
│ └── Home cooking: 18 meals      │
│                                 │
│ 📉 Cost-Spending Choices: 15%   │
│ ├── Rideshare usage: 3 times    │
│ ├── Delivery orders: 2 times    │
│ └── Impulse purchases: 1 time   │
│                                 │
│ 💡 Insight: You saved ~$240     │
│    this month through smart     │
│    transportation choices!      │
└─────────────────────────────────┘
```

#### **🏥 Health & Wellness Balance:**
```
Health Impact Analysis:
┌─────────────────────────────────┐
│ 🏥 Wellness Activity Distribution│
├─────────────────────────────────┤
│ 🏃 Physical Health: 65%         │
│ ├── Outdoor activities: 8 times │
│ ├── Exercise sessions: 12 times │
│ └── Walking transport: 15 times │
│                                 │
│ 🧠 Mental Health: 35%           │
│ ├── Stress relief: 10 times     │
│ ├── Mindfulness: 8 times        │
│ └── Social bonding: 18 times    │
│                                 │
│ 🎯 Goal Progress:               │
│ Better health management: ✅    │
│ Activity consistency: ✅        │
│ Work-life balance: ⚠️ Needs attention
└─────────────────────────────────┘
```

#### **👥 Social Connection Insights:**
```
Social Activity Patterns:
┌─────────────────────────────────┐
│ 👥 Social Interaction Analysis  │
├─────────────────────────────────┤
│ 🤝 Relationship Building:       │
│ ├── Friends hangouts: 8 times   │
│ ├── Family time: 6 times        │
│ ├── Partner activities: 12 times│
│ └── Community events: 2 times   │
│                                 │
│ 📍 Social Locations:            │
│ ├── Home gatherings: 40%        │
│ ├── Public spaces: 45%          │
│ ├── Outdoor activities: 15%     │
│                                 │
│ 💡 Insight: You're maintaining  │
│    strong social connections    │
│    while keeping costs low!     │
└─────────────────────────────────┘
```

#### **🎓 Learning & Personal Growth:**
```
Learning Progress Tracking:
┌─────────────────────────────────┐
│ 🎓 Knowledge & Skill Development │
├─────────────────────────────────┤
│ 📖 Reading Focus Areas:         │
│ ├── Relationship skills: 45%    │
│ ├── Career development: 35%     │
│ ├── Practical skills: 20%       │
│                                 │
│ ⏱️ Learning Time Investment:    │
│ ├── Daily average: 52 minutes   │
│ ├── Weekly total: 6.1 hours     │
│ ├── Monthly goal: ✅ 25+ hours  │
│                                 │
│ 🏆 Achievement Unlocked:        │
│ "Consistent Learner" - 30 days  │
│ of consecutive learning habits  │
└─────────────────────────────────┘
```

### **🔄 Lifestyle Balance Scorecard:**
```
Monthly Lifestyle Assessment:
┌─────────────────────────────────┐
│ 🌟 Your Lifestyle Goals Score   │
├─────────────────────────────────┤
│ 💰 Financial Responsibility: A- │
│ ├── Saving money: Excellent     │
│ ├── Smart spending: Good        │
│ └── Budgeting: Needs work       │
│                                 │
│ 🏥 Health Management: B+        │
│ ├── Physical activity: Great    │
│ ├── Mental wellness: Good       │
│ └── Sleep hygiene: Improving    │
│                                 │
│ 🎓 Personal Enrichment: A       │
│ ├── Learning consistency: Exc.  │
│ ├── Skill diversity: Great      │
│ └── Goal alignment: Perfect     │
│                                 │
│ 👥 Social Balance: A-           │
│ ├── Relationship time: Great    │
│ ├── Social variety: Good        │
│ └── Community involvement: OK   │
│                                 │
│ 🎯 Overall Lifestyle: A-        │
│ You're crushing your goals!     │
└─────────────────────────────────┘
```

### **📈 Predictive Insights & Recommendations:**
```
Smart Suggestions Based on Patterns:
┌─────────────────────────────────┐
│ 🤖 AI-Powered Recommendations   │
├─────────────────────────────────┤
│ 💡 This Week's Suggestions:     │
│                                 │
│ 🚌 Transportation:              │
│ "You took the bus 4x this week  │
│  vs driving. Keep it up to save │
│  $15 more this month!"          │
│                                 │
│ 📚 Learning:                    │
│ "You've read 3 relationship     │
│  books. Try a career book to    │
│  balance your growth areas."    │
│                                 │
│ 👥 Social:                      │
│ "It's been 5 days since your   │
│  last friend hangout. Text      │
│  someone to grab coffee!"       │
│                                 │
│ 🎯 Goal Alert:                  │
│ "You're 85% to your monthly     │
│  cost-saving goal. 3 more       │
│  public transit trips = 100%!"  │
└─────────────────────────────────┘
```

### **📊 Advanced Correlation Analysis:**
```
Cross-Category Insights:
┌─────────────────────────────────┐
│ 🔍 Pattern Recognition          │
├─────────────────────────────────┤
│ When you take public transport  │
│ for social activities:          │
│ ├── Save average $12 per trip   │
│ ├── Walk 2x more than driving   │
│ ├── Arrive 15% more relaxed     │
│ └── Social time increases 20%   │
│                                 │
│ Learning + Social combinations: │
│ ├── Book clubs: Best retention  │
│ ├── Study groups: High motivation│
│ ├── Teaching others: Skill boost│
│                                 │
│ 🎯 Optimization Suggestion:     │
│ "Combine learning with social   │
│  activities 2x/week to maximize │
│  both goals simultaneously!"    │
└─────────────────────────────────┘
```

---

## 📊 **Data Flow & Validation**

### **Habit Creation Flow:**
```
User Input → Frontend Validation → Backend API → Database
    ↓              ↓                    ↓           ↓
Form Data → Tag Validation → Supabase Insert → Success Response
    ↓              ↓                    ↓           ↓
Real-time → Error Messages → Error Handling → UI Update
```

### **Enhanced Tag Validation Logic:**
```typescript
interface EnhancedHabitValidation {
  name: {
    required: true,
    minLength: 3,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-\']+$/  // No special chars except - and '
  },
  
  // Primary Categories (Umbrellas) - Required
  primaryCategories: {
    required: true,
    minSelection: 1,
    maxSelection: 3,  // Prevent over-categorization
    validOptions: [
      'health', 'food', 'home', 'transportation',
      'social', 'learning', 'leisure', 'career', 
      'financial', 'personal'
    ]
  },
  
  // Specific Activity Tags - Contextual
  specificTags: {
    required: false,
    maxSelection: 5,
    filteredByPrimary: true,  // Only show relevant options
    validTags: {
      health: ['exercise', 'outdoor-activity', 'mental-health', 'nutrition', 'sleep-hygiene', 'mindfulness', 'medical-care'],
      social: ['friends', 'family', 'romantic', 'networking', 'community', 'group-activity', 'date-night'],
      learning: ['career-skills', 'relationship-skills', 'hobby-learning', 'academic', 'self-help', 'practical-skills', 'language'],
      leisure: ['reading', 'entertainment', 'hobbies', 'sports-watching', 'cultural', 'gaming', 'relaxation'],
      financial: ['cost-saving', 'cost-spending', 'investment', 'budgeting', 'shopping', 'financial-learning'],
      transportation: ['public-transport', 'walking', 'cycling', 'driving', 'rideshare', 'delivery-pickup'],
      food: ['nutrition', 'home-cooking', 'dining-out', 'meal-prep', 'grocery-shopping'],
      career: ['skill-development', 'networking', 'professional-growth', 'job-search', 'workplace-wellness'],
      home: ['organization', 'maintenance', 'cleaning', 'decorating', 'gardening'],
      personal: ['self-care', 'goal-setting', 'reflection', 'habits', 'productivity']
    }
  },
  
  // Lifestyle Impact Tags - Optional
  lifestyleImpact: {
    required: false,
    maxSelection: 4,
    validOptions: [
      'health-positive', 'cost-effective', 'time-efficient',
      'social-bonding', 'skill-building', 'stress-relief',
      'goal-aligned', 'spontaneous'
    ]
  },
  
  // Social Context - Optional
  socialContext: {
    required: false,
    maxSelection: 2,
    validOptions: [
      'solo', 'partner', 'friends', 'family', 
      'colleagues', 'group', 'community'
    ]
  },
  
  // Location & Setting - Optional
  locationSetting: {
    required: false,
    maxSelection: 2,
    validOptions: [
      'home', 'outdoors', 'public-space', 'workplace',
      'transit', 'online', 'local'
    ]
  },
  
  duration: {
    min: 1,
    max: 1440,  // 24 hours
    default: 30,
    suggestions: [15, 30, 45, 60, 90, 120]  // Quick-select options
  },
  
  date: {
    required: true,
    notFuture: true,
    maxPastDays: 365
  },
  
  // Smart validation rules
  smartValidation: {
    // Suggest complementary tags based on selections
    autoSuggest: true,
    
    // Warn about conflicting combinations
    conflictDetection: {
      'cost-saving + cost-spending': 'These tags contradict each other',
      'solo + group': 'Choose either solo or group social context',
      'home + outdoors': 'Select primary location'
    },
    
    // Encourage balanced lifestyle tracking
    balancePrompts: {
      financialOnly: 'Consider adding health or social tags for balance',
      workOnly: 'Add leisure or personal time for work-life balance',
      soloOnly: 'Mix in some social activities for connection'
    }
  }
}

// Analytics-driven tag suggestions
interface SmartTagSuggestions {
  basedOnHistory: {
    // "You often combine 'friends' with 'cost-effective'"
    frequentCombinations: string[],
    
    // "You haven't tracked financial habits this week"
    missingCategories: string[],
    
    // "Your last 5 social activities were all 'public-space'"
    varietySuggestions: string[]
  },
  
  basedOnGoals: {
    // If user has financial goals, suggest cost-saving tags
    goalAlignment: string[],
    
    // Based on lifestyle balance scorecard
    needsImprovement: string[]
  }
}
```

---

## 🔒 **Security & Data Integrity**

### **Input Sanitization:**
- **XSS Prevention**: Sanitize all text inputs
- **SQL Injection**: Use parameterized queries (Supabase handles this)
- **Rate Limiting**: Prevent spam habit creation
- **Size Limits**: Enforce maximum field lengths

### **Data Validation:**
- **Tag Whitelist**: Only allow predefined valid tags
- **Date Bounds**: Reasonable past/future date limits
- **Duplicate Detection**: Warn about similar existing habits
- **Required Fields**: Enforce non-nullable database constraints

### **User Permissions:**
- **Ownership**: Users can only edit their own habits
- **Read Access**: All habits visible for analytics
- **Admin Functions**: Future role-based permissions
- **Data Isolation**: Prepare for multi-tenant architecture

---

## 📈 **Success Metrics**

### **Adoption Metrics:**
- **Creation Rate**: % of users who create at least one habit
- **Usage Frequency**: Average habits created per active user
- **Template Usage**: % of habits created from templates vs custom
- **Edit Rate**: % of created habits that get edited later

### **Quality Metrics:**
- **Form Completion**: % of started forms that are successfully submitted
- **Validation Errors**: Average errors per form submission
- **Tag Compliance**: % of habits following tag hierarchy rules
- **Data Integrity**: Zero invalid habits in database

### **User Experience Metrics:**
- **Time to Create**: Average time from click to successful habit creation
- **Error Recovery**: % of users who complete form after validation error
- **Feature Discovery**: % of users who find and use habit creation
- **Satisfaction**: User feedback on creation process ease

---

## 🚨 **Risk Assessment**

### **Technical Risks:**
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Database schema conflicts | High | Low | Careful migration planning |
| Tag validation complexity | Medium | Medium | Comprehensive testing |
| Form performance issues | Medium | Low | Optimize rendering, lazy loading |
| Data migration problems | High | Low | Backup and rollback procedures |

### **UX Risks:**
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Form too complex | High | Medium | User testing, progressive disclosure |
| Tag selection confusing | Medium | Medium | Clear UI, help text, examples |
| Mobile form usability | Medium | Low | Responsive design, touch optimization |
| Feature discoverability | High | Medium | Clear CTAs, onboarding flow |

---

## ✅ **Acceptance Criteria**

### **MVP Requirements:**
- [ ] **Create Habits**: Users can create habits with name, enhanced categories, duration
- [x] **Tag Validation**: Backend validation infrastructure exists, needs frontend integration ✅
- [x] **Integration**: Existing /api/tabs/* endpoints ready for user-created habits ✅
- [ ] **Edit/Delete**: Implement missing CRUD endpoints and UI
- [x] **Data Persistence**: Supabase infrastructure ready, needs schema extension ✅
- [ ] **Enhanced Tag System**: Upgrade from 4 to 10 lifestyle categories

### **Quality Gates:**
- [ ] **Form Validation**: All edge cases handled with clear error messages
- [ ] **Performance**: Form renders in < 1 second, saves in < 3 seconds
- [ ] **Accessibility**: Keyboard navigation, screen reader compatible
- [ ] **Mobile Responsive**: Usable on mobile devices with touch inputs
- [ ] **Data Integrity**: No invalid data can be saved to database

### **User Experience:**
- [ ] **Intuitive Flow**: Users can create a habit in < 60 seconds
- [ ] **Error Recovery**: Clear guidance when validation fails
- [ ] **Success Feedback**: Confirmation of successful habit creation
- [ ] **Consistency**: UI matches existing app design language
- [ ] **Help System**: Tooltips and examples for complex fields

---

## 🚨 **Current System Migration Requirements**

### **Tag System Upgrade Priority:**
The existing tag validation system (`backend/utils/tag_validation.py`) currently supports only:
- **4 umbrella categories**: health, food, home, transportation
- **Basic specific tags**: ~15 total approved tags
- **Limited contextual tags**: cost-saving, restock

**CRITICAL NEED**: Expand to 10 lifestyle categories with ~60+ tags to support comprehensive lifestyle tracking goals.

### **Database Migration Strategy:**
```sql
-- Current: categories column as varchar[]
-- Future: Enhanced categories + new tags JSONB column
-- Migration: Preserve existing data while adding new structure
```

### **Backend Integration Points:**
- **✅ READY**: Supabase connection, FastAPI endpoints, tag validation infrastructure, n8n AI workflow
- **❌ MISSING**: Manual CRUD endpoints (POST/PUT/DELETE), enhanced tag definitions
- **⚠️ NEEDS UPDATE**: Analytics to support new lifestyle categories, dual-source data handling

### **n8n Workflow Integration:**
- **✅ OPERATIONAL**: GPT-4o-mini agent with Google Calendar MCP + Supabase MCP
- **✅ AI PROCESSING**: Automated tagging and categorization of calendar events
- **⚠️ COORDINATION NEEDED**: Prevent conflicts between AI-created and user-created habits
- **⚠️ TAG SYSTEM**: Update AI prompt to use new 10-category system

### **Frontend Development Priority:**
- **✅ READY**: Dark mode design system, tab-specific data flow, server-side filtering
- **❌ MISSING**: Manual habit creation UI, enhanced tag selection interface, data source indicators
- **⚠️ NEEDS UPDATE**: Analytics filtering (HIGH PRIORITY), distinguish AI vs user habits in UI

---

## 🎯 **Next Steps**

1. **Tag System Migration**: Update `backend/utils/tag_validation.py` with 10-category system
2. **n8n Workflow Update**: Modify AI prompt to use new comprehensive tag categories  
3. **Database Schema**: Add columns to distinguish AI vs manual habits in existing Supabase table
4. **Dual-Source CRUD**: Implement POST/PUT/DELETE /api/habits endpoints with source tracking
5. **Frontend Creation UI**: Build manual habit creation form using existing design patterns
6. **Data Source Coordination**: Ensure AI workflow and manual creation complement each other
7. **Analytics Enhancement**: Add lifestyle insights supporting both AI and manual habits

---

*This PRD focuses on enabling user empowerment through habit creation while maintaining the high-quality, consistent experience users expect from the existing application.*
