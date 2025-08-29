# 📱 Mobile App Deployment PRD
*Product Requirements Document for React Native Migration & App Store Deployment*

## 📋 **Document Overview**

| Field | Value |
|-------|-------|
| **Document Type** | Product Requirements Document (PRD) |
| **Project** | Habit Tracker Mobile App |
| **Version** | 1.0 |
| **Created** | August 27, 2024 |
| **Status** | Draft |
| **Owner** | Development Team |

---

## 🎯 **Executive Summary**

Transform the existing React web application into a native mobile app deployable to Apple App Store and Google Play Store, while maintaining feature parity and enhancing mobile-specific functionality.

### **Key Objectives:**
- **React Native Migration**: Convert React web app to React Native
- **App Store Deployment**: Publish to Apple App Store and Google Play Store  
- **Mobile-First UX**: Optimize for touch interactions and mobile patterns
- **Cross-Platform**: Single codebase for iOS and Android
- **Performance**: Native-level performance and responsiveness

---

## 🔍 **Current State Analysis**

### **✅ Mobile-Ready Foundation:**
- **State-Based Navigation**: Already using state-based navigation (no URL routing)
- **Mobile-First Design**: Responsive design with touch-friendly interfaces
- **Dark Mode**: Professional dark theme optimized for mobile viewing
- **Component Architecture**: Well-structured React components ready for React Native
- **API Integration**: RESTful backend ready for mobile consumption

### **🔄 Migration Requirements:**
- **Navigation**: Convert state-based tabs to React Navigation
- **Styling**: Transform CSS/Tailwind to React Native StyleSheet
- **Icons**: Replace Heroicons with React Native compatible icons
- **Charts**: Replace Chart.js with React Native charting library
- **Authentication**: Adapt Google OAuth for mobile app context
- **Storage**: Implement secure local storage for tokens and preferences

---

## 🏗️ **Technical Architecture**

### **React Native Stack:**
```
Frontend (React Native)
├── Navigation: React Navigation 6
├── UI Framework: React Native + Custom Components
├── State Management: React Context/useState (current)
├── Icons: React Native Vector Icons
├── Charts: Victory Native or React Native Chart Kit
├── HTTP Client: Axios (existing)
├── Authentication: React Native Google OAuth
└── Storage: React Native Secure Storage

Backend (Unchanged)
├── FastAPI with current endpoints
├── Google Calendar integration
├── Supabase database
├── CORS configured for mobile
└── Same API contracts
```

### **Platform-Specific Considerations:**

#### **iOS (Apple App Store):**
- **Development**: Xcode 14+ required
- **Deployment Target**: iOS 12.0+ (React Native minimum)
- **Apple Developer Account**: $99/year required
- **Bundle ID**: `com.habittracker.app` (to be registered)
- **Privacy Policy**: Required for App Store submission
- **App Review**: Apple's review process (1-7 days typical)

#### **Android (Google Play Store):**
- **Development**: Android Studio + Android SDK
- **Target SDK**: Android API 31+ (Android 12+)
- **Google Play Console**: $25 one-time registration fee
- **Package Name**: `com.habittracker.app` (matching iOS)
- **App Signing**: Google Play App Signing recommended
- **Review Process**: Faster than Apple (few hours to 3 days)

---

## 📱 **Mobile App Features**

### **Core Features (Feature Parity):**
1. **Daily Overview**
   - Today's habits with completion status
   - Upcoming calendar events
   - Daily metrics and progress

2. **All Habits View**
   - Searchable and filterable habit list
   - Category-based organization
   - Quick actions (mark complete, edit)

3. **Analytics Dashboard**
   - Interactive charts optimized for mobile
   - Category breakdowns
   - Trend analysis with swipe gestures

4. **Google Calendar Integration**
   - OAuth authentication via mobile browser
   - Event display in daily overview
   - Timezone-aware scheduling

### **Mobile-Enhanced Features:**
5. **Push Notifications**
   - Habit reminders at scheduled times
   - Upcoming event notifications
   - Achievement celebrations

6. **Offline Capability**
   - Local storage of recent data
   - Offline habit logging
   - Sync when connection restored

7. **Mobile-Specific UX**
   - Pull-to-refresh functionality
   - Swipe gestures for quick actions
   - Haptic feedback for interactions
   - Portrait/landscape orientation support

8. **Device Integration**
   - Camera for habit photos/evidence
   - Location services for location-based habits
   - Health app integration (iOS) / Google Fit (Android)
   - Widgets for quick habit tracking

---

## 🎨 **UI/UX Design Requirements**

### **Navigation Pattern:**
```
Tab Navigation (Bottom)
├── 🏠 Overview (Daily view)
├── 📝 Habits (All habits list)
├── 📊 Analytics (Charts & insights)
└── ⚙️ Settings (Profile & preferences)

Stack Navigation (Screens)
├── Habit Details
├── Add/Edit Habit
├── Calendar Sync Settings
└── Profile/Settings
```

