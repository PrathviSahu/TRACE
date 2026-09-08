// ─────────────────────────────────────────────────────────────
//  TRACE — DSA Pattern Mapping Engine
//  Distinguishes broad TOPICS (Data Structures) from algorithmic PATTERNS.
//  Label: "TRACE Pattern Mapping (Curated DSA Taxonomy)"
// ─────────────────────────────────────────────────────────────

export const PATTERN_SOURCE_LABEL = "TRACE Pattern Mapping (Curated DSA Taxonomy)";

export const DSA_TOPICS = [
  "Array",
  "String",
  "Hash Table",
  "Linked List",
  "Tree",
  "Graph",
  "Dynamic Programming",
  "Matrix",
  "Stack & Queue",
  "Heap / Priority Queue",
  "Backtracking",
  "Math & Bitwise"
];

export const DSA_PATTERNS = [
  "Two Pointers",
  "Sliding Window",
  "Prefix Sum",
  "Binary Search",
  "Kadane's Algorithm",
  "Interval Merging",
  "Fast & Slow Pointers",
  "Complement Lookup",
  "Frequency Counting",
  "Tree DFS / Recursion",
  "Tree BFS / Level Order",
  "Lowest Common Ancestor",
  "Graph BFS / Shortest Path",
  "Graph DFS / Cycle Detection",
  "Topological Sort",
  "Union-Find (DSU)",
  "Monotonic Stack",
  "Top K Elements",
  "1D State DP",
  "2D Grid DP",
  "Knapsack / Subset Sum",
  "Backtracking / Combinations"
];

