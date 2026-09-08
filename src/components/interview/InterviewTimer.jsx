import React, { useState, useEffect } from "react";
import { calculateSessionTime } from "../../services/interviewSimulationEngine.js";

export default function InterviewTimer({ session, onPause, onResume, onExpire }) {
  const [timeInfo, setTimeInfo] = useState(() => calculateSessionTime(session));

  useEffect(() => {
    if (!session || session.status === "submitted" || session.status === "expired") {
      setTimeInfo(calculateSessionTime(session));
      return;
    }

    const interval = setInterval(() => {
      const info = calculateSessionTime(session, Date.now());
      setTimeInfo(info);

      if (info.isExpired && session.status === "active" && onExpire) {
        onExpire();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session, onExpire]);

  const { elapsedSeconds, remainingSeconds } = timeInfo;
  const durationSeconds = session?.durationSeconds || (45 * 60);
  const progressFraction = Math.min(1, Math.max(0, elapsedSeconds / durationSeconds));

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const isWarning = remainingSeconds <= 5 * 60 && remainingSeconds > 60;
  const isDanger = remainingSeconds <= 60;

  const timerColor = isDanger ? "#ef4444" : (isWarning ? "#f59e0b" : "#38bdf8");

  const isPaused = session?.status === "paused";
  const isDone = session?.status === "submitted" || session?.status === "expired";

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "1rem",
      background: "#0d1322",
      border: `1px solid ${isDanger ? "rgba(239, 68, 68, 0.4)" : "#1c2842"}`,
      padding: "0.5rem 1rem",
      borderRadius: "8px",
      minWidth: "220px",
    }}>
      {/* ── Clock Display ── */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span style={{ fontSize: "0.85rem" }}>⏱️</span>
          <span style={{
            fontSize: "1.15rem",
            fontWeight: 700,
            fontFamily: "monospace",
            color: timerColor,
            letterSpacing: "0.05em",
          }}>
            {timeFormatted}
          </span>
          {isPaused && (
            <span style={{
              fontSize: "0.65rem",
              background: "rgba(245, 158, 11, 0.2)",
              color: "#f59e0b",
              padding: "0.1rem 0.4rem",
              borderRadius: "4px",
              fontWeight: 600,
              textTransform: "uppercase",
            }}>
              PAUSED
            </span>
          )}
        </div>

        {/* ── Progress mini bar ── */}
        <div style={{
          width: "100%",
          height: "3px",
          background: "rgba(255, 255, 255, 0.1)",
          borderRadius: "2px",
          marginTop: "0.3rem",
          overflow: "hidden",
        }}>
          <div style={{
            width: `${progressFraction * 100}%`,
            height: "100%",
            background: timerColor,
            transition: "width 0.5s ease",
          }} />
        </div>
      </div>

      {/* ── Pause / Resume Button ── */}
      {!isDone && (
        <button
          id="interview-timer-pause-btn"
          onClick={isPaused ? onResume : onPause}
          style={{
            background: "none",
            border: "1px solid #2a3a5a",
            color: "#94a3b8",
            padding: "0.35rem 0.65rem",
            borderRadius: "6px",
            fontSize: "0.75rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#38bdf8"; e.currentTarget.style.color = "#f8fafc"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#2a3a5a"; e.currentTarget.style.color = "#94a3b8"; }}
          title={isPaused ? "Resume interview timer" : "Pause interview timer"}
        >
          {isPaused ? "▶ Resume" : "⏸ Pause"}
        </button>
      )}
    </div>
  );
}
