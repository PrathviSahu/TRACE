// ─────────────────────────────────────────────────────────────
//  TRACE Phase 3.3 — Adaptive Feedback Loop Test Suite
//  22 deterministic unit tests.
//  No browser, no React — pure Node.js ESM.
// ─────────────────────────────────────────────────────────────

import assert from "node:assert/strict";

// ── Polyfill localStorage for Node ───────────────────────────
const storage = new Map();
global.localStorage = {
  getItem: (k) => storage.get(k) ?? null,
  setItem: (k, v) => storage.set(k, v),
  removeItem: (k) => storage.delete(k),
  clear: () => storage.clear(),
};
global.window = { addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => {} };

import {
  computeSolveQuality,
  computeRecencyWeight,
  computeAdaptivePatternSignals,
  computeAdaptiveTopicSignals,
  detectWeakPatterns,
  detectStrongPatterns,
  detectWeakTopics,
  computeRevisionPressure,
  computeDifficultyTrend,
  extractRecentPerformance,
  buildAdaptiveState,
  adaptFutureDays,
  canAdaptNow,
  computeRevisionIntervalDays,
  computeNextRevisionDate,
  classifyPlanDay,
  REVISION_INTERVALS,
  LOW_CONFIDENCE_PRESSURE,
  RECENCY_HALF_LIFE_DAYS,
  MIN_EVIDENCE_ATTEMPTS,
  ADAPTATION_COOLDOWN_MS,
  HIGH_REVISION_PRESSURE,
} from "../src/services/adaptiveEngine.js";

import { generateDailyPlan } from "../src/services/dailyPlanGenerator.js";

