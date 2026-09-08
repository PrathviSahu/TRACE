import React from "react";
import { getInterviewHistory } from "../../services/interviewSimulationStore.js";
import { useNavigate } from "react-router-dom";

export default function InterviewHistoryModal({ isOpen = true, onClose }) {
  const navigate = useNavigate();
  if (!isOpen) return null;

  const history = getInterviewHistory();

  return (
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
        background: "var(--bg-surface, #0d1322)",
        border: "1px solid var(--border-card, #1c2842)",
        borderRadius: "12px",
        width: "100%",
        maxWidth: "680px",
        maxHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
      }}>
        {/* ── Modal Header ── */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem 1.25rem",
          borderBottom: "1px solid var(--border-card, #1c2842)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.1rem" }}>📜</span>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "var(--txt-bright, #f8fafc)" }}>
              Interview Simulation History
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#94a3b8",
              fontSize: "1.2rem",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        {/* ── List ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.25rem" }}>
          {history.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: "#64748b", fontSize: "0.88rem" }}>
              No completed interview simulations yet. Start a simulation to see past performance here.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {history.map(item => {
                const score = item.overallScore;
                const scoreColor = score >= 80 ? "#10b981" : (score >= 50 ? "#f59e0b" : "#ef4444");

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      onClose();
                      navigate(`/interview/result/${item.id}`);
                    }}
                    style={{
                      background: "var(--bg-darkest, #080c16)",
                      border: "1px solid #1c2842",
                      borderRadius: "8px",
                      padding: "0.75rem 1rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                      transition: "border-color 0.15s ease",
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "#38bdf8"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "#1c2842"}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.2rem" }}>
                        <span style={{ fontSize: "0.75rem", background: "#161f36", color: "#38bdf8", padding: "0.1rem 0.4rem", borderRadius: "4px", fontWeight: 600 }}>
                          {item.companyName}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "capitalize" }}>
                          Mode: {item.mode}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.92rem", fontWeight: 600, color: "#f8fafc" }}>
                        {item.problemTitle}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.2rem" }}>
                        {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString() : new Date(item.createdAt).toLocaleDateString()} • {Math.floor(item.durationSeconds / 60)} min
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      {score !== null ? (
                        <div style={{ fontSize: "1.25rem", fontWeight: 700, color: scoreColor }}>
                          {score}<span style={{ fontSize: "0.7rem", color: "#64748b" }}>/100</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                          {item.status}
                        </span>
                      )}
                      <div style={{ fontSize: "0.7rem", color: "#38bdf8", marginTop: "0.2rem" }}>
                        View Result →
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
