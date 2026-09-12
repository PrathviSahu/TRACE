const { runJava } = require("../src/engine/interpreter.js");

// Great! Manual TreeNode works! Now we need templates that construct the tree from input array
// The key insight: problem templates for tree problems should build the tree inline

// Template that builds tree from level-order array (the LeetCode format)
const treeTemplate = `class Solution {
    // Helper to build tree from level-order array
    TreeNode buildTree(int[] nodes, int i) {
        if (i >= nodes.length || nodes[i] == -1001) return null;
        TreeNode node = new TreeNode(nodes[i]);
        node.left = buildTree(nodes, 2 * i + 1);
        node.right = buildTree(nodes, 2 * i + 2);
        return node;
    }
    
    public int maxDepth(int[] root) {
        TreeNode r = buildTree(root, 0);
        return depth(r);
    }
    
    int depth(TreeNode node) {
        if (node == null) return 0;
        int l = depth(node.left);
        int ri = depth(node.right);
        if (l > ri) return l + 1;
        return ri + 1;
    }
}`;

// But -1001 is awkward. Let's use -999 for null sentinel
// Actually, let's test with direct int array where -1 = null
const treeTemplate2 = `class Solution {
    public int maxDepth(int[] arr) {
        if (arr == null || arr.length == 0) return 0;
        return solve(arr, 0);
    }
    
    int solve(int[] arr, int i) {
        if (i >= arr.length) return 0;
        if (arr[i] == -1) return 0;
        int l = solve(arr, 2 * i + 1);
        int r = solve(arr, 2 * i + 2);
        if (l > r) return l + 1;
        return r + 1;
    }
}`;

const r2 = runJava(treeTemplate2, { arr: "[3,9,20,-1,-1,15,7]" });
console.log("Array-based depth:", r2.returnValue, "expected: 3, error:", r2.error);

// Balanced check with [1,2,3,4,5]
const r3 = runJava(treeTemplate2, { arr: "[1,2,3,4,5]" });
console.log("[1,2,3,4,5] depth:", r3.returnValue, "expected: 3, error:", r3.error);

// Also test invert tree
const invertTemplate = `class Solution {
    public int[] invertTree(int[] arr) {
        invertHelper(arr, 0);
        return arr;
    }
    
    void invertHelper(int[] arr, int i) {
        if (i >= arr.length || arr[i] == -1) return;
        // Swap left and right children values  
        int leftIdx = 2 * i + 1;
        int rightIdx = 2 * i + 2;
        if (leftIdx < arr.length && rightIdx < arr.length) {
            int temp = arr[leftIdx];
            arr[leftIdx] = arr[rightIdx];
            arr[rightIdx] = temp;
        }
        invertHelper(arr, leftIdx);
        invertHelper(arr, rightIdx);
    }
}`;
const r4 = runJava(invertTemplate, { arr: "[4,2,7,1,3,6,9]" });
console.log("Invert [4,2,7,1,3,6,9]:", r4.returnValue, "expected: [4,7,2,9,6,3,1]");
