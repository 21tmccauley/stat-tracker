# Architecture Improvements & Feature Roadmap

This document tracks improvements and new features for the Stat Tracker application, organized by priority and dependencies. Each section builds toward a more robust, maintainable, and feature-rich application.

---

## 📊 Progress Summary

| Area | Status | Notes |
|------|--------|-------|
| Database Schema | ❌ Not Started | GSI, streaks, categories |
| Backend Architecture | ❌ Not Started | Lambda layer, update endpoint, idempotency |
| Frontend Architecture | ❌ Not Started | React Query, custom hooks, state persistence |
| High-Priority Features | ❌ Not Started | Edit habit, streaks, persist completions |
| Medium-Priority Features | ❌ Not Started | Categories, achievements, progress charts |
| Polish & UX | ❌ Not Started | Error boundaries, accessibility, animations |

**Last Updated**: January 16, 2026

---

## 🗄️ Phase 1: Database Schema Improvements

**Goal**: Optimize DynamoDB tables for current and future features

### 1.1 Add Global Secondary Index for Date Queries
- [ ] Add `date` attribute to Completions table (already stored but not indexed)
- [ ] Create GSI `UserDateIndex` (PK: userId, SK: date)
- [ ] Update Terraform `main.tf` with GSI configuration
- [ ] Test date-range queries for weekly/monthly summaries

**Why**: Enables efficient queries like "get all completions this week" without expensive scans.

```hcl
# Pseudo-code for reference
global_secondary_index {
  name               = "UserDateIndex"
  hash_key           = "userId"
  range_key          = "date"
  projection_type    = "ALL"
}
```

**Learning Focus**: DynamoDB GSIs, query patterns, cost optimization

### 1.2 Add Streak Tracking to Users Table
- [ ] Add new attributes to Users table schema:
  - `currentStreak` (number) - consecutive days with completions
  - `longestStreak` (number) - all-time best streak
  - `lastCompletionDate` (string, YYYY-MM-DD) - for streak calculation
- [ ] Update `getUserData` Lambda to return streak fields
- [ ] Update `completeHabit` Lambda to calculate and update streaks
- [ ] Add streak display to Dashboard

**Why**: Calculating streaks from completions table on every request is expensive and slow.

**Learning Focus**: Data denormalization, computed values, performance tradeoffs

### 1.3 Add Habit Categories/Tags
- [ ] Add `category` attribute to Habits table (string enum)
- [ ] Define category options: "Health", "Learning", "Fitness", "Mindfulness", "Work", "Personal"
- [ ] Update `createHabit` Lambda to accept category
- [ ] Update `HabitForm` component with category selector
- [ ] Add category filter to Habits page

**Why**: Users want to organize and filter habits by type.

**Learning Focus**: Enum patterns in NoSQL, frontend filtering

### 1.4 Add Habit Scheduling (Future)
- [ ] Add `frequency` attribute: "daily" | "weekly" | "custom"
- [ ] Add `scheduledDays` attribute: array of day numbers (0-6)
- [ ] Add `reminderTime` attribute: optional time string
- [ ] Update frontend to show which habits are "due today"

**Why**: Not all habits are daily; users need flexible scheduling.

**Estimated Time**: 4-6 hours

---

## ⚙️ Phase 2: Backend Architecture Improvements

**Goal**: Reduce code duplication, improve reliability, add missing features

### 2.1 Create Shared Lambda Layer
- [ ] Create `backend/layers/shared/` directory structure:
  ```
  backend/layers/shared/
  ├── nodejs/
  │   └── node_modules/
  │       └── shared/
  │           ├── index.js      # Main exports
  │           ├── response.js   # createResponse helper
  │           ├── auth.js       # getAuthUserId helper
  │           └── dynamodb.js   # DynamoDB client
  └── package.json
  ```
- [ ] Extract `createResponse()` function (duplicated in all 5 Lambdas)
- [ ] Extract `getAuthUserId()` function (userId extraction logic)
- [ ] Extract DynamoDB client initialization
- [ ] Create Terraform resource for Lambda layer
- [ ] Update all Lambda functions to use shared layer
- [ ] Test all endpoints still work

**Why**: DRY principle - same code in 5 places means 5x maintenance burden.

**Learning Focus**: Lambda layers, code organization, Terraform layers