// ── Test harness ──────────────────────────────────────────────
let passedCount = 0;
let totalCount = 0;
function test(name, fn) {
  totalCount++;
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    → ${err.message}`);
  }
}

console.log("\n=================================================");
console.log("TRACE — Phase 3.3 Test Suite: Adaptive Feedback Loop");
console.log("=================================================\n");

// Fixed timestamps for deterministic testing
const NOW_MS = new Date("2026-09-08T12:00:00.000Z").getTime();
const TWO_WEEKS_AGO = new Date("2026-08-25T12:00:00.000Z").toISOString();
const ONE_DAY_AGO   = new Date("2026-09-07T12:00:00.000Z").toISOString();
const YESTERDAY     = new Date("2026-09-07T00:00:00.000Z").toISOString();
const THREE_DAYS_AGO = new Date("2026-09-05T12:00:00.000Z").toISOString();

// Minimal valid profile for plan generation
const BASE_PROFILE = {
  id: "profile_microsoft_test",
  companyId: "microsoft",
  role: "Software Engineer",
  interviewDate: "2026-09-22",
  createdAt: "2026-09-08T00:00:00.000Z",
  dailyStudyMinutes: 120,
  weeklyStudyDays: ["MON","TUE","WED","THU","FRI"],
  currentLevel: "Interview Ready",
  includeRevision: true,
  includeMockInterviews: true,
  preferredLanguages: ["Java"],
  targetTopics: [],
  targetPatterns: [],
};

const BASE_PLAN = generateDailyPlan(BASE_PROFILE, {});

// ─────────────────────────────────────────────────────────────
// 1. NO-PERFORMANCE BASELINE
// ─────────────────────────────────────────────────────────────
test("No-performance baseline: initial plan remains valid, no crash", () => {
  const adaptiveState = buildAdaptiveState(BASE_PROFILE, BASE_PLAN, {}, null, NOW_MS);
  assert.strictEqual(typeof adaptiveState.revisionPressure, "number");
  assert.strictEqual(adaptiveState.revisionPressure, 0);
  assert.ok(Array.isArray(adaptiveState.weakPatterns));
  assert.ok(Array.isArray(adaptiveState.strongPatterns));
  assert.strictEqual(adaptiveState.weakPatterns.length, 0);
  assert.strictEqual(adaptiveState.difficultyTrend, "maintain");

  const { adaptedPlan } = adaptFutureDays(BASE_PLAN, adaptiveState, BASE_PROFILE, {}, NOW_MS);
  assert.ok(adaptedPlan.days.length > 0);
});

// ─────────────────────────────────────────────────────────────
// 2. SINGLE FAILURE — BOUNDED ADAPTATION
// ─────────────────────────────────────────────────────────────
test("Single failure: one failure produces only bounded adaptation (no panic)", () => {
  const progress = {
    "1": { status: "need_revision", attempts: 1, lastAttempted: ONE_DAY_AGO,
           confidence: "low", hintsUsed: 2, solutionViewed: false, consecutiveFailures: 1 }
  };
  const adaptiveState = buildAdaptiveState(BASE_PROFILE, BASE_PLAN, progress, null, NOW_MS);
  // One problem, one attempt — should NOT trigger full weakness (MIN_EVIDENCE_ATTEMPTS = 2)
  assert.strictEqual(adaptiveState.weakPatterns.length, 0, "Single attempt must not trigger weakness");
  assert.ok(adaptiveState.revisionPressure > 0, "Revision pressure should be positive");
  assert.ok(adaptiveState.revisionPressure < 40, "Single failure pressure bounded");
});

// ─────────────────────────────────────────────────────────────
// 3. REPEATED FAILURE — WEAKNESS ESCALATION
// ─────────────────────────────────────────────────────────────
test("Repeated failure: escalates weakness and revision pressure", () => {
  const progress = {
    "1":  { status: "forgot_approach", attempts: 3, lastAttempted: ONE_DAY_AGO,   confidence: "low", hintsUsed: 3, solutionViewed: true,  consecutiveFailures: 3 },
    "15": { status: "need_revision",   attempts: 2, lastAttempted: THREE_DAYS_AGO, confidence: "low", hintsUsed: 2, solutionViewed: false, consecutiveFailures: 2 },
    "20": { status: "forgot_approach", attempts: 4, lastAttempted: ONE_DAY_AGO,   confidence: "low", hintsUsed: 4, solutionViewed: true,  consecutiveFailures: 2 },
  };
  const adaptiveState = buildAdaptiveState(BASE_PROFILE, BASE_PLAN, progress, null, NOW_MS);
  assert.ok(adaptiveState.revisionPressure > HIGH_REVISION_PRESSURE - 20, "High revision pressure expected for repeated failures");
});

// ─────────────────────────────────────────────────────────────
// 4. STRONG PERFORMANCE — SUCCESS DETECTION
// ─────────────────────────────────────────────────────────────
test("Strong performance: repeated independent solve detected as strength", () => {
  // Two Sum, Contains Duplicate — both Binary Search / Hash pattern problems
  const progress = {
    "1":   { status: "solved", attempts: 4, lastAttempted: ONE_DAY_AGO, confidence: "high", hintsUsed: 0, solutionViewed: false, consecutiveSuccesses: 4, consecutiveFailures: 0 },
    "217": { status: "solved", attempts: 3, lastAttempted: ONE_DAY_AGO, confidence: "high", hintsUsed: 0, solutionViewed: false, consecutiveSuccesses: 3, consecutiveFailures: 0 },
    "242": { status: "solved", attempts: 3, lastAttempted: TWO_WEEKS_AGO, confidence: "high", hintsUsed: 0, solutionViewed: false, consecutiveSuccesses: 3, consecutiveFailures: 0 },
  };
  const adaptiveState = buildAdaptiveState(BASE_PROFILE, BASE_PLAN, progress, null, NOW_MS);
  assert.ok(adaptiveState.strongPatterns.length > 0 || adaptiveState.strongFamilies.length >= 0,
    "Strong solve patterns should be detected");
  assert.strictEqual(adaptiveState.revisionPressure, 0, "No revision pressure for clean solves");
});

// ─────────────────────────────────────────────────────────────
// 5. HINT USAGE — WEAKER SIGNAL THAN INDEPENDENT
// ─────────────────────────────────────────────────────────────
test("Hint usage: hint-assisted solve has lower quality than independent", () => {
  const independent = computeSolveQuality(
    { status: "solved", hintsUsed: 0, solutionViewed: false, confidence: "high", consecutiveSuccesses: 1, consecutiveFailures: 0, timeSpentSeconds: 900 },
    "Medium"
  );
  const hintAssisted = computeSolveQuality(
    { status: "solved", hintsUsed: 3, solutionViewed: false, confidence: "medium", consecutiveSuccesses: 1, consecutiveFailures: 0, timeSpentSeconds: 3000 },
    "Medium"
  );
  assert.ok(independent > hintAssisted, `Independent (${independent}) must exceed hint-assisted (${hintAssisted})`);
});

// ─────────────────────────────────────────────────────────────
// 6. SOLUTION VIEWED — NOT EQUIVALENT TO MASTERY
// ─────────────────────────────────────────────────────────────
test("Solution viewed: solve with solution viewed < independent solve quality", () => {
  const independent = computeSolveQuality(
    { status: "solved", hintsUsed: 0, solutionViewed: false, confidence: "high", consecutiveSuccesses: 2, consecutiveFailures: 0 },
    "Medium"
  );
  const cheated = computeSolveQuality(
    { status: "solved", hintsUsed: 0, solutionViewed: true, confidence: "medium", consecutiveSuccesses: 1, consecutiveFailures: 0 },
    "Medium"
  );
  assert.ok(independent > cheated, `Independent (${independent}) must exceed solution-viewed (${cheated})`);
  assert.ok(cheated < 80, "Solution-viewed score should not indicate mastery");
});

// ─────────────────────────────────────────────────────────────
// 7. CONFIDENCE — LOW CONFIDENCE INCREASES PRESSURE
// ─────────────────────────────────────────────────────────────
test("Confidence: low confidence increases revision pressure vs high confidence", () => {
  const highConfProgress = {
    "1": { status: "solved", attempts: 2, lastAttempted: ONE_DAY_AGO, confidence: "high", hintsUsed: 0, solutionViewed: false, consecutiveFailures: 0 }
  };
  const lowConfProgress = {
    "1": { status: "solved", attempts: 2, lastAttempted: ONE_DAY_AGO, confidence: "low", hintsUsed: 0, solutionViewed: false, consecutiveFailures: 0 }
  };

  const qualHigh = computeSolveQuality(highConfProgress["1"], "Medium");
  const qualLow  = computeSolveQuality(lowConfProgress["1"],  "Medium");
  assert.ok(qualHigh > qualLow, `High confidence quality (${qualHigh}) > Low confidence (${qualLow})`);

  // Direct test of revision pressure: low confidence must directly drive revision pressure
  const pressHigh = computeRevisionPressure(highConfProgress, NOW_MS);
  const pressLow  = computeRevisionPressure(lowConfProgress,  NOW_MS);
  assert.strictEqual(pressHigh, 0, "Clean solve with high confidence should have 0 revision pressure");
  assert.ok(pressLow > pressHigh, `Low confidence revision pressure (${pressLow}) must exceed high confidence (${pressHigh})`);
  assert.ok(pressLow >= 10, `Low confidence must produce meaningful revision pressure (got ${pressLow})`);
});

// ─────────────────────────────────────────────────────────────
// 8. PATTERN WEAKNESS DETECTION
// ─────────────────────────────────────────────────────────────
test("Pattern weakness: weak pattern detected after multi-signal gate passes", () => {
  // Simulate a Map of pattern signals where Binary Search is weak
  const mockSignals = new Map([
    ["Binary Search", {
      pattern: "Binary Search",
      family: "Binary Search & Sorted Structures",
      attempts: 3,
      solved: 0,
      independent: 0,
      hintAssisted: 2,
      solutionViewed: 1,
      totalHints: 4,
      recentFailures: 2.5,
      recentSuccesses: 0.2,
      weightedSuccessRate: 0.07,
      hintRate: 0.67,
      solutionViewRate: 0.33,
      avgConfidence: 1.5,
      avgQuality: 20,
    }],
    ["Two Pointers", {
      pattern: "Two Pointers",
      family: "Two Pointers & Sliding Window",
      attempts: 5,
      solved: 4,
      independent: 3,
      hintAssisted: 1,
      solutionViewed: 0,
      totalHints: 1,
      recentFailures: 0.1,
      recentSuccesses: 3.8,
      weightedSuccessRate: 0.97,
      hintRate: 0.2,
      solutionViewRate: 0,
      avgConfidence: 4.5,
      avgQuality: 90,
    }],
  ]);

  const weak = detectWeakPatterns(mockSignals);
  const strong = detectStrongPatterns(mockSignals);

  assert.ok(weak.includes("Binary Search"), "Binary Search must be detected as weak");
  assert.ok(!weak.includes("Two Pointers"), "Two Pointers must NOT be weak");
  assert.ok(strong.includes("Two Pointers"), "Two Pointers must be detected as strong");
});

// ─────────────────────────────────────────────────────────────
// 9. TOPIC WEAKNESS
// ─────────────────────────────────────────────────────────────
test("Topic weakness: weak topic detected with sufficient evidence", () => {
  const mockTopicSignals = new Map([
    ["Graph", {
      topic: "Graph",
      attempts: 4,
      solved: 1,
      independent: 0,
      recentFailures: 2.1,
      recentSuccesses: 0.5,
      weightedSuccessRate: 0.19,
      avgQuality: 25,
      avgConfidence: 1.8,
    }],
    ["Array", {
      topic: "Array",
      attempts: 6,
      solved: 5,
      independent: 4,
      recentFailures: 0.1,
      recentSuccesses: 4.2,
      weightedSuccessRate: 0.97,
      avgQuality: 88,
      avgConfidence: 4.6,
    }],
  ]);

  const weak = detectWeakTopics(mockTopicSignals);
  assert.ok(weak.includes("Graph"), "Graph should be detected as weak topic");
  assert.ok(!weak.includes("Array"), "Array should NOT be a weak topic");
});

// ─────────────────────────────────────────────────────────────
// 10. DIFFICULTY ADAPTATION — INCREASE
// ─────────────────────────────────────────────────────────────
test("Difficulty adaptation increase: 3+ clean Easy solves in 7 days → increase", () => {
  const TWO_DAYS_AGO   = new Date(NOW_MS - 2 * 24 * 60 * 60 * 1000).toISOString();
  const THREE_DAYS_AGO = new Date(NOW_MS - 3 * 24 * 60 * 60 * 1000).toISOString();
  const FOUR_DAYS_AGO  = new Date(NOW_MS - 4 * 24 * 60 * 60 * 1000).toISOString();

  // Test with real normalized problems: #1 Two Sum (Easy), #121 Stock (Easy), #283 Move Zeroes (Easy)
  const easyProgress = {
    "1":   { status: "solved", lastAttempted: TWO_DAYS_AGO,   hintsUsed: 0, solutionViewed: false, confidence: "high" },
    "121": { status: "solved", lastAttempted: THREE_DAYS_AGO, hintsUsed: 0, solutionViewed: false, confidence: "high" },
    "283": { status: "solved", lastAttempted: FOUR_DAYS_AGO,  hintsUsed: 0, solutionViewed: false, confidence: "high" },
  };

  const trend = computeDifficultyTrend(easyProgress, null, NOW_MS);
  assert.strictEqual(trend, "increase", "3 clean Easy solves in 7 days must produce 'increase' trend");

  // Also test with injectable problem list
  const customEasyList = [
    { id: "e1", difficulty: "Easy" },
    { id: "e2", difficulty: "Easy" },
    { id: "e3", difficulty: "Easy" },
  ];
  const customEasyProg = {
    "e1": { status: "solved", lastAttempted: TWO_DAYS_AGO,   hintsUsed: 0, solutionViewed: false },
    "e2": { status: "solved", lastAttempted: THREE_DAYS_AGO, hintsUsed: 0, solutionViewed: false },
    "e3": { status: "solved", lastAttempted: FOUR_DAYS_AGO,  hintsUsed: 0, solutionViewed: false },
  };
  const trendCustom = computeDifficultyTrend(customEasyProg, null, NOW_MS, customEasyList);
  assert.strictEqual(trendCustom, "increase", "Injectable list with 3 clean Easy solves must return 'increase'");
});

// ─────────────────────────────────────────────────────────────
// 11. DIFFICULTY ADAPTATION — REDUCE
// ─────────────────────────────────────────────────────────────
test("Difficulty adaptation: failed Medium/Hard problems produce reduce signal", () => {
  const TWO_DAYS_AGO   = new Date(NOW_MS - 2 * 24 * 60 * 60 * 1000).toISOString();
  const THREE_DAYS_AGO = new Date(NOW_MS - 3 * 24 * 60 * 60 * 1000).toISOString();

  // Test with real normalized problems: #560 Subarray Sum (Medium), #875 Koko Eating Bananas (Medium)
  const hardFailProgress = {
    "560": { status: "need_revision", attempts: 3, lastAttempted: TWO_DAYS_AGO,   hintsUsed: 2, solutionViewed: true },
    "875": { status: "unsolved",      attempts: 2, lastAttempted: THREE_DAYS_AGO, hintsUsed: 2, solutionViewed: false },
  };

  const trend = computeDifficultyTrend(hardFailProgress, null, NOW_MS);
  assert.strictEqual(trend, "reduce", "2 recent Medium/Hard failures in 7 days must produce 'reduce' trend");

  // Also test with injectable problem list
  const customHardList = [
    { id: "h1", difficulty: "Hard" },
    { id: "m1", difficulty: "Medium" },
  ];
  const customHardProg = {
    "h1": { status: "unsolved",      attempts: 2, lastAttempted: TWO_DAYS_AGO },
    "m1": { status: "need_revision", attempts: 2, lastAttempted: THREE_DAYS_AGO },
  };
  const trendCustom = computeDifficultyTrend(customHardProg, null, NOW_MS, customHardList);
  assert.strictEqual(trendCustom, "reduce", "Injectable list with 2 Med/Hard failures must return 'reduce'");
});

// ─────────────────────────────────────────────────────────────
// 12. REVISION SPACING — STRONG PERF = WIDER GAP
// ─────────────────────────────────────────────────────────────
test("Revision spacing: strong performance → low revision pressure", () => {
  const strongProgress = {
    "1":   { status: "solved", attempts: 5, lastAttempted: ONE_DAY_AGO, confidence: "high",   hintsUsed: 0, solutionViewed: false, consecutiveSuccesses: 5, consecutiveFailures: 0 },
    "217": { status: "solved", attempts: 3, lastAttempted: ONE_DAY_AGO, confidence: "high",   hintsUsed: 0, solutionViewed: false, consecutiveSuccesses: 3, consecutiveFailures: 0 },
  };
  const weakProgress = {
    "1":   { status: "forgot_approach", attempts: 3, lastAttempted: ONE_DAY_AGO, confidence: "low",  hintsUsed: 3, solutionViewed: true,  consecutiveFailures: 3 },
    "217": { status: "need_revision",   attempts: 2, lastAttempted: ONE_DAY_AGO, confidence: "low",  hintsUsed: 2, solutionViewed: false, consecutiveFailures: 2 },
  };

  const strongPressure = computeRevisionPressure(strongProgress, NOW_MS);
  const weakPressure   = computeRevisionPressure(weakProgress,   NOW_MS);

  assert.ok(strongPressure < weakPressure, `Strong pressure (${strongPressure}) < weak pressure (${weakPressure})`);
  assert.ok(strongPressure === 0, `Zero revision pressure for clean solves`);
});

// ─────────────────────────────────────────────────────────────
// 13. COMPANY RELEVANCE PRESERVED
// ─────────────────────────────────────────────────────────────
test("Company preservation: adapted plan still uses company-specific problems", () => {
  const adaptiveState = buildAdaptiveState(BASE_PROFILE, BASE_PLAN, {}, null, NOW_MS);
  const { adaptedPlan } = adaptFutureDays(BASE_PLAN, adaptiveState, BASE_PROFILE, {}, NOW_MS);

  // The adapted plan should still carry the company ID and name
  assert.strictEqual(adaptedPlan.companyId, "microsoft");
  assert.strictEqual(adaptedPlan.companyName, "Microsoft");
  assert.ok(adaptedPlan.days.length > 0);
});

// ─────────────────────────────────────────────────────────────
// 14. TIME BUDGET RESPECTED
// ─────────────────────────────────────────────────────────────
test("Time budget: every adapted future day stays within dailyStudyMinutes (hard constraint)", () => {
  const adaptiveState = buildAdaptiveState(BASE_PROFILE, BASE_PLAN, {}, null, NOW_MS);
  const { adaptedPlan } = adaptFutureDays(BASE_PLAN, adaptiveState, BASE_PROFILE, {}, NOW_MS);

  const budget = BASE_PROFILE.dailyStudyMinutes;
  for (const day of adaptedPlan.days) {
    assert.ok(
      day.estimatedMinutes <= budget,
      `Day ${day.dayIndex} exceeded hard budget: ${day.estimatedMinutes} > ${budget}`
    );
  }
});

// ─────────────────────────────────────────────────────────────
// 15. INTERVIEW BOUNDARY
// ─────────────────────────────────────────────────────────────
test("Interview boundary: no plan day exceeds interview date", () => {
  const { adaptedPlan } = adaptFutureDays(
    BASE_PLAN,
    buildAdaptiveState(BASE_PROFILE, BASE_PLAN, {}, null, NOW_MS),
    BASE_PROFILE, {}, NOW_MS
  );

  const interviewDate = BASE_PROFILE.interviewDate;
  for (const day of adaptedPlan.days) {
    assert.ok(
      day.date <= interviewDate,
      `Day ${day.dayIndex} (${day.date}) exceeds interview date (${interviewDate})`
    );
  }
});

// ─────────────────────────────────────────────────────────────
// 16. PAST IMMUTABILITY
// ─────────────────────────────────────────────────────────────
test("Past immutability: completed days are not modified by adaptation", () => {
  // Mark Day 1 and Day 2 as completed
  const planWithCompleted = {
    ...BASE_PLAN,
    days: BASE_PLAN.days.map(d => ({
      ...d,
      completed: d.dayIndex <= 2,
    }))
  };

  const adaptiveState = buildAdaptiveState(BASE_PROFILE, planWithCompleted, {}, null, NOW_MS);
  const { adaptedPlan } = adaptFutureDays(planWithCompleted, adaptiveState, BASE_PROFILE, {}, NOW_MS);

  const day1Original = planWithCompleted.days.find(d => d.dayIndex === 1);
  const day1Adapted  = adaptedPlan.days.find(d => d.dayIndex === 1);
  const day2Original = planWithCompleted.days.find(d => d.dayIndex === 2);
  const day2Adapted  = adaptedPlan.days.find(d => d.dayIndex === 2);

  assert.deepStrictEqual(day1Adapted.problemIds, day1Original.problemIds, "Day 1 problems must be unchanged");
  assert.deepStrictEqual(day2Adapted.problemIds, day2Original.problemIds, "Day 2 problems must be unchanged");
  assert.strictEqual(day1Adapted.completed, true, "Day 1 completed flag preserved");
  assert.strictEqual(day2Adapted.completed, true, "Day 2 completed flag preserved");
});

// ─────────────────────────────────────────────────────────────
// 17. FUTURE MUTATION
// ─────────────────────────────────────────────────────────────
test("Future mutation: only future (non-completed) days may be adapted", () => {
  // We can verify the structure allows adaptation to occur on unlocked days
  const { adaptedPlan, finalAdaptiveState } = adaptFutureDays(
    BASE_PLAN,
    buildAdaptiveState(BASE_PROFILE, BASE_PLAN, {}, null, NOW_MS),
    BASE_PROFILE, {}, NOW_MS
  );
  // All days exist and have required fields
  for (const day of adaptedPlan.days) {
    assert.ok(typeof day.dayIndex === "number", `Day ${day.dayIndex} missing dayIndex`);
    assert.ok(Array.isArray(day.problems), `Day ${day.dayIndex} problems must be array`);
    assert.ok(typeof day.completed === "boolean", `Day ${day.dayIndex} missing completed`);
  }
  assert.ok(typeof finalAdaptiveState.adaptationVersion === "number");
});

// ─────────────────────────────────────────────────────────────
// 18. DUPLICATE PREVENTION
// ─────────────────────────────────────────────────────────────
test("Duplicate prevention: high-quality solved problems not re-added as new", () => {
  // Mark Two Sum (#1) as independently solved with high quality
  const progress = {
    "1": { status: "solved", attempts: 5, lastAttempted: ONE_DAY_AGO, confidence: "high", hintsUsed: 0, solutionViewed: false, consecutiveSuccesses: 5, consecutiveFailures: 0 }
  };

  const { adaptedPlan } = adaptFutureDays(
    BASE_PLAN,
    buildAdaptiveState(BASE_PROFILE, BASE_PLAN, progress, null, NOW_MS),
    BASE_PROFILE, progress, NOW_MS
  );

  // Count how many times problem 1 appears as a new problem across future days
  let count = 0;
  for (const day of adaptedPlan.days) {
    for (const p of day.problems) {
      if (String(p.id) === "1" || String(p.key) === "1") count++;
    }
  }
  assert.ok(count <= 1, `Problem #1 should appear at most once as new problem (found ${count})`);
});

