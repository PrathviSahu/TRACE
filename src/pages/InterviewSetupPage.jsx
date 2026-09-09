// ─────────────────────────────────────────────────────────────
//  TRACE — Interview Setup & Planning Command Center
//  Phase 3.1: Profile configuration & deterministic planning foundation.
// ─────────────────────────────────────────────────────────────
import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { COMPANY_DATA, COMPANIES } from "../data/companyData.js";
import { DSA_TOPICS, DSA_PATTERNS, DSA_PATTERN_FAMILIES } from "../data/patternMapping.js";
import { SUPPORTED_LANGUAGES } from "../services/aiService.js";
import { generateDailyPlan } from "../services/dailyPlanGenerator.js";
import { selectInterviewProblem } from "../services/interviewSimulationEngine.js";
import { createSessionRecord, saveInterviewSession, setActiveSessionId } from "../services/interviewSimulationStore.js";
import { getAllProgress } from "../services/progressStore.js";
import InterviewHistoryModal from "../components/interview/InterviewHistoryModal.jsx";
import {
  saveDailyPlan,
  PREPARATION_LEVELS,
  PREPARATION_GOALS,
  WEEK_DAYS,
  DEFAULT_STUDY_DAYS,
  validateInterviewProfile,
  calculateDaysRemaining,
  calculateWeeklyStudyHours,
  useInterviewProfile
} from "../services/interviewPlanStore.js";

function getFutureDateString(daysFromNow) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const COMMON_ROLES = [
  "Software Engineer",
  "Backend Engineer",
  "Full Stack Engineer",
  "Frontend Engineer",
  "Systems Engineer",
  "Machine Learning Engineer"
];

const QUICK_DURATIONS = [
  { label: "60m (1h)", value: 60 },
  { label: "90m (1.5h)", value: 90 },
  { label: "120m (2h)", value: 120 },
  { label: "180m (3h)", value: 180 },
];

