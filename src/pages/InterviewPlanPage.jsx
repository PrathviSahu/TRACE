// ─────────────────────────────────────────────────────────────
//  TRACE — Daily Interview Plan Dashboard
//  Phase 3.2: Deterministic day-by-day study roadmap interface.
// ─────────────────────────────────────────────────────────────
import { useState, useMemo, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTraceStore } from "../store/traceStore.js";
import {
  useInterviewProfile,
  useDailyPlan,
  saveDailyPlan,
  calculateDaysRemaining
} from "../services/interviewPlanStore.js";
import { generateDailyPlan } from "../services/dailyPlanGenerator.js";
import { useAllProgress, updateProblemProgress, getProblemKey } from "../services/progressStore.js";
import { getProblemDescription } from "../data/problemDescriptions.js";
import { PRESET_SOLUTIONS, getProblemTemplate } from "../data/problemTemplates.js";
import ProblemModal from "../components/ProblemModal.jsx";

const DIFF_COLORS = { Easy: "#00b8a3", Medium: "#ffa116", Hard: "#ef4743" };
const DIFF_BG = { Easy: "rgba(0,184,163,0.12)", Medium: "rgba(255,161,22,0.12)", Hard: "rgba(239,71,67,0.12)" };

const PRIORITY_BADGES = {
  critical: { label: "CRITICAL FOCUS", color: "#ef4743", bg: "rgba(239, 71, 67, 0.15)", border: "rgba(239, 71, 67, 0.4)" },
  high:     { label: "HIGH YIELD",     color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)", border: "rgba(245, 158, 11, 0.4)" },
  medium:   { label: "CORE DSA",       color: "#38bdf8", bg: "rgba(56, 189, 248, 0.15)", border: "rgba(56, 189, 248, 0.4)" },
};