// Curated high-precision pattern mapping for prominent LeetCode problems
const CURATED_PROBLEM_PATTERNS = {
  // ── Arrays & Hash Tables
  "1":   { topic: "Hash Table", patterns: ["Complement Lookup", "Frequency Counting"] }, // Two Sum
  "15":  { topic: "Array",      patterns: ["Two Pointers", "Sorting"] },                 // 3Sum
  "16":  { topic: "Array",      patterns: ["Two Pointers", "Sorting"] },                 // 3Sum Closest
  "18":  { topic: "Array",      patterns: ["Two Pointers", "Sorting"] },                 // 4Sum
  "11":  { topic: "Array",      patterns: ["Two Pointers"] },                            // Container With Most Water
  "42":  { topic: "Array",      patterns: ["Two Pointers", "Monotonic Stack"] },         // Trapping Rain Water
  "53":  { topic: "Array",      patterns: ["Kadane's Algorithm", "1D State DP"] },     // Maximum Subarray
  "121": { topic: "Array",      patterns: ["Kadane's Algorithm", "Two Pointers"] },    // Best Time to Buy/Sell Stock
  "122": { topic: "Array",      patterns: ["Greedy", "1D State DP"] },                   // Buy/Sell Stock II
  "152": { topic: "Array",      patterns: ["1D State DP", "Kadane's Algorithm"] },     // Maximum Product Subarray
  "238": { topic: "Array",      patterns: ["Prefix Sum"] },                              // Product of Array Except Self
  "560": { topic: "Hash Table", patterns: ["Prefix Sum", "Frequency Counting"] },        // Subarray Sum Equals K
  "217": { topic: "Hash Table", patterns: ["Frequency Counting"] },                      // Contains Duplicate
  "242": { topic: "Hash Table", patterns: ["Frequency Counting"] },                      // Valid Anagram
  "49":  { topic: "Hash Table", patterns: ["Frequency Counting", "Anagram Grouping"] },  // Group Anagrams
  "128": { topic: "Hash Table", patterns: ["Frequency Counting", "Union-Find (DSU)"] }, // Longest Consecutive Seq

  // ── Two Pointers & Sliding Window
  "3":   { topic: "String",     patterns: ["Sliding Window", "Frequency Counting"] },    // Longest Substring Without Repeat
  "76":  { topic: "String",     patterns: ["Sliding Window", "Frequency Counting"] },    // Minimum Window Substring
  "424": { topic: "String",     patterns: ["Sliding Window", "Frequency Counting"] },    // Longest Repeating Char Replacement
  "209": { topic: "Array",      patterns: ["Sliding Window", "Prefix Sum"] },            // Minimum Size Subarray Sum
  "125": { topic: "String",     patterns: ["Two Pointers"] },                            // Valid Palindrome
  "680": { topic: "String",     patterns: ["Two Pointers"] },                            // Valid Palindrome II
  "344": { topic: "String",     patterns: ["Two Pointers"] },                            // Reverse String
  "26":  { topic: "Array",      patterns: ["Two Pointers"] },                            // Remove Duplicates
  "27":  { topic: "Array",      patterns: ["Two Pointers"] },                            // Remove Element
  "88":  { topic: "Array",      patterns: ["Two Pointers"] },                            // Merge Sorted Array

  // ── Binary Search
  "704": { topic: "Array",      patterns: ["Binary Search"] },                           // Binary Search
  "33":  { topic: "Array",      patterns: ["Binary Search"] },                           // Search in Rotated Sorted Array
  "81":  { topic: "Array",      patterns: ["Binary Search"] },                           // Search in Rotated Array II
  "153": { topic: "Array",      patterns: ["Binary Search"] },                           // Find Min in Rotated Array
  "4":   { topic: "Array",      patterns: ["Binary Search", "Two Pointers"] },           // Median of Two Sorted Arrays
  "875": { topic: "Array",      patterns: ["Binary Search", "Monotonic Condition"] },    // Koko Eating Bananas
  "1011":{ topic: "Array",      patterns: ["Binary Search", "Monotonic Condition"] },    // Capacity To Ship Packages
  "69":  { topic: "Math & Bitwise", patterns: ["Binary Search"] },                       // Sqrt(x)

  // ── Intervals
  "56":  { topic: "Array",      patterns: ["Interval Merging", "Sorting"] },             // Merge Intervals
  "57":  { topic: "Array",      patterns: ["Interval Merging"] },                        // Insert Interval
  "435": { topic: "Array",      patterns: ["Interval Merging", "Greedy"] },              // Non-overlapping Intervals
  "252": { topic: "Array",      patterns: ["Interval Merging", "Sorting"] },             // Meeting Rooms
  "253": { topic: "Array",      patterns: ["Interval Merging", "Top K Elements"] },      // Meeting Rooms II

  // ── Stack & Monotonic Stack
  "20":  { topic: "Stack & Queue", patterns: ["Matching Parentheses"] },                 // Valid Parentheses
  "155": { topic: "Stack & Queue", patterns: ["Min/Max Stack"] },                        // Min Stack
  "739": { topic: "Stack & Queue", patterns: ["Monotonic Stack"] },                      // Daily Temperatures
  "84":  { topic: "Stack & Queue", patterns: ["Monotonic Stack"] },                      // Largest Rectangle in Histogram
  "85":  { topic: "Stack & Queue", patterns: ["Monotonic Stack", "2D Grid DP"] },        // Maximal Rectangle
  "503": { topic: "Stack & Queue", patterns: ["Monotonic Stack"] },                      // Next Greater Element II
  "227": { topic: "Stack & Queue", patterns: ["Expression Parsing"] },                   // Basic Calculator II

  // ── Linked List
  "206": { topic: "Linked List", patterns: ["In-place Reversal"] },                      // Reverse Linked List
  "92":  { topic: "Linked List", patterns: ["In-place Reversal"] },                      // Reverse Linked List II
  "141": { topic: "Linked List", patterns: ["Fast & Slow Pointers"] },                   // Linked List Cycle
  "142": { topic: "Linked List", patterns: ["Fast & Slow Pointers"] },                   // Linked List Cycle II
  "21":  { topic: "Linked List", patterns: ["Merge Two Lists"] },                        // Merge Two Sorted Lists
  "23":  { topic: "Linked List", patterns: ["Top K Elements", "Divide and Conquer"] },   // Merge k Sorted Lists
  "146": { topic: "Linked List", patterns: ["LRU Cache", "Complement Lookup"] },         // LRU Cache
  "19":  { topic: "Linked List", patterns: ["Fast & Slow Pointers"] },                   // Remove Nth Node From End

  // ── Trees
  "104": { topic: "Tree",        patterns: ["Tree DFS / Recursion"] },                   // Max Depth of Binary Tree
  "100": { topic: "Tree",        patterns: ["Tree DFS / Recursion"] },                   // Same Tree
  "101": { topic: "Tree",        patterns: ["Tree DFS / Recursion"] },                   // Symmetric Tree
  "102": { topic: "Tree",        patterns: ["Tree BFS / Level Order"] },                 // Binary Tree Level Order
  "103": { topic: "Tree",        patterns: ["Tree BFS / Level Order"] },                 // Zigzag Level Order
  "226": { topic: "Tree",        patterns: ["Tree DFS / Recursion"] },                   // Invert Binary Tree
  "236": { topic: "Tree",        patterns: ["Lowest Common Ancestor"] },                 // LCA of Binary Tree
  "235": { topic: "Tree",        patterns: ["Lowest Common Ancestor", "BST Search"] },   // LCA of BST
  "543": { topic: "Tree",        patterns: ["Tree DFS / Recursion", "Tree DP"] },        // Diameter of Binary Tree
  "124": { topic: "Tree",        patterns: ["Tree DFS / Recursion", "Tree DP"] },        // Binary Tree Max Path Sum
  "98":  { topic: "Tree",        patterns: ["BST Validation", "Tree DFS / Recursion"] }, // Validate BST
  "230": { topic: "Tree",        patterns: ["BST Inorder Traversal"] },                  // Kth Smallest Element in BST

  // ── Graphs
  "200": { topic: "Graph",       patterns: ["Graph DFS / Cycle Detection", "Graph BFS / Shortest Path"] }, // Number of Islands
  "695": { topic: "Graph",       patterns: ["Graph DFS / Cycle Detection"] },            // Max Area of Island
  "133": { topic: "Graph",       patterns: ["Graph BFS / Shortest Path", "Graph DFS / Cycle Detection"] }, // Clone Graph
  "207": { topic: "Graph",       patterns: ["Topological Sort", "Graph DFS / Cycle Detection"] }, // Course Schedule
  "210": { topic: "Graph",       patterns: ["Topological Sort"] },                       // Course Schedule II
  "684": { topic: "Graph",       patterns: ["Union-Find (DSU)"] },                       // Redundant Connection
  "127": { topic: "Graph",       patterns: ["Graph BFS / Shortest Path"] },              // Word Ladder
  "743": { topic: "Graph",       patterns: ["Dijkstra / Shortest Path"] },               // Network Delay Time

  // ── Dynamic Programming
  "70":  { topic: "Dynamic Programming", patterns: ["1D State DP"] },                    // Climbing Stairs
  "198": { topic: "Dynamic Programming", patterns: ["1D State DP"] },                    // House Robber
  "213": { topic: "Dynamic Programming", patterns: ["1D State DP"] },                    // House Robber II
  "322": { topic: "Dynamic Programming", patterns: ["Knapsack / Subset Sum"] },          // Coin Change
  "518": { topic: "Dynamic Programming", patterns: ["Knapsack / Subset Sum"] },          // Coin Change II
  "300": { topic: "Dynamic Programming", patterns: ["1D State DP", "Binary Search"] },   // Longest Increasing Subseq
  "1143":{ topic: "Dynamic Programming", patterns: ["2D Grid DP"] },                    // Longest Common Subsequence
  "72":  { topic: "Dynamic Programming", patterns: ["2D Grid DP"] },                    // Edit Distance
  "62":  { topic: "Dynamic Programming", patterns: ["2D Grid DP"] },                    // Unique Paths
  "64":  { topic: "Dynamic Programming", patterns: ["2D Grid DP"] },                    // Minimum Path Sum

  // ── Backtracking
  "78":  { topic: "Backtracking", patterns: ["Backtracking / Combinations"] },           // Subsets
  "90":  { topic: "Backtracking", patterns: ["Backtracking / Combinations"] },           // Subsets II
  "46":  { topic: "Backtracking", patterns: ["Backtracking / Combinations"] },           // Permutations
  "47":  { topic: "Backtracking", patterns: ["Backtracking / Combinations"] },           // Permutations II
  "39":  { topic: "Backtracking", patterns: ["Backtracking / Combinations"] },           // Combination Sum
  "51":  { topic: "Backtracking", patterns: ["Backtracking / Combinations"] },           // N-Queens
  "79":  { topic: "Backtracking", patterns: ["Backtracking / Combinations", "Graph DFS / Cycle Detection"] }, // Word Search

  // ── Heap & Top K
  "215": { topic: "Heap / Priority Queue", patterns: ["Top K Elements"] },               // Kth Largest Element
  "347": { topic: "Heap / Priority Queue", patterns: ["Top K Elements", "Frequency Counting"] }, // Top K Frequent
  "295": { topic: "Heap / Priority Queue", patterns: ["Two Heaps (Median)"] },           // Find Median from Data Stream
};

