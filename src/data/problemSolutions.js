// ─────────────────────────────────────────────────────────────
//  TRACE — Problem Solutions: 3 Approaches per Problem
//  Brute Force → Better → Optimal
// ─────────────────────────────────────────────────────────────

export const PROBLEM_SOLUTIONS = {

  1: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(n²) — Nested Loops",
        idea: "Check every pair (i, j) to see if nums[i] + nums[j] == target.",
        complexity: { time: "O(n²)", space: "O(1)" },
        code: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        for (int i = 0; i < nums.length; i++) {
            for (int j = i + 1; j < nums.length; j++) {
                if (nums[i] + nums[j] == target) {
                    return new int[]{i, j};
                }
            }
        }
        return new int[]{-1, -1};
    }
}`
      },
      {
        name: "Better",
        label: "O(n) — Two-pass HashMap",
        idea: "First pass: store all values in a HashMap. Second pass: check if complement exists.",
        complexity: { time: "O(n)", space: "O(n)" },
        code: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            map.put(nums[i], i);
        }
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement) && map.get(complement) != i) {
                return new int[]{i, map.get(complement)};
            }
        }
        return new int[]{-1, -1};
    }
}`
      },
      {
        name: "Optimal",
        label: "O(n) — One-pass HashMap",
        idea: "As you scan, check if the complement already exists in the map before inserting the current element.",
        complexity: { time: "O(n)", space: "O(n)" },
        code: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[]{map.get(complement), i};
            }
            map.put(nums[i], i);
        }
        return new int[]{-1, -1};
    }
}`
      }
    ]
  },

  53: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(n²) — All Subarrays",
        idea: "Try every possible subarray [i..j] and track the maximum sum.",
        complexity: { time: "O(n²)", space: "O(1)" },
        code: `class Solution {
    public int maxSubArray(int[] nums) {
        int maxSum = Integer.MIN_VALUE;
        for (int i = 0; i < nums.length; i++) {
            int currentSum = 0;
            for (int j = i; j < nums.length; j++) {
                currentSum += nums[j];
                maxSum = Math.max(maxSum, currentSum);
            }
        }
        return maxSum;
    }
}`
      },
      {
        name: "Better",
        label: "O(n log n) — Divide & Conquer",
        idea: "Split array in half recursively. Max subarray is either in left half, right half, or crosses the midpoint.",
        complexity: { time: "O(n log n)", space: "O(log n)" },
        code: `class Solution {
    public int maxSubArray(int[] nums) {
        return divideConquer(nums, 0, nums.length - 1);
    }

    private int divideConquer(int[] nums, int left, int right) {
        if (left == right) return nums[left];
        int mid = left + (right - left) / 2;
        int leftMax = divideConquer(nums, left, mid);
        int rightMax = divideConquer(nums, mid + 1, right);
        int crossMax = crossSum(nums, left, right, mid);
        return Math.max(Math.max(leftMax, rightMax), crossMax);
    }

    private int crossSum(int[] nums, int left, int right, int mid) {
        int leftSum = Integer.MIN_VALUE, curr = 0;
        for (int i = mid; i >= left; i--) { curr += nums[i]; leftSum = Math.max(leftSum, curr); }
        int rightSum = Integer.MIN_VALUE; curr = 0;
        for (int i = mid + 1; i <= right; i++) { curr += nums[i]; rightSum = Math.max(rightSum, curr); }
        return leftSum + rightSum;
    }
}`
      },
      {
        name: "Optimal",
        label: "O(n) — Kadane's Algorithm",
        idea: "At each position: either extend the current subarray or start fresh. Track the running max.",
        complexity: { time: "O(n)", space: "O(1)" },
        code: `class Solution {
    public int maxSubArray(int[] nums) {
        int maxSum = nums[0];
        int currentSum = nums[0];
        for (int i = 1; i < nums.length; i++) {
            currentSum = Math.max(nums[i], currentSum + nums[i]);
            maxSum = Math.max(maxSum, currentSum);
        }
        return maxSum;
    }
}`
      }
    ]
  },

  121: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(n²) — Try Every Buy/Sell Pair",
        idea: "For each buy day i, try every sell day j > i and track maximum profit.",
        complexity: { time: "O(n²)", space: "O(1)" },
        code: `class Solution {
    public int maxProfit(int[] prices) {
        int maxProfit = 0;
        for (int i = 0; i < prices.length; i++) {
            for (int j = i + 1; j < prices.length; j++) {
                int profit = prices[j] - prices[i];
                maxProfit = Math.max(maxProfit, profit);
            }
        }
        return maxProfit;
    }
}`
      },
      {
        name: "Better",
        label: "O(n) — Track Min So Far",
        idea: "Scan once, maintaining the minimum price seen so far and the best profit at each step.",
        complexity: { time: "O(n)", space: "O(1)" },
        code: `class Solution {
    public int maxProfit(int[] prices) {
        int minPrice = Integer.MAX_VALUE;
        int maxProfit = 0;
        for (int price : prices) {
            if (price < minPrice) {
                minPrice = price;
            } else {
                maxProfit = Math.max(maxProfit, price - minPrice);
            }
        }
        return maxProfit;
    }
}`
      },
      {
        name: "Optimal",
        label: "O(n) — Kadane's Variant",
        idea: "Same O(n) but framed as a max-subarray problem on price differences. More elegant formulation.",
        complexity: { time: "O(n)", space: "O(1)" },
        code: `class Solution {
    public int maxProfit(int[] prices) {
        int minPrice = prices[0], maxProfit = 0;
        for (int i = 1; i < prices.length; i++) {
            maxProfit = Math.max(maxProfit, prices[i] - minPrice);
            minPrice = Math.min(minPrice, prices[i]);
        }
        return maxProfit;
    }
}`
      }
    ]
  },

  217: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(n²) — Compare Each Pair",
        idea: "For each element, check if it appears again later in the array.",
        complexity: { time: "O(n²)", space: "O(1)" },
        code: `class Solution {
    public boolean containsDuplicate(int[] nums) {
        for (int i = 0; i < nums.length; i++) {
            for (int j = i + 1; j < nums.length; j++) {
                if (nums[i] == nums[j]) return true;
            }
        }
        return false;
    }
}`
      },
      {
        name: "Better",
        label: "O(n log n) — Sort First",
        idea: "After sorting, duplicates will be adjacent. Just check consecutive elements.",
        complexity: { time: "O(n log n)", space: "O(1)" },
        code: `class Solution {
    public boolean containsDuplicate(int[] nums) {
        Arrays.sort(nums);
        for (int i = 1; i < nums.length; i++) {
            if (nums[i] == nums[i - 1]) return true;
        }
        return false;
    }
}`
      },
      {
        name: "Optimal",
        label: "O(n) — HashSet",
        idea: "Use a HashSet. If we try to add an element that already exists, return true immediately.",
        complexity: { time: "O(n)", space: "O(n)" },
        code: `class Solution {
    public boolean containsDuplicate(int[] nums) {
        Set<Integer> seen = new HashSet<>();
        for (int num : nums) {
            if (!seen.add(num)) return true;
        }
        return false;
    }
}`
      }
    ]
  },

  3: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(n³) — Check All Substrings",
        idea: "Generate every substring and check if it has all unique characters.",
        complexity: { time: "O(n³)", space: "O(min(n,m))" },
        code: `class Solution {
    public int lengthOfLongestSubstring(String s) {
        int maxLen = 0;
        for (int i = 0; i < s.length(); i++) {
            for (int j = i + 1; j <= s.length(); j++) {
                if (allUnique(s, i, j)) {
                    maxLen = Math.max(maxLen, j - i);
                }
            }
        }
        return maxLen;
    }

    private boolean allUnique(String s, int start, int end) {
        Set<Character> set = new HashSet<>();
        for (int i = start; i < end; i++) {
            char c = s.charAt(i);
            if (set.contains(c)) return false;
            set.add(c);
        }
        return true;
    }
}`
      },
      {
        name: "Better",
        label: "O(n) — Sliding Window with Set",
        idea: "Two pointers. When a duplicate is found, shrink the window from the left until the duplicate is removed.",
        complexity: { time: "O(n)", space: "O(min(n,m))" },
        code: `class Solution {
    public int lengthOfLongestSubstring(String s) {
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
        return maxLen;
    }
}`
      },
      {
        name: "Optimal",
        label: "O(n) — Sliding Window with HashMap (Jump)",
        idea: "Store the index of each character. When a duplicate is found, jump the left pointer directly to its position — no need to shrink one by one.",
        complexity: { time: "O(n)", space: "O(min(n,m))" },
        code: `class Solution {
    public int lengthOfLongestSubstring(String s) {
        Map<Character, Integer> map = new HashMap<>();
        int left = 0, maxLen = 0;
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            if (map.containsKey(c)) {
                left = Math.max(left, map.get(c) + 1);
            }
            map.put(c, right);
            maxLen = Math.max(maxLen, right - left + 1);
        }
        return maxLen;
    }
}`
      }
    ]
  },

  704: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(n) — Linear Search",
        idea: "Scan every element from left to right until you find the target.",
        complexity: { time: "O(n)", space: "O(1)" },
        code: `class Solution {
    public int search(int[] nums, int target) {
        for (int i = 0; i < nums.length; i++) {
            if (nums[i] == target) return i;
        }
        return -1;
    }
}`
      },
      {
        name: "Better",
        label: "O(log n) — Recursive Binary Search",
        idea: "Divide and conquer: recursively search the left or right half depending on mid comparison.",
        complexity: { time: "O(log n)", space: "O(log n)" },
        code: `class Solution {
    public int search(int[] nums, int target) {
        return binarySearch(nums, target, 0, nums.length - 1);
    }

    private int binarySearch(int[] nums, int target, int left, int right) {
        if (left > right) return -1;
        int mid = left + (right - left) / 2;
        if (nums[mid] == target) return mid;
        if (nums[mid] < target) return binarySearch(nums, target, mid + 1, right);
        return binarySearch(nums, target, left, mid - 1);
    }
}`
      },
      {
        name: "Optimal",
        label: "O(log n) — Iterative Binary Search",
        idea: "Same O(log n) but iterative — avoids recursion stack overhead.",
        complexity: { time: "O(log n)", space: "O(1)" },
        code: `class Solution {
    public int search(int[] nums, int target) {
        int left = 0, right = nums.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;
            if (nums[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }
}`
      }
    ]
  },

  283: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(n²) — Swap with Next Non-zero",
        idea: "For each zero, linearly find the next non-zero element and swap.",
        complexity: { time: "O(n²)", space: "O(1)" },
        code: `class Solution {
    public void moveZeroes(int[] nums) {
        for (int i = 0; i < nums.length; i++) {
            if (nums[i] == 0) {
                int j = i + 1;
                while (j < nums.length && nums[j] == 0) j++;
                if (j < nums.length) {
                    nums[i] = nums[j];
                    nums[j] = 0;
                }
            }
        }
    }
}`
      },
      {
        name: "Better",
        label: "O(n) — Collect + Fill",
        idea: "Copy all non-zeros to the front, then fill remaining positions with zeros.",
        complexity: { time: "O(n)", space: "O(n)" },
        code: `class Solution {
    public void moveZeroes(int[] nums) {
        int[] temp = new int[nums.length];
        int idx = 0;
        for (int num : nums) {
            if (num != 0) temp[idx++] = num;
        }
        for (int i = 0; i < nums.length; i++) nums[i] = temp[i];
    }
}`
      },
      {
        name: "Optimal",
        label: "O(n) — Two Pointer In-place",
        idea: "Use a write pointer. Copy all non-zeros forward in place, then zero-fill the tail.",
        complexity: { time: "O(n)", space: "O(1)" },
        code: `class Solution {
    public void moveZeroes(int[] nums) {
        int writePos = 0;
        for (int num : nums) {
            if (num != 0) nums[writePos++] = num;
        }
        while (writePos < nums.length) {
            nums[writePos++] = 0;
        }
    }
}`
      }
    ]
  },

  206: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(n) — Store in Array, Rebuild",
        idea: "Store all node values in an array, then create a new reversed linked list from it.",
        complexity: { time: "O(n)", space: "O(n)" },
        code: `class Solution {
    public ListNode reverseList(ListNode head) {
        List<Integer> vals = new ArrayList<>();
        ListNode curr = head;
        while (curr != null) { vals.add(curr.val); curr = curr.next; }
        ListNode dummy = new ListNode(0);
        curr = dummy;
        for (int i = vals.size() - 1; i >= 0; i--) {
            curr.next = new ListNode(vals.get(i));
            curr = curr.next;
        }
        return dummy.next;
    }
}`
      },
      {
        name: "Better",
        label: "O(n) — Recursive",
        idea: "Recursively reverse the rest of the list, then make the current node's next point back to itself.",
        complexity: { time: "O(n)", space: "O(n) — call stack" },
        code: `class Solution {
    public ListNode reverseList(ListNode head) {
        if (head == null || head.next == null) return head;
        ListNode newHead = reverseList(head.next);
        head.next.next = head;
        head.next = null;
        return newHead;
    }
}`
      },
      {
        name: "Optimal",
        label: "O(n) — Iterative (3-pointer)",
        idea: "Use prev, curr, and next pointers. Reverse each link one by one in a single pass.",
        complexity: { time: "O(n)", space: "O(1)" },
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
}`
      }
    ]
  },

  20: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(n²) — Repeatedly Remove Pairs",
        idea: "Repeatedly scan and remove valid innermost pairs '()', '[]', '{}' until nothing changes.",
        complexity: { time: "O(n²)", space: "O(n)" },
        code: `class Solution {
    public boolean isValid(String s) {
        while (s.contains("()") || s.contains("[]") || s.contains("{}")) {
            s = s.replace("()", "").replace("[]", "").replace("{}", "");
        }
        return s.isEmpty();
    }
}`
      },
      {
        name: "Better",
        label: "O(n) — Stack with Counter",
        idea: "Use a stack. Push opening brackets. On closing bracket, verify the top of stack matches.",
        complexity: { time: "O(n)", space: "O(n)" },
        code: `class Solution {
    public boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(' || c == '[' || c == '{') {
                stack.push(c);
            } else {
                if (stack.isEmpty()) return false;
                char top = stack.pop();
                if (c == ')' && top != '(') return false;
                if (c == ']' && top != '[') return false;
                if (c == '}' && top != '{') return false;
            }
        }
        return stack.isEmpty();
    }
}`
      },
      {
        name: "Optimal",
        label: "O(n) — Stack with HashMap",
        idea: "Same stack approach but use a HashMap to map closers to openers — cleaner and more extensible.",
        complexity: { time: "O(n)", space: "O(n)" },
        code: `class Solution {
    public boolean isValid(String s) {
        Map<Character, Character> map = Map.of(')', '(', ']', '[', '}', '{');
        Deque<Character> stack = new ArrayDeque<>();
        for (char c : s.toCharArray()) {
            if (map.containsKey(c)) {
                if (stack.isEmpty() || stack.peek() != map.get(c)) return false;
                stack.pop();
            } else {
                stack.push(c);
            }
        }
        return stack.isEmpty();
    }
}`
      }
    ]
  },

  70: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(2ⁿ) — Recursion",
        idea: "At each step you can go 1 or 2 stairs. Recursively count all paths — overlapping subproblems make this exponential.",
        complexity: { time: "O(2ⁿ)", space: "O(n)" },
        code: `class Solution {
    public int climbStairs(int n) {
        if (n <= 1) return 1;
        return climbStairs(n - 1) + climbStairs(n - 2);
    }
}`
      },
      {
        name: "Better",
        label: "O(n) — Memoization (Top-Down DP)",
        idea: "Cache results of subproblems to avoid recomputation.",
        complexity: { time: "O(n)", space: "O(n)" },
        code: `class Solution {
    int[] memo;
    public int climbStairs(int n) {
        memo = new int[n + 1];
        return dp(n);
    }
    private int dp(int n) {
        if (n <= 1) return 1;
        if (memo[n] != 0) return memo[n];
        return memo[n] = dp(n - 1) + dp(n - 2);
    }
}`
      },
      {
        name: "Optimal",
        label: "O(n) — Two Variable DP",
        idea: "Fibonacci pattern: dp[i] = dp[i-1] + dp[i-2]. Only need last two values, not an array.",
        complexity: { time: "O(n)", space: "O(1)" },
        code: `class Solution {
    public int climbStairs(int n) {
        if (n <= 1) return 1;
        int prev2 = 1, prev1 = 1;
        for (int i = 2; i <= n; i++) {
            int curr = prev1 + prev2;
            prev2 = prev1;
            prev1 = curr;
        }
        return prev1;
    }
}`
      }
    ]
  },

  198: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(2ⁿ) — Recursive",
        idea: "At each house, choose rob or skip, and recurse. Exponential without memoization.",
        complexity: { time: "O(2ⁿ)", space: "O(n)" },
        code: `class Solution {
    public int rob(int[] nums) {
        return robHelper(nums, nums.length - 1);
    }
    private int robHelper(int[] nums, int i) {
        if (i < 0) return 0;
        return Math.max(robHelper(nums, i - 1),
                        robHelper(nums, i - 2) + nums[i]);
    }
}`
      },
      {
        name: "Better",
        label: "O(n) — Memoized Recursion",
        idea: "Cache each house's max profit to avoid recomputing the same subproblems.",
        complexity: { time: "O(n)", space: "O(n)" },
        code: `class Solution {
    int[] memo;
    public int rob(int[] nums) {
        memo = new int[nums.length];
        Arrays.fill(memo, -1);
        return dp(nums, nums.length - 1);
    }
    private int dp(int[] nums, int i) {
        if (i < 0) return 0;
        if (memo[i] >= 0) return memo[i];
        return memo[i] = Math.max(dp(nums, i - 1), dp(nums, i - 2) + nums[i]);
    }
}`
      },
      {
        name: "Optimal",
        label: "O(n) — Two Variables",
        idea: "Track only prev2 and prev1. dp[i] = max(prev1, prev2 + nums[i]). O(1) space.",
        complexity: { time: "O(n)", space: "O(1)" },
        code: `class Solution {
    public int rob(int[] nums) {
        int prev2 = 0, prev1 = 0;
        for (int num : nums) {
            int curr = Math.max(prev1, prev2 + num);
            prev2 = prev1;
            prev1 = curr;
        }
        return prev1;
    }
}`
      }
    ]
  },

  322: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(Sⁿ) — Recursion",
        idea: "Try every possible combination of coins recursively. Exponential.",
        complexity: { time: "O(Sⁿ)", space: "O(n)" },
        code: `class Solution {
    public int coinChange(int[] coins, int amount) {
        if (amount == 0) return 0;
        int min = Integer.MAX_VALUE;
        for (int coin : coins) {
            if (coin <= amount) {
                int sub = coinChange(coins, amount - coin);
                if (sub != -1) min = Math.min(min, sub + 1);
            }
        }
        return min == Integer.MAX_VALUE ? -1 : min;
    }
}`
      },
      {
        name: "Better",
        label: "O(S×n) — Top-Down DP with Memo",
        idea: "Memoize the recursive solution. Each subproblem computed once.",
        complexity: { time: "O(S×n)", space: "O(S)" },
        code: `class Solution {
    int[] memo;
    public int coinChange(int[] coins, int amount) {
        memo = new int[amount + 1];
        Arrays.fill(memo, -2);
        return dp(coins, amount);
    }
    private int dp(int[] coins, int amount) {
        if (amount == 0) return 0;
        if (amount < 0) return -1;
        if (memo[amount] != -2) return memo[amount];
        int min = Integer.MAX_VALUE;
        for (int coin : coins) {
            int sub = dp(coins, amount - coin);
            if (sub != -1) min = Math.min(min, sub + 1);
        }
        return memo[amount] = (min == Integer.MAX_VALUE) ? -1 : min;
    }
}`
      },
      {
        name: "Optimal",
        label: "O(S×n) — Bottom-Up DP",
        idea: "Fill dp[0..amount]. dp[i] = min coins to make amount i. For each amount, try all coins.",
        complexity: { time: "O(S×n)", space: "O(S)" },
        code: `class Solution {
    public int coinChange(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, amount + 1);
        dp[0] = 0;
        for (int i = 1; i <= amount; i++) {
            for (int coin : coins) {
                if (coin <= i) {
                    dp[i] = Math.min(dp[i], dp[i - coin] + 1);
                }
            }
        }
        return dp[amount] > amount ? -1 : dp[amount];
    }
}`
      }
    ]
  },

  11: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(n²) — Try All Pairs",
        idea: "Try every pair (i, j) of lines and compute the water between them.",
        complexity: { time: "O(n²)", space: "O(1)" },
        code: `class Solution {
    public int maxArea(int[] height) {
        int maxWater = 0;
        for (int i = 0; i < height.length; i++) {
            for (int j = i + 1; j < height.length; j++) {
                int water = Math.min(height[i], height[j]) * (j - i);
                maxWater = Math.max(maxWater, water);
            }
        }
        return maxWater;
    }
}`
      },
      {
        name: "Better",
        label: "O(n) — Two Pointers (Basic)",
        idea: "Start from both ends. Move the pointer with the shorter line inward — it's the only way to potentially increase water.",
        complexity: { time: "O(n)", space: "O(1)" },
        code: `class Solution {
    public int maxArea(int[] height) {
        int left = 0, right = height.length - 1;
        int maxWater = 0;
        while (left < right) {
            int water = Math.min(height[left], height[right]) * (right - left);
            maxWater = Math.max(maxWater, water);
            if (height[left] < height[right]) left++;
            else right--;
        }
        return maxWater;
    }
}`
      },
      {
        name: "Optimal",
        label: "O(n) — Two Pointers (Optimized Move)",
        idea: "Same two-pointer approach but skip lines that are shorter than the current boundary — guaranteed not to improve the answer.",
        complexity: { time: "O(n)", space: "O(1)" },
        code: `class Solution {
    public int maxArea(int[] height) {
        int left = 0, right = height.length - 1;
        int maxWater = 0;
        while (left < right) {
            int h = Math.min(height[left], height[right]);
            maxWater = Math.max(maxWater, h * (right - left));
            while (left < right && height[left] <= h) left++;
            while (left < right && height[right] <= h) right--;
        }
        return maxWater;
    }
}`
      }
    ]
  },

  15: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(n³) — Three Nested Loops",
        idea: "Try every triplet (i, j, k) and collect those summing to 0. Use a Set to avoid duplicates.",
        complexity: { time: "O(n³)", space: "O(n)" },
        code: `class Solution {
    public List<List<Integer>> threeSum(int[] nums) {
        Set<List<Integer>> result = new HashSet<>();
        for (int i = 0; i < nums.length - 2; i++) {
            for (int j = i + 1; j < nums.length - 1; j++) {
                for (int k = j + 1; k < nums.length; k++) {
                    if (nums[i] + nums[j] + nums[k] == 0) {
                        List<Integer> triplet = Arrays.asList(nums[i], nums[j], nums[k]);
                        Collections.sort(triplet);
                        result.add(triplet);
                    }
                }
            }
        }
        return new ArrayList<>(result);
    }
}`
      },
      {
        name: "Better",
        label: "O(n²) — Sort + HashSet",
        idea: "Fix one element. Use a HashSet to find the complementary pair in O(n). Sorting ensures easy deduplication.",
        complexity: { time: "O(n²)", space: "O(n)" },
        code: `class Solution {
    public List<List<Integer>> threeSum(int[] nums) {
        Arrays.sort(nums);
        List<List<Integer>> result = new ArrayList<>();
        for (int i = 0; i < nums.length - 2; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue;
            Set<Integer> seen = new HashSet<>();
            for (int j = i + 1; j < nums.length; j++) {
                int complement = -nums[i] - nums[j];
                if (seen.contains(complement)) {
                    result.add(Arrays.asList(nums[i], complement, nums[j]));
                    while (j + 1 < nums.length && nums[j] == nums[j + 1]) j++;
                }
                seen.add(nums[j]);
            }
        }
        return result;
    }
}`
      },
      {
        name: "Optimal",
        label: "O(n²) — Sort + Two Pointers",
        idea: "Fix element i. Use two pointers left=i+1, right=n-1. Skip duplicates to avoid repeated triplets.",
        complexity: { time: "O(n²)", space: "O(1)" },
        code: `class Solution {
    public List<List<Integer>> threeSum(int[] nums) {
        Arrays.sort(nums);
        List<List<Integer>> result = new ArrayList<>();
        for (int i = 0; i < nums.length - 2; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue;
            int left = i + 1, right = nums.length - 1;
            while (left < right) {
                int sum = nums[i] + nums[left] + nums[right];
                if (sum == 0) {
                    result.add(Arrays.asList(nums[i], nums[left], nums[right]));
                    while (left < right && nums[left] == nums[left + 1]) left++;
                    while (left < right && nums[right] == nums[right - 1]) right--;
                    left++; right--;
                } else if (sum < 0) {
                    left++;
                } else {
                    right--;
                }
            }
        }
        return result;
    }
}`
      }
    ]
  },

  56: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(n²) — Compare All Pairs",
        idea: "For each interval, check all other intervals and merge if overlapping.",
        complexity: { time: "O(n²)", space: "O(n)" },
        code: `class Solution {
    public int[][] merge(int[][] intervals) {
        List<int[]> result = new ArrayList<>(Arrays.asList(intervals));
        boolean merged = true;
        while (merged) {
            merged = false;
            for (int i = 0; i < result.size() - 1; i++) {
                for (int j = i + 1; j < result.size(); j++) {
                    if (result.get(i)[1] >= result.get(j)[0]) {
                        result.get(i)[0] = Math.min(result.get(i)[0], result.get(j)[0]);
                        result.get(i)[1] = Math.max(result.get(i)[1], result.get(j)[1]);
                        result.remove(j);
                        merged = true;
                        break;
                    }
                }
                if (merged) break;
            }
        }
        return result.toArray(new int[0][]);
    }
}`
      },
      {
        name: "Better",
        label: "O(n log n) — Sort + Merge Pass",
        idea: "Sort intervals by start time. Then do a single pass: extend last interval's end or add new one.",
        complexity: { time: "O(n log n)", space: "O(n)" },
        code: `class Solution {
    public int[][] merge(int[][] intervals) {
        Arrays.sort(intervals, (a, b) -> a[0] - b[0]);
        List<int[]> merged = new ArrayList<>();
        for (int[] interval : intervals) {
            if (merged.isEmpty() || merged.get(merged.size() - 1)[1] < interval[0]) {
                merged.add(interval);
            } else {
                merged.get(merged.size() - 1)[1] = Math.max(merged.get(merged.size() - 1)[1], interval[1]);
            }
        }
        return merged.toArray(new int[0][]);
    }
}`
      },
      {
        name: "Optimal",
        label: "O(n log n) — Same Approach, In-place",
        idea: "Same sort + merge, but with cleaner logic using a curr pointer directly on the sorted array.",
        complexity: { time: "O(n log n)", space: "O(1)" },
        code: `class Solution {
    public int[][] merge(int[][] intervals) {
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
        int k = 0;
        for (int i = 1; i < intervals.length; i++) {
            if (intervals[k][1] >= intervals[i][0]) {
                intervals[k][1] = Math.max(intervals[k][1], intervals[i][1]);
            } else {
                intervals[++k] = intervals[i];
            }
        }
        return Arrays.copyOfRange(intervals, 0, k + 1);
    }
}`
      }
    ]
  },

  200: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(m²×n²) — Flood Fill per Cell",
        idea: "For each '1' found, run a BFS/DFS to sink the entire island, count how many times we start a new flood.",
        complexity: { time: "O(m×n)", space: "O(m×n)" },
        code: `class Solution {
    public int numIslands(char[][] grid) {
        int count = 0;
        for (int i = 0; i < grid.length; i++) {
            for (int j = 0; j < grid[0].length; j++) {
                if (grid[i][j] == '1') {
                    count++;
                    dfs(grid, i, j);
                }
            }
        }
        return count;
    }
    private void dfs(char[][] grid, int r, int c) {
        if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length || grid[r][c] != '1') return;
        grid[r][c] = '0';
        dfs(grid, r + 1, c); dfs(grid, r - 1, c);
        dfs(grid, r, c + 1); dfs(grid, r, c - 1);
    }
}`
      },
      {
        name: "Better",
        label: "O(m×n) — BFS",
        idea: "Same idea but BFS instead of DFS — avoids potential stack overflow on large grids.",
        complexity: { time: "O(m×n)", space: "O(min(m,n))" },
        code: `class Solution {
    public int numIslands(char[][] grid) {
        int count = 0;
        int[][] dirs = {{0,1},{0,-1},{1,0},{-1,0}};
        for (int i = 0; i < grid.length; i++) {
            for (int j = 0; j < grid[0].length; j++) {
                if (grid[i][j] == '1') {
                    count++;
                    Queue<int[]> q = new LinkedList<>();
                    q.offer(new int[]{i, j});
                    grid[i][j] = '0';
                    while (!q.isEmpty()) {
                        int[] pos = q.poll();
                        for (int[] d : dirs) {
                            int nr = pos[0]+d[0], nc = pos[1]+d[1];
                            if (nr>=0 && nc>=0 && nr<grid.length && nc<grid[0].length && grid[nr][nc]=='1') {
                                grid[nr][nc] = '0';
                                q.offer(new int[]{nr, nc});
                            }
                        }
                    }
                }
            }
        }
        return count;
    }
}`
      },
      {
        name: "Optimal",
        label: "O(m×n) — Union Find",
        idea: "Use Union-Find (Disjoint Set Union). Union adjacent '1' cells. Final answer = number of distinct components.",
        complexity: { time: "O(m×n × α(m×n))", space: "O(m×n)" },
        code: `class Solution {
    int[] parent, rank;
    int count = 0;

    public int numIslands(char[][] grid) {
        int m = grid.length, n = grid[0].length;
        parent = new int[m * n]; rank = new int[m * n];
        for (int i = 0; i < m; i++)
            for (int j = 0; j < n; j++)
                if (grid[i][j] == '1') { parent[i*n+j] = i*n+j; count++; }

        int[][] dirs = {{0,1},{1,0}};
        for (int i = 0; i < m; i++)
            for (int j = 0; j < n; j++)
                if (grid[i][j] == '1')
                    for (int[] d : dirs) {
                        int ni = i+d[0], nj = j+d[1];
                        if (ni<m && nj<n && grid[ni][nj]=='1') union(i*n+j, ni*n+nj);
                    }
        return count;
    }
    int find(int x) { return parent[x]==x ? x : (parent[x]=find(parent[x])); }
    void union(int a, int b) {
        int ra=find(a), rb=find(b);
        if (ra==rb) return;
        if (rank[ra]<rank[rb]) { int t=ra; ra=rb; rb=t; }
        parent[rb]=ra; if (rank[ra]==rank[rb]) rank[ra]++;
        count--;
    }
}`
      }
    ]
  },

  104: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(n) — Recursive DFS",
        idea: "Classic recursive depth-first approach. The base and recursive cases are natural.",
        complexity: { time: "O(n)", space: "O(h)" },
        code: `class Solution {
    public int maxDepth(TreeNode root) {
        if (root == null) return 0;
        return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
    }
}`
      },
      {
        name: "Better",
        label: "O(n) — Iterative BFS (Level Order)",
        idea: "BFS level by level. Each completed level increments depth.",
        complexity: { time: "O(n)", space: "O(n)" },
        code: `class Solution {
    public int maxDepth(TreeNode root) {
        if (root == null) return 0;
        Queue<TreeNode> q = new LinkedList<>();
        q.offer(root);
        int depth = 0;
        while (!q.isEmpty()) {
            int size = q.size();
            for (int i = 0; i < size; i++) {
                TreeNode node = q.poll();
                if (node.left != null) q.offer(node.left);
                if (node.right != null) q.offer(node.right);
            }
            depth++;
        }
        return depth;
    }
}`
      },
      {
        name: "Optimal",
        label: "O(n) — Iterative DFS with Stack",
        idea: "Use an explicit stack with (node, depth) pairs. Avoids recursion stack, tracks depth explicitly.",
        complexity: { time: "O(n)", space: "O(h)" },
        code: `class Solution {
    public int maxDepth(TreeNode root) {
        if (root == null) return 0;
        Deque<int[]> stack = new ArrayDeque<>(); // {node_index, depth}
        // Simulate with object tracking
        Deque<Object[]> st = new ArrayDeque<>();
        st.push(new Object[]{root, 1});
        int maxD = 0;
        while (!st.isEmpty()) {
            Object[] top = st.pop();
            TreeNode node = (TreeNode) top[0];
            int d = (int) top[1];
            maxD = Math.max(maxD, d);
            if (node.left != null) st.push(new Object[]{node.left, d + 1});
            if (node.right != null) st.push(new Object[]{node.right, d + 1});
        }
        return maxD;
    }
}`
      }
    ]
  },

  128: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(n³) — Check Each Sequence",
        idea: "For every number, check if it starts a sequence by linearly scanning for n+1, n+2, etc.",
        complexity: { time: "O(n³)", space: "O(1)" },
        code: `class Solution {
    public int longestConsecutive(int[] nums) {
        int longest = 0;
        for (int num : nums) {
            int currNum = num, streak = 1;
            while (contains(nums, currNum + 1)) { currNum++; streak++; }
            longest = Math.max(longest, streak);
        }
        return longest;
    }
    private boolean contains(int[] nums, int val) {
        for (int n : nums) if (n == val) return true;
        return false;
    }
}`
      },
      {
        name: "Better",
        label: "O(n log n) — Sort First",
        idea: "Sort the array. Scan for consecutive runs. Handle duplicates by skipping equal elements.",
        complexity: { time: "O(n log n)", space: "O(1)" },
        code: `class Solution {
    public int longestConsecutive(int[] nums) {
        if (nums.length == 0) return 0;
        Arrays.sort(nums);
        int longest = 1, curr = 1;
        for (int i = 1; i < nums.length; i++) {
            if (nums[i] == nums[i-1]) continue;
            if (nums[i] == nums[i-1] + 1) { curr++; longest = Math.max(longest, curr); }
            else curr = 1;
        }
        return longest;
    }
}`
      },
      {
        name: "Optimal",
        label: "O(n) — HashSet",
        idea: "Add all to HashSet. Only start counting a sequence if num-1 is NOT in the set (i.e., this is the sequence start).",
        complexity: { time: "O(n)", space: "O(n)" },
        code: `class Solution {
    public int longestConsecutive(int[] nums) {
        Set<Integer> set = new HashSet<>();
        for (int n : nums) set.add(n);
        int longest = 0;
        for (int n : set) {
            if (!set.contains(n - 1)) {
                int curr = n, streak = 1;
                while (set.contains(curr + 1)) { curr++; streak++; }
                longest = Math.max(longest, streak);
            }
        }
        return longest;
    }
}`
      }
    ]
  },

  347: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(n log n) — Sort by Count",
        idea: "Count frequencies with a map. Sort the map entries by count descending. Take top K.",
        complexity: { time: "O(n log n)", space: "O(n)" },
        code: `class Solution {
    public int[] topKFrequent(int[] nums, int k) {
        Map<Integer, Integer> freq = new HashMap<>();
        for (int n : nums) freq.merge(n, 1, Integer::sum);
        return freq.entrySet().stream()
            .sorted((a, b) -> b.getValue() - a.getValue())
            .limit(k)
            .mapToInt(Map.Entry::getKey)
            .toArray();
    }
}`
      },
      {
        name: "Better",
        label: "O(n log k) — Min-Heap of size K",
        idea: "Count frequencies. Maintain a min-heap of size K. If heap size > K, remove the lowest-frequency element.",
        complexity: { time: "O(n log k)", space: "O(n+k)" },
        code: `class Solution {
    public int[] topKFrequent(int[] nums, int k) {
        Map<Integer, Integer> freq = new HashMap<>();
        for (int n : nums) freq.merge(n, 1, Integer::sum);
        PriorityQueue<Integer> heap = new PriorityQueue<>(
            (a, b) -> freq.get(a) - freq.get(b));
        for (int num : freq.keySet()) {
            heap.offer(num);
            if (heap.size() > k) heap.poll();
        }
        int[] result = new int[k];
        for (int i = k - 1; i >= 0; i--) result[i] = heap.poll();
        return result;
    }
}`
      },
      {
        name: "Optimal",
        label: "O(n) — Bucket Sort",
        idea: "Create buckets indexed by frequency (max freq = n). Put each number in its frequency bucket. Collect from highest bucket down.",
        complexity: { time: "O(n)", space: "O(n)" },
        code: `class Solution {
    public int[] topKFrequent(int[] nums, int k) {
        Map<Integer, Integer> freq = new HashMap<>();
        for (int n : nums) freq.merge(n, 1, Integer::sum);
        List<Integer>[] buckets = new List[nums.length + 1];
        for (int num : freq.keySet()) {
            int f = freq.get(num);
            if (buckets[f] == null) buckets[f] = new ArrayList<>();
            buckets[f].add(num);
        }
        int[] result = new int[k];
        int idx = 0;
        for (int i = buckets.length - 1; i >= 0 && idx < k; i--) {
            if (buckets[i] != null) {
                for (int num : buckets[i]) {
                    if (idx < k) result[idx++] = num;
                }
            }
        }
        return result;
    }
}`
      }
    ]
  }
