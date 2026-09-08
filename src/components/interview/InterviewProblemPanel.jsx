import React, { useState } from "react";
import { PROBLEM_DESCRIPTIONS } from "../../data/problemDescriptions.js";
import { PRESET_SOLUTIONS } from "../../data/problemTemplates.js";
import { sanitizeHtml } from "../../utils/sanitize.js";

export default function InterviewProblemPanel({
  problem,
  hintsUsed = 0,
  solutionViewed = false,
  onUseHint,
  onViewSolution,
}) {
  const pId = problem?.id;
  const descObj = PROBLEM_DESCRIPTIONS[pId] || null;
  const preset = PRESET_SOLUTIONS[pId] || null;

  const [revealedHints, setRevealedHints] = useState(() => new Set());
  const [showSolutionModal, setShowSolutionModal] = useState(false);

  const hints = descObj?.hints || [];
  const examples = descObj?.examples || [];
  const constraints = descObj?.constraints || [];

  const handleRevealHint = (index) => {
    if (!revealedHints.has(index)) {
      const next = new Set(revealedHints);
      next.add(index);
      setRevealedHints(next);
      if (onUseHint) onUseHint(index + 1);
    }
  };

  const handleRevealSolution = () => {
    if (onViewSolution) onViewSolution();
    setShowSolutionModal(true);
  };

  const difficultyColor =
    problem?.difficulty === "Easy" ? "#10b981" :
    (problem?.difficulty === "Medium" ? "#f59e0b" : "#ef4444");

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "1.25rem",
      color: "var(--txt-main, #e2e8f0)",
      fontFamily: "var(--font-ui, Inter, sans-serif)",
      padding: "0.5rem 0",
    }}>
      {/* ── Header ── */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
          <span style={{
            background: "rgba(99, 102, 241, 0.15)",
            border: "1px solid rgba(99, 102, 241, 0.4)",
            color: "var(--accent-cyan, #38bdf8)",
            padding: "0.15rem 0.5rem",
            borderRadius: "4px",
            fontSize: "0.75rem",
            fontWeight: 700,
          }}>
            #{problem?.id}
          </span>
          <span style={{
            background: `${difficultyColor}20`,
            border: `1px solid ${difficultyColor}50`,
            color: difficultyColor,
            padding: "0.15rem 0.5rem",
            borderRadius: "4px",
            fontSize: "0.75rem",
            fontWeight: 600,
          }}>
            {problem?.difficulty || "Medium"}
          </span>
          {problem?.primaryPattern && (
            <span style={{
              background: "#161f36",
              border: "1px solid #233152",
              color: "#c084fc",
              padding: "0.15rem 0.5rem",
              borderRadius: "4px",
              fontSize: "0.75rem",
              fontWeight: 500,
            }}>
              🧩 {problem.primaryPattern}
            </span>
          )}
        </div>

        <h2 style={{
          fontSize: "1.35rem",
          fontWeight: 700,
          color: "var(--txt-bright, #f8fafc)",
          margin: "0 0 0.5rem 0",
        }}>
          {problem?.title || problem?.name || `Problem #${problem?.id}`}
        </h2>

        {/* ── Topic Badges ── */}
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
          {(problem?.topics || []).map((t, idx) => (
            <span key={idx} style={{
              fontSize: "0.7rem",
              background: "rgba(255, 255, 255, 0.05)",
              color: "#94a3b8",
              padding: "0.1rem 0.45rem",
              borderRadius: "4px",
              border: "1px solid #1c2842",
            }}>
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ── Description ── */}
      <div style={{
        lineHeight: 1.65,
        fontSize: "0.92rem",
        color: "#cbd5e1",
        background: "#0d1322",
        padding: "1rem",
        borderRadius: "8px",
        border: "1px solid #1c2842",
      }}>
        {descObj?.description ? (
          <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(descObj.description) }} />
        ) : (
          <p style={{ margin: 0 }}>
            Implement the optimal algorithm for <strong>{problem?.title}</strong> in your target language.
            Pay attention to time/space tradeoffs and edge cases.
          </p>
        )}
      </div>

      {/* ── Examples ── */}
      {examples.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <h4 style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", margin: 0 }}>
            Examples
          </h4>
          {examples.map((ex, i) => (
            <div key={i} style={{
              background: "#080c16",
              border: "1px solid #161f36",
              borderRadius: "6px",
              padding: "0.75rem 1rem",
              fontSize: "0.85rem",
              fontFamily: "monospace",
            }}>
              <div style={{ color: "#94a3b8" }}>
                <strong style={{ color: "#38bdf8" }}>Input:</strong> {ex.input}
              </div>
              <div style={{ color: "#94a3b8", marginTop: "0.25rem" }}>
                <strong style={{ color: "#10b981" }}>Output:</strong> {ex.output}
              </div>
              {ex.explanation && (
                <div style={{ color: "#64748b", marginTop: "0.35rem", fontSize: "0.8rem", fontFamily: "sans-serif" }}>
                  <em>Explanation:</em> {ex.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Constraints ── */}
      {constraints.length > 0 && (
        <div>
          <h4 style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", margin: "0 0 0.5rem 0" }}>
            Constraints
          </h4>
          <ul style={{
            margin: 0,
            paddingLeft: "1.25rem",
            fontSize: "0.84rem",
            color: "#94a3b8",
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem",
          }}>
            {constraints.map((c, i) => (
              <li key={i}><code>{c}</code></li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Hints (Tracked in session) ── */}
      {hints.length > 0 && (
        <div style={{
          marginTop: "0.5rem",
          borderTop: "1px solid #161f36",
          paddingTop: "0.75rem",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#f59e0b" }}>
              💡 Hints ({hintsUsed} used)
            </span>
            <span style={{ fontSize: "0.7rem", color: "#64748b" }}>
              Using hints reduces independent solve credit
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {hints.map((h, i) => {
              const isRevealed = revealedHints.has(i) || i < hintsUsed;
              return (
                <div key={i} style={{
                  background: "#090d18",
                  border: "1px solid #1c2842",
                  borderRadius: "6px",
                  padding: "0.5rem 0.75rem",
                }}>
                  {isRevealed ? (
                    <div style={{ fontSize: "0.84rem", color: "#cbd5e1" }}>
                      <strong style={{ color: "#f59e0b" }}>Hint {i + 1}:</strong> {h}
                    </div>
                  ) : (
                    <button
                      id={`reveal-hint-btn-${i + 1}`}
                      onClick={() => handleRevealHint(i)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#38bdf8",
                        fontSize: "0.82rem",
                        cursor: "pointer",
                        padding: 0,
                        fontWeight: 600,
                      }}
                    >
                      🔓 Reveal Hint {i + 1}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── View Solution (Tracked Penalty) ── */}
      <div style={{
        borderTop: "1px solid #161f36",
        paddingTop: "0.75rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}>
        {solutionViewed || showSolutionModal ? (
          <div style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "6px",
            padding: "0.75rem",
          }}>
            <div style={{ fontSize: "0.78rem", color: "#f87171", fontWeight: 600, marginBottom: "0.5rem" }}>
              ⚠️ Solution Peeked — Recorded in Objective Evidence
            </div>
            {preset?.code ? (
              <pre style={{
                background: "#070a12",
                padding: "0.6rem",
                borderRadius: "4px",
                fontSize: "0.78rem",
                color: "#e2e8f0",
                overflowX: "auto",
                margin: 0,
              }}>
                {preset.code}
              </pre>
            ) : (
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#94a3b8" }}>
                Solution code recorded for this interview session.
              </p>
            )}
          </div>
        ) : (
          <button
            id="interview-peek-solution-btn"
            onClick={handleRevealSolution}
            style={{
              background: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              color: "#f87171",
              fontSize: "0.78rem",
              fontWeight: 600,
              padding: "0.45rem 0.75rem",
              borderRadius: "6px",
              cursor: "pointer",
              alignSelf: "flex-start",
            }}
          >
            👁️ Peek Reference Solution (Records Penalty)
          </button>
        )}
      </div>
    </div>
  );
}
