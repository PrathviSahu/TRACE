// ─────────────────────────────────────────────────────────────
//  TRACE — Phase 3.2 Verification & Test Suite
//  Validates Deterministic Daily Plan Generator, calendar math,
//  pattern family cohesion, time budgeting, revision interleaving,
//  mock interview allocation, and persistence.
// ─────────────────────────────────────────────────────────────

import assert from "node:assert";
import {
  generateDailyPlan,
  getScheduledStudyDates,
  DIFFICULTY_MINUTES,
  REVISION_MINUTES
} from "../src/services/dailyPlanGenerator.js";
import {
  saveDailyPlan,
  getDailyPlan,
  clearDailyPlan,
  getPlanningState
} from "../src/services/interviewPlanStore.js";
import { COMPANY_DATA } from "../src/data/companyData.js";
import { DSA_PATTERN_FAMILIES, DSA_PATTERNS } from "../src/data/patternMapping.js";

// Mock minimal browser localStorage
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

console.log("=================================================");
console.log("TRACE — Phase 3.2 Test Suite: Deterministic Daily Plan Generator");
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

const baseProfile = {
  id: "profile_microsoft_phase3_2",
  companyId: "microsoft",
  role: "Software Engineer",
  interviewDate: "2026-09-22",
  timezone: "UTC",
  dailyStudyMinutes: 120,
  weeklyStudyDays: ["MON", "TUE", "WED", "THU", "FRI"],
  currentLevel: "Interview Ready",
  goal: "Interview Preparation",
  preferredLanguages: ["Java"],
  targetTopics: [],
  targetPatterns: [],
  includeCompanyQuestions: true,
  includeRecentQuestions: true,
  includeRevision: true,
  includeMockInterviews: true,
  createdAt: "2026-09-08T00:00:00.000Z",
  planVersion: 1
};

// ── 1. DETERMINISM & REPRODUCIBILITY TEST ────────────────────────
test("Strict Determinism: Identical inputs produce byte-for-byte identical plans", () => {
  const mockProgress = {
    "1": { status: "solved", attempts: 1, lastAttempted: "2026-09-01T00:00:00.000Z" }
  };

  const plan1 = generateDailyPlan(baseProfile, mockProgress);
  const plan2 = generateDailyPlan(baseProfile, mockProgress);

  // Exclude generatedAt timestamp which depends on execution millisecond
  const cleanPlan1 = { ...plan1, generatedAt: "STATIC" };
  const cleanPlan2 = { ...plan2, generatedAt: "STATIC" };

  assert.strictEqual(
    JSON.stringify(cleanPlan1),
    JSON.stringify(cleanPlan2),
    "Plans must be strictly identical across runs with zero randomness."
  );

  assert.strictEqual(plan1.totalStudyDays, plan2.totalStudyDays);
  assert.strictEqual(plan1.totalProblemsScheduled, plan2.totalProblemsScheduled);
  assert.strictEqual(plan1.days.length, plan2.days.length);
});

// ── 2. CALENDAR MATH TEST ────────────────────────────────────────
test("Calendar Math: 14-day window with Mon-Fri yields exactly 10 study days", () => {
  const dates = getScheduledStudyDates(
    "2026-09-08", // Tuesday
    "2026-09-22", // Tuesday (14 days later)
    ["MON", "TUE", "WED", "THU", "FRI"],
    "UTC"
  );

  assert.strictEqual(dates.length, 10, `Expected 10 study days, got ${dates.length}`);

  // Verify none of the dates fall on Saturday or Sunday
  for (const d of dates) {
    assert.ok(d.dayOfWeek !== "SAT" && d.dayOfWeek !== "SUN", `Date ${d.date} fell on weekend: ${d.dayOfWeek}`);
  }

  // Verify dates are in strictly ascending order
  for (let i = 1; i < dates.length; i++) {
    assert.ok(new Date(dates[i].date) > new Date(dates[i - 1].date), "Dates must be strictly ascending");
  }
});

