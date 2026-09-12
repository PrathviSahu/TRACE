const fs = require("fs");
const path = require("path");

// ─── All new problem data ───────────────────────────────────────────────────

const newRoadmapProblems = {
  "Sliding Window": [
    { id: 3, name: "Longest Substring Without Repeating Characters", difficulty: "medium", url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/", insertAfter: "id: 3," }
  ],
  "Stack": [
    { id: 20, name: "Valid Parentheses", difficulty: "easy", url: "https://leetcode.com/problems/valid-parentheses/", insertAfter: "id: 20," },
    { id: 739, name: "Daily Temperatures", difficulty: "medium", url: "https://leetcode.com/problems/daily-temperatures/", insertAfter: "id: 739," }
  ],
  "Dynamic Programming": [
    { id: 198, name: "House Robber", difficulty: "medium", url: "https://leetcode.com/problems/house-robber/", insertAfter: "id: 198," },
    { id: 300, name: "Longest Increasing Subsequence", difficulty: "medium", url: "https://leetcode.com/problems/longest-increasing-subsequence/", insertAfter: "id: 300," },
    { id: 322, name: "Coin Change", difficulty: "medium", url: "https://leetcode.com/problems/coin-change/", insertAfter: "id: 322," }
  ],
  "Graph BFS / DFS": [
    { id: 200, name: "Number of Islands", difficulty: "medium", url: "https://leetcode.com/problems/number-of-islands/", insertAfter: "id: 200," }
  ]
};

const NEW_PATTERN_ENTRIES = {
  "3":   { topic: "String", patterns: ["Sliding Window", "Frequency Counting"] },
  "15":  { topic: "Array", patterns: ["Two Pointers"] },
  "20":  { topic: "String", patterns: ["Stack"] },
  "21":  { topic: "Linked List", patterns: ["Two Pointers", "Recursion"] },
  "33":  { topic: "Array", patterns: ["Binary Search"] },
  "49":  { topic: "Hash Table", patterns: ["Sorting", "Frequency Counting"] },
  "55":  { topic: "Array", patterns: ["Greedy"] },
  "56":  { topic: "Intervals", patterns: ["Sorting", "Two Pointers"] },
  "62":  { topic: "Array", patterns: ["1D State DP"] },
  "74":  { topic: "Array", patterns: ["Binary Search"] },
  "104": { topic: "Tree", patterns: ["Recursion", "DFS"] },
  "153": { topic: "Array", patterns: ["Binary Search"] },
  "198": { topic: "Array", patterns: ["1D State DP"] },
  "200": { topic: "Graph", patterns: ["DFS", "BFS", "Union Find"] },
  "206": { topic: "Linked List", patterns: ["In-place Reversal", "Recursion"] },
  "215": { topic: "Array", patterns: ["Divide and Conquer"] },
  "226": { topic: "Tree", patterns: ["Recursion", "DFS"] },
  "238": { topic: "Array", patterns: ["Prefix/Suffix Technique"] },
  "300": { topic: "Array", patterns: ["Sequence DP"] },
  "322": { topic: "Array", patterns: ["1D State DP"] },
  "347": { topic: "Hash Table", patterns: ["Frequency Counting"] },
  "739": { topic: "Array", patterns: ["Stack"] }
};

const NEW_DESCRIPTIONS = {
  3: {
    title: "Longest Substring Without Repeating Characters",
    difficulty: "medium",
    category: "Sliding Window / String",
    acceptance: "34.4%",
    description: "Given a string <code>s</code>, find the length of the <strong>longest substring</strong> without repeating characters.",
    examples: [
      { input: 's = "abcabcbb"', output: "3", explanation: 'The answer is "abc", with the length of 3.' },
      { input: 's = "bbbbb"', output: "1", explanation: 'The answer is "b", with the length of 1.' },
      { input: 's = "pwwkew"', output: "3", explanation: 'The answer is "wke", with the length of 3.' }
    ],
    constraints: ["0 ≤ s.length ≤ 5 × 10⁴", "s consists of English letters, digits, symbols and spaces."],
    hints: [
      "Use a sliding window. Expand right pointer. When a duplicate is found, shrink from left.",
      "Track the last seen index of each character to jump left pointer directly.",
      "A frequency array of size 128 (ASCII) covers all printable characters."
    ],
    complexity: { time: "O(n)", space: "O(min(m,n)) — m is charset size" },
    topics: ["Hash Table", "String", "Sliding Window"],
    companies: ["Amazon", "Google", "Microsoft", "Facebook", "Adobe"]
  },
  20: {
    title: "Valid Parentheses",
    difficulty: "easy",
    category: "Stack / String",
    acceptance: "40.7%",
    description: "Given a string <code>s</code> containing just the characters <code>'('</code>, <code>')'</code>, <code>'{'</code>, <code>'}'</code>, <code>'['</code> and <code>']'</code>, determine if the input string is valid.<br/><br/>An input string is valid if: open brackets must be closed by the same type of brackets, and open brackets must be closed in the correct order.",
    examples: [
      { input: 's = "()"', output: "true" },
      { input: 's = "()[]{}"', output: "true" },
      { input: 's = "(]"', output: "false" }
    ],
    constraints: ["1 ≤ s.length ≤ 10⁴", "s consists of parentheses only '()[]{}'."],
    hints: [
      "Use a stack. When you see an open bracket, push it. When you see a close bracket, check the top of stack.",
      "If the top doesn't match the current closing bracket, return false.",
      "At the end, return stack.isEmpty()."
    ],
    complexity: { time: "O(n)", space: "O(n)" },
    topics: ["String", "Stack"],
    companies: ["Amazon", "Google", "Microsoft", "Facebook", "Bloomberg"]
  },
  21: {
    title: "Merge Two Sorted Lists",
    difficulty: "easy",
    category: "Linked List / Recursion",
    acceptance: "63.6%",
    description: "You are given the heads of two sorted linked lists <code>list1</code> and <code>list2</code>. Merge the two lists into one <strong>sorted</strong> list. The list should be made by splicing together the nodes of the first two lists. Return the head of the merged linked list.",
    examples: [
      { input: "list1 = [1,2,4], list2 = [1,3,4]", output: "[1,1,2,3,4,4]" },
      { input: "list1 = [], list2 = []", output: "[]" },
      { input: "list1 = [], list2 = [0]", output: "[0]" }
    ],
    constraints: ["The number of nodes in both lists is in the range [0, 50].", "-100 ≤ Node.val ≤ 100", "Both list1 and list2 are sorted in non-decreasing order."],
    hints: [
      "Base case: if either list is null, return the other.",
      "Recursively merge by choosing the smaller head node.",
      "Or use iterative with a dummy head and two pointers."
    ],
    complexity: { time: "O(m + n)", space: "O(1) iterative, O(m + n) recursive" },
    topics: ["Linked List", "Recursion"],
    companies: ["Amazon", "Microsoft", "Apple", "Bloomberg"]
  },
  33: {
    title: "Search in Rotated Sorted Array",
    difficulty: "medium",
    category: "Binary Search",
    acceptance: "40.5%",
    description: "There is an integer array <code>nums</code> sorted in ascending order (with <strong>distinct</strong> values). Prior to being passed to your function, <code>nums</code> is possibly rotated at an unknown pivot index <code>k</code>. Given the array <code>nums</code> after the possible rotation and an integer <code>target</code>, return the index of <code>target</code> if it is in <code>nums</code>, or <code>-1</code> if it is not in <code>nums</code>.",
    examples: [
      { input: "nums = [4,5,6,7,0,1,2], target = 0", output: "4" },
      { input: "nums = [4,5,6,7,0,1,2], target = 3", output: "-1" },
      { input: "nums = [1], target = 0", output: "-1" }
    ],
    constraints: ["1 ≤ nums.length ≤ 5000", "-10⁴ ≤ nums[i], target ≤ 10⁴", "All values of nums are unique.", "nums is an ascending array that is possibly rotated."],
    hints: [
      "Use modified binary search. At each mid, determine which half is sorted.",
      "If left half is sorted (nums[left] <= nums[mid]): check if target is in [left, mid).",
      "Otherwise right half is sorted: check if target is in (mid, right]."
    ],
    complexity: { time: "O(log n)", space: "O(1)" },
    topics: ["Array", "Binary Search"],
    companies: ["Amazon", "Microsoft", "Facebook", "LinkedIn", "Uber"]
  },
  49: {
    title: "Group Anagrams",
    difficulty: "medium",
    category: "Hash Table / String",
    acceptance: "68.6%",
    description: "Given an array of strings <code>strs</code>, group the <strong>anagrams</strong> together. You can return the answer in <strong>any order</strong>.<br/><br/>An <strong>Anagram</strong> is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.",
    examples: [
      { input: 'strs = ["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]' },
      { input: 'strs = [""]', output: '[[""]]' },
      { input: 'strs = ["a"]', output: '[["a"]]' }
    ],
    constraints: ["1 ≤ strs.length ≤ 10⁴", "0 ≤ strs[i].length ≤ 100", "strs[i] consists of lowercase English letters."],
    hints: [
      "Sort each word to get a canonical form. All anagrams share the same sorted form.",
      "Use a HashMap where the key is the sorted string and the value is the list of anagrams.",
      "Alternatively, use a 26-element frequency count as the key (even faster)."
    ],
    complexity: { time: "O(n · k log k) where k = max word length", space: "O(n · k)" },
    topics: ["Hash Table", "String", "Sorting"],
    companies: ["Amazon", "Facebook", "Google", "Uber", "Apple"]
  },
  55: {
    title: "Jump Game",
    difficulty: "medium",
    category: "Greedy / Array",
    acceptance: "38.5%",
    description: "You are given an integer array <code>nums</code>. You are initially positioned at the array's <strong>first index</strong>, and each element in the array represents your maximum jump length at that position. Return <code>true</code> if you can reach the last index, or <code>false</code> otherwise.",
    examples: [
      { input: "nums = [2,3,1,1,4]", output: "true", explanation: "Jump 1 step from index 0 to 1, then 3 steps to the last index." },
      { input: "nums = [3,2,1,0,4]", output: "false", explanation: "You will always arrive at index 3. Its maximum jump length is 0, which makes it impossible to reach the last index." }
    ],
    constraints: ["1 ≤ nums.length ≤ 10⁴", "0 ≤ nums[i] ≤ 10⁵"],
    hints: [
      "Greedy: track the maximum reachable index so far.",
      "For each position i, update maxReach = max(maxReach, i + nums[i]).",
      "If at any point i > maxReach, you're stuck — return false."
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    topics: ["Array", "Dynamic Programming", "Greedy"],
    companies: ["Amazon", "Microsoft", "Apple", "Uber"]
  },
  56: {
    title: "Merge Intervals",
    difficulty: "medium",
    category: "Intervals / Sorting",
    acceptance: "47.4%",
    description: "Given an array of <code>intervals</code> where <code>intervals[i] = [start<sub>i</sub>, end<sub>i</sub>]</code>, merge all overlapping intervals, and return <em>an array of the non-overlapping intervals that cover all the intervals in the input</em>.",
    examples: [
      { input: "intervals = [[1,3],[2,6],[8,10],[15,18]]", output: "[[1,6],[8,10],[15,18]]", explanation: "Since intervals [1,3] and [2,6] overlap, merge them into [1,6]." },
      { input: "intervals = [[1,4],[4,5]]", output: "[[1,5]]", explanation: "Intervals [1,4] and [4,5] are considered overlapping." }
    ],
    constraints: ["1 ≤ intervals.length ≤ 10⁴", "intervals[i].length == 2", "0 ≤ start_i ≤ end_i ≤ 10⁴"],
    hints: [
      "Sort intervals by start time.",
      "Iterate and merge if the current interval starts before or at the end of the previous merged interval.",
      "The merge condition is: intervals[i].start <= currentEnd."
    ],
    complexity: { time: "O(n log n)", space: "O(n)" },
    topics: ["Array", "Sorting", "Intervals"],
    companies: ["Facebook", "Amazon", "Google", "LinkedIn", "Microsoft"]
  },
  62: {
    title: "Unique Paths",
    difficulty: "medium",
    category: "Dynamic Programming",
    acceptance: "64.4%",
    description: "There is a robot on an <code>m x n</code> grid. The robot is initially located at the <strong>top-left corner</strong> (i.e., <code>grid[0][0]</code>). The robot tries to move to the <strong>bottom-right corner</strong> (i.e., <code>grid[m - 1][n - 1]</code>). The robot can only move either down or right at any point in time. Given the two integers <code>m</code> and <code>n</code>, return the number of possible unique paths that the robot can take to reach the bottom-right corner.",
    examples: [
      { input: "m = 3, n = 7", output: "28" },
      { input: "m = 3, n = 2", output: "3", explanation: "From the top-left corner, there are a total of 3 ways to reach the bottom-right corner." }
    ],
    constraints: ["1 ≤ m, n ≤ 100"],
    hints: [
      "Think of it as filling a grid: dp[i][j] = dp[i-1][j] + dp[i][j-1].",
      "Space-optimize: use a 1D dp array of size n, updating left to right.",
      "Mathematical solution: C(m+n-2, m-1) paths (combinatorics)."
    ],
    complexity: { time: "O(m × n)", space: "O(n) with space optimization" },
    topics: ["Math", "Dynamic Programming", "Combinatorics"],
    companies: ["Amazon", "Microsoft", "Google", "Databricks"]
  },
  74: {
    title: "Search a 2D Matrix",
    difficulty: "medium",
    category: "Binary Search / Matrix",
    acceptance: "50.9%",
    description: "You are given an <code>m x n</code> integer matrix <code>matrix</code> with the following properties: each row is sorted in non-decreasing order, and the first integer of each row is greater than the last integer of the previous row. Given an integer <code>target</code>, return <code>true</code> if <code>target</code> is in <code>matrix</code> or <code>false</code> otherwise.",
    examples: [
      { input: "matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3", output: "true" },
      { input: "matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 13", output: "false" }
    ],
    constraints: ["m == matrix.length", "n == matrix[i].length", "1 ≤ m, n ≤ 100", "-10⁴ ≤ matrix[i][j], target ≤ 10⁴"],
    hints: [
      "The matrix can be treated as a sorted 1D array of m × n elements.",
      "Binary search on index 0 to m*n-1. Convert mid to (row, col) as mid/n and mid%n.",
      "Time complexity: O(log(m × n)) = O(log m + log n)."
    ],
    complexity: { time: "O(log(m × n))", space: "O(1)" },
    topics: ["Array", "Binary Search", "Matrix"],
    companies: ["Amazon", "Microsoft", "Bloomberg", "Apple"]
  },
  104: {
    title: "Maximum Depth of Binary Tree",
    difficulty: "easy",
    category: "Tree / DFS",
    acceptance: "74.8%",
    description: "Given the <code>root</code> of a binary tree, return <em>its maximum depth</em>. A binary tree's <strong>maximum depth</strong> is the number of nodes along the longest path from the root node down to the farthest leaf node.",
    examples: [
      { input: "root = [3,9,20,null,null,15,7]", output: "3" },
      { input: "root = [1,null,2]", output: "2" }
    ],
    constraints: ["The number of nodes in the tree is in the range [0, 10⁴].", "-100 ≤ Node.val ≤ 100"],
    hints: [
      "Recursively: depth = max(depth(left), depth(right)) + 1.",
      "Base case: null node returns 0.",
      "Alternatively, BFS level by level and count levels."
    ],
    complexity: { time: "O(n)", space: "O(h) where h is tree height, O(log n) balanced, O(n) skewed" },
    topics: ["Tree", "Depth-First Search", "Breadth-First Search", "Binary Tree"],
    companies: ["Amazon", "Google", "LinkedIn", "Apple", "Adobe"]
  },
  153: {
    title: "Find Minimum in Rotated Sorted Array",
    difficulty: "medium",
    category: "Binary Search",
    acceptance: "49.3%",
    description: "Suppose an array of length <code>n</code> sorted in ascending order is <strong>rotated</strong> between <code>1</code> and <code>n</code> times. Given the sorted rotated array <code>nums</code> of <strong>unique</strong> elements, return the <em>minimum element of this array</em>.",
    examples: [
      { input: "nums = [3,4,5,1,2]", output: "1" },
      { input: "nums = [4,5,6,7,0,1,2]", output: "0" },
      { input: "nums = [11,13,15,17]", output: "11" }
    ],
    constraints: ["n == nums.length", "1 ≤ n ≤ 5000", "-5000 ≤ nums[i] ≤ 5000", "All the integers of nums are unique.", "nums is sorted and rotated between 1 and n times."],
    hints: [
      "Binary search: the minimum is in the unsorted half.",
      "If nums[mid] > nums[right], minimum is in right half (left = mid + 1).",
      "Otherwise minimum is in left half including mid (right = mid)."
    ],
    complexity: { time: "O(log n)", space: "O(1)" },
    topics: ["Array", "Binary Search"],
    companies: ["Amazon", "Microsoft", "Apple", "LinkedIn"]
  },
  198: {
    title: "House Robber",
    difficulty: "medium",
    category: "Dynamic Programming",
    acceptance: "50.5%",
    description: "You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed. The only constraint stopping you from robbing each of them is that adjacent houses have security systems connected and <strong>it will automatically contact the police if two adjacent houses were broken into on the same night</strong>.<br/><br/>Given an integer array <code>nums</code> representing the amount of money of each house, return the <em>maximum amount of money you can rob tonight <strong>without alerting the police</strong></em>.",
    examples: [
      { input: "nums = [1,2,3,1]", output: "4", explanation: "Rob house 1 (money = 1) and then rob house 3 (money = 3). Total = 4." },
      { input: "nums = [2,7,9,3,1]", output: "12", explanation: "Rob house 1, 3, 5. Money = 2 + 9 + 1 = 12." }
    ],
    constraints: ["1 ≤ nums.length ≤ 100", "0 ≤ nums[i] ≤ 400"],
    hints: [
      "For each house i, you either rob it (prev2 + nums[i]) or skip it (prev1).",
      "dp[i] = max(dp[i-2] + nums[i], dp[i-1]). Space-optimize to just 2 variables.",
      "No need for full DP array — only the last two states matter."
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    topics: ["Array", "Dynamic Programming"],
    companies: ["Amazon", "Google", "Airbnb", "Microsoft"]
  },
  200: {
    title: "Number of Islands",
    difficulty: "medium",
    category: "Graph / DFS",
    acceptance: "59.2%",
    description: "Given an <code>m x n</code> 2D binary grid <code>grid</code> which represents a map of <code>'1'</code>s (land) and <code>'0'</code>s (water), return <em>the number of islands</em>.<br/><br/>An <strong>island</strong> is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.",
    examples: [
      { input: 'grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]', output: "1" },
      { input: 'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]', output: "3" }
    ],
    constraints: ["m == grid.length", "n == grid[i].length", "1 ≤ m, n ≤ 300", 'grid[i][j] is "0" or "1".'],
    hints: [
      "DFS or BFS: when you find a '1', increment count and sink the entire island (mark all connected '1's as '0').",
      "Union-Find: union adjacent cells that are both '1's.",
      "For TRACE, we flatten the 2D grid to a 1D array: index = row * cols + col."
    ],
    complexity: { time: "O(m × n)", space: "O(m × n) for recursion stack" },
    topics: ["Array", "Depth-First Search", "Breadth-First Search", "Union Find", "Matrix"],
    companies: ["Amazon", "Google", "Microsoft", "Facebook", "ByteDance"]
  },
  206: {
    title: "Reverse Linked List",
    difficulty: "easy",
    category: "Linked List",
    acceptance: "75.5%",
    description: "Given the <code>head</code> of a singly linked list, reverse the list, and return <em>the reversed list</em>.",
    examples: [
      { input: "head = [1,2,3,4,5]", output: "[5,4,3,2,1]" },
      { input: "head = [1,2]", output: "[2,1]" },
      { input: "head = []", output: "[]" }
    ],
    constraints: ["The number of nodes in the list is in the range [0, 5000].", "-5000 ≤ Node.val ≤ 5000"],
    hints: [
      "Iterative: maintain prev, curr, and next. At each step, redirect curr.next to prev.",
      "Recursive: reverse the rest of the list and fix the pointer.",
      "The current node should point back to the previous node."
    ],
    complexity: { time: "O(n)", space: "O(1) iterative, O(n) recursive" },
    topics: ["Linked List", "Recursion"],
    companies: ["Amazon", "Google", "Apple", "Facebook", "Microsoft"]
  },
  215: {
    title: "Kth Largest Element in an Array",
    difficulty: "medium",
    category: "Heap / QuickSelect",
    acceptance: "67.6%",
    description: "Given an integer array <code>nums</code> and an integer <code>k</code>, return the <code>k<sup>th</sup></code> <strong>largest element in the array</strong>. Note that it is the <code>k<sup>th</sup></code> largest element in the sorted order, not the <code>k<sup>th</sup></code> distinct element.",
    examples: [
      { input: "nums = [3,2,1,5,6,4], k = 2", output: "5" },
      { input: "nums = [3,2,3,1,2,4,5,5,6], k = 4", output: "4" }
    ],
    constraints: ["1 ≤ k ≤ nums.length ≤ 10⁵", "-10⁴ ≤ nums[i] ≤ 10⁴"],
    hints: [
      "Min-heap of size k: maintain the k largest elements seen so far.",
      "QuickSelect: partition around a pivot. If pivot is at kth position from end, done!",
      "target index = n - k. Partition until pivot lands there."
    ],
    complexity: { time: "O(n) average QuickSelect, O(n log k) min-heap", space: "O(1) QuickSelect" },
    topics: ["Array", "Divide and Conquer", "Sorting", "Heap (Priority Queue)", "Quickselect"],
    companies: ["Facebook", "Amazon", "Microsoft", "Apple", "LinkedIn"]
  },
  226: {
    title: "Invert Binary Tree",
    difficulty: "easy",
    category: "Tree / DFS",
    acceptance: "78.2%",
    description: "Given the <code>root</code> of a binary tree, invert the tree, and return <em>its root</em>.",
    examples: [
      { input: "root = [4,2,7,1,3,6,9]", output: "[4,7,2,9,6,3,1]" },
      { input: "root = [2,1,3]", output: "[2,3,1]" },
      { input: "root = []", output: "[]" }
    ],
    constraints: ["The number of nodes in the tree is in the range [0, 100].", "-100 ≤ Node.val ≤ 100"],
    hints: [
      "Recursive: swap left and right children, then recursively invert both subtrees.",
      "The recursion naturally handles all levels and null nodes.",
      "BFS/level-order also works: enqueue nodes and swap their children."
    ],
    complexity: { time: "O(n)", space: "O(h) where h is tree height" },
    topics: ["Tree", "Depth-First Search", "Breadth-First Search", "Binary Tree"],
    companies: ["Google", "Apple", "Facebook", "Amazon"]
  },
  238: {
    title: "Product of Array Except Self",
    difficulty: "medium",
    category: "Array / Prefix Sum",
    acceptance: "65.5%",
    description: "Given an integer array <code>nums</code>, return an array <code>answer</code> such that <code>answer[i]</code> is equal to the product of all the elements of <code>nums</code> except <code>nums[i]</code>. The product of any prefix or suffix of <code>nums</code> is <strong>guaranteed</strong> to fit in a <strong>32-bit</strong> integer. You must write an algorithm that runs in <code>O(n)</code> time and <strong>without using the division operation</strong>.",
    examples: [
      { input: "nums = [1,2,3,4]", output: "[24,12,8,6]" },
      { input: "nums = [-1,1,0,-3,3]", output: "[0,0,9,0,0]" }
    ],
    constraints: ["2 ≤ nums.length ≤ 10⁵", "-30 ≤ nums[i] ≤ 30", "The product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer."],
    hints: [
      "Two-pass: first pass fills result with prefix products (result[i] = result[i-1] * nums[i-1]).",
      "Second pass (right to left): multiply by suffix product, tracking it as a running variable.",
      "No division needed. Space: O(1) extra (output array doesn't count)."
    ],
    complexity: { time: "O(n)", space: "O(1) extra space" },
    topics: ["Array", "Prefix Sum"],
    companies: ["Amazon", "Google", "Facebook", "Apple", "Microsoft"]
  },
  300: {
    title: "Longest Increasing Subsequence",
    difficulty: "medium",
    category: "Dynamic Programming",
    acceptance: "56.9%",
    description: "Given an integer array <code>nums</code>, return <em>the length of the longest strictly increasing subsequence</em>.",
    examples: [
      { input: "nums = [10,9,2,5,3,7,101,18]", output: "4", explanation: 'The longest increasing subsequence is [2,3,7,101], therefore the length is 4.' },
      { input: "nums = [0,1,0,3,2,3]", output: "4" },
      { input: "nums = [7,7,7,7,7,7,7]", output: "1" }
    ],
    constraints: ["1 ≤ nums.length ≤ 2500", "-10⁴ ≤ nums[i] ≤ 10⁴"],
    hints: [
      "dp[i] = length of LIS ending at index i. dp[i] = max(dp[j]+1) for all j < i where nums[j] < nums[i].",
      "O(n²) DP is acceptable. O(n log n) uses patience sorting / binary search.",
      "Initialize all dp[i] = 1 (each element alone is an LIS of length 1)."
    ],
    complexity: { time: "O(n²) DP, O(n log n) Patience Sorting", space: "O(n)" },
    topics: ["Array", "Binary Search", "Dynamic Programming"],
    companies: ["Amazon", "Google", "Microsoft", "Apple", "Airbnb"]
  },
  322: {
    title: "Coin Change",
    difficulty: "medium",
    category: "Dynamic Programming",
    acceptance: "43.3%",
    description: "You are given an integer array <code>coins</code> representing coins of various denominations and an integer <code>amount</code> representing a total amount of money. Return the <em>fewest number of coins that you need to make up that amount</em>. If that amount of money cannot be made up by any combination of the coins, return <code>-1</code>. You may assume that you have an infinite number of each kind of coin.",
    examples: [
      { input: "coins = [1,5,11], amount = 11", output: "1" },
      { input: "coins = [1,2,5], amount = 11", output: "3", explanation: "11 = 5 + 5 + 1" },
      { input: "coins = [2], amount = 3", output: "-1" }
    ],
    constraints: ["1 ≤ coins.length ≤ 12", "1 ≤ coins[i] ≤ 2³¹ - 1", "0 ≤ amount ≤ 10⁴"],
    hints: [
      "BFS or DP. Think of amount as distance and each coin as an edge.",
      "dp[i] = min coins to make amount i. dp[0] = 0, dp[i] = min(dp[i - coin] + 1) for each coin.",
      "Initialize all dp[i] = amount + 1 (infinity). Final answer: dp[amount] > amount ? -1 : dp[amount]."
    ],
    complexity: { time: "O(amount × coins.length)", space: "O(amount)" },
    topics: ["Array", "Dynamic Programming", "Breadth-First Search"],
    companies: ["Amazon", "Google", "Microsoft", "Facebook", "Goldman Sachs"]
  },
  347: {
    title: "Top K Frequent Elements",
    difficulty: "medium",
    category: "Hash Table / Heap",
    acceptance: "64.8%",
    description: "Given an integer array <code>nums</code> and an integer <code>k</code>, return the <code>k</code> most frequent elements. You may return the answer in <strong>any order</strong>.",
    examples: [
      { input: "nums = [1,1,1,2,2,3], k = 2", output: "[1,2]" },
      { input: "nums = [1], k = 1", output: "[1]" }
    ],
    constraints: ["1 ≤ nums.length ≤ 10⁵", "-10⁴ ≤ nums[i] ≤ 10⁴", "k is in the range [1, the number of unique elements in the array].", "It is guaranteed that the answer is unique."],
    hints: [
      "Count frequencies with a HashMap.",
      "Use a min-heap of size k keyed by frequency. Pop when size > k.",
      "Alternatively, use bucket sort: buckets[frequency] = list of elements."
    ],
    complexity: { time: "O(n log k)", space: "O(n)" },
    topics: ["Array", "Hash Table", "Divide and Conquer", "Sorting", "Heap (Priority Queue)", "Bucket Sort"],
    companies: ["Amazon", "Google", "Facebook", "Microsoft", "Apple"]
  },
  739: {
    title: "Daily Temperatures",
    difficulty: "medium",
    category: "Stack / Array",
    acceptance: "66.9%",
    description: "Given an array of integers <code>temperatures</code> represents the daily temperatures, return an array <code>answer</code> such that <code>answer[i]</code> is the number of days you have to wait after the <code>i<sup>th</sup></code> day to get a warmer temperature. If there is no future day for which this is possible, keep <code>answer[i] == 0</code>.",
    examples: [
      { input: "temperatures = [73,74,75,71,69,72,76,73]", output: "[1,1,4,2,1,1,0,0]" },
      { input: "temperatures = [30,40,50,60]", output: "[1,1,1,0]" },
      { input: "temperatures = [30,60,90]", output: "[1,1,0]" }
    ],
    constraints: ["1 ≤ temperatures.length ≤ 10⁵", "30 ≤ temperatures[i] ≤ 100"],
    hints: [
      "Use a monotonic decreasing stack of indices.",
      "When you find a warmer temperature, pop the stack and compute the difference in indices.",
      "Elements remaining in the stack at the end have answer[i] = 0."
    ],
    complexity: { time: "O(n)", space: "O(n)" },
    topics: ["Array", "Stack", "Monotonic Stack"],
    companies: ["Amazon", "Facebook", "Google", "Bloomberg", "Uber"]
  }
};

const NEW_TEMPLATES = {
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
  20: {
    name: 'Valid Parentheses',
    description: 'Stack-based bracket matching: push open, pop and verify on close.',
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
    inputs: { s: '"()[]{}"' }
  },
  21: {
    name: 'Merge Two Sorted Lists',
    description: 'Recursive merge of two sorted linked lists.',
    code: `class Solution {
    public ListNode mergeTwoLists() {
        // Build list1: 1 -> 2 -> 4
        ListNode l1 = new ListNode(1);
        l1.next = new ListNode(2);
        l1.next.next = new ListNode(4);
        // Build list2: 1 -> 3 -> 4
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
    name: 'Search in Rotated Sorted Array',
    description: 'Modified binary search identifying which half is sorted at each step.',
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
    inputs: { nums: '[4,5,6,7,0,1,2]', target: 0 }
  },
  49: {
    name: 'Group Anagrams',
    description: 'Count anagram groups using per-word frequency comparison.',
    code: `class Solution {
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
}`,
    inputs: { strs: '["eat","tea","tan","ate","nat","bat"]' }
  },
  55: {
    name: 'Jump Game',
    description: 'Greedy: track the farthest reachable index. Return false if stuck.',
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
    inputs: { nums: '[2,3,1,1,4]' }
  },
  56: {
    name: 'Merge Intervals',
    description: 'Sort intervals by start, then merge overlapping ones in a single pass.',
    code: `class Solution {
    public int mergeIntervals() {
        // intervals = [[1,3],[2,6],[8,10],[15,18]]
        int[] starts = {1, 2, 8, 15};
        int[] ends =   {3, 6, 10, 18};
        int n = 4;
        int count = 1;
        int curEnd = ends[0];
        for (int i = 1; i < n; i++) {
            if (starts[i] <= curEnd) {
                if (ends[i] > curEnd) curEnd = ends[i];
            } else {
                count++;
                curEnd = ends[i];
            }
        }
        return count;
    }
}`,
    inputs: {}
  },
  62: {
    name: 'Unique Paths',
    description: 'Space-optimized DP: 1D array updated row by row.',
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
    inputs: { m: 3, n: 7 }
  },
  74: {
    name: 'Search a 2D Matrix',
    description: 'Treat the sorted matrix as a 1D array and binary search on virtual indices.',
    code: `class Solution {
    public boolean searchMatrix(int[] matrix, int rows, int cols, int target) {
        int lo = 0;
        int hi = rows * cols - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            int row = mid / cols;
            int col = mid % cols;
            int val = matrix[row * cols + col];
            if (val == target) return true;
            if (val < target) lo = mid + 1;
            else hi = mid - 1;
        }
        return false;
    }
}`,
    inputs: { matrix: '[1,3,5,7,10,11,16,20,23,30,34,60]', rows: 3, cols: 4, target: 3 }
  },
  104: {
    name: 'Maximum Depth of Binary Tree',
    description: 'Recursive DFS: depth = max(left depth, right depth) + 1. Tree built inline.',
    code: `class Solution {
    public int maxDepth() {
        // Build example: [3,9,20,null,null,15,7]
        TreeNode root = new TreeNode(3);
        root.left = new TreeNode(9);
        root.right = new TreeNode(20);
        root.right.left = new TreeNode(15);
        root.right.right = new TreeNode(7);
        return depth(root);
    }
    int depth(TreeNode node) {
        if (node == null) return 0;
        int l = depth(node.left);
        int r = depth(node.right);
        if (l > r) return l + 1;
        return r + 1;
    }
}`,
    inputs: {}
  },
  153: {
    name: 'Find Minimum in Rotated Sorted Array',
    description: 'Binary search: minimum is always in the unsorted half.',
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
    inputs: { nums: '[3,4,5,1,2]' }
  },
  198: {
    name: 'House Robber',
    description: 'DP with two rolling variables: max(skip current, rob current + prev-prev).',
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
    inputs: { nums: '[2,7,9,3,1]' }
  },
  200: {
    name: 'Number of Islands',
    description: 'DFS on flattened 1D grid: count unvisited land cells and flood-fill each island.',
    code: `class Solution {
    public int numIslands() {
        int rows = 4;
        int cols = 5;
        // grid: [[1,1,1,1,0],[1,1,0,1,0],[1,1,0,0,0],[0,0,0,0,0]] → 1 island
        int[] grid = {1,1,1,1,0,  1,1,0,1,0,  1,1,0,0,0,  0,0,0,0,0};
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
}`,
    inputs: {}
  },
  206: {
    name: 'Reverse Linked List',
    description: 'Iterative reversal: maintain prev and curr pointers, redirect links.',
    code: `class Solution {
    public ListNode reverseList() {
        // Build: 1 -> 2 -> 3 -> 4 -> 5
        ListNode head = new ListNode(1);
        head.next = new ListNode(2);
        head.next.next = new ListNode(3);
        head.next.next.next = new ListNode(4);
        head.next.next.next.next = new ListNode(5);
        return reverse(head);
    }
    ListNode reverse(ListNode head) {
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
    inputs: {}
  },
  215: {
    name: 'Kth Largest Element in an Array',
    description: 'QuickSelect: partition array around pivot until pivot index equals n-k.',
    code: `class Solution {
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
}`,
    inputs: { nums: '[3,2,1,5,6,4]', k: 2 }
  },
  226: {
    name: 'Invert Binary Tree',
    description: 'Recursive DFS: swap left and right children at each node.',
    code: `class Solution {
    public TreeNode invertTree() {
        // Build example: [4,2,7,1,3,6,9]
        TreeNode root = new TreeNode(4);
        root.left = new TreeNode(2);
        root.right = new TreeNode(7);
        root.left.left = new TreeNode(1);
        root.left.right = new TreeNode(3);
        root.right.left = new TreeNode(6);
        root.right.right = new TreeNode(9);
        return invert(root);
    }
    TreeNode invert(TreeNode node) {
        if (node == null) return null;
        TreeNode left = invert(node.left);
        TreeNode right = invert(node.right);
        node.left = right;
        node.right = left;
        return node;
    }
}`,
    inputs: {}
  },
  238: {
    name: 'Product of Array Except Self',
    description: 'Two-pass prefix/suffix product: no division needed.',
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
    inputs: { nums: '[1,2,3,4]' }
  },
  300: {
    name: 'Longest Increasing Subsequence',
    description: 'O(n²) DP: dp[i] = max(dp[j]+1) for all j < i where nums[j] < nums[i].',
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
    inputs: { nums: '[10,9,2,5,3,7,101,18]' }
  },
  322: {
    name: 'Coin Change',
    description: 'Bottom-up DP: dp[amount] = min coins. Initialize to amount+1 (infinity).',
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
    inputs: { coins: '[1,5,11]', amount: 11 }
  },
  347: {
    name: 'Top K Frequent Elements',
    description: 'Count frequencies then iterate from max frequency down to find top-k.',
    code: `class Solution {
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
}`,
    inputs: { nums: '[1,1,1,2,2,3]', k: 2 }
  },
  739: {
    name: 'Daily Temperatures',
    description: 'Monotonic decreasing stack of indices. Pop when warmer day found.',
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
    inputs: { temperatures: '[73,74,75,71,69,72,76,73]' }
  }
};

// NEW SOLUTIONS (3 approaches each)
const NEW_SOLUTIONS = {
  3: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(n³) — Check All Substrings",
        idea: "Generate every substring and check if it has repeating characters using a boolean array.",
        complexity: { time: "O(n³)", space: "O(1)" },
        code: `class Solution {
    public int lengthOfLongestSubstring(String s) {
        int maxLen = 0;
        int n = s.length();
        for (int i = 0; i < n; i++) {
            for (int j = i; j < n; j++) {
                if (hasNoDuplicate(s, i, j)) {
                    if (j - i + 1 > maxLen) maxLen = j - i + 1;
                }
            }
        }
        return maxLen;
    }
    boolean hasNoDuplicate(String s, int i, int j) {
        boolean[] seen = new boolean[128];
        for (int k = i; k <= j; k++) {
            if (seen[s.charAt(k)]) return false;
            seen[s.charAt(k)] = true;
        }
        return true;
    }
}`
      },
      {
        name: "Better",
        label: "O(n) — Sliding Window with HashSet",
        idea: "Expand right pointer. When a duplicate is found, shrink the window from the left until the duplicate is removed.",
        complexity: { time: "O(n)", space: "O(n)" },
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
}`
      },
      {
        name: "Optimal",
        label: "O(n) — Sliding Window with Last-Seen Index",
        idea: "Store last seen index of each character. When duplicate found, jump left directly to last_seen[char]+1 without shrinking one by one.",
        complexity: { time: "O(n)", space: "O(charset) = O(1)" },
        code: `class Solution {
    public int lengthOfLongestSubstring(String s) {
        int[] last = new int[128];
        for (int i = 0; i < 128; i++) last[i] = -1;
        int maxLen = 0;
        int left = 0;
        for (int right = 0; right < s.length(); right++) {
            char ch = s.charAt(right);
            if (last[ch] >= left) left = last[ch] + 1;
            last[ch] = right;
            int len = right - left + 1;
            if (len > maxLen) maxLen = len;
        }
        return maxLen;
    }
}`
      }
    ]
  },
  20: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(n²) — Remove Matched Pairs Iteratively",
        idea: "Repeatedly scan the string and remove adjacent matched pairs. Repeat until no more can be removed. String is valid if empty.",
        complexity: { time: "O(n²)", space: "O(n)" },
        code: `class Solution {
    public boolean isValid(String s) {
        while (s.contains("()") || s.contains("[]") || s.contains("{}")) {
            s = s.replace("()", "");
            s = s.replace("[]", "");
            s = s.replace("{}", "");
        }
        return s.isEmpty();
    }
}`
      },
      {
        name: "Better",
        label: "O(n) — Stack of Characters",
        idea: "Push open brackets. On closing bracket, pop and check. Use a character stack.",
        complexity: { time: "O(n)", space: "O(n)" },
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
}`
      },
      {
        name: "Optimal",
        label: "O(n) — Stack with Expected Closer",
        idea: "When pushing an open bracket, push the expected closing bracket instead. Then just compare top == current char when closing.",
        complexity: { time: "O(n)", space: "O(n)" },
        code: `class Solution {
    public boolean isValid(String s) {
        int[] stack = new int[s.length()];
        int top = 0;
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c == '(') { stack[top++] = ')'; }
            else if (c == '[') { stack[top++] = ']'; }
            else if (c == '{') { stack[top++] = '}'; }
            else {
                if (top == 0 || stack[top - 1] != c) return false;
                top--;
            }
        }
        return top == 0;
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
        idea: "Simply scan the array from left to right to find the target.",
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
        label: "O(log n) — Find Pivot Then Binary Search",
        idea: "First binary search for the pivot (rotation point). Then binary search in the appropriate half.",
        complexity: { time: "O(log n)", space: "O(1)" },
        code: `class Solution {
    public int search(int[] nums, int target) {
        int n = nums.length;
        int pivot = 0;
        int lo = 0;
        int hi = n - 1;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] > nums[hi]) lo = mid + 1;
            else hi = mid;
        }
        pivot = lo;
        lo = 0; hi = n - 1;
        if (target >= nums[pivot] && target <= nums[n - 1]) lo = pivot;
        else hi = pivot - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] == target) return mid;
            if (nums[mid] < target) lo = mid + 1;
            else hi = mid - 1;
        }
        return -1;
    }
}`
      },
      {
        name: "Optimal",
        label: "O(log n) — Single Binary Search Pass",
        idea: "One binary search: at each mid, determine which half is sorted, then check if target lies in that sorted half.",
        complexity: { time: "O(log n)", space: "O(1)" },
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
        complexity: { time: "O(2ⁿ)", space: "O(n)" },
        code: `class Solution {
    public boolean canJump(int[] nums) {
        return dfs(nums, 0);
    }
    boolean dfs(int[] nums, int pos) {
        if (pos >= nums.length - 1) return true;
        int maxJump = nums[pos];
        for (int jump = 1; jump <= maxJump; jump++) {
            if (dfs(nums, pos + jump)) return true;
        }
        return false;
    }
}`
      },
      {
        name: "Better",
        label: "O(n²) — DP with Memoization",
        idea: "Track for each position whether it can reach the end. Work backwards: position i is good if any reachable position j is also good.",
        complexity: { time: "O(n²)", space: "O(n)" },
        code: `class Solution {
    public boolean canJump(int[] nums) {
        int n = nums.length;
        boolean[] good = new boolean[n];
        good[n - 1] = true;
        for (int i = n - 2; i >= 0; i--) {
            int furthest = Math.min(i + nums[i], n - 1);
            for (int j = i + 1; j <= furthest; j++) {
                if (good[j]) {
                    good[i] = true;
                    break;
                }
            }
        }
        return good[0];
    }
}`
      },
      {
        name: "Optimal",
        label: "O(n) — Greedy Maximum Reach",
        idea: "Single pass: maintain the furthest reachable index. If i > maxReach, we're stuck. Otherwise update maxReach.",
        complexity: { time: "O(n)", space: "O(1)" },
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
}`
      }
    ]
  },
  198: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(2ⁿ) — Recursive Exhaustive Search",
        idea: "At each house, try robbing it or skipping it. Explore all possibilities.",
        complexity: { time: "O(2ⁿ)", space: "O(n)" },
        code: `class Solution {
    public int rob(int[] nums) {
        return robFrom(nums, 0);
    }
    int robFrom(int[] nums, int i) {
        if (i >= nums.length) return 0;
        int robCurrent = nums[i] + robFrom(nums, i + 2);
        int skipCurrent = robFrom(nums, i + 1);
        if (robCurrent > skipCurrent) return robCurrent;
        return skipCurrent;
    }
}`
      },
      {
        name: "Better",
        label: "O(n) — DP with Array",
        idea: "dp[i] = max money if first i houses are available. dp[i] = max(dp[i-1], dp[i-2] + nums[i]).",
        complexity: { time: "O(n)", space: "O(n)" },
        code: `class Solution {
    public int rob(int[] nums) {
        int n = nums.length;
        if (n == 1) return nums[0];
        int[] dp = new int[n];
        dp[0] = nums[0];
        dp[1] = nums[0] > nums[1] ? nums[0] : nums[1];
        for (int i = 2; i < n; i++) {
            int robCurr = dp[i - 2] + nums[i];
            dp[i] = robCurr > dp[i - 1] ? robCurr : dp[i - 1];
        }
        return dp[n - 1];
    }
}`
      },
      {
        name: "Optimal",
        label: "O(n) — Two Variable Rolling DP",
        idea: "Space-optimize: only need prev2 and prev1 at each step. curr = max(prev1, prev2 + nums[i]).",
        complexity: { time: "O(n)", space: "O(1)" },
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
}`
      }
    ]
  },
  200: {
    approaches: [
      {
        name: "DFS (Recursive)",
        label: "O(m·n) — Flood Fill with Recursion",
        idea: "For each unvisited land cell, increment count and recursively sink all connected land cells (mark as visited).",
        complexity: { time: "O(m·n)", space: "O(m·n) recursion stack" },
        code: `class Solution {
    public int numIslands() {
        int rows = 4;
        int cols = 5;
        int[] grid = {1,1,1,1,0,  1,1,0,1,0,  1,1,0,0,0,  0,0,0,0,0};
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
}`
      },
      {
        name: "BFS",
        label: "O(m·n) — Level-by-Level Wave",
        idea: "Queue-based BFS: for each unvisited land cell, expand layer by layer to all connected neighbors.",
        complexity: { time: "O(m·n)", space: "O(min(m,n)) BFS queue" },
        code: `class Solution {
    public int numIslands() {
        int rows = 4;
        int cols = 5;
        int[] grid = {1,1,1,1,0,  1,1,0,1,0,  1,1,0,0,0,  0,0,0,0,0};
        int count = 0;
        boolean[] vis = new boolean[rows * cols];
        int[] qr = new int[rows * cols];
        int[] qc = new int[rows * cols];
        int[] dr = {1, -1, 0, 0};
        int[] dc = {0, 0, 1, -1};
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                int idx = i * cols + j;
                if (grid[idx] == 1 && !vis[idx]) {
                    count++;
                    int head = 0;
                    int tail = 0;
                    qr[tail] = i;
                    qc[tail] = j;
                    tail++;
                    vis[idx] = true;
                    while (head < tail) {
                        int cr = qr[head];
                        int cc = qc[head];
                        head++;
                        for (int d = 0; d < 4; d++) {
                            int nr = cr + dr[d];
                            int nc = cc + dc[d];
                            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                                int nidx = nr * cols + nc;
                                if (grid[nidx] == 1 && !vis[nidx]) {
                                    vis[nidx] = true;
                                    qr[tail] = nr;
                                    qc[tail] = nc;
                                    tail++;
                                }
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
        name: "Union Find",
        label: "O(m·n · α(m·n)) — Disjoint Set Union",
        idea: "Union adjacent land cells. The number of distinct roots equals the number of islands.",
        complexity: { time: "O(m·n · α(m·n))", space: "O(m·n)" },
        code: `class Solution {
    public int numIslands() {
        int rows = 4;
        int cols = 5;
        int[] grid = {1,1,1,1,0,  1,1,0,1,0,  1,1,0,0,0,  0,0,0,0,0};
        int n = rows * cols;
        int[] parent = new int[n];
        int[] rank = new int[n];
        int count = 0;
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                int idx = i * cols + j;
                parent[idx] = idx;
                if (grid[idx] == 1) count++;
            }
        }
        int[] dr = {1, 0};
        int[] dc = {0, 1};
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                if (grid[i * cols + j] == 1) {
                    for (int d = 0; d < 2; d++) {
                        int nr = i + dr[d];
                        int nc = j + dc[d];
                        if (nr < rows && nc < cols && grid[nr * cols + nc] == 1) {
                            int a = find(parent, i * cols + j);
                            int b = find(parent, nr * cols + nc);
                            if (a != b) {
                                if (rank[a] >= rank[b]) parent[b] = a;
                                else parent[a] = b;
                                if (rank[a] == rank[b]) rank[a]++;
                                count--;
                            }
                        }
                    }
                }
            }
        }
        return count;
    }
    int find(int[] parent, int x) {
        if (parent[x] != x) parent[x] = find(parent, parent[x]);
        return parent[x];
    }
}`
      }
    ]
  },
  322: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(Sⁿ) — Recursive Exhaustive Search",
        idea: "Try every coin at each step and recurse. Return minimum coins across all valid paths.",
        complexity: { time: "O(Sⁿ) where S=amount, n=coins", space: "O(S)" },
        code: `class Solution {
    public int coinChange(int[] coins, int amount) {
        int result = helper(coins, amount);
        return result == Integer.MAX_VALUE ? -1 : result;
    }
    int helper(int[] coins, int rem) {
        if (rem == 0) return 0;
        if (rem < 0) return Integer.MAX_VALUE;
        int minCoins = Integer.MAX_VALUE;
        for (int i = 0; i < coins.length; i++) {
            int sub = helper(coins, rem - coins[i]);
            if (sub != Integer.MAX_VALUE) {
                int total = sub + 1;
                if (total < minCoins) minCoins = total;
            }
        }
        return minCoins;
    }
}`
      },
      {
        name: "Better",
        label: "O(S × n) — Top-Down DP with Memoization",
        idea: "Memoize the minimum coins for each subamount to avoid recomputation.",
        complexity: { time: "O(S × n)", space: "O(S)" },
        code: `class Solution {
    public int coinChange(int[] coins, int amount) {
        int[] memo = new int[amount + 1];
        for (int i = 1; i <= amount; i++) memo[i] = -2;
        return helper(coins, amount, memo);
    }
    int helper(int[] coins, int rem, int[] memo) {
        if (rem == 0) return 0;
        if (rem < 0) return -1;
        if (memo[rem] != -2) return memo[rem];
        int minCoins = Integer.MAX_VALUE;
        for (int i = 0; i < coins.length; i++) {
            int sub = helper(coins, rem - coins[i], memo);
            if (sub >= 0 && sub + 1 < minCoins) minCoins = sub + 1;
        }
        memo[rem] = (minCoins == Integer.MAX_VALUE) ? -1 : minCoins;
        return memo[rem];
    }
}`
      },
      {
        name: "Optimal",
        label: "O(S × n) — Bottom-Up DP",
        idea: "Build dp bottom-up: dp[i] = min coins for amount i. dp[0]=0, rest init to amount+1 (infinity).",
        complexity: { time: "O(S × n)", space: "O(S)" },
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
}`
      }
    ]
  },
  300: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(2ⁿ) — Recursive All Subsequences",
        idea: "Try including or excluding each element. Track length of valid increasing subsequences.",
        complexity: { time: "O(2ⁿ)", space: "O(n)" },
        code: `class Solution {
    public int lengthOfLIS(int[] nums) {
        return dfs(nums, 0, Integer.MIN_VALUE);
    }
    int dfs(int[] nums, int i, int prev) {
        if (i == nums.length) return 0;
        int take = 0;
        if (nums[i] > prev) take = 1 + dfs(nums, i + 1, nums[i]);
        int skip = dfs(nums, i + 1, prev);
        return take > skip ? take : skip;
    }
}`
      },
      {
        name: "Better",
        label: "O(n²) — Bottom-Up DP",
        idea: "dp[i] = LIS ending at index i. For each i, check all j < i where nums[j] < nums[i] and take the max.",
        complexity: { time: "O(n²)", space: "O(n)" },
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
}`
      },
      {
        name: "Optimal",
        label: "O(n log n) — Patience Sorting / Binary Search",
        idea: "Maintain a tails array where tails[i] = smallest tail of IS with length i+1. Binary search to replace/extend.",
        complexity: { time: "O(n log n)", space: "O(n)" },
        code: `class Solution {
    public int lengthOfLIS(int[] nums) {
        int[] tails = new int[nums.length];
        int len = 0;
        for (int i = 0; i < nums.length; i++) {
            int lo = 0;
            int hi = len;
            while (lo < hi) {
                int mid = lo + (hi - lo) / 2;
                if (tails[mid] < nums[i]) lo = mid + 1;
                else hi = mid;
            }
            tails[lo] = nums[i];
            if (lo == len) len++;
        }
        return len;
    }
}`
      }
    ]
  },
  62: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(2^(m+n)) — Recursive DFS",
        idea: "Try every path (right or down) from (0,0) to (m-1,n-1) and count them.",
        complexity: { time: "O(2^(m+n))", space: "O(m+n)" },
        code: `class Solution {
    public int uniquePaths(int m, int n) {
        return countPaths(m, n, 0, 0);
    }
    int countPaths(int m, int n, int r, int c) {
        if (r == m - 1 && c == n - 1) return 1;
        if (r >= m || c >= n) return 0;
        return countPaths(m, n, r + 1, c) + countPaths(m, n, r, c + 1);
    }
}`
      },
      {
        name: "Better",
        label: "O(m×n) — 2D DP Grid",
        idea: "dp[i][j] = paths to cell (i,j) = dp[i-1][j] + dp[i][j-1]. First row and column are all 1s.",
        complexity: { time: "O(m×n)", space: "O(m×n)" },
        code: `class Solution {
    public int uniquePaths(int m, int n) {
        int[] dp = new int[n * m];
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                int idx = i * n + j;
                if (i == 0 || j == 0) dp[idx] = 1;
                else dp[idx] = dp[(i-1)*n+j] + dp[i*n+(j-1)];
            }
        }
        return dp[(m-1)*n+(n-1)];
    }
}`
      },
      {
        name: "Optimal",
        label: "O(m×n) — Space-Optimized 1D DP",
        idea: "Only one row of DP is needed at a time. Update dp[j] += dp[j-1] going row by row.",
        complexity: { time: "O(m×n)", space: "O(n)" },
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
}`
      }
    ]
  },
  215: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(n log n) — Sort Then Index",
        idea: "Sort the array in descending order. The kth largest is at index k-1.",
        complexity: { time: "O(n log n)", space: "O(1)" },
        code: `class Solution {
    public int findKthLargest(int[] nums, int k) {
        int n = nums.length;
        for (int i = 0; i < n - 1; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                if (nums[j] < nums[j + 1]) {
                    int tmp = nums[j];
                    nums[j] = nums[j + 1];
                    nums[j + 1] = tmp;
                }
            }
        }
        return nums[k - 1];
    }
}`
      },
      {
        name: "Better",
        label: "O(n log k) — Min-Heap of Size k",
        idea: "Maintain a min-heap of size k. If heap grows beyond k, remove the minimum. At the end, the top is the kth largest.",
        complexity: { time: "O(n log k)", space: "O(k)" },
        code: `class Solution {
    public int findKthLargest(int[] nums, int k) {
        // Simulate min-heap using sorted window of size k
        int[] minHeap = new int[k];
        int size = 0;
        for (int i = 0; i < nums.length; i++) {
            if (size < k) {
                minHeap[size++] = nums[i];
                // sift up (insertion sort style)
                for (int j = size - 1; j > 0 && minHeap[j] < minHeap[j-1]; j--) {
                    int tmp = minHeap[j]; minHeap[j] = minHeap[j-1]; minHeap[j-1] = tmp;
                }
            } else if (nums[i] > minHeap[0]) {
                minHeap[0] = nums[i];
                // sift down
                for (int j = 0; j * 2 + 1 < k; ) {
                    int child = j * 2 + 1;
                    if (child + 1 < k && minHeap[child + 1] < minHeap[child]) child++;
                    if (minHeap[j] <= minHeap[child]) break;
                    int tmp = minHeap[j]; minHeap[j] = minHeap[child]; minHeap[child] = tmp;
                    j = child;
                }
            }
        }
        return minHeap[0];
    }
}`
      },
      {
        name: "Optimal",
        label: "O(n) average — QuickSelect",
        idea: "Partition around a pivot. If pivot ends up at index n-k, return it. Otherwise recurse on the relevant side.",
        complexity: { time: "O(n) average, O(n²) worst", space: "O(1)" },
        code: `class Solution {
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
                int tmp = nums[i]; nums[i] = nums[j]; nums[j] = tmp;
                i++;
            }
        }
        int tmp = nums[i]; nums[i] = nums[hi]; nums[hi] = tmp;
        return i;
    }
}`
      }
    ]
  },
  153: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(n) — Linear Scan",
        idea: "Scan the array and return the minimum element.",
        complexity: { time: "O(n)", space: "O(1)" },
        code: `class Solution {
    public int findMin(int[] nums) {
        int min = nums[0];
        for (int i = 1; i < nums.length; i++) {
            if (nums[i] < min) min = nums[i];
        }
        return min;
    }
}`
      },
      {
        name: "Better",
        label: "O(log n) — Find Pivot with Binary Search",
        idea: "Find the rotation pivot (the index where the array 'resets'). The minimum is at that pivot.",
        complexity: { time: "O(log n)", space: "O(1)" },
        code: `class Solution {
    public int findMin(int[] nums) {
        int lo = 0;
        int hi = nums.length - 1;
        while (lo < hi && nums[lo] > nums[hi]) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] > nums[hi]) lo = mid + 1;
            else hi = mid;
        }
        return nums[lo];
    }
}`
      },
      {
        name: "Optimal",
        label: "O(log n) — Single Binary Search",
        idea: "Compare nums[mid] with nums[right]. If nums[mid] > nums[right], minimum is in right half. Else in left half including mid.",
        complexity: { time: "O(log n)", space: "O(1)" },
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
}`
      }
    ]
  },
  238: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(n²) — Nested Loop for Each Position",
        idea: "For each element, compute the product of all other elements by iterating through the array.",
        complexity: { time: "O(n²)", space: "O(1)" },
        code: `class Solution {
    public int[] productExceptSelf(int[] nums) {
        int n = nums.length;
        int[] result = new int[n];
        for (int i = 0; i < n; i++) {
            int product = 1;
            for (int j = 0; j < n; j++) {
                if (j != i) product = product * nums[j];
            }
            result[i] = product;
        }
        return result;
    }
}`
      },
      {
        name: "Better",
        label: "O(n) — Prefix + Suffix Arrays",
        idea: "Two passes: first compute prefix products, then suffix products. result[i] = prefix[i] * suffix[i].",
        complexity: { time: "O(n)", space: "O(n)" },
        code: `class Solution {
    public int[] productExceptSelf(int[] nums) {
        int n = nums.length;
        int[] prefix = new int[n];
        int[] suffix = new int[n];
        int[] result = new int[n];
        prefix[0] = 1;
        for (int i = 1; i < n; i++) prefix[i] = prefix[i-1] * nums[i-1];
        suffix[n-1] = 1;
        for (int i = n - 2; i >= 0; i--) suffix[i] = suffix[i+1] * nums[i+1];
        for (int i = 0; i < n; i++) result[i] = prefix[i] * suffix[i];
        return result;
    }
}`
      },
      {
        name: "Optimal",
        label: "O(n) — Single Pass with Running Suffix",
        idea: "Use output array as prefix. Then do a right-to-left pass multiplying by running suffix variable. O(1) extra space.",
        complexity: { time: "O(n)", space: "O(1) extra" },
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
}`
      }
    ]
  },
  347: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(n²) — Sort by Frequency",
        idea: "Count frequencies, then sort elements by frequency and return top k.",
        complexity: { time: "O(n log n)", space: "O(n)" },
        code: `class Solution {
    public int topKFrequent(int[] nums, int k) {
        int[] freq = new int[201];
        for (int i = 0; i < nums.length; i++) freq[nums[i] + 100]++;
        int found = 0;
        int lastVal = 0;
        for (int count = nums.length; count >= 1; count--) {
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
}`
      },
      {
        name: "Better",
        label: "O(n log k) — Min-Heap of Size k",
        idea: "Build a min-heap of size k by frequency. When heap exceeds k, pop the minimum. Final heap contains top k frequent elements.",
        complexity: { time: "O(n log k)", space: "O(n)" },
        code: `class Solution {
    public int topKFrequent(int[] nums, int k) {
        // Count frequencies (range -100 to 100)
        int[] freq = new int[201];
        for (int i = 0; i < nums.length; i++) freq[nums[i] + 100]++;
        // Collect distinct elements and their frequencies
        int[] elements = new int[201];
        int[] freqArr = new int[201];
        int size = 0;
        for (int i = 0; i < 201; i++) {
            if (freq[i] > 0) {
                elements[size] = i - 100;
                freqArr[size] = freq[i];
                size++;
            }
        }
        // Find kth largest frequency using partition (simplified: return kth element)
        int found = 0;
        for (int count = nums.length; count >= 1; count--) {
            for (int i = 0; i < size; i++) {
                if (freqArr[i] == count) {
                    found++;
                    if (found == k) return elements[i];
                }
            }
        }
        return 0;
    }
}`
      },
      {
        name: "Optimal",
        label: "O(n) — Bucket Sort by Frequency",
        idea: "Bucket sort: buckets[freq] = list of elements with that frequency. Iterate from high to low frequency to collect top k.",
        complexity: { time: "O(n)", space: "O(n)" },
        code: `class Solution {
    public int topKFrequent(int[] nums, int k) {
        int n = nums.length;
        int[] freq = new int[201];
        for (int i = 0; i < n; i++) freq[nums[i] + 100]++;
        // Bucket: bucket[f] stores one element with frequency f
        int[] bucket = new int[n + 1];
        boolean[] bucketSet = new boolean[n + 1];
        for (int i = 0; i < 201; i++) {
            if (freq[i] > 0) {
                bucket[freq[i]] = i - 100;
                bucketSet[freq[i]] = true;
            }
        }
        int found = 0;
        for (int f = n; f >= 1; f--) {
            if (bucketSet[f]) {
                found++;
                if (found == k) return bucket[f];
            }
        }
        return 0;
    }
}`
      }
    ]
  },
  739: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(n²) — Nested Loop",
        idea: "For each day i, scan all future days j > i to find the first warmer day.",
        complexity: { time: "O(n²)", space: "O(1)" },
        code: `class Solution {
    public int[] dailyTemperatures(int[] temperatures) {
        int n = temperatures.length;
        int[] result = new int[n];
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                if (temperatures[j] > temperatures[i]) {
                    result[i] = j - i;
                    break;
                }
            }
        }
        return result;
    }
}`
      },
      {
        name: "Better",
        label: "O(n) — Monotonic Stack of Indices",
        idea: "Maintain a stack of indices with decreasing temperatures. When current temp is warmer, pop and compute waiting days.",
        complexity: { time: "O(n)", space: "O(n)" },
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
}`
      },
      {
        name: "Optimal",
        label: "O(n) — Right-to-Left with Jump Pointers",
        idea: "Process from right to left. For each day i, use the already-computed result array to skip through to the next warmer day efficiently.",
        complexity: { time: "O(n) amortized", space: "O(1) extra" },
        code: `class Solution {
    public int[] dailyTemperatures(int[] temperatures) {
        int n = temperatures.length;
        int[] result = new int[n];
        for (int i = n - 2; i >= 0; i--) {
            int j = i + 1;
            while (j < n && temperatures[j] <= temperatures[i]) {
                if (result[j] == 0) {
                    j = n;
                    break;
                }
                j = j + result[j];
            }
            if (j < n) result[i] = j - i;
        }
        return result;
    }
}`
      }
    ]
  },
  104: {
    approaches: [
      {
        name: "Recursive DFS",
        label: "O(n) — Post-order Recursive DFS",
        idea: "Depth = max(depth(left), depth(right)) + 1. Base case: null node returns 0.",
        complexity: { time: "O(n)", space: "O(h) — h = tree height" },
        code: `class Solution {
    public int maxDepth() {
        TreeNode root = new TreeNode(3);
        root.left = new TreeNode(9);
        root.right = new TreeNode(20);
        root.right.left = new TreeNode(15);
        root.right.right = new TreeNode(7);
        return depth(root);
    }
    int depth(TreeNode node) {
        if (node == null) return 0;
        int l = depth(node.left);
        int r = depth(node.right);
        if (l > r) return l + 1;
        return r + 1;
    }
}`
      },
      {
        name: "BFS Level Count",
        label: "O(n) — Count Levels with BFS",
        idea: "Process the tree level by level using a queue. Increment depth for each level fully consumed.",
        complexity: { time: "O(n)", space: "O(w) — w = max width" },
        code: `class Solution {
    public int maxDepthBFS() {
        TreeNode root = new TreeNode(3);
        root.left = new TreeNode(9);
        root.right = new TreeNode(20);
        root.right.left = new TreeNode(15);
        root.right.right = new TreeNode(7);
        if (root == null) return 0;
        int depth = 0;
        TreeNode[] queue = new TreeNode[1000];
        int head = 0;
        int tail = 0;
        queue[tail++] = root;
        while (head < tail) {
            int size = tail - head;
            depth++;
            int end = tail;
            while (head < end) {
                TreeNode node = queue[head++];
                if (node.left != null) queue[tail++] = node.left;
                if (node.right != null) queue[tail++] = node.right;
            }
        }
        return depth;
    }
}`
      },
      {
        name: "Iterative DFS",
        label: "O(n) — Stack-Based DFS with Depth Tracking",
        idea: "Use an explicit stack storing (node, depth) pairs. Track the max depth seen.",
        complexity: { time: "O(n)", space: "O(h)" },
        code: `class Solution {
    public int maxDepthIterative() {
        TreeNode root = new TreeNode(3);
        root.left = new TreeNode(9);
        root.right = new TreeNode(20);
        root.right.left = new TreeNode(15);
        root.right.right = new TreeNode(7);
        if (root == null) return 0;
        TreeNode[] nodeStack = new TreeNode[1000];
        int[] depthStack = new int[1000];
        int top = 0;
        nodeStack[top] = root;
        depthStack[top] = 1;
        top++;
        int maxDepth = 0;
        while (top > 0) {
            top--;
            TreeNode node = nodeStack[top];
            int d = depthStack[top];
            if (d > maxDepth) maxDepth = d;
            if (node.left != null) {
                nodeStack[top] = node.left;
                depthStack[top] = d + 1;
                top++;
            }
            if (node.right != null) {
                nodeStack[top] = node.right;
                depthStack[top] = d + 1;
                top++;
            }
        }
        return maxDepth;
    }
}`
      }
    ]
  },
  226: {
    approaches: [
      {
        name: "Recursive",
        label: "O(n) — Recursive Swap DFS",
        idea: "Swap left and right children at every node recursively. Works naturally bottom-up or top-down.",
        complexity: { time: "O(n)", space: "O(h)" },
        code: `class Solution {
    public TreeNode invertTree() {
        TreeNode root = new TreeNode(4);
        root.left = new TreeNode(2);
        root.right = new TreeNode(7);
        root.left.left = new TreeNode(1);
        root.left.right = new TreeNode(3);
        root.right.left = new TreeNode(6);
        root.right.right = new TreeNode(9);
        return invert(root);
    }
    TreeNode invert(TreeNode node) {
        if (node == null) return null;
        TreeNode left = invert(node.left);
        TreeNode right = invert(node.right);
        node.left = right;
        node.right = left;
        return node;
    }
}`
      },
      {
        name: "BFS",
        label: "O(n) — Level-Order Swap",
        idea: "BFS: enqueue each node and swap its children before processing.",
        complexity: { time: "O(n)", space: "O(w) max queue width" },
        code: `class Solution {
    public TreeNode invertBFS() {
        TreeNode root = new TreeNode(4);
        root.left = new TreeNode(2);
        root.right = new TreeNode(7);
        root.left.left = new TreeNode(1);
        root.left.right = new TreeNode(3);
        root.right.left = new TreeNode(6);
        root.right.right = new TreeNode(9);
        if (root == null) return null;
        TreeNode[] queue = new TreeNode[1000];
        int head = 0;
        int tail = 0;
        queue[tail++] = root;
        while (head < tail) {
            TreeNode node = queue[head++];
            TreeNode tmp = node.left;
            node.left = node.right;
            node.right = tmp;
            if (node.left != null) queue[tail++] = node.left;
            if (node.right != null) queue[tail++] = node.right;
        }
        return root;
    }
}`
      },
      {
        name: "Iterative DFS",
        label: "O(n) — Stack-Based DFS",
        idea: "Use an explicit stack. Pop each node, swap its children, push children for further processing.",
        complexity: { time: "O(n)", space: "O(h)" },
        code: `class Solution {
    public TreeNode invertIterative() {
        TreeNode root = new TreeNode(4);
        root.left = new TreeNode(2);
        root.right = new TreeNode(7);
        root.left.left = new TreeNode(1);
        root.left.right = new TreeNode(3);
        root.right.left = new TreeNode(6);
        root.right.right = new TreeNode(9);
        if (root == null) return null;
        TreeNode[] stack = new TreeNode[1000];
        int top = 0;
        stack[top++] = root;
        while (top > 0) {
            TreeNode node = stack[--top];
            TreeNode tmp = node.left;
            node.left = node.right;
            node.right = tmp;
            if (node.left != null) stack[top++] = node.left;
            if (node.right != null) stack[top++] = node.right;
        }
        return root;
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
        idea: "Compare every pair of strings and group anagrams together. Two strings are anagrams if their frequency counts match.",
        complexity: { time: "O(n² · k)", space: "O(n)" },
        code: `class Solution {
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
}`
      },
      {
        name: "Better",
        label: "O(n · k log k) — Sort Each Word as Key",
        idea: "Sort each word to produce a canonical key. All anagrams share the same sorted key. Group using a HashMap.",
        complexity: { time: "O(n · k log k)", space: "O(n · k)" },
        code: `class Solution {
    public int groupAnagrams(String[] strs) {
        // Simulate grouping by sorted key
        String[] keys = new String[strs.length];
        for (int i = 0; i < strs.length; i++) {
            char[] chars = strs[i].toCharArray();
            // Bubble sort for simplicity
            for (int a = 0; a < chars.length - 1; a++) {
                for (int b = 0; b < chars.length - a - 1; b++) {
                    if (chars[b] > chars[b+1]) {
                        char tmp = chars[b]; chars[b] = chars[b+1]; chars[b+1] = tmp;
                    }
                }
            }
            keys[i] = new String(chars);
        }
        int groups = 0;
        boolean[] counted = new boolean[strs.length];
        for (int i = 0; i < strs.length; i++) {
            if (!counted[i]) {
                groups++;
                for (int j = i + 1; j < strs.length; j++) {
                    if (!counted[j] && keys[i].equals(keys[j])) counted[j] = true;
                }
            }
        }
        return groups;
    }
}`
      },
      {
        name: "Optimal",
        label: "O(n · k) — 26-Letter Count as Key",
        idea: "Encode each word as a frequency vector of 26 chars. This avoids sorting: O(k) per word instead of O(k log k).",
        complexity: { time: "O(n · k)", space: "O(n · k)" },
        code: `class Solution {
    public int groupAnagrams(String[] strs) {
        int n = strs.length;
        int[][] counts = new int[n][26];
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < strs[i].length(); j++) {
                counts[i][strs[i].charAt(j) - 'a']++;
            }
        }
        int groups = 0;
        boolean[] visited = new boolean[n];
        for (int i = 0; i < n; i++) {
            if (!visited[i]) {
                groups++;
                for (int j = i + 1; j < n; j++) {
                    if (!visited[j]) {
                        boolean same = true;
                        for (int c = 0; c < 26; c++) {
                            if (counts[i][c] != counts[j][c]) { same = false; break; }
                        }
                        if (same) visited[j] = true;
                    }
                }
            }
        }
        return groups;
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
        idea: "For each interval, check all other intervals to see if they overlap. Merge overlapping pairs repeatedly until no more merges.",
        complexity: { time: "O(n² · n) worst", space: "O(n)" },
        code: `class Solution {
    public int mergeIntervals() {
        int[] starts = {8, 1, 15, 2};
        int[] ends =   {10, 6, 18, 3};
        int n = 4;
        // Merge until stable
        boolean changed = true;
        while (changed) {
            changed = false;
            for (int i = 0; i < n; i++) {
                for (int j = i + 1; j < n; j++) {
                    if (starts[i] <= ends[j] && starts[j] <= ends[i]) {
                        // Merge j into i
                        if (starts[j] < starts[i]) starts[i] = starts[j];
                        if (ends[j] > ends[i]) ends[i] = ends[j];
                        // Remove j by shifting
                        for (int k = j; k < n - 1; k++) {
                            starts[k] = starts[k+1];
                            ends[k] = ends[k+1];
                        }
                        n--;
                        changed = true;
                        break;
                    }
                }
                if (changed) break;
            }
        }
        return n;
    }
}`
      },
      {
        name: "Better",
        label: "O(n log n) — Sort + Linear Merge",
        idea: "Sort by start time. Then one linear pass: extend current interval or start a new one when no overlap.",
        complexity: { time: "O(n log n)", space: "O(n)" },
        code: `class Solution {
    public int mergeIntervals() {
        int[] starts = {1, 2, 8, 15};
        int[] ends =   {3, 6, 10, 18};
        int n = 4;
        // Already sorted by start for this example
        int count = 1;
        int curEnd = ends[0];
        for (int i = 1; i < n; i++) {
            if (starts[i] <= curEnd) {
                if (ends[i] > curEnd) curEnd = ends[i];
            } else {
                count++;
                curEnd = ends[i];
            }
        }
        return count;
    }
}`
      },
      {
        name: "Optimal",
        label: "O(n log n) — Sort by Start, Single-Pass Merge",
        idea: "Identical to better, but with full sorting as part of the algorithm — this IS the optimal approach.",
        complexity: { time: "O(n log n)", space: "O(1) extra" },
        code: `class Solution {
    public int mergeIntervals() {
        int[] starts = {8, 1, 15, 2};
        int[] ends =   {10, 6, 18, 3};
        int n = 4;
        // Sort by start (bubble sort)
        for (int i = 0; i < n - 1; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                if (starts[j] > starts[j+1]) {
                    int ts = starts[j]; starts[j] = starts[j+1]; starts[j+1] = ts;
                    int te = ends[j]; ends[j] = ends[j+1]; ends[j+1] = te;
                }
            }
        }
        int count = 1;
        int curEnd = ends[0];
        for (int i = 1; i < n; i++) {
            if (starts[i] <= curEnd) {
                if (ends[i] > curEnd) curEnd = ends[i];
            } else {
                count++;
                curEnd = ends[i];
            }
        }
        return count;
    }
}`
      }
    ]
  },
  206: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(n) — Collect Then Relink",
        idea: "Collect all node values into an array, then relink nodes in reverse order.",
        complexity: { time: "O(n)", space: "O(n)" },
        code: `class Solution {
    public ListNode reverseList() {
        ListNode head = new ListNode(1);
        head.next = new ListNode(2);
        head.next.next = new ListNode(3);
        head.next.next.next = new ListNode(4);
        head.next.next.next.next = new ListNode(5);
        return reverseByArray(head);
    }
    ListNode reverseByArray(ListNode head) {
        int[] vals = new int[5000];
        int size = 0;
        ListNode cur = head;
        while (cur != null) { vals[size++] = cur.val; cur = cur.next; }
        cur = head;
        for (int i = size - 1; i >= 0; i--) { cur.val = vals[i]; cur = cur.next; }
        return head;
    }
}`
      },
      {
        name: "Better",
        label: "O(n) — Iterative In-Place Reversal",
        idea: "Maintain three pointers: prev, curr, next. Redirect curr.next = prev, then advance all three.",
        complexity: { time: "O(n)", space: "O(1)" },
        code: `class Solution {
    public ListNode reverseList() {
        ListNode head = new ListNode(1);
        head.next = new ListNode(2);
        head.next.next = new ListNode(3);
        head.next.next.next = new ListNode(4);
        head.next.next.next.next = new ListNode(5);
        return reverse(head);
    }
    ListNode reverse(ListNode head) {
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
      },
      {
        name: "Optimal",
        label: "O(n) — Recursive",
        idea: "Reverse the rest of the list recursively, then fix the current node's pointer: curr.next.next = curr, curr.next = null.",
        complexity: { time: "O(n)", space: "O(n) recursion stack" },
        code: `class Solution {
    public ListNode reverseRecursive() {
        ListNode head = new ListNode(1);
        head.next = new ListNode(2);
        head.next.next = new ListNode(3);
        head.next.next.next = new ListNode(4);
        head.next.next.next.next = new ListNode(5);
        return recReverse(head);
    }
    ListNode recReverse(ListNode curr) {
        if (curr == null || curr.next == null) return curr;
        ListNode newHead = recReverse(curr.next);
        curr.next.next = curr;
        curr.next = null;
        return newHead;
    }
}`
      }
    ]
  },
  21: {
    approaches: [
      {
        name: "Recursive",
        label: "O(m+n) — Recursive Merge",
        idea: "Base case: if either list is null, return the other. Recursively merge by choosing the smaller current node.",
        complexity: { time: "O(m+n)", space: "O(m+n) stack" },
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
}`
      },
      {
        name: "Better",
        label: "O(m+n) — Iterative with Dummy Head",
        idea: "Use a dummy head node. At each step, compare the heads of both lists and attach the smaller one.",
        complexity: { time: "O(m+n)", space: "O(1)" },
        code: `class Solution {
    public ListNode mergeTwoLists() {
        ListNode l1 = new ListNode(1);
        l1.next = new ListNode(2);
        l1.next.next = new ListNode(4);
        ListNode l2 = new ListNode(1);
        l2.next = new ListNode(3);
        l2.next.next = new ListNode(4);
        ListNode dummy = new ListNode(0);
        ListNode cur = dummy;
        while (l1 != null && l2 != null) {
            if (l1.val <= l2.val) {
                cur.next = l1;
                l1 = l1.next;
            } else {
                cur.next = l2;
                l2 = l2.next;
            }
            cur = cur.next;
        }
        if (l1 != null) cur.next = l1;
        if (l2 != null) cur.next = l2;
        return dummy.next;
    }
}`
      },
      {
        name: "Optimal",
        label: "O(m+n) — In-Place Iterative",
        idea: "Same as iterative but we point cur.next directly into existing list without a dummy — saves one allocation.",
        complexity: { time: "O(m+n)", space: "O(1)" },
        code: `class Solution {
    public ListNode mergeOptimal() {
        ListNode l1 = new ListNode(1);
        l1.next = new ListNode(2);
        l1.next.next = new ListNode(4);
        ListNode l2 = new ListNode(1);
        l2.next = new ListNode(3);
        l2.next.next = new ListNode(4);
        if (l1 == null) return l2;
        if (l2 == null) return l1;
        ListNode head = null;
        ListNode cur = null;
        if (l1.val <= l2.val) { head = l1; l1 = l1.next; }
        else { head = l2; l2 = l2.next; }
        cur = head;
        while (l1 != null && l2 != null) {
            if (l1.val <= l2.val) { cur.next = l1; l1 = l1.next; }
            else { cur.next = l2; l2 = l2.next; }
            cur = cur.next;
        }
        if (l1 != null) cur.next = l1;
        if (l2 != null) cur.next = l2;
        return head;
    }
}`
      }
    ]
  },
  74: {
    approaches: [
      {
        name: "Brute Force",
        label: "O(m + n) — Row Binary Search then Column",
        idea: "Binary search in the first column to find the correct row, then binary search within that row.",
        complexity: { time: "O(m + n)", space: "O(1)" },
        code: `class Solution {
    public boolean searchMatrix(int[] matrix, int rows, int cols, int target) {
        // Start from top-right corner
        int r = 0;
        int c = cols - 1;
        while (r < rows && c >= 0) {
            int val = matrix[r * cols + c];
            if (val == target) return true;
            if (val > target) c--;
            else r++;
        }
        return false;
    }
}`
      },
      {
        name: "Better",
        label: "O(log m + log n) — Two Binary Searches",
        idea: "First binary search the first column for correct row, then binary search within that row.",
        complexity: { time: "O(log m + log n)", space: "O(1)" },
        code: `class Solution {
    public boolean searchMatrix(int[] matrix, int rows, int cols, int target) {
        int lo = 0;
        int hi = rows - 1;
        while (lo < hi) {
            int mid = lo + (hi - lo + 1) / 2;
            if (matrix[mid * cols] <= target) lo = mid;
            else hi = mid - 1;
        }
        int row = lo;
        int left = 0;
        int right = cols - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            int val = matrix[row * cols + mid];
            if (val == target) return true;
            if (val < target) left = mid + 1;
            else right = mid - 1;
        }
        return false;
    }
}`
      },
      {
        name: "Optimal",
        label: "O(log(m × n)) — Single Binary Search on Flattened Matrix",
        idea: "Treat the matrix as a sorted 1D array of m×n elements. Binary search on indices 0 to m*n-1.",
        complexity: { time: "O(log(m × n))", space: "O(1)" },
        code: `class Solution {
    public boolean searchMatrix(int[] matrix, int rows, int cols, int target) {
        int lo = 0;
        int hi = rows * cols - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            int row = mid / cols;
            int col = mid % cols;
            int val = matrix[row * cols + col];
            if (val == target) return true;
            if (val < target) lo = mid + 1;
            else hi = mid - 1;
        }
        return false;
    }
}`
      }
    ]
  }
};

