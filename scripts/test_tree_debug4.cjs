const { runJava } = require("../src/engine/interpreter.js");

// We need to see what ptype is for TreeNode parameter
// Let's trace through parser to check
const code = `class Solution {
    public int maxDepth(TreeNode root) {
        if (root == null) return 0;
        return 1;
    }
}`;

// The parseInput receives raw=[3,9,20,...] which JSON parses to array
// But ptype for "TreeNode root" has base='TreeNode', isArray=false
// parseInput doesn't see ptype, it only parses the raw value
// So root ends up being a JS array [3,9,20,...], not a TreeNode object

// evalMemberAccess on an array won't find .val .left .right
// We need to convert array to TreeNode in parseInput when ptype.base === 'TreeNode'

// For now let's check what existing tree problems in the app do:
// Look at problem 142 (has cycle) - linked list
const code2 = `class Solution {
    public ListNode reverseList(ListNode head) {
        ListNode prev = null;
        ListNode curr = head;
        while (curr != null) {
            ListNode next = curr.next;
            curr.next = prev;
            prev = curr;
            curr = next;
        }
        return prev;
    }
}`;

const r2 = runJava(code2, { head: "[1,2,3,4,5]" });
console.log("Linked List reverse: return=", r2.returnValue, "error:", r2.error);

// Check first step
const step = r2.trace && r2.trace[0];
if (step) console.log("head type:", JSON.stringify(step.variables.head));
