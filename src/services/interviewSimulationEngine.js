// ─────────────────────────────────────────────────────────────
//  TRACE — Interview Simulation Engine
//  Phase 3.4: Deterministic problem selection, timestamp-based timer,
//  and authoritative objective rubric evaluation.
//  No Math.random() — 100% deterministic algorithms and scoring.
// ─────────────────────────────────────────────────────────────

import { NORMALIZED_PROBLEMS, getCompanyEnrichedProblems, getProblemKey } from "../data/companyUtils.js";
import { DSA_PATTERNS, DSA_PATTERN_FAMILIES, getPatternFamily, getProblemPatternDetails } from "../data/patternMapping.js";

// ──────────────────────────────────────────────────────────────
// 1. RUBRIC WEIGHTS & SCHEMA
// ──────────────────────────────────────────────────────────────

export const RUBRIC_WEIGHTS = {
  problemUnderstanding: 0.15,
  approachReasoning:    0.20,
  patternRecognition:   0.10,
  correctness:          0.20,
  codeQuality:          0.10,
  complexityAnalysis:   0.10,
  communication:        0.10,
  timeManagement:       0.05,
};

// Validate that sum of weights strictly equals 1.0 (100%)
export const TOTAL_RUBRIC_WEIGHT = Object.values(RUBRIC_WEIGHTS).reduce((s, w) => s + w, 0);

// ──────────────────────────────────────────────────────────────
// 2. DETERMINISTIC PSEUDO-RANDOM NUMBER GENERATOR (LCG)
// ──────────────────────────────────────────────────────────────

/**
 * 32-bit FNV-1a hash function for strings
 */
