# 🏷️ Unified Habit Tagging System
*Consolidated from TAGGING_SYSTEM_PRD.md (Aug 27) and HABIT_CREATION_PRD.md (Aug 28)*

## 📋 **Document Overview**

| Field | Value |
|-------|-------|
| **Document Type** | Technical Specification |
| **Consolidated From** | TAGGING_SYSTEM_PRD.md + HABIT_CREATION_PRD.md |
| **Version** | 2.0 (Unified) |
| **Created** | January 2025 |
| **Status** | Active Development |

---

## 🎯 **Unified Tagging Framework**

### **Core Principles (Preserved from Original)**
- **Format**: All tags use **kebab-case** (lowercase, words separated by `-`)
- **Multi-tagging**: Each habit can carry multiple tags across categories
- **Hierarchy**: Umbrella → Specific → Context structure maintained
- **Consistency**: Avoid duplicates and maintain uniform naming

### **Enhanced Tag Architecture (Evolved)**
```
Tag Hierarchy:
├── Primary Categories (Umbrellas) - REQUIRED, 1-3 selections
├── Specific Activity Tags - OPTIONAL, filtered by primary
├── Lifestyle Impact Tags - OPTIONAL, cross-cutting benefits
├── Social Context Tags - OPTIONAL, social situation
└── Location & Setting Tags - OPTIONAL, where activity occurs
```

---

## 🏷️ **Primary Categories (Umbrellas)**

### **Original 4 Categories (Proven & Working)**
```
├── 🏥 health          // Physical & mental wellness
├── 🍽️ food           // Nutrition, cooking, dining  
├── 🏠 home           // Household, maintenance, organization
└── 🚌 transportation  // Movement, travel, commuting
```

### **Additional 6 Categories (Lifestyle Expansion)**
```
├── 👥 social         // Interpersonal interactions
├── 🎓 learning       // Knowledge acquisition, skill development
├── 🎮 leisure        // Entertainment, hobbies, relaxation
├── 💼 career         // Professional development, work-related
├── 💰 financial      // Money management, spending patterns
└── 🌱 personal       // Self-improvement, habits, routines
```

---

## 🎯 **Specific Activity Tags**

### **Health & Wellness**
```
├── exercise          // Active physical movement (ORIGINAL)
├── workout           // Specific gym/workout session (ORIGINAL)
├── outdoor-activity  // Fresh air, nature-based activities
├── mental-health     // Stress relief, emotional wellness
├── nutrition         // Healthy eating choices
├── sleep-hygiene     // Rest and recovery
├── mindfulness       // Meditation, breathing, presence
└── medical-care      // Healthcare appointments, prevention
```

### **Food & Nutrition**
```
├── cooking           // Cooking single meals (ORIGINAL)
├── meal-prep         // Cooking/prepping for multiple days (ORIGINAL)
├── meal              // Eating meals (at home or out) (ORIGINAL)
├── takeout           // Ordering or picking up prepared food (ORIGINAL)
├── grocery           // Grocery shopping (ORIGINAL)
├── home-cooking      // Preparing meals at home
├── dining-out        // Restaurant meals
└── grocery-shopping  // Extended grocery/food shopping
```

### **Home & Household**
```
├── cleaning          // Generic cleaning (ORIGINAL)
├── laundry           // Washing/folding clothes (ORIGINAL)
├── bathroom          // Cleaning bathroom specifically (ORIGINAL)
├── organization      // Organizing spaces, decluttering
├── maintenance       // Home repairs, upkeep
├── decorating        // Interior design, home improvement
└── gardening         // Plant care, yard work
```

### **Transportation & Mobility**
```
├── public-transit    // Bus, BART, train, ferry (ORIGINAL)
├── walking-errand    // Walking as primary means for an errand (ORIGINAL)
├── rideshare         // Uber/Lyft (costly option) (ORIGINAL)
├── walking           // Walking as transportation
├── cycling           // Bike for transportation
├── driving           // Car usage
└── delivery-pickup   // Delivery vs. pickup choices
```