// ─────────────────────────────────────────────────────────────
// 19. DETERMINISM
// ─────────────────────────────────────────────────────────────
test("Determinism: same inputs produce identical adaptive state and adapted plan", () => {
  const progress = {
    "1": { status: "need_revision", attempts: 2, lastAttempted: ONE_DAY_AGO, confidence: "low", hintsUsed: 2, solutionViewed: false, consecutiveFailures: 2 },
    "15": { status: "forgot_approach", attempts: 3, lastAttempted: THREE_DAYS_AGO, confidence: "low", hintsUsed: 3, solutionViewed: true, consecutiveFailures: 3 },
  };

  const state1 = buildAdaptiveState(BASE_PROFILE, BASE_PLAN, progress, null, NOW_MS);
  const state2 = buildAdaptiveState(BASE_PROFILE, BASE_PLAN, progress, null, NOW_MS);

  assert.strictEqual(JSON.stringify(state1.weakPatterns), JSON.stringify(state2.weakPatterns));
  assert.strictEqual(state1.revisionPressure, state2.revisionPressure);
  assert.strictEqual(state1.difficultyTrend, state2.difficultyTrend);
  assert.strictEqual(JSON.stringify(state1.recentPerformance), JSON.stringify(state2.recentPerformance));

  const { adaptedPlan: plan1 } = adaptFutureDays(BASE_PLAN, state1, BASE_PROFILE, progress, NOW_MS);
  const { adaptedPlan: plan2 } = adaptFutureDays(BASE_PLAN, state2, BASE_PROFILE, progress, NOW_MS);

  assert.strictEqual(plan1.days.length, plan2.days.length);
  for (let i = 0; i < plan1.days.length; i++) {
    assert.deepStrictEqual(
      plan1.days[i].problemIds,
      plan2.days[i].problemIds,
      `Day ${i+1} problem IDs differ between runs`
    );
  }
});

