import MatrixVisualizer from './MatrixVisualizer.jsx';
import { useEffect, useState, useMemo } from "react";
import KeyboardShortcutsModal from "./KeyboardShortcutsModal.jsx";
import { useTraceStore } from "../store/traceStore.js";
import { normalizeStepData, formatObjectTree } from "../utils/visualizerAdapter.js";
import DryRunView from "./DryRunView.jsx";
import CodeFlowView from "./CodeFlowView.jsx";
import {
  DiagrammaticStack,
  DiagrammaticQueue,
  DiagrammaticLinkedList,
  DiagrammaticBinaryTree,
  DiagrammaticPriorityQueue,
  DiagrammaticBarHeights,
  DiagrammaticHashSet,
  DiagrammaticHashMap,
  DiagrammaticSlidingWindow
} from "./DiagrammaticVisualizers.jsx";

export default function VisualizerStudio() {
  const [arrayViewModes, setArrayViewModes] = useState({});
  const [showShortcuts, setShowShortcuts] = useState(false);

  useEffect(() => {
    function handleOpenShortcuts() {
      setShowShortcuts(true);
    }
    window.addEventListener("open-keyboard-shortcuts", handleOpenShortcuts);
    return () => window.removeEventListener("open-keyboard-shortcuts", handleOpenShortcuts);
  }, []);
  const {
    viewMode,
    setViewMode,
    trace,
    currentStep,
    activeTab,
    next,
    prev,
    first,
    last,
    reset,
    play,
    isPlaying,
    goToStep
  } = useTraceStore();

  // Reset per-array view modes whenever a new problem/example is loaded
  // so bar-diagram selection from one problem doesn't bleed into the next
  useEffect(() => {
    setArrayViewModes({});
  }, [activeTab, trace?.length]);

  const totalSteps = trace ? trace.length : 0;
  const currentStepNum = totalSteps > 0 ? currentStep + 1 : 0;
  const stepData = trace && trace[currentStep] ? trace[currentStep] : null;
  const prevStepData = trace && currentStep > 0 ? trace[currentStep - 1] : null;

  // Normalized visualizer state derived directly from engine trace (memoized)
  const normalized = useMemo(
    () => normalizeStepData(stepData, prevStepData),
    [stepData, prevStepData]
  );
  const { hasData, slidingWindow, arrays, collections, objects, variables, callStack, explanation } = normalized;

  // Global keyboard navigation (only when NOT focused in any code editor or input field)
  useEffect(() => {
    function isEditable(el) {
      if (!el) return false;
      const tag = el.tagName;
      return (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        el.isContentEditable ||
        Boolean(el.closest?.(".monaco-editor")) ||
        Boolean(el.closest?.(".editor-card-container")) ||
        Boolean(el.closest?.(".editor-wrap")) ||
        Boolean(el.closest?.("[contenteditable='true']"))
      );
    }

    function onKeyDown(e) {
      if (isEditable(e.target) || isEditable(document.activeElement)) {
        return;
      }
      if (e.key === "ArrowRight") { e.preventDefault(); next(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
      if (e.key === "Home") { e.preventDefault(); if (first) first(); }
      if (e.key === "End") { e.preventDefault(); if (last) last(); }
      if (e.key === " ") { e.preventDefault(); play(); }
      if (e.key === "r" || e.key === "R") { e.preventDefault(); if (reset) reset(); }
      if (e.key === "?" || (e.shiftKey && e.key === "/")) { e.preventDefault(); setShowShortcuts(prev => !prev); }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [next, prev, first, last, play, reset]);

  return (
    <div className="viz-studio-card">
      {/* ── Top View Mode Tabs ────────────────────────────────── */}
      <div className="viz-tabs-row">
        <button
          className={`viz-tab-btn ${viewMode === "visualization" ? "active" : ""}`}
          onClick={() => setViewMode("visualization")}
        >
          Visualization
        </button>
        <button
          className={`viz-tab-btn ${viewMode === "dry-run" ? "active" : ""}`}
          onClick={() => setViewMode("dry-run")}
        >
          Dry Run
        </button>
        <button
          className={`viz-tab-btn ${viewMode === "code-flow" ? "active" : ""}`}
          onClick={() => setViewMode("code-flow")}
        >
          Code Flow
        </button>
      </div>

      {/* ── Execution Controls Bar ────────────────────────────── */}
      <div className="viz-controls-row">
        <div className="step-counter-group" style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 110 }}>
          <div className="step-counter-badge">
            Step {currentStepNum} of {totalSteps}
          </div>
          <div
            className="trace-progress-track"
            title={`Step ${currentStepNum} of ${totalSteps} (${totalSteps > 0 ? Math.round((currentStepNum / totalSteps) * 100) : 0}%)`}
          >
            <div
              className="trace-progress-fill"
              style={{
                width: `${totalSteps > 0 ? (currentStepNum / totalSteps) * 100 : 0}%`
              }}
            />
          </div>
        </div>

        <div className="playback-btns">
          <button
            className="ctrl-icon-btn"
            onClick={first}
            disabled={currentStep <= 0}
            title="First step (Home)"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <rect x="3" y="4" width="3" height="16" />
              <polygon points="21 19 9 12 21 5 21 19" />
            </svg>
          </button>

          <button
            className="ctrl-icon-btn"
            onClick={prev}
            disabled={currentStep <= 0}
            title="Previous step (←)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="11 19 2 12 11 5 11 19" />
              <polygon points="22 19 13 12 22 5 22 19" />
            </svg>
          </button>

          <button
            className="play-pause-btn"
            onClick={play}
            title={isPlaying ? "Pause execution (Space)" : "Play execution (Space)"}
          >
            {isPlaying ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            )}
          </button>

          <button
            className="ctrl-icon-btn"
            onClick={next}
            disabled={totalSteps === 0 || currentStep >= totalSteps - 1}
            title="Next step (→)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="13 19 22 12 13 5 13 19" />
              <polygon points="2 19 11 12 2 5 2 19" />
            </svg>
          </button>

          <button
            className="ctrl-icon-btn"
            onClick={last}
            disabled={totalSteps === 0 || currentStep >= totalSteps - 1}
            title="Last step (End)"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="3 19 15 12 3 5 3 19" />
              <rect x="18" y="4" width="3" height="16" />
            </svg>
          </button>

          <button
            className="ctrl-icon-btn"
            onClick={reset}
            disabled={totalSteps === 0}
            title="Reset (R)"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0020 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 004 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
            </svg>
          </button>
        </div>

        <div className="timeline-slider-box">
          <input
            type="range"
            min="0"
            max={Math.max(0, totalSteps - 1)}
            value={currentStep}
            onChange={(e) => goToStep(Number(e.target.value))}
            className="timeline-range-input"
          />
        </div>
      </div>

      {/* ── Main Visualization Body ──────────────────────────── */}
      {viewMode === "dry-run" && (
        <DryRunView
          trace={trace}
          currentStep={currentStep}
          goToStep={goToStep}
        />
      )}

      {viewMode === "code-flow" && (
        <CodeFlowView
          trace={trace}
          currentStep={currentStep}
          goToStep={goToStep}
          code={useTraceStore.getState().code}
        />
      )}

      {viewMode === "visualization" && (
        <div className="viz-body-split">
        {/* Left Canvas: Data Structures */}
        <div className="ds-canvas">
          {hasData || (callStack && callStack.length > 0) ? (
            <>
              {/* 0. Sliding Window Ribbon Visualizer */}
              {slidingWindow && (
                <DiagrammaticSlidingWindow
                  name={slidingWindow.seqName}
                  type={slidingWindow.seqType === "string" ? "String" : "Array"}
                  items={slidingWindow.seqItems}
                  leftIndex={slidingWindow.leftIdx}
                  rightIndex={slidingWindow.rightIdx}
                  leftName={slidingWindow.leftPtr?.name || "left"}
                  rightName={slidingWindow.rightPtr?.name || "right"}
                  windowString={slidingWindow.windowStr}
                  windowLength={slidingWindow.windowLen}
                  frequency={slidingWindow.windowFreq}
                  k={slidingWindow.kVal}
                  maxCount={slidingWindow.maxCountVal}
                  maxLen={slidingWindow.maxLenVal}
                  isValid={slidingWindow.isValid}
                  statusText={slidingWindow.statusText}
                />
              )}

              {/* 1. Arrays (with Diagrammatic Bar Heights option and 2D Matrix support) */}
              {arrays.map((arr) => {
                const is2D = Array.isArray(arr.values) && arr.values.length > 0 && Array.isArray(arr.values[0]);
                if (is2D) {
                  return (
                    <MatrixVisualizer
                      key={arr.name}
                      name={arr.name}
                      matrix={arr.values}
                      variables={stepData?.variables}
                      pointers={arr.pointers ?? {}}
                    />
                  );
                }
                const isNumeric = arr.values.length > 0 && arr.values.every(v => typeof v === "number" || (!isNaN(Number(v)) && v !== ""));
                // Only default to bar diagram for height/bar-chart problems (e.g., Trapping Rain Water, Container With Most Water)
                // Subarray problems (Maximum Subarray, Two Sum, etc.) always default to Cells view
                const arrNameLower = arr.name.toLowerCase();
                const defaultToDiagram = isNumeric && (
                  arrNameLower === "height" ||
                  arrNameLower === "heights" ||
                  arrNameLower.startsWith("height")
                );
                const currentMode = arrayViewModes[arr.name] ?? (defaultToDiagram ? "diagram" : "grid");

                return (
                  <div key={arr.name} style={{ marginBottom: 20 }}>
                    {/* View Switcher Header */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                      <div className="ds-title" style={{ margin: 0 }}>
                        Array: <strong>{arr.name}</strong> <span style={{ fontSize: 11, opacity: 0.6 }}>({arr.type})</span>
                      </div>
                      {isNumeric && (
                        <div style={{ display: "flex", gap: 4, background: "var(--bg-raised, #1C2128)", padding: "2px 4px", borderRadius: 6, border: "1px solid var(--border-subtle, #21262D)" }}>
                          <button
                            type="button"
                            style={{
                              fontSize: 10,
                              fontFamily: "var(--font-mono)",
                              padding: "2px 8px",
                              borderRadius: 4,
                              border: "none",
                              cursor: "pointer",
                              background: currentMode === "grid" ? "var(--accent-amber, #FF9F43)" : "transparent",
                              color: currentMode === "grid" ? "#090B0E" : "var(--txt-dim, #6E7681)",
                              fontWeight: currentMode === "grid" ? 700 : 500
                            }}
                            onClick={() => setArrayViewModes(s => ({ ...s, [arr.name]: "grid" }))}
                          >
                            ⊞ Cells
                          </button>
                          <button
                            type="button"
                            style={{
                              fontSize: 10,
                              fontFamily: "var(--font-mono)",
                              padding: "2px 8px",
                              borderRadius: 4,
                              border: "none",
                              cursor: "pointer",
                              background: currentMode === "diagram" ? "var(--accent-cyan, #38D9C5)" : "transparent",
                              color: currentMode === "diagram" ? "#090B0E" : "var(--txt-dim, #6E7681)",
                              fontWeight: currentMode === "diagram" ? 700 : 500
                            }}
                            onClick={() => setArrayViewModes(s => ({ ...s, [arr.name]: "diagram" }))}
                          >
                            📊 Bar Diagram
                          </button>
                        </div>
                      )}
                    </div>

                    {currentMode === "diagram" ? (
                      <DiagrammaticBarHeights
                        name={arr.name}
                        values={arr.values}
                        pointers={arr.pointers || []}
                        variables={stepData?.variables || {}}
                      />
                    ) : (
                      <div className="ds-block">
                        <div className="array-boxes-wrap">
                          <div className="array-indices-row">
                            {arr.values.map((_, idx) => (
                              <div key={idx} className="array-idx-cell">{idx}</div>
                            ))}
                          </div>
                          <div className="array-cells-row">
                            {arr.values.map((val, idx) => {
                              const hasPointer = arr.pointers?.some(p => p.index === idx);
                              const changed = arr.prevValues && arr.prevValues[idx] !== val;
                              return (
                                <div
                                  key={idx}
                                  className={`array-val-cell ${hasPointer ? "active-cell" : ""} ${changed ? "modified-cell" : ""}`}
                                  title={changed ? `Changed: ${arr.prevValues[idx]} → ${val}` : undefined}
                                >
                                  {String(val ?? "")}
                                </div>
                              );
                            })}
                          </div>
                          {/* Pointer Arrows */}
                          {arr.pointers && arr.pointers.length > 0 && (
                            <div className="array-pointers-row">
                              {arr.values.map((_, idx) => {
                                const pt = arr.pointers.find(p => p.index === idx);
                                return (
                                  <div key={idx} className="pointer-slot">
                                    {pt && (
                                      <div className="pointer-arrow-wrap">
                                        <span className="pointer-arrow">↑</span>
                                        <span className="pointer-label">{pt.name} = {pt.index}</span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* 2. Collections (HashMap, Stack, Queue, HashSet, StringBuilder, ArrayList) */}
              {collections.map((col) => {
                if (col.type === "HashMap" || col.type === "TreeMap" || col.type === "LinkedHashMap") {
                  return (
                    <DiagrammaticHashMap
                      key={col.name}
                      name={col.name}
                      entries={col.entries || []}
                      lastOp={col.lastOp}
                      variables={variables || {}}
                    />
                  );
                }

                if (col.type === "Stack") {
                  return <DiagrammaticStack key={col.name} name={col.name} items={col.items || []} />;
                }

                if (col.type === "Queue" || col.type === "ArrayDeque") {
                  return <DiagrammaticQueue key={col.name} name={col.name} items={col.items || []} />;
                }

                if (col.type === "PriorityQueue") {
                  return (
                    <DiagrammaticPriorityQueue
                      key={col.name}
                      name={col.name}
                      items={col.items || []}
                      raw={col.raw}
                    />
                  );
                }

                if (col.type === "HashSet" || col.type === "TreeSet" || col.type === "LinkedHashSet") {
                  return (
                    <DiagrammaticHashSet
                      key={col.name}
                      name={col.name}
                      items={col.items || []}
                      lastOp={col.lastOp}
                      variables={variables || {}}
                    />
                  );
                }

                if (col.type === "StringBuilder" || col.type === "StringBuffer") {
                  return (
                    <div key={col.name} className="ds-block" style={{ marginBottom: 20 }}>
                      <div className="ds-title">StringBuilder: {col.name}</div>
                      <div style={{ padding: "6px 10px", background: "var(--bg2)", borderRadius: 4, fontFamily: "monospace" }}>
                        "{typeof col.value === "object" ? JSON.stringify(col.value) : String(col.value ?? "")}"
                      </div>
                    </div>
                  );
                }

                return null;
              })}

              {/* 3. Objects (ListNode, TreeNode, Node, custom Java classes) */}
              {(() => {
                // Deduplicate and choose primary for ListNode and TreeNode
                const renderedLists = new Set();
                const renderedTrees = new Set();

                return objects.map((obj) => {
                  const isListNode = obj.className === "ListNode" || obj.type === "ListNode" || (obj.value && (obj.value.__type === "ListNode" || obj.value.next !== undefined));
                  const isTreeNode = obj.className === "TreeNode" || obj.type === "TreeNode" || (obj.value && (obj.value.__type === "TreeNode" || obj.value.left !== undefined || obj.value.right !== undefined));

                  if (isListNode) {
                    // Prefer head or render first occurrence
                    if (renderedLists.size > 0 && obj.name !== "head") return null;
                    renderedLists.add(obj.name);
                    return (
                      <DiagrammaticLinkedList
                        key={obj.name}
                        name={obj.name}
                        headObj={obj.value}
                        allVars={normalized.variables}
                      />
                    );
                  }

                  if (isTreeNode) {
                    // Prefer root or render first occurrence
                    if (renderedTrees.size > 0 && obj.name !== "root") return null;
                    renderedTrees.add(obj.name);
                    return (
                      <DiagrammaticBinaryTree
                        key={obj.name}
                        name={obj.name}
                        rootObj={obj.value}
                      />
                    );
                  }

                  return (
                    <div key={obj.name} className="ds-block" style={{ marginBottom: 20 }}>
                      <div className="ds-title">
                        Object: {obj.name} <span style={{ fontSize: 11, opacity: 0.6 }}>({obj.type})</span>
                      </div>
                      <div
                        className="object-tree-box"
                        style={{ padding: "8px 12px", background: "var(--bg-raised, #1C2128)", border: "1px solid var(--border-subtle, #21262D)", borderRadius: 6, fontFamily: "monospace", fontSize: 12, lineHeight: 1.6 }}
                      >
                        {formatObjectTree(obj.value, obj.name).map((node, nIdx) => (
                          <div key={nIdx} style={{ paddingLeft: node.depth * 18, display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ color: "var(--txt-dim, #6E7681)", userSelect: "none" }}>
                              {node.depth === 0 ? "●" : "├──"}
                            </span>
                            <span style={{ color: "var(--accent-amber, #FF9F43)", fontWeight: 500 }}>{node.key}: </span>
                            <span style={{ color: node.value === "null" ? "var(--txt-dim, #6E7681)" : "var(--txt-bright, #F0F6FC)" }}>
                              {node.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                });
              })()}

              {/* 4. Active Call Stack */}
              {callStack && callStack.length > 0 && (
                <div className="ds-block" style={{ marginBottom: 20 }}>
                  <div className="ds-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span>Call Stack</span>
                    <span style={{ fontSize: 10, padding: "2px 6px", background: "rgba(56, 217, 197, 0.15)", color: "var(--accent-cyan, #38D9C5)", borderRadius: 4, fontWeight: 500 }}>
                      {callStack.length} active frame{callStack.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="callstack-canvas-wrap" style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 8, maxWidth: 360 }}>
                    {[...callStack].reverse().map((frame, idx) => {
                      const isTop = idx === 0;
                      return (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "6px 10px",
                            background: isTop ? "rgba(255, 159, 67, 0.12)" : "var(--bg-raised, #1C2128)",
                            border: isTop ? "1px solid rgba(255, 159, 67, 0.4)" : "1px solid var(--border-subtle, #21262D)",
                            borderLeft: isTop ? "3px solid var(--accent-amber, #FF9F43)" : "1px solid var(--border-subtle, #21262D)",
                            borderRadius: 4,
                            fontFamily: "var(--font-mono, monospace)",
                            fontSize: 11
                          }}
                        >
                          <span style={{ fontWeight: isTop ? 600 : 400, color: isTop ? "var(--txt-bright, #F0F6FC)" : "var(--txt-main, #C9D1D9)" }}>
                            {frame}
                          </span>
                          {isTop ? (
                            <span style={{ fontSize: 9, color: "var(--accent-amber, #FF9F43)", fontWeight: 700, padding: "1px 4px", background: "rgba(255, 159, 67, 0.2)", borderRadius: 2 }}>
                              ACTIVE
                            </span>
                          ) : (
                            <span style={{ fontSize: 9, color: "var(--txt-dim, #6E7681)" }}>
                              #{callStack.length - 1 - idx}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="ds-empty-state" style={{ padding: "32px 16px", textAlign: "center", color: "var(--txt3)" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>📊</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--txt2)", marginBottom: 4 }}>
                {totalSteps === 0 ? "Ready to Visualize" : "No Visualizable Data Structures"}
              </div>
              <div style={{ fontSize: 12, maxWidth: 320, margin: "0 auto", lineHeight: 1.5 }}>
                {totalSteps === 0
                  ? "Click Run to execute your algorithm and inspect memory."
                  : "This execution step operates on scalar variables. Track variable state in the panel below."}
              </div>
            </div>
          )}
        </div>

        {/* Right Canvas: Current Step Explanation Card */}
        <div className="step-explanation-card">
          <div className="step-expl-title">Current Step</div>
          <div className="step-expl-line">{explanation.lineText}</div>
          <div className="step-expl-summary">{explanation.summary}</div>

          <div className="step-expl-section">
            <div className="step-section-heading">What's Happening?</div>
            <ul className="step-bullets-list">
              {(explanation.bullets || []).map((b, idx) => (
                <li key={idx}>{b}</li>
              ))}
            </ul>
          </div>

          <div className="why-callout-box">
            <div className="why-title">
              <span>💡</span> Why?
            </div>
            <div className="why-text">{explanation.why}</div>
          </div>
        </div>
      </div>
      )}

      <KeyboardShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </div>
  );
}
