const { runJava } = require("../src/engine/interpreter.js");

const tests = [
  {
    id: 3,
    code: `class Solution {
    public int lengthOfLongestSubstring(String s) {
        int maxLen = 0;
        int left = 0;
        int[] charIndex = new int[128];
        for (int i = 0; i < 128; i++) charIndex[i] = -1;
        for (int right = 0; right < s.length(); right++) {
            int c = (int) s.charAt(right);
            if (charIndex[c] >= left) left = charIndex[c] + 1;
            charIndex[c] = right;
            int len = right - left + 1;
            if (len > maxLen) maxLen = len;
        }
        return maxLen;
    }
}`,
    inputs: { s: '"abcabcbb"' },
    expected: 3
  },
  {
    id: 20,
    code: `class Solution {
    public boolean isValid(String s) {
        int[] stack = new int[s.length()];
        int top = 0;
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c == '(' || c == '[' || c == '{') {
                stack[top] = c;
                top++;
            } else {
                if (top == 0) return false;
                top--;
                int prev = stack[top];
                if (c == ')' && prev != '(') return false;
                if (c == ']' && prev != '[') return false;
                if (c == '}' && prev != '{') return false;
            }
        }
        return top == 0;
    }
}`,
    inputs: { s: '"()[]{}"' },
    expected: true
  },
  {
    id: 104,
    code: `class Solution {
    public int maxDepth(TreeNode root) {
        if (root == null) return 0;
        int left = maxDepth(root.left);
        int right = maxDepth(root.right);
        int deeper = left > right ? left : right;
        return deeper + 1;
    }
}`,
    inputs: { root: "[3,9,20,null,null,15,7]" },
    expected: 3
  },
  {
    id: 226,
    code: `class Solution {
    public TreeNode invertTree(TreeNode root) {
        if (root == null) return null;
        TreeNode left = invertTree(root.left);
        TreeNode right = invertTree(root.right);
        root.left = right;
        root.right = left;
        return root;
    }
}`,
    inputs: { root: "[4,2,7,1,3,6,9]" },
    expected: null
  },
  {
    id: 198,
    code: `class Solution {
    public int rob(int[] nums) {
        if (nums.length == 1) return nums[0];
        int prev2 = 0;
        int prev1 = 0;
        for (int i = 0; i < nums.length; i++) {
            int curr = prev2 + nums[i];
            if (prev1 > curr) curr = prev1;
            prev2 = prev1;
            prev1 = curr;
        }
        return prev1;
    }
}`,
    inputs: { nums: "[2,7,9,3,1]" },
    expected: 12
  },
  {
    id: 322,
    code: `class Solution {
    public int coinChange(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        for (int i = 1; i <= amount; i++) dp[i] = amount + 1;
        dp[0] = 0;
        for (int i = 1; i <= amount; i++) {
            for (int j = 0; j < coins.length; j++) {
                if (coins[j] <= i) {
                    int val = dp[i - coins[j]] + 1;
                    if (val < dp[i]) dp[i] = val;
                }
            }
        }
        if (dp[amount] > amount) return -1;
        return dp[amount];
    }
}`,
    inputs: { coins: "[1,5,11]", amount: 11 },
    expected: 1
  },
  {
    id: 55,
    code: `class Solution {
    public boolean canJump(int[] nums) {
        int maxReach = 0;
        for (int i = 0; i < nums.length; i++) {
            if (i > maxReach) return false;
            int reach = i + nums[i];
            if (reach > maxReach) maxReach = reach;
        }
        return true;
    }
}`,
    inputs: { nums: "[2,3,1,1,4]" },
    expected: true
  },
  {
    id: 62,
    code: `class Solution {
    public int uniquePaths(int m, int n) {
        int[] dp = new int[n];
        for (int i = 0; i < n; i++) dp[i] = 1;
        for (int i = 1; i < m; i++) {
            for (int j = 1; j < n; j++) {
                dp[j] = dp[j] + dp[j - 1];
            }
        }
        return dp[n - 1];
    }
}`,
    inputs: { m: 3, n: 7 },
    expected: 28
  },
  {
    id: 33,
    code: `class Solution {
    public int search(int[] nums, int target) {
        int left = 0;
        int right = nums.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;
            if (nums[left] <= nums[mid]) {
                if (nums[left] <= target && target < nums[mid]) {
                    right = mid - 1;
                } else {
                    left = mid + 1;
                }
            } else {
                if (nums[mid] < target && target <= nums[right]) {
                    left = mid + 1;
                } else {
                    right = mid - 1;
                }
            }
        }
        return -1;
    }
}`,
    inputs: { nums: "[4,5,6,7,0,1,2]", target: 0 },
    expected: 4
  },
  {
    id: 153,
    code: `class Solution {
    public int findMin(int[] nums) {
        int left = 0;
        int right = nums.length - 1;
        while (left < right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] > nums[right]) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }
        return nums[left];
    }
}`,
    inputs: { nums: "[3,4,5,1,2]" },
    expected: 1
  },
  {
    id: 238,
    code: `class Solution {
    public int[] productExceptSelf(int[] nums) {
        int n = nums.length;
        int[] result = new int[n];
        result[0] = 1;
        for (int i = 1; i < n; i++) {
            result[i] = result[i - 1] * nums[i - 1];
        }
        int right = 1;
        for (int i = n - 1; i >= 0; i--) {
            result[i] = result[i] * right;
            right = right * nums[i];
        }
        return result;
    }
}`,
    inputs: { nums: "[1,2,3,4]" },
    expected: null
  },
  {
    id: 739,
    code: `class Solution {
    public int[] dailyTemperatures(int[] temperatures) {
        int n = temperatures.length;
        int[] result = new int[n];
        int[] stack = new int[n];
        int top = 0;
        for (int i = 0; i < n; i++) {
            while (top > 0 && temperatures[stack[top - 1]] < temperatures[i]) {
                top--;
                int idx = stack[top];
                result[idx] = i - idx;
            }
            stack[top] = i;
            top++;
        }
        return result;
    }
}`,
    inputs: { temperatures: "[73,74,75,71,69,72,76,73]" },
    expected: null
  },
  {
    id: 300,
    code: `class Solution {
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
}`,
    inputs: { nums: "[10,9,2,5,3,7,101,18]" },
    expected: 4
  },
  {
    id: 21,
    code: `class Solution {
    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        if (list1 == null) return list2;
        if (list2 == null) return list1;
        if (list1.val <= list2.val) {
            list1.next = mergeTwoLists(list1.next, list2);
            return list1;
        } else {
            list2.next = mergeTwoLists(list1, list2.next);
            return list2;
        }
    }
}`,
    inputs: { list1: "[1,2,4]", list2: "[1,3,4]" },
    expected: null
  },
  {
    id: 206,
    code: `class Solution {
    public ListNode reverseList(ListNode head) {
        ListNode prev = null;
        ListNode curr = head;
        while (curr != null) {
            ListNode next = curr.next;
            curr.next = prev;
            prev = curr;
            curr = next;
        }
        return prev;
    }
}`,
    inputs: { head: "[1,2,3,4,5]" },
    expected: null
  }
];

let passed = 0;
let failed = 0;
let skipped = 0;
for (const t of tests) {
  try {
    const r = runJava(t.code, t.inputs);
    const match = t.expected === null ? "skip" : (r.returnValue === t.expected ? "PASS" : "FAIL");
    const hasError = r.error ? " ERROR:" + r.error.substring(0, 70) : "";
    console.log("#" + t.id + ": steps=" + (r.trace ? r.trace.length : 0) + ", return=" + r.returnValue + ", expected=" + t.expected + " [" + match + "]" + hasError);
    if (match === "PASS") passed++;
    else if (match === "FAIL") failed++;
    else skipped++;
  } catch (e) {
    console.log("#" + t.id + ": EXCEPTION - " + e.message.substring(0, 80));
    failed++;
  }
}
console.log("\n" + passed + " passed, " + failed + " failed, " + skipped + " expected=null (verify manually)");
