
import { useTraceStore } from '../store/traceStore.js';

export default function VariablesPanel() {
  const trace       = useTraceStore(s => s.trace);
  const currentStep = useTraceStore(s => s.currentStep);
  const step = trace[currentStep];
  if (!step) return <div className="panel-empty">Run code to see variables</div>;

  const vars    = step.variables ?? {};
  const changed = step.changedVars ?? {};
  const entries = Object.entries(vars);
  if (entries.length === 0) return <div className="panel-empty">No variables yet</div>;

  const fmt = (v) => {
    if (v === null || v === undefined) return 'null';
    if (typeof v === 'boolean') return String(v);
    if (typeof v === 'object') return v.__type ? `${v.__type}(ref)` : JSON.stringify(v);
    return String(v);
  };

  return (
    <table className="vars-table">
      <tbody>
        {entries.map(([name, info]) => {
          const isChanged = !!changed[name];
          return (
            <tr key={name} className={isChanged ? 'var-changed' : ''}>
              <td className="vn">{name}</td>
              <td className="vv">
                {isChanged && <span style={{color:'var(--txt3)',fontSize:10,marginRight:4}}>{fmt(changed[name].from)}→</span>}
                {fmt(info.value)}
              </td>
              <td className="vt">{info.type}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
