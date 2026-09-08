# TRACE — Phase 3.4: Timed Interview Simulation & Rubric Evaluator

TRACE tagline:
> **See your algorithm think.**

## 1. Overview & Architecture
Phase 3.4 introduces a full-fledged technical interview simulation environment designed to emulate realistic coding rounds while preserving strict deterministic evaluation standards.

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

## 2. Phase 3.4.1 Surgical Audit Corrections

### 1. Language Execution Honesty
- **Problem**: UI previously advertised 5 executable languages, but C++, JS, and C lacked in-browser compilation/execution and were silently piped into Java execution.
- **Correction**: `src/services/interviewExecutionAdapter.js` explicitly defines `EXECUTABLE_LANGUAGES = ["java", "python"]`. The UI visually marks C++, JS, and C as `Editor only (Evaluated in Rubric)` with an explicit notice badge and disables "Run & Test" for non-executable languages. Code written in these languages is preserved and evaluated thoroughly by the Rubric evaluator.

### 2. Multi-Test Java Verification
- **Problem**: Java previously executed once with default inputs and compared that single output against all verification examples.
- **Correction**: Implemented `parseInputStringToMap` to extract and map arguments per test case, executing Java independently for every test case.

### 3. Strict Normalized Output Comparison
- **Problem**: Test matching used substring containment (`actual.includes(expected)`), producing false positive passes on partial matches.
- **Correction**: Implemented `normalizeAndCompareOutputs(actual, expected)` which normalizes JSON arrays, booleans, and whitespace, enforcing strict equality.

### 4. Monotonic Timer State Unification
- **Problem**: Timer maintained dual-accounting fields (`totalPausedSeconds` and `pausedDurationMs`), leading to potential desynchronization.
- **Correction**: Unified into a single monotonic `totalPausedMs` offset applied to `Date.now() - session.startedAt`.

### 5. Clamped Expiration Semantics
- **Problem**: Expired sessions allowed elapsed time to drift past duration.
- **Correction**: Clamped elapsed time on expiry (`elapsedSeconds = durationSeconds`, `remainingSeconds = 0`, `isExpired = true`).

### 6. Submission Authority Hardening
- **Problem**: Client could potentially forge execution evidence or override rubric scores via `submitInterviewSession(sessionId, payload)`.
- **Correction**: `submitInterviewSession` recalculates objective correctness and rubric scores server-authoritatively using recorded evidence, approach notes, and code. Client overrides are strictly discarded.

### 7. Phase 3.3 Integration Dual-Write
- **Problem**: Need to inform Phase 3.3 adaptive engine of interview results without mutating its existing adaptive logic.
- **Correction**: On submission, rich interview metadata is recorded in `progressStore` under `interviewHistory` and `lastInterviewPerformance`, preserving Phase 3.3 compatibility.

### 8. Follow-up Question Lifecycle
- **Correction**: Follow-up questions are dynamically presented based on problem pattern, candidate answers are saved incrementally in session storage, and frozen upon submission.

### 9. Seeded Deterministic Problem Selection
- **Correction**: Weakness, Company, Pattern, and Random modes use deterministic pseudo-random seeds (`seededRandom`) ensuring reproducible problem selection.

### 10. Real Headless Chrome E2E Verification
- **Correction**: Built an automated 12-stage Chrome CDP test (`scripts/e2e_interview_simulation.js`) capturing visual proof artifacts at each milestone.

---

## 3. Rubric Evaluator Specification (100% Total)

| Category | Weight | Description |
| :--- | :--- | :--- |
| **Problem Understanding** | 15% | Identifying constraints, edge cases, input/output contracts |
| **Correctness** | 20% | Objective multi-test execution, compile status, runtime failures |
| **Efficiency** | 10% | Optimal Time and Space complexity analysis |
| **Code Quality & Fluency** | 20% | Idiomatic style, variable naming, modular structure |
| **Edge Case Handling** | 10% | Null checks, single elements, duplicates, extremes |
| **Communication & Reasoning**| 10% | Approach explanation, clarity of thought before coding |
| **Time Management** | 10% | Pacing, timely submission, avoidance of expiration |
| **Follow-up Adaptability** | 5% | Responses to algorithmic and scaling follow-ups |

---

## 4. Verification & Test Metrics

- **Phase 3.1 Suite**: 14/14 PASSED
- **Phase 3.2 Suite**: 10/10 PASSED
- **Phase 3.3 Suite**: 26/26 PASSED
- **Phase 3.4.1 Suite**: 25/25 PASSED
- **Total Unit/Integration Tests**: **75/75 PASSED (100%)**
- **Production Build**: Built in 199ms with 0 errors
- **Browser E2E Verification**: 12/12 stages PASSED (100%)
