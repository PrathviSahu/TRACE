// ─────────────────────────────────────────────────────────────
//  TRACE — Multi-Language Presets & Code Definitions
//  Supports Python, Java, C++, and JavaScript
// ─────────────────────────────────────────────────────────────

export const MULTI_LANG_EXAMPLES = {
  'two-sum': {
    id: 'two-sum',
    name: 'Two Sum',
    category: 'Arrays',
    difficulty: 'easy',
    pattern: 'Hash Map / Two Pointers',
    python: `# Two Sum - LeetCode 1
class Solution:
    def twoSum(self, nums, target):
        map = {}
        for i in range(len(nums)):
            complement = target - nums[i]
            if complement in map:
                return [map[complement], i]
            map[nums[i]] = i
        return []

# Test
sol = Solution()
print(sol.twoSum([2, 7, 11, 15], 9))`,
    java: `// Two Sum - LeetCode 1
class Solution {
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
    inputs: {
      pythonText: "nums = [2, 7, 11, 15]\ntarget = 9",
      javaInputs: { nums: '[2, 7, 11, 15]', target: '9' }
    },
    defaultInputDisplay: "nums = [2, 7, 11, 15]\ntarget = 9"
  },

  'running-sum': {
    id: 'running-sum',
    name: 'Running Sum',
    category: 'Arrays',
    difficulty: 'easy',
    pattern: 'Prefix Sum',
    python: `# Running Sum of 1d Array - LeetCode 1480
class Solution:
    def runningSum(self, nums):
        for i in range(1, len(nums)):
            nums[i] += nums[i - 1]
        return nums

# Test
sol = Solution()
print(sol.runningSum([1, 2, 3, 4]))`,
    java: `class Solution {
    public int[] runningSum(int[] nums) {
        for (int i = 1; i < nums.length; i++) {
            nums[i] = nums[i] + nums[i - 1];
        }
        return nums;
    }
}`,
    inputs: {
      pythonText: "nums = [1, 2, 3, 4]",
      javaInputs: { nums: '[1, 2, 3, 4]' }
    },
    defaultInputDisplay: "nums = [1, 2, 3, 4]"
  },

  'maximum-subarray': {
    id: 'maximum-subarray',
    name: 'Maximum Subarray',
    category: 'Arrays',
    difficulty: 'medium',
    pattern: "Kadane's Algorithm",
    python: `# Maximum Subarray - LeetCode 53
class Solution:
    def maxSubArray(self, nums):
        max_so_far = nums[0]
        curr_max = nums[0]
        for i in range(1, len(nums)):
            curr_max = max(nums[i], curr_max + nums[i])
            max_so_far = max(max_so_far, curr_max)
        return max_so_far

# Test
sol = Solution()
print(sol.maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4]))`,
    java: `class Solution {
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
    inputs: {
      pythonText: "nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]",
      javaInputs: { nums: '[-2, 1, -3, 4, -1, 2, 1, -5, 4]' }
    },
    defaultInputDisplay: "nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]"
  }
};
