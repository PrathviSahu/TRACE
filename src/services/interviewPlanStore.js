// ─────────────────────────────────────────────────────────────
//  TRACE — Interview Preparation Profile & Planning Data Model
//  Phase 3.1: Data foundation for deterministic schedule generation.
//  No AI or synthetic heuristics — grounded in existing datasets.
// ─────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback } from "react";
import { COMPANY_DATA } from "../data/companyData.js";
import { DSA_TOPICS, DSA_PATTERNS } from "../data/patternMapping.js";
import { SUPPORTED_LANGUAGES } from "./aiService.js";

export const PROFILE_STORAGE_KEY = "trace_interview_profile";
export const PLANNING_STATE_KEY = "trace_planning_state";
export const DAILY_PLAN_STORAGE_KEY = "trace_daily_plan";

export const PREPARATION_LEVELS = [
  "Beginner",
  "Strong Problem Solver",
  "Interview Ready",
  "Big Tech Ready"
];

export const PREPARATION_GOALS = [
  "Interview Preparation",
  "DSA Improvement",
  "Company-Specific Preparation",
  "General Coding Interview"
];

export const WEEK_DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export const DEFAULT_STUDY_DAYS = ["MON", "TUE", "WED", "THU", "FRI"];

export const PLANNING_STATUSES = [
  "draft",
  "active",
  "completed",
  "paused",
  "cancelled"
];

/**
 * Derives exact calendar days remaining until interviewDate.
 * Never stored as static authoritative state.
 */
export function calculateDaysRemaining(interviewDate, timezone) {
  if (!interviewDate) return null;

  try {
    const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const now = new Date();

    // Parse target date (expecting YYYY-MM-DD or ISO)
    const targetParts = interviewDate.split("T")[0].split("-").map(Number);
    if (targetParts.length !== 3 || targetParts.some(isNaN)) return null;

    const [year, month, day] = targetParts;
    const targetDate = new Date(Date.UTC(year, month - 1, day));

    // Get current date in specified timezone
    const nowInTzStr = now.toLocaleDateString("en-CA", { timeZone: tz }); // YYYY-MM-DD
    const [nowY, nowM, nowD] = nowInTzStr.split("-").map(Number);
    const currentDate = new Date(Date.UTC(nowY, nowM - 1, nowD));

    const diffMs = targetDate.getTime() - currentDate.getTime();
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
  } catch (err) {
    console.warn("Could not calculate days remaining:", err);
    return null;
  }
}

/**
 * Calculates derived weekly study hours
 */
export function calculateWeeklyStudyHours(dailyStudyMinutes, weeklyStudyDays) {
  const mins = Number(dailyStudyMinutes) || 0;
  const days = Array.isArray(weeklyStudyDays) ? weeklyStudyDays.length : 0;
  return Math.round(((mins * days) / 60) * 10) / 10;
}

/**
 * Deterministically validates an Interview Preparation Profile
 */
