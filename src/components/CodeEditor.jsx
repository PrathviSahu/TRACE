import { useRef, useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { useTraceStore } from '../store/traceStore.js';

export default function CodeEditor() {
  const code        = useTraceStore(s => s.code);
  const setCode     = useTraceStore(s => s.setCode);
  const trace       = useTraceStore(s => s.trace);
  const currentStep = useTraceStore(s => s.currentStep);
  const language    = useTraceStore(s => s.language);
  const theme       = useTraceStore(s => s.theme);
  const editorRef    = useRef(null);
  const monacoRef    = useRef(null);
  const containerRef = useRef(null);
  const decoRef      = useRef([]);
  const [toastMsg, setToastMsg] = useState("");

  // Direct robust capture-phase shortcut handler for Cmd/Ctrl + A, C, X, V
  useEffect(() => {
    function handleCaptureKey(e) {
      if (!e.metaKey && !e.ctrlKey) return;
      const key = (e.key || "").toLowerCase();
      const code = e.code || "";
      const isA = key === "a" || code === "KeyA";
      const isC = key === "c" || code === "KeyC";
      const isX = key === "x" || code === "KeyX";

      if (!isA && !isC && !isX) return;

      const editor = editorRef.current;
      if (!editor) return;

      const active = document.activeElement;
      const wrapEl = containerRef.current;
      const isInside =
        (wrapEl && wrapEl.contains(active)) ||
        Boolean(active?.closest?.(".editor-wrap")) ||
        Boolean(active?.closest?.(".monaco-editor")) ||
        Boolean(active?.closest?.(".editor-card-container")) ||
        editor.hasTextFocus();

      if (!isInside) return;

      if (isA) {
        e.preventDefault();
        e.stopPropagation();
        const model = editor.getModel();
        if (model) {
          editor.focus();
          editor.setSelection(model.getFullModelRange());
          showEditorToast("All selected");
        }
      } else if (isC) {
        const selection = editor.getSelection();
        const model = editor.getModel();
        if (selection && model && !selection.isEmpty()) {
          const text = model.getValueInRange(selection);
          navigator.clipboard?.writeText?.(text);
          showEditorToast("Copied");
        }
      } else if (isX) {
        const selection = editor.getSelection();
        const model = editor.getModel();
        if (selection && model && !selection.isEmpty()) {
          e.preventDefault();
          e.stopPropagation();
          const text = model.getValueInRange(selection);
          navigator.clipboard?.writeText?.(text);
          editor.executeEdits("cut-shortcut", [{
            range: selection,
            text: "",
            forceMoveMarkers: true
          }]);
          editor.pushUndoStop();
          showEditorToast("Cut");
        }
      }
    }

    window.addEventListener("keydown", handleCaptureKey, true);
    return () => window.removeEventListener("keydown", handleCaptureKey, true);
  }, []);

  function showEditorToast(msg) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 1800);
  }

  function handleMount(editor, monaco) {
    editorRef.current  = editor;
    monacoRef.current  = monaco;

    // Define custom dark theme matching the design system
    monaco.editor.defineTheme('trace-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '626a75', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'ff9f43', fontStyle: 'bold' },
        { token: 'string', foreground: '38d9c5' },
        { token: 'number', foreground: 'ffb454' },
        { token: 'type', foreground: '38d9c5' },
        { token: 'identifier', foreground: 'f4f5f7' },
        { token: 'delimiter', foreground: '9aa1ab' },
      ],
      colors: {
        'editor.background': '#090b0e',
        'editor.foreground': '#f4f5f7',
        'editorLineNumber.foreground': '#626a75',
        'editorLineNumber.activeForeground': '#ff9f43',
        'editorGutter.background': '#090b0e',
        'editor.selectionBackground': '#264f78',
        'editor.inactiveSelectionBackground': '#3a3d41',
        'editor.selectionHighlightBackground': 'rgba(56, 217, 197, 0.25)',
        'editor.lineHighlightBackground': '#111419',
      }
    });
    monaco.editor.setTheme(theme === 'light' ? 'vs' : 'trace-dark');

    // ── 1. Explicit Select All Action (Context Menu + Ctrl/Cmd+A) ──
    editor.addAction({
      id: 'trace-select-all',
      label: 'Select All',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyA],
      contextMenuGroupId: '9_cutcopypaste',
      contextMenuOrder: 0.5,
      run: (ed) => {
        const model = ed.getModel();
        if (model) {
          ed.setSelection(model.getFullModelRange());
          ed.focus();
        }
      }
    });

    // ── 2. Explicit Cut Action (Context Menu + Ctrl/Cmd+X) ──
    editor.addAction({
      id: 'trace-cut',
      label: 'Cut',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyX],
      contextMenuGroupId: '9_cutcopypaste',
      contextMenuOrder: 1.0,
      run: async (ed) => {
        const selection = ed.getSelection();
        const model = ed.getModel();
        if (!selection || !model) return;

        let textToCut = '';
        let targetRange = selection;

        if (selection.isEmpty()) {
          const line = selection.startLineNumber;
          textToCut = model.getLineContent(line) + '\n';
          targetRange = new monaco.Range(line, 1, line + 1, 1);
        } else {
          textToCut = model.getValueInRange(selection);
        }

        if (textToCut) {
          try {
            if (navigator.clipboard?.writeText) {
              await navigator.clipboard.writeText(textToCut);
            } else {
              document.execCommand('copy');
            }
          } catch (_) {}

          ed.executeEdits('cut', [{
            range: targetRange,
            text: '',
            forceMoveMarkers: true
          }]);
          ed.pushUndoStop();
        }
      }
    });

    // ── 3. Explicit Copy Action (Context Menu + Ctrl/Cmd+C) ──
    editor.addAction({
      id: 'trace-copy',
      label: 'Copy',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyC],
      contextMenuGroupId: '9_cutcopypaste',
      contextMenuOrder: 1.5,
      run: async (ed) => {
        const selection = ed.getSelection();
        const model = ed.getModel();
        if (!selection || !model) return;

        let textToCopy = '';
        if (selection.isEmpty()) {
          const line = selection.startLineNumber;
          textToCopy = model.getLineContent(line);
        } else {
          textToCopy = model.getValueInRange(selection);
        }

        if (textToCopy) {
          try {
            if (navigator.clipboard?.writeText) {
              await navigator.clipboard.writeText(textToCopy);
            } else {
              document.execCommand('copy');
            }
          } catch (_) {}
        }
      }
    });

    // ── 4. Explicit Paste Action (Context Menu + Ctrl/Cmd+V) ──
    editor.addAction({
      id: 'trace-paste',
      label: 'Paste',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV],
      contextMenuGroupId: '9_cutcopypaste',
      contextMenuOrder: 2.0,
      run: async (ed) => {
        try {
          if (navigator.clipboard?.readText) {
            const clipText = await navigator.clipboard.readText();
            if (clipText) {
              const selection = ed.getSelection() || new monaco.Range(1, 1, 1, 1);
              ed.executeEdits('paste', [{
                range: selection,
                text: clipText,
                forceMoveMarkers: true
              }]);
              ed.pushUndoStop();
              return;
            }
          }
        } catch (_) {}
        ed.trigger('keyboard', 'editor.action.clipboardPasteAction', null);
      }
    });


  }

  // Switch Monaco theme on global theme toggle
  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(theme === "light" ? "vs" : "trace-dark");
    }
  }, [theme]);

  // Highlight the current executing line
  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;
    const step = trace && trace[currentStep] ? trace[currentStep] : null;
    if (!step) {
      editor.deltaDecorations(decoRef.current, []);
      decoRef.current = [];
      return;
    }
    const ln = step.line || 5;
    decoRef.current = editor.deltaDecorations(decoRef.current, [{
      range: new monaco.Range(ln, 1, ln, 1),
      options: {
        isWholeLine: true,
        className: 'editor-active-line',
        glyphMarginClassName: 'editor-glyph',
        overviewRuler: { color: '#ff9f43', position: monaco.editor.OverviewRulerLane.Left },
      },
    }]);
    editor.revealLineInCenterIfOutsideViewport(ln, monaco.editor.ScrollType.Smooth);
  }, [trace, currentStep]);

  // Toolbar Handlers
  function handleSelectAll() {
    const editor = editorRef.current;
    if (!editor) return;
    const model = editor.getModel();
    if (model) {
      editor.setSelection(model.getFullModelRange());
      editor.focus();
      showEditorToast("All selected");
    }
  }

  async function handleCut() {
    const editor = editorRef.current;
    if (!editor) return;
    const model = editor.getModel();
    const selection = editor.getSelection();
    if (!model || !selection) return;

    const targetRange = selection.isEmpty()
      ? model.getFullModelRange()
      : selection;

    const textToCut = model.getValueInRange(targetRange);
    if (!textToCut) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCut);
      } else {
        document.execCommand('copy');
      }
    } catch (_) {}

    editor.executeEdits('cut-toolbar', [{
      range: targetRange,
      text: '',
      forceMoveMarkers: true
    }]);
    editor.pushUndoStop();
    editor.focus();
    showEditorToast("Cut to clipboard");
  }

  async function handleCopy() {
    const editor = editorRef.current;
    if (!editor) return;
    const model = editor.getModel();
    const selection = editor.getSelection();
    if (!model || !selection) return;

    const textToCopy = selection.isEmpty()
      ? model.getValue()
      : model.getValueInRange(selection);

    if (!textToCopy) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        document.execCommand('copy');
      }
      showEditorToast("Copied to clipboard");
    } catch (_) {
      showEditorToast("Copy failed");
    }
  }

  async function handlePaste() {
    const editor = editorRef.current;
    if (!editor) return;
    try {
      if (navigator.clipboard?.readText) {
        const clipText = await navigator.clipboard.readText();
        if (clipText) {
          const selection = editor.getSelection() || new monacoRef.current.Range(1, 1, 1, 1);
          editor.executeEdits('paste-toolbar', [{
            range: selection,
            text: clipText,
            forceMoveMarkers: true
          }]);
          editor.pushUndoStop();
          editor.focus();
          showEditorToast("Pasted from clipboard");
          return;
        }
      }
    } catch (err) {
      console.warn("Clipboard read error, fallback to focus:", err);
    }
    editor.focus();
    editor.trigger('keyboard', 'editor.action.clipboardPasteAction', null);
    showEditorToast("Paste triggered (Ctrl+V / ⌘V)");
  }

  function handleClear() {
    const editor = editorRef.current;
    if (!editor) return;
    const model = editor.getModel();
    if (model) {
      editor.executeEdits('clear-toolbar', [{
        range: model.getFullModelRange(),
        text: '',
        forceMoveMarkers: true
      }]);
      editor.pushUndoStop();
      editor.focus();
      showEditorToast("Editor cleared");
    }
  }

  const lineCount = (code || '').split('\n').length;

  return (
    <div ref={containerRef} className="editor-wrap" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* ── Editor Action Header Toolbar ──────────────────────── */}
      <div className="editor-top-toolbar">
        <div className="editor-toolbar-left">
          <span className="editor-lang-badge">{language ? language.toUpperCase() : 'JAVA'}</span>
          <span className="editor-meta-text">{lineCount} line{lineCount === 1 ? '' : 's'}</span>
          {toastMsg && (
            <span className="editor-quick-toast">✓ {toastMsg}</span>
          )}
        </div>

        <div className="editor-toolbar-actions">
          <button
            type="button"
            className="editor-tool-btn"
            onClick={handleSelectAll}
            title="Select All (Ctrl+A / ⌘A)"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" strokeDasharray="4 3"/>
              <path d="M9 9h6v6H9z"/>
            </svg>
            <span>Select All</span>
          </button>

          <button
            type="button"
            className="editor-tool-btn"
            onClick={handleCut}
            title="Cut Selection or All (Ctrl+X / ⌘X)"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="6" cy="6" r="3"/>
              <circle cx="6" cy="18" r="3"/>
              <line x1="20" y1="4" x2="8.12" y2="15.88"/>
              <line x1="14.47" y1="14.48" x2="20" y2="20"/>
              <line x1="8.12" y1="8.12" x2="12" y2="12"/>
            </svg>
            <span>Cut</span>
          </button>

          <button
            type="button"
            className="editor-tool-btn"
            onClick={handleCopy}
            title="Copy Selection or All (Ctrl+C / ⌘C)"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            <span>Copy</span>
          </button>

          <button
            type="button"
            className="editor-tool-btn"
            onClick={handlePaste}
            title="Paste from Clipboard (Ctrl+V / ⌘V)"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
            </svg>
            <span>Paste</span>
          </button>

          <button
            type="button"
            className="editor-tool-btn editor-tool-clear"
            onClick={handleClear}
            title="Clear Code"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* ── Monaco Editor Canvas ──────────────────────────────── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <Editor
          language={language === 'python' ? 'python' : 'java'}
          value={code}
          onChange={v => setCode(v ?? '')}
          onMount={handleMount}
          theme={theme === 'light' ? 'vs' : 'trace-dark'}
          options={{
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontLigatures: true,
            lineNumbers: 'on',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'off',
            automaticLayout: true,
            padding: { top: 12, bottom: 12 },
            smoothScrolling: true,
            cursorSmoothCaretAnimation: 'on',
            renderLineHighlight: 'all',
            scrollbar: { verticalScrollbarSize: 5, horizontalScrollbarSize: 5 },
            contextmenu: true,
            quickSuggestions: true,
            formatOnPaste: false,
          }}
        />
      </div>

      <style>{`
        .editor-top-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 12px;
          background: var(--bg-raised, #111419);
          border-bottom: 1px solid var(--border-card, #21262d);
          min-height: 36px;
          flex-shrink: 0;
          user-select: none;
        }
        .editor-toolbar-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .editor-lang-badge {
          font-size: 10px;
          font-family: var(--font-mono, monospace);
          font-weight: 700;
          color: var(--accent-amber, #ff9f43);
          background: rgba(255, 159, 67, 0.12);
          border: 1px solid rgba(255, 159, 67, 0.3);
          padding: 2px 7px;
          border-radius: 4px;
          letter-spacing: 0.05em;
        }
        .editor-meta-text {
          font-size: 11px;
          font-family: var(--font-mono, monospace);
          color: var(--txt-dim, #6e7681);
        }
        .editor-quick-toast {
          font-size: 11px;
          font-family: var(--font-mono, monospace);
          color: var(--accent-cyan, #38d9c5);
          background: rgba(56, 217, 197, 0.12);
          border: 1px solid rgba(56, 217, 197, 0.3);
          padding: 1px 6px;
          border-radius: 3px;
          animation: fadeIn 0.2s ease;
        }
        .editor-toolbar-actions {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .editor-tool-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 7px;
          font-size: 10.5px;
          font-family: var(--font-mono, monospace);
          font-weight: 500;
          background: transparent;
          border: 1px solid var(--border-subtle, #21262d);
          color: var(--txt-main, #c9d1d9);
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .editor-tool-btn:hover {
          background: rgba(255, 255, 255, 0.06);
          color: var(--txt-bright, #f0f6fc);
          border-color: rgba(255, 255, 255, 0.2);
        }
        .editor-tool-btn:active {
          transform: scale(0.97);
        }
        .editor-tool-clear:hover {
          color: #ef4444;
          border-color: rgba(239, 68, 68, 0.4);
          background: rgba(239, 68, 68, 0.1);
        }
        .editor-active-line {
          background: rgba(99, 102, 241, 0.25) !important;
          border-left: 3px solid #6366f1 !important;
        }
        .editor-glyph::before {
          content: '▶';
          color: #818cf8;
          font-size: 10px;
        }
      `}</style>
    </div>
  );
}
