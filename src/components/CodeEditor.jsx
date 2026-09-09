import { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useTraceStore } from '../store/traceStore.js';

export default function CodeEditor() {
  const code        = useTraceStore(s => s.code);
  const setCode     = useTraceStore(s => s.setCode);
  const trace       = useTraceStore(s => s.trace);
  const currentStep = useTraceStore(s => s.currentStep);
  const language    = useTraceStore(s => s.language);
  const theme       = useTraceStore(s => s.theme);
  const editorRef   = useRef(null);
  const monacoRef   = useRef(null);
  const decoRef     = useRef([]);

  function handleMount(editor, monaco) {
    editorRef.current  = editor;
    monacoRef.current  = monaco;

    // Define custom dark theme matching the screenshot
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
        'editor.selectionBackground': '#222831',
        'editor.lineHighlightBackground': '#111419',
      }
    });
    monaco.editor.setTheme(theme === 'light' ? 'vs' : 'trace-dark');

    // Prevent editor keys from leaking to outer window navigation shortcuts
    editor.onKeyDown((e) => {
      e.stopPropagation();
    });
  }

  // Switch Monaco theme on global theme toggle
  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(theme === "light" ? "vs" : "trace-dark");
    }
  }, [theme]);

  // highlight the current executing line
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

  return (
    <div className="editor-wrap">
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
        }}
      />
      <style>{`
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
