// ─────────────────────────────────────────────────────────────
//  TRACE — Adaptive Insights Panel
//  Phase 3.3: Compact, human-readable adaptation summary UI.
//  Shows weak areas, strong areas, revision queue, difficulty trend.
// ─────────────────────────────────────────────────────────────

import React, { useMemo } from "react";

const TREND_CONFIG = {
  reduce:   { icon: "📉", label: "Difficulty Reduced",  color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.3)" },
  maintain: { icon: "📊", label: "Difficulty Stable",   color: "#38bdf8", bg: "rgba(56,189,248,0.1)",  border: "rgba(56,189,248,0.3)" },
  increase: { icon: "📈", label: "Difficulty Increased",color: "#10b981", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.3)" },
};

const PRESSURE_CONFIG = {
  high:   { color: "#ef4743", label: "High Revision Pressure",   bg: "rgba(239,71,67,0.12)",    border: "rgba(239,71,67,0.35)" },
  medium: { color: "#ffa116", label: "Medium Revision Pressure", bg: "rgba(255,161,22,0.12)",   border: "rgba(255,161,22,0.35)" },
  low:    { color: "#10b981", label: "Low Revision Pressure",    bg: "rgba(16,185,129,0.12)",   border: "rgba(16,185,129,0.35)" },
};

function FamilyBadge({ label, icon, color, bg, border }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "0.3rem",
      padding: "0.2rem 0.55rem",
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: "5px",
      color,
      fontSize: "0.72rem",
      fontWeight: 700,
      letterSpacing: "0.03em",
      whiteSpace: "nowrap",
    }}>
      {icon && <span>{icon}</span>}
      {label}
    </span>
  );
}

