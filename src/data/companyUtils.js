// ─────────────────────────────────────────────────────────────
//  TRACE — Company Dataset Normalization & Metrics Engine
//  Single source of truth for 183 companies & 909 unique problems.
//  No AI-fabricated metrics — all derived strictly from companyData.js.
// ─────────────────────────────────────────────────────────────
import { COMPANY_DATA, COMPANIES, TIERS } from "./companyData.js";
import { ALL_PROBLEMS } from "./roadmapProblems.js";

export const DATA_TRUST_INFO = {
  badge: "Verified Dataset",
  source: "Curated LeetCode Company-Wise Intelligence",
  datasetScope: "183 Tech Companies • 2,891 Question Entries • 909 Unique Problems",
  disclaimer: "Frequencies and recency windows are calculated strictly from verified company assessment archives. They provide historical frequency rankings and are not guaranteed future test leaks."
};

// Map roadmap topics for problems where company dataset lacks topics
const ROADMAP_TOPIC_MAP = new Map();
try {
  if (Array.isArray(ALL_PROBLEMS)) {
    ALL_PROBLEMS.forEach(p => {
      if (p.id && p.topic) {
        ROADMAP_TOPIC_MAP.set(String(p.id), p.topic);
      }
    });
  }
} catch (e) {
  console.warn("Could not index roadmap topics", e);
}

/**
 * Normalizes a problem key from problem object or ID
 */
export function getProblemKey(problemOrId) {
  if (!problemOrId && problemOrId !== 0) return "unknown";
  if (typeof problemOrId === "object") {
    return String(problemOrId.id ?? problemOrId.title?.toLowerCase().replace(/\s+/g, "-") ?? "unknown");
  }
  return String(problemOrId);
}

// ─────────────────────────────────────────────────────────────
// Index 909 Unique Problems and their Multi-Company Associations
// ─────────────────────────────────────────────────────────────
export const NORMALIZED_PROBLEMS = new Map();
export const COMPANY_METRICS = new Map();

(function buildIndex() {
  for (const company of COMPANIES) {
    const cid = company.id;
    const cname = company.name;
    const tier = company.tier || "Other";

    const seenInCompany = new Set();
    const companyProbs = [];

    // 1. Process 30 Days window
    for (const p of (company.thirtyDays || [])) {
      const key = getProblemKey(p);
      seenInCompany.add(key);
      const entry = {
        ...p,
        recency: "30 Days",
        companyId: cid,
        companyName: cname,
      };
      companyProbs.push(entry);
      registerNormalizedProblem(p, company, "30 Days");
    }

    // 2. Process 6 Months window (avoid duplicate entries within the same company)
    for (const p of (company.sixMonths || [])) {
      const key = getProblemKey(p);
      if (!seenInCompany.has(key)) {
        seenInCompany.add(key);
        const entry = {
          ...p,
          recency: "6 Months",
          companyId: cid,
          companyName: cname,
        };
        companyProbs.push(entry);
      }
      registerNormalizedProblem(p, company, "6 Months");
    }

    // Calculate company metrics
    let easy = 0, medium = 0, hard = 0;
    const topicCounts = {};

    for (const p of companyProbs) {
      const diff = (p.difficulty || "Medium").toLowerCase();
      if (diff === "easy") easy++;
      else if (diff === "hard") hard++;
      else medium++;

      const topics = p.topics && p.topics.length > 0 ? p.topics : (
        ROADMAP_TOPIC_MAP.has(String(p.id)) ? [ROADMAP_TOPIC_MAP.get(String(p.id))] : []
      );

      for (const t of topics) {
        topicCounts[t] = (topicCounts[t] || 0) + 1;
      }
    }

    const total = companyProbs.length;
    const sortedTopics = Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));

    // Interview relevance label based on tier and problem volume
    let relevance = "Core Preparation";
    if (tier === "FAANG") relevance = "Top Tier Priority";
    else if (tier === "Big Tech") relevance = "High Frequency Target";
    else if (tier === "Unicorn") relevance = "High Bar System & DSA";
    else if (tier === "Finance") relevance = "Algorithmic & Math Heavy";
    else if (tier === "India") relevance = "Mass Hiring & Campus Target";

    COMPANY_METRICS.set(cid, {
      id: cid,
      name: cname,
      tier,
      color: company.color || "#8b949e",
      icon: company.icon || "🏢",
      totalProblems: total,
      easyCount: easy,
      medCount: medium,
      hardCount: hard,
      easyPct: total > 0 ? Math.round((easy / total) * 100) : 0,
      medPct: total > 0 ? Math.round((medium / total) * 100) : 0,
      hardPct: total > 0 ? Math.round((hard / total) * 100) : 0,
      thirtyDaysCount: (company.thirtyDays || []).length,
      sixMonthsCount: (company.sixMonths || []).length,
      topPatterns: sortedTopics.slice(0, 10),
      relevance,
    });
  }
})();