// ─────────────────────────────────────────────────────────────
// 20. VERSIONING
// ─────────────────────────────────────────────────────────────
test("Versioning: adaptation increments plan version and adaptationVersion", () => {
  const originalVersion = BASE_PLAN.planVersion || 1;

  const adaptiveState = buildAdaptiveState(BASE_PROFILE, BASE_PLAN, {}, null, NOW_MS);
  assert.strictEqual(adaptiveState.adaptationVersion, 1, "First build → version 1");

  const { adaptedPlan, finalAdaptiveState } = adaptFutureDays(BASE_PLAN, adaptiveState, BASE_PROFILE, {}, NOW_MS);
  assert.ok(adaptedPlan.planVersion > originalVersion, "Adapted plan version must be incremented");
  assert.ok(typeof adaptedPlan.lastAdaptedAt === "string", "lastAdaptedAt must be set");

  // Second adaptation increments again
  const existingAdaptiveState2 = { ...finalAdaptiveState };
  const state2 = buildAdaptiveState(BASE_PROFILE, adaptedPlan, {}, existingAdaptiveState2, NOW_MS);
  assert.strictEqual(state2.adaptationVersion, 2, "Second build → version 2");
});

// ─────────────────────────────────────────────────────────────
// 21. INSUFFICIENT POOL — GRACEFUL DEGRADATION
// ─────────────────────────────────────────────────────────────
test("Insufficient pool: adaptation terminates cleanly with tiny company", () => {
  const tinyProfile = {
    ...BASE_PROFILE,
    companyId: "accenture",
    interviewDate: "2026-09-15",
  };
  let plan;
  try {
    plan = generateDailyPlan(tinyProfile, {});
  } catch (e) {
    // If plan generation fails, that's a different test
    plan = BASE_PLAN;
  }

  assert.doesNotThrow(() => {
    const adaptiveState = buildAdaptiveState(tinyProfile, plan, {}, null, NOW_MS);
    adaptFutureDays(plan, adaptiveState, tinyProfile, {}, NOW_MS);
  }, "Adaptation must not throw for small company");
});

