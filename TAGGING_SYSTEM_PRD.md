# 📑 Habit Tagging System (Product Requirements Document)

## 1. **Tagging Framework**

* **Format:** All tags use **kebab-case** (lowercase, words separated by `-`).
* **Structure:**

  * **Umbrella tags**: Broad categories (e.g. `food`, `home`, `transportation`, `health`).
  * **Specific tags**: Sub-categories describing the type of habit (e.g. `meal-prep`, `laundry`, `public-transit`).
  * **Contextual tags**: Describe *intent or outcome* (e.g. `cost-saving`, `restock`).
* **Multi-tagging**: Each habit event can carry multiple tags across umbrellas.

  * Example: *"Trader Joe's run (grocery shopping for meal prep)"* → `["food","grocery","meal-prep","restock","cost-saving"]`.

---

## 2. **Approved Tag Set**

### **Health**

* `health` → umbrella for physical & mental health
* `exercise` → any workout activity
* `workout` → specific gym/workout session

### **Food**

* `food` → umbrella for nutrition-related actions
* `cooking` → cooking single meals
* `meal-prep` → cooking/prepping for multiple days
* `meal` → eating meals (at home or out)
* `takeout` → ordering or picking up prepared food
* `grocery` → grocery shopping (Trader Joe's, Safeway, etc.)
* `restock` → replenishing household consumables (can overlap with grocery, toiletries, etc.)

### **Home**

* `home` → umbrella for household tasks
* `cleaning` → generic cleaning (house, kitchen, etc.)
* `laundry` → washing/folding clothes
* `bathroom` → cleaning bathroom specifically

### **Transportation**

* `transportation` → umbrella for mobility actions
* `public-transit` → bus, BART, train, ferry
* `walking-errand` → walking as primary means for an errand
* `rideshare` → Uber/Lyft (costly option)
* `cost-saving` → intentional substitution of costly transport with cheaper option

---

## 3. **Usage Guidelines**

1. **Always apply an umbrella tag** to enable roll-ups.

   * Example: *"Laundry"* → must include `home`.
2. **Add one or more specific tags** to clarify the activity.

   * Example: *"Trader Joe's"* → `food` + `grocery`.
3. **Optionally add contextual tags** if intent matters (cost, restock, eco, etc.).

   * Example: *"Walked to Trader Joe's instead of Uber"* → `food`,`grocery`,`restock`,`walking-errand`,`cost-saving`.
4. **Avoid vague tags** like `lifestyle` or `self-care`; use concrete equivalents.

---

## 4. **Example Habit Events with Tags**

| Event Name         | Tags                                                     | Notes                                                                |
| ------------------ | -------------------------------------------------------- | -------------------------------------------------------------------- |
| Workout (Gym)      | `["health","exercise","workout"]`                        | Umbrella `health` ensures roll-up, `exercise` + `workout` for detail |
| AC Transit (to SF) | `["transportation","public-transit","cost-saving"]`      | Captures both mobility and financial intent                          |
| Food Pickup        | `["food","takeout"]`                                     | Distinguishes from home cooking                                      |
| Cook Dinner        | `["food","cooking","meal"]`                              | Simple cooking + eating                                              |
| Meal Prep (3 days) | `["food","cooking","meal-prep","restock","cost-saving"]` | Batch cooking + linked to grocery restocking & saving                |
| Trader Joe's       | `["food","grocery","restock","cost-saving"]`             | Grocery errand with financial context                                |
| Laundry            | `["home","laundry","cleaning"]`                          | Umbrella + specificity                                               |
| Bathroom Cleaning  | `["home","bathroom","cleaning"]`                         | Task-level clarity                                                   |
| Walked for Errand  | `["transportation","walking-errand","cost-saving"]`      | Tracks both movement and intent                                      |

---

## 5. **Extensibility**

* New domains can be added as additional umbrellas (`social`, `leisure`, `learning`, etc.) while keeping the **umbrella → specific → context** hierarchy.
* New tags should be checked against existing ones to avoid duplicates (e.g., use `grocery`, not `groceries`).
* Tags must remain in kebab-case for uniformity and easy parsing in automation flows (e.g., n8n).

---

## 6. **Implementation Status**

### ✅ **Current Features**
- **Interactive Tag Filtering**: Click tags to filter habits in All Habits tab
- **Visual Tag Display**: Category tags shown as clickable badges with proper spacing
- **Server-Side Filtering**: Backend handles tag-based filtering for performance
- **Consistent Styling**: Tags use consistent design matching the dark mode theme

### 🔄 **Planned Enhancements**
- **Hierarchical Tag Relationships**: Implement umbrella → specific → context relationships
- **Tag Auto-Complete**: Suggest existing tags while typing to maintain consistency
- **Tag Analytics**: Dashboard showing tag frequency and usage patterns
- **Tag Validation**: Enforce kebab-case format and prevent duplicate variations

---

## 7. **Technical Implementation**

### **Data Structure**
```typescript
interface HabitEvent {
  id: string;
  name: string;
  date: string;
  participants: string[];
  duration: number;
  categories: string[];  // This field contains the tags
  source?: string;
}
```

### **Frontend Features**
- Tags displayed as interactive badges in the All Habits tab
- Click-to-filter functionality with smooth animations
- Server-side filtering for better performance
- Consistent dark mode styling

### **Backend Support**
- Category filtering in `/api/tabs/habits` endpoint
- Server-side tag processing and aggregation
- Support for multi-tag filtering and search

---

✅ This design ensures fast, consistent logging (just apply umbrella + specific tags, add context if relevant). It also guarantees your data is queryable and visualizable in meaningful ways later.

---

## 8. **Future Roadmap**

### **Phase 1: Enhanced Tagging UI** (Next Priority)
- Tag auto-complete dropdown with existing tag suggestions
- Tag validation to enforce kebab-case format
- Visual hierarchy showing umbrella → specific relationships

### **Phase 2: Advanced Analytics**
- Tag-based analytics in the Analytics tab
- Tag frequency and usage trend charts
- Cross-tag correlation analysis

### **Phase 3: Smart Tagging**
- AI-powered tag suggestions based on habit names
- Bulk tag editing and management
- Tag relationship mapping and validation

---

*Last Updated: January 2025*
*Status: Active Development - Tag filtering and display implemented*
