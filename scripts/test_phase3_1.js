// ─────────────────────────────────────────────────────────────
//  TRACE — Phase 3.1 Verification & Test Suite
//  Validates InterviewProfile schema, validation rules, derived metrics,
//  and performance models against acceptance criteria.
// ─────────────────────────────────────────────────────────────

import assert from "node:assert";
import {
  validateInterviewProfile,
  calculateDaysRemaining,
  calculateWeeklyStudyHours,
  saveInterviewProfile,
  getInterviewProfile,
  getPlanningState,
  WEEK_DAYS,
  PREPARATION_LEVELS,
  PREPARATION_GOALS,
  PROFILE_STORAGE_KEY,
  PLANNING_STATE_KEY
} from "../src/services/interviewPlanStore.js";
import {
  getProblemPerformance,
  computePatternPerformance,
  computeTopicPerformance,
  updateProblemProgress,
  getAllProgress
} from "../src/services/progressStore.js";
import { COMPANY_DATA } from "../src/data/companyData.js";
import { DSA_TOPICS, DSA_PATTERNS, DSA_PATTERN_FAMILIES } from "../src/data/patternMapping.js";
import { SUPPORTED_LANGUAGES } from "../src/services/aiService.js";

// Mock minimal browser localStorage in Node environment
const storage = new Map();
global.localStorage = {
  getItem: (key) => storage.get(key) || null,
  setItem: (key, val) => storage.set(key, String(val)),
  removeItem: (key) => storage.delete(key),
  clear: () => storage.clear()
};
global.window = {
  dispatchEvent: () => true
};

function getFutureDate(daysAhead) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split("T")[0];
}

function getPastDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
}

console.log("=================================================");
console.log("TRACE — Phase 3.1 Test Suite: Interview Setup & Planning Model");
console.log("=================================================\n");

let passedCount = 0;
let totalCount = 0;

function test(name, fn) {
  totalCount++;
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`  ✗ ${name}:`, err.message);
  }
}

// ── 1. PROFILE CREATION & VALIDATION ────────────────────────────
test("Valid Microsoft profile passes validation", () => {
  const validProfile = {
    companyId: "microsoft",
    role: "Software Engineer",
    interviewDate: getFutureDate(14),
    timezone: "UTC",
    dailyStudyMinutes: 120,
    weeklyStudyDays: ["MON", "TUE", "WED", "THU", "FRI"],
    currentLevel: "Interview Ready",
    goal: "Interview Preparation",
    preferredLanguages: ["Java"],
    targetTopics: ["Array", "Linked List", "Dynamic Programming"],
    targetPatterns: ["Two Pointers", "Sliding Window", "Prefix Sum"],
    includeCompanyQuestions: true,
    includeRecentQuestions: true,
    includeRevision: true,
    includeMockInterviews: false
  };

  const res = validateInterviewProfile(validProfile);
  assert.strictEqual(res.isValid, true, `Validation failed: ${res.errors.join(", ")}`);
  assert.strictEqual(res.errors.length, 0);
});

// ── 2. DATE VALIDATION & DERIVED DAYS ───────────────────────────
test("Past interview date fails validation", () => {
  const pastProfile = {
    companyId: "microsoft",
    role: "Software Engineer",
    interviewDate: getPastDate(2),
    timezone: "UTC",
    dailyStudyMinutes: 120,
    weeklyStudyDays: ["MON", "TUE"],
    preferredLanguages: ["Java"]
  };

  const res = validateInterviewProfile(pastProfile);
  assert.strictEqual(res.isValid, false);
  assert.ok(res.errors.some(e => e.includes("future")));
});

test("Derived daysRemaining calculates dynamically and is not static", () => {
  const futureDate14 = getFutureDate(14);
  const futureDate30 = getFutureDate(30);

  const days14 = calculateDaysRemaining(futureDate14, "UTC");
  const days30 = calculateDaysRemaining(futureDate30, "UTC");

  assert.strictEqual(days14, 14, `Expected 14 days, got ${days14}`);
  assert.strictEqual(days30, 30, `Expected 30 days, got ${days30}`);

  // Test invalid input handling
  assert.strictEqual(calculateDaysRemaining(null), null);
  assert.strictEqual(calculateDaysRemaining("invalid-date"), null);
});