export default function InterviewSetupPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { profile: savedProfile, planningState, saveProfile, clearProfile } = useInterviewProfile();

  const detectedTz = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {
      return "UTC";
    }
  }, []);

  // Initialize form state
  const paramCompanyId = searchParams.get("companyId");
  const initialCompany = (paramCompanyId && COMPANY_DATA[paramCompanyId]) ? paramCompanyId : (
    savedProfile?.companyId || "microsoft"
  );

  const [companyId, setCompanyId] = useState(initialCompany);
  const [role, setRole] = useState(savedProfile?.role || "Software Engineer");
  const [interviewDate, setInterviewDate] = useState(savedProfile?.interviewDate || getFutureDateString(14));
  const [timezone, setTimezone] = useState(savedProfile?.timezone || detectedTz);
  const [dailyStudyMinutes, setDailyStudyMinutes] = useState(savedProfile?.dailyStudyMinutes || 120);
  const [weeklyStudyDays, setWeeklyStudyDays] = useState(savedProfile?.weeklyStudyDays || DEFAULT_STUDY_DAYS);
  const [currentLevel, setCurrentLevel] = useState(savedProfile?.currentLevel || "Interview Ready");
  const [goal, setGoal] = useState(savedProfile?.goal || "Interview Preparation");
  const [preferredLanguage, setPreferredLanguage] = useState(savedProfile?.preferredLanguages?.[0] || "Java");
  const [targetTopics, setTargetTopics] = useState(savedProfile?.targetTopics || [...DSA_TOPICS]);
  const [targetPatterns, setTargetPatterns] = useState(savedProfile?.targetPatterns || [...DSA_PATTERNS]);

  // Strategy flags
  const [includeCompanyQuestions, setIncludeCompanyQuestions] = useState(savedProfile?.includeCompanyQuestions !== false);
  const [includeRecentQuestions, setIncludeRecentQuestions] = useState(savedProfile?.includeRecentQuestions !== false);
  const [includeRevision, setIncludeRevision] = useState(savedProfile?.includeRevision !== false);
  const [includeMockInterviews, setIncludeMockInterviews] = useState(Boolean(savedProfile?.includeMockInterviews));

  // Company search query for selector
  const [companySearch, setCompanySearch] = useState("");
  const [saveStatus, setSaveStatus] = useState(null);
  // Simulation Launchpad state (Phase 3.4)
  const [simMode, setSimMode] = useState("company"); // "company" | "pattern" | "random" | "weakness"
  const [simPattern, setSimPattern] = useState("Sliding Window");
  const [simDuration, setSimDuration] = useState(45);
  const [showHistoryModal, setShowHistoryModal] = useState(false);


  // Sync if query param changes
  useEffect(() => {
    if (paramCompanyId && COMPANY_DATA[paramCompanyId]) {
      setCompanyId(paramCompanyId);
    }
  }, [paramCompanyId]);

  // Filtered companies list
  const filteredCompanies = useMemo(() => {
    if (!companySearch.trim()) return COMPANIES;
    const q = companySearch.toLowerCase();
    return COMPANIES.filter(c => c.name.toLowerCase().includes(q) || c.tier.toLowerCase().includes(q));
  }, [companySearch]);

  const selectedCompany = COMPANY_DATA[companyId] || COMPANY_DATA.microsoft;

  // Selected company problem stats
  const companyProbsCount = useMemo(() => {
    if (!selectedCompany) return 0;
    const thirty = selectedCompany.thirtyDays || [];
    const six = selectedCompany.sixMonths || [];
    const set = new Set([...thirty.map(p => p.id), ...six.map(p => p.id)]);
    return set.size;
  }, [selectedCompany]);

  // Current draft profile object for validation & summary
  const currentDraft = useMemo(() => ({
    companyId,
    role,
    interviewDate,
    timezone,
    dailyStudyMinutes: Number(dailyStudyMinutes),
    weeklyStudyDays,
    currentLevel,
    goal,
    preferredLanguages: [preferredLanguage],
    targetTopics,
    targetPatterns,
    includeCompanyQuestions,
    includeRecentQuestions,
    includeRevision,
    includeMockInterviews
  }), [
    companyId, role, interviewDate, timezone, dailyStudyMinutes, weeklyStudyDays,
    currentLevel, goal, preferredLanguage, targetTopics, targetPatterns,
    includeCompanyQuestions, includeRecentQuestions, includeRevision, includeMockInterviews
  ]);

  // Validation
  const validation = useMemo(() => validateInterviewProfile(currentDraft), [currentDraft]);

  // Derived telemetry (NEVER stored as authoritative source of truth)
  const daysRemaining = useMemo(() => calculateDaysRemaining(interviewDate, timezone), [interviewDate, timezone]);
  const weeklyHours = useMemo(() => calculateWeeklyStudyHours(dailyStudyMinutes, weeklyStudyDays), [dailyStudyMinutes, weeklyStudyDays]);

  // Handlers
  const toggleStudyDay = (day) => {
    setWeeklyStudyDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const toggleTopic = (topic) => {
    setTargetTopics(prev =>
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
  };

  const handleSelectAllTopics = () => setTargetTopics([...DSA_TOPICS]);
  const handleClearAllTopics = () => setTargetTopics([]);

  const handleSave = () => {
    if (!validation.isValid) {
      setSaveStatus({ type: "error", message: validation.errors[0] });
      return;
    }
    try {
      const res = saveProfile(currentDraft);
      try {
        const generated = generateDailyPlan(res.profile);
        saveDailyPlan(generated);
      } catch (genErr) {
        console.warn("Could not generate daily plan immediately:", genErr);
      }
      setSaveStatus({
        type: "success",
        message: `Plan activated! Version ${res.planningState.planVersion} for ${selectedCompany.name}. Ready for daily practice.`
      });
      setTimeout(() => setSaveStatus(null), 6000);
    } catch (err) {
      setSaveStatus({ type: "error", message: err.message });
    }
  };

  const handleLaunchSimulation = () => {
    try {
      const problem = selectInterviewProblem({
        mode: simMode,
        companyId,
        pattern: simPattern,
        profile: currentDraft,
        progressMap: getAllProgress(),
      });

      const session = createSessionRecord({
        profileId: currentDraft.id || "profile_default",
        companyId,
        companyName: selectedCompany.name,
        role,
        problemId: problem.id,
        problemTitle: problem.title || problem.name,
        mode: simMode,
        modeParam: simMode === "pattern" ? simPattern : null,
        durationMinutes: simDuration,
        language: preferredLanguage.toLowerCase(),
      });

      session.followUps = [
        {
          id: "f1",
          question: "How would your solution scale if the input data cannot fit entirely in memory?",
          answer: "",
          source: "deterministic",
          askedAt: new Date().toISOString(),
          answeredAt: null,
        },
        {
          id: "f2",
          question: "What are the primary performance trade-offs in your chosen algorithm?",
          answer: "",
          source: "deterministic",
          askedAt: new Date().toISOString(),
          answeredAt: null,
        }
      ];

      saveInterviewSession(session);
      setActiveSessionId(session.id);
      navigate(`/interview/session/${session.id}`);
    } catch (err) {
      console.error("Failed to launch interview simulation:", err);
      setSaveStatus({ type: "error", message: `Could not start simulation: ${err.message}` });
    }
  };

  const handleResetDefaults = () => {
    setCompanyId("microsoft");
    setRole("Software Engineer");
    setInterviewDate(getFutureDateString(14));
    setDailyStudyMinutes(120);
    setWeeklyStudyDays(DEFAULT_STUDY_DAYS);
    setCurrentLevel("Interview Ready");
    setGoal("Interview Preparation");
    setPreferredLanguage("Java");
    setTargetTopics([...DSA_TOPICS]);
    setTargetPatterns([...DSA_PATTERNS]);
    setIncludeCompanyQuestions(true);
    setIncludeRecentQuestions(true);
    setIncludeRevision(true);
    setIncludeMockInterviews(false);
    setSaveStatus({ type: "info", message: "Form reset to TRACE defaults." });
    setTimeout(() => setSaveStatus(null), 3000);
  };

  return (
    <div className="interview-setup-page" style={{
      minHeight: "100vh",
      background: "var(--bg-darkest, #070a12)",
      color: "var(--txt-main, #e2e8f0)",
      fontFamily: "var(--font-ui, Inter, sans-serif)",
      padding: "2rem 1.5rem 4rem 1.5rem"
    }}>
      {/* ── Page Header ────────────────────────────────────────── */}
      <div style={{ maxWidth: "1280px", margin: "0 auto 2rem auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
          <span style={{
            background: "rgba(99, 102, 241, 0.15)",
            border: "1px solid var(--accent-indigo, #6366f1)",
            color: "var(--accent-cyan, #38bdf8)",
            padding: "0.2rem 0.6rem",
            borderRadius: "4px",
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase"
          }}>
            🎯 PHASE 3.1 • INTERVIEW INTELLIGENCE
          </span>
          {planningState && (
            <span style={{
              background: "rgba(16, 185, 129, 0.15)",
              border: "1px solid var(--accent-green, #10b981)",
              color: "var(--accent-green, #10b981)",
              padding: "0.2rem 0.6rem",
              borderRadius: "4px",
              fontSize: "0.75rem",
              fontWeight: 600
            }}>
              Active Plan (v{planningState.planVersion})
            </span>
          )}
        </div>
        <h1 style={{
          fontSize: "2rem",
          fontWeight: 800,
          color: "var(--txt-bright, #f8fafc)",
          margin: 0,
          display: "flex",
          alignItems: "center",
          gap: "0.75rem"
        }}>
          Interview Target & Planning Setup
        </h1>
        <p style={{
          color: "var(--txt-muted, #94a3b8)",
          margin: "0.5rem 0 0 0",
          fontSize: "0.95rem",
          maxWidth: "800px"
        }}>
          Configure your upcoming tech interview, daily availability, and target algorithmic patterns.
          Establishes the deterministic data foundation for TRACE's Phase 3 planning engine.
        </p>
      </div>

      {/* ── Notification Banner ────────────────────────────────── */}
      {saveStatus && (
        <div style={{
          maxWidth: "1280px",
          margin: "0 auto 1.5rem auto",
          padding: "0.85rem 1.25rem",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: saveStatus.type === "success" ? "rgba(16, 185, 129, 0.15)" : (
            saveStatus.type === "error" ? "rgba(239, 68, 68, 0.15)" : "rgba(99, 102, 241, 0.15)"
          ),
          border: `1px solid ${
            saveStatus.type === "success" ? "var(--accent-green, #10b981)" : (
              saveStatus.type === "error" ? "var(--accent-rose, #f43f5e)" : "var(--accent-indigo, #6366f1)"
            )
          }`,
          color: saveStatus.type === "success" ? "#34d399" : (
            saveStatus.type === "error" ? "#f87171" : "#818cf8"
          ),
          fontWeight: 600,
          fontSize: "0.9rem"
        }}>
          <span>{saveStatus.message}</span>
          <button
            onClick={() => setSaveStatus(null)}
            style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: "1rem" }}
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Main Command Center Grid ────────────────────────────── */}
      <div style={{
        maxWidth: "1280px",
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "1fr 380px",
        gap: "2rem",
        alignItems: "start"
      }}>
        {/* ── LEFT COLUMN: Configuration Sections ────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>

          {/* Section 1: Target Company & Timeline */}
          <div style={cardStyle}>
            <div style={sectionHeaderStyle}>
              <span style={iconBadgeStyle}>🏢</span>
              <div>
                <h3 style={sectionTitleStyle}>1. Interview Target & Timeline</h3>
                <p style={sectionDescStyle}>Select your target company, role, and verified interview schedule.</p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginTop: "1rem" }}>
              {/* Company Picker */}
              <div>
                <label style={labelStyle}>Target Company ({COMPANIES.length} available)</label>
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <input
                    type="text"
                    value={companySearch}
                    onChange={(e) => setCompanySearch(e.target.value)}
                    placeholder="Search companies..."
                    style={inputStyle}
                  />
                </div>
                <select
                  id="target-company-select"
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  {filteredCompanies.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.tier}) — {c.thirtyDays?.length + c.sixMonths?.length || 0} Qs
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Role */}
              <div>
                <label style={labelStyle}>Target Role</label>
                <input
                  id="target-role-input"
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Software Engineer"
                  style={inputStyle}
                />
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginTop: "0.5rem" }}>
                  {COMMON_ROLES.slice(0, 3).map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      style={{
                        ...tagBtnStyle,
                        border: role === r ? "1px solid var(--accent-indigo, #6366f1)" : "1px solid #1c2842",
                        background: role === r ? "rgba(99, 102, 241, 0.2)" : "var(--bg-surface, #161a20)"
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Date & Timezone */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginTop: "1.25rem" }}>
              <div>
                <label style={labelStyle}>Interview Date (YYYY-MM-DD)</label>
                <input
                  id="interview-date-input"
                  type="date"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  style={inputStyle}
                />
                {/* Date Quick Presets */}
                <div style={{ display: "flex", gap: "0.35rem", marginTop: "0.5rem" }}>
                  {[7, 14, 30, 60, 90].map(days => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setInterviewDate(getFutureDateString(days))}
                      style={{
                        ...tagBtnStyle,
                        border: daysRemaining === days ? "1px solid var(--accent-cyan, #38bdf8)" : "1px solid #1c2842",
                        color: daysRemaining === days ? "var(--accent-cyan, #38bdf8)" : "var(--txt-muted, #94a3b8)"
                      }}
                    >
                      +{days}d
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Planning Timezone</label>
                <input
                  id="timezone-input"
                  type="text"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  placeholder="e.g. America/New_York, UTC, Asia/Kolkata"
                  style={inputStyle}
                />
                <span style={{ fontSize: "0.75rem", color: "var(--txt-dim, #64748b)", marginTop: "0.35rem", display: "block" }}>
                  Used to deterministically calculate calendar days remaining.
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Availability */}
          <div style={cardStyle}>
            <div style={sectionHeaderStyle}>
              <span style={iconBadgeStyle}>⏱️</span>
              <div>
                <h3 style={sectionTitleStyle}>2. Study Availability</h3>
                <p style={sectionDescStyle}>Set your realistic daily time budget and weekly study days.</p>
              </div>
            </div>

            <div style={{ marginTop: "1.25rem" }}>
              <label style={labelStyle}>Daily Study Time ({dailyStudyMinutes} minutes / {(dailyStudyMinutes / 60).toFixed(1)} hrs)</label>
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
                {QUICK_DURATIONS.map(d => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setDailyStudyMinutes(d.value)}
                    style={{
                      flex: 1,
                      padding: "0.55rem 0.5rem",
                      borderRadius: "6px",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      border: dailyStudyMinutes === d.value ? "1px solid var(--accent-indigo, #6366f1)" : "1px solid #1c2842",
                      background: dailyStudyMinutes === d.value ? "rgba(99, 102, 241, 0.25)" : "var(--bg-card, #161a20)",
                      color: dailyStudyMinutes === d.value ? "var(--txt-bright, #f8fafc)" : "var(--txt-muted, #94a3b8)"
                    }}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
              <input
                id="daily-study-minutes-input"
                type="range"
                min="15"
                max="360"
                step="15"
                value={dailyStudyMinutes}
                onChange={(e) => setDailyStudyMinutes(Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--accent-indigo, #6366f1)" }}
              />
            </div>

            {/* Study Days */}
            <div style={{ marginTop: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <label style={{ ...labelStyle, margin: 0 }}>
                  Weekly Study Days ({weeklyStudyDays.length} days selected)
                </label>
                <div style={{ display: "flex", gap: "0.4rem" }}>
                  <button
                    type="button"
                    onClick={() => setWeeklyStudyDays(DEFAULT_STUDY_DAYS)}
                    style={miniTextBtnStyle}
                  >
                    Weekdays (5d)
                  </button>
                  <button
                    type="button"
                    onClick={() => setWeeklyStudyDays([...WEEK_DAYS])}
                    style={miniTextBtnStyle}
                  >
                    All Days (7d)
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                {WEEK_DAYS.map(day => {
                  const isActive = weeklyStudyDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      id={`day-btn-${day}`}
                      onClick={() => toggleStudyDay(day)}
                      style={{
                        flex: 1,
                        padding: "0.6rem 0",
                        borderRadius: "6px",
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        border: isActive ? "1px solid var(--accent-indigo, #6366f1)" : "1px solid #1c2842",
                        background: isActive ? "rgba(99, 102, 241, 0.25)" : "var(--bg-card, #161a20)",
                        color: isActive ? "var(--accent-cyan, #38bdf8)" : "var(--txt-dim, #64748b)"
                      }}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 3: Level & Goal */}
          <div style={cardStyle}>
            <div style={sectionHeaderStyle}>
              <span style={iconBadgeStyle}>🎯</span>
              <div>
                <h3 style={sectionTitleStyle}>3. Preparation Level & Goal</h3>
                <p style={sectionDescStyle}>Align with TRACE's canonical roadmap and prep objectives.</p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginTop: "1rem" }}>
              <div>
                <label style={labelStyle}>Current Level</label>
                <select
                  id="current-level-select"
                  value={currentLevel}
                  onChange={(e) => setCurrentLevel(e.target.value)}
                  style={inputStyle}
                >
                  {PREPARATION_LEVELS.map(lvl => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Preparation Goal</label>
                <select
                  id="preparation-goal-select"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  style={inputStyle}
                >
                  {PREPARATION_GOALS.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Language & Strategies */}
          <div style={cardStyle}>
            <div style={sectionHeaderStyle}>
              <span style={iconBadgeStyle}>⚙️</span>
              <div>
                <h3 style={sectionTitleStyle}>4. Language & Practice Strategy</h3>
                <p style={sectionDescStyle}>Execution language and deterministic selection weights.</p>
              </div>
            </div>

            <div style={{ marginTop: "1rem" }}>
              <label style={labelStyle}>Preferred Language (Supported in TRACE Execution Engine)</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {SUPPORTED_LANGUAGES.map(lang => {
                  const isActive = preferredLanguage.toLowerCase() === lang.id.toLowerCase() ||
                                   preferredLanguage.toLowerCase() === lang.label.toLowerCase();
                  return (
                    <button
                      key={lang.id}
                      type="button"
                      id={`lang-btn-${lang.id}`}
                      onClick={() => setPreferredLanguage(lang.label)}
                      style={{
                        flex: 1,
                        padding: "0.6rem 0.5rem",
                        borderRadius: "6px",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.4rem",
                        border: isActive ? "1px solid var(--accent-indigo, #6366f1)" : "1px solid #1c2842",
                        background: isActive ? "rgba(99, 102, 241, 0.25)" : "var(--bg-card, #161a20)",
                        color: isActive ? "var(--txt-bright, #f8fafc)" : "var(--txt-muted, #94a3b8)"
                      }}
                    >
                      <span>{lang.icon}</span>
                      <span>{lang.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Topics */}
            <div style={{ marginTop: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <label style={{ ...labelStyle, margin: 0 }}>
                  Target Topics ({targetTopics.length}/{DSA_TOPICS.length})
                </label>
                <div style={{ display: "flex", gap: "0.4rem" }}>
                  <button type="button" onClick={handleSelectAllTopics} style={miniTextBtnStyle}>Select All</button>
                  <button type="button" onClick={handleClearAllTopics} style={miniTextBtnStyle}>Clear</button>
                </div>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {DSA_TOPICS.map(topic => {
                  const isSelected = targetTopics.includes(topic);
                  return (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => toggleTopic(topic)}
                      style={{
                        padding: "0.35rem 0.65rem",
                        borderRadius: "4px",
                        fontSize: "0.78rem",
                        fontWeight: 500,
                        cursor: "pointer",
                        border: isSelected ? "1px solid var(--accent-cyan, #38bdf8)" : "1px solid #1c2842",
                        background: isSelected ? "rgba(56, 189, 248, 0.15)" : "var(--bg-card, #161a20)",
                        color: isSelected ? "var(--accent-cyan, #38bdf8)" : "var(--txt-muted, #94a3b8)"
                      }}
                    >
                      {topic}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Section 5: Timed Interview Simulation Launchpad (Phase 3.4) ── */}
          <div style={{
            ...cardStyle,
            border: "1px solid rgba(99, 102, 241, 0.3)",
            background: "var(--bg-card, #161a20)",
          }}>
            <div style={sectionHeaderStyle}>
              <span style={iconBadgeStyle}>🎯</span>
              <div>
                <h3 style={{ ...sectionTitleStyle, color: "var(--txt-bright, #f8fafc)" }}>
                  5. Timed Interview Simulation Launcher
                </h3>
                <p style={sectionDescStyle}>
                  Live mock interview environment with authoritative timer, real execution, and FAANG rubric evaluation.
                </p>
              </div>
            </div>

            {/* Mode Picker */}
            <div style={{ marginTop: "1rem" }}>
              <label style={labelStyle}>Interview Mode</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem" }}>
                {[
                  { id: "company", label: "🏢 Company", desc: "Company top questions" },
                  { id: "pattern", label: "🧩 Pattern", desc: "Target DSA pattern" },
                  { id: "random",  label: "🎲 Random",  desc: "Deterministic PRNG" },
                  { id: "weakness", label: "🎯 Weakness", desc: "Phase 3.3 weakness focus" },
                ].map(m => (
                  <button
                    key={m.id}
                    type="button"
                    id={`mode-btn-${m.id}`}
                    onClick={() => setSimMode(m.id)}
                    style={{
                      padding: "0.6rem 0.5rem",
                      borderRadius: "6px",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      border: simMode === m.id ? "1px solid var(--accent-indigo, #6366f1)" : "1px solid #1c2842",
                      background: simMode === m.id ? "rgba(99, 102, 241, 0.25)" : "var(--bg-card, #161a20)",
                      color: simMode === m.id ? "var(--txt-bright, #f8fafc)" : "var(--txt-muted, #94a3b8)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "0.2rem",
                    }}
                  >
                    <span>{m.label}</span>
                    <span style={{ fontSize: "0.65rem", color: "#64748b" }}>{m.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Pattern picker if pattern mode */}
            {simMode === "pattern" && (
              <div style={{ marginTop: "1rem" }}>
                <label style={labelStyle}>Select Pattern or Family</label>
                <select
                  id="sim-pattern-select"
                  value={simPattern}
                  onChange={e => setSimPattern(e.target.value)}
                  style={inputStyle}
                >
                  {DSA_PATTERNS.slice(0, 30).map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Duration Selector */}
            <div style={{ marginTop: "1rem" }}>
              <label style={labelStyle}>Session Duration</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {[30, 45, 60, 90].map(mins => (
                  <button
                    key={mins}
                    type="button"
                    id={`duration-btn-${mins}`}
                    onClick={() => setSimDuration(mins)}
                    style={{
                      flex: 1,
                      padding: "0.5rem",
                      borderRadius: "6px",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      border: simDuration === mins ? "1px solid #38bdf8" : "1px solid #1c2842",
                      background: simDuration === mins ? "rgba(56, 189, 248, 0.15)" : "var(--bg-card, #161a20)",
                      color: simDuration === mins ? "#38bdf8" : "#94a3b8",
                    }}
                  >
                    ⏱️ {mins} mins
                  </button>
                ))}
              </div>
            </div>

            {/* Launcher Buttons */}
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
              <button
                id="launch-simulation-btn"
                type="button"
                onClick={handleLaunchSimulation}
                style={{
                  flex: 2,
                  padding: "0.75rem 1.25rem",
                  borderRadius: "6px",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  border: "none",
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  color: "#ffffff",
                  boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4)",
                }}
              >
                🎯 Start {simDuration}-Min Interview Simulation
              </button>
              <button
                id="view-sim-history-btn"
                type="button"
                onClick={() => setShowHistoryModal(true)}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  borderRadius: "6px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  border: "1px solid #233152",
                  background: "var(--bg-darkest, #090b0e)",
                  color: "#cbd5e1",
                }}
              >
                📜 History
              </button>
            </div>
          </div>

          {/* Strategy Toggles */}
            <div style={{ marginTop: "1.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <label style={checkboxLabelStyle}>
                <input
                  type="checkbox"
                  checked={includeCompanyQuestions}
                  onChange={(e) => setIncludeCompanyQuestions(e.target.checked)}
                  style={{ accentColor: "var(--accent-indigo, #6366f1)" }}
                />
                <span>Prioritize Company Questions</span>
              </label>

              <label style={checkboxLabelStyle}>
                <input
                  type="checkbox"
                  checked={includeRecentQuestions}
                  onChange={(e) => setIncludeRecentQuestions(e.target.checked)}
                  style={{ accentColor: "var(--accent-indigo, #6366f1)" }}
                />
                <span>Weight 30-Day Recent Questions</span>
              </label>

              <label style={checkboxLabelStyle}>
                <input
                  type="checkbox"
                  checked={includeRevision}
                  onChange={(e) => setIncludeRevision(e.target.checked)}
                  style={{ accentColor: "var(--accent-indigo, #6366f1)" }}
                />
                <span>Include Revision / Spaced Review</span>
              </label>

              <label style={checkboxLabelStyle}>
                <input
                  type="checkbox"
                  checked={includeMockInterviews}
                  onChange={(e) => setIncludeMockInterviews(e.target.checked)}
                  style={{ accentColor: "var(--accent-indigo, #6366f1)" }}
                />
                <span>Include Mock Interview Sets</span>
              </label>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Live Command Center Summary Card ────── */}
        <div style={{ position: "sticky", top: "2rem" }}>
          <div style={{
            ...cardStyle,
            border: "1px solid var(--border-glow, rgba(99, 102, 241, 0.35))",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)"
          }}>
            {/* Live Summary Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #1c2842", paddingBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <span style={{ fontSize: "1.5rem" }}>{selectedCompany.icon || "🏢"}</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "var(--txt-bright, #f8fafc)" }}>
                    {selectedCompany.name.toUpperCase()}
                  </h3>
                  <span style={{ fontSize: "0.75rem", color: "var(--accent-cyan, #38bdf8)" }}>
                    {selectedCompany.tier} Tier • {companyProbsCount} Verified Problems
                  </span>
                </div>
              </div>
              <span style={{
                fontSize: "0.7rem",
                padding: "0.2rem 0.5rem",
                borderRadius: "4px",
                fontWeight: 700,
                background: "rgba(99, 102, 241, 0.2)",
                color: "var(--accent-cyan, #38bdf8)",
                border: "1px solid rgba(99, 102, 241, 0.4)"
              }}>
                LIVE PLAN
              </span>
            </div>

            {/* Dynamic Countdown Display */}
            <div style={{
              margin: "1.25rem 0",
              padding: "1rem",
              background: "var(--bg-surface, #161a20)",
              borderRadius: "8px",
              border: "1px solid #1c2842",
              textAlign: "center"
            }}>
              <span style={{ fontSize: "0.75rem", color: "var(--txt-muted, #94a3b8)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block" }}>
                Interview Timeline
              </span>
              <div id="derived-days-remaining" style={{
                fontSize: "2.2rem",
                fontWeight: 900,
                color: daysRemaining !== null && daysRemaining > 0 ? "var(--accent-green, #10b981)" : "var(--accent-rose, #f43f5e)",
                lineHeight: 1.1,
                margin: "0.35rem 0"
              }}>
                {daysRemaining !== null ? (
                  daysRemaining > 0 ? `${daysRemaining} DAYS REMAINING` : "DATE IN PAST"
                ) : "INVALID DATE"}
              </div>
              <span style={{ fontSize: "0.8rem", color: "var(--txt-dim, #64748b)" }}>
                Target: {interviewDate || "Not set"} ({timezone})
              </span>
            </div>

            {/* Live Metrics Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.25rem" }}>
              <div style={metricBoxStyle}>
                <span style={metricLabelStyle}>Weekly Study</span>
                <span style={metricValStyle}>{weeklyHours} hrs/wk</span>
                <span style={{ fontSize: "0.7rem", color: "var(--txt-dim, #64748b)" }}>
                  {dailyStudyMinutes}m / day • {weeklyStudyDays.length}d
                </span>
              </div>

              <div style={metricBoxStyle}>
                <span style={metricLabelStyle}>Language</span>
                <span style={metricValStyle}>{preferredLanguage}</span>
                <span style={{ fontSize: "0.7rem", color: "var(--txt-dim, #64748b)" }}>Execution Engine</span>
              </div>

              <div style={metricBoxStyle}>
                <span style={metricLabelStyle}>Target Role</span>
                <span style={{ ...metricValStyle, fontSize: "0.88rem" }}>{role}</span>
                <span style={{ fontSize: "0.7rem", color: "var(--txt-dim, #64748b)" }}>{currentLevel}</span>
              </div>

              <div style={metricBoxStyle}>
                <span style={metricLabelStyle}>Topic Coverage</span>
                <span style={metricValStyle}>{targetTopics.length} Topics</span>
                <span style={{ fontSize: "0.7rem", color: "var(--txt-dim, #64748b)" }}>{targetPatterns.length} Patterns</span>
              </div>
            </div>

            {/* Strategy Badges */}
            <div style={{ marginBottom: "1.25rem", padding: "0.75rem", background: "var(--bg-surface, #161a20)", borderRadius: "6px", border: "1px solid #1c2842" }}>
              <span style={{ fontSize: "0.72rem", color: "var(--txt-muted, #94a3b8)", display: "block", marginBottom: "0.4rem", fontWeight: 600 }}>
                ACTIVE STRATEGIES
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                {includeCompanyQuestions && <span style={strategyBadgeStyle}>🏢 Company Questions</span>}
                {includeRecentQuestions && <span style={strategyBadgeStyle}>🔥 30-Day Recency</span>}
                {includeRevision && <span style={strategyBadgeStyle}>⚡ Spaced Revision</span>}
                {includeMockInterviews && <span style={strategyBadgeStyle}>🎲 Mock Sets</span>}
              </div>
            </div>

            {/* Validation Alerts */}
            {!validation.isValid && (
              <div style={{
                marginBottom: "1.25rem",
                padding: "0.75rem",
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid var(--accent-rose, #f43f5e)",
                borderRadius: "6px"
              }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent-rose, #f43f5e)", display: "block", marginBottom: "0.25rem" }}>
                  ⚠️ Validation Issues:
                </span>
                <ul style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "0.75rem", color: "#fca5a5" }}>
                  {validation.errors.map((err, i) => <li key={i}>{err}</li>)}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              <button
                id="save-profile-btn"
                type="button"
                onClick={handleSave}
                disabled={!validation.isValid}
                style={{
                  width: "100%",
                  padding: "0.85rem",
                  borderRadius: "6px",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  cursor: validation.isValid ? "pointer" : "not-allowed",
                  border: "none",
                  background: validation.isValid ? "linear-gradient(135deg, var(--accent-indigo, #6366f1), var(--accent-purple, #7c3aed))" : "#1e293b",
                  color: validation.isValid ? "#fff" : "#64748b",
                  boxShadow: validation.isValid ? "0 4px 14px rgba(99, 102, 241, 0.4)" : "none",
                  transition: "all 0.2s ease"
                }}
              >
                💾 Save & Activate Interview Plan
              </button>

              <Link
                to="/interview/plan"
                id="view-daily-plan-btn"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "6px",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  textAlign: "center",
                  textDecoration: "none",
                  display: "block",
                  boxSizing: "border-box",
                  border: "1px solid var(--accent-indigo, #6366f1)",
                  background: "rgba(99, 102, 241, 0.15)",
                  color: "var(--accent-cyan, #38bdf8)"
                }}
              >
                🚀 View Daily Study Plan →
              </Link>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  style={{
                    flex: 1,
                    padding: "0.55rem",
                    borderRadius: "6px",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    border: "1px solid #1c2842",
                    background: "transparent",
                    color: "var(--txt-muted, #94a3b8)"
                  }}
                >
                  ↺ Reset
                </button>

                <Link
                  to={`/companies/${companyId}`}
                  style={{
                    flex: 1,
                    padding: "0.55rem",
                    borderRadius: "6px",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    textAlign: "center",
                    textDecoration: "none",
                    border: "1px solid var(--accent-indigo, #6366f1)",
                    background: "rgba(99, 102, 241, 0.1)",
                    color: "var(--accent-cyan, #38bdf8)"
                  }}
                >
                  View Company ↗
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showHistoryModal && (
        <InterviewHistoryModal isOpen={showHistoryModal} onClose={() => setShowHistoryModal(false)} />
      )}
    </div>
  );
}

// ── Inlined Styles adhering to TRACE Design System ─────────────
const cardStyle = {
  background: "var(--bg-surface, #0d1322)",
  border: "1px solid var(--border-card, #1c2842)",
  borderRadius: "12px",
  padding: "1.5rem"
};

const sectionHeaderStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: "0.75rem",
  borderBottom: "1px solid #162035",
  paddingBottom: "0.75rem"
};

const iconBadgeStyle = {
  fontSize: "1.3rem",
  background: "var(--bg-raised, #1c2128)",
  padding: "0.4rem",
  borderRadius: "8px",
  lineHeight: 1
};

const sectionTitleStyle = {
  margin: 0,
  fontSize: "1.05rem",
  fontWeight: 700,
  color: "var(--txt-bright, #f8fafc)"
};

const sectionDescStyle = {
  margin: "0.2rem 0 0 0",
  fontSize: "0.82rem",
  color: "var(--txt-muted, #94a3b8)"
};

const labelStyle = {
  display: "block",
  fontSize: "0.82rem",
  fontWeight: 600,
  color: "var(--txt-muted, #94a3b8)",
  marginBottom: "0.4rem"
};

const inputStyle = {
  width: "100%",
  padding: "0.6rem 0.75rem",
  borderRadius: "6px",
  border: "1px solid var(--border-card, #1c2842)",
  background: "var(--bg-darkest, #070a12)",
  color: "var(--txt-bright, #f8fafc)",
  fontSize: "0.88rem",
  boxSizing: "border-box",
  outline: "none"
};

const tagBtnStyle = {
  padding: "0.25rem 0.55rem",
  borderRadius: "4px",
  fontSize: "0.75rem",
  fontWeight: 500,
  cursor: "pointer",
  color: "var(--txt-muted, #94a3b8)"
};

const miniTextBtnStyle = {
  background: "none",
  border: "none",
  color: "var(--accent-cyan, #38bdf8)",
  fontSize: "0.75rem",
  fontWeight: 600,
  cursor: "pointer",
  padding: "0 0.2rem"
};

const checkboxLabelStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.55rem",
  fontSize: "0.82rem",
  color: "var(--txt-main, #e2e8f0)",
  cursor: "pointer"
};

const metricBoxStyle = {
  background: "var(--bg-surface, #161a20)",
  border: "1px solid #1c2842",
  borderRadius: "6px",
  padding: "0.6rem 0.75rem",
  display: "flex",
  flexDirection: "column"
};

const metricLabelStyle = {
  fontSize: "0.7rem",
  color: "var(--txt-dim, #64748b)",
  textTransform: "uppercase",
  letterSpacing: "0.04em"
};

const metricValStyle = {
  fontSize: "1.05rem",
  fontWeight: 700,
  color: "var(--txt-bright, #f8fafc)",
  margin: "0.15rem 0"
};

const strategyBadgeStyle = {
  fontSize: "0.72rem",
  padding: "0.15rem 0.45rem",
  borderRadius: "4px",
  background: "rgba(99, 102, 241, 0.15)",
  border: "1px solid rgba(99, 102, 241, 0.3)",
  color: "var(--accent-cyan, #38bdf8)"
};