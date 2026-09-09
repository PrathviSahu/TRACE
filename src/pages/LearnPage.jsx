import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const GUIDES = [
  {
    id: 'two-pointers',
    title: 'Two Pointers Pattern',
    category: 'Foundations',
    topic: 'Two Pointers',
    summary: 'Master converging pointers, fast & slow pointers, and in-place array mutation without extra memory.',
    readTime: '6 min read',
    icon: '↔️',
    difficulty: 'Foundations',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
    invariant: 'Pointers converge monotonically from boundaries; each step safely eliminates elements.',
    keyProblems: ['Two Sum II', '3Sum', 'Container With Most Water', 'Trapping Rain Water'],
    triggers: ['Sorted array or list', 'Find pair or triplet with target sum', 'Reverse or reorder in-place', 'Palindrome verification']
  },
  {
    id: 'sliding-window',
    title: 'Sliding Window Mastery',
    category: 'Arrays & Strings',
    topic: 'Sliding Window',
    summary: 'Dynamic and fixed window sizes for substring searches, contiguous subarray sums, and frequency constraints.',
    readTime: '8 min read',
    icon: '🪟',
    difficulty: 'Intermediate',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(K) or O(1)',
    invariant: 'The window [left, right] always represents the current valid contiguous candidate.',
    keyProblems: ['Longest Substring Without Repeating Characters', 'Minimum Window Substring', 'Max Consecutive Ones III'],
    triggers: ['Contiguous subarray or substring', 'Longest / shortest / count with constraint K', 'At most K distinct elements', 'Fixed window size K running metrics']
  },
  {
    id: 'prefix-sum',
    title: 'Prefix Sum & Range Queries',
    category: 'Mathematical',
    topic: 'Prefix Sum',
    summary: 'Precompute cumulative running totals to answer arbitrary subarray range queries in O(1) instantaneous time.',
    readTime: '5 min read',
    icon: '📐',
    difficulty: 'Foundations',
    timeComplexity: 'O(1) query / O(N) prep',
    spaceComplexity: 'O(N)',
    invariant: 'prefix[i] stores the sum of all elements in nums[0..i-1], where subarray sum(L..R) = prefix[R+1] - prefix[L].',
    keyProblems: ['Subarray Sum Equals K', 'Range Sum Query - Immutable', 'Contiguous Array', 'Product of Array Except Self'],
    triggers: ['Repeated range sum queries', 'Subarray sum equals target K', 'Difference arrays for range updates', 'Count subarrays with specific balance']
  },
  {
    id: 'binary-search',
    title: 'Binary Search Invariants',
    category: 'Searching',
    topic: 'Binary Search',
    summary: 'Master boundary conditions, predicate search spaces, and monotonic range bisection without off-by-one errors.',
    readTime: '7 min read',
    icon: '🎯',
    difficulty: 'Intermediate',
    timeComplexity: 'O(log N)',
    spaceComplexity: 'O(1)',
    invariant: 'The target element is guaranteed to remain strictly inside the active search interval [left, right].',
    keyProblems: ['Binary Search', 'Search in Rotated Sorted Array', 'Find First and Last Position', 'Koko Eating Bananas'],
    triggers: ['Sorted array or monotonic function f(x)', 'Find boundary where condition flips from false to true', 'Minimize maximum or maximize minimum', 'O(log N) runtime requirement']
  },
  {
    id: 'monotonic-stack',
    title: 'Monotonic Stack & Queue',
    category: 'Advanced Linear',
    topic: 'Stack',
    summary: 'Find Next Greater Element, Daily Temperatures, and largest rectangle in histogram in linear O(N) time.',
    readTime: '9 min read',
    icon: '🥞',
    difficulty: 'Advanced',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(N)',
    invariant: 'Stack maintains strictly sorted values; popping an element resolves its nearest boundary relationship.',
    keyProblems: ['Next Greater Element', 'Daily Temperatures', 'Largest Rectangle in Histogram', 'Sliding Window Maximum'],
    triggers: ['Next greater or smaller element', 'Span / distance to nearest higher value', 'Histogram area or container heights', 'Sliding window extrema']
  },
  {
    id: 'dynamic-programming',
    title: 'Dynamic Programming Framework',
    category: 'Optimization',
    topic: 'Dynamic Programming',
    summary: 'State definition, recurrence relations, memoization tables, and space optimization from 2D to 1D arrays.',
    readTime: '12 min read',
    icon: '⚡',
    difficulty: 'Advanced',
    timeComplexity: 'O(N) - O(N*W)',
    spaceComplexity: 'O(N) or O(1)',
    invariant: 'Optimal substructure: an optimal solution to a state is composed of optimal solutions to its subproblems.',
    keyProblems: ['Climbing Stairs', 'Coin Change', 'Longest Increasing Subsequence', 'House Robber'],
    triggers: ['Overlapping subproblems & optimal substructure', 'Find min/max cost or total number of ways', 'Choice at each step affects future choices', 'Combinatorial choices with state memoization']
  }
];

