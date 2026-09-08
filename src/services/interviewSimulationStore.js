// ─────────────────────────────────────────────────────────────
//  TRACE — Interview Simulation Store
//  Phase 3.4: Persistent state management for timed interview simulations.
//  Manages session lifecycle, active session recovery, history, and
//  dual-writes to progressStore for closed-loop Phase 3.3 adaptation.
// ─────────────────────────────────────────────────────────────

import { updateProblemProgress, getProblemKey } from "./progressStore.js";
import {
  calculateSessionTime,
  computeCorrectnessScore,
  computeTimeManagementScore,
  computeOverallRubricScore,
  RUBRIC_WEIGHTS,
} from "./interviewSimulationEngine.js";
import { computeDeterministicRubricFallback, validateEvaluationSchema } from "./interviewEvaluator.js";

export const STORAGE_KEYS = {
  SESSIONS: "trace_interview_sessions",
  ACTIVE_ID: "trace_active_interview_session",
  HISTORY: "trace_interview_history",
};

/**
 * Creates a blank InterviewSession record with deterministic defaults
 */
export const createInterviewSession = createSessionRecord;
let _simCounter = 0;
export function createSessionRecord(params = {}) {
  const {
    id,
    profileId = null,
    companyId = "microsoft",
    companyName = "Microsoft",
    role = "Software Engineer",
    problemId = 1,
    problemTitle = "",
    mode = "company",
    modeParam = null,
    seed = null,
    durationMinutes = 45,
    language = "java",
    initialCode = "",
  } = params;
  const nowIso = new Date().toISOString();
  const durationSeconds = Math.max(15 * 60, Math.min(180 * 60, durationMinutes * 60));

  return {
    id: id || `sim_${Date.now()}_${++_simCounter}`,
    profileId,
    companyId,
    companyName,
    role,
    problemId: String(problemId),
    problemTitle,
    mode, // "company" | "pattern" | "random" | "weakness"
    modeParam,
    seed: seed || `${companyId}_${problemId}_${mode}`,

    status: "not_started", // "not_started" | "active" | "paused" | "expired" | "submitted"
    phase: "understanding", // "understanding" | "approach" | "coding" | "execution" | "followup" | "review" | "submitted"

    durationSeconds,
    startedAt: null,
    submittedAt: null,
    pausedAt: null,
    totalPausedSeconds: 0,
    lastResumedAt: null,
    elapsedSeconds: 0,

    attempts: 0,
    hintsUsed: 0,
    solutionViewed: false,

    code: initialCode || "",
    language: language || "java",

    approach: {
      summary: "",
      reasoning: "",
      edgeCases: "",
      timeComplexity: "",
      spaceComplexity: "",
    },

    attemptsHistory: [],

    executionEvidence: {
      compiled: false,
      executed: false,
      output: [],
      expectedOutput: null,
      passed: false,
      failed: false,
      testsPassed: 0,
      testsFailed: 0,
      testsTotal: 0,
      testResults: [],
      runtimeError: null,
      compileError: null,
      traceSteps: 0,
      executionDurationMs: 0,
    },

    followUps: [],

    rubricResult: null,

    createdAt: nowIso,
    updatedAt: nowIso,
  };
}

/**
 * Loads all sessions from localStorage
 * @returns {Record<string, Object>} map of sessionId -> session
 */
export function getAllSessions() {
  if (typeof window === "undefined" || !window.localStorage) return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error("Failed to load interview sessions from storage:", err);
    return {};
  }
}

/**
 * Retrieves a single session by ID
 * @param {string} sessionId
 * @returns {Object|null}
 */
export function getSession(sessionId) {
  if (!sessionId) return null;
  const sessions = getAllSessions();
  return sessions[sessionId] || null;
}

/**
 * Saves or updates an interview session in localStorage
 * @param {Object} session
 * @returns {Object} saved session
 */
