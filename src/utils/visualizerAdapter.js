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

  const slidingWindow = detectSlidingWindow(stepData, arrays);
  const hasData = arrays.length > 0 || collections.length > 0 || objects.length > 0 || !!slidingWindow;

  return {
    hasData,
    slidingWindow,
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


/**
 * Detects whether the current step state constitutes a sliding window on a string or array.
 */
export function detectSlidingWindow(stepData, arrays = []) {
  if (!stepData || !stepData.variables) return null;
  const vars = stepData.variables;

  // 1. Find left and right window pointers first to determine search space bounds
  const leftNames = ['left', 'l', 'start', 'windowStart', 'i', 'p1', 'low'];
  const rightNames = ['right', 'r', 'end', 'windowEnd', 'j', 'p2', 'high'];

  let leftPtr = null;
  for (const name of leftNames) {
    const rawVal = vars[name]?.value;
    if (rawVal !== undefined && typeof rawVal === 'number' && Number.isInteger(rawVal)) {
      leftPtr = { name, index: rawVal };
      break;
    }
  }

  let rightPtr = null;
  for (const name of rightNames) {
    const rawVal = vars[name]?.value;
    if (rawVal !== undefined && typeof rawVal === 'number' && Number.isInteger(rawVal)) {
      if (!leftPtr || name !== leftPtr.name) {
        rightPtr = { name, index: rawVal };
        break;
      }
    }
  }

  // Need at least one window pointer
  if (!leftPtr && !rightPtr) return null;

  const maxPtrVal = Math.max(leftPtr?.index ?? 0, rightPtr?.index ?? 0);

  // 2. Find sequence (string or array)
  let seqName = null;
  let seqType = null;
  let seqItems = [];

  // Candidate strings
  const stringCandidates = [];
  for (const [vName, vInfo] of Object.entries(vars)) {
    const val = vInfo?.value;
    if (typeof val === 'string' && val.length >= 2) {
      stringCandidates.push({ name: vName, val });
    }
  }

  if (stringCandidates.length > 0) {
    stringCandidates.sort((a, b) => {
      const aFits = a.val.length > maxPtrVal;
      const bFits = b.val.length > maxPtrVal;
      if (aFits && !bFits) return -1;
      if (!aFits && bFits) return 1;
      if (a.val.length !== b.val.length) return b.val.length - a.val.length;
      const preferred = ['s', 's2', 'text', 'str', 'string', 'word', 'pattern', 's1'];
      const aRank = preferred.indexOf(a.name) !== -1 ? preferred.indexOf(a.name) : 99;
      const bRank = preferred.indexOf(b.name) !== -1 ? preferred.indexOf(b.name) : 99;
      return aRank - bRank;
    });
    seqName = stringCandidates[0].name;
    seqType = 'string';
    seqItems = stringCandidates[0].val.split('');
  }

  // If no string sequence found, check arrays (skip frequency/counter arrays)
  if (!seqName && arrays && arrays.length > 0) {
    for (const arr of arrays) {
      if (!/^(count|counts|freq|frequency|dp|memo)$/i.test(arr.name) && Array.isArray(arr.values) && arr.values.length >= 2) {
        seqName = arr.name;
        seqType = 'array';
        seqItems = [...arr.values];
        break;
      }
    }
  }

  if (!seqName || seqItems.length === 0) return null;

  const leftIdx = leftPtr ? leftPtr.index : 0;
  const rightIdx = rightPtr ? rightPtr.index : (seqItems.length - 1);

  // Clamp active slice
  const clampedL = Math.max(0, Math.min(leftIdx, seqItems.length - 1));
  const clampedR = Math.max(0, Math.min(rightIdx, seqItems.length - 1));
  const inWindow = rightIdx >= leftIdx && leftIdx >= 0 && rightIdx < seqItems.length;
  const windowItems = inWindow ? seqItems.slice(clampedL, clampedR + 1) : [];
  const windowStr = seqType === 'string' ? windowItems.join('') : JSON.stringify(windowItems);
  const windowLen = inWindow ? (rightIdx - leftIdx + 1) : 0;

  // Window frequency breakdown
  const windowFreq = {};
  let currentWindowMaxFreq = 0;
  for (const item of windowItems) {
    const key = String(item);
    windowFreq[key] = (windowFreq[key] || 0) + 1;
    if (windowFreq[key] > currentWindowMaxFreq) {
      currentWindowMaxFreq = windowFreq[key];
    }
  }

  const kVal = vars.k?.value !== undefined && typeof vars.k.value === 'number' ? vars.k.value : null;
  const maxCountVal = vars.maxCount?.value !== undefined && typeof vars.maxCount.value === 'number' ? vars.maxCount.value : null;
  const maxLenVal = vars.maxLen?.value !== undefined && typeof vars.maxLen.value === 'number' ? vars.maxLen.value : null;

  const matchVal = vars.match?.value !== undefined ? vars.match.value : (vars.matches?.value !== undefined ? vars.matches.value : null);
  let isValid = null;
  let statusText = '';
  if (kVal !== null) {
    const effectiveMax = currentWindowMaxFreq > 0 ? currentWindowMaxFreq : (maxCountVal || 0);
    const replacements = Math.max(0, windowLen - effectiveMax);
    isValid = replacements <= kVal;
    statusText = isValid
      ? `Valid Window: ${replacements} replacement${replacements === 1 ? '' : 's'} <= k (${kVal})`
      : `Invalid Window: ${replacements} replacements > k (${kVal}) → Shrink Left`;
  } else if (matchVal !== null) {
    if (typeof matchVal === 'boolean') {
      isValid = matchVal;
      statusText = matchVal ? `Permutation Found in Window "${windowStr}"!` : `Window "${windowStr}" — Frequency Mismatch`;
    } else if (typeof matchVal === 'number') {
      isValid = matchVal === 26;
      statusText = isValid ? `All 26 Characters Match — Permutation Found!` : `Matches: ${matchVal}/26`;
    }
  } else if (maxCountVal !== null) {
    statusText = `Max Count: ${maxCountVal}`;
  }

  return {
    seqName,
    seqType,
    seqItems,
    leftPtr,
    rightPtr,
    leftIdx,
    rightIdx,
    windowItems,
    windowStr,
    windowLen,
    windowFreq,
    kVal,
    maxCountVal,
    maxLenVal,
    isValid,
    statusText
  };
}
