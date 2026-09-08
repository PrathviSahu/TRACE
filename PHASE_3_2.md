# TRACE Phase 3.2 — Deterministic Daily Plan Generator

> **Status**: Completed & Verified  
> **Target**: Generate reproducible, cohesive, day-by-day interview preparation roadmaps (`Day 1` to `Day N`) based on Interview Preparation Profile, company question density, and pattern families without AI or randomness.  
> **Preceding Commit**: `f78efe2` (Phase 3.1: Interview Setup & Planning Data Model)

---

## 1. Architectural Overview & Design Principles

Phase 3.2 introduces the deterministic daily plan generator for TRACE. It translates high-level interview constraints into a structured study schedule.

```text
Interview Profile (Company, Date, Minutes, Study Days)
      +
Company Data (Verified Frequency & Recency)
      +
Priority Scoring Engine (Deterministic 0-100 Score)
      +
Canonical Pattern Families (13 Cohesive Clusters)
      +
User Performance & Revision Queue (Forgot / Need Revision)
      ↓
[Phase 3.2] Deterministic Daily Plan Generator
      ↓
DailyPlan[] (Day 1 ... Day N)
  ├── Focus Pattern Family
  ├── New Target Problems (Difficulty-Calibrated)
  ├── Interleaved Spaced Revision Item
  └── Estimated Time Budget
```

### Core Architectural Boundaries
* **Strict Determinism**: Zero `Math.random()` and zero LLM calls. Given identical `InterviewProfile` and `progressMap`, the output is byte-for-byte reproducible.
* **Pattern Family Cohesion**: Eliminates fragmented context-switching by organizing each study day around a primary canonical pattern family (e.g. *Two Pointers & Sliding Window*, *Array Optimization*, *Dynamic Programming*).
* **Realistic Time Calibration**: Time budgets are strictly respected based on problem difficulty (Easy: 20m, Medium: 35m, Hard: 50m, Revision: 15m).
* **Grounding in Real Assessments**: Problems are prioritized from the target company's question bank based on verified historical interview frequency and 30-day recency.

---

## 2. Scheduling Math & Workload Calibration

### 2.1 Study Dates Calculation
```javascript
getScheduledStudyDates(startDateStr, endDateStr, weeklyStudyDays, timezone)
```
- Iterates from `startDate` up to `endDate` (`interviewDate`).
- Selects only dates matching the user's `weeklyStudyDays` (e.g. `["MON", "TUE", "WED", "THU", "FRI"]`).
- Example: 14 calendar days with a Mon–Fri schedule generates **exactly 10 study days**.

### 2.2 Time Budget Allocation
```javascript
export const DIFFICULTY_MINUTES = { Easy: 20, Medium: 35, Hard: 50 };
export const REVISION_MINUTES = 15;
export const MOCK_SET_MINUTES = 90;
```
- A user studying `120 min/day` receives:
  - 1 Spaced Revision problem (~15m) if items are due.
  - 2–3 Target Problems (~90–105m) matching the day's focus pattern family.
  - Total estimated minutes is kept within `dailyStudyMinutes + 15` tolerance.

---

## 3. Pattern Family Grouping & Ranking

1. Problems from the company question pool are mapped to their canonical pattern via `getProblemPatternDetails(p)`.
2. Each pattern maps to its canonical family via `getPatternFamily(pattern)` across the 13 `DSA_PATTERN_FAMILIES`.
3. Pattern families are ranked by cumulative company score (sum of priority scores + frequency).
4. Days cycle through ranked families, ensuring the highest-yield topics for that company are covered early.

---

## 4. Spaced Revision & Mock Interview Interleaving

### 4.1 Spaced Revision
- If `profile.includeRevision !== false`, problems with status `forgot_approach` or `need_revision` in `progressStore` are indexed.
- Sorted deterministically: `forgot_approach` first (urgent), then oldest unattempted item.
- Interleaved at a rate of 1 revision problem per study day until the revision queue is cleared.

### 4.2 Mock Interview Allocation
- If `profile.includeMockInterviews === true` and `totalStudyDays >= 5`:
  - The penultimate day (Day N-1) is designated as `isMockDay: true`.
  - Allocated a balanced 3-problem assessment set (1 Easy, 1 Medium, 1 Hard) from top company questions.