// ── 3. STUDY TIME VALIDATION ────────────────────────────────────
test("Study time: 0 fails, 120 passes", () => {
  const zeroTimeProfile = {
    companyId: "microsoft",
    role: "Software Engineer",
    interviewDate: getFutureDate(14),
    dailyStudyMinutes: 0,
    weeklyStudyDays: ["MON"],
    preferredLanguages: ["Java"]
  };
  const resZero = validateInterviewProfile(zeroTimeProfile);
  assert.strictEqual(resZero.isValid, false);
  assert.ok(resZero.errors.some(e => e.includes("Daily study time")));

  const validTimeProfile = {
    ...zeroTimeProfile,
    dailyStudyMinutes: 120
  };
  const resValid = validateInterviewProfile(validTimeProfile);
  assert.strictEqual(resValid.isValid, true);
});

// ── 4. STUDY DAYS VALIDATION ────────────────────────────────────
test("Study days: empty array fails, [MON, TUE] passes", () => {
  const emptyDaysProfile = {
    companyId: "microsoft",
    role: "Software Engineer",
    interviewDate: getFutureDate(14),
    dailyStudyMinutes: 60,
    weeklyStudyDays: [],
    preferredLanguages: ["Java"]
  };
  const resEmpty = validateInterviewProfile(emptyDaysProfile);
  assert.strictEqual(resEmpty.isValid, false);
  assert.ok(resEmpty.errors.some(e => e.includes("At least one study day")));

  const validDaysProfile = {
    ...emptyDaysProfile,
    weeklyStudyDays: ["MON", "TUE"]
  };
  const resValid = validateInterviewProfile(validDaysProfile);
  assert.strictEqual(resValid.isValid, true);

  const weeklyHours = calculateWeeklyStudyHours(120, ["MON", "TUE", "WED", "THU", "FRI"]);
  assert.strictEqual(weeklyHours, 10);
});

// ── 5. COMPANY REFERENCE VERIFICATION ───────────────────────────
test("Company reference: valid company passes, non-existent fails", () => {
  assert.ok(COMPANY_DATA["microsoft"], "Microsoft must exist in COMPANY_DATA");
  assert.ok(COMPANY_DATA["google"], "Google must exist in COMPANY_DATA");

  const validComp = {
    companyId: "microsoft",
    role: "Software Engineer",
    interviewDate: getFutureDate(14),
    dailyStudyMinutes: 60,
    weeklyStudyDays: ["MON"],
    preferredLanguages: ["Java"]
  };
  assert.strictEqual(validateInterviewProfile(validComp).isValid, true);

  const invalidComp = {
    ...validComp,
    companyId: "nonexistent-firm-xyz-404"
  };
  const res = validateInterviewProfile(invalidComp);
  assert.strictEqual(res.isValid, false);
  assert.ok(res.errors.some(e => e.includes("invalid or not in existing company dataset")));
});

// ── 6. LANGUAGE REFERENCE VERIFICATION ──────────────────────────
test("Language reference: Java/Python pass, unsupported fails", () => {
  const validLang = {
    companyId: "microsoft",
    role: "Software Engineer",
    interviewDate: getFutureDate(14),
    dailyStudyMinutes: 60,
    weeklyStudyDays: ["MON"],
    preferredLanguages: ["Java"]
  };
  assert.strictEqual(validateInterviewProfile(validLang).isValid, true);

  const invalidLang = {
    ...validLang,
    preferredLanguages: ["Haskell", "Fortran"]
  };
  const res = validateInterviewProfile(invalidLang);
  assert.strictEqual(res.isValid, false);
  assert.ok(res.errors.some(e => e.includes("not supported by TRACE")));
});

