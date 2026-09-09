
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
  const { first, prev, next, last, play, pause, reset, setSpeed, goToStep } = useTraceStore();

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
      if (e.key === 'r' || e.key === 'R') reset();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isPlaying, next, prev, play, pause, reset]);

  return (
    <div className="cbar">
      {/* Timeline */}
      {total > 0 && (
        <div className="timeline">
          {trace.map((_, i) => (
            <div
              key={i}
              className={`tt ${i===currentStep?'cur':i<currentStep?'vis':''}`}
              onClick={() => goToStep(i)}
              title={`Step ${i+1}`}
            />
          ))}
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
