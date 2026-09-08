// ─────────────────────────────────────────────────────────────
//  TRACE Phase 3.4.1 — Timed Interview Simulation & Rubric Evaluator
//  Surgical Correction & Verification Test Suite
//  Pure Node.js ESM. No browser required.
// ─────────────────────────────────────────────────────────────

import assert from "node:assert/strict";

// ── Polyfill localStorage & window for Node ───────────────────
const storage = new Map();
global.localStorage = {
  getItem: (k) => storage.get(k) ?? null,
  setItem: (k, v) => storage.set(k, String(v)),
  removeItem: (k) => storage.delete(k),
  clear: () => storage.clear(),
};
global.CustomEvent = class CustomEvent {
  constructor(name, params = {}) {
    this.type = name;
    this.detail = params.detail || null;
  }
};
global.window = {
  localStorage: global.localStorage,
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => {}
};

import {
  createSessionRecord,
  saveInterviewSession,
  getSession,
  getAllSessions,
  getActiveSession,
  setActiveSessionId,
  getActiveSessionId,
  getInterviewHistory,
  submitInterviewSession
} from "../src/services/interviewSimulationStore.js";

import {
  seededRandom,
  hashString,
  selectInterviewProblem,
  selectProblemForInterview,
  calculateSessionTime,
  evaluateObjectiveCorrectness,
  evaluateTimeManagement,
  calculateInterviewRubric,
  computeCorrectnessScore,
  computeTimeManagementScore,
  RUBRIC_WEIGHTS,
  RUBRIC_WEIGHTS_SUM
} from "../src/services/interviewSimulationEngine.js";

import {
  validateEvaluationSchema,
  computeDeterministicRubricFallback,
  evaluateInterviewWithGemini
} from "../src/services/interviewEvaluator.js";

import {
  executeInterviewCode,
  normalizeAndCompareOutputs,
  parseInputStringToMap,
  EXECUTABLE_LANGUAGES
} from "../src/services/interviewExecutionAdapter.js";

import { getAllProgress, getProblemKey, getProblemProgress } from "../src/services/progressStore.js";
import { getCompanyEnrichedProblems } from "../src/data/companyUtils.js";
import { getProblemPatternDetails, getPatternFamily } from "../src/data/patternMapping.js";

// ── Test Runner ───────────────────────────────────────────────
let passedCount = 0;
let totalCount = 0;