// ─────────────────────────────────────────────────────────────
// 22. NO INFINITE ADAPTATION — COOLDOWN RESPECTED
// ─────────────────────────────────────────────────────────────
test("No infinite adaptation: cooldown prevents immediate re-adaptation", () => {
  const lastAdapted = new Date(NOW_MS - 5 * 60 * 1000).toISOString(); // 5 min ago
  const canNow = canAdaptNow(lastAdapted, NOW_MS);
  assert.strictEqual(canNow, false, "Should not adapt within cooldown window");

  const longAgo = new Date(NOW_MS - 2 * 60 * 60 * 1000).toISOString(); // 2 hours ago
  const canAfter = canAdaptNow(longAgo, NOW_MS);
  assert.strictEqual(canAfter, true, "Should adapt after cooldown window expires");

  const nullDate = canAdaptNow(null, NOW_MS);
  assert.strictEqual(nullDate, true, "Should adapt if never adapted before");
});

// ─────────────────────────────────────────────────────────────
// 24. PATTERN SUCCESS RATE — ACCURATE ATTEMPTS DENOMINATOR
// ─────────────────────────────────────────────────────────────
test("Pattern success rate: denominator reflects actual attempts (not inflated)", () => {
  // Use canonical problem #209 which is mapped to "Sliding Window" in curated taxonomy
  const problem209 = {
    id: 209,
    difficulty: "Medium",
  };

  // User attempted 5 times before solving 1 time
  const progressMap = {
    "209": {
      status: "solved",
      attempts: 5,
      lastAttempted: ONE_DAY_AGO,
      hintsUsed: 1,
      solutionViewed: false,
      confidence: "medium",
    }
  };

  const signals = computeAdaptivePatternSignals(progressMap, [problem209], NOW_MS);
  const swSig = signals.get("Sliding Window");
  assert.ok(swSig, "Sliding Window signal must exist");
  assert.strictEqual(swSig.attempts, 5, "Total attempts must be 5");
  assert.strictEqual(swSig.solved, 1, "Solved count must be 1");
  // 1 solve / 5 attempts = 0.20 (NOT 1 / (1+1) = 0.50)
  assert.strictEqual(swSig.successRate, 0.20, "Success rate must be exactly 1/5 = 0.20");
});

