// ─────────────────────────────────────────────────────────────
//  TRACE — Adaptive State Persistence Layer
//  Phase 3.3: Stores AdaptiveState and adaptation history ring buffer.
// ─────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback } from "react";

export const ADAPTIVE_STATE_KEY = "trace_adaptive_state";
export const ADAPTATION_HISTORY_KEY = "trace_adaptation_history";

/** Max adaptation history entries retained */
export const MAX_HISTORY_ENTRIES = 10;

/**
 * Reads current AdaptiveState from localStorage.
 * @returns {Object|null}
 */
export function getAdaptiveState() {
  try {
    if (typeof localStorage === "undefined" || !localStorage) return null;
    const raw = localStorage.getItem(ADAPTIVE_STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn("Failed to read adaptive state:", err);
    return null;
  }
}

/**
 * Saves AdaptiveState to localStorage and appends a history entry.
 * @param {Object} adaptiveState
 * @returns {Object} the saved state
 */
export function saveAdaptiveState(adaptiveState) {
  if (!adaptiveState) return null;
  try {
    localStorage.setItem(ADAPTIVE_STATE_KEY, JSON.stringify(adaptiveState));

    // Append to history ring buffer
    const rawHistory = localStorage.getItem(ADAPTATION_HISTORY_KEY);
    const history = rawHistory ? JSON.parse(rawHistory) : [];
    history.unshift({
      adaptationVersion: adaptiveState.adaptationVersion,
      lastEvaluatedAt: adaptiveState.lastEvaluatedAt,
      weakFamilies: adaptiveState.weakFamilies || [],
      strongFamilies: adaptiveState.strongFamilies || [],
      revisionPressure: adaptiveState.revisionPressure,
      difficultyTrend: adaptiveState.difficultyTrend,
      reasons: adaptiveState.adaptationReasons || [],
      delta: adaptiveState.planDelta || {},
    });

    // Keep only last N entries
    if (history.length > MAX_HISTORY_ENTRIES) {
      history.splice(MAX_HISTORY_ENTRIES);
    }
    localStorage.setItem(ADAPTATION_HISTORY_KEY, JSON.stringify(history));

    // Dispatch reactive event
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("trace_adaptive_state_updated", {
        detail: { adaptiveState }
      }));
    }
  } catch (err) {
    console.error("Failed to save adaptive state:", err);
  }
  return adaptiveState;
}

/**
 * Reads adaptation history ring buffer.
 * @returns {Array}
 */
export function getAdaptationHistory() {
  try {
    if (typeof localStorage === "undefined" || !localStorage) return [];
    const raw = localStorage.getItem(ADAPTATION_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn("Failed to read adaptation history:", err);
    return [];
  }
}

/**
 * Clears adaptive state and history.
 */
export function clearAdaptiveState() {
  try {
    localStorage.removeItem(ADAPTIVE_STATE_KEY);
    localStorage.removeItem(ADAPTATION_HISTORY_KEY);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("trace_adaptive_state_updated", {
        detail: { adaptiveState: null }
      }));
    }
  } catch (err) {
    console.error("Failed to clear adaptive state:", err);
  }
}

/**
 * React hook to subscribe to reactive AdaptiveState updates.
 */
export function useAdaptiveState() {
  const [adaptiveState, setAdaptiveState] = useState(() => getAdaptiveState());
  const [history, setHistory] = useState(() => getAdaptationHistory());

  useEffect(() => {
    function handleUpdate() {
      setAdaptiveState(getAdaptiveState());
      setHistory(getAdaptationHistory());
    }
    window.addEventListener("trace_adaptive_state_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("trace_adaptive_state_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const save = useCallback((state) => saveAdaptiveState(state), []);
  const clear = useCallback(() => clearAdaptiveState(), []);

  return { adaptiveState, history, saveAdaptiveState: save, clearAdaptiveState: clear };
}