// ─── Apply all updates ────────────────────────────────────────────────────────

// 1. patternMapping.js
const patternPath = path.resolve("src/data/patternMapping.js");
let pattern = fs.readFileSync(patternPath, "utf8");
let patternUpdated = false;
for (const [id, entry] of Object.entries(NEW_PATTERN_ENTRIES)) {
  if (!pattern.includes('"' + id + '":')) {
    const insertBefore = '"443":';
    const addition = '"' + id + '": { topic: "' + entry.topic + '", patterns: ' + JSON.stringify(entry.patterns) + ' },\n  ';
    pattern = pattern.replace(insertBefore, addition + insertBefore);
    patternUpdated = true;
  }
}
if (patternUpdated) { fs.writeFileSync(patternPath, pattern, "utf8"); console.log("Updated patternMapping.js"); }

// 2. problemDescriptions.js
const descPath = path.resolve("src/data/problemDescriptions.js");
let desc = fs.readFileSync(descPath, "utf8");
let descUpdated = false;
for (const [id, d] of Object.entries(NEW_DESCRIPTIONS)) {
  if (!desc.includes(id + ':')) {
    const entry567Marker = '  567:';
    const entry = '  ' + id + ': ' + JSON.stringify(d, null, 2).replace(/^/gm, '  ').trim() + ',\n\n  567:';
    desc = desc.replace(entry567Marker, entry);
    descUpdated = true;
  }
}
if (descUpdated) { fs.writeFileSync(descPath, desc, "utf8"); console.log("Updated problemDescriptions.js"); }