### 2.2 Add Update Habit Endpoint
- [ ] Create `backend/updateHabit/` Lambda function
- [ ] Accept partial updates (name, description, xpReward, isActive, category)
- [ ] Validate ownership (habit belongs to user)
- [ ] Add `PUT /habits/{habitId}` or `PATCH /habits/{habitId}` endpoint
- [ ] Update Terraform with new Lambda + API Gateway resources
- [ ] Update `frontend/src/services/api.js` with `updateHabit()` function
- [ ] Create edit modal/form in frontend
- [ ] Add edit button to HabitCard component

**Why**: Users can create and delete habits, but can't edit them.

**Learning Focus**: PATCH vs PUT semantics, partial updates in DynamoDB

### 2.3 Add Get Today's Completions Endpoint
- [ ] Create `backend/getCompletions/` Lambda function
- [ ] Accept optional query params: `date`, `startDate`, `endDate`
- [ ] Default to today's date if no params provided
- [ ] Add `GET /completions` endpoint
- [ ] Update frontend to fetch today's completions on mount
- [ ] Persist completed habit IDs properly (no more losing state on refresh)

**Why**: Currently `completedToday` state resets on page refresh - bad UX.

**Learning Focus**: Query parameters, date handling, state persistence

### 2.4 Add Idempotency to completeHabit
- [ ] Use DynamoDB conditional write to prevent race conditions
- [ ] Add `ConditionExpression: 'attribute_not_exists(userId)'` to PutCommand
- [ ] Handle ConditionalCheckFailedException gracefully
- [ ] Return appropriate error message for duplicate completion attempts

**Why**: Double-clicks or retries could award XP twice without proper idempotency.

```javascript
// Pseudo-code for reference
const putCompletionCommand = new PutCommand({
  TableName: completionsTableName,
  Item: completion,
  ConditionExpression: 'attribute_not_exists(userId)'
});
```

**Learning Focus**: Idempotency, race conditions, DynamoDB conditional writes

### 2.5 Add Input Validation Library
- [ ] Choose validation library (zod or joi)
- [ ] Add to Lambda layer shared dependencies
- [ ] Create schemas for each endpoint:
  - `createHabitSchema`
  - `updateHabitSchema`
  - `completeHabitSchema`
- [ ] Replace manual validation with schema validation
- [ ] Improve error messages

**Why**: Manual validation is verbose and error-prone; schemas are declarative and reusable.

**Estimated Time**: 6-10 hours

---

## 🎨 Phase 3: Frontend Architecture Improvements

**Goal**: Better state management, code reuse, and user experience

### 3.1 Implement React Query
- [ ] Install `@tanstack/react-query`
- [ ] Set up QueryClientProvider in `main.jsx`
- [ ] Create query hooks:
  - `useHabits()` - fetches habits with caching
  - `useUserData()` - fetches user data with caching
  - `useCompletions(date)` - fetches completions
- [ ] Create mutation hooks:
  - `useCreateHabit()`
  - `useCompleteHabit()`
  - `useDeleteHabit()`
  - `useUpdateHabit()`
- [ ] Remove duplicate fetch logic from Dashboard and Habits pages
- [ ] Add optimistic updates for better UX

**Why**: Eliminates duplicate code, adds caching, handles loading/error states automatically.

**Learning Focus**: React Query patterns, caching strategies, optimistic updates

### 3.2 Create Custom Hooks
- [ ] Create `hooks/` directory
- [ ] Create `useHabits.js` - habit CRUD operations (if not using React Query)
- [ ] Create `useUser.js` - user data and level-up detection
- [ ] Create `useCompletedToday.js` - today's completion tracking
- [ ] Refactor Dashboard.jsx to use custom hooks
- [ ] Refactor Habits.jsx to use custom hooks

**Why**: Separates business logic from UI, enables code reuse across pages.

**Learning Focus**: Custom hooks, separation of concerns

### 3.3 Fix completedToday State Persistence
- [ ] Option A: Create getCompletions endpoint (see 2.3) and fetch on mount
- [ ] Option B: Use localStorage with date validation
- [ ] Update Dashboard and Habits pages to use persistent state
- [ ] Test refresh behavior - completed habits should stay completed

**Current problem**:
```jsx
// This always starts empty on refresh!
const [completedToday, setCompletedToday] = useState([]);
```

**Why**: Users lose visual feedback of completed habits when they refresh the page.

### 3.4 Add Error Boundaries
- [ ] Create `components/ErrorBoundary.jsx` component
- [ ] Create `components/ErrorFallback.jsx` for error UI
- [ ] Wrap routes with error boundaries
- [ ] Add "Try Again" functionality
- [ ] Log errors (console or future error tracking)

**Why**: A crash in one component shouldn't break the entire app.

**Learning Focus**: React error boundaries, graceful degradation

