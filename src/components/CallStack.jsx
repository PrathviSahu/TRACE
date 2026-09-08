
import { useTraceStore } from '../store/traceStore.js';

export default function CallStack() {
  const trace       = useTraceStore(s => s.trace);
  const currentStep = useTraceStore(s => s.currentStep);
  const step = trace[currentStep];
  const frames = step?.callStack ?? [];
  if (frames.length === 0) return <div className="panel-empty">No active frames</div>;
  return (
    <div className="cs-frames">
      {[...frames].reverse().map((fr, i) => (
        <div key={i} className={`cs-frame ${i === 0 ? 'active' : ''}`}>
          {i === 0 && <div className="cs-dot" />}
          <span>{fr}</span>
        </div>
      ))}
    </div>
  );
}
