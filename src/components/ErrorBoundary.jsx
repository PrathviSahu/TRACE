import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an unhandled error:", error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.removeItem("trace_state");
    } catch (_) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--bg-canvas, #0a0f1d)",
            color: "var(--txt-bright, #f8fafc)",
            fontFamily: "var(--font-sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)",
            padding: "24px"
          }}
        >
          <div
            style={{
              maxWidth: "520px",
              width: "100%",
              background: "var(--bg-card, #131b2e)",
              border: "1px solid var(--border-card, #1c2842)",
              borderRadius: "14px",
              padding: "32px",
              boxShadow: "0 24px 48px rgba(0, 0, 0, 0.5)",
              textAlign: "center"
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                margin: "0 auto 18px",
                background: "rgba(255, 159, 67, 0.12)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "26px",
                border: "1px solid rgba(255, 159, 67, 0.3)"
              }}
            >
              ⚠️
            </div>

            <h2
              style={{
                margin: "0 0 8px",
                fontSize: "20px",
                fontWeight: 700,
                color: "var(--txt-bright, #f8fafc)"
              }}
            >
              Something went wrong
            </h2>

            <p
              style={{
                margin: "0 0 20px",
                fontSize: "13px",
                color: "var(--txt-muted, #94a3b8)",
                lineHeight: 1.5
              }}
            >
              TRACE encountered an unexpected rendering error. Your code and workspace
              state are preserved in your browser storage.
            </p>

            {this.state.error && (
              <div
                style={{
                  background: "var(--bg-canvas, #080c16)",
                  border: "1px solid var(--border-subtle, #1c2842)",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  textAlign: "left",
                  fontSize: "11px",
                  fontFamily: "var(--font-mono, monospace)",
                  color: "#ef4444",
                  overflowX: "auto",
                  marginBottom: "24px",
                  maxHeight: "100px"
                }}
              >
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: "8px 18px",
                  fontSize: "13px",
                  fontWeight: 600,
                  background: "var(--accent-cyan, #00d2d3)",
                  color: "#0a0f1d",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer"
                }}
              >
                Reload Page
              </button>
              <button
                onClick={this.handleReset}
                style={{
                  padding: "8px 18px",
                  fontSize: "13px",
                  fontWeight: 500,
                  background: "transparent",
                  color: "var(--txt-normal, #94a3b8)",
                  border: "1px solid var(--border-card, #1c2842)",
                  borderRadius: "8px",
                  cursor: "pointer"
                }}
              >
                Reset & Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
