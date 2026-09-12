const { runJava } = require("../src/engine/interpreter.js");

// The builder was returning a TreeNode object (the last `build(7,...)`) as the depth result
// that's because the first method called is `build` not `maxDepth`

// Actually wait - TRACE calls the FIRST method in the class, which is `build` 
// We need to make the actual problem method (maxDepth) the first one

// Let's put depth first
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
    
    TreeNode build(int v, TreeNode l, TreeNode r) {
        TreeNode n = new TreeNode(v);
        n.left = l;
        n.right = r;
        return n;
    }
}`;
// This calls maxDepth with raw array as root
const r1 = runJava(codeClean, { root: "[3,9,20,null,null,15,7]" });
console.log("maxDepth first, raw array root:", r1.returnValue, "error:", r1.error);

// Alternative: make the first method take no params and construct its own input
// This is only possible if the inputs object is empty (so buildArgs sees no inputs)
const codeSelfContained = `class Solution {
    public int maxDepth() {
        TreeNode root = new TreeNode(3);
        root.left = new TreeNode(9);
        root.right = new TreeNode(20);
        root.right.left = new TreeNode(15);
        root.right.right = new TreeNode(7);
        return depth(root);
    }
    
    int depth(TreeNode node) {
        if (node == null) return 0;
        int l = depth(node.left);
        int r = depth(node.right);
        if (l > r) return l + 1;
        return r + 1;
    }
}`;
const r2 = runJava(codeSelfContained, {});
console.log("Self-contained depth:", r2.returnValue, "expected: 3, error:", r2.error, "steps:", r2.trace?.length);

// Self-contained for invert tree
const invertSelf = `class Solution {
    public TreeNode invertTree() {
        TreeNode root = new TreeNode(4);
        root.left = new TreeNode(2);
        root.right = new TreeNode(7);
        root.left.left = new TreeNode(1);
        root.left.right = new TreeNode(3);
        root.right.left = new TreeNode(6);
        root.right.right = new TreeNode(9);
        return invert(root);
    }
    
    TreeNode invert(TreeNode node) {
        if (node == null) return null;
        TreeNode left = invert(node.left);
        TreeNode right = invert(node.right);
        node.left = right;
        node.right = left;
        return node;
    }
}`;
const r3 = runJava(invertSelf, {});
console.log("Invert self-contained: return type:", r3.returnValue?.__type, "val:", r3.returnValue?.val, "steps:", r3.trace?.length, "error:", r3.error);
console.log("Root.left.val:", r3.returnValue?.left?.val, "(expected 7)");
console.log("Root.right.val:", r3.returnValue?.right?.val, "(expected 2)");

// LC 235 LCA BST - self-contained
const lcaCode = `class Solution {
    public TreeNode lowestCommonAncestor() {
        TreeNode root = new TreeNode(6);
        root.left = new TreeNode(2);
        root.right = new TreeNode(8);
        root.left.left = new TreeNode(0);
        root.left.right = new TreeNode(4);
        root.right.left = new TreeNode(7);
        root.right.right = new TreeNode(9);
        root.left.right.left = new TreeNode(3);
        root.left.right.right = new TreeNode(5);
        TreeNode p = root.left;
        TreeNode q = root.right;
        return lca(root, p, q);
    }
    
    TreeNode lca(TreeNode node, TreeNode p, TreeNode q) {
        if (p.val < node.val && q.val < node.val) return lca(node.left, p, q);
        if (p.val > node.val && q.val > node.val) return lca(node.right, p, q);
        return node;
    }
}`;
const r4 = runJava(lcaCode, {});
console.log("LCA (2,8) val:", r4.returnValue?.val, "expected: 6, error:", r4.error, "steps:", r4.trace?.length);
