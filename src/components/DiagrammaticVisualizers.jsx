import React from "react";

/**
 * Unwraps TRACE execution engine variable snapshots: { value, type } -> value.
 * Handles primitive numbers, strings, booleans, or nested objects safely.
 */
function resolveVar(v) {
  while (v && typeof v === "object" && "value" in v) {
    v = v.value;
  }
  return v;
}

// ─────────────────────────────────────────────────────────────
//  TRACE — Diagrammatic Data Structure Visualizers
//  Authentic, textbook-grade interactive visual DSA diagrams
// ─────────────────────────────────────────────────────────────

/**
 * Diagrammatic Stack (LIFO Beaker)
 * Renders a physical beaker container with open mouth, PUSH/POP vectors,
 * top pointer (SP), and closed base plate.
 */
export function DiagrammaticStack({ name, items = [] }) {
  const count = items.length;
  const isNotEmpty = count > 0;

  return (
    <div className="ds-block" style={{ marginBottom: 24 }}>
      <div className="ds-title" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span>Stack: <strong style={{ color: "var(--container-text-primary, var(--txt-bright, #F0F6FC))" }}>{name}</strong></span>
          <span style={{ fontSize: 10, padding: "2px 8px", background: "rgba(255, 159, 67, 0.15)", color: "var(--accent-amber, #FF9F43)", borderRadius: 4, fontWeight: 600 }}>
            LIFO Beaker
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", padding: "2px 6px", background: "var(--container-card-bg, var(--bg-raised, #1C2128))", borderRadius: 4, border: "1px solid var(--border-subtle, #21262D)", color: "var(--container-text-dim, var(--txt-dim, #6E7681))" }}>
            Size: <strong style={{ color: "var(--container-text-primary, var(--txt-bright, #F0F6FC))" }}>{count}</strong>
          </span>
          <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", padding: "2px 6px", background: "var(--container-card-bg, var(--bg-raised, #1C2128))", borderRadius: 4, border: "1px solid var(--border-subtle, #21262D)", color: "var(--container-text-dim, var(--txt-dim, #6E7681))" }}>
            SP: <strong style={{ color: "var(--accent-amber, #FF9F43)" }}>{isNotEmpty ? `[${count - 1}]` : "None"}</strong>
          </span>
          <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", padding: "2px 6px", background: "var(--container-card-bg, var(--bg-raised, #1C2128))", borderRadius: 4, border: "1px solid var(--border-subtle, #21262D)", color: "var(--container-text-dim, var(--txt-dim, #6E7681))" }}>
            Peek: <strong style={{ color: "var(--accent-amber, #FF9F43)" }}>{isNotEmpty ? String(items[count - 1]) : "null"}</strong>
          </span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginTop: 10, flexWrap: "wrap" }}>
        {/* The Beaker */}
        <div
          style={{
            position: "relative",
            width: 250,
            minHeight: 140,
            background: "var(--container-beaker-bg)",
            border: "2px solid var(--accent-amber, #FF9F43)",
            borderLeft: "3px solid var(--accent-amber, #FF9F43)",
            borderRight: "3px solid var(--accent-amber, #FF9F43)",
            borderBottom: "4px solid var(--accent-amber, #FF9F43)",
            borderTop: "1px dashed rgba(255, 159, 67, 0.3)",
            borderRadius: "0 0 8px 8px",
            padding: "14px 10px 8px 10px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            gap: 6,
            boxShadow: "inset 0 -10px 20px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.2)"
          }}
        >
          {/* Top Insertion/Deletion Indicator */}
          <div
            style={{
              position: "absolute",
              top: -10,
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: 9,
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              padding: "2px 8px",
              background: "var(--container-card-bg, var(--bg-raised, #1C2128))",
              border: "1px solid var(--accent-amber, #FF9F43)",
              color: "var(--accent-amber, #FF9F43)",
              borderRadius: 10,
              whiteSpace: "nowrap",
              boxShadow: "0 2px 6px rgba(0,0,0,0.4)"
            }}
          >
            PUSH ↓ / POP ↑
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              maxHeight: 340,
              overflowY: "auto",
              paddingRight: 2
            }}
          >
            {isNotEmpty ? (
              [...items].reverse().map((v, idx) => {
                const isTop = idx === 0;
                const origIdx = count - 1 - idx;
                return (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "7px 10px",
                      background: isTop ? "rgba(255, 159, 67, 0.18)" : "var(--container-card-bg, var(--bg-raised, #1C2128))",
                      border: isTop ? "1.5px solid var(--accent-amber, #FF9F43)" : "1px solid var(--border-subtle, #21262D)",
                      borderRadius: 4,
                      fontFamily: "var(--font-mono)",
                      boxShadow: isTop ? "0 0 10px rgba(255, 159, 67, 0.3)" : "none",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 10, color: isTop ? "var(--accent-amber, #FF9F43)" : "var(--container-text-dim, var(--txt-dim, #6E7681))", fontWeight: 600 }}>
                        [{origIdx}]
                      </span>
                      <span style={{ fontWeight: isTop ? 700 : 500, fontSize: 13, color: isTop ? "var(--container-text-primary, var(--txt-bright, #F0F6FC))" : "var(--txt-main, #C9D1D9)" }}>
                        {String(v)}
                      </span>
                    </div>
                    {isTop && (
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", background: "var(--accent-amber, #FF9F43)", color: "#090B0E", borderRadius: 3 }}>
                          TOP
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div style={{ padding: "30px 10px", textAlign: "center", color: "var(--container-text-dim, var(--txt-dim, #6E7681))", fontFamily: "var(--font-mono)", fontSize: 11 }}>
                [ Empty Stack — push() elements to begin ]
              </div>
            )}
          </div>

          {/* Base Plate */}
          <div
            style={{
              marginTop: 4,
              padding: "4px 0",
              textAlign: "center",
              fontSize: 9,
              fontFamily: "var(--font-mono)",
              color: "var(--container-text-dim, var(--txt-dim, #6E7681))",
              borderTop: "1px solid rgba(255, 159, 67, 0.3)",
              letterSpacing: 1
            }}
          >
            ════ BASE ════
          </div>
        </div>

        {/* Stack Explanation Diagnostics */}
        <div style={{ flex: 1, minWidth: 200, padding: 12, background: "var(--bg-surface, #13171D)", border: "1px solid var(--border-subtle, #21262D)", borderRadius: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--container-text-primary, var(--txt-bright, #F0F6FC))", marginBottom: 8 }}>
            LIFO Execution Semantics
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 11, color: "var(--container-text-dim, var(--txt-dim, #6E7681))", lineHeight: 1.6 }}>
            <li><strong>push(x)</strong> places element onto the top of the stack.</li>
            <li><strong>pop()</strong> removes and returns the topmost element.</li>
            <li><strong>peek()</strong> inspects the top element without removal.</li>
            <li>Current stack depth: <strong style={{ color: "var(--accent-amber, #FF9F43)" }}>{count}</strong>.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/**
 * Diagrammatic Queue (FIFO Conveyor Pipeline)
 * Open-ended pipeline tube showing elements moving from rear to front.
 */
export function DiagrammaticQueue({ name, items = [] }) {
  const count = items.length;
  const isNotEmpty = count > 0;

  return (
    <div className="ds-block" style={{ marginBottom: 24 }}>
      <div className="ds-title" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span>Queue: <strong style={{ color: "var(--container-text-primary, var(--txt-bright, #F0F6FC))" }}>{name}</strong></span>
          <span style={{ fontSize: 10, padding: "2px 8px", background: "rgba(56, 217, 197, 0.15)", color: "var(--accent-cyan, #38D9C5)", borderRadius: 4, fontWeight: 600 }}>
            FIFO Pipeline
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", padding: "2px 6px", background: "var(--container-card-bg, var(--bg-raised, #1C2128))", borderRadius: 4, border: "1px solid var(--border-subtle, #21262D)", color: "var(--container-text-dim, var(--txt-dim, #6E7681))" }}>
            Size: <strong style={{ color: "var(--container-text-primary, var(--txt-bright, #F0F6FC))" }}>{count}</strong>
          </span>
          <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", padding: "2px 6px", background: "var(--container-card-bg, var(--bg-raised, #1C2128))", borderRadius: 4, border: "1px solid var(--border-subtle, #21262D)", color: "var(--container-text-dim, var(--txt-dim, #6E7681))" }}>
            Head: <strong style={{ color: "var(--accent-amber, #FF9F43)" }}>{isNotEmpty ? String(items[0]) : "null"}</strong>
          </span>
          <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", padding: "2px 6px", background: "var(--container-card-bg, var(--bg-raised, #1C2128))", borderRadius: 4, border: "1px solid var(--border-subtle, #21262D)", color: "var(--container-text-dim, var(--txt-dim, #6E7681))" }}>
            Tail: <strong style={{ color: "var(--accent-cyan, #38D9C5)" }}>{isNotEmpty ? String(items[count - 1]) : "null"}</strong>
          </span>
        </div>
      </div>

      <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "8px 12px",
            background: "var(--container-queue-bg)",
            borderTop: "2px solid var(--accent-cyan, #38D9C5)",
            borderBottom: "2px solid var(--accent-cyan, #38D9C5)",
            borderLeft: "none",
            borderRight: "none",
            borderRadius: 4,
            gap: 8,
            overflowX: "auto",
            maxWidth: "100%"
          }}
        >
          <span style={{ fontSize: 11, color: "var(--accent-amber, #FF9F43)", fontWeight: 700, fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>
            DEQUEUE ← [FRONT]
          </span>

          {isNotEmpty ? (
            items.map((v, idx) => {
              const isFront = idx === 0;
              const isRear = idx === count - 1;
              return (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "6px 12px",
                    background: isFront ? "rgba(255, 159, 67, 0.16)" : "var(--container-card-bg, var(--bg-raised, #1C2128))",
                    border: isFront ? "1.5px solid var(--accent-amber, #FF9F43)" : "1px solid var(--border-subtle, #21262D)",
                    borderRadius: 4,
                    minWidth: 42,
                    textAlign: "center",
                    fontFamily: "var(--font-mono)",
                    boxShadow: isFront ? "0 0 8px rgba(255, 159, 67, 0.25)" : "none"
                  }}
                >
                  <span style={{ fontSize: 9, color: isFront ? "var(--accent-amber, #FF9F43)" : "var(--container-text-dim, var(--txt-dim, #6E7681))", marginBottom: 2 }}>
                    [{idx}]
                  </span>
                  <span style={{ fontWeight: isFront ? 700 : 500, fontSize: 13, color: isFront ? "var(--container-text-primary, var(--txt-bright, #F0F6FC))" : "var(--txt-main, #C9D1D9)" }}>
                    {String(v)}
                  </span>
                  {isFront && (
                    <span style={{ fontSize: 8, fontWeight: 700, marginTop: 2, color: "var(--accent-amber, #FF9F43)" }}>
                      HEAD
                    </span>
                  )}
                  {!isFront && isRear && (
                    <span style={{ fontSize: 8, fontWeight: 600, marginTop: 2, color: "var(--accent-cyan, #38D9C5)" }}>
                      TAIL
                    </span>
                  )}
                </div>
              );
            })
          ) : (
            <div style={{ padding: "8px 16px", color: "var(--container-text-dim, var(--txt-dim, #6E7681))", fontFamily: "var(--font-mono)", fontSize: 11 }}>
              [ Empty Queue ]
            </div>
          )}

          <span style={{ fontSize: 11, color: "var(--accent-cyan, #38D9C5)", fontWeight: 700, fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>
            [REAR] ← ENQUEUE
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Diagrammatic Linked List
 * Traverses a ListNode chain and renders textbook horizontal node boxes:
 * [ val | • ] ──► [ val | • ] ──► NULL
 * with active variable pointer tags (head, curr, prev, etc.).
 */
export function DiagrammaticLinkedList({ name, headObj, allVars = {} }) {
  // Collect nodes by traversing .next
  const nodes = [];
  let curr = headObj;
  let count = 0;
  const visitedRefs = new Set();

  while (curr && typeof curr === "object" && count < 25) {
    if (visitedRefs.has(curr)) {
      // Cycle detected
      nodes.push({ isCycle: true, val: "CYCLE ↺", ref: curr });
      break;
    }
    visitedRefs.add(curr);
    const val = curr.val !== undefined ? curr.val : (curr.fields?.val !== undefined ? curr.fields.val : curr.value);
    nodes.push({ val: val !== undefined ? val : "?", ref: curr });
    curr = curr.next !== undefined ? curr.next : (curr.fields?.next !== undefined ? curr.fields.next : null);
    count++;
  }

  // Find pointer tags from allVars pointing to each node
  function getPointersForNode(nodeRef) {
    const ptrs = [];
    for (const [varName, varInfo] of Object.entries(allVars)) {
      if (varName === "this" || varName === "self") continue;
      if (varInfo?.value === nodeRef) {
        ptrs.push(varName);
      }
    }
    return ptrs;
  }

  if (nodes.length === 0) return null;

  return (
    <div className="ds-block" style={{ marginBottom: 24 }}>
      <div className="ds-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span>Linked List: <strong style={{ color: "var(--container-text-primary, var(--txt-bright, #F0F6FC))" }}>{name}</strong></span>
        <span style={{ fontSize: 10, padding: "2px 8px", background: "rgba(56, 217, 197, 0.15)", color: "var(--accent-cyan, #38D9C5)", borderRadius: 4, fontWeight: 600 }}>
          Singly Linked List ({nodes.length} nodes)
        </span>
      </div>

      <div style={{ marginTop: 12, overflowX: "auto", paddingBottom: 12 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, minHeight: 70 }}>
          {nodes.map((node, idx) => {
            const ptrs = getPointersForNode(node.ref);
            return (
              <React.Fragment key={idx}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  {/* Pointers above node */}
                  <div style={{ minHeight: 20, display: "flex", gap: 4, alignItems: "center" }}>
                    {ptrs.map(p => {
                      const isHead = p === "head";
                      const isCurr = p === "curr" || p === "current";
                      const isPrev = p === "prev";
                      const bg = isHead ? "var(--accent-amber, #FF9F43)" : isCurr ? "rgba(56, 217, 197, 0.2)" : isPrev ? "rgba(160, 90, 255, 0.2)" : "rgba(255, 255, 255, 0.1)";
                      const color = isHead ? "#090B0E" : isCurr ? "var(--accent-cyan, #38D9C5)" : isPrev ? "#c792ea" : "var(--container-text-primary, var(--txt-bright, #F0F6FC))";

                      return (
                        <span
                          key={p}
                          style={{
                            fontSize: 9,
                            fontFamily: "var(--font-mono)",
                            fontWeight: 700,
                            padding: "1px 6px",
                            background: bg,
                            color: color,
                            borderRadius: 3,
                            boxShadow: "0 1px 4px rgba(0,0,0,0.3)"
                          }}
                        >
                          {p} ↓
                        </span>
                      );
                    })}
                  </div>

                  {/* Node Box [ DATA | NEXT ] */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "stretch",
                      background: "var(--container-card-bg, var(--bg-raised, #1C2128))",
                      border: ptrs.length > 0 ? "1.5px solid var(--accent-amber, #FF9F43)" : "1px solid var(--border-strong, #30363D)",
                      borderRadius: 6,
                      boxShadow: ptrs.length > 0 ? "0 0 10px rgba(255, 159, 67, 0.25)" : "none",
                      overflow: "hidden"
                    }}
                  >
                    {/* Val cell */}
                    <div
                      style={{
                        padding: "8px 14px",
                        fontWeight: 700,
                        fontSize: 13,
                        color: "var(--container-text-primary, var(--txt-bright, #F0F6FC))",
                        fontFamily: "var(--font-mono)",
                        borderRight: "1px solid var(--border-subtle, #21262D)",
                        background: node.isCycle ? "rgba(239, 71, 67, 0.2)" : "transparent"
                      }}
                    >
                      {String(node.val)}
                    </div>

                    {/* Next pointer cell */}
                    <div
                      style={{
                        padding: "8px 10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--accent-cyan, #38D9C5)",
                        fontSize: 12,
                        background: "rgba(56, 217, 197, 0.04)"
                      }}
                    >
                      •
                    </div>
                  </div>

                  <span style={{ fontSize: 9, color: "var(--container-text-dim, var(--txt-dim, #6E7681))", fontFamily: "var(--font-mono)" }}>
                    [{idx}]
                  </span>
                </div>

                {/* Arrow to next */}
                {idx < nodes.length - 1 ? (
                  <div style={{ display: "flex", alignItems: "center", color: "var(--accent-cyan, #38D9C5)", fontWeight: 700, fontSize: 16, marginTop: 12 }}>
                    ──►
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12 }}>
                    <span style={{ color: "var(--accent-cyan, #38D9C5)", fontWeight: 700, fontSize: 16 }}>──►</span>
                    <div
                      style={{
                        padding: "6px 10px",
                        border: "1px dashed var(--border-strong, #30363D)",
                        borderRadius: 4,
                        fontSize: 11,
                        fontFamily: "var(--font-mono)",
                        color: "var(--container-text-dim, var(--txt-dim, #6E7681))",
                        background: "rgba(255,255,255,0.02)"
                      }}
                    >
                      NULL ⏚
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * Diagrammatic Binary Tree
 * Renders hierarchical SVG tree graph with circular nodes and connector lines.
 */
export function DiagrammaticBinaryTree({ name, rootObj }) {
  function computeLayout(root, x = 160, y = 32, offset = 64, depth = 0) {
    if (!root || typeof root !== "object" || depth > 4) return { nodes: [], edges: [] };

    const val = root.val !== undefined ? root.val : (root.fields?.val !== undefined ? root.fields.val : "?");
    const currNode = { val, x, y, depth, isRoot: depth === 0 };
    const nodes = [currNode];
    const edges = [];

    const left = root.left !== undefined ? root.left : root.fields?.left;
    const right = root.right !== undefined ? root.right : root.fields?.right;

    if (left && typeof left === "object" && (left.val !== undefined || left.fields?.val !== undefined)) {
      const leftX = x - offset;
      const leftY = y + 54;
      edges.push({ x1: x, y1: y, x2: leftX, y2: leftY, dir: "L" });
      const leftSub = computeLayout(left, leftX, leftY, offset / 1.85, depth + 1);
      nodes.push(...leftSub.nodes);
      edges.push(...leftSub.edges);
    }

    if (right && typeof right === "object" && (right.val !== undefined || right.fields?.val !== undefined)) {
      const rightX = x + offset;
      const rightY = y + 54;
      edges.push({ x1: x, y1: y, x2: rightX, y2: rightY, dir: "R" });
      const rightSub = computeLayout(right, rightX, rightY, offset / 1.85, depth + 1);
      nodes.push(...rightSub.nodes);
      edges.push(...rightSub.edges);
    }

    return { nodes, edges };
  }

  const { nodes, edges } = computeLayout(rootObj);
  if (nodes.length === 0) return null;

  // Compute SVG dimensions
  const minX = Math.min(...nodes.map(n => n.x)) - 32;
  const maxX = Math.max(...nodes.map(n => n.x)) + 32;
  const maxY = Math.max(...nodes.map(n => n.y)) + 32;
  const width = Math.max(340, maxX - minX);
  const height = Math.max(160, maxY);

  return (
    <div className="ds-block" style={{ marginBottom: 24 }}>
      <div className="ds-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span>Binary Tree: <strong style={{ color: "var(--container-text-primary, var(--txt-bright, #F0F6FC))" }}>{name}</strong></span>
        <span style={{ fontSize: 10, padding: "2px 8px", background: "rgba(255, 159, 67, 0.15)", color: "var(--accent-amber, #FF9F43)", borderRadius: 4, fontWeight: 600 }}>
          SVG Tree Graph ({nodes.length} nodes)
        </span>
      </div>

      <div style={{ marginTop: 10, background: "var(--bg-surface, #13171D)", border: "1px solid var(--border-subtle, #21262D)", borderRadius: 8, padding: 12, overflowX: "auto" }}>
        <svg width={width} height={height} viewBox={`${minX} 0 ${width} ${height}`} style={{ display: "block", margin: "0 auto" }}>
          {/* Edges with L/R branch labels */}
          {edges.map((e, idx) => (
            <g key={idx}>
              <line
                x1={e.x1}
                y1={e.y1}
                x2={e.x2}
                y2={e.y2}
                stroke="var(--border-strong, #30363D)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <text
                x={(e.x1 + e.x2) / 2 + (e.dir === "L" ? -6 : 6)}
                y={(e.y1 + e.y2) / 2 - 2}
                fill="var(--container-text-dim, var(--txt-dim, #6E7681))"
                fontSize="9"
                fontWeight="700"
                fontFamily="var(--font-mono, monospace)"
              >
                {e.dir}
              </text>
            </g>
          ))}

          {/* Nodes */}
          {nodes.map((n, idx) => (
            <g key={idx}>
              <circle
                cx={n.x}
                cy={n.y}
                r="18"
                fill="var(--container-card-bg, var(--bg-raised, #1C2128))"
                stroke={n.isRoot ? "var(--accent-amber, #FF9F43)" : "var(--accent-cyan, #38D9C5)"}
                strokeWidth={n.isRoot ? "2.5" : "2"}
                style={{ filter: "drop-shadow(0 2px 5px rgba(0,0,0,0.3))" }}
              />
              <text
                x={n.x}
                y={n.y + 4.5}
                textAnchor="middle"
                fill="var(--container-text-primary, var(--txt-bright, #F0F6FC))"
                fontSize="12"
                fontWeight="700"
                fontFamily="var(--font-mono, monospace)"
              >
                {String(n.val)}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

/**
 * Diagrammatic Priority Queue (Binary Heap Visualizer)
 * Shows Min-Heap or Max-Heap with root priority element, parent/child indices,
 * and binary heap memory blocks.
 */
export function DiagrammaticPriorityQueue({ name, items = [], raw }) {
  const isMax = raw?.comparator?.order === "reverse";
  const heapLabel = isMax ? "Max-Heap" : "Min-Heap";
  const count = items.length;
  const isNotEmpty = count > 0;

  const formatPqVal = (v) => {
    if (v === null || v === undefined) return "null";
    if (Array.isArray(v)) return `[${v.join(", ")}]`;
    if (typeof v === "object") {
      if (v.val !== undefined) return `Node(${v.val})`;
      if (v.fields?.val !== undefined) return `Node(${v.fields.val})`;
      return v.name || v.__type || "{...}";
    }
    return String(v);
  };

  return (
    <div className="ds-block" style={{ marginBottom: 24 }}>
      <div className="ds-title" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span>PriorityQueue: <strong style={{ color: "var(--container-text-primary, var(--txt-bright, #F0F6FC))" }}>{name}</strong></span>
          <span style={{ fontSize: 10, padding: "2px 8px", background: isMax ? "rgba(255, 159, 67, 0.15)" : "rgba(56, 217, 197, 0.15)", color: isMax ? "var(--accent-amber, #FF9F43)" : "var(--accent-cyan, #38D9C5)", borderRadius: 4, fontWeight: 600 }}>
            {heapLabel} ({count} items)
          </span>
        </div>
        <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--container-text-dim, var(--txt-dim, #6E7681))" }}>
          Peek / Root: <strong style={{ color: "var(--accent-amber, #FF9F43)" }}>{isNotEmpty ? formatPqVal(items[0]) : "null"}</strong>
        </span>
      </div>

      <div style={{ marginTop: 10, background: "var(--bg-surface, #13171D)", border: "1px solid var(--border-subtle, #21262D)", borderRadius: 8, padding: 12 }}>
        {/* Binary Heap Visual Guide */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, fontSize: 10, color: "var(--container-text-dim, var(--txt-dim, #6E7681))", fontFamily: "var(--font-mono)" }}>
          <span>Heap Array: parent ⌊(i-1)/2⌋ ──► left (2i+1), right (2i+2)</span>
          <span style={{ color: "var(--accent-amber, #FF9F43)" }}>{isMax ? "Max Element at Root [0]" : "Min Element at Root [0]"}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          {isNotEmpty ? (
            items.map((v, idx) => {
              const isRoot = idx === 0;
              const parentIdx = isRoot ? null : Math.floor((idx - 1) / 2);
              const leftChild = 2 * idx + 1 < count ? 2 * idx + 1 : null;
              const rightChild = 2 * idx + 2 < count ? 2 * idx + 2 : null;

              return (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "6px 12px",
                    background: isRoot ? "rgba(255, 159, 67, 0.16)" : "var(--container-card-bg, var(--bg-raised, #1C2128))",
                    border: isRoot ? "1.5px solid var(--accent-amber, #FF9F43)" : "1px solid var(--border-subtle, #21262D)",
                    borderRadius: 6,
                    minWidth: 54,
                    textAlign: "center",
                    fontFamily: "var(--font-mono)",
                    boxShadow: isRoot ? "0 0 10px rgba(255, 159, 67, 0.25)" : "none",
                    position: "relative"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}>
                    <span style={{ fontSize: 9, color: isRoot ? "var(--accent-amber, #FF9F43)" : "var(--container-text-dim, var(--txt-dim, #6E7681))", fontWeight: 700 }}>
                      [{idx}]
                    </span>
                    {!isRoot && (
                      <span style={{ fontSize: 8, color: "var(--container-text-dim, var(--txt-dim, #6E7681))" }}>
                        p:{parentIdx}
                      </span>
                    )}
                  </div>
                  <span style={{ fontWeight: isRoot ? 700 : 500, fontSize: 13, color: isRoot ? "var(--container-text-primary, var(--txt-bright, #F0F6FC))" : "var(--txt-main, #C9D1D9)" }}>
                    {formatPqVal(v)}
                  </span>
                  {isRoot ? (
                    <span style={{ fontSize: 8, fontWeight: 700, marginTop: 2, padding: "1px 4px", background: "var(--accent-amber, #FF9F43)", color: "#090B0E", borderRadius: 2 }}>
                      ROOT
                    </span>
                  ) : (
                    (leftChild !== null || rightChild !== null) && (
                      <span style={{ fontSize: 8, color: "var(--accent-cyan, #38D9C5)", marginTop: 2 }}>
                        c:{[leftChild, rightChild].filter(x => x !== null).join(",")}
                      </span>
                    )
                  )}
                </div>
              );
            })
          ) : (
            <div style={{ padding: "8px 12px", color: "var(--container-text-dim, var(--txt-dim, #6E7681))", fontFamily: "var(--font-mono)", fontSize: 11 }}>
              [ Empty Priority Queue ]
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


/**
 * Diagrammatic Bar Heights & Water Container
 * Renders textbook-grade vertical pillars with water shading between two pointers,
 * live geometry HUD (width, height, area), and step-by-step invariant rationale.
 */
export function DiagrammaticBarHeights({ name, values = [], pointers = [], variables = {} }) {
  const rawLeft = pointers.find(p => p.name === "left" || p.name === "i" || p.name === "start")?.index
    ?? (variables.left !== undefined ? resolveVar(variables.left) : (variables.i !== undefined ? resolveVar(variables.i) : null));
  const rawRight = pointers.find(p => p.name === "right" || p.name === "j" || p.name === "end")?.index
    ?? (variables.right !== undefined ? resolveVar(variables.right) : (variables.j !== undefined ? resolveVar(variables.j) : null));

  const leftPtr = rawLeft !== null && rawLeft !== undefined ? { name: "left", index: Number(rawLeft) || 0 } : null;
  const rightPtr = rawRight !== null && rawRight !== undefined ? { name: "right", index: Number(rawRight) || 0 } : null;

  const leftIdx = leftPtr ? Math.max(0, Math.min(leftPtr.index, values.length - 1)) : 0;
  const rightIdx = rightPtr ? Math.max(0, Math.min(rightPtr.index, values.length - 1)) : Math.max(0, values.length - 1);

  const hasPointers = leftPtr !== null && rightPtr !== null && leftIdx <= rightIdx;
  const leftH = Number(resolveVar(values[leftIdx])) || 0;
  const rightH = Number(resolveVar(values[rightIdx])) || 0;
  const waterH = Math.min(leftH, rightH);
  const width = Math.max(0, rightIdx - leftIdx);
  const currentArea = width * waterH;

  const rawMax = variables.maxWater ?? variables.maxArea ?? variables.max ?? variables.ans ?? variables.res;
  const maxRecorded = rawMax !== undefined ? resolveVar(rawMax) : undefined;
  const maxVal = Math.max(...values.map(v => typeof v === "number" ? v : 1), 1);
  const MAX_HEIGHT_PX = 160;

  return (
    <div className="ds-block diagrammatic-bar-heights-block" style={{ marginBottom: 24 }}>
      {/* ── Title & Live Geometry HUD ─────────────────────── */}
      <div className="ds-title" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span>Vertical Bars: <strong style={{ color: "var(--container-text-primary, var(--txt-bright, #F0F6FC))" }}>{name}</strong></span>
          <span style={{ fontSize: 10, padding: "2px 8px", background: "rgba(56, 217, 197, 0.15)", color: "var(--accent-cyan, #38D9C5)", borderRadius: 4, fontWeight: 600 }}>
            Two-Pointer Water Container
          </span>
        </div>
        {hasPointers && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", padding: "2px 6px", background: "var(--container-card-bg, var(--bg-raised, #1C2128))", borderRadius: 4, border: "1px solid var(--border-subtle, #21262D)", color: "var(--container-text-dim, var(--txt-dim, #6E7681))" }}>
              Width: <strong style={{ color: "var(--container-text-primary, var(--txt-bright, #F0F6FC))" }}>{width}</strong>
            </span>
            <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", padding: "2px 6px", background: "var(--container-card-bg, var(--bg-raised, #1C2128))", borderRadius: 4, border: "1px solid var(--border-subtle, #21262D)", color: "var(--container-text-dim, var(--txt-dim, #6E7681))" }}>
              Eff. Height: <strong style={{ color: "var(--accent-cyan, #38D9C5)" }}>min({leftH}, {rightH}) = {waterH}</strong>
            </span>
            <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", padding: "2px 6px", background: "rgba(56, 217, 197, 0.12)", borderRadius: 4, border: "1px solid rgba(56, 217, 197, 0.3)", color: "var(--accent-cyan, #38D9C5)" }}>
              Current Area: <strong style={{ color: "var(--container-text-primary, var(--txt-bright, #F0F6FC))" }}>{currentArea}</strong>
            </span>
            {maxRecorded !== undefined && (
              <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", padding: "2px 6px", background: "rgba(255, 159, 67, 0.15)", borderRadius: 4, border: "1px solid rgba(255, 159, 67, 0.3)", color: "var(--accent-amber, #FF9F43)" }}>
                Max Area: <strong>{typeof maxRecorded === "object" ? JSON.stringify(maxRecorded) : String(maxRecorded)}</strong>
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Visual Bar Diagram Canvas ──────────────────────── */}
      <div
        style={{
          marginTop: 12,
          padding: "24px 16px 12px 16px",
          background: "var(--container-water-bg)",
          border: "1px solid var(--border-subtle, #21262D)",
          borderRadius: 8,
          position: "relative",
          overflowX: "auto"
        }}
      >
        {/* Background Grid Guide Lines */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 40, borderTop: "1px dashed var(--grid-line-color, rgba(120,120,120,0.12))", pointerEvents: "none" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 100, borderTop: "1px dashed var(--grid-line-color, rgba(120,120,120,0.12))", pointerEvents: "none" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 160, borderTop: "1px dashed var(--grid-line-color, rgba(120,120,120,0.12))", pointerEvents: "none" }} />

        {/* The Bars Row */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            gap: 12,
            minHeight: MAX_HEIGHT_PX + 50,
            paddingBottom: 28,
            borderBottom: "2px solid var(--container-card-border, var(--border-subtle))",
            position: "relative"
          }}
        >
          {values.map((v, idx) => {
            const numVal = Number(v) || 0;
            const barH = Math.max(14, Math.round((numVal / maxVal) * MAX_HEIGHT_PX));
            const isLeft = idx === leftIdx;
            const isRight = idx === rightIdx;
            const isBoundary = isLeft || isRight;
            const isBetween = idx > leftIdx && idx < rightIdx;
            const isInsideWater = isBetween && numVal < waterH;

            let barBg = "var(--container-card-bg, rgba(110, 118, 129, 0.25))";
            let barBorder = "1px solid var(--container-card-border, rgba(110, 118, 129, 0.4))";
            if (isLeft) {
              barBg = "linear-gradient(180deg, #38D9C5 0%, rgba(56, 217, 197, 0.5) 100%)";
              barBorder = "2px solid #38D9C5";
            } else if (isRight) {
              barBg = "linear-gradient(180deg, #FF9F43 0%, rgba(255, 159, 67, 0.5) 100%)";
              barBorder = "2px solid #FF9F43";
            } else if (isBetween) {
              barBg = "rgba(56, 217, 197, 0.18)";
              barBorder = "1px solid rgba(56, 217, 197, 0.35)";
            }

            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  position: "relative",
                  width: 36,
                  zIndex: isBoundary ? 5 : 2
                }}
              >
                {/* Pointer Badge on top of boundary pillars */}
                {isLeft && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: barH + 26,
                      fontSize: 10,
                      fontWeight: 700,
                      fontFamily: "var(--font-mono)",
                      padding: "2px 6px",
                      background: "#38D9C5",
                      color: "#090B0E",
                      borderRadius: 3,
                      whiteSpace: "nowrap",
                      boxShadow: "0 2px 8px rgba(56, 217, 197, 0.4)"
                    }}
                  >
                    left ({idx})
                  </span>
                )}
                {isRight && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: barH + 26,
                      fontSize: 10,
                      fontWeight: 700,
                      fontFamily: "var(--font-mono)",
                      padding: "2px 6px",
                      background: "#FF9F43",
                      color: "#090B0E",
                      borderRadius: 3,
                      whiteSpace: "nowrap",
                      boxShadow: "0 2px 8px rgba(255, 159, 67, 0.4)"
                    }}
                  >
                    right ({idx})
                  </span>
                )}

                {/* Height Value Label */}
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: "var(--font-mono)",
                    fontWeight: isBoundary ? 700 : 500,
                    color: isLeft ? "#38D9C5" : isRight ? "#FF9F43" : "var(--txt-medium, #C9D1D9)",
                    marginBottom: 4
                  }}
                >
                  {numVal}
                </span>

                {/* Vertical Bar Pillar */}
                <div
                  style={{
                    width: 22,
                    height: barH,
                    background: barBg,
                    border: barBorder,
                    borderRadius: "4px 4px 0 0",
                    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                    boxShadow: isBoundary ? "0 0 12px rgba(56, 217, 197, 0.3)" : "none",
                    position: "relative"
                  }}
                >
                  {/* Subtle water fill line on bars that sit inside the water container */}
                  {isInsideWater && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(56, 217, 197, 0.25)",
                        borderTop: "1px dashed rgba(56, 217, 197, 0.6)"
                      }}
                    />
                  )}
                </div>

                {/* Index label beneath base */}
                <span
                  style={{
                    fontSize: 10,
                    fontFamily: "var(--font-mono)",
                    color: isBoundary ? "var(--container-text-primary, var(--txt-bright, #F0F6FC))" : "var(--container-text-dim, var(--txt-dim, #6E7681))",
                    marginTop: 6,
                    fontWeight: isBoundary ? 700 : 400
                  }}
                >
                  [{idx}]
                </span>
              </div>
            );
          })}
        </div>

        {/* ── Water Shading Overlay Banner ───────────────────── */}
        {hasPointers && (
          <div
            style={{
              marginTop: 12,
              padding: "8px 12px",
              background: "rgba(56, 217, 197, 0.08)",
              border: "1px solid rgba(56, 217, 197, 0.25)",
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 8,
              fontFamily: "var(--font-mono)",
              fontSize: 11
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14 }}>🌊</span>
              <span style={{ color: "var(--accent-cyan, #38D9C5)", fontWeight: 600 }}>
                Bounded Water Volume: {width} × {waterH} = {currentArea} units²
              </span>
            </div>
            <div style={{ color: "var(--container-text-dim, var(--txt-dim, #6E7681))", fontSize: 10 }}>
              {leftH < rightH ? (
                <span>
                  left pillar ({leftH}) &lt; right pillar ({rightH}) → <strong style={{ color: "var(--accent-cyan, #38D9C5)" }}>increment left++</strong>
                </span>
              ) : leftH > rightH ? (
                <span>
                  right pillar ({rightH}) &lt; left pillar ({leftH}) → <strong style={{ color: "var(--accent-amber, #FF9F43)" }}>decrement right--</strong>
                </span>
              ) : (
                <span>
                  both pillars equal ({leftH} == {rightH}) → move either pointer inward
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


/**
 * Diagrammatic HashSet (Vault Chamber)
 * Physical container chamber with glassmorphism, hash slots,
 * entry port, active operation highlights, and automatic contiguous streak detector.
 */
export function DiagrammaticHashSet({ name, items = [], lastOp, variables = {} }) {
  const count = items.length;
  const isNotEmpty = count > 0;

  // Detect contiguous numerical streaks (for LeetCode 128 and sequence problems)
  const numItems = items.map(Number).filter(n => !isNaN(n));
  const numSet = new Set(numItems);
  const streaks = [];
  for (const num of numSet) {
    if (!numSet.has(num - 1)) {
      const seq = [];
      let cur = num;
      while (numSet.has(cur)) {
        seq.push(cur);
        cur++;
      }
      if (seq.length > 1) streaks.push(seq);
    }
  }

  // Active lookup from lastOp or current variable
  const resolveVar = (v) => (v && typeof v === "object" && "value" in v ? v.value : v);
  const activeLookupVal = (lastOp?.method === "contains" || lastOp?.method === "add" || lastOp?.method === "remove")
    ? lastOp.args?.[0]
    : (variables.current !== undefined
      ? resolveVar(variables.current)
      : (variables.num !== undefined ? resolveVar(variables.num) : null));

  return (
    <div className="ds-block diagrammatic-hashset-block" style={{ marginBottom: 24 }}>
      {/* ── Header Bar ────────────────────────────────────────── */}
      <div className="ds-title" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span>HashSet: <strong style={{ color: "var(--container-text-primary, var(--txt-bright, #F0F6FC))" }}>{name}</strong></span>
          <span style={{ fontSize: 10, padding: "2px 8px", background: "rgba(56, 217, 197, 0.15)", color: "var(--accent-cyan, #38D9C5)", borderRadius: 4, fontWeight: 600 }}>
            O(1) Hash Vault Chamber
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", padding: "2px 6px", background: "var(--container-card-bg, var(--bg-raised, #1C2128))", borderRadius: 4, border: "1px solid var(--border-subtle, #21262D)", color: "var(--container-text-dim, var(--txt-dim, #6E7681))" }}>
            Size: <strong style={{ color: "var(--container-text-primary, var(--txt-bright, #F0F6FC))" }}>{count}</strong>
          </span>
          <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", padding: "2px 6px", background: "var(--container-card-bg, var(--bg-raised, #1C2128))", borderRadius: 4, border: "1px solid var(--border-subtle, #21262D)", color: "var(--container-text-dim, var(--txt-dim, #6E7681))" }}>
            Capacity: <strong>16</strong>
          </span>
          <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", padding: "2px 6px", background: "var(--container-card-bg, var(--bg-raised, #1C2128))", borderRadius: 4, border: "1px solid var(--border-subtle, #21262D)", color: "var(--container-text-dim, var(--txt-dim, #6E7681))" }}>
            Load: <strong>{(count / 16).toFixed(2)}</strong>
          </span>
          {lastOp && (
            <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", padding: "2px 6px", background: "rgba(56, 217, 197, 0.12)", borderRadius: 4, border: "1px solid rgba(56, 217, 197, 0.3)", color: "var(--accent-cyan, #38D9C5)" }}>
              {lastOp.method}({lastOp.args?.join(", ")}) {lastOp.result !== null ? `→ ${String(lastOp.result)}` : ""}
            </span>
          )}
        </div>
      </div>

      {/* ── The Physical Vault Container ───────────────────────── */}
      <div
        style={{
          position: "relative",
          marginTop: 10,
          background: "var(--container-chamber-bg)",
          border: "2px solid rgba(56, 217, 197, 0.4)",
          borderRadius: "12px",
          padding: "16px 14px",
          boxShadow: "inset 0 0 20px rgba(56, 217, 197, 0.05), 0 4px 16px rgba(0,0,0,0.3)"
        }}
      >
        {/* Top Hash Port Indicator */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, paddingBottom: 8, borderBottom: "1px dashed rgba(56, 217, 197, 0.2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, color: "var(--accent-cyan, #38D9C5)" }}>⚙️</span>
            <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--container-text-dim, var(--txt-dim, #6E7681))" }}>
              Hash Formula: <code style={{ color: "var(--accent-cyan, #38D9C5)" }}>h(x) = (x.hashCode() ^ (h &gt;&gt;&gt; 16)) &amp; 15</code>
            </span>
          </div>
          <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "var(--container-text-dim, var(--txt-dim, #6E7681))", padding: "1px 6px", background: "var(--container-card-bg, var(--bg-canvas, #0D1117))", borderRadius: 3 }}>
            Collision Guard: O(1) Amortized
          </span>
        </div>

        {/* Vault Items Grid */}
        {isNotEmpty ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {items.map((v, idx) => {
              const numVal = Number(v);
              const bucketIdx = !isNaN(numVal) ? Math.abs(numVal % 16) : Math.abs(String(v).split("").reduce((a,c)=>a+c.charCodeAt(0),0) % 16);
              const isMatch = activeLookupVal !== null && (String(v) === String(activeLookupVal) || numVal === activeLookupVal);
              const isInStreak = streaks.some(s => s.includes(numVal));

              return (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "6px 12px",
                    background: isMatch
                      ? "rgba(56, 217, 197, 0.25)"
                      : isInStreak
                      ? "rgba(255, 159, 67, 0.12)"
                      : "var(--container-card-bg, var(--bg-raised, #1C2128))",
                    border: isMatch
                      ? "2px solid var(--accent-cyan, #38D9C5)"
                      : isInStreak
                      ? "1px solid rgba(255, 159, 67, 0.4)"
                      : "1px solid var(--border-subtle, #21262D)",
                    borderRadius: 8,
                    minWidth: 54,
                    transition: "all 0.2s ease",
                    boxShadow: isMatch ? "0 0 12px rgba(56, 217, 197, 0.4)" : "none"
                  }}
                >
                  <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: isMatch ? "var(--accent-cyan, #38D9C5)" : "var(--container-text-dim, var(--txt-dim, #6E7681))" }}>
                    bkt:{bucketIdx}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--font-mono)", color: isMatch ? "var(--container-text-primary, var(--txt-bright, #F0F6FC))" : isInStreak ? "var(--accent-amber, #FF9F43)" : "var(--txt-medium, #C9D1D9)", marginTop: 2 }}>
                    {String(v)}
                  </span>
                  {isMatch && (
                    <span style={{ fontSize: 8, fontWeight: 700, marginTop: 2, padding: "1px 4px", background: "var(--accent-cyan, #38D9C5)", color: "#090B0E", borderRadius: 2 }}>
                      MATCH
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: "14px", textAlign: "center", color: "var(--container-text-dim, var(--txt-dim, #6E7681))", fontFamily: "var(--font-mono)", fontSize: 11 }}>
            [ Vault Empty — Awaiting insertions with <code>set.add(...)</code> ]
          </div>
        )}

        {/* Contiguous Sequence Highlighter (LeetCode 128) */}
        {streaks.length > 0 && (
          <div
            style={{
              marginTop: 14,
              padding: "8px 12px",
              background: "rgba(255, 159, 67, 0.08)",
              border: "1px solid rgba(255, 159, 67, 0.3)",
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 8,
              fontFamily: "var(--font-mono)",
              fontSize: 11
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13 }}>🔗</span>
              <span style={{ color: "var(--accent-amber, #FF9F43)", fontWeight: 700 }}>
                Contiguous Sequence Detected:
              </span>
              {streaks[0].map((num, i) => (
                <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <span style={{ padding: "1px 6px", background: "var(--container-card-bg, var(--bg-canvas, #0D1117))", border: "1px solid rgba(255,159,67,0.5)", borderRadius: 4, color: "var(--container-text-primary, var(--txt-bright, #F0F6FC))", fontWeight: 700 }}>
                    {num}
                  </span>
                  {i < streaks[0].length - 1 && <span style={{ color: "var(--accent-amber, #FF9F43)", opacity: 0.7 }}>➔</span>}
                </span>
              ))}
            </div>
            <span style={{ fontSize: 10, color: "var(--accent-amber, #FF9F43)", padding: "2px 6px", background: "rgba(255, 159, 67, 0.15)", borderRadius: 4, fontWeight: 600 }}>
              Streak Length: {streaks[0].length}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Diagrammatic HashMap (Key-Value Bucket Bank)
 * Physical container bank displaying visual key-to-value bridges,
 * computed hash bucket slots, active lookup pulses, and live telemetry.
 */
export function DiagrammaticHashMap({ name, entries = [], lastOp, variables = {} }) {
  const count = entries.length;
  const isNotEmpty = count > 0;

  const resolveVar = (v) => (v && typeof v === "object" && "value" in v ? v.value : v);
  const activeKey = (lastOp?.method === "get" || lastOp?.method === "put" || lastOp?.method === "containsKey" || lastOp?.method === "remove")
    ? String(lastOp.args?.[0])
    : (variables.complement !== undefined
      ? String(resolveVar(variables.complement))
      : (variables.target !== undefined ? String(resolveVar(variables.target)) : null));

  return (
    <div className="ds-block diagrammatic-hashmap-block" style={{ marginBottom: 24 }}>
      {/* ── Header Bar ────────────────────────────────────────── */}
      <div className="ds-title" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span>HashMap: <strong style={{ color: "var(--container-text-primary, var(--txt-bright, #F0F6FC))" }}>{name}</strong></span>
          <span style={{ fontSize: 10, padding: "2px 8px", background: "rgba(255, 159, 67, 0.15)", color: "var(--accent-amber, #FF9F43)", borderRadius: 4, fontWeight: 600 }}>
            Key-Value Bucket Bank
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", padding: "2px 6px", background: "var(--container-card-bg, var(--bg-raised, #1C2128))", borderRadius: 4, border: "1px solid var(--border-subtle, #21262D)", color: "var(--container-text-dim, var(--txt-dim, #6E7681))" }}>
            Entries: <strong style={{ color: "var(--container-text-primary, var(--txt-bright, #F0F6FC))" }}>{count}</strong>
          </span>
          <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", padding: "2px 6px", background: "var(--container-card-bg, var(--bg-raised, #1C2128))", borderRadius: 4, border: "1px solid var(--border-subtle, #21262D)", color: "var(--container-text-dim, var(--txt-dim, #6E7681))" }}>
            Capacity: <strong>16</strong>
          </span>
          <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", padding: "2px 6px", background: "var(--container-card-bg, var(--bg-raised, #1C2128))", borderRadius: 4, border: "1px solid var(--border-subtle, #21262D)", color: "var(--container-text-dim, var(--txt-dim, #6E7681))" }}>
            Load: <strong>{(count / 16).toFixed(2)}</strong>
          </span>
          {lastOp && (
            <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", padding: "2px 6px", background: "rgba(255, 159, 67, 0.15)", borderRadius: 4, border: "1px solid rgba(255, 159, 67, 0.3)", color: "var(--accent-amber, #FF9F43)" }}>
              {lastOp.method}({lastOp.args?.join(", ")}) {lastOp.result !== null && lastOp.result !== undefined ? `→ ${String(lastOp.result)}` : ""}
            </span>
          )}
        </div>
      </div>

      {/* ── The Physical Bucket Bank Container ─────────────────── */}
      <div
        style={{
          position: "relative",
          marginTop: 10,
          background: "var(--container-chamber-bg)",
          border: "2px solid rgba(255, 159, 67, 0.35)",
          borderRadius: "12px",
          padding: "16px 14px",
          boxShadow: "inset 0 0 20px rgba(255, 159, 67, 0.05), 0 4px 16px rgba(0,0,0,0.3)"
        }}
      >
        {/* Container Header Banner */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, paddingBottom: 8, borderBottom: "1px dashed rgba(255, 159, 67, 0.2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, color: "var(--accent-amber, #FF9F43)" }}>🗂️</span>
            <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--container-text-dim, var(--txt-dim, #6E7681))" }}>
              Key-Value Mapping Structure: <code style={{ color: "var(--accent-cyan, #38D9C5)" }}>Entry&lt;K, V&gt;</code> with linked bucket pointers
            </span>
          </div>
          <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "var(--container-text-dim, var(--txt-dim, #6E7681))", padding: "1px 6px", background: "var(--container-card-bg, var(--bg-canvas, #0D1117))", borderRadius: 3 }}>
            Chaining: Node&lt;K,V&gt;
          </span>
        </div>

        {/* Key-Value Bridge Rows */}
        {isNotEmpty ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {entries.map((ent, idx) => {
              const strKey = String(ent.key);
              const numKey = Number(ent.key);
              const bucketIdx = !isNaN(numKey) ? Math.abs(numKey % 16) : Math.abs(strKey.split("").reduce((a,c)=>a+c.charCodeAt(0),0) % 16);
              const isMatch = activeKey !== null && strKey === activeKey;

              return (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "6px 12px",
                    background: isMatch ? "rgba(255, 159, 67, 0.2)" : "var(--container-card-bg, var(--bg-raised, #1C2128))",
                    border: isMatch ? "2px solid var(--accent-amber, #FF9F43)" : "1px solid var(--border-subtle, #21262D)",
                    borderRadius: 8,
                    transition: "all 0.2s ease",
                    boxShadow: isMatch ? "0 0 12px rgba(255, 159, 67, 0.35)" : "none"
                  }}
                >
                  {/* Left: Bucket Slot & Key Capsule */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--container-text-dim, var(--txt-dim, #6E7681))", minWidth: 44 }}>
                      [{bucketIdx}]
                    </span>
                    <div
                      style={{
                        padding: "3px 10px",
                        background: "rgba(56, 217, 197, 0.12)",
                        border: "1px solid rgba(56, 217, 197, 0.4)",
                        borderRadius: 6,
                        fontFamily: "var(--font-mono)",
                        fontSize: 12,
                        fontWeight: 700,
                        color: "var(--accent-cyan, #38D9C5)"
                      }}
                    >
                      <span style={{ fontSize: 9, opacity: 0.6, marginRight: 4 }}>KEY:</span>
                      {strKey}
                    </div>
                  </div>

                  {/* Middle: Pointer Connector */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, margin: "0 14px", overflow: "hidden" }}>
                    <div style={{ height: 1, flex: 1, background: isMatch ? "var(--accent-amber, #FF9F43)" : "var(--container-card-border, var(--border-subtle, #21262D))" }} />
                    <span style={{ fontSize: 11, color: isMatch ? "var(--accent-amber, #FF9F43)" : "var(--container-text-dim, var(--txt-dim, #6E7681))", fontFamily: "var(--font-mono)" }}>
                      ➔
                    </span>
                    <div style={{ height: 1, flex: 1, background: isMatch ? "var(--accent-amber, #FF9F43)" : "var(--container-card-border, var(--border-subtle, #21262D))" }} />
                  </div>

                  {/* Right: Value Capsule */}
                  <div
                    style={{
                      padding: "3px 10px",
                      background: "rgba(255, 159, 67, 0.12)",
                      border: "1px solid rgba(255, 159, 67, 0.4)",
                      borderRadius: 6,
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--accent-amber, #FF9F43)",
                      minWidth: 60,
                      textAlign: "center"
                    }}
                  >
                    <span style={{ fontSize: 9, opacity: 0.6, marginRight: 4 }}>VAL:</span>
                    {typeof ent.value === "object" ? JSON.stringify(ent.value) : String(ent.value)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: "14px", textAlign: "center", color: "var(--container-text-dim, var(--txt-dim, #6E7681))", fontFamily: "var(--font-mono)", fontSize: 11 }}>
            [ Bucket Bank Empty — Insert pairs with <code>map.put(key, value)</code> ]
          </div>
        )}
      </div>
    </div>
  );
}


/**
 * Diagrammatic Sliding Window Visualizer
 * Renders an animated, high-contrast ribbon of elements with an active glowing
 * window bracket between left and right pointers, dynamic substring tracking,
 * and live window valid/invalid replacement diagnostics.
 */
export function DiagrammaticSlidingWindow({
  name = "s",
  type = "String",
  items = [],
  leftIndex = 0,
  rightIndex = 0,
  leftName = "left",
  rightName = "right",
  windowString = "",
  windowLength = 0,
  frequency = {},
  k = null,
  maxCount = null,
  maxLen = null,
  isValid = null,
  statusText = ""
}) {
  const count = items.length;
  const isString = type === "String";
  const clampedL = Math.max(0, Math.min(leftIndex, count - 1));
  const clampedR = Math.max(0, Math.min(rightIndex, count - 1));
  const inWindow = rightIndex >= leftIndex && leftIndex >= 0 && rightIndex < count;

  return (
    <div className="ds-block diagrammatic-sliding-window-block" style={{ marginBottom: 24 }}>
      {/* ── Title & Live Geometry HUD ─────────────────────── */}
      <div className="ds-title" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span>Sliding Window: <strong style={{ color: "var(--container-text-primary, var(--txt-bright, #F0F6FC))" }}>{name}</strong></span>
          <span style={{ fontSize: 10, padding: "2px 8px", background: "rgba(255, 159, 67, 0.15)", color: "var(--accent-amber, #FF9F43)", borderRadius: 4, fontWeight: 600 }}>
            {isString ? "String Window Ribbon" : "Array Subarray Ribbon"}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", padding: "2px 6px", background: "var(--container-card-bg, var(--bg-raised, #1C2128))", borderRadius: 4, border: "1px solid var(--border-subtle, #21262D)", color: "var(--container-text-dim, var(--txt-dim, #6E7681))" }}>
            Window: <strong style={{ color: "var(--accent-cyan, #38D9C5)" }}>[{leftName}:{leftIndex}..{rightName}:{rightIndex}]</strong>
          </span>
          <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", padding: "2px 6px", background: "var(--container-card-bg, var(--bg-raised, #1C2128))", borderRadius: 4, border: "1px solid var(--border-subtle, #21262D)", color: "var(--container-text-dim, var(--txt-dim, #6E7681))" }}>
            Len: <strong style={{ color: "var(--container-text-primary, var(--txt-bright, #F0F6FC))" }}>{windowLength}</strong>
          </span>
          {k !== null && (
            <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", padding: "2px 6px", background: "rgba(56, 217, 197, 0.12)", borderRadius: 4, border: "1px solid rgba(56, 217, 197, 0.3)", color: "var(--accent-cyan, #38D9C5)" }}>
              Budget: <strong>k = {k}</strong>
            </span>
          )}
          {maxCount !== null && (
            <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", padding: "2px 6px", background: "var(--container-card-bg, var(--bg-raised, #1C2128))", borderRadius: 4, border: "1px solid var(--border-subtle, #21262D)", color: "var(--txt-dim, #6E7681)" }}>
              Max Freq: <strong style={{ color: "var(--accent-amber, #FF9F43)" }}>{maxCount}</strong>
            </span>
          )}
          {maxLen !== null && (
            <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", padding: "2px 6px", background: "rgba(255, 159, 67, 0.15)", borderRadius: 4, border: "1px solid rgba(255, 159, 67, 0.4)", color: "var(--accent-amber, #FF9F43)" }}>
              Best Len: <strong>{maxLen}</strong>
            </span>
          )}
          {isValid !== null && (
            <span style={{
              fontSize: 10,
              fontFamily: "var(--font-mono)",
              padding: "2px 8px",
              borderRadius: 4,
              fontWeight: 700,
              background: isValid ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
              border: `1px solid ${isValid ? "rgba(16, 185, 129, 0.4)" : "rgba(239, 68, 68, 0.4)"}`,
              color: isValid ? "#10B981" : "#EF4444"
            }}>
              {isValid ? "✓ VALID (EXPAND)" : "⚠ INVALID (SHRINK)"}
            </span>
          )}
        </div>
      </div>

      {/* ── Active Window String & Diagnostics Subheader ── */}
      <div style={{
        margin: "10px 14px 14px",
        padding: "8px 12px",
        borderRadius: 6,
        background: "var(--container-card-bg, var(--bg-raised, #161B22))",
        border: "1px solid var(--container-card-border, var(--border-subtle, #21262D))",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 8
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: "var(--txt-dim, #6E7681)", fontFamily: "var(--font-mono)" }}>
            Current Window:
          </span>
          <span style={{
            fontSize: 13,
            fontFamily: "var(--font-mono)",
            fontWeight: 700,
            color: "var(--accent-cyan, #38D9C5)",
            background: "rgba(56, 217, 197, 0.1)",
            padding: "2px 8px",
            borderRadius: 4,
            border: "1px solid rgba(56, 217, 197, 0.3)",
            letterSpacing: "0.1em"
          }}>
            {inWindow ? `"${windowString}"` : "[ Empty Window ]"}
          </span>
        </div>

        {statusText && (
          <div style={{
            fontSize: 11,
            fontFamily: "var(--font-mono)",
            color: isValid === false ? "#EF4444" : "var(--accent-amber, #FF9F43)"
          }}>
            {statusText}
          </div>
        )}

        {/* Character Frequencies Pill List */}
        {Object.keys(frequency).length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, color: "var(--txt-dim, #6E7681)", fontFamily: "var(--font-mono)" }}>Window Freq:</span>
            {Object.entries(frequency).map(([ch, cnt]) => (
              <span key={ch} style={{
                fontSize: 10.5,
                fontFamily: "var(--font-mono)",
                padding: "1px 6px",
                borderRadius: 4,
                background: "rgba(255, 159, 67, 0.12)",
                border: "1px solid rgba(255, 159, 67, 0.3)",
                color: "var(--accent-amber, #FF9F43)"
              }}>
                <strong>'{ch}'</strong>:{cnt}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Visual Ribbon Cells & Pointers ───────────────── */}
      <div style={{
        overflowX: "auto",
        padding: "12px 14px 18px",
        background: "var(--bg-canvas, #090B0E)",
        borderRadius: "0 0 8px 8px"
      }}>
        {/* Row 1: Index Numbers */}
        <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
          {items.map((_, idx) => (
            <div
              key={idx}
              style={{
                width: 38,
                textAlign: "center",
                fontSize: 10,
                fontFamily: "var(--font-mono)",
                color: (idx >= clampedL && idx <= clampedR) ? "var(--accent-cyan, #38D9C5)" : "var(--txt-dim, #6E7681)",
                fontWeight: (idx >= clampedL && idx <= clampedR) ? 700 : 400
              }}
            >
              {idx}
            </div>
          ))}
        </div>

        {/* Row 2: Character/Element Cells with Window Highlighting */}
        <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
          {items.map((item, idx) => {
            const isInside = idx >= clampedL && idx <= clampedR;
            const isLeft = idx === leftIndex;
            const isRight = idx === rightIndex;

            return (
              <div
                key={idx}
                style={{
                  width: 38,
                  height: 44,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 6,
                  fontFamily: "var(--font-mono)",
                  fontSize: 16,
                  fontWeight: 700,
                  transition: "all 0.2s ease",
                  background: isInside
                    ? "rgba(255, 159, 67, 0.15)"
                    : "rgba(255, 255, 255, 0.03)",
                  border: isLeft && isRight
                    ? "2px solid #38D9C5"
                    : isLeft
                      ? "2px solid #38D9C5"
                      : isRight
                        ? "2px solid #FF9F43"
                        : isInside
                          ? "1px solid rgba(255, 159, 67, 0.5)"
                          : "1px solid var(--border-subtle, #21262D)",
                  boxShadow: isInside ? "0 0 12px rgba(255, 159, 67, 0.2)" : "none",
                  color: isInside ? "var(--txt-bright, #F0F6FC)" : "var(--txt-dim, #6E7681)",
                  opacity: isInside ? 1 : 0.45,
                  position: "relative"
                }}
              >
                {String(item)}
              </div>
            );
          })}
        </div>

        {/* Row 3: Pointers (Left and Right markers) */}
        <div style={{ display: "flex", gap: 6, minHeight: 28 }}>
          {items.map((_, idx) => {
            const isLeft = idx === leftIndex;
            const isRight = idx === rightIndex;

            if (!isLeft && !isRight) {
              return <div key={idx} style={{ width: 38 }} />;
            }

            return (
              <div
                key={idx}
                style={{
                  width: 38,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1
                }}
              >
                <span style={{ fontSize: 10, color: isLeft ? "#38D9C5" : "#FF9F43", lineHeight: 1 }}>▲</span>
                <span
                  style={{
                    fontSize: 9,
                    fontFamily: "var(--font-mono)",
                    fontWeight: 700,
                    padding: "1px 3px",
                    borderRadius: 3,
                    background: isLeft && isRight
                      ? "rgba(56, 217, 197, 0.2)"
                      : isLeft
                        ? "rgba(56, 217, 197, 0.2)"
                        : "rgba(255, 159, 67, 0.2)",
                    color: isLeft && isRight
                      ? "#38D9C5"
                      : isLeft
                        ? "#38D9C5"
                        : "#FF9F43",
                    whiteSpace: "nowrap"
                  }}
                >
                  {isLeft && isRight ? "L,R" : isLeft ? "L" : "R"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
