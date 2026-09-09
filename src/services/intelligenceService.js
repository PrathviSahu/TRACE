/**
 * Deterministic PRNG (Mulberry32)
 * Ensures reproducible problem selection and test sets
 */
export function mulberry32(seed) {
  let s = typeof seed === "string"
    ? seed.split("").reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) | 0, 0)
    : (Number(seed) || 42);
  return function() {
    s |= 0; s = s + 0x6D2B79F5 | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─────────────────────────────────────────────────────────────
//  TRACE — Interview Intelligence & Readiness Engine
//  Deterministic scoring, weak area detection, and cross-company analytics.
//  No AI or synthetic statistics — grounded in dataset + user telemetry.
// ─────────────────────────────────────────────────────────────
import { getProblemKey, NORMALIZED_PROBLEMS } from "../data/companyUtils.js";
import { getProblemPatternDetails, computeCompanyPatternStats } from "../data/patternMapping.js";
import { COMPANY_DATA } from "../data/companyData.js";

/**
 * Calculates a deterministic practice priority score (0–100) for a problem.
 *
 * Scoring Architecture:
 * ─────────────────────────────────────────────────────────────
 * BASE SCORE (Up to 100 points):
 *   1. Frequency:  up to 40 pts  (historical interview frequency normalized to 40)
 *   2. Recency:    up to 25 pts  (30 Days = 25 pts, 6 Months = 15 pts)
 *   3. Status:     up to 25 pts  (forgot_approach = 25, need_revision = 22, unsolved = 18, solved = 2)
 *   4. Difficulty: up to 10 pts  (Medium = 10, Hard = 8, Easy = 5)
 *
 * DYNAMIC MODIFIERS (Applied on top of Base Score):
 *   5. Confidence Modifier:
 *      - Low Confidence:  +8 pts
 *      - Medium:          +2 pts
 *      - High Confidence: -8 pts (or -20 pts if solved to de-prioritize mastered items)
 *   6. Spaced-Repetition Decay:
 *      - Up to +5 pts if revision item has been unattempted for > 7 days
 *
 * Final score is clamped to [5, 100].
 * Priority Tiers: Critical (>= 80), High (65-79), Medium (45-64), Low (< 45).
 * ─────────────────────────────────────────────────────────────
 */
export function calculatePriorityScore(problem, progressEntry) {
  const status = progressEntry?.status || "unsolved";
  const confidence = progressEntry?.confidence || null;
  const attempts = progressEntry?.attempts || 0;
  const lastAttempted = progressEntry?.lastAttempted ? new Date(progressEntry.lastAttempted) : null;

  // 1. Frequency weight (0 - 40 pts)
  const freq = problem.frequency || 50;
  const freqScore = Math.min(40, (freq / 100) * 40);

  // 2. Recency weight (0 - 25 pts)
  const is30d = problem.recency === "30 Days";
  const recencyScore = is30d ? 25 : 15;

  // 3. User Progress status (0 - 25 pts)
  let statusScore = 18; // default: unsolved
  let reasonStatus = "Unsolved";

  if (status === "forgot_approach") {
    statusScore = 25;
    reasonStatus = "Forgot Approach";
  } else if (status === "need_revision") {
    statusScore = 22;
    reasonStatus = "Need Revision";
  } else if (status === "solved") {
    statusScore = 2;
    reasonStatus = "Solved";
  }

  // 4. Difficulty weight (0 - 10 pts)
  const diff = (problem.difficulty || "Medium").toLowerCase();
  let diffScore = 10; // Medium is standard technical interview standard
  if (diff === "hard") diffScore = 8;
  else if (diff === "easy") diffScore = 5;

  // 5. Confidence modifier
  let confMod = 0;
  if (confidence === "low") confMod = 8;
  else if (confidence === "medium") confMod = 2;
  else if (confidence === "high") {
    confMod = -8;
    if (status === "solved") confMod = -20; // Mastered questions yield to unmastered
  }

  // 6. Spaced repetition decay
  let decayMod = 0;
  if (lastAttempted && (status === "need_revision" || status === "forgot_approach")) {
    const daysSince = (Date.now() - lastAttempted.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince > 7) decayMod = 5;
    else if (daysSince > 3) decayMod = 3;
  }

  let totalScore = Math.round(freqScore + recencyScore + statusScore + diffScore + confMod + decayMod);
  totalScore = Math.max(5, Math.min(100, totalScore));

  // Determine priority tier
  let tier = "Medium";
  let color = "#79a8ff";
  if (totalScore >= 80) {
    tier = "Critical";
    color = "#ef4743";
  } else if (totalScore >= 65) {
    tier = "High";
    color = "#ffa116";
  } else if (totalScore < 45) {
    tier = "Low";
    color = "#6e7681";
  }

  // Formulate concise explanatory reason
  let reason = `${freq >= 75 ? "High Frequency" : "Standard Frequency"} • ${reasonStatus}`;
  if (is30d && status !== "solved") {
    reason = `Recent (30d) • ${reasonStatus}`;
  } else if (status === "forgot_approach") {
    reason = `Priority Target • Forgot Approach`;
  } else if (status === "need_revision") {
    reason = `Revision Required • ${confidence || "medium"} confidence`;
  } else if (status === "solved" && confidence === "low") {
    reason = `Solved • Needs Reinforcement`;
  }

  return {
    score: totalScore,
    tier,
    color,
    reason,
    breakdown: {
      freqScore: Math.round(freqScore),
      recencyScore,
      statusScore,
      diffScore,
      confMod,
      decayMod
    }
  };
}

/**
 * Calculates TRACE Interview Readiness for a company (0–100%)
 */
export function calculateCompanyReadiness(companyId, problems, progressMap) {
  if (!problems || problems.length === 0) {
    return {
      overall: 0,
      problemCoverage: 0,
      patternCoverage: 0,
      revisionHealth: 0,
      difficultyCoverage: 0,
      label: "Not Started"
    };
  }

  let totalFreq = 0;
  let solvedFreq = 0;
  let solvedCount = 0;
  let revisionCount = 0;
  let forgotCount = 0;

  let easyTotal = 0, medTotal = 0, hardTotal = 0;
  let easySolved = 0, medSolved = 0, hardSolved = 0;

  const patternsInCompany = new Set();
  const solvedPatterns = new Set();

  for (const p of problems) {
    const key = getProblemKey(p);
    const prog = progressMap[key];
    const st = prog?.status || "unsolved";
    const freq = p.frequency || 50;

    totalFreq += freq;

    const diff = (p.difficulty || "Medium").toLowerCase();
    if (diff === "easy") easyTotal++;
    else if (diff === "hard") hardTotal++;
    else medTotal++;

    const { patterns } = getProblemPatternDetails(p);
    patterns.forEach(pat => patternsInCompany.add(pat));

    if (st === "solved") {
      solvedCount++;
      solvedFreq += freq;
      if (diff === "easy") easySolved++;
      else if (diff === "hard") hardSolved++;
      else medSolved++;
      patterns.forEach(pat => solvedPatterns.add(pat));
    } else if (st === "need_revision") {
      revisionCount++;
    } else if (st === "forgot_approach") {
      forgotCount++;
    }
  }

  // 1. Problem Coverage (0 - 100%) - weighted by frequency
  const problemCoverage = totalFreq > 0 ? Math.round((solvedFreq / totalFreq) * 100) : 0;

  // 2. Pattern Coverage (0 - 100%)
  const patternCoverage = patternsInCompany.size > 0
    ? Math.round((solvedPatterns.size / patternsInCompany.size) * 100)
    : 0;

  // 3. Revision Health (0 - 100%)
  // Starts high for solved, deducted for unresolved forgot_approach and need_revision
  let revisionHealth = 0;
  const attemptedCount = solvedCount + revisionCount + forgotCount;
  if (attemptedCount > 0) {
    const deductions = (forgotCount * 20) + (revisionCount * 12);
    revisionHealth = Math.max(10, Math.min(100, Math.round(100 - (deductions / attemptedCount) * 50)));
  }

  // 4. Difficulty Coverage (0 - 100%)
  const easyPct = easyTotal > 0 ? (easySolved / easyTotal) : 0;
  const medPct = medTotal > 0 ? (medSolved / medTotal) : 0;
  const hardPct = hardTotal > 0 ? (hardSolved / hardTotal) : 0;
  const difficultyCoverage = Math.round((easyPct * 0.25 + medPct * 0.50 + hardPct * 0.25) * 100);

  // Overall Weighted Score
  const overall = Math.round(
    problemCoverage * 0.35 +
    patternCoverage * 0.30 +
    revisionHealth * 0.20 +
    difficultyCoverage * 0.15
  );

  let label = "Needs Focus";
  if (overall >= 80) label = "Interview Ready";
  else if (overall >= 60) label = "Strong Progress";
  else if (overall >= 35) label = "Developing Foundation";

  return {
    overall,
    label,
    problemCoverage,
    patternCoverage,
    revisionHealth,
    difficultyCoverage,
    counts: {
      total: problems.length,
      solved: solvedCount,
      revision: revisionCount,
      forgot: forgotCount,
      patternsTotal: patternsInCompany.size,
      patternsSolved: solvedPatterns.size,
      easyTotal, easySolved,
      medTotal, medSolved,
      hardTotal, hardSolved,
    }
  };
}

/**
 * Detects weak areas and prioritizes focus recommendations
 */
export function detectFocusAreas(problems, progressMap) {
  const patternStats = {};
  let hardTotal = 0, hardSolved = 0;
  const revisionProblems = [];
  const forgotProblems = [];

  for (const p of problems) {
    const key = getProblemKey(p);
    const prog = progressMap[key];
    const st = prog?.status || "unsolved";

    const { patterns } = getProblemPatternDetails(p);
    for (const pat of patterns) {
      if (!patternStats[pat]) patternStats[pat] = { total: 0, solved: 0, problems: [] };
      patternStats[pat].total++;
      patternStats[pat].problems.push(p);
      if (st === "solved") patternStats[pat].solved++;
    }

    if ((p.difficulty || "").toLowerCase() === "hard") {
      hardTotal++;
      if (st === "solved") hardSolved++;
    }

    if (st === "forgot_approach") forgotProblems.push(p);
    else if (st === "need_revision") revisionProblems.push(p);
  }

  // Find weak patterns (patterns with total >= 2 and solved == 0 or low completion)
  const weakPatterns = Object.entries(patternStats)
    .filter(([_, data]) => data.total >= 2 && (data.solved / data.total) < 0.4)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 4)
    .map(([pat, data]) => ({
      pattern: pat,
      total: data.total,
      solved: data.solved,
      pct: Math.round((data.solved / data.total) * 100),
      recommendedProblem: data.problems.find(p => (progressMap[getProblemKey(p)]?.status || "unsolved") !== "solved") || data.problems[0]
    }));

  const weakDifficulty = (hardTotal > 0 && (hardSolved / hardTotal) < 0.3) ? {
    difficulty: "Hard",
    total: hardTotal,
    solved: hardSolved,
    pct: Math.round((hardSolved / hardTotal) * 100)
  } : null;

  return {
    weakPatterns,
    weakDifficulty,
    revisionRequiredCount: revisionProblems.length + forgotProblems.length,
    revisionProblems,
    forgotProblems,
  };
}

