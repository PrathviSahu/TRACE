// ─────────────────────────────────────────────────────────────
//  TRACE — Unified Problem Progress & Performance Store
//  Dual-writes to 'trace_problem_progress' and 'trace_solved_problems'
//  Supports: unsolved | solved | need_revision | forgot_approach
//  Phase 3.1: Extends normalized ProblemPerformance, PatternPerformance & TopicPerformance models
// ─────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback } from "react";
import { DSA_TOPICS, DSA_PATTERNS, getPatternFamily, getProblemPatternDetails } from "../data/patternMapping.js";
import { NORMALIZED_PROBLEMS } from "../data/companyUtils.js";

const PROGRESS_KEY = "trace_problem_progress";
const LEGACY_KEY = "trace_solved_problems";

/**
 * Normalizes problem ID to a consistent string key
 */
export function getProblemKey(problemOrId) {
  if (!problemOrId && problemOrId !== 0) return "unknown";
  if (typeof problemOrId === "object") {
    return String(problemOrId.id ?? problemOrId.title?.toLowerCase().replace(/\s+/g, "-") ?? "unknown");
  }
  return String(problemOrId);
}

/**
 * Reads all progress objects from localStorage, seamlessly migrating legacy solved IDs
 */
export function getAllProgress() {
  try {
    if (typeof localStorage === "undefined" || !localStorage) return {};
    const rawProgress = localStorage.getItem(PROGRESS_KEY);
    const progressMap = rawProgress ? JSON.parse(rawProgress) : {};

    // Legacy compatibility: check trace_solved_problems
    const rawLegacy = localStorage.getItem(LEGACY_KEY);
    const legacySolved = rawLegacy ? JSON.parse(rawLegacy) : [];

    let migrated = false;
    for (const id of legacySolved) {
      const key = String(id);
      if (!progressMap[key] || progressMap[key].status !== "solved") {
        progressMap[key] = {
          status: "solved",
          attempts: progressMap[key]?.attempts || 1,
          lastAttempted: progressMap[key]?.lastAttempted || null,
          confidence: progressMap[key]?.confidence || "medium",
          timeSpentSeconds: progressMap[key]?.timeSpentSeconds || 0,
          hintsUsed: progressMap[key]?.hintsUsed || 0,
          solutionViewed: Boolean(progressMap[key]?.solutionViewed),
          lastSolvedAt: progressMap[key]?.lastSolvedAt || null,
          lastReviewedAt: progressMap[key]?.lastReviewedAt || null,
          reviewStatus: progressMap[key]?.reviewStatus || "completed",
          consecutiveSuccesses: progressMap[key]?.consecutiveSuccesses || 1,
          consecutiveFailures: progressMap[key]?.consecutiveFailures || 0,
        };
        migrated = true;
      }
    }

    if (migrated) {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(progressMap));
    }

    return progressMap;
  } catch (err) {
    console.warn("Failed to read progress store:", err);
    return {};
  }
}

/**
 * Gets progress metadata for a specific problem
 */
export function getProblemProgress(problemOrId) {
  const key = getProblemKey(problemOrId);
  const all = getAllProgress();
  return all[key] || {
    status: "unsolved",
    attempts: 0,
    lastAttempted: null,
    confidence: null,
    timeSpentSeconds: 0,
    hintsUsed: 0,
    solutionViewed: false,
    lastSolvedAt: null,
    lastReviewedAt: null,
    reviewStatus: "none",
    consecutiveSuccesses: 0,
    consecutiveFailures: 0,
  };
}

/**
 * Gets normalized ProblemPerformance model for a problem (Phase 3.1 Step 5)
 */
