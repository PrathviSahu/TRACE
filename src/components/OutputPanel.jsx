
import { useTraceStore } from '../store/traceStore.js';

function fmtVal(v) {
  if (v === null || v === undefined) return 'null';
  if (Array.isArray(v)) return `[${v.join(', ')}]`;
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

export default function OutputPanel() {
  const trace       = useTraceStore(s => s.trace);
  const currentStep = useTraceStore(s => s.currentStep);
  const returnValue = useTraceStore(s => s.returnValue);
  const status      = useTraceStore(s => s.status);
  const step  = trace[currentStep];
  const lines = step?.outputs ?? [];
  const isDone = status === 'done';

  return (
    <div className="out-panel">
      {lines.length > 0 && (
        <div className="out-lines">
          {lines.map((l, i) => (
            <div key={i} className="out-line">
              <span className="out-prompt">›</span>
              <span>{l}</span>
            </div>
          ))}
        </div>
      )}
      {isDone && returnValue !== undefined && (
        <div className="out-ret">
          <span>✓</span>
          <span>Result: <strong>{fmtVal(returnValue)}</strong></span>
        </div>
      )}
      {isDone && (
        <div className="out-stats">
          {trace.length} execution steps
        </div>
      )}
      {!isDone && lines.length === 0 && (
        <div style={{color:'var(--txt3)',fontSize:12}}>Output appears here</div>
      )}
    </div>
  );
}