/**
 * Generates a balanced 3-problem mock interview set
 */
export function generateMockInterviewSet(problems, seed = 42) {
  if (!problems || problems.length === 0) return [];

  const rng = typeof seed === "function" ? seed : mulberry32(seed);
  const pick = (arr) => arr[Math.floor(rng() * arr.length)];

  const easies = problems.filter(p => (p.difficulty || "").toLowerCase() === "easy");
  const mediums = problems.filter(p => (p.difficulty || "").toLowerCase() === "medium");
  const hards = problems.filter(p => (p.difficulty || "").toLowerCase() === "hard");

  const selected = [];
  if (easies.length > 0) selected.push(pick(easies));
  else if (mediums.length > 0) selected.push(pick(mediums));

  if (mediums.length > 0) {
    const remainMeds = mediums.filter(p => !selected.includes(p));
    selected.push(remainMeds.length > 0 ? pick(remainMeds) : pick(mediums));
  }

  if (hards.length > 0) selected.push(pick(hards));
  else if (mediums.length > 1) {
    const remain = mediums.filter(p => !selected.includes(p));
    selected.push(remain.length > 0 ? pick(remain) : pick(mediums));
  }

  return selected.filter(Boolean);
}

/**
 * Compares two companies using normalized problem cross-reference
 */
