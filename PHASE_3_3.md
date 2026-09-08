# TRACE Phase 3.3 — Adaptive Feedback Loop

> **Status**: Completed & Verified
> **Target**: Closed deterministic feedback loop: Practice → Observe → Update Model → Adapt Future Plan
> **Preceding Commits**: `f78efe2` (Phase 3.1), `38e3d8e` (Phase 3.2)

---

## 1. Architecture Overview

```text
PLAN (Phase 3.2)
     ↓
PRACTICE (problems, hints, time, confidence)
     ↓
OBSERVE PERFORMANCE (ProblemProgress signals)
     ↓
UPDATE USER MODEL (AdaptiveState)
     ↓
IDENTIFY WEAKNESSES / STRENGTHS
     ↓
ADAPT FUTURE PLAN (mutate future DailyPlan[] only)
     ↓
RE-PRACTICE
```

**No AI, no Math.random(), no ML. Pure deterministic evidence → decision → adaptation.**

---

## 2. New Files

| File | Purpose |
|------|---------|
| `src/services/adaptiveEngine.js` | Core deterministic engine — all algorithms |
| `src/services/adaptiveStore.js` | localStorage persistence for AdaptiveState + history |
| `src/components/AdaptiveInsightsPanel.jsx` | Compact adaptive insights UI |
| `scripts/test_phase3_3.js` | 23-test deterministic suite |

### Modified Files

| File | Change |
|------|--------|
| `src/pages/InterviewPlanPage.jsx` | Add `useAdaptiveState`, `handleAdaptPlan`, "🧠 Adapt Plan" button, `<AdaptiveInsightsPanel>` |

---

## 3. AdaptiveState Schema

```typescript
interface AdaptiveState {
  profileId: string;
  adaptationVersion: number;         // increments on each buildAdaptiveState call
  lastEvaluatedAt: string;           // ISO timestamp
  lastPerformanceChangeAt: string;   // Most recent attempt timestamp

  weakPatterns: string[];            // Canonical DSA patterns below weakness gate
  strongPatterns: string[];          // Canonical patterns with demonstrated mastery
  weakFamilies: string[];            // Rolled up to DSA_PATTERN_FAMILIES
  strongFamilies: string[];

  weakTopics: string[];
  strongTopics: string[];

  revisionPressure: number;          // 0–100 integer
  difficultyTrend: "increase"|"maintain"|"reduce";

  recentPerformance: Array<{
    problemKey: string;
    quality: number;                 // 0–100 solve quality score
    timestamp: string;
  }>;                                // Last 10 attempts, newest first

  adaptationReasons: string[];       // Human-readable explanation of last adaptation
  planDelta: {
    addedRevision: number;
    removedHard: number;
    addedWeakPatternProblems: number;
    shiftedFamilies: string[];
  };
}
```

---

## 4. Performance Signals

All signals come from existing `ProblemProgress` fields (Phase 3.1):

| Field | Used For |
|-------|----------|
| `attempts` | Evidence gate (min 2 before declaring weakness) |
| `status` (solved / forgot_approach / need_revision) | Revision pressure |
| `hintsUsed` | Solve quality, weakness signal |
| `solutionViewed` | Solve quality, weakness signal |
| `confidence` (high/medium/low) | Quality score, revision pressure |
| `timeSpentSeconds` | Time-on-budget quality bonus |
| `consecutiveSuccesses` | Quality bonus |
| `consecutiveFailures` | Quality penalty |
| `lastAttempted` | Recency weighting |

---

## 5. Solve Quality (0–100)

Independent mastery is distinguished from hint-assisted or solution-viewed attempts.

```
base             = solved ? 60 : 0
independent      = +25  (solved + no hints + no solution viewed)
confidence       = high:+15, medium:+0, low:-15
time on budget   = within 1.5x expected seconds → +10
consecutive      = successStreak >= 3 → +5
failure penalty  = -10 per consecutiveFailures, cap -30
solutionViewed   = -20
hints penalty    = -5 per hint, cap -15
clamp [0, 100]
```

**Key:** `solved !== mastered`. Independent high-confidence solve ≈ 100. Solution-viewed low-confidence ≈ 25.

---

## 6. Recency Weighting

Exponential decay with 14-day half-life:

