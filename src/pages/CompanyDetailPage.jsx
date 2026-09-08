import { useState, useMemo, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTraceStore } from "../store/traceStore.js";
import { getCompanyFullDetails, DATA_TRUST_INFO, getProblemKey } from "../data/companyUtils.js";
import { getProblemPatternDetails, computeCompanyPatternStats, PATTERN_SOURCE_LABEL } from "../data/patternMapping.js";
import {
  calculatePriorityScore,
  calculateCompanyReadiness,
  detectFocusAreas,
  generateMockInterviewSet
} from "../services/intelligenceService.js";
import { PRESET_SOLUTIONS, getProblemTemplate } from "../data/problemTemplates.js";
import { getProblemDescription } from "../data/problemDescriptions.js";
import { useAllProgress, updateProblemProgress } from "../services/progressStore.js";
import ProblemModal from "../components/ProblemModal.jsx";
import CompanyComparisonModal from "../components/CompanyComparisonModal.jsx";

const DIFF_COLORS = { Easy: "#00b8a3", Medium: "#ffa116", Hard: "#ef4743" };
const DIFF_BG = { Easy: "rgba(0,184,163,0.1)", Medium: "rgba(255,161,22,0.1)", Hard: "rgba(239,71,67,0.1)" };

const STATUS_CONFIG = {
  unsolved:        { label: "Unsolved",        icon: "○", color: "#6e7681", bg: "rgba(110,118,129,0.1)" },
  solved:          { label: "Solved",          icon: "✓", color: "#00b8a3", bg: "rgba(0,184,163,0.15)" },
  need_revision:   { label: "Need Revision",   icon: "⚡", color: "#ffa116", bg: "rgba(255,161,22,0.15)" },
  forgot_approach: { label: "Forgot Approach", icon: "⚠️", color: "#ef4743", bg: "rgba(239,71,67,0.15)" },
};

const PRACTICE_MODES = [
  { id: "smart",      icon: "🎯", label: "Smart Practice",     desc: "Ranked by personalized priority formula" },
  { id: "frequent",   icon: "📈", label: "Frequently Asked",   desc: "Top historical interview frequency" },
  { id: "recent",     icon: "🔥", label: "Recent (30 Days)",   desc: "Active 30-day telemetry" },
  { id: "revision",   icon: "⚡", label: "Revision Queue",     desc: "Need Revision + Forgot Approach" },
  { id: "mock",       icon: "🎲", label: "Random Mock Set",    desc: "Balanced 3-problem interview simulation" },
];

