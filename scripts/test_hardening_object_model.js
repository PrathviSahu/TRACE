// ─────────────────────────────────────────────────────────────
//  TRACE — Hardening #3 Test Suite: Java Object Model & Field Access
//  Validates persistent instance field storage, field read, mutation,
//  nested member access, constructors, null safety, and trace integrity.
// ─────────────────────────────────────────────────────────────

import assert from "node:assert";
import { runJava } from "../src/engine/interpreter.js";

let passedCount = 0;
let totalCount = 0;

async function test(name, fn) {
  totalCount++;
  try {
    await fn();
    console.log("  ✓ " + name);
    passedCount++;
  } catch (err) {
    console.error("  ✗ " + name);
    console.error("    " + err.message);
    throw err;
  }
}

console.log("=================================================");
console.log("TRACE — Hardening #3: Java Object Model & Field Access");
console.log("=================================================\n");

// 1. Basic field read
await test("1. Basic Field Read: Reads initialized field from object instance", () => {
  const code = "ListNode a = new ListNode(5);\nprintln(a.val);";
  const res = runJava(code);
  assert.deepEqual(res.output, ["5"]);
});

// 2. Basic field mutation
await test("2. Basic Field Mutation: Mutates instance field and observes updated value", () => {
  const code = "ListNode a = new ListNode(5);\na.val = 10;\nprintln(a.val);";
  const res = runJava(code);
  assert.deepEqual(res.output, ["10"]);
});

// 3. Nested field read
await test("3. Nested Field Read: Reads through nested reference chain (a.next.val)", () => {
  const code = "ListNode a = new ListNode(5);\na.next = new ListNode(10);\nprintln(a.next.val);";
  const res = runJava(code);
  assert.deepEqual(res.output, ["10"]);
});

// 4. Nested field mutation
await test("4. Nested Field Mutation: Mutates field on nested object (a.next.val = 30)", () => {
  const code = "ListNode a = new ListNode(5);\na.next = new ListNode(20);\na.next.val = 30;\nprintln(a.next.val);";
  const res = runJava(code);
  assert.deepEqual(res.output, ["30"]);
});

// 5. Constructor parameter initialization
await test("5. Constructor Parameters: User-defined class constructor initializes fields", () => {
  const code = `class ListNode {
    int val;
    ListNode next;

    ListNode(int value) {
        val = value;
        next = null;
    }
}

ListNode node = new ListNode(42);
println(node.val);`;
  const res = runJava(code);
  assert.deepEqual(res.output, ["42"]);
});

// 6. Null field behavior
await test("6. Null Field Behavior: Null field produces \"null\", mutation to instance succeeds", () => {
  const code = "ListNode node = new ListNode(5);\nprintln(node.next);\nnode.next = new ListNode(7);\nprintln(node.next.val);";
  const res = runJava(code);
  assert.deepEqual(res.output, ["null", "7"]);
});

// 7. Linked-List style object
await test("7. Linked-List Style: Node pointer manipulation (a.next = b, a.next.val = 20)", () => {
  const code = `class Node {
    int val;
    Node next;
}

Node a = new Node();
Node b = new Node();

a.val = 10;
a.next = b;
a.next.val = 20;

println(a.val);
println(a.next.val);`;
  const res = runJava(code);
  assert.deepEqual(res.output, ["10", "20"]);
});

// 8. Tree-node style object
await test("8. Tree-Node Style: Hierarchical tree node population (root.left.val)", () => {
  const code = `class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
}

TreeNode root = new TreeNode();
root.val = 5;
root.left = new TreeNode();
root.left.val = 3;

println(root.val);
println(root.left.val);`;
  const res = runJava(code);
  assert.deepEqual(res.output, ["5", "3"]);
});

// 9. NullPointerException semantics on null dereference
await test("9. Null Safety: Throws NullPointerException when dereferencing null object", () => {
  const code = "ListNode node = new ListNode(5);\nprintln(node.next.val);";
  assert.throws(() => {
    runJava(code);
  }, /NullPointerException/);
});

// 10. Execution trace compatibility & cyclic safety
await test("10. Execution Trace: Records field mutations in step history and safely handles cycles", () => {
  const code = `ListNode a = new ListNode(1);
ListNode b = new ListNode(2);
a.next = b;
b.next = a;
a.val = 100;
println(a.val);`;
  const res = runJava(code);
  assert.deepEqual(res.output, ["100"]);
  assert.ok(res.trace.length >= 6, "Must produce detailed execution trace");
  
  const lastStep = res.trace[res.trace.length - 1];
  assert.ok(lastStep.variables.a, "Trace must capture variable a");
  assert.equal(lastStep.variables.a.value.val, 100, "Trace must observe updated field val: 100");
  const serialized = JSON.stringify(lastStep.variables);
  assert.ok(serialized.includes("ListNode"), "Trace serialization includes type");
});

// 11. Preserved standard Java method & solution regression
await test("11. Regression: Standard class method (Two Sum) executes and returns correctly", () => {
  const code = `public class Solution {
    public int[] twoSum(int[] nums, int target) {
        for (int i = 0; i < nums.length; i++) {
            for (int j = i + 1; j < nums.length; j++) {
                if (nums[i] + nums[j] == target) {
                    return new int[]{i, j};
                }
            }
        }
        return new int[]{};
    }
}`;
  const res = runJava(code, { nums: "[2, 7, 11, 15]", target: "9" });
  assert.deepEqual(res.returnValue, [0, 1]);
});

console.log("\n-------------------------------------------------");
console.log("Hardening #3 Tests Completed: " + passedCount + "/" + totalCount + " PASSED");
console.log("-------------------------------------------------");
console.log("ALL HARDENING #3 TESTS PASSED! 🚀\n");
