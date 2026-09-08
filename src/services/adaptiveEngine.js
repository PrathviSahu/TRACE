// ─────────────────────────────────────────────────────────────
//  TRACE — Adaptive Feedback Loop Engine
//  Phase 3.3: Deterministic performance-driven plan mutation.
//  No AI, no Math.random(), no ML — evidence → decision → adaptation.
// ─────────────────────────────────────────────────────────────

import { DSA_PATTERN_FAMILIES, DSA_PATTERNS, getPatternFamily, getProblemPatternDetails } from "../data/patternMapping.js";
import { NORMALIZED_PROBLEMS } from "../data/companyUtils.js";
import { getProblemKey } from "../services/progressStore.js";
import { calculatePriorityScore } from "../services/intelligenceService.js";
import { getCompanyEnrichedProblems } from "../data/companyUtils.js";
import { DIFFICULTY_MINUTES, REVISION_MINUTES } from "../services/dailyPlanGenerator.js";

// ──────────────────────────────────────────────────────────────
// CONSTANTS & THRESHOLDS
// ──────────────────────────────────────────────────────────────

/** Recency decay half-life in days (14 = recent 2-week window matters most) */
export const RECENCY_HALF_LIFE_DAYS = 14;

/** Minimum attempts required before declaring a pattern weak */
export const MIN_EVIDENCE_ATTEMPTS = 2;

/** Weakness gates */
export const WEAK_SUCCESS_RATE_THRESHOLD = 0.45;
export const WEAK_HINT_RATE_THRESHOLD = 0.5;
export const WEAK_SOLUTION_VIEW_RATE_THRESHOLD = 0.3;
export const WEAK_RECENT_FAILURES_THRESHOLD = 2;

/** Strength thresholds */
export const STRONG_ATTEMPTS_MIN = 3;
export const STRONG_SUCCESS_RATE_THRESHOLD = 0.75;
export const STRONG_INDEPENDENT_RATE_THRESHOLD = 0.5;

/** Confidence mapping: string label → numeric value 1-5 */
export const CONFIDENCE_NUMERIC = { high: 5, medium: 3, low: 1, null: 3, undefined: 3 };

/** Maximum fraction of future days a single weak family may occupy */
export const MAX_WEAK_FAMILY_FRACTION = 0.40;

/** Cooldown: minimum milliseconds between automatic adaptations */
export const ADAPTATION_COOLDOWN_MS = 30 * 60 * 1000;

/** Revision pressure threshold above which extra revision slots are injected */
export const HIGH_REVISION_PRESSURE = 60;

/** Time tolerance multiplier: solved within 1.5x expected time is "on time" */
export const TIME_TOLERANCE_MULTIPLIER = 1.5;

/** Additional revision pressure points when a problem is solved with low confidence */
export const LOW_CONFIDENCE_PRESSURE = 12;

/** Spaced revision intervals (in days) based on performance evidence */
export const REVISION_INTERVALS = {
  FAILED: 1,         // Unsolved or forgot_approach: 1 day
  LOW_QUALITY: 2,    // Solved with low confidence / quality < 50 / recent failures: 2 days
  ASSISTED: 4,       // Solved with hints or medium quality (50-74): 4 days
  STRONG: 7,         // Independent solve, high confidence, quality >= 75: 7 days
  MASTERED: 14,      // Sustained mastery (streak >= 3, independent, high confidence): 14 days
};

// ──────────────────────────────────────────────────────────────
// 1. SOLVE QUALITY  (0 – 100)
// ──────────────────────────────────────────────────────────────

/**
 * Computes a deterministic solve quality score (0–100) for a single problem attempt.
 *
 * Scoring breakdown:
 *   Base:                  solved=60, unsolved=0
 *   Independent bonus:     +25 (no hints + no solution viewed)
 *   Confidence:            high=+15, medium=+0, low=-15
 *   Time on budget:        within 1.5x expected → +10
 *   Consecutive successes: >= 3 → +5
 *   Consecutive failures:  -10 each, cap at -30
 *   Solution viewed:       -20
 *   Hints used:            -5 per hint, cap at -15
 *   Clamp: [0, 100]
 *
 * @param {Object} prog - ProblemProgress entry
 * @param {string} difficulty - "Easy"|"Medium"|"Hard"
 * @returns {number} quality 0-100
 */
export function computeSolveQuality(prog, difficulty = "Medium") {
  if (!prog) return 0;

  const solved = prog.status === "solved";
  let quality = solved ? 60 : 0;

  const hintsUsed = prog.hintsUsed || 0;
  const solutionViewed = Boolean(prog.solutionViewed);
  const confidence = prog.confidence || null;
  const timeSpent = prog.timeSpentSeconds || 0;
  const consecSucc = prog.consecutiveSuccesses || 0;
  const consecFail = prog.consecutiveFailures || 0;

  // Independent solve bonus (no hints, no solution peeking)
  if (solved && !solutionViewed && hintsUsed === 0) {
    quality += 25;
  }

  // Confidence modifier
  if (confidence === "high") quality += 15;
  else if (confidence === "low") quality -= 15;
  // medium: +0

  // Time on budget
  const expectedSeconds = (DIFFICULTY_MINUTES[difficulty] || 35) * 60;
  if (solved && timeSpent > 0 && timeSpent <= expectedSeconds * TIME_TOLERANCE_MULTIPLIER) {
    quality += 10;
  }

  // Consecutive success streak
  if (consecSucc >= 3) quality += 5;

  // Consecutive failure penalty
  const failPenalty = Math.min(30, consecFail * 10);
  quality -= failPenalty;

  // Solution viewed penalty
  if (solutionViewed) quality -= 20;

  // Hints penalty
  const hintPenalty = Math.min(15, hintsUsed * 5);
  quality -= hintPenalty;

  return Math.max(0, Math.min(100, Math.round(quality)));
}

// ──────────────────────────────────────────────────────────────
// 2. RECENCY WEIGHT  (0.0 – 1.0)
// ──────────────────────────────────────────────────────────────