export function saveInterviewSession(session) {
  if (!session || !session.id) return session;
  if (typeof window === "undefined" || !window.localStorage) return session;

  const nowIso = new Date().toISOString();
  const sessions = getAllSessions();

  // If already submitted, preserve frozen data — strictly block any modification
  const existing = sessions[session.id];
  if (existing && existing.status === "submitted") {
    console.warn(`Attempted to modify submitted session ${session.id} — modification blocked.`);
    return existing;
  }

  const updated = {
    ...session,
    updatedAt: nowIso,
  };

  sessions[session.id] = updated;

  try {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));

    // Update history index if session has concluded
    if (updated.status === "submitted" || updated.status === "expired") {
      updateHistoryIndex(updated);
    }

    if (typeof window !== "undefined" && typeof CustomEvent !== "undefined" && typeof window.dispatchEvent === "function") {
      try {
        window.dispatchEvent(new CustomEvent("trace_session_updated", { detail: { session: updated } }));
      } catch (_) {}
    }
  } catch (err) {
    console.error("Failed to save interview session to localStorage:", err);
  }

  return updated;
}

/**
 * Gets the active session ID if any
 */
export function getActiveSessionId() {
  if (typeof window === "undefined" || !window.localStorage) return null;
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_ID);
}

/**
 * Sets the active session ID (or clears it if null)
 */
export function setActiveSessionId(sessionId) {
  if (typeof window === "undefined" || !window.localStorage) return;
  if (sessionId) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ID, sessionId);
  } else {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_ID);
  }
}

/**
 * Retrieves the currently active session object (if exists)
 */
export function getActiveSession() {
  const activeId = getActiveSessionId();
  if (!activeId) return null;
  return getSession(activeId);
}

/**
 * Helper to update the lightweight history index
 */
function updateHistoryIndex(session) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    let history = raw ? JSON.parse(raw) : [];

    const item = {
      id: session.id,
      problemId: session.problemId,
      problemTitle: session.problemTitle,
      companyId: session.companyId,
      companyName: session.companyName,
      mode: session.mode,
      durationSeconds: session.durationSeconds,
      elapsedSeconds: session.elapsedSeconds,
      status: session.status,
      overallScore: session.rubricResult?.overallScore ?? null,
      submittedAt: session.submittedAt,
      createdAt: session.createdAt,
    };

    history = history.filter(h => h.id !== session.id);
    history.unshift(item); // newest first

    // Keep last 50
    if (history.length > 50) history = history.slice(0, 50);

    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  } catch (err) {
    console.error("Failed to update history index:", err);
  }
}

/**
 * Loads interview history summary list
 */
