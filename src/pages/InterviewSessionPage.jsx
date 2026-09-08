import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getSession,
  saveInterviewSession,
  submitInterviewSession,
  setActiveSessionId,
} from "../services/interviewSimulationStore.js";
import {
  calculateSessionTime,
} from "../services/interviewSimulationEngine.js";
import { executeInterviewCode } from "../services/interviewExecutionAdapter.js";
import { evaluateInterviewSession } from "../services/interviewEvaluator.js";
import { NORMALIZED_PROBLEMS } from "../data/companyUtils.js";
import { PROBLEM_DESCRIPTIONS } from "../data/problemDescriptions.js";

import InterviewTimer from "../components/interview/InterviewTimer.jsx";
import InterviewProblemPanel from "../components/interview/InterviewProblemPanel.jsx";
import InterviewApproachPanel from "../components/interview/InterviewApproachPanel.jsx";
import InterviewExecutionPanel from "../components/interview/InterviewExecutionPanel.jsx";
import InterviewFollowupPanel from "../components/interview/InterviewFollowupPanel.jsx";

const PHASES = [
  { id: "understanding", label: "1. Problem & Context", icon: "📖" },
  { id: "approach",      label: "2. Plan Approach",      icon: "🧠" },
  { id: "coding",        label: "3. Code & Execute",     icon: "⚡" },
  { id: "followup",      label: "4. Follow-ups",         icon: "💬" },
];