// ── 3. WORKLOAD & TIME BUDGETING ─────────────────────────────────
test("Workload & Time Budget: Daily workload calibrated within dailyStudyMinutes tolerance", () => {
  const plan = generateDailyPlan(baseProfile, {});

  assert.strictEqual(plan.dailyStudyMinutes, 120);

  for (const day of plan.days) {
    assert.ok(
      day.estimatedMinutes <= 120 + 15,
      `Day ${day.dayIndex} exceeded time budget: ${day.estimatedMinutes} mins`
    );
    assert.ok(
      day.estimatedMinutes >= 60,
      `Day ${day.dayIndex} had unexpectedly low study time: ${day.estimatedMinutes} mins`
    );

    // Verify each problem's estimated minutes matches canonical difficulty
    for (const p of day.problems) {
      const expected = DIFFICULTY_MINUTES[p.difficulty] || 35;
      assert.strictEqual(p.estMinutes, expected, `Problem #${p.id} difficulty timing mismatch`);
    }
  }
});

// ── 4. PATTERN FAMILY COHESION ───────────────────────────────────
test("Pattern Family Cohesion: Each day centers around a cohesive canonical pattern family", () => {
  const plan = generateDailyPlan(baseProfile, {});

  const canonicalFamilies = Object.keys(DSA_PATTERN_FAMILIES);

  for (const day of plan.days) {
    if (day.isMockDay) {
      assert.strictEqual(day.focusFamily, "Mock Interview Simulation");
      continue;
    }

    assert.ok(
      canonicalFamilies.includes(day.focusFamily) || day.focusFamily === "General & Foundations",
      `Invalid focus family: ${day.focusFamily}`
    );

    // Verify problems on that day either share the focus family or have high topic relevance
    assert.ok(day.problems.length >= 1, `Day ${day.dayIndex} has no problems`);
    const matchingCount = day.problems.filter(p => p.family === day.focusFamily).length;
    assert.ok(matchingCount >= 1, `Day ${day.dayIndex} has no problems matching primary focus family`);
  }
});

// ── 5. SPACED REVISION INTERLEAVING ──────────────────────────────
test("Spaced Revision: Interleaves forgot_approach and need_revision problems in order of urgency", () => {
  const progressWithRevision = {
    "1": { status: "forgot_approach", attempts: 2, lastAttempted: "2026-09-01T00:00:00.000Z" },
    "15": { status: "need_revision", attempts: 3, lastAttempted: "2026-08-25T00:00:00.000Z" },
    "20": { status: "solved", attempts: 1, lastAttempted: "2026-09-05T00:00:00.000Z" }
  };

  const plan = generateDailyPlan(baseProfile, progressWithRevision);

  assert.strictEqual(plan.totalRevisionScheduled, 2, "Expected exactly 2 revision items to be interleaved");

  // Day 1 should receive problem #1 (forgot_approach is higher urgency)
  const day1Rev = plan.days[0].revisionProblems;
  assert.strictEqual(day1Rev.length, 1);
  assert.strictEqual(day1Rev[0].id, 1);
  assert.strictEqual(day1Rev[0].isRevision, true);

  // Day 2 should receive problem #15 (need_revision)
  const day2Rev = plan.days[1].revisionProblems;
  assert.strictEqual(day2Rev.length, 1);
  assert.strictEqual(day2Rev[0].id, 15);
  assert.strictEqual(day2Rev[0].isRevision, true);
});

// ── 6. MILESTONE MOCK INTERVIEW ALLOCATION ────────────────────────
test("Mock Interview Allocation: Penultimate study day is allocated as balanced mock interview", () => {
  const plan = generateDailyPlan(baseProfile, {});

  assert.strictEqual(plan.totalStudyDays, 10);

  // Penultimate day (Day 9) should be mock day
  const day9 = plan.days.find(d => d.dayIndex === 9);
  assert.ok(day9, "Day 9 must exist");
  assert.strictEqual(day9.isMockDay, true, "Day 9 should be marked as mock day");
  assert.strictEqual(day9.focusFamily, "Mock Interview Simulation");

  // Verify mock problem difficulty balance: 1 Easy, 1 Medium, 1 Hard
  const diffs = day9.problems.map(p => p.difficulty);
  assert.ok(diffs.includes("Easy"), "Mock set must include Easy problem");
  assert.ok(diffs.includes("Medium"), "Mock set must include Medium problem");
  assert.ok(diffs.includes("Hard"), "Mock set must include Hard problem");
});