export function getInterviewHistory() {
  if (typeof window === "undefined" || !window.localStorage) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Freezes and finalizes an interview session upon submission.
 * Idempotent: safe to call multiple times.
 * Dual-writes structured performance signals to progressStore for Phase 3.3.
 */
export function submitInterviewSession(sessionId, finalPayload = {}) {
  const session = getSession(sessionId);
  if (!session) throw new Error(`Session ${sessionId} not found.`);

  // If already submitted, return the original frozen snapshot (Idempotency)
  if (session.status === "submitted") {
    return session;
  }

  const nowMs = Date.now();
  const nowIso = new Date(nowMs).toISOString();

  // 1. Calculate authoritative final elapsed time (clamped to duration if expired)
  // Elapsed time is DERIVED from session.startedAt, session.durationSeconds, and session.totalPausedMs.
  // NEVER accept caller-supplied elapsedSeconds or timing fields!
  const timeState = calculateSessionTime(session, nowMs);
  const finalElapsedSeconds = timeState.elapsedSeconds;

  // 2. Authoritative candidate inputs: ONLY adopt legitimate candidate fields
  const finalCode = (finalPayload.code !== undefined && finalPayload.code !== null)
    ? String(finalPayload.code)
    : (session.code || "");
  const finalExplanation = (finalPayload.explanation !== undefined && finalPayload.explanation !== null)
    ? String(finalPayload.explanation)
    : (session.explanation || "");
  const finalApproach = (finalPayload.approach && typeof finalPayload.approach === "object")
    ? { ...session.approach, ...finalPayload.approach }
    : (session.approach || {});
  const finalFollowUps = Array.isArray(finalPayload.followUps)
    ? finalPayload.followUps
    : (session.followUps || []);

  // 3. Authoritative execution evidence: ONLY from session's actual recorded execution runs!
  // NEVER accept executionEvidence or executionResult from finalPayload under ANY circumstance.
  // If no execution was run, evidence is strictly marked unexecuted / 0 tests passed.
  const authoritativeEvidence = (session.executionEvidence && typeof session.executionEvidence === "object" && (session.executionEvidence.executed || session.executionEvidence.testsTotal > 0 || session.executionEvidence.compileError || session.executionEvidence.runtimeError))
    ? { ...session.executionEvidence }
    : {
        compiled: false,
        executed: false,
        passed: false,
        testsPassed: 0,
        testsTotal: 0,
        runtimeError: null,
        compileError: "No execution attempted before submission."
      };

  // 4. Compute authoritative objective correctness strictly from authoritative evidence
  const objCorrectness = computeCorrectnessScore(authoritativeEvidence);

  // 5. Compute authoritative time management score strictly from authoritative elapsed seconds
  const objTimeManagement = computeTimeManagementScore(
    finalElapsedSeconds,
    session.durationSeconds,
    session.attempts || 1,
    "submitted"
  );

  // 6. Qualitative Rubric: NEVER trust client rubricResult as authoritative!
  // Qualitative categories may come from a schema-validated AI evaluation (e.g. Gemini),
  // but NEVER accept objective categories (correctness, timeManagement) or overallScore from client.
  const rawQualitative = finalPayload.rubricResult || session.rubricResult;
  let validatedCategories = null;
  if (rawQualitative && typeof rawQualitative === "object") {
    validatedCategories = validateEvaluationSchema(rawQualitative);
  }

  let authoritativeRubric;
  const sessionForFallback = {
    ...session,
    code: finalCode,
    explanation: finalExplanation,
    approach: finalApproach,
    elapsedSeconds: finalElapsedSeconds,
    status: "submitted",
  };

  if (!validatedCategories) {
    // If no valid AI qualitative evaluation exists, use deterministic offline fallback
    authoritativeRubric = computeDeterministicRubricFallback(
      sessionForFallback,
      authoritativeEvidence
    );
  } else {
    // Construct categories using validated qualitative scores for the 6 qualitative areas,
    // and strictly authoritative calculations for correctness and time management.
    const qualitativeKeys = [
      "problemUnderstanding",
      "approachReasoning",
      "patternRecognition",
      "codeQuality",
      "complexityAnalysis",
      "communication",
    ];

    const finalCategories = {};
    for (const key of qualitativeKeys) {
      const cat = validatedCategories[key];
      const rawScore = Number(cat?.score ?? 0);
      const clampedScore = Math.max(0, Math.min(5, isNaN(rawScore) ? 0 : rawScore));
      finalCategories[key] = {
        score: clampedScore,
        weight: RUBRIC_WEIGHTS[key],
        weightedScore: Math.round((clampedScore / 5) * 100 * RUBRIC_WEIGHTS[key]),
        source: cat?.source || "gemini",
        reasoning: typeof cat?.reasoning === "string" ? cat.reasoning : "Qualitative evaluation recorded.",
      };
    }

    // STRICT INVARIANT: Correctness is ALWAYS derived from authoritative session execution evidence
    finalCategories.correctness = {
      score: objCorrectness,
      weight: RUBRIC_WEIGHTS.correctness,
      weightedScore: Math.round((objCorrectness / 5) * 100 * RUBRIC_WEIGHTS.correctness),
      source: "deterministic",
      reasoning: authoritativeEvidence.testsTotal > 0
        ? `Objective verification: ${authoritativeEvidence.testsPassed || 0}/${authoritativeEvidence.testsTotal || 0} tests passed.`
        : (authoritativeEvidence.passed ? "Code executed cleanly and produced expected output." : "Execution did not pass all requirements."),
    };

    // STRICT INVARIANT: Time management is ALWAYS derived from authoritative elapsed time
    finalCategories.timeManagement = {
      score: objTimeManagement,
      weight: RUBRIC_WEIGHTS.timeManagement,
      weightedScore: Math.round((objTimeManagement / 5) * 100 * RUBRIC_WEIGHTS.timeManagement),
      source: "deterministic",
      reasoning: `Elapsed ${finalElapsedSeconds}s of ${session.durationSeconds}s duration.`,
    };

    // STRICT INVARIANT: Overall score is ALWAYS mathematically recomputed from category weighted sum
    const overallScore = computeOverallRubricScore(finalCategories);

    authoritativeRubric = {
      overallScore,
      categories: finalCategories,
      feedback: rawQualitative.feedback || {
        strengths: rawQualitative.strengths || (authoritativeEvidence.passed ? ["Passed execution tests"] : ["Completed interview simulation"]),
        improvements: rawQualitative.improvements || ["Continue practicing timed technical interviews"],
        generalNotes: "Evaluated by TRACE Bar Raiser with authoritative objective execution scoring.",
      },
      isGeminiEvaluated: Boolean(rawQualitative.isGeminiEvaluated),
    };
  }

  // 7. Create final immutable snapshot
  const submitted = {
    ...session,
    code: finalCode,
    explanation: finalExplanation,
    approach: finalApproach,
    followUps: finalFollowUps,
    status: "submitted",
    phase: "submitted",
    elapsedSeconds: finalElapsedSeconds,
    executionEvidence: authoritativeEvidence,
    rubricResult: authoritativeRubric,
    submittedAt: session.submittedAt || nowIso,
    updatedAt: nowIso,
  };

  // Freeze session
  saveInterviewSession(submitted);

  // Clear active session pointer if this was active
  if (getActiveSessionId() === sessionId) {
    setActiveSessionId(null);
  }

  // 8. Dual-write to progressStore with structured performance signals (Issue 7)
  try {
    const passed = Boolean(
      authoritativeEvidence.passed ||
      (authoritativeEvidence.testsTotal > 0 && authoritativeEvidence.testsPassed === authoritativeEvidence.testsTotal)
    );

    const problemKey = getProblemKey(submitted.problemId);
    const confidence =
      authoritativeRubric?.overallScore >= 80 ? "high" :
      (authoritativeRubric?.overallScore >= 50 ? "medium" : "low");

    updateProblemProgress(problemKey, {
      status: passed ? "solved" : "need_revision",
      attempts: submitted.attempts || 1,
      timeSpentSeconds: finalElapsedSeconds,
      hintsUsed: submitted.hintsUsed || 0,
      solutionViewed: Boolean(submitted.solutionViewed),
      confidence,
      lastAttempted: nowIso,
      // Rich structured performance record for Phase 3.3
      interviewMetadata: {
        sessionId: submitted.id,
        mode: submitted.mode,
        companyId: submitted.companyId,
        role: submitted.role,
        problemId: submitted.problemId,
        durationSeconds: submitted.durationSeconds,
        elapsedSeconds: finalElapsedSeconds,
        objectiveCorrectness: objCorrectness,
        timeManagementScore: objTimeManagement,
        rubricOverallScore: authoritativeRubric?.overallScore ?? 0,
        testsPassed: authoritativeEvidence.testsPassed || 0,
        testsTotal: authoritativeEvidence.testsTotal || 0,
        hintsUsed: submitted.hintsUsed || 0,
        solutionViewed: Boolean(submitted.solutionViewed),
        submittedAt: nowIso,
      }
    });
  } catch (err) {
    console.warn("Failed to dual-write simulation to progressStore:", err);
  }

  return submitted;
}