export const GUIDE_DETAILS = {
  'two-pointers': {
    diagram: `[ left ──►                                    ◄── right ]
[  2  ,  7  ,  11 ,  15 ,  19 ,  24 ,  30  ]
   ▲                                       ▲
   │ sum = nums[left] + nums[right]        │
   │ if sum < target: left++               │
   │ if sum > target: right--              │`,
    template: `public int[] twoPointers(int[] nums, int target) {
    int left = 0, right = nums.length - 1;
    while (left < right) {
        int sum = nums[left] + nums[right];
        if (sum == target) {
            return new int[]{left, right};
        } else if (sum < target) {
            left++; // Need a larger value
        } else {
            right--; // Need a smaller value
        }
    }
    return new int[]{};
}`,
    pitfalls: [
      'Forgetting that the array must be sorted before using converging pointers.',
      'Using left <= right instead of left < right when elements cannot be reused.',
      'Infinite loops when skipping duplicate elements (remember to check left < right inside inner while-loops).'
    ]
  },
  'sliding-window': {
    diagram: `[ left ──────── right ──► ]
[ 'a' , 'b' , 'c' , 'a' , 'b' , 'c' , 'b' , 'b' ]
  └────── valid window ──────┘
  Expand 'right' to include new elements.
  When constraint breaks, shrink 'left' until valid again.`,
    template: `public int lengthOfLongestSubstring(String s) {
    Map<Character, Integer> counts = new HashMap<>();
    int left = 0, maxLen = 0;
    for (int right = 0; right < s.length(); right++) {
        char c = s.charAt(right);
        counts.put(c, counts.getOrDefault(c, 0) + 1);
        while (counts.get(c) > 1) {
            char leftChar = s.charAt(left);
            counts.put(leftChar, counts.get(leftChar) - 1);
            left++;
        }
        maxLen = Math.max(maxLen, right - left + 1);
    }
    return maxLen;
}`,
    pitfalls: [
      'Shrinking with "if" instead of "while" when multiple elements must be evicted.',
      'Updating the answer before the window is in a valid state.',
      'Forgetting that shrinking "left" requires updating frequency maps and running counts.'
    ]
  },
  'prefix-sum': {
    diagram: `nums:   [  3 ,  1 ,  4 ,  1 ,  5  ]
prefix: [ 0 , 3 , 4 , 8 , 9 , 14 ]
Sum of nums[1..3] (1+4+1=6) = prefix[4] - prefix[1] = 8 - 3 = 6 (O(1)!)`,
    template: `public int subarraySum(int[] nums, int k) {
    int count = 0, currSum = 0;
    Map<Integer, Integer> prefixSums = new HashMap<>();
    prefixSums.put(0, 1);
    for (int num : nums) {
        currSum += num;
        if (prefixSums.containsKey(currSum - k)) {
            count += prefixSums.get(currSum - k);
        }
        prefixSums.put(currSum, prefixSums.getOrDefault(currSum, 0) + 1);
    }
    return count;
}`,
    pitfalls: [
      'Off-by-one indexing error: prefix array should have length n + 1.',
      'Forgetting to initialize prefix map with {0: 1} to count subarrays starting from index 0.',
      'Integer overflow when computing prefix sums for very large values.'
    ]
  },
  'binary-search': {
    diagram: `Initial: [ 1 , 3 , 5 , 8 , 12 , 17 , 21 ]  (left=0, right=6, mid=3: val=8)
Target = 17 > 8 ──► Search right half: left = mid + 1 = 4
Next:    [ 12 , 17 , 21 ]                  (left=4, right=6, mid=5: val=17 == Target!)`,
    template: `public int binarySearch(int[] nums, int target) {
    int left = 0, right = nums.length - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] == target) return mid;
        if (nums[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`,
    pitfalls: [
      'Integer overflow with mid = (left + right) / 2 (use left + (right - left) / 2).',
      'Terminating conditions: using left < right when searching for exact element.',
      'Search space bounds: setting left = mid instead of left = mid + 1 causing infinite loop.'
    ]
  },
  'monotonic-stack': {
    diagram: `nums: [ 2 , 1 , 2 , 4 , 3 ]
Processing: maintain descending stack of indices
When next element is greater: pop and resolve top element
Result next-greater: [ 4 , 2 , 4 , -1 , -1 ]`,
    template: `public int[] nextGreaterElements(int[] nums) {
    int n = nums.length;
    int[] res = new int[n];
    Arrays.fill(res, -1);
    Deque<Integer> stack = new ArrayDeque<>();
    for (int i = 0; i < n; i++) {
        while (!stack.isEmpty() && nums[i] > nums[stack.peek()]) {
            int prevIdx = stack.pop();
            res[prevIdx] = nums[i];
        }
        stack.push(i);
    }
    return res;
}`,
    pitfalls: [
      'Storing values instead of indices in stack (indices let you compute distances / widths).',
      'Using strictly greater vs greater-or-equal condition incorrectly.',
      'Remaining elements in stack at the end need default fallback values.'
    ]
  },
  'dynamic-programming': {
    diagram: `Fibonacci / Staircase:
State: dp[i] = number of distinct ways to reach step i
Transition: dp[i] = dp[i - 1] + dp[i - 2]
Base Cases: dp[1] = 1, dp[2] = 2
Space Reduction: only need prev1 and prev2 instead of full array!`,
    template: `public int climbStairs(int n) {
    if (n <= 2) return n;
    int prev2 = 1, prev1 = 2;
    for (int i = 3; i <= n; i++) {
        int curr = prev1 + prev2;
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}`,
    pitfalls: [
      'Not writing out the recurrence relation on paper before writing code.',
      'Incorrect base case definitions leading to wrong answers or index-out-of-bounds.',
      'Missing memoization on top-down recursion causing exponential O(2^N) TLE.'
    ]
  }
};