/**
 * Exponential recency decay: 2^(-(daysSince/halfLife))
 * 0 days ago → 1.0, 14 days ago → 0.5, 28 days ago → 0.25
 *
 * @param {string|null} timestampIso
 * @param {number} nowMs - injectable for deterministic testing
 * @returns {number} 0.0-1.0
 */
export function computeRecencyWeight(timestampIso, nowMs = Date.now()) {
  if (!timestampIso) return 0.5; // neutral weight if no timestamp
  const ts = new Date(timestampIso).getTime();
  if (isNaN(ts)) return 0.5;
  const daysSince = (nowMs - ts) / (1000 * 60 * 60 * 24);
  return Math.pow(2, -(daysSince / RECENCY_HALF_LIFE_DAYS));
}

// ──────────────────────────────────────────────────────────────
// 2B. DETERMINISTIC REVISION SPACING
// ──────────────────────────────────────────────────────────────

/**
 * Computes deterministic revision interval in days based on problem performance.
 *
 * Spacing rules:
 *   - Unsolved / forgot_approach: 1 day
 *   - Low confidence / quality < 50 / consecutive failures >= 1: 2 days
 *   - Hints used / solution viewed / quality < 75: 4 days
 *   - Solved independently, high confidence, streak >= 3, quality >= 85: 14 days
 *   - Solved independently, high confidence / quality >= 75: 7 days
 *   - Default (moderate / okay): 4 days
 *
 * @param {Object} prog - ProblemProgress entry
 * @param {string} difficulty - "Easy"|"Medium"|"Hard"
 * @returns {number} interval in days (1, 2, 4, 7, 14)
 */
export function computeRevisionIntervalDays(prog, difficulty = "Medium") {
  if (!prog) return REVISION_INTERVALS.ASSISTED;

  // Unsolved, forgot approach, or explicit need_revision with failures
  if (prog.status !== "solved" || prog.status === "forgot_approach") {
    return REVISION_INTERVALS.FAILED;
  }

  const quality = computeSolveQuality(prog, difficulty);
  const consecSucc = prog.consecutiveSuccesses || 0;
  const isClean = !prog.solutionViewed && (prog.hintsUsed || 0) === 0;

  // Mastered streak: 14 days
  if (isClean && prog.confidence === "high" && quality >= 85 && consecSucc >= 3) {
    return REVISION_INTERVALS.MASTERED;
  }

  // Strong: 7 days
  if (isClean && (prog.confidence === "high" || quality >= 75)) {
    return REVISION_INTERVALS.STRONG;
  }

  // Low confidence or low quality: 2 days
  if (prog.confidence === "low" || quality < 50 || (prog.consecutiveFailures || 0) > 0) {
    return REVISION_INTERVALS.LOW_QUALITY;
  }

  // Assisted or moderate quality: 4 days
  return REVISION_INTERVALS.ASSISTED;
}

/**
 * Computes the next scheduled revision date (YYYY-MM-DD) for a problem.
 *
 * @param {Object} prog - ProblemProgress entry
 * @param {string|null} lastAttemptedIso
 * @param {string} timezone - e.g. "UTC" or profile.timezone
 * @param {string} difficulty
 * @returns {string} YYYY-MM-DD
 */
export function computeNextRevisionDate(prog, lastAttemptedIso = null, timezone = "UTC", difficulty = "Medium") {
  const interval = computeRevisionIntervalDays(prog, difficulty);
  const baseMs = lastAttemptedIso
    ? new Date(lastAttemptedIso).getTime()
    : Date.now();
  const nextMs = baseMs + interval * 24 * 60 * 60 * 1000;
  try {
    return new Date(nextMs).toLocaleDateString("en-CA", { timeZone: timezone || "UTC" });
  } catch {
    return new Date(nextMs).toISOString().split("T")[0];
  }
}

// ──────────────────────────────────────────────────────────────
// 3. ADAPTIVE PATTERN SIGNALS
// ──────────────────────────────────────────────────────────────

/**
 * Builds deterministic per-pattern signal objects from progressMap.
 * Reuses existing patternMapping taxonomy — no new data structures.
 *
 * @param {Object} progressMap - from getAllProgress()
 * @param {Array} problems - problem list (defaults to all normalized problems)
 * @param {number} nowMs - injectable for testing
 * @returns {Map<string, Object>} pattern → signal
 */