export function compareCompanies(companyIdA, companyIdB) {
  const compA = COMPANY_DATA[companyIdA];
  const compB = COMPANY_DATA[companyIdB];
  if (!compA || !compB) return null;

  const probsA = [...(compA.thirtyDays || []), ...(compA.sixMonths || [])];
  const probsB = [...(compB.thirtyDays || []), ...(compB.sixMonths || [])];

  const mapA = new Map();
  const mapB = new Map();

  for (const p of probsA) {
    const key = getProblemKey(p);
    if (!mapA.has(key)) mapA.set(key, p);
  }
  for (const p of probsB) {
    const key = getProblemKey(p);
    if (!mapB.has(key)) mapB.set(key, p);
  }

  const shared = [];
  const uniqueA = [];
  const uniqueB = [];

  for (const [key, p] of mapA.entries()) {
    if (mapB.has(key)) {
      shared.push({
        ...p,
        frequencyInA: p.frequency || 0,
        frequencyInB: mapB.get(key).frequency || 0,
      });
    } else {
      uniqueA.push(p);
    }
  }

  for (const [key, p] of mapB.entries()) {
    if (!mapA.has(key)) {
      uniqueB.push(p);
    }
  }

  // Sort shared by combined frequency
  shared.sort((a, b) => (b.frequencyInA + b.frequencyInB) - (a.frequencyInA + a.frequencyInB));

  const statsA = computeCompanyPatternStats(Array.from(mapA.values()));
  const statsB = computeCompanyPatternStats(Array.from(mapB.values()));

  return {
    companyA: { id: compA.id, name: compA.name, tier: compA.tier, icon: compA.icon, color: compA.color, total: mapA.size, topPatterns: statsA.patterns.slice(0, 6) },
    companyB: { id: compB.id, name: compB.name, tier: compB.tier, icon: compB.icon, color: compB.color, total: mapB.size, topPatterns: statsB.patterns.slice(0, 6) },
    sharedCount: shared.length,
    uniqueACount: uniqueA.length,
    uniqueBCount: uniqueB.length,
    sharedProblems: shared,
    overlapPercent: Math.round((shared.length / Math.min(mapA.size, mapB.size)) * 100),
  };
}
