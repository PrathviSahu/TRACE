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
  },

  'container-with-most-water': {
    id: 'container-with-most-water',
    name: 'Container With Most Water',
    category: 'Arrays',
    difficulty: 'medium',
    pattern: 'Two Pointers',
    python: `# Container With Most Water - LeetCode 11
class Solution:
    def maxArea(self, height):
        left, right = 0, len(height) - 1
        max_water = 0
        while left < right:
            width = right - left
            h = min(height[left], height[right])
            max_water = max(max_water, width * h)
            if height[left] < height[right]:
                left += 1
            else:
                right -= 1
        return max_water

# Test
sol = Solution()
print(sol.maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7]))`,
    java: `// Container With Most Water - LeetCode 11
class Solution {
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
    inputs: {
      pythonText: "height = [1, 8, 6, 2, 5, 4, 8, 3, 7]",
      javaInputs: { height: '[1, 8, 6, 2, 5, 4, 8, 3, 7]' }
    },
    defaultInputDisplay: "height = [1, 8, 6, 2, 5, 4, 8, 3, 7]"
  },

  'hashmap-hashset': {
    id: 'hashmap-hashset',
    name: 'Two Sum (Hash Map)',
    category: 'HashMap & HashSet',
    difficulty: 'easy',
    pattern: 'Hash Map',
    python: `# Two Sum with Hash Map - LeetCode 1
class Solution:
    def twoSum(self, nums, target):
        lookup = {}
        for i in range(len(nums)):
            comp = target - nums[i]
            if comp in lookup:
                return [lookup[comp], i]
            lookup[nums[i]] = i
        return []

# Test
sol = Solution()
print(sol.twoSum([2, 7, 11, 15], 9))`,
    java: `// Two Sum using HashMap
class Solution {
    public int[] twoSum(int[] nums, int target) {
        HashMap<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int comp = target - nums[i];
            if (map.containsKey(comp)) {
                return new int[]{map.get(comp), i};
            }
            map.put(nums[i], i);
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

  'linked-list': {
    id: 'linked-list',
    name: 'Reverse Linked List',
    category: 'Linked List',
    difficulty: 'easy',
    pattern: 'In-place Reversal',
    python: `# Reverse Linked List - LeetCode 206
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def reverseList(self, head):
        prev = None
        curr = head
        while curr:
            next_node = curr.next
            curr.next = prev
            prev = curr
            curr = next_node
        return prev

# Test
head = ListNode(1, ListNode(2, ListNode(3)))
sol = Solution()
new_head = sol.reverseList(head)`,
    java: `// Reverse Linked List - LeetCode 206
class ListNode {
    int val;
    ListNode next;
    ListNode(int val) {
        this.val = val;
        this.next = null;
    }
}

class Solution {
    public ListNode reverseList() {
        ListNode head = new ListNode(1);
        head.next = new ListNode(2);
        head.next.next = new ListNode(3);

        ListNode prev = null;
        ListNode curr = head;
        while (curr != null) {
            ListNode nextTemp = curr.next;
            curr.next = prev;
            prev = curr;
            curr = nextTemp;
        }
        return prev;
    }
}`,
    inputs: {
      pythonText: "head = [1, 2, 3]",
      javaInputs: {}
    },
    defaultInputDisplay: "head = [1, 2, 3]"
  },

  'stack': {
    id: 'stack',
    name: 'Valid Parentheses',
    category: 'Stack',
    difficulty: 'easy',
    pattern: 'Stack Matching',
    python: `# Valid Parentheses - LeetCode 20
class Solution:
    def isValid(self, s):
        stack = []
        matching = {')': '(', '}': '{', ']': '['}
        for char in s:
            if char in matching.values():
                stack.append(char)
            elif char in matching:
                if not stack or stack.pop() != matching[char]:
                    return False
        return len(stack) == 0

# Test
sol = Solution()
print(sol.isValid("{[()]}"))`,
    java: `// Valid Parentheses - LeetCode 20
class Solution {
    public boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c == '(' || c == '{' || c == '[') {
                stack.push(c);
            } else {
                if (stack.isEmpty()) return false;
                char top = stack.pop();
                if (c == ')' && top != '(') return false;
                if (c == '}' && top != '{') return false;
                if (c == ']' && top != '[') return false;
            }
        }
        return stack.isEmpty();
    }
}`,
    inputs: {
      pythonText: 's = "{[()]}"',
      javaInputs: { s: '"{[()]}"' }
    },
    defaultInputDisplay: 's = "{[()]}"'
  },

  'queue-deque': {
    id: 'queue-deque',
    name: 'Queue Operations',
    category: 'Queue & Deque',
    difficulty: 'easy',
    pattern: 'FIFO Queue',
    python: `# Queue / Deque Demonstration
from collections import deque

class Solution:
    def queueDemo(self):
        queue = deque()
        queue.append(10)
        queue.append(20)
        queue.append(30)
        first = queue.popleft()
        queue.append(40)
        peek_elem = queue[0]
        return first + peek_elem

# Test
sol = Solution()
print(sol.queueDemo())`,
    java: `// Queue / Deque Operations
class Solution {
    public int queueDemo() {
        Queue<Integer> queue = new ArrayDeque<>();
        queue.offer(10);
        queue.offer(20);
        queue.offer(30);

        int first = queue.poll();
        queue.offer(40);
        int second = queue.peek();
        return first + second;
    }
}`,
    inputs: {
      pythonText: "queue = [10, 20, 30]",
      javaInputs: {}
    },
    defaultInputDisplay: "operations: offer(10, 20, 30), poll(), offer(40)"
  },

  'binary-tree': {
    id: 'binary-tree',
    name: 'Invert Binary Tree',
    category: 'Binary Tree & BST',
    difficulty: 'easy',
    pattern: 'Tree Traversal',
    python: `# Invert Binary Tree - LeetCode 226
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def invertTree(self, root):
        if not root:
            return None
        root.left, root.right = root.right, root.left
        return root

# Test
root = TreeNode(4, TreeNode(2), TreeNode(7))
sol = Solution()
inverted = sol.invertTree(root)`,
    java: `// Invert Binary Tree - LeetCode 226
class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode(int val) {
        this.val = val;
        this.left = null;
        this.right = null;
    }
}

class Solution {
    public TreeNode invertTree() {
        TreeNode root = new TreeNode(4);
        root.left = new TreeNode(2);
        root.right = new TreeNode(7);
        root.left.left = new TreeNode(1);
        root.left.right = new TreeNode(3);
        root.right.left = new TreeNode(6);
        root.right.right = new TreeNode(9);

        TreeNode temp = root.left;
        root.left = root.right;
        root.right = temp;
        return root;
    }
}`,
    inputs: {
      pythonText: "root = [4, 2, 7, 1, 3, 6, 9]",
      javaInputs: {}
    },
    defaultInputDisplay: "root = [4, 2, 7, 1, 3, 6, 9]"
  },

  'heap-priority-queue': {
    id: 'heap-priority-queue',
    name: 'Kth Largest Element (Min-Heap)',
    category: 'Heap / Priority Queue',
    difficulty: 'medium',
    pattern: 'Min-Heap / Top-K',
    python: `# Kth Largest Element in an Array - LeetCode 215
import heapq

class Solution:
    def findKthLargest(self, nums, k):
        heap = []
        for num in nums:
            heapq.heappush(heap, num)
            if len(heap) > k:
                heapq.heappop(heap)
        return heap[0]

# Test
sol = Solution()
print(sol.findKthLargest([3, 2, 1, 5, 6, 4], 2))`,
    java: `// Kth Largest Element in an Array - LeetCode 215
class Solution {
    public int findKthLargest(int[] nums, int k) {
        PriorityQueue<Integer> pq = new PriorityQueue<>();
        for (int i = 0; i < nums.length; i++) {
            pq.offer(nums[i]);
            if (pq.size() > k) {
                pq.poll();
            }
        }
        return pq.peek();
    }
}`,
    inputs: {
      pythonText: "nums = [3, 2, 1, 5, 6, 4]\nk = 2",
      javaInputs: { nums: '[3, 2, 1, 5, 6, 4]', k: '2' }
    },
    defaultInputDisplay: "nums = [3, 2, 1, 5, 6, 4]\nk = 2"
  },

  'graphs': {
    id: 'graphs',
    name: 'Graph BFS Traversal',
    category: 'Graphs',
    difficulty: 'medium',
    pattern: 'Breadth-First Search',
    python: `# Graph Breadth-First Search (BFS) Traversal
from collections import deque

class Solution:
    def bfsGraph(self):
        adj = {0: [1, 2], 1: [2], 2: []}
        visited = set([0])
        queue = deque([0])
        visited_count = 0
        while queue:
            node = queue.popleft()
            visited_count += 1
            for neighbor in adj.get(node, []):
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)
        return visited_count

# Test
sol = Solution()
print(sol.bfsGraph())`,
    java: `// Graph Breadth-First Search (BFS) Traversal
class Solution {
    public int bfsGraph() {
        ArrayList<Integer> adj0 = new ArrayList<>();
        adj0.add(1);
        adj0.add(2);

        Queue<Integer> queue = new ArrayDeque<>();
        boolean[] visited = new boolean[3];

        queue.offer(0);
        visited[0] = true;
        int visitedNodes = 0;

        while (!queue.isEmpty()) {
            int node = queue.poll();
            visitedNodes++;
            if (node == 0) {
                for (int i = 0; i < adj0.size(); i++) {
                    int neighbor = adj0.get(i);
                    if (!visited[neighbor]) {
                        visited[neighbor] = true;
                        queue.offer(neighbor);
                    }
                }
            }
        }
        return visitedNodes;
    }
}`,
    inputs: {
      pythonText: "graph = {0: [1, 2], 1: [2], 2: []}",
      javaInputs: {}
    },
    defaultInputDisplay: "adj: 0->[1,2], 1->[2], 2->[]"
  }
,
  'climbing-stairs': {
    id: 'climbing-stairs',
    name: 'Climbing Stairs',
    category: 'Dynamic Programming',
    difficulty: 'easy',
    pattern: '1D Dynamic Programming',
    python: `# Climbing Stairs - LeetCode 70
class Solution:
    def climbStairs(self, n: int) -> int:
        if n <= 2:
            return n
        dp = [0] * (n + 1)
        dp[1] = 1
        dp[2] = 2
        for i in range(3, n + 1):
            dp[i] = dp[i - 1] + dp[i - 2]
        return dp[n]

sol = Solution()
print(sol.climbStairs(5))`,
    java: `// Climbing Stairs - LeetCode 70 (Dynamic Programming)
class Solution {
    public int climbStairs(int n) {
        if (n <= 2) return n;
        int[] dp = new int[n + 1];
        dp[1] = 1;
        dp[2] = 2;
        for (int i = 3; i <= n; i++) {
            dp[i] = dp[i - 1] + dp[i - 2];
        }
        return dp[n];
    }
}`,
    inputs: {
      pythonText: "n = 5",
      javaInputs: { n: "5" }
    },
    defaultInputDisplay: "n = 5"
  },
  'house-robber': {
    id: 'house-robber',
    name: 'House Robber',
    category: 'Dynamic Programming',
    difficulty: 'medium',
    pattern: '1D Dynamic Programming',
    python: `# House Robber - LeetCode 198
class Solution:
    def rob(self, nums):
        if not nums: return 0
        if len(nums) == 1: return nums[0]
        prev2 = nums[0]
        prev1 = max(nums[0], nums[1])
        for i in range(2, len(nums)):
            curr = max(prev1, prev2 + nums[i])
            prev2 = prev1
            prev1 = curr
        return prev1

sol = Solution()
print(sol.rob([2, 7, 9, 3, 1]))`,
    java: `// House Robber - LeetCode 198 (Dynamic Programming)
class Solution {
    public int rob(int[] nums) {
        if (nums.length == 0) return 0;
        if (nums.length == 1) return nums[0];
        int prev2 = nums[0];
        int prev1 = Math.max(nums[0], nums[1]);
        for (int i = 2; i < nums.length; i++) {
            int current = Math.max(prev1, prev2 + nums[i]);
            prev2 = prev1;
            prev1 = current;
        }
        return prev1;
    }
}`,
    inputs: {
      pythonText: "nums = [2, 7, 9, 3, 1]",
      javaInputs: { nums: "[2, 7, 9, 3, 1]" }
    },
    defaultInputDisplay: "nums = [2, 7, 9, 3, 1]"
  },
  'bubble-sort': {
    id: 'bubble-sort',
    name: 'Bubble Sort',
    category: 'Sorting',
    difficulty: 'easy',
    pattern: 'Sorting',
    python: `# Bubble Sort
class Solution:
    def bubbleSort(self, nums):
        n = len(nums)
        for i in range(n - 1):
            for j in range(n - i - 1):
                if nums[j] > nums[j + 1]:
                    nums[j], nums[j + 1] = nums[j + 1], nums[j]
        return nums

sol = Solution()
print(sol.bubbleSort([5, 1, 4, 2, 8]))`,
    java: `// Bubble Sort - Sorting Algorithm
class Solution {
    public int[] bubbleSort(int[] nums) {
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
    inputs: {
      pythonText: "nums = [5, 1, 4, 2, 8]",
      javaInputs: { nums: "[5, 1, 4, 2, 8]" }
    },
    defaultInputDisplay: "nums = [5, 1, 4, 2, 8]"
  },
  'insertion-sort': {
    id: 'insertion-sort',
    name: 'Insertion Sort',
    category: 'Sorting',
    difficulty: 'easy',
    pattern: 'Sorting',
    python: `# Insertion Sort
class Solution:
    def insertionSort(self, nums):
        for i in range(1, len(nums)):
            key = nums[i]
            j = i - 1
            while j >= 0 and nums[j] > key:
                nums[j + 1] = nums[j]
                j -= 1
            nums[j + 1] = key
        return nums

sol = Solution()
print(sol.insertionSort([6, 3, 8, 2, 9, 1]))`,
    java: `// Insertion Sort - Sorting Algorithm
class Solution {
    public int[] insertionSort(int[] nums) {
        for (int i = 1; i < nums.length; i++) {
            int key = nums[i];
            int j = i - 1;
            while (j >= 0 && nums[j] > key) {
                nums[j + 1] = nums[j];
                j--;
            }
            nums[j + 1] = key;
        }
        return nums;
    }
}`,
    inputs: {
      pythonText: "nums = [6, 3, 8, 2, 9, 1]",
      javaInputs: { nums: "[6, 3, 8, 2, 9, 1]" }
    },
    defaultInputDisplay: "nums = [6, 3, 8, 2, 9, 1]"
  },
  'fibonacci': {
    id: 'fibonacci',
    name: 'Fibonacci (Recursive)',
    category: 'Recursion',
    difficulty: 'easy',
    pattern: 'Recursion / Call Stack',
    python: `# Fibonacci - Recursive Call Stack
class Solution:
    def fib(self, n: int) -> int:
        if n <= 1:
            return n
        return self.fib(n - 1) + self.fib(n - 2)

sol = Solution()
print(sol.fib(5))`,
    java: `// Fibonacci - Recursive Call Stack
class Solution {
    public int fib(int n) {
        if (n <= 1) {
            return n;
        }
        return fib(n - 1) + fib(n - 2);
    }
}`,
    inputs: {
      pythonText: "n = 5",
      javaInputs: { n: "5" }
    },
    defaultInputDisplay: "n = 5"
  },
  'factorial': {
    id: 'factorial',
    name: 'Factorial (Recursive)',
    category: 'Recursion',
    difficulty: 'easy',
    pattern: 'Recursion / Call Stack',
    python: `# Factorial - Recursive Call Stack
class Solution:
    def factorial(self, n: int) -> int:
        if n <= 1:
            return 1
        return n * self.factorial(n - 1)

sol = Solution()
print(sol.factorial(5))`,
    java: `// Factorial - Recursive Call Stack
class Solution {
    public int factorial(int n) {
        if (n <= 1) {
            return 1;
        }
        return n * factorial(n - 1);
    }
}`,
    inputs: {
      pythonText: "n = 5",
      javaInputs: { n: "5" }
    },
    defaultInputDisplay: "n = 5"
  }
};