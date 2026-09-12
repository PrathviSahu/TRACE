const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

// ─── 1. Roadmap Updates ─────────────────────────────────────────────────────
const roadmapPath = path.join(root, "src/data/roadmapProblems.js");
let roadmapContent = fs.readFileSync(roadmapPath, "utf8");

// Check and add 42 to Two Pointers
if (!roadmapContent.includes("id: 42,")) {
  const marker = '"Two Pointers": [\n';
  const item = '    { id: 42, name: "Trapping Rain Water", difficulty: "hard", url: "https://leetcode.com/problems/trapping-rain-water/" },\n';
  roadmapContent = roadmapContent.replace(marker, marker + item);
  console.log("Added LC 42 to Two Pointers in roadmap");
}

// Check and add 139, 416, 1143 to Dynamic Programming
if (!roadmapContent.includes("id: 139,")) {
  const marker = '"Dynamic Programming": [\n';
  const items = 
    '    { id: 139, name: "Word Break", difficulty: "medium", url: "https://leetcode.com/problems/word-break/" },\n' +
    '    { id: 416, name: "Partition Equal Subset Sum", difficulty: "medium", url: "https://leetcode.com/problems/partition-equal-subset-sum/" },\n' +
    '    { id: 1143, name: "Longest Common Subsequence", difficulty: "medium", url: "https://leetcode.com/problems/longest-common-subsequence/" },\n';
  roadmapContent = roadmapContent.replace(marker, marker + items);
  console.log("Added LC 139, 416, 1143 to Dynamic Programming in roadmap");
}
fs.writeFileSync(roadmapPath, roadmapContent, "utf8");

// ─── 2. Pattern Mapping Updates ─────────────────────────────────────────────
const patternPath = path.join(root, "src/data/patternMapping.js");
let patternContent = fs.readFileSync(patternPath, "utf8");

const missingPatterns = {
  "91":  '{ topic: "Dynamic Programming", patterns: ["1D State DP"] }',
  "547": '{ topic: "Graph", patterns: ["DFS", "BFS", "Union Find"] }'
};

let patternAdded = 0;
for (const [id, val] of Object.entries(missingPatterns)) {
  if (!patternContent.includes(`"${id}":`)) {
    // Insert before the closing `};` of CURATED_PROBLEM_PATTERNS
    const insertIdx = patternContent.indexOf('  // ── Bitwise');
    if (insertIdx !== -1) {
      patternContent = patternContent.slice(0, insertIdx) + `  "${id}":  ${val},\n` + patternContent.slice(insertIdx);
      patternAdded++;
    }
  }
}
fs.writeFileSync(patternPath, patternContent, "utf8");
console.log(`Added ${patternAdded} pattern mappings.`);

// ─── 3. Problem Descriptions Updates ────────────────────────────────────────
const descPath = path.join(root, "src/data/problemDescriptions.js");
let descContent = fs.readFileSync(descPath, "utf8");

