const { runJava } = require("../src/engine/interpreter.js");

// Test all the remaining new problem templates

// LC 49 - Group Anagrams (using counts, not sorting)
const code49 = `class Solution {
    public int groupAnagrams(String[] strs) {
        int groups = 0;
        int n = strs.length;
        boolean[] visited = new boolean[n];
        for (int i = 0; i < n; i++) {
            if (!visited[i]) {
                groups++;
                for (int j = i + 1; j < n; j++) {
                    if (!visited[j] && isAnagram(strs[i], strs[j])) {
                        visited[j] = true;
                    }
                }
            }
        }
        return groups;
    }
    boolean isAnagram(String a, String b) {
        if (a.length() != b.length()) return false;
        int[] count = new int[26];
        for (int i = 0; i < a.length(); i++) count[a.charAt(i) - 'a']++;
        for (int i = 0; i < b.length(); i++) count[b.charAt(i) - 'a']--;
        for (int i = 0; i < 26; i++) if (count[i] != 0) return false;
        return true;
    }
}`;
const r49 = runJava(code49, { strs: '["eat","tea","tan","ate","nat","bat"]' });
console.log("#49 GroupAnagrams count:", r49.returnValue, "expected: 3, error:", r49.error, "steps:", r49.trace?.length);

// LC 200 - Number of Islands (DFS on grid)
const code200 = `class Solution {
    public int numIslands(int[] grid, int rows, int cols) {
        int count = 0;
        boolean[] visited = new boolean[rows * cols];
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                int idx = i * cols + j;
                if (grid[idx] == 1 && !visited[idx]) {
                    count++;
                    dfs(grid, visited, i, j, rows, cols);
                }
            }
        }
        return count;
    }
    void dfs(int[] grid, boolean[] visited, int r, int c, int rows, int cols) {
        if (r < 0 || r >= rows || c < 0 || c >= cols) return;
        int idx = r * cols + c;
        if (grid[idx] == 0 || visited[idx]) return;
        visited[idx] = true;
        dfs(grid, visited, r + 1, c, rows, cols);
        dfs(grid, visited, r - 1, c, rows, cols);
        dfs(grid, visited, r, c + 1, rows, cols);
        dfs(grid, visited, r, c - 1, rows, cols);
    }
}`;
const r200 = runJava(code200, { grid: "[1,1,0,0,0,0,1,0,0,0,0,0,0,0,1,0,1]", rows: 1, cols: 17 });
console.log("#200 numIslands basic:", r200.returnValue, "error:", r200.error);

// Actually let's use a simpler test
const code200b = `class Solution {
    public int numIslands() {
        int rows = 4;
        int cols = 5;
        int[] grid = {1,1,0,0,0,  0,1,0,0,0,  0,0,1,0,0,  0,0,0,1,1};
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
const r200c = runJava(code200b, {});
console.log("#200 numIslands self-contained:", r200c.returnValue, "expected: 4, error:", r200c.error, "steps:", r200c.trace?.length);

// LC 215 - Kth largest (quickselect approach)
const code215 = `class Solution {
    public int findKthLargest(int[] nums, int k) {
        int target = nums.length - k;
        int lo = 0;
        int hi = nums.length - 1;
        while (lo <= hi) {
            int pivot = partition(nums, lo, hi);
            if (pivot == target) return nums[pivot];
            if (pivot < target) lo = pivot + 1;
            else hi = pivot - 1;
        }
        return nums[lo];
    }
    int partition(int[] nums, int lo, int hi) {
        int pivot = nums[hi];
        int i = lo;
        for (int j = lo; j < hi; j++) {
            if (nums[j] <= pivot) {
                int tmp = nums[i];
                nums[i] = nums[j];
                nums[j] = tmp;
                i++;
            }
        }
        int tmp = nums[i];
        nums[i] = nums[hi];
        nums[hi] = tmp;
        return i;
    }
}`;
const r215 = runJava(code215, { nums: "[3,2,1,5,6,4]", k: 2 });
console.log("#215 kthLargest:", r215.returnValue, "expected: 5, error:", r215.error, "steps:", r215.trace?.length);

// LC 347 - Top K frequent (using counting sort by frequency)  
const code347 = `class Solution {
    public int topKFrequent(int[] nums, int k) {
        int[] freq = new int[201];
        int n = nums.length;
        for (int i = 0; i < n; i++) {
            freq[nums[i] + 100]++;
        }
        int found = 0;
        int lastVal = 0;
        for (int count = n; count >= 1; count--) {
            for (int i = 0; i < 201; i++) {
                if (freq[i] == count) {
                    found++;
                    lastVal = i - 100;
                    if (found == k) return lastVal;
                }
            }
        }
        return lastVal;
    }
}`;
const r347 = runJava(code347, { nums: "[1,1,1,2,2,3]", k: 2 });
console.log("#347 topKFrequent:", r347.returnValue, "expected: 1 or 2, error:", r347.error, "steps:", r347.trace?.length);

// LC 56 - Merge Intervals
const code56 = `class Solution {
    public int mergeIntervals() {
        int[] starts = {1,15,2,8,3};
        int[] ends = {3,18,6,10,5};
        int n = 5;
        // sort by start
        for (int i = 0; i < n - 1; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                if (starts[j] > starts[j+1]) {
                    int ts = starts[j]; starts[j] = starts[j+1]; starts[j+1] = ts;
                    int te = ends[j]; ends[j] = ends[j+1]; ends[j+1] = te;
                }
            }
        }
        int count = 0;
        int curStart = starts[0];
        int curEnd = ends[0];
        for (int i = 1; i < n; i++) {
            if (starts[i] <= curEnd) {
                if (ends[i] > curEnd) curEnd = ends[i];
            } else {
                count++;
                curStart = starts[i];
                curEnd = ends[i];
            }
        }
        count++;
        return count;
    }
}`;
const r56 = runJava(code56, {});
console.log("#56 mergeIntervals count:", r56.returnValue, "expected: 2, error:", r56.error, "steps:", r56.trace?.length);