export function getProblemPerformance(problemOrId) {
  const key = getProblemKey(problemOrId);
  const raw = getProblemProgress(key);
  return {
    problemId: key,
    status: raw.status || "unsolved",
    attempts: raw.attempts || 0,
    solved: raw.status === "solved",
    timeSpentSeconds: raw.timeSpentSeconds || 0,
    hintsUsed: raw.hintsUsed || 0,
    solutionViewed: Boolean(raw.solutionViewed),
    confidence: raw.confidence || null,
    lastAttemptedAt: raw.lastAttempted || null,
    lastSolvedAt: raw.lastSolvedAt || (raw.status === "solved" ? raw.lastAttempted : null),
    lastReviewedAt: raw.lastReviewedAt || null,
    reviewStatus: raw.reviewStatus || (
      raw.status === "need_revision" || raw.status === "forgot_approach" ? "due" : (
        raw.status === "solved" ? "completed" : "none"
      )
    ),
    consecutiveSuccesses: raw.consecutiveSuccesses || (raw.status === "solved" ? 1 : 0),
    consecutiveFailures: raw.consecutiveFailures || (raw.status === "forgot_approach" ? 1 : 0),
  };
}

/**
 * Gets all normalized ProblemPerformance records mapped by problemId
 */
export function getAllProblemPerformances() {
  const all = getAllProgress();
  const performances = {};
  for (const key of Object.keys(all)) {
    performances[key] = getProblemPerformance(key);
  }
  return performances;
}

/**
 * Updates progress for a specific problem and maintains dual-write to legacy solved array
 */
export function updateProblemProgress(problemOrId, updates) {
  const key = getProblemKey(problemOrId);
  const all = getAllProgress();
  const current = all[key] || {
    status: "unsolved",
    attempts: 0,
    lastAttempted: null,
    confidence: null,
    timeSpentSeconds: 0,
    hintsUsed: 0,
    solutionViewed: false,
    lastSolvedAt: null,
    lastReviewedAt: null,
    reviewStatus: "none",
    consecutiveSuccesses: 0,
    consecutiveFailures: 0,
  };

  const nextStatus = updates.status !== undefined ? updates.status : current.status;
  const isStatusChanging = updates.status && updates.status !== current.status;
  const nextAttempts = updates.attempts !== undefined ? updates.attempts : (
    isStatusChanging ? (current.attempts || 0) + 1 : (current.attempts || 0)
  );

  const nowIso = new Date().toISOString();
  const nextLastAttempted = updates.lastAttempted !== undefined ? updates.lastAttempted : (
    updates.lastAttemptedAt !== undefined ? updates.lastAttemptedAt : (
      updates.status ? nowIso : current.lastAttempted
    )
  );

  const nextConfidence = updates.confidence !== undefined ? updates.confidence : current.confidence;
  const nextTimeSpent = updates.timeSpentSeconds !== undefined ? updates.timeSpentSeconds : (current.timeSpentSeconds || 0);
  const nextHints = updates.hintsUsed !== undefined ? updates.hintsUsed : (current.hintsUsed || 0);
  const nextSolutionViewed = updates.solutionViewed !== undefined ? Boolean(updates.solutionViewed) : Boolean(current.solutionViewed);

  let nextLastSolvedAt = updates.lastSolvedAt !== undefined ? updates.lastSolvedAt : current.lastSolvedAt;
  let nextLastReviewedAt = updates.lastReviewedAt !== undefined ? updates.lastReviewedAt : current.lastReviewedAt;
  let nextReviewStatus = updates.reviewStatus !== undefined ? updates.reviewStatus : (current.reviewStatus || "none");
  let nextConsecutiveSuccesses = updates.consecutiveSuccesses !== undefined ? updates.consecutiveSuccesses : (current.consecutiveSuccesses || 0);
  let nextConsecutiveFailures = updates.consecutiveFailures !== undefined ? updates.consecutiveFailures : (current.consecutiveFailures || 0);

  if (nextStatus === "solved") {
    if (!nextLastSolvedAt || isStatusChanging) {
      nextLastSolvedAt = nowIso;
    }
    if (isStatusChanging) {
      nextConsecutiveSuccesses = (current.consecutiveSuccesses || 0) + 1;
      nextConsecutiveFailures = 0;
      nextReviewStatus = "completed";
    }
  } else if (nextStatus === "need_revision" || nextStatus === "forgot_approach") {
    nextLastReviewedAt = nowIso;
    if (isStatusChanging) {
      nextConsecutiveFailures = (current.consecutiveFailures || 0) + 1;
      nextConsecutiveSuccesses = 0;
      nextReviewStatus = "due";
    }
  }

  const nextEntry = {
    status: nextStatus,
    attempts: nextAttempts,
    lastAttempted: nextLastAttempted,
    confidence: nextConfidence,
    timeSpentSeconds: nextTimeSpent,
    hintsUsed: nextHints,
    solutionViewed: nextSolutionViewed,
    lastSolvedAt: nextLastSolvedAt,
    lastReviewedAt: nextLastReviewedAt,
    reviewStatus: nextReviewStatus,
    consecutiveSuccesses: nextConsecutiveSuccesses,
    consecutiveFailures: nextConsecutiveFailures,
  };

  all[key] = nextEntry;

  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(all));

    // Synchronize legacy trace_solved_problems
    const rawLegacy = localStorage.getItem(LEGACY_KEY);
    let legacyList = rawLegacy ? JSON.parse(rawLegacy) : [];
    const numId = Number(key);
    const targetId = isNaN(numId) ? key : numId;

    if (nextStatus === "solved") {
      if (!legacyList.some(item => String(item) === key)) {
        legacyList.push(targetId);
      }
    } else {
      legacyList = legacyList.filter(item => String(item) !== key);
    }
    localStorage.setItem(LEGACY_KEY, JSON.stringify(legacyList));

    // Dispatch global event for instant reactive updates across views
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("trace_progress_updated", {
        detail: { key, progress: nextEntry }
      }));
    }
  } catch (err) {
    console.error("Failed to write progress store:", err);
  }

  return nextEntry;
}