export function computeAdaptivePatternSignals(progressMap, problems = null, nowMs = Date.now()) {
  const problemList = problems || Array.from(NORMALIZED_PROBLEMS.values());
  const signals = new Map();

  for (const p of problemList) {
    const details = getProblemPatternDetails(p);
    const patterns = details?.patterns?.length > 0 ? details.patterns : ["Unclassified"];
    const pKey = getProblemKey(p);
    const prog = progressMap[pKey];

    for (const pat of patterns) {
      if (!signals.has(pat)) {
        signals.set(pat, {
          pattern: pat,
          family: getPatternFamily(pat),
          attempts: 0,
          solved: 0,
          independent: 0,        // solved without hints or solution view
          hintAssisted: 0,
          solutionViewed: 0,
          totalHints: 0,
          confidenceSum: 0,      // numeric 1-5
          confidenceCount: 0,
          recentFailures: 0,     // weighted by recency
          recentSuccesses: 0,    // weighted by recency
          qualitySum: 0,
          qualityCount: 0,
          lastAttempted: null,
        });
      }

      const sig = signals.get(pat);

      if (prog) {
        const recencyW = computeRecencyWeight(prog.lastAttempted, nowMs);
        const quality = computeSolveQuality(prog, p.difficulty || "Medium");

        sig.attempts += prog.attempts || 0;

        if (prog.status === "solved") {
          sig.solved++;
          if (!prog.solutionViewed && (prog.hintsUsed || 0) === 0) {
            sig.independent++;
          }
          if ((prog.hintsUsed || 0) > 0) sig.hintAssisted++;
          sig.recentSuccesses += recencyW;
        } else {
          sig.recentFailures += recencyW;
        }

        if (prog.solutionViewed) sig.solutionViewed++;
        sig.totalHints += prog.hintsUsed || 0;

        const confNum = CONFIDENCE_NUMERIC[prog.confidence] || 3;
        sig.confidenceSum += confNum;
        sig.confidenceCount++;

        sig.qualitySum += quality;
        sig.qualityCount++;

        if (prog.lastAttempted) {
          if (!sig.lastAttempted || new Date(prog.lastAttempted) > new Date(sig.lastAttempted)) {
            sig.lastAttempted = prog.lastAttempted;
          }
        }
      }
    }
  }

  // Post-process: compute rates reflecting actual attempts
  for (const [, sig] of signals) {
    sig.successRate = sig.attempts > 0 ? sig.solved / sig.attempts : 0;
    sig.independentSolveRate = sig.solved > 0 ? sig.independent / sig.solved : 0;
    sig.hintRate = sig.attempts > 0 ? sig.hintAssisted / sig.attempts : 0;
    sig.solutionViewRate = sig.attempts > 0 ? sig.solutionViewed / sig.attempts : 0;
    sig.avgConfidence = sig.confidenceCount > 0 ? sig.confidenceSum / sig.confidenceCount : 3;
    sig.avgQuality = sig.qualityCount > 0 ? Math.round(sig.qualitySum / sig.qualityCount) : 50;
    // Weighted success rate based on recency-weighted successes vs failures
    sig.weightedSuccessRate = (sig.recentSuccesses + sig.recentFailures) > 0
      ? sig.recentSuccesses / (sig.recentSuccesses + sig.recentFailures)
      : 0.5; // neutral for unstarted patterns
  }

  return signals;
}

// ──────────────────────────────────────────────────────────────
// 4. ADAPTIVE TOPIC SIGNALS
// ──────────────────────────────────────────────────────────────

/**
 * Builds per-topic adaptive signals from progressMap.
 * @param {Object} progressMap
 * @param {Array} problems
 * @param {number} nowMs
 * @returns {Map<string, Object>} topic → signal
 */
export function computeAdaptiveTopicSignals(progressMap, problems = null, nowMs = Date.now()) {
  const problemList = problems || Array.from(NORMALIZED_PROBLEMS.values());
  const signals = new Map();

  for (const p of problemList) {
    const details = getProblemPatternDetails(p);
    const topics = p.topics?.length > 0 ? p.topics : [details.topic || "General"];
    const pKey = getProblemKey(p);
    const prog = progressMap[pKey];

    for (const topic of topics) {
      if (!signals.has(topic)) {
        signals.set(topic, {
          topic,
          attempts: 0,
          solved: 0,
          independent: 0,
          recentFailures: 0,
          recentSuccesses: 0,
          qualitySum: 0,
          qualityCount: 0,
          confidenceSum: 0,
          confidenceCount: 0,
          lastAttempted: null,
        });
      }

      const sig = signals.get(topic);

      if (prog) {
        const recencyW = computeRecencyWeight(prog.lastAttempted, nowMs);
        const quality = computeSolveQuality(prog, p.difficulty || "Medium");

        sig.attempts += prog.attempts || 0;

        if (prog.status === "solved") {
          sig.solved++;
          if (!prog.solutionViewed && (prog.hintsUsed || 0) === 0) sig.independent++;
          sig.recentSuccesses += recencyW;
        } else {
          sig.recentFailures += recencyW;
        }

        sig.qualitySum += quality;
        sig.qualityCount++;

        const confNum = CONFIDENCE_NUMERIC[prog.confidence] || 3;
        sig.confidenceSum += confNum;
        sig.confidenceCount++;

        if (prog.lastAttempted) {
          if (!sig.lastAttempted || new Date(prog.lastAttempted) > new Date(sig.lastAttempted)) {
            sig.lastAttempted = prog.lastAttempted;
          }
        }
      }
    }
  }

  // Post-process rates
  for (const [, sig] of signals) {
    sig.successRate = sig.attempts > 0 ? sig.solved / Math.max(1, sig.attempts) : 0;
    sig.independentRate = sig.solved > 0 ? sig.independent / sig.solved : 0;
    sig.avgQuality = sig.qualityCount > 0 ? Math.round(sig.qualitySum / sig.qualityCount) : 50;
    sig.avgConfidence = sig.confidenceCount > 0 ? sig.confidenceSum / sig.confidenceCount : 3;
    sig.weightedSuccessRate = (sig.recentSuccesses + sig.recentFailures) > 0
      ? sig.recentSuccesses / (sig.recentSuccesses + sig.recentFailures)
      : 0.5;
  }

  return signals;
}

// ──────────────────────────────────────────────────────────────
// 5. WEAK / STRONG PATTERN DETECTION
// ──────────────────────────────────────────────────────────────

/**
 * Detects weak patterns using a multi-signal evidence gate.
 * Requires minimum attempts — avoids panic on single bad problem.
 *
 * Weakness criteria (ALL must pass):
 *   1. attempts >= MIN_EVIDENCE_ATTEMPTS
 *   2. weightedSuccessRate < WEAK_SUCCESS_RATE_THRESHOLD
 *   3. At least one of:
 *        hintRate > 0.5  OR  solutionViewRate > 0.3  OR  recentFailures >= 2
 *
 * @param {Map} patternSignals - from computeAdaptivePatternSignals
 * @returns {string[]} weak pattern names, sorted by severity
 */
