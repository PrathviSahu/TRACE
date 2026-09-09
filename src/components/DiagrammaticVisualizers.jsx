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
        <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--txt-dim, #6E7681)" }}>
          Size: {count} {count === 1 ? "element" : "elements"}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginTop: 10, flexWrap: "wrap" }}>
        {/* The Beaker */}
        <div
          style={{
            position: "relative",
            width: 240,
            minHeight: 140,
            background: "linear-gradient(180deg, rgba(255,159,67,0.02) 0%, rgba(19,23,29,0.95) 100%)",
            borderLeft: "3px solid var(--accent-amber, #FF9F43)",
            borderRight: "3px solid var(--accent-amber, #FF9F43)",
            borderBottom: "4px solid var(--accent-amber, #FF9F43)",
            borderTop: "1px dashed rgba(255, 159, 67, 0.3)",
            borderRadius: "0 0 8px 8px",
            padding: "12px 10px 8px 10px",
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
              [ Empty Stack — No Elements ]
            </div>
          )}

          {/* Base Plate */}
          <div
            style={{
              textAlign: "center",
              fontSize: 9,
              fontFamily: "var(--font-mono)",
              color: "var(--txt-dim, #6E7681)",
              borderTop: "1px solid var(--border-subtle, #21262D)",
              paddingTop: 4,
              marginTop: 2,
              letterSpacing: "1px"
            }}
          >
            ════ BASE ════
          </div>
        </div>

        {/* Diagnostic Legend / State */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 11, fontFamily: "var(--font-mono)" }}>
          <div style={{ padding: "6px 10px", background: "var(--bg-raised, #1C2128)", border: "1px solid var(--border-subtle, #21262D)", borderRadius: 4 }}>
            <span style={{ color: "var(--txt-dim, #6E7681)" }}>Stack Pointer (SP): </span>
            <strong style={{ color: isNotEmpty ? "var(--accent-amber, #FF9F43)" : "var(--txt-dim, #6E7681)" }}>
              {isNotEmpty ? count - 1 : "NULL (-1)"}
            </strong>
          </div>
          <div style={{ padding: "6px 10px", background: "var(--bg-raised, #1C2128)", border: "1px solid var(--border-subtle, #21262D)", borderRadius: 4 }}>
            <span style={{ color: "var(--txt-dim, #6E7681)" }}>Top Value (Peek): </span>
            <strong style={{ color: isNotEmpty ? "var(--txt-bright, #F0F6FC)" : "var(--txt-dim, #6E7681)" }}>
              {isNotEmpty ? String(items[count - 1]) : "Empty"}
            </strong>
          </div>
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
        <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--txt-dim, #6E7681)" }}>
          Size: {count} elements
        </span>
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
                    minWidth: 40,
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
                    <span style={{ fontSize: 8, fontWeight: 600, marginTop: 2, color: "var(--txt-dim, #6E7681)" }}>
                      TAIL
                    </span>
                  )}
                </div>
              );
            })
          ) : (
            <div style={{ padding: "8px 16px", color: "var(--txt-dim, #6E7681)", fontFamily: "var(--font-mono)", fontSize: 11 }}>
              empty queue
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

  while (curr && typeof curr === "object" && count < 20) {
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
                    {ptrs.map(p => (
                      <span
                        key={p}
                        style={{
                          fontSize: 9,
                          fontFamily: "var(--font-mono)",
                          fontWeight: 700,
                          padding: "1px 6px",
                          background: p === "head" ? "var(--accent-amber, #FF9F43)" : "rgba(56, 217, 197, 0.2)",
                          color: p === "head" ? "#090B0E" : "var(--accent-cyan, #38D9C5)",
                          borderRadius: 3,
                          boxShadow: "0 1px 4px rgba(0,0,0,0.3)"
                        }}
                      >
                        {p} ↓
                      </span>
                    ))}
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
                        fontFamily: "var(--font-mono)",
                        fontWeight: 700,
                        fontSize: 13,
                        color: "var(--txt-bright, #F0F6FC)",
                        borderRight: "1px solid var(--border-subtle, #21262D)",
                        background: "rgba(255, 255, 255, 0.02)",
                        minWidth: 32,
                        textAlign: "center"
                      }}
                    >
                      {String(node.val)}
                    </div>
                    {/* Next pointer dot */}
                    <div
                      style={{
                        padding: "8px 10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(56, 217, 197, 0.08)"
                      }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: "var(--accent-cyan, #38D9C5)",
                          boxShadow: "0 0 6px rgba(56, 217, 197, 0.6)"
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Arrow to next node */}
                <div style={{ display: "flex", alignItems: "center", padding: "0 2px", marginTop: 24 }}>
                  <svg width="24" height="14" viewBox="0 0 24 14" fill="none">
                    <line x1="0" y1="7" x2="18" y2="7" stroke="var(--accent-amber, #FF9F43)" strokeWidth="2" />
                    <polygon points="17,3 24,7 17,11" fill="var(--accent-amber, #FF9F43)" />
                  </svg>
                </div>
              </React.Fragment>
            );
          })}

          {/* Terminal NULL */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 24 }}>
            <div
              style={{
                padding: "7px 12px",
                border: "1px dashed var(--border-subtle, #21262D)",
                borderRadius: 6,
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                fontWeight: 600,
                color: "var(--txt-dim, #6E7681)",
                background: "rgba(0,0,0,0.2)"
              }}
            >
              NULL
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Diagrammatic Binary Tree
 * Renders an interactive SVG tree diagram with circular nodes,
 * connecting edges, and parent-child tree hierarchy.
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
      edges.push({ x1: x, y1: y, x2: leftX, y2: leftY });
      const leftSub = computeLayout(left, leftX, leftY, offset / 1.85, depth + 1);
      nodes.push(...leftSub.nodes);
      edges.push(...leftSub.edges);
    }

    if (right && typeof right === "object" && (right.val !== undefined || right.fields?.val !== undefined)) {
      const rightX = x + offset;
      const rightY = y + 54;
      edges.push({ x1: x, y1: y, x2: rightX, y2: rightY });
      const rightSub = computeLayout(right, rightX, rightY, offset / 1.85, depth + 1);
      nodes.push(...rightSub.nodes);
      edges.push(...rightSub.edges);
    }

    return { nodes, edges };
  }

  const { nodes, edges } = computeLayout(rootObj);
  if (nodes.length === 0) return null;

  // Compute SVG dimensions
  const minX = Math.min(...nodes.map(n => n.x)) - 30;
  const maxX = Math.max(...nodes.map(n => n.x)) + 30;
  const maxY = Math.max(...nodes.map(n => n.y)) + 30;
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
          {/* Edges */}
          {edges.map((e, idx) => (
            <line
              key={idx}
              x1={e.x1}
              y1={e.y1}
              x2={e.x2}
              y2={e.y2}
              stroke="var(--border-strong, #30363D)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
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