export function validateInterviewProfile(profile) {
  const errors = [];

  if (!profile) {
    return { isValid: false, errors: ["Profile data is missing."] };
  }

  // 1. Company reference
  if (!profile.companyId || !COMPANY_DATA[profile.companyId]) {
    errors.push(`Company "${profile.companyId}" is invalid or not in existing company dataset.`);
  }

  // 2. Role
  if (!profile.role || typeof profile.role !== "string" || !profile.role.trim()) {
    errors.push("Role must be specified (e.g. Software Engineer).");
  }

  // 3. Interview Date
  if (!profile.interviewDate) {
    errors.push("Interview date is required.");
  } else {
    const days = calculateDaysRemaining(profile.interviewDate, profile.timezone);
    if (days === null) {
      errors.push("Interview date format is invalid.");
    } else if (days <= 0) {
      errors.push("Interview date must be in the future (at least tomorrow).");
    }
  }

  // 4. Daily study minutes
  const mins = Number(profile.dailyStudyMinutes);
  if (isNaN(mins) || mins < 15 || mins > 480) {
    errors.push("Daily study time must be between 15 and 480 minutes.");
  }

  // 5. Weekly study days
  if (!Array.isArray(profile.weeklyStudyDays) || profile.weeklyStudyDays.length === 0) {
    errors.push("At least one study day must be selected.");
  } else {
    const invalidDays = profile.weeklyStudyDays.filter(d => !WEEK_DAYS.includes(d));
    if (invalidDays.length > 0) {
      errors.push(`Invalid study days: ${invalidDays.join(", ")}`);
    }
  }

  // 6. Current Level
  if (profile.currentLevel && !PREPARATION_LEVELS.includes(profile.currentLevel)) {
    errors.push(`Current level "${profile.currentLevel}" is not in controlled vocabulary.`);
  }

  // 7. Goal
  if (profile.goal && !PREPARATION_GOALS.includes(profile.goal)) {
    errors.push(`Goal "${profile.goal}" is not in controlled vocabulary.`);
  }

  // 8. Preferred Languages
  if (Array.isArray(profile.preferredLanguages)) {
    const supportedIds = SUPPORTED_LANGUAGES.map(l => l.id.toLowerCase());
    const supportedLabels = SUPPORTED_LANGUAGES.map(l => l.label.toLowerCase());
    for (const lang of profile.preferredLanguages) {
      const lower = lang.toLowerCase();
      if (!supportedIds.includes(lower) && !supportedLabels.includes(lower)) {
        errors.push(`Language "${lang}" is not supported by TRACE execution engine.`);
      }
    }
  }

  // 9. Target Topics
  if (Array.isArray(profile.targetTopics)) {
    const invalidTopics = profile.targetTopics.filter(t => !DSA_TOPICS.includes(t));
    if (invalidTopics.length > 0) {
      errors.push(`Invalid topics: ${invalidTopics.join(", ")}`);
    }
  }

  // 10. Target Patterns
  if (Array.isArray(profile.targetPatterns)) {
    const invalidPatterns = profile.targetPatterns.filter(p => !DSA_PATTERNS.includes(p));
    if (invalidPatterns.length > 0) {
      errors.push(`Invalid patterns: ${invalidPatterns.join(", ")}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Reads persistent InterviewProfile from localStorage
 */
export function getInterviewProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn("Failed to load interview profile:", err);
    return null;
  }
}

/**
 * Reads persistent PlanningState from localStorage
 */
export function getPlanningState() {
  try {
    const raw = localStorage.getItem(PLANNING_STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn("Failed to load planning state:", err);
    return null;
  }
}

/**
 * Saves and activates an InterviewProfile and initializes PlanningState container
 */
export function saveInterviewProfile(inputProfile) {
  const validation = validateInterviewProfile(inputProfile);
  if (!validation.isValid) {
    throw new Error("InterviewProfile validation failed: " + validation.errors.join("; "));
  }

  const nowIso = new Date().toISOString();
  const existingProfile = getInterviewProfile();
  const existingPlanning = getPlanningState();

  const profileId = existingProfile?.id || `profile_${inputProfile.companyId}_${Date.now()}`;

  const profile = {
    id: profileId,
    companyId: inputProfile.companyId,
    role: inputProfile.role.trim(),
    interviewDate: inputProfile.interviewDate.split("T")[0],
    timezone: inputProfile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    dailyStudyMinutes: Number(inputProfile.dailyStudyMinutes) || 120,
    weeklyStudyDays: [...inputProfile.weeklyStudyDays],
    currentLevel: inputProfile.currentLevel || "Interview Ready",
    goal: inputProfile.goal || "Interview Preparation",
    preferredLanguages: Array.isArray(inputProfile.preferredLanguages) && inputProfile.preferredLanguages.length > 0
      ? inputProfile.preferredLanguages
      : ["Java"],
    targetTopics: Array.isArray(inputProfile.targetTopics) ? inputProfile.targetTopics : [],
    targetPatterns: Array.isArray(inputProfile.targetPatterns) ? inputProfile.targetPatterns : [],
    includeCompanyQuestions: inputProfile.includeCompanyQuestions !== false,
    includeRecentQuestions: inputProfile.includeRecentQuestions !== false,
    includeRevision: inputProfile.includeRevision !== false,
    includeMockInterviews: Boolean(inputProfile.includeMockInterviews),
    createdAt: existingProfile?.createdAt || nowIso,
    updatedAt: nowIso
  };

  // Determine if core planning parameters changed (triggering version bump)
  let planVersion = existingPlanning?.planVersion || 1;
  if (existingProfile) {
    const coreChanged =
      existingProfile.companyId !== profile.companyId ||
      existingProfile.interviewDate !== profile.interviewDate ||
      existingProfile.dailyStudyMinutes !== profile.dailyStudyMinutes ||
      existingProfile.weeklyStudyDays.join(",") !== profile.weeklyStudyDays.join(",");
    if (coreChanged) {
      planVersion = (existingPlanning?.planVersion || 1) + 1;
    }
  }

  const planningState = {
    profileId,
    planVersion,
    planStartDate: profile.createdAt.split("T")[0],
    planEndDate: profile.interviewDate,
    status: "active",
    lastGeneratedAt: existingPlanning?.lastGeneratedAt || null,
    lastAdaptedAt: existingPlanning?.lastAdaptedAt || null,
    currentDayIndex: existingPlanning?.currentDayIndex || 0
  };

  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    localStorage.setItem(PLANNING_STATE_KEY, JSON.stringify(planningState));

    window.dispatchEvent(new CustomEvent("trace_interview_profile_updated", {
      detail: { profile, planningState }
    }));
  } catch (err) {
    console.error("Failed to persist InterviewProfile:", err);
  }

  return { profile, planningState };
}

/**
 * Updates planning state container (e.g. status pause, complete)
 */
export function updatePlanningState(updates) {
  const current = getPlanningState() || {
    profileId: null,
    planVersion: 1,
    planStartDate: new Date().toISOString().split("T")[0],
    planEndDate: null,
    status: "draft",
    lastGeneratedAt: null,
    lastAdaptedAt: null,
    currentDayIndex: 0
  };

  const nextState = { ...current, ...updates };

  try {
    localStorage.setItem(PLANNING_STATE_KEY, JSON.stringify(nextState));
    window.dispatchEvent(new CustomEvent("trace_interview_profile_updated", {
      detail: { profile: getInterviewProfile(), planningState: nextState }
    }));
  } catch (err) {
    console.error("Failed to update planning state:", err);
  }

  return nextState;
}

/**
 * Clears interview profile and planning state
 */
export function clearInterviewProfile() {
  localStorage.removeItem(PROFILE_STORAGE_KEY);
  localStorage.removeItem(PLANNING_STATE_KEY);
  window.dispatchEvent(new CustomEvent("trace_interview_profile_updated", {
    detail: { profile: null, planningState: null }
  }));
}

/**
 * Reactive hook to subscribe to InterviewProfile and PlanningState updates
 */
export function useInterviewProfile() {
  const [profile, setProfile] = useState(() => getInterviewProfile());
  const [planningState, setPlanningState] = useState(() => getPlanningState());

  useEffect(() => {
    function handleUpdate() {
      setProfile(getInterviewProfile());
      setPlanningState(getPlanningState());
    }
    window.addEventListener("trace_interview_profile_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("trace_interview_profile_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const save = useCallback((p) => saveInterviewProfile(p), []);
  const updatePlan = useCallback((u) => updatePlanningState(u), []);
  const clear = useCallback(() => clearInterviewProfile(), []);

  const daysRemaining = profile ? calculateDaysRemaining(profile.interviewDate, profile.timezone) : null;
  const weeklyHours = profile ? calculateWeeklyStudyHours(profile.dailyStudyMinutes, profile.weeklyStudyDays) : 0;

  return {
    profile,
    planningState,
    daysRemaining,
    weeklyHours,
    saveProfile: save,
    updatePlanningState: updatePlan,
    clearProfile: clear
  };
}

/**
 * Reads persistent GeneratedPlan from localStorage
 */
export function getDailyPlan() {
  try {
    if (typeof localStorage === "undefined" || !localStorage) return null;
    const raw = localStorage.getItem(DAILY_PLAN_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn("Failed to load daily plan:", err);
    return null;
  }
}

/**
 * Saves GeneratedPlan and updates PlanningState.lastGeneratedAt
 */
export function saveDailyPlan(plan) {
  if (!plan) return null;
  try {
    localStorage.setItem(DAILY_PLAN_STORAGE_KEY, JSON.stringify(plan));
    updatePlanningState({
      lastGeneratedAt: plan.generatedAt || new Date().toISOString(),
      planVersion: plan.planVersion || 1,
    });
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("trace_daily_plan_updated", {
        detail: { plan }
      }));
    }
  } catch (err) {
    console.error("Failed to save daily plan:", err);
  }
  return plan;
}

/**
 * Clears stored GeneratedPlan
 */
export function clearDailyPlan() {
  try {
    localStorage.removeItem(DAILY_PLAN_STORAGE_KEY);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("trace_daily_plan_updated", {
        detail: { plan: null }
      }));
    }
  } catch (err) {
    console.error("Failed to clear daily plan:", err);
  }
}

/**
 * React hook to subscribe to reactive GeneratedPlan updates
 */
export function useDailyPlan() {
  const [dailyPlan, setDailyPlan] = useState(() => getDailyPlan());

  useEffect(() => {
    function handleUpdate() {
      setDailyPlan(getDailyPlan());
    }
    window.addEventListener("trace_daily_plan_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("trace_daily_plan_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const save = useCallback((p) => saveDailyPlan(p), []);
  const clear = useCallback(() => clearDailyPlan(), []);

  return {
    dailyPlan,
    saveDailyPlan: save,
    clearDailyPlan: clear
  };
}