function registerNormalizedProblem(p, company, recency) {
  const key = getProblemKey(p);
  if (!NORMALIZED_PROBLEMS.has(key)) {
    let topics = p.topics && p.topics.length > 0 ? [...p.topics] : [];
    if (topics.length === 0 && ROADMAP_TOPIC_MAP.has(String(p.id))) {
      topics = [ROADMAP_TOPIC_MAP.get(String(p.id))];
    }

    NORMALIZED_PROBLEMS.set(key, {
      id: p.id,
      title: p.title || p.name || "Untitled Problem",
      difficulty: p.difficulty || "Medium",
      url: p.url || `https://leetcode.com/problem-list/`,
      acceptance: typeof p.acceptance === "number" ? p.acceptance : null,
      topics,
      companies: [],
      maxFrequency: p.frequency || 0,
    });
  }

  const norm = NORMALIZED_PROBLEMS.get(key);
  norm.maxFrequency = Math.max(norm.maxFrequency, p.frequency || 0);

  // Check if this company is already recorded for this problem
  const existingComp = norm.companies.find(c => c.id === company.id);
  if (!existingComp) {
    norm.companies.push({
      id: company.id,
      name: company.name,
      tier: company.tier,
      frequency: p.frequency || 0,
      recency,
    });
  } else if (recency === "30 Days") {
    existingComp.recency = "30 Days";
    existingComp.frequency = Math.max(existingComp.frequency, p.frequency || 0);
  }
}

/**
 * Returns all enriched company problems for a company
 */
export function getCompanyEnrichedProblems(companyId) {
  const company = COMPANY_DATA[companyId];
  if (!company) return [];

  const seenKeys = new Set();
  const result = [];

  // Add 30-day problems first
  for (const p of (company.thirtyDays || [])) {
    const key = getProblemKey(p);
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      const norm = NORMALIZED_PROBLEMS.get(key);
      result.push({
        ...p,
        id: p.id,
        title: p.title || p.name,
        difficulty: p.difficulty || "Medium",
        frequency: p.frequency || 0,
        acceptance: typeof p.acceptance === "number" ? p.acceptance : null,
        topics: norm?.topics || p.topics || [],
        recency: "30 Days",
        otherCompanies: (norm?.companies || []).filter(c => c.id !== companyId),
      });
    }
  }

  // Add 6-month problems next
  for (const p of (company.sixMonths || [])) {
    const key = getProblemKey(p);
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      const norm = NORMALIZED_PROBLEMS.get(key);
      result.push({
        ...p,
        id: p.id,
        title: p.title || p.name,
        difficulty: p.difficulty || "Medium",
        frequency: p.frequency || 0,
        acceptance: typeof p.acceptance === "number" ? p.acceptance : null,
        topics: norm?.topics || p.topics || [],
        recency: "6 Months",
        otherCompanies: (norm?.companies || []).filter(c => c.id !== companyId),
      });
    }
  }

  // Sort by frequency descending by default
  return result.sort((a, b) => b.frequency - a.frequency);
}

/**
 * Gets full metrics and problem list for a company
 */
export function getCompanyFullDetails(companyId) {
  const company = COMPANY_DATA[companyId];
  if (!company) return null;

  const metrics = COMPANY_METRICS.get(companyId) || {
    id: company.id,
    name: company.name,
    tier: company.tier || "Other",
    color: company.color || "#8b949e",
    icon: company.icon || "🏢",
    totalProblems: 0,
    easyCount: 0,
    medCount: 0,
    hardCount: 0,
    easyPct: 0,
    medPct: 0,
    hardPct: 0,
    thirtyDaysCount: 0,
    sixMonthsCount: 0,
    topPatterns: [],
    relevance: "Core Preparation",
  };

  const problems = getCompanyEnrichedProblems(companyId);

  return {
    company,
    metrics,
    problems,
  };
}

/**
 * Gets cross-company info for any problem ID
 */
export function getProblemCompanyCrossref(problemOrId) {
  const key = getProblemKey(problemOrId);
  return NORMALIZED_PROBLEMS.get(key) || null;
}
