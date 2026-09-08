import { useTraceStore } from '../store/traceStore.js';

export default function BottomPanels() {
  const {
    inputText,
    setInputText,
    run,
    trace,
    currentStep,
    outputTab,
    setOutputTab,
    outputs,
    returnValue
  } = useTraceStore();

  const stepData = trace && trace[currentStep] ? trace[currentStep] : null;

  // Variables table data
  const varsObj = stepData?.variables || {
    self: { value: '<object>', type: 'Solution' },
    nums: { value: [2, 7, 11, 15], type: 'list' },
    target: { value: 9, type: 'int' },
    map: { value: { 2: 0 }, type: 'dict' },
    i: { value: 0, type: 'int' },
    complement: { value: 7, type: 'int' }
  };

  // Call stack data
  const callStack = stepData?.callStack || ['twoSum(nums, target)', '<module>', '<built-in>'];

  return (
    <div className="bottom-cards-grid">
      {/* ── 1. Input Panel ────────────────────────────────────── */}
      <div className="studio-card input-card">
        <div className="card-header-bar">
          <div className="card-title-group">
            <span className="card-main-title">Input</span>
            <span className="card-sub-title">stdin / function parameters</span>
          </div>
        </div>
        <div className="input-card-body">
          <textarea
            className="input-textarea"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            spellCheck={false}
          />
          <div className="input-action-row">
            <button className="btn-small-run" onClick={run}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Run
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. Variables Panel ────────────────────────────────── */}
      <div className="studio-card variables-card">
        <div className="card-header-bar">
          <span className="card-main-title">Variables</span>
        </div>
        <div className="card-scroll-body">
          <table className="vars-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(varsObj).map(([name, info]) => {
                let displayVal = typeof info.value === 'object' ? JSON.stringify(info.value) : String(info.value);
                if (displayVal && displayVal.startsWith('{')) {
                  // Format dict like {2: 0}
                  displayVal = displayVal.replace(/"/g, '');
                }
                return (
                  <tr key={name}>
                    <td className="var-name">{name}</td>
                    <td className="var-type">{info.type || 'var'}</td>
                    <td className="var-val">{displayVal}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 3. Call Stack Panel ───────────────────────────────── */}
      <div className="studio-card stack-card">
        <div className="card-header-bar">
          <span className="card-main-title">Call Stack</span>
        </div>
        <div className="card-scroll-body stack-frames-list">
          {callStack.map((frame, idx) => (
            <div
              key={idx}
              className={`stack-frame-item ${idx === 0 ? 'active-frame' : 'inactive-frame'}`}
            >
              {frame}
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. Output & Logs Panel ────────────────────────────── */}
      <div className="studio-card output-card">
        <div className="card-header-bar output-tabs-header">
          <button
            className={`out-tab-btn ${outputTab === 'output' ? 'active' : ''}`}
            onClick={() => setOutputTab('output')}
          >
            Output
          </button>
          <button
            className={`out-tab-btn ${outputTab === 'logs' ? 'active' : ''}`}
            onClick={() => setOutputTab('logs')}
          >
            Logs
          </button>
        </div>
        <div className="card-scroll-body terminal-body">
          {outputTab === 'output' ? (
            <div className="terminal-output-text">
              {outputs && outputs.length > 0 ? (
                outputs.map((out, idx) => (
                  <div key={idx} className="terminal-line">{out}</div>
                ))
              ) : returnValue !== undefined ? (
                <div className="terminal-line">{JSON.stringify(returnValue)}</div>
              ) : (
                <div className="terminal-empty">[0, 1]</div>
              )}
            </div>
          ) : (
            <div className="terminal-logs-text">
              <div className="log-line">Trace initialized successfully.</div>
              <div className="log-line">Memory allocated: 24MB</div>
              <div className="log-line">Execution finished in 4ms</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
