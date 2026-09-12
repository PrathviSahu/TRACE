const { runJava } = require("../src/engine/interpreter.js");

const tests = [
  {
    id: 15,
    name: "3Sum",
    code: `
class Solution {
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
}
`,
    inputs: { nums: "[-4, -1, -1, 0, 1, 2]" }
  },
  {
    id: 19,
    name: "Remove Nth Node From End of List",
    code: `
class Solution {
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
}
`,
    inputs: {}
  },
  {
    id: 39,
    name: "Combination Sum",
    code: `
class Solution {
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
}
`,
    inputs: { candidates: "[2, 3, 6, 7]", target: "7" }
  },
  {
    id: 42,
    name: "Trapping Rain Water",
    code: `
class Solution {
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
}
`,
    inputs: { height: "[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]" }
  },
  {
    id: 46,
    name: "Permutations",
    code: `
class Solution {
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
}
`,
    inputs: { nums: "[1, 2, 3]" }
  },
  {
    id: 76,
    name: "Minimum Window Substring",
    code: `
class Solution {
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
}
`,
    inputs: { s: "ADOBECODEBANC", t: "ABC" }
  },
  {
    id: 78,
    name: "Subsets",
    code: `
class Solution {
    public int subsets(int[] nums) {
        int n = nums.length;
        int total = 1;
        for (int i = 0; i < n; i++) {
            total = total * 2;
        }
        return total;
    }
}
`,
    inputs: { nums: "[1, 2, 3]" }
  },
  {
    id: 84,
    name: "Largest Rectangle in Histogram",
    code: `
class Solution {
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
}
`,
    inputs: { heights: "[2, 1, 5, 6, 2, 3]" }
  },
  {
    id: 91,
    name: "Decode Ways",
    code: `
class Solution {
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
}
`,
    inputs: { s: "226" }
  },
  {
    id: 98,
    name: "Validate Binary Search Tree",
    code: `
class Solution {
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
}
`,
    inputs: {}
  },
  {
    id: 102,
    name: "Binary Tree Level Order Traversal",
    code: `
class Solution {
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
}
`,
    inputs: {}
  },
  {
    id: 139,
    name: "Word Break",
    code: `
class Solution {
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
}
`,
    inputs: { s: "leetcode" }
  },
  {
    id: 141,
    name: "Linked List Cycle",
    code: `
class Solution {
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
}
`,
    inputs: {}
  },
  {
    id: 142,
    name: "Linked List Cycle II",
    code: `
class Solution {
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
}
`,
    inputs: {}
  },
  {
    id: 207,
    name: "Course Schedule",
    code: `
class Solution {
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
}
`,
    inputs: { numCourses: "2" }
  },
  {
    id: 209,
    name: "Minimum Size Subarray Sum",
    code: `
class Solution {
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
}
`,
    inputs: { target: "7", nums: "[2, 3, 1, 2, 4, 3]" }
  },
  {
    id: 235,
    name: "Lowest Common Ancestor of a BST",
    code: `
class Solution {
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
}
`,
    inputs: {}
  },
  {
    id: 242,
    name: "Valid Anagram",
    code: `
class Solution {
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
}
`,
    inputs: { s: "anagram", t: "nagaram" }
  },
  {
    id: 416,
    name: "Partition Equal Subset Sum",
    code: `
class Solution {
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
}
`,
    inputs: { nums: "[1, 5, 11, 5]" }
  },
  {
    id: 547,
    name: "Number of Provinces",
    code: `
class Solution {
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
}
`,
    inputs: {}
  },
  {
    id: 1143,
    name: "Longest Common Subsequence",
    code: `
class Solution {
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
}
`,
    inputs: { text1: "abcde", text2: "ace" }
  }
];

console.log(`Testing ${tests.length} templates in interpreter...`);
let passed = 0;
for (const t of tests) {
  try {
    const res = runJava(t.code, t.inputs);
    if (res.error) {
      console.log(`❌ LC ${t.id} (${t.name}): ERROR: ${res.error}`);
    } else {
      console.log(`✅ LC ${t.id} (${t.name}): return=${JSON.stringify(res.returnValue)}`);
      passed++;
    }
  } catch (err) {
    console.log(`❌ LC ${t.id} (${t.name}): EXCEPTION: ${err.message}`);
  }
}
console.log(`Passed: ${passed}/${tests.length}`);