### 3.5 Accessibility Improvements
- [ ] Audit with browser accessibility tools
- [ ] Add `aria-label` to icon-only buttons (delete, logout)
- [ ] Ensure color contrast meets WCAG AA standards
- [ ] Add keyboard navigation for habit actions
- [ ] Test with screen reader
- [ ] Add focus indicators

**Why**: Makes app usable for everyone, improves overall UX.

**Estimated Time**: 6-10 hours

---

## 🚀 Phase 4: High-Priority Features

**Goal**: Features users will expect and notice immediately

### 4.1 Real Streak Calculation
- [ ] Complete Phase 1.2 (add streak fields to Users table)
- [ ] Update `completeHabit` Lambda:
  - Get last completion date
  - If yesterday, increment currentStreak
  - If today (already completed), no change
  - Otherwise, reset to 1
  - Update longestStreak if currentStreak > longestStreak
- [ ] Replace hardcoded `value={5}` in Dashboard StatCard
- [ ] Display current streak and longest streak
- [ ] Add streak milestone celebrations (7 days, 30 days, etc.)

**Current problem**:
```jsx
// Dashboard.jsx line 232-238
<StatCard
  icon={<IoFlame color="white" size={22} />}
  value={5}  // HARDCODED!
  label="Day Streak"
  color="warning"
/>
```

### 4.2 Edit Habit Feature
- [ ] Complete Phase 2.2 (add updateHabit endpoint)
- [ ] Create `EditHabitForm.jsx` component (similar to HabitForm)
- [ ] Add edit button/icon to HabitCard
- [ ] Implement edit modal with pre-filled values
- [ ] Handle form submission and state update
- [ ] Test editing name, description, xpReward, category

### 4.3 Real Progress Chart Data
- [ ] Complete Phase 2.3 (add getCompletions endpoint)
- [ ] Update ProgressChart to fetch real completion data
- [ ] Calculate XP earned per day for last 7 days
- [ ] Handle days with no completions (show 0)
- [ ] Add loading state to chart

**Estimated Time**: 6-8 hours

---

## 🎯 Phase 5: Medium-Priority Features

**Goal**: Features that enhance the experience significantly

### 5.1 Habit Categories & Filtering
- [ ] Complete Phase 1.3 (add category to schema)
- [ ] Add category dropdown to HabitForm
- [ ] Add category chip/badge to HabitCard
- [ ] Add filter buttons to Habits page (All, Health, Learning, etc.)
- [ ] Style categories with distinct colors

### 5.2 Achievement/Badge System
- [ ] Create Achievements table in DynamoDB:
  - PK: userId
  - SK: achievementId
  - Attributes: unlockedAt, type
- [ ] Define achievement types:
  - First habit completed
  - 10 completions total
  - 7-day streak
  - 30-day streak
  - Level 5 reached
  - Level 10 reached
- [ ] Update completeHabit to check and award achievements
- [ ] Create Achievements display component
- [ ] Add achievement unlocked notifications

### 5.3 Weekly/Monthly Progress View
- [ ] Complete Phase 1.1 (add GSI for date queries)
- [ ] Create endpoint to get completions by date range
- [ ] Build weekly summary component:
  - Days completed vs days with habits
  - Total XP earned this week
  - Most completed habit
- [ ] Build monthly calendar view:
  - Heatmap of completion density
  - Streak visualization

### 5.4 Habit Templates
- [ ] Define preset habit templates:
  ```javascript
  const templates = [
    { name: "Morning Exercise", description: "30 min workout", xpReward: 25, category: "Fitness" },
    { name: "Read 30 Minutes", description: "Daily reading habit", xpReward: 20, category: "Learning" },
    { name: "Meditate", description: "10 min mindfulness", xpReward: 15, category: "Mindfulness" },
    // ...
  ];
  ```
- [ ] Add "Use Template" button to HabitForm
- [ ] Allow customizing template before saving

**Estimated Time**: 10-15 hours

---

## ✨ Phase 6: Polish & Production

**Goal**: Prepare for production deployment

### 6.1 Loading States & Skeletons
- [ ] Create Skeleton components for:
  - CharacterCard
  - StatCard
  - HabitCard
  - ProgressChart
- [ ] Replace CircularProgress with content-aware skeletons
- [ ] Add suspense boundaries where appropriate

### 6.2 Animations & Transitions
- [ ] Add page transition animations
- [ ] Add habit completion celebration animation
- [ ] Add level-up celebration modal (not just toast)
- [ ] Add subtle micro-interactions:
  - Button hover effects
  - Card hover lift
  - XP progress bar animation