/**
 * Computes deterministic PatternPerformance metrics across problems (Phase 3.1 Step 6)
 * @param {Array} problems - Optional problem list (defaults to all normalized problems)
 * @param {Object} progressMap - Optional progress map (defaults to current progress store)
 */
export function computePatternPerformance(problems = null, progressMap = null) {
  const problemList = problems || Array.from(NORMALIZED_PROBLEMS.values());
  const progress = progressMap || getAllProgress();

  // Bucket problems by canonical pattern
  const patternBuckets = new Map();

  for (const p of problemList) {
    const details = getProblemPatternDetails(p);
    const patterns = details?.patterns && details.patterns.length > 0 ? details.patterns : ["Unclassified"];

    for (const pat of patterns) {
      if (!patternBuckets.has(pat)) {
        patternBuckets.set(pat, []);
      }
      patternBuckets.get(pat).push(p);
    }
  }

  // Ensure all canonical patterns are represented even if no problems present
  const allCanonical = Array.from(new Set([...DSA_PATTERNS, ...Array.from(patternBuckets.keys())]));

  return allCanonical.map(pattern => {
    const bucket = patternBuckets.get(pattern) || [];
    let attempts = 0;
    let solved = 0;
    let totalTime = 0;
    let timedCount = 0;
    let lastPracticedAt = null;
    let highConfCount = 0;
    let medConfCount = 0;
    let lowConfCount = 0;

    for (const prob of bucket) {
      const pKey = getProblemKey(prob);
      const prog = progress[pKey];
      if (prog) {
        attempts += (prog.attempts || 0);
        if (prog.status === "solved") solved += 1;
        if (prog.timeSpentSeconds) {
          totalTime += prog.timeSpentSeconds;
          timedCount += 1;
        }
        if (prog.lastAttempted) {
          if (!lastPracticedAt || new Date(prog.lastAttempted) > new Date(lastPracticedAt)) {
            lastPracticedAt = prog.lastAttempted;
          }
        }
        if (prog.confidence === "high") highConfCount++;
        else if (prog.confidence === "medium") medConfCount++;
        else if (prog.confidence === "low") lowConfCount++;
      }
    }

    const total = bucket.length;
    const successRate = total > 0 ? Number((solved / total).toFixed(2)) : 0;
    const averageTimeSeconds = timedCount > 0 ? Math.round(totalTime / timedCount) : 0;

    let aggregateConfidence = "neutral";
    if (highConfCount >= medConfCount && highConfCount >= lowConfCount && highConfCount > 0) aggregateConfidence = "high";
    else if (lowConfCount > medConfCount && lowConfCount > highConfCount) aggregateConfidence = "low";
    else if (medConfCount > 0) aggregateConfidence = "medium";

    // Deterministic mastery score (0-100)
    const masteryScore = total > 0 ? Math.min(100, Math.round((solved / total) * 100)) : 0;

    return {
      pattern,
      family: getPatternFamily(pattern),
      attempts,
      solved,
      total,
      successRate,
      averageTimeSeconds,
      confidence: aggregateConfidence,
      lastPracticedAt,
      masteryScore,
    };
  }).sort((a, b) => b.total - a.total);
}