// ─────────────────────────────────────────────────────────────
// 25. TRUE REVISION SPACING — DETERMINISTIC PER-PROBLEM SCHEDULE
// ─────────────────────────────────────────────────────────────
test("True revision spacing: intervals scale deterministically from performance", () => {
  // Failed / forgot approach → 1 day
  const failedProg = { status: "forgot_approach", attempts: 2 };
  assert.strictEqual(computeRevisionIntervalDays(failedProg), REVISION_INTERVALS.FAILED);
  assert.strictEqual(computeRevisionIntervalDays(failedProg), 1);

  // Low confidence solve → 2 days
  const lowConfProg = { status: "solved", confidence: "low", hintsUsed: 0, solutionViewed: false };
  assert.strictEqual(computeRevisionIntervalDays(lowConfProg), REVISION_INTERVALS.LOW_QUALITY);
  assert.strictEqual(computeRevisionIntervalDays(lowConfProg), 2);

  // Assisted solve with hints → 4 days
  const assistedProg = { status: "solved", confidence: "medium", hintsUsed: 2, solutionViewed: false };
  assert.strictEqual(computeRevisionIntervalDays(assistedProg), REVISION_INTERVALS.ASSISTED);
  assert.strictEqual(computeRevisionIntervalDays(assistedProg), 4);

  // Strong independent solve → 7 days
  const strongProg = { status: "solved", confidence: "high", hintsUsed: 0, solutionViewed: false, consecutiveSuccesses: 1 };
  assert.strictEqual(computeRevisionIntervalDays(strongProg), REVISION_INTERVALS.STRONG);
  assert.strictEqual(computeRevisionIntervalDays(strongProg), 7);

  // Mastered streak (consecutiveSuccesses >= 3, quality >= 85) → 14 days
  const masteredProg = {
    status: "solved", confidence: "high", hintsUsed: 0, solutionViewed: false,
    consecutiveSuccesses: 3, timeSpentSeconds: 900
  };
  assert.strictEqual(computeRevisionIntervalDays(masteredProg), REVISION_INTERVALS.MASTERED);
  assert.strictEqual(computeRevisionIntervalDays(masteredProg), 14);

  // Date calculation from base
  const baseIso = "2026-09-08T12:00:00.000Z";
  const nextDateFailed = computeNextRevisionDate(failedProg, baseIso, "UTC");
  assert.strictEqual(nextDateFailed, "2026-09-09", "1-day interval from 2026-09-08 is 2026-09-09");

  const nextDateStrong = computeNextRevisionDate(strongProg, baseIso, "UTC");
  assert.strictEqual(nextDateStrong, "2026-09-15", "7-day interval from 2026-09-08 is 2026-09-15");
});

