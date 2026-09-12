const { runJava } = require("../src/engine/interpreter.js");

// invert result is [4,7,2,3,1,9,6] but expected is [4,7,2,9,6,3,1]
// For a perfect binary tree [4,2,7,1,3,6,9]:
// index: 0  1  2  3  4  5  6
// value: 4  2  7  1  3  6  9
// left child of i is 2i+1, right child is 2i+2
// Invert should swap children at each level
// Result should be: [4,7,2,9,6,3,1]
// 0:4(root), 1:7(left=old right), 2:2(right=old left)
// 3:9(left child of 7=old right of 7=9), 4:6(right child of 7=old left of 7=6)
// 5:3(left child of 2=old right of 2=3), 6:1(right child of 2=old left of 2=1)

// So our swap should give [4,7,2,3,1,9,6] -> that means we're swapping correctly at i=0 and i=1 and i=2
// but at i=1 (was node 7), leftIdx=3, rightIdx=4. Before swap: arr[3]=1, arr[4]=3. After: arr[3]=3, arr[4]=1
// at i=2 (was node 2), leftIdx=5, rightIdx=6. Before: arr[5]=6, arr[6]=9. After: arr[5]=9, arr[6]=6
// Final: [4,7,2,3,1,9,6] - hmm that's wrong, should be [4,7,2,9,6,3,1]

// The invert swap is applying bottom-up? Let's trace it 
// Top-down: swap children first at root, then recurse
// i=0: swap arr[1] and arr[2]: [4,7,2,1,3,6,9]
// recurse i=1(now 7): swap arr[3],arr[4]: [4,7,2,3,1,6,9]
// recurse i=2(now 2): swap arr[5],arr[6]: [4,7,2,3,1,9,6]
// Leaves at i=3,4,5,6: no children
// Final: [4,7,2,3,1,9,6] 
// Expected: [4,7,2,9,6,3,1]

// Problem: after swapping root's children (making right=7, left=2),
// the children of 7 should be from the right subtree: 6,9
// but the original tree stores children of position 1 in positions 3,4
// After the root swap, position 1 holds 7, but positions 3,4 still hold 1,3
// We need to swap the *subtrees*, not just the values at indices

// This approach (in-place array invert) doesn't work correctly for non-perfect trees
// Better to just use the pre-built TreeNode approach for templates

// CONCLUSION: For tree problems in TRACE, use pre-built TreeNode approach
// where the template hardcodes example inputs as new TreeNode() calls

const code = `class Solution {
    public int maxDepth(TreeNode root) {
        if (root == null) return 0;
        int l = 0;
        int r = 0;
        if (root.left != null) l = maxDepth(root.left);
        if (root.right != null) r = maxDepth(root.right);
        if (l > r) return l + 1;
        return r + 1;
    }
    
    public static TreeNode buildExample() {
        TreeNode n = new TreeNode(3);
        n.left = new TreeNode(9);
        n.right = new TreeNode(20);
        n.right.left = new TreeNode(15);
        n.right.right = new TreeNode(7);
        return n;
    }
}`;

// Actually the problem is that TRACE calls the FIRST method with the given inputs
// So for tree problems, the first method takes a TreeNode which is stored as raw array
// We need to convert that raw array internally

// Approach: Use a wrapper that first calls a separate buildTreeNode method
// The preset template should show the algorithm working on a properly constructed tree

// Let's test a clean approach: the preset code builds the tree inside main method
const codeClean = `class Solution {
    public int maxDepth(TreeNode root) {
        if (root == null) return 0;
        int l = 0;
        int r = 0;
        if (root.left != null) l = maxDepth(root.left);
        if (root.right != null) r = maxDepth(root.right);
        if (l > r) return l + 1;
        return r + 1;
    }
}`;

// Create input as TreeNode constructed manually  
// We need the interpreter to convert [3,9,20,null,null,15,7] to a proper TreeNode before calling maxDepth
// OR: we pass inputs as pre-built structure

// Since the inputs parameter is raw JS, we can actually construct the TreeNode ourselves
// before calling runJava by passing pre-built structure. But this requires interpreter changes.

// SIMPLEST SOLUTION for templates: just call with a pre-built TreeNode
// by using a "build" helper method inside the same class

const codeWithBuilder = `class Solution {
    TreeNode build(int v, TreeNode l, TreeNode r) {
        TreeNode n = new TreeNode(v);
        n.left = l;
        n.right = r;
        return n;
    }
    
    public int maxDepth(TreeNode root) {
        TreeNode example = build(3,
            build(9, null, null),
            build(20, build(15, null, null), build(7, null, null))
        );
        return depth(example);
    }
    
    int depth(TreeNode node) {
        if (node == null) return 0;
        int l = depth(node.left);
        int r = depth(node.right);
        if (l > r) return l + 1;
        return r + 1;
    }
}`;
const r = runJava(codeWithBuilder, {});
console.log("Builder approach depth:", r.returnValue, "expected: 3, error:", r.error, "steps:", r.trace?.length);

// For LC 226 Invert
const invertCode = `class Solution {
    TreeNode build(int v, TreeNode l, TreeNode r) {
        TreeNode n = new TreeNode(v);
        n.left = l;
        n.right = r;
        return n;
    }
    
    public TreeNode invertTree(TreeNode root) {
        if (root == null) return null;
        TreeNode left = invertTree(root.left);
        TreeNode right = invertTree(root.right);
        root.left = right;
        root.right = left;
        return root;
    }
}`;

// Actually let's just pass a valid pre-constructed TreeNode
// Build it in the same class and call it
const invertTest = `class Solution {
    public int testInvert() {
        TreeNode root = new TreeNode(4);
        root.left = new TreeNode(2);
        root.right = new TreeNode(7);
        root.left.left = new TreeNode(1);
        root.left.right = new TreeNode(3);
        root.right.left = new TreeNode(6);
        root.right.right = new TreeNode(9);
        
        TreeNode result = invertTree(root);
        return result.left.val;
    }
    
    TreeNode invertTree(TreeNode root) {
        if (root == null) return null;
        TreeNode left = invertTree(root.left);
        TreeNode right = invertTree(root.right);
        root.left = right;
        root.right = left;
        return root;
    }
}`;
const r2 = runJava(invertTest, {});
console.log("Invert: result.left.val:", r2.returnValue, "expected: 7 (was 2, now right=7 is new left), error:", r2.error);