export function detectWeakPatterns(patternSignals) {
  const weak = [];
  for (const [pattern, sig] of patternSignals) {
    if (sig.attempts < MIN_EVIDENCE_ATTEMPTS) continue;
    if (sig.weightedSuccessRate >= WEAK_SUCCESS_RATE_THRESHOLD) continue;

    const hasSecondarySignal =
      sig.hintRate > WEAK_HINT_RATE_THRESHOLD ||
      sig.solutionViewRate > WEAK_SOLUTION_VIEW_RATE_THRESHOLD ||
      sig.recentFailures >= WEAK_RECENT_FAILURES_THRESHOLD;

    if (hasSecondarySignal) {
      weak.push({ pattern, sig });
    }
  }

  // Sort by severity: lowest weighted success + most recent failures
  weak.sort((a, b) => {
    const sevA = (1 - a.sig.weightedSuccessRate) * 100 + a.sig.recentFailures * 10;
    const sevB = (1 - b.sig.weightedSuccessRate) * 100 + b.sig.recentFailures * 10;
    if (Math.abs(sevB - sevA) > 0.01) return sevB - sevA;
    return a.pattern.localeCompare(b.pattern);
  });

  return weak.map(w => w.pattern);
}

/**
 * Detects strong patterns where the user has demonstrated consistent mastery.
 *
 * Strength criteria (ALL must pass):
 *   1. attempts >= STRONG_ATTEMPTS_MIN
 *   2. weightedSuccessRate >= 0.75
 *   3. independentSolveRate >= 0.5
 *   4. avgConfidence >= 3.5 (medium-high)
 *
 * @param {Map} patternSignals
 * @returns {string[]} strong pattern names
 */
export function detectStrongPatterns(patternSignals) {
  const strong = [];
  for (const [pattern, sig] of patternSignals) {
    if (sig.attempts < STRONG_ATTEMPTS_MIN) continue;
    if (sig.weightedSuccessRate < STRONG_SUCCESS_RATE_THRESHOLD) continue;
    if (sig.independentSolveRate < STRONG_INDEPENDENT_RATE_THRESHOLD) continue;
    if (sig.avgConfidence < 3.5) continue;
    strong.push({ pattern, sig });
  }

  strong.sort((a, b) => {
    if (Math.abs(b.sig.weightedSuccessRate - a.sig.weightedSuccessRate) > 0.01)
      return b.sig.weightedSuccessRate - a.sig.weightedSuccessRate;
    return a.pattern.localeCompare(b.pattern);
  });

  return strong.map(s => s.pattern);
}

/**
 * Detects weak topics using a simplified gate.
 * @param {Map} topicSignals
 * @returns {string[]}
 */
export function detectWeakTopics(topicSignals) {
  const weak = [];
  for (const [topic, sig] of topicSignals) {
    if (sig.attempts < MIN_EVIDENCE_ATTEMPTS) continue;
    if (sig.weightedSuccessRate >= WEAK_SUCCESS_RATE_THRESHOLD) continue;
    if (sig.recentFailures >= 1) {
      weak.push({ topic, sig });
    }
  }
  weak.sort((a, b) => {
    const sevA = (1 - a.sig.weightedSuccessRate) + a.sig.recentFailures * 0.1;
    const sevB = (1 - b.sig.weightedSuccessRate) + b.sig.recentFailures * 0.1;
    if (Math.abs(sevB - sevA) > 0.001) return sevB - sevA;
    return a.topic.localeCompare(b.topic);
  });
  return weak.map(w => w.topic);
}

/**
 * Detects strong topics.
 * @param {Map} topicSignals
 * @returns {string[]}
 */
export function detectStrongTopics(topicSignals) {
  const strong = [];
  for (const [topic, sig] of topicSignals) {
    if (sig.attempts < STRONG_ATTEMPTS_MIN) continue;
    if (sig.weightedSuccessRate < STRONG_SUCCESS_RATE_THRESHOLD) continue;
    if (sig.avgConfidence < 3.5) continue;
    strong.push({ topic, sig });
  }
  strong.sort((a, b) => {
    if (Math.abs(b.sig.weightedSuccessRate - a.sig.weightedSuccessRate) > 0.001)
      return b.sig.weightedSuccessRate - a.sig.weightedSuccessRate;
    return a.topic.localeCompare(b.topic);
  });
  return strong.map(s => s.topic);
}

// ──────────────────────────────────────────────────────────────
// 6. REVISION PRESSURE  (0 – 100)
// ──────────────────────────────────────────────────────────────

/**
 * Computes a deterministic revision pressure score (0–100).
 * High pressure means future plan should allocate more revision.
 *
 * Contributions (recency-weighted):
 *   forgot_approach:  +20 * w
 *   need_revision:    +12 * w
 *   quality < 40:     +8  * w
 *
 * @param {Object} progressMap
 * @param {number} nowMs
 * @returns {number} 0-100
 */
export function computeRevisionPressure(progressMap, nowMs = Date.now()) {
  let pressure = 0;

  const entries = Array.from(Object.entries(progressMap)).sort(([a], [b]) => a.localeCompare(b));

  for (const [, prog] of entries) {
    if (!prog) continue;
    const w = computeRecencyWeight(prog.lastAttempted, nowMs);
    if (prog.status === "forgot_approach") pressure += 20 * w;
    else if (prog.status === "need_revision") pressure += 12 * w;

    const quality = computeSolveQuality(prog, "Medium");
    if (quality < 40) pressure += 8 * w;

    // Low confidence directly contributes to revision pressure (bounded)
    // This captures the case: solved, no hints, but user reports low confidence
    if (prog.confidence === "low") pressure += LOW_CONFIDENCE_PRESSURE * w;
  }

  return Math.max(0, Math.min(100, Math.round(pressure)));
}

// ──────────────────────────────────────────────────────────────
// 7. DIFFICULTY TREND
// ──────────────────────────────────────────────────────────────

/**
 * Determines difficulty adaptation trend based on recent 7-day window.
 *
 * Rules:
 *   "reduce"   — recentFailedMedHard >= 2 in last 7 days
 *   "increase" — recentCleanEasy >= 3 AND recentFailedMedHard == 0
 *   "maintain" — otherwise
 *
 * @param {Object} progressMap
 * @param {Array|null} planDays - DailyPlan[] for context
 * @param {number} nowMs
 * @returns {"increase"|"maintain"|"reduce"}
 */