### **Social Interactions**
```
├── friends           // Hanging out with friends
├── family            // Time with family members
├── romantic          // Partner/relationship activities
├── networking        // Professional social connections
├── community         // Neighborhood, volunteer activities
├── group-activity    // Organized social events
└── date-night        // Romantic outings
```

### **Learning & Development**
```
├── career-skills     // Professional development
├── relationship-skills // Improving personal relationships
├── hobby-learning    // New hobbies, creative skills
├── academic          // Formal education, courses
├── self-help         // Personal development books/content
├── practical-skills  // Life skills (cooking, repair, etc.)
└── language          // Language learning
```

### **Leisure & Entertainment**
```
├── reading           // Books, articles, recreational reading
├── entertainment     // Movies, shows, games
├── hobbies           // Personal interests, crafts
├── sports-watching   // Spectator sports
├── cultural          // Museums, art, concerts
├── gaming            // Video games, board games
└── relaxation        // Downtime, rest activities
```

### **Career & Professional**
```
├── skill-development // Learning job-related skills
├── networking        // Professional relationship building
├── professional-growth // Career advancement activities
├── job-search        // Job hunting, interviewing
└── workplace-wellness // Work-life balance activities
```

### **Financial Behavior**
```
├── cost-saving       // Choices that save money (ORIGINAL)
├── cost-spending     // Choices that cost more money
├── investment        // Long-term financial planning
├── budgeting         // Financial tracking, planning
├── shopping          // Purchasing decisions
└── financial-learning // Money management education
```

### **Personal Development**
```
├── self-care         // Personal wellness activities
├── goal-setting      // Planning and goal work
├── reflection        // Journaling, thinking time
├── habits            // Building/maintaining routines
└── productivity      // Organization, efficiency work
```

---

## 🎨 **Contextual Tags**

### **Lifestyle Impact Tags**
```
├── health-positive   // Supports physical/mental health
├── cost-effective    // Saves money or provides value (ORIGINAL as cost-saving)
├── time-efficient    // Efficient use of time
├── social-bonding    // Strengthens relationships
├── skill-building    // Develops new capabilities
├── stress-relief     // Reduces stress, promotes relaxation
├── goal-aligned      // Supports personal goals
├── spontaneous       // Unplanned, flexible activities
└── restock          // Replenishing household consumables (ORIGINAL)
```

### **Social Context Tags**
```
├── solo             // Individual activity
├── partner          // With romantic partner
├── friends          // With friends
├── family           // With family
├── colleagues       // Work-related social
├── group            // Larger group activity
└── community        // Neighborhood/community involvement
```

### **Location & Setting Tags**
```
├── home             // At home
├── outdoors         // Outside, nature
├── public-space     // Restaurants, bars, venues
├── workplace        // Office, work environment
├── transit          // While traveling/commuting
├── online           // Digital/virtual activity
└── local            // Within neighborhood/local area
```

---

## 📋 **Migration Strategy**

### **Backward Compatibility**
```sql
-- Preserve existing tags while adding new structure
-- Current: categories TEXT[] 
-- Future: Enhanced multi-column tag system

-- Map existing 4-category tags to new 10-category system:
health → health (unchanged)
food → food (unchanged) 
home → home (unchanged)
transportation → transportation (unchanged)

-- Existing specific tags remain valid:
exercise, workout, cooking, meal-prep, laundry, etc.
```

### **Gradual Enhancement**
1. **Phase 1**: Add new primary categories to validation
2. **Phase 2**: Introduce specific tags for new categories  
3. **Phase 3**: Add lifestyle impact and context tags
4. **Phase 4**: UI enhancements for tag selection

---

## 🛠️ **Technical Implementation**

