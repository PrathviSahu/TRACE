const { runJava } = require("../src/engine/interpreter.js");

// Testing if we can create TreeNode manually in the code and get correct results
const code = `class Solution {
    public int maxDepth(TreeNode root) {
        // Build tree manually for [3,9,20,null,null,15,7]
        // root = new TreeNode(3)
        // root.left = new TreeNode(9)
        // root.right = new TreeNode(20)
        // root.right.left = new TreeNode(15)
        // root.right.right = new TreeNode(7)
        TreeNode t = new TreeNode(3);
        t.left = new TreeNode(9);
        t.right = new TreeNode(20);
        t.right.left = new TreeNode(15);
        t.right.right = new TreeNode(7);
        return depthOf(t);
    }
    public int depthOf(TreeNode r) {
        if (r == null) return 0;
        int l = depthOf(r.left);
        int ri = depthOf(r.right);
        if (l > ri) return l + 1;
        return ri + 1;
    }
}`;

const r = runJava(code, {});
console.log("Manual build depth:", r.returnValue, "expected: 3, error:", r.error);
