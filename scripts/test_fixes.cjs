const { runJava } = require("../src/engine/interpreter.js");

// Fix #3: cast to int causes NaN - use char comparison instead
const code3 = `class Solution {
    public int lengthOfLongestSubstring(String s) {
        int maxLen = 0;
        int left = 0;
        int[] seen = new int[26];
        for (int i = 0; i < 26; i++) seen[i] = -1;
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            int idx = c - 'a';
            if (idx >= 0 && idx < 26 && seen[idx] >= left) {
                left = seen[idx] + 1;
            }
            if (idx >= 0 && idx < 26) seen[idx] = right;
            int len = right - left + 1;
            if (len > maxLen) maxLen = len;
        }
        return maxLen;
    }
}`;
const r3a = runJava(code3, { s: '"abcabcbb"' });
console.log("#3 v2 lowercase: steps=" + r3a.trace?.length + ", return=" + r3a.returnValue + ", error=" + r3a.error);

// Using variable for char index
const code3b = `class Solution {
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
}`;
const r3b = runJava(code3b, { s: '"abcabcbb"' });
console.log("#3 v3 freq array: steps=" + r3b.trace?.length + ", return=" + r3b.returnValue + ", error=" + r3b.error);

// Fix #104: TreeNode depth issue - using iterative
const code104 = `class Solution {
    public int maxDepth(TreeNode root) {
        if (root == null) return 0;
        int leftD = 0;
        if (root.left != null) leftD = maxDepth(root.left);
        int rightD = 0;
        if (root.right != null) rightD = maxDepth(root.right);
        if (leftD >= rightD) return leftD + 1;
        return rightD + 1;
    }
}`;
const r104 = runJava(code104, { root: "[3,9,20,null,null,15,7]" });
console.log("#104 v2: steps=" + r104.trace?.length + ", return=" + r104.returnValue + ", expected=3, error=" + r104.error);

const code104c = `class Solution {
    public int maxDepth(TreeNode root) {
        if (root == null) return 0;
        int depth = 0;
        int l = maxDepth(root.left);
        int r = maxDepth(root.right);
        if (l > r) depth = l + 1;
        else depth = r + 1;
        return depth;
    }
}`;
const r104c = runJava(code104c, { root: "[3,9,20,null,null,15,7]" });
console.log("#104 v3: steps=" + r104c.trace?.length + ", return=" + r104c.returnValue + ", expected=3, error=" + r104c.error);