### **Mobile Design Principles:**
- **Touch Targets**: Minimum 44pt touch areas
- **Thumb Navigation**: Bottom navigation for one-handed use
- **Progressive Disclosure**: Minimize cognitive load
- **Consistent Patterns**: Follow platform design guidelines
- **Accessibility**: VoiceOver/TalkBack support

### **Platform-Specific Adaptations:**
- **iOS**: Follow Human Interface Guidelines (HIG)
  - Native navigation patterns
  - iOS-style alerts and modals
  - SF Symbols where appropriate
  
- **Android**: Follow Material Design principles
  - Floating Action Buttons
  - Material themed components
  - Android-style navigation

---

## 📱 **Detailed UI Mockups & Specifications**

### **1. Daily Overview Screen (Home Tab)**

#### **Layout Structure:**
```
┌─────────────────────────────────┐
│ ●●● 9:41 AM                🔋●│ ← Status Bar
├─────────────────────────────────┤
│ 📅 Today, Jan 22             ⚙️│ ← Header (44pt)
├─────────────────────────────────┤
│ 🎯 Daily Progress              │
│ ██████████░░ 83% Complete       │ ← Progress Card (80pt)
│ 5 of 6 habits done today       │
├─────────────────────────────────┤
│ 📋 Planned for Today           │ ← Section Header (32pt)
│                                 │
│ ┌─ 🏃 Morning Workout ──────┐   │ ← Habit Card (60pt)
│ │ 7:00 AM • 30 min          │   │   Touch Target: 44pt min
│ │ ✅ Completed              │   │   Swipe: Mark incomplete
│ └───────────────────────────┘   │
│                                 │
│ ┌─ 📚 Reading ──────────────┐   │ ← Habit Card (60pt)
│ │ 8:30 PM • 45 min          │   │   Touch Target: 44pt min
│ │ ⏰ Upcoming               │   │   Swipe: Mark complete
│ └───────────────────────────┘   │
│                                 │
│ ┌─ 🧘 Meditation ───────────┐   │ ← Habit Card (60pt)
│ │ No time set • 15 min      │   │   Touch Target: 44pt min
│ │ ⭕ Pending                │   │   Tap: Quick complete
│ └───────────────────────────┘   │
├─────────────────────────────────┤
│ 📈 Quick Stats                  │ ← Section Header (32pt)
│ Week: 85% avg • Streak: 12 days │ ← Stats Row (40pt)
│ Best day: Monday (100%)         │
├─────────────────────────────────┤
│ 🏠  📝  📊  ⚙️               │ ← Tab Bar (80pt)
│ ●   ○   ○   ○                 │   Safe Area Bottom
└─────────────────────────────────┘
```

#### **Interactive Elements:**
- **Pull-to-Refresh**: Sync latest data from backend
- **Habit Card Swipe**: 
  - Swipe right: Mark complete (✅)
  - Swipe left: Mark incomplete/skip (⏭️)
- **Long Press**: Quick edit habit time/duration
- **Tap Progress Bar**: Navigate to detailed analytics

#### **Visual States:**
```
Habit Status Indicators:
✅ Completed    - Green background, checkmark icon
⏰ Upcoming     - Blue background, clock icon  
⭕ Pending      - Gray background, circle icon
⏭️ Skipped      - Orange background, forward icon
🔴 Overdue      - Red background, warning icon
```

### **2. All Habits Screen (Habits Tab)**

#### **Layout Structure:**
```
┌─────────────────────────────────┐
│ All Habits               🔍 + │ ← Header with Search & Add
├─────────────────────────────────┤
│ 🔍 Search habits...            │ ← Search Bar (44pt)
├─────────────────────────────────┤
│ Filter: All ▼  Sort: Time ▼   │ ← Filter Bar (40pt)
├─────────────────────────────────┤
│ TODAY • Jan 22                  │ ← Date Section (32pt)
│                                 │
│ ┌─ 🏃 Morning Workout ──────┐   │ ← Habit Entry (72pt)
│ │ ✅ 7:00 AM • 30 min       │   │   Health > Exercise
│ │ health, exercise, self-care │   │   3-dot menu: Edit/Delete
│ └───────────────────────── ⋮ ┘   │
│                                 │
│ ┌─ ☕ Coffee & News ────────┐   │ ← Habit Entry (72pt)
│ │ ✅ 7:30 AM • 15 min       │   │   Food > Nutrition
│ │ food, nutrition, morning    │   │   Swipe: Quick actions
│ └───────────────────────── ⋮ ┘   │
│                                 │
│ YESTERDAY • Jan 21              │ ← Date Section (32pt)
│                                 │
│ ┌─ 📚 Reading ──────────────┐   │ ← Habit Entry (72pt)
│ │ ✅ 8:30 PM • 45 min       │   │   Self-care > Learning
│ │ self-care, learning         │   │   Completed yesterday
│ └───────────────────────── ⋮ ┘   │
│                                 │
│ [Load More...]                  │ ← Pagination (40pt)
├─────────────────────────────────┤
│ 🏠  📝  📊  ⚙️               │ ← Tab Bar (80pt)
│ ○   ●   ○   ○                 │
└─────────────────────────────────┘
```

