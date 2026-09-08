import { useState, useMemo, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTraceStore } from "../store/traceStore.js";
import { getCompanyFullDetails, DATA_TRUST_INFO, getProblemKey } from "../data/companyUtils.js";
import { PRESET_SOLUTIONS, getProblemTemplate } from "../data/problemTemplates.js";
import { getProblemDescription } from "../data/problemDescriptions.js";
import { useAllProgress, updateProblemProgress } from "../services/progressStore.js";
import ProblemModal from "../components/ProblemModal.jsx";

const DIFF_COLORS = { Easy: "#00b8a3", Medium: "#ffa116", Hard: "#ef4743" };
const DIFF_BG = { Easy: "rgba(0,184,163,0.1)", Medium: "rgba(255,161,22,0.1)", Hard: "rgba(239,71,67,0.1)" };

const STATUS_CONFIG = {
  unsolved:        { label: "Unsolved",        icon: "○", color: "#6e7681", bg: "rgba(110,118,129,0.1)" },
  solved:          { label: "Solved",          icon: "✓", color: "#00b8a3", bg: "rgba(0,184,163,0.15)" },
  need_revision:   { label: "Need Revision",   icon: "⚡", color: "#ffa116", bg: "rgba(255,161,22,0.15)" },
  forgot_approach: { label: "Forgot Approach", icon: "⚠️", color: "#ef4743", bg: "rgba(239,71,67,0.15)" },
};

