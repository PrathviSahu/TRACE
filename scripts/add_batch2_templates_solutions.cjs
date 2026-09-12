const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

// ─── 1. Preset Templates ───────────────────────────────────────────────────
const templatesPath = path.join(root, "src/data/problemTemplates.js");
let tmplContent = fs.readFileSync(templatesPath, "utf8");

const NEW_TEMPLATES = {
  15: {
    name: '3Sum',
    description: 'Sort array and use two pointers to find unique triplets summing to 0.',
    code: `class Solution {
    public int threeSum(int[] nums) {
        int n = nums.length;
        int count = 0;
        for (int i = 0; i < n - 2; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue;
            int left = i + 1;
            int right = n - 1;
            while (left < right) {
                int sum = nums[i] + nums[left] + nums[right];
                if (sum == 0) {
                    count++;
                    while (left < right && nums[left] == nums[left + 1]) left++;
                    while (left < right && nums[right] == nums[right - 1]) right--;
                    left++;
                    right--;
                } else if (sum < 0) {
                    left++;
                } else {
                    right--;
                }
            }
        }
        return count;
    }
}`,
    inputs: { nums: '[-4, -1, -1, 0, 1, 2]' }
  },

  19: {
    name: 'Remove Nth Node From End of List',
    description: 'One-pass two pointers (fast & slow) with a gap of n to remove nth node from end.',
    code: `class Solution {
    public ListNode removeNthFromEnd() {
        // Build: 1 -> 2 -> 3 -> 4 -> 5, n = 2
        ListNode dummy = new ListNode(0);
        ListNode n1 = new ListNode(1);
        ListNode n2 = new ListNode(2);
        ListNode n3 = new ListNode(3);
        ListNode n4 = new ListNode(4);
        ListNode n5 = new ListNode(5);
        dummy.next = n1;
        n1.next = n2;
        n2.next = n3;
        n3.next = n4;
        n4.next = n5;
        
        int n = 2;
        ListNode fast = dummy;
        ListNode slow = dummy;
        for (int i = 0; i <= n; i++) {
            fast = fast.next;
        }
        while (fast != null) {
            fast = fast.next;
            slow = slow.next;
        }
        slow.next = slow.next.next;
        return dummy.next;
    }
}`,
    inputs: {}
  },

  39: {
    name: 'Combination Sum',
    description: 'Dynamic programming / unbounded knapsack: count combinations summing to target.',
    code: `class Solution {
    public int combinationSum(int[] candidates, int target) {
        int[] dp = new int[target + 1];
        dp[0] = 1;
        for (int i = 0; i < candidates.length; i++) {
            int coin = candidates[i];
            for (int j = coin; j <= target; j++) {
                dp[j] += dp[j - coin];
            }
        }
        return dp[target];
    }
}`,
    inputs: { candidates: '[2, 3, 6, 7]', target: '7' }
  },

  42: {
    name: 'Trapping Rain Water',
    description: 'Two pointers tracking leftMax and rightMax to compute trapped water in O(1) space.',
    code: `class Solution {
    public int trap(int[] height) {
        int left = 0;
        int right = height.length - 1;
        int leftMax = 0;
        int rightMax = 0;
        int trapped = 0;
        while (left < right) {
            if (height[left] < height[right]) {
                if (height[left] >= leftMax) {
                    leftMax = height[left];
                } else {
                    trapped += leftMax - height[left];
                }
                left++;
            } else {
                if (height[right] >= rightMax) {
                    rightMax = height[right];
                } else {
                    trapped += rightMax - height[right];
                }
                right--;
            }
        }
        return trapped;
    }
}`,
    inputs: { height: '[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]' }
  },

  46: {
    name: 'Permutations',
    description: 'In-place backtracking with swapping elements to generate all permutations.',
    code: `class Solution {
    public int permute(int[] nums) {
        return backtrack(0, nums);
    }
    int backtrack(int start, int[] nums) {
        if (start == nums.length) {
            return 1;
        }
        int total = 0;
        for (int i = start; i < nums.length; i++) {
            swap(nums, start, i);
            total += backtrack(start + 1, nums);
            swap(nums, start, i);
        }
        return total;
    }
    void swap(int[] nums, int i, int j) {
        int temp = nums[i];
        nums[i] = nums[j];
        nums[j] = temp;
    }
}`,
    inputs: { nums: '[1, 2, 3]' }
  },

  76: {
    name: 'Minimum Window Substring',
    description: 'Sliding window tracking character need count and contracting left pointer.',
    code: `class Solution {
    public String minWindow(String s, String t) {
        if (s.length() < t.length()) return "";
        int[] need = new int[128];
        for (int i = 0; i < t.length(); i++) {
            char ch = t.charAt(i);
            need[ch]++;
        }
        int required = t.length();
        int left = 0;
        int minLen = s.length() + 1;
        int startIdx = 0;
        
        for (int right = 0; right < s.length(); right++) {
            char rch = s.charAt(right);
            if (need[rch] > 0) {
                required--;
            }
            need[rch]--;
            
            while (required == 0) {
                int curLen = right - left + 1;
                if (curLen < minLen) {
                    minLen = curLen;
                    startIdx = left;
                }
                char lch = s.charAt(left);
                need[lch]++;
                if (need[lch] > 0) {
                    required++;
                }
                left++;
            }
        }
        if (minLen > s.length()) return "";
        return s.substring(startIdx, startIdx + minLen);
    }
}`,
    inputs: { s: 'ADOBECODEBANC', t: 'ABC' }
  },

  78: {
    name: 'Subsets',
    description: 'Power set generation: 2^n subsets computed via bit/decision enumeration.',
    code: `class Solution {
    public int subsets(int[] nums) {
        int n = nums.length;
        int total = 1;
        for (int i = 0; i < n; i++) {
            total = total * 2;
        }
        return total;
    }
}`,
    inputs: { nums: '[1, 2, 3]' }
  },

  84: {
    name: 'Largest Rectangle in Histogram',
    description: 'Monotonic increasing stack to compute maximum rectangle under any histogram in O(n).',
    code: `class Solution {
    public int largestRectangleArea(int[] heights) {
        int n = heights.length;
        int[] stack = new int[n + 1];
        int top = -1;
        int maxArea = 0;
        
        for (int i = 0; i <= n; i++) {
            int h = (i == n) ? 0 : heights[i];
            while (top >= 0 && heights[stack[top]] > h) {
                int height = heights[stack[top]];
                top--;
                int width = (top < 0) ? i : (i - stack[top] - 1);
                int area = height * width;
                if (area > maxArea) {
                    maxArea = area;
                }
            }
            top++;
            stack[top] = i;
        }
        return maxArea;
    }
}`,
    inputs: { heights: '[2, 1, 5, 6, 2, 3]' }
  },

  91: {
    name: 'Decode Ways',
    description: 'Dynamic programming tracking 1-digit and 2-digit branch decodings in O(1) space.',
    code: `class Solution {
    public int numDecodings(String s) {
        int n = s.length();
        if (n == 0 || s.charAt(0) == '0') return 0;
        int prev2 = 1;
        int prev1 = 1;
        for (int i = 1; i < n; i++) {
            int curr = 0;
            char c1 = s.charAt(i);
            char c0 = s.charAt(i - 1);
            if (c1 != '0') {
                curr += prev1;
            }
            int twoDigit = (c0 - '0') * 10 + (c1 - '0');
            if (twoDigit >= 10 && twoDigit <= 26) {
                curr += prev2;
            }
            prev2 = prev1;
            prev1 = curr;
        }
        return prev1;
    }
}`,
    inputs: { s: '226' }
  },

  98: {
    name: 'Validate Binary Search Tree',
    description: 'Recursive bounds checking: each node must satisfy minVal < val < maxVal.',
    code: `class Solution {
    public boolean isValidBST() {
        TreeNode root = new TreeNode(2);
        root.left = new TreeNode(1);
        root.right = new TreeNode(3);
        return check(root, -1000000, 1000000);
    }
    boolean check(TreeNode node, int minVal, int maxVal) {
        if (node == null) return true;
        if (node.val <= minVal || node.val >= maxVal) return false;
        return check(node.left, minVal, node.val) && check(node.right, node.val, maxVal);
    }
}`,
    inputs: {}
  },

  102: {
    name: 'Binary Tree Level Order Traversal',
    description: 'Level-by-level tree traversal tracking depth level counts.',
    code: `class Solution {
    public int levelOrder() {
        TreeNode root = new TreeNode(3);
        root.left = new TreeNode(9);
        root.right = new TreeNode(20);
        root.right.left = new TreeNode(15);
        root.right.right = new TreeNode(7);
        
        int[] counts = new int[10];
        traverse(root, 0, counts);
        int levels = 0;
        for (int i = 0; i < 10; i++) {
            if (counts[i] > 0) levels++;
        }
        return levels;
    }
    void traverse(TreeNode node, int level, int[] counts) {
        if (node == null) return;
        counts[level]++;
        traverse(node.left, level + 1, counts);
        traverse(node.right, level + 1, counts);
    }
}`,
    inputs: {}
  },

  139: {
    name: 'Word Break',
    description: '1D DP: check if substring s[j..i] matches any word in dictionary.',
    code: `class Solution {
    public boolean wordBreak(String s) {
        String[] dict = {"leet", "code"};
        int n = s.length();
        boolean[] dp = new boolean[n + 1];
        dp[0] = true;
        
        for (int i = 1; i <= n; i++) {
            for (int d = 0; d < dict.length; d++) {
                String word = dict[d];
                int wLen = word.length();
                if (i >= wLen && dp[i - wLen]) {
                    if (s.substring(i - wLen, i).equals(word)) {
                        dp[i] = true;
                        break;
                    }
                }
            }
        }
        return dp[n];
    }
}`,
    inputs: { s: 'leetcode' }
  },

  141: {
    name: 'Linked List Cycle',
    description: "Floyd's Tortoise and Hare: two pointers moving at 1x and 2x speed.",
    code: `class Solution {
    public boolean hasCycle() {
        ListNode head = new ListNode(3);
        ListNode n2 = new ListNode(2);
        ListNode n3 = new ListNode(0);
        ListNode n4 = new ListNode(-4);
        head.next = n2;
        n2.next = n3;
        n3.next = n4;
        n4.next = n2;
        
        ListNode slow = head;
        ListNode fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) {
                return true;
            }
        }
        return false;
    }
}`,
    inputs: {}
  },

  142: {
    name: 'Linked List Cycle II',
    description: "Floyd's algorithm: meet inside cycle, then reset one pointer to head to find cycle entry.",
    code: `class Solution {
    public int detectCycle() {
        ListNode head = new ListNode(3);
        ListNode n2 = new ListNode(2);
        ListNode n3 = new ListNode(0);
        ListNode n4 = new ListNode(-4);
        head.next = n2;
        n2.next = n3;
        n3.next = n4;
        n4.next = n2;
        
        ListNode slow = head;
        ListNode fast = head;
        boolean hasCycle = false;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) {
                hasCycle = true;
                break;
            }
        }
        if (!hasCycle) return -1;
        ListNode entry = head;
        while (entry != slow) {
            entry = entry.next;
            slow = slow.next;
        }
        return entry.val;
    }
}`,
    inputs: {}
  },

  207: {
    name: 'Course Schedule',
    description: "Kahn's algorithm: BFS topological sort using node in-degrees.",
    code: `class Solution {
    public boolean canFinish(int numCourses) {
        int[] inDegree = new int[numCourses];
        inDegree[1]++;
        
        int[] queue = new int[numCourses];
        int head = 0;
        int tail = 0;
        for (int i = 0; i < numCourses; i++) {
            if (inDegree[i] == 0) {
                queue[tail++] = i;
            }
        }
        int count = 0;
        while (head < tail) {
            int node = queue[head++];
            count++;
            if (node == 0) {
                inDegree[1]--;
                if (inDegree[1] == 0) {
                    queue[tail++] = 1;
                }
            }
        }
        return count == numCourses;
    }
}`,
    inputs: { numCourses: '2' }
  },

  209: {
    name: 'Minimum Size Subarray Sum',
    description: 'Sliding window: expand right until sum >= target, then shrink left to find minimal length.',
    code: `class Solution {
    public int minSubArrayLen(int target, int[] nums) {
        int n = nums.length;
        int left = 0;
        int sum = 0;
        int minLen = n + 1;
        
        for (int right = 0; right < n; right++) {
            sum += nums[right];
            while (sum >= target) {
                int curLen = right - left + 1;
                if (curLen < minLen) {
                    minLen = curLen;
                }
                sum -= nums[left];
                left++;
            }
        }
        return (minLen > n) ? 0 : minLen;
    }
}`,
    inputs: { target: '7', nums: '[2, 3, 1, 2, 4, 3]' }
  },

  235: {
    name: 'Lowest Common Ancestor of a BST',
    description: 'Iterative BST traversal: split when p and q diverge across current node.',
    code: `class Solution {
    public int lowestCommonAncestor() {
        TreeNode root = new TreeNode(6);
        root.left = new TreeNode(2);
        root.right = new TreeNode(8);
        root.left.left = new TreeNode(0);
        root.left.right = new TreeNode(4);
        root.right.left = new TreeNode(7);
        root.right.right = new TreeNode(9);
        
        int p = 2;
        int q = 8;
        TreeNode curr = root;
        while (curr != null) {
            if (p < curr.val && q < curr.val) {
                curr = curr.left;
            } else if (p > curr.val && q > curr.val) {
                curr = curr.right;
            } else {
                return curr.val;
            }
        }
        return -1;
    }
}`,
    inputs: {}
  },

  242: {
    name: 'Valid Anagram',
    description: 'Frequency count: count character frequencies using a fixed 26-size array.',
    code: `class Solution {
    public boolean isAnagram(String s, String t) {
        if (s.length() != t.length()) return false;
        int[] count = new int[26];
        for (int i = 0; i < s.length(); i++) {
            char sc = s.charAt(i);
            char tc = t.charAt(i);
            count[sc - 'a']++;
            count[tc - 'a']--;
        }
        for (int i = 0; i < 26; i++) {
            if (count[i] != 0) return false;
        }
        return true;
    }
}`,
    inputs: { s: 'anagram', t: 'nagaram' }
  },

  416: {
    name: 'Partition Equal Subset Sum',
    description: '0/1 Knapsack 1D DP: can a subset sum to total / 2?',
    code: `class Solution {
    public boolean canPartition(int[] nums) {
        int sum = 0;
        for (int i = 0; i < nums.length; i++) sum += nums[i];
        if (sum % 2 != 0) return false;
        int target = sum / 2;
        
        boolean[] dp = new boolean[target + 1];
        dp[0] = true;
        for (int i = 0; i < nums.length; i++) {
            int num = nums[i];
            for (int j = target; j >= num; j--) {
                if (dp[j - num]) {
                    dp[j] = true;
                }
            }
        }
        return dp[target];
    }
}`,
    inputs: { nums: '[1, 5, 11, 5]' }
  },

  547: {
    name: 'Number of Provinces',
    description: 'Connected components via DFS exploration on adjacency matrix.',
    code: `class Solution {
    public int findCircleNum() {
        int n = 3;
        int[][] isConnected = {
            {1, 1, 0},
            {1, 1, 0},
            {0, 0, 1}
        };
        boolean[] visited = new boolean[n];
        int provinces = 0;
        
        for (int i = 0; i < n; i++) {
            if (!visited[i]) {
                provinces++;
                dfs(isConnected, visited, i, n);
            }
        }
        return provinces;
    }
    void dfs(int[][] graph, boolean[] visited, int node, int n) {
        visited[node] = true;
        for (int j = 0; j < n; j++) {
            if (graph[node][j] == 1 && !visited[j]) {
                dfs(graph, visited, j, n);
            }
        }
    }
}`,
    inputs: {}
  },

  1143: {
    name: 'Longest Common Subsequence',
    description: '2D DP grid: if chars match dp[i-1][j-1]+1, else max(dp[i-1][j], dp[i][j-1]).',
    code: `class Solution {
    public int longestCommonSubsequence(String text1, String text2) {
        int m = text1.length();
        int n = text2.length();
        int[][] dp = new int[m + 1][n + 1];
        
        for (int i = 1; i <= m; i++) {
            char c1 = text1.charAt(i - 1);
            for (int j = 1; j <= n; j++) {
                char c2 = text2.charAt(j - 1);
                if (c1 == c2) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                } else {
                    int top = dp[i - 1][j];
                    int left = dp[i][j - 1];
                    dp[i][j] = (top > left) ? top : left;
                }
            }
        }
        return dp[m][n];
    }
}`,
    inputs: { text1: 'abcde', text2: 'ace' }
  }
};

