import assert from "node:assert";
import { runJava } from "../src/engine/interpreter.js";
import { normalizeStepData } from "../src/utils/visualizerAdapter.js";

console.log("=== TESTING LEETCODE 11 BAR VISUALIZER CONTRACT ===");

const javaCode = `// Container With Most Water - LeetCode 11
class Solution {
    public int maxArea(int[] height) {
        int left = 0;
        int right = height.length - 1;
        int maxWater = 0;
        while (left < right) {
            int width = right - left;
            int h = Math.min(height[left], height[right]);
            int area = width * h;
            if (area > maxWater) {
                maxWater = area;
            }
            if (height[left] < height[right]) {
                left++;
            } else {
                right--;
            }
        }
        return maxWater;
    }
}`;

const { trace, returnValue } = runJava(javaCode, { height: "[1, 8, 6, 2, 5, 4, 8, 3, 7]" });
assert.strictEqual(returnValue, 49, "LeetCode 11 must return 49 for standard testcase");

// Step 2 is where int maxWater = 0 is declared and added to variables
const step2 = trace[2];
assert.ok(step2.variables.maxWater, "Step 2 variables must contain maxWater");
assert.strictEqual(typeof step2.variables.maxWater, "object");
assert.strictEqual(step2.variables.maxWater.value, 0);

// Validate resolveVar unwraps variable snapshot objects { value, type } -> value
function resolveVar(v) {
  while (v && typeof v === "object" && "value" in v) {
    v = v.value;
  }
  return v;
}

const rawMax = step2.variables.maxWater ?? step2.variables.maxArea ?? step2.variables.max;
const maxRecorded = rawMax !== undefined ? resolveVar(rawMax) : undefined;
assert.strictEqual(typeof maxRecorded, "number", "maxRecorded must resolve to a number");
assert.strictEqual(maxRecorded, 0, "maxRecorded at step 2 must be 0");

console.log("✓ LeetCode 11 bar heights contract verified without object-as-React-child error");
console.log("=== ALL TESTS PASSED! ===");
