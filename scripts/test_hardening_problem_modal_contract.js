// ─────────────────────────────────────────────────────────────
//  TRACE — Hardening #7 Test Suite: ProblemModal Template Contract
// ─────────────────────────────────────────────────────────────

import { getProblemTemplate, PRESET_SOLUTIONS } from '../src/data/problemTemplates.js';
import { runJava } from '../src/engine/interpreter.js';

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`PASS: ${message}`);
  passed++;
}

console.log('========================================================');
console.log('TRACE Hardening #7: ProblemModal Template Contract Suite');
console.log('========================================================\n');

// ── Test 1: Preset Problem (Object contract) ───────────────────
{
  const p = { id: 1, name: 'Two Sum', difficulty: 'Easy', topic: 'Array' };
  const t = getProblemTemplate(p);
  assert(t.isPreset === true, 'Test 1: Preset #1 Two Sum returns isPreset: true');
  assert(t.code.includes('class Solution'), 'Test 1: Preset contains class Solution');
  assert(t.inputs.nums && t.inputs.target, 'Test 1: Preset has nums and target inputs');
}

// ── Test 2: Non-Preset Problem (Object contract - String) ─────
{
  const p = { id: 999, name: 'Longest Palindromic Chunk', difficulty: 'Hard', topic: 'String' };
  const t = getProblemTemplate(p);
  assert(t.isPreset === false, 'Test 2: Non-preset returns isPreset: false');
  assert(t.code.includes('public int longestPalindromicChunk(String s)'), 'Test 2: Generates camelCase method from problem name');
  assert(t.inputs.s === 'leetcode', 'Test 2: Assigns matching String input');
}

// ── Test 3: Non-Preset Problem (Object contract - Matrix) ─────
{
  const p = { id: 888, name: 'Spiral Matrix Copy', difficulty: 'Medium', topic: 'Matrix' };
  const t = getProblemTemplate(p);
  assert(t.isPreset === false, 'Test 3: Non-preset Matrix returns isPreset: false');
  assert(t.code.includes('public int spiralMatrixCopy(int[][] matrix)'), 'Test 3: Generates matrix signature');
  assert(t.inputs.matrix.includes('[[1,2,3]'), 'Test 3: Assigns 2D array input');
}

// ── Test 4: Non-Preset Problem (Object contract - Binary Search) ─
{
  const p = { id: 777, name: 'Search In Rotated Range', difficulty: 'Medium', topic: 'Binary Search' };
  const t = getProblemTemplate(p);
  assert(t.code.includes('public int searchInRotatedRange(int[] nums, int target)'), 'Test 4: Generates binary search signature');
  assert(t.inputs.target === '8', 'Test 4: Assigns binary search target input');
}

// ── Test 5: Non-Preset Problem (Object contract - Dynamic Programming) ─
{
  const p = { id: 666, name: 'Climbing Ways Deluxe', difficulty: 'Easy', topic: 'Dynamic Programming' };
  const t = getProblemTemplate(p);
  assert(t.code.includes('public int climbingWaysDeluxe(int n)'), 'Test 5: Generates DP method signature');
  assert(t.inputs.n === '6', 'Test 5: Assigns DP input');
}

// ── Test 6: String Arguments Polymorphism (Old Caller Pattern) ─
{
  // Old bug pattern: getProblemTemplate(problem.name, problem.difficulty)
  let threw = false;
  let t = null;
  try {
    t = getProblemTemplate('Reverse Prefix of Word', 'Easy');
  } catch (e) {
    threw = true;
  }
  assert(!threw, 'Test 6: Passing (name, difficulty) strings does NOT throw TypeError');
  assert(t && t.code.includes('public int reversePrefixOfWord'), 'Test 6: Generates valid code from string arguments');
}

// ── Test 7: Missing or Undefined Fields Safety ─────────────────
{
  let threw = false;
  let t = null;
  try {
    t = getProblemTemplate({});
  } catch (e) {
    threw = true;
  }
  assert(!threw, 'Test 7: Empty object does not throw');
  assert(t && t.code.includes('solveProblem'), 'Test 7: Defaults to solveProblem(int[] nums)');

  let threwNull = false;
  try {
    getProblemTemplate(null);
  } catch (e) {
    threwNull = true;
  }
  assert(!threwNull, 'Test 7: null argument does not throw');
}

// ── Test 8: Executable Code Verification: String Template ──────
{
  const t = getProblemTemplate({ id: 999, name: 'Count Characters', difficulty: 'Easy', topic: 'String' });
  const res = runJava(t.code, t.inputs);
  assert(res.returnValue === 8, 'Test 8: Generated String template executes and returns string length 8');
}

// ── Test 9: Executable Code Verification: Matrix Template ──────
{
  const t = getProblemTemplate({ id: 888, name: 'Matrix Sum', difficulty: 'Medium', topic: 'Matrix' });
  const res = runJava(t.code, t.inputs);
  assert(res.returnValue === 45, 'Test 9: Generated Matrix template executes and sums 1..9 to 45');
}

// ── Test 10: Executable Code Verification: Binary Search Template ─
{
  const t = getProblemTemplate({ id: 777, name: 'Find Target Index', difficulty: 'Medium', topic: 'Binary Search' });
  const res = runJava(t.code, t.inputs);
  assert(res.returnValue === 3, 'Test 10: Generated Binary Search template finds target 8 at index 3');
}

// ── Test 11: Executable Code Verification: DP Template ─────────
{
  const t = getProblemTemplate({ id: 666, name: 'Fibonacci Step', difficulty: 'Easy', topic: 'Dynamic Programming' });
  const res = runJava(t.code, t.inputs);
  assert(res.returnValue === 8, 'Test 11: Generated DP template computes fib(6) = 8');
}

// ── Test 12: Executable Code Verification: General Array Template ─
{
  const t = getProblemTemplate({ id: 555, name: 'Array Accumulator', difficulty: 'Easy', topic: 'Array' });
  const res = runJava(t.code, t.inputs);
  assert(res.returnValue === 15, 'Test 12: Generated Array template sums [1, 2, 3, 4, 5] to 15');
}

// ── Test 13: Preset Verification: Two Sum #1 ───────────────────
{
  const t = getProblemTemplate({ id: 1, name: 'Two Sum', difficulty: 'Easy' });
  const res = runJava(t.code, t.inputs);
  assert(Array.isArray(res.returnValue), 'Test 13: Two Sum returns array');
  assert(res.returnValue[0] === 0 && res.returnValue[1] === 1, 'Test 13: Two Sum returns [0, 1]');
}

console.log('\n========================================================');
console.log(`Hardening #7 ProblemModal Suite: ${passed}/${total} PASSED`);
console.log('========================================================\n');