#### **Advanced Filtering UI:**
```
Filter Options (Modal/Sheet):
┌─────────────────────────────────┐
│ Filters                      ✕ │
├─────────────────────────────────┤
│ 📅 Date Range                  │
│ ○ Today      ○ This Week        │
│ ○ This Month ● Custom Range     │
│ [Jan 1] ─────────── [Jan 31]    │
├─────────────────────────────────┤
│ 🏷️ Categories                  │
│ ☑️ Health    ☑️ Food           │
│ ☑️ Home      ☐ Transportation   │
├─────────────────────────────────┤
│ ✅ Completion Status            │
│ ☑️ Completed  ☑️ Pending       │
│ ☐ Skipped    ☐ Overdue         │
├─────────────────────────────────┤
│ ⏱️ Duration                    │
│ ○ Any  ○ < 30min  ○ 30-60min   │
│ ○ > 60min                      │
├─────────────────────────────────┤
│ [Clear All]      [Apply (23)]   │
└─────────────────────────────────┘
```

### **3. Analytics Screen (Analytics Tab)**

#### **Layout Structure:**
```
┌─────────────────────────────────┐
│ Analytics               🗓️ ⚙️ │ ← Header with Date & Settings
├─────────────────────────────────┤
│ 📊 This Week • Jan 16-22       │ ← Time Period Selector
├─────────────────────────────────┤
│ 🎯 Completion Rate              │ ← Key Metric Card (100pt)
│     ████████████████████ 85%    │   Large number display
│     +5% vs last week            │   Comparison indicator
├─────────────────────────────────┤
│ 📈 Daily Trends                 │ ← Chart Section Header
│ ┌─────────────────────────────┐ │
│ │    ●                       │ │ ← Line Chart (200pt)
│ │   ● ●   ●                   │ │   Touch: Show details
│ │  ●   ● ●   ●                │ │   Pinch: Zoom in/out
│ │ ●     ●     ●               │ │   Scroll: Pan timeline
│ │ M T W T F S S               │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ 🏷️ By Category                 │ ← Section Header
│ ┌─────────────────────────────┐ │
│ │ Health     ████████ 89%     │ │ ← Category Bars (40pt each)
│ │ Food       ██████   75%     │ │   Tap: Drill down details
│ │ Self-care  ██████   82%     │ │   Color coded per category
│ │ Home       ████     67%     │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ ⏱️ Time Distribution            │ ← Section Header
│ ┌─────────────────────────────┐ │
│ │     Morning: 45%            │ │ ← Pie Chart (180pt)
│ │    Evening: 35%    🌅       │ │   Touch: Highlight segment
│ │    Afternoon: 20%  🌆       │ │   Legend on the side
│ │                   🌃       │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ 🏠  📝  📊  ⚙️               │ ← Tab Bar (80pt)
│ ○   ○   ●   ○                 │
└─────────────────────────────────┘
```

#### **Interactive Chart Features:**
- **Pinch-to-Zoom**: Zoom into chart timeframes
- **Pan Gestures**: Scroll through historical data
- **Touch Tooltips**: Show exact values on chart touch
- **Drill-Down**: Tap category to see habit breakdown
- **Time Period Toggle**: Switch between day/week/month/year views

### **4. Settings Screen (Settings Tab)**

#### **Layout Structure:**
```
┌─────────────────────────────────┐
│ Settings                        │ ← Header
├─────────────────────────────────┤
│ 👤 Profile                      │ ← Section Header
│ ┌─────────────────────────────┐ │
│ │ 👤 John Doe                 │ │ ← Profile Card (80pt)
│ │ john@example.com            │ │   Tap: Edit profile
│ │ Member since Jan 2024  >    │ │   Arrow: Navigate
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ 🔗 Integrations                 │ ← Section Header
│ ┌─────────────────────────────┐ │
│ │ 📅 Google Calendar     ✅ │ │ ← Integration Row (56pt)
│ │ Last sync: 2 min ago   >    │ │   Status indicator
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ 💾 Data Export         >    │ │ ← Export Row (56pt)
│ │ Download your data          │ │   Tap: Export options
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ 🔔 Notifications                │ ← Section Header
│ ┌─────────────────────────────┐ │
│ │ 📱 Push Notifications  🔛  │ │ ← Toggle Row (56pt)
│ │ Habit reminders            │ │   Native toggle control
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ ⏰ Daily Summary       🔛  │ │ ← Toggle Row (56pt)
│ │ 8:00 PM daily digest       │ │   Time configuration
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ 🎨 Appearance                   │ ← Section Header
│ ┌─────────────────────────────┐ │
│ │ 🌙 Dark Mode          🔛   │ │ ← Toggle Row (56pt)
│ │ Follow system setting       │ │   Auto/Manual toggle
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ ℹ️ About                        │ ← Section Header
│ ┌─────────────────────────────┐ │
│ │ 📱 Version 1.0.0        >   │ │ ← Info Row (44pt)
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ 🔒 Privacy Policy       >   │ │ ← Legal Row (44pt)
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ 📄 Terms of Service     >   │ │ ← Legal Row (44pt)
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ 🏠  📝  📊  ⚙️               │ ← Tab Bar (80pt)
│ ○   ○   ○   ●                 │
└─────────────────────────────────┘
```

