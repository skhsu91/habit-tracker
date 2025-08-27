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
- **Database**: Supabase PostgreSQL with `ht-calendar-events` table
- **Tag System**: Hierarchical validation (umbrella → specific → contextual)
- **UI Components**: Professional dark mode design system
- **Data Flow**: Backend APIs serving frontend with proper error handling
- **Analytics**: Charts and metrics that process habit data

### **❌ Current Limitations:**
- **Read-Only**: Users can only view imported habits from Google Sheets/Calendar
- **No CRUD Operations**: Cannot create, update, or delete habits manually
- **Limited Flexibility**: Dependent on external data sources for habit entry
- **Missing Workflow**: No interface for habit management lifecycle

### **🎯 Gap Analysis:**
| Missing Feature | Current State | Desired State |
|----------------|---------------|---------------|
| Habit Creation | External import only | User-generated habits |
| Habit Editing | Not possible | Full CRUD operations |
| Custom Categories | Fixed tag set | User-guided categorization |
| Habit Templates | None | Common habit presets |
| Validation UI | Backend only | Real-time frontend validation |

---

## 🏗️ **Technical Architecture**

### **Database Schema Changes:**
```sql
-- Extend existing ht-calendar-events table or create new habits table
ALTER TABLE "ht-calendar-events" ADD COLUMN IF NOT EXISTS:
  created_by VARCHAR(50) DEFAULT 'user',           -- 'user' vs 'import'
  habit_type VARCHAR(20) DEFAULT 'manual',         -- 'manual', 'calendar', 'recurring'
  is_template BOOLEAN DEFAULT false,               -- For preset habits
  user_id VARCHAR(100),                           -- Future multi-user support
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true;                 -- Soft delete capability

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_habits_user_active ON "ht-calendar-events" (user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_habits_created_by ON "ht-calendar-events" (created_by);
```

### **API Endpoints:**
```typescript
// New endpoints to add to backend/main.py
POST   /api/habits              // Create new habit
PUT    /api/habits/{id}         // Update existing habit  
DELETE /api/habits/{id}         // Soft delete habit
GET    /api/habits/templates    // Get habit templates
POST   /api/habits/validate     // Validate habit data

// Enhanced existing endpoints
GET    /api/tabs/habits         // Include user-created habits
GET    /api/tabs/analytics      // Include user habits in metrics
```

### **Frontend Components:**
```
Habit Creation Flow
├── HabitCreationForm.tsx       // Main creation interface
├── TagSelector.tsx             // Interactive tag selection with validation
├── DurationPicker.tsx          // Time duration input component
├── RecurrenceSelector.tsx      // Future: recurring habit setup
├── HabitTemplates.tsx          // Preset habit quick-creation
└── FormValidation.tsx          // Real-time validation feedback

Habit Management
├── HabitEditModal.tsx          // Edit existing habits
├── HabitDeleteConfirm.tsx      // Confirmation dialog
├── HabitQuickActions.tsx       // Mark complete, edit, delete
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

### **Quick Templates:**
```
Common Habit Templates
├── 🏃 Exercise (30 min, health/exercise)
├── 📚 Reading (45 min, self-care/learning)
├── 🧘 Meditation (15 min, health/mindfulness)
├── 🍳 Cooking (60 min, food/home-cooking)
├── 💻 Learning (30 min, self-care/learning)
├── 🚶 Walking (20 min, health/exercise)
├── 💧 Hydration (1 min, health/nutrition)
└── ✨ Custom (user-defined)
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

### **Tag Selection Interface:**
```
Category Selection (Multi-select with validation)
┌─────────────────────────────────┐
│ Main Categories (select 1+) *   │
│ ☑ health    ☐ food    ☐ home   │
│ ☐ transportation               │
│                                 │
│ Specific Tags (optional)        │
│ ☑ exercise  ☐ nutrition        │
│ ☐ mental-health                │
│                                 │
│ Context Tags (optional)         │
│ ☐ self-care ☐ social          │
│ ☐ mindfulness ☐ learning       │
└─────────────────────────────────┘
```

---

## 🔧 **Implementation Requirements**

### **Phase 1: Basic CRUD (2-3 weeks)**
- [ ] **Database Schema**: Extend existing table with user-created habit support
- [ ] **Backend APIs**: Create habit CRUD endpoints with validation
- [ ] **Frontend Form**: Basic habit creation form with tag selection
- [ ] **Integration**: Ensure new habits appear in existing views
- [ ] **Validation**: Implement tag hierarchy validation

### **Phase 2: Enhanced UX (1-2 weeks)**
- [ ] **Templates**: Pre-defined habit templates for quick creation
- [ ] **Bulk Actions**: Edit/delete multiple habits
- [ ] **Search & Filter**: Find habits by name, category, date
- [ ] **Sorting Options**: Sort by date, name, category, duration
- [ ] **Quick Actions**: Mark complete, edit, duplicate from habit list

### **Phase 3: Advanced Features (2-3 weeks)**
- [ ] **Recurring Habits**: Daily/weekly/monthly habit scheduling
- [ ] **Habit History**: View all instances of a habit over time
- [ ] **Analytics Integration**: Include user habits in trend analysis
- [ ] **Export/Import**: Backup and restore user-created habits
- [ ] **Multi-user Support**: Prepare for user accounts and sharing

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

## 📊 **Data Flow & Validation**

### **Habit Creation Flow:**
```
User Input → Frontend Validation → Backend API → Database
    ↓              ↓                    ↓           ↓
Form Data → Tag Validation → Supabase Insert → Success Response
    ↓              ↓                    ↓           ↓
Real-time → Error Messages → Error Handling → UI Update
```

### **Tag Validation Logic:**
```typescript
interface HabitValidation {
  name: {
    required: true,
    minLength: 3,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-\']+$/  // No special chars except - and '
  },
  categories: {
    required: true,
    minUmbrellaCategories: 1,
    validTags: APPROVED_TAGS,
    maxCategories: 10
  },
  duration: {
    min: 1,
    max: 1440,  // 24 hours
    default: 30
  },
  date: {
    required: true,
    notFuture: true,
    maxPastDays: 365
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
- [ ] **Create Habits**: Users can create habits with name, categories, duration
- [ ] **Tag Validation**: Real-time validation following existing tag hierarchy
- [ ] **Integration**: New habits appear in All Habits and Analytics views
- [ ] **Edit/Delete**: Users can modify or remove habits they created
- [ ] **Data Persistence**: Habits saved to Supabase and survive app restarts

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

## 🎯 **Next Steps**

1. **Technical Design**: Create detailed technical specifications for database changes
2. **UI Mockups**: Design creation form and integration points
3. **API Specification**: Define exact request/response formats
4. **Testing Strategy**: Plan unit, integration, and user acceptance tests
5. **Migration Plan**: Strategy for deploying database schema changes
6. **User Research**: Validate assumptions about desired creation workflow

---

*This PRD focuses on enabling user empowerment through habit creation while maintaining the high-quality, consistent experience users expect from the existing application.*
