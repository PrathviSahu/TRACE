// ─────────────────────────────────────────────────────────────
//  TRACE — Problem Solution Presets & Smart Code Generator
//  Provides runnable solutions and starters for DSA Roadmap
// ─────────────────────────────────────────────────────────────

export const PRESET_SOLUTIONS = {
  1: {
    name: 'Two Sum',
    description: 'Find two indices that sum up to target in sorted array.',
    code: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        int left = 0;
        int right = nums.length - 1;
        while (left < right) {
            int sum = nums[left] + nums[right];
            if (sum == target) {
                return new int[]{left, right};
            }
            if (sum < target) {
                left++;
            } else {
                right--;
            }
        }
        return new int[]{-1, -1};
    }
}`,
    inputs: { nums: '[2, 7, 11, 15]', target: '9' }
  },

  3: {
    name: 'Longest Substring Without Repeating Characters',
    description: 'Sliding window with frequency array to track repeating characters.',
    code: `class Solution {
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
}`,
    inputs: { s: '"abcabcbb"' }
  },

  11: {
    name: "Container With Most Water",
    description: "Find two lines forming a container with maximum water storage.",
    code: `class Solution {
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
}`,
    inputs: { height: "[1, 8, 6, 2, 5, 4, 8, 3, 7]" }
  },

  26: {
    name: 'Remove Duplicates from Sorted Array',
    description: 'In-place removal of duplicates returning new length.',
    code: `class Solution {
    public int removeDuplicates(int[] nums) {
        if (nums.length == 0) return 0;
        int i = 0;
        for (int j = 1; j < nums.length; j++) {
            if (nums[j] != nums[i]) {
                i++;
                nums[i] = nums[j];
            }
        }
        return i + 1;
    }
}`,
    inputs: { nums: '[1, 1, 2, 2, 3, 4, 4]' }
  },

  27: {
    name: 'Remove Element',
    description: 'Remove all occurrences of val in-place.',
    code: `class Solution {
    public int removeElement(int[] nums, int val) {
        int k = 0;
        for (int i = 0; i < nums.length; i++) {
            if (nums[i] != val) {
                nums[k] = nums[i];
                k++;
            }
        }
        return k;
    }
}`,
    inputs: { nums: '[3, 2, 2, 3]', val: '3' }
  },

  35: {
    name: 'Search Insert Position',
    description: 'Find target or index where it would be inserted.',
    code: `class Solution {
    public int searchInsert(int[] nums, int target) {
        int left = 0;
        int right = nums.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) {
                return mid;
            }
            if (nums[mid] < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        return left;
    }
}`,
    inputs: { nums: '[1, 3, 5, 6]', target: '5' }
  },

  53: {
    name: 'Maximum Subarray',
    description: "Kadane's Algorithm: maximum contiguous subarray sum.",
    code: `class Solution {
    public int maxSubArray(int[] nums) {
        int maxSoFar = nums[0];
        int currentMax = nums[0];
        for (int i = 1; i < nums.length; i++) {
            if (currentMax + nums[i] > nums[i]) {
                currentMax = currentMax + nums[i];
            } else {
                currentMax = nums[i];
            }
            if (currentMax > maxSoFar) {
                maxSoFar = currentMax;
            }
        }
        return maxSoFar;
    }
}`,
    inputs: { nums: '[-2, 1, -3, 4, -1, 2, 1, -5, 4]' }
  },

  70: {
    name: 'Climbing Stairs',
    description: 'Distinct ways to reach top using 1 or 2 steps (DP).',
    code: `class Solution {
    public int climbStairs(int n) {
        if (n <= 2) return n;
        int first = 1;
        int second = 2;
        for (int i = 3; i <= n; i++) {
            int third = first + second;
            first = second;
            second = third;
        }
        return second;
    }
}`,
    inputs: { n: '5' }
  },

  75: {
    name: 'Sort Colors',
    description: 'Dutch National Flag algorithm: sort 0s, 1s, and 2s in-place.',
    code: `class Solution {
    public int[] sortColors(int[] nums) {
        int low = 0;
        int mid = 0;
        int high = nums.length - 1;
        while (mid <= high) {
            if (nums[mid] == 0) {
                int temp = nums[low];
                nums[low] = nums[mid];
                nums[mid] = temp;
                low++;
                mid++;
            } else if (nums[mid] == 1) {
                mid++;
            } else {
                int temp = nums[mid];
                nums[mid] = nums[high];
                nums[high] = temp;
                high--;
            }
        }
        return nums;
    }
}`,
    inputs: { nums: '[2, 0, 2, 1, 1, 0]' }
  },

  88: {
    name: 'Merge Sorted Array',
    description: 'Merge nums2 into nums1 from back to front.',
    code: `class Solution {
    public int[] merge(int[] nums1, int m, int[] nums2, int n) {
        int p1 = m - 1;
        int p2 = n - 1;
        int p = m + n - 1;
        while (p1 >= 0 && p2 >= 0) {
            if (nums1[p1] > nums2[p2]) {
                nums1[p] = nums1[p1];
                p1--;
            } else {
                nums1[p] = nums2[p2];
                p2--;
            }
            p--;
        }
        while (p2 >= 0) {
            nums1[p] = nums2[p2];
            p2--;
            p--;
        }
        return nums1;
    }
}`,
    inputs: { nums1: '[1, 2, 3, 0, 0, 0]', m: '3', nums2: '[2, 5, 6]', n: '3' }
  },

  121: {
    name: 'Best Time to Buy and Sell Stock',
    description: 'Single transaction profit maximization (Greedy).',
    code: `class Solution {
    public int maxProfit(int[] prices) {
        int minPrice = prices[0];
        int maxProfit = 0;
        for (int i = 1; i < prices.length; i++) {
            if (prices[i] < minPrice) {
                minPrice = prices[i];
            } else if (prices[i] - minPrice > maxProfit) {
                maxProfit = prices[i] - minPrice;
            }
        }
        return maxProfit;
    }
}`,
    inputs: { prices: '[7, 1, 5, 3, 6, 4]' }
  },

  122: {
    name: 'Best Time to Buy and Sell Stock II',
    description: 'Multiple transactions greedy profit summation.',
    code: `class Solution {
    public int maxProfit(int[] prices) {
        int total = 0;
        for (int i = 1; i < prices.length; i++) {
            if (prices[i] > prices[i - 1]) {
                total += prices[i] - prices[i - 1];
            }
        }
        return total;
    }
}`,
    inputs: { prices: '[7, 1, 5, 3, 6, 4]' }
  },

  125: {
    name: 'Valid Palindrome',
    description: 'Two pointer palindrome check.',
    code: `class Solution {
    public boolean isPalindrome(String s) {
        int left = 0;
        int right = s.length() - 1;
        while (left < right) {
            if (s.charAt(left) != s.charAt(right)) {
                return false;
            }
            left++;
            right--;
        }
        return true;
    }
}`,
    inputs: { s: 'racecar' }
  },

  128: {
    name: "Longest Consecutive Sequence",
    description: "Find length of longest consecutive elements sequence using HashSet in O(n).",
    code: `class Solution {
    public int longestConsecutive(int[] nums) {
        Set<Integer> set = new HashSet<>();
        for (int n : nums) {
            set.add(n);
        }
        int max = 0;
        for (int num : set) {
            if (!set.contains(num - 1)) {
                int current = num;
                int count = 1;
                while (set.contains(current + 1)) {
                    current++;
                    count++;
                }
                if (count > max) {
                    max = count;
                }
            }
        }
        return max;
    }
}`,
    inputs: { nums: "[100, 4, 200, 1, 3, 2]" }
  },

  136: {
    name: 'Single Number',
    description: 'Find non-duplicate element using XOR property (x ^ x = 0).',
    code: `class Solution {
    public int singleNumber(int[] nums) {
        int result = 0;
        for (int i = 0; i < nums.length; i++) {
            result = result ^ nums[i];
        }
        return result;
    }
}`,
    inputs: { nums: '[4, 1, 2, 1, 2]' }
  },

  167: {
    name: 'Two Sum II',
    description: 'Two pointers on 1-indexed sorted array.',
    code: `class Solution {
    public int[] twoSum(int[] numbers, int target) {
        int left = 0;
        int right = numbers.length - 1;
        while (left < right) {
            int sum = numbers[left] + numbers[right];
            if (sum == target) {
                return new int[]{left + 1, right + 1};
            }
            if (sum < target) {
                left++;
            } else {
                right--;
            }
        }
        return new int[]{-1, -1};
    }
}`,
    inputs: { numbers: '[2, 7, 11, 15]', target: '9' }
  },

  169: {
    name: 'Majority Element',
    description: "Boyer-Moore Voting Algorithm: element appearing > n/2 times.",
    code: `class Solution {
    public int majorityElement(int[] nums) {
        int candidate = nums[0];
        int count = 1;
        for (int i = 1; i < nums.length; i++) {
            if (count == 0) {
                candidate = nums[i];
                count = 1;
            } else if (nums[i] == candidate) {
                count++;
            } else {
                count--;
            }
        }
        return candidate;
    }
}`,
    inputs: { nums: '[2, 2, 1, 1, 1, 2, 2]' }
  },

  189: {
    name: 'Rotate Array',
    description: 'Rotate array to the right by k steps.',
    code: `class Solution {
    public int[] rotate(int[] nums, int k) {
        int n = nums.length;
        k = k % n;
        // Reverse entire array
        reverse(nums, 0, n - 1);
        // Reverse first k elements
        reverse(nums, 0, k - 1);
        // Reverse remaining elements
        reverse(nums, k, n - 1);
        return nums;
    }
    private void reverse(int[] arr, int start, int end) {
        while (start < end) {
            int temp = arr[start];
            arr[start] = arr[end];
            arr[end] = temp;
            start++;
            end--;
        }
    }
}`,
    inputs: { nums: '[1, 2, 3, 4, 5, 6, 7]', k: '3' }
  },

  217: {
    name: 'Contains Duplicate',
    description: 'Check if any value appears at least twice.',
    code: `class Solution {
    public boolean containsDuplicate(int[] nums) {
        for (int i = 0; i < nums.length; i++) {
            for (int j = i + 1; j < nums.length; j++) {
                if (nums[i] == nums[j]) {
                    return true;
                }
            }
        }
        return false;
    }
}`,
    inputs: { nums: '[1, 2, 3, 1]' }
  },

  268: {
    name: 'Missing Number',
    description: 'Find missing number from [0, n] using Gauss summation.',
    code: `class Solution {
    public int missingNumber(int[] nums) {
        int n = nums.length;
        int expected = n * (n + 1) / 2;
        int actual = 0;
        for (int i = 0; i < n; i++) {
            actual += nums[i];
        }
        return expected - actual;
    }
}`,
    inputs: { nums: '[3, 0, 1]' }
  },

  283: {
    name: 'Move Zeroes',
    description: 'Move all zeroes to end while maintaining relative order.',
    code: `class Solution {
    public int[] moveZeroes(int[] nums) {
        int insertPos = 0;
        for (int i = 0; i < nums.length; i++) {
            if (nums[i] != 0) {
                nums[insertPos] = nums[i];
                insertPos++;
            }
        }
        while (insertPos < nums.length) {
            nums[insertPos] = 0;
            insertPos++;
        }
        return nums;
    }
}`,
    inputs: { nums: '[0, 1, 0, 3, 12]' }
  },

  344: {
    name: 'Reverse String',
    description: 'Reverse string / character array in-place.',
    code: `class Solution {
    public void reverseString(char[] s) {
        int left = 0;
        int right = s.length - 1;
        while (left < right) {
            char temp = s[left];
            s[left] = s[right];
            s[right] = temp;
            left++;
            right--;
        }
    }
}`,
    inputs: { s: "['h','e','l','l','o']" }
  },

  485: {
    name: 'Max Consecutive Ones',
    description: 'Find maximum number of consecutive 1s in binary array.',
    code: `class Solution {
    public int findMaxConsecutiveOnes(int[] nums) {
        int maxCount = 0;
        int currentCount = 0;
        for (int i = 0; i < nums.length; i++) {
            if (nums[i] == 1) {
                currentCount++;
                if (currentCount > maxCount) {
                    maxCount = currentCount;
                }
            } else {
                currentCount = 0;
            }
        }
        return maxCount;
    }
}`,
    inputs: { nums: '[1, 1, 0, 1, 1, 1]' }
  },

  509: {
    name: 'Fibonacci Number',
    description: 'Compute F(n) with recursive divide and conquer.',
    code: `class Solution {
    public int fib(int n) {
        if (n <= 1) {
            return n;
        }
        return fib(n - 1) + fib(n - 2);
    }
}`,
    inputs: { n: '6' }
  },

  704: {
    name: 'Binary Search',
    description: 'Search for target in sorted array in O(log n) time.',
    code: `class Solution {
    public int search(int[] nums, int target) {
        int left = 0;
        int right = nums.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) {
                return mid;
            }
            if (nums[mid] < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        return -1;
    }
}`,
    inputs: { nums: '[1, 3, 5, 7, 9, 11]', target: '7' }
  },

  724: {
    name: 'Find Pivot Index',
    description: 'Find index where left sum equals right sum.',
    code: `class Solution {
    public int pivotIndex(int[] nums) {
        int totalSum = 0;
        for (int i = 0; i < nums.length; i++) {
            totalSum += nums[i];
        }
        int leftSum = 0;
        for (int i = 0; i < nums.length; i++) {
            if (leftSum == totalSum - leftSum - nums[i]) {
                return i;
            }
            leftSum += nums[i];
        }
        return -1;
    }
}`,
    inputs: { nums: '[1, 7, 3, 6, 5, 6]' }
  },

  912: {
    name: 'Sort an Array',
    description: 'Bubble sort visualization with swap inspection.',
    code: `class Solution {
    public int[] sortArray(int[] nums) {
        int n = nums.length;
        for (int i = 0; i < n - 1; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                if (nums[j] > nums[j + 1]) {
                    int temp = nums[j];
                    nums[j] = nums[j + 1];
                    nums[j + 1] = temp;
                }
            }
        }
        return nums;
    }
}`,
    inputs: { nums: '[5, 2, 3, 1]' }
  },

  424: {
    name: 'Longest Repeating Character Replacement',
    description: 'Find length of longest substring with same letter after at most k replacements.',
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
}`,
    inputs: { s: '"AABABBA"', k: 1 }
  },


  20: {
    name: "Valid Parentheses",
    description: "Stack-based bracket matching: push open, pop and verify on close.",
    code: "class Solution {\n    public boolean isValid(String s) {\n        int[] stack = new int[s.length()];\n        int top = 0;\n        for (int i = 0; i < s.length(); i++) {\n            char c = s.charAt(i);\n            if (c == '(' || c == '[' || c == '{') {\n                stack[top] = c;\n                top++;\n            } else {\n                if (top == 0) return false;\n                top--;\n                int prev = stack[top];\n                if (c == ')' && prev != '(') return false;\n                if (c == ']' && prev != '[') return false;\n                if (c == '}' && prev != '{') return false;\n            }\n        }\n        return top == 0;\n    }\n}",
    inputs: {"s":"\"()[]{}\""}
  },

  21: {
    name: 'Merge Two Sorted Lists',
    description: 'Recursive merge of two sorted linked lists.',
    code: `class Solution {
    public ListNode mergeTwoLists() {
        ListNode l1 = new ListNode(1);
        l1.next = new ListNode(2);
        l1.next.next = new ListNode(4);
        ListNode l2 = new ListNode(1);
        l2.next = new ListNode(3);
        l2.next.next = new ListNode(4);
        return merge(l1, l2);
    }
    ListNode merge(ListNode a, ListNode b) {
        if (a == null) return b;
        if (b == null) return a;
        if (a.val <= b.val) {
            a.next = merge(a.next, b);
            return a;
        } else {
            b.next = merge(a, b.next);
            return b;
        }
    }
}`,
    inputs: {}
  },

  33: {
    name: "Search in Rotated Sorted Array",
    description: "Modified binary search identifying which half is sorted at each step.",
    code: "class Solution {\n    public int search(int[] nums, int target) {\n        int left = 0;\n        int right = nums.length - 1;\n        while (left <= right) {\n            int mid = left + (right - left) / 2;\n            if (nums[mid] == target) return mid;\n            if (nums[left] <= nums[mid]) {\n                if (nums[left] <= target && target < nums[mid]) {\n                    right = mid - 1;\n                } else {\n                    left = mid + 1;\n                }\n            } else {\n                if (nums[mid] < target && target <= nums[right]) {\n                    left = mid + 1;\n                } else {\n                    right = mid - 1;\n                }\n            }\n        }\n        return -1;\n    }\n}",
    inputs: {"nums":"[4,5,6,7,0,1,2]","target":0}
  },

  49: {
    name: "Group Anagrams",
    description: "Count anagram groups using per-word frequency comparison.",
    code: "class Solution {\n    public int groupAnagrams(String[] strs) {\n        int groups = 0;\n        int n = strs.length;\n        boolean[] visited = new boolean[n];\n        for (int i = 0; i < n; i++) {\n            if (!visited[i]) {\n                groups++;\n                for (int j = i + 1; j < n; j++) {\n                    if (!visited[j] && isAnagram(strs[i], strs[j])) {\n                        visited[j] = true;\n                    }\n                }\n            }\n        }\n        return groups;\n    }\n    boolean isAnagram(String a, String b) {\n        if (a.length() != b.length()) return false;\n        int[] count = new int[26];\n        for (int i = 0; i < a.length(); i++) count[a.charAt(i) - 'a']++;\n        for (int i = 0; i < b.length(); i++) count[b.charAt(i) - 'a']--;\n        for (int i = 0; i < 26; i++) if (count[i] != 0) return false;\n        return true;\n    }\n}",
    inputs: {"strs":"[\"eat\",\"tea\",\"tan\",\"ate\",\"nat\",\"bat\"]"}
  },

  55: {
    name: "Jump Game",
    description: "Greedy: track the farthest reachable index. Return false if stuck.",
    code: "class Solution {\n    public boolean canJump(int[] nums) {\n        int maxReach = 0;\n        for (int i = 0; i < nums.length; i++) {\n            if (i > maxReach) return false;\n            int reach = i + nums[i];\n            if (reach > maxReach) maxReach = reach;\n        }\n        return true;\n    }\n}",
    inputs: {"nums":"[2,3,1,1,4]"}
  },

  56: {
    name: "Merge Intervals",
    description: "Sort intervals by start, then merge overlapping ones in a single pass.",
    code: "class Solution {\n    public int mergeIntervals() {\n        // intervals = [[1,3],[2,6],[8,10],[15,18]]\n        int[] starts = {1, 2, 8, 15};\n        int[] ends =   {3, 6, 10, 18};\n        int n = 4;\n        int count = 1;\n        int curEnd = ends[0];\n        for (int i = 1; i < n; i++) {\n            if (starts[i] <= curEnd) {\n                if (ends[i] > curEnd) curEnd = ends[i];\n            } else {\n                count++;\n                curEnd = ends[i];\n            }\n        }\n        return count;\n    }\n}",
    inputs: {}
  },

  62: {
    name: "Unique Paths",
    description: "Space-optimized DP: 1D array updated row by row.",
    code: "class Solution {\n    public int uniquePaths(int m, int n) {\n        int[] dp = new int[n];\n        for (int i = 0; i < n; i++) dp[i] = 1;\n        for (int i = 1; i < m; i++) {\n            for (int j = 1; j < n; j++) {\n                dp[j] = dp[j] + dp[j - 1];\n            }\n        }\n        return dp[n - 1];\n    }\n}",
    inputs: {"m":3,"n":7}
  },

  74: {
    name: "Search a 2D Matrix",
    description: "Treat the sorted matrix as a 1D array and binary search on virtual indices.",
    code: "class Solution {\n    public boolean searchMatrix(int[] matrix, int rows, int cols, int target) {\n        int lo = 0;\n        int hi = rows * cols - 1;\n        while (lo <= hi) {\n            int mid = lo + (hi - lo) / 2;\n            int row = mid / cols;\n            int col = mid % cols;\n            int val = matrix[row * cols + col];\n            if (val == target) return true;\n            if (val < target) lo = mid + 1;\n            else hi = mid - 1;\n        }\n        return false;\n    }\n}",
    inputs: {"matrix":"[1,3,5,7,10,11,16,20,23,30,34,60]","rows":3,"cols":4,"target":3}
  },

  104: {
    name: "Maximum Depth of Binary Tree",
    description: "Recursive DFS: depth = max(left depth, right depth) + 1. Tree built inline.",
    code: "class Solution {\n    public int maxDepth() {\n        // Build example: [3,9,20,null,null,15,7]\n        TreeNode root = new TreeNode(3);\n        root.left = new TreeNode(9);\n        root.right = new TreeNode(20);\n        root.right.left = new TreeNode(15);\n        root.right.right = new TreeNode(7);\n        return depth(root);\n    }\n    int depth(TreeNode node) {\n        if (node == null) return 0;\n        int l = depth(node.left);\n        int r = depth(node.right);\n        if (l > r) return l + 1;\n        return r + 1;\n    }\n}",
    inputs: {}
  },

  153: {
    name: "Find Minimum in Rotated Sorted Array",
    description: "Binary search: minimum is always in the unsorted half.",
    code: "class Solution {\n    public int findMin(int[] nums) {\n        int left = 0;\n        int right = nums.length - 1;\n        while (left < right) {\n            int mid = left + (right - left) / 2;\n            if (nums[mid] > nums[right]) {\n                left = mid + 1;\n            } else {\n                right = mid;\n            }\n        }\n        return nums[left];\n    }\n}",
    inputs: {"nums":"[3,4,5,1,2]"}
  },

  198: {
    name: "House Robber",
    description: "DP with two rolling variables: max(skip current, rob current + prev-prev).",
    code: "class Solution {\n    public int rob(int[] nums) {\n        if (nums.length == 1) return nums[0];\n        int prev2 = 0;\n        int prev1 = 0;\n        for (int i = 0; i < nums.length; i++) {\n            int curr = prev2 + nums[i];\n            if (prev1 > curr) curr = prev1;\n            prev2 = prev1;\n            prev1 = curr;\n        }\n        return prev1;\n    }\n}",
    inputs: {"nums":"[2,7,9,3,1]"}
  },

  200: {
    name: "Number of Islands",
    description: "DFS on flattened 1D grid: count unvisited land cells and flood-fill each island.",
    code: "class Solution {\n    public int numIslands() {\n        int rows = 4;\n        int cols = 5;\n        // grid: [[1,1,1,1,0],[1,1,0,1,0],[1,1,0,0,0],[0,0,0,0,0]] → 1 island\n        int[] grid = {1,1,1,1,0,  1,1,0,1,0,  1,1,0,0,0,  0,0,0,0,0};\n        int count = 0;\n        boolean[] vis = new boolean[rows * cols];\n        for (int i = 0; i < rows; i++) {\n            for (int j = 0; j < cols; j++) {\n                int idx = i * cols + j;\n                if (grid[idx] == 1 && !vis[idx]) {\n                    count++;\n                    dfs(grid, vis, i, j, rows, cols);\n                }\n            }\n        }\n        return count;\n    }\n    void dfs(int[] grid, boolean[] vis, int r, int c, int rows, int cols) {\n        if (r < 0 || r >= rows || c < 0 || c >= cols) return;\n        int idx = r * cols + c;\n        if (grid[idx] == 0 || vis[idx]) return;\n        vis[idx] = true;\n        dfs(grid, vis, r + 1, c, rows, cols);\n        dfs(grid, vis, r - 1, c, rows, cols);\n        dfs(grid, vis, r, c + 1, rows, cols);\n        dfs(grid, vis, r, c - 1, rows, cols);\n    }\n}",
    inputs: {}
  },

  206: {
    name: "Reverse Linked List",
    description: "Iterative reversal: maintain prev and curr pointers, redirect links.",
    code: "class Solution {\n    public ListNode reverseList() {\n        // Build: 1 -> 2 -> 3 -> 4 -> 5\n        ListNode head = new ListNode(1);\n        head.next = new ListNode(2);\n        head.next.next = new ListNode(3);\n        head.next.next.next = new ListNode(4);\n        head.next.next.next.next = new ListNode(5);\n        return reverse(head);\n    }\n    ListNode reverse(ListNode head) {\n        ListNode prev = null;\n        ListNode curr = head;\n        while (curr != null) {\n            ListNode next = curr.next;\n            curr.next = prev;\n            prev = curr;\n            curr = next;\n        }\n        return prev;\n    }\n}",
    inputs: {}
  },

  215: {
    name: "Kth Largest Element in an Array",
    description: "QuickSelect: partition array around pivot until pivot index equals n-k.",
    code: "class Solution {\n    public int findKthLargest(int[] nums, int k) {\n        int target = nums.length - k;\n        int lo = 0;\n        int hi = nums.length - 1;\n        while (lo <= hi) {\n            int pivot = partition(nums, lo, hi);\n            if (pivot == target) return nums[pivot];\n            if (pivot < target) lo = pivot + 1;\n            else hi = pivot - 1;\n        }\n        return nums[lo];\n    }\n    int partition(int[] nums, int lo, int hi) {\n        int pivot = nums[hi];\n        int i = lo;\n        for (int j = lo; j < hi; j++) {\n            if (nums[j] <= pivot) {\n                int tmp = nums[i];\n                nums[i] = nums[j];\n                nums[j] = tmp;\n                i++;\n            }\n        }\n        int tmp = nums[i];\n        nums[i] = nums[hi];\n        nums[hi] = tmp;\n        return i;\n    }\n}",
    inputs: {"nums":"[3,2,1,5,6,4]","k":2}
  },

  226: {
    name: "Invert Binary Tree",
    description: "Recursive DFS: swap left and right children at each node.",
    code: "class Solution {\n    public TreeNode invertTree() {\n        // Build example: [4,2,7,1,3,6,9]\n        TreeNode root = new TreeNode(4);\n        root.left = new TreeNode(2);\n        root.right = new TreeNode(7);\n        root.left.left = new TreeNode(1);\n        root.left.right = new TreeNode(3);\n        root.right.left = new TreeNode(6);\n        root.right.right = new TreeNode(9);\n        return invert(root);\n    }\n    TreeNode invert(TreeNode node) {\n        if (node == null) return null;\n        TreeNode left = invert(node.left);\n        TreeNode right = invert(node.right);\n        node.left = right;\n        node.right = left;\n        return node;\n    }\n}",
    inputs: {}
  },

  238: {
    name: "Product of Array Except Self",
    description: "Two-pass prefix/suffix product: no division needed.",
    code: "class Solution {\n    public int[] productExceptSelf(int[] nums) {\n        int n = nums.length;\n        int[] result = new int[n];\n        result[0] = 1;\n        for (int i = 1; i < n; i++) {\n            result[i] = result[i - 1] * nums[i - 1];\n        }\n        int right = 1;\n        for (int i = n - 1; i >= 0; i--) {\n            result[i] = result[i] * right;\n            right = right * nums[i];\n        }\n        return result;\n    }\n}",
    inputs: {"nums":"[1,2,3,4]"}
  },

  300: {
    name: "Longest Increasing Subsequence",
    description: "O(n²) DP: dp[i] = max(dp[j]+1) for all j < i where nums[j] < nums[i].",
    code: "class Solution {\n    public int lengthOfLIS(int[] nums) {\n        int n = nums.length;\n        int[] dp = new int[n];\n        for (int i = 0; i < n; i++) dp[i] = 1;\n        int maxLen = 1;\n        for (int i = 1; i < n; i++) {\n            for (int j = 0; j < i; j++) {\n                if (nums[j] < nums[i]) {\n                    if (dp[j] + 1 > dp[i]) dp[i] = dp[j] + 1;\n                }\n            }\n            if (dp[i] > maxLen) maxLen = dp[i];\n        }\n        return maxLen;\n    }\n}",
    inputs: {"nums":"[10,9,2,5,3,7,101,18]"}
  },

  322: {
    name: "Coin Change",
    description: "Bottom-up DP: dp[amount] = min coins. Initialize to amount+1 (infinity).",
    code: "class Solution {\n    public int coinChange(int[] coins, int amount) {\n        int[] dp = new int[amount + 1];\n        for (int i = 1; i <= amount; i++) dp[i] = amount + 1;\n        dp[0] = 0;\n        for (int i = 1; i <= amount; i++) {\n            for (int j = 0; j < coins.length; j++) {\n                if (coins[j] <= i) {\n                    int val = dp[i - coins[j]] + 1;\n                    if (val < dp[i]) dp[i] = val;\n                }\n            }\n        }\n        if (dp[amount] > amount) return -1;\n        return dp[amount];\n    }\n}",
    inputs: {"coins":"[1,5,11]","amount":11}
  },

  347: {
    name: "Top K Frequent Elements",
    description: "Count frequencies then iterate from max frequency down to find top-k.",
    code: "class Solution {\n    public int topKFrequent(int[] nums, int k) {\n        int[] freq = new int[201];\n        int n = nums.length;\n        for (int i = 0; i < n; i++) {\n            freq[nums[i] + 100]++;\n        }\n        int found = 0;\n        int lastVal = 0;\n        for (int count = n; count >= 1; count--) {\n            for (int i = 0; i < 201; i++) {\n                if (freq[i] == count) {\n                    found++;\n                    lastVal = i - 100;\n                    if (found == k) return lastVal;\n                }\n            }\n        }\n        return lastVal;\n    }\n}",
    inputs: {"nums":"[1,1,1,2,2,3]","k":2}
  },

  739: {
    name: "Daily Temperatures",
    description: "Monotonic decreasing stack of indices. Pop when warmer day found.",
    code: "class Solution {\n    public int[] dailyTemperatures(int[] temperatures) {\n        int n = temperatures.length;\n        int[] result = new int[n];\n        int[] stack = new int[n];\n        int top = 0;\n        for (int i = 0; i < n; i++) {\n            while (top > 0 && temperatures[stack[top - 1]] < temperatures[i]) {\n                top--;\n                int idx = stack[top];\n                result[idx] = i - idx;\n            }\n            stack[top] = i;\n            top++;\n        }\n        return result;\n    }\n}",
    inputs: {"temperatures":"[73,74,75,71,69,72,76,73]"}
  },

  567: {
    name: 'Permutation in String',
    description: 'Check if s2 contains a permutation of s1 using sliding window frequency matching.',
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
}`,
    inputs: { s1: '"ab"', s2: '"eidbaooo"' }
  },

  1480: {
    name: 'Running Sum of 1d Array',
    description: 'Prefix sum transformation runningSum[i] = sum(nums[0]..nums[i]).',
    code: `class Solution {
    public int[] runningSum(int[] nums) {
        for (int i = 1; i < nums.length; i++) {
            nums[i] = nums[i] + nums[i - 1];
        }
        return nums;
    }
}`,
    inputs: { nums: '[1, 2, 3, 4]' }
  },
  15: {
    name: "3Sum",
    description: "Sort array and use two pointers to find unique triplets summing to 0.",
    code: "class Solution {\n    public int threeSum(int[] nums) {\n        int n = nums.length;\n        int count = 0;\n        for (int i = 0; i < n - 2; i++) {\n            if (i > 0 && nums[i] == nums[i - 1]) continue;\n            int left = i + 1;\n            int right = n - 1;\n            while (left < right) {\n                int sum = nums[i] + nums[left] + nums[right];\n                if (sum == 0) {\n                    count++;\n                    while (left < right && nums[left] == nums[left + 1]) left++;\n                    while (left < right && nums[right] == nums[right - 1]) right--;\n                    left++;\n                    right--;\n                } else if (sum < 0) {\n                    left++;\n                } else {\n                    right--;\n                }\n            }\n        }\n        return count;\n    }\n}",
    inputs: {"nums":"[-4, -1, -1, 0, 1, 2]"}
  },
  19: {
    name: "Remove Nth Node From End of List",
    description: "One-pass two pointers (fast & slow) with a gap of n to remove nth node from end.",
    code: "class Solution {\n    public ListNode removeNthFromEnd() {\n        // Build: 1 -> 2 -> 3 -> 4 -> 5, n = 2\n        ListNode dummy = new ListNode(0);\n        ListNode n1 = new ListNode(1);\n        ListNode n2 = new ListNode(2);\n        ListNode n3 = new ListNode(3);\n        ListNode n4 = new ListNode(4);\n        ListNode n5 = new ListNode(5);\n        dummy.next = n1;\n        n1.next = n2;\n        n2.next = n3;\n        n3.next = n4;\n        n4.next = n5;\n        \n        int n = 2;\n        ListNode fast = dummy;\n        ListNode slow = dummy;\n        for (int i = 0; i <= n; i++) {\n            fast = fast.next;\n        }\n        while (fast != null) {\n            fast = fast.next;\n            slow = slow.next;\n        }\n        slow.next = slow.next.next;\n        return dummy.next;\n    }\n}",
    inputs: {}
  },
  39: {
    name: "Combination Sum",
    description: "Dynamic programming / unbounded knapsack: count combinations summing to target.",
    code: "class Solution {\n    public int combinationSum(int[] candidates, int target) {\n        int[] dp = new int[target + 1];\n        dp[0] = 1;\n        for (int i = 0; i < candidates.length; i++) {\n            int coin = candidates[i];\n            for (int j = coin; j <= target; j++) {\n                dp[j] += dp[j - coin];\n            }\n        }\n        return dp[target];\n    }\n}",
    inputs: {"candidates":"[2, 3, 6, 7]","target":"7"}
  },
  42: {
    name: "Trapping Rain Water",
    description: "Two pointers tracking leftMax and rightMax to compute trapped water in O(1) space.",
    code: "class Solution {\n    public int trap(int[] height) {\n        int left = 0;\n        int right = height.length - 1;\n        int leftMax = 0;\n        int rightMax = 0;\n        int trapped = 0;\n        while (left < right) {\n            if (height[left] < height[right]) {\n                if (height[left] >= leftMax) {\n                    leftMax = height[left];\n                } else {\n                    trapped += leftMax - height[left];\n                }\n                left++;\n            } else {\n                if (height[right] >= rightMax) {\n                    rightMax = height[right];\n                } else {\n                    trapped += rightMax - height[right];\n                }\n                right--;\n            }\n        }\n        return trapped;\n    }\n}",
    inputs: {"height":"[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]"}
  },
  46: {
    name: "Permutations",
    description: "In-place backtracking with swapping elements to generate all permutations.",
    code: "class Solution {\n    public int permute(int[] nums) {\n        return backtrack(0, nums);\n    }\n    int backtrack(int start, int[] nums) {\n        if (start == nums.length) {\n            return 1;\n        }\n        int total = 0;\n        for (int i = start; i < nums.length; i++) {\n            swap(nums, start, i);\n            total += backtrack(start + 1, nums);\n            swap(nums, start, i);\n        }\n        return total;\n    }\n    void swap(int[] nums, int i, int j) {\n        int temp = nums[i];\n        nums[i] = nums[j];\n        nums[j] = temp;\n    }\n}",
    inputs: {"nums":"[1, 2, 3]"}
  },
  76: {
    name: "Minimum Window Substring",
    description: "Sliding window tracking character need count and contracting left pointer.",
    code: "class Solution {\n    public String minWindow(String s, String t) {\n        if (s.length() < t.length()) return \"\";\n        int[] need = new int[128];\n        for (int i = 0; i < t.length(); i++) {\n            char ch = t.charAt(i);\n            need[ch]++;\n        }\n        int required = t.length();\n        int left = 0;\n        int minLen = s.length() + 1;\n        int startIdx = 0;\n        \n        for (int right = 0; right < s.length(); right++) {\n            char rch = s.charAt(right);\n            if (need[rch] > 0) {\n                required--;\n            }\n            need[rch]--;\n            \n            while (required == 0) {\n                int curLen = right - left + 1;\n                if (curLen < minLen) {\n                    minLen = curLen;\n                    startIdx = left;\n                }\n                char lch = s.charAt(left);\n                need[lch]++;\n                if (need[lch] > 0) {\n                    required++;\n                }\n                left++;\n            }\n        }\n        if (minLen > s.length()) return \"\";\n        return s.substring(startIdx, startIdx + minLen);\n    }\n}",
    inputs: {"s":"ADOBECODEBANC","t":"ABC"}
  },
  78: {
    name: "Subsets",
    description: "Power set generation: 2^n subsets computed via bit/decision enumeration.",
    code: "class Solution {\n    public int subsets(int[] nums) {\n        int n = nums.length;\n        int total = 1;\n        for (int i = 0; i < n; i++) {\n            total = total * 2;\n        }\n        return total;\n    }\n}",
    inputs: {"nums":"[1, 2, 3]"}
  },
  84: {
    name: "Largest Rectangle in Histogram",
    description: "Monotonic increasing stack to compute maximum rectangle under any histogram in O(n).",
    code: "class Solution {\n    public int largestRectangleArea(int[] heights) {\n        int n = heights.length;\n        int[] stack = new int[n + 1];\n        int top = -1;\n        int maxArea = 0;\n        \n        for (int i = 0; i <= n; i++) {\n            int h = (i == n) ? 0 : heights[i];\n            while (top >= 0 && heights[stack[top]] > h) {\n                int height = heights[stack[top]];\n                top--;\n                int width = (top < 0) ? i : (i - stack[top] - 1);\n                int area = height * width;\n                if (area > maxArea) {\n                    maxArea = area;\n                }\n            }\n            top++;\n            stack[top] = i;\n        }\n        return maxArea;\n    }\n}",
    inputs: {"heights":"[2, 1, 5, 6, 2, 3]"}
  },
  91: {
    name: "Decode Ways",
    description: "Dynamic programming tracking 1-digit and 2-digit branch decodings in O(1) space.",
    code: "class Solution {\n    public int numDecodings(String s) {\n        int n = s.length();\n        if (n == 0 || s.charAt(0) == '0') return 0;\n        int prev2 = 1;\n        int prev1 = 1;\n        for (int i = 1; i < n; i++) {\n            int curr = 0;\n            char c1 = s.charAt(i);\n            char c0 = s.charAt(i - 1);\n            if (c1 != '0') {\n                curr += prev1;\n            }\n            int twoDigit = (c0 - '0') * 10 + (c1 - '0');\n            if (twoDigit >= 10 && twoDigit <= 26) {\n                curr += prev2;\n            }\n            prev2 = prev1;\n            prev1 = curr;\n        }\n        return prev1;\n    }\n}",
    inputs: {"s":"226"}
  },
  98: {
    name: "Validate Binary Search Tree",
    description: "Recursive bounds checking: each node must satisfy minVal < val < maxVal.",
    code: "class Solution {\n    public boolean isValidBST() {\n        TreeNode root = new TreeNode(2);\n        root.left = new TreeNode(1);\n        root.right = new TreeNode(3);\n        return check(root, -1000000, 1000000);\n    }\n    boolean check(TreeNode node, int minVal, int maxVal) {\n        if (node == null) return true;\n        if (node.val <= minVal || node.val >= maxVal) return false;\n        return check(node.left, minVal, node.val) && check(node.right, node.val, maxVal);\n    }\n}",
    inputs: {}
  },
  102: {
    name: "Binary Tree Level Order Traversal",
    description: "Level-by-level tree traversal tracking depth level counts.",
    code: "class Solution {\n    public int levelOrder() {\n        TreeNode root = new TreeNode(3);\n        root.left = new TreeNode(9);\n        root.right = new TreeNode(20);\n        root.right.left = new TreeNode(15);\n        root.right.right = new TreeNode(7);\n        \n        int[] counts = new int[10];\n        traverse(root, 0, counts);\n        int levels = 0;\n        for (int i = 0; i < 10; i++) {\n            if (counts[i] > 0) levels++;\n        }\n        return levels;\n    }\n    void traverse(TreeNode node, int level, int[] counts) {\n        if (node == null) return;\n        counts[level]++;\n        traverse(node.left, level + 1, counts);\n        traverse(node.right, level + 1, counts);\n    }\n}",
    inputs: {}
  },
  139: {
    name: "Word Break",
    description: "1D DP: check if substring s[j..i] matches any word in dictionary.",
    code: "class Solution {\n    public boolean wordBreak(String s) {\n        String[] dict = {\"leet\", \"code\"};\n        int n = s.length();\n        boolean[] dp = new boolean[n + 1];\n        dp[0] = true;\n        \n        for (int i = 1; i <= n; i++) {\n            for (int d = 0; d < dict.length; d++) {\n                String word = dict[d];\n                int wLen = word.length();\n                if (i >= wLen && dp[i - wLen]) {\n                    if (s.substring(i - wLen, i).equals(word)) {\n                        dp[i] = true;\n                        break;\n                    }\n                }\n            }\n        }\n        return dp[n];\n    }\n}",
    inputs: {"s":"leetcode"}
  },
  141: {
    name: "Linked List Cycle",
    description: "Floyd's Tortoise and Hare: two pointers moving at 1x and 2x speed.",
    code: "class Solution {\n    public boolean hasCycle() {\n        ListNode head = new ListNode(3);\n        ListNode n2 = new ListNode(2);\n        ListNode n3 = new ListNode(0);\n        ListNode n4 = new ListNode(-4);\n        head.next = n2;\n        n2.next = n3;\n        n3.next = n4;\n        n4.next = n2;\n        \n        ListNode slow = head;\n        ListNode fast = head;\n        while (fast != null && fast.next != null) {\n            slow = slow.next;\n            fast = fast.next.next;\n            if (slow == fast) {\n                return true;\n            }\n        }\n        return false;\n    }\n}",
    inputs: {}
  },
  142: {
    name: "Linked List Cycle II",
    description: "Floyd's algorithm: meet inside cycle, then reset one pointer to head to find cycle entry.",
    code: "class Solution {\n    public int detectCycle() {\n        ListNode head = new ListNode(3);\n        ListNode n2 = new ListNode(2);\n        ListNode n3 = new ListNode(0);\n        ListNode n4 = new ListNode(-4);\n        head.next = n2;\n        n2.next = n3;\n        n3.next = n4;\n        n4.next = n2;\n        \n        ListNode slow = head;\n        ListNode fast = head;\n        boolean hasCycle = false;\n        while (fast != null && fast.next != null) {\n            slow = slow.next;\n            fast = fast.next.next;\n            if (slow == fast) {\n                hasCycle = true;\n                break;\n            }\n        }\n        if (!hasCycle) return -1;\n        ListNode entry = head;\n        while (entry != slow) {\n            entry = entry.next;\n            slow = slow.next;\n        }\n        return entry.val;\n    }\n}",
    inputs: {}
  },
  207: {
    name: "Course Schedule",
    description: "Kahn's algorithm: BFS topological sort using node in-degrees.",
    code: "class Solution {\n    public boolean canFinish(int numCourses) {\n        int[] inDegree = new int[numCourses];\n        inDegree[1]++;\n        \n        int[] queue = new int[numCourses];\n        int head = 0;\n        int tail = 0;\n        for (int i = 0; i < numCourses; i++) {\n            if (inDegree[i] == 0) {\n                queue[tail++] = i;\n            }\n        }\n        int count = 0;\n        while (head < tail) {\n            int node = queue[head++];\n            count++;\n            if (node == 0) {\n                inDegree[1]--;\n                if (inDegree[1] == 0) {\n                    queue[tail++] = 1;\n                }\n            }\n        }\n        return count == numCourses;\n    }\n}",
    inputs: {"numCourses":"2"}
  },
  209: {
    name: "Minimum Size Subarray Sum",
    description: "Sliding window: expand right until sum >= target, then shrink left to find minimal length.",
    code: "class Solution {\n    public int minSubArrayLen(int target, int[] nums) {\n        int n = nums.length;\n        int left = 0;\n        int sum = 0;\n        int minLen = n + 1;\n        \n        for (int right = 0; right < n; right++) {\n            sum += nums[right];\n            while (sum >= target) {\n                int curLen = right - left + 1;\n                if (curLen < minLen) {\n                    minLen = curLen;\n                }\n                sum -= nums[left];\n                left++;\n            }\n        }\n        return (minLen > n) ? 0 : minLen;\n    }\n}",
    inputs: {"target":"7","nums":"[2, 3, 1, 2, 4, 3]"}
  },
  235: {
    name: "Lowest Common Ancestor of a BST",
    description: "Iterative BST traversal: split when p and q diverge across current node.",
    code: "class Solution {\n    public int lowestCommonAncestor() {\n        TreeNode root = new TreeNode(6);\n        root.left = new TreeNode(2);\n        root.right = new TreeNode(8);\n        root.left.left = new TreeNode(0);\n        root.left.right = new TreeNode(4);\n        root.right.left = new TreeNode(7);\n        root.right.right = new TreeNode(9);\n        \n        int p = 2;\n        int q = 8;\n        TreeNode curr = root;\n        while (curr != null) {\n            if (p < curr.val && q < curr.val) {\n                curr = curr.left;\n            } else if (p > curr.val && q > curr.val) {\n                curr = curr.right;\n            } else {\n                return curr.val;\n            }\n        }\n        return -1;\n    }\n}",
    inputs: {}
  },
  242: {
    name: "Valid Anagram",
    description: "Frequency count: count character frequencies using a fixed 26-size array.",
    code: "class Solution {\n    public boolean isAnagram(String s, String t) {\n        if (s.length() != t.length()) return false;\n        int[] count = new int[26];\n        for (int i = 0; i < s.length(); i++) {\n            char sc = s.charAt(i);\n            char tc = t.charAt(i);\n            count[sc - 'a']++;\n            count[tc - 'a']--;\n        }\n        for (int i = 0; i < 26; i++) {\n            if (count[i] != 0) return false;\n        }\n        return true;\n    }\n}",
    inputs: {"s":"anagram","t":"nagaram"}
  },
  416: {
    name: "Partition Equal Subset Sum",
    description: "0/1 Knapsack 1D DP: can a subset sum to total / 2?",
    code: "class Solution {\n    public boolean canPartition(int[] nums) {\n        int sum = 0;\n        for (int i = 0; i < nums.length; i++) sum += nums[i];\n        if (sum % 2 != 0) return false;\n        int target = sum / 2;\n        \n        boolean[] dp = new boolean[target + 1];\n        dp[0] = true;\n        for (int i = 0; i < nums.length; i++) {\n            int num = nums[i];\n            for (int j = target; j >= num; j--) {\n                if (dp[j - num]) {\n                    dp[j] = true;\n                }\n            }\n        }\n        return dp[target];\n    }\n}",
    inputs: {"nums":"[1, 5, 11, 5]"}
  },
  547: {
    name: "Number of Provinces",
    description: "Connected components via DFS exploration on adjacency matrix.",
    code: "class Solution {\n    public int findCircleNum() {\n        int n = 3;\n        int[][] isConnected = {\n            {1, 1, 0},\n            {1, 1, 0},\n            {0, 0, 1}\n        };\n        boolean[] visited = new boolean[n];\n        int provinces = 0;\n        \n        for (int i = 0; i < n; i++) {\n            if (!visited[i]) {\n                provinces++;\n                dfs(isConnected, visited, i, n);\n            }\n        }\n        return provinces;\n    }\n    void dfs(int[][] graph, boolean[] visited, int node, int n) {\n        visited[node] = true;\n        for (int j = 0; j < n; j++) {\n            if (graph[node][j] == 1 && !visited[j]) {\n                dfs(graph, visited, j, n);\n            }\n        }\n    }\n}",
    inputs: {}
  },
  1143: {
    name: "Longest Common Subsequence",
    description: "2D DP grid: if chars match dp[i-1][j-1]+1, else max(dp[i-1][j], dp[i][j-1]).",
    code: "class Solution {\n    public int longestCommonSubsequence(String text1, String text2) {\n        int m = text1.length();\n        int n = text2.length();\n        int[][] dp = new int[m + 1][n + 1];\n        \n        for (int i = 1; i <= m; i++) {\n            char c1 = text1.charAt(i - 1);\n            for (int j = 1; j <= n; j++) {\n                char c2 = text2.charAt(j - 1);\n                if (c1 == c2) {\n                    dp[i][j] = dp[i - 1][j - 1] + 1;\n                } else {\n                    int top = dp[i - 1][j];\n                    int left = dp[i][j - 1];\n                    dp[i][j] = (top > left) ? top : left;\n                }\n            }\n        }\n        return dp[m][n];\n    }\n}",
    inputs: {"text1":"abcde","text2":"ace"}
  },
};

/**
 * Returns either a full preset solution or generates an intelligent
 * runnable Java Solution starter template for the given problem.
 */
export function getProblemTemplate(problemOrName, maybeDifficulty = 'Medium') {
  // Support both getProblemTemplate(problemObject) AND getProblemTemplate(name, difficulty)
  const p = typeof problemOrName === 'string'
    ? { name: problemOrName, difficulty: maybeDifficulty }
    : (problemOrName || {});

  const id = p.id ?? '';
  const rawName = p.name || p.title || 'Solve Problem';
  const difficulty = (p.difficulty || 'Medium').toString().toUpperCase();
  const topic = (p.topic || (Array.isArray(p.topics) ? p.topics[0] : '') || 'General').toString();
  const url = p.url || (id ? `https://leetcode.com/problems/` : '');

  if (id && PRESET_SOLUTIONS[id]) {
    const preset = PRESET_SOLUTIONS[id];
    return {
      code: preset.code,
      inputs: preset.inputs,
      isPreset: true,
      description: preset.description
    };
  }

  // Derive method name from problem title (camelCase)
  const cleanName = rawName.replace(/[^a-zA-Z0-9 ]/g, '').trim();
  const words = cleanName.split(/\s+/).filter(Boolean);
  let methodName = words.length === 0 ? 'solve' :
    words[0].toLowerCase() + words.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');

  // Sanitize Java method names starting with digits
  if (/^[0-9]/.test(methodName)) {
    if (methodName.startsWith('3sumClosest')) methodName = 'threeSumClosest';
    else if (methodName.startsWith('3sum')) methodName = 'threeSum';
    else if (methodName.startsWith('4sum')) methodName = 'fourSum';
    else methodName = 'solve' + methodName;
  }

  // Tailor template based on topic
  let code = '';
  let inputs = {};

  const idHeader = id ? `LeetCode #${id}` : 'Problem Solution';

  if (topic.includes('String')) {
    code = `// ${idHeader}: ${rawName} (${difficulty})
// Topic: ${topic}
// URL: ${url}

class Solution {
    public int ${methodName}(String s) {
        int n = s.length();
        int count = 0;
        
        for (int i = 0; i < n; i++) {
            char c = s.charAt(i);
            // Process character step-by-step
            count++;
        }
        
        return count;
    }
}`;
    inputs = { s: 'leetcode' };
  } else if (topic.includes('Matrix')) {
    code = `// ${idHeader}: ${rawName} (${difficulty})
// Topic: ${topic}
// URL: ${url}

class Solution {
    public int ${methodName}(int[][] matrix) {
        int rows = matrix.length;
        int cols = matrix[0].length;
        int sum = 0;
        
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                sum += matrix[r][c];
            }
        }
        
        return sum;
    }
}`;
    inputs = { matrix: '[[1,2,3],[4,5,6],[7,8,9]]' };
  } else if (topic.includes('Binary Search')) {
    code = `// ${idHeader}: ${rawName} (${difficulty})
// Topic: ${topic}
// URL: ${url}

class Solution {
    public int ${methodName}(int[] nums, int target) {
        int left = 0;
        int right = nums.length - 1;
        
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) {
                return mid;
            }
            if (nums[mid] < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        
        return -1;
    }
}`;
    inputs = { nums: '[1, 3, 5, 8, 12, 17]', target: '8' };
  } else if (topic.includes('Two Pointers') || topic.includes('Sliding Window')) {
    code = `// ${idHeader}: ${rawName} (${difficulty})
// Topic: ${topic}
// URL: ${url}

class Solution {
    public int ${methodName}(int[] nums) {
        int left = 0;
        int maxLen = 0;
        
        for (int right = 0; right < nums.length; right++) {
            // Expand sliding window
            int windowSize = right - left + 1;
            if (windowSize > maxLen) {
                maxLen = windowSize;
            }
        }
        
        return maxLen;
    }
}`;
    inputs = { nums: '[2, 1, 5, 1, 3, 2]' };
  } else if (topic.includes('Dynamic Programming') || topic.includes('Recursion')) {
    code = `// ${idHeader}: ${rawName} (${difficulty})
// Topic: ${topic}
// URL: ${url}

class Solution {
    public int ${methodName}(int n) {
        if (n <= 1) return n;
        
        int[] dp = new int[n + 1];
        dp[0] = 0;
        dp[1] = 1;
        
        for (int i = 2; i <= n; i++) {
            dp[i] = dp[i - 1] + dp[i - 2];
        }
        
        return dp[n];
    }
}`;
    inputs = { n: '6' };
  } else {
    code = `// ${idHeader}: ${rawName} (${difficulty})
// Topic: ${topic}
// URL: ${url}

class Solution {
    public int ${methodName}(int[] nums) {
        int n = nums.length;
        int result = 0;
        
        for (int i = 0; i < n; i++) {
            // Step-by-step logic: inspect variables and arrays live
            result += nums[i];
        }
        
        return result;
    }
}`;
    inputs = { nums: '[1, 2, 3, 4, 5]' };
  }

  return {
    code,
    inputs,
    isPreset: false,
    description: id ? `LeetCode #${id} starter template for ${rawName}` : `Starter template for ${rawName}`
  };
}