/**
 * Deterministically resolves the Topic and Algorithmic Patterns for any problem
 */
export function getProblemPatternDetails(problem) {
  if (!problem) return { topic: "General", patterns: ["General DSA"], isCurated: false };

  const pid = String(problem.id || "");
  if (pid && CURATED_PROBLEM_PATTERNS[pid]) {
    return {
      ...CURATED_PROBLEM_PATTERNS[pid],
      isCurated: true,
      source: PATTERN_SOURCE_LABEL
    };
  }

  // Fallback resolution based on existing dataset metadata
  const rawTopics = problem.topics || [];
  const title = (problem.title || problem.name || "").toLowerCase();

  let resolvedTopic = "Array";
  const detectedPatterns = new Set();

  // Inspect raw topics
  for (const t of rawTopics) {
    const tl = t.toLowerCase();
    if (tl.includes("tree") || tl.includes("binary search tree")) resolvedTopic = "Tree";
    else if (tl.includes("graph") || tl.includes("union find")) resolvedTopic = "Graph";
    else if (tl.includes("dynamic programming")) resolvedTopic = "Dynamic Programming";
    else if (tl.includes("linked list")) resolvedTopic = "Linked List";
    else if (tl.includes("stack") || tl.includes("queue")) resolvedTopic = "Stack & Queue";
    else if (tl.includes("heap") || tl.includes("priority queue")) resolvedTopic = "Heap / Priority Queue";
    else if (tl.includes("hash table") || tl.includes("hash map")) resolvedTopic = "Hash Table";
    else if (tl.includes("string")) resolvedTopic = "String";

    // Direct pattern extraction from topics
    if (tl.includes("two pointers")) detectedPatterns.add("Two Pointers");
    if (tl.includes("sliding window")) detectedPatterns.add("Sliding Window");
    if (tl.includes("prefix sum")) detectedPatterns.add("Prefix Sum");
    if (tl.includes("binary search")) detectedPatterns.add("Binary Search");
    if (tl.includes("monotonic stack")) detectedPatterns.add("Monotonic Stack");
    if (tl.includes("breadth-first search") || tl.includes("bfs")) {
      if (resolvedTopic === "Tree") detectedPatterns.add("Tree BFS / Level Order");
      else detectedPatterns.add("Graph BFS / Shortest Path");
    }
    if (tl.includes("depth-first search") || tl.includes("dfs")) {
      if (resolvedTopic === "Tree") detectedPatterns.add("Tree DFS / Recursion");
      else detectedPatterns.add("Graph DFS / Cycle Detection");
    }
    if (tl.includes("topological sort")) detectedPatterns.add("Topological Sort");
    if (tl.includes("union find")) detectedPatterns.add("Union-Find (DSU)");
  }

  // Inspect title keywords
  if (title.includes("subarray") && (title.includes("sum") || title.includes("count"))) {
    detectedPatterns.add("Prefix Sum");
  }
  if (title.includes("substring") || title.includes("window")) {
    detectedPatterns.add("Sliding Window");
  }
  if (title.includes("palindrome") || title.includes("two sum") || title.includes("3sum")) {
    detectedPatterns.add("Two Pointers");
  }
  if (title.includes("binary search") || title.includes("search in")) {
    detectedPatterns.add("Binary Search");
  }
  if (title.includes("path") || title.includes("island") || title.includes("course")) {
    if (resolvedTopic === "Graph") detectedPatterns.add("Graph BFS / Shortest Path");
  }
  if (title.includes("climb") || title.includes("robber") || title.includes("coin")) {
    resolvedTopic = "Dynamic Programming";
    detectedPatterns.add("1D State DP");
  }

  if (detectedPatterns.size === 0) {
    if (resolvedTopic === "Tree") detectedPatterns.add("Tree DFS / Recursion");
    else if (resolvedTopic === "Graph") detectedPatterns.add("Graph BFS / Shortest Path");
    else if (resolvedTopic === "Hash Table") detectedPatterns.add("Frequency Counting");
    else if (resolvedTopic === "Dynamic Programming") detectedPatterns.add("1D State DP");
    else if (resolvedTopic === "Heap / Priority Queue") detectedPatterns.add("Top K Elements");
    else detectedPatterns.add("General Technique");
  }

  return {
    topic: resolvedTopic,
    patterns: Array.from(detectedPatterns),
    isCurated: false,
    source: PATTERN_SOURCE_LABEL
  };
}

/**
 * Computes pattern distribution statistics for a list of company problems
 */
export function computeCompanyPatternStats(problems) {
  const patternCounts = {};
  const topicCounts = {};

  for (const p of problems) {
    const { topic, patterns } = getProblemPatternDetails(p);
    topicCounts[topic] = (topicCounts[topic] || 0) + 1;

    for (const pat of patterns) {
      patternCounts[pat] = (patternCounts[pat] || 0) + 1;
    }
  }

  const sortedPatterns = Object.entries(patternCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([pattern, count]) => ({ pattern, count }));

  const sortedTopics = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([topic, count]) => ({ topic, count }));

  return {
    patterns: sortedPatterns,
    topics: sortedTopics,
    source: PATTERN_SOURCE_LABEL
  };
}
