const { runJava } = require("../src/engine/interpreter.js");

// Check how root.left and root.right are accessed
const code = `class Solution {
    public int test(TreeNode root) {
        if (root == null) return -1;
        int hasLeft = 0;
        int hasRight = 0;
        if (root.left != null) hasLeft = root.left.val;
        if (root.right != null) hasRight = root.right.val;
        return root.val * 100 + hasLeft * 10 + hasRight;
    }
}`;

const r = runJava(code, { root: "[3,9,20]" });
console.log("root=[3,9,20]: return =", r.returnValue, "(expected 3*100+9*10+20=390), error:", r.error);

// Recursive depth to see where it returns wrong
const code2 = `class Solution {
    public int count(TreeNode root) {
        if (root == null) return 0;
        int lc = count(root.left);
        int rc = count(root.right);
        return 1 + lc + rc;
    }
}`;
const r2 = runJava(code2, { root: "[3,9,20,null,null,15,7]" });
console.log("Node count for [3,9,20,null,null,15,7]:", r2.returnValue, "(expected 5), error:", r2.error);

const r3 = runJava(code2, { root: "[1,2,3]" });
console.log("Node count for [1,2,3]:", r3.returnValue, "(expected 3), error:", r3.error);
