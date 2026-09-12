const assert = require("assert");
const { ALL_PROBLEMS } = require("../src/data/roadmapProblems.js");
const { CURATED_PROBLEM_PATTERNS } = require("../src/data/patternMapping.js");
const { PROBLEM_DESCRIPTIONS, getProblemDescription } = require("../src/data/problemDescriptions.js");
const { PRESET_SOLUTIONS, getProblemTemplate } = require("../src/data/problemTemplates.js");
const { PROBLEM_SOLUTIONS, getProblemSolutions } = require("../src/data/problemSolutions.js");
const { COMPANY_DATA } = require("../src/data/companyData.js");
const { runJava } = require("../src/engine/interpreter.js");
const { detectSlidingWindow } = require("../src/utils/visualizerAdapter.js");

console.log("=== RUNNING LEETCODE 567 INTEGRATION SUITE ===");

// 1. Roadmap & Pattern Registration
const p567 = ALL_PROBLEMS.find(p => p.id === 567);
assert(p567, "LeetCode 567 must exist in ALL_PROBLEMS");
assert.strictEqual(p567.name, "Permutation in String");
assert.strictEqual(p567.difficulty, "medium");
console.log("✓ Roadmap problem registration verified");

const pattern567 = CURATED_PROBLEM_PATTERNS["567"];
assert(pattern567, "LeetCode 567 must exist in PATTERN_MAPPING");
assert.deepStrictEqual(pattern567.patterns, ["Sliding Window", "Frequency Counting", "Two Pointers"]);
console.log("✓ Pattern mapping verified");

// 2. Problem Description
const desc567 = getProblemDescription(567);
assert(desc567, "Problem description for 567 must exist");
assert.strictEqual(desc567.title, "Permutation in String");
assert(desc567.examples.length >= 2, "Must have at least 2 examples");
console.log("✓ Problem description and examples verified");

// 3. Problem Template
const template567 = getProblemTemplate({ id: 567 });
assert(template567.isPreset, "567 must be a preset solution");
assert(template567.inputs.s1 && template567.inputs.s2, "Must have s1 and s2 inputs");
console.log("✓ Problem template and inputs verified");

// 4. Solutions (3 approaches)
const solutions567 = getProblemSolutions(567);
assert(solutions567 && solutions567.approaches.length === 3, "Must have 3 approaches for 567");
console.log("✓ 3 solution approaches verified in problemSolutions");

// 5. Run Java Execution on Case 1 (Positive)
const res1 = runJava(template567.code, { s1: "ab", s2: "eidbaooo" });
assert.strictEqual(res1.returnValue, true, "Case 1 must return true");
assert(!res1.error, "Must have no execution error");
assert(res1.trace.length > 50, "Trace must have sufficient steps");
console.log(`✓ Case 1 execution verified: returns true in ${res1.trace.length} steps`);

// 6. Run Java Execution on Case 2 (Negative)
const res2 = runJava(template567.code, { s1: "ab", s2: "eidboaoo" });
assert.strictEqual(res2.returnValue, false, "Case 2 must return false");
assert(!res2.error, "Must have no execution error");
console.log(`✓ Case 2 execution verified: returns false in ${res2.trace.length} steps`);

// 7. Visualizer Adapter & Sliding Window Detection
let foundValidWindow = false;
let verifiedSequenceName = false;
for (const step of res1.trace) {
  const windowData = detectSlidingWindow(step);
  if (windowData) {
    if (windowData.seqName === "s2") {
      verifiedSequenceName = true;
    }
    if (windowData.windowStr === "ba" && windowData.isValid === true) {
      foundValidWindow = true;
      assert.strictEqual(windowData.statusText, 'Permutation Found in Window "ba"!');
    }
  }
}
assert(verifiedSequenceName, "Sliding window must pick s2 as the sequence");
assert(foundValidWindow, "Sliding window must detect valid permutation window 'ba'");
console.log("✓ Diagrammatic Sliding Window detection and diagnostics verified for 567");

// 8. All 3 approaches run correctly
for (const app of solutions567.approaches) {
  const rPos = runJava(app.code, { s1: "ab", s2: "eidbaooo" });
  assert.strictEqual(rPos.returnValue, true, `${app.name} must return true for Case 1`);
  const rNeg = runJava(app.code, { s1: "ab", s2: "eidboaoo" });
  assert.strictEqual(rNeg.returnValue, false, `${app.name} must return false for Case 2`);
  console.log(`✓ Approach "${app.name}" passed both test cases`);
}

// 9. Verify COMPANY_DATA fallback logic
const testQueries = ["567", "#567", "Permutation in String", "permutation"];
for (const q of testQueries) {
  const trimmed = String(q).trim().replace(/^#/, "");
  const num = parseInt(trimmed, 10);
  let prob = null;
  if (!isNaN(num)) prob = ALL_PROBLEMS.find(p => p.id === num);
  if (!prob) prob = ALL_PROBLEMS.find(p => p.name.toLowerCase().includes(trimmed.toLowerCase()));
  if (!prob && !isNaN(num)) {
    const d = PROBLEM_DESCRIPTIONS[num];
    if (d) prob = { id: num, name: d.title, difficulty: d.difficulty, topic: d.category };
  }
  if (!prob) {
    const qLower = trimmed.toLowerCase();
    for (const comp of Object.values(COMPANY_DATA)) {
      const list = [...(comp.thirtyDays || []), ...(comp.sixMonths || [])];
      const found = list.find(p => (!isNaN(num) && p.id === num) || (p.title && p.title.toLowerCase().includes(qLower)));
      if (found) {
        prob = { id: found.id, name: found.title, difficulty: (found.difficulty || "medium").toLowerCase() };
        break;
      }
    }
  }
  assert(prob, `Query "${q}" must resolve a problem`);
  assert.strictEqual(prob.id, 567, `Query "${q}" must resolve to ID 567`);
}
console.log("✓ Quick-fetch query resolution verified for all query formats");

console.log("\n>>> ALL LEETCODE 567 TESTS PASSED SUCCESSFULLY! <<<");
