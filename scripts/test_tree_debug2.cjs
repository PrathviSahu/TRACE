const { runJava } = require("../src/engine/interpreter.js");

// Check what root.val and root.left are
const code = `class Solution {
    public int test(TreeNode root) {
        int v = root.val;
        return v;
    }
}`;
const r = runJava(code, { root: "[3,9,20]" });
console.log("root.val:", r.returnValue, "error:", r.error);
console.log("first trace step:", JSON.stringify(r.trace[0]?.variables?.root, null, 2));