export default function InterviewSessionPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(() => getSession(sessionId));
  const [activeTab, setActiveTab] = useState("problem"); // "problem" | "approach" | "followup"
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [errorNotification, setErrorNotification] = useState(null);

  // Mark session active on mount
  useEffect(() => {
    if (!session) {
      const loaded = getSession(sessionId);
      if (loaded) {
        setSession(loaded);
        setActiveSessionId(sessionId);
      } else {
        setErrorNotification("Interview session not found.");
      }
    } else {
      setActiveSessionId(sessionId);
    }
  }, [sessionId, session]);

  // Start timer automatically on first mount if not_started
  useEffect(() => {
    if (session && session.status === "not_started") {
      const nowIso = new Date().toISOString();
      const started = {
        ...session,
        status: "active",
        startedAt: nowIso,
        lastResumedAt: nowIso,
      };
      setSession(started);
      saveInterviewSession(started);
    }
  }, [session]);

  const problemObj = useMemo(() => {
    if (!session?.problemId) return null;
    return NORMALIZED_PROBLEMS.get(String(session.problemId)) || {
      id: session.problemId,
      title: session.problemTitle,
      difficulty: "Medium",
    };
  }, [session?.problemId, session?.problemTitle]);

  // Handle Pause
  const handlePause = useCallback(() => {
    if (!session || session.status !== "active") return;
    const nowMs = Date.now();
    const timeInfo = calculateSessionTime(session, nowMs);
    const nowIso = new Date(nowMs).toISOString();

    const paused = {
      ...session,
      status: "paused",
      pausedAt: nowIso,
      elapsedSeconds: timeInfo.elapsedSeconds,
    };
    setSession(paused);
    saveInterviewSession(paused);
  }, [session]);

  // Handle Resume
  const handleResume = useCallback(() => {
    if (!session || session.status !== "paused") return;
    const nowMs = Date.now();
    const pausedMs = session.pausedAt ? new Date(session.pausedAt).getTime() : nowMs;
    const additionalPausedSec = Math.max(0, Math.floor((nowMs - pausedMs) / 1000));

    const resumed = {
      ...session,
      status: "active",
      pausedAt: null,
      lastResumedAt: new Date(nowMs).toISOString(),
      totalPausedSeconds: (session.totalPausedSeconds || 0) + additionalPausedSec,
    };
    setSession(resumed);
    saveInterviewSession(resumed);
  }, [session]);

  // Handle Code Change
  const handleChangeCode = useCallback((newCode) => {
    if (!session || session.status === "submitted") return;
    const updated = { ...session, code: newCode };
    setSession(updated);
    saveInterviewSession(updated);
  }, [session]);

  // Handle Language Change
  const handleChangeLanguage = useCallback((newLang) => {
    if (!session || session.status === "submitted") return;
    const updated = { ...session, language: newLang };
    setSession(updated);
    saveInterviewSession(updated);
  }, [session]);

  // Handle Approach Change
  const handleChangeApproach = useCallback((newApproach) => {
    if (!session || session.status === "submitted") return;
    const updated = { ...session, approach: newApproach };
    setSession(updated);
    saveInterviewSession(updated);
  }, [session]);

  // Handle Hints
  const handleUseHint = useCallback((hintCount) => {
    if (!session || session.status === "submitted") return;
    const updated = { ...session, hintsUsed: hintCount };
    setSession(updated);
    saveInterviewSession(updated);
  }, [session]);

  // Handle Solution Peek
  const handleViewSolution = useCallback(() => {
    if (!session || session.status === "submitted") return;
    const updated = { ...session, solutionViewed: true };
    setSession(updated);
    saveInterviewSession(updated);
  }, [session]);

  // Handle Follow-up Answer
  const handleAnswerFollowup = useCallback((qid, answerText) => {
    if (!session || session.status === "submitted") return;
    const followUps = (session.followUps || []).map(f =>
      f.id === qid ? { ...f, answer: answerText, answeredAt: new Date().toISOString() } : f
    );
    const updated = { ...session, followUps };
    setSession(updated);
    saveInterviewSession(updated);
  }, [session]);

  // Run & Test
  const handleExecute = useCallback(async () => {
    if (!session || isExecuting || session.status === "submitted") return;
    setIsExecuting(true);
    try {
      const updatedSession = await executeInterviewCode(session, problemObj);
      setSession(updatedSession);
      saveInterviewSession(updatedSession);
    } catch (err) {
      console.error("Execution error:", err);
    } finally {
      setIsExecuting(false);
    }
  }, [session, problemObj, isExecuting]);

  // Submit Interview Session
  const handleSubmit = useCallback(async () => {
    if (!session || isSubmitting || session.status === "submitted") return;
    setIsSubmitting(true);
    setShowSubmitModal(false);

    try {
      // 1. Calculate final elapsed time
      const timeInfo = calculateSessionTime(session, Date.now());

      // 2. Evaluate performance (Gemini qualitative + authoritative deterministic)
      const descObj = PROBLEM_DESCRIPTIONS[session.problemId] || null;
      const rubricResult = await evaluateInterviewSession(
        { ...session, elapsedSeconds: timeInfo.elapsedSeconds },
        descObj
      );

      // 3. Freeze & submit session (dual-writes to progressStore for Phase 3.3)
      const finalized = submitInterviewSession(session.id, {
        elapsedSeconds: timeInfo.elapsedSeconds,
        rubricResult,
      });

      setSession(finalized);
      navigate(`/interview/result/${session.id}`);
    } catch (err) {
      console.error("Submission error:", err);
      setErrorNotification("Failed to submit session. Please retry.");
    } finally {
      setIsSubmitting(false);
    }
  }, [session, isSubmitting, navigate]);

  // Handle Expiration (auto-submit on timer expiry)
  const handleExpire = useCallback(() => {
    if (!session || session.status === "submitted" || session.status === "expired") return;
    const expired = { ...session, status: "expired" };
    setSession(expired);
    saveInterviewSession(expired);
    handleSubmit();
  }, [session, handleSubmit]);

  // Keyboard Shortcuts: Ctrl+Enter (Run), Ctrl+Shift+Enter (Submit), Space (Pause/Resume)
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "Enter") {
        e.preventDefault();
        if (session?.status !== "submitted") setShowSubmitModal(true);
      } else if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleExecute();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleExecute, session]);

  if (!session) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#070a12",
        color: "#f8fafc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, sans-serif",
      }}>
        <div style={{ textAlign: "center" }}>
          <h2>Interview Session Not Found</h2>
          <p style={{ color: "#94a3b8" }}>The requested session ID does not exist in local storage.</p>
          <button
            onClick={() => navigate("/interview/setup")}
            style={{
              background: "#4f46e5",
              color: "#ffffff",
              border: "none",
              padding: "0.6rem 1.2rem",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Go to Interview Setup
          </button>
        </div>
      </div>
    );
  }

  const isSubmitted = session.status === "submitted";

  return (
    <div className="interview-session-page" style={{
      minHeight: "100vh",
      background: "#070a12",
      color: "#e2e8f0",
      fontFamily: "var(--font-ui, Inter, sans-serif)",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* ── Top Bar ── */}
      <header style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0.6rem 1.25rem",
        background: "#0d1322",
        borderBottom: "1px solid #1c2842",
        flexWrap: "wrap",
        gap: "1rem",
      }}>
        {/* Left info */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button
            onClick={() => navigate("/interview/plan")}
            style={{
              background: "none",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              fontSize: "0.85rem",
            }}
          >
            ← Exit
          </button>
          <div style={{ width: "1px", height: "18px", background: "#1c2842" }} />
          <span style={{
            background: "rgba(99, 102, 241, 0.15)",
            border: "1px solid rgba(99, 102, 241, 0.3)",
            color: "#38bdf8",
            fontSize: "0.75rem",
            fontWeight: 700,
            padding: "0.15rem 0.5rem",
            borderRadius: "4px",
          }}>
            {session.companyName} • {session.role}
          </span>
          <span style={{ fontSize: "0.92rem", fontWeight: 700, color: "#f8fafc" }}>
            {session.problemTitle}
          </span>
        </div>

        {/* Center: Timer */}
        <InterviewTimer
          session={session}
          onPause={handlePause}
          onResume={handleResume}
          onExpire={handleExpire}
        />

        {/* Right: Submit Button */}
        <div>
          {isSubmitted ? (
            <button
              onClick={() => navigate(`/interview/result/${session.id}`)}
              style={{
                background: "#10b981",
                border: "none",
                color: "#ffffff",
                padding: "0.45rem 1rem",
                borderRadius: "6px",
                fontSize: "0.84rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              View Results →
            </button>
          ) : (
            <button
              id="interview-submit-btn"
              onClick={() => setShowSubmitModal(true)}
              disabled={isSubmitting}
              style={{
                background: "linear-gradient(135deg, #10b981, #059669)",
                border: "none",
                color: "#ffffff",
                padding: "0.45rem 1.1rem",
                borderRadius: "6px",
                fontSize: "0.84rem",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
              }}
            >
              {isSubmitting ? "Scoring..." : "Submit Interview (Ctrl+Shift+Enter)"}
            </button>
          )}
        </div>
      </header>

      {/* ── Main Split View ── */}
      <div style={{
        flex: 1,
        display: "grid",
        gridTemplateColumns: "minmax(350px, 42%) 1fr",
        gap: "1px",
        background: "#1c2842",
        overflow: "hidden",
      }}>
        {/* ── Left Column: Problem, Approach, Follow-ups ── */}
        <div style={{
          background: "#0a0e1a",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}>
          {/* Subtabs */}
          <div style={{
            display: "flex",
            borderBottom: "1px solid #1c2842",
            background: "#0d1322",
          }}>
            <button
              id="tab-problem-btn"
              onClick={() => setActiveTab("problem")}
              style={{
                flex: 1,
                padding: "0.6rem",
                background: activeTab === "problem" ? "#0a0e1a" : "transparent",
                border: "none",
                borderBottom: activeTab === "problem" ? "2px solid #38bdf8" : "2px solid transparent",
                color: activeTab === "problem" ? "#f8fafc" : "#94a3b8",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              📖 Problem Statement
            </button>
            <button
              id="tab-approach-btn"
              onClick={() => setActiveTab("approach")}
              style={{
                flex: 1,
                padding: "0.6rem",
                background: activeTab === "approach" ? "#0a0e1a" : "transparent",
                border: "none",
                borderBottom: activeTab === "approach" ? "2px solid #38bdf8" : "2px solid transparent",
                color: activeTab === "approach" ? "#f8fafc" : "#94a3b8",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              🧠 Approach Notes
            </button>
            <button
              id="tab-followup-btn"
              onClick={() => setActiveTab("followup")}
              style={{
                flex: 1,
                padding: "0.6rem",
                background: activeTab === "followup" ? "#0a0e1a" : "transparent",
                border: "none",
                borderBottom: activeTab === "followup" ? "2px solid #38bdf8" : "2px solid transparent",
                color: activeTab === "followup" ? "#f8fafc" : "#94a3b8",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              💬 Follow-ups ({session.followUps?.length || 0})
            </button>
          </div>

          {/* Left Panel Body */}
          <div style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
            {activeTab === "problem" && (
              <InterviewProblemPanel
                problem={problemObj}
                hintsUsed={session.hintsUsed || 0}
                solutionViewed={session.solutionViewed}
                onUseHint={handleUseHint}
                onViewSolution={handleViewSolution}
              />
            )}
            {activeTab === "approach" && (
              <InterviewApproachPanel
                approach={session.approach || {}}
                readOnly={isSubmitted}
                onChange={handleChangeApproach}
              />
            )}
            {activeTab === "followup" && (
              <InterviewFollowupPanel
                followUps={session.followUps || []}
                readOnly={isSubmitted}
                onAnswerFollowup={handleAnswerFollowup}
              />
            )}
          </div>
        </div>

        {/* ── Right Column: Execution & Monaco Editor ── */}
        <div style={{
          background: "#080c16",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}>
          <InterviewExecutionPanel
            session={session}
            code={session.code || ""}
            language={session.language || "java"}
            isExecuting={isExecuting}
            evidence={session.executionEvidence}
            attempts={session.attempts || 0}
            readOnly={isSubmitted}
            onChangeCode={handleChangeCode}
            onChangeLanguage={handleChangeLanguage}
            onExecute={handleExecute}
          />
        </div>
      </div>

      {/* ── Submit Confirmation Modal ── */}
      {showSubmitModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(3, 7, 18, 0.8)",
          backdropFilter: "blur(4px)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
        }}>
          <div style={{
            background: "#0d1322",
            border: "1px solid #1c2842",
            borderRadius: "12px",
            width: "100%",
            maxWidth: "480px",
            padding: "1.5rem",
            boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
          }}>
            <h3 style={{ margin: "0 0 0.5rem 0", color: "#f8fafc", fontSize: "1.2rem", fontWeight: 700 }}>
              Ready to Submit Your Interview?
            </h3>
            <p style={{ color: "#94a3b8", fontSize: "0.86rem", lineHeight: 1.5, margin: "0 0 1rem 0" }}>
              Submitting freezes your code, timer, and notes. TRACE will evaluate your submission against the 8-category rubric and feed your performance back into your preparation plan.
            </p>

            <div style={{
              background: "#080c16",
              border: "1px solid #161f36",
              borderRadius: "6px",
              padding: "0.75rem",
              marginBottom: "1.25rem",
              fontSize: "0.8rem",
              color: "#cbd5e1",
              display: "flex",
              flexDirection: "column",
              gap: "0.25rem",
            }}>
              <div>Execution status: <strong>{session.executionEvidence?.passed ? "Passed" : "Not all tests passed"}</strong></div>
              <div>Attempts recorded: <strong>{session.attempts || 0}</strong></div>
              <div>Hints used: <strong>{session.hintsUsed || 0}</strong></div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button
                onClick={() => setShowSubmitModal(false)}
                style={{
                  background: "none",
                  border: "1px solid #2a3a5a",
                  color: "#94a3b8",
                  padding: "0.5rem 1rem",
                  borderRadius: "6px",
                  fontSize: "0.84rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Continue Coding
              </button>
              <button
                id="confirm-submit-modal-btn"
                onClick={handleSubmit}
                disabled={isSubmitting}
                style={{
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  border: "none",
                  color: "#ffffff",
                  padding: "0.5rem 1.2rem",
                  borderRadius: "6px",
                  fontSize: "0.84rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {isSubmitting ? "Evaluating..." : "Confirm & Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