### **5. Habit Creation/Edit Modal**

#### **Layout Structure:**
```
┌─────────────────────────────────┐
│ ✕ Add New Habit           Save │ ← Modal Header (56pt)
├─────────────────────────────────┤
│ 📝 Habit Details                │ ← Section Header (32pt)
│                                 │
│ ┌─────────────────────────────┐ │ ← Name Input (56pt)
│ │ Habit Name                  │ │   Placeholder text
│ │ Morning workout             │ │   Real-time validation
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │ ← Duration Picker (56pt)
│ │ Duration: 30 minutes    ⏱️  │ │   Tap: Time picker wheel
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ 🏷️ Categories                  │ ← Section Header (32pt)
│                                 │
│ Main Category (Required)        │ ← Label (24pt)
│ ☑️ Health  ☐ Food  ☐ Home     │ ← Category Pills (40pt)
│ ☐ Transportation               │   Multi-select interface
│                                 │
│ Specific Tags (Optional)        │ ← Label (24pt)
│ ☑️ Exercise  ☐ Nutrition       │ ← Tag Pills (32pt)
│ ☐ Mental Health                │   Filtered by main category
│                                 │
│ Context Tags (Optional)         │ ← Label (24pt)
│ ☑️ Self-care  ☐ Social         │ ← Context Pills (32pt)
│ ☐ Mindfulness  ☐ Learning      │   Independent selection
├─────────────────────────────────┤
│ ⏰ Scheduling                   │ ← Section Header (32pt)
│                                 │
│ ┌─────────────────────────────┐ │ ← Time Input (56pt)
│ │ Preferred Time (Optional)   │ │   Time picker on tap
│ │ 7:00 AM                 ⏰ │ │   Clear button available
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │ ← Frequency Picker (56pt)
│ │ Frequency: Daily        🔁  │ │   Options: Daily, Custom
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ 📝 Notes (Optional)             │ ← Section Header (32pt)
│ ┌─────────────────────────────┐ │
│ │ Additional details...       │ │ ← Text Area (80pt)
│ │                             │ │   Multi-line input
│ │                             │ │   500 char limit
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ [Cancel]              [Save]    │ ← Action Buttons (56pt)
└─────────────────────────────────┘
```

### **6. Push Notification Design**

#### **iOS Notification:**
```
┌─────────────────────────────────┐
│ 📱 Habit Tracker           now │
│ 🏃 Time for Morning Workout!    │
│ You have a 30-minute session    │
│ scheduled for 7:00 AM          │
│                    [Mark Done] │
└─────────────────────────────────┘
```

#### **Android Notification:**
```
┌─────────────────────────────────┐
│ 📱 Habit Tracker • now          │
│ 🏃 Morning Workout reminder      │
│ 30 minutes • Tap to mark done   │
│ [Skip] [Done] [Snooze 10min]    │
└─────────────────────────────────┘
```

### **7. Widget Design (iOS/Android)**

#### **Small Widget (iOS):**
```
┌─────────────────┐
│ Habit Tracker   │
│                 │
│ 🎯 Today: 5/6   │
│ ████████████░░  │
│ 83% Complete    │
│                 │
│ Next: 📚 8:30PM │
└─────────────────┘
```

#### **Medium Widget (Android):**
```
┌─────────────────────────────────┐
│ 📱 Habit Tracker          83%  │
├─────────────────────────────────┤
│ 🏃 Workout        ✅ Done      │
│ ☕ Coffee & News   ✅ Done      │
│ 📚 Reading         ⏰ 8:30 PM  │
│ 🧘 Meditation      ⭕ Pending   │
└─────────────────────────────────┘
```

---

## 🔧 **Development Phases**

### **Phase 1: React Native Foundation (2-3 weeks)**
- [ ] **Environment Setup**
  - Install React Native CLI and dependencies
  - Configure iOS/Android development environments
  - Set up simulator/emulator testing

- [ ] **Project Migration**
  - Create React Native project structure
  - Convert core components to React Native
  - Implement basic navigation structure

- [ ] **Styling Migration**
  - Convert Tailwind CSS to React Native StyleSheet
  - Implement dark theme for mobile
  - Ensure responsive design for various screen sizes

### **Phase 2: Feature Implementation (3-4 weeks)**
- [ ] **Core Functionality**
  - Port all existing React components
  - Implement API integration
  - Add offline storage capability

- [ ] **Mobile-Specific Features**
  - Push notifications setup
  - Device integration (camera, health)
  - Pull-to-refresh and swipe gestures

- [ ] **Authentication**
  - Adapt Google OAuth for mobile
  - Implement secure token storage
  - Calendar integration testing

### **Phase 3: Platform Preparation (2-3 weeks)**
- [ ] **App Store Requirements**
  - App icons for all required sizes
  - Splash screens/launch screens
  - Privacy policy and terms of service
  - App descriptions and screenshots

- [ ] **Testing & QA**
  - Device testing on multiple iOS/Android versions
  - Performance optimization
  - Accessibility testing
  - Beta testing with TestFlight/Internal Testing

### **Phase 4: Deployment (1-2 weeks)**
- [ ] **App Store Submission**
  - Apple App Store submission and review
  - Google Play Store submission and review
  - Handle review feedback and resubmissions

- [ ] **Post-Launch**
  - Monitor crash reports and analytics
  - User feedback collection
  - Performance monitoring

---

## 🔧 **Technical Implementation Specifications**

### **React Native Component Mapping**

#### **Web → React Native Component Migration:**
```typescript
// Current Web Components → React Native Equivalents

Web Component                 React Native Component
├── div                      → View
├── p, span, h1, h2         → Text  
├── button                   → TouchableOpacity/Pressable
├── input[type="text"]       → TextInput
├── img                      → Image
├── ScrollView (web)         → ScrollView (native)
├── CSS Flexbox             → Native Flexbox (identical API)
└── onClick handlers        → onPress handlers

// Navigation Migration:
├── State-based tabs        → @react-navigation/bottom-tabs
├── Modal overlays          → @react-navigation/stack
├── React Router (if used)  → React Navigation 6
└── Browser history         → Navigation state management
```

#### **Styling Migration Strategy:**
```typescript
// Tailwind CSS → React Native StyleSheet

// Current: className="bg-gray-900 text-white p-4 rounded-lg"
// Becomes:
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#111827',  // gray-900
    color: '#ffffff',           // text-white  
    padding: 16,                // p-4 (4 * 4px = 16px)
    borderRadius: 8,            // rounded-lg
  }
});

// Dark theme variables:
const darkTheme = {
  colors: {
    primary: '#3b82f6',        // blue-500
    background: '#111827',     // gray-900
    surface: '#1f2937',        // gray-800
    text: '#f9fafb',          // gray-50
    textSecondary: '#9ca3af',  // gray-400
    border: '#374151',         // gray-700
    success: '#10b981',        // emerald-500
    warning: '#f59e0b',        // amber-500
    error: '#ef4444',          // red-500
  }
};
```

### **Data Source Integration**

#### **API Service Layer (Unchanged):**
```typescript
// services/api.ts - Already mobile-ready
import axios from 'axios';

const API_BASE = __DEV__ 
  ? 'http://localhost:8000'     // Development
  : 'https://api.habittracker.app';  // Production

export const habitAPI = {
  // These endpoints work identically in React Native
  getOverviewData: () => axios.get(`${API_BASE}/api/tabs/overview`),
  getAllHabits: () => axios.get(`${API_BASE}/api/tabs/habits`),
  getAnalytics: () => axios.get(`${API_BASE}/api/tabs/analytics`),
  createHabit: (habit: NewHabit) => axios.post(`${API_BASE}/api/habits`, habit),
  updateHabit: (id: string, habit: Partial<Habit>) => 
    axios.put(`${API_BASE}/api/habits/${id}`, habit),
};

// Network handling for mobile:
import NetInfo from '@react-native-netinfo/netinfo';

export const networkService = {
  isConnected: async () => {
    const state = await NetInfo.fetch();
    return state.isConnected;
  },
  
  onNetworkChange: (callback: (isConnected: boolean) => void) => {
    return NetInfo.addEventListener(state => {
      callback(state.isConnected ?? false);
    });
  }
};
```

