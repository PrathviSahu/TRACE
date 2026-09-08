import { useState } from 'react';
import { useTraceStore } from '../store/traceStore.js';
import { MULTI_LANG_EXAMPLES } from '../engine/multiLangExamples.js';

const CATEGORIES = [
  {
    id: 'arrays',
    name: 'Arrays',
    icon: '📊',
    problems: [
      { id: 'two-sum', name: 'Two Sum' },
      { id: 'running-sum', name: 'Running Sum' },
      { id: 'maximum-subarray', name: 'Maximum Subarray' },
    ]
  },
  { id: 'linked-list', name: 'Linked List', icon: '🔗', problems: [] },
  { id: 'stack', name: 'Stack', icon: '📚', problems: [] },
  { id: 'queue', name: 'Queue', icon: '📥', problems: [] },
  { id: 'hashmap', name: 'HashMap', icon: '🗂️', problems: [] },
  { id: 'binary-tree', name: 'Binary Tree', icon: '🌲', problems: [] },
  { id: 'graph', name: 'Graph', icon: '🕸️', problems: [] },
  { id: 'dp', name: 'Dynamic Programming', icon: '⚡', problems: [] },
  { id: 'sorting', name: 'Sorting', icon: '📶', problems: [] },
  { id: 'recursion', name: 'Recursion', icon: '🔄', problems: [] },
];

export default function Sidebar() {
  const { language, setLanguage, activeExampleId, selectExample } = useTraceStore();
  const [openCategories, setOpenCategories] = useState({ arrays: true });
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  function toggleCategory(catId) {
    setOpenCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
  }

  return (
    <aside className="sidebar">
      {/* ── Language Selector ─────────────────────────────────── */}
      <div className="sidebar-section">
        <label className="sidebar-label">Language</label>
        <div className="lang-select-box" onClick={() => setLangDropdownOpen(!langDropdownOpen)}>
          <div className="lang-active-display">
            {language === 'python' ? (
              <>
                <span className="lang-icon py-icon">🐍</span>
                <span className="lang-name">Python</span>
              </>
            ) : language === 'java' ? (
              <>
                <span className="lang-icon java-icon">☕</span>
                <span className="lang-name">Java</span>
              </>
            ) : (
              <>
                <span className="lang-icon cpp-icon">⚡</span>
                <span className="lang-name">C++</span>
              </>
            )}
          </div>
          <span className="chevron-icon">{langDropdownOpen ? '▴' : '▾'}</span>

          {langDropdownOpen && (
            <div className="lang-dropdown-menu">
              <div
                className={`lang-option ${language === 'python' ? 'active' : ''}`}
                onClick={(e) => { e.stopPropagation(); setLanguage('python'); setLangDropdownOpen(false); }}
              >
                <span>🐍 Python</span>
              </div>
              <div
                className={`lang-option ${language === 'java' ? 'active' : ''}`}
                onClick={(e) => { e.stopPropagation(); setLanguage('java'); setLangDropdownOpen(false); }}
              >
                <span>☕ Java</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── New File Button ───────────────────────────────────── */}
      <button className="btn-new-file" onClick={() => selectExample('two-sum')}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        New File
      </button>

      {/* ── Examples Tree ─────────────────────────────────────── */}
      <div className="sidebar-tree">
        <div className="tree-header">Examples</div>
        {CATEGORIES.map(cat => {
          const isOpen = !!openCategories[cat.id];
          return (
            <div key={cat.id} className="tree-node">
              <div className="tree-category-row" onClick={() => toggleCategory(cat.id)}>
                <span className="tree-arrow">{isOpen ? '▾' : '▸'}</span>
                <svg className="folder-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
                <span className="tree-cat-title">{cat.name}</span>
              </div>

              {isOpen && cat.problems.length > 0 && (
                <div className="tree-children">
                  {cat.problems.map(prob => {
                    const isActive = activeExampleId === prob.id;
                    return (
                      <div
                        key={prob.id}
                        className={`tree-leaf ${isActive ? 'active-leaf' : ''}`}
                        onClick={() => selectExample(prob.id)}
                      >
                        <span className="leaf-dot" />
                        <span className="leaf-name">{prob.name}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Bottom Pro Card ───────────────────────────────────── */}
      <div className="sidebar-footer-card">
        <div className="crown-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5m14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
          </svg>
        </div>
        <div className="card-info">
          <div className="card-title">Keep Learning</div>
          <div className="card-sub">Small steps. Big Tech.</div>
        </div>
      </div>
    </aside>
  );
}