### 6.3 Offline Support (PWA)
- [ ] Complete existing Phase 6 from TIMELINE.md
- [ ] Cache habit data for offline viewing
- [ ] Queue completions when offline
- [ ] Sync when back online

### 6.4 Mobile Responsiveness
- [ ] Test all pages on mobile viewport
- [ ] Make sidenav collapsible/hamburger on mobile
- [ ] Optimize touch targets (min 44x44px)
- [ ] Test swipe gestures for habit completion

**Estimated Time**: 8-12 hours

---

## 📁 Suggested Code Organization

### Current Structure
```
frontend/src/
├── components/
├── contexts/
├── pages/
├── services/
└── theme/
```

### Proposed Structure
```
frontend/src/
├── api/                    # Rename from services, clearer purpose
│   ├── client.js           # Base API client
│   ├── habits.js           # Habit API functions
│   ├── user.js             # User API functions
│   └── completions.js      # Completions API functions
├── hooks/                  # NEW: Custom React hooks
│   ├── useHabits.js
│   ├── useUser.js
│   └── useCompletions.js
├── components/
│   ├── common/             # Reusable UI components
│   │   ├── GlassCard.jsx
│   │   ├── StatCard.jsx
│   │   └── ErrorBoundary.jsx
│   ├── habits/             # Habit-specific components
│   │   ├── HabitCard.jsx
│   │   ├── HabitForm.jsx
│   │   └── HabitList.jsx
│   └── layout/             # Layout components
│       ├── Sidenav.jsx
│       └── Header.jsx
├── contexts/
├── pages/
└── theme/
```

### Backend Structure
```
backend/
├── layers/                 # NEW: Shared Lambda layer
│   └── shared/
│       └── nodejs/
│           └── node_modules/
│               └── shared/
│                   ├── index.js
│                   ├── response.js
│                   ├── auth.js
│                   └── dynamodb.js
├── createHabit/
├── getHabits/
├── updateHabit/            # NEW
├── deleteHabit/
├── completeHabit/
├── getUserData/
└── getCompletions/         # NEW
```

---

## 🎯 Implementation Priority

### Immediate (Do First)
1. **Fix completedToday persistence** - Users notice this bug immediately
2. **Fix hardcoded streak value** - Looks broken to users
3. **Add Edit Habit feature** - Expected CRUD functionality

### Short Term (Next Sprint)
4. **Create Lambda Layer** - Reduces maintenance burden for all future work
5. **Implement React Query** - Foundation for better data management
6. **Add getCompletions endpoint** - Enables progress charts and persistence

### Medium Term (Following Sprints)
7. **Real streak calculation** - Gamification core feature
8. **Habit categories** - Organization feature users expect
9. **Progress charts with real data** - Key dashboard component

### Long Term (Future)
10. **Achievement system** - Major engagement feature
11. **PWA support** - Mobile experience
12. **Habit scheduling** - Advanced habit tracking

---

## Time Estimates Summary

| Phase | Estimated Hours |
|-------|-----------------|
| Phase 1: Database Schema | 4-6 hours |
| Phase 2: Backend Architecture | 6-10 hours |
| Phase 3: Frontend Architecture | 6-10 hours |
| Phase 4: High-Priority Features | 6-8 hours |
| Phase 5: Medium-Priority Features | 10-15 hours |
| Phase 6: Polish & Production | 8-12 hours |
| **Total** | **40-61 hours** |

---

## Quick Wins (< 1 hour each)

These can be done anytime for immediate improvement:

- [ ] Fix hardcoded streak value (use userData.currentStreak || 0)
- [ ] Add aria-labels to icon buttons
- [ ] Add localStorage fallback for completedToday
- [ ] Extract Sidenav and Header to separate files
- [ ] Add console warning if API_BASE_URL is not set
- [ ] Add `.env.example` with all required variables documented

---

## Questions to Consider

Before implementing, think about:

1. **Streaks**: Should streaks reset at midnight UTC or user's timezone?
2. **Categories**: Fixed list or user-defined? Start simple.
3. **Achievements**: How many? Start with 5-10, expand later.
4. **Offline**: How long to cache? What happens with conflicts?

---

## Resources for Learning

- [DynamoDB GSI Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GSI.html)
- [Lambda Layers Documentation](https://docs.aws.amazon.com/lambda/latest/dg/chapter-layers.html)
- [React Query Documentation](https://tanstack.com/query/latest)
- [WCAG Accessibility Guidelines](https://www.w3.org/WAI/standards-guidelines/wcag/)

---

Good luck building! 🚀