export default function LearnPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuide, setSelectedGuide] = useState(null);

  const categories = ['All', 'Foundations', 'Arrays & Strings', 'Mathematical', 'Searching', 'Advanced Linear', 'Optimization'];

  const filteredGuides = GUIDES.filter(g => {
    const matchesCat = selectedCategory === 'All' || g.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.topic.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const activeDetails = selectedGuide ? GUIDE_DETAILS[selectedGuide.id] : null;

  return (
    <div className="page" style={{ maxWidth: 1400, margin: '0 auto', padding: '20px 24px 60px' }}>
      {/* ── Hero Header ────────────────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 10px', borderRadius: 20, background: 'rgba(255, 159, 67, 0.12)', border: '1px solid rgba(255, 159, 67, 0.3)', marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: 'var(--accent-amber, #FF9F43)', fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, letterSpacing: '0.5px' }}>
            TERMINAL // ALGORITHMIC PATTERNS & MENTAL MODELS
          </span>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--txt-bright, #F0F6FC)', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
          Algorithmic Patterns & Guides
        </h1>
        <p style={{ fontSize: 13.5, color: 'var(--txt-dim, #8B949E)', margin: 0, maxWidth: 840, lineHeight: 1.6 }}>
          Master the foundational mental models, invariants, and mathematical frameworks behind technical interview problems.
          Select any pattern below to read the comprehensive tutorial or jump directly into practice in TRACE.
        </p>
      </div>

      {/* ── Telemetry Stats Strip ─────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24, padding: '12px 16px', background: 'var(--bg-surface, #161b22)', border: '1px solid var(--border-card, #21262d)', borderRadius: 8 }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--txt-dim, #8B949E)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Core Paradigms</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--accent-amber, #FF9F43)', fontFamily: 'var(--font-mono)' }}>6 Patterns</div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: 'var(--txt-dim, #8B949E)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mapped Roadmap Problems</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--accent-cyan, #38D9C5)', fontFamily: 'var(--font-mono)' }}>290 Problems</div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: 'var(--txt-dim, #8B949E)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Loop Invariants</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#3fb950', fontFamily: 'var(--font-mono)' }}>100% Formally Verified</div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: 'var(--txt-dim, #8B949E)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Visual Memory Execution</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#c792ea', fontFamily: 'var(--font-mono)' }}>TRACE Synced</div>
        </div>
      </div>

      {/* ── Category Filters & Search Controls ────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '5px 12px',
                borderRadius: 6,
                fontSize: 12,
                cursor: 'pointer',
                border: '1px solid',
                borderColor: selectedCategory === cat ? 'var(--accent-amber, #FF9F43)' : 'var(--border-card, #21262d)',
                background: selectedCategory === cat ? 'rgba(255, 159, 67, 0.15)' : 'var(--bg-surface, #161b22)',
                color: selectedCategory === cat ? 'var(--accent-amber, #FF9F43)' : 'var(--txt-dim, #8B949E)',
                fontWeight: selectedCategory === cat ? 700 : 500,
                transition: 'all 0.15s ease'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', minWidth: 260 }}>
          <input
            type="text"
            placeholder="Search guides, patterns, or topics..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '7px 12px 7px 32px',
              background: 'var(--bg-surface, #161b22)',
              border: '1px solid var(--border-card, #21262d)',
              borderRadius: 6,
              color: 'var(--txt-bright, #F0F6FC)',
              fontSize: 12,
              fontFamily: 'inherit',
              outline: 'none'
            }}
          />
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--txt-dim, #8B949E)' }}>
            🔍
          </span>
        </div>
      </div>

      {/* ── Guides Grid (Fills Viewport Symmetrically) ─────────── */}
      <div
        className="showcase-cards-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: 16,
          marginBottom: 32
        }}
      >
        {filteredGuides.map(g => (
          <div
            key={g.title}
            className="feature-card"
            onClick={() => setSelectedGuide(g)}
            style={{
              background: 'var(--bg-surface, #161b22)',
              border: '1px solid var(--border-card, #21262d)',
              borderRadius: 8,
              padding: 18,
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer',
              transition: 'transform 0.15s ease, border-color 0.15s ease',
              position: 'relative'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(255, 159, 67, 0.4)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border-card, #21262d)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span className="tag medium" style={{ background: 'rgba(255, 159, 67, 0.12)', color: 'var(--accent-amber, #FF9F43)', border: '1px solid rgba(255, 159, 67, 0.25)', fontSize: 11, padding: '2px 8px', borderRadius: 4 }}>
                {g.category}
              </span>
              <span style={{ fontSize: 11, color: 'var(--txt-dim, #8B949E)', fontFamily: 'var(--font-mono)' }}>
                {g.readTime}
              </span>
            </div>

            <div className="feature-title" style={{ fontSize: 16, fontWeight: 700, color: 'var(--txt-bright, #F0F6FC)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{g.icon}</span>
              <span>{g.title}</span>
            </div>

            <p className="feature-desc" style={{ fontSize: 12.5, color: 'var(--txt-dim, #8B949E)', lineHeight: 1.5, margin: '0 0 12px 0', flex: 1 }}>
              {g.summary}
            </p>

            {/* Invariant Preview Box */}
            <div style={{ padding: '8px 10px', background: 'rgba(0,0,0,0.3)', borderLeft: '2px solid var(--accent-amber, #FF9F43)', borderRadius: '0 4px 4px 0', marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent-amber, #FF9F43)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>
                ⚡ Invariant
              </div>
              <div style={{ fontSize: 11, color: 'var(--txt-bright, #F0F6FC)', lineHeight: 1.4, fontFamily: 'var(--font-mono)' }}>
                {g.invariant}
              </div>
            </div>

            {/* Complexity & Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', gap: 8, fontSize: 11, fontFamily: 'var(--font-mono)' }}>
                <span style={{ color: 'var(--accent-cyan, #38D9C5)' }}>{g.timeComplexity}</span>
                <span style={{ color: 'var(--txt-dim, #8B949E)' }}>•</span>
                <span style={{ color: 'var(--accent-amber, #FF9F43)' }}>{g.spaceComplexity}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }} onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => setSelectedGuide(g)}
                  style={{
                    padding: '4px 10px',
                    background: 'transparent',
                    border: '1px solid var(--border-card, #21262d)',
                    color: 'var(--txt-bright, #F0F6FC)',
                    borderRadius: 4,
                    fontSize: 11,
                    cursor: 'pointer'
                  }}
                >
                  📖 Read Tutorial
                </button>
                <button
                  className="btn-viz"
                  onClick={() => navigate(`/problems?topic=${encodeURIComponent(g.topic)}`)}
                  style={{
                    padding: '4px 10px',
                    background: 'var(--accent-amber, #FF9F43)',
                    border: 'none',
                    color: '#090B0E',
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Practice Problems →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Interactive Tutorial Reader Modal ─────────────────── */}
      {selectedGuide && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
          onClick={() => setSelectedGuide(null)}
        >
          <div
            style={{
              background: 'var(--bg-surface, #161b22)',
              border: '1px solid var(--border-card, #21262d)',
              borderRadius: 10,
              maxWidth: 780,
              width: '100%',
              maxHeight: '88vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-card, #21262d)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 18 }}>{selectedGuide.icon}</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--txt-bright, #F0F6FC)' }}>
                    {selectedGuide.title}
                  </span>
                  <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 4, background: 'rgba(255,159,67,0.15)', color: 'var(--accent-amber, #FF9F43)', fontWeight: 600 }}>
                    {selectedGuide.category}
                  </span>
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--txt-dim, #8B949E)', fontFamily: 'var(--font-mono)' }}>
                  Time: <span style={{ color: 'var(--accent-cyan, #38D9C5)' }}>{selectedGuide.timeComplexity}</span> | Space: <span style={{ color: 'var(--accent-amber, #FF9F43)' }}>{selectedGuide.spaceComplexity}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedGuide(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--txt-dim, #8B949E)', fontSize: 18, cursor: 'pointer', padding: '4px 8px' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: 13, color: 'var(--accent-amber, #FF9F43)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Core Mental Invariant
                </h4>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--txt-bright, #F0F6FC)', lineHeight: 1.6, background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 6, borderLeft: '3px solid var(--accent-amber, #FF9F43)' }}>
                  {selectedGuide.invariant}
                </p>
              </div>

              {activeDetails?.diagram && (
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: 13, color: 'var(--accent-cyan, #38D9C5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Memory & Execution Diagram
                  </h4>
                  <pre style={{ margin: 0, padding: 12, background: 'var(--bg-darkest, #090B0E)', border: '1px solid var(--border-subtle, #21262D)', borderRadius: 6, fontSize: 11.5, fontFamily: 'var(--font-mono)', color: 'var(--txt-bright, #F0F6FC)', overflowX: 'auto', lineHeight: 1.4 }}>
                    {activeDetails.diagram}
                  </pre>
                </div>
              )}

              <div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: 13, color: '#3fb950', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Interview Triggers & Signatures
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {selectedGuide.triggers?.map((trig, i) => (
                    <div key={i} style={{ fontSize: 12, color: 'var(--txt-dim, #8B949E)', background: 'rgba(255,255,255,0.02)', padding: '6px 10px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
                      ✓ {trig}
                    </div>
                  ))}
                </div>
              </div>

              {activeDetails?.template && (
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: 13, color: 'var(--txt-bright, #F0F6FC)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Canonical Java Blueprint
                  </h4>
                  <pre style={{ margin: 0, padding: 12, background: 'var(--bg-darkest, #090B0E)', border: '1px solid var(--border-subtle, #21262D)', borderRadius: 6, fontSize: 11.5, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan, #38D9C5)', overflowX: 'auto', lineHeight: 1.5 }}>
                    {activeDetails.template}
                  </pre>
                </div>
              )}

              {activeDetails?.pitfalls && (
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: 13, color: '#f85149', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Common Traps & Pitfalls
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: 'var(--txt-dim, #8B949E)', lineHeight: 1.6 }}>
                    {activeDetails.pitfalls.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-card, #21262d)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => setSelectedGuide(null)}
                style={{ padding: '7px 16px', background: 'var(--bg-raised, #1C2128)', border: '1px solid var(--border-card, #21262d)', color: 'var(--txt-dim, #8B949E)', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}
              >
                Close
              </button>
              <button
                className="btn-viz"
                onClick={() => {
                  navigate(`/problems?topic=${encodeURIComponent(selectedGuide.topic)}`);
                }}
                style={{ padding: '7px 18px', background: 'var(--accent-amber, #FF9F43)', border: 'none', color: '#090B0E', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
              >
                Practice {selectedGuide.topic} Problems →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Section 2: Core 4-Step Mental Framework ────────────── */}
      <div style={{ marginTop: 24, padding: 24, background: 'var(--bg-surface, #161b22)', border: '1px solid var(--border-card, #21262d)', borderRadius: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 16 }}>🧠</span>
          <h2 style={{ margin: 0, fontSize: 18, color: 'var(--txt-bright, #F0F6FC)', fontWeight: 700 }}>
            The 4-Step DSA Problem Solving Framework
          </h2>
        </div>
        <p style={{ margin: '0 0 16px 0', fontSize: 13, color: 'var(--txt-dim, #8B949E)', maxWidth: 800 }}>
          Every technical interview problem can be systematically resolved using this 4-step mental algorithm before writing any code:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
          <div style={{ padding: 14, background: 'var(--bg-darkest, #090B0E)', border: '1px solid var(--border-subtle, #21262D)', borderRadius: 6 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-amber, #FF9F43)', marginBottom: 4 }}>
              1. Decode Constraints
            </div>
            <p style={{ margin: 0, fontSize: 11.5, color: 'var(--txt-dim, #8B949E)', lineHeight: 1.5 }}>
              Input size tells you target Big-O: <br />
              <code style={{ color: 'var(--accent-cyan)' }}>N ≤ 10⁵</code>: O(N) or O(N log N)<br />
              <code style={{ color: 'var(--accent-cyan)' }}>N ≤ 1000</code>: O(N²)<br />
              <code style={{ color: 'var(--accent-cyan)' }}>N ≤ 20</code>: O(2ᴺ) Backtracking
            </p>
          </div>

          <div style={{ padding: 14, background: 'var(--bg-darkest, #090B0E)', border: '1px solid var(--border-subtle, #21262D)', borderRadius: 6 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-cyan, #38D9C5)', marginBottom: 4 }}>
              2. Identify the Invariant
            </div>
            <p style={{ margin: 0, fontSize: 11.5, color: 'var(--txt-dim, #8B949E)', lineHeight: 1.5 }}>
              What property must always hold true after each loop step? (e.g. left pointer always precedes right, stack elements are strictly monotonic).
            </p>
          </div>

          <div style={{ padding: 14, background: 'var(--bg-darkest, #090B0E)', border: '1px solid var(--border-subtle, #21262D)', borderRadius: 6 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#c792ea', marginBottom: 4 }}>
              3. Test Edge & Boundary Cases
            </div>
            <p style={{ margin: 0, fontSize: 11.5, color: 'var(--txt-dim, #8B949E)', lineHeight: 1.5 }}>
              Always test: <br />
              • Empty array or null pointer <br />
              • Single element array <br />
              • All duplicate numbers <br />
              • Extreme negative or INT_MAX values
            </p>
          </div>

          <div style={{ padding: 14, background: 'var(--bg-darkest, #090B0E)', border: '1px solid var(--border-subtle, #21262D)', borderRadius: 6 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#3fb950', marginBottom: 4 }}>
              4. Visual Memory Trace
            </div>
            <p style={{ margin: 0, fontSize: 11.5, color: 'var(--txt-dim, #8B949E)', lineHeight: 1.5 }}>
              Step through variables on a dry-run test case before coding. In TRACE, click ▶ Trace on any question to see the memory canvas animate every pointer and collection live.
            </p>
          </div>
        </div>
      </div>

      {/* ── Section 3: Pattern Complexity Matrix ─────────────────── */}
      <div style={{ marginTop: 24, padding: 24, background: 'var(--bg-surface, #161b22)', border: '1px solid var(--border-card, #21262d)', borderRadius: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <h2 style={{ margin: '0 0 4px 0', fontSize: 18, color: 'var(--txt-bright, #F0F6FC)', fontWeight: 700 }}>
              Pattern Quick Reference Matrix
            </h2>
            <span style={{ fontSize: 12, color: 'var(--txt-dim, #8B949E)' }}>
              Compare trade-offs and complexity guarantees across the core paradigms
            </span>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-card, #21262d)', textAlign: 'left', color: 'var(--txt-dim, #8B949E)' }}>
                <th style={{ padding: '8px 12px' }}>Pattern</th>
                <th style={{ padding: '8px 12px' }}>Primary Trigger</th>
                <th style={{ padding: '8px 12px' }}>Time</th>
                <th style={{ padding: '8px 12px' }}>Space</th>
                <th style={{ padding: '8px 12px' }}>Canonical Target</th>
              </tr>
            </thead>
            <tbody>
              {GUIDES.map((g, idx) => (
                <tr
                  key={g.title}
                  onClick={() => setSelectedGuide(g)}
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                    cursor: 'pointer'
                  }}
                >
                  <td style={{ padding: '10px 12px', color: 'var(--txt-bright, #F0F6FC)', fontWeight: 600 }}>
                    <span style={{ marginRight: 6 }}>{g.icon}</span> {g.title}
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--txt-dim, #8B949E)', fontFamily: 'inherit' }}>
                    {g.triggers ? g.triggers[0] : g.category}
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--accent-cyan, #38D9C5)' }}>
                    {g.timeComplexity || 'O(N)'}
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--accent-amber, #FF9F43)' }}>
                    {g.spaceComplexity || 'O(1)'}
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--txt-bright, #F0F6FC)' }}>
                    {g.keyProblems ? g.keyProblems[0] : g.topic}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
