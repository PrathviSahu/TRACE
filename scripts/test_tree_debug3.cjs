const { runJava } = require("../src/engine/interpreter.js");

// The interpreter receives root as a raw JS array [3,9,20,null,null,15,7]
// It needs to convert this to a proper TreeNode object
// Let's check what happens with root.val  vs  root[0]

const codeArr = `class Solution {
    public int test(int[] root) {
        return root[0];
    }
}`;
const rArr = runJava(codeArr, { root: "[3,9,20]" });
console.log("As int[] root[0]:", rArr.returnValue);

// The issue: when param type is TreeNode, it stores the raw array [3,9,20,...]
// root.val would return null since an array doesn't have .val
// We need to check the ptype detection
const codeCheck = `class Solution {
    public int maxDepth(TreeNode root) {
        int v = root.val;
        return v;
    }
}`;
const r = runJava(codeCheck, { root: "[3,9,20,null,null,15,7]" });
console.log("root.val:", r.returnValue, "error:", r.error);
const step = r.trace && r.trace[0];
if (step) console.log("root var:", JSON.stringify(step.variables.root));