export default function AdaptiveInsightsPanel({ adaptiveState, planDelta, lastAdaptedAt }) {
  if (!adaptiveState) return null;

  const {
    weakFamilies = [],
    strongFamilies = [],
    weakTopics = [],
    revisionPressure = 0,
    difficultyTrend = "maintain",
    adaptationReasons = [],
  } = adaptiveState;

  const pressureLevel = revisionPressure >= 60 ? "high" : revisionPressure >= 30 ? "medium" : "low";
  const trendCfg = TREND_CONFIG[difficultyTrend] || TREND_CONFIG.maintain;
  const pressureCfg = PRESSURE_CONFIG[pressureLevel];

  const delta = planDelta || adaptiveState.planDelta || {};

  const adaptedToday = useMemo(() => {
    if (!lastAdaptedAt) return false;
    const today = new Date().toISOString().split("T")[0];
    return lastAdaptedAt.split("T")[0] === today;
  }, [lastAdaptedAt]);

  return (
    <div style={{
      background: "var(--bg-surface, #0d1322)",
      border: "1px solid rgba(99,102,241,0.3)",
      borderRadius: "12px",
      padding: "1.25rem 1.5rem",
      marginBottom: "1.75rem",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{
            background: "rgba(99,102,241,0.15)",
            border: "1px solid #6366f1",
            color: "#818cf8",
            padding: "0.2rem 0.55rem",
            borderRadius: "4px",
            fontSize: "0.68rem",
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}>
            🧠 ADAPTIVE INSIGHTS
          </span>
          {adaptedToday && (
            <span style={{
              background: "rgba(16,185,129,0.15)",
              border: "1px solid #10b981",
              color: "#10b981",
              padding: "0.2rem 0.55rem",
              borderRadius: "4px",
              fontSize: "0.68rem",
              fontWeight: 700,
            }}>
              UPDATED TODAY
            </span>
          )}
        </div>
        <span style={{ color: "var(--txt-muted, #94a3b8)", fontSize: "0.75rem" }}>
          v{adaptiveState.adaptationVersion || 1} • {
            adaptiveState.lastEvaluatedAt
              ? new Date(adaptiveState.lastEvaluatedAt).toLocaleDateString()
              : "Not yet evaluated"
          }
        </span>
      </div>

      {/* Main insight grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>

        {/* Weak areas */}
        {weakFamilies.length > 0 && (
          <div style={{ background: "rgba(239,71,67,0.06)", border: "1px solid rgba(239,71,67,0.2)", borderRadius: "8px", padding: "0.85rem 1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.6rem" }}>
              <span style={{ fontSize: "1.1rem" }}>🔥</span>
              <span style={{ color: "#ef4743", fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.04em" }}>NEEDS ATTENTION</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
              {weakFamilies.slice(0, 4).map(f => (
                <FamilyBadge key={f} label={f} color="#ef4743" bg="rgba(239,71,67,0.12)" border="rgba(239,71,67,0.4)" />
              ))}
            </div>
          </div>
        )}

        {/* Strong areas */}
        {strongFamilies.length > 0 && (
          <div style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "8px", padding: "0.85rem 1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.6rem" }}>
              <span style={{ fontSize: "1.1rem" }}>💪</span>
              <span style={{ color: "#10b981", fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.04em" }}>STRONG AREAS</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
              {strongFamilies.slice(0, 4).map(f => (
                <FamilyBadge key={f} label={f} color="#10b981" bg="rgba(16,185,129,0.12)" border="rgba(16,185,129,0.4)" />
              ))}
            </div>
          </div>
        )}

        {/* Revision Pressure */}
        <div style={{ background: pressureCfg.bg, border: `1px solid ${pressureCfg.border}`, borderRadius: "8px", padding: "0.85rem 1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.6rem" }}>
            <span style={{ fontSize: "1.1rem" }}>🔄</span>
            <span style={{ color: pressureCfg.color, fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.04em" }}>REVISION</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{
              flex: 1,
              height: "6px",
              background: "rgba(255,255,255,0.08)",
              borderRadius: "3px",
              overflow: "hidden",
            }}>
              <div style={{
                width: `${revisionPressure}%`,
                height: "100%",
                background: pressureCfg.color,
                borderRadius: "3px",
                transition: "width 0.4s ease",
              }} />
            </div>
            <span style={{ color: pressureCfg.color, fontWeight: 700, fontSize: "0.8rem", minWidth: "2.5rem" }}>
              {revisionPressure}/100
            </span>
          </div>
          <div style={{ color: "var(--txt-muted, #94a3b8)", fontSize: "0.72rem", marginTop: "0.4rem" }}>
            {pressureCfg.label}
          </div>
          {delta.addedRevision > 0 && (
            <div style={{ color: pressureCfg.color, fontSize: "0.72rem", marginTop: "0.25rem", fontWeight: 600 }}>
              + {delta.addedRevision} revision slot(s) added
            </div>
          )}
        </div>

        {/* Difficulty trend */}
        <div style={{ background: trendCfg.bg, border: `1px solid ${trendCfg.border}`, borderRadius: "8px", padding: "0.85rem 1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "1.1rem" }}>{trendCfg.icon}</span>
            <span style={{ color: trendCfg.color, fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.04em" }}>DIFFICULTY</span>
          </div>
          <div style={{ color: trendCfg.color, fontWeight: 700, fontSize: "0.88rem" }}>{trendCfg.label}</div>
          {delta.removedHard > 0 && (
            <div style={{ color: "var(--txt-muted, #94a3b8)", fontSize: "0.72rem", marginTop: "0.3rem" }}>
              {delta.removedHard} Hard → Medium swap(s)
            </div>
          )}
          {delta.addedWeakPatternProblems > 0 && (
            <div style={{ color: trendCfg.color, fontSize: "0.72rem", marginTop: "0.3rem", fontWeight: 600 }}>
              + {delta.addedWeakPatternProblems} reinforcement problem(s)
            </div>
          )}
        </div>
      </div>

      {/* Adaptation reasons */}
      {adaptationReasons.length > 0 && (
        <div style={{ marginTop: "1rem", padding: "0.75rem 1rem", background: "rgba(255,255,255,0.03)", borderRadius: "7px", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ color: "var(--txt-muted, #94a3b8)", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.06em", marginBottom: "0.4rem", textTransform: "uppercase" }}>
            WHY THE PLAN CHANGED
          </div>
          <ul style={{ margin: 0, padding: "0 0 0 1rem", listStyle: "disc" }}>
            {adaptationReasons.map((r, i) => (
              <li key={i} style={{ color: "var(--txt-main, #e2e8f0)", fontSize: "0.78rem", lineHeight: 1.6 }}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Weak topics (compact) */}
      {weakTopics.length > 0 && (
        <div style={{ marginTop: "0.85rem", display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
          <span style={{ color: "var(--txt-muted, #94a3b8)", fontSize: "0.72rem" }}>Weak topics:</span>
          {weakTopics.slice(0, 5).map(t => (
            <FamilyBadge key={t} label={t} color="#f59e0b" bg="rgba(245,158,11,0.1)" border="rgba(245,158,11,0.3)" />
          ))}
        </div>
      )}
    </div>
  );
}
