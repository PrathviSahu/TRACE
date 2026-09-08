// ─────────────────────────────────────────────────────────────
//  TRACE — Deterministic Daily Plan Generator Engine
//  Phase 3.2: Generates reproducible day-by-day study roadmaps.
//  No AI or synthetic heuristics — 100% deterministic & testable.
// ─────────────────────────────────────────────────────────────

import { getCompanyEnrichedProblems, NORMALIZED_PROBLEMS, getProblemKey } from "../data/companyUtils.js";
import { getProblemPatternDetails, getPatternFamily, DSA_PATTERN_FAMILIES, DSA_PATTERNS } from "../data/patternMapping.js";
import { calculatePriorityScore } from "./intelligenceService.js";
import { getAllProgress } from "./progressStore.js";
import { COMPANY_DATA } from "../data/companyData.js";

export const DIFFICULTY_MINUTES = {
  Easy: 20,
  Medium: 35,
  Hard: 50
};

export const REVISION_MINUTES = 15;
export const MOCK_SET_MINUTES = 90;

const WEEKDAY_NAMES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

/**
 * Computes calendar dates available for study between startDate and endDate
 * filtered by user's active weekly study days.
 */
export function getScheduledStudyDates(startDateStr, endDateStr, weeklyStudyDays, timezone = "UTC") {
  if (!startDateStr || !endDateStr) return [];
  const activeDays = Array.isArray(weeklyStudyDays) && weeklyStudyDays.length > 0
    ? weeklyStudyDays
    : ["MON", "TUE", "WED", "THU", "FRI"];

  const dates = [];
  const [startY, startM, startD] = startDateStr.split("T")[0].split("-").map(Number);
  const [endY, endM, endD] = endDateStr.split("T")[0].split("-").map(Number);

  const cur = new Date(Date.UTC(startY, startM - 1, startD));
  const endLimit = new Date(Date.UTC(endY, endM - 1, endD));

  // Loop through days up to (not including) the interview date
  while (cur < endLimit) {
    const dayOfWeek = WEEKDAY_NAMES[cur.getUTCDay()];
    const y = cur.getUTCFullYear();
    const m = String(cur.getUTCMonth() + 1).padStart(2, "0");
    const d = String(cur.getUTCDate()).padStart(2, "0");
    const dateStr = `${y}-${m}-${d}`;

    if (activeDays.includes(dayOfWeek)) {
      dates.push({
        date: dateStr,
        dayOfWeek
      });
    }

    cur.setUTCDate(cur.getUTCDate() + 1);
  }

  // Safety fallback: if no days matched, schedule at least 1 study day
  if (dates.length === 0) {
    dates.push({
      date: startDateStr.split("T")[0],
      dayOfWeek: "MON"
    });
  }

  return dates;
}

/**
 * Deterministically generates a day-by-day interview preparation roadmap.
 *
 * Guaranteed Properties:
 * 1. Reproducibility: Identical inputs produce byte-for-byte identical output.
 * 2. Pattern Cohesion: Each day focuses on a primary pattern family or complementary topic.
 * 3. Budget Calibration: Fits within dailyStudyMinutes with realistic difficulty timings.
 * 4. Spaced Revision: Interleaves forgot_approach / need_revision items without overloading.
 * 5. Company Grounding: Prioritizes verified frequency and recency from target company.
 *
 * @param {Object} profile - Validated InterviewProfile
 * @param {Object} [progressMap] - Optional progress store snapshot (defaults to localStorage)
 * @returns {Object} GeneratedPlan
 */
