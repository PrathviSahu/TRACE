// TRACE — Hardening #4: Visualizer Data Contract Test Suite
import { runJava } from "../src/engine/interpreter.js";
import { normalizeStepData, formatObjectTree } from "../src/utils/visualizerAdapter.js";

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (!condition) {
    console.error("FAIL: " + message);
    throw new Error("Assertion failed: " + message);
  }
  passed++;
  console.log("PASS: " + message);
}

async function runTests() {
  console.log("========================================================");
  console.log("TRACE Hardening #4: Visualizer Contract Regression Suite");
  console.log("========================================================\n");

  // 1. Real array state reaches visualizer model
  {
    const code = "int[] nums = {10, 20, 30}; println(nums[0]);";
    const res = runJava(code);
    assert(res.trace.length > 0, "Test 1: Trace generated for real array");
    const step1 = res.trace[0];
    const norm1 = normalizeStepData(step1);
    assert(norm1.hasData === true, "Test 1: hasData is true for array step");
    assert(norm1.arrays.length === 1, "Test 1: exactly 1 array in normalized model");
    assert(norm1.arrays[0].name === "nums", "Test 1: array name is nums");
    assert(JSON.stringify(norm1.arrays[0].values) === JSON.stringify([10, 20, 30]), "Test 1: array values match real state [10, 20, 30]");
  }

  // 2. Array mutation reaches visualizer model
  {
    const code = "int[] nums = {1, 2, 3}; nums[1] = 99; println(nums[1]);";
    const res = runJava(code);
    const stepBeforeMut = res.trace[0];
    const stepMut = res.trace[1];
    const normBefore = normalizeStepData(stepBeforeMut);
    const normMut = normalizeStepData(stepMut, stepBeforeMut);
    assert(JSON.stringify(normBefore.arrays[0].values) === JSON.stringify([1, 2, 3]), "Test 2: values before mutation are [1, 2, 3]");
    assert(JSON.stringify(normMut.arrays[0].values) === JSON.stringify([1, 99, 3]), "Test 2: values after mutation are [1, 99, 3]");
    assert(JSON.stringify(normMut.arrays[0].prevValues) === JSON.stringify([1, 2, 3]), "Test 2: prevValues recorded for change tracking");
  }

  // 3. Variables correspond to selected trace step
  {
    const code = "int x = 5; x = 10; x = 20; println(x);";
    const res = runJava(code);
    assert(res.trace[0].variables.x.value === 5, "Test 3: Step 0 has x = 5");
    assert(res.trace[1].variables.x.value === 10, "Test 3: Step 1 has x = 10");
    assert(res.trace[2].variables.x.value === 20, "Test 3: Step 2 has x = 20");
    assert(res.trace[0].variables.x.value !== 20, "Test 3: Step 0 does not leak final value 20");
  }

  // 4. Object fields reach visualizer model
  {
    const code = "class ListNode { int val; } ListNode a = new ListNode(); a.val = 10;";
    const res = runJava(code);
    const lastStep = res.trace[res.trace.length - 1];
    const norm = normalizeStepData(lastStep);
    assert(norm.hasData === true, "Test 4: Object step hasData is true");
    assert(norm.objects.length === 1, "Test 4: Exactly 1 object found");
    assert(norm.objects[0].name === "a", "Test 4: Object name is a");
    assert(norm.objects[0].value.val === 10, "Test 4: Object field val is 10");
    const tree = formatObjectTree(norm.objects[0].value, "a");
    const valNode = tree.find(n => n.key === "val");
    assert(valNode && valNode.value === "10", "Test 4: formatObjectTree contains val: 10");
  }

  // 5. Nested object fields reach visualizer model
  {
    const code = "class ListNode { int val; ListNode next; } ListNode a = new ListNode(); a.val = 10; a.next = new ListNode(); a.next.val = 20; println(a.next.val);";
    const res = runJava(code);
    assert(res.output[0] === "20", "Test 5: Execution output is 20");
    const lastStep = res.trace[res.trace.length - 1];
    const norm = normalizeStepData(lastStep);
    assert(norm.objects.length === 1, "Test 5: Object root found");
    const tree = formatObjectTree(norm.objects[0].value, "a");
    assert(tree.some(n => n.depth === 1 && n.key === "val" && n.value === "10"), "Test 5: a.val is 10 at depth 1");
    assert(tree.some(n => n.depth === 1 && n.key === "next" && n.value === "ListNode"), "Test 5: a.next is ListNode at depth 1");
    assert(tree.some(n => n.depth === 2 && n.key === "val" && n.value === "20"), "Test 5: a.next.val is 20 at depth 2");
    assert(tree.some(n => n.depth === 2 && n.key === "next" && n.value === "null"), "Test 5: a.next.next is null at depth 2");
  }

  // 6. Collections use actual execution state
  {
    const code = "HashMap map = new HashMap(); map.put(\"alpha\", 100); Stack stack = new Stack(); stack.push(50); StringBuilder sb = new StringBuilder(); sb.append(\"hello\");";
    const res = runJava(code);
    const lastStep = res.trace[res.trace.length - 1];
    const norm = normalizeStepData(lastStep);
    assert(norm.collections.length === 3, "Test 6: 3 collections normalized");
    const mapCol = norm.collections.find(c => c.name === "map");
    assert(mapCol && mapCol.entries.length === 1 && mapCol.entries[0].key === "alpha" && mapCol.entries[0].value === 100, "Test 6: HashMap has alpha: 100");
    const stackCol = norm.collections.find(c => c.name === "stack");
    assert(stackCol && JSON.stringify(stackCol.items) === JSON.stringify([50]), "Test 6: Stack has [50]");
    const sbCol = norm.collections.find(c => c.name === "sb");
    assert(sbCol && sbCol.value === "hello", "Test 6: StringBuilder has hello");
  }

  // 7. Missing visualization data produces honest empty state
  {
    const normEmpty = normalizeStepData(null);
    assert(normEmpty.hasData === false, "Test 7: null step hasData is false");
    assert(normEmpty.arrays.length === 0, "Test 7: null step arrays is empty array");
    assert(normEmpty.collections.length === 0, "Test 7: null step collections is empty array");
    assert(normEmpty.objects.length === 0, "Test 7: null step objects is empty array");

    const scalarStep = {
      step: 1,
      statement: "int x = 42;",
      variables: { x: { value: 42, type: "int" } },
      arrays: {},
      collections: {}
    };
    const normScalar = normalizeStepData(scalarStep);
    assert(normScalar.hasData === false, "Test 7: scalar-only step hasData is false (honest empty state)");
    assert(normScalar.arrays.length === 0, "Test 7: no fake arrays fabricated");
  }

  // 8. No hardcoded Two Sum fallback is returned
  {
    const randomStep = {
      step: 2,
      statement: "int k = 100;",
      variables: { k: { value: 100, type: "int" } },
      arrays: {},
      collections: {}
    };
    const norm = normalizeStepData(randomStep);
    const jsonStr = JSON.stringify(norm);
    assert(!jsonStr.includes("2,7,11,15") && !jsonStr.includes("2, 7, 11, 15"), "Test 8: Normalized model has no [2, 7, 11, 15]");
    assert(!jsonStr.includes("twoSum"), "Test 8: Normalized model has no twoSum references");
  }

  // 9. Forward/backward step state remains deterministic
  {
    const code = "int a = 1; int b = 2; a = a + b; b = a * 2;";
    const res = runJava(code);
    const steps = res.trace;
    assert(steps.length >= 4, "Test 9: At least 4 steps");
    const fwdStep2 = normalizeStepData(steps[2], steps[1]);
    const fwdStep3 = normalizeStepData(steps[3], steps[2]);
    const bwdStep2 = normalizeStepData(steps[2], steps[1]);
    assert(JSON.stringify(fwdStep2) === JSON.stringify(bwdStep2), "Test 9: Backward navigation produces identical deterministic state");
  }

  // 10. Existing Two Sum execution remains intact
  {
    const code = "class Solution { public int[] twoSum(int[] nums, int target) { for (int i = 0; i < nums.length; i++) { for (int j = i + 1; j < nums.length; j++) { if (nums[i] + nums[j] == target) return new int[]{i, j}; } } return new int[]{}; } }";
    const res = runJava(code, { nums: "[2, 7, 11, 15]", target: "9" });
    assert(JSON.stringify(res.returnValue) === JSON.stringify([0, 1]), "Test 10: Two sum returns [0, 1]");
    assert(res.trace.length > 5, "Test 10: Trace contains multiple execution steps");
    const midStep = res.trace[3];
    const normMid = normalizeStepData(midStep);
    assert(normMid.arrays.length > 0, "Test 10: Arrays exist in Two Sum trace");
    assert(normMid.arrays[0].values.length === 4, "Test 10: Real nums array length is 4");
  }

  console.log("\n========================================================");
  console.log("Hardening #4 Contract Suite: " + passed + "/" + total + " PASSED");
  console.log("========================================================");
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});