const NEW_DESCRIPTIONS = {
  19: {
    title: "Remove Nth Node From End of List",
    difficulty: "medium",
    category: "Linked List / Two Pointers",
    acceptance: "44.1%",
    description: "Given the <code>head</code> of a linked list, remove the <code>n<sup>th</sup></code> node from the end of the list and return its head.",
    examples: [
      { input: "head = [1,2,3,4,5], n = 2", output: "[1,2,3,5]", explanation: "The 2nd node from the end is node 4. After removing it, the list is [1,2,3,5]." },
      { input: "head = [1], n = 1", output: "[]", explanation: "Removing the only node leaves an empty list." },
      { input: "head = [1,2], n = 1", output: "[1]", explanation: "Removing the last node leaves [1]." }
    ],
    constraints: [
      "The number of nodes in the list is sz.",
      "1 ≤ sz ≤ 30",
      "0 ≤ Node.val ≤ 100",
      "1 ≤ n ≤ sz"
    ],
    hints: [
      "Use two pointers (fast and slow) with a gap of n nodes between them.",
      "A dummy node before the head helps handle edge cases where the head itself must be removed.",
      "Advance fast by n+1 steps, then advance both until fast reaches null. Slow will point right before the node to delete."
    ],
    complexity: { time: "O(sz) — One pass", space: "O(1)" },
    topics: ["Linked List", "Two Pointers"],
    companies: ["Amazon", "Microsoft", "Google", "Facebook", "Apple"]
  },
  39: {
    title: "Combination Sum",
    difficulty: "medium",
    category: "Backtracking / Recursion",
    acceptance: "70.2%",
    description: "Given an array of distinct integers <code>candidates</code> and a target integer <code>target</code>, return a list of all <strong>unique combinations</strong> of <code>candidates</code> where the chosen numbers sum to <code>target</code>. You may return the combinations in any order. The same number may be chosen from <code>candidates</code> an <strong>unlimited number of times</strong>.",
    examples: [
      { input: "candidates = [2,3,6,7], target = 7", output: "[[2,2,3],[7]]", explanation: "2 and 3 are candidates, and 2 + 2 + 3 = 7. Note that 2 can be used multiple times. 7 is a candidate, and 7 = 7." },
      { input: "candidates = [2,3,5], target = 8", output: "[[2,2,2,2],[2,3,3],[3,5]]", explanation: "All three combinations sum to 8." },
      { input: "candidates = [2], target = 1", output: "[]", explanation: "No combination can sum to 1." }
    ],
    constraints: [
      "1 ≤ candidates.length ≤ 30",
      "2 ≤ candidates[i] ≤ 40",
      "All elements of candidates are distinct.",
      "1 ≤ target ≤ 40"
    ],
    hints: [
      "Use backtracking to explore candidate choices.",
      "At each step, decide to either reuse the current candidate or advance to the next candidate index.",
      "Sorting candidates allows early termination (pruning) when candidates[i] > remaining target."
    ],
    complexity: { time: "O(2^target)", space: "O(target) — recursion call stack" },
    topics: ["Array", "Backtracking"],
    companies: ["Amazon", "Microsoft", "Airbnb", "Google", "Facebook"]
  },
  42: {
    title: "Trapping Rain Water",
    difficulty: "hard",
    category: "Two Pointers / Stack / DP",
    acceptance: "61.3%",
    description: "Given <code>n</code> non-negative integers representing an elevation map where the width of each bar is <code>1</code>, compute how much water it can trap after raining.",
    examples: [
      { input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]", output: "6", explanation: "The above elevation map is represented by array [0,1,0,2,1,0,1,3,2,1,2,1]. In this case, 6 units of rain water are being trapped." },
      { input: "height = [4,2,0,3,2,5]", output: "9", explanation: "The elevation map traps 9 units of rain water." }
    ],
    constraints: [
      "n == height.length",
      "1 ≤ n ≤ 2 × 10⁴",
      "0 ≤ height[i] ≤ 10⁵"
    ],
    hints: [
      "For each bar, the amount of water trapped above it is min(max_left, max_right) - height[i].",
      "You can precompute max_left and max_right using DP arrays in O(n) time and O(n) space.",
      "To optimize to O(1) space, use two pointers from left and right moving towards the highest peak."
    ],
    complexity: { time: "O(n)", space: "O(1) with Two Pointers" },
    topics: ["Array", "Two Pointers", "Dynamic Programming", "Stack", "Monotonic Stack"],
    companies: ["Goldman Sachs", "Amazon", "Google", "Facebook", "Bloomberg"]
  },
  76: {
    title: "Minimum Window Substring",
    difficulty: "hard",
    category: "Sliding Window / Hash Table",
    acceptance: "42.8%",
    description: "Given two strings <code>s</code> and <code>t</code> of lengths <code>m</code> and <code>n</code> respectively, return the <strong>minimum window substring</strong> of <code>s</code> such that every character in <code>t</code> (including duplicates) is included in the window. If there is no such substring, return the empty string <code>\"\"</code>.",
    examples: [
      { input: 's = "ADOBECODEBANC", t = "ABC"', output: '"BANC"', explanation: 'The minimum window substring "BANC" includes \'A\', \'B\', and \'C\' from string t.' },
      { input: 's = "a", t = "a"', output: '"a"', explanation: 'The entire string s is the minimum window.' },
      { input: 's = "a", t = "aa"', output: '""', explanation: 'Both \'a\'s from t must be included in the window. Since s only has one \'a\', return empty string.' }
    ],
    constraints: [
      "m == s.length",
      "n == t.length",
      "1 ≤ m, n ≤ 10⁵",
      "s and t consist of uppercase and lowercase English letters."
    ],
    hints: [
      "Use two pointers (left and right) to create a sliding window.",
      "Count character frequencies needed from t using an array/map.",
      "Expand right to find a valid window, then contract left to minimize it while maintaining validity."
    ],
    complexity: { time: "O(m + n)", space: "O(1) — 128 ASCII array" },
    topics: ["Hash Table", "String", "Sliding Window"],
    companies: ["Facebook", "Amazon", "LinkedIn", "Microsoft", "Lyft"]
  },
  78: {
    title: "Subsets",
    difficulty: "medium",
    category: "Backtracking / Cascading / Bitmask",
    acceptance: "77.5%",
    description: "Given an integer array <code>nums</code> of <strong>unique</strong> elements, return <em>all possible subsets (the power set)</em>. The solution set <strong>must not</strong> contain duplicate subsets. Return the solution in any order.",
    examples: [
      { input: "nums = [1,2,3]", output: "[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]", explanation: "All 8 subsets generated." },
      { input: "nums = [0]", output: "[[],[0]]", explanation: "All 2 subsets generated." }
    ],
    constraints: [
      "1 ≤ nums.length ≤ 10",
      "-10 ≤ nums[i] ≤ 10",
      "All the numbers of nums are unique."
    ],
    hints: [
      "For each element, we have 2 choices: either include it or exclude it.",
      "A total of 2^n subsets exist.",
      "Can be solved via backtracking, cascading, or bit manipulation (binary representation 0 to 2^n - 1)."
    ],
    complexity: { time: "O(n × 2^n)", space: "O(n) recursion call stack" },
    topics: ["Array", "Backtracking", "Bit Manipulation"],
    companies: ["Amazon", "Facebook", "Bloomberg", "Google", "Microsoft"]
  },
  84: {
    title: "Largest Rectangle in Histogram",
    difficulty: "hard",
    category: "Stack / Monotonic Stack",
    acceptance: "44.7%",
    description: "Given an array of integers <code>heights</code> representing the histogram's bar height where the width of each bar is <code>1</code>, return <em>the area of the largest rectangle in the histogram</em>.",
    examples: [
      { input: "heights = [2,1,5,6,2,3]", output: "10", explanation: "The largest rectangle is formed between bars of height 5 and 6, with area = 5 * 2 = 10 units." },
      { input: "heights = [2,4]", output: "4", explanation: "Area = 4." }
    ],
    constraints: [
      "1 ≤ heights.length ≤ 10⁵",
      "0 ≤ heights[i] ≤ 10⁴"
    ],
    hints: [
      "For each bar, if we know the first smaller bar to its left and right, we can compute the maximum rectangle with this bar as the shortest.",
      "Use a monotonic increasing stack to find the left and right smaller boundaries in O(n) total time.",
      "Push indices onto stack; when current height < top of stack, pop and compute area."
    ],
    complexity: { time: "O(n) — Each bar pushed and popped at most once", space: "O(n) — Stack" },
    topics: ["Array", "Stack", "Monotonic Stack"],
    companies: ["Amazon", "Google", "Microsoft", "Apple", "Uber"]
  },
  91: {
    title: "Decode Ways",
    difficulty: "medium",
    category: "Dynamic Programming / String",
    acceptance: "34.8%",
    description: "A message containing letters from <code>A-Z</code> can be encoded into numbers using the mapping <code>'A' -> \"1\", 'B' -> \"2\", ... 'Z' -> \"26\"</code>. Given a string <code>s</code> containing only digits, return <em>the <strong>number of ways</strong> to decode it</em>.",
    examples: [
      { input: 's = "12"', output: "2", explanation: '"12" could be decoded as "AB" (1 2) or "L" (12).' },
      { input: 's = "226"', output: "3", explanation: '"226" could be decoded as "BZ" (2 26), "VF" (22 6), or "BBF" (2 2 6).' },
      { input: 's = "06"', output: "0", explanation: '"06" cannot be mapped to "F" because of the leading zero ("6" is valid, but "06" is not).' }
    ],
    constraints: [
      "1 ≤ s.length ≤ 100",
      "s contains only digits and may contain leading zero(s)."
    ],
    hints: [
      "At each index i, we can decode a 1-digit number if s[i] != '0'.",
      "We can also decode a 2-digit number if the substring s[i-1..i] is between \"10\" and \"26\".",
      "This is analogous to Fibonacci / Climbing Stairs with conditions; can be solved in O(1) space with 2 variables."
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    topics: ["String", "Dynamic Programming"],
    companies: ["Amazon", "Google", "Facebook", "Microsoft", "Uber"]
  },
  139: {
    title: "Word Break",
    difficulty: "medium",
    category: "Dynamic Programming / Trie / Hash Table",
    acceptance: "46.7%",
    description: "Given a string <code>s</code> and a dictionary of strings <code>wordDict</code>, return <code>true</code> if <code>s</code> can be segmented into a space-separated sequence of one or more dictionary words.",
    examples: [
      { input: 's = "leetcode", wordDict = ["leet","code"]', output: "true", explanation: 'Return true because "leetcode" can be segmented as "leet code".' },
      { input: 's = "applepenapple", wordDict = ["apple","pen"]', output: "true", explanation: 'Return true because "applepenapple" can be segmented as "apple pen apple". Note that dictionary words can be reused.' },
      { input: 's = "catsandog", wordDict = ["cats","dog","sand","and","cat"]', output: "false", explanation: 'Cannot be segmented into dictionary words.' }
    ],
    constraints: [
      "1 ≤ s.length ≤ 300",
      "1 ≤ wordDict.length ≤ 1000",
      "1 ≤ wordDict[i].length ≤ 20",
      "s and wordDict[i] consist of only lowercase English letters.",
      "All the strings of wordDict are unique."
    ],
    hints: [
      "Let dp[i] represent whether s[0..i-1] can be segmented using dictionary words.",
      "dp[0] = true (empty string).",
      "For each i from 1 to n, check all j < i: if dp[j] is true and s[j..i-1] is in wordDict, then dp[i] = true."
    ],
    complexity: { time: "O(n² × m) where m is max word length", space: "O(n) for DP table" },
    topics: ["Array", "Hash Table", "String", "Dynamic Programming", "Trie"],
    companies: ["Amazon", "Facebook", "Bloomberg", "Google", "Microsoft"]
  },
  142: {
    title: "Linked List Cycle II",
    difficulty: "medium",
    category: "Linked List / Two Pointers",
    acceptance: "51.1%",
    description: "Given the <code>head</code> of a linked list, return <em>the node where the cycle begins</em>. If there is no cycle, return <code>null</code>. Do not modify the linked list.",
    examples: [
      { input: "head = [3,2,0,-4], pos = 1", output: "tail connects to node index 1", explanation: "There is a cycle in the linked list, where tail connects to the second node (index 1)." },
      { input: "head = [1,2], pos = 0", output: "tail connects to node index 0", explanation: "There is a cycle in the linked list, where tail connects to the first node (index 0)." },
      { input: "head = [1], pos = -1", output: "no cycle", explanation: "There is no cycle in the linked list." }
    ],
    constraints: [
      "The number of the nodes in the list is in the range [0, 10⁴].",
      "-10⁵ ≤ Node.val ≤ 10⁵",
      "pos is -1 or a valid index in the linked-list."
    ],
    hints: [
      "Use Floyd's Cycle-Finding Algorithm (tortoise and hare).",
      "When fast and slow pointers meet, let distance from head to cycle start be L1, and meeting point from cycle start be L2.",
      "Mathematical proof shows that distance from head to cycle start equals distance from meeting point to cycle start along the cycle."
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    topics: ["Hash Table", "Linked List", "Two Pointers"],
    companies: ["Microsoft", "Amazon", "Adobe", "Apple", "Google"]
  },
  207: {
    title: "Course Schedule",
    difficulty: "medium",
    category: "Graph / Topological Sort / BFS / DFS",
    acceptance: "47.2%",
    description: "There are a total of <code>numCourses</code> courses you have to take, labeled from <code>0</code> to <code>numCourses - 1</code>. You are given an array <code>prerequisites</code> where <code>prerequisites[i] = [a<sub>i</sub>, b<sub>i</sub>]</code> indicates that you <strong>must</strong> take course <code>b<sub>i</sub></code> first if you want to take course <code>a<sub>i</sub></code>. Return <code>true</code> if you can finish all courses, or <code>false</code> otherwise.",
    examples: [
      { input: "numCourses = 2, prerequisites = [[1,0]]", output: "true", explanation: "There are 2 courses to take. To take course 1 you should have finished course 0. So it is possible." },
      { input: "numCourses = 2, prerequisites = [[1,0],[0,1]]", output: "false", explanation: "There are 2 courses to take. To take course 1 you should have finished course 0, and to take course 0 you should also have finished course 1. So it is impossible." }
    ],
    constraints: [
      "1 ≤ numCourses ≤ 2000",
      "0 ≤ prerequisites.length ≤ 5000",
      "prerequisites[i].length == 2",
      "0 ≤ a_i, b_i < numCourses",
      "All the pairs prerequisites[i] are unique."
    ],
    hints: [
      "This problem is equivalent to finding if a cycle exists in a directed graph.",
      "Can be solved via Kahn's algorithm (BFS with in-degrees) or DFS cycle detection with 3 colors/states.",
      "If the number of visited nodes in topological order equals numCourses, then no cycle exists."
    ],
    complexity: { time: "O(V + E)", space: "O(V + E)" },
    topics: ["Depth-First Search", "Breadth-First Search", "Graph", "Topological Sort"],
    companies: ["Amazon", "Google", "Facebook", "Microsoft", "Bloomberg"]
  },
  209: {
    title: "Minimum Size Subarray Sum",
    difficulty: "medium",
    category: "Array / Sliding Window / Binary Search",
    acceptance: "47.5%",
    description: "Given an array of positive integers <code>nums</code> and a positive integer <code>target</code>, return <em>the <strong>minimal length</strong> of a subarray whose sum is greater than or equal to</em> <code>target</code>. If there is no such subarray, return <code>0</code> instead.",
    examples: [
      { input: "target = 7, nums = [2,3,1,2,4,3]", output: "2", explanation: "The subarray [4,3] has the minimal length under the problem constraint." },
      { input: "target = 4, nums = [1,4,4]", output: "1", explanation: "The subarray [4] has minimal length 1." },
      { input: "target = 11, nums = [1,1,1,1,1,1,1,1]", output: "0", explanation: "No subarray sums up to 11." }
    ],
    constraints: [
      "1 ≤ target ≤ 10⁹",
      "1 ≤ nums.length ≤ 10⁵",
      "1 ≤ nums[i] ≤ 10⁴"
    ],
    hints: [
      "Use two pointers to define a sliding window [left, right].",
      "Expand right to add elements to the running sum.",
      "Whenever running sum >= target, update minLen and shrink the window from left by subtracting nums[left]."
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    topics: ["Array", "Binary Search", "Sliding Window", "Prefix Sum"],
    companies: ["Amazon", "Goldman Sachs", "Google", "Facebook", "Microsoft"]
  },
  235: {
    title: "Lowest Common Ancestor of a Binary Search Tree",
    difficulty: "medium",
    category: "Tree / Binary Search Tree / DFS",
    acceptance: "65.3%",
    description: "Given a binary search tree (BST), find the lowest common ancestor (LCA) node of two given nodes in the BST. According to the definition of LCA on Wikipedia: “The lowest common ancestor is defined between two nodes <code>p</code> and <code>q</code> as the lowest node in <code>T</code> that has both <code>p</code> and <code>q</code> as descendants (where we allow <strong>a node to be a descendant of itself</strong>).”",
    examples: [
      { input: "root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 8", output: "6", explanation: "The LCA of nodes 2 and 8 is 6." },
      { input: "root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 4", output: "2", explanation: "The LCA of nodes 2 and 4 is 2, since a node can be a descendant of itself according to the LCA definition." }
    ],
    constraints: [
      "The number of nodes in the tree is in the range [2, 10⁵].",
      "-10⁹ ≤ Node.val ≤ 10⁹",
      "All Node.val are unique.",
      "p != q",
      "p and q will exist in the BST."
    ],
    hints: [
      "Leverage the BST property: left subtree < root < right subtree.",
      "If both p and q are smaller than root, LCA must be in the left subtree.",
      "If both p and q are greater than root, LCA must be in the right subtree. Otherwise, root is the split point (LCA)."
    ],
    complexity: { time: "O(h) where h is tree height", space: "O(1) iterative, O(h) recursive" },
    topics: ["Tree", "Depth-First Search", "Binary Search Tree", "Binary Tree"],
    companies: ["Amazon", "Microsoft", "Facebook", "Twitter", "Google"]
  },
  416: {
    title: "Partition Equal Subset Sum",
    difficulty: "medium",
    category: "Dynamic Programming / 0-1 Knapsack",
    acceptance: "46.3%",
    description: "Given an integer array <code>nums</code>, return <code>true</code> if you can partition the array into two subsets such that the sum of the elements in both subsets is equal or <code>false</code> otherwise.",
    examples: [
      { input: "nums = [1,5,11,5]", output: "true", explanation: "The array can be partitioned as [1, 5, 5] and [11]." },
      { input: "nums = [1,2,3,5]", output: "false", explanation: "The array cannot be partitioned into equal sum subsets." }
    ],
    constraints: [
      "1 ≤ nums.length ≤ 200",
      "1 ≤ nums[i] ≤ 100"
    ],
    hints: [
      "If total sum is odd, it cannot be partitioned into two equal integers. Return false immediately.",
      "The problem reduces to 0/1 Knapsack: can we find a subset of numbers that sums to total / 2?",
      "Use a 1D boolean array of size (target + 1), iterating backwards to avoid reusing elements."
    ],
    complexity: { time: "O(n × target) where target = sum / 2", space: "O(target)" },
    topics: ["Array", "Dynamic Programming"],
    companies: ["Amazon", "Microsoft", "Facebook", "Google", "Yahoo"]
  },
  547: {
    title: "Number of Provinces",
    difficulty: "medium",
    category: "Graph / DFS / BFS / Union Find",
    acceptance: "66.5%",
    description: "There are <code>n</code> cities. Some of them are connected, while some are not. If city <code>a</code> is connected directly with city <code>b</code>, and city <code>b</code> is connected directly with city <code>c</code>, then city <code>a</code> is connected indirectly with city <code>c</code>. A <strong>province</strong> is a group of directly or indirectly connected cities and no other cities outside of the group. Given an <code>n x n</code> matrix <code>isConnected</code> where <code>isConnected[i][j] = 1</code> if the <code>i<sup>th</sup></code> city and the <code>j<sup>th</sup></code> city are directly connected, and <code>isConnected[i][j] = 0</code> otherwise, return <em>the total number of <strong>provinces</strong></em>.",
    examples: [
      { input: "isConnected = [[1,1,0],[1,1,0],[0,0,1]]", output: "2", explanation: "Cities 0 and 1 belong to province 1, city 2 belongs to province 2." },
      { input: "isConnected = [[1,0,0],[0,1,0],[0,0,1]]", output: "3", explanation: "Each city is isolated in its own province." }
    ],
    constraints: [
      "1 ≤ n ≤ 200",
      "n == isConnected.length",
      "n == isConnected[i].length",
      "isConnected[i][j] is '1' or '0'.",
      "isConnected[i][i] == 1",
      "isConnected[i][j] == isConnected[j][i]"
    ],
    hints: [
      "This is a classic connected components problem in an undirected graph.",
      "Iterate through each unvisited city and trigger DFS/BFS to mark all reachable cities.",
      "Can also be solved cleanly using Disjoint Set Union (Union-Find) with path compression."
    ],
    complexity: { time: "O(n²)", space: "O(n) for visited array / parent array" },
    topics: ["Depth-First Search", "Breadth-First Search", "Union Find", "Graph"],
    companies: ["Amazon", "Microsoft", "Bloomberg", "Google", "Apple"]
  },
  1143: {
    title: "Longest Common Subsequence",
    difficulty: "medium",
    category: "Dynamic Programming / 2D State DP",
    acceptance: "58.1%",
    description: "Given two strings <code>text1</code> and <code>text2</code>, return <em>the length of their longest <strong>common subsequence</strong></em>. If there is no common subsequence, return <code>0</code>.",
    examples: [
      { input: 'text1 = "abcde", text2 = "ace"', output: "3", explanation: 'The longest common subsequence is "ace" and its length is 3.' },
      { input: 'text1 = "abc", text2 = "abc"', output: "3", explanation: 'The longest common subsequence is "abc" and its length is 3.' },
      { input: 'text1 = "abc", text2 = "def"', output: "0", explanation: 'There is no such common subsequence, so the result is 0.' }
    ],
    constraints: [
      "1 ≤ text1.length, text2.length ≤ 1000",
      "text1 and text2 consist of only lowercase English characters."
    ],
    hints: [
      "Let dp[i][j] be the length of the longest common subsequence between text1[0..i-1] and text2[0..j-1].",
      "If text1[i-1] == text2[j-1], then dp[i][j] = 1 + dp[i-1][j-1].",
      "Otherwise, dp[i][j] = max(dp[i-1][j], dp[i][j-1]).",
      "Can be space-optimized to O(min(m, n)) using only two rows."
    ],
    complexity: { time: "O(m × n)", space: "O(m × n) or O(min(m, n)) space" },
    topics: ["String", "Dynamic Programming"],
    companies: ["Amazon", "Microsoft", "Google", "Facebook", "Uber"]
  }
};

let descAdded = 0;
for (const [id, desc] of Object.entries(NEW_DESCRIPTIONS)) {
  if (!descContent.includes(`\n  ${id}: {`)) {
    const endIdx = descContent.lastIndexOf("\n};");
    const jsonStr = JSON.stringify(desc, null, 4).replace(/\n/g, "\n  ");
    const snippet = `\n  ${id}: ${jsonStr},`;
    descContent = descContent.slice(0, endIdx) + snippet + descContent.slice(endIdx);
    descAdded++;
  }
}
fs.writeFileSync(descPath, descContent, "utf8");
console.log(`Added ${descAdded} problem descriptions.`);
