import React from "react";

export default function InterviewFollowupPanel({
  followUps = [],
  readOnly = false,
  onAnswerFollowup,
}) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "1.25rem",
      padding: "0.5rem 0",
      fontFamily: "var(--font-ui, Inter, sans-serif)",
    }}>
      <div style={{
        background: "rgba(99, 102, 241, 0.08)",
        border: "1px solid rgba(99, 102, 241, 0.25)",
        borderRadius: "8px",
        padding: "0.85rem 1rem",
        display: "flex",
        alignItems: "flex-start",
        gap: "0.75rem",
      }}>
        <span style={{ fontSize: "1.2rem" }}>💬</span>
        <div style={{ fontSize: "0.84rem", color: "#cbd5e1", lineHeight: 1.5 }}>
          <strong style={{ color: "var(--accent-cyan, #38bdf8)" }}>Interviewer Follow-ups:</strong>
          {" "}Real FAANG interviews conclude with follow-up scenarios (scaling, constraints, alternate tradeoffs). Answering these demonstrates senior engineering depth.
        </div>
      </div>

      {followUps.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "2rem",
          color: "#64748b",
          fontSize: "0.88rem",
          background: "var(--bg-surface, #080c16)",
          borderRadius: "8px",
          border: "1px dashed var(--border-card, #1c2842)",
        }}>
          No follow-up questions assigned for this session yet.
        </div>
      ) : (
        followUps.map((item, idx) => (
          <div key={item.id || idx} style={{
            background: "var(--bg-surface, #090d18)",
            border: "1px solid var(--border-card, #1c2842)",
            borderRadius: "8px",
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "var(--txt-bright, #f8fafc)",
              }}>
                Q{idx + 1}: {item.question}
              </span>
              <span style={{
                fontSize: "0.7rem",
                background: "rgba(255, 255, 255, 0.05)",
                color: "#94a3b8",
                padding: "0.1rem 0.4rem",
                borderRadius: "4px",
              }}>
                {item.source || "deterministic"}
              </span>
            </div>

            <textarea
              id={`followup-answer-input-${idx + 1}`}
              value={item.answer || ""}
              onChange={e => onAnswerFollowup && onAnswerFollowup(item.id, e.target.value)}
              disabled={readOnly}
              placeholder="Type your response to this interview scenario..."
              rows={3}
              style={{
                width: "100%",
                padding: "0.6rem 0.8rem",
                borderRadius: "6px",
                border: "1px solid #233152",
                background: "#070a12",
                color: "#f8fafc",
                fontSize: "0.86rem",
                boxSizing: "border-box",
                outline: "none",
                resize: "vertical",
              }}
            />
          </div>
        ))
      )}
    </div>
  );
}
