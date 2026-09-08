// ─────────────────────────────────────────────────────────────
//  TRACE — Interview Execution Panel
//  Phase 3.4: Monaco Editor + Execution Adapter + Output Tabs
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import Editor from "@monaco-editor/react";

const SUPPORTED_LANGS = [
  { id: "java", label: "Java 17 (Executable)", monaco: "java", isExecutable: true },
  { id: "python", label: "Python 3 (Executable)", monaco: "python", isExecutable: true },
  { id: "cpp", label: "C++ 20 (Editor only)", monaco: "cpp", isExecutable: false },
  { id: "javascript", label: "JavaScript (Editor only)", monaco: "javascript", isExecutable: false },
  { id: "c", label: "C (Editor only)", monaco: "c", isExecutable: false },
];

import { PROBLEM_DESCRIPTIONS } from "../../data/problemDescriptions.js";

export default function InterviewExecutionPanel({
  session,
  code,
  language,
  onCodeChange,
  onChangeCode,
  onLanguageChange,
  onChangeLanguage,
  onExecute,
  isExecuting,
  isReadOnly,
  readOnly,
  testCases = [],
  evidence = null
}) {
  const handleCodeChange = onCodeChange || onChangeCode;
  const handleLanguageChange = onLanguageChange || onChangeLanguage;
  const readOnlyMode = Boolean(isReadOnly || readOnly);
  const currentEvidence = evidence || session?.executionEvidence || null;
  const problemDesc = PROBLEM_DESCRIPTIONS[session?.problemId] || null;
  const effectiveTestCases = testCases.length > 0
    ? testCases
    : (problemDesc?.examples?.map((ex, idx) => ({
        id: idx + 1,
        input: ex.input,
        expectedOutput: ex.output,
      })) || []);
  const [activeTab, setActiveTab] = useState("tests"); // "tests" | "output"
  const selectedLangObj = SUPPORTED_LANGS.find(l => l.id === language) || SUPPORTED_LANGS[0];

  const hasExecuted = !!currentEvidence;
  const passedCount = currentEvidence?.passedTests ?? 0;
  const totalCount = currentEvidence?.totalTests ?? (testCases?.length || 0);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      background: "#080c14",
      borderRadius: "8px",
      border: "1px solid #162035",
      overflow: "hidden"
    }}>
      {/* Editor Header Bar */}
      <div style={{
        padding: "0.6rem 1rem",
        background: "#0d1322",
        borderBottom: "1px solid #162035",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--txt-bright, #f8fafc)" }}>
            Candidate Solution
          </span>
          <select
            value={language}
            onChange={(e) => onLanguageChange && handleLanguageChange && handleLanguageChange(e.target.value)}
            disabled={readOnlyMode}
            style={{
              background: "#141e33",
              border: "1px solid #1c2842",
              color: "var(--txt-bright, #f8fafc)",
              padding: "0.25rem 0.6rem",
              borderRadius: "4px",
              fontSize: "0.78rem",
              fontWeight: 600,
              cursor: readOnlyMode ? "not-allowed" : "pointer"
            }}
          >
            {SUPPORTED_LANGS.map(l => (
              <option key={l.id} value={l.id}>{l.label}</option>
            ))}
          </select>
          {isReadOnly && (
            <span style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              color: "#ef4743",
              background: "rgba(239, 71, 67, 0.15)",
              padding: "0.15rem 0.45rem",
              borderRadius: "4px",
              border: "1px solid rgba(239, 71, 67, 0.3)"
            }}>
              🔒 Read-Only (Submitted)
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {!selectedLangObj.isExecutable && (
            <span style={{
              fontSize: "0.72rem",
              fontWeight: 600,
              color: "#fbbf24",
              background: "rgba(245, 158, 11, 0.12)",
              padding: "0.2rem 0.5rem",
              borderRadius: "4px",
              border: "1px solid rgba(245, 158, 11, 0.3)"
            }}>
              ⚠️ Editor Only • Java/Python Executable
            </span>
          )}
          <button
            type="button"
            onClick={onExecute}
            disabled={isExecuting || readOnlyMode || !selectedLangObj.isExecutable}
            style={{
              padding: "0.4rem 0.9rem",
              borderRadius: "6px",
              border: "1px solid var(--accent-indigo, #6366f1)",
              background: isExecuting ? "#141e33" : "rgba(99, 102, 241, 0.2)",
              color: "var(--txt-bright, #f8fafc)",
              fontSize: "0.8rem",
              fontWeight: 700,
              cursor: (isExecuting || readOnlyMode) ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem"
            }}
            title="Run code against verification test cases (Ctrl + Enter)"
          >
            <span>{isExecuting ? "⏳" : "▶"}</span>
            <span>{isExecuting ? "Running Tests..." : "Run & Test"}</span>
            <span style={{ fontSize: "0.68rem", opacity: 0.6 }}>[Ctrl+Enter]</span>
          </button>
        </div>
      </div>

      {/* Monaco Editor Container */}
      <div style={{ flex: "1 1 55%", minHeight: "220px", position: "relative" }}>
        <Editor
          height="100%"
          language={selectedLangObj.monaco}
          theme="vs-dark"
          value={code || ""}
          onChange={(val) => onCodeChange && handleCodeChange && handleCodeChange(val || "")}
          options={{
            readOnly: readOnlyMode,
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            wordWrap: "on",
            fontFamily: '"Fira Code", Consolas, monospace'
          }}
        />
      </div>

      {/* Execution Results & Output Bottom Half */}
      <div style={{
        flex: "1 1 45%",
        minHeight: "180px",
        background: "#0b101c",
        borderTop: "1px solid #162035",
        display: "flex",
        flexDirection: "column"
      }}>
        {/* Output Header Tabs */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 1rem",
          background: "#0d1322",
          borderBottom: "1px solid #162035",
          height: "36px"
        }}>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="button"
              onClick={() => setActiveTab("tests")}
              style={{
                background: "transparent",
                border: "none",
                borderBottom: activeTab === "tests" ? "2px solid var(--accent-cyan, #38bdf8)" : "2px solid transparent",
                color: activeTab === "tests" ? "var(--txt-bright, #f8fafc)" : "var(--txt-muted, #94a3b8)",
                fontSize: "0.78rem",
                fontWeight: 600,
                padding: "0.45rem 0.6rem",
                cursor: "pointer"
              }}
            >
              Test Cases ({hasExecuted ? `${passedCount}/${totalCount}` : totalCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("output")}
              style={{
                background: "transparent",
                border: "none",
                borderBottom: activeTab === "output" ? "2px solid var(--accent-cyan, #38bdf8)" : "2px solid transparent",
                color: activeTab === "output" ? "var(--txt-bright, #f8fafc)" : "var(--txt-muted, #94a3b8)",
                fontSize: "0.78rem",
                fontWeight: 600,
                padding: "0.45rem 0.6rem",
                cursor: "pointer"
              }}
            >
              Console Output
            </button>
          </div>

          {hasExecuted && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem" }}>
              <span style={{
                color: currentEvidence.passed ? "var(--accent-green, #10b981)" : "#ef4743",
                fontWeight: 700
              }}>
                {currentEvidence.passed ? "✓ All Passed" : "✗ Tests Failed"}
              </span>
              {currentEvidence.executionDurationMs != null && (
                <span style={{ color: "var(--txt-dim, #64748b)" }}>
                  ({currentEvidence.executionDurationMs}ms)
                </span>
              )}
            </div>
          )}
        </div>

        {/* Tab Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0.75rem 1rem" }}>
          {activeTab === "tests" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {effectiveTestCases.length === 0 ? (
                <div style={{ fontSize: "0.8rem", color: "var(--txt-dim, #64748b)" }}>
                  No pre-configured test cases. Click "Run & Test" to execute.
                </div>
              ) : (
                effectiveTestCases.map((tc, idx) => {
                  const testRes = currentEvidence?.testResults?.[idx];
                  const hasRun = !!testRes;
                  const isPassed = testRes?.passed;

                  return (
                    <div
                      key={tc.id || idx}
                      style={{
                        padding: "0.5rem 0.75rem",
                        borderRadius: "6px",
                        background: hasRun
                          ? (isPassed ? "rgba(16, 185, 129, 0.08)" : "rgba(239, 71, 67, 0.08)")
                          : "#101626",
                        border: hasRun
                          ? (isPassed ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(239, 71, 67, 0.3)")
                          : "1px solid #162035",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.3rem"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--txt-muted, #94a3b8)" }}>
                          Test Case #{idx + 1}
                        </span>
                        {hasRun && (
                          <span style={{
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            color: isPassed ? "var(--accent-green, #10b981)" : "#ef4743"
                          }}>
                            {isPassed ? "PASSED" : "FAILED"}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: "0.75rem", fontFamily: "monospace", color: "var(--txt-dim, #64748b)" }}>
                        Input: <span style={{ color: "var(--txt-bright, #f8fafc)" }}>{tc.input}</span>
                      </div>
                      <div style={{ fontSize: "0.75rem", fontFamily: "monospace", color: "var(--txt-dim, #64748b)" }}>
                        Expected: <span style={{ color: "var(--accent-green, #10b981)" }}>{tc.expectedOutput}</span>
                      </div>
                      {hasRun && testRes.actualOutput && (
                        <div style={{ fontSize: "0.75rem", fontFamily: "monospace", color: "var(--txt-dim, #64748b)" }}>
                          Actual: <span style={{ color: isPassed ? "var(--accent-green, #10b981)" : "#ef4743" }}>{testRes.actualOutput}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <pre style={{
              margin: 0,
              fontSize: "0.75rem",
              fontFamily: "monospace",
              color: currentEvidence?.compileError || currentEvidence?.runtimeError ? "#ef4743" : "var(--txt-muted, #94a3b8)",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word"
            }}>
              {currentEvidence?.compileError ? ("Compile Error:\n" + currentEvidence.compileError) : ""}
              {currentEvidence?.runtimeError ? ("Runtime Error:\n" + currentEvidence.runtimeError) : ""}
              {currentEvidence?.output && currentEvidence.output.length > 0
                ? currentEvidence.output.join("\n")
                : (hasExecuted ? "No standard output." : "Execution output will appear here.")}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