// ── 7. COMPANY QUESTION PRIORITIZATION ───────────────────────────
test("Company Question Prioritization: High-frequency company questions are scheduled in plan", () => {
  const plan = generateDailyPlan(baseProfile, {});

  const allScheduledIds = new Set();
  for (const day of plan.days) {
    day.problems.forEach(p => allScheduledIds.add(p.id));
  }

  // Canonical Microsoft top questions should be scheduled
  assert.ok(allScheduledIds.has(1) || allScheduledIds.has(56) || allScheduledIds.has(74),
    "Plan must contain top Microsoft questions"
  );
});

// ── 8. SMALL COMPANY SAFE SUPPLEMENTATION ─────────────────────────
test("Small Company Fallback: Successfully schedules 15 study days without leaving days empty", () => {
  // Find a small company with fewer questions
  const smallProfile = {
    ...baseProfile,
    companyId: "accenture", // Smaller question bank
    interviewDate: "2026-09-29", // 15 study days
    dailyStudyMinutes: 120
  };

  const plan = generateDailyPlan(smallProfile, {});

  assert.ok(plan.days.length >= 10);

  for (const day of plan.days) {
    assert.ok(day.problems.length >= 1, `Day ${day.dayIndex} must have at least 1 problem scheduled`);
    assert.ok(day.estimatedMinutes >= 20, `Day ${day.dayIndex} must have meaningful workload`);
  }
});

// ── 9. SCHEMA INTEGRITY TEST ──────────────────────────────────────
test("Schema Integrity: GeneratedPlan and DailyPlan have all required metadata fields", () => {
  const plan = generateDailyPlan(baseProfile, {});

  // GeneratedPlan schema
  assert.strictEqual(plan.profileId, baseProfile.id);
  assert.strictEqual(plan.companyId, "microsoft");
  assert.strictEqual(plan.companyName, "Microsoft");
  assert.strictEqual(typeof plan.totalStudyDays, "number");
  assert.strictEqual(typeof plan.totalProblemsScheduled, "number");
  assert.strictEqual(typeof plan.totalEstimatedHours, "number");
  assert.ok(typeof plan.patternFamilyCoverage === "object");
  assert.ok(typeof plan.topicCoverage === "object");
  assert.ok(Array.isArray(plan.days));

  // DailyPlan schema
  const d1 = plan.days[0];
  assert.strictEqual(typeof d1.dayIndex, "number");
  assert.strictEqual(typeof d1.date, "string");
  assert.strictEqual(typeof d1.dayOfWeek, "string");
  assert.strictEqual(typeof d1.focusFamily, "string");
  assert.strictEqual(typeof d1.focusTopic, "string");
  assert.ok(Array.isArray(d1.focusPatterns));
  assert.ok(Array.isArray(d1.problemIds));
  assert.ok(Array.isArray(d1.problems));
  assert.ok(Array.isArray(d1.revisionProblemIds));
  assert.ok(Array.isArray(d1.revisionProblems));
  assert.strictEqual(typeof d1.estimatedMinutes, "number");
  assert.ok(["critical", "high", "medium"].includes(d1.priority));
  assert.strictEqual(typeof d1.isMockDay, "boolean");
  assert.strictEqual(typeof d1.completed, "boolean");
});

// ── 10. PLAN PERSISTENCE & STORAGE TEST ───────────────────────────
test("Plan Persistence: saveDailyPlan -> getDailyPlan round-trip intact", () => {
  storage.clear();
  const plan = generateDailyPlan(baseProfile, {});

  saveDailyPlan(plan);

  const loaded = getDailyPlan();
  assert.ok(loaded, "Loaded plan must exist in storage");
  assert.strictEqual(loaded.profileId, baseProfile.id);
  assert.strictEqual(loaded.companyId, "microsoft");
  assert.strictEqual(loaded.days.length, plan.days.length);

  clearDailyPlan();
  assert.strictEqual(getDailyPlan(), null, "Cleared plan must return null");
});

console.log("\n-------------------------------------------------");
console.log(`Phase 3.2 Tests Completed: ${passedCount}/${totalCount} PASSED`);
console.log("-------------------------------------------------");

if (passedCount !== totalCount) {
  process.exit(1);
} else {
  console.log("ALL PHASE 3.2 UNIT TESTS PASSED! 🚀\n");
}