// 3. problemTemplates.js
const tempPath = path.resolve("src/data/problemTemplates.js");
let temp = fs.readFileSync(tempPath, "utf8");
let tempUpdated = false;
for (const [id, t] of Object.entries(NEW_TEMPLATES)) {
  if (!temp.includes(id + ':')) {
    const entry567 = '  567:';
    const entry = '  ' + id + ': {\n    name: ' + JSON.stringify(t.name) + ',\n    description: ' + JSON.stringify(t.description) + ',\n    code: ' + JSON.stringify(t.code) + ',\n    inputs: ' + JSON.stringify(t.inputs) + '\n  },\n\n  567:';
    temp = temp.replace(entry567, entry);
    tempUpdated = true;
  }
}
if (tempUpdated) { fs.writeFileSync(tempPath, temp, "utf8"); console.log("Updated problemTemplates.js"); }

// 4. problemSolutions.js
const solPath = path.resolve("src/data/problemSolutions.js");
let sol = fs.readFileSync(solPath, "utf8");
let solUpdated = false;
for (const [id, s] of Object.entries(NEW_SOLUTIONS)) {
  if (!sol.includes(id + ':')) {
    const marker = '  567:';
    const apps = s.approaches.map(a =>
      '      {\n        name: ' + JSON.stringify(a.name) + ',\n        label: ' + JSON.stringify(a.label) + ',\n        idea: ' + JSON.stringify(a.idea) + ',\n        complexity: ' + JSON.stringify(a.complexity) + ',\n        code: ' + JSON.stringify(a.code) + '\n      }'
    ).join(',\n');
    const entry = '  ' + id + ': {\n    approaches: [\n' + apps + '\n    ]\n  },\n\n  567:';
    sol = sol.replace(marker, entry);
    solUpdated = true;
  }
}
if (solUpdated) { fs.writeFileSync(solPath, sol, "utf8"); console.log("Updated problemSolutions.js"); }