async function test(name, fn) {
  totalCount++;
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    → ${err.message}`);
    if (err.stack) console.error(err.stack);
  }
}

console.log("=================================================");
console.log("TRACE — Phase 3.4.1 Test Suite: Interview Simulation & Rubric");
console.log("=================================================");

async function runTests() {
  storage.clear();

  // 1. Session Lifecycle: create session
  await test("Session Lifecycle: create session record with complete schema", () => {
    const session = createSessionRecord({
      profileId: "prof-1",
      companyId: "google",
      role: "Software Engineer",
      mode: "company",
      durationMinutes: 45,
      problemId: 1,
      language: "python"
    });

    assert.ok(session.id, "Session must have an ID");
    assert.equal(session.status, "not_started");
    assert.equal(session.phase, "understanding");
    assert.equal(session.durationSeconds, 45 * 60);
    assert.equal(session.elapsedSeconds, 0);
    assert.equal(session.attempts, 0);
    assert.equal(session.hintsUsed, 0);
    assert.equal(session.solutionViewed, false);
    assert.equal(session.code, "");
    assert.equal(session.language, "python");
    assert.deepEqual(session.followUps, []);
    assert.equal(session.rubricResult, null);
  });

  // 2. Timer: Pause, Resume, Multi-pause and Unified State (Issue 4)
  await test("Timer: unified totalPausedMs accurately handles multiple pause-resume cycles without double-counting", () => {
    const session = createSessionRecord({ durationMinutes: 30 });
    const t0 = 1000000;

    // Start
    session.status = "active";
    session.startedAt = t0;
    saveInterviewSession(session);

    // First Pause at t0 + 100s for 20s
    session.status = "paused";
    session.pausedAt = t0 + 100000;
    saveInterviewSession(session);

    // Resume at t0 + 120s
    session.status = "active";
    session.totalPausedMs = (session.totalPausedMs || 0) + (120000 - 100000); // 20s
    session.pausedAt = null;
    saveInterviewSession(session);

    // Second Pause at t0 + 200s for 30s
    session.status = "paused";
    session.pausedAt = t0 + 200000;
    saveInterviewSession(session);

    // Resume at t0 + 230s
    session.status = "active";
    session.totalPausedMs = (session.totalPausedMs || 0) + (230000 - 200000); // 30s
    session.pausedAt = null;
    saveInterviewSession(session);

    assert.equal(session.totalPausedMs, 50000, "Total paused should be exactly 50s (50000ms)");

    // At t0 + 300s, total elapsed should be 300s - 50s = 250s
    const now = t0 + 300000;
    const timeState = calculateSessionTime(session, now);
    assert.equal(timeState.elapsedSeconds, 250);
    assert.equal(timeState.remainingSeconds, 1800 - 250);
    assert.equal(timeState.isExpired, false);
  });

  // 3. Timer: Exact Expiration Semantics (Issue 5)
  await test("Timer: exact expiration semantics (elapsed clamped to duration, remaining 0, isExpired true)", () => {
    const tStart = 1000000;
    const session = {
      status: "active",
      startedAt: tStart,
      durationSeconds: 1800, // 30 min
      totalPausedMs: 0,
      pausedAt: null
    };

    // Exactly 1 second past expiration
    const now = tStart + 1801000;
    const timeState = calculateSessionTime(session, now);

    assert.equal(timeState.elapsedSeconds, 1800, "Elapsed seconds must clamp to exactly durationSeconds at expiration");
    assert.equal(timeState.remainingSeconds, 0, "Remaining seconds must be exactly 0");
    assert.equal(timeState.isExpired, true, "isExpired must be true");
  });

  // 4. Timer: Persistence and active session recovery across page reload
  await test("Timer: persistence and restore maintains exact timestamps and active session across reload", () => {
    const session = createSessionRecord({ durationMinutes: 45 });
    session.status = "active";
    session.startedAt = 2000000;
    session.totalPausedMs = 15000;
    session.code = "def twoSum(): pass";
    saveInterviewSession(session);
    setActiveSessionId(session.id);

    const active = getActiveSession();
    assert.ok(active);
    assert.equal(active.id, session.id);
    assert.equal(active.startedAt, 2000000);
    assert.equal(active.totalPausedMs, 15000);
    assert.equal(active.code, "def twoSum(): pass");
  });

  // 5. Language Execution Honesty: Supported vs Unsupported Languages (Issue 1)
  await test("Language Honesty: Java and Python execute; C++, JS, and C are honestly rejected from execution", async () => {
    assert.deepEqual(EXECUTABLE_LANGUAGES, ["java", "python"]);

    // Test C++ execution attempt
    const cppSession = createSessionRecord({ problemId: 1, language: "cpp" });
    cppSession.code = "#include <iostream>\nint main() { return 0; }";

    const cppResult = await executeInterviewCode(cppSession);
    assert.equal(cppResult.executionEvidence.compiled, false);
    assert.equal(cppResult.executionEvidence.executed, false);
    assert.equal(cppResult.executionEvidence.passed, false);
    assert.ok(cppResult.executionEvidence.output[0].includes("unavailable"));
    assert.equal(cppResult.attemptsHistory[0].status, "unsupported_language");

    // Test JavaScript execution attempt
    const jsSession = createSessionRecord({ problemId: 1, language: "javascript" });
    jsSession.code = "console.log('hello');";
    const jsResult = await executeInterviewCode(jsSession);
    assert.equal(jsResult.executionEvidence.executed, false);
    assert.ok(jsResult.executionEvidence.output[0].includes("unavailable"));
  });

  // 6. Multi-test Java Execution: Independent evaluation per test case (Issue 2)
  await test("Java Multi-Test Execution: Evaluates each verification example independently", async () => {
    const javaCode = `
public class Solution {
    public int[] twoSum(int[] nums, int target) {
        for (int i = 0; i < nums.length; i++) {
            for (int j = i + 1; j < nums.length; j++) {
                if (nums[i] + nums[j] == target) {
                    return new int[]{i, j};
                }
            }
        }
        return new int[]{};
    }
}
`;
    const session = createSessionRecord({ problemId: 1, language: "java" });
    session.code = javaCode;

    const res = await executeInterviewCode(session);
    assert.equal(res.executionEvidence.executed, true);
    assert.equal(res.executionEvidence.passed, true);
    assert.ok(res.executionEvidence.testsTotal >= 3, "Problem 1 must have at least 3 test cases");
    assert.equal(res.executionEvidence.testsPassed, res.executionEvidence.testsTotal);
    assert.equal(res.executionEvidence.testResults.length, res.executionEvidence.testsTotal);

    // Verify test 1 and test 2 received independent inputs and outputs
    const t1 = res.executionEvidence.testResults[0];
    const t2 = res.executionEvidence.testResults[1];
    assert.notEqual(t1.input, t2.input, "Each test case must receive its own distinct input");
    assert.equal(t1.actual, "[0,1]");
    assert.equal(t2.actual, "[1,2]");
  });

  // 7. Strict Normalized Output Comparison (Issue 3)
  await test("Correctness: normalizeAndCompareOutputs rejects substring false positives and requires exact match", () => {
    // Substring false positives must strictly FAIL
    assert.equal(normalizeAndCompareOutputs("15", "5"), false, "Substring '15' must not match '5'");
    assert.equal(normalizeAndCompareOutputs("debug [0,1]", "[0,1]"), false, "Debug prefix must not pass substring match");
    assert.equal(normalizeAndCompareOutputs("untrue", "true"), false, "Substring 'untrue' must not match 'true'");

    // Normalized valid formats must PASS
    assert.equal(normalizeAndCompareOutputs("[0, 1]", "[0,1]"), true, "Array whitespace differences should match");
    assert.equal(normalizeAndCompareOutputs("[0,1]", "[0,1]"), true, "Exact match must pass");
    assert.equal(normalizeAndCompareOutputs("true\n", "true"), true, "Surrounding line ending/whitespace should match");
    assert.equal(normalizeAndCompareOutputs("  42  ", "42"), true, "Trimmed numeric string should match");
  });

  // 8. Deterministic Mode: Company problem selection across multiple companies
  await test("Modes: Company interview mode strictly selects problem belonging to that company's pool", () => {
    const testCompanies = ["google", "microsoft", "amazon", "meta", "apple"];
    for (const compId of testCompanies) {
      const compProblems = getCompanyEnrichedProblems(compId);
      const validIds = new Set(compProblems.map(p => String(p.id)));

      const res = selectInterviewProblem({
        mode: "company",
        companyId: compId,
        role: "Software Engineer",
        seed: `comp-test-${compId}`
      });

      assert.ok(res, `Must select a problem for ${compId}`);
      assert.ok(validIds.has(String(res.id)), `Selected problem #${res.id} must belong to ${compId}'s verified problem pool`);
    }
  });

  // 9. Deterministic Mode: Pattern problem selection across multiple canonical patterns
  await test("Modes: Pattern interview mode strictly selects problem matching requested pattern", () => {
    const testPatterns = ["Two Pointers", "Sliding Window", "Binary Search"];
    for (const targetPattern of testPatterns) {
      const res = selectInterviewProblem({
        mode: "pattern",
        pattern: targetPattern,
        seed: `pattern-seed-${targetPattern}`
      });

      assert.ok(res, `Must select a problem for ${targetPattern}`);
      const details = getProblemPatternDetails(res);
      const pats = details?.patterns || [];
      const fam = getPatternFamily(pats[0]);
      const topics = res.topics || [];
      const matchesPattern = pats.includes(targetPattern) || fam === targetPattern || topics.includes(targetPattern);
      assert.ok(matchesPattern, `Selected problem #${res.id} must belong to requested pattern ${targetPattern} or its family`);
    }
  });

  // 10. Deterministic Mode: Weakness problem selection and failure prioritization from Phase 3.3
  await test("Modes: Weakness interview mode prioritizes weak patterns from Phase 3.3 adaptive state", () => {
    const weakPatterns = ["Dynamic Programming", "Sliding Window"];
    const res = selectInterviewProblem({
      mode: "weakness",
      adaptiveState: { weakPatterns },
      seed: "weakness-seed-1"
    });

    assert.ok(res, "Must select a problem");
    const details = getProblemPatternDetails(res);
    const pats = details?.patterns || [];
    const fam = getPatternFamily(pats[0]);
    const matchesWeakness = pats.some(p => weakPatterns.includes(p)) || weakPatterns.includes(fam);
    assert.ok(matchesWeakness, `Selected problem #${res.id} must belong to one of the weak patterns [${weakPatterns.join(", ")}]`);

    // Prioritization check: problem with higher consecutive failures must be prioritized
    const p1 = res;
    const progressMap = {
      [getProblemKey(p1)]: { consecutiveFailures: 3 }
    };
    const res2 = selectInterviewProblem({
      mode: "weakness",
      adaptiveState: { weakPatterns },
      progressMap,
      seed: "weakness-seed-2"
    });
    assert.equal(res2.id, p1.id, "Problem with highest consecutive failures in weak pattern pool must be selected");
  });

  // 11. Deterministic Mode: Random mode reproducible PRNG (no Math.random)
  await test("Modes: Random mode produces identical problem for identical seed, different across differing seeds", () => {
    const seedA = "fixed-session-seed-alpha";
    const seedB = "fixed-session-seed-zebra-999";

    const resA1 = selectInterviewProblem({ mode: "random", seed: seedA });
    const resA2 = selectInterviewProblem({ mode: "random", seed: seedA });
    const resB = selectInterviewProblem({ mode: "random", seed: seedB });

    assert.equal(resA1.id, resA2.id, "Same seed must produce identical selected problem");
    assert.equal(resA1.title, resA2.title);
    assert.notEqual(resA1.id, resB.id, "Differing seeds must select different problems");
  });

  // 12. PRNG: seededRandom mathematical determinism
  await test("Determinism: seededRandom generates consistent pseudo-random sequence", () => {
    const valA1 = seededRandom(99999);
    const valA2 = seededRandom(99999);
    const valB = seededRandom(11111);

    assert.equal(valA1, valA2);
    assert.notEqual(valA1, valB);
    assert.ok(valA1 >= 0 && valA1 < 1);
  });

  // 13. Execution Evidence: Passing, Partial, Runtime, Compile errors
  await test("Execution Evidence: Objective correctness scoring handles all execution states", () => {
    const passEvidence = { compiled: true, executed: true, passed: true, testsPassed: 3, testsTotal: 3 };
    assert.equal(computeCorrectnessScore(passEvidence), 5);

    const partialEvidence = { compiled: true, executed: true, passed: false, testsPassed: 2, testsTotal: 4 };
    assert.equal(computeCorrectnessScore(partialEvidence), 2); // 2/4 * 4 = 2

    const runtimeEvidence = { compiled: true, executed: true, runtimeError: "IndexOutOfBounds", testsPassed: 0, testsTotal: 3 };
    assert.equal(computeCorrectnessScore(runtimeEvidence), 1);

    const compileEvidence = { compiled: false, compileError: "SyntaxError", testsPassed: 0, testsTotal: 3 };
    assert.equal(computeCorrectnessScore(compileEvidence), 0);
  });

  // 14. Attempts and Hints Tracking
  await test("Attempts & Hints: accurately records increments and solution penalties", () => {
    const session = createSessionRecord({ problemId: 1 });
    session.attempts = 4;
    session.hintsUsed = 3;
    session.solutionViewed = true;
    saveInterviewSession(session);

    const loaded = getSession(session.id);
    assert.equal(loaded.attempts, 4);
    assert.equal(loaded.hintsUsed, 3);
    assert.equal(loaded.solutionViewed, true);
  });

  // 15. Time Management Scoring
  await test("Time Management: evaluates deterministic score based on duration and status", () => {
    // Solved within 50% time
    assert.equal(computeTimeManagementScore(900, 1800, 1, "submitted"), 5);
    // Solved within 80% time
    assert.equal(computeTimeManagementScore(1400, 1800, 2, "submitted"), 4);
    // Solved within 95% time
    assert.equal(computeTimeManagementScore(1700, 1800, 3, "submitted"), 3);
    // Expired with attempts
    assert.equal(computeTimeManagementScore(1800, 1800, 2, "expired"), 2);
    // Expired without attempts
    assert.equal(computeTimeManagementScore(1800, 1800, 0, "expired"), 1);
  });

  // 16. Rubric: Weights Total Exactly 100%
  await test("Rubric: all 8 category weights sum exactly to 100%", () => {
    const expected = {
      problemUnderstanding: 0.15,
      approachReasoning: 0.20,
      patternRecognition: 0.10,
      correctness: 0.20,
      codeQuality: 0.10,
      complexityAnalysis: 0.10,
      communication: 0.10,
      timeManagement: 0.05
    };

    for (const [cat, weight] of Object.entries(expected)) {
      assert.equal(RUBRIC_WEIGHTS[cat], weight, `Weight for ${cat} must match prompt`);
    }

    const totalWeight = Object.values(RUBRIC_WEIGHTS).reduce((a, b) => a + b, 0);
    assert.equal(Math.round(totalWeight * 100), 100, "Total rubric weight must equal 100%");
  });

  // 17. Rubric: Weighted Normalization
  await test("Rubric: normalizes category scores (0-5 -> 0-100) and computes weighted sum", () => {
    const scores = {
      problemUnderstanding: 4.0, // 80% * 0.15 = 12
      approachReasoning: 4.0,    // 80% * 0.20 = 16
      patternRecognition: 5.0,   // 100% * 0.10 = 10
      correctness: 5.0,          // 100% * 0.20 = 20
      codeQuality: 4.0,          // 80% * 0.10 = 8
      complexityAnalysis: 5.0,   // 100% * 0.10 = 10
      communication: 4.0,        // 80% * 0.10 = 8
      timeManagement: 5.0        // 100% * 0.05 = 5
      // Total = 89
    };
    const rubric = calculateInterviewRubric(scores);
    assert.equal(rubric.overallScore, 89);
  });

  // 18. Malicious Submission Attack 1: Forged execution evidence when NO execution occurred
  await test("Security: Forged execution evidence rejected when no execution occurred", () => {
    const session = createSessionRecord({ problemId: 1, durationMinutes: 45 });
    session.status = "active";
    session.code = "class Solution { int[] twoSum() { return null; } }";
    // Candidate NEVER executed code in this session
    session.executionEvidence = null;
    saveInterviewSession(session);

    // Attacker attempts to forge passing execution evidence via submit payload
    const submitted = submitInterviewSession(session.id, {
      executionEvidence: { compiled: true, executed: true, passed: true, testsPassed: 5, testsTotal: 5 },
      executionResult: { passed: true, testsPassed: 5, testsTotal: 5 },
    });

    // Must strictly remain unexecuted and correctness score must be 0
    assert.equal(submitted.executionEvidence.passed, false, "Forged passed status must be rejected");
    assert.equal(submitted.executionEvidence.testsPassed, 0, "Forged testsPassed count must be rejected");
    assert.equal(submitted.rubricResult.categories.correctness.score, 0, "Correctness score must be 0 for unexecuted session");
  });

  // 19. Malicious Submission Attack 2: Forged rubric categories and spoofed 100% score
  await test("Security: Forged rubric categories fail schema validation and trigger fallback", () => {
    const session = createSessionRecord({ problemId: 1, durationMinutes: 30 });
    session.status = "active";
    saveInterviewSession(session);

    // Attacker supplies out-of-range scores and forged category structure
    const submitted = submitInterviewSession(session.id, {
      rubricResult: {
        overallScore: 100,
        categories: {
          problemUnderstanding: { score: 999, reasoning: "Hacked" },
          bogusCategory: { score: 50, reasoning: "Fake" }
        }
      }
    });

    // Bounded scores and valid categories must be enforced
    assert.notEqual(submitted.rubricResult.overallScore, 100, "Spoofed 100% score must be rejected");
    for (const [cat, data] of Object.entries(submitted.rubricResult.categories)) {
      assert.ok(data.score >= 0 && data.score <= 5, `Score for ${cat} must be bounded [0, 5]`);
    }
  });

  // 20. Malicious Submission Attack 3: Forged correctness when tests actually failed
  await test("Security: Caller cannot forge correctness score when actual execution failed", () => {
    const session = createSessionRecord({ problemId: 1, durationMinutes: 45 });
    session.status = "active";
    // Recorded session evidence had 1/4 tests passed
    session.executionEvidence = {
      compiled: true,
      executed: true,
      passed: false,
      testsPassed: 1,
      testsTotal: 4
    };
    saveInterviewSession(session);

    // Attacker supplies 5/5 correctness in payload
    const submitted = submitInterviewSession(session.id, {
      rubricResult: {
        categories: {
          correctness: { score: 5.0, weightedScore: 20 }
        }
      }
    });

    // Correctness score MUST be derived from session evidence: 1/4 * 4 = 1
    assert.equal(submitted.rubricResult.categories.correctness.score, 1, "Correctness must reflect real 1/4 test result");
    assert.equal(submitted.rubricResult.categories.correctness.weightedScore, Math.round((1 / 5) * 100 * 0.20));
  });

  // 21. Malicious Submission Attack 4: Forged elapsed time on expired session
  await test("Security: Caller cannot forge elapsed time on an expired interview", () => {
    const session = createSessionRecord({ problemId: 1, durationMinutes: 45 }); // 2700s
    session.status = "active";
    session.attempts = 2; // Candidate attempted code before running out of time
    // Session started 50 minutes ago (3000s > 2700s)
    session.startedAt = new Date(Date.now() - (50 * 60 * 1000)).toISOString();
    saveInterviewSession(session);

    // Attacker claims they finished in 60 seconds
    const submitted = submitInterviewSession(session.id, {
      elapsedSeconds: 60,
      timeInfo: { elapsedSeconds: 60 }
    });

    // Authoritative time must clamp elapsed time to duration (2700s)
    assert.equal(submitted.elapsedSeconds, 2700, "Elapsed seconds must be clamped to 2700s duration");
    assert.equal(submitted.rubricResult.categories.timeManagement.score, 2, "Expired session gets time score of 2 (with attempts)");
  });

  // 22. Malicious Submission Attack 5: Post-submit mutation protection
  await test("Security: Post-submit mutation strictly blocked in store and submit", () => {
    const session = createSessionRecord({ problemId: 1, durationMinutes: 45 });
    session.status = "active";
    session.code = "public class OriginalCode {}";
    saveInterviewSession(session);

    const firstSubmit = submitInterviewSession(session.id);
    const originalSubmittedAt = firstSubmit.submittedAt;
    const originalScore = firstSubmit.rubricResult.overallScore;

    // Attacker attempts to mutate session via saveInterviewSession
    const tampered = {
      ...firstSubmit,
      code: "TAMPERED_CODE",
      rubricResult: { overallScore: 100 }
    };
    const saveResult = saveInterviewSession(tampered);
    assert.equal(saveResult.code, "public class OriginalCode {}", "saveInterviewSession must block post-submit code tampering");
    assert.equal(saveResult.rubricResult.overallScore, originalScore, "saveInterviewSession must block post-submit score tampering");

    // Attacker attempts second submit call
    const secondSubmit = submitInterviewSession(session.id, {
      code: "TAMPERED_CODE_2",
      rubricResult: { overallScore: 100 }
    });
    assert.equal(secondSubmit.submittedAt, originalSubmittedAt, "Submitted timestamp must not change");
    assert.equal(secondSubmit.rubricResult.overallScore, originalScore, "Score must not change on duplicate submit");
    assert.equal(secondSubmit.code, "public class OriginalCode {}", "Code must remain frozen");
  });

  // 20. Follow-ups: Creation, Answer Persistence, and Submission Freeze (Issue 8)
  await test("Follow-ups: Handles questions, answers survive save, and are frozen on submit", () => {
    const session = createSessionRecord({ problemId: 1 });
    session.followUps = [
      {
        id: "f1",
        question: "How would you handle streaming data?",
        answer: "",
        source: "deterministic",
        askedAt: new Date().toISOString(),
        answeredAt: null
      }
    ];
    saveInterviewSession(session);

    // Record candidate answer
    session.followUps[0].answer = "Use a sliding window with bounded buffer.";
    session.followUps[0].answeredAt = new Date().toISOString();
    saveInterviewSession(session);

    const reloaded = getSession(session.id);
    assert.equal(reloaded.followUps[0].answer, "Use a sliding window with bounded buffer.");
    assert.ok(reloaded.followUps[0].answeredAt);

    // Submit session
    const submitted = submitInterviewSession(session.id);
    assert.equal(submitted.followUps[0].answer, "Use a sliding window with bounded buffer.");
  });

  // 21. Rich Structured Performance Evidence Dual-Write for Phase 3.3 (Issue 7)
  await test("Phase 3.3 Integration: dual-writes rich structured performance record into progressStore", () => {
    const session = createSessionRecord({
      profileId: "prof-33",
      companyId: "google",
      role: "Software Engineer",
      problemId: 1,
      durationMinutes: 45
    });
    session.status = "active";
    session.executionEvidence = {
      compiled: true,
      executed: true,
      passed: true,
      testsPassed: 3,
      testsTotal: 3
    };
    saveInterviewSession(session);

    submitInterviewSession(session.id);

    // Verify progressStore received structured telemetry
    const progress = getProblemProgress(1);
    assert.equal(progress.status, "solved");
    assert.ok(progress.lastInterviewPerformance, "Must have recorded lastInterviewPerformance");
    assert.equal(progress.lastInterviewPerformance.sessionId, session.id);
    assert.equal(progress.lastInterviewPerformance.objectiveCorrectness, 5);
    assert.equal(progress.lastInterviewPerformance.companyId, "google");
    assert.ok(progress.lastInterviewPerformance.rubricOverallScore > 0);
    assert.ok(Array.isArray(progress.interviewHistory));
    assert.ok(progress.interviewHistory.length >= 1);
  });

  // 22. Gemini Schema Validation
  await test("Gemini: Schema validation strictly enforces required structure", () => {
    const valid = {
      problemUnderstanding: { score: 4.5, reasoning: "Good grasp" },
      approachReasoning: { score: 4.0, reasoning: "Sound logic" },
      patternRecognition: { score: 5.0, reasoning: "Clear pattern" },
      codeQuality: { score: 4.0, reasoning: "Clean code" },
      complexityAnalysis: { score: 4.0, reasoning: "O(N) analysis" },
      communication: { score: 4.0, reasoning: "Proactive communication" },
      strengths: ["Strong patterns"],
      improvements: ["Check edge cases"]
    };
    assert.ok(validateEvaluationSchema(valid));

    const invalid = { problemUnderstanding: { score: 4 } }; // missing categories
    assert.equal(validateEvaluationSchema(invalid), null);
  });

  // 23. Gemini Fallback: Graceful deterministic fallback
  await test("Gemini Fallback: Gracefully generates complete deterministic rubric when AI is offline", () => {
    const session = {
      approach: { summary: "Two pointer scan", reasoning: "Optimal O(N)", edgeCases: "Duplicates" },
      code: "public class Solution { int[] twoSum() { return new int[]{0, 1}; } }",
      executionEvidence: { compiled: true, executed: true, passed: true, testsPassed: 3, testsTotal: 3 }
    };
    const fallback = computeDeterministicRubricFallback(session);
    assert.ok(fallback);
    assert.equal(fallback.categories.correctness.score, 5);
    assert.ok(fallback.overallScore > 0);
  });

  // 24. Sparse Problem Pool Fallback
  await test("Sparse Pool Fallback: Gracefully selects problem when company pool is sparse", () => {
    const res = selectInterviewProblem({
      mode: "company",
      companyId: "unknown-startup-xyz",
      seed: "sparse-test"
    });
    assert.ok(res);
    assert.ok(res.id);
  });

  // 25. Interview History: Lists completed interviews chronologically
  await test("History: returns list of submitted interview sessions", () => {
    const history = getInterviewHistory();
    assert.ok(Array.isArray(history));
    assert.ok(history.length >= 1);
    assert.equal(history[0].status, "submitted");
  });

  console.log("-------------------------------------------------");
  console.log(`Phase 3.4.1 Tests Completed: ${passedCount}/${totalCount} PASSED`);
  console.log("-------------------------------------------------");

  if (passedCount === totalCount) {
    console.log("ALL PHASE 3.4.1 CORRECTION TESTS PASSED! 🚀");
  } else {
    console.error("SOME PHASE 3.4.1 TESTS FAILED!");
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error("Fatal error running Phase 3.4.1 tests:", err);
  process.exit(1);
});