---

## 5. Schema Definitions

### 5.1 GeneratedPlan Schema
```typescript
interface GeneratedPlan {
  profileId: string;
  companyId: string;
  companyName: string;
  companyTier: string;
  companyIcon: string;
  role: string;
  planVersion: number;
  generatedAt: string;                // ISO timestamp
  startDate: string;                  // "YYYY-MM-DD"
  endDate: string;                    // "YYYY-MM-DD"
  totalStudyDays: number;
  dailyStudyMinutes: number;
  totalProblemsScheduled: number;
  totalRevisionScheduled: number;
  totalEstimatedHours: number;        // Sum of all daily minutes / 60
  patternFamilyCoverage: Record<string, number>;
  topicCoverage: Record<string, number>;
  days: DailyPlan[];
}
```

### 5.2 DailyPlan Schema
```typescript
interface DailyPlan {
  dayIndex: number;                   // 1-indexed (Day 1, Day 2, ... Day N)
  date: string;                       // "YYYY-MM-DD"
  dayOfWeek: string;                  // "MON", "TUE", etc.
  focusFamily: string;                // Canonical pattern family
  focusTopic: string;                 // Primary topic
  focusPatterns: string[];            // Granular patterns covered
  problemIds: (number | string)[];    // Target problem IDs
  problems: EnrichedProblem[];        // Full problem objects
  revisionProblemIds: (number | string)[];
  revisionProblems: EnrichedProblem[];
  estimatedMinutes: number;           // Total estimated study time
  priority: 'critical' | 'high' | 'medium';
  isMockDay: boolean;                 // Whether allocated for mock simulation
  completed: boolean;                 // Completion status
}
```

---

## 6. Interactive Plan Dashboard UI (`/interview/plan`)

- **Telemetry Dashboard**: Total study days, total problems scheduled, revision queue size, and overall percentage completion.
- **Pattern Family Distribution Bar**: Interactive visual summary of pattern families covered.
- **Interactive Roadmap Timeline**:
  - Filterable by specific day or viewing all days.
  - Problem cards with difficulty pills, canonical pattern tags, recency badges, and estimated minutes.
  - Direct `[⚡ Practice]` modal action (hints, approaches, notes).
  - Direct `[▶ Visualize]` action: loads code and inputs into TRACE Studio visualizer.
  - Interactive completion checkbox synced reactively with `progressStore`.
- **Navigation Integration**:
  - Top navigation bar `Interview Plan` pill routes to `/interview/plan`.
  - `InterviewSetupPage` includes `[🚀 View Daily Study Plan →]` button upon activation.

---

## 7. Test Suite & Verification Summary

### Automated Unit Tests (`scripts/test_phase3_2.js`)
* **10/10 Phase 3.2 Tests Passed**:
  1. `Strict Determinism`: Confirmed identical plans generated across repeat executions.
  2. `Calendar Math`: Confirmed 14-day window with Mon–Fri yields exactly 10 study days.
  3. `Workload & Time Budget`: Confirmed all days fall within `dailyStudyMinutes` tolerance.
  4. `Pattern Family Cohesion`: Confirmed all days center on cohesive pattern families.
  5. `Spaced Revision`: Confirmed urgent items scheduled first in proper queue order.
  6. `Mock Interview Allocation`: Confirmed penultimate day allocates balanced Easy/Med/Hard set.
  7. `Company Question Prioritization`: Confirmed top Microsoft questions scheduled early.
  8. `Small Company Fallback`: Confirmed zero empty days even for smaller question banks.
  9. `Schema Integrity`: Confirmed all metadata fields exist on `GeneratedPlan` and `DailyPlan`.
  10. `Plan Persistence`: Confirmed localStorage round-trip and clear methods.

---

## 8. Integration Points for Phase 3.3 (Adaptive Feedback Loop)

Phase 3.3 will consume `GeneratedPlan`:
- When a user struggles on a problem (e.g. `attempts >= 3` without solve, or marks `forgot_approach`), the adaptive engine will mutate future days:
  - Add reinforcement problems from the same pattern family.
  - Re-interleave the failed problem into the revision queue.
  - Increment `PlanningState.lastAdaptedAt`.
