import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSession } from "../services/interviewSimulationStore.js";
import InterviewRubricPanel from "../components/interview/InterviewRubricPanel.jsx";
import InterviewHistoryModal from "../components/interview/InterviewHistoryModal.jsx";
import Editor from "@monaco-editor/react";

export default function InterviewResultPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [activeReviewTab, setActiveReviewTab] = useState("rubric"); // "rubric" | "code" | "approach"
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const session = useMemo(() => getSession(sessionId), [sessionId]);

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
          <h2>Session Not Found</h2>
          <p style={{ color: "#94a3b8" }}>Could not find interview result for {sessionId}</p>
          <button
            onClick={() => navigate("/interview/plan")}
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
            Go to Interview Plan
          </button>
        </div>
      </div>
    );
  }

  const { rubricResult, executionEvidence } = session;

  return (
    <div className="interview-result-page" style={{
      minHeight: "100vh",
      background: "#070a12",
      color: "#e2e8f0",
      fontFamily: "var(--font-ui, Inter, sans-serif)",
      padding: "2rem 1.5rem 4rem 1.5rem",
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* ── Top Nav & Actions ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <button
              onClick={() => navigate("/interview/plan")}
              style={{
                background: "none",
                border: "1px solid #233152",
                color: "#94a3b8",
                padding: "0.4rem 0.8rem",
                borderRadius: "6px",
                fontSize: "0.82rem",
                cursor: "pointer",
              }}
            >
              ← Back to Plan
            </button>
            <span style={{
              background: "rgba(99, 102, 241, 0.15)",
              border: "1px solid rgba(99, 102, 241, 0.3)",
              color: "#38bdf8",
              fontSize: "0.75rem",
              fontWeight: 700,
              padding: "0.2rem 0.5rem",
              borderRadius: "4px",
            }}>
              {session.companyName} • {session.role}
            </span>
            <span style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "capitalize" }}>
              Mode: {session.mode}
            </span>
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={() => setShowHistoryModal(true)}
              style={{
                background: "#0d1322",
                border: "1px solid #1c2842",
                color: "#cbd5e1",
                padding: "0.45rem 0.85rem",
                borderRadius: "6px",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              📜 View Past Simulations
            </button>
            <button
              onClick={() => navigate("/interview/setup")}
              style={{
                background: "#4f46e5",
                border: "none",
                color: "#ffffff",
                padding: "0.45rem 1rem",
                borderRadius: "6px",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              🎯 New Simulation
            </button>
          </div>
        </div>

        {/* ── Title & Meta ── */}
        <div>
          <h1 style={{
            fontSize: "1.8rem",
            fontWeight: 800,
            color: "#f8fafc",
            margin: "0 0 0.4rem 0",
          }}>
            Interview Assessment: {session.problemTitle}
          </h1>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
            Completed on {session.submittedAt ? new Date(session.submittedAt).toLocaleString() : "Recently"} • Duration: {Math.floor(session.durationSeconds / 60)} min • Elapsed: {Math.floor(session.elapsedSeconds / 60)} min
          </p>
        </div>

        {/* ── Closed-Loop Feedback Banner (Phase 3.3) ── */}
        <div style={{
          background: "linear-gradient(90deg, rgba(16, 185, 129, 0.1), rgba(13, 19, 34, 0.7))",
          border: "1px solid rgba(16, 185, 129, 0.3)",
          borderRadius: "8px",
          padding: "0.75rem 1rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
        }}>
          <span style={{ fontSize: "1.1rem" }}>🔄</span>
          <div style={{ fontSize: "0.82rem", color: "#cbd5e1" }}>
            <strong style={{ color: "#10b981" }}>Phase 3.3 Feedback Loop Synced:</strong>
            {" "}This session's execution evidence, attempts ({session.attempts || 1}), and confidence level have been written to your performance store. The adaptive generator will automatically incorporate this into upcoming study days.
          </div>
        </div>

        {/* ── Tabs: Rubric vs Code Review vs Approach ── */}
        <div style={{
          display: "flex",
          gap: "0.5rem",
          borderBottom: "1px solid #1c2842",
          paddingBottom: "0.25rem",
        }}>
          <button
            id="result-tab-rubric"
            onClick={() => setActiveReviewTab("rubric")}
            style={{
              padding: "0.5rem 1rem",
              background: activeReviewTab === "rubric" ? "#161f36" : "transparent",
              border: "none",
              borderBottom: activeReviewTab === "rubric" ? "2px solid #38bdf8" : "2px solid transparent",
              color: activeReviewTab === "rubric" ? "#f8fafc" : "#94a3b8",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              borderRadius: "4px 4px 0 0",
            }}
          >
            📊 8-Category Rubric Breakdown
          </button>
          <button
            id="result-tab-code"
            onClick={() => setActiveReviewTab("code")}
            style={{
              padding: "0.5rem 1rem",
              background: activeReviewTab === "code" ? "#161f36" : "transparent",
              border: "none",
              borderBottom: activeReviewTab === "code" ? "2px solid #38bdf8" : "2px solid transparent",
              color: activeReviewTab === "code" ? "#f8fafc" : "#94a3b8",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              borderRadius: "4px 4px 0 0",
            }}
          >
            💻 Code & Execution Review
          </button>
          <button
            id="result-tab-approach"
            onClick={() => setActiveReviewTab("approach")}
            style={{
              padding: "0.5rem 1rem",
              background: activeReviewTab === "approach" ? "#161f36" : "transparent",
              border: "none",
              borderBottom: activeReviewTab === "approach" ? "2px solid #38bdf8" : "2px solid transparent",
              color: activeReviewTab === "approach" ? "#f8fafc" : "#94a3b8",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              borderRadius: "4px 4px 0 0",
            }}
          >
            🧠 Candidate Notes & Complexity
          </button>
        </div>

        {/* ── Tab Content ── */}
        {activeReviewTab === "rubric" && (
          <InterviewRubricPanel
            rubricResult={rubricResult}
            evidence={executionEvidence}
            session={session}
          />
        )}

        {activeReviewTab === "code" && (
          <div style={{
            background: "#080c16",
            border: "1px solid #1c2842",
            borderRadius: "8px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            minHeight: "420px",
          }}>
            <div style={{
              padding: "0.5rem 1rem",
              background: "#0d1322",
              borderBottom: "1px solid #1c2842",
              fontSize: "0.8rem",
              color: "#94a3b8",
              display: "flex",
              justifyContent: "space-between",
            }}>
              <span>Submitted Code ({session.language})</span>
              <span>Attempts: {session.attempts || 1} • {executionEvidence?.passed ? "Passed" : "Failed"}</span>
            </div>
            <div style={{ height: "350px" }}>
              <Editor
                height="100%"
                language={session.language || "java"}
                value={session.code || "// No code submitted"}
                theme="vs-dark"
                options={{
                  readOnly: true,
                  fontSize: 13,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </div>
          </div>
        )}

        {activeReviewTab === "approach" && (
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            background: "#080c16",
            border: "1px solid #1c2842",
            borderRadius: "8px",
            padding: "1.25rem",
          }}>
            <div>
              <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Algorithm & Approach</div>
              <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.9rem", color: "#e2e8f0" }}>{session.approach?.summary || "None recorded."}</p>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Reasoning & Invariant</div>
              <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.9rem", color: "#e2e8f0" }}>{session.approach?.reasoning || "None recorded."}</p>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Edge Cases Considered</div>
              <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.9rem", color: "#e2e8f0" }}>{session.approach?.edgeCases || "None recorded."}</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", borderTop: "1px solid #1c2842", paddingTop: "0.75rem" }}>
              <div>
                <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Time Complexity</div>
                <div style={{ fontSize: "0.95rem", fontFamily: "monospace", color: "#38bdf8", marginTop: "0.2rem" }}>{session.approach?.timeComplexity || "Not specified"}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Space Complexity</div>
                <div style={{ fontSize: "0.95rem", fontFamily: "monospace", color: "#38bdf8", marginTop: "0.2rem" }}>{session.approach?.spaceComplexity || "Not specified"}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <InterviewHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
      />
    </div>
  );
}