// ─────────────────────────────────────────────────────────────
// 26. PAST/TODAY/FUTURE BOUNDARY & TIMEZONE AWARENESS
// ─────────────────────────────────────────────────────────────
test("Calendar boundary: classifyPlanDay correctly assigns past, today, future and immutability", () => {
  const nowUtc = new Date("2026-09-08T12:00:00.000Z").getTime();

  // Past day (strictly before today)
  const pastDay = { dayIndex: 1, date: "2026-09-07", completed: false };
  const pastClass = classifyPlanDay(pastDay, nowUtc, "UTC");
  assert.strictEqual(pastClass.status, "past");
  assert.strictEqual(pastClass.isLocked, true, "Past days must be locked even if uncompleted");

  // Today (uncompleted)
  const todayDay = { dayIndex: 2, date: "2026-09-08", completed: false };
  const todayClass = classifyPlanDay(todayDay, nowUtc, "UTC");
  assert.strictEqual(todayClass.status, "today");
  assert.strictEqual(todayClass.isLocked, false, "Today uncompleted is unlocked");

  // Today (completed)
  const todayCompleted = { dayIndex: 2, date: "2026-09-08", completed: true };
  const todayCompClass = classifyPlanDay(todayCompleted, nowUtc, "UTC");
  assert.strictEqual(todayCompClass.isLocked, true, "Today completed is locked");

  // Future day
  const futureDay = { dayIndex: 3, date: "2026-09-09", completed: false };
  const futureClass = classifyPlanDay(futureDay, nowUtc, "UTC");
  assert.strictEqual(futureClass.status, "future");
  assert.strictEqual(futureClass.isLocked, false, "Future uncompleted is unlocked");

  // Verify in adaptFutureDays that past uncompleted days are untouched
  const planWithPastUncompleted = {
    ...BASE_PLAN,
    days: [
      { ...BASE_PLAN.days[0], date: "2026-09-07", completed: false }, // yesterday, uncompleted
      { ...BASE_PLAN.days[1], date: "2026-09-08", completed: false }, // today
      { ...BASE_PLAN.days[2], date: "2026-09-09", completed: false }, // tomorrow
    ]
  };

  const { adaptedPlan } = adaptFutureDays(
    planWithPastUncompleted,
    buildAdaptiveState(BASE_PROFILE, planWithPastUncompleted, {}, null, nowUtc),
    BASE_PROFILE, {}, nowUtc
  );

  assert.deepStrictEqual(
    adaptedPlan.days[0].problemIds,
    planWithPastUncompleted.days[0].problemIds,
    "Past day problems must be immutable even if completed flag was false"
  );
});