let tmplAdded = 0;
for (const [id, tmpl] of Object.entries(NEW_TEMPLATES)) {
  if (!tmplContent.includes(`\n  ${id}: {`)) {
    const endMarker = "\n};\n\n/**\n * Returns either a full preset solution";
    const endIdx = tmplContent.indexOf(endMarker);
    if (endIdx !== -1) {
      const entryStr = `\n  ${id}: {\n    name: ${JSON.stringify(tmpl.name)},\n    description: ${JSON.stringify(tmpl.description)},\n    code: ${JSON.stringify(tmpl.code)},\n    inputs: ${JSON.stringify(tmpl.inputs)}\n  },`;
      tmplContent = tmplContent.slice(0, endIdx) + entryStr + tmplContent.slice(endIdx);
      tmplAdded++;
    }
  }
}
fs.writeFileSync(templatesPath, tmplContent, "utf8");
console.log(`Added ${tmplAdded} problem templates.`);

// ─── 2. Multi-Approach Solutions ───────────────────────────────────────────
const solutionsPath = path.join(root, "src/data/problemSolutions.js");
let solContent = fs.readFileSync(solutionsPath, "utf8");

const NEW_SOLUTIONS = {
  19: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(L) Two-Pass — Count Length",
        idea: "First traverse the list to find total length L. In the second pass, walk to node (L - n) and remove the next node.",
        complexity: { time: "O(L)", space: "O(1)" },
        code: `class Solution {
    public ListNode removeNthFromEnd(ListNode head, int n) {
        int length = 0;
        ListNode curr = head;
        while (curr != null) {
            length++;
            curr = curr.next;
        }
        if (length == n) return head.next;
        
        curr = head;
        for (int i = 1; i < length - n; i++) {
            curr = curr.next;
        }
        curr.next = curr.next.next;
        return head;
    }
}`
      },
      {
        name: "Better",
        label: "O(L) Space — Node Array / List",
        idea: "Store all node references in a List. Access the (L - n - 1)th node directly to update its next pointer.",
        complexity: { time: "O(L)", space: "O(L)" },
        code: `class Solution {
    public ListNode removeNthFromEnd(ListNode head, int n) {
        List<ListNode> nodes = new ArrayList<>();
        ListNode curr = head;
        while (curr != null) {
            nodes.add(curr);
            curr = curr.next;
        }
        int total = nodes.size();
        if (total == n) return head.next;
        
        ListNode prev = nodes.get(total - n - 1);
        prev.next = prev.next.next;
        return head;
    }
}`
      },
      {
        name: "Optimal",
        label: "O(L) One-Pass — Two Pointers with Gap n",
        idea: "Use dummy node. Advance fast pointer by n+1 steps. Then move both fast and slow together until fast is null. Slow points directly to the node before target.",
        complexity: { time: "O(L)", space: "O(1)" },
        code: `class Solution {
    public ListNode removeNthFromEnd(ListNode head, int n) {
        ListNode dummy = new ListNode(0);
        dummy.next = head;
        ListNode fast = dummy;
        ListNode slow = dummy;
        
        for (int i = 0; i <= n; i++) {
            fast = fast.next;
        }
        while (fast != null) {
            fast = fast.next;
            slow = slow.next;
        }
        slow.next = slow.next.next;
        return dummy.next;
    }
}`
      }
    ]
  },

  39: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(2^target) — Unbounded Recursion",
        idea: "Try choosing or skipping each candidate recursively. Use a HashSet of sorted lists to eliminate duplicate combinations.",
        complexity: { time: "O(2^target)", space: "O(target)" },
        code: `class Solution {
    public List<List<Integer>> combinationSum(int[] candidates, int target) {
        Set<List<Integer>> result = new HashSet<>();
        recurse(candidates, target, 0, new ArrayList<>(), result);
        return new ArrayList<>(result);
    }
    void recurse(int[] nums, int remain, int idx, List<Integer> cur, Set<List<Integer>> res) {
        if (remain == 0) {
            List<Integer> valid = new ArrayList<>(cur);
            Collections.sort(valid);
            res.add(valid);
            return;
        }
        if (remain < 0 || idx == nums.length) return;
        
        // Pick current
        cur.add(nums[idx]);
        recurse(nums, remain - nums[idx], idx, cur, res);
        cur.remove(cur.size() - 1);
        
        // Skip current
        recurse(nums, remain, idx + 1, cur, res);
    }
}`
      },
      {
        name: "Better",
        label: "O(N^(T/M)) — Backtracking with Sorting & Pruning",
        idea: "Sort candidates first. Stop exploring a branch as soon as candidates[i] exceeds the remaining sum, avoiding unnecessary recursive calls.",
        complexity: { time: "O(N^(target/min))", space: "O(target/min)" },
        code: `class Solution {
    public List<List<Integer>> combinationSum(int[] candidates, int target) {
        Arrays.sort(candidates);
        List<List<Integer>> result = new ArrayList<>();
        backtrack(candidates, target, 0, new ArrayList<>(), result);
        return result;
    }
    void backtrack(int[] candidates, int remain, int start, List<Integer> cur, List<List<Integer>> res) {
        if (remain == 0) {
            res.add(new ArrayList<>(cur));
            return;
        }
        for (int i = start; i < candidates.length; i++) {
            if (candidates[i] > remain) break; // Early prune
            cur.add(candidates[i]);
            backtrack(candidates, remain - candidates[i], i, cur, res);
            cur.remove(cur.size() - 1);
        }
    }
}`
      },
      {
        name: "Optimal",
        label: "O(N^(T/M)) — Standard Canonical Backtracking",
        idea: "At each step, loop from start index. By passing i as start into next call, candidates can be reused while strictly avoiding duplicate combinations.",
        complexity: { time: "O(N^(target/min))", space: "O(target/min)" },
        code: `class Solution {
    public List<List<Integer>> combinationSum(int[] candidates, int target) {
        List<List<Integer>> result = new ArrayList<>();
        backtrack(candidates, target, 0, new ArrayList<>(), result);
        return result;
    }
    void backtrack(int[] candidates, int remain, int start, List<Integer> cur, List<List<Integer>> res) {
        if (remain == 0) {
            res.add(new ArrayList<>(cur));
            return;
        }
        if (remain < 0) return;
        for (int i = start; i < candidates.length; i++) {
            cur.add(candidates[i]);
            backtrack(candidates, remain - candidates[i], i, cur, res); // Reuse candidate i
            cur.remove(cur.size() - 1);
        }
    }
}`
      }
    ]
  },

  46: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(n! × n) — Backtracking with boolean used[]",
        idea: "Maintain a boolean used[] array. At each step, pick any unused element, mark it used, recurse, and unmark it upon backtrack.",
        complexity: { time: "O(n! × n)", space: "O(n)" },
        code: `class Solution {
    public List<List<Integer>> permute(int[] nums) {
        List<List<Integer>> result = new ArrayList<>();
        boolean[] used = new boolean[nums.length];
        backtrack(nums, used, new ArrayList<>(), result);
        return result;
    }
    void backtrack(int[] nums, boolean[] used, List<Integer> cur, List<List<Integer>> res) {
        if (cur.size() == nums.length) {
            res.add(new ArrayList<>(cur));
            return;
        }
        for (int i = 0; i < nums.length; i++) {
            if (used[i]) continue;
            used[i] = true;
            cur.add(nums[i]);
            backtrack(nums, used, cur, res);
            cur.remove(cur.size() - 1);
            used[i] = false;
        }
    }
}`
      },
      {
        name: "Better",
        label: "O(n! × n) — Iterative Cascading",
        idea: "Start with an empty permutation [[]]. For each number, insert it into every possible position of each previously generated permutation.",
        complexity: { time: "O(n! × n)", space: "O(n! × n)" },
        code: `class Solution {
    public List<List<Integer>> permute(int[] nums) {
        List<List<Integer>> result = new ArrayList<>();
        result.add(new ArrayList<>());
        for (int num : nums) {
            List<List<Integer>> next = new ArrayList<>();
            for (List<Integer> p : result) {
                for (int i = 0; i <= p.size(); i++) {
                    List<Integer> newPerm = new ArrayList<>(p);
                    newPerm.add(i, num);
                    next.add(newPerm);
                }
            }
            result = next;
        }
        return result;
    }
}`
      },
      {
        name: "Optimal",
        label: "O(n! × n) — In-Place Swap Backtracking",
        idea: "Permute the array in-place by swapping each element with the current starting index, recursing on start+1, and swapping back.",
        complexity: { time: "O(n! × n)", space: "O(n) call stack" },
        code: `class Solution {
    public List<List<Integer>> permute(int[] nums) {
        List<List<Integer>> result = new ArrayList<>();
        backtrack(0, nums, result);
        return result;
    }
    void backtrack(int start, int[] nums, List<List<Integer>> res) {
        if (start == nums.length) {
            List<Integer> list = new ArrayList<>();
            for (int x : nums) list.add(x);
            res.add(list);
            return;
        }
        for (int i = start; i < nums.length; i++) {
            swap(nums, start, i);
            backtrack(start + 1, nums, res);
            swap(nums, start, i);
        }
    }
    void swap(int[] nums, int i, int j) {
        int t = nums[i]; nums[i] = nums[j]; nums[j] = t;
    }
}`
      }
    ]
  },

  76: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(s³ + t) — Check All Substrings",
        idea: "Generate every substring s[i..j]. For each, verify if it contains all characters of t with the required frequency counts.",
        complexity: { time: "O(s³ + t)", space: "O(128)" },
        code: `class Solution {
    public String minWindow(String s, String t) {
        if (s.length() < t.length()) return "";
        int[] tCount = new int[128];
        for (char c : t.toCharArray()) tCount[c]++;
        
        String result = "";
        int minLen = Integer.MAX_VALUE;
        for (int i = 0; i < s.length(); i++) {
            for (int j = i + t.length(); j <= s.length(); j++) {
                String sub = s.substring(i, j);
                if (isValid(sub, tCount) && sub.length() < minLen) {
                    minLen = sub.length();
                    result = sub;
                }
            }
        }
        return result;
    }
    boolean isValid(String sub, int[] tCount) {
        int[] subCount = new int[128];
        for (char c : sub.toCharArray()) subCount[c]++;
        for (int i = 0; i < 128; i++) {
            if (subCount[i] < tCount[i]) return false;
        }
        return true;
    }
}`
      },
      {
        name: "Better",
        label: "O(s × 128 + t) — Sliding Window with Full Vector Check",
        idea: "Maintain a sliding window [left, right] and check if the window frequency counts satisfy tCount on each move.",
        complexity: { time: "O(128 × |s|)", space: "O(128)" },
        code: `class Solution {
    public String minWindow(String s, String t) {
        int[] need = new int[128];
        for (char c : t.toCharArray()) need[c]++;
        int[] have = new int[128];
        int left = 0, minLen = Integer.MAX_VALUE, startIdx = 0;
        
        for (int right = 0; right < s.length(); right++) {
            have[s.charAt(right)]++;
            while (containsAll(have, need)) {
                if (right - left + 1 < minLen) {
                    minLen = right - left + 1;
                    startIdx = left;
                }
                have[s.charAt(left)]--;
                left++;
            }
        }
        return minLen == Integer.MAX_VALUE ? "" : s.substring(startIdx, startIdx + minLen);
    }
    boolean containsAll(int[] have, int[] need) {
        for (int i = 0; i < 128; i++) {
            if (have[i] < need[i]) return false;
        }
        return true;
    }
}`
      },
      {
        name: "Optimal",
        label: "O(|s| + |t|) — Sliding Window with Character Match Count",
        idea: "Keep an integer 'required = t.length()'. Decrement required when a needed character is satisfied. Contract left as long as required == 0.",
        complexity: { time: "O(|s| + |t|)", space: "O(1) — 128 ASCII array" },
        code: `class Solution {
    public String minWindow(String s, String t) {
        if (s.length() < t.length()) return "";
        int[] need = new int[128];
        for (char c : t.toCharArray()) need[c]++;
        
        int required = t.length();
        int left = 0, minLen = Integer.MAX_VALUE, start = 0;
        
        for (int right = 0; right < s.length(); right++) {
            char r = s.charAt(right);
            if (need[r] > 0) required--;
            need[r]--;
            
            while (required == 0) {
                if (right - left + 1 < minLen) {
                    minLen = right - left + 1;
                    start = left;
                }
                char l = s.charAt(left);
                need[l]++;
                if (need[l] > 0) required++;
                left++;
            }
        }
        return minLen == Integer.MAX_VALUE ? "" : s.substring(start, start + minLen);
    }
}`
      }
    ]
  },

  78: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(2ⁿ) — Pick or Skip Recursion",
        idea: "At each element index, branch into two recursive choices: include nums[i] in the current subset, or exclude it.",
        complexity: { time: "O(2ⁿ)", space: "O(n) call stack" },
        code: `class Solution {
    public List<List<Integer>> subsets(int[] nums) {
        List<List<Integer>> result = new ArrayList<>();
        recurse(nums, 0, new ArrayList<>(), result);
        return result;
    }
    void recurse(int[] nums, int i, List<Integer> cur, List<List<Integer>> res) {
        if (i == nums.length) {
            res.add(new ArrayList<>(cur));
            return;
        }
        cur.add(nums[i]);
        recurse(nums, i + 1, cur, res);
        cur.remove(cur.size() - 1);
        recurse(nums, i + 1, cur, res);
    }
}`
      },
      {
        name: "Better",
        label: "O(n × 2ⁿ) — Bitmask Enumeration",
        idea: "Iterate from 0 to 2ⁿ - 1. The j-th bit of integer mask determines if nums[j] is included in the current subset.",
        complexity: { time: "O(n × 2ⁿ)", space: "O(1) extra" },
        code: `class Solution {
    public List<List<Integer>> subsets(int[] nums) {
        List<List<Integer>> result = new ArrayList<>();
        int n = nums.length;
        int total = 1 << n;
        for (int mask = 0; mask < total; mask++) {
            List<Integer> sub = new ArrayList<>();
            for (int i = 0; i < n; i++) {
                if ((mask & (1 << i)) != 0) {
                    sub.add(nums[i]);
                }
            }
            result.add(sub);
        }
        return result;
    }
}`
      },
      {
        name: "Optimal",
        label: "O(n × 2ⁿ) — Backtracking / Cascading",
        idea: "Loop from start to n-1. Add each partial subset to result immediately before recursing, achieving clean chronological generation.",
        complexity: { time: "O(n × 2ⁿ)", space: "O(n) recursion stack" },
        code: `class Solution {
    public List<List<Integer>> subsets(int[] nums) {
        List<List<Integer>> result = new ArrayList<>();
        backtrack(nums, 0, new ArrayList<>(), result);
        return result;
    }
    void backtrack(int[] nums, int start, List<Integer> cur, List<List<Integer>> res) {
        res.add(new ArrayList<>(cur));
        for (int i = start; i < nums.length; i++) {
            cur.add(nums[i]);
            backtrack(nums, i + 1, cur, res);
            cur.remove(cur.size() - 1);
        }
    }
}`
      }
    ]
  },

  84: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(n²) — Check All (i, j) Pairs",
        idea: "For every pair of indices (i, j), find the minimum height between them and calculate area = minH * (j - i + 1).",
        complexity: { time: "O(n²)", space: "O(1)" },
        code: `class Solution {
    public int largestRectangleArea(int[] heights) {
        int maxArea = 0;
        int n = heights.length;
        for (int i = 0; i < n; i++) {
            int minH = heights[i];
            for (int j = i; j < n; j++) {
                minH = Math.min(minH, heights[j]);
                maxArea = Math.max(maxArea, minH * (j - i + 1));
            }
        }
        return maxArea;
    }
}`
      },
      {
        name: "Better",
        label: "O(n) Space — Left & Right Smaller Arrays",
        idea: "Precompute the first smaller element index to the left and right for every bar using monotonic stacks, then compute area in O(1) per bar.",
        complexity: { time: "O(n)", space: "O(n)" },
        code: `class Solution {
    public int largestRectangleArea(int[] heights) {
        int n = heights.length;
        int[] left = new int[n];
        int[] right = new int[n];
        Deque<Integer> stack = new ArrayDeque<>();
        
        for (int i = 0; i < n; i++) {
            while (!stack.isEmpty() && heights[stack.peek()] >= heights[i]) stack.pop();
            left[i] = stack.isEmpty() ? -1 : stack.peek();
            stack.push(i);
        }
        stack.clear();
        for (int i = n - 1; i >= 0; i--) {
            while (!stack.isEmpty() && heights[stack.peek()] >= heights[i]) stack.pop();
            right[i] = stack.isEmpty() ? n : stack.peek();
            stack.push(i);
        }
        int maxArea = 0;
        for (int i = 0; i < n; i++) {
            maxArea = Math.max(maxArea, heights[i] * (right[i] - left[i] - 1));
        }
        return maxArea;
    }
}`
      },
      {
        name: "Optimal",
        label: "O(n) One-Pass — Monotonic Stack",
        idea: "Maintain an increasing stack of indices. When encountering a bar shorter than stack top, pop and compute rectangle with popped bar as minimum height.",
        complexity: { time: "O(n) — Each index pushed and popped once", space: "O(n)" },
        code: `class Solution {
    public int largestRectangleArea(int[] heights) {
        int n = heights.length;
        Deque<Integer> stack = new ArrayDeque<>();
        int maxArea = 0;
        for (int i = 0; i <= n; i++) {
            int h = (i == n) ? 0 : heights[i];
            while (!stack.isEmpty() && heights[stack.peek()] > h) {
                int height = heights[stack.pop()];
                int width = stack.isEmpty() ? i : (i - stack.peek() - 1);
                maxArea = Math.max(maxArea, height * width);
            }
            stack.push(i);
        }
        return maxArea;
    }
}`
      }
    ]
  },

  91: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(2ⁿ) — Plain Recursion",
        idea: "From index i, recursively try 1-digit decoding (if s[i] != '0') and 2-digit decoding (if substring <= 26).",
        complexity: { time: "O(2ⁿ)", space: "O(n)" },
        code: `class Solution {
    public int numDecodings(String s) {
        return dfs(s, 0);
    }
    int dfs(String s, int i) {
        if (i == s.length()) return 1;
        if (s.charAt(i) == '0') return 0;
        int ways = dfs(s, i + 1);
        if (i + 1 < s.length()) {
            int twoDigit = Integer.parseInt(s.substring(i, i + 2));
            if (twoDigit <= 26) ways += dfs(s, i + 2);
        }
        return ways;
    }
}`
      },
      {
        name: "Better",
        label: "O(n) — Top-Down DP with Memoization",
        idea: "Store the number of ways to decode starting at index i in a memo array to avoid solving subproblems repeatedly.",
        complexity: { time: "O(n)", space: "O(n)" },
        code: `class Solution {
    public int numDecodings(String s) {
        int[] memo = new int[s.length()];
        Arrays.fill(memo, -1);
        return dfs(s, 0, memo);
    }
    int dfs(String s, int i, int[] memo) {
        if (i == s.length()) return 1;
        if (s.charAt(i) == '0') return 0;
        if (memo[i] != -1) return memo[i];
        
        int ways = dfs(s, i + 1, memo);
        if (i + 1 < s.length()) {
            int twoDigit = Integer.parseInt(s.substring(i, i + 2));
            if (twoDigit <= 26) ways += dfs(s, i + 2, memo);
        }
        return memo[i] = ways;
    }
}`
      },
      {
        name: "Optimal",
        label: "O(n) Time, O(1) Space — Bottom-Up State Rolling",
        idea: "Each step depends only on the previous two values: prev1 (i-1) and prev2 (i-2). Update them iteratively in constant space.",
        complexity: { time: "O(n)", space: "O(1)" },
        code: `class Solution {
    public int numDecodings(String s) {
        if (s == null || s.length() == 0 || s.charAt(0) == '0') return 0;
        int prev2 = 1, prev1 = 1;
        for (int i = 1; i < s.length(); i++) {
            int curr = 0;
            char c1 = s.charAt(i);
            char c0 = s.charAt(i - 1);
            if (c1 != '0') curr += prev1;
            int twoDigit = (c0 - '0') * 10 + (c1 - '0');
            if (twoDigit >= 10 && twoDigit <= 26) curr += prev2;
            prev2 = prev1;
            prev1 = curr;
        }
        return prev1;
    }
}`
      }
    ]
  },

  98: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(n) — In-Order Traversal to List",
        idea: "Perform an in-order traversal of the tree, store node values in a list, then verify if the list is strictly increasing.",
        complexity: { time: "O(n)", space: "O(n)" },
        code: `class Solution {
    public boolean isValidBST(TreeNode root) {
        List<Integer> values = new ArrayList<>();
        inorder(root, values);
        for (int i = 1; i < values.size(); i++) {
            if (values.get(i) <= values.get(i - 1)) return false;
        }
        return true;
    }
    void inorder(TreeNode node, List<Integer> list) {
        if (node == null) return;
        inorder(node.left, list);
        list.add(node.val);
        inorder(node.right, list);
    }
}`
      },
      {
        name: "Better",
        label: "O(n) — Iterative In-Order with Stack",
        idea: "Iterative in-order traversal using a Stack. Keep track of the previously visited node value to ensure strict increasing order.",
        complexity: { time: "O(n)", space: "O(h)" },
        code: `class Solution {
    public boolean isValidBST(TreeNode root) {
        Deque<TreeNode> stack = new ArrayDeque<>();
        TreeNode curr = root;
        Integer prev = null;
        while (curr != null || !stack.isEmpty()) {
            while (curr != null) {
                stack.push(curr);
                curr = curr.left;
            }
            curr = stack.pop();
            if (prev != null && curr.val <= prev) return false;
            prev = curr.val;
            curr = curr.right;
        }
        return true;
    }
}`
      },
      {
        name: "Optimal",
        label: "O(n) — Range Validation (min, max)",
        idea: "Recursively enforce that all nodes in a subtree lie within a valid (low, high) range. Pass Long bounds to handle 32-bit integer limits.",
        complexity: { time: "O(n)", space: "O(h) call stack" },
        code: `class Solution {
    public boolean isValidBST(TreeNode root) {
        return validate(root, Long.MIN_VALUE, Long.MAX_VALUE);
    }
    boolean validate(TreeNode node, long min, long max) {
        if (node == null) return true;
        if (node.val <= min || node.val >= max) return false;
        return validate(node.left, min, node.val) && validate(node.right, node.val, max);
    }
}`
      }
    ]
  },

  102: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(n × h) — Height Query + Level Print",
        idea: "Compute tree height h, then for each level d from 1 to h, traverse the tree to collect nodes at depth d.",
        complexity: { time: "O(n × h)", space: "O(h)" },
        code: `class Solution {
    public List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> result = new ArrayList<>();
        int h = getHeight(root);
        for (int d = 1; d <= h; d++) {
            List<Integer> level = new ArrayList<>();
            collect(root, d, level);
            result.add(level);
        }
        return result;
    }
    int getHeight(TreeNode node) {
        if (node == null) return 0;
        return 1 + Math.max(getHeight(node.left), getHeight(node.right));
    }
    void collect(TreeNode node, int d, List<Integer> list) {
        if (node == null) return;
        if (d == 1) list.add(node.val);
        else {
            collect(node.left, d - 1, list);
            collect(node.right, d - 1, list);
        }
    }
}`
      },
      {
        name: "Better",
        label: "O(n) — Pre-Order DFS with Level Index",
        idea: "Perform recursive DFS, passing the current level index. Add elements into the corresponding level list in result.",
        complexity: { time: "O(n)", space: "O(h) recursion stack" },
        code: `class Solution {
    public List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> result = new ArrayList<>();
        dfs(root, 0, result);
        return result;
    }
    void dfs(TreeNode node, int level, List<List<Integer>> res) {
        if (node == null) return;
        if (level == res.size()) res.add(new ArrayList<>());
        res.get(level).add(node.val);
        dfs(node.left, level + 1, res);
        dfs(node.right, level + 1, res);
    }
}`
      },
      {
        name: "Optimal",
        label: "O(n) — Canonical BFS Queue",
        idea: "Use a Queue. In each iteration, measure queue.size() to process exactly all nodes of the current level together.",
        complexity: { time: "O(n)", space: "O(n) for queue" },
        code: `class Solution {
    public List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> result = new ArrayList<>();
        if (root == null) return result;
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        
        while (!queue.isEmpty()) {
            int size = queue.size();
            List<Integer> currentLevel = new ArrayList<>(size);
            for (int i = 0; i < size; i++) {
                TreeNode node = queue.poll();
                currentLevel.add(node.val);
                if (node.left != null) queue.offer(node.left);
                if (node.right != null) queue.offer(node.right);
            }
            result.add(currentLevel);
        }
        return result;
    }
}`
      }
    ]
  },

  139: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(2ⁿ) — Plain Recursive Prefix Matching",
        idea: "For each prefix that matches a word in wordDict, recursively verify if the remaining substring can also be segmented.",
        complexity: { time: "O(2ⁿ)", space: "O(n) call stack" },
        code: `class Solution {
    public boolean wordBreak(String s, List<String> wordDict) {
        Set<String> dict = new HashSet<>(wordDict);
        return dfs(s, dict);
    }
    boolean dfs(String s, Set<String> dict) {
        if (s.isEmpty()) return true;
        for (int i = 1; i <= s.length(); i++) {
            if (dict.contains(s.substring(0, i)) && dfs(s.substring(i), dict)) {
                return true;
            }
        }
        return false;
    }
}`
      },
      {
        name: "Better",
        label: "O(n²) — Top-Down DP with Boolean Memo",
        idea: "Store segmentation results in a Boolean memo[start] array so that identical remaining suffixes are evaluated only once.",
        complexity: { time: "O(n²)", space: "O(n)" },
        code: `class Solution {
    public boolean wordBreak(String s, List<String> wordDict) {
        Set<String> dict = new HashSet<>(wordDict);
        Boolean[] memo = new Boolean[s.length()];
        return dfs(s, 0, dict, memo);
    }
    boolean dfs(String s, int start, Set<String> dict, Boolean[] memo) {
        if (start == s.length()) return true;
        if (memo[start] != null) return memo[start];
        for (int end = start + 1; end <= s.length(); end++) {
            if (dict.contains(s.substring(start, end)) && dfs(s, end, dict, memo)) {
                return memo[start] = true;
            }
        }
        return memo[start] = false;
    }
}`
      },
      {
        name: "Optimal",
        label: "O(n²) — Bottom-Up 1D DP",
        idea: "dp[i] represents if s[0..i-1] can be segmented. For each i, check all j < i: if dp[j] and s[j..i] is in dict, dp[i] = true.",
        complexity: { time: "O(n²)", space: "O(n)" },
        code: `class Solution {
    public boolean wordBreak(String s, List<String> wordDict) {
        Set<String> dict = new HashSet<>(wordDict);
        int n = s.length();
        boolean[] dp = new boolean[n + 1];
        dp[0] = true;
        
        for (int i = 1; i <= n; i++) {
            for (int j = 0; j < i; j++) {
                if (dp[j] && dict.contains(s.substring(j, i))) {
                    dp[i] = true;
                    break;
                }
            }
        }
        return dp[n];
    }
}`
      }
    ]
  },

  142: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(n) Space — HashSet of Visited Nodes",
        idea: "Traverse list adding each node to a Set. The first node already in the set is the beginning of the cycle.",
        complexity: { time: "O(n)", space: "O(n)" },
        code: `public class Solution {
    public ListNode detectCycle(ListNode head) {
        Set<ListNode> visited = new HashSet<>();
        ListNode curr = head;
        while (curr != null) {
            if (visited.contains(curr)) return curr;
            visited.add(curr);
            curr = curr.next;
        }
        return null;
    }
}`
      },
      {
        name: "Better",
        label: "O(n) Time, O(1) Space — Measure Cycle Length k",
        idea: "Once fast and slow meet, count the cycle length k. Then reset two pointers with gap k apart starting at head; they meet at the cycle start.",
        complexity: { time: "O(n)", space: "O(1)" },
        code: `public class Solution {
    public ListNode detectCycle(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) {
                // Find cycle length
                int k = 1;
                ListNode temp = slow.next;
                while (temp != slow) {
                    temp = temp.next;
                    k++;
                }
                ListNode p1 = head, p2 = head;
                for (int i = 0; i < k; i++) p2 = p2.next;
                while (p1 != p2) {
                    p1 = p1.next;
                    p2 = p2.next;
                }
                return p1;
            }
        }
        return null;
    }
}`
      },
      {
        name: "Optimal",
        label: "O(n) Time, O(1) Space — Floyd's Tortoise & Hare",
        idea: "When slow and fast meet, reset slow to head. Advance both slow and fast by 1 step simultaneously. They meet exactly at the cycle entry.",
        complexity: { time: "O(n)", space: "O(1)" },
        code: `public class Solution {
    public ListNode detectCycle(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) {
                ListNode entry = head;
                while (entry != slow) {
                    entry = entry.next;
                    slow = slow.next;
                }
                return entry;
            }
        }
        return null;
    }
}`
      }
    ]
  },

  207: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(V × (V + E)) — DFS from Every Node",
        idea: "Run DFS from each node to detect if any path loops back to itself without cross-search memoization.",
        complexity: { time: "O(V × (V + E))", space: "O(V)" },
        code: `class Solution {
    public boolean canFinish(int numCourses, int[][] prerequisites) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < numCourses; i++) adj.add(new ArrayList<>());
        for (int[] p : prerequisites) adj.get(p[1]).add(p[0]);
        
        for (int i = 0; i < numCourses; i++) {
            if (hasCycle(adj, new boolean[numCourses], i)) return false;
        }
        return true;
    }
    boolean hasCycle(List<List<Integer>> adj, boolean[] visited, int node) {
        if (visited[node]) return true;
        visited[node] = true;
        for (int neighbor : adj.get(node)) {
            if (hasCycle(adj, visited, neighbor)) return true;
        }
        visited[node] = false;
        return false;
    }
}`
      },
      {
        name: "Better",
        label: "O(V + E) — 3-Color DFS Cycle Detection",
        idea: "0=unvisited, 1=visiting (on current recursion path), 2=visited. Encountering state 1 indicates a back-edge (cycle).",
        complexity: { time: "O(V + E)", space: "O(V + E)" },
        code: `class Solution {
    public boolean canFinish(int numCourses, int[][] prerequisites) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < numCourses; i++) adj.add(new ArrayList<>());
        for (int[] p : prerequisites) adj.get(p[1]).add(p[0]);
        
        int[] state = new int[numCourses];
        for (int i = 0; i < numCourses; i++) {
            if (state[i] == 0 && hasCycle(adj, state, i)) return false;
        }
        return true;
    }
    boolean hasCycle(List<List<Integer>> adj, int[] state, int node) {
        if (state[node] == 1) return true;  // cycle
        if (state[node] == 2) return false; // already checked
        state[node] = 1;
        for (int next : adj.get(node)) {
            if (hasCycle(adj, state, next)) return true;
        }
        state[node] = 2;
        return false;
    }
}`
      },
      {
        name: "Optimal",
        label: "O(V + E) — Kahn's Algorithm (BFS Topological Sort)",
        idea: "Compute in-degrees for all courses. Add 0 in-degree courses to a queue. If total processed courses == numCourses, no cycle exists.",
        complexity: { time: "O(V + E)", space: "O(V + E)" },
        code: `class Solution {
    public boolean canFinish(int numCourses, int[][] prerequisites) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < numCourses; i++) adj.add(new ArrayList<>());
        int[] inDegree = new int[numCourses];
        
        for (int[] p : prerequisites) {
            adj.get(p[1]).add(p[0]);
            inDegree[p[0]]++;
        }
        Queue<Integer> queue = new LinkedList<>();
        for (int i = 0; i < numCourses; i++) {
            if (inDegree[i] == 0) queue.offer(i);
        }
        int count = 0;
        while (!queue.isEmpty()) {
            int curr = queue.poll();
            count++;
            for (int next : adj.get(curr)) {
                inDegree[next]--;
                if (inDegree[next] == 0) queue.offer(next);
            }
        }
        return count == numCourses;
    }
}`
      }
    ]
  },

  209: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(n²) — Check All Subarrays",
        idea: "For each starting index i, expand j and accumulate sum until sum >= target, tracking the minimum length (j - i + 1).",
        complexity: { time: "O(n²)", space: "O(1)" },
        code: `class Solution {
    public int minSubArrayLen(int target, int[] nums) {
        int minLen = Integer.MAX_VALUE;
        int n = nums.length;
        for (int i = 0; i < n; i++) {
            int sum = 0;
            for (int j = i; j < n; j++) {
                sum += nums[j];
                if (sum >= target) {
                    minLen = Math.min(minLen, j - i + 1);
                    break;
                }
            }
        }
        return minLen == Integer.MAX_VALUE ? 0 : minLen;
    }
}`
      },
      {
        name: "Better",
        label: "O(n log n) — Prefix Sum + Binary Search",
        idea: "Build a monotonic prefix sum array. For each i, binary search for the smallest j where prefix[j] >= prefix[i-1] + target.",
        complexity: { time: "O(n log n)", space: "O(n)" },
        code: `class Solution {
    public int minSubArrayLen(int target, int[] nums) {
        int n = nums.length;
        int[] prefix = new int[n + 1];
        for (int i = 0; i < n; i++) prefix[i + 1] = prefix[i] + nums[i];
        
        int minLen = Integer.MAX_VALUE;
        for (int i = 1; i <= n; i++) {
            int needed = prefix[i - 1] + target;
            int idx = Arrays.binarySearch(prefix, needed);
            if (idx < 0) idx = -idx - 1;
            if (idx <= n) minLen = Math.min(minLen, idx - i + 1);
        }
        return minLen == Integer.MAX_VALUE ? 0 : minLen;
    }
}`
      },
      {
        name: "Optimal",
        label: "O(n) — Sliding Window / Two Pointers",
        idea: "Expand right to add elements to sum. While sum >= target, record window length and shrink from left by subtracting nums[left].",
        complexity: { time: "O(n)", space: "O(1)" },
        code: `class Solution {
    public int minSubArrayLen(int target, int[] nums) {
        int left = 0, sum = 0;
        int minLen = Integer.MAX_VALUE;
        for (int right = 0; right < nums.length; right++) {
            sum += nums[right];
            while (sum >= target) {
                minLen = Math.min(minLen, right - left + 1);
                sum -= nums[left++];
            }
        }
        return minLen == Integer.MAX_VALUE ? 0 : minLen;
    }
}`
      }
    ]
  },

  235: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(n) — Path Tracing to Lists",
        idea: "Trace the path from root to p and root to q into two lists. Traverse the lists simultaneously to find the last identical node.",
        complexity: { time: "O(n)", space: "O(n)" },
        code: `class Solution {
    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
        List<TreeNode> pathP = new ArrayList<>();
        List<TreeNode> pathQ = new ArrayList<>();
        findPath(root, p, pathP);
        findPath(root, q, pathQ);
        
        TreeNode lca = null;
        int i = 0;
        while (i < pathP.size() && i < pathQ.size() && pathP.get(i) == pathQ.get(i)) {
            lca = pathP.get(i);
            i++;
        }
        return lca;
    }
    boolean findPath(TreeNode root, TreeNode target, List<TreeNode> path) {
        if (root == null) return false;
        path.add(root);
        if (root == target) return true;
        if (target.val < root.val && findPath(root.left, target, path)) return true;
        if (target.val > root.val && findPath(root.right, target, path)) return true;
        path.remove(path.size() - 1);
        return false;
    }
}`
      },
      {
        name: "Better",
        label: "O(h) — Recursive BST Descent",
        idea: "If both p and q have smaller values than root, descend left. If both are greater, descend right. Otherwise, root is the split point (LCA).",
        complexity: { time: "O(h)", space: "O(h) call stack" },
        code: `class Solution {
    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
        if (p.val < root.val && q.val < root.val) {
            return lowestCommonAncestor(root.left, p, q);
        }
        if (p.val > root.val && q.val > root.val) {
            return lowestCommonAncestor(root.right, p, q);
        }
        return root;
    }
}`
      },
      {
        name: "Optimal",
        label: "O(h) Time, O(1) Space — Iterative BST Traversal",
        idea: "Iteratively traverse down the BST using a while loop. Since no recursion stack is used, space is strictly O(1).",
        complexity: { time: "O(h)", space: "O(1)" },
        code: `class Solution {
    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
        TreeNode curr = root;
        while (curr != null) {
            if (p.val < curr.val && q.val < curr.val) {
                curr = curr.left;
            } else if (p.val > curr.val && q.val > curr.val) {
                curr = curr.right;
            } else {
                return curr;
            }
        }
        return null;
    }
}`
      }
    ]
  },

  416: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(2ⁿ) — Recursive Subset Sum",
        idea: "If total sum is odd, return false. Otherwise, explore every subset recursively to check if any sum equals total / 2.",
        complexity: { time: "O(2ⁿ)", space: "O(n)" },
        code: `class Solution {
    public boolean canPartition(int[] nums) {
        int sum = 0;
        for (int x : nums) sum += x;
        if (sum % 2 != 0) return false;
        return dfs(nums, 0, sum / 2);
    }
    boolean dfs(int[] nums, int i, int target) {
        if (target == 0) return true;
        if (i == nums.length || target < 0) return false;
        return dfs(nums, i + 1, target - nums[i]) || dfs(nums, i + 1, target);
    }
}`
      },
      {
        name: "Better",
        label: "O(n × target) — 2D DP Table",
        idea: "dp[i][j] = true if a subset of the first i elements can sum to j. Classic 0/1 Knapsack table.",
        complexity: { time: "O(n × target)", space: "O(n × target)" },
        code: `class Solution {
    public boolean canPartition(int[] nums) {
        int sum = 0;
        for (int x : nums) sum += x;
        if (sum % 2 != 0) return false;
        int target = sum / 2;
        int n = nums.length;
        
        boolean[][] dp = new boolean[n + 1][target + 1];
        for (int i = 0; i <= n; i++) dp[i][0] = true;
        
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= target; j++) {
                dp[i][j] = dp[i - 1][j];
                if (j >= nums[i - 1]) {
                    dp[i][j] = dp[i][j] || dp[i - 1][j - nums[i - 1]];
                }
            }
        }
        return dp[n][target];
    }
}`
      },
      {
        name: "Optimal",
        label: "O(n × target) Time, O(target) Space — 1D DP Array",
        idea: "Iterate backwards from target down to num for each element, updating dp[j] = dp[j] || dp[j - num]. Backwards iteration prevents reusing the same item.",
        complexity: { time: "O(n × target)", space: "O(target)" },
        code: `class Solution {
    public boolean canPartition(int[] nums) {
        int sum = 0;
        for (int x : nums) sum += x;
        if (sum % 2 != 0) return false;
        int target = sum / 2;
        
        boolean[] dp = new boolean[target + 1];
        dp[0] = true;
        for (int num : nums) {
            for (int j = target; j >= num; j--) {
                if (dp[j - num]) dp[j] = true;
            }
        }
        return dp[target];
    }
}`
      }
    ]
  },

  547: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(n²) — BFS Connected Components",
        idea: "Maintain a visited array. For each unvisited city, initiate a BFS using a Queue to visit all reachable cities and increment province count.",
        complexity: { time: "O(n²)", space: "O(n)" },
        code: `class Solution {
    public int findCircleNum(int[][] isConnected) {
        int n = isConnected.length;
        boolean[] visited = new boolean[n];
        int provinces = 0;
        
        for (int i = 0; i < n; i++) {
            if (!visited[i]) {
                provinces++;
                Queue<Integer> queue = new LinkedList<>();
                queue.offer(i);
                visited[i] = true;
                while (!queue.isEmpty()) {
                    int city = queue.poll();
                    for (int j = 0; j < n; j++) {
                        if (isConnected[city][j] == 1 && !visited[j]) {
                            visited[j] = true;
                            queue.offer(j);
                        }
                    }
                }
            }
        }
        return provinces;
    }
}`
      },
      {
        name: "Better",
        label: "O(n²) — Recursive DFS",
        idea: "Iterate through cities. For each unvisited city, increment province counter and trigger DFS to mark its entire connected component.",
        complexity: { time: "O(n²)", space: "O(n) call stack" },
        code: `class Solution {
    public int findCircleNum(int[][] isConnected) {
        int n = isConnected.length;
        boolean[] visited = new boolean[n];
        int provinces = 0;
        for (int i = 0; i < n; i++) {
            if (!visited[i]) {
                provinces++;
                dfs(isConnected, visited, i);
            }
        }
        return provinces;
    }
    void dfs(int[][] graph, boolean[] visited, int i) {
        visited[i] = true;
        for (int j = 0; j < graph.length; j++) {
            if (graph[i][j] == 1 && !visited[j]) {
                dfs(graph, visited, j);
            }
        }
    }
}`
      },
      {
        name: "Optimal",
        label: "O(n² · α(n)) — Disjoint Set Union (Union-Find)",
        idea: "Initialize n sets. For each edge (i, j), perform union. Each successful union reduces the number of provinces by 1. Uses path compression.",
        complexity: { time: "O(n² · α(n))", space: "O(n)" },
        code: `class Solution {
    public int findCircleNum(int[][] isConnected) {
        int n = isConnected.length;
        int[] parent = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;
        int count = n;
        
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                if (isConnected[i][j] == 1) {
                    int rootI = find(parent, i);
                    int rootJ = find(parent, j);
                    if (rootI != rootJ) {
                        parent[rootI] = rootJ;
                        count--;
                    }
                }
            }
        }
        return count;
    }
    int find(int[] parent, int i) {
        if (parent[i] == i) return i;
        return parent[i] = find(parent, parent[i]); // Path compression
    }
}`
      }
    ]
  },

  1143: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(2^(m+n)) — Pure Recursion",
        idea: "Compare text1[i] and text2[j]. If equal, return 1 + dfs(i+1, j+1). Else return max(dfs(i+1, j), dfs(i, j+1)).",
        complexity: { time: "O(2^(m+n))", space: "O(m + n)" },
        code: `class Solution {
    public int longestCommonSubsequence(String text1, String text2) {
        return dfs(text1, text2, 0, 0);
    }
    int dfs(String s1, String s2, int i, int j) {
        if (i == s1.length() || j == s2.length()) return 0;
        if (s1.charAt(i) == s2.charAt(j)) {
            return 1 + dfs(s1, s2, i + 1, j + 1);
        }
        return Math.max(dfs(s1, s2, i + 1, j), dfs(s1, s2, i, j + 1));
    }
}`
      },
      {
        name: "Better",
        label: "O(m × n) — 2D DP Table",
        idea: "dp[i][j] stores the LCS length of text1[0..i-1] and text2[0..j-1]. Filled iteratively row by row.",
        complexity: { time: "O(m × n)", space: "O(m × n)" },
        code: `class Solution {
    public int longestCommonSubsequence(String text1, String text2) {
        int m = text1.length(), n = text2.length();
        int[][] dp = new int[m + 1][n + 1];
        
        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (text1.charAt(i - 1) == text2.charAt(j - 1)) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                } else {
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                }
            }
        }
        return dp[m][n];
    }
}`
      },
      {
        name: "Optimal",
        label: "O(m × n) Time, O(min(m,n)) Space — Two-Row DP",
        idea: "Each row in the DP grid only depends on the previous row. Keep only two rows (prev and curr) in memory to reduce space.",
        complexity: { time: "O(m × n)", space: "O(min(m, n))" },
        code: `class Solution {
    public int longestCommonSubsequence(String text1, String text2) {
        if (text1.length() < text2.length()) {
            String temp = text1; text1 = text2; text2 = temp;
        }
        int m = text1.length(), n = text2.length();
        int[] prev = new int[n + 1];
        int[] curr = new int[n + 1];
        
        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (text1.charAt(i - 1) == text2.charAt(j - 1)) {
                    curr[j] = prev[j - 1] + 1;
                } else {
                    curr[j] = Math.max(prev[j], curr[j - 1]);
                }
            }
            int[] temp = prev; prev = curr; curr = temp;
        }
        return prev[n];
    }
}`
      }
    ]
  }
};

let solAdded = 0;
for (const [id, sol] of Object.entries(NEW_SOLUTIONS)) {
  if (!solContent.includes(`\n  ${id}: {`)) {
    const endMarker = "\n};\n\nexport function getProblemSolutions";
    const endIdx = solContent.indexOf(endMarker);
    if (endIdx !== -1) {
      const jsonStr = JSON.stringify(sol, null, 4).replace(/\n/g, "\n  ");
      const entryStr = `\n  ${id}: ${jsonStr},`;
      solContent = solContent.slice(0, endIdx) + entryStr + solContent.slice(endIdx);
      solAdded++;
    }
  }
}
fs.writeFileSync(solutionsPath, solContent, "utf8");
console.log(`Added ${solAdded} multi-approach solutions.`);
