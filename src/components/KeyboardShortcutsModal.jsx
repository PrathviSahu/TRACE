import React, { useEffect } from "react";

export default function KeyboardShortcutsModal({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcuts = [
    { key: "→", label: "Step Forward", desc: "Advance to the next execution step" },
    { key: "←", label: "Step Backward", desc: "Rewind to the previous execution step" },
    { key: "Space", label: "Play / Pause", desc: "Toggle automated continuous execution" },
    { key: "R", label: "Reset", desc: "Restart execution from step 1" },
    { key: "Home", label: "Jump to Start", desc: "Go immediately to the first step" },
    { key: "End", label: "Jump to End", desc: "Go immediately to the final step" },
    { key: "?", label: "Toggle Shortcuts", desc: "Open or close this helper dialog" },
    { key: "Esc", label: "Close Modal", desc: "Dismiss open dialog or shortcuts" }
  ];

  return (
    <div
      className="shortcuts-modal-overlay"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999,
        padding: "16px"
      }}
    >
      <div
        className="shortcuts-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "480px",
          background: "var(--bg-card, #131b2e)",
          border: "1px solid var(--border-subtle, #1c2842)",
          borderRadius: "12px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
          color: "var(--txt-normal, #94a3b8)",
          fontFamily: "var(--font-sans, inherit)",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-subtle, #1c2842)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "18px" }}>⌨️</span>
            <div>
              <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "var(--txt-bright, #f8fafc)" }}>
                Keyboard Shortcuts
              </h3>
              <p style={{ margin: 0, fontSize: "11px", color: "var(--txt-muted, #64748b)" }}>
                Hotkeys active when editor is not focused
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--txt-muted, #64748b)",
              fontSize: "16px",
              cursor: "pointer",
              padding: "4px 8px",
              borderRadius: "4px"
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "10px" }}>
          {shortcuts.map(({ key, label, desc }) => (
            <div
              key={key}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "6px 8px",
                borderRadius: "6px",
                background: "var(--bg-canvas, rgba(0, 0, 0, 0.2))"
              }}
            >
              <div>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--txt-bright, #f8fafc)" }}>
                  {label}
                </span>
                <span style={{ display: "block", fontSize: "10px", color: "var(--txt-muted, #64748b)" }}>
                  {desc}
                </span>
              </div>
              <kbd
                style={{
                  padding: "3px 8px",
                  fontSize: "11px",
                  fontFamily: "var(--font-mono, monospace)",
                  fontWeight: 600,
                  color: "var(--accent-amber, #FF9F43)",
                  background: "var(--bg-raised, #1c2842)",
                  border: "1px solid var(--border-subtle, #283756)",
                  borderRadius: "5px",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.2)"
                }}
              >
                {key}
              </kbd>
            </div>
          ))}
        </div>

        <div
          style={{
            padding: "12px 20px",
            background: "var(--bg-canvas, rgba(0, 0, 0, 0.2))",
            borderTop: "1px solid var(--border-subtle, #1c2842)",
            display: "flex",
            justifyContent: "flex-end"
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "6px 14px",
              fontSize: "12px",
              fontWeight: 500,
              background: "var(--accent-cyan, #00d2d3)",
              color: "#0a0f1d",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
