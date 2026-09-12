// ─────────────────────────────────────────────────────────────
//  TRACE — Canonical DSA Pattern Taxonomy & Mapping Engine
//  Strictly separates Data Structure TOPICS from algorithmic PATTERNS.
//  Curated high-confidence mapping for top interview questions.
//  No speculative fallbacks: unclassified problems are marked "Unclassified".
// ─────────────────────────────────────────────────────────────

export const PATTERN_SOURCE_LABEL = "TRACE Pattern Mapping (Curated DSA Taxonomy)";
export const PATTERN_HEURISTIC_LABEL = "TRACE Pattern Mapping — heuristic";

export const DSA_TOPICS = [
  "Array",
  "String",
  "Hash Table",
  "Linked List",
  "Tree",
  "Graph",
  "Dynamic Programming",
  "Matrix",
  "Matrix / Backtracking",
  "Stack & Queue",
  "Heap / Priority Queue",
  "Backtracking",
  "Intervals",
  "Math & Bitwise",
  "Design"
];

// Complete, consistent registry of all canonical patterns used in TRACE
export const DSA_PATTERNS = [
  // Two Pointers & Sliding Window
  "Two Pointers",
  "Sliding Window",
  "Fast & Slow Pointers",
  "Expand Around Center",
  "Dutch National Flag",

  // Arrays & Prefix Techniques
  "Prefix Sum",
  "Prefix/Suffix Technique",
  "Prefix Sum + HashMap",
  "Single Pass / Running Minimum",
  "Single Pass / Running Extremes",
  "Kadane's Algorithm",
  "Boyer-Moore Voting",

  // Binary Search
  "Binary Search",
  "Binary Search on Partition",

  // Intervals & Sweep Line
  "Interval Merging",
  "Sweep Line",

  // Hash Tables & Lookup
  "Complement Lookup",
  "Frequency Counting",
  "Hash Set / Sequence Expansion",
  "Anagram Grouping",
  "Hash Table Design",
  "Hash Table + Array Swap",

  // Linked List
  "Linked List Traversal",
  "In-place Reversal",
  "Merge Two Lists",
  "K-way Merge",
  "Dummy Node",
  "Doubly Linked List + HashMap",

  // Stack & Queue
  "Matching Parentheses",
  "Monotonic Stack",
  "Monotonic Queue / Deque",
  "Min/Max Stack",
  "Expression Parsing",
  "Stack Traversal",

  // Trees & BST
  "Tree DFS / Recursion",
  "Tree BFS / Level Order",
  "BST Search",
  "BST Inorder",
  "Lowest Common Ancestor",
  "Path Tracking",
  "Tree DP",
  "Trie Design",

  // Graphs
  "Graph BFS",
  "Graph DFS",
  "Grid DFS",
  "Grid BFS",
  "Multi-Source BFS",
  "Connected Components",
  "Shortest Path",
  "Dijkstra / Shortest Path",
  "Topological Sort",
  "Cycle Detection",
  "Union-Find (DSU)",

  // Heap & Top K
  "Top K Elements",
  "Two Heaps",
  "Min Heap",
  "Max Heap",
  "Quickselect",

  // Backtracking
  "Backtracking",
  "Subsets",
  "Permutations",
  "Combination Sum",
  "Grid Backtracking",
  "Constraint Search",

  // Dynamic Programming
  "1D State DP",
  "2D State DP",
  "2D Grid DP",
  "Knapsack / Subset Sum",
  "Sequence DP",
  "Interval DP",

  // General & Edge Cases
  "Greedy",
  "Sorting",
  "Divide and Conquer",
  "Bit Manipulation (XOR)",
  "Matrix In-place Transpose",
  "Boundary Traversal",
  "General Technique",
  "Unclassified"
];

/**
 * Verified Curated High-Confidence Pattern Mapping
 * Audited for strict DSA correctness according to canonical interview paradigms.
 */