,

  238: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(n²) — Nested Loops",
        idea: "For each element at index i, multiply all numbers except nums[i] using an inner loop.",
        complexity: { time: "O(n²)", space: "O(1)" },
        code: `class Solution {
    public int[] productExceptSelf(int[] nums) {
        int n = nums.length;
        int[] res = new int[n];
        for (int i = 0; i < n; i++) {
            int prod = 1;
            for (int j = 0; j < n; j++) {
                if (i != j) prod *= nums[j];
            }
            res[i] = prod;
        }
        return res;
    }
}`
      },
      {
        name: "Better",
        label: "O(n) — Prefix and Suffix Arrays",
        idea: "Precompute prefix products and suffix products in two separate arrays, then multiply them.",
        complexity: { time: "O(n)", space: "O(n)" },
        code: `class Solution {
    public int[] productExceptSelf(int[] nums) {
        int n = nums.length;
        int[] prefix = new int[n];
        int[] suffix = new int[n];
        prefix[0] = 1;
        for (int i = 1; i < n; i++) prefix[i] = prefix[i - 1] * nums[i - 1];
        suffix[n - 1] = 1;
        for (int i = n - 2; i >= 0; i--) suffix[i] = suffix[i + 1] * nums[i + 1];
        int[] res = new int[n];
        for (int i = 0; i < n; i++) res[i] = prefix[i] * suffix[i];
        return res;
    }
}`
      },
      {
        name: "Optimal",
        label: "O(n) — In-place Running Product",
        idea: "Build prefix products directly in the output array, then pass backwards maintaining a running suffix product.",
        complexity: { time: "O(n)", space: "O(1)" },
        code: `class Solution {
    public int[] productExceptSelf(int[] nums) {
        int n = nums.length;
        int[] res = new int[n];
        res[0] = 1;
        for (int i = 1; i < n; i++) {
            res[i] = res[i - 1] * nums[i - 1];
        }
        int right = 1;
        for (int i = n - 1; i >= 0; i--) {
            res[i] *= right;
            right *= nums[i];
        }
        return res;
    }
}`
      }
    ]
  },

  242: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(n log n) — Sort and Compare",
        idea: "Convert both strings to character arrays, sort them, and compare for equality.",
        complexity: { time: "O(n log n)", space: "O(n)" },
        code: `class Solution {
    public boolean isAnagram(String s, String t) {
        if (s.length() != t.length()) return false;
        char[] a = s.toCharArray();
        char[] b = t.toCharArray();
        Arrays.sort(a);
        Arrays.sort(b);
        return Arrays.equals(a, b);
    }
}`
      },
      {
        name: "Better",
        label: "O(n) — HashMap Counter",
        idea: "Count character frequencies of string s in a Map, decrement with characters in t, check if all counts are zero.",
        complexity: { time: "O(n)", space: "O(k)" },
        code: `class Solution {
    public boolean isAnagram(String s, String t) {
        if (s.length() != t.length()) return false;
        Map<Character, Integer> counts = new HashMap<>();
        for (char c : s.toCharArray()) counts.merge(c, 1, Integer::sum);
        for (char c : t.toCharArray()) {
            if (!counts.containsKey(c) || counts.get(c) == 0) return false;
            counts.put(c, counts.get(c) - 1);
        }
        return true;
    }
}`
      },
      {
        name: "Optimal",
        label: "O(n) — 26-element Fixed Array",
        idea: "Use a fixed size int[26] array to increment for s and decrement for t. Single pass verification.",
        complexity: { time: "O(n)", space: "O(1)" },
        code: `class Solution {
    public boolean isAnagram(String s, String t) {
        if (s.length() != t.length()) return false;
        int[] count = new int[26];
        for (int i = 0; i < s.length(); i++) {
            count[s.charAt(i) - 'a']++;
            count[t.charAt(i) - 'a']--;
        }
        for (int c : count) {
            if (c != 0) return false;
        }
        return true;
    }
}`
      }
    ]
  },

  49: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(n² · k) — Pairwise Anagram Check",
        idea: "Iterate through each word and compare against all visited groups using an anagram helper.",
        complexity: { time: "O(n² · k)", space: "O(n · k)" },
        code: `class Solution {
    public List<List<String>> groupAnagrams(String[] strs) {
        List<List<String>> groups = new ArrayList<>();
        boolean[] visited = new boolean[strs.length];
        for (int i = 0; i < strs.length; i++) {
            if (visited[i]) continue;
            List<String> grp = new ArrayList<>();
            grp.add(strs[i]);
            for (int j = i + 1; j < strs.length; j++) {
                if (!visited[j] && isAnagram(strs[i], strs[j])) {
                    grp.add(strs[j]);
                    visited[j] = true;
                }
            }
            groups.add(grp);
        }
        return groups;
    }
    private boolean isAnagram(String s, String t) {
        if (s.length() != t.length()) return false;
        int[] c = new int[26];
        for (char ch : s.toCharArray()) c[ch - 'a']++;
        for (char ch : t.toCharArray()) if (--c[ch - 'a'] < 0) return false;
        return true;
    }
}`
      },
      {
        name: "Better",
        label: "O(n · k log k) — Sorted String Key",
        idea: "Sort the characters of each string to generate a canonical key. Group by key in a HashMap.",
        complexity: { time: "O(n · k log k)", space: "O(n · k)" },
        code: `class Solution {
    public List<List<String>> groupAnagrams(String[] strs) {
        Map<String, List<String>> map = new HashMap<>();
        for (String s : strs) {
            char[] chars = s.toCharArray();
            Arrays.sort(chars);
            String key = new String(chars);
            map.computeIfAbsent(key, k -> new ArrayList<>()).add(s);
        }
        return new ArrayList<>(map.values());
    }
}`
      },
      {
        name: "Optimal",
        label: "O(n · k) — Count Frequency Signature",
        idea: "Encode character frequencies into a string signature like '#1#0#2...' avoiding O(k log k) sorting.",
        complexity: { time: "O(n · k)", space: "O(n · k)" },
        code: `class Solution {
    public List<List<String>> groupAnagrams(String[] strs) {
        Map<String, List<String>> map = new HashMap<>();
        for (String s : strs) {
            int[] count = new int[26];
            for (char c : s.toCharArray()) count[c - 'a']++;
            StringBuilder sb = new StringBuilder();
            for (int val : count) sb.append('#').append(val);
            String key = sb.toString();
            map.computeIfAbsent(key, k -> new ArrayList<>()).add(s);
        }
        return new ArrayList<>(map.values());
    }
}`
      }
    ]
  },

  125: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(n) — Reverse Clean String",
        idea: "Extract only alphanumeric characters into a new string, lowercase it, reverse it, and compare.",
        complexity: { time: "O(n)", space: "O(n)" },
        code: `class Solution {
    public boolean isPalindrome(String s) {
        StringBuilder sb = new StringBuilder();
        for (char c : s.toCharArray()) {
            if (Character.isLetterOrDigit(c)) sb.append(Character.toLowerCase(c));
        }
        String clean = sb.toString();
        return clean.equals(sb.reverse().toString());
    }
}`
      },
      {
        name: "Better",
        label: "O(n) — Clean Array Two Pointers",
        idea: "Clean string first, then use two pointers meeting in the middle to compare characters.",
        complexity: { time: "O(n)", space: "O(n)" },
        code: `class Solution {
    public boolean isPalindrome(String s) {
        StringBuilder sb = new StringBuilder();
        for (char c : s.toCharArray()) {
            if (Character.isLetterOrDigit(c)) sb.append(Character.toLowerCase(c));
        }
        int left = 0, right = sb.length() - 1;
        while (left < right) {
            if (sb.charAt(left++) != sb.charAt(right--)) return false;
        }
        return true;
    }
}`
      },
      {
        name: "Optimal",
        label: "O(n) — In-place Two Pointers",
        idea: "Two pointers directly on input string skipping non-alphanumeric chars. True O(1) extra space.",
        complexity: { time: "O(n)", space: "O(1)" },
        code: `class Solution {
    public boolean isPalindrome(String s) {
        int left = 0, right = s.length() - 1;
        while (left < right) {
            while (left < right && !Character.isLetterOrDigit(s.charAt(left))) left++;
            while (left < right && !Character.isLetterOrDigit(s.charAt(right))) right--;
            if (Character.toLowerCase(s.charAt(left)) != Character.toLowerCase(s.charAt(right))) {
                return false;
            }
            left++;
            right--;
        }
        return true;
    }
}`
      }
    ]
  },

  42: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(n²) — Left & Right Scan",
        idea: "For every bar, find the maximum height to its left and right. Water trapped = min(maxL, maxR) - height[i].",
        complexity: { time: "O(n²)", space: "O(1)" },
        code: `class Solution {
    public int trap(int[] height) {
        int total = 0, n = height.length;
        for (int i = 0; i < n; i++) {
            int maxLeft = 0, maxRight = 0;
            for (int j = i; j >= 0; j--) maxLeft = Math.max(maxLeft, height[j]);
            for (int j = i; j < n; j++) maxRight = Math.max(maxRight, height[j]);
            total += Math.min(maxLeft, maxRight) - height[i];
        }
        return total;
    }
}`
      },
      {
        name: "Better",
        label: "O(n) — DP Prefix/Suffix Arrays",
        idea: "Precalculate maxLeft and maxRight in two arrays so every bar lookup is O(1).",
        complexity: { time: "O(n)", space: "O(n)" },
        code: `class Solution {
    public int trap(int[] height) {
        int n = height.length;
        if (n == 0) return 0;
        int[] leftMax = new int[n];
        int[] rightMax = new int[n];
        leftMax[0] = height[0];
        for (int i = 1; i < n; i++) leftMax[i] = Math.max(leftMax[i - 1], height[i]);
        rightMax[n - 1] = height[n - 1];
        for (int i = n - 2; i >= 0; i--) rightMax[i] = Math.max(rightMax[i + 1], height[i]);
        int total = 0;
        for (int i = 0; i < n; i++) total += Math.min(leftMax[i], rightMax[i]) - height[i];
        return total;
    }
}`
      },
      {
        name: "Optimal",
        label: "O(n) — Two Pointers Inward",
        idea: "Left and right pointers move inward. The smaller side is always bounded by the opposite side, so accumulate water immediately.",
        complexity: { time: "O(n)", space: "O(1)" },
        code: `class Solution {
    public int trap(int[] height) {
        int left = 0, right = height.length - 1;
        int leftMax = 0, rightMax = 0, total = 0;
        while (left < right) {
            if (height[left] < height[right]) {
                if (height[left] >= leftMax) leftMax = height[left];
                else total += leftMax - height[left];
                left++;
            } else {
                if (height[right] >= rightMax) rightMax = height[right];
                else total += rightMax - height[right];
                right--;
            }
        }
        return total;
    }
}`
      }
    ]
  },

  146: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(n) per op — List of Pairs",
        idea: "Maintain key-value pairs in a List. On get/put, linearly scan to find key and move to the front for recency.",
        complexity: { time: "O(n) get, O(n) put", space: "O(capacity)" },
        code: `class LRUCache {
    class Node { int k, v; Node(int k, int v) { this.k = k; this.v = v; } }
    private int cap;
    private List<Node> list = new ArrayList<>();
    public LRUCache(int capacity) { this.cap = capacity; }
    public int get(int key) {
        for (int i = 0; i < list.size(); i++) {
            if (list.get(i).k == key) {
                Node n = list.remove(i);
                list.add(0, n);
                return n.v;
            }
        }
        return -1;
    }
    public void put(int key, int value) {
        for (int i = 0; i < list.size(); i++) {
            if (list.get(i).k == key) {
                list.remove(i);
                list.add(0, new Node(key, value));
                return;
            }
        }
        if (list.size() >= cap) list.remove(list.size() - 1);
        list.add(0, new Node(key, value));
    }
}`
      },
      {
        name: "Better",
        label: "O(1) — Java LinkedHashMap",
        idea: "Extend LinkedHashMap with accessOrder=true and override removeEldestEntry.",
        complexity: { time: "O(1) get, O(1) put", space: "O(capacity)" },
        code: `class LRUCache extends LinkedHashMap<Integer, Integer> {
    private int capacity;
    public LRUCache(int capacity) {
        super(capacity, 0.75f, true);
        this.capacity = capacity;
    }
    public int get(int key) {
        return super.getOrDefault(key, -1);
    }
    public void put(int key, int value) {
        super.put(key, value);
    }
    @Override
    protected boolean removeEldestEntry(Map.Entry<Integer, Integer> eldest) {
        return size() > capacity;
    }
}`
      },
      {
        name: "Optimal",
        label: "O(1) — Doubly Linked List + HashMap",
        idea: "Custom Doubly Linked List with dummy head/tail combined with HashMap for O(1) node access and deletion.",
        complexity: { time: "O(1) get, O(1) put", space: "O(capacity)" },
        code: `class LRUCache {
    class Node {
        int key, val;
        Node prev, next;
        Node(int k, int v) { key = k; val = v; }
    }
    private int cap;
    private Map<Integer, Node> map = new HashMap<>();
    private Node head = new Node(0, 0), tail = new Node(0, 0);

    public LRUCache(int capacity) {
        this.cap = capacity;
        head.next = tail;
        tail.prev = head;
    }

    public int get(int key) {
        if (!map.containsKey(key)) return -1;
        Node node = map.get(key);
        remove(node);
        insert(node);
        return node.val;
    }

    public void put(int key, int value) {
        if (map.containsKey(key)) remove(map.get(key));
        if (map.size() == cap) {
            map.remove(tail.prev.key);
            remove(tail.prev);
        }
        Node newNode = new Node(key, value);
        insert(newNode);
        map.put(key, newNode);
    }

    private void remove(Node node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }

    private void insert(Node node) {
        node.next = head.next;
        node.next.prev = node;
        head.next = node;
        node.prev = head;
    }
}`
      }
    ]
  },

  21: {
    approaches: [
      {
        name: "Brute Force",
        label: "O((n+m) log(n+m)) — Collect and Sort",
        idea: "Extract all node values into an ArrayList, sort the list, and construct a new linked list.",
        complexity: { time: "O((n+m) log(n+m))", space: "O(n+m)" },
        code: `class Solution {
    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        List<Integer> vals = new ArrayList<>();
        while (list1 != null) { vals.add(list1.val); list1 = list1.next; }
        while (list2 != null) { vals.add(list2.val); list2 = list2.next; }
        Collections.sort(vals);
        ListNode dummy = new ListNode(0), curr = dummy;
        for (int v : vals) { curr.next = new ListNode(v); curr = curr.next; }
        return dummy.next;
    }
}`
      },
      {
        name: "Better",
        label: "O(n+m) — Recursive",
        idea: "Pick the smaller head node and recursively merge its next with the other list.",
        complexity: { time: "O(n+m)", space: "O(n+m) stack" },
        code: `class Solution {
    public ListNode mergeTwoLists(ListNode l1, ListNode l2) {
        if (l1 == null) return l2;
        if (l2 == null) return l1;
        if (l1.val < l2.val) {
            l1.next = mergeTwoLists(l1.next, l2);
            return l1;
        } else {
            l2.next = mergeTwoLists(l1, l2.next);
            return l2;
        }
    }
}`
      },
      {
        name: "Optimal",
        label: "O(n+m) — Iterative with Dummy Head",
        idea: "Iterate through both lists comparing heads, splice smaller node to current pointer. O(1) space.",
        complexity: { time: "O(n+m)", space: "O(1)" },
        code: `class Solution {
    public ListNode mergeTwoLists(ListNode l1, ListNode l2) {
        ListNode dummy = new ListNode(-1);
        ListNode curr = dummy;
        while (l1 != null && l2 != null) {
            if (l1.val <= l2.val) {
                curr.next = l1;
                l1 = l1.next;
            } else {
                curr.next = l2;
                l2 = l2.next;
            }
            curr = curr.next;
        }
        curr.next = (l1 != null) ? l1 : l2;
        return dummy.next;
    }
}`
      }
    ]
  },

  141: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(n) — Value Mutation Sentinel",
        idea: "Mutate visited node values to a sentinel constant (e.g. 100001). If reached again, cycle detected. Destructive.",
        complexity: { time: "O(n)", space: "O(1)" },
        code: `public class Solution {
    public boolean hasCycle(ListNode head) {
        while (head != null) {
            if (head.val == 100001) return true;
            head.val = 100001;
            head = head.next;
        }
        return false;
    }
}`
      },
      {
        name: "Better",
        label: "O(n) — HashSet Visited Nodes",
        idea: "Keep track of visited node object references in a HashSet. If current node is already in set, cycle exists.",
        complexity: { time: "O(n)", space: "O(n)" },
        code: `public class Solution {
    public boolean hasCycle(ListNode head) {
        Set<ListNode> visited = new HashSet<>();
        while (head != null) {
            if (!visited.add(head)) return true;
            head = head.next;
        }
        return false;
    }
}`
      },
      {
        name: "Optimal",
        label: "O(n) — Floyd's Tortoise and Hare",
        idea: "Fast pointer moves 2 steps, slow pointer moves 1 step. If cycle exists, fast will inevitably lap slow.",
        complexity: { time: "O(n)", space: "O(1)" },
        code: `public class Solution {
    public boolean hasCycle(ListNode head) {
        if (head == null) return false;
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) return true;
        }
        return false;
    }
}`
      }
    ]
  },

  226: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(n) — Level Serialization Mirror",
        idea: "Serialize tree by levels, mirror every level array, then reconstruct tree nodes.",
        complexity: { time: "O(n)", space: "O(n)" },
        code: `class Solution {
    public TreeNode invertTree(TreeNode root) {
        if (root == null) return null;
        Queue<TreeNode> q = new LinkedList<>();
        q.offer(root);
        while (!q.isEmpty()) {
            TreeNode curr = q.poll();
            TreeNode temp = curr.left;
            curr.left = curr.right;
            curr.right = temp;
            if (curr.left != null) q.offer(curr.left);
            if (curr.right != null) q.offer(curr.right);
        }
        return root;
    }
}`
      },
      {
        name: "Better",
        label: "O(n) — Iterative DFS with Stack",
        idea: "Use explicit Stack to traverse nodes and swap left/right children iteratively.",
        complexity: { time: "O(n)", space: "O(h)" },
        code: `class Solution {
    public TreeNode invertTree(TreeNode root) {
        if (root == null) return null;
        Stack<TreeNode> stack = new Stack<>();
        stack.push(root);
        while (!stack.isEmpty()) {
            TreeNode node = stack.pop();
            TreeNode temp = node.left;
            node.left = node.right;
            node.right = temp;
            if (node.left != null) stack.push(node.left);
            if (node.right != null) stack.push(node.right);
        }
        return root;
    }
}`
      },
      {
        name: "Optimal",
        label: "O(n) — Recursive Postorder Swap",
        idea: "Recursively invert left and right subtrees, then swap root.left and root.right. 4 lines of clean Java.",
        complexity: { time: "O(n)", space: "O(h)" },
        code: `class Solution {
    public TreeNode invertTree(TreeNode root) {
        if (root == null) return null;
        TreeNode left = invertTree(root.left);
        TreeNode right = invertTree(root.right);
        root.left = right;
        root.right = left;
        return root;
    }
}`
      }
    ]
  },

  33: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(n) — Linear Scan",
        idea: "Scan every index from 0 to n-1. If nums[i] == target, return i.",
        complexity: { time: "O(n)", space: "O(1)" },
        code: `class Solution {
    public int search(int[] nums, int target) {
        for (int i = 0; i < nums.length; i++) {
            if (nums[i] == target) return i;
        }
        return -1;
    }
}`
      },
      {
        name: "Better",
        label: "O(log n) — Find Pivot then Binary Search",
        idea: "Find rotation index in O(log n) using binary search, then binary search within the appropriate half.",
        complexity: { time: "O(log n)", space: "O(1)" },
        code: `class Solution {
    public int search(int[] nums, int target) {
        int n = nums.length;
        int left = 0, right = n - 1;
        while (left < right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] > nums[right]) left = mid + 1;
            else right = mid;
        }
        int pivot = left;
        left = 0; right = n - 1;
        if (target >= nums[pivot] && target <= nums[right]) left = pivot;
        else right = pivot - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;
            else if (nums[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }
}`
      },
      {
        name: "Optimal",
        label: "O(log n) — One-pass Binary Search",
        idea: "At any mid, either [left, mid] is sorted or [mid, right] is sorted. Check if target lies in the sorted half.",
        complexity: { time: "O(log n)", space: "O(1)" },
        code: `class Solution {
    public int search(int[] nums, int target) {
        int left = 0, right = nums.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;
            if (nums[left] <= nums[mid]) {
                if (target >= nums[left] && target < nums[mid]) right = mid - 1;
                else left = mid + 1;
            } else {
                if (target > nums[mid] && target <= nums[right]) left = mid + 1;
                else right = mid - 1;
            }
        }
        return -1;
    }
}`
      }
    ]
  },

  153: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(n) — Linear Search",
        idea: "Track the minimum value across all elements with a single pass.",
        complexity: { time: "O(n)", space: "O(1)" },
        code: `class Solution {
    public int findMin(int[] nums) {
        int min = nums[0];
        for (int n : nums) min = Math.min(min, n);
        return min;
    }
}`
      },
      {
        name: "Better",
        label: "O(n) — Find Drop Point",
        idea: "Scan for the first element where nums[i] > nums[i+1]. Then nums[i+1] is the minimum.",
        complexity: { time: "O(n)", space: "O(1)" },
        code: `class Solution {
    public int findMin(int[] nums) {
        for (int i = 0; i < nums.length - 1; i++) {
            if (nums[i] > nums[i + 1]) return nums[i + 1];
        }
        return nums[0];
    }
}`
      },
      {
        name: "Optimal",
        label: "O(log n) — Binary Search vs Right",
        idea: "Compare nums[mid] to nums[right]. If nums[mid] > nums[right], minimum lies in right half; otherwise left half.",
        complexity: { time: "O(log n)", space: "O(1)" },
        code: `class Solution {
    public int findMin(int[] nums) {
        int left = 0, right = nums.length - 1;
        while (left < right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] > nums[right]) left = mid + 1;
            else right = mid;
        }
        return nums[left];
    }
}`
      }
    ]
  },

  424: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(26 · n²) — Check All Substrings",
        idea: "Examine every substring (i to j). For each substring, count character frequencies and determine if (length - maxFreq) <= k.",
        complexity: { time: "O(26 · n²)", space: "O(1)" },
        code: `class Solution {
    public int characterReplacement(String s, int k) {
        int maxLen = 0;
        for (int i = 0; i < s.length(); i++) {
            int[] count = new int[26];
            int maxCount = 0;
            for (int j = i; j < s.length(); j++) {
                int idx = s.charAt(j) - 'A';
                count[idx]++;
                maxCount = Math.max(maxCount, count[idx]);
                int windowLen = j - i + 1;
                if (windowLen - maxCount <= k) {
                    maxLen = Math.max(maxLen, windowLen);
                }
            }
        }
        return maxLen;
    }
}`
      },
      {
        name: "Better",
        label: "O(n) — Sliding Window with Frequency Array",
        idea: "Maintain a frequency array of 26 letters and expand right pointer. When window length - maxCount > k, shrink from left.",
        complexity: { time: "O(n)", space: "O(26) = O(1)" },
        code: `class Solution {
    public int characterReplacement(String s, int k) {
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
        return maxLen;
    }
}`
      },
      {
        name: "Optimal",
        label: "O(n) — Sliding Window with HashMap",
        idea: "Dynamic window tracking using Map<Character, Integer>. Allows non-uppercase or generic character sets with clean state tracking.",
        complexity: { time: "O(n)", space: "O(k)" },
        code: `class Solution {
    public int characterReplacement(String s, int k) {
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
        return maxLen;
    }
}`
      }
    ]
  },

  55: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(2ⁿ) — Recursive DFS",
        idea: "Try every possible jump at each position. Return true if any path reaches the end.",
        complexity: {"time":"O(2ⁿ)","space":"O(n)"},
        code: "class Solution {\n    public boolean canJump(int[] nums) {\n        return dfs(nums, 0);\n    }\n    boolean dfs(int[] nums, int pos) {\n        if (pos >= nums.length - 1) return true;\n        int maxJump = nums[pos];\n        for (int jump = 1; jump <= maxJump; jump++) {\n            if (dfs(nums, pos + jump)) return true;\n        }\n        return false;\n    }\n}"
      },
      {
        name: "Better",
        label: "O(n²) — DP with Memoization",
        idea: "Track for each position whether it can reach the end. Work backwards: position i is good if any reachable position j is also good.",
        complexity: {"time":"O(n²)","space":"O(n)"},
        code: "class Solution {\n    public boolean canJump(int[] nums) {\n        int n = nums.length;\n        boolean[] good = new boolean[n];\n        good[n - 1] = true;\n        for (int i = n - 2; i >= 0; i--) {\n            int furthest = Math.min(i + nums[i], n - 1);\n            for (int j = i + 1; j <= furthest; j++) {\n                if (good[j]) {\n                    good[i] = true;\n                    break;\n                }\n            }\n        }\n        return good[0];\n    }\n}"
      },
      {
        name: "Optimal",
        label: "O(n) — Greedy Maximum Reach",
        idea: "Single pass: maintain the furthest reachable index. If i > maxReach, we're stuck. Otherwise update maxReach.",
        complexity: {"time":"O(n)","space":"O(1)"},
        code: "class Solution {\n    public boolean canJump(int[] nums) {\n        int maxReach = 0;\n        for (int i = 0; i < nums.length; i++) {\n            if (i > maxReach) return false;\n            int reach = i + nums[i];\n            if (reach > maxReach) maxReach = reach;\n        }\n        return true;\n    }\n}"
      }
    ]
  },

  62: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(2^(m+n)) — Recursive DFS",
        idea: "Try every path (right or down) from (0,0) to (m-1,n-1) and count them.",
        complexity: {"time":"O(2^(m+n))","space":"O(m+n)"},
        code: "class Solution {\n    public int uniquePaths(int m, int n) {\n        return countPaths(m, n, 0, 0);\n    }\n    int countPaths(int m, int n, int r, int c) {\n        if (r == m - 1 && c == n - 1) return 1;\n        if (r >= m || c >= n) return 0;\n        return countPaths(m, n, r + 1, c) + countPaths(m, n, r, c + 1);\n    }\n}"
      },
      {
        name: "Better",
        label: "O(m×n) — 2D DP Grid",
        idea: "dp[i][j] = paths to cell (i,j) = dp[i-1][j] + dp[i][j-1]. First row and column are all 1s.",
        complexity: {"time":"O(m×n)","space":"O(m×n)"},
        code: "class Solution {\n    public int uniquePaths(int m, int n) {\n        int[] dp = new int[n * m];\n        for (int i = 0; i < m; i++) {\n            for (int j = 0; j < n; j++) {\n                int idx = i * n + j;\n                if (i == 0 || j == 0) dp[idx] = 1;\n                else dp[idx] = dp[(i-1)*n+j] + dp[i*n+(j-1)];\n            }\n        }\n        return dp[(m-1)*n+(n-1)];\n    }\n}"
      },
      {
        name: "Optimal",
        label: "O(m×n) — Space-Optimized 1D DP",
        idea: "Only one row of DP is needed at a time. Update dp[j] += dp[j-1] going row by row.",
        complexity: {"time":"O(m×n)","space":"O(n)"},
        code: "class Solution {\n    public int uniquePaths(int m, int n) {\n        int[] dp = new int[n];\n        for (int i = 0; i < n; i++) dp[i] = 1;\n        for (int i = 1; i < m; i++) {\n            for (int j = 1; j < n; j++) {\n                dp[j] = dp[j] + dp[j - 1];\n            }\n        }\n        return dp[n - 1];\n    }\n}"
      }
    ]
  },

  74: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(m + n) — Row Binary Search then Column",
        idea: "Binary search in the first column to find the correct row, then binary search within that row.",
        complexity: {"time":"O(m + n)","space":"O(1)"},
        code: "class Solution {\n    public boolean searchMatrix(int[] matrix, int rows, int cols, int target) {\n        // Start from top-right corner\n        int r = 0;\n        int c = cols - 1;\n        while (r < rows && c >= 0) {\n            int val = matrix[r * cols + c];\n            if (val == target) return true;\n            if (val > target) c--;\n            else r++;\n        }\n        return false;\n    }\n}"
      },
      {
        name: "Better",
        label: "O(log m + log n) — Two Binary Searches",
        idea: "First binary search the first column for correct row, then binary search within that row.",
        complexity: {"time":"O(log m + log n)","space":"O(1)"},
        code: "class Solution {\n    public boolean searchMatrix(int[] matrix, int rows, int cols, int target) {\n        int lo = 0;\n        int hi = rows - 1;\n        while (lo < hi) {\n            int mid = lo + (hi - lo + 1) / 2;\n            if (matrix[mid * cols] <= target) lo = mid;\n            else hi = mid - 1;\n        }\n        int row = lo;\n        int left = 0;\n        int right = cols - 1;\n        while (left <= right) {\n            int mid = left + (right - left) / 2;\n            int val = matrix[row * cols + mid];\n            if (val == target) return true;\n            if (val < target) left = mid + 1;\n            else right = mid - 1;\n        }\n        return false;\n    }\n}"
      },
      {
        name: "Optimal",
        label: "O(log(m × n)) — Single Binary Search on Flattened Matrix",
        idea: "Treat the matrix as a sorted 1D array of m×n elements. Binary search on indices 0 to m*n-1.",
        complexity: {"time":"O(log(m × n))","space":"O(1)"},
        code: "class Solution {\n    public boolean searchMatrix(int[] matrix, int rows, int cols, int target) {\n        int lo = 0;\n        int hi = rows * cols - 1;\n        while (lo <= hi) {\n            int mid = lo + (hi - lo) / 2;\n            int row = mid / cols;\n            int col = mid % cols;\n            int val = matrix[row * cols + col];\n            if (val == target) return true;\n            if (val < target) lo = mid + 1;\n            else hi = mid - 1;\n        }\n        return false;\n    }\n}"
      }
    ]
  },

  215: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(n log n) — Sort Then Index",
        idea: "Sort the array in descending order. The kth largest is at index k-1.",
        complexity: {"time":"O(n log n)","space":"O(1)"},
        code: "class Solution {\n    public int findKthLargest(int[] nums, int k) {\n        int n = nums.length;\n        for (int i = 0; i < n - 1; i++) {\n            for (int j = 0; j < n - i - 1; j++) {\n                if (nums[j] < nums[j + 1]) {\n                    int tmp = nums[j];\n                    nums[j] = nums[j + 1];\n                    nums[j + 1] = tmp;\n                }\n            }\n        }\n        return nums[k - 1];\n    }\n}"
      },
      {
        name: "Better",
        label: "O(n log k) — Min-Heap of Size k",
        idea: "Maintain a min-heap of size k. If heap grows beyond k, remove the minimum. At the end, the top is the kth largest.",
        complexity: {"time":"O(n log k)","space":"O(k)"},
        code: "class Solution {\n    public int findKthLargest(int[] nums, int k) {\n        // Simulate min-heap using sorted window of size k\n        int[] minHeap = new int[k];\n        int size = 0;\n        for (int i = 0; i < nums.length; i++) {\n            if (size < k) {\n                minHeap[size++] = nums[i];\n                // sift up (insertion sort style)\n                for (int j = size - 1; j > 0 && minHeap[j] < minHeap[j-1]; j--) {\n                    int tmp = minHeap[j]; minHeap[j] = minHeap[j-1]; minHeap[j-1] = tmp;\n                }\n            } else if (nums[i] > minHeap[0]) {\n                minHeap[0] = nums[i];\n                // sift down\n                for (int j = 0; j * 2 + 1 < k; ) {\n                    int child = j * 2 + 1;\n                    if (child + 1 < k && minHeap[child + 1] < minHeap[child]) child++;\n                    if (minHeap[j] <= minHeap[child]) break;\n                    int tmp = minHeap[j]; minHeap[j] = minHeap[child]; minHeap[child] = tmp;\n                    j = child;\n                }\n            }\n        }\n        return minHeap[0];\n    }\n}"
      },
      {
        name: "Optimal",
        label: "O(n) average — QuickSelect",
        idea: "Partition around a pivot. If pivot ends up at index n-k, return it. Otherwise recurse on the relevant side.",
        complexity: {"time":"O(n) average, O(n²) worst","space":"O(1)"},
        code: "class Solution {\n    public int findKthLargest(int[] nums, int k) {\n        int target = nums.length - k;\n        int lo = 0;\n        int hi = nums.length - 1;\n        while (lo <= hi) {\n            int pivot = partition(nums, lo, hi);\n            if (pivot == target) return nums[pivot];\n            if (pivot < target) lo = pivot + 1;\n            else hi = pivot - 1;\n        }\n        return nums[lo];\n    }\n    int partition(int[] nums, int lo, int hi) {\n        int pivot = nums[hi];\n        int i = lo;\n        for (int j = lo; j < hi; j++) {\n            if (nums[j] <= pivot) {\n                int tmp = nums[i]; nums[i] = nums[j]; nums[j] = tmp;\n                i++;\n            }\n        }\n        int tmp = nums[i]; nums[i] = nums[hi]; nums[hi] = tmp;\n        return i;\n    }\n}"
      }
    ]
  },

  300: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(2ⁿ) — Recursive All Subsequences",
        idea: "Try including or excluding each element. Track length of valid increasing subsequences.",
        complexity: {"time":"O(2ⁿ)","space":"O(n)"},
        code: "class Solution {\n    public int lengthOfLIS(int[] nums) {\n        return dfs(nums, 0, Integer.MIN_VALUE);\n    }\n    int dfs(int[] nums, int i, int prev) {\n        if (i == nums.length) return 0;\n        int take = 0;\n        if (nums[i] > prev) take = 1 + dfs(nums, i + 1, nums[i]);\n        int skip = dfs(nums, i + 1, prev);\n        return take > skip ? take : skip;\n    }\n}"
      },
      {
        name: "Better",
        label: "O(n²) — Bottom-Up DP",
        idea: "dp[i] = LIS ending at index i. For each i, check all j < i where nums[j] < nums[i] and take the max.",
        complexity: {"time":"O(n²)","space":"O(n)"},
        code: "class Solution {\n    public int lengthOfLIS(int[] nums) {\n        int n = nums.length;\n        int[] dp = new int[n];\n        for (int i = 0; i < n; i++) dp[i] = 1;\n        int maxLen = 1;\n        for (int i = 1; i < n; i++) {\n            for (int j = 0; j < i; j++) {\n                if (nums[j] < nums[i]) {\n                    if (dp[j] + 1 > dp[i]) dp[i] = dp[j] + 1;\n                }\n            }\n            if (dp[i] > maxLen) maxLen = dp[i];\n        }\n        return maxLen;\n    }\n}"
      },
      {
        name: "Optimal",
        label: "O(n log n) — Patience Sorting / Binary Search",
        idea: "Maintain a tails array where tails[i] = smallest tail of IS with length i+1. Binary search to replace/extend.",
        complexity: {"time":"O(n log n)","space":"O(n)"},
        code: "class Solution {\n    public int lengthOfLIS(int[] nums) {\n        int[] tails = new int[nums.length];\n        int len = 0;\n        for (int i = 0; i < nums.length; i++) {\n            int lo = 0;\n            int hi = len;\n            while (lo < hi) {\n                int mid = lo + (hi - lo) / 2;\n                if (tails[mid] < nums[i]) lo = mid + 1;\n                else hi = mid;\n            }\n            tails[lo] = nums[i];\n            if (lo == len) len++;\n        }\n        return len;\n    }\n}"
      }
    ]
  },

  739: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(n²) — Nested Loop",
        idea: "For each day i, scan all future days j > i to find the first warmer day.",
        complexity: {"time":"O(n²)","space":"O(1)"},
        code: "class Solution {\n    public int[] dailyTemperatures(int[] temperatures) {\n        int n = temperatures.length;\n        int[] result = new int[n];\n        for (int i = 0; i < n; i++) {\n            for (int j = i + 1; j < n; j++) {\n                if (temperatures[j] > temperatures[i]) {\n                    result[i] = j - i;\n                    break;\n                }\n            }\n        }\n        return result;\n    }\n}"
      },
      {
        name: "Better",
        label: "O(n) — Monotonic Stack of Indices",
        idea: "Maintain a stack of indices with decreasing temperatures. When current temp is warmer, pop and compute waiting days.",
        complexity: {"time":"O(n)","space":"O(n)"},
        code: "class Solution {\n    public int[] dailyTemperatures(int[] temperatures) {\n        int n = temperatures.length;\n        int[] result = new int[n];\n        int[] stack = new int[n];\n        int top = 0;\n        for (int i = 0; i < n; i++) {\n            while (top > 0 && temperatures[stack[top - 1]] < temperatures[i]) {\n                top--;\n                int idx = stack[top];\n                result[idx] = i - idx;\n            }\n            stack[top] = i;\n            top++;\n        }\n        return result;\n    }\n}"
      },
      {
        name: "Optimal",
        label: "O(n) — Right-to-Left with Jump Pointers",
        idea: "Process from right to left. For each day i, use the already-computed result array to skip through to the next warmer day efficiently.",
        complexity: {"time":"O(n) amortized","space":"O(1) extra"},
        code: "class Solution {\n    public int[] dailyTemperatures(int[] temperatures) {\n        int n = temperatures.length;\n        int[] result = new int[n];\n        for (int i = n - 2; i >= 0; i--) {\n            int j = i + 1;\n            while (j < n && temperatures[j] <= temperatures[i]) {\n                if (result[j] == 0) {\n                    j = n;\n                    break;\n                }\n                j = j + result[j];\n            }\n            if (j < n) result[i] = j - i;\n        }\n        return result;\n    }\n}"
      }
    ]
  },

  567: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(n · m) — Check Every Substring",
        idea: "Iterate through all substrings in s2 of length equal to s1. For each window, count character frequencies and compare with s1.",
        complexity: { time: "O(26 · n)", space: "O(26) = O(1)" },
        code: `class Solution {
    public boolean checkInclusion(String s1, String s2) {
        if (s1.length() > s2.length()) return false;
        int[] count1 = new int[26];
        for (int i = 0; i < s1.length(); i++) {
            count1[s1.charAt(i) - 'a']++;
        }
        for (int i = 0; i <= s2.length() - s1.length(); i++) {
            int[] count2 = new int[26];
            for (int j = 0; j < s1.length(); j++) {
                count2[s2.charAt(i + j) - 'a']++;
            }
            boolean match = true;
            for (int k = 0; k < 26; k++) {
                if (count1[k] != count2[k]) {
                    match = false;
                    break;
                }
            }
            if (match) return true;
        }
        return false;
    }
}`
      },
      {
        name: "Better",
        label: "O(n) — Fixed Sliding Window with Array",
        idea: "Maintain a sliding window of size s1.length() over s2. Update incoming character at right and outgoing character at left in O(1).",
        complexity: { time: "O(26 · n)", space: "O(26) = O(1)" },
        code: `class Solution {
    public boolean checkInclusion(String s1, String s2) {
        if (s1.length() > s2.length()) return false;
        int[] count1 = new int[26];
        int[] count2 = new int[26];
        for (int i = 0; i < s1.length(); i++) {
            count1[s1.charAt(i) - 'a']++;
            count2[s2.charAt(i) - 'a']++;
        }
        int left = 0;
        int right = s1.length() - 1;
        while (right < s2.length()) {
            boolean match = true;
            for (int i = 0; i < 26; i++) {
                if (count1[i] != count2[i]) {
                    match = false;
                    break;
                }
            }
            if (match) return true;
            right++;
            if (right < s2.length()) {
                count2[s2.charAt(right) - 'a']++;
                count2[s2.charAt(left) - 'a']--;
                left++;
            }
        }
        return false;
    }
}`
      },
      {
        name: "Optimal",
        label: "O(n) — Sliding Window with Match Count",
        idea: "Track how many of the 26 characters currently match. Moving the window only changes counts for two characters, updating matches in O(1).",
        complexity: { time: "O(n)", space: "O(26) = O(1)" },
        code: `class Solution {
    public boolean checkInclusion(String s1, String s2) {
        if (s1.length() > s2.length()) return false;
        int[] count1 = new int[26];
        int[] count2 = new int[26];
        for (int i = 0; i < s1.length(); i++) {
            count1[s1.charAt(i) - 'a']++;
            count2[s2.charAt(i) - 'a']++;
        }
        int matches = 0;
        for (int i = 0; i < 26; i++) {
            if (count1[i] == count2[i]) matches++;
        }
        int left = 0;
        for (int right = s1.length(); right < s2.length(); right++) {
            if (matches == 26) return true;
            int r = s2.charAt(right) - 'a';
            count2[r]++;
            if (count2[r] == count1[r]) matches++;
            else if (count2[r] == count1[r] + 1) matches--;

            int l = s2.charAt(left) - 'a';
            count2[l]--;
            if (count2[l] == count1[l]) matches++;
            else if (count2[l] == count1[l] - 1) matches--;
            left++;
        }
        return matches == 26;
    }
}`
      }
    ]
  },
};

export function getProblemSolutions(id) {
  return PROBLEM_SOLUTIONS[id] || null;
}
