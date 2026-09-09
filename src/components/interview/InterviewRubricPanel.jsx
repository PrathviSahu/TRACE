import React from "react";
import { RUBRIC_WEIGHTS } from "../../services/interviewSimulationEngine.js";

const CATEGORY_META = {
  problemUnderstanding: { label: "Problem Understanding", weight: "15%", icon: "📖" },
  approachReasoning:    { label: "Approach / Reasoning", weight: "20%", icon: "🧠" },
  patternRecognition:   { label: "Pattern Recognition", weight: "10%", icon: "🧩" },
  correctness:          { label: "Correctness", weight: "20%", icon: "✅" },
  codeQuality:          { label: "Code Quality", weight: "10%", icon: "💻" },
  complexityAnalysis:   { label: "Complexity Analysis", weight: "10%", icon: "⚡" },
  communication:        { label: "Communication", weight: "10%", icon: "💬" },
  timeManagement:       { label: "Time Management", weight: "5%", icon: "⏱️" },
};

export default function InterviewRubricPanel({ rubricResult, evidence, session }) {
  if (!rubricResult) {
    return (
      <div style={{
        padding: "2rem",
        textAlign: "center",
        color: "var(--txt-dim, #64748b)",
        background: "var(--bg-surface, #080c16)",
        borderRadius: "8px",
        border: "1px dashed var(--border-card, #1c2842)",
      }}>
        Rubric evaluation will appear here once the interview is submitted.
      </div>
    );
  }

  const { overallScore, categories = {}, feedback = {}, isGeminiEvaluated } = rubricResult;

  const decision =
    overallScore >= 85 ? { label: "Strong Hire", color: "#10b981" } :
    (overallScore >= 70 ? { label: "Hire", color: "#38bdf8" } :
    (overallScore >= 50 ? { label: "Leaning Hire", color: "#f59e0b" } :
    { label: "Needs Improvement", color: "#ef4444" }));

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "1.5rem",
      fontFamily: "var(--font-ui, Inter, sans-serif)",
    }}>
      {/* ── Top Overview Banner ── */}
      <div style={{
        background: "linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(13, 19, 34, 0.9))",
        border: "1px solid #1c2842",
        borderRadius: "10px",
        padding: "1.5rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1.25rem",
      }}>
        {/* Score & Verdict */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <div style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: `conic-gradient(${decision.color} ${overallScore}%, rgba(255,255,255,0.05) 0)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "5px",
          }}>
            <div style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              background: "var(--bg-darkest, #070a12)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <span style={{ fontSize: "1.45rem", fontWeight: 800, color: decision.color, lineHeight: 1 }}>
                {overallScore}
              </span>
              <span style={{ fontSize: "0.65rem", color: "#64748b" }}>/ 100</span>
            </div>
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
              <h3 style={{ fontSize: "1.35rem", fontWeight: 700, margin: 0, color: "var(--txt-bright, #f8fafc)" }}>
                {decision.label}
              </h3>
              <span style={{
                fontSize: "0.7rem",
                padding: "0.15rem 0.45rem",
                borderRadius: "4px",
                background: isGeminiEvaluated ? "rgba(99, 102, 241, 0.15)" : "rgba(100, 116, 139, 0.15)",
                color: isGeminiEvaluated ? "#818cf8" : "#94a3b8",
                border: `1px solid ${isGeminiEvaluated ? "rgba(99, 102, 241, 0.3)" : "#233152"}`,
                fontWeight: 600,
              }}>
                {isGeminiEvaluated ? "🤖 AI Bar Raiser + Deterministic Execution" : "⚙️ TRACE Deterministic Objective Rubric"}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--txt-muted, #94a3b8)" }}>
              {feedback.generalNotes || "Comprehensive technical interview assessment."}
            </p>
          </div>
        </div>

        {/* Objective Stats Strip */}
        <div style={{
          display: "flex",
          gap: "0.75rem",
          background: "var(--bg-darkest, #080c16)",
          padding: "0.75rem 1rem",
          borderRadius: "8px",
          border: "1px solid var(--border-subtle, #161f36)",
        }}>
          <div>
            <div style={statLabelStyle}>Tests Passed</div>
            <div style={statValueStyle}>
              {evidence?.testsTotal > 0 ? `${evidence.testsPassed}/${evidence.testsTotal}` : (evidence?.passed ? "1/1" : "0/1")}
            </div>
          </div>
          <div style={statDividerStyle} />
          <div>
            <div style={statLabelStyle}>Attempts</div>
            <div style={statValueStyle}>{session?.attempts || 1}</div>
          </div>
          <div style={statDividerStyle} />
          <div>
            <div style={statLabelStyle}>Elapsed</div>
            <div style={statValueStyle}>{Math.floor((session?.elapsedSeconds || 0) / 60)}m</div>
          </div>
          <div style={statDividerStyle} />
          <div>
            <div style={statLabelStyle}>Hints / Peek</div>
            <div style={{ ...statValueStyle, color: session?.hintsUsed > 0 || session?.solutionViewed ? "#f59e0b" : "#10b981" }}>
              {session?.hintsUsed || 0} / {session?.solutionViewed ? "Yes" : "No"}
            </div>
          </div>
        </div>
      </div>

      {/* ── 8 Rubric Categories Grid ── */}
      <div>
        <h4 style={{ fontSize: "0.88rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", margin: "0 0 0.75rem 0" }}>
          Weighted Rubric Breakdown
        </h4>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "0.75rem",
        }}>
          {Object.entries(CATEGORY_META).map(([catKey, meta]) => {
            const cat = categories[catKey] || { score: 0, weightedScore: 0, reasoning: "" };
            const score = cat.score ?? 0;
            const barPct = Math.min(100, Math.max(0, (score / 5) * 100));
            const barColor = score >= 4 ? "#10b981" : (score >= 3 ? "#38bdf8" : (score >= 2 ? "#f59e0b" : "#ef4444"));

            return (
              <div key={catKey} style={{
                background: "var(--bg-surface, #0d1322)",
                border: "1px solid var(--border-card, #1c2842)",
                borderRadius: "8px",
                padding: "0.85rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.4rem",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--txt-bright, #f8fafc)" }}>
                    {meta.icon} {meta.label}
                  </span>
                  <span style={{ fontSize: "0.7rem", color: "#64748b" }}>{meta.weight}</span>
                </div>

                {/* Score bar */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{ flex: 1, height: "6px", background: "var(--border-subtle, #1c2842)", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ width: `${barPct}%`, height: "100%", background: barColor, borderRadius: "3px" }} />
                  </div>
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: barColor, minWidth: "30px", textAlign: "right" }}>
                    {score}/5
                  </span>
                </div>

                <div style={{ fontSize: "0.75rem", color: "var(--txt-muted, #94a3b8)", lineHeight: 1.4, marginTop: "0.2rem" }}>
                  {cat.reasoning || "Evaluation recorded."}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Strengths & Actionable Improvements ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        {/* Strengths */}
        <div style={{
          background: "rgba(16, 185, 129, 0.05)",
          border: "1px solid rgba(16, 185, 129, 0.25)",
          borderRadius: "8px",
          padding: "1rem",
        }}>
          <h5 style={{ margin: "0 0 0.5rem 0", color: "#10b981", fontSize: "0.85rem", fontWeight: 700 }}>
            🌟 Demonstrated Strengths
          </h5>
          <ul style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "0.82rem", color: "var(--txt-main, #cbd5e1)", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
            {(feedback.strengths || []).map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>

        {/* Improvements */}
        <div style={{
          background: "rgba(245, 158, 11, 0.05)",
          border: "1px solid rgba(245, 158, 11, 0.25)",
          borderRadius: "8px",
          padding: "1rem",
        }}>
          <h5 style={{ margin: "0 0 0.5rem 0", color: "#f59e0b", fontSize: "0.85rem", fontWeight: 700 }}>
            📈 Areas for Growth
          </h5>
          <ul style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "0.82rem", color: "var(--txt-main, #cbd5e1)", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
            {(feedback.improvements || []).map((imp, i) => (
              <li key={i}>{imp}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

const statLabelStyle = {
  fontSize: "0.68rem",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  color: "#64748b",
};

const statValueStyle = {
  fontSize: "0.95rem",
  fontWeight: 700,
  color: "var(--txt-bright, #f8fafc)",
  marginTop: "0.15rem",
};

const statDividerStyle = {
  width: "1px",
  background: "var(--border-subtle, #1c2842)",
};