export default function CompanyDetailPage() {
  const { companyId } = useParams();
  const navigate = useNavigate();

  const details = useMemo(() => getCompanyFullDetails(companyId), [companyId]);
  const { progress, updateProgress } = useAllProgress();

  const { setCode, setInputs, setLanguage } = useTraceStore();
  const currentStoreLang = useTraceStore(s => s.language) || "java";

  // Mode & Filter states
  const [practiceMode, setPracticeMode] = useState("smart");
  const [search, setSearch] = useState("");
  const [diffFilter, setDiffFilter] = useState("All");
  const [patternFilter, setPatternFilter] = useState("All");
  const [recencyFilter, setRecencyFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("priority_desc");

  // Mock interview set seed trigger
  const [mockSeed, setMockSeed] = useState(0);

  // Modals
  const [modalProblem, setModalProblem] = useState(null);
  const [modalDesc, setModalDesc] = useState(null);
  const [showTrustModal, setShowTrustModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);

  if (!details) {
    return (
      <div className="company-not-found">
        <style>{`
          .company-not-found {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: calc(100vh - 60px);
            background: #0d1117;
            color: #c9d1d9;
          }
          .cnf-title { font-size: 22px; font-weight: 700; margin-bottom: 12px; }
          .cnf-btn {
            background: #238636; color: #fff; padding: 8px 16px; border-radius: 6px;
            text-decoration: none; font-size: 13px; font-weight: 600;
          }
        `}</style>
        <div className="cnf-title">Company Not Found</div>
        <p style={{ color: "#8b949e", marginBottom: 20 }}>No dataset entries found for \"${companyId}\".</p>
        <Link to="/companies" className="cnf-btn">← Back to Company Directory</Link>
      </div>
    );
  }

  const { company, metrics, problems } = details;

  // Pattern statistics (curated DSA patterns)
  const patternStats = useMemo(() => {
    return computeCompanyPatternStats(problems);
  }, [problems]);

  // Company Readiness Score & Breakdown
  const readiness = useMemo(() => {
    return calculateCompanyReadiness(companyId, problems, progress);
  }, [companyId, problems, progress]);

  // Focus Areas & Weakness detection
  const focusAreas = useMemo(() => {
    return detectFocusAreas(problems, progress);
  }, [problems, progress]);

  // Priority scores cache for all problems
  const priorityMap = useMemo(() => {
    const map = new Map();
    for (const p of problems) {
      const key = getProblemKey(p);
      map.set(key, calculatePriorityScore(p, progress[key]));
    }
    return map;
  }, [problems, progress]);

  // Mock interview 3-question set
  const mockProblems = useMemo(() => {
    if (practiceMode !== "mock") return [];
    return generateMockInterviewSet(problems);
  }, [practiceMode, problems, mockSeed]);

  // Filtered & Sorted problem list
  const filteredProblems = useMemo(() => {
    if (practiceMode === "mock") return mockProblems;

    let list = [...problems];

    // Mode-specific filtering
    if (practiceMode === "frequent") {
      list = list.filter(p => (p.frequency || 0) >= 50);
    } else if (practiceMode === "recent") {
      list = list.filter(p => p.recency === "30 Days");
    } else if (practiceMode === "revision") {
      list = list.filter(p => {
        const st = progress[getProblemKey(p)]?.status;
        return st === "need_revision" || st === "forgot_approach";
      });
    }

    // Difficulty filter
    if (diffFilter !== "All") {
      list = list.filter(p => p.difficulty === diffFilter);
    }

    // Pattern filter
    if (patternFilter !== "All") {
      list = list.filter(p => {
        const { patterns } = getProblemPatternDetails(p);
        return patterns.includes(patternFilter);
      });
    }

    // Recency filter
    if (recencyFilter !== "All") {
      list = list.filter(p => p.recency === recencyFilter);
    }

    // Status filter
    if (statusFilter !== "All") {
      list = list.filter(p => {
        const st = progress[getProblemKey(p)]?.status || "unsolved";
        return st === statusFilter;
      });
    }

    // Search query
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(p => {
        const matchTitle = (p.title || "").toLowerCase().includes(q);
        const matchId = String(p.id || "").includes(q);
        const { patterns, topic } = getProblemPatternDetails(p);
        const matchPat = patterns.some(pt => pt.toLowerCase().includes(q));
        const matchTopic = topic.toLowerCase().includes(q);
        return matchTitle || matchId || matchPat || matchTopic;
      });
    }

    // Sorting
    list.sort((a, b) => {
      const keyA = getProblemKey(a);
      const keyB = getProblemKey(b);
      const scoreA = priorityMap.get(keyA)?.score || 0;
      const scoreB = priorityMap.get(keyB)?.score || 0;

      if (practiceMode === "smart" && sortBy === "priority_desc") {
        return scoreB - scoreA;
      }
      if (sortBy === "priority_desc") return scoreB - scoreA;
      if (sortBy === "priority_asc")  return scoreA - scoreB;
      if (sortBy === "frequency_desc") return (b.frequency || 0) - (a.frequency || 0);
      if (sortBy === "frequency_asc")  return (a.frequency || 0) - (b.frequency || 0);
      if (sortBy === "diff_asc") {
        const order = { Easy: 1, Medium: 2, Hard: 3 };
        return (order[a.difficulty] || 2) - (order[b.difficulty] || 2);
      }
      if (sortBy === "diff_desc") {
        const order = { Easy: 1, Medium: 2, Hard: 3 };
        return (order[b.difficulty] || 2) - (order[a.difficulty] || 2);
      }
      if (sortBy === "id_asc") return (a.id || 0) - (b.id || 0);
      if (sortBy === "acceptance_desc") return (b.acceptance || 0) - (a.acceptance || 0);
      return 0;
    });

    return list;
  }, [practiceMode, mockProblems, problems, diffFilter, patternFilter, recencyFilter, statusFilter, search, sortBy, progress, priorityMap]);

  // Overall User Progress statistics for this company
  const companyProgressStats = useMemo(() => {
    let solvedCount = 0;
    let revisionCount = 0;
    let forgotCount = 0;
    let easySolved = 0, medSolved = 0, hardSolved = 0;

    for (const p of problems) {
      const key = getProblemKey(p);
      const st = progress[key]?.status || "unsolved";
      if (st === "solved") {
        solvedCount++;
        if (p.difficulty === "Easy") easySolved++;
        else if (p.difficulty === "Hard") hardSolved++;
        else medSolved++;
      } else if (st === "need_revision") {
        revisionCount++;
      } else if (st === "forgot_approach") {
        forgotCount++;
      }
    }

    const total = problems.length;
    const pct = total > 0 ? Math.round((solvedCount / total) * 100) : 0;
    return {
      total,
      solvedCount,
      revisionCount,
      forgotCount,
      pct,
      easySolved,
      medSolved,
      hardSolved,
    };
  }, [problems, progress]);

  // Handle Visualizer Code Loading
  const handleVisualizeCode = useCallback((p) => {
    const pid = p.id || null;
    const problemKey = getProblemKey(p);
    updateProblemProgress(problemKey, {
      attempts: (progress[problemKey]?.attempts || 0) + 1,
      lastAttempted: new Date().toISOString()
    });

    const lang = currentStoreLang;
    setLanguage(lang);

    const preset = pid ? PRESET_SOLUTIONS[pid] : null;
    if (preset && lang === "java") {
      setCode(preset.code);
      if (preset.inputs) setInputs(preset.inputs);
    } else {
      const template = getProblemTemplate({ id: pid, name: p.title, difficulty: p.difficulty, url: p.url, topic: p.topics?.[0] });
      if (template?.code && lang === "java") {
        setCode(template.code);
        if (template.inputs) setInputs(template.inputs);
      } else if (lang === "python") {
        const cleanMethodName = (p.title || "solve").toLowerCase().replace(/[^a-z0-9]+/g, "_");
        const starterPython = `# LeetCode #${p.id || ""}: ${p.title} (${p.difficulty})\n# Company: ${company.name} | Recency: ${p.recency}\n# Acceptance: ${p.acceptance ? p.acceptance + "%" : "N/A"} | Frequency: ${p.frequency}%\n# LeetCode: ${p.url}\n\ndef ${cleanMethodName}():\n    # Write or paste your solution below to visualize step-by-step\n    print("Tracing ${p.title}...")\n    pass\n\n${cleanMethodName}()\n`;
        setCode(starterPython);
        setInputs({});
      } else {
        const cleanMethodName = (p.title || "solve").replace(/[^a-zA-Z0-9 ]/g, "").split(/\s+/).map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("");
        const starterJava = `// LeetCode #${p.id || ""}: ${p.title} (${p.difficulty})\n// Company: ${company.name} | Recency: ${p.recency}\n// Acceptance: ${p.acceptance ? p.acceptance + "%" : "N/A"} | Frequency: ${p.frequency}%\n// LeetCode: ${p.url}\n\nclass Solution {\n    public void ${cleanMethodName}() {\n        // Write or paste your solution below to visualize step-by-step\n    }\n}\n`;
        setCode(starterJava);
        setInputs({});
      }
    }

    useTraceStore.setState({ activeTab: `#${p.id || ""} ${p.title}` });
    navigate("/");
  }, [company.name, currentStoreLang, navigate, progress, setCode, setInputs, setLanguage]);

  // Open Practice modal
  const handleOpenPracticeModal = useCallback((p) => {
    const pid = p.id || null;
    const { patterns, topic } = getProblemPatternDetails(p);
    setModalProblem({
      id: pid,
      name: p.title,
      title: p.title,
      difficulty: (p.difficulty || "Medium").toLowerCase(),
      url: p.url,
      frequency: p.frequency,
      recency: p.recency,
      topics: [topic, ...patterns],
      otherCompanies: p.otherCompanies,
    });
    setModalDesc(pid ? getProblemDescription(pid) : null);
  }, []);

  return (
    <div className="company-dashboard">
      <style>{`
        .company-dashboard {
          min-height: calc(100vh - 56px);
          background: #090d13;
          color: #c9d1d9;
          font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
          padding: 24px 32px 64px;
        }

        /* ── Breadcrumb & Top Bar ────────────────────────────── */
        .cd-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #8b949e;
          margin-bottom: 16px;
        }
        .cd-breadcrumb a { color: #79a8ff; text-decoration: none; }
        .cd-breadcrumb a:hover { text-decoration: underline; }

        /* ── Header Box ──────────────────────────────────────── */
        .cd-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          background: #0d1117;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 24px 28px;
          margin-bottom: 24px;
          position: relative;
          overflow: hidden;
        }
        .cd-header::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, ${company.color || "#58a6ff"}, transparent);
        }
        .cd-header-left {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .cd-icon-box {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
        }
        .cd-company-name {
          font-size: 26px;
          font-weight: 800;
          color: #f0f6fc;
          letter-spacing: -0.02em;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .cd-tier-pill {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 2px 8px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.06);
          color: #c9d1d9;
        }
        .cd-meta-row {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 6px;
          font-size: 13px;
          color: #8b949e;
        }
        .cd-trust-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          font-weight: 600;
          background: rgba(0, 184, 163, 0.12);
          color: #00b8a3;
          border: 1px solid rgba(0, 184, 163, 0.3);
          padding: 3px 10px;
          border-radius: 20px;
          cursor: pointer;
        }
        .cd-compare-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          background: rgba(88, 166, 255, 0.1);
          color: #79a8ff;
          border: 1px solid rgba(88, 166, 255, 0.3);
          padding: 6px 14px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .cd-compare-btn:hover {
          background: rgba(88, 166, 255, 0.2);
          color: #fff;
        }

        /* ── Readiness & Analytics Row ───────────────────────── */
        .cd-analytics-grid {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }
        @media (max-width: 992px) {
          .cd-analytics-grid { grid-template-columns: 1fr; }
        }

        /* Readiness Card */
        .cd-readiness-card {
          background: #0d1117;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .cd-readiness-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .cd-readiness-score-box {
          display: flex;
          align-items: baseline;
          gap: 6px;
        }
        .cd-readiness-num {
          font-size: 38px;
          font-weight: 900;
          color: #f0f6fc;
          font-family: var(--font-mono, monospace);
        }
        .cd-readiness-sub {
          font-size: 14px;
          color: #8b949e;
          font-weight: 600;
        }

        .cd-readiness-bars {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 14px;
        }
        .cd-readiness-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 11.5px;
          color: #8b949e;
        }
        .cd-readiness-mini-fill {
          height: 4px;
          background: rgba(255,255,255,0.08);
          border-radius: 2px;
          overflow: hidden;
          margin-top: 3px;
        }

        /* Focus Areas Banner */
        .cd-focus-card {
          background: #0d1117;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .cd-focus-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .cd-focus-items {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }
        .cd-focus-item-box {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 8px;
          padding: 12px;
        }

        /* ── Practice Modes Bar ──────────────────────────────── */
        .cd-modes-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #0d1117;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 8px 12px;
          margin-bottom: 20px;
          overflow-x: auto;
        }
        .cd-mode-btn {
          background: transparent;
          border: 1px solid transparent;
          color: #8b949e;
          font-size: 12.5px;
          font-weight: 600;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
          transition: all 0.15s;
        }
        .cd-mode-btn:hover {
          background: rgba(255,255,255,0.04);
          color: #c9d1d9;
        }
        .cd-mode-btn.active {
          background: rgba(88,166,255,0.15);
          border-color: #58a6ff;
          color: #58a6ff;
        }

        /* ── Patterns Row ────────────────────────────────────── */
        .cd-patterns-card {
          background: #0d1117;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 16px 20px;
          margin-bottom: 20px;
        }
        .cd-patterns-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        .cd-pattern-chips-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .cd-pat-chip {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          color: #c9d1d9;
          font-size: 11.5px;
          padding: 4px 10px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .cd-pat-chip:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.18);
        }
        .cd-pat-chip.active {
          background: rgba(88,166,255,0.15);
          border-color: #58a6ff;
          color: #58a6ff;
          font-weight: 600;
        }

        /* ── Table & Filters ─────────────────────────────────── */
        .cd-filter-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        .cd-input-search {
          background: #0d1117;
          border: 1px solid rgba(255,255,255,0.1);
          color: #c9d1d9;
          font-size: 12px;
          padding: 6px 12px;
          border-radius: 6px;
          width: 220px;
          outline: none;
        }
        .cd-input-search:focus { border-color: #58a6ff; }
        .cd-select {
          background: #0d1117;
          border: 1px solid rgba(255,255,255,0.1);
          color: #c9d1d9;
          font-size: 12px;
          padding: 6px 10px;
          border-radius: 6px;
          outline: none;
          cursor: pointer;
        }
        .cd-table-card {
          background: #0d1117;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          overflow: hidden;
        }
        .cd-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12.5px;
        }
        .cd-table th {
          background: rgba(255,255,255,0.02);
          color: #8b949e;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 12px 14px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          text-align: left;
        }
        .cd-table td {
          padding: 12px 14px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          vertical-align: middle;
        }
        .cd-table tr:hover td {
          background: rgba(255,255,255,0.02);
        }

        /* Priority Tag Pill */
        .cd-priority-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          padding: 2px 7px;
          border-radius: 4px;
          border: 1px solid;
        }

        .cd-prob-title {
          font-weight: 600;
          color: #f0f6fc;
          cursor: pointer;
          transition: color 0.15s;
        }
        .cd-prob-title:hover {
          color: #58a6ff;
          text-decoration: underline;
        }

        .cd-btn-action {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11.5px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 6px;
          cursor: pointer;
          text-decoration: none;
          border: 1px solid transparent;
        }
        .cd-btn-practice {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.1);
          color: #c9d1d9;
        }
        .cd-btn-practice:hover { background: rgba(255,255,255,0.1); color: #fff; }
        .cd-btn-visualize {
          background: rgba(88,166,255,0.12);
          border-color: rgba(88,166,255,0.3);
          color: #79a8ff;
        }
        .cd-btn-visualize:hover { background: #1f6feb; color: #fff; }
      `}</style>

      {/* Breadcrumb Navigation */}
      <div className="cd-breadcrumb">
        <Link to="/companies">Companies</Link>
        <span>/</span>
        <span style={{ color: "#f0f6fc", fontWeight: 600 }}>{company.name}</span>
      </div>

      {/* Header Box */}
      <div className="cd-header">
        <div className="cd-header-left">
          <div className="cd-icon-box">{company.icon || "🏢"}</div>
          <div>
            <div className="cd-company-name">
              {company.name}
              <span className="cd-tier-pill">{company.tier}</span>
            </div>
            <div className="cd-meta-row">
              <span>{metrics.relevance}</span>
              <span>•</span>
              <button className="cd-trust-badge" onClick={() => setShowTrustModal(true)}>
                <span>🛡️</span>
                <span>{DATA_TRUST_INFO.badge}</span>
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link to={`/interview/setup?companyId=${companyId}`} className="cd-compare-btn" style={{ textDecoration: "none", background: "linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(124, 58, 237, 0.25))", borderColor: "var(--accent-indigo, #6366f1)", color: "var(--txt-bright, #f8fafc)" }}>
            <span>🎯</span> Target & Interview Plan
          </Link>
          <button className="cd-compare-btn" onClick={() => setShowCompareModal(true)}>
            <span>⚖️</span> Compare with Another Company
          </button>
        </div>
      </div>

      {/* Interview Readiness & Focus Areas Analytics */}
      <div className="cd-analytics-grid">
        {/* TRACE Interview Readiness */}
        <div className="cd-readiness-card">
          <div>
            <div className="cd-readiness-top">
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#8b949e" }}>
                  TRACE Interview Readiness
                </div>
                <div style={{ fontSize: 11, color: "#6e7681", marginTop: 2 }}>
                  Multi-metric preparation telemetry
                </div>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 12,
                background: readiness.overall >= 60 ? "rgba(0,184,163,0.15)" : "rgba(255,161,22,0.15)",
                color: readiness.overall >= 60 ? "#00b8a3" : "#ffa116"
              }}>
                {readiness.label}
              </span>
            </div>

            <div className="cd-readiness-score-box">
              <span className="cd-readiness-num">{readiness.overall}%</span>
              <span className="cd-readiness-sub">overall</span>
            </div>
          </div>

          <div className="cd-readiness-bars">
            <div>
              <div className="cd-readiness-row">
                <span>Problem Coverage</span>
                <span style={{ fontFamily: "var(--font-mono, monospace)" }}>{readiness.problemCoverage}%</span>
              </div>
              <div className="cd-readiness-mini-fill">
                <div style={{ width: `${readiness.problemCoverage}%`, height: "100%", background: "#58a6ff" }} />
              </div>
            </div>

            <div>
              <div className="cd-readiness-row">
                <span>Pattern Coverage</span>
                <span style={{ fontFamily: "var(--font-mono, monospace)" }}>{readiness.patternCoverage}%</span>
              </div>
              <div className="cd-readiness-mini-fill">
                <div style={{ width: `${readiness.patternCoverage}%`, height: "100%", background: "#00b8a3" }} />
              </div>
            </div>

            <div>
              <div className="cd-readiness-row">
                <span>Revision Health</span>
                <span style={{ fontFamily: "var(--font-mono, monospace)" }}>{readiness.revisionHealth}%</span>
              </div>
              <div className="cd-readiness-mini-fill">
                <div style={{ width: `${readiness.revisionHealth}%`, height: "100%", background: "#ffa116" }} />
              </div>
            </div>

            <div>
              <div className="cd-readiness-row">
                <span>Difficulty Coverage</span>
                <span style={{ fontFamily: "var(--font-mono, monospace)" }}>{readiness.difficultyCoverage}%</span>
              </div>
              <div className="cd-readiness-mini-fill">
                <div style={{ width: `${readiness.difficultyCoverage}%`, height: "100%", background: "#c792ea" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Focus Areas */}
        <div className="cd-focus-card">
          <div className="cd-focus-header">
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#f0f6fc" }}>
                Target Focus Areas
              </div>
              <div style={{ fontSize: 11.5, color: "#8b949e", marginTop: 2 }}>
                Identified from unattempted patterns and revision status
              </div>
            </div>
            {focusAreas.revisionRequiredCount > 0 && (
              <span style={{
                fontSize: 11, fontWeight: 700, background: "rgba(239,71,67,0.15)", color: "#ef4743",
                padding: "3px 8px", borderRadius: 6
              }}>
                ⚡ {focusAreas.revisionRequiredCount} Need Revision
              </span>
            )}
          </div>

          <div className="cd-focus-items">
            {focusAreas.weakPatterns.length > 0 ? (
              focusAreas.weakPatterns.slice(0, 3).map(wp => (
                <div key={wp.pattern} className="cd-focus-item-box">
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#8b949e", marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, color: "#c9d1d9" }}>{wp.pattern}</span>
                    <span>{wp.solved}/{wp.total}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#79a8ff", cursor: "pointer", fontWeight: 600 }}
                       onClick={() => handleOpenPracticeModal(wp.recommendedProblem)}>
                    → Practice: {wp.recommendedProblem.title}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ fontSize: 12, color: "#00b8a3" }}>✓ Excellent pattern coverage across all core techniques.</div>
            )}

            {focusAreas.weakDifficulty && (
              <div className="cd-focus-item-box">
                <div style={{ fontSize: 11, fontWeight: 700, color: "#ef4743", marginBottom: 4 }}>
                  Hard Difficulty Gap
                </div>
                <div style={{ fontSize: 11, color: "#8b949e" }}>
                  {focusAreas.weakDifficulty.solved}/{focusAreas.weakDifficulty.total} solved ({focusAreas.weakDifficulty.pct}%)
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Practice Modes Selector Bar */}
      <div className="cd-modes-bar">
        {PRACTICE_MODES.map(m => (
          <button
            key={m.id}
            className={`cd-mode-btn ${practiceMode === m.id ? "active" : ""}`}
            onClick={() => setPracticeMode(m.id)}
            title={m.desc}
          >
            <span>{m.icon}</span>
            <span>{m.label}</span>
          </button>
        ))}

        {practiceMode === "mock" && (
          <button
            style={{
              marginLeft: "auto", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              color: "#c9d1d9", fontSize: 11.5, padding: "5px 12px", borderRadius: 6, cursor: "pointer"
            }}
            onClick={() => setMockSeed(s => s + 1)}
          >
            🎲 Reroll Mock Set
          </button>
        )}
      </div>

      {/* Curated Pattern Layer */}
      <div className="cd-patterns-card">
        <div className="cd-patterns-title-row">
          <div style={{ fontSize: 12, fontWeight: 700, color: "#f0f6fc", display: "flex", alignItems: "center", gap: 8 }}>
            <span>Top Algorithmic Patterns</span>
            <span style={{ fontSize: 10, color: "#8b949e", fontWeight: 400 }}>({PATTERN_SOURCE_LABEL})</span>
          </div>
          <button
            style={{ background: "transparent", border: "none", color: "#79a8ff", fontSize: 11, cursor: "pointer" }}
            onClick={() => setPatternFilter("All")}
          >
            Clear filter
          </button>
        </div>

        <div className="cd-pattern-chips-wrap">
          <button
            className={`cd-pat-chip ${patternFilter === "All" ? "active" : ""}`}
            onClick={() => setPatternFilter("All")}
          >
            All Patterns
          </button>
          {patternStats.patterns.slice(0, 10).map(p => (
            <button
              key={p.pattern}
              className={`cd-pat-chip ${patternFilter === p.pattern ? "active" : ""}`}
              onClick={() => setPatternFilter(patternFilter === p.pattern ? "All" : p.pattern)}
            >
              <span>{p.pattern}</span>
              <span style={{ fontSize: 10, opacity: 0.7 }}>({p.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="cd-filter-bar">
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <input
            type="text"
            className="cd-input-search"
            placeholder="Search problems, pattern, or ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <select className="cd-select" value={diffFilter} onChange={e => setDiffFilter(e.target.value)}>
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <select className="cd-select" value={recencyFilter} onChange={e => setRecencyFilter(e.target.value)}>
            <option value="All">All Recency</option>
            <option value="30 Days">Last 30 Days</option>
            <option value="6 Months">Last 6 Months</option>
          </select>

          <select className="cd-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="unsolved">○ Unsolved</option>
            <option value="solved">✓ Solved</option>
            <option value="need_revision">⚡ Need Revision</option>
            <option value="forgot_approach">⚠️ Forgot Approach</option>
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12, color: "#8b949e" }}>Sort by:</span>
          <select className="cd-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="priority_desc">Priority Score (Highest)</option>
            <option value="frequency_desc">Frequency (Highest)</option>
            <option value="diff_asc">Difficulty (Easy → Hard)</option>
            <option value="diff_desc">Difficulty (Hard → Easy)</option>
            <option value="id_asc">LeetCode # (Ascending)</option>
            <option value="acceptance_desc">Acceptance Rate</option>
          </select>

          <span style={{ fontSize: 12, color: "#8b949e", marginLeft: 8 }}>
            {filteredProblems.length} shown
          </span>
        </div>
      </div>

      {/* Problems Table */}
      <div className="cd-table-card">
        <table className="cd-table">
          <thead>
            <tr>
              <th style={{ width: 130 }}>Priority</th>
              <th style={{ width: 130 }}>Status</th>
              <th style={{ width: 55 }}>#</th>
              <th>Problem Title</th>
              <th style={{ width: 90 }}>Difficulty</th>
              <th style={{ width: 100 }}>Recency</th>
              <th style={{ width: 110 }}>Frequency</th>
              <th style={{ width: 120 }}>Coverage</th>
              <th style={{ width: 160, textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProblems.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", padding: "48px 0", color: "#8b949e" }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>🔍</div>
                  <div style={{ fontWeight: 600 }}>No problems match your current filter criteria</div>
                </td>
              </tr>
            ) : (
              filteredProblems.map(p => {
                const pKey = getProblemKey(p);
                const prog = progress[pKey] || { status: "unsolved" };
                const stConfig = STATUS_CONFIG[prog.status] || STATUS_CONFIG.unsolved;
                const prio = priorityMap.get(pKey) || { score: 50, tier: "Medium", color: "#79a8ff", reason: "Standard" };
                const { patterns, topic } = getProblemPatternDetails(p);

                return (
                  <tr key={pKey}>
                    {/* Priority Tier & Score */}
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <span
                          className="cd-priority-pill"
                          style={{ borderColor: prio.color, color: prio.color, background: `${prio.color}15` }}
                          title={prio.reason}
                        >
                          {prio.tier} · {prio.score}
                        </span>
                        <span style={{ fontSize: 10, color: "#6e7681", whiteSpace: "nowrap" }}>
                          {prio.reason.split("•")[0]}
                        </span>
                      </div>
                    </td>

                    {/* Status Dropdown */}
                    <td>
                      <select
                        style={{
                          background: "transparent",
                          color: stConfig.color,
                          border: "1px solid rgba(255,255,255,0.1)",
                          fontSize: 11.5,
                          fontWeight: 600,
                          padding: "3px 6px",
                          borderRadius: 6,
                          cursor: "pointer",
                          outline: "none"
                        }}
                        value={prog.status}
                        onChange={e => updateProgress(pKey, { status: e.target.value })}
                      >
                        <option value="unsolved">○ Unsolved</option>
                        <option value="solved">✓ Solved</option>
                        <option value="need_revision">⚡ Need Revision</option>
                        <option value="forgot_approach">⚠️ Forgot</option>
                      </select>
                    </td>

                    {/* ID */}
                    <td style={{ fontFamily: "var(--font-mono, monospace)", color: "#8b949e", fontSize: 11 }}>
                      #{p.id || "—"}
                    </td>

                    {/* Title + Topic & Patterns */}
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span className="cd-prob-title" onClick={() => handleOpenPracticeModal(p)}>
                            {p.title}
                          </span>
                          {PRESET_SOLUTIONS[p.id] && (
                            <span style={{
                              fontSize: 9.5, fontWeight: 700, padding: "1px 6px",
                              borderRadius: 4, background: "rgba(88,166,255,0.15)",
                              color: "#79a8ff", border: "1px solid rgba(88,166,255,0.3)"
                            }}>
                              ⚡ TRACE
                            </span>
                          )}
                        </div>

                        {/* Pattern tags */}
                        <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                          <span style={{
                            fontSize: 10, background: "rgba(255,255,255,0.06)", color: "#8b949e",
                            padding: "1px 5px", borderRadius: 3
                          }}>
                            {topic}
                          </span>
                          {patterns.slice(0, 2).map(pat => (
                            <span key={pat} style={{
                              fontSize: 10, background: "rgba(88,166,255,0.08)", color: "#79a8ff",
                              border: "1px solid rgba(88,166,255,0.2)", padding: "1px 5px", borderRadius: 3
                            }}>
                              {pat}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>

                    {/* Difficulty */}
                    <td>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: "2px 8px",
                        borderRadius: 20, color: DIFF_COLORS[p.difficulty] || "#8b949e",
                        background: DIFF_BG[p.difficulty] || "transparent"
                      }}>
                        {p.difficulty}
                      </span>
                    </td>

                    {/* Recency */}
                    <td>
                      <span style={{
                        fontSize: 10.5, fontWeight: 600, padding: "2px 7px", borderRadius: 12,
                        background: p.recency === "30 Days" ? "rgba(255, 99, 71, 0.12)" : "rgba(255,255,255,0.05)",
                        color: p.recency === "30 Days" ? "#ff7f6e" : "#8b949e",
                        border: p.recency === "30 Days" ? "1px solid rgba(255, 99, 71, 0.3)" : "1px solid rgba(255,255,255,0.08)"
                      }}>
                        {p.recency}
                      </span>
                    </td>

                    {/* Frequency */}
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 11, width: 32 }}>
                          {p.frequency}%
                        </span>
                        <div style={{ width: 40, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${Math.min(100, p.frequency)}%`, background: "#58a6ff" }} />
                        </div>
                      </div>
                    </td>

                    {/* Company Coverage */}
                    <td>
                      <span
                        style={{
                          fontSize: 11, color: "#79a8ff", fontWeight: 600, cursor: "pointer"
                        }}
                        title={p.otherCompanies ? `Prepares for: ${company.name}, ${p.otherCompanies.map(c => c.name).join(", ")}` : "Prepares for this company"}
                      >
                        {p.otherCompanies && p.otherCompanies.length > 0 ? (
                          `${p.otherCompanies.length + 1} companies`
                        ) : (
                          `1 company`
                        )}
                      </span>
                    </td>

                    {/* Actions */}
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                        <button
                          className="cd-btn-action cd-btn-practice"
                          onClick={() => handleOpenPracticeModal(p)}
                          title="Open Practice Modal"
                        >
                          Practice
                        </button>
                        <button
                          className="cd-btn-action cd-btn-visualize"
                          onClick={() => handleVisualizeCode(p)}
                          title="Visualize in TRACE Studio"
                        >
                          ▶ Visualize
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Problem Modal */}
      {modalProblem && (
        <ProblemModal
          problem={modalProblem}
          description={modalDesc}
          onClose={() => setModalProblem(null)}
        />
      )}

      {/* Company Comparison Modal */}
      {showCompareModal && (
        <CompanyComparisonModal
          initialCompanyId={companyId}
          onClose={() => setShowCompareModal(false)}
          onPractice={p => handleOpenPracticeModal(p)}
          onVisualize={p => handleVisualizeCode(p)}
        />
      )}

      {/* Data Trust & Verification Modal */}
      {showTrustModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
        }} onClick={() => setShowTrustModal(false)}>
          <div style={{
            background: "#161b22", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12,
            padding: "24px 28px", maxWidth: 500, width: "90%"
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <span style={{ fontSize: 24 }}>🛡️</span>
              <div style={{ fontSize: 17, fontWeight: 700, color: "#f0f6fc" }}>
                {DATA_TRUST_INFO.badge}
              </div>
            </div>
            <p style={{ fontSize: 13, color: "#c9d1d9", lineHeight: 1.6, marginBottom: 12 }}>
              <strong>Scope:</strong> {DATA_TRUST_INFO.datasetScope}
            </p>
            <p style={{ fontSize: 12.5, color: "#8b949e", lineHeight: 1.6, marginBottom: 20 }}>
              {DATA_TRUST_INFO.disclaimer}
            </p>
            <div style={{ textAlign: "right" }}>
              <button
                style={{
                  background: "#238636", color: "#fff", border: "none",
                  padding: "6px 14px", borderRadius: 6, fontWeight: 600, cursor: "pointer"
                }}
                onClick={() => setShowTrustModal(false)}
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
