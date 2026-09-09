import React from "react";

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
          <span>Stack: <strong style={{ color: "var(--txt-bright, #F0F6FC)" }}>{name}</strong></span>
          <span style={{ fontSize: 10, padding: "2px 8px", background: "rgba(255, 159, 67, 0.15)", color: "var(--accent-amber, #FF9F43)", borderRadius: 4, fontWeight: 600 }}>
            LIFO Beaker
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", padding: "2px 6px", background: "var(--bg-raised, #1C2128)", borderRadius: 4, border: "1px solid var(--border-subtle, #21262D)", color: "var(--txt-dim, #6E7681)" }}>
            Size: <strong style={{ color: "var(--txt-bright, #F0F6FC)" }}>{count}</strong>
          </span>
          <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", padding: "2px 6px", background: "var(--bg-raised, #1C2128)", borderRadius: 4, border: "1px solid var(--border-subtle, #21262D)", color: "var(--txt-dim, #6E7681)" }}>
            SP: <strong style={{ color: "var(--accent-amber, #FF9F43)" }}>{isNotEmpty ? `[${count - 1}]` : "None"}</strong>
          </span>
          <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", padding: "2px 6px", background: "var(--bg-raised, #1C2128)", borderRadius: 4, border: "1px solid var(--border-subtle, #21262D)", color: "var(--txt-dim, #6E7681)" }}>
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
            background: "linear-gradient(180deg, rgba(255,159,67,0.02) 0%, rgba(19,23,29,0.95) 100%)",
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
              background: "var(--bg-raised, #1C2128)",
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
                      background: isTop ? "rgba(255, 159, 67, 0.18)" : "var(--bg-raised, #1C2128)",
                      border: isTop ? "1.5px solid var(--accent-amber, #FF9F43)" : "1px solid var(--border-subtle, #21262D)",
                      borderRadius: 4,
                      fontFamily: "var(--font-mono)",
                      boxShadow: isTop ? "0 0 10px rgba(255, 159, 67, 0.3)" : "none",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 10, color: isTop ? "var(--accent-amber, #FF9F43)" : "var(--txt-dim, #6E7681)", fontWeight: 600 }}>
                        [{origIdx}]
                      </span>
                      <span style={{ fontWeight: isTop ? 700 : 500, fontSize: 13, color: isTop ? "var(--txt-bright, #F0F6FC)" : "var(--txt-main, #C9D1D9)" }}>
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
              <div style={{ padding: "30px 10px", textAlign: "center", color: "var(--txt-dim, #6E7681)", fontFamily: "var(--font-mono)", fontSize: 11 }}>
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
              color: "var(--txt-dim, #6E7681)",
              borderTop: "1px solid rgba(255, 159, 67, 0.3)",
              letterSpacing: 1
            }}
          >
            ════ BASE ════
          </div>
        </div>

        {/* Stack Explanation Diagnostics */}
        <div style={{ flex: 1, minWidth: 200, padding: 12, background: "var(--bg-surface, #13171D)", border: "1px solid var(--border-subtle, #21262D)", borderRadius: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--txt-bright, #F0F6FC)", marginBottom: 8 }}>
            LIFO Execution Semantics
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 11, color: "var(--txt-dim, #6E7681)", lineHeight: 1.6 }}>
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
          <span>Queue: <strong style={{ color: "var(--txt-bright, #F0F6FC)" }}>{name}</strong></span>
          <span style={{ fontSize: 10, padding: "2px 8px", background: "rgba(56, 217, 197, 0.15)", color: "var(--accent-cyan, #38D9C5)", borderRadius: 4, fontWeight: 600 }}>
            FIFO Pipeline
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", padding: "2px 6px", background: "var(--bg-raised, #1C2128)", borderRadius: 4, border: "1px solid var(--border-subtle, #21262D)", color: "var(--txt-dim, #6E7681)" }}>
            Size: <strong style={{ color: "var(--txt-bright, #F0F6FC)" }}>{count}</strong>
          </span>
          <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", padding: "2px 6px", background: "var(--bg-raised, #1C2128)", borderRadius: 4, border: "1px solid var(--border-subtle, #21262D)", color: "var(--txt-dim, #6E7681)" }}>
            Head: <strong style={{ color: "var(--accent-amber, #FF9F43)" }}>{isNotEmpty ? String(items[0]) : "null"}</strong>
          </span>
          <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", padding: "2px 6px", background: "var(--bg-raised, #1C2128)", borderRadius: 4, border: "1px solid var(--border-subtle, #21262D)", color: "var(--txt-dim, #6E7681)" }}>
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
            background: "linear-gradient(90deg, rgba(56,217,197,0.05) 0%, rgba(19,23,29,0.9) 100%)",
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
                    background: isFront ? "rgba(255, 159, 67, 0.16)" : "var(--bg-raised, #1C2128)",
                    border: isFront ? "1.5px solid var(--accent-amber, #FF9F43)" : "1px solid var(--border-subtle, #21262D)",
                    borderRadius: 4,
                    minWidth: 42,
                    textAlign: "center",
                    fontFamily: "var(--font-mono)",
                    boxShadow: isFront ? "0 0 8px rgba(255, 159, 67, 0.25)" : "none"
                  }}
                >
                  <span style={{ fontSize: 9, color: isFront ? "var(--accent-amber, #FF9F43)" : "var(--txt-dim, #6E7681)", marginBottom: 2 }}>
                    [{idx}]
                  </span>
                  <span style={{ fontWeight: isFront ? 700 : 500, fontSize: 13, color: isFront ? "var(--txt-bright, #F0F6FC)" : "var(--txt-main, #C9D1D9)" }}>
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
            <div style={{ padding: "8px 16px", color: "var(--txt-dim, #6E7681)", fontFamily: "var(--font-mono)", fontSize: 11 }}>
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
        <span>Linked List: <strong style={{ color: "var(--txt-bright, #F0F6FC)" }}>{name}</strong></span>
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
                      const color = isHead ? "#090B0E" : isCurr ? "var(--accent-cyan, #38D9C5)" : isPrev ? "#c792ea" : "var(--txt-bright, #F0F6FC)";

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
                      background: "var(--bg-raised, #1C2128)",
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
                        color: "var(--txt-bright, #F0F6FC)",
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

                  <span style={{ fontSize: 9, color: "var(--txt-dim, #6E7681)", fontFamily: "var(--font-mono)" }}>
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
                        color: "var(--txt-dim, #6E7681)",
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
        <span>Binary Tree: <strong style={{ color: "var(--txt-bright, #F0F6FC)" }}>{name}</strong></span>
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
                fill="var(--txt-dim, #6E7681)"
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
                fill="var(--bg-raised, #1C2128)"
                stroke={n.isRoot ? "var(--accent-amber, #FF9F43)" : "var(--accent-cyan, #38D9C5)"}
                strokeWidth={n.isRoot ? "2.5" : "2"}
                style={{ filter: "drop-shadow(0 2px 5px rgba(0,0,0,0.3))" }}
              />
              <text
                x={n.x}
                y={n.y + 4.5}
                textAnchor="middle"
                fill="var(--txt-bright, #F0F6FC)"
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
          <span>PriorityQueue: <strong style={{ color: "var(--txt-bright, #F0F6FC)" }}>{name}</strong></span>
          <span style={{ fontSize: 10, padding: "2px 8px", background: isMax ? "rgba(255, 159, 67, 0.15)" : "rgba(56, 217, 197, 0.15)", color: isMax ? "var(--accent-amber, #FF9F43)" : "var(--accent-cyan, #38D9C5)", borderRadius: 4, fontWeight: 600 }}>
            {heapLabel} ({count} items)
          </span>
        </div>
        <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--txt-dim, #6E7681)" }}>
          Peek / Root: <strong style={{ color: "var(--accent-amber, #FF9F43)" }}>{isNotEmpty ? formatPqVal(items[0]) : "null"}</strong>
        </span>
      </div>

      <div style={{ marginTop: 10, background: "var(--bg-surface, #13171D)", border: "1px solid var(--border-subtle, #21262D)", borderRadius: 8, padding: 12 }}>
        {/* Binary Heap Visual Guide */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, fontSize: 10, color: "var(--txt-dim, #6E7681)", fontFamily: "var(--font-mono)" }}>
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
                    background: isRoot ? "rgba(255, 159, 67, 0.16)" : "var(--bg-raised, #1C2128)",
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
                    <span style={{ fontSize: 9, color: isRoot ? "var(--accent-amber, #FF9F43)" : "var(--txt-dim, #6E7681)", fontWeight: 700 }}>
                      [{idx}]
                    </span>
                    {!isRoot && (
                      <span style={{ fontSize: 8, color: "var(--txt-dim, #6E7681)" }}>
                        p:{parentIdx}
                      </span>
                    )}
                  </div>
                  <span style={{ fontWeight: isRoot ? 700 : 500, fontSize: 13, color: isRoot ? "var(--txt-bright, #F0F6FC)" : "var(--txt-main, #C9D1D9)" }}>
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
            <div style={{ padding: "8px 12px", color: "var(--txt-dim, #6E7681)", fontFamily: "var(--font-mono)", fontSize: 11 }}>
              [ Empty Priority Queue ]
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
