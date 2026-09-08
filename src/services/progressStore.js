// ─────────────────────────────────────────────────────────────
//  TRACE — Unified Problem Progress & Revision Store
//  Dual-writes to 'trace_problem_progress' and 'trace_solved_problems'
//  Supports: unsolved | solved | need_revision | forgot_approach
// ─────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback } from "react";

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
  };
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
  };

  const nextStatus = updates.status !== undefined ? updates.status : current.status;
  const nextAttempts = updates.attempts !== undefined ? updates.attempts : (
    updates.status && updates.status !== current.status ? current.attempts + 1 : current.attempts
  );
  const nextLastAttempted = updates.lastAttempted !== undefined ? updates.lastAttempted : (
    updates.status ? new Date().toISOString() : current.lastAttempted
  );
  const nextConfidence = updates.confidence !== undefined ? updates.confidence : current.confidence;

  const nextEntry = {
    status: nextStatus,
    attempts: nextAttempts,
    lastAttempted: nextLastAttempted,
    confidence: nextConfidence,
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
    window.dispatchEvent(new CustomEvent("trace_progress_updated", {
      detail: { key, progress: nextEntry }
    }));
  } catch (err) {
    console.error("Failed to write progress store:", err);
  }

  return nextEntry;
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
