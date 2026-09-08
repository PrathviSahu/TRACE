import { useTraceStore } from '../store/traceStore.js';

export default function StudioHeader() {
  const { activeTab, run, status } = useTraceStore();

  function handleShare() {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  }

  function handleSave() {
    alert('Solution saved to your workspace!');
  }

  return (
    <div className="studio-top-bar">
      {/* ── Tabs on the left ─────────────────────────────────── */}
      <div className="studio-tabs-row">
        <div className="studio-tab active-tab">
          <span className="tab-title">{activeTab}</span>
          <span className="tab-close">✕</span>
        </div>
        <button className="tab-add-btn" title="Add new tab">+</button>
      </div>

      {/* ── Action Buttons on the right ──────────────────────── */}
      <div className="studio-actions-row">
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