export function computeDifficultyTrend(progressMap, planDays = null, nowMs = Date.now(), problems = null) {
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  let recentFailedMedHard = 0;
  let recentCleanEasy = 0;

  const problemsInPlan = new Set();
  if (planDays) {
    for (const day of planDays) {
      for (const p of day.problems || []) problemsInPlan.add(getProblemKey(p));
    }
  }

  const normList = problems || Array.from(NORMALIZED_PROBLEMS.values());

  for (const p of normList) {
    const pKey = getProblemKey(p);
    const prog = progressMap[pKey];
    if (!prog || !prog.lastAttempted) continue;

    const ts = new Date(prog.lastAttempted).getTime();
    if (nowMs - ts > sevenDaysMs) continue; // outside 7-day window

    const diff = (p.difficulty || "Medium").toLowerCase();

    if (prog.status !== "solved") {
      if (diff === "medium" || diff === "hard") recentFailedMedHard++;
    } else {
      if (diff === "easy" && !prog.solutionViewed && (prog.hintsUsed || 0) === 0) {
        recentCleanEasy++;
      }
    }
  }

  if (recentFailedMedHard >= 2) return "reduce";
  if (recentCleanEasy >= 3 && recentFailedMedHard === 0) return "increase";
  return "maintain";
}

// ──────────────────────────────────────────────────────────────
// 8. RECENT PERFORMANCE WINDOW
// ──────────────────────────────────────────────────────────────

/**
 * Extracts the most recent N problem performance events (sorted newest first).
 * @param {Object} progressMap
 * @param {number} maxN
 * @param {number} nowMs
 * @returns {Array<{ problemKey, quality, timestamp }>}
 */
export function extractRecentPerformance(progressMap, maxN = 10, nowMs = Date.now()) {
  const entries = [];

  const sortedKeys = Object.keys(progressMap).sort((a, b) => a.localeCompare(b));
  for (const key of sortedKeys) {
    const prog = progressMap[key];
    if (!prog || !prog.lastAttempted) continue;
    const quality = computeSolveQuality(prog, "Medium");
    entries.push({ problemKey: key, quality, timestamp: prog.lastAttempted });
  }

  // Sort newest first, stable
  entries.sort((a, b) => {
    const tA = new Date(a.timestamp).getTime();
    const tB = new Date(b.timestamp).getTime();
    if (tB !== tA) return tB - tA;
    return a.problemKey.localeCompare(b.problemKey);
  });

  return entries.slice(0, maxN);
}

// ──────────────────────────────────────────────────────────────
// 9. BUILD ADAPTIVE STATE
// ──────────────────────────────────────────────────────────────

/**
 * Builds a full AdaptiveState from current plan + performance data.
 * Pure function — deterministic given same inputs.
 *
 * @param {Object} profile - InterviewProfile
 * @param {Object} plan - GeneratedPlan (current)
 * @param {Object} progressMap - from getAllProgress()
 * @param {Object|null} existingAdaptiveState - previous state (for version bump)
 * @param {number} nowMs - injectable for testing
 * @returns {Object} AdaptiveState
 */
export function buildAdaptiveState(profile, plan, progressMap, existingAdaptiveState = null, nowMs = Date.now()) {
  const companyProblems = plan?.companyId
    ? getCompanyEnrichedProblems(plan.companyId)
    : Array.from(NORMALIZED_PROBLEMS.values());

  const patternSignals = computeAdaptivePatternSignals(progressMap, companyProblems, nowMs);
  const topicSignals = computeAdaptiveTopicSignals(progressMap, companyProblems, nowMs);

  const weakPatterns = detectWeakPatterns(patternSignals);
  const strongPatterns = detectStrongPatterns(patternSignals);
  const weakTopics = detectWeakTopics(topicSignals);
  const strongTopics = detectStrongTopics(topicSignals);

  // Aggregate to family level
  const weakFamilies = [...new Set(weakPatterns.map(p => getPatternFamily(p)))].sort();
  const strongFamilies = [...new Set(strongPatterns.map(p => getPatternFamily(p)))].sort();

  const revisionPressure = computeRevisionPressure(progressMap, nowMs);
  const difficultyTrend = computeDifficultyTrend(progressMap, plan?.days || [], nowMs);
  const recentPerformance = extractRecentPerformance(progressMap, 10, nowMs);

  const adaptationVersion = (existingAdaptiveState?.adaptationVersion || 0) + 1;

  return {
    profileId: profile?.id || null,
    adaptationVersion,
    lastEvaluatedAt: new Date(nowMs).toISOString(),
    lastPerformanceChangeAt: recentPerformance.length > 0 ? recentPerformance[0].timestamp : null,
    weakPatterns,
    strongPatterns,
    weakFamilies,
    strongFamilies,
    weakTopics,
    strongTopics,
    revisionPressure,
    difficultyTrend,
    recentPerformance,
    adaptationReasons: [],  // populated by adaptFutureDays
    planDelta: { addedRevision: 0, removedHard: 0, addedWeakPatternProblems: 0, shiftedFamilies: [] }
  };
}

// ──────────────────────────────────────────────────────────────
// 9B. TEMPORAL DAY CLASSIFICATION
// ──────────────────────────────────────────────────────────────

/**
 * Classifies a plan day's temporal status based on calendar date, current date, and timezone.
 *
 * Temporal boundaries:
 *   - "past":     day.date < todayDateStr (strictly before today in profile timezone)
 *   - "today":    day.date === todayDateStr
 *   - "future":   day.date > todayDateStr
 *
 * Immutability:
 *   - Past days are ALWAYS locked (even if uncompleted).
 *   - Completed days are ALWAYS locked.
 *   - Future and uncompleted today are eligible for adaptation.
 *
 * @param {Object} day - DailyPlan day object (with day.date e.g. "2026-09-08")
 * @param {number} nowMs - timestamp in ms (Date.now())
 * @param {string} timezone - e.g. profile.timezone || "UTC"
 * @returns {{ status: "past"|"today"|"future", isLocked: boolean }}
 */
