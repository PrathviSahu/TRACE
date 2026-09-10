const assert = require('assert');

async function runTests() {
  console.log('=== TESTING LEETCODE 424 & SLIDING WINDOW ENGINE + VISUALIZER ===');

  const { runJava } = await import('../src/engine/interpreter.js');
  const { validateTraceStep } = await import('../src/engine/traceSchema.js');
  const { normalizeStepData, detectSlidingWindow } = await import('../src/utils/visualizerAdapter.js');

  // ── 1. Test Array-based Sliding Window LeetCode 424 ──
  console.log('\n[1/4] Running LeetCode 424 Array-based solution...');
  const arrayCode = `
class Solution {
    public static void main(String[] args) {
        String s = "AABABBA";
        int k = 1;
        int[] count = new int[26];
        int maxCount = 0;
        int maxLen = 0;
        int left = 0;
        for (int right = 0; right < s.length(); right++) {
            count[s.charAt(right) - 'A']++;
            maxCount = Math.max(maxCount, count[s.charAt(right) - 'A']);
            while ((right - left + 1) - maxCount > k) {
                count[s.charAt(left) - 'A']--;
                left++;
            }
            maxLen = Math.max(maxLen, right - left + 1);
        }
    }
}
`;

  const arrayResult = runJava(arrayCode);
  assert(arrayResult.trace.length > 20, 'Trace should have generated steps');
  
  // Validate every trace step against trace schema
  for (const step of arrayResult.trace) {
    assert(validateTraceStep(step), 'Trace step must conform to TraceSchema');
  }

  const stepsWithMaxLen = arrayResult.trace.filter(t => t.variables && t.variables.maxLen);
  const finalArrayStep = stepsWithMaxLen[stepsWithMaxLen.length - 1];
  assert.strictEqual(finalArrayStep.variables.maxLen.value, 4, 'LeetCode 424 maxLen must be 4');
  assert.strictEqual(finalArrayStep.variables.left.value, 3, 'Final left pointer must be 3');
  console.log('  ✓ Array-based solution calculated maxLen = 4 correctly without NaN errors');

  // ── 2. Test HashMap-based Sliding Window LeetCode 424 ──
  console.log('\n[2/4] Running LeetCode 424 HashMap-based solution...');
  const mapCode = `
class Solution {
    public static void main(String[] args) {
        String s = "AABABBA";
        int k = 1;
        Map<Character, Integer> count = new HashMap<>();
        int maxCount = 0;
        int maxLen = 0;
        int left = 0;
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            count.put(c, count.getOrDefault(c, 0) + 1);
            maxCount = Math.max(maxCount, count.get(c));
            while ((right - left + 1) - maxCount > k) {
                char l = s.charAt(left);
                count.put(l, count.get(l) - 1);
                left++;
            }
            maxLen = Math.max(maxLen, right - left + 1);
        }
    }
}
`;

  const mapResult = runJava(mapCode);
  const mapStepsWithMaxLen = mapResult.trace.filter(t => t.variables && t.variables.maxLen);
  const finalMapStep = mapStepsWithMaxLen[mapStepsWithMaxLen.length - 1];
  assert.strictEqual(finalMapStep.variables.maxLen.value, 4, 'HashMap maxLen must be 4');
  console.log('  ✓ HashMap-based solution calculated maxLen = 4 correctly');

  // ── 3. Test LeetCode 3 Longest Substring Sliding Window ──
  console.log('\n[3/4] Running LeetCode 3 Sliding Window solution...');
  const leetcode3Code = `
class Solution {
    public static void main(String[] args) {
        String s = "abcabcbb";
        Set<Character> set = new HashSet<>();
        int left = 0, maxLen = 0;
        for (int right = 0; right < s.length(); right++) {
            while (set.contains(s.charAt(right))) {
                set.remove(s.charAt(left));
                left++;
            }
            set.add(s.charAt(right));
            maxLen = Math.max(maxLen, right - left + 1);
        }
    }
}
`;

  const lc3Result = runJava(leetcode3Code);
  const lc3Steps = lc3Result.trace.filter(t => t.variables && t.variables.maxLen);
  const finalLc3Step = lc3Steps[lc3Steps.length - 1];
  assert.strictEqual(finalLc3Step.variables.maxLen.value, 3, 'LeetCode 3 maxLen must be 3');
  console.log('  ✓ LeetCode 3 calculated maxLen = 3 correctly');

  // ── 4. Test Sliding Window Visualizer Adapter Normalization ──
  console.log('\n[4/4] Testing visualizerAdapter slidingWindow normalization...');
  const activeStep = arrayResult.trace.find(t => t.variables?.left?.value === 1 && t.variables?.right?.value === 4);
  assert(activeStep, 'Should find step where left=1 and right=4');

  const normalized = normalizeStepData(activeStep);
  assert(normalized.slidingWindow, 'normalizeStepData must include slidingWindow object');
  assert.strictEqual(normalized.slidingWindow.seqName, 's');
  assert.strictEqual(normalized.slidingWindow.leftIdx, 1);
  assert.strictEqual(normalized.slidingWindow.rightIdx, 4);
  assert.strictEqual(normalized.slidingWindow.windowStr, 'ABAB');
  assert.strictEqual(normalized.slidingWindow.windowLen, 4);
  assert.strictEqual(normalized.slidingWindow.windowFreq['A'], 2);
  assert.strictEqual(normalized.slidingWindow.windowFreq['B'], 2);
  assert.strictEqual(normalized.slidingWindow.isValid, false, 'Window with 2 replacements when k=1 must be invalid');
  console.log('  ✓ Visualizer slidingWindow extracted correct active window: "ABAB" (len: 4, invalid -> shrink)');

  console.log('\n=== ALL SLIDING WINDOW & LEETCODE 424 TESTS PASSED! ===');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
