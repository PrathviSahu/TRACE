import { useNavigate } from 'react-router-dom';
import { useTraceStore } from '../store/traceStore.js';
import { EXAMPLES } from '../engine/examples.js';

export default function WelcomeScreen({ onLoad }) {
  const navigate = useNavigate();
  const quick = EXAMPLES.slice(0, 6);

  return (
    <div className="welcome">
      <div>
        <div className="w-logo">TRACE<span>.</span></div>
        <div className="w-tag">"See your algorithm think."</div>
      </div>

      <div className="w-desc">
        Paste any Java LeetCode solution, provide inputs, and watch every step of execution — variables, pointer movements, arrays, conditions, and call stack in real-time.
      </div>

      <div className="w-btns">
        <button className="btn-primary" onClick={() => onLoad(EXAMPLES[0])}>
          ▶ Quick Demo: Two Sum
        </button>
        <button className="btn-outline" onClick={() => navigate('/problems')}>
          Browse 290 Roadmap Problems
        </button>
        <button className="btn-outline" onClick={() => navigate('/roadmap')}>
          DSA Roadmap
        </button>
      </div>

      <div className="ex-list">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <h4 style={{ margin: 0 }}>Quick Trace Presets</h4>
          <span style={{ fontSize: 11, color: 'var(--accent)', cursor: 'pointer' }} onClick={() => navigate('/problems')}>
            290 Problems Available →
          </span>
        </div>
        {quick.map(ex => (
          <div key={ex.id} className="ex-chip" onClick={() => onLoad(ex)}>
            <span className="ex-name">{ex.name}</span>
            <div className="ex-tags">
              <span className={`tag ${ex.difficulty}`}>{ex.difficulty}</span>
              <span className="tag">{ex.pattern}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