export function classifyPlanDay(day, nowMs = Date.now(), timezone = "UTC") {
  if (!day) return { status: "past", isLocked: true };

  let todayDateStr;
  try {
    todayDateStr = new Date(nowMs).toLocaleDateString("en-CA", { timeZone: timezone || "UTC" });
  } catch {
    todayDateStr = new Date(nowMs).toISOString().split("T")[0];
  }

  const isCompleted = day.completed === true;
  const dayDate = day.date;

  if (!dayDate) {
    return {
      status: isCompleted ? "past" : "future",
      isLocked: isCompleted,
    };
  }

  if (dayDate < todayDateStr) {
    return { status: "past", isLocked: true };
  }

  if (dayDate === todayDateStr) {
    return { status: "today", isLocked: isCompleted };
  }

  return { status: "future", isLocked: isCompleted };
}

// ──────────────────────────────────────────────────────────────
// 10. ADAPT FUTURE DAYS  (Core Mutation)
// ──────────────────────────────────────────────────────────────

/**
 * Mutates future plan days based on AdaptiveState.
 *
 * CRITICAL RULE: Completed/past days are NEVER modified.
 * Lock condition: day.completed === true OR day.dayIndex < currentDayIndex
 *
 * Mutation operations (on future days only):
 *   A. Revision pressure injection — if revisionPressure > 60, inject extra revision slot
 *   B. Weak family reinforcement  — bias future days toward weak families
 *   C. Problem difficulty shift   — apply difficultyTrend to new problem selection
 *   D. Strong pattern relief      — slightly reduce repetition of mastered families
 *   E. Dedup: skip problems the user has already solved with quality > 70
 *
 * @param {Object} plan - GeneratedPlan (Phase 3.2 output)
 * @param {Object} adaptiveState - from buildAdaptiveState
 * @param {Object} profile - InterviewProfile
 * @param {Object} progressMap - from getAllProgress()
 * @param {number} nowMs - injectable for testing
 * @returns {Object} adapted plan (new object, original untouched)
 */
