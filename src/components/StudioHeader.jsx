import TraceLogo from './TraceLogo.jsx';
import { useState, useRef, useEffect } from 'react';
import { useTraceStore } from '../store/traceStore.js';

export default function StudioHeader() {
  const { activeTab, run, status, fetchLeetCodeProblem } = useTraceStore();
  const [toast, setToast] = useState(null);
  const [lcQuery, setLcQuery] = useState("");

  const toastRef = useRef(null);

  function showToast(msg) {
    if (toastRef.current) clearTimeout(toastRef.current);
    setToast(msg);
    toastRef.current = setTimeout(() => setToast(null), 2200);
  }

  useEffect(() => {
    return () => {
      if (toastRef.current) clearTimeout(toastRef.current);
    };
  }, []);

  function handleShare() {
    try {
      const state = useTraceStore.getState();
      const payload = {
        code: state.code,
        inputs: state.inputs,
        inputText: state.inputText,
        language: state.language,
        activeTab: state.activeTab,
        activeExampleId: state.activeExampleId
      };
      const json = JSON.stringify(payload);
      const b64 = btoa(encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode("0x" + p1)));
      const url = window.location.origin + window.location.pathname + "#share=" + b64;
      navigator.clipboard?.writeText?.(url);
      window.history.replaceState(null, "", "#share=" + b64);
      showToast("Shareable link with code & inputs copied!");
    } catch (_) {
      navigator.clipboard?.writeText?.(window.location.href);
      showToast("Link copied to clipboard");
    }
  }

  function handleGetHint() {
    const { code, language, currentStep, trace, error } = useTraceStore.getState();
    const prompt = error
      ? `I ran into an issue running this ${language.toUpperCase()} code in TRACE:\n\nError: ${error}\n\nCode:\n\`\`\`${language}\n${code}\n\`\`\`\n\nCan you give me a structured hint on what went wrong and how to fix it?`
      : `I am working on this algorithm in TRACE using ${language.toUpperCase()}.\n\nCode:\n\`\`\`${language}\n${code}\n\`\`\`\n\nI need a progressive hint to help me think about how to optimize or solve this without giving away the full code immediately. Can you guide me step by step?`;

    window.dispatchEvent(new CustomEvent("open-trace-brain", {
      detail: { prompt }
    }));
  }

  function handleSave() {
    try {
      const state = useTraceStore.getState();
      const snapshot = {
        activeTab: state.activeTab,
        activeExampleId: state.activeExampleId,
        language: state.language,
        code: state.code,
        inputText: state.inputText,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem('trace_workspace_snapshot', JSON.stringify(snapshot));
      showToast('Workspace saved locally');
    } catch (_) {
      showToast('Workspace snapshot saved');
    }
  }

  function handleTabClose(e) {
    e.stopPropagation();
    const { selectExample } = useTraceStore.getState();
    selectExample('two-sum');
    showToast('Reset to Two Sum');
  }

  return (
    <div className="studio-top-bar">
      {/* ── Tabs on the left ─────────────────────────────────── */}
      <div className="studio-tabs-row">
        <div className="studio-tab active-tab" title={"TRACE Problem: " + activeTab}>
          <TraceLogo size={14} />
          <span className="tab-title">{activeTab}</span>
          <span className="tab-close" title="Reset problem to default" onClick={handleTabClose}>✕</span>
        </div>
        <button className="tab-add-btn" title="Add new tab">+</button>
      </div>

      {/* ── LeetCode Quick Fetcher ───────────────────────────── */}
      <form
        className="lc-quick-fetch-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (!lcQuery.trim()) return;
          const found = fetchLeetCodeProblem(lcQuery);
          if (found) {
            showToast(`Loaded #${found.id}: ${found.name}`);
            setLcQuery("");
          } else {
            showToast(`LeetCode #${lcQuery} not found`);
          }
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginLeft: 12,
          marginRight: "auto"
        }}
      >
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <span style={{
            position: "absolute",
            left: 8,
            fontSize: 10,
            color: "var(--accent-amber, #FF9F43)",
            fontFamily: "var(--font-mono)",
            fontWeight: 700,
            pointerEvents: "none"
          }}>
            LC #
          </span>
          <input
            type="text"
            value={lcQuery}
            onChange={(e) => setLcQuery(e.target.value)}
            placeholder="e.g. 11, 1, 15"
            style={{
              padding: "4px 8px 4px 40px",
              width: 120,
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              background: "var(--bg-canvas)",
              border: "1px solid var(--border-card)",
              borderRadius: 6,
              color: "var(--txt-bright)",
              outline: "none"
            }}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: "4px 10px",
            fontSize: 11,
            fontFamily: "var(--font-mono)",
            fontWeight: 600,
            background: "rgba(255, 159, 67, 0.15)",
            border: "1px solid rgba(255, 159, 67, 0.4)",
            color: "var(--accent-amber, #FF9F43)",
            borderRadius: 6,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 4
          }}
          title="Fetch problem starter code and test cases by LeetCode number"
        >
          <span>Fetch</span>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </form>

      {/* ── Action Buttons on the right ──────────────────────── */}
      <div className="studio-actions-row" style={{ position: 'relative' }}>
        {toast && (
          <div style={{
            position: 'absolute',
            right: '100%',
            marginRight: '12px',
            padding: '4px 10px',
            background: 'var(--bg-raised)',
            border: '1px solid var(--accent-amber)',
            color: 'var(--accent-amber)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            animation: 'fadeIn 0.15s ease'
          }}>
            ✓ {toast}
          </div>
        )}
        <button className="studio-action-btn" onClick={handleShare}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          Share
        </button>

        <button
          className="studio-action-btn btn-ai-hint-studio"
          onClick={handleGetHint}
          title="Ask ARIA — your AI DSA tutor"
          style={{
            color: "var(--accent-amber)",
            borderColor: "rgba(255, 159, 67, 0.4)",
            background: "rgba(255, 159, 67, 0.08)"
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18h6" />
            <path d="M10 22h4" />
            <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z" />
          </svg>
          AI Hint
        </button>

        <button
          className="studio-action-btn"
          onClick={() => window.dispatchEvent(new CustomEvent('open-keyboard-shortcuts'))}
          title="Keyboard Shortcuts (?)"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M6 8h.001M10 8h.001M14 8h.001M18 8h.001M8 12h.001M12 12h.001M16 12h.001M7 16h10" />
          </svg>
          Shortcuts
        </button>

        <button className="studio-action-btn" onClick={handleSave}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          Save
        </button>

        <button
          className="btn-run-visualize"
          onClick={run}
          disabled={status === 'running'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          {status === 'running' ? 'Running...' : 'Run & Visualize'}
        </button>
      </div>
    </div>
  );
}