// ── 7. TOPIC TAXONOMY REFERENCE ─────────────────────────────────
test("Topic reference: existing topics pass, fake topic fails", () => {
  const validTopic = {
    companyId: "microsoft",
    role: "Software Engineer",
    interviewDate: getFutureDate(14),
    dailyStudyMinutes: 60,
    weeklyStudyDays: ["MON"],
    preferredLanguages: ["Java"],
    targetTopics: ["Array", "Linked List"]
  };
  assert.strictEqual(validateInterviewProfile(validTopic).isValid, true);

  const invalidTopic = {
    ...validTopic,
    targetTopics: ["Quantum Computing Teleportation"]
  };
  const res = validateInterviewProfile(invalidTopic);
  assert.strictEqual(res.isValid, false);
  assert.ok(res.errors.some(e => e.includes("Invalid topics")));
});

// ── 8. PATTERN TAXONOMY REFERENCE ───────────────────────────────
test("Pattern reference: existing canonical patterns pass, fake pattern fails", () => {
  const validPat = {
    companyId: "microsoft",
    role: "Software Engineer",
    interviewDate: getFutureDate(14),
    dailyStudyMinutes: 60,
    weeklyStudyDays: ["MON"],
    preferredLanguages: ["Java"],
    targetPatterns: ["Two Pointers", "Sliding Window"]
  };
  assert.strictEqual(validateInterviewProfile(validPat).isValid, true);

  const invalidPat = {
    ...validPat,
    targetPatterns: ["Magic Heuristic Shuffler"]
  };
  const res = validateInterviewProfile(invalidPat);
  assert.strictEqual(res.isValid, false);
  assert.ok(res.errors.some(e => e.includes("Invalid patterns")));
});

// ── 9. PERSISTENCE ROUND-TRIP ───────────────────────────────────
test("Persistence round-trip: saveInterviewProfile -> reload profile intact", () => {
  storage.clear();
  const profileToSave = {
    companyId: "microsoft",
    role: "Principal Backend Engineer",
    interviewDate: getFutureDate(21),
    timezone: "America/New_York",
    dailyStudyMinutes: 90,
    weeklyStudyDays: ["MON", "WED", "FRI"],
    currentLevel: "Big Tech Ready",
    goal: "Company-Specific Preparation",
    preferredLanguages: ["Java"],
    targetTopics: ["Tree", "Graph"],
    targetPatterns: ["Two Pointers"],
    includeCompanyQuestions: true,
    includeRecentQuestions: true,
    includeRevision: true,
    includeMockInterviews: true
  };

  const { profile, planningState } = saveInterviewProfile(profileToSave);
  assert.ok(profile.id.startsWith("profile_microsoft_"));
  assert.strictEqual(planningState.status, "active");
  assert.strictEqual(planningState.planVersion, 1);
  assert.strictEqual(planningState.planEndDate, profileToSave.interviewDate);

  // Reload from storage
  const loadedProfile = getInterviewProfile();
  const loadedPlanning = getPlanningState();

  assert.strictEqual(loadedProfile.companyId, "microsoft");
  assert.strictEqual(loadedProfile.role, "Principal Backend Engineer");
  assert.strictEqual(loadedProfile.dailyStudyMinutes, 90);
  assert.deepStrictEqual(loadedProfile.weeklyStudyDays, ["MON", "WED", "FRI"]);
  assert.strictEqual(loadedPlanning.status, "active");
  assert.strictEqual(loadedPlanning.planVersion, 1);
});

// ── 10. VERSIONING ON CONFIGURATION MUTATION ─────────────────────
test("Planning state version bumps when core parameters change", () => {
  storage.clear();
  const initial = {
    companyId: "microsoft",
    role: "Software Engineer",
    interviewDate: getFutureDate(14),
    dailyStudyMinutes: 120,
    weeklyStudyDays: ["MON", "TUE"],
    preferredLanguages: ["Java"]
  };
  const res1 = saveInterviewProfile(initial);
  assert.strictEqual(res1.planningState.planVersion, 1);

  // Change company to google -> triggers planVersion bump
  const updated = {
    ...initial,
    companyId: "google",
    interviewDate: getFutureDate(28)
  };
  const res2 = saveInterviewProfile(updated);
  assert.strictEqual(res2.planningState.planVersion, 2, "Expected planVersion to increment to 2");
});

