
import { useTraceStore } from '../store/traceStore.js';

function fmtVal(v) {
  if (v === null || v === undefined) return 'null';
  if (Array.isArray(v)) return `[${v.join(', ')}]`;
  if (typeof v === 'object' && v.__type) return `${v.__type}(...)`;
  return String(v);
}

export default function ExplanationPanel() {
  const trace       = useTraceStore(s => s.trace);
  const currentStep = useTraceStore(s => s.currentStep);
  const step = trace[currentStep];
  if (!step) return <div className="panel-empty">Step through execution to see explanations</div>;

  const exp   = step.explanation ?? {};
  const isTrue  = step.conditionResult === true;
  const isFalse = step.conditionResult === false;
  const hasCondition = step.conditionResult !== undefined;

  return (
    <div className="exp-panel">
      <div className="exp-badge">STEP {step.step} · {exp.title ?? step.type}</div>
      {step.statement && <div className="exp-stmt">{step.statement}</div>}
      <div className="exp-body">
        {exp.type === 'declaration' && (
          <>
            <span>Variable <code className="exp-code">{exp.name}</code> declared</span>
            <span>Value: <code className="exp-code">{fmtVal(exp.value)}</code></span>
          </>
        )}
        {exp.type === 'assignment' && exp.changes?.map((c, i) => (
          <span key={i}>
            <code className="exp-code">{c.name}</code>
            {' '}{fmtVal(c.from)} → <strong style={{color:'var(--amber)'}}>{fmtVal(c.to)}</strong>
          </span>
        ))}
        {(exp.type === 'condition' || exp.type === 'loop_condition') && (
          <>
            <span><code className="exp-code">{exp.expression}</code></span>
            <span>= <code className="exp-code">{exp.expanded}</code></span>
            <div className={`cond-result ${exp.result ? 't' : 'f'}`}>
              {exp.result ? '✓ TRUE' : '✗ FALSE'}
              {exp.type === 'loop_condition' && (
                <span style={{marginLeft:8,opacity:.8,fontSize:11}}>
                  {exp.result ? '→ continue loop' : '→ exit loop'}
                </span>
              )}
            </div>
          </>
        )}
        {exp.type === 'return' && (
          <span>Returns: <code className="exp-code">{fmtVal(exp.value)}</code></span>
        )}
        {exp.type === 'call' && (
          <span>Entering <code className="exp-code">{exp.name}()</code></span>
        )}
        {exp.type === 'output' && (
          <span>Prints: <code className="exp-code">"{exp.value}"</code></span>
        )}
        {exp.type === 'done' && (
          <span style={{color:'var(--green)'}}>✓ Execution complete · Result: <code className="exp-code">{fmtVal(exp.value)}</code></span>
        )}
      </div>
    </div>
  );
}
