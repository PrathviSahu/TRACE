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
    returnValue,
    error,
    code,
    language
  } = useTraceStore();

  function handleAskAiHint(customPrompt) {
    const prompt = customPrompt || (error
      ? `I encountered an execution issue in TRACE running this ${language ? language.toUpperCase() : "Java"} code:\n\nError:\n${error}\n\nCode:\n\`\`\`${language || "java"}\n${code}\n\`\`\`\n\nPlease give me a clear, helpful hint on why this happened and how to fix it.`
      : `I am currently analyzing this ${language ? language.toUpperCase() : "Java"} algorithm in TRACE:\n\nCode:\n\`\`\`${language || "java"}\n${code}\n\`\`\`\n\nCurrent Step: ${currentStep + 1} of ${trace?.length || 1}.\nCan you provide a progressive hint or conceptual guidance on how to optimize or troubleshoot this algorithm?`);

    window.dispatchEvent(new CustomEvent("open-trace-brain", {
      detail: { prompt }
    }));
  }

  const stepData = trace && trace[currentStep] ? trace[currentStep] : null;

  // Variables table data - honest reflection of current step variables, zero fake demo data
  const varsObj = stepData?.variables || {};

  // Call stack data - honest reflection of current step call stack, zero fake frames
  const callStack = stepData?.callStack || [];

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
            placeholder={"e.g.\nnums = [2, 7, 11, 15]\ntarget = 9"}
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
              {Object.keys(varsObj).length > 0 ? (
                Object.entries(varsObj).map(([name, info]) => {
                  let displayVal;
                  if (info?.value === null) {
                    displayVal = 'null';
                  } else if (info?.value === undefined) {
                    displayVal = 'undefined';
                  } else if (typeof info?.value === 'object') {
                    if (info.value.__type) {
                      displayVal = info.value.__type + ' (ref)';
                    } else {
                      displayVal = JSON.stringify(info.value);
                    }
                  } else {
                    displayVal = String(info?.value);
                  }
                  if (displayVal && displayVal.startsWith('{') && !displayVal.includes('__type')) {
                    displayVal = displayVal.replace(/"/g, '');
                  }
                  return (
                    <tr key={name}>
                      <td className="var-name">{name}</td>
                      <td className="var-type">{info?.type || 'var'}</td>
                      <td className="var-val">{displayVal}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', opacity: 0.5, padding: '16px 8px' }}>
                    {trace && trace.length > 0 ? 'No variables in scope' : 'Run code to inspect variables'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 3. Call Stack Panel ───────────────────────────────── */}
      <div className="studio-card stack-card">
        <div className="card-header-bar" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span className="card-main-title">Call Stack</span>
          {callStack.length > 0 && (
            <span style={{ fontSize: 10, color: "var(--accent-amber)", fontFamily: "var(--font-mono)" }}>
              {callStack.length} frame{callStack.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div className="card-scroll-body stack-frames-list">
          {callStack.length > 0 ? (
            [...callStack].reverse().map((frame, idx) => {
              const isTop = idx === 0;
              return (
                <div
                  key={idx}
                  className={"stack-frame-item " + (isTop ? "active-frame" : "inactive-frame")}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
                >
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{frame}</span>
                  <span style={{ fontSize: 9, opacity: 0.7, marginLeft: 6 }}>
                    {isTop ? "ACTIVE" : "#" + (callStack.length - 1 - idx)}
                  </span>
                </div>
              );
            })
          ) : (
            <div style={{ fontSize: 12, opacity: 0.5, padding: "12px 8px", textAlign: "center" }}>
              {trace && trace.length > 0 ? "No active stack frames" : "Ready"}
            </div>
          )}
        </div>
      </div>

      {/* ── 4. Output & Logs Panel ────────────────────────────── */}
      <div className="studio-card output-card">
        <div className="card-header-bar output-tabs-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <button
              className={'out-tab-btn ' + (outputTab === 'output' ? 'active' : '')}
              onClick={() => setOutputTab('output')}
            >
              Output
            </button>
            <button
              className={'out-tab-btn ' + (outputTab === 'logs' ? 'active' : '')}
              onClick={() => setOutputTab('logs')}
            >
              Logs
            </button>
          </div>
          <button
            onClick={() => handleAskAiHint()}
            title="Ask AI Tutor for guidance or hints"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "2px 8px",
              background: "rgba(255, 159, 67, 0.1)",
              border: "1px solid rgba(255, 159, 67, 0.3)",
              color: "var(--accent-amber, #FF9F43)",
              borderRadius: 4,
              fontSize: 10,
              fontFamily: "var(--font-mono)",
              cursor: "pointer",
              fontWeight: 600
            }}
          >
            💡 AI Hint
          </button>
        </div>
        <div className="card-scroll-body terminal-body">
          {outputTab === 'output' ? (
            <div className="terminal-output-text">
              {error && (
                <div className="terminal-error-wrap" style={{ padding: "10px 14px", background: "rgba(239, 71, 67, 0.12)", border: "1px solid rgba(239, 71, 67, 0.35)", borderRadius: "var(--radius-sm, 6px)", marginBottom: 12 }}>
                  <div style={{ color: "#ef4743", fontWeight: 700, fontSize: 12, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                    <span>⚠️ Execution Error</span>
                  </div>
                  <div style={{ color: "var(--txt-bright, #F0F6FC)", fontFamily: "var(--font-mono)", fontSize: 11.5, marginBottom: 10, whiteSpace: "pre-wrap" }}>
                    {error}
                  </div>
                  <button
                    className="btn-ai-hint-fix"
                    onClick={() => handleAskAiHint()}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "5px 12px",
                      background: "rgba(255, 159, 67, 0.18)",
                      border: "1px solid var(--accent-amber, #FF9F43)",
                      color: "var(--accent-amber, #FF9F43)",
                      borderRadius: 4,
                      fontSize: 11,
                      fontFamily: "var(--font-mono)",
                      cursor: "pointer",
                      fontWeight: 700
                    }}
                  >
                    💡 Ask AI for a Hint & Fix
                  </button>
                </div>
              )}
              {outputs && outputs.length > 0 ? (
                outputs.map((out, idx) => (
                  <div key={idx} className="terminal-line">{out}</div>
                ))
              ) : returnValue !== undefined ? (
                <div className="terminal-line">{JSON.stringify(returnValue)}</div>
              ) : (
                <div className="terminal-empty" style={{ opacity: 0.5 }}>
                  {trace && trace.length > 0 ? 'No output generated' : 'Run program to view output'}
                </div>
              )}
            </div>
          ) : (
            <div className="terminal-logs-text">
              <div className="log-line">
                Execution status: {trace && trace.length > 0 ? (trace.length + ' steps recorded') : 'Ready'}
              </div>
              {stepData && (
                <div className="log-line">
                  Current step: {currentStep + 1} ({stepData.statement || stepData.type})
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}