```
weight = 2^(-(daysSince / 14))

0 days ago  → 1.00
7 days ago  → 0.71
14 days ago → 0.50
28 days ago → 0.25
```

Applied to: revision pressure, weakness detection, recent performance window.

**Formula documented in `adaptiveEngine.js:computeRecencyWeight()`.**

---

## 7. Weakness Detection

**Multi-signal gate** — requires ALL three conditions:

```
1. attempts >= 2                          (minimum evidence)
2. weightedSuccessRate < 0.45             (below 45% recent success)
3. At least ONE of:
     hintRate > 0.50                      (used hints > 50% of attempts)
     solutionViewRate > 0.30              (peeked > 30% of attempts)
     recentFailures (weighted) >= 2.0     (strong recent failure signal)
```

**Avoids declaring a pattern weak from a single bad problem.**

---

## 8. Strength Detection

**All four conditions required:**

```
1. attempts >= 3
2. weightedSuccessRate >= 0.75
3. independentSolveRate >= 0.50
4. avgConfidence >= 3.5 / 5
```

Strong patterns receive periodic reinforcement — not eliminated.

---

## 9. Revision Pressure (0–100)

```
pressure = 0
for each problem in progressMap (sorted deterministically by key):
  w = recencyWeight(lastAttempted)
  if forgot_approach:  pressure += 20 * w
  if need_revision:    pressure += 12 * w
  if quality < 40:     pressure += 8  * w

pressure = clamp(0, 100)
```

When `revisionPressure > 60`: extra revision slot injected into next 3 unlocked future days.

---

## 10. Difficulty Adaptation

```
7-day window:
  recentFailedMedHard = count of Medium/Hard unsolved in last 7 days
  recentCleanEasy     = count of Easy solved independently in last 7 days

if recentFailedMedHard >= 2:                         → "reduce"
if recentCleanEasy >= 3 AND recentFailedMedHard == 0:→ "increase"
else:                                                 → "maintain"
```

- **reduce**: Hard → Medium swaps in future days (one per day, gradual)
- **increase**: One additional Hard problem allowed in future focus days
- **maintain**: No difficulty change

---

## 11. Plan Mutation Rules

Only `day.dayIndex > currentDayIndex && !day.completed` days are mutated.

```
A. Revision injection
   if revisionPressure > 60 AND day has no revision slot:
     inject 1 revision item (forgot_approach first, then need_revision, oldest first)

B. Weak family reinforcement
   if day.focusFamily is in weakFamilies:
     add 1 company-grounded problem from the weak family (if budget allows)
     max: 40% of future days per single weak family

C. Difficulty shift
   if trend == "reduce": replace first Hard problem with Medium from same family
   if trend == "increase": allow 1 Hard addition if budget and pool permit

D. Dedup
   problems already solved with quality > 70 are filtered from future new-problem slots
   (they may still appear as revision)

E. Time budget enforcement
   remove lowest-priority problem if estimatedMinutes > dailyStudyMinutes + 15
```

---

## 12. Past / Future Boundary

```javascript
const isLocked = day.completed === true || day.dayIndex <= currentDayIndex;
```

- **Locked (past)**: unchanged, returned as-is
- **Mock days**: unchanged regardless of future status
- **Future unlocked**: eligible for all mutation operations

Historical attempts, timestamps, confidence, and solve records are NEVER modified.

---

## 13. Plan Versioning

Each `adaptFutureDays()` call:
- Increments `plan.planVersion` by 1
- Sets `plan.lastAdaptedAt` to current ISO timestamp
- Sets `plan.adaptationVersion` to `AdaptiveState.adaptationVersion`

`buildAdaptiveState()` increments `adaptationVersion` on each call.

History ring buffer (`trace_adaptation_history`) stores last 10 adaptations with version, timestamp, weakFamilies, reasons, and delta.

---

## 14. Adaptation Reasons

Every adaptation produces human-readable reasons derived from deterministic signals:

```
"Revision pressure high (72/100) — added 2 revision slot(s)"
"Weak areas detected: Binary Search, Trees — added 3 reinforcement problem(s)"
"Difficulty trend: reduce — removed 1 Hard problem(s), replaced with Medium"
"Weak pattern families: Dynamic Programming, Graphs"
"Strong families maintained: Arrays, Hashing"
```

Gemini is NOT called for these explanations. Signal → String, deterministically.

---