export function adaptFutureDays(plan, adaptiveState, profile, progressMap, nowMs = Date.now()) {
  if (!plan || !plan.days || !adaptiveState) {
    return plan;
  }

  const reasons = [];
  const delta = { addedRevision: 0, removedHard: 0, addedWeakPatternProblems: 0, shiftedFamilies: [] };

  // FIX: Determine locked/today/future using actual calendar date + timezone.
  // Phase 3.1 established timezone-aware planning — we must respect it here.
  // A day is "past" if its calendar date is strictly before today (in profile timezone).
  // A day is "today" if its date === today's date.
  // A day is "future" if its date > today.
  const nowDateStr = (() => {
    try {
      const tz = profile?.timezone || "UTC";
      return new Date(nowMs).toLocaleDateString("en-CA", { timeZone: tz });
    } catch {
      return new Date(nowMs).toISOString().split("T")[0];
    }
  })();

  // A day is locked if: explicitly completed OR its calendar date is strictly before today
  const isDayLocked = (day) => classifyPlanDay(day, nowMs, profile?.timezone || "UTC").isLocked;

  // For backward compatibility compute currentDayIndex too (used for weak-family cap)
  const currentDayIndex = plan.days
    .filter(d => isDayLocked(d))
    .reduce((max, d) => Math.max(max, d.dayIndex), 0);

  // Build solved-with-high-quality set for dedup
  const highQualitySolved = new Set();
  for (const [key, prog] of Object.entries(progressMap)) {
    if (prog?.status === "solved") {
      const quality = computeSolveQuality(prog, "Medium");
      if (quality > 70) highQualitySolved.add(key);
    }
  }

  // Build company candidate pool for weak-pattern reinforcement
  const companyProbs = getCompanyEnrichedProblems(plan.companyId || "microsoft");
  const normList = Array.from(NORMALIZED_PROBLEMS.values());

  // Enriched problem builder (reuse pattern from Phase 3.2)
  function enrichForAdaptation(p) {
    const details = getProblemPatternDetails(p);
    const primaryPattern = details?.patterns?.[0] || "Unclassified";
    const family = getPatternFamily(primaryPattern);
    const prog = progressMap[getProblemKey(p)];
    const scoreObj = calculatePriorityScore(p, prog);
    return {
      id: p.id,
      key: getProblemKey(p),
      title: p.title || p.name || `Problem #${p.id}`,
      difficulty: p.difficulty || "Medium",
      topics: p.topics || [],
      primaryPattern,
      patterns: details?.patterns || [primaryPattern],
      family,
      frequency: p.frequency || 0,
      priorityScore: scoreObj.score,
      estMinutes: DIFFICULTY_MINUTES[p.difficulty] || 35,
      status: prog?.status || "unsolved",
    };
  }

  const companyEnriched = companyProbs.map(enrichForAdaptation);
  const normEnriched = normList.map(p => enrichForAdaptation(p));

  // Build a lookup: family → available problems (not yet high-quality solved, not assigned in plan)
  const assignedInPlan = new Set();
  for (const day of plan.days) {
    for (const p of day.problems || []) assignedInPlan.add(getProblemKey(p));
    for (const p of day.revisionProblems || []) assignedInPlan.add(getProblemKey(p));
  }

  // Weak family problem pool (company-grounded first, then general)
  const weakFamilyPools = {};
  for (const family of adaptiveState.weakFamilies) {
    const pool = [
      ...companyEnriched.filter(p => p.family === family && !highQualitySolved.has(p.key)),
      ...normEnriched.filter(p => p.family === family && !highQualitySolved.has(p.key) &&
        !companyEnriched.some(c => c.key === p.key))
    ].sort((a, b) => {
      if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
      return String(a.id).localeCompare(String(b.id));
    });
    weakFamilyPools[family] = pool;
  }

  // Revision candidates with true spaced repetition schedule
  const revisionCandidates = [];
  const sortedProgKeys = Object.keys(progressMap).sort((a, b) => a.localeCompare(b));
  for (const key of sortedProgKeys) {
    const prog = progressMap[key];
    if (!prog) continue;
    const needsRev =
      prog.status === "forgot_approach" ||
      prog.status === "need_revision" ||
      prog.confidence === "low" ||
      computeSolveQuality(prog, "Medium") < 50;

    if (!needsRev) continue;
    if (assignedInPlan.has(key)) continue;

    const normProb = NORMALIZED_PROBLEMS.get(key);
    if (!normProb) continue;

    const urgency =
      prog.status === "forgot_approach" ? 3 :
      (prog.status === "need_revision" ? 2 :
      (prog.confidence === "low" ? 2 : 1));

    const nextRevDate = computeNextRevisionDate(prog, prog.lastAttempted, profile?.timezone || "UTC", normProb.difficulty || "Medium");
    const intervalDays = computeRevisionIntervalDays(prog, normProb.difficulty || "Medium");
    const w = computeRecencyWeight(prog.lastAttempted, nowMs);

    revisionCandidates.push({ key, prob: normProb, urgency, w, nextRevDate, intervalDays });
  }

  revisionCandidates.sort((a, b) => {
    if (b.urgency !== a.urgency) return b.urgency - a.urgency;
    if (a.nextRevDate !== b.nextRevDate) return a.nextRevDate.localeCompare(b.nextRevDate);
    if (Math.abs(b.w - a.w) > 0.01) return b.w - a.w;
    return a.key.localeCompare(b.key);
  });

  const assignedRevisionKeys = new Set();

  // Max weak days per family (40% cap)
  const futureDays = plan.days.filter(d => !isDayLocked(d) && !d.isMockDay);
  const maxWeakFamilyDays = Math.max(1, Math.floor(futureDays.length * MAX_WEAK_FAMILY_FRACTION));

  // Track how many extra days each weak family has been boosted
  const weakFamilyBoostCount = {};

  // Build adapted days (deep copy to avoid mutating original)
  const adaptedDays = plan.days.map(day => {
    // LOCK: past or completed days (calendar-aware, timezone-safe)
    const isLocked = isDayLocked(day);
    if (isLocked) return { ...day }; // unchanged copy

    if (day.isMockDay) return { ...day }; // mock days unchanged

    const dayBudget = profile.dailyStudyMinutes || 120;
    let budgetLeft = dayBudget;

    let adaptedProblems = [...(day.problems || [])];
    let adaptedRevision = [...(day.revisionProblems || [])];
    let dayModified = false;

    // ─── A. Revision pressure injection (with spaced repetition date gate) ───
    if (
      adaptiveState.revisionPressure > HIGH_REVISION_PRESSURE &&
      adaptedRevision.length === 0
    ) {
      // Find highest-urgency candidate whose scheduled nextRevDate <= day.date
      const revCandidate = revisionCandidates.find(
        cand => !assignedRevisionKeys.has(cand.key) && (!day.date || day.date >= cand.nextRevDate)
      );

      if (revCandidate) {
        const enriched = enrichForAdaptation(revCandidate.prob);
        enriched.isRevision = true;
        adaptedRevision = [enriched];
        assignedRevisionKeys.add(revCandidate.key);
        budgetLeft -= REVISION_MINUTES;
        delta.addedRevision++;
        dayModified = true;
      }
    }

    // ─── B. Weak family reinforcement ───
    const dayFamily = day.focusFamily;
    const familyIsWeak = adaptiveState.weakFamilies.includes(dayFamily);
    const boostCount = weakFamilyBoostCount[dayFamily] || 0;

    if (familyIsWeak && boostCount < maxWeakFamilyDays) {
      // Try to add one extra problem from the weak family if budget permits
      const pool = weakFamilyPools[dayFamily] || [];
      const alreadyInDay = new Set(adaptedProblems.map(p => getProblemKey(p)));
      const candidate = pool.find(p =>
        !alreadyInDay.has(p.key) &&
        !assignedInPlan.has(p.key) &&
        budgetLeft - p.estMinutes >= 0
      );
      if (candidate && adaptedProblems.length < 5) {
        // Remove weakest problem if over capacity
        if (adaptedProblems.reduce((s, p) => s + (p.estMinutes || 35), 0) + candidate.estMinutes > dayBudget) {
          // Replace lowest-priority non-revision problem
          adaptedProblems.sort((a, b) => (a.priorityScore || 50) - (b.priorityScore || 50));
          adaptedProblems.shift(); // remove lowest
        }
        adaptedProblems.push(candidate);
        assignedInPlan.add(candidate.key);
        weakFamilyBoostCount[dayFamily] = boostCount + 1;
        delta.addedWeakPatternProblems++;
        if (!delta.shiftedFamilies.includes(dayFamily)) delta.shiftedFamilies.push(dayFamily);
        dayModified = true;
      }
    }

    // ─── C. Difficulty shift ───
    if (adaptiveState.difficultyTrend === "reduce") {
      // Remove Hard problems and replace with Medium from same family if available
      const hardProbs = adaptedProblems.filter(p => p.difficulty === "Hard");
      if (hardProbs.length > 0) {
        const familyPool = companyEnriched.filter(p =>
          p.family === dayFamily &&
          p.difficulty !== "Hard" &&
          !assignedInPlan.has(p.key) &&
          !highQualitySolved.has(p.key)
        ).sort((a, b) => {
          if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
          return String(a.id).localeCompare(String(b.id));
        });

        const toRemove = hardProbs[0]; // only reduce one at a time
        const replacement = familyPool[0];
        if (replacement) {
          adaptedProblems = adaptedProblems.filter(p => getProblemKey(p) !== getProblemKey(toRemove));
          adaptedProblems.push(replacement);
          assignedInPlan.add(replacement.key);
          delta.removedHard++;
          dayModified = true;
        }
      }
    } else if (adaptiveState.difficultyTrend === "increase") {
      // Allow one additional Hard problem if budget and pool permit
      const currentHard = adaptedProblems.filter(p => p.difficulty === "Hard").length;
      if (currentHard === 0 && budgetLeft >= DIFFICULTY_MINUTES.Hard) {
        const hardCandidate = companyEnriched.find(p =>
          p.family === dayFamily &&
          p.difficulty === "Hard" &&
          !assignedInPlan.has(p.key) &&
          !highQualitySolved.has(p.key)
        );
        if (hardCandidate && adaptedProblems.length < 4) {
          adaptedProblems.push(hardCandidate);
          assignedInPlan.add(hardCandidate.key);
          dayModified = true;
        }
      }
    }

    // ─── D. Dedup: remove high-quality solved problems ───
    const deduped = adaptedProblems.filter(p => !highQualitySolved.has(getProblemKey(p)));
    if (deduped.length !== adaptedProblems.length) {
      adaptedProblems = deduped;
      dayModified = true;
    }

    // ─── E. Enforce time budget (HARD constraint: estimatedMinutes <= dailyStudyMinutes) ───
    let totalEst = adaptedProblems.reduce((s, p) => s + (p.estMinutes || 35), 0) +
                   adaptedRevision.reduce((s, p) => s + REVISION_MINUTES, 0);

    // Hard cap: no +15 tolerance — prune lowest priority problems
    while (totalEst > dayBudget && adaptedProblems.length > 1) {
      adaptedProblems.sort((a, b) => (a.priorityScore || 50) - (b.priorityScore || 50));
      adaptedProblems.shift();
      totalEst = adaptedProblems.reduce((s, p) => s + (p.estMinutes || 35), 0) +
                 adaptedRevision.reduce((s, p) => s + REVISION_MINUTES, 0);
    }

    // If still over budget, prune revision items
    while (totalEst > dayBudget && adaptedRevision.length > 0) {
      adaptedRevision.pop();
      totalEst = adaptedProblems.reduce((s, p) => s + (p.estMinutes || 35), 0) +
                 adaptedRevision.reduce((s, p) => s + REVISION_MINUTES, 0);
    }

    // If a single remaining problem exceeds budget, swap for a smaller candidate if available
    if (totalEst > dayBudget && adaptedProblems.length === 1) {
      const p = adaptedProblems[0];
      if ((p.estMinutes || 35) > dayBudget) {
        const smaller = companyEnriched.find(cand =>
          cand.family === dayFamily &&
          (cand.estMinutes || 35) <= dayBudget &&
          !assignedInPlan.has(cand.key) &&
          !highQualitySolved.has(cand.key)
        );
        if (smaller) {
          adaptedProblems = [smaller];
          assignedInPlan.add(smaller.key);
          totalEst = (smaller.estMinutes || 35) + adaptedRevision.reduce((s, p) => s + REVISION_MINUTES, 0);
        }
      }
    }

    const updatedPatSet = new Set();
    adaptedProblems.forEach(p => (p.patterns || []).forEach(pat => updatedPatSet.add(pat)));

    return {
      ...day,
      problems: adaptedProblems,
      problemIds: adaptedProblems.map(p => p.id),
      revisionProblems: adaptedRevision,
      revisionProblemIds: adaptedRevision.map(p => p.id),
      estimatedMinutes: totalEst,
      focusPatterns: Array.from(updatedPatSet),
      _adapted: dayModified,
    };
  });

  // ─── Build adaptation reasons ───
  if (delta.addedRevision > 0) {
    reasons.push(`Revision pressure high (${adaptiveState.revisionPressure}/100) — added ${delta.addedRevision} revision slot(s)`);
  }
  if (delta.addedWeakPatternProblems > 0) {
    reasons.push(`Weak areas detected: ${adaptiveState.weakFamilies.slice(0, 3).join(", ")} — added ${delta.addedWeakPatternProblems} reinforcement problem(s)`);
  }
  if (delta.removedHard > 0) {
    reasons.push(`Difficulty trend: reduce — removed ${delta.removedHard} Hard problem(s), replaced with Medium`);
  }
  if (adaptiveState.difficultyTrend === "increase" && delta.addedWeakPatternProblems > 0) {
    reasons.push("Strong recent performance — difficulty increased in select days");
  }
  if (adaptiveState.weakFamilies.length > 0) {
    reasons.push(`Weak pattern families: ${adaptiveState.weakFamilies.slice(0, 3).join(", ")}`);
  }
  if (adaptiveState.strongFamilies.length > 0) {
    reasons.push(`Strong families maintained: ${adaptiveState.strongFamilies.slice(0, 2).join(", ")}`);
  }
  if (reasons.length === 0) {
    reasons.push("Performance within normal ranges — minimal plan adjustment needed");
  }

  const newPlanVersion = (plan.planVersion || 1) + 1;

  const adaptedPlan = {
    ...plan,
    days: adaptedDays,
    planVersion: newPlanVersion,
    lastAdaptedAt: new Date(nowMs).toISOString(),
    adaptationVersion: adaptiveState.adaptationVersion,
  };

  // Return adapted plan and updated adaptive state with reasons + delta
  const finalAdaptiveState = {
    ...adaptiveState,
    adaptationReasons: reasons,
    planDelta: delta,
  };

  return { adaptedPlan, finalAdaptiveState };
}

// ──────────────────────────────────────────────────────────────
// 11. COOLDOWN CHECK
// ──────────────────────────────────────────────────────────────

/**
 * Returns true if enough time has passed since the last adaptation.
 * @param {string|null} lastEvaluatedAt - ISO string
 * @param {number} nowMs
 * @returns {boolean}
 */
export function canAdaptNow(lastEvaluatedAt, nowMs = Date.now()) {
  if (!lastEvaluatedAt) return true;
  const last = new Date(lastEvaluatedAt).getTime();
  return (nowMs - last) >= ADAPTATION_COOLDOWN_MS;
}
