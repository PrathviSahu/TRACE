// ─────────────────────────────────────────────────────────────
//  TRACE — Visualizer ↔ Engine Data Contract Adapter
//  Normalizes execution trace state into structured visualizer models.
//  Zero hardcoded demo state. Pure deterministic transformation.
// ─────────────────────────────────────────────────────────────

const BUILT_IN_COLLECTIONS = new Set([
  "Stack", "Queue", "HashMap", "HashSet", "StringBuilder",
  "ArrayList", "ArrayDeque", "PriorityQueue", "Vector",
  "TreeMap", "TreeSet", "LinkedHashMap", "LinkedHashSet"
]);

/**
 * Normalizes an execution trace step for rendering in VisualizerStudio.
 *
 * @param {Object|null} stepData - Current step record from trace[currentStep]
 * @param {Object|null} prevStepData - Previous step record for change tracking
 * @returns {Object} Normalized visualizer model
 */
export function normalizeStepData(stepData, prevStepData = null) {
  if (!stepData) {
    return {
      hasData: false,
      arrays: [],
      collections: [],
      objects: [],
      variables: {},
      callStack: [],
      explanation: {
        lineText: "Ready to execute",
        summary: "No active execution step.",
        bullets: [
          "Enter or modify Java/Python code in the editor.",
          "Click Run to execute against the engine.",
          "Step through the timeline to see live memory updates."
        ],
        why: "TRACE visualizes real algorithm execution state at every step."
      }
    };
  }

  // ── 1. Arrays ──────────────────────────────────────────────
  const arrays = [];
  if (stepData.arrays && Object.keys(stepData.arrays).length > 0) {
    for (const [name, arrInfo] of Object.entries(stepData.arrays)) {
      if (arrInfo && Array.isArray(arrInfo.values)) {
        const pointerList = [];
        if (arrInfo.pointers) {
          if (Array.isArray(arrInfo.pointers)) {
            pointerList.push(...arrInfo.pointers);
          } else {
            for (const [pName, pIdx] of Object.entries(arrInfo.pointers)) {
              if (pIdx !== undefined && pIdx !== null) {
                pointerList.push({ name: pName, index: Number(pIdx) });
              }
            }
          }
        }

        const prevValues = prevStepData?.arrays?.[name]?.values || null;

        arrays.push({
          name,
          type: arrInfo.type || "array",
          values: [...arrInfo.values],
          pointers: pointerList,
          rawPointers: arrInfo.pointers || {},
          prevValues
        });
      }
    }
  } else if (stepData.dataStructures?.array) {
    // Compatibility fallback for Python presets if present
    const raw = stepData.dataStructures.array;
    if (raw && Array.isArray(raw.values)) {
      arrays.push({
        name: raw.name || "array",
        type: "array",
        values: [...raw.values],
        pointers: Array.isArray(raw.pointers) ? raw.pointers : [],
        rawPointers: {},
        prevValues: null
      });
    }
  }

  // ── 2. Collections ──────────────────────────────────────────
  const collections = [];
  if (stepData.collections && Object.keys(stepData.collections).length > 0) {
    for (const [name, colInfo] of Object.entries(stepData.collections)) {
      if (!colInfo) continue;
      const colType = colInfo.__type || colInfo.type || "Collection";

      let entries = [];
      if (colType === "HashMap" || colType === "TreeMap" || colType === "LinkedHashMap") {
        if (colInfo.entries instanceof Map) {
          entries = Array.from(colInfo.entries.entries()).map(([k, v]) => ({ key: String(k), value: v }));
        } else if (Array.isArray(colInfo.entries)) {
          entries = colInfo.entries.map(e => {
            if (Array.isArray(e)) return { key: String(e[0]), value: e[1] };
            if (e && typeof e === "object" && "key" in e && "value" in e) return e;
            return { key: String(e), value: e };
          });
        } else if (colInfo.entries && typeof colInfo.entries === "object") {
          entries = Object.entries(colInfo.entries).map(([k, v]) => ({ key: String(k), value: v }));
        }
      }

      let items = [];
      if (Array.isArray(colInfo.items)) {
        items = [...colInfo.items];
      } else if (colInfo.items instanceof Set) {
        items = Array.from(colInfo.items);
      }

      collections.push({
        name,
        type: colType,
        items,
        entries,
        value: colInfo.value || "",
        lastOp: colInfo.lastOp || null,
        raw: colInfo
      });
    }
  } else if (stepData.dataStructures?.hashmap) {
    // Compatibility fallback for Python presets if present
    const raw = stepData.dataStructures.hashmap;
    if (raw && Array.isArray(raw.entries)) {
      collections.push({
        name: raw.name || "map",
        type: "HashMap",
        items: [],
        entries: [...raw.entries],
        value: "",
        raw
      });
    }
  }

  // ── 3. Objects (ListNode, TreeNode, Node, custom Java classes) ─
  const objects = [];
  if (stepData.variables) {
    for (const [varName, varInfo] of Object.entries(stepData.variables)) {
      if (varName === "this" || varName === "self") continue;
      const val = varInfo?.value;
      if (val && typeof val === "object" && val.__type && !BUILT_IN_COLLECTIONS.has(val.__type)) {
        objects.push({
          name: varName,
          type: varInfo.type || val.__type,
          className: val.__type,
          value: val
        });
      }
    }
  }

  // ── 4. Variables & Call Stack ───────────────────────────────
  const variables = stepData.variables || {};
  const callStack = stepData.callStack || [];

  // ── 5. Explanation ───────────────────────────────────────────
  let explanation;
  if (stepData.explanation?.lineText && stepData.explanation?.summary) {
    explanation = {
      lineText: stepData.explanation.lineText,
      summary: stepData.explanation.summary,
      bullets: stepData.explanation.bullets || [],
      why: stepData.explanation.why || "State updated."
    };
  } else {
    const lineText = stepData.statement
      ? `Line ${stepData.line}: ${stepData.statement}`
      : (stepData.line ? `Line ${stepData.line}` : `Step ${stepData.step}`);

    const summary = stepData.explanation?.title || stepData.explanation?.text || "Statement executed";

    const bullets = [];
    if (stepData.explanation?.changes && stepData.explanation.changes.length > 0) {
      for (const c of stepData.explanation.changes) {
        const fromStr = typeof c.from === "object" ? JSON.stringify(c.from) : String(c.from);
        const toStr = typeof c.to === "object" ? JSON.stringify(c.to) : String(c.to);
        bullets.push(`${c.name}: ${fromStr} → ${toStr}`);
      }
    } else if (stepData.explanation?.text) {
      bullets.push(...stepData.explanation.text.split("\n").map(s => s.trim()).filter(Boolean));
    } else {
      bullets.push(`Executed at line ${stepData.line}`);
    }

    let why = "Executing statement.";
    switch (stepData.type) {
      case "declaration":
        why = "Allocates and initializes variable in current scope.";
        break;
      case "assignment":
        why = "Mutates variable or data structure state based on expression evaluation.";
        break;
      case "condition":
      case "condition_if":
        why = "Evaluates branching condition to choose execution path.";
        break;
      case "condition_for":
      case "condition_while":
      case "loop_condition":
        why = "Evaluates loop boundary to decide if iteration continues.";
        break;
      case "output":
        why = "Emits output value to program output log.";
        break;
      case "call":
        why = "Pushes new frame onto call stack with argument bindings.";
        break;
      case "return":
        why = "Pops frame from call stack and returns value to caller.";
        break;
      case "done":
        why = "Program finished execution.";
        break;
    }

    explanation = { lineText, summary, bullets, why };
  }

  const hasData = arrays.length > 0 || collections.length > 0 || objects.length > 0;

  return {
    hasData,
    arrays,
    collections,
    objects,
    variables,
    callStack,
    explanation
  };
}

