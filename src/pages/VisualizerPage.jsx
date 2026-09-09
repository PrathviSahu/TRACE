import Sidebar from '../components/Sidebar.jsx';
import StudioHeader from '../components/StudioHeader.jsx';
import CodeEditor from '../components/CodeEditor.jsx';
import VisualizerStudio from '../components/VisualizerStudio.jsx';
import BottomPanels from '../components/BottomPanels.jsx';
import ShowcaseSection from '../components/ShowcaseSection.jsx';
import { useTraceStore } from '../store/traceStore.js';

export default function VisualizerPage() {
  const { sidebarOpen, toggleSidebar } = useTraceStore();

  return (
    <div className="studio-layout" style={{ position: "relative" }}>
      {/* ── Floating edge expander when sidebar is collapsed ── */}
      {!sidebarOpen && (
        <button
          type="button"
          className="sidebar-edge-expand-btn"
          onClick={toggleSidebar}
          title="Show sidebar (Ctrl+B)"
          aria-label="Expand sidebar"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}

      {/* ── Left Sidebar ──────────────────────────────────────── */}
      <Sidebar />

      {/* ── Center / Main Work Area ───────────────────────────── */}
      <main className="studio-main">
        {/* Top Header Action Bar with Tabs */}
        <StudioHeader />

        {/* Top Split: Editor on Left, Visualizer on Right */}
        <div className="studio-upper-split">
          <div className="editor-card-container">
            <CodeEditor />
          </div>
          <div className="visualizer-card-container">
            <VisualizerStudio />
          </div>
        </div>

        {/* Bottom 4 Modular Cards: Input, Variables, Call Stack, Output */}
        <BottomPanels />

        {/* Bottom Showcase Section: "Visualize. Understand. Master." */}
        <ShowcaseSection />
      </main>
    </div>
  );
}