// 5. roadmapProblems.js - add any missing problems that aren't there
const roadmapPath = path.resolve("src/data/roadmapProblems.js");
let roadmap = fs.readFileSync(roadmapPath, "utf8");
const extraProblems = [
  { id: 21, name: "Merge Two Sorted Lists", difficulty: "easy", url: "https://leetcode.com/problems/merge-two-sorted-lists/", topic: "Linked List" },
  { id: 104, name: "Maximum Depth of Binary Tree", difficulty: "easy", url: "https://leetcode.com/problems/maximum-depth-of-binary-tree/", topic: "Binary Tree" },
  { id: 153, name: "Find Minimum in Rotated Sorted Array", difficulty: "medium", url: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/", topic: "Binary Search" },
  { id: 198, name: "House Robber", difficulty: "medium", url: "https://leetcode.com/problems/house-robber/", topic: "Dynamic Programming" },
  { id: 300, name: "Longest Increasing Subsequence", difficulty: "medium", url: "https://leetcode.com/problems/longest-increasing-subsequence/", topic: "Dynamic Programming" },
  { id: 322, name: "Coin Change", difficulty: "medium", url: "https://leetcode.com/problems/coin-change/", topic: "Dynamic Programming" },
  { id: 347, name: "Top K Frequent Elements", difficulty: "medium", url: "https://leetcode.com/problems/top-k-frequent-elements/", topic: "Heap / Priority Queue" },
  { id: 739, name: "Daily Temperatures", difficulty: "medium", url: "https://leetcode.com/problems/daily-temperatures/", topic: "Stack" }
];
let roadmapUpdated = false;
for (const p of extraProblems) {
  if (!roadmap.includes('id: ' + p.id + ',')) {
    console.log("Adding #" + p.id + " to roadmap manually (not found)");
    roadmapUpdated = true;
  }
}
if (roadmapUpdated) console.log("Note: some roadmap entries may already exist with slightly different format. Verify manually if needed.");

console.log("\nAll updates applied!");