export const CURATED_PROBLEM_PATTERNS = {
  // ── Problem #1 & #2 (Audit test cases)
  "1":   { topic: "Hash Table", patterns: ["Complement Lookup"] },
  "2":   { topic: "Linked List", patterns: ["Merge Two Lists", "Linked List Traversal"] },

  // ── Arrays, Two Pointers & Prefix/Suffix
  "3":   { topic: "String", patterns: ["Sliding Window"] },
  "4":   { topic: "Array", patterns: ["Binary Search on Partition"] },
  "5":   { topic: "String", patterns: ["Two Pointers", "Expand Around Center"] },
  "9":   { topic: "Math & Bitwise", patterns: ["Two Pointers"] },
  "11":  { topic: "Array", patterns: ["Two Pointers"] },
  "13":  { topic: "String", patterns: ["Single Pass / Running Minimum"] },
  "14":  { topic: "String", patterns: ["Two Pointers"] },
  "15":  { topic: "Array", patterns: ["Two Pointers", "Sorting"] },
  "16":  { topic: "Array", patterns: ["Two Pointers", "Sorting"] },
  "18":  { topic: "Array", patterns: ["Two Pointers", "Sorting"] },
  "26":  { topic: "Array", patterns: ["Two Pointers"] },
  "27":  { topic: "Array", patterns: ["Two Pointers"] },
  "31":  { topic: "Array", patterns: ["Two Pointers"] },
  "42":  { topic: "Array", patterns: ["Two Pointers", "Monotonic Stack", "Prefix/Suffix Technique"] },
  "53":  { topic: "Array", patterns: ["Kadane's Algorithm", "1D State DP"] },
  "75":  { topic: "Array", patterns: ["Two Pointers", "Dutch National Flag"] },
  "76":  { topic: "String", patterns: ["Sliding Window", "Frequency Counting"] },
  "88":  { topic: "Array", patterns: ["Two Pointers"] },
  "121": { topic: "Array", patterns: ["Single Pass / Running Minimum", "Greedy"] },
  "122": { topic: "Array", patterns: ["Greedy", "1D State DP"] },
  "125": { topic: "String", patterns: ["Two Pointers"] },
  "152": { topic: "Array", patterns: ["1D State DP", "Single Pass / Running Extremes"] },
  "167": { topic: "Array", patterns: ["Two Pointers", "Binary Search"] },
  "169": { topic: "Array", patterns: ["Boyer-Moore Voting", "Frequency Counting"] },
  "189": { topic: "Array", patterns: ["In-place Reversal"] },
  "209": { topic: "Array", patterns: ["Sliding Window"] },
  "238": { topic: "Array", patterns: ["Prefix/Suffix Technique"] },
  "283": { topic: "Array", patterns: ["Two Pointers"] },
  "344": { topic: "String", patterns: ["Two Pointers"] },
  "424": { topic: "String", patterns: ["Sliding Window", "Frequency Counting"] },
  "55": { topic: "Array", patterns: ["Greedy"] },
  "74": { topic: "Array", patterns: ["Binary Search"] },
  "443": { topic: "String", patterns: ["Two Pointers"] },
  "560": { topic: "Hash Table", patterns: ["Prefix Sum + HashMap"] },
  "567": { topic: "String", patterns: ["Sliding Window", "Frequency Counting", "Two Pointers"] },
  "680": { topic: "String", patterns: ["Two Pointers"] },

  // ── Binary Search
  "33":  { topic: "Array", patterns: ["Binary Search"] },
  "34":  { topic: "Array", patterns: ["Binary Search"] },
  "35":  { topic: "Array", patterns: ["Binary Search"] },
  "69":  { topic: "Math & Bitwise", patterns: ["Binary Search"] },
  "81":  { topic: "Array", patterns: ["Binary Search"] },
  "153": { topic: "Array", patterns: ["Binary Search"] },
  "704": { topic: "Array", patterns: ["Binary Search"] },
  "875": { topic: "Array", patterns: ["Binary Search"] },
  "1011":{ topic: "Array", patterns: ["Binary Search"] },

  // ── Intervals
  "56":  { topic: "Array", patterns: ["Interval Merging", "Sorting"] },
  "57":  { topic: "Array", patterns: ["Interval Merging"] },
  "252": { topic: "Array", patterns: ["Interval Merging", "Sorting"] },
  "253": { topic: "Intervals", patterns: ["Min Heap", "Sweep Line"] },
  "435": { topic: "Array", patterns: ["Interval Merging", "Greedy"] },

  // ── Hash Table & Design
  "49":  { topic: "Hash Table", patterns: ["Anagram Grouping", "Frequency Counting"] },
  "128": { topic: "Hash Table", patterns: ["Hash Set / Sequence Expansion"] },
  "217": { topic: "Hash Table", patterns: ["Frequency Counting"] },
  "242": { topic: "Hash Table", patterns: ["Frequency Counting"] },
  "380": { topic: "Hash Table", patterns: ["Hash Table + Array Swap"] },
  "981": { topic: "Hash Table", patterns: ["Binary Search", "Hash Table Design"] },

  // ── Stack & Monotonic Stack
  "20":  { topic: "Stack & Queue", patterns: ["Matching Parentheses"] },
  "84":  { topic: "Stack & Queue", patterns: ["Monotonic Stack"] },
  "85":  { topic: "Stack & Queue", patterns: ["Monotonic Stack", "2D Grid DP"] },
  "150": { topic: "Stack & Queue", patterns: ["Stack Traversal", "Expression Parsing"] },
  "155": { topic: "Stack & Queue", patterns: ["Min/Max Stack"] },
  "227": { topic: "Stack & Queue", patterns: ["Expression Parsing"] },
  "239": { topic: "Stack & Queue", patterns: ["Monotonic Queue / Deque", "Sliding Window"] },
  "394": { topic: "Stack & Queue", patterns: ["Stack Traversal"] },
  "503": { topic: "Stack & Queue", patterns: ["Monotonic Stack"] },
  "739": { topic: "Stack & Queue", patterns: ["Monotonic Stack"] },

  // ── Linked List
  "19":  { topic: "Linked List", patterns: ["Fast & Slow Pointers", "Dummy Node"] },
  "21":  { topic: "Linked List", patterns: ["Merge Two Lists", "Two Pointers"] },
  "23":  { topic: "Linked List", patterns: ["K-way Merge", "Min Heap", "Divide and Conquer"] },
  "92":  { topic: "Linked List", patterns: ["In-place Reversal"] },
  "141": { topic: "Linked List", patterns: ["Fast & Slow Pointers"] },
  "142": { topic: "Linked List", patterns: ["Fast & Slow Pointers"] },
  "146": { topic: "Linked List", patterns: ["Doubly Linked List + HashMap", "Hash Table Design"] },
  "160": { topic: "Linked List", patterns: ["Two Pointers"] },
  "206": { topic: "Linked List", patterns: ["In-place Reversal"] },
  "234": { topic: "Linked List", patterns: ["Fast & Slow Pointers", "In-place Reversal"] },

  // ── Trees & BST
  "98":  { topic: "Tree", patterns: ["BST Inorder", "Tree DFS / Recursion"] },
  "100": { topic: "Tree", patterns: ["Tree DFS / Recursion"] },
  "101": { topic: "Tree", patterns: ["Tree DFS / Recursion"] },
  "102": { topic: "Tree", patterns: ["Tree BFS / Level Order"] },
  "103": { topic: "Tree", patterns: ["Tree BFS / Level Order"] },
  "104": { topic: "Tree", patterns: ["Tree DFS / Recursion"] },
  "105": { topic: "Tree", patterns: ["Tree DFS / Recursion", "Divide and Conquer"] },
  "110": { topic: "Tree", patterns: ["Tree DFS / Recursion", "Tree DP"] },
  "112": { topic: "Tree", patterns: ["Tree DFS / Recursion"] },
  "113": { topic: "Tree", patterns: ["Tree DFS / Recursion", "Path Tracking"] },
  "114": { topic: "Tree", patterns: ["Tree DFS / Recursion"] },
  "124": { topic: "Tree", patterns: ["Tree DFS / Recursion", "Tree DP"] },
  "208": { topic: "Tree", patterns: ["Trie Design"] },
  "226": { topic: "Tree", patterns: ["Tree DFS / Recursion"] },
  "230": { topic: "Tree", patterns: ["BST Inorder"] },
  "235": { topic: "Tree", patterns: ["Lowest Common Ancestor", "BST Search"] },
  "236": { topic: "Tree", patterns: ["Lowest Common Ancestor", "Tree DFS / Recursion"] },
  "543": { topic: "Tree", patterns: ["Tree DFS / Recursion", "Tree DP"] },

  // ── Graphs & Grid Traversal
  "127": { topic: "Graph", patterns: ["Graph BFS", "Shortest Path"] },
  "133": { topic: "Graph", patterns: ["Graph BFS", "Graph DFS"] },
  "200": { topic: "Graph", patterns: ["Grid DFS", "Grid BFS", "Connected Components"] },
  "207": { topic: "Graph", patterns: ["Topological Sort", "Cycle Detection"] },
  "210": { topic: "Graph", patterns: ["Topological Sort", "Cycle Detection"] },
  "684": { topic: "Graph", patterns: ["Union-Find (DSU)"] },
  "695": { topic: "Graph", patterns: ["Grid DFS", "Connected Components"] },
  "743": { topic: "Graph", patterns: ["Dijkstra / Shortest Path", "Min Heap"] },
  "994": { topic: "Graph", patterns: ["Grid BFS", "Multi-Source BFS"] },

  // ── Heap & Top K
  "215": { topic: "Heap / Priority Queue", patterns: ["Top K Elements", "Min Heap", "Quickselect"] },
  "295": { topic: "Heap / Priority Queue", patterns: ["Two Heaps"] },
  "347": { topic: "Heap / Priority Queue", patterns: ["Top K Elements", "Frequency Counting"] },

  // ── Backtracking
  "22":  { topic: "Backtracking", patterns: ["Backtracking", "Constraint Search"] },
  "39":  { topic: "Backtracking", patterns: ["Combination Sum", "Backtracking"] },
  "46":  { topic: "Backtracking", patterns: ["Permutations", "Backtracking"] },
  "47":  { topic: "Backtracking", patterns: ["Permutations", "Backtracking"] },
  "51":  { topic: "Backtracking", patterns: ["Grid Backtracking", "Constraint Search"] },
  "78":  { topic: "Backtracking", patterns: ["Subsets", "Backtracking"] },
  "79":  { topic: "Matrix / Backtracking", patterns: ["Grid Backtracking", "Grid DFS"] },
  "90":  { topic: "Backtracking", patterns: ["Subsets", "Backtracking"] },

  // ── Dynamic Programming
  "62":  { topic: "Dynamic Programming", patterns: ["2D Grid DP"] },
  "64":  { topic: "Dynamic Programming", patterns: ["2D Grid DP"] },
  "70":  { topic: "Dynamic Programming", patterns: ["1D State DP"] },
  "72":  { topic: "Dynamic Programming", patterns: ["2D Grid DP"] },
  "139": { topic: "Dynamic Programming", patterns: ["1D State DP"] },
  "198": { topic: "Dynamic Programming", patterns: ["1D State DP"] },
  "213": { topic: "Dynamic Programming", patterns: ["1D State DP"] },
  "300": { topic: "Dynamic Programming", patterns: ["1D State DP", "Binary Search"] },
  "322": { topic: "Dynamic Programming", patterns: ["Knapsack / Subset Sum", "1D State DP"] },
  "416": { topic: "Dynamic Programming", patterns: ["Knapsack / Subset Sum"] },
  "518": { topic: "Dynamic Programming", patterns: ["Knapsack / Subset Sum"] },
  "1143":{ topic: "Dynamic Programming", patterns: ["Sequence DP", "2D State DP"] },

  // ── Matrix
  "48":  { topic: "Matrix", patterns: ["Matrix In-place Transpose"] },
  "54":  { topic: "Matrix", patterns: ["Boundary Traversal"] },

  // ── Bitwise
  "136": { topic: "Math & Bitwise", patterns: ["Bit Manipulation (XOR)"] },
};

