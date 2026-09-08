# TRACE Phase 3.1 — User Interview Setup + Planning Data Model

> **Status**: Completed & Verified  
> **Target**: Establish normalized User Interview Preparation Profile, Planning State Container, Extended Performance Models, and Command Center UI.  
> **Preceding Approved Commit**: `f88820b` (Canonical DSA taxonomy & `DSA_PATTERN_FAMILIES`)

---

## 1. Architectural Overview & Boundaries

Phase 3.1 establishes the foundational data models and user configuration interface required for TRACE's Interview Intelligence Engine.

```
Company Dataset (183 Companies, 909 Problems)
      + Canonical DSA Taxonomy (75 Patterns, 13 Families)
                             ↓
           [Phase 3.1] Interview Preparation Profile
                             ↓
              [Phase 3.1] Planning State Container
                             ↓
       [Phase 3.2 Target] Deterministic Schedule Generator
                             ↓
           [Phase 3.3 Target] Adaptive Feedback Loop
```

### Scope Discipline
- **No speculative generator**: Daily plan generation is deferred to Phase 3.2.
- **No synthetic AI scheduling**: All schedule timelines, derived days remaining, and study hour allocations are deterministic.
- **Single Source of Truth**: Strictly references existing `COMPANY_DATA`, `NORMALIZED_PROBLEMS`, `DSA_TOPICS`, `DSA_PATTERNS`, `DSA_PATTERN_FAMILIES`, and `SUPPORTED_LANGUAGES`. No parallel or duplicate datasets were created.

---

## 2. InterviewProfile Schema

Normalized representation of the user's interview preparation target, stored under `trace_interview_profile`:

```typescript
interface InterviewProfile {
  id: string;                         // e.g. "profile_microsoft_1725805200000"
  companyId: string;                  // Refers directly to COMPANY_DATA (e.g. "microsoft")
  role: string;                       // Controlled string (e.g. "Software Engineer")
  interviewDate: string;              // ISO normalized date "YYYY-MM-DD"
  timezone: string;                   // IANA timezone string (e.g. "America/New_York", "Asia/Kolkata")
  dailyStudyMinutes: number;          // Integer between 15 and 480 (e.g. 120)
  weeklyStudyDays: string[];          // Subset of ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]
  currentLevel: string;               // "Beginner" | "Strong Problem Solver" | "Interview Ready" | "Big Tech Ready"
  goal: string;                       // "Interview Preparation" | "DSA Improvement" | "Company-Specific Preparation" | "General Coding Interview"
  preferredLanguages: string[];       // Supported in TRACE: ["Java" | "Python" | "C++" | "JavaScript" | "C"]
  targetTopics: string[];             // References canonical DSA_TOPICS
  targetPatterns: string[];           // References canonical DSA_PATTERNS
  includeCompanyQuestions: boolean;   // Weight questions asked by target company
  includeRecentQuestions: boolean;    // Weight questions from the 30-day window
  includeRevision: boolean;           // Include spaced repetition / revision queue
  includeMockInterviews: boolean;     // Enable periodic mock simulation sets
  createdAt: string;                  // ISO 8601 timestamp
  updatedAt: string;                  // ISO 8601 timestamp
}
```

---

## 3. PlanningState Schema

Container for persistent planning lifecycle state, stored under `trace_planning_state`:

```typescript
interface PlanningState {
  profileId: string;                  // References InterviewProfile.id
  planVersion: number;                // Increments automatically when core planning inputs change
  planStartDate: string;              // ISO date "YYYY-MM-DD"
  planEndDate: string;                // ISO date "YYYY-MM-DD" (matches interviewDate)
  status: 'draft' | 'active' | 'completed' | 'paused' | 'cancelled';
  lastGeneratedAt: string | null;     // Managed by Phase 3.2 generator
  lastAdaptedAt: string | null;       // Managed by Phase 3.3 adaptive loop
  currentDayIndex: number;            // 0-indexed study day counter
}
```

---

## 4. User Performance Models

### 4.1 ProblemPerformance Model
Unified problem-level telemetry backward-compatible with `trace_problem_progress`:

```typescript
interface ProblemPerformance {
  problemId: string;                  // Normalized problem key
  status: 'unsolved' | 'solved' | 'need_revision' | 'forgot_approach';
  attempts: number;                   // Cumulative attempt count
  solved: boolean;                    // Boolean helper (status === 'solved')
  timeSpentSeconds: number;           // Tracked execution/practice time
  hintsUsed: number;                  // Number of hints requested
  solutionViewed: boolean;            // Whether reference solution was inspected
  confidence: 'low' | 'medium' | 'high' | null;
  lastAttemptedAt: string | null;     // ISO timestamp of most recent practice
  lastSolvedAt: string | null;        // ISO timestamp of successful solve
  lastReviewedAt: string | null;      // ISO timestamp of latest revision
  reviewStatus: 'none' | 'due' | 'completed';
  consecutiveSuccesses: number;       // Consecutive successful reviews
  consecutiveFailures: number;        // Consecutive failures triggering decay
}
```