#### **Offline Storage Implementation:**
```typescript
// services/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit } from '../types/habit';

export const offlineStorage = {
  // Cache habits for offline access
  saveHabits: async (habits: Habit[]) => {
    try {
      await AsyncStorage.setItem('cached_habits', JSON.stringify(habits));
      await AsyncStorage.setItem('last_sync', new Date().toISOString());
    } catch (error) {
      console.error('Failed to cache habits:', error);
    }
  },

  getCachedHabits: async (): Promise<Habit[]> => {
    try {
      const cached = await AsyncStorage.getItem('cached_habits');
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('Failed to retrieve cached habits:', error);
      return [];
    }
  },

  // Queue offline actions for later sync
  queueOfflineAction: async (action: OfflineAction) => {
    try {
      const queue = await AsyncStorage.getItem('offline_queue');
      const actions: OfflineAction[] = queue ? JSON.parse(queue) : [];
      actions.push({ ...action, timestamp: Date.now() });
      await AsyncStorage.setItem('offline_queue', JSON.stringify(actions));
    } catch (error) {
      console.error('Failed to queue offline action:', error);
    }
  },

  processOfflineQueue: async () => {
    try {
      const queue = await AsyncStorage.getItem('offline_queue');
      if (!queue) return;
      
      const actions: OfflineAction[] = JSON.parse(queue);
      for (const action of actions) {
        await processOfflineAction(action);
      }
      
      await AsyncStorage.removeItem('offline_queue');
    } catch (error) {
      console.error('Failed to process offline queue:', error);
    }
  }
};

interface OfflineAction {
  type: 'CREATE_HABIT' | 'UPDATE_HABIT' | 'MARK_COMPLETE';
  data: any;
  timestamp: number;
}
```

### **Authentication & Security Implementation**

#### **Google OAuth for Mobile:**
```typescript
// services/auth.ts
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { authorize } from 'react-native-app-auth';

// Google Calendar OAuth configuration
const calendarAuthConfig = {
  issuer: 'https://accounts.google.com',
  clientId: 'YOUR_CLIENT_ID.apps.googleusercontent.com',
  redirectUrl: 'com.habittracker.app://oauth/callback',
  scopes: [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar'
  ],
  additionalParameters: {},
  customHeaders: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
};

export const authService = {
  initializeGoogleSignIn: () => {
    GoogleSignin.configure({
      scopes: calendarAuthConfig.scopes,
      webClientId: calendarAuthConfig.clientId,
      offlineAccess: true,
      hostedDomain: '',
      forceCodeForRefreshToken: true,
    });
  },

  signInWithGoogle: async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      return userInfo;
    } catch (error) {
      console.error('Google Sign-In failed:', error);
      throw error;
    }
  },

  authorizeCalendar: async () => {
    try {
      const result = await authorize(calendarAuthConfig);
      await secureStorage.setTokens(result);
      return result;
    } catch (error) {
      console.error('Calendar authorization failed:', error);
      throw error;
    }
  }
};
```

#### **Secure Token Storage:**
```typescript
// services/secureStorage.ts
import * as Keychain from 'react-native-keychain';

export const secureStorage = {
  setTokens: async (tokens: AuthTokens) => {
    try {
      await Keychain.setSecurePassword(
        'habittracker_tokens',
        'auth_tokens',
        JSON.stringify(tokens)
      );
    } catch (error) {
      console.error('Failed to store tokens securely:', error);
    }
  },

  getTokens: async (): Promise<AuthTokens | null> => {
    try {
      const credentials = await Keychain.getSecurePassword('habittracker_tokens');
      if (credentials) {
        return JSON.parse(credentials.password);
      }
      return null;
    } catch (error) {
      console.error('Failed to retrieve tokens:', error);
      return null;
    }
  },

  clearTokens: async () => {
    try {
      await Keychain.resetSecurePassword('habittracker_tokens');
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }
};

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiryDate: string;
}
```

### **Push Notifications Implementation**

#### **Notification Service:**
```typescript
// services/notifications.ts
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-push-notification/ios';

export const notificationService = {
  configure: () => {
    PushNotification.configure({
      onRegister: (token) => {
        console.log('Push notification token:', token);
        // Send token to backend for habit reminders
      },
      
      onNotification: (notification) => {
        console.log('Notification received:', notification);
        
        if (notification.userInteraction) {
          // User tapped notification - handle deep linking
          handleNotificationTap(notification);
        }
        
        // Required on iOS for local notifications
        notification.finish(PushNotificationIOS.FetchResult.NoData);
      },
      
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      
      popInitialNotification: true,
      requestPermissions: true,
    });
  },

  scheduleHabitReminder: (habit: Habit) => {
    if (!habit.scheduledTime) return;
    
    const [hours, minutes] = habit.scheduledTime.split(':').map(Number);
    const notificationDate = new Date();
    notificationDate.setHours(hours, minutes, 0, 0);
    
    // If time has passed today, schedule for tomorrow
    if (notificationDate < new Date()) {
      notificationDate.setDate(notificationDate.getDate() + 1);
    }
    
    PushNotification.localNotificationSchedule({
      id: habit.id,
      title: 'Habit Reminder',
      message: `Time for ${habit.name}! (${habit.duration} minutes)`,
      date: notificationDate,
      repeatType: 'day',
      actions: ['Mark Done', 'Skip'],
      userInfo: { habitId: habit.id, type: 'habit_reminder' }
    });
  },

  cancelHabitReminder: (habitId: string) => {
    PushNotification.cancelLocalNotification(habitId);
  },

  sendDailySummary: (summary: DailySummary) => {
    PushNotification.localNotificationSchedule({
      title: 'Daily Habit Summary',
      message: `${summary.completed}/${summary.total} habits completed today!`,
      date: new Date(Date.now() + 60000), // 1 minute from now
      userInfo: { type: 'daily_summary' }
    });
  }
};

const handleNotificationTap = (notification: any) => {
  const { habitId, type } = notification.userInfo;
  
  switch (type) {
    case 'habit_reminder':
      // Navigate to habit detail or mark complete
      navigationService.navigate('HabitDetail', { habitId });
      break;
    case 'daily_summary':
      // Navigate to analytics
      navigationService.navigate('Analytics');
      break;
  }
};
```