/**
 * Recursively converts a Java object representation into a flat list of
 * tree nodes with indentation and branch symbols for tree inspection.
 *
 * @param {Object} obj - The Java object instance
 * @param {string} rootName - Variable or field name
 * @param {number} depth - Current recursion depth
 * @param {WeakSet} seen - Circular reference detector
 * @returns {Array<{ depth: number, key: string, value: string, isLeaf: boolean }>}
 */
export function formatObjectTree(obj, rootName = "", depth = 0, seen = new WeakSet()) {
  const nodes = [];
  if (obj === null || obj === undefined) {
    return [{ depth, key: rootName, value: "null", isLeaf: true }];
  }
  if (typeof obj !== "object") {
    return [{ depth, key: rootName, value: String(obj), isLeaf: true }];
  }
  if (seen.has(obj) || depth > 4) {
    return [{ depth, key: rootName, value: `<${obj.__type || "Object"}>`, isLeaf: true }];
  }
  seen.add(obj);

  const className = obj.__type || "Object";
  nodes.push({ depth, key: rootName, value: className, isLeaf: false });

  // Fields to inspect: check obj.fields or direct properties
  const entries = [];
  if (obj.fields && typeof obj.fields === "object") {
    for (const [k, v] of Object.entries(obj.fields)) {
      entries.push([k, v]);
    }
  } else {
    for (const [k, v] of Object.entries(obj)) {
      if (k === "__type" || k === "args") continue;
      entries.push([k, v]);
    }
  }

  for (const [k, v] of entries) {
    if (v && typeof v === "object" && (v.__type || v.fields)) {
      nodes.push(...formatObjectTree(v, k, depth + 1, seen));
    } else {
      nodes.push({
        depth: depth + 1,
        key: k,
        value: v === null ? "null" : (v === undefined ? "undefined" : String(v)),
        isLeaf: true
      });
    }
  }

  return nodes;
}