// ── 11. USER PERFORMANCE MODEL EXTENSION ─────────────────────────
test("ProblemPerformance model returns complete schema with backward compatibility", () => {
  const pPerf = getProblemPerformance(1);
  assert.strictEqual(pPerf.problemId, "1");
  assert.strictEqual(pPerf.status, "unsolved");
  assert.strictEqual(pPerf.solved, false);
  assert.strictEqual(pPerf.timeSpentSeconds, 0);
  assert.strictEqual(pPerf.hintsUsed, 0);
  assert.strictEqual(pPerf.solutionViewed, false);
  assert.strictEqual(pPerf.reviewStatus, "none");
  assert.strictEqual(pPerf.consecutiveSuccesses, 0);
  assert.strictEqual(pPerf.consecutiveFailures, 0);

  // Update progress to solved with telemetry
  updateProblemProgress(1, {
    status: "solved",
    confidence: "high",
    timeSpentSeconds: 420,
    hintsUsed: 1,
    solutionViewed: false
  });

  const pPerfSolved = getProblemPerformance(1);
  assert.strictEqual(pPerfSolved.status, "solved");
  assert.strictEqual(pPerfSolved.solved, true);
  assert.strictEqual(pPerfSolved.confidence, "high");
  assert.strictEqual(pPerfSolved.timeSpentSeconds, 420);
  assert.strictEqual(pPerfSolved.hintsUsed, 1);
  assert.strictEqual(pPerfSolved.consecutiveSuccesses, 1);
  assert.strictEqual(pPerfSolved.reviewStatus, "completed");
  assert.ok(pPerfSolved.lastSolvedAt !== null);
});

// ── 12. PATTERN PERFORMANCE FOUNDATION ──────────────────────────
test("computePatternPerformance returns canonical families and deterministic metrics", () => {
  const patPerfs = computePatternPerformance();
  assert.ok(Array.isArray(patPerfs));
  assert.ok(patPerfs.length >= 75, `Expected at least 75 patterns, got ${patPerfs.length}`);

  const twoPointers = patPerfs.find(p => p.pattern === "Two Pointers");
  assert.ok(twoPointers, "Two Pointers must be present");
  assert.strictEqual(twoPointers.family, "Two Pointers & Sliding Window");
  assert.strictEqual(typeof twoPointers.attempts, "number");
  assert.strictEqual(typeof twoPointers.solved, "number");
  assert.strictEqual(typeof twoPointers.masteryScore, "number");
  assert.strictEqual(typeof twoPointers.successRate, "number");
});

// ── 13. TOPIC PERFORMANCE FOUNDATION ────────────────────────────
test("computeTopicPerformance returns all canonical DSA topics and metrics", () => {
  const topicPerfs = computeTopicPerformance();
  assert.ok(Array.isArray(topicPerfs));
  assert.ok(topicPerfs.length >= 15, `Expected at least 15 topics, got ${topicPerfs.length}`);

  const arrayTopic = topicPerfs.find(t => t.topic === "Array");
  assert.ok(arrayTopic, "Array topic must be present");
  assert.strictEqual(typeof arrayTopic.attempts, "number");
  assert.strictEqual(typeof arrayTopic.solved, "number");
  assert.strictEqual(typeof arrayTopic.masteryScore, "number");
});

console.log("\n-------------------------------------------------");
console.log(`Phase 3.1 Tests Completed: ${passedCount}/${totalCount} PASSED`);
console.log("-------------------------------------------------");

if (passedCount !== totalCount) {
  process.exit(1);
} else {
  console.log("ALL PHASE 3.1 UNIT TESTS PASSED! 🚀\n");
}