### **Performance Optimization**

#### **Chart Component Migration:**
```typescript
// components/charts/AnalyticsChart.tsx
import { VictoryChart, VictoryLine, VictoryArea } from 'victory-native';

// Replace Chart.js with Victory Native for React Native
export const TrendChart: React.FC<TrendChartProps> = ({ data, timeRange }) => {
  return (
    <VictoryChart
      height={200}
      padding={{ left: 50, bottom: 50, top: 20, right: 20 }}
      theme={VictoryTheme.material}
    >
      <VictoryLine
        data={data}
        x="date"
        y="completionRate"
        style={{
          data: { stroke: "#3b82f6", strokeWidth: 2 },
        }}
        animate={{
          duration: 1000,
          onLoad: { duration: 500 }
        }}
      />
    </VictoryChart>
  );
};

// Performance optimizations:
export const OptimizedHabitList: React.FC<HabitListProps> = ({ habits }) => {
  return (
    <FlatList
      data={habits}
      renderItem={({ item }) => <HabitCard habit={item} />}
      keyExtractor={(item) => item.id}
      // Performance optimizations:
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      initialNumToRender={10}
      windowSize={10}
      getItemLayout={(data, index) => ({
        length: 72, // Height of each habit card
        offset: 72 * index,
        index,
      })}
    />
  );
};
```

### **Testing Strategy Implementation**

#### **Component Testing Setup:**
```typescript
// __tests__/components/HabitCard.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { HabitCard } from '../components/HabitCard';

describe('HabitCard', () => {
  const mockHabit = {
    id: '1',
    name: 'Morning Workout',
    duration: 30,
    completed: false,
    scheduledTime: '07:00',
    categories: ['health', 'exercise']
  };

  it('renders habit information correctly', () => {
    const { getByText } = render(<HabitCard habit={mockHabit} />);
    
    expect(getByText('Morning Workout')).toBeTruthy();
    expect(getByText('7:00 AM • 30 min')).toBeTruthy();
  });

  it('handles completion toggle', () => {
    const onToggleMock = jest.fn();
    const { getByTestId } = render(
      <HabitCard habit={mockHabit} onToggleComplete={onToggleMock} />
    );
    
    fireEvent.press(getByTestId('habit-toggle'));
    expect(onToggleMock).toHaveBeenCalledWith('1', true);
  });

  it('shows correct status indicators', () => {
    const completedHabit = { ...mockHabit, completed: true };
    const { getByTestId } = render(<HabitCard habit={completedHabit} />);
    
    expect(getByTestId('completed-indicator')).toBeTruthy();
  });
});
```

#### **E2E Testing with Detox:**
```typescript
// e2e/habitFlow.e2e.ts
import { device, expect, element, by } from 'detox';

describe('Habit Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should complete a habit successfully', async () => {
    // Navigate to habits tab
    await element(by.id('habits-tab')).tap();
    
    // Find first incomplete habit
    await element(by.id('habit-card-1')).tap();
    
    // Mark as complete
    await element(by.id('complete-button')).tap();
    
    // Verify completion
    await expect(element(by.id('completed-indicator'))).toBeVisible();
  });

  it('should create a new habit', async () => {
    await element(by.id('add-habit-button')).tap();
    
    // Fill habit details
    await element(by.id('habit-name-input')).typeText('Evening Reading');
    await element(by.id('duration-picker')).tap();
    await element(by.text('45 minutes')).tap();
    
    // Select categories
    await element(by.id('category-health')).tap();
    await element(by.id('tag-self-care')).tap();
    
    // Save habit
    await element(by.id('save-habit-button')).tap();
    
    // Verify habit appears in list
    await expect(element(by.text('Evening Reading'))).toBeVisible();
  });
});
```