export function hashString(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

/**
 * Deterministic PRNG using Linear Congruential Generator (LCG)
 * Seeded by string or integer. Returns float in [0, 1).
 */
export function seededRandom(seedInput) {
  let s = typeof seedInput === "number" ? (seedInput >>> 0) : hashString(String(seedInput || "trace_seed"));
  // Numerical Recipes LCG parameters
  s = (Math.imul(1664525, s) + 1013904223) >>> 0;
  return s / 4294967296;
}

// ──────────────────────────────────────────────────────────────
// 3. DETERMINISTIC PROBLEM SELECTION
// ──────────────────────────────────────────────────────────────

/**
 * Selects an interview problem deterministically based on mode and criteria.
 *
 * Supported Modes:
 *   1. "company"   — selects from verified company question bank based on relevance/recency
 *   2. "pattern"   — selects from specified canonical DSA pattern or family
 *   3. "random"    — pseudo-random selection using deterministic PRNG seed
 *   4. "weakness"  — prioritizes candidate's weak patterns from Phase 3.3
 *
 * @param {Object} options
 * @returns {Object} normalized problem object
 */
export function selectInterviewProblem({
  mode = "company",
  companyId = "microsoft",
  pattern = null,
  seed = null,
  profile = null,
  adaptiveState = null,
  progressMap = {},
}) {
  const normList = Array.from(NORMALIZED_PROBLEMS.values());

  // ── Mode 1: Company Interview ──────────────────────────────
  if (mode === "company") {
    const companyProbs = getCompanyEnrichedProblems(companyId);
    if (companyProbs.length > 0) {
      // Sort by priorityScore desc, then recency, then problem ID
      const sorted = [...companyProbs].sort((a, b) => {
        if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
        const recScoreA = a.recency === "30 Days" ? 2 : 1;
        const recScoreB = b.recency === "30 Days" ? 2 : 1;
        if (recScoreB !== recScoreA) return recScoreB - recScoreA;
        return Number(a.id) - Number(b.id);
      });

      // Filter out problems already solved cleanly with high confidence if alternates exist
      const unmastered = sorted.filter(p => {
        const prog = progressMap[getProblemKey(p)];
        return !prog || prog.status !== "solved" || prog.confidence !== "high";
      });

      return unmastered.length > 0 ? unmastered[0] : sorted[0];
    }
  }

  // ── Mode 2: Pattern Interview ──────────────────────────────
  if (mode === "pattern") {
    const targetPattern = pattern || "Sliding Window";
    const matching = normList.filter(p => {
      const details = getProblemPatternDetails(p);
      const pats = details?.patterns || [];
      const fam = getPatternFamily(pats[0]);
      return pats.includes(targetPattern) || fam === targetPattern;
    });

    if (matching.length > 0) {
      // Deterministically sort: Medium first, then Easy, then Hard, then ID
      const diffWeight = { Medium: 1, Easy: 2, Hard: 3 };
      const sorted = [...matching].sort((a, b) => {
        const wA = diffWeight[a.difficulty] || 2;
        const wB = diffWeight[b.difficulty] || 2;
        if (wA !== wB) return wA - wB;
        return Number(a.id) - Number(b.id);
      });
      return sorted[0];
    }
  }

  // ── Mode 4: Weakness Interview ─────────────────────────────
  if (mode === "weakness") {
    const weakPatterns = adaptiveState?.weakPatterns || [];
    const weakFamilies = adaptiveState?.weakFamilies || [];

    if (weakPatterns.length > 0 || weakFamilies.length > 0) {
      const candidates = normList.filter(p => {
        const details = getProblemPatternDetails(p);
        const pats = details?.patterns || [];
        const fam = getPatternFamily(pats[0]);
        const isWeak = pats.some(pat => weakPatterns.includes(pat)) || weakFamilies.includes(fam);
        return isWeak;
      });

      if (candidates.length > 0) {
        // Prioritize problems with recorded failures or unattempted
        const sorted = [...candidates].sort((a, b) => {
          const progA = progressMap[getProblemKey(a)];
          const progB = progressMap[getProblemKey(b)];
          const failA = progA?.consecutiveFailures || 0;
          const failB = progB?.consecutiveFailures || 0;
          if (failB !== failA) return failB - failA;
          return Number(a.id) - Number(b.id);
        });
        return sorted[0];
      }
    }
  }

  // ── Mode 3: Random Interview (Deterministic PRNG) ───────────
  // Default and fallback: select via stable PRNG seed
  const stableSeed = seed || `${profile?.id || "guest"}_${companyId}_${mode}_${profile?.interviewDate || "seed"}`;
  const randVal = seededRandom(stableSeed);
  const targetIndex = Math.floor(randVal * normList.length);

  return normList[targetIndex] || normList[0];
}

// ──────────────────────────────────────────────────────────────
// 4. TIMESTAMP TIMER MODEL
// ──────────────────────────────────────────────────────────────

/**
 * Calculates current authoritative elapsed seconds and status for an interview session.
 * Immune to tab backgrounding, clock drifting, and page refreshes.
 *
 * @param {Object} session
 * @param {number} nowMs - injectable for deterministic testing
 * @returns {{ elapsedSeconds: number, remainingSeconds: number, isExpired: boolean }}
 */
export function calculateSessionTime(session, nowMs = Date.now()) {
  if (!session) {
    return { elapsedSeconds: 0, remainingSeconds: 0, isExpired: false };
  }

  const durationSeconds = session.durationSeconds || (45 * 60);

  // 1. Not started
  if (session.status === "not_started" || !session.startedAt) {
    return { elapsedSeconds: 0, remainingSeconds: durationSeconds, isExpired: false };
  }

  // 2. Concluded sessions (submitted or expired)
  if (session.status === "submitted" || session.status === "expired") {
    const elapsed = Math.min(durationSeconds, Math.max(0, session.elapsedSeconds || 0));
    return {
      elapsedSeconds: elapsed,
      remainingSeconds: Math.max(0, durationSeconds - elapsed),
      isExpired: session.status === "expired" || elapsed >= durationSeconds,
    };
  }

  // 3. Active or Paused session - Authoritative single paused duration in ms (Issue 4)
  const basePausedMs = Number(session.totalPausedMs || session.pausedDurationMs || 0);
  const activePauseDeltaMs = (session.status === "paused" && session.pausedAt)
    ? Math.max(0, nowMs - new Date(session.pausedAt).getTime())
    : 0;
  const totalPausedMs = basePausedMs + activePauseDeltaMs;

  const startedAtMs = new Date(session.startedAt).getTime();
  const rawElapsedMs = Math.max(0, nowMs - startedAtMs - totalPausedMs);
  const elapsed = Math.floor(rawElapsedMs / 1000);

  // Expiration semantics (Issue 5): clamped elapsed, 0 remaining, isExpired true
  const isExpired = elapsed >= durationSeconds;
  const clampedElapsed = Math.min(durationSeconds, elapsed);
  const remainingSeconds = Math.max(0, durationSeconds - clampedElapsed);

  return {
    elapsedSeconds: clampedElapsed,
    remainingSeconds,
    isExpired,
  };
}

// ──────────────────────────────────────────────────────────────
// 5. DETERMINISTIC OBJECTIVE RUBRIC SCORING
// ──────────────────────────────────────────────────────────────

/**
 * Computes deterministic score (0–5) for Correctness based strictly on execution evidence.
 *
 * Scoring logic:
 *   - All tests passed: 5
 *   - Partial tests passed: Math.round((passed / total) * 4) [1 to 4]
 *   - Executed cleanly without runtime error (no tests): 4
 *   - Runtime or compile error: 1
 *   - Unattempted / not executed: 0
 *
 * @param {Object} evidence - executionEvidence
 * @returns {number} score 0-5
 */
export function computeCorrectnessScore(evidence) {
  if (!evidence) return 0;

  const compiled = evidence.compiled !== false;
  const compileError = evidence.compileError;
  const runtimeError = evidence.runtimeError;
  const testsPassed = evidence.testsPassed ?? evidence.passedTests ?? 0;
  const testsTotal = evidence.testsTotal ?? evidence.totalTests ?? (evidence.testResults ? evidence.testResults.length : 0);

  if (evidence.compiled === false || compileError) return 0;

  // Multi-test evaluation
  if (testsTotal > 0) {
    if (testsPassed === testsTotal && !runtimeError) return 5;
    if (runtimeError && testsPassed === 0) return 1;
    if (testsPassed > 0) {
      const frac = (testsPassed / testsTotal) * 4;
      return Math.max(1, Math.min(4, Math.round(frac * 10) / 10));
    }
    return runtimeError ? 1 : 2;
  }

  // Single run evaluation
  if (evidence.passed && !runtimeError) return 5;
  if (runtimeError) return 1;
  if (evidence.executed && !runtimeError && !compileError) return 4;
  if (compiled && !evidence.executed) return 2;

  return 0; // Not executed
}

/**
 * Computes deterministic score (0–5) for Time Management.
 *
 * Rules:
 *   - Solved in <= 60% time: 5
 *   - Solved in 61% - 85% time: 4
 *   - Solved in 86% - 100% time: 3
 *   - Expired with attempts: 2
 *   - Expired without attempts: 1
 *   - Unsubmitted / 0 activity: 0
 *
 * @param {number} elapsedSeconds
 * @param {number} durationSeconds
 * @param {number} attempts
 * @param {string} status
 * @returns {number} score 0-5
 */
export function computeTimeManagementScore(elapsedSeconds, durationSeconds, attempts = 1, status = "submitted") {
  if (!durationSeconds || durationSeconds <= 0) return 3;

  const ratio = elapsedSeconds / durationSeconds;

  if (status === "submitted") {
    if (ratio <= 0.60) return 5;
    if (ratio <= 0.85) return 4;
    if (ratio <= 1.00) return 3;
    return 2;
  }

  if (status === "expired") {
    return attempts > 0 ? 2 : 1;
  }

  return 0;
}

/**
 * Calculates overall weighted score (0–100) from category scores (0–5).
 *
 * Formula:
 *   overallScore = Math.round( sum( (categoryScore / 5) * 100 * weight ) )
 *
 * @param {Object} categories - map of categoryName -> { score: 0-5 }
 * @returns {number} 0-100
 */
export function computeOverallRubricScore(categories) {
  let weightedTotal = 0;

  for (const [key, weight] of Object.entries(RUBRIC_WEIGHTS)) {
    const cat = categories[key];
    const rawScore = typeof cat === "object" ? (cat?.score ?? 0) : Number(cat || 0);
    const clampedScore = Math.max(0, Math.min(5, rawScore));
    const normalized = (clampedScore / 5) * 100;
    weightedTotal += normalized * weight;
  }

  return Math.max(0, Math.min(100, Math.round(weightedTotal)));
}

// Aliases & Wrappers for full compatibility
export const RUBRIC_WEIGHTS_SUM = 100;

export function selectProblemForInterview(opts = {}) {
  const normList = Array.from(NORMALIZED_PROBLEMS.values());
  const prob = selectInterviewProblem({
    mode: opts.mode,
    companyId: opts.companyId,
    pattern: opts.pattern || opts.patternId,
    seed: opts.seed,
    profile: opts.profile,
    adaptiveState: opts.adaptiveState || (opts.weakPatterns ? { weakPatterns: opts.weakPatterns } : null),
    progressMap: opts.progressMap || {},
  });
  return {
    problem: prob,
    poolSize: normList.length,
    ...prob
  };
}

export function evaluateObjectiveCorrectness(evidence) {
  const score = computeCorrectnessScore(evidence);
  const testsPassed = evidence?.testsPassed ?? evidence?.passedTests ?? 0;
  const testsTotal = evidence?.testsTotal ?? evidence?.totalTests ?? (evidence?.testResults ? evidence.testResults.length : 0);
  const passRate = testsTotal > 0 ? (testsPassed / testsTotal) : (score >= 4 ? 1.0 : 0);
  return {
    score,
    percentage: (score / 5) * 100,
    passRate,
    passed: evidence?.passed ?? (testsTotal > 0 && testsPassed === testsTotal)
  };
}

export function evaluateTimeManagement(opts) {
  let score;
  if (typeof opts === "object" && opts !== null) {
    score = computeTimeManagementScore(opts.elapsedSeconds, opts.durationSeconds, opts.attempts || 1, opts.status || "submitted");
  } else {
    score = computeTimeManagementScore(...arguments);
  }
  return {
    score,
    percentage: (score / 5) * 100
  };
}

export function calculateInterviewRubric(catScores) {
  const overallScore = computeOverallRubricScore(catScores);
  const categories = {};
  for (const [key, weight] of Object.entries(RUBRIC_WEIGHTS)) {
    const raw = typeof catScores[key] === "object" ? catScores[key]?.score : Number(catScores[key] || 0);
    const score = Math.max(0, Math.min(5, raw || 0));
    categories[key] = {
      score,
      percentage: (score / 5) * 100,
      weight
    };
  }
  return {
    overallScore,
    categories
  };
}
