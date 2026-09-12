const { runJava } = require("../src/engine/interpreter.js");

// Check what the tree looks like for [3,9,20,null,null,15,7]
const code = `class Solution {
    public int maxDepth(TreeNode root) {
        if (root == null) return 0;
        int l = maxDepth(root.left);
        int r = maxDepth(root.right);
        if (l > r) return l + 1;
        return r + 1;
    }
}`;
const r = runJava(code, { root: "[3,9,20,null,null,15,7]" });
console.log("return:", r.returnValue, "error:", r.error);

// Check with a simpler tree
const r2 = runJava(code, { root: "[1,2,3]" });
console.log("Simple [1,2,3] return:", r2.returnValue, "error:", r2.error);

const r3 = runJava(code, { root: "[1,null,2]" });
console.log("[1,null,2] return:", r3.returnValue, "error:", r3.error);

// Single node
const r4 = runJava(code, { root: "[1]" });
console.log("[1] return:", r4.returnValue, "error:", r4.error);

// What does TRACE represent TreeNode as? Check trace variables
const r5 = runJava(code, { root: "[1,2,3]" });
const firstStep = r5.trace && r5.trace[0];
if (firstStep) console.log("First step vars:", JSON.stringify(firstStep.variables, null, 2).substring(0, 300));