export default function InterviewPlanPage() {
  const navigate = useNavigate();
  const { profile, planningState } = useInterviewProfile();
  const { dailyPlan, saveDailyPlan: persistPlan } = useDailyPlan();
  const { progress, updateProgress } = useAllProgress();

  const { setCode, setInputs, setLanguage } = useTraceStore();
  const currentStoreLang = useTraceStore(s => s.language) || "java";

  const [modalProblem, setModalProblem] = useState(null);
  const [modalDesc, setModalDesc] = useState(null);
  const [selectedDayFilter, setSelectedDayFilter] = useState("all");
  const [statusNotification, setStatusNotification] = useState(null);

  // Derive days remaining dynamically (never static)
  const daysRemaining = useMemo(() => {
    return profile ? calculateDaysRemaining(profile.interviewDate, profile.timezone) : null;
  }, [profile]);

  // Generate or regenerate plan deterministically
  const handleGeneratePlan = useCallback(() => {
    if (!profile) return;
    try {
      const generated = generateDailyPlan(profile, progress);
      persistPlan(generated);
      setStatusNotification({
        type: "success",
        message: `Plan generated deterministically! ${generated.totalStudyDays} days • ${generated.totalProblemsScheduled} problems.`
      });
      setTimeout(() => setStatusNotification(null), 5000);
    } catch (err) {
      setStatusNotification({ type: "error", message: err.message });
    }
  }, [profile, progress, persistPlan]);

  // If profile exists but no plan has been generated yet, auto-generate initial plan
  useEffect(() => {
    if (profile && !dailyPlan) {
      handleGeneratePlan();
    }
  }, [profile, dailyPlan, handleGeneratePlan]);

  // Visualize problem in TRACE Studio
  const handleVisualizeCode = useCallback((p) => {
    const pid = p.id || null;
    const problemKey = getProblemKey(p);
    updateProgress(problemKey, {
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
      }
    }
    navigate("/");
  }, [currentStoreLang, progress, updateProgress, setLanguage, setCode, setInputs, navigate]);

  // Open Practice Modal
  const handleOpenPracticeModal = useCallback((p) => {
    setModalProblem(p);
    const desc = getProblemDescription(p.id);
    setModalDesc(desc || { description: "Standard LeetCode Problem", examples: [] });
  }, []);

  // Toggle problem completion
  const handleToggleSolved = useCallback((problemKey, currentStatus) => {
    const nextStatus = currentStatus === "solved" ? "unsolved" : "solved";
    updateProgress(problemKey, { status: nextStatus });
  }, [updateProgress]);

  // Filtered days list
  const filteredDays = useMemo(() => {
    if (!dailyPlan?.days) return [];
    if (selectedDayFilter === "all") return dailyPlan.days;
    const dayNum = Number(selectedDayFilter);
    return dailyPlan.days.filter(d => d.dayIndex === dayNum);
  }, [dailyPlan, selectedDayFilter]);

  // Overall plan completion calculation
  const planCompletion = useMemo(() => {
    if (!dailyPlan?.days || dailyPlan.days.length === 0) return { solved: 0, total: 0, pct: 0 };
    let total = 0;
    let solved = 0;
    for (const day of dailyPlan.days) {
      for (const p of day.problems) {
        total++;
        if (progress[getProblemKey(p)]?.status === "solved") solved++;
      }
      for (const p of day.revisionProblems) {
        total++;
        if (progress[getProblemKey(p)]?.status === "solved") solved++;
      }
    }
    const pct = total > 0 ? Math.round((solved / total) * 100) : 0;
    return { solved, total, pct };
  }, [dailyPlan, progress]);

  // ── If No Profile Configured ──────────────────────────────────
  if (!profile) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-darkest, #070a12)", color: "var(--txt-main, #e2e8f0)", padding: "3rem 1.5rem" }}>
        <div style={{ maxWidth: "680px", margin: "4rem auto", textAlign: "center", background: "var(--bg-surface, #0d1322)", border: "1px solid #1c2842", borderRadius: "12px", padding: "3rem 2rem" }}>
          <span style={{ fontSize: "3rem", display: "block", marginBottom: "1rem" }}>🎯</span>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--txt-bright, #f8fafc)", margin: 0 }}>
            No Active Interview Target Found
          </h2>
          <p style={{ color: "var(--txt-muted, #94a3b8)", fontSize: "0.95rem", margin: "0.75rem 0 2rem 0", lineHeight: 1.6 }}>
            Set up your target company, interview timeline, and daily study minutes.
            TRACE's deterministic planning engine will generate a personalized day-by-day roadmap for you.
          </p>
          <Link
            to="/interview/setup"
            style={{
              padding: "0.85rem 1.75rem",
              borderRadius: "8px",
              background: "linear-gradient(135deg, var(--accent-indigo, #6366f1), var(--accent-purple, #7c3aed))",
              color: "#fff",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "0.95rem",
              boxShadow: "0 4px 14px rgba(99, 102, 241, 0.4)"
            }}
          >
            🎯 Configure Interview Setup →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="interview-plan-page" style={{
      minHeight: "100vh",
      background: "var(--bg-darkest, #070a12)",
      color: "var(--txt-main, #e2e8f0)",
      fontFamily: "var(--font-ui, Inter, sans-serif)",
      padding: "2rem 1.5rem 5rem 1.5rem"
    }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>

        {/* ── Top Header ────────────────────────────────────────── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1.75rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.4rem" }}>
              <span style={{
                background: "rgba(99, 102, 241, 0.15)",
                border: "1px solid var(--accent-indigo, #6366f1)",
                color: "var(--accent-cyan, #38bdf8)",
                padding: "0.2rem 0.6rem",
                borderRadius: "4px",
                fontSize: "0.72rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase"
              }}>
                🎯 PHASE 3.2 • DETERMINISTIC DAILY ROADMAP
              </span>
              <span style={{
                background: "rgba(16, 185, 129, 0.15)",
                border: "1px solid var(--accent-green, #10b981)",
                color: "var(--accent-green, #10b981)",
                padding: "0.2rem 0.6rem",
                borderRadius: "4px",
                fontSize: "0.72rem",
                fontWeight: 600
              }}>
                v{planningState?.planVersion || 1}
              </span>
            </div>

            <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "var(--txt-bright, #f8fafc)", margin: 0, display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <span>{dailyPlan?.companyIcon || "🏢"}</span>
              <span>{dailyPlan?.companyName || profile.companyId} Preparation Plan</span>
            </h1>
            <p style={{ color: "var(--txt-muted, #94a3b8)", fontSize: "0.9rem", margin: "0.35rem 0 0 0" }}>
              Target: <strong style={{ color: "var(--txt-bright, #f8fafc)" }}>{profile.role}</strong> • {daysRemaining !== null ? `${daysRemaining} Days Remaining` : ""} • Calibrated for {profile.dailyStudyMinutes} min/day
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <button
              id="regenerate-plan-btn"
              type="button"
              onClick={handleGeneratePlan}
              style={{
                padding: "0.65rem 1.1rem",
                borderRadius: "6px",
                border: "1px solid var(--accent-indigo, #6366f1)",
                background: "rgba(99, 102, 241, 0.15)",
                color: "var(--accent-cyan, #38bdf8)",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem"
              }}
            >
              <span>🔄</span> Regenerate Plan
            </button>

            <Link
              to="/interview/setup"
              style={{
                padding: "0.65rem 1.1rem",
                borderRadius: "6px",
                border: "1px solid #1c2842",
                background: "var(--bg-surface, #0d1322)",
                color: "var(--txt-muted, #94a3b8)",
                textDecoration: "none",
                fontSize: "0.85rem",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "0.4rem"
              }}
            >
              <span>⚙️</span> Edit Setup
            </Link>
          </div>
        </div>

        {/* ── Status Notification ────────────────────────────────── */}
        {statusNotification && (
          <div style={{
            padding: "0.75rem 1.25rem",
            borderRadius: "8px",
            marginBottom: "1.5rem",
            background: statusNotification.type === "success" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
            border: `1px solid ${statusNotification.type === "success" ? "var(--accent-green, #10b981)" : "var(--accent-rose, #f43f5e)"}`,
            color: statusNotification.type === "success" ? "#34d399" : "#f87171",
            fontSize: "0.88rem",
            fontWeight: 600,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <span>{statusNotification.message}</span>
            <button onClick={() => setStatusNotification(null)} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer" }}>✕</button>
          </div>
        )}

        {/* ── Metrics Dashboard ─────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.75rem" }}>
          <div style={statCardStyle}>
            <span style={statLabelStyle}>Study Timeline</span>
            <span style={statValueStyle}>{dailyPlan?.totalStudyDays || 0} Days</span>
            <span style={statSubStyle}>{daysRemaining} calendar days remaining</span>
          </div>

          <div style={statCardStyle}>
            <span style={statLabelStyle}>Target Problems</span>
            <span style={statValueStyle}>{dailyPlan?.totalProblemsScheduled || 0}</span>
            <span style={statSubStyle}>{dailyPlan?.companyTier} Tier Questions</span>
          </div>

          <div style={statCardStyle}>
            <span style={statLabelStyle}>Revision Queue</span>
            <span style={statValueStyle}>{dailyPlan?.totalRevisionScheduled || 0}</span>
            <span style={statSubStyle}>Spaced Repetition Items</span>
          </div>

          <div style={statCardStyle}>
            <span style={statLabelStyle}>Overall Completion</span>
            <span style={statValueStyle}>{planCompletion.pct}%</span>
            <div style={{ width: "100%", background: "#1c2842", height: "6px", borderRadius: "3px", marginTop: "0.4rem", overflow: "hidden" }}>
              <div style={{ width: `${planCompletion.pct}%`, background: "var(--accent-green, #10b981)", height: "100%", transition: "width 0.3s ease" }} />
            </div>
            <span style={statSubStyle}>{planCompletion.solved} of {planCompletion.total} problems completed</span>
          </div>
        </div>

        {/* ── Pattern Family Coverage Bar ──────────────────────── */}
        {dailyPlan?.patternFamilyCoverage && Object.keys(dailyPlan.patternFamilyCoverage).length > 0 && (
          <div style={{
            background: "var(--bg-surface, #0d1322)",
            border: "1px solid #1c2842",
            borderRadius: "10px",
            padding: "1rem 1.25rem",
            marginBottom: "2rem"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--txt-muted, #94a3b8)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Pattern Family Distribution (Curated Taxonomy)
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--txt-dim, #64748b)" }}>
                {Object.keys(dailyPlan.patternFamilyCoverage).length} Pattern Families Covered
              </span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem" }}>
              {Object.entries(dailyPlan.patternFamilyCoverage).map(([fam, count]) => (
                <div
                  key={fam}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: "0.25rem 0.6rem",
                    borderRadius: "4px",
                    background: "#141e33",
                    border: "1px solid #1c2842",
                    fontSize: "0.75rem"
                  }}
                >
                  <span style={{ color: "var(--txt-main, #e2e8f0)", fontWeight: 600 }}>{fam}</span>
                  <span style={{ background: "rgba(99, 102, 241, 0.25)", color: "var(--accent-cyan, #38bdf8)", padding: "0.05rem 0.35rem", borderRadius: "3px", fontSize: "0.7rem", fontWeight: 700 }}>
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Day Filter Bar ────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--txt-muted, #94a3b8)", marginRight: "0.35rem" }}>
              Filter Schedule:
            </span>
            <button
              type="button"
              onClick={() => setSelectedDayFilter("all")}
              style={{
                padding: "0.35rem 0.75rem",
                borderRadius: "5px",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
                border: selectedDayFilter === "all" ? "1px solid var(--accent-indigo, #6366f1)" : "1px solid #1c2842",
                background: selectedDayFilter === "all" ? "rgba(99, 102, 241, 0.2)" : "#0f1728",
                color: selectedDayFilter === "all" ? "var(--txt-bright, #f8fafc)" : "var(--txt-muted, #94a3b8)"
              }}
            >
              All Days ({dailyPlan?.days?.length || 0})
            </button>
            {dailyPlan?.days?.map(d => (
              <button
                key={d.dayIndex}
                type="button"
                onClick={() => setSelectedDayFilter(String(d.dayIndex))}
                style={{
                  padding: "0.35rem 0.65rem",
                  borderRadius: "5px",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  border: selectedDayFilter === String(d.dayIndex) ? "1px solid var(--accent-cyan, #38bdf8)" : "1px solid #1c2842",
                  background: selectedDayFilter === String(d.dayIndex) ? "rgba(56, 189, 248, 0.15)" : "#0f1728",
                  color: selectedDayFilter === String(d.dayIndex) ? "var(--accent-cyan, #38bdf8)" : "var(--txt-dim, #64748b)"
                }}
              >
                Day {d.dayIndex}
              </button>
            ))}
          </div>
        </div>

        {/* ── Day-by-Day Timeline Cards ─────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {filteredDays.map(day => {
            const pBadge = PRIORITY_BADGES[day.priority] || PRIORITY_BADGES.medium;
            const allDayProblems = [...day.problems, ...day.revisionProblems];
            const solvedInDay = allDayProblems.filter(p => progress[getProblemKey(p)]?.status === "solved").length;
            const dayPct = allDayProblems.length > 0 ? Math.round((solvedInDay / allDayProblems.length) * 100) : 0;

            return (
              <div
                key={day.dayIndex}
                id={`day-card-${day.dayIndex}`}
                style={{
                  background: "var(--bg-surface, #0d1322)",
                  border: day.isMockDay ? "1px solid rgba(245, 158, 11, 0.4)" : "1px solid #1c2842",
                  borderRadius: "12px",
                  overflow: "hidden",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)"
                }}
              >
                {/* Day Card Header */}
                <div style={{
                  padding: "1rem 1.5rem",
                  background: day.isMockDay ? "linear-gradient(90deg, rgba(245, 158, 11, 0.1), rgba(15, 23, 40, 0.8))" : "#0f1728",
                  borderBottom: "1px solid #1c2842",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "0.75rem"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={{
                      fontSize: "1.1rem",
                      fontWeight: 800,
                      color: "var(--txt-bright, #f8fafc)",
                      background: "#141e33",
                      padding: "0.35rem 0.75rem",
                      borderRadius: "6px",
                      border: "1px solid #1c2842"
                    }}>
                      Day {day.dayIndex}
                    </span>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--txt-bright, #f8fafc)" }}>
                          {day.focusFamily}
                        </span>
                        {day.isMockDay && (
                          <span style={{
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            padding: "0.15rem 0.45rem",
                            borderRadius: "4px",
                            background: "rgba(245, 158, 11, 0.2)",
                            color: "#fbbf24",
                            border: "1px solid rgba(245, 158, 11, 0.4)"
                          }}>
                            🎲 MOCK INTERVIEW DAY
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: "0.75rem", color: "var(--txt-dim, #64748b)" }}>
                        {day.date} ({day.dayOfWeek}) • Focus Topic: {day.focusTopic}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      padding: "0.25rem 0.55rem",
                      borderRadius: "4px",
                      background: pBadge.bg,
                      color: pBadge.color,
                      border: `1px solid ${pBadge.border}`
                    }}>
                      {pBadge.label}
                    </span>

                    <span style={{
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      color: "var(--txt-muted, #94a3b8)",
                      background: "#141e33",
                      padding: "0.25rem 0.55rem",
                      borderRadius: "4px",
                      border: "1px solid #1c2842"
                    }}>
                      ⏱️ ~{day.estimatedMinutes} mins
                    </span>

                    <span style={{
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      color: dayPct === 100 ? "var(--accent-green, #10b981)" : "var(--txt-muted, #94a3b8)"
                    }}>
                      {solvedInDay}/{allDayProblems.length} Solved
                    </span>
                  </div>
                </div>

                {/* Problem Rows Table */}
                <div style={{ padding: "0.75rem 1.25rem" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #162035", textAlign: "left", fontSize: "0.72rem", color: "var(--txt-dim, #64748b)", textTransform: "uppercase" }}>
                        <th style={{ padding: "0.5rem 0.75rem", width: "40px" }}>Status</th>
                        <th style={{ padding: "0.5rem 0.75rem" }}>Problem</th>
                        <th style={{ padding: "0.5rem 0.75rem", width: "110px" }}>Difficulty</th>
                        <th style={{ padding: "0.5rem 0.75rem" }}>Pattern & Family</th>
                        <th style={{ padding: "0.5rem 0.75rem", width: "110px" }}>Type / Recency</th>
                        <th style={{ padding: "0.5rem 0.75rem", width: "90px" }}>Est. Time</th>
                        <th style={{ padding: "0.5rem 0.75rem", textAlign: "right", width: "180px" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* 1. Revision Problems (if any) */}
                      {day.revisionProblems?.map(p => {
                        const pKey = getProblemKey(p);
                        const isSolved = progress[pKey]?.status === "solved";
                        return (
                          <tr key={`rev-${p.id}`} style={{ borderBottom: "1px solid #162035", background: "rgba(245, 158, 11, 0.03)" }}>
                            <td style={{ padding: "0.65rem 0.75rem" }}>
                              <input
                                type="checkbox"
                                checked={isSolved}
                                onChange={() => handleToggleSolved(pKey, progress[pKey]?.status)}
                                style={{ cursor: "pointer", accentColor: "var(--accent-green, #10b981)" }}
                                title="Mark solved"
                              />
                            </td>
                            <td style={{ padding: "0.65rem 0.75rem" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <span style={{ color: "var(--txt-dim, #64748b)", fontSize: "0.8rem", fontWeight: 700 }}>#{p.id}</span>
                                <span style={{ color: isSolved ? "var(--txt-muted, #94a3b8)" : "var(--txt-bright, #f8fafc)", fontWeight: 600, fontSize: "0.88rem", textDecoration: isSolved ? "line-through" : "none" }}>
                                  {p.title}
                                </span>
                              </div>
                            </td>
                            <td style={{ padding: "0.65rem 0.75rem" }}>
                              <span style={{
                                fontSize: "0.72rem", fontWeight: 700, padding: "0.15rem 0.45rem", borderRadius: "4px",
                                color: DIFF_COLORS[p.difficulty] || "#ffa116", background: DIFF_BG[p.difficulty] || "rgba(255,161,22,0.12)"
                              }}>
                                {p.difficulty}
                              </span>
                            </td>
                            <td style={{ padding: "0.65rem 0.75rem" }}>
                              <span style={{ fontSize: "0.78rem", color: "var(--accent-cyan, #38bdf8)", fontWeight: 500 }}>
                                {p.primaryPattern}
                              </span>
                            </td>
                            <td style={{ padding: "0.65rem 0.75rem" }}>
                              <span style={{
                                fontSize: "0.7rem", fontWeight: 700, padding: "0.15rem 0.45rem", borderRadius: "4px",
                                background: "rgba(245, 158, 11, 0.2)", color: "#fbbf24", border: "1px solid rgba(245, 158, 11, 0.3)"
                              }}>
                                ⚡ Spaced Review
                              </span>
                            </td>
                            <td style={{ padding: "0.65rem 0.75rem", fontSize: "0.78rem", color: "var(--txt-muted, #94a3b8)" }}>
                              ~15 mins
                            </td>
                            <td style={{ padding: "0.65rem 0.75rem", textAlign: "right" }}>
                              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.35rem" }}>
                                <button
                                  type="button"
                                  onClick={() => handleOpenPracticeModal(p)}
                                  style={actionBtnStyle}
                                >
                                  ⚡ Practice
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleVisualizeCode(p)}
                                  style={{ ...actionBtnStyle, background: "rgba(99, 102, 241, 0.2)", borderColor: "var(--accent-indigo, #6366f1)", color: "var(--txt-bright, #f8fafc)" }}
                                >
                                  ▶ Visualize
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}

                      {/* 2. Target Daily Problems */}
                      {day.problems?.map(p => {
                        const pKey = getProblemKey(p);
                        const isSolved = progress[pKey]?.status === "solved";
                        return (
                          <tr key={p.id} style={{ borderBottom: "1px solid #162035" }}>
                            <td style={{ padding: "0.65rem 0.75rem" }}>
                              <input
                                type="checkbox"
                                checked={isSolved}
                                onChange={() => handleToggleSolved(pKey, progress[pKey]?.status)}
                                style={{ cursor: "pointer", accentColor: "var(--accent-green, #10b981)" }}
                                title="Mark solved"
                              />
                            </td>
                            <td style={{ padding: "0.65rem 0.75rem" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <span style={{ color: "var(--txt-dim, #64748b)", fontSize: "0.8rem", fontWeight: 700 }}>#{p.id}</span>
                                <span style={{ color: isSolved ? "var(--txt-muted, #94a3b8)" : "var(--txt-bright, #f8fafc)", fontWeight: 600, fontSize: "0.88rem", textDecoration: isSolved ? "line-through" : "none" }}>
                                  {p.title}
                                </span>
                              </div>
                            </td>
                            <td style={{ padding: "0.65rem 0.75rem" }}>
                              <span style={{
                                fontSize: "0.72rem", fontWeight: 700, padding: "0.15rem 0.45rem", borderRadius: "4px",
                                color: DIFF_COLORS[p.difficulty] || "#ffa116", background: DIFF_BG[p.difficulty] || "rgba(255,161,22,0.12)"
                              }}>
                                {p.difficulty}
                              </span>
                            </td>
                            <td style={{ padding: "0.65rem 0.75rem" }}>
                              <span style={{ fontSize: "0.78rem", color: "var(--accent-cyan, #38bdf8)", fontWeight: 500 }}>
                                {p.primaryPattern}
                              </span>
                            </td>
                            <td style={{ padding: "0.65rem 0.75rem" }}>
                              <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                                <span style={{ fontSize: "0.72rem", color: "var(--txt-muted, #94a3b8)" }}>
                                  {p.recency}
                                </span>
                                {p.frequency > 0 && (
                                  <span style={{ fontSize: "0.68rem", color: "var(--accent-green, #10b981)", fontWeight: 600 }}>
                                    {p.frequency}% freq
                                  </span>
                                )}
                              </div>
                            </td>
                            <td style={{ padding: "0.65rem 0.75rem", fontSize: "0.78rem", color: "var(--txt-muted, #94a3b8)" }}>
                              ~{p.estMinutes} mins
                            </td>
                            <td style={{ padding: "0.65rem 0.75rem", textAlign: "right" }}>
                              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.35rem" }}>
                                <button
                                  type="button"
                                  onClick={() => handleOpenPracticeModal(p)}
                                  style={actionBtnStyle}
                                >
                                  ⚡ Practice
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleVisualizeCode(p)}
                                  style={{ ...actionBtnStyle, background: "rgba(99, 102, 241, 0.2)", borderColor: "var(--accent-indigo, #6366f1)", color: "var(--txt-bright, #f8fafc)" }}
                                >
                                  ▶ Visualize
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Problem Practice Modal ─────────────────────────────── */}
      {modalProblem && (
        <ProblemModal
          problem={modalProblem}
          description={modalDesc}
          onClose={() => setModalProblem(null)}
          onVisualize={p => handleVisualizeCode(p)}
        />
      )}
    </div>
  );
}

// ── Inlined Styles ───────────────────────────────────────────
const statCardStyle = {
  background: "var(--bg-surface, #0d1322)",
  border: "1px solid #1c2842",
  borderRadius: "10px",
  padding: "1rem 1.25rem",
  display: "flex",
  flexDirection: "column"
};

const statLabelStyle = {
  fontSize: "0.72rem",
  fontWeight: 600,
  color: "var(--txt-dim, #64748b)",
  textTransform: "uppercase",
  letterSpacing: "0.05em"
};

const statValueStyle = {
  fontSize: "1.45rem",
  fontWeight: 800,
  color: "var(--txt-bright, #f8fafc)",
  margin: "0.25rem 0 0.15rem 0"
};

const statSubStyle = {
  fontSize: "0.72rem",
  color: "var(--txt-muted, #94a3b8)",
  marginTop: "0.2rem"
};

const actionBtnStyle = {
  padding: "0.3rem 0.55rem",
  borderRadius: "4px",
  fontSize: "0.75rem",
  fontWeight: 600,
  cursor: "pointer",
  border: "1px solid #1c2842",
  background: "#141e33",
  color: "var(--txt-main, #e2e8f0)",
  display: "flex",
  alignItems: "center",
  gap: "0.25rem"
};
