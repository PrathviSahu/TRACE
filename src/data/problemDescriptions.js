// ─────────────────────────────────────────────────────────────
//  TRACE — LeetCode Question Descriptions
//  Full problem statements, examples, constraints, hints
// ─────────────────────────────────────────────────────────────

export const PROBLEM_DESCRIPTIONS = {

  1: {
    title: "Two Sum",
    difficulty: "easy",
    category: "Arrays / Hash Map",
    acceptance: "49.1%",
    description: `Given an array of integers <code>nums</code> and an integer <code>target</code>, return <em>indices of the two numbers such that they add up to <code>target</code></em>.<br/><br/>You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the same element twice.<br/><br/>You can return the answer in any order.`,
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]", explanation: "" },
      { input: "nums = [3,3], target = 6", output: "[0,1]", explanation: "" }
    ],
    constraints: ["2 ≤ nums.length ≤ 10⁴", "-10⁹ ≤ nums[i] ≤ 10⁹", "-10⁹ ≤ target ≤ 10⁹", "Only one valid answer exists."],
    hints: ["A brute force approach is O(n²). Can you do better?", "Try using a hash map to store the complement of each number.", "For each number x, check if target - x already exists in the map."],
    complexity: { time: "O(n)", space: "O(n)" },
    topics: ["Array", "Hash Table"],
    companies: ["Google", "Amazon", "Microsoft", "Apple", "Adobe"]
  },

  26: {
    title: "Remove Duplicates from Sorted Array",
    difficulty: "easy",
    category: "Two Pointers",
    acceptance: "51.7%",
    description: `Given an integer array <code>nums</code> sorted in <strong>non-decreasing order</strong>, remove the duplicates <strong>in-place</strong> such that each unique element appears only once. The <strong>relative order</strong> of the elements should be kept the same. Then return <em>the number of unique elements in <code>nums</code></em>.`,
    examples: [
      { input: "nums = [1,1,2]", output: "2, nums = [1,2,_]", explanation: "Your function should return k = 2, with the first two elements being 1 and 2." },
      { input: "nums = [0,0,1,1,1,2,2,3,3,4]", output: "5, nums = [0,1,2,3,4,_,_,_,_,_]", explanation: "Your function should return k = 5." }
    ],
    constraints: ["1 ≤ nums.length ≤ 3 × 10⁴", "-100 ≤ nums[i] ≤ 100", "nums is sorted in non-decreasing order."],
    hints: ["Use two pointers: a slow pointer i and fast pointer j.", "When nums[i] != nums[j], increment i and set nums[i] = nums[j]."],
    complexity: { time: "O(n)", space: "O(1)" },
    topics: ["Array", "Two Pointers"],
    companies: ["Facebook", "Microsoft", "Bloomberg"]
  },

  53: {
    title: "Maximum Subarray",
    difficulty: "medium",
    category: "Dynamic Programming / Divide & Conquer",
    acceptance: "49.8%",
    description: `Given an integer array <code>nums</code>, find the subarray with the largest sum, and return <em>its sum</em>.`,
    examples: [
      { input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6", explanation: "The subarray [4,-1,2,1] has the largest sum 6." },
      { input: "nums = [1]", output: "1", explanation: "" },
      { input: "nums = [5,4,-1,7,8]", output: "23", explanation: "" }
    ],
    constraints: ["1 ≤ nums.length ≤ 10⁵", "-10⁴ ≤ nums[i] ≤ 10⁴"],
    hints: ["Try Kadane's Algorithm.", "currentSum = max(nums[i], currentSum + nums[i])"],
    complexity: { time: "O(n)", space: "O(1)" },
    topics: ["Array", "Dynamic Programming", "Divide and Conquer"],
    companies: ["Amazon", "Microsoft", "LinkedIn", "Google"]
  },

  121: {
    title: "Best Time to Buy and Sell Stock",
    difficulty: "easy",
    category: "Arrays / Greedy",
    acceptance: "54.2%",
    description: `You are given an array <code>prices</code> where <code>prices[i]</code> is the price of a given stock on the <code>i-th</code> day. You want to maximize your profit by choosing a <strong>single day</strong> to buy one stock and choosing a <strong>different day in the future</strong> to sell that stock. Return <em>the maximum profit you can achieve</em>. If you cannot achieve any profit, return <code>0</code>.`,
    examples: [
      { input: "prices = [7,1,5,3,6,4]", output: "5", explanation: "Buy on day 2 (price=1) and sell on day 5 (price=6). Profit = 5." },
      { input: "prices = [7,6,4,3,1]", output: "0", explanation: "No transactions are done. Max profit = 0." }
    ],
    constraints: ["1 ≤ prices.length ≤ 10⁵", "0 ≤ prices[i] ≤ 10⁴"],
    hints: ["Track the minimum price seen so far.", "At each day, max profit = prices[i] - minPrice.", "Keep updating the global max profit."],
    complexity: { time: "O(n)", space: "O(1)" },
    topics: ["Array", "Dynamic Programming"],
    companies: ["Amazon", "Facebook", "Goldman Sachs", "Microsoft"]
  },

  217: {
    title: "Contains Duplicate",
    difficulty: "easy",
    category: "Arrays / Hash Set",
    acceptance: "61.3%",
    description: `Given an integer array <code>nums</code>, return <code>true</code> if any value appears <strong>at least twice</strong> in the array, and return <code>false</code> if every element is distinct.`,
    examples: [
      { input: "nums = [1,2,3,1]", output: "true", explanation: "The element 1 occurs at indices 0 and 3." },
      { input: "nums = [1,2,3,4]", output: "false", explanation: "All elements are distinct." },
      { input: "nums = [1,1,1,3,3,4,3,2,4,2]", output: "true", explanation: "" }
    ],
    constraints: ["1 ≤ nums.length ≤ 10⁵", "-10⁹ ≤ nums[i] ≤ 10⁹"],
    hints: ["Use a HashSet to track visited elements.", "If the current element is already in the set, return true."],
    complexity: { time: "O(n)", space: "O(n)" },
    topics: ["Array", "Hash Table", "Sorting"],
    companies: ["Palantir", "Yahoo", "Apple"]
  },

  238: {
    title: "Product of Array Except Self",
    difficulty: "medium",
    category: "Arrays / Prefix Product",
    acceptance: "65.2%",
    description: `Given an integer array <code>nums</code>, return <em>an array</em> <code>answer</code> such that <code>answer[i]</code> is equal to the product of all elements of <code>nums</code> except <code>nums[i]</code>. You must write an algorithm that runs in <code>O(n)</code> time and <strong>without using the division operation</strong>.`,
    examples: [
      { input: "nums = [1,2,3,4]", output: "[24,12,8,6]", explanation: "" },
      { input: "nums = [-1,1,0,-3,3]", output: "[0,0,9,0,0]", explanation: "" }
    ],
    constraints: ["2 ≤ nums.length ≤ 10⁵", "-30 ≤ nums[i] ≤ 30"],
    hints: ["Think about prefix products and suffix products.", "For each index i, answer[i] = prefix[i-1] * suffix[i+1]."],
    complexity: { time: "O(n)", space: "O(1)" },
    topics: ["Array", "Prefix Sum"],
    companies: ["Amazon", "Apple", "Facebook", "Microsoft", "Lyft"]
  },

  3: {
    title: "Longest Substring Without Repeating Characters",
    difficulty: "medium",
    category: "Sliding Window / Hash Map",
    acceptance: "33.8%",
    description: `Given a string <code>s</code>, find the length of the <strong>longest substring</strong> without repeating characters.`,
    examples: [
      { input: 's = "abcabcbb"', output: "3", explanation: 'The answer is "abc", with length 3.' },
      { input: 's = "bbbbb"', output: "1", explanation: 'The answer is "b", with length 1.' },
      { input: 's = "pwwkew"', output: "3", explanation: 'The answer is "wke", with length 3.' }
    ],
    constraints: ["0 ≤ s.length ≤ 5 × 10⁴", "s consists of English letters, digits, symbols and spaces."],
    hints: ["Use the sliding window technique with two pointers.", "Maintain a set/map of characters in the current window.", "When a duplicate is found, shrink the window from the left."],
    complexity: { time: "O(n)", space: "O(min(m,n))" },
    topics: ["Hash Table", "String", "Sliding Window"],
    companies: ["Amazon", "Bloomberg", "Adobe", "Google", "Uber"]
  },

  242: {
    title: "Valid Anagram",
    difficulty: "easy",
    category: "Strings / Hash Map",
    acceptance: "63.1%",
    description: `Given two strings <code>s</code> and <code>t</code>, return <code>true</code> if <code>t</code> is an anagram of <code>s</code>, and <code>false</code> otherwise. An <strong>Anagram</strong> is a word formed by rearranging the letters of another word, using all original letters exactly once.`,
    examples: [
      { input: 's = "anagram", t = "nagaram"', output: "true", explanation: "" },
      { input: 's = "rat", t = "car"', output: "false", explanation: "" }
    ],
    constraints: ["1 ≤ s.length, t.length ≤ 5 × 10⁴", "s and t consist of lowercase English letters."],
    hints: ["If lengths differ, they can't be anagrams.", "Count character frequencies. Increment for s, decrement for t, then check all counts are 0."],
    complexity: { time: "O(n)", space: "O(1)" },
    topics: ["Hash Table", "String", "Sorting"],
    companies: ["Amazon", "Bloomberg", "Apple"]
  },

  125: {
    title: "Valid Palindrome",
    difficulty: "easy",
    category: "Strings / Two Pointers",
    acceptance: "45.3%",
    description: `A phrase is a <strong>palindrome</strong> if, after converting all uppercase letters to lowercase and removing all non-alphanumeric characters, it reads the same forward and backward. Given a string <code>s</code>, return <code>true</code> if it is a palindrome, or <code>false</code> otherwise.`,
    examples: [
      { input: 's = "A man, a plan, a canal: Panama"', output: "true", explanation: '"amanaplanacanalpanama" is a palindrome.' },
      { input: 's = "race a car"', output: "false", explanation: '"raceacar" is not a palindrome.' },
      { input: 's = " "', output: "true", explanation: "Empty string after filtering is a palindrome." }
    ],
    constraints: ["1 ≤ s.length ≤ 2 × 10⁵", "s consists only of printable ASCII characters."],
    hints: ["Use two pointers starting from both ends.", "Skip non-alphanumeric characters.", "Compare lowercase versions of valid chars."],
    complexity: { time: "O(n)", space: "O(1)" },
    topics: ["Two Pointers", "String"],
    companies: ["Facebook", "Microsoft", "Apple", "Uber"]
  },

  11: {
    title: "Container With Most Water",
    difficulty: "medium",
    category: "Two Pointers / Greedy",
    acceptance: "54.2%",
    description: `You are given an integer array <code>height</code> of length <code>n</code>. There are <code>n</code> vertical lines drawn such that the two endpoints of the <code>i-th</code> line are <code>(i, 0)</code> and <code>(i, height[i])</code>. Find two lines that together with the x-axis form a container with the most water. Return <em>the maximum amount of water a container can store</em>.`,
    examples: [
      { input: "height = [1,8,6,2,5,4,8,3,7]", output: "49", explanation: "max area = min(8,7) × 7 = 49." },
      { input: "height = [1,1]", output: "1", explanation: "" }
    ],
    constraints: ["n == height.length", "2 ≤ n ≤ 10⁵", "0 ≤ height[i] ≤ 10⁴"],
    hints: ["Use two pointers: left = 0, right = n-1.", "Area = min(height[left], height[right]) * (right - left).", "Move the pointer pointing to the shorter line inward."],
    complexity: { time: "O(n)", space: "O(1)" },
    topics: ["Array", "Two Pointers", "Greedy"],
    companies: ["Amazon", "Goldman Sachs", "Bloomberg", "Facebook", "Adobe"]
  },

  15: {
    title: "3Sum",
    difficulty: "medium",
    category: "Two Pointers / Sorting",
    acceptance: "32.5%",
    description: `Given an integer array <code>nums</code>, return all the triplets <code>[nums[i], nums[j], nums[k]]</code> such that <code>i != j != k</code> and <code>nums[i] + nums[j] + nums[k] == 0</code>. The solution set must not contain duplicate triplets.`,
    examples: [
      { input: "nums = [-1,0,1,2,-1,-4]", output: "[[-1,-1,2],[-1,0,1]]", explanation: "" },
      { input: "nums = [0,1,1]", output: "[]", explanation: "No triplet sums to 0." },
      { input: "nums = [0,0,0]", output: "[[0,0,0]]", explanation: "" }
    ],
    constraints: ["3 ≤ nums.length ≤ 3000", "-10⁵ ≤ nums[i] ≤ 10⁵"],
    hints: ["Sort the array first.", "Fix one element and use two pointers for the remaining two.", "Skip duplicates carefully at each step."],
    complexity: { time: "O(n²)", space: "O(n) for sorting" },
    topics: ["Array", "Two Pointers", "Sorting"],
    companies: ["Amazon", "Facebook", "Microsoft", "Adobe", "Google"]
  },

  704: {
    title: "Binary Search",
    difficulty: "easy",
    category: "Binary Search",
    acceptance: "56.4%",
    description: `Given an array of integers <code>nums</code> sorted in ascending order, and an integer <code>target</code>, write a function to search <code>target</code> in <code>nums</code>. If <code>target</code> exists, return its index. Otherwise, return <code>-1</code>. You must write an algorithm with <code>O(log n)</code> runtime complexity.`,
    examples: [
      { input: "nums = [-1,0,3,5,9,12], target = 9", output: "4", explanation: "9 exists in nums at index 4." },
      { input: "nums = [-1,0,3,5,9,12], target = 2", output: "-1", explanation: "2 does not exist in nums." }
    ],
    constraints: ["1 ≤ nums.length ≤ 10⁴", "-10⁴ < nums[i], target < 10⁴", "All integers in nums are unique.", "nums is sorted in ascending order."],
    hints: ["Use left and right pointers.", "mid = left + (right - left) / 2 (avoids overflow).", "If nums[mid] < target, search right half; else search left half."],
    complexity: { time: "O(log n)", space: "O(1)" },
    topics: ["Array", "Binary Search"],
    companies: ["Facebook", "Amazon", "Apple"]
  },

  206: {
    title: "Reverse Linked List",
    difficulty: "easy",
    category: "Linked List",
    acceptance: "74.6%",
    description: `Given the <code>head</code> of a singly linked list, reverse the list, and return <em>the reversed list</em>.`,
    examples: [
      { input: "head = [1,2,3,4,5]", output: "[5,4,3,2,1]", explanation: "" },
      { input: "head = [1,2]", output: "[2,1]", explanation: "" },
      { input: "head = []", output: "[]", explanation: "" }
    ],
    constraints: ["The number of nodes is in the range [0, 5000].", "-5000 ≤ Node.val ≤ 5000"],
    hints: ["Use prev = null, curr = head.", "Save next = curr.next, then curr.next = prev.", "Move prev and curr one step forward."],
    complexity: { time: "O(n)", space: "O(1)" },
    topics: ["Linked List", "Recursion"],
    companies: ["Amazon", "Facebook", "Apple", "Microsoft", "Adobe"]
  },

  21: {
    title: "Merge Two Sorted Lists",
    difficulty: "easy",
    category: "Linked List",
    acceptance: "63.1%",
    description: `You are given the heads of two sorted linked lists <code>list1</code> and <code>list2</code>. Merge the two lists into one <strong>sorted</strong> list. Return <em>the head of the merged linked list</em>.`,
    examples: [
      { input: "list1 = [1,2,4], list2 = [1,3,4]", output: "[1,1,2,3,4,4]", explanation: "" },
      { input: "list1 = [], list2 = []", output: "[]", explanation: "" },
      { input: "list1 = [], list2 = [0]", output: "[0]", explanation: "" }
    ],
    constraints: ["The number of nodes in both lists is in the range [0, 50].", "-100 ≤ Node.val ≤ 100"],
    hints: ["Use a dummy head node to simplify edge cases.", "Compare values from both lists, attach the smaller one.", "When one list is exhausted, attach the rest of the other."],
    complexity: { time: "O(m + n)", space: "O(1)" },
    topics: ["Linked List", "Recursion"],
    companies: ["Amazon", "Microsoft", "Apple", "LinkedIn"]
  },

  20: {
    title: "Valid Parentheses",
    difficulty: "easy",
    category: "Stack",
    acceptance: "40.8%",
    description: `Given a string <code>s</code> containing just the characters <code>'('</code>, <code>')'</code>, <code>'{'</code>, <code>'}'</code>, <code>'['</code> and <code>']'</code>, determine if the input string is valid.<br/><br/>An input string is valid if: (1) Open brackets must be closed by the same type of brackets. (2) Open brackets must be closed in the correct order. (3) Every close bracket has a corresponding open bracket.`,
    examples: [
      { input: 's = "()"', output: "true", explanation: "" },
      { input: 's = "()[]{}"', output: "true", explanation: "" },
      { input: 's = "(]"', output: "false", explanation: "" }
    ],
    constraints: ["1 ≤ s.length ≤ 10⁴", "s consists of parentheses only '()[]{}'."],
    hints: ["Use a stack.", "Push opening brackets onto the stack.", "For closing brackets, check if top of stack is the matching opening bracket."],
    complexity: { time: "O(n)", space: "O(n)" },
    topics: ["String", "Stack"],
    companies: ["Amazon", "Facebook", "Google", "Microsoft", "Bloomberg"]
  },

  200: {
    title: "Number of Islands",
    difficulty: "medium",
    category: "Graph / DFS / BFS",
    acceptance: "57.6%",
    description: `Given an <code>m x n</code> 2D binary grid which represents a map of <code>'1'</code>s (land) and <code>'0'</code>s (water), return <em>the number of islands</em>. An <strong>island</strong> is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.`,
    examples: [
      { input: 'grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]', output: "1", explanation: "" },
      { input: 'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]', output: "3", explanation: "" }
    ],
    constraints: ["m == grid.length", "n == grid[i].length", "1 ≤ m, n ≤ 300", "grid[i][j] is '0' or '1'."],
    hints: ["When you find a '1', increment count and run DFS/BFS.", "DFS: mark visited cells as '0' (or use visited array).", "Explore all 4 directions: up, down, left, right."],
    complexity: { time: "O(m×n)", space: "O(m×n)" },
    topics: ["Array", "DFS", "BFS", "Union Find", "Matrix"],
    companies: ["Amazon", "Microsoft", "Google", "Facebook", "Bloomberg"]
  },

  70: {
    title: "Climbing Stairs",
    difficulty: "easy",
    category: "Dynamic Programming",
    acceptance: "51.8%",
    description: `You are climbing a staircase. It takes <code>n</code> steps to reach the top. Each time you can either climb <code>1</code> or <code>2</code> steps. In how many distinct ways can you climb to the top?`,
    examples: [
      { input: "n = 2", output: "2", explanation: "1+1, 2" },
      { input: "n = 3", output: "3", explanation: "1+1+1, 1+2, 2+1" }
    ],
    constraints: ["1 ≤ n ≤ 45"],
    hints: ["This is essentially the Fibonacci sequence.", "dp[i] = dp[i-1] + dp[i-2]", "Base cases: dp[1] = 1, dp[2] = 2."],
    complexity: { time: "O(n)", space: "O(1)" },
    topics: ["Math", "Dynamic Programming", "Memoization"],
    companies: ["Amazon", "Apple", "Adobe", "Google", "Uber"]
  },

  198: {
    title: "House Robber",
    difficulty: "medium",
    category: "Dynamic Programming",
    acceptance: "49.8%",
    description: `You are a professional robber planning to rob houses along a street. Adjacent houses have security systems that will alert the police if both are robbed on the same night. Given an array <code>nums</code> representing the amount of money at each house, return <em>the maximum amount you can rob without alerting the police</em>.`,
    examples: [
      { input: "nums = [1,2,3,1]", output: "4", explanation: "Rob house 1 (1) + house 3 (3) = 4." },
      { input: "nums = [2,7,9,3,1]", output: "12", explanation: "Rob house 1 (2) + house 3 (9) + house 5 (1) = 12." }
    ],
    constraints: ["1 ≤ nums.length ≤ 100", "0 ≤ nums[i] ≤ 400"],
    hints: ["dp[i] = max profit robbing up to house i.", "dp[i] = max(dp[i-1], dp[i-2] + nums[i])", "Can be optimized to O(1) space using two variables."],
    complexity: { time: "O(n)", space: "O(1)" },
    topics: ["Array", "Dynamic Programming"],
    companies: ["Airbnb", "Amazon", "Microsoft", "LinkedIn"]
  },

  322: {
    title: "Coin Change",
    difficulty: "medium",
    category: "Dynamic Programming / BFS",
    acceptance: "43.1%",
    description: `You are given an integer array <code>coins</code> representing coins of different denominations and an integer <code>amount</code>. Return <em>the fewest number of coins needed to make up that amount</em>. If that amount cannot be made up by any combination of the coins, return <code>-1</code>. You may assume you have infinite coins of each denomination.`,
    examples: [
      { input: "coins = [1,5,11], amount = 11", output: "3", explanation: "11 = 5 + 5 + 1 (3 coins)" },
      { input: "coins = [2], amount = 3", output: "-1", explanation: "" },
      { input: "coins = [1], amount = 0", output: "0", explanation: "" }
    ],
    constraints: ["1 ≤ coins.length ≤ 12", "1 ≤ coins[i] ≤ 2³¹ - 1", "0 ≤ amount ≤ 10⁴"],
    hints: ["Bottom-up DP: dp[i] = min coins to make amount i.", "dp[0] = 0; for each amount, try all coins.", "dp[i] = min(dp[i], dp[i-coin] + 1) if i >= coin."],
    complexity: { time: "O(amount × n)", space: "O(amount)" },
    topics: ["Array", "Dynamic Programming", "BFS"],
    companies: ["Amazon", "Microsoft", "Apple", "Goldman Sachs"]
  },

  56: {
    title: "Merge Intervals",
    difficulty: "medium",
    category: "Arrays / Sorting",
    acceptance: "46.5%",
    description: `Given an array of <code>intervals</code> where <code>intervals[i] = [start_i, end_i]</code>, merge all overlapping intervals, and return <em>an array of the non-overlapping intervals that cover all the intervals in the input</em>.`,
    examples: [
      { input: "intervals = [[1,3],[2,6],[8,10],[15,18]]", output: "[[1,6],[8,10],[15,18]]", explanation: "[1,3] and [2,6] overlap → merged to [1,6]." },
      { input: "intervals = [[1,4],[4,5]]", output: "[[1,5]]", explanation: "Intervals [1,4] and [4,5] are considered overlapping." }
    ],
    constraints: ["1 ≤ intervals.length ≤ 10⁴", "intervals[i].length == 2", "0 ≤ start_i ≤ end_i ≤ 10⁴"],
    hints: ["Sort intervals by start time.", "Compare current interval's start with last merged interval's end.", "If overlapping, update the end. Otherwise add to result."],
    complexity: { time: "O(n log n)", space: "O(n)" },
    topics: ["Array", "Sorting"],
    companies: ["Facebook", "Google", "Microsoft", "Amazon", "LinkedIn"]
  },

  283: {
    title: "Move Zeroes",
    difficulty: "easy",
    category: "Arrays / Two Pointers",
    acceptance: "61.4%",
    description: `Given an integer array <code>nums</code>, move all <code>0</code>'s to the end of it while maintaining the relative order of the non-zero elements. <strong>Note</strong> that you must do this in-place without making a copy of the array.`,
    examples: [
      { input: "nums = [0,1,0,3,12]", output: "[1,3,12,0,0]", explanation: "" },
      { input: "nums = [0]", output: "[0]", explanation: "" }
    ],
    constraints: ["1 ≤ nums.length ≤ 10⁴", "-2³¹ ≤ nums[i] ≤ 2³¹ - 1"],
    hints: ["Use a write pointer starting at 0.", "Copy all non-zero elements to front using write pointer.", "Fill remaining positions with 0."],
    complexity: { time: "O(n)", space: "O(1)" },
    topics: ["Array", "Two Pointers"],
    companies: ["Facebook", "Microsoft", "Bloomberg", "Apple"]
  },

  347: {
    title: "Top K Frequent Elements",
    difficulty: "medium",
    category: "Hash Map / Heap / Bucket Sort",
    acceptance: "65.4%",
    description: `Given an integer array <code>nums</code> and an integer <code>k</code>, return <em>the k most frequent elements</em>. You may return the answer in any order.`,
    examples: [
      { input: "nums = [1,1,1,2,2,3], k = 2", output: "[1,2]", explanation: "" },
      { input: "nums = [1], k = 1", output: "[1]", explanation: "" }
    ],
    constraints: ["1 ≤ nums.length ≤ 10⁵", "-10⁴ ≤ nums[i] ≤ 10⁴", "k is in the range [1, unique elements count].", "The answer is unique."],
    hints: ["Count frequencies with a HashMap.", "Use a min-heap of size k, or bucket sort by frequency.", "Bucket sort achieves O(n) time."],
    complexity: { time: "O(n)", space: "O(n)" },
    topics: ["Array", "Hash Table", "Heap", "Bucket Sort"],
    companies: ["Amazon", "Facebook", "Bloomberg", "Yelp", "Lyft"]
  },

  128: {
    title: "Longest Consecutive Sequence",
    difficulty: "medium",
    category: "Arrays / Hash Set",
    acceptance: "47.2%",
    description: `Given an unsorted array of integers <code>nums</code>, return <em>the length of the longest consecutive elements sequence</em>. You must write an algorithm that runs in <code>O(n)</code> time.`,
    examples: [
      { input: "nums = [100,4,200,1,3,2]", output: "4", explanation: "The longest consecutive sequence is [1, 2, 3, 4]." },
      { input: "nums = [0,3,7,2,5,8,4,6,0,1]", output: "9", explanation: "" }
    ],
    constraints: ["0 ≤ nums.length ≤ 10⁵", "-10⁹ ≤ nums[i] ≤ 10⁹"],
    hints: ["Add all numbers to a HashSet.", "For each number x, only start counting if x-1 is NOT in the set.", "Then count x, x+1, x+2... until the sequence breaks."],
    complexity: { time: "O(n)", space: "O(n)" },
    topics: ["Array", "Hash Table", "Union Find"],
    companies: ["Google", "Amazon", "Facebook", "Airbnb"]
  },

  49: {
    title: "Group Anagrams",
    difficulty: "medium",
    category: "Strings / Hash Map",
    acceptance: "67.1%",
    description: `Given an array of strings <code>strs</code>, group the anagrams together. You can return the answer in any order. An <strong>Anagram</strong> is a word formed by rearranging the letters of another, using all original letters exactly once.`,
    examples: [
      { input: 'strs = ["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]', explanation: "" },
      { input: 'strs = [""]', output: '[[""]]', explanation: "" }
    ],
    constraints: ["1 ≤ strs.length ≤ 10⁴", "0 ≤ strs[i].length ≤ 100", "strs[i] consists of lowercase English letters."],
    hints: ["Sort each string to get a canonical key.", "Use HashMap<String, List> where key is the sorted string.", "All anagrams will have the same sorted key."],
    complexity: { time: "O(n × k log k)", space: "O(nk)" },
    topics: ["Array", "Hash Table", "String", "Sorting"],
    companies: ["Amazon", "Facebook", "Bloomberg", "Uber", "Apple"]
  },

  33: {
    title: "Search in Rotated Sorted Array",
    difficulty: "medium",
    category: "Binary Search",
    acceptance: "39.5%",
    description: `There is an integer array <code>nums</code> sorted in ascending order (with distinct values), possibly <strong>rotated</strong> at an unknown pivot index. Given the array after possible rotation and an integer <code>target</code>, return <em>the index of target if it is in nums, or -1 if it is not</em>. You must write an algorithm with <code>O(log n)</code> runtime.`,
    examples: [
      { input: "nums = [4,5,6,7,0,1,2], target = 0", output: "4", explanation: "" },
      { input: "nums = [4,5,6,7,0,1,2], target = 3", output: "-1", explanation: "" },
      { input: "nums = [1], target = 0", output: "-1", explanation: "" }
    ],
    constraints: ["1 ≤ nums.length ≤ 5000", "-10⁴ ≤ nums[i] ≤ 10⁴", "All values of nums are unique."],
    hints: ["At each mid, determine which half is sorted.", "If left half sorted: check if target in [left, mid].", "If right half sorted: check if target in [mid, right]."],
    complexity: { time: "O(log n)", space: "O(1)" },
    topics: ["Array", "Binary Search"],
    companies: ["Facebook", "Amazon", "Microsoft", "LinkedIn", "Apple"]
  },

  46: {
    title: "Permutations",
    difficulty: "medium",
    category: "Backtracking",
    acceptance: "74.4%",
    description: `Given an array <code>nums</code> of distinct integers, return <em>all the possible permutations</em>. You can return the answer in any order.`,
    examples: [
      { input: "nums = [1,2,3]", output: "[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]", explanation: "" },
      { input: "nums = [0,1]", output: "[[0,1],[1,0]]", explanation: "" },
      { input: "nums = [1]", output: "[[1]]", explanation: "" }
    ],
    constraints: ["1 ≤ nums.length ≤ 6", "-10 ≤ nums[i] ≤ 10", "All integers of nums are unique."],
    hints: ["Use backtracking: pick an element, recurse, then unpick.", "Track which elements are used with a boolean array.", "When current path length equals nums.length, add to result."],
    complexity: { time: "O(n × n!)", space: "O(n)" },
    topics: ["Array", "Backtracking"],
    companies: ["LinkedIn", "Microsoft", "Amazon", "Facebook"]
  },

  104: {
    title: "Maximum Depth of Binary Tree",
    difficulty: "easy",
    category: "Trees / DFS",
    acceptance: "74.3%",
    description: `Given the <code>root</code> of a binary tree, return <em>its maximum depth</em>. A binary tree's <strong>maximum depth</strong> is the number of nodes along the longest path from the root node down to the farthest leaf node.`,
    examples: [
      { input: "root = [3,9,20,null,null,15,7]", output: "3", explanation: "" },
      { input: "root = [1,null,2]", output: "2", explanation: "" }
    ],
    constraints: ["The number of nodes is in the range [0, 10⁴].", "-100 ≤ Node.val ≤ 100"],
    hints: ["Use DFS recursion.", "maxDepth(node) = 1 + max(maxDepth(left), maxDepth(right))", "Base case: if node is null, return 0."],
    complexity: { time: "O(n)", space: "O(h) where h is tree height" },
    topics: ["Tree", "DFS", "BFS", "Binary Tree"],
    companies: ["Amazon", "LinkedIn", "Apple", "Google"]
  },

  226: {
    title: "Invert Binary Tree",
    difficulty: "easy",
    category: "Trees / DFS",
    acceptance: "75.8%",
    description: `Given the <code>root</code> of a binary tree, invert the tree, and return <em>its root</em>.`,
    examples: [
      { input: "root = [4,2,7,1,3,6,9]", output: "[4,7,2,9,6,3,1]", explanation: "" },
      { input: "root = [2,1,3]", output: "[2,3,1]", explanation: "" },
      { input: "root = []", output: "[]", explanation: "" }
    ],
    constraints: ["The number of nodes is in the range [0, 100].", "-100 ≤ Node.val ≤ 100"],
    hints: ["Recursively swap left and right children at each node.", "invertTree(node): swap(node.left, node.right), then recurse."],
    complexity: { time: "O(n)", space: "O(h)" },
    topics: ["Tree", "DFS", "BFS", "Binary Tree"],
    companies: ["Google", "Amazon", "Apple", "Uber"]
  },

  98: {
    title: "Validate Binary Search Tree",
    difficulty: "medium",
    category: "Trees / DFS",
    acceptance: "32.4%",
    description: `Given the <code>root</code> of a binary tree, <em>determine if it is a valid binary search tree (BST)</em>. A valid BST has: left subtree nodes < root, right subtree nodes > root, and both subtrees must also be valid BSTs.`,
    examples: [
      { input: "root = [2,1,3]", output: "true", explanation: "" },
      { input: "root = [5,1,4,null,null,3,6]", output: "false", explanation: "Right child's value is 4 < 5." }
    ],
    constraints: ["The number of nodes is in the range [1, 10⁴].", "-2³¹ ≤ Node.val ≤ 2³¹ - 1"],
    hints: ["Pass min/max bounds through recursion.", "isValid(node, min, max): node.val must be in (min, max).", "Go left: max becomes node.val; go right: min becomes node.val."],
    complexity: { time: "O(n)", space: "O(n)" },
    topics: ["Tree", "DFS", "BST", "Binary Tree"],
    companies: ["Amazon", "Bloomberg", "Facebook", "Microsoft"]
  },

  102: {
    title: "Binary Tree Level Order Traversal",
    difficulty: "medium",
    category: "Trees / BFS",
    acceptance: "66.5%",
    description: `Given the <code>root</code> of a binary tree, return <em>the level order traversal of its nodes' values</em> (from left to right, level by level).`,
    examples: [
      { input: "root = [3,9,20,null,null,15,7]", output: "[[3],[9,20],[15,7]]", explanation: "" },
      { input: "root = [1]", output: "[[1]]", explanation: "" },
      { input: "root = []", output: "[]", explanation: "" }
    ],
    constraints: ["The number of nodes is in the range [0, 2000].", "-1000 ≤ Node.val ≤ 1000"],
    hints: ["Use BFS with a queue.", "Track size of queue at start of each level.", "Process exactly 'size' nodes, then move to next level."],
    complexity: { time: "O(n)", space: "O(n)" },
    topics: ["Tree", "BFS", "Binary Tree"],
    companies: ["Amazon", "Microsoft", "LinkedIn", "Facebook", "Apple"]
  },

  169: {
    title: "Majority Element",
    difficulty: "easy",
    category: "Arrays / Boyer-Moore Voting",
    acceptance: "64.2%",
    description: `Given an array <code>nums</code> of size <code>n</code>, return <em>the majority element</em>. The majority element is the element that appears more than <code>⌊n / 2⌋</code> times. You may assume that the majority element always exists in the array.`,
    examples: [
      { input: "nums = [3,2,3]", output: "3", explanation: "" },
      { input: "nums = [2,2,1,1,1,2,2]", output: "2", explanation: "" }
    ],
    constraints: ["n == nums.length", "1 ≤ n ≤ 5 × 10⁴", "-10⁹ ≤ nums[i] ≤ 10⁹", "Majority element always exists."],
    hints: ["Boyer-Moore Voting Algorithm: O(n) time, O(1) space.", "Maintain a candidate and a count.", "When count hits 0, update candidate to current element."],
    complexity: { time: "O(n)", space: "O(1)" },
    topics: ["Array", "Hash Table", "Divide and Conquer", "Sorting", "Counting"],
    companies: ["Amazon", "Yahoo", "Microsoft", "Adobe"]
  },

  75: {
    title: "Sort Colors",
    difficulty: "medium",
    category: "Arrays / Dutch National Flag",
    acceptance: "60.3%",
    description: `Given an array <code>nums</code> with <code>n</code> objects colored red (0), white (1), or blue (2), sort them <strong>in-place</strong> so that objects of the same color are adjacent in the order 0, 1, 2. Do not use the library's sort function.`,
    examples: [
      { input: "nums = [2,0,2,1,1,0]", output: "[0,0,1,1,2,2]", explanation: "" },
      { input: "nums = [2,0,1]", output: "[0,1,2]", explanation: "" }
    ],
    constraints: ["n == nums.length", "1 ≤ n ≤ 300", "nums[i] is either 0, 1, or 2."],
    hints: ["Dutch National Flag algorithm by Dijkstra.", "Use three pointers: low, mid, high.", "Swap based on nums[mid]: 0→swap with low, 2→swap with high."],
    complexity: { time: "O(n)", space: "O(1)" },
    topics: ["Array", "Two Pointers", "Sorting"],
    companies: ["Facebook", "Microsoft", "Amazon"]
  },

  141: {
    title: "Linked List Cycle",
    difficulty: "easy",
    category: "Linked List / Two Pointers",
    acceptance: "49.4%",
    description: `Given <code>head</code>, the head of a linked list, determine if the linked list has a cycle. Return <code>true</code> if there is a cycle, otherwise return <code>false</code>.`,
    examples: [
      { input: "head = [3,2,0,-4], pos = 1", output: "true", explanation: "The tail connects to the 1st node." },
      { input: "head = [1,2], pos = 0", output: "true", explanation: "The tail connects to the 0th node." },
      { input: "head = [1], pos = -1", output: "false", explanation: "No cycle." }
    ],
    constraints: ["The number of nodes is in the range [0, 10⁴].", "-10⁵ ≤ Node.val ≤ 10⁵"],
    hints: ["Floyd's Tortoise and Hare algorithm.", "Slow pointer moves 1 step, fast pointer moves 2 steps.", "If there's a cycle, they will eventually meet."],
    complexity: { time: "O(n)", space: "O(1)" },
    topics: ["Hash Table", "Linked List", "Two Pointers"],
    companies: ["Amazon", "Microsoft", "Apple", "Bloomberg"]
  },

  424: {
    title: "Longest Repeating Character Replacement",
    difficulty: "medium",
    category: "Sliding Window / String",
    acceptance: "54.2%",
    description: `You are given a string <code>s</code> and an integer <code>k</code>. You can choose any character of the string and change it to any other uppercase English character. You can perform this operation at most <code>k</code> times. Return <em>the length of the longest substring containing the same letter you can get after performing the above operations</em>.`,
    examples: [
      { input: 's = "ABAB", k = 2', output: "4", explanation: 'Replace the two \'A\'s with \'B\'s or vice versa.' },
      { input: 's = "AABABBA", k = 1', output: "4", explanation: 'Replace the one \'A\' in the middle with \'B\' and form "AABBBBA". The substring "BBBB" has the longest repeating letters, which is 4.' }
    ],
    constraints: [
      "1 ≤ s.length ≤ 10⁵",
      "s consists of only uppercase English letters.",
      "0 ≤ k ≤ s.length"
    ],
    hints: [
      "Use two pointers (left and right) to maintain a dynamic sliding window.",
      "Count character frequencies inside the window. The most frequent character determines the target letter.",
      "If (window_length - max_frequency) > k, the window is invalid and must be shrunk from the left."
    ],
    complexity: { time: "O(n)", space: "O(26) = O(1)" },
    topics: ["Hash Table", "String", "Sliding Window"],
    companies: ["Amazon", "Google", "Facebook", "Microsoft", "Uber"]
  },

  567: {
    title: "Permutation in String",
    difficulty: "medium",
    category: "Sliding Window / String",
    acceptance: "44.6%",
    description: `Given two strings <code>s1</code> and <code>s2</code>, return <code>true</code> if <code>s2</code> contains a permutation of <code>s1</code>, or <code>false</code> otherwise.<br/><br/>In other words, return <code>true</code> if one of <code>s1</code>'s permutations is the substring of <code>s2</code>.`,
    examples: [
      { input: 's1 = "ab", s2 = "eidbaooo"', output: "true", explanation: 's2 contains one permutation of s1 ("ba").' },
      { input: 's1 = "ab", s2 = "eidboaoo"', output: "false", explanation: 'Neither "ab" nor "ba" is present in s2.' }
    ],
    constraints: [
      "1 ≤ s1.length, s2.length ≤ 10⁴",
      "s1 and s2 consist of lowercase English letters."
    ],
    hints: [
      "Obviously, brute force will result in Time Limit Exceeded. Think of how we can use frequency counts.",
      "Two strings are permutations of each other if and only if they have the exact same character frequencies.",
      "Maintain a fixed sliding window of size s1.length() over s2 and compare character frequency distributions."
    ],
    complexity: { time: "O(n)", space: "O(1) — 26 char counts" },
    topics: ["Hash Table", "Two Pointers", "String", "Sliding Window"],
    companies: ["Apple", "Microsoft", "Amazon", "Walmart Labs", "TCS"]
  },
};

export function getProblemDescription(id) {
  return PROBLEM_DESCRIPTIONS[id] || null;
}