export function generateDailyPlan(profile, progressMap = null) {
  if (!profile || !profile.companyId) {
    throw new Error("Cannot generate plan: invalid or missing InterviewProfile.");
  }

  const progress = progressMap || getAllProgress();
  const company = COMPANY_DATA[profile.companyId] || COMPANY_DATA.microsoft;

  // 1. Calculate study dates
  const startDate = profile.createdAt ? profile.createdAt.split("T")[0] : new Date().toISOString().split("T")[0];
  const endDate = profile.interviewDate ? profile.interviewDate.split("T")[0] : startDate;
  const scheduledDates = getScheduledStudyDates(
    startDate,
    endDate,
    profile.weeklyStudyDays,
    profile.timezone
  );

  const totalDays = scheduledDates.length;

  // 2. Harvest candidate problems from company dataset
  const rawCompanyProbs = getCompanyEnrichedProblems(profile.companyId);

  // Fallback supplement from general normalized dataset if needed
  const normList = Array.from(NORMALIZED_PROBLEMS.values());

  // Enrich problem items with deterministic metrics
  const enrichItem = (p, isFallback = false) => {
    const key = getProblemKey(p);
    const patDetails = getProblemPatternDetails(p);
    const primaryPattern = patDetails.patterns && patDetails.patterns.length > 0
      ? patDetails.patterns[0]
      : "Unclassified";
    const family = getPatternFamily(primaryPattern);
    const topic = patDetails.topic || (p.topics && p.topics.length > 0 ? p.topics[0] : "Array");
    const prog = progress[key];
    const scoreObj = calculatePriorityScore(p, prog);

    let estMinutes = DIFFICULTY_MINUTES[p.difficulty] || 35;
    if (profile.currentLevel === "Beginner" && p.difficulty === "Hard") estMinutes += 15;

    return {
      id: p.id,
      key,
      title: p.title || p.name || `Problem #${p.id}`,
      difficulty: p.difficulty || "Medium",
      topics: p.topics && p.topics.length > 0 ? p.topics : [topic],
      primaryTopic: topic,
      primaryPattern,
      patterns: patDetails.patterns || [primaryPattern],
      family,
      frequency: p.frequency || 0,
      recency: p.recency || "All Time",
      priorityScore: scoreObj.score,
      priorityTier: scoreObj.tier,
      priorityColor: scoreObj.color,
      priorityReason: scoreObj.reason,
      estMinutes,
      status: prog?.status || "unsolved",
      isFallback
    };
  };

  const enrichedCompany = rawCompanyProbs.map(p => enrichItem(p, false));

  // Identify revision problems from progress store (forgot_approach or need_revision)
  const revisionProblems = [];
  if (profile.includeRevision !== false) {
    for (const [key, prog] of Object.entries(progress)) {
      if (prog && (prog.status === "forgot_approach" || prog.status === "need_revision")) {
        const normProb = NORMALIZED_PROBLEMS.get(key);
        if (normProb) {
          const item = enrichItem(normProb, false);
          item.isRevision = true;
          item.urgency = prog.status === "forgot_approach" ? 2 : 1;
          item.lastAttempted = prog.lastAttempted || "";
          revisionProblems.push(item);
        }
      }
    }
    // Stable deterministic sort for revision: most urgent first, then oldest unattempted, then id asc
    revisionProblems.sort((a, b) => {
      if (b.urgency !== a.urgency) return b.urgency - a.urgency;
      if (a.lastAttempted && b.lastAttempted) {
        return new Date(a.lastAttempted) - new Date(b.lastAttempted);
      }
      return String(a.id).localeCompare(String(b.id));
    });
  }

  // 3. Filter target candidates based on user profile preferences
  let candidates = enrichedCompany.filter(p => {
    // If targetTopics specified and not empty, check match
    if (Array.isArray(profile.targetTopics) && profile.targetTopics.length > 0) {
      const matchesTopic = p.topics.some(t => profile.targetTopics.includes(t)) ||
                           profile.targetTopics.includes(p.primaryTopic);
      if (!matchesTopic) return false;
    }
    // If targetPatterns specified and not empty, check match
    if (Array.isArray(profile.targetPatterns) && profile.targetPatterns.length > 0) {
      const matchesPattern = p.patterns.some(pat => profile.targetPatterns.includes(pat));
      if (!matchesPattern) return false;
    }
    return true;
  });

  // Fallback to all company problems if filtering was too aggressive
  if (candidates.length === 0) {
    candidates = [...enrichedCompany];
  }

  // Stable deterministic sort for candidates:
  // 1. Unsolved first, then need revision, then solved
  // 2. Priority score desc
  // 3. Frequency desc
  // 4. Problem id asc (absolute tie-breaker)
  candidates.sort((a, b) => {
    const statusRank = (s) => (s === "unsolved" ? 3 : (s === "need_revision" || s === "forgot_approach" ? 2 : 1));
    const sDiff = statusRank(b.status) - statusRank(a.status);
    if (sDiff !== 0) return sDiff;
    if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
    if (b.frequency !== a.frequency) return b.frequency - a.frequency;
    return String(a.id).localeCompare(String(b.id));
  });

  // 4. Cluster problems by canonical pattern family
  const familyBuckets = new Map();
  for (const p of candidates) {
    if (!familyBuckets.has(p.family)) {
      familyBuckets.set(p.family, []);
    }
    familyBuckets.get(p.family).push(p);
  }

  // Rank pattern families by cumulative weight in this company
  // (Sum of priority scores + problem count)
  const rankedFamilies = Array.from(familyBuckets.entries())
    .map(([family, list]) => {
      const totalScore = list.reduce((sum, item) => sum + item.priorityScore, 0);
      const avgScore = totalScore / list.length;
      return {
        family,
        count: list.length,
        totalScore,
        avgScore,
        problems: list
      };
    })
    .sort((a, b) => {
      // Prioritize families with highest total score, then count, then family name asc
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      if (b.count !== a.count) return b.count - a.count;
      return a.family.localeCompare(b.family);
    })
    .map(f => f.family);

  // If no families found, fallback to canonical order
  if (rankedFamilies.length === 0) {
    rankedFamilies.push("General & Foundations");
  }

  // Track assigned problem keys to prevent duplicates across study days
  const assignedProblemKeys = new Set();
  let revisionIndex = 0;

  // 5. Daily Workload Assembly
  const dailyPlans = [];
  const targetDailyMinutes = Math.max(30, Math.min(480, Number(profile.dailyStudyMinutes) || 120));

  for (let i = 0; i < totalDays; i++) {
    const daySchedule = scheduledDates[i];
    const dayIndex = i + 1;
    let dayRemainingMinutes = targetDailyMinutes;

    // Check if this day is a designated Mock Day
    // (Penultimate day when totalDays >= 5 and mock interviews enabled)
    const isMockDay = Boolean(
      profile.includeMockInterviews &&
      totalDays >= 5 &&
      dayIndex === (totalDays - 1)
    );

    const daySelectedProblems = [];
    const dayRevisionProblems = [];

    // A. Interleave 1 Spaced Revision problem if available and not a mock day
    if (!isMockDay && profile.includeRevision !== false && revisionIndex < revisionProblems.length) {
      const revItem = revisionProblems[revisionIndex];
      dayRevisionProblems.push(revItem);
      revisionIndex++;
      dayRemainingMinutes -= REVISION_MINUTES;
    }

    let focusFamily = rankedFamilies[i % rankedFamilies.length];
    let focusTopic = "General";
    let focusPatterns = [];

    if (isMockDay) {
      // Mock Day: Pick 1 Easy, 1 Medium, 1 Hard from company question pool
      focusFamily = "Mock Interview Simulation";
      focusTopic = "Comprehensive Company Assessment";
      focusPatterns = ["Interview Simulation", "Timed Problem Solving"];

      const unassigned = candidates.filter(p => !assignedProblemKeys.has(p.key));
      const easies = unassigned.filter(p => p.difficulty === "Easy");
      const mediums = unassigned.filter(p => p.difficulty === "Medium");
      const hards = unassigned.filter(p => p.difficulty === "Hard");

      const pickOne = (arr) => arr[0] || candidates.find(p => arr === easies ? p.difficulty === "Easy" : (arr === hards ? p.difficulty === "Hard" : p.difficulty === "Medium")) || candidates[0];

      const mEasy = pickOne(easies);
      if (mEasy) { daySelectedProblems.push(mEasy); assignedProblemKeys.add(mEasy.key); }

      const mMed = pickOne(mediums.filter(p => p !== mEasy));
      if (mMed) { daySelectedProblems.push(mMed); assignedProblemKeys.add(mMed.key); }

      const mHard = pickOne(hards.filter(p => p !== mEasy && p !== mMed));
      if (mHard) { daySelectedProblems.push(mHard); assignedProblemKeys.add(mHard.key); }
    } else {
      // Standard Focus Day: Fill from primary focusFamily
      const familyPool = familyBuckets.get(focusFamily) || [];
      const unassignedFromFamily = familyPool.filter(p => !assignedProblemKeys.has(p.key));

      for (const p of unassignedFromFamily) {
        if (dayRemainingMinutes - p.estMinutes >= -15 || daySelectedProblems.length === 0) {
          daySelectedProblems.push(p);
          assignedProblemKeys.add(p.key);
          dayRemainingMinutes -= p.estMinutes;
        }
        if (dayRemainingMinutes <= 15 || daySelectedProblems.length >= 4) break;
      }

      // If family had fewer problems than needed, backfill from adjacent company problems
      if (daySelectedProblems.length < 2 && dayRemainingMinutes >= 20) {
        const remainingCandidates = candidates.filter(p => !assignedProblemKeys.has(p.key));
        for (const p of remainingCandidates) {
          if (dayRemainingMinutes - p.estMinutes >= -15 || daySelectedProblems.length === 0) {
            daySelectedProblems.push(p);
            assignedProblemKeys.add(p.key);
            dayRemainingMinutes -= p.estMinutes;
          }
          if (dayRemainingMinutes <= 15 || daySelectedProblems.length >= 3) break;
        }
      }

      // If still empty (e.g. company bank completely exhausted), supplement from normalized problems
      if (daySelectedProblems.length === 0) {
        const matchingNorms = normList
          .filter(p => getPatternFamily(getProblemPatternDetails(p).patterns[0]) === focusFamily)
          .slice(0, 2);
        for (const np of matchingNorms) {
          const item = enrichItem(np, true);
          daySelectedProblems.push(item);
        }
      }

      // Extract primary topic and distinct patterns from the day's selected set
      if (daySelectedProblems.length > 0) {
        focusTopic = daySelectedProblems[0].primaryTopic;
        const patSet = new Set();
        daySelectedProblems.forEach(p => p.patterns.forEach(pat => patSet.add(pat)));
        focusPatterns = Array.from(patSet);
      }
    }

    // Calculate total estimated minutes
    const totalEst = daySelectedProblems.reduce((sum, p) => sum + p.estMinutes, 0) +
                     (dayRevisionProblems.length * REVISION_MINUTES);

    // Compute average priority score
    const avgScore = daySelectedProblems.length > 0
      ? Math.round(daySelectedProblems.reduce((sum, p) => sum + p.priorityScore, 0) / daySelectedProblems.length)
      : 60;

    const dayPriority = avgScore >= 75 ? "critical" : (avgScore >= 55 ? "high" : "medium");

    dailyPlans.push({
      dayIndex,
      date: daySchedule.date,
      dayOfWeek: daySchedule.dayOfWeek,
      focusFamily,
      focusTopic,
      focusPatterns,
      problemIds: daySelectedProblems.map(p => p.id),
      problems: daySelectedProblems,
      revisionProblemIds: dayRevisionProblems.map(p => p.id),
      revisionProblems: dayRevisionProblems,
      estimatedMinutes: totalEst,
      priority: dayPriority,
      isMockDay,
      completed: false
    });
  }

  // 6. Compute Plan Telemetry & Distribution
  const patternFamilyCoverage = {};
  const topicCoverage = {};
  let totalProblemsScheduled = 0;
  let totalRevisionScheduled = 0;
  let totalEstimatedMinutes = 0;

  for (const day of dailyPlans) {
    totalProblemsScheduled += day.problems.length;
    totalRevisionScheduled += day.revisionProblems.length;
    totalEstimatedMinutes += day.estimatedMinutes;

    if (!patternFamilyCoverage[day.focusFamily]) patternFamilyCoverage[day.focusFamily] = 0;
    patternFamilyCoverage[day.focusFamily] += day.problems.length;

    if (!topicCoverage[day.focusTopic]) topicCoverage[day.focusTopic] = 0;
    topicCoverage[day.focusTopic] += day.problems.length;
  }

  return {
    profileId: profile.id,
    companyId: profile.companyId,
    companyName: company.name,
    companyTier: company.tier,
    companyIcon: company.icon,
    role: profile.role || "Software Engineer",
    planVersion: profile.planVersion || 1,
    generatedAt: new Date().toISOString(),
    startDate,
    endDate,
    totalStudyDays: totalDays,
    dailyStudyMinutes: targetDailyMinutes,
    totalProblemsScheduled,
    totalRevisionScheduled,
    totalEstimatedHours: Number((totalEstimatedMinutes / 60).toFixed(1)),
    patternFamilyCoverage,
    topicCoverage,
    days: dailyPlans
  };
}
