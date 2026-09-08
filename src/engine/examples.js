
export const EXAMPLES = [
  {
    id: 'two-sum',
    name: 'Two Sum',
    difficulty: 'easy',
    pattern: 'Two Pointers',
    topic: 'Array',
    description: 'Find two numbers that add up to target in a sorted array.',
    code: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        int i = 0;
        int j = nums.length - 1;
        while (i < j) {
            int sum = nums[i] + nums[j];
            if (sum == target) {
                return new int[]{i, j};
            }
            if (sum < target) {
                i++;
            } else {
                j--;
            }
        }
        return new int[]{-1, -1};
    }
}`,
    inputs: { nums: '[2,7,11,15]', target: '9' },
    expectedOutput: '[0, 1]',
  },
  {
    id: 'binary-search',
    name: 'Binary Search',
    difficulty: 'easy',
    pattern: 'Binary Search',
    topic: 'Array',
    description: 'Search for target in sorted array using binary search.',
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
    inputs: { nums: '[1,2,3,4,5,6,7]', target: '5' },
    expectedOutput: '4',
  },
  {
    id: 'running-sum',
    name: 'Running Sum of 1d Array',
    difficulty: 'easy',
    pattern: 'Prefix Sum',
    topic: 'Array',
    description: 'Return running sum where runningSum[i] = sum(nums[0]..nums[i]).',
    code: `class Solution {
    public int[] runningSum(int[] nums) {
        for (int i = 1; i < nums.length; i++) {
            nums[i] = nums[i] + nums[i - 1];
        }
        return nums;
    }
}`,
    inputs: { nums: '[1,2,3,4]' },
    expectedOutput: '[1, 3, 6, 10]',
  },
  {
    id: 'move-zeroes',
    name: 'Move Zeroes',
    difficulty: 'easy',
    pattern: 'Two Pointers',
    topic: 'Array',
    description: 'Move all zeroes to end while maintaining relative order.',
    code: `class Solution {
    public void moveZeroes(int[] nums) {
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
    }
}`,
    inputs: { nums: '[0,1,0,3,12]' },
    expectedOutput: '[1, 3, 12, 0, 0]',
  },
  {
    id: 'best-time-stock',
    name: 'Best Time to Buy and Sell Stock',
    difficulty: 'easy',
    pattern: 'Greedy',
    topic: 'Array',
    description: 'Find the maximum profit from one buy-sell transaction.',
    code: `class Solution {
    public int maxProfit(int[] prices) {
        int minPrice = Integer.MAX_VALUE;
        int maxProfit = 0;
        for (int i = 0; i < prices.length; i++) {
            if (prices[i] < minPrice) {
                minPrice = prices[i];
            } else if (prices[i] - minPrice > maxProfit) {
                maxProfit = prices[i] - minPrice;
            }
        }
        return maxProfit;
    }
}`,
    inputs: { prices: '[7,1,5,3,6,4]' },
    expectedOutput: '5',
  },
  {
    id: 'bubble-sort',
    name: 'Bubble Sort',
    difficulty: 'easy',
    pattern: 'Sorting',
    topic: 'Array',
    description: 'Sort array in-place using bubble sort.',
    code: `class Solution {
    public int[] bubbleSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }
        return arr;
    }
}`,
    inputs: { arr: '[64,34,25,12,22,11,90]' },
    expectedOutput: '[11, 12, 22, 25, 34, 64, 90]',
  },
  {
    id: 'reverse-array',
    name: 'Reverse Array',
    difficulty: 'easy',
    pattern: 'Two Pointers',
    topic: 'Array',
    description: 'Reverse the array in-place.',
    code: `class Solution {
    public int[] reverseArray(int[] nums) {
        int left = 0;
        int right = nums.length - 1;
        while (left < right) {
            int temp = nums[left];
            nums[left] = nums[right];
            nums[right] = temp;
            left++;
            right--;
        }
        return nums;
    }
}`,
    inputs: { nums: '[1,2,3,4,5]' },
    expectedOutput: '[5, 4, 3, 2, 1]',
  },
  {
    id: 'fibonacci',
    name: 'Fibonacci (Recursive)',
    difficulty: 'easy',
    pattern: 'Recursion',
    topic: 'Recursion',
    description: 'Compute nth Fibonacci number recursively.',
    code: `class Solution {
    public int fib(int n) {
        if (n <= 1) {
            return n;
        }
        return fib(n - 1) + fib(n - 2);
    }
}`,
    inputs: { n: '6' },
    expectedOutput: '8',
  },
];

export const COMPANY_PROBLEMS = {
  google: ['two-sum','binary-search','move-zeroes','best-time-stock','fibonacci'],
  amazon: ['running-sum','move-zeroes','best-time-stock','two-sum','bubble-sort'],
  microsoft: ['binary-search','reverse-array','running-sum','fibonacci','two-sum'],
  meta: ['two-sum','move-zeroes','reverse-array','best-time-stock','binary-search'],
  apple: ['running-sum','bubble-sort','binary-search','fibonacci','move-zeroes'],
};
