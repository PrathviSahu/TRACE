const { runJava } = require("../src/engine/interpreter.js");

// Fix #200 - the self-contained grid had wrong count (3 instead of 4)
// grid was: {1,1,0,0,0, 0,1,0,0,0, 0,0,1,0,0, 0,0,0,1,1}
// Let me draw it:
// 1 1 0 0 0
// 0 1 0 0 0
// 0 0 1 0 0
// 0 0 0 1 1
// Islands: {(0,0),(0,1),(1,1)}, {(2,2)}, {(3,3),(3,4)} = 3 islands. Got 3 is actually correct!
// I said expected 4, that was wrong. Let me use a clearer test

const code200 = `class Solution {
    public int numIslands() {
        int rows = 4;
        int cols = 5;
        int[] grid = {1,1,1,1,0,  1,1,0,1,0,  1,1,0,0,0,  0,0,0,0,0};
        int count = 0;
        boolean[] vis = new boolean[rows * cols];
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                int idx = i * cols + j;
                if (grid[idx] == 1 && !vis[idx]) {
                    count++;
                    dfs(grid, vis, i, j, rows, cols);
                }
            }
        }
        return count;
    }
    void dfs(int[] grid, boolean[] vis, int r, int c, int rows, int cols) {
        if (r < 0 || r >= rows || c < 0 || c >= cols) return;
        int idx = r * cols + c;
        if (grid[idx] == 0 || vis[idx]) return;
        vis[idx] = true;
        dfs(grid, vis, r + 1, c, rows, cols);
        dfs(grid, vis, r - 1, c, rows, cols);
        dfs(grid, vis, r, c + 1, rows, cols);
        dfs(grid, vis, r, c - 1, rows, cols);
    }
}`;
const r200 = runJava(code200, {});
console.log("#200 numIslands (1 island):", r200.returnValue, "expected: 1, error:", r200.error);

// Fix #56 - merge intervals, let's trace
// Input: starts=[1,15,2,8,3] -> sorted: [1,2,3,8,15], ends=[3,18,6,10,5] -> sorted: [3,6,5,10,18]
// After sort: (1,3),(2,6),(3,5),(8,10),(15,18) -> merged: (1,6),(8,10),(15,18) = 3 intervals. That IS 3!
// Actually for [[1,3],[2,6],[8,10],[15,18]] the answer is 3 merged groups
// My expected was wrong. Let me use a simpler example

const code56fix = `class Solution {
    public int mergeIntervals() {
        int[] starts = {1,2,8,15};
        int[] ends = {3,6,10,18};
        int n = 4;
        int count = 1;
        int curEnd = ends[0];
        for (int i = 1; i < n; i++) {
            if (starts[i] <= curEnd) {
                if (ends[i] > curEnd) curEnd = ends[i];
            } else {
                count++;
                curEnd = ends[i];
            }
        }
        return count;
    }
}`;
const r56 = runJava(code56fix, {});
console.log("#56 mergeIntervals (already sorted):", r56.returnValue, "expected: 2 ([1,6],[8,10] same? No: [1,3][2,6][8,10][15,18] -> [1,6][8,10][15,18]=3), error:", r56.error);
// [[1,3],[2,6],[8,10],[15,18]] merges to [[1,6],[8,10],[15,18]] = 3 intervals

// LC 74 - Search Matrix
const code74 = `class Solution {
    public boolean searchMatrix(int[] matrix, int rows, int cols, int target) {
        int lo = 0;
        int hi = rows * cols - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            int val = matrix[mid / cols * cols + mid % cols];
            if (val == target) return true;
            if (val < target) lo = mid + 1;
            else hi = mid - 1;
        }
        return false;
    }
}`;
const r74 = runJava(code74, { matrix: "[1,3,5,7,10,11,16,20,23,30,34,60]", rows: 3, cols: 4, target: 3 });
console.log("#74 searchMatrix:", r74.returnValue, "expected: true, error:", r74.error, "steps:", r74.trace?.length);

// LC 739 Daily Temperatures (already tested, just verify return)
const code739 = `class Solution {
    public int dailyTemperatures(int[] temps) {
        int n = temps.length;
        int[] result = new int[n];
        int[] stack = new int[n];
        int top = 0;
        for (int i = 0; i < n; i++) {
            while (top > 0 && temps[stack[top - 1]] < temps[i]) {
                top--;
                int idx = stack[top];
                result[idx] = i - idx;
            }
            stack[top] = i;
            top++;
        }
        return result[0];
    }
}`;
const r739 = runJava(code739, { temps: "[73,74,75,71,69,72,76,73]" });
console.log("#739 dailyTemp result[0]:", r739.returnValue, "expected: 1, error:", r739.error, "steps:", r739.trace?.length);

// LC 300 LIS (already passed, just print)
const codeLIS = `class Solution {
    public int lengthOfLIS(int[] nums) {
        int n = nums.length;
        int[] dp = new int[n];
        for (int i = 0; i < n; i++) dp[i] = 1;
        int maxLen = 1;
        for (int i = 1; i < n; i++) {
            for (int j = 0; j < i; j++) {
                if (nums[j] < nums[i]) {
                    if (dp[j] + 1 > dp[i]) dp[i] = dp[j] + 1;
                }
            }
            if (dp[i] > maxLen) maxLen = dp[i];
        }
        return maxLen;
    }
}`;
const rLIS = runJava(codeLIS, { nums: "[10,9,2,5,3,7,101,18]" });
console.log("#300 LIS:", rLIS.returnValue, "expected: 4, error:", rLIS.error, "steps:", rLIS.trace?.length);

// Also test for char array version of #3  
const code3 = `class Solution {
    public int lengthOfLongestSubstring(String s) {
        int maxLen = 0;
        int left = 0;
        int n = s.length();
        int[] freq = new int[128];
        for (int right = 0; right < n; right++) {
            char ch = s.charAt(right);
            while (freq[ch] > 0) {
                char lc = s.charAt(left);
                freq[lc]--;
                left++;
            }
            freq[ch]++;
            int len = right - left + 1;
            if (len > maxLen) maxLen = len;
        }
        return maxLen;
    }
}`;
const r3 = runJava(code3, { s: '"abcabcbb"' });
console.log("#3 longest substring:", r3.returnValue, "expected: 3, error:", r3.error, "steps:", r3.trace?.length);
const r3b = runJava(code3, { s: '"pwwkew"' });
console.log("#3 pwwkew:", r3b.returnValue, "expected: 3, error:", r3b.error);