/**
 * Deterministically resolves Topic and Patterns for any problem.
 * Conservative Fallback Rule: If there is no high-confidence evidence,
 * returns "Unclassified" rather than speculating false patterns.
 */
export function getProblemPatternDetails(problem) {
  if (!problem) return { topic: "General", patterns: ["Unclassified"], isCurated: false, source: PATTERN_HEURISTIC_LABEL };

  const pid = String(problem.id || "");
  if (pid && CURATED_PROBLEM_PATTERNS[pid]) {
    return {
      ...CURATED_PROBLEM_PATTERNS[pid],
      isCurated: true,
      source: PATTERN_SOURCE_LABEL
    };
  }

  // Identify topic from raw topics or fallback
  const rawTopics = problem.topics || [];
  let resolvedTopic = "Array";
  const detectedPatterns = new Set();

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
    else if (tl.includes("backtracking")) resolvedTopic = "Backtracking";
    else if (tl.includes("matrix")) resolvedTopic = "Matrix";

    // ONLY high-confidence explicit pattern tags from source
    if (tl === "two pointers") detectedPatterns.add("Two Pointers");
    if (tl === "sliding window") detectedPatterns.add("Sliding Window");
    if (tl === "binary search") detectedPatterns.add("Binary Search");
    if (tl === "monotonic stack") detectedPatterns.add("Monotonic Stack");
    if (tl === "topological sort") detectedPatterns.add("Topological Sort");
    if (tl === "union find") detectedPatterns.add("Union-Find (DSU)");
  }

  // Non-speculative fallback:
  // If no high-confidence pattern detected, DO NOT GUESS Graph->BFS or Tree->DFS.
  // Return "Unclassified" to prevent corrupting analytics.
  if (detectedPatterns.size === 0) {
    detectedPatterns.add("Unclassified");
  }

  return {
    topic: resolvedTopic,
    patterns: Array.from(detectedPatterns),
    isCurated: false,
    source: PATTERN_HEURISTIC_LABEL
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


// ─────────────────────────────────────────────────────────────
// Pattern Families (Grouping granular techniques into parent families)
// ─────────────────────────────────────────────────────────────
export const DSA_PATTERN_FAMILIES = {
  "Two Pointers & Sliding Window": [
    "Two Pointers",
    "Sliding Window",
    "Fast & Slow Pointers",
    "Expand Around Center",
    "Dutch National Flag"
  ],
  "Array Optimization & Prefix Techniques": [
    "Prefix Sum",
    "Prefix/Suffix Technique",
    "Prefix Sum + HashMap",
    "Single Pass / Running Minimum",
    "Single Pass / Running Extremes",
    "Kadane's Algorithm",
    "Boyer-Moore Voting"
  ],
  "Binary Search": [
    "Binary Search",
    "Binary Search on Partition"
  ],
  "Intervals & Sweep Line": [
    "Interval Merging",
    "Sweep Line"
  ],
  "Hash Tables & Lookup": [
    "Complement Lookup",
    "Frequency Counting",
    "Hash Set / Sequence Expansion",
    "Anagram Grouping",
    "Hash Table Design",
    "Hash Table + Array Swap"
  ],
  "Linked List Techniques": [
    "Linked List Traversal",
    "In-place Reversal",
    "Merge Two Lists",
    "K-way Merge",
    "Dummy Node",
    "Doubly Linked List + HashMap"
  ],
  "Stack & Monotonic Techniques": [
    "Matching Parentheses",
    "Monotonic Stack",
    "Monotonic Queue / Deque",
    "Min/Max Stack",
    "Expression Parsing",
    "Stack Traversal"
  ],
  "Trees & BST": [
    "Tree DFS / Recursion",
    "Tree BFS / Level Order",
    "BST Search",
    "BST Inorder",
    "Lowest Common Ancestor",
    "Path Tracking",
    "Tree DP",
    "Trie Design"
  ],
  "Graphs & Grid Traversal": [
    "Graph BFS",
    "Graph DFS",
    "Grid DFS",
    "Grid BFS",
    "Multi-Source BFS",
    "Connected Components",
    "Shortest Path",
    "Dijkstra / Shortest Path",
    "Topological Sort",
    "Cycle Detection",
    "Union-Find (DSU)"
  ],
  "Heap & Selection": [
    "Top K Elements",
    "Two Heaps",
    "Min Heap",
    "Max Heap",
    "Quickselect"
  ],
  "Backtracking": [
    "Backtracking",
    "Subsets",
    "Permutations",
    "Combination Sum",
    "Grid Backtracking",
    "Constraint Search"
  ],
  "Dynamic Programming": [
    "1D State DP",
    "2D State DP",
    "2D Grid DP",
    "Knapsack / Subset Sum",
    "Sequence DP",
    "Interval DP"
  ],
  "General & Foundations": [
    "Greedy",
    "Sorting",
    "Divide and Conquer",
    "Bit Manipulation (XOR)",
    "Matrix In-place Transpose",
    "Boundary Traversal",
    "General Technique",
    "Unclassified"
  ]
};

export function getPatternFamily(patternName) {
  for (const [family, patterns] of Object.entries(DSA_PATTERN_FAMILIES)) {
    if (patterns.includes(patternName)) return family;
  }
  return "General & Foundations";
}