export default function CompanyDetailPage() {
  const { companyId } = useParams();
  const navigate = useNavigate();

  const details = useMemo(() => getCompanyFullDetails(companyId), [companyId]);
  const { progress, updateProgress } = useAllProgress();

  const { setCode, setInputs, setLanguage } = useTraceStore();
  const currentStoreLang = useTraceStore(s => s.language) || "java";

  // Filter & Search states
  const [search, setSearch] = useState("");
  const [diffFilter, setDiffFilter] = useState("All");
  const [topicFilter, setTopicFilter] = useState("All");
  const [recencyFilter, setRecencyFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [queueTab, setQueueTab] = useState("all"); // all | high_priority | frequent | unsolved | need_revision
  const [sortBy, setSortBy] = useState("frequency_desc");

  // Modal states
  const [modalProblem, setModalProblem] = useState(null);
  const [modalDesc, setModalDesc] = useState(null);
  const [showTrustModal, setShowTrustModal] = useState(false);

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
            font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
          }
          .cnf-title { font-size: 22px; font-weight: 700; margin-bottom: 12px; }
          .cnf-btn {
            background: #238636;
            color: #fff;
            padding: 8px 16px;
            border-radius: 6px;
            text-decoration: none;
            font-size: 13px;
            font-weight: 600;
          }
        `}</style>
        <div className="cnf-title">Company Not Found</div>
        <p style={{ color: "#8b949e", marginBottom: 20 }}>No dataset entries found for \"${companyId}\".</p>
        <Link to="/companies" className="cnf-btn">← Back to Company Directory</Link>
      </div>
    );
  }

  const { company, metrics, problems } = details;

  // Filtered and sorted problems
  const filteredProblems = useMemo(() => {
    let list = [...problems];

    // Practice Queue filter
    if (queueTab === "high_priority") {
      list = list.filter(p => p.frequency >= 75 || p.recency === "30 Days");
    } else if (queueTab === "frequent") {
      list = list.filter(p => p.frequency >= 50);
    } else if (queueTab === "unsolved") {
      list = list.filter(p => {
        const st = progress[getProblemKey(p)]?.status || "unsolved";
        return st === "unsolved";
      });
    } else if (queueTab === "need_revision") {
      list = list.filter(p => {
        const st = progress[getProblemKey(p)]?.status || "unsolved";
        return st === "need_revision" || st === "forgot_approach";
      });
    }

    // Difficulty filter
    if (diffFilter !== "All") {
      list = list.filter(p => p.difficulty === diffFilter);
    }

    // Topic / Pattern filter
    if (topicFilter !== "All") {
      list = list.filter(p => (p.topics || []).includes(topicFilter));
    }

    // Recency filter
    if (recencyFilter !== "All") {
      list = list.filter(p => p.recency === recencyFilter);
    }

    // Solved status filter
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
        const matchTopic = (p.topics || []).some(t => t.toLowerCase().includes(q));
        return matchTitle || matchId || matchTopic;
      });
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === "frequency_desc") return (b.frequency || 0) - (a.frequency || 0);
      if (sortBy === "frequency_asc") return (a.frequency || 0) - (b.frequency || 0);
      if (sortBy === "diff_asc") {
        const order = { Easy: 1, Medium: 2, Hard: 3 };
        return (order[a.difficulty] || 2) - (order[b.difficulty] || 2);
      }
      if (sortBy === "diff_desc") {
        const order = { Easy: 1, Medium: 2, Hard: 3 };
        return (order[b.difficulty] || 2) - (order[a.difficulty] || 2);
      }
      if (sortBy === "id_asc") return (a.id || 0) - (b.id || 0);
      if (sortBy === "id_desc") return (b.id || 0) - (a.id || 0);
      if (sortBy === "acceptance_desc") return (b.acceptance || 0) - (a.acceptance || 0);
      if (sortBy === "revision_priority") {
        const pKeyA = getProblemKey(a);
        const pKeyB = getProblemKey(b);
        const stA = progress[pKeyA]?.status || "unsolved";
        const stB = progress[pKeyB]?.status || "unsolved";
        const priorityScore = { forgot_approach: 4, need_revision: 3, unsolved: 2, solved: 1 };
        return (priorityScore[stB] || 0) - (priorityScore[stA] || 0);
      }
      return 0;
    });

    return list;
  }, [problems, queueTab, diffFilter, topicFilter, recencyFilter, statusFilter, search, sortBy, progress]);

  // Overall User Progress statistics for this company
  const companyProgressStats = useMemo(() => {
    let solvedCount = 0;
    let revisionCount = 0;
    let forgotCount = 0;
    let easySolved = 0;
    let medSolved = 0;
    let hardSolved = 0;

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

    // 1. Check executable preset
    const preset = pid ? PRESET_SOLUTIONS[pid] : null;
    if (preset && lang === "java") {
      setCode(preset.code);
      if (preset.inputs) setInputs(preset.inputs);
    } else {
      // 2. Generate clean starter code
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
    setModalProblem({
      id: pid,
      name: p.title,
      title: p.title,
      difficulty: (p.difficulty || "Medium").toLowerCase(),
      url: p.url,
      frequency: p.frequency,
      recency: p.recency,
      topics: p.topics,
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
        .cd-breadcrumb a {
          color: #79a8ff;
          text-decoration: none;
          transition: color 0.15s;
        }
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
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.1);
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
          transition: all 0.15s;
        }
        .cd-trust-badge:hover {
          background: rgba(0, 184, 163, 0.2);
          border-color: #00b8a3;
        }

        /* ── Header Right: Metrics Row ───────────────────────── */
        .cd-header-stats {
          display: flex;
          align-items: center;
          gap: 28px;
        }
        .cd-stat-col {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        .cd-stat-val {
          font-size: 26px;
          font-weight: 800;
          color: #f0f6fc;
          font-family: var(--font-mono, ui-monospace, monospace);
        }
        .cd-stat-lbl {
          font-size: 11px;
          color: #8b949e;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-top: 2px;
        }

        /* ── Interview Prep Section ──────────────────────────── */
        .cd-prep-card {
          background: #0d1117;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 20px 24px;
          margin-bottom: 24px;
        }
        .cd-prep-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding-bottom: 14px;
          margin-bottom: 16px;
        }
        .cd-prep-title {
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #f0f6fc;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .cd-prep-progress-pct {
          font-family: var(--font-mono, monospace);
          font-size: 13px;
          color: #00b8a3;
          font-weight: 600;
        }

        .cd-prep-grid {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 32px;
        }
        @media (max-width: 992px) {
          .cd-prep-grid { grid-template-columns: 1fr; }
        }

        /* ── Progress Bar & Counters ─────────────────────────── */
        .cd-progress-bar-wrap {
          margin-bottom: 14px;
        }
        .cd-progress-bar {
          height: 8px;
          background: rgba(255,255,255,0.06);
          border-radius: 4px;
          overflow: hidden;
          display: flex;
        }
        .cd-progress-fill-solved { background: #00b8a3; height: 100%; transition: width 0.3s; }
        .cd-progress-fill-rev    { background: #ffa116; height: 100%; transition: width 0.3s; }
        .cd-progress-fill-forgot { background: #ef4743; height: 100%; transition: width 0.3s; }

        .cd-diff-distribution {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 11.5px;
          margin-top: 10px;
        }
        .cd-diff-count-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
        }
        .cd-dot { width: 8px; height: 8px; border-radius: 50%; }

        /* ── Top Patterns Interactive Chips ──────────────────── */
        .cd-patterns-box {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .cd-patterns-lbl {
          font-size: 12px;
          color: #8b949e;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .cd-patterns-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .cd-pattern-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          color: #c9d1d9;
          padding: 4px 10px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .cd-pattern-chip:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.18);
        }
        .cd-pattern-chip.active {
          background: rgba(88,166,255,0.15);
          border-color: rgba(88,166,255,0.4);
          color: #79a8ff;
          font-weight: 600;
        }
        .cd-pattern-count {
          font-size: 10px;
          background: rgba(255,255,255,0.08);
          padding: 1px 5px;
          border-radius: 10px;
          color: #8b949e;
        }

        /* ── Practice Queues Tabs ────────────────────────────── */
        .cd-queue-tabs {
          display: flex;
          align-items: center;
          gap: 6px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          margin-bottom: 16px;
          padding-bottom: 12px;
          overflow-x: auto;
        }
        .cd-queue-btn {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.07);
          color: #8b949e;
          font-size: 12px;
          font-weight: 600;
          padding: 6px 14px;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .cd-queue-btn:hover {
          background: rgba(255,255,255,0.04);
          color: #c9d1d9;
        }
        .cd-queue-btn.active {
          background: rgba(88,166,255,0.12);
          border-color: #58a6ff;
          color: #58a6ff;
        }

        /* ── Controls / Filter Bar ───────────────────────────── */
        .cd-filter-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        .cd-filter-left {
          display: flex;
          align-items: center;
          gap: 10px;
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
          transition: border-color 0.15s;
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
        .cd-select:focus { border-color: #58a6ff; }

        /* ── Table Styling ───────────────────────────────────── */
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
          text-align: left;
        }
        .cd-table th {
          background: rgba(255,255,255,0.02);
          color: #8b949e;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .cd-table td {
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          vertical-align: middle;
        }
        .cd-table tr:hover td {
          background: rgba(255,255,255,0.02);
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

        .cd-tag {
          font-size: 10px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          color: #8b949e;
          padding: 1px 6px;
          border-radius: 3px;
        }
        .cd-recency-badge {
          font-size: 10.5px;
          font-weight: 600;
          padding: 2px 7px;
          border-radius: 12px;
          background: rgba(255,255,255,0.05);
          color: #8b949e;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .cd-recency-badge.recent-30d {
          background: rgba(255, 99, 71, 0.12);
          color: #ff7f6e;
          border-color: rgba(255, 99, 71, 0.3);
        }

        /* ── Progress Status Selector Dropdown ───────────────── */
        .cd-status-select {
          background: transparent;
          border: 1px solid transparent;
          font-size: 11.5px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 6px;
          cursor: pointer;
          outline: none;
          transition: all 0.15s;
        }
        .cd-status-select:hover {
          border-color: rgba(255,255,255,0.15);
        }

        /* ── Action Buttons ──────────────────────────────────── */
        .cd-actions-cell {
          display: flex;
          align-items: center;
          gap: 6px;
          justify-content: flex-end;
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
          transition: all 0.15s;
          border: 1px solid transparent;
        }
        .cd-btn-practice {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.1);
          color: #c9d1d9;
        }
        .cd-btn-practice:hover {
          background: rgba(255,255,255,0.1);
          color: #fff;
        }
        .cd-btn-visualize {
          background: rgba(88,166,255,0.12);
          border-color: rgba(88,166,255,0.3);
          color: #79a8ff;
        }
        .cd-btn-visualize:hover {
          background: #1f6feb;
          border-color: #388bfd;
          color: #fff;
        }
        .cd-btn-lc {
          background: transparent;
          border-color: rgba(255,255,255,0.08);
          color: #8b949e;
          padding: 4px 8px;
        }
        .cd-btn-lc:hover {
          color: #f0f6fc;
          border-color: rgba(255,255,255,0.2);
        }

        /* ── Frequency Bar ───────────────────────────────────── */
        .cd-freq-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .cd-freq-bar-bg {
          width: 50px;
          height: 4px;
          background: rgba(255,255,255,0.08);
          border-radius: 2px;
          overflow: hidden;
        }
        .cd-freq-bar-fill {
          height: 100%;
          background: #58a6ff;
          border-radius: 2px;
        }

        /* ── Trust Modal ─────────────────────────────────────── */
        .cd-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .cd-modal-card {
          background: #161b22;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 12px;
          padding: 24px 28px;
          max-width: 500px;
          width: 90%;
        }
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
          <div className="cd-icon-box">{company.icon}</div>
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

        <div className="cd-header-stats">
          <div className="cd-stat-col">
            <span className="cd-stat-val">{metrics.totalProblems}</span>
            <span className="cd-stat-lbl">Unique Questions</span>
          </div>
          <div className="cd-stat-col">
            <span className="cd-stat-val" style={{ color: "#ff7f6e" }}>{metrics.thirtyDaysCount}</span>
            <span className="cd-stat-lbl">30-Day Recency</span>
          </div>
          <div className="cd-stat-col">
            <span className="cd-stat-val" style={{ color: "#79a8ff" }}>{metrics.sixMonthsCount}</span>
            <span className="cd-stat-lbl">6-Month Archive</span>
          </div>
        </div>
      </div>

      {/* Interview Preparation Area */}
      <div className="cd-prep-card">
        <div className="cd-prep-top">
          <div className="cd-prep-title">
            <span>🎯</span>
            <span>Interview Preparation Tracker</span>
          </div>
          <div className="cd-prep-progress-pct">
            {companyProgressStats.solvedCount} / {companyProgressStats.total} Solved ({companyProgressStats.pct}%)
          </div>
        </div>

        <div className="cd-prep-grid">
          <div>
            <div className="cd-progress-bar-wrap">
              <div className="cd-progress-bar">
                <div
                  className="cd-progress-fill-solved"
                  style={{ width: `${(companyProgressStats.solvedCount / Math.max(1, companyProgressStats.total)) * 100}%` }}
                  title="Solved"
                />
                <div
                  className="cd-progress-fill-rev"
                  style={{ width: `${(companyProgressStats.revisionCount / Math.max(1, companyProgressStats.total)) * 100}%` }}
                  title="Needs Revision"
                />
                <div
                  className="cd-progress-fill-forgot"
                  style={{ width: `${(companyProgressStats.forgotCount / Math.max(1, companyProgressStats.total)) * 100}%` }}
                  title="Forgot Approach"
                />
              </div>
            </div>

            <div className="cd-diff-distribution">
              <span className="cd-diff-count-badge" style={{ color: DIFF_COLORS.Easy }}>
                <span className="cd-dot" style={{ background: DIFF_COLORS.Easy }} />
                Easy: {companyProgressStats.easySolved} / {metrics.easyCount}
              </span>
              <span className="cd-diff-count-badge" style={{ color: DIFF_COLORS.Medium }}>
                <span className="cd-dot" style={{ background: DIFF_COLORS.Medium }} />
                Med: {companyProgressStats.medSolved} / {metrics.medCount}
              </span>
              <span className="cd-diff-count-badge" style={{ color: DIFF_COLORS.Hard }}>
                <span className="cd-dot" style={{ background: DIFF_COLORS.Hard }} />
                Hard: {companyProgressStats.hardSolved} / {metrics.hardCount}
              </span>
            </div>
          </div>

          <div className="cd-patterns-box">
            <div className="cd-patterns-lbl">Top Interview Patterns (From Actual Dataset):</div>
            <div className="cd-patterns-list">
              <button
                className={`cd-pattern-chip ${topicFilter === "All" ? "active" : ""}`}
                onClick={() => setTopicFilter("All")}
              >
                All Patterns
              </button>
              {metrics.topPatterns.slice(0, 8).map(tp => (
                <button
                  key={tp.name}
                  className={`cd-pattern-chip ${topicFilter === tp.name ? "active" : ""}`}
                  onClick={() => setTopicFilter(topicFilter === tp.name ? "All" : tp.name)}
                >
                  <span>{tp.name}</span>
                  <span className="cd-pattern-count">{tp.count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Practice Queues */}
      <div className="cd-queue-tabs">
        <button
          className={`cd-queue-btn ${queueTab === "all" ? "active" : ""}`}
          onClick={() => setQueueTab("all")}
        >
          <span>📋</span> All Problems ({problems.length})
        </button>
        <button
          className={`cd-queue-btn ${queueTab === "high_priority" ? "active" : ""}`}
          onClick={() => setQueueTab("high_priority")}
        >
          <span>🔥</span> High Priority ({problems.filter(p => p.frequency >= 75 || p.recency === "30 Days").length})
        </button>
        <button
          className={`cd-queue-btn ${queueTab === "frequent" ? "active" : ""}`}
          onClick={() => setQueueTab("frequent")}
        >
          <span>📈</span> Frequently Asked ({problems.filter(p => p.frequency >= 50).length})
        </button>
        <button
          className={`cd-queue-btn ${queueTab === "unsolved" ? "active" : ""}`}
          onClick={() => setQueueTab("unsolved")}
        >
          <span>○</span> Unsolved ({companyProgressStats.total - companyProgressStats.solvedCount})
        </button>
        <button
          className={`cd-queue-btn ${queueTab === "need_revision" ? "active" : ""}`}
          onClick={() => setQueueTab("need_revision")}
        >
          <span>⚡</span> Needs Revision ({companyProgressStats.revisionCount + companyProgressStats.forgotCount})
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="cd-filter-bar">
        <div className="cd-filter-left">
          <input
            type="text"
            className="cd-input-search"
            placeholder="Search problems or ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <select
            className="cd-select"
            value={diffFilter}
            onChange={e => setDiffFilter(e.target.value)}
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <select
            className="cd-select"
            value={recencyFilter}
            onChange={e => setRecencyFilter(e.target.value)}
          >
            <option value="All">All Recency</option>
            <option value="30 Days">Last 30 Days</option>
            <option value="6 Months">Last 6 Months</option>
          </select>

          <select
            className="cd-select"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="unsolved">○ Unsolved</option>
            <option value="solved">✓ Solved</option>
            <option value="need_revision">⚡ Need Revision</option>
            <option value="forgot_approach">⚠️ Forgot Approach</option>
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12, color: "#8b949e" }}>Sort by:</span>
          <select
            className="cd-select"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="frequency_desc">Frequency (Highest)</option>
            <option value="frequency_asc">Frequency (Lowest)</option>
            <option value="diff_asc">Difficulty (Easy → Hard)</option>
            <option value="diff_desc">Difficulty (Hard → Easy)</option>
            <option value="id_asc">LeetCode # (Ascending)</option>
            <option value="acceptance_desc">Acceptance Rate</option>
            <option value="revision_priority">Revision Priority</option>
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
              <th style={{ width: 140 }}>Status</th>
              <th style={{ width: 60 }}>#</th>
              <th>Problem Title</th>
              <th style={{ width: 100 }}>Difficulty</th>
              <th style={{ width: 110 }}>Recency</th>
              <th style={{ width: 140 }}>Frequency</th>
              <th style={{ width: 90 }}>Acceptance</th>
              <th style={{ width: 180, textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProblems.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: "48px 0", color: "#8b949e" }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>🔍</div>
                  <div style={{ fontWeight: 600 }}>No problems match your current filter criteria</div>
                </td>
              </tr>
            ) : (
              filteredProblems.map(p => {
                const pKey = getProblemKey(p);
                const prog = progress[pKey] || { status: "unsolved" };
                const stConfig = STATUS_CONFIG[prog.status] || STATUS_CONFIG.unsolved;

                return (
                  <tr key={pKey}>
                    {/* Status Dropdown */}
                    <td>
                      <select
                        className="cd-status-select"
                        value={prog.status}
                        style={{ color: stConfig.color, background: stConfig.bg }}
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

                    {/* Title + Metadata */}
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span
                            className="cd-prob-title"
                            onClick={() => handleOpenPracticeModal(p)}
                          >
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

                        {/* Topics & Multi-company indicators */}
                        <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                          {(p.topics || []).slice(0, 3).map(t => (
                            <span key={t} className="cd-tag">{t}</span>
                          ))}
                          {p.otherCompanies && p.otherCompanies.length > 0 && (
                            <span
                              className="cd-tag"
                              style={{ color: "#79a8ff", borderColor: "rgba(88,166,255,0.25)" }}
                              title={`Also asked by: ${p.otherCompanies.map(c => c.name).join(", ")}`}
                            >
                              +{p.otherCompanies.length} companies
                            </span>
                          )}
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
                      <span className={`cd-recency-badge ${p.recency === "30 Days" ? "recent-30d" : ""}`}>
                        {p.recency}
                      </span>
                    </td>

                    {/* Frequency */}
                    <td>
                      <div className="cd-freq-wrap">
                        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 11, width: 34 }}>
                          {p.frequency}%
                        </span>
                        <div className="cd-freq-bar-bg">
                          <div className="cd-freq-bar-fill" style={{ width: `${Math.min(100, p.frequency)}%` }} />
                        </div>
                      </div>
                    </td>

                    {/* Acceptance */}
                    <td style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 11, color: "#8b949e" }}>
                      {typeof p.acceptance === "number" ? `${p.acceptance}%` : "—"}
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="cd-actions-cell">
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
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="cd-btn-action cd-btn-lc"
                          title="Open on LeetCode"
                        >
                          ↗
                        </a>
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

      {/* Data Trust & Verification Modal */}
      {showTrustModal && (
        <div className="cd-modal-overlay" onClick={() => setShowTrustModal(false)}>
          <div className="cd-modal-card" onClick={e => e.stopPropagation()}>
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
