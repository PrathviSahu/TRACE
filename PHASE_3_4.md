# TRACE — Phase 3.4: Timed Interview Simulation & Rubric Evaluator

TRACE tagline:
> **See your algorithm think.**

## 1. Overview & Architecture
Phase 3.4 introduces a realistic technical interview simulation environment designed to emulate real FAANG/tier-1 coding rounds while preserving strict deterministic evaluation standards and preventing client-side score tampering.

```text
Interview Setup
      ↓
Select Interview Mode (Company / Pattern / Weakness / Random)
      ↓
Select Problem (Deterministic Seeded Selection)
      ↓
Start Interview (Timestamp-based Authoritative Timer)
      ↓
Understand Problem & Candidate Approach Notes
      ↓
Write Code & Run Multi-Test Verification (Java / Python Executable)
      ↓
Answer Progressive Follow-ups
      ↓
Submit Interview Session
      ↓
Server-Authoritative Rubric Evaluator (Deterministic Evidence + AI Qualitative)
      ↓
Detailed Performance Report & Phase 3.3 Progress Dual-Write
```

---

## 2. Phase 3.4.1 Surgical Audit Corrections & Invariants

### 1. Language Execution Honesty
- **Invariant**: `EXECUTABLE_LANGUAGES = ["java", "python"]` strictly enforced in `src/services/interviewExecutionAdapter.js`.
- C++, JS, and C are honestly labeled `Editor only (Evaluated in Rubric)` with a warning badge; the "Run & Test" button is disabled while preserving code for comprehensive rubric evaluation.

### 2. Multi-Test Java Verification
- **Invariant**: Implemented `parseInputStringToMap` to extract argument mappings per test case. Java compiles and executes independently for each test case, reporting individual pass/fail status.

### 3. Strict Normalized Output Comparison
- **Invariant**: `normalizeAndCompareOutputs(actual, expected)` normalizes JSON structures, booleans, and whitespace, enforcing strict equality and preventing partial substring false positives.

### 4. Monotonic Timer State Unification
- **Invariant**: Timer accounting is unified into a single monotonic `totalPausedMs` offset applied directly to `Date.now() - session.startedAt`.

### 5. Clamped Expiration Semantics
- **Invariant**: Expired sessions clamp elapsed time to duration (`elapsedSeconds = durationSeconds`, `remainingSeconds = 0`, `isExpired = true`).

### 6. Submission Authority & Security Hardening
- **Invariant**:
  ```text
  session
    ↓
  recorded execution evidence ONLY (session.executionEvidence)
    ↓
  deterministic objective scoring (computeCorrectnessScore, computeTimeManagementScore)
    ↓
  validated qualitative evaluation (validateEvaluationSchema or computeDeterministicRubricFallback)
    ↓
  authoritative rubric (category weights strictly from RUBRIC_WEIGHTS, overallScore strictly recomputed)
    ↓
  immutable snapshot (all post-submit mutations blocked)
  ```
  - **Caller execution evidence discarded**: `finalPayload.executionEvidence` and `finalPayload.executionResult` are NEVER accepted. If no code was executed during the session, objective correctness is strictly 0.
  - **Caller rubric discarded as authoritative**: Caller-supplied `rubricResult` is never taken at face value. Only qualitative categories are checked via `validateEvaluationSchema`; if invalid, deterministic fallback is computed. Correctness and time management are ALWAYS overwritten with deterministic objective calculations. `overallScore` is ALWAYS mathematically recomputed.
  - **Elapsed time derived from clock**: Caller-supplied `elapsedSeconds` is ignored; elapsed time is computed from `calculateSessionTime(session, nowMs)`.
  - **Post-submit immutability**: Both `saveInterviewSession` and `submitInterviewSession` reject any modification to an already-submitted session.

### 7. Phase 3.3 Integration Dual-Write
- **Invariant**: Submitted sessions dual-write `interviewHistory` and `lastInterviewPerformance` into `progressStore` without mutating Phase 3.3 adaptive logic.

### 8. Follow-up Question Lifecycle
- **Invariant**: Follow-ups are seeded per pattern family, saved incrementally to session state, and frozen on submission.

### 9. Deterministic Problem Selection Across All 4 Modes
- **Company Mode**: Strictly selects from the verified company's enriched problem pool.
- **Pattern Mode**: Strictly selects problems matching the requested pattern or canonical pattern family.
- **Weakness Mode**: Focuses on candidate's weak patterns from Phase 3.3 adaptive state, prioritizing problems with higher consecutive failures.
- **Random Mode**: Uses deterministic LCG PRNG (`seededRandom`) ensuring identical seeds produce identical problem selections, while differing seeds produce differing selections.

### 10. Real Headless Chrome E2E Verification
- 12-stage end-to-end browser automation script (`scripts/e2e_interview_simulation.js`) exercising all 4 mode buttons, launcher, timer, pause/resume, approach notes, multi-test execution, reload persistence, submission, rubric results, and history drawer with visual screenshots.

---

## 3. Rubric Evaluator Specification (Strict 8 Categories = 100%)

| Category | Weight | Description |
| :--- | :---: | :--- |
| **Problem Understanding** | **15%** | Identifying constraints, edge cases, and input/output contracts |
| **Approach / Reasoning** | **20%** | Soundness, optimality, and justification of chosen algorithmic approach |
| **Pattern Recognition** | **10%** | Identification and application of canonical DSA pattern |
| **Correctness** | **20%** | Authoritative multi-test execution, compilation, runtime errors (strictly deterministic) |
| **Code Quality** | **10%** | Idiomatic style, variable naming, readability, and modularity |
| **Complexity Analysis** | **10%** | Accuracy of Big-O time and space complexity explanations |
| **Communication** | **10%** | Structured reasoning, clarity of explanation, proactive edge-case documentation |
| **Time Management** | **5%** | Pacing, timely completion within time budget (strictly deterministic) |
| **Total** | **100%** | Exact weighted sum: $15 + 20 + 10 + 20 + 10 + 10 + 10 + 5 = 100\%$ |

---

## 4. Verification & Test Metrics

- **Phase 3.1 Suite**: 14 / 14 PASSED
- **Phase 3.2 Suite**: 10 / 10 PASSED
- **Phase 3.3 Suite**: 26 / 26 PASSED
- **Phase 3.4.1 Suite**: 28 / 28 PASSED (including 5 security attack-vector tests & 4 mode tests)
- **Total Unit/Integration Regression Tests**: **78 / 78 PASSED (100% GREEN)**
- **Production Build (`vite build`)**: Built in 232ms with 0 errors
- **Real Chrome E2E Verification**: 12 / 12 stages PASSED (100% SUCCESS)