---

## 📦 **Deployment Requirements**

### **Apple App Store:**
- [ ] **Developer Account**: Apple Developer Program membership
- [ ] **App Store Connect**: App registration and metadata
- [ ] **Certificates**: iOS development and distribution certificates
- [ ] **Provisioning Profiles**: App Store distribution profile
- [ ] **App Review**: Compliance with App Store Review Guidelines
- [ ] **Privacy Compliance**: Privacy policy and data usage declarations

### **Google Play Store:**
- [ ] **Google Play Console**: Developer account and app registration
- [ ] **App Signing**: Google Play App Signing setup
- [ ] **Release Management**: Internal/Alpha/Beta testing tracks
- [ ] **Content Rating**: ESRB/PEGI content rating questionnaire
- [ ] **Privacy Policy**: Required for Play Store submission

### **Required Assets:**
```
App Icons:
├── iOS: 1024x1024, 180x180, 120x120, 87x87, 80x80, 58x58, 40x40, 29x29
└── Android: 512x512, 192x192, 144x144, 96x96, 72x72, 48x48, 36x36

Screenshots:
├── iOS: iPhone (6.5", 5.5"), iPad (12.9", 11")
└── Android: Phone, 7" Tablet, 10" Tablet

Marketing:
├── Feature Graphic: 1024x500 (Android)
├── Promo Video: 30 seconds (optional)
└── App Descriptions: 4000 chars max per platform
```

---

## 🔒 **Security & Privacy**

### **Data Protection:**
- **Local Encryption**: Encrypt sensitive data stored locally
- **Secure Transmission**: HTTPS for all API communications
- **Token Security**: Use platform secure storage (Keychain/Keystore)
- **Biometric Authentication**: Optional Face ID/Touch ID/Fingerprint

### **Privacy Compliance:**
- **Data Minimization**: Only collect necessary data
- **User Consent**: Clear consent for calendar access and notifications
- **Data Transparency**: Clear privacy policy explaining data usage
- **GDPR Compliance**: Data portability and deletion rights

### **App Store Privacy Requirements:**
- **iOS Privacy Labels**: Declare data collection in App Store Connect
- **Android Data Safety**: Complete Data safety form in Play Console
- **Privacy Policy**: Accessible URL required for both stores

---

## 📊 **Success Metrics**

### **Technical Metrics:**
- **App Performance**: < 3 second startup time
- **Crash Rate**: < 0.1% crash-free sessions
- **Bundle Size**: < 50MB initial download
- **Battery Usage**: Minimal background battery drain

### **User Experience Metrics:**
- **App Store Rating**: Target 4.5+ stars
- **User Retention**: 60% Day 1, 30% Day 7 retention
- **Feature Adoption**: 80% users complete at least one habit
- **Calendar Integration**: 40% users connect Google Calendar

### **Business Metrics:**
- **Downloads**: 1,000 downloads in first month
- **Active Users**: 500 monthly active users (MAU)
- **User Reviews**: Positive sentiment in reviews
- **Platform Distribution**: Track iOS vs Android adoption

---

## 🚨 **Risks & Mitigations**

### **Technical Risks:**
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| React Native compatibility issues | High | Medium | Thorough testing, native fallbacks |
| App Store rejection | High | Low | Follow guidelines, beta testing |
| Performance degradation | Medium | Medium | Optimization, profiling tools |
| OAuth mobile integration | Medium | Low | Use established libraries |

### **Business Risks:**
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Low adoption rate | High | Medium | Marketing, user feedback loops |
| Platform policy changes | Medium | Low | Stay updated, have alternatives |
| Competition | Medium | High | Focus on unique value proposition |
| Maintenance overhead | Medium | Medium | Automated testing, CI/CD |

---

## 🎯 **Success Criteria**

### **MVP Launch Criteria:**
- [ ] Feature parity with web app
- [ ] Successful app store approvals
- [ ] < 5 second cold start time
- [ ] Zero critical bugs in production
- [ ] Push notifications working
- [ ] Offline functionality operational

### **Post-Launch Success:**
- [ ] 4.0+ star rating on both app stores
- [ ] 1,000+ total downloads within 3 months
- [ ] 70% of web users migrate to mobile
- [ ] Positive user feedback on mobile UX
- [ ] < 2% uninstall rate in first week

---

## 📝 **Next Steps**

1. **Technical Feasibility**: Conduct React Native compatibility audit
2. **Resource Planning**: Estimate development timeline and resource needs
3. **Design Mockups**: Create mobile-specific design mockups
4. **Developer Accounts**: Register Apple and Google developer accounts
5. **Privacy Policy**: Draft comprehensive privacy policy
6. **Beta Testing Plan**: Define internal and external testing strategies

---

*This PRD will be updated as requirements evolve and technical discoveries are made during the development process.*