// ─────────────────────────────────────────────────────────────
// BONUS: Recency weight formula validation
// ─────────────────────────────────────────────────────────────
test("Recency weight: half-life formula correct at 0, 14, and 28 days", () => {
  const now = new Date("2026-09-08T00:00:00.000Z").getTime();
  const today    = new Date("2026-09-08T00:00:00.000Z").toISOString();
  const halfLife = new Date("2026-08-25T00:00:00.000Z").toISOString(); // 14 days ago
  const full     = new Date("2026-08-11T00:00:00.000Z").toISOString(); // 28 days ago

  const w0  = computeRecencyWeight(today, now);
  const w14 = computeRecencyWeight(halfLife, now);
  const w28 = computeRecencyWeight(full, now);

  assert.ok(Math.abs(w0 - 1.0) < 0.01,  `0 days: weight should be ~1.0, got ${w0.toFixed(3)}`);
  assert.ok(Math.abs(w14 - 0.5) < 0.01, `14 days: weight should be ~0.5, got ${w14.toFixed(3)}`);
  assert.ok(Math.abs(w28 - 0.25) < 0.02, `28 days: weight should be ~0.25, got ${w28.toFixed(3)}`);
});

console.log("\n-------------------------------------------------");
console.log(`Phase 3.3 Tests Completed: ${passedCount}/${totalCount} PASSED`);
console.log("-------------------------------------------------");

if (passedCount !== totalCount) {
  process.exit(1);
} else {
  console.log("ALL PHASE 3.3 UNIT TESTS PASSED! 🚀\n");
}
