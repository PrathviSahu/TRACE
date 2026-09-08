import React from "react";

export default function InterviewApproachPanel({ approach = {}, onChange, readOnly = false }) {
  const handleChange = (field, value) => {
    if (readOnly || !onChange) return;
    onChange({
      ...approach,
      [field]: value,
    });
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "1.25rem",
      padding: "0.5rem 0",
      fontFamily: "var(--font-ui, Inter, sans-serif)",
    }}>
      {/* ── Guidance Banner ── */}
      <div style={{
        background: "rgba(99, 102, 241, 0.08)",
        border: "1px solid rgba(99, 102, 241, 0.25)",
        borderRadius: "8px",
        padding: "0.85rem 1rem",
        display: "flex",
        alignItems: "flex-start",
        gap: "0.75rem",
      }}>
        <span style={{ fontSize: "1.2rem" }}>🎯</span>
        <div style={{ fontSize: "0.84rem", color: "#cbd5e1", lineHeight: 1.5 }}>
          <strong style={{ color: "var(--accent-cyan, #38bdf8)" }}>Before writing code:</strong>
          {" "}Top tech interviewers evaluate your thought process and edge-case awareness.
          Your notes here directly inform the <strong>Approach / Reasoning (20%)</strong> and <strong>Problem Understanding (15%)</strong> rubric.
        </div>
      </div>

      {/* ── 1. Planned Algorithm / Approach ── */}
      <div>
        <label style={labelStyle}>
          Planned Algorithm & Data Structures
          <span style={hintBadgeStyle}>Crucial for Rubric</span>
        </label>
        <textarea
          id="approach-summary-input"
          value={approach.summary || ""}
          onChange={e => handleChange("summary", e.target.value)}
          disabled={readOnly}
          placeholder="e.g. Use two pointers starting at opposite ends; shrink the window based on sum..."
          rows={3}
          style={textareaStyle}
        />
      </div>

      {/* ── 2. Why Does This Work? (Reasoning) ── */}
      <div>
        <label style={labelStyle}>
          Reasoning & Correctness Invariant
        </label>
        <textarea
          id="approach-reasoning-input"
          value={approach.reasoning || ""}
          onChange={e => handleChange("reasoning", e.target.value)}
          disabled={readOnly}
          placeholder="e.g. Because the array is sorted, if sum < target we must increment left pointer to increase total..."
          rows={3}
          style={textareaStyle}
        />
      </div>

      {/* ── 3. Edge Cases ── */}
      <div>
        <label style={labelStyle}>
          Edge Cases & Boundary Conditions
        </label>
        <textarea
          id="approach-edgecases-input"
          value={approach.edgeCases || ""}
          onChange={e => handleChange("edgeCases", e.target.value)}
          disabled={readOnly}
          placeholder="e.g. Empty input, single element, negative numbers, duplicates, integer overflow..."
          rows={2}
          style={textareaStyle}
        />
      </div>

      {/* ── 4. Complexities ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div>
          <label style={labelStyle}>Target Time Complexity</label>
          <input
            id="approach-time-input"
            type="text"
            value={approach.timeComplexity || ""}
            onChange={e => handleChange("timeComplexity", e.target.value)}
            disabled={readOnly}
            placeholder="e.g. O(n) or O(n log n)"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Target Space Complexity</label>
          <input
            id="approach-space-input"
            type="text"
            value={approach.spaceComplexity || ""}
            onChange={e => handleChange("spaceComplexity", e.target.value)}
            disabled={readOnly}
            placeholder="e.g. O(1) or O(n)"
            style={inputStyle}
          />
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontSize: "0.82rem",
  fontWeight: 600,
  color: "#94a3b8",
  marginBottom: "0.35rem",
};

const textareaStyle = {
  width: "100%",
  padding: "0.65rem 0.85rem",
  borderRadius: "6px",
  border: "1px solid #1c2842",
  background: "#080c16",
  color: "#f8fafc",
  fontSize: "0.88rem",
  fontFamily: "var(--font-ui, Inter, sans-serif)",
  lineHeight: 1.5,
  boxSizing: "border-box",
  outline: "none",
  resize: "vertical",
};

const inputStyle = {
  width: "100%",
  padding: "0.6rem 0.8rem",
  borderRadius: "6px",
  border: "1px solid #1c2842",
  background: "#080c16",
  color: "#f8fafc",
  fontSize: "0.88rem",
  fontFamily: "monospace",
  boxSizing: "border-box",
  outline: "none",
};

const hintBadgeStyle = {
  fontSize: "0.7rem",
  color: "#38bdf8",
  background: "rgba(56, 189, 248, 0.1)",
  padding: "0.1rem 0.4rem",
  borderRadius: "4px",
  fontWeight: 500,
};