### **Validation Rules (Enhanced)**
```typescript
interface UnifiedTagValidation {
  primaryCategories: {
    required: true,
    minSelection: 1,
    maxSelection: 3,
    validOptions: [
      // Original 4 (proven)
      'health', 'food', 'home', 'transportation',
      // New 6 (lifestyle expansion)
      'social', 'learning', 'leisure', 'career', 
      'financial', 'personal'
    ]
  },
  
  specificTags: {
    required: false,
    maxSelection: 5,
    filteredByPrimary: true,
    validTags: {
      // Comprehensive mapping of all specific tags by primary category
      health: ['exercise', 'workout', 'outdoor-activity', 'mental-health', 'nutrition', 'sleep-hygiene', 'mindfulness', 'medical-care'],
      food: ['cooking', 'meal-prep', 'meal', 'takeout', 'grocery', 'home-cooking', 'dining-out', 'grocery-shopping'],
      home: ['cleaning', 'laundry', 'bathroom', 'organization', 'maintenance', 'decorating', 'gardening'],
      transportation: ['public-transit', 'walking-errand', 'rideshare', 'walking', 'cycling', 'driving', 'delivery-pickup'],
      social: ['friends', 'family', 'romantic', 'networking', 'community', 'group-activity', 'date-night'],
      learning: ['career-skills', 'relationship-skills', 'hobby-learning', 'academic', 'self-help', 'practical-skills', 'language'],
      leisure: ['reading', 'entertainment', 'hobbies', 'sports-watching', 'cultural', 'gaming', 'relaxation'],
      career: ['skill-development', 'networking', 'professional-growth', 'job-search', 'workplace-wellness'],
      financial: ['cost-saving', 'cost-spending', 'investment', 'budgeting', 'shopping', 'financial-learning'],
      personal: ['self-care', 'goal-setting', 'reflection', 'habits', 'productivity']
    }
  },
  
  lifestyleImpact: {
    required: false,
    maxSelection: 4,
    validOptions: [
      'health-positive', 'cost-effective', 'time-efficient',
      'social-bonding', 'skill-building', 'stress-relief', 
      'goal-aligned', 'spontaneous', 'restock'
    ]
  },
  
  socialContext: {
    required: false,
    maxSelection: 2,
    validOptions: [
      'solo', 'partner', 'friends', 'family', 
      'colleagues', 'group', 'community'
    ]
  },
  
  locationSetting: {
    required: false,
    maxSelection: 2,
    validOptions: [
      'home', 'outdoors', 'public-space', 'workplace',
      'transit', 'online', 'local'
    ]
  }
}
```

---

## 📊 **Example Usage (Unified)**

### **Original Examples (Preserved)**
```
Event: "Workout (Gym)"
Tags: ["health","exercise","workout"]
```

### **Enhanced Examples (New Capabilities)**
```
Event: "Reading relationship book at home"
Primary: [learning] 
Specific: [relationship-skills, self-help]
Lifestyle: [skill-building, goal-aligned]
Social: [solo]
Location: [home]

Event: "Taking bus to hang with friends"  
Primary: [social, transportation]
Specific: [friends, public-transit]
Lifestyle: [social-bonding, cost-effective]
Social: [friends]
Location: [local]

Event: "Meal prep Sunday for work week"
Primary: [food, personal]
Specific: [meal-prep, home-cooking]
Lifestyle: [cost-effective, time-efficient, health-positive]
Social: [solo] 
Location: [home]
```

---

## ✅ **Implementation Checklist**

### **Backend Migration**
- [ ] Update `backend/utils/tag_validation.py` with unified tag definitions
- [ ] Add new validation rules for enhanced tag categories
- [ ] Ensure backward compatibility with existing 4-category data
- [ ] Add database columns for enhanced tag structure

### **Frontend Updates**
- [ ] Enhance tag selection UI with hierarchical display
- [ ] Implement progressive disclosure for tag categories
- [ ] Add tag auto-complete with existing tag suggestions
- [ ] Update filtering to support new tag categories

### **Data Migration**
- [ ] Preserve all existing tags during migration
- [ ] Map existing data to new enhanced structure
- [ ] Test backward compatibility thoroughly
- [ ] Create rollback procedures

---

## 🎯 **Success Metrics**

- **Migration Success**: 100% of existing tags preserved and enhanced
- **User Adoption**: 80% of new habits use enhanced tagging within 30 days
- **Data Quality**: Zero tag validation errors in production
- **Performance**: Tag operations remain under 200ms response time

---

*This unified specification resolves conflicts between the original tagging system and the enhanced requirements while preserving all working functionality and proven patterns.*