/**
 * Computes deterministic TopicPerformance metrics across problems (Phase 3.1 Step 7)
 * @param {Array} problems - Optional problem list (defaults to all normalized problems)
 * @param {Object} progressMap - Optional progress map (defaults to current progress store)
 */
export function computeTopicPerformance(problems = null, progressMap = null) {
  const problemList = problems || Array.from(NORMALIZED_PROBLEMS.values());
  const progress = progressMap || getAllProgress();

  const topicBuckets = new Map();

  for (const p of problemList) {
    const rawTopics = p.topics && p.topics.length > 0 ? p.topics : [getProblemPatternDetails(p).topic || "General"];
    for (const t of rawTopics) {
      if (!topicBuckets.has(t)) {
        topicBuckets.set(t, []);
      }
      topicBuckets.get(t).push(p);
    }
  }

  const allTopics = Array.from(new Set([...DSA_TOPICS, ...Array.from(topicBuckets.keys())]));

  return allTopics.map(topic => {
    const bucket = topicBuckets.get(topic) || [];
    let attempts = 0;
    let solved = 0;
    let totalTime = 0;
    let timedCount = 0;
    let lastPracticedAt = null;

    for (const prob of bucket) {
      const pKey = getProblemKey(prob);
      const prog = progress[pKey];
      if (prog) {
        attempts += (prog.attempts || 0);
        if (prog.status === "solved") solved += 1;
        if (prog.timeSpentSeconds) {
          totalTime += prog.timeSpentSeconds;
          timedCount += 1;
        }
        if (prog.lastAttempted) {
          if (!lastPracticedAt || new Date(prog.lastAttempted) > new Date(lastPracticedAt)) {
            lastPracticedAt = prog.lastAttempted;
          }
        }
      }
    }

    const total = bucket.length;
    const successRate = total > 0 ? Number((solved / total).toFixed(2)) : 0;
    const averageTimeSeconds = timedCount > 0 ? Math.round(totalTime / timedCount) : 0;
    const masteryScore = total > 0 ? Math.min(100, Math.round((solved / total) * 100)) : 0;

    return {
      topic,
      attempts,
      solved,
      total,
      successRate,
      averageTimeSeconds,
      confidence: masteryScore >= 70 ? "high" : masteryScore >= 40 ? "medium" : "low",
      lastPracticedAt,
      masteryScore,
    };
  }).sort((a, b) => b.total - a.total);
}

/**
 * React hook to subscribe to reactive progress updates across all problems
 */
export function useAllProgress() {
  const [progress, setProgress] = useState(() => getAllProgress());

  useEffect(() => {
    function handleUpdate() {
      setProgress(getAllProgress());
    }
    window.addEventListener("trace_progress_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("trace_progress_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const updateProgress = useCallback((problemOrId, updates) => {
    return updateProblemProgress(problemOrId, updates);
  }, []);

  return { progress, updateProgress };
}

/**
 * React hook to subscribe to a single problem progress
 */
export function useProblemProgress(problemOrId) {
  const key = getProblemKey(problemOrId);
  const [prog, setProg] = useState(() => getProblemProgress(key));

  useEffect(() => {
    function handleUpdate(e) {
      if (!e.detail || e.detail.key === key) {
        setProg(getProblemProgress(key));
      }
    }
    window.addEventListener("trace_progress_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("trace_progress_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [key]);

  const update = useCallback((updates) => {
    return updateProblemProgress(key, updates);
  }, [key]);

  return [prog, update];
}