## 15. Adaptive Insights UI

`<AdaptiveInsightsPanel>` renders:
- **🔥 Needs Attention**: weak pattern families (red)
- **💪 Strong Areas**: strong pattern families (green)
- **🔄 Revision**: pressure bar 0–100 with tier label
- **📈/📉/📊 Difficulty**: trend with swap count
- **Why the plan changed**: ordered list of adaptation reasons
- **Weak topics**: secondary weak topic badges
- **UPDATED TODAY**: badge when adaptation occurred same calendar day

---

## 16. Adaptation Trigger & Cooldown

**Manual**: "🧠 Adapt Plan" button in `InterviewPlanPage` header.
**Auto**: not yet implemented — kept for Phase 3.4 event wiring.
**Cooldown**: 30 minutes minimum between adaptations (`ADAPTATION_COOLDOWN_MS = 30 * 60 * 1000`).
**Boundary**: adaptation terminates in O(days × problems) — no recursion, no re-trigger.

---

## 17. Determinism Guarantees

```
same profile
+ same progressMap
+ same plan
+ same nowMs
= byte-for-byte identical AdaptiveState and adapted plan
```

- No `Math.random()`
- All `Object.entries()` sorted before iteration
- All arrays sorted with explicit stable tiebreakers (id, title, key)
- `nowMs` injectable for all time-sensitive functions → testable at fixed timestamps

---

## 18. Edge Case Handling

| Edge Case | Behavior |
|-----------|---------|
| No performance yet | No weakness detected, revisionPressure = 0, maintain difficulty |
| Only one attempt | Weakness gate requires 2+ attempts — no false positives |
| All problems solved | Quality > 70 dedups prevent redundant re-assignment |
| Very low confidence | Increases revision pressure without declaring weakness alone |
| Very high confidence | Decreases revision pressure, potential strength signal |
| No revision candidates | Revision injection slot skipped gracefully |
| No company problems | Falls back to NORMALIZED_PROBLEMS |
| Very small problem pool | adaptFutureDays terminates without crash |
| Very short window | Days locked → adaptation has no target → returns plan unchanged |
| Missed study days | Not pushed forward — adaptation works within existing day structure |
| One overwhelmingly weak pattern | Capped at 40% of future days, not every day |
| All target patterns mastered | Zero revision pressure, may trigger difficulty increase |

---

## 19. Storage Keys

| Key | Contains |
|-----|---------|
| `trace_adaptive_state` | Current AdaptiveState |
| `trace_adaptation_history` | Ring buffer of last 10 adaptations |

Existing keys untouched:
- `trace_interview_profile`
- `trace_planning_state`
- `trace_daily_plan`
- `trace_problem_progress`
- `trace_solved_problems`

---

## 20. Phase 3.4 Integration Points

Phase 3.3 reserves these hooks for Phase 3.4 (Timed Interview Simulation):

- `plan.lastAdaptedAt` — available for rubric to record pre/post adaptation quality
- `AdaptiveState.recentPerformance` — provides quality window for simulation assessment
- `computeSolveQuality()` — can be called post-simulation to score timed attempts
- `adaptationReasons` — available for display alongside simulation results
- `revisionPressure` — can feed into post-simulation remediation plan

Phase 3.4 must NOT implement adaptive mutation — that belongs to Phase 3.3 only.

---

## 21. Test Suite

`scripts/test_phase3_3.js` — **23/23 tests passed**:

1. No-performance baseline
2. Single failure — bounded adaptation
3. Repeated failure — weakness escalation
4. Strong performance — success detection
5. Hint usage — weaker signal than independent
6. Solution viewed — not equivalent to mastery
7. Confidence — low confidence increases pressure
8. Pattern weakness detection
9. Topic weakness detection
10. Difficulty adaptation increase
11. Difficulty adaptation reduce
12. Revision spacing
13. Company relevance preservation
14. Time budget enforcement
15. Interview boundary
16. Past immutability
17. Future mutation
18. Duplicate prevention
19. Determinism
20. Versioning
21. Insufficient pool — graceful degradation
22. No infinite adaptation — cooldown
23. Recency weight formula (bonus)

---

## 22. Regression

- Phase 3.2: **10/10 PASSED**
- Phase 3.1: **14/14 PASSED**
- Production build: **✅ PASSED** (83 modules, 215ms)
