
import { useTraceStore } from '../store/traceStore.js';

export default function InputPanel({ params = [], onLoadExample }) {
  const inputs   = useTraceStore(s => s.inputs);
  const setInput = useTraceStore(s => s.setInput);

  const fields = params.length > 0 ? params : [
    { name:'nums', placeholder:'e.g. [2,7,11,15]' },
    { name:'target', placeholder:'e.g. 9' },
  ];

  return (
    <div className="input-panel">
      <div className="ph">
        <span className="ph-title">Input</span>
      </div>
      <div className="input-body">
        {fields.map(f => (
          <div className="input-row" key={f.name}>
            <label className="input-label">{f.name}</label>
            <input
              className="input-field"
              placeholder={f.placeholder ?? `value for ${f.name}`}
              value={inputs[f.name] ?? ''}
              onChange={e => setInput(f.name, e.target.value)}
              spellCheck={false}
            />
          </div>
        ))}
      </div>
      <div className="input-actions">
        <button className="btn-sm" onClick={onLoadExample}>Load Example</button>
      </div>
    </div>
  );
}