### 4.2 PatternPerformance Model
Calculated deterministically via `computePatternPerformance(problems, progressMap)`:

```typescript
interface PatternPerformance {
  pattern: string;                    // Canonical pattern name from DSA_PATTERNS
  family: string;                     // Canonical family from DSA_PATTERN_FAMILIES
  attempts: number;                   // Total user attempts on this pattern
  solved: number;                     // Total solved problems for this pattern
  total: number;                      // Total problems available for this pattern
  successRate: number;                // Solved / Total (0.0 to 1.0)
  averageTimeSeconds: number;         // Average time spent per problem
  confidence: 'low' | 'medium' | 'high' | 'neutral';
  lastPracticedAt: string | null;     // Most recent attempt timestamp
  masteryScore: number;               // 0 to 100 deterministic mastery ranking
}
```

### 4.3 TopicPerformance Model
Calculated deterministically via `computeTopicPerformance(problems, progressMap)`:

```typescript
interface TopicPerformance {
  topic: string;                      // Canonical topic from DSA_TOPICS
  attempts: number;                   // Total user attempts on this topic
  solved: number;                     // Total solved problems for this topic
  total: number;                      // Total problems available for this topic
  successRate: number;                // Solved / Total (0.0 to 1.0)
  averageTimeSeconds: number;         // Average time spent per problem
  confidence: 'low' | 'medium' | 'high';
  lastPracticedAt: string | null;     // Most recent attempt timestamp
  masteryScore: number;               // 0 to 100 deterministic mastery ranking
}
```

---

## 5. Derived Metrics & Dynamic Telemetry

### Dynamic Days Remaining
`daysRemaining` is **never stored as authoritative static state**. It is calculated dynamically at runtime:

```javascript
calculateDaysRemaining(interviewDate, timezone)
```
- Derives the exact calendar day delta using target `YYYY-MM-DD` and user's IANA timezone.
- Correctly advances as time elapses without mutating storage.

### Derived Weekly Commitment
```javascript
calculateWeeklyStudyHours(dailyStudyMinutes, weeklyStudyDays)
```
- Computes `(dailyStudyMinutes * weeklyStudyDays.length) / 60` rounded to 1 decimal place.

---

## 6. Deterministic Validation Engine

`validateInterviewProfile(profile)` verifies 10 structural rules:
1. **Company Reference**: Must exist in `COMPANY_DATA` (183 valid companies).
2. **Role**: Non-empty string.
3. **Interview Date**: Must be in the future (`calculateDaysRemaining > 0`).
4. **Daily Study Minutes**: Integer within `[15, 480]` minutes.
5. **Weekly Study Days**: Array with at least 1 valid day from `["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]`.
6. **Current Level**: Value in `["Beginner", "Strong Problem Solver", "Interview Ready", "Big Tech Ready"]`.
7. **Goal**: Value in controlled `PREPARATION_GOALS`.
8. **Preferred Languages**: All selected languages must be supported by TRACE execution engine (`Java`, `Python`, `C++`, `JavaScript`, `C`).
9. **Target Topics**: All items must exist in `DSA_TOPICS`.
10. **Target Patterns**: All items must exist in `DSA_PATTERNS`.

---

## 7. Storage & Persistence Architecture

- **Profile Storage**: Stored under `localStorage['trace_interview_profile']`.
- **Planning Container**: Stored under `localStorage['trace_planning_state']`.
- **Progress Store**: Maintained in `localStorage['trace_problem_progress']` with backward-compatible dual-write to `trace_solved_problems`.
- **Reactivity**: Browser CustomEvents (`trace_interview_profile_updated`, `trace_progress_updated`) dispatch on updates for instantaneous multi-component synchronization.
- **Hook Access**: Exported `useInterviewProfile()` and `useAllProgress()` React hooks.

---

## 8. Integration Points for Future Phases

### Phase 3.2: Deterministic Daily Plan Generator
- Consumes `InterviewProfile` (`companyId`, `dailyStudyMinutes`, `weeklyStudyDays`, `interviewDate`).
- Consumes `PatternPerformance` and `calculatePriorityScore`.
- Populates `PlanningState.lastGeneratedAt` and generates daily problem schedules matching `DailyPlan` structure.

### Phase 3.3: Adaptive Feedback Loop
- Consumes `ProblemPerformance` history (`attempts`, `timeSpentSeconds`, `consecutiveFailures`, `reviewStatus`).
- Mutates future days in `PlanningState` without modifying the user's base `InterviewProfile`.
- Updates `PlanningState.lastAdaptedAt`.
