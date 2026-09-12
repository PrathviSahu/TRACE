
import { useEffect } from 'react';
import { useTraceStore } from '../store/traceStore.js';

const Icon = ({ d }) => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <path d={d} fill="currentColor" />
  </svg>
);

export default function Controls() {
  const trace       = useTraceStore(s => s.trace);
  const currentStep = useTraceStore(s => s.currentStep);
  const isPlaying   = useTraceStore(s => s.isPlaying);
  const speed       = useTraceStore(s => s.speed);
  const status      = useTraceStore(s => s.status);
  const { first, prev, next, last, play, pause, reset, setSpeed, goToStep, continueToBreakpoint } = useTraceStore();
  const breakpoints = useTraceStore(s => s.breakpoints || []);

  const step    = trace[currentStep];
  const total   = trace.length;
  const hasPrev = currentStep > 0;
  const hasNext = currentStep < total - 1;

  // keyboard shortcuts
  useEffect(() => {
    function isEditable(el) {
      if (!el) return false;
      const tag = el.tagName;
      return (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        el.isContentEditable ||
        Boolean(el.closest?.('.monaco-editor')) ||
        Boolean(el.closest?.('.editor-card-container')) ||
        Boolean(el.closest?.('.editor-wrap')) ||
        Boolean(el.closest?.('[contenteditable="true"]'))
      );
    }

    function onKey(e) {
      if (isEditable(e.target) || isEditable(document.activeElement)) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); prev(); }
      if (e.key === ' ')          { e.preventDefault(); isPlaying ? pause() : play(); }
      if (e.key === "r" || e.key === "R") reset();
      if (e.key === "F5") { e.preventDefault(); continueToBreakpoint(); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isPlaying, next, prev, play, pause, reset]);

  return (
    <div className="cbar">
      {/* Interactive Timeline Scrubber */}
      {total > 0 && (
        <div className="timeline-scrubber-container" style={{
          position: "relative",
          width: "100%",
          padding: "4px 8px",
          background: "var(--bg-raised, #111419)",
          borderBottom: "1px solid var(--border-subtle, #21262d)"
        }}>
          <div style={{
            position: "relative",
            height: 8,
            borderRadius: 4,
            background: "rgba(255, 255, 255, 0.08)",
            overflow: "hidden"
          }}>
            {/* Progress fill */}
            <div style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: `${((currentStep + 1) / total) * 100}%`,
              background: "linear-gradient(90deg, #6366f1, var(--accent-amber, #ff9f43))",
              borderRadius: 4,
              transition: "width 0.15s ease"
            }} />
          </div>

          {/* Interactive Range Input Overlay */}
          <input
            type="range"
            min="0"
            max={total - 1}
            value={currentStep}
            onChange={(e) => goToStep(Number(e.target.value))}
            title={`Step ${currentStep + 1} of ${total}: ${step ? step.statement : ""}`}
            style={{
              position: "absolute",
              left: 8,
              right: 8,
              top: 4,
              height: 8,
              width: "calc(100% - 16px)",
              opacity: 0,
              cursor: "pointer",
              margin: 0,
              zIndex: 10
            }}
          />
        </div>
      )}
      <div className="cbar-top">
        <button className="cbtn" onClick={first}  disabled={!hasPrev || total===0} title="First (Home)">
          <Icon d="M2 3h2v10H2V3zm3 5l7-5v10L5 8z" />
        </button>
        <button className="cbtn" onClick={prev}   disabled={!hasPrev} title="Previous (←)">
          <Icon d="M11 3L4 8l7 5V3z" />
        </button>
        <button className="cbtn play-btn" onClick={isPlaying ? pause : play} disabled={total===0} title="Play/Pause (Space)">
          {isPlaying
            ? <Icon d="M5 3h2v10H5V3zm4 0h2v10H9V3z" />
            : <Icon d="M4 3l10 5-10 5V3z" />}
        </button>
        <button
          className="cbtn continue-btn"
          onClick={continueToBreakpoint}
          disabled={!hasNext || total===0}
          title={breakpoints.length > 0 ? `Continue to Next Breakpoint (F5) [${breakpoints.length} active]` : "Continue to End (F5)"}
          style={{ position: "relative" }}
        >
          <Icon d="M3 3l7 5-7 5V3zm9 0h2v10h-2V3z" />
          {breakpoints.length > 0 && (
            <span style={{
              position: "absolute",
              top: 3,
              right: 3,
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#ef4444",
              boxShadow: "0 0 4px #ef4444"
            }} />
          )}
        </button>
        <button className="cbtn" onClick={next}   disabled={!hasNext} title="Next (→)">
          <Icon d="M5 3l7 5-7 5V3z" />
        </button>
        <button className="cbtn" onClick={last}   disabled={!hasNext || total===0} title="Last (End)">
          <Icon d="M12 3h2v10h-2V3zM4 3l7 5-7 5V3z" />
        </button>
        <button className="cbtn" onClick={reset}  disabled={total===0} title="Reset (R)">
          <Icon d="M8 3a5 5 0 1 0 4.546 2.914l-1.414 1.414A3 3 0 1 1 8 5V3z" />
        </button>

        <div className="cdiv" />

        <div className="step-info">
          {total > 0 ? (
            <><span className="step-count">Step {currentStep+1}</span> / {total}</>
          ) : (
            <span style={{color:'var(--txt3)'}}>No trace</span>
          )}
        </div>

        <div className="line-info">
          {step ? `Line ${step.line}: ${step.statement}` : ''}
        </div>

        <div className="speed-wrap">
          <span>Speed</span>
          <input
            type="range" min="0.25" max="4" step="0.25"
            className="speed-slider"
            value={speed}
            onChange={e => setSpeed(parseFloat(e.target.value))}
          />
          <span>{speed}x</span>
        </div>
      </div>
    </div>
  );
}
