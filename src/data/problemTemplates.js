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
  }
};

/**
 * Returns either a full preset solution or generates an intelligent
 * runnable Java Solution starter template for the given problem.
 */
export function getProblemTemplate(problem) {
  if (PRESET_SOLUTIONS[problem.id]) {
    const p = PRESET_SOLUTIONS[problem.id];
    return {
      code: p.code,
      inputs: p.inputs,
      isPreset: true,
      description: p.description
    };
  }

  // Derive method name from problem title (camelCase)
  const cleanName = problem.name.replace(/[^a-zA-Z0-9 ]/g, '').trim();
  const words = cleanName.split(/\s+/);
  const methodName = words.length === 0 ? 'solve' :
    words[0].toLowerCase() + words.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');

  const topic = problem.topic || 'General';

  // Tailor template based on topic
  let code = '';
  let inputs = {};

  if (topic.includes('String')) {
    code = `// LeetCode #${problem.id}: ${problem.name} (${problem.difficulty.toUpperCase()})
// Topic: ${topic}
// URL: ${problem.url}

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
    code = `// LeetCode #${problem.id}: ${problem.name} (${problem.difficulty.toUpperCase()})
// Topic: ${topic}
// URL: ${problem.url}

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
    code = `// LeetCode #${problem.id}: ${problem.name} (${problem.difficulty.toUpperCase()})
// Topic: ${topic}
// URL: ${problem.url}

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
    code = `// LeetCode #${problem.id}: ${problem.name} (${problem.difficulty.toUpperCase()})
// Topic: ${topic}
// URL: ${problem.url}

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
    code = `// LeetCode #${problem.id}: ${problem.name} (${problem.difficulty.toUpperCase()})
// Topic: ${topic}
// URL: ${problem.url}

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
    code = `// LeetCode #${problem.id}: ${problem.name} (${problem.difficulty.toUpperCase()})
// Topic: ${topic}
// URL: ${problem.url}

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
    description: `LeetCode #${problem.id} starter template for ${problem.name}`
  };
}
