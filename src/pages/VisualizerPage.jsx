import { useState, useRef, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import StudioHeader from '../components/StudioHeader.jsx';
import CodeEditor from '../components/CodeEditor.jsx';
import VisualizerStudio from '../components/VisualizerStudio.jsx';
import BottomPanels from '../components/BottomPanels.jsx';
import ShowcaseSection from '../components/ShowcaseSection.jsx';
import { useTraceStore } from '../store/traceStore.js';

export default function VisualizerPage() {
  const { sidebarOpen, toggleSidebar } = useTraceStore();

  // 1. Horizontal Split: Code Editor % vs Visualizer Studio %
  const [editorPct, setEditorPct] = useState(() => {
    const saved = localStorage.getItem("trace_editor_pct");
    const parsed = Number(saved);
    return parsed >= 20 && parsed <= 80 ? parsed : 50;
  });

  // 2. Vertical Split: Upper workspace height (px)
  const [upperHeight, setUpperHeight] = useState(() => {
    const saved = localStorage.getItem("trace_upper_height");
    const parsed = Number(saved);
    return parsed >= 260 && parsed <= 850 ? parsed : 480;
  });

  // 3. Sidebar width (px)
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem("trace_sidebar_width");
    const parsed = Number(saved);
    return parsed >= 160 && parsed <= 380 ? parsed : 220;
  });

  const [isDraggingH, setIsDraggingH] = useState(false);
  const [isDraggingV, setIsDraggingV] = useState(false);
  const upperSplitRef = useRef(null);

  // Horizontal dragging between Code Editor and Visualizer
  const handleMouseDownH = useCallback((e) => {
    e.preventDefault();
    setIsDraggingH(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMouseMove = (moveEvent) => {
      if (!upperSplitRef.current) return;
      const rect = upperSplitRef.current.getBoundingClientRect();
      const relativeX = moveEvent.clientX - rect.left;
      let newPct = (relativeX / rect.width) * 100;
      if (newPct < 20) newPct = 20;
      if (newPct > 80) newPct = 80;
      setEditorPct(newPct);
      localStorage.setItem("trace_editor_pct", String(Math.round(newPct)));
    };

    const onMouseUp = () => {
      setIsDraggingH(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.dispatchEvent(new Event('resize'));
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, []);

  // Vertical dragging between Upper Split and Bottom Panels
  const handleMouseDownV = useCallback((e) => {
    e.preventDefault();
    setIsDraggingV(true);
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';

    const onMouseMove = (moveEvent) => {
      if (!upperSplitRef.current) return;
      const rect = upperSplitRef.current.getBoundingClientRect();
      let newHeight = moveEvent.clientY - rect.top;
      if (newHeight < 260) newHeight = 260;
      if (newHeight > 800) newHeight = 800;
      setUpperHeight(newHeight);
      localStorage.setItem("trace_upper_height", String(Math.round(newHeight)));
    };

    const onMouseUp = () => {
      setIsDraggingV(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.dispatchEvent(new Event('resize'));
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, []);

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

      {/* ── Left Sidebar (Resizable) ──────────────────────────── */}
      <Sidebar width={sidebarWidth} setWidth={setSidebarWidth} />

      {/* ── Center / Main Work Area ───────────────────────────── */}
      <main className="studio-main">
        {/* Top Header Action Bar with Tabs */}
        <StudioHeader />

        {/* Top Split: Editor on Left, Drag Handle, Visualizer on Right */}
        <div
          ref={upperSplitRef}
          className="studio-upper-split-resizable"
          style={{ height: upperHeight }}
        >
          <div
            className="editor-card-container"
            style={{ width: `calc(${editorPct}% - 5px)`, height: "100%" }}
          >
            <CodeEditor />
          </div>

          <div
            className={`split-resizer-h ${isDraggingH ? "dragging" : ""}`}
            onMouseDown={handleMouseDownH}
            title="Drag horizontally to resize Code Editor & Visualizer"
          />

          <div
            className="visualizer-card-container"
            style={{ width: `calc(${100 - editorPct}% - 5px)`, height: "100%" }}
          >
            <VisualizerStudio />
          </div>
        </div>

        {/* Vertical Resizer Handle between Upper Split & Bottom Panels */}
        <div
          className={`split-resizer-v ${isDraggingV ? "dragging" : ""}`}
          onMouseDown={handleMouseDownV}
          title="Drag vertically to adjust Editor/Visualizer height"
        />

        {/* Bottom 4 Modular Cards with column splitters */}
        <BottomPanels />

        {/* Bottom Showcase Section */}
        <ShowcaseSection />
      </main>
    </div>
  );
}
