// ─────────────────────────────────────────────────────────────
// TRACE Hardening #10 Test Suite: Data Structure Directory & Learn Navigation
// ─────────────────────────────────────────────────────────────

import assert from 'assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MULTI_LANG_EXAMPLES } from '../src/engine/multiLangExamples.js';
import { TOPICS, ALL_PROBLEMS } from '../src/data/roadmapProblems.js';
import { runJava } from '../src/engine/interpreter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dsPageSrc = fs.readFileSync(path.join(__dirname, '../src/pages/DataStructuresPage.jsx'), 'utf8');
const learnPageSrc = fs.readFileSync(path.join(__dirname, '../src/pages/LearnPage.jsx'), 'utf8');
const sidebarSrc = fs.readFileSync(path.join(__dirname, '../src/components/Sidebar.jsx'), 'utf8');
const problemsPageSrc = fs.readFileSync(path.join(__dirname, '../src/pages/ProblemsPage.jsx'), 'utf8');

// Parse DS_LIST from DataStructuresPage
const dsMatch = dsPageSrc.match(/export const DS_LIST = (\[[\s\S]*?\]);/);
assert(dsMatch, "DS_LIST must be declared and exported in DataStructuresPage.jsx");
const DS_LIST = eval(dsMatch[1]);

// Parse GUIDES from LearnPage
const guidesMatch = learnPageSrc.match(/export const GUIDES = (\[[\s\S]*?\]);/);
assert(guidesMatch, "GUIDES must be declared and exported in LearnPage.jsx");
const GUIDES = eval(guidesMatch[1]);

// Parse SIDEBAR_CATEGORIES from Sidebar
const sidebarMatch = sidebarSrc.match(/export const SIDEBAR_CATEGORIES = (\[[\s\S]*?\]);/);
assert(sidebarMatch, "SIDEBAR_CATEGORIES must be declared and exported in Sidebar.jsx");
const SIDEBAR_CATEGORIES = eval(sidebarMatch[1]);

let passed = 0;
let total = 0;

function test(description, fn) {
  total++;
  try {
    fn();
    console.log(`PASS: Test ${total}: ${description}`);
    passed++;
  } catch (err) {
    console.error(`FAIL: Test ${total}: ${description}`);
    console.error(err);
    process.exitCode = 1;
  }
}

console.log("========================================================");
console.log("TRACE Hardening #10: Data Structure & Learn Navigation Suite");
console.log("========================================================\n");

console.log("--- Section 1: Data Structure Directory Integrity ---");

test("DS_LIST contains all 8 required data structure categories", () => {
  assert.equal(DS_LIST.length, 8, "Must contain exactly 8 data structure cards");
  const names = DS_LIST.map(d => d.name);
  assert(names.includes("Arrays & Strings"), "Must include Arrays & Strings");
  assert(names.includes("HashMap & HashSet"), "Must include HashMap & HashSet");
  assert(names.includes("Linked List"), "Must include Linked List");
  assert(names.includes("Stack"), "Must include Stack");
  assert(names.includes("Queue & Deque"), "Must include Queue & Deque");
  assert(names.includes("Binary Tree & BST"), "Must include Binary Tree & BST");
  assert(names.includes("Heap / Priority Queue"), "Must include Heap / Priority Queue");
  assert(names.includes("Graphs"), "Must include Graphs");
});

test("Every directory card has a unique problemId (zero duplicates)", () => {
  const ids = DS_LIST.map(d => d.problemId);
  const uniqueIds = new Set(ids);
  assert.equal(ids.length, uniqueIds.size, `Expected 8 unique IDs, got ${uniqueIds.size}: ${ids.join(', ')}`);
});

test("Linked List does NOT point to two-sum or fake fallback", () => {
  const item = DS_LIST.find(d => d.name === "Linked List");
  assert(item, "Linked List item must exist");
  assert.notEqual(item.problemId, "two-sum", "Linked List must not point to two-sum");
  assert.equal(item.problemId, "linked-list", "Linked List must point to linked-list");
});

test("Binary Tree & BST does NOT point to two-sum or fake fallback", () => {
  const item = DS_LIST.find(d => d.name === "Binary Tree & BST");
  assert(item, "Binary Tree item must exist");
  assert.notEqual(item.problemId, "two-sum", "Binary Tree must not point to two-sum");
  assert.equal(item.problemId, "binary-tree", "Binary Tree must point to binary-tree");
});

test("Stack does NOT point to two-sum or fake fallback", () => {
  const item = DS_LIST.find(d => d.name === "Stack");
  assert(item, "Stack item must exist");
  assert.notEqual(item.problemId, "two-sum", "Stack must not point to two-sum");
  assert.equal(item.problemId, "stack", "Stack must point to stack");
});

test("HashMap & HashSet does NOT point to two-sum array solution", () => {
  const item = DS_LIST.find(d => d.name === "HashMap & HashSet");
  assert(item, "HashMap item must exist");
  assert.notEqual(item.problemId, "two-sum", "HashMap must not point to two-sum");
  assert.equal(item.problemId, "hashmap-hashset", "HashMap must point to hashmap-hashset");
});

test("Queue & Deque does NOT point to running-sum fake fallback", () => {
  const item = DS_LIST.find(d => d.name === "Queue & Deque");
  assert(item, "Queue item must exist");
  assert.notEqual(item.problemId, "running-sum", "Queue must not point to running-sum");
  assert.equal(item.problemId, "queue-deque", "Queue must point to queue-deque");
});

test("Heap / Priority Queue does NOT point to maximum-subarray (Kadane)", () => {
  const item = DS_LIST.find(d => d.name === "Heap / Priority Queue");
  assert(item, "Heap item must exist");
  assert.notEqual(item.problemId, "maximum-subarray", "Heap must not point to maximum-subarray");
  assert.equal(item.problemId, "heap-priority-queue", "Heap must point to heap-priority-queue");
});

test("Graphs does NOT point to two-sum or fake fallback", () => {
  const item = DS_LIST.find(d => d.name === "Graphs");
  assert(item, "Graphs item must exist");
  assert.notEqual(item.problemId, "two-sum", "Graphs must not point to two-sum");
  assert.equal(item.problemId, "graphs", "Graphs must point to graphs");
});

console.log("\n--- Section 2: Multi-Language Examples Contract ---");

for (const ds of DS_LIST) {
  test(`MULTI_LANG_EXAMPLES contains valid preset for ${ds.name} (${ds.problemId})`, () => {
    const ex = MULTI_LANG_EXAMPLES[ds.problemId];
    assert(ex, `Preset ${ds.problemId} must exist in MULTI_LANG_EXAMPLES`);
    assert(ex.name, "Preset must have a name");
    assert(ex.java && ex.java.length > 20, "Preset must have runnable Java code");
    assert(ex.python && ex.python.length > 20, "Preset must have runnable Python code");
    assert(ex.inputs !== undefined, "Preset must define inputs object");
  });
}

console.log("\n--- Section 3: Authentic Data Structure Execution & Visualizer Models ---");

test("HashMap & HashSet preset executes and emits HashMap collection in trace", () => {
  const ex = MULTI_LANG_EXAMPLES['hashmap-hashset'];
  const res = runJava(ex.java, ex.inputs.javaInputs || {});
  assert(res.trace.length > 0, "Execution must produce trace steps");
  const hasMap = res.trace.some(s => s.collections?.map?.__type === 'HashMap');
  assert(hasMap, "Trace must contain a collection with __type: 'HashMap'");
});

test("Linked List preset executes and emits ListNode object instances in trace", () => {
  const ex = MULTI_LANG_EXAMPLES['linked-list'];
  const res = runJava(ex.java, ex.inputs.javaInputs || {});
  assert(res.trace.length > 0, "Execution must produce trace steps");
  const hasListNode = res.trace.some(s => {
    return Object.values(s.variables || {}).some(v => v?.type === 'ListNode' || v?.value?.__type === 'ListNode');
  });
  assert(hasListNode, "Trace must contain variables/objects of type 'ListNode'");
});

test("Stack preset executes and emits Stack collection with top badge in trace", () => {
  const ex = MULTI_LANG_EXAMPLES['stack'];
  const res = runJava(ex.java, ex.inputs.javaInputs || {});
  assert(res.trace.length > 0, "Execution must produce trace steps");
  const hasStack = res.trace.some(s => s.collections?.stack?.__type === 'Stack');
  assert(hasStack, "Trace must contain a collection with __type: 'Stack'");
});

test("Queue & Deque preset executes and emits Queue collection in trace", () => {
  const ex = MULTI_LANG_EXAMPLES['queue-deque'];
  const res = runJava(ex.java, ex.inputs.javaInputs || {});
  assert(res.trace.length > 0, "Execution must produce trace steps");
  const hasQueue = res.trace.some(s => s.collections?.queue?.__type === 'Queue');
  assert(hasQueue, "Trace must contain a collection with __type: 'Queue'");
});

test("Binary Tree & BST preset executes and emits TreeNode object instances in trace", () => {
  const ex = MULTI_LANG_EXAMPLES['binary-tree'];
  const res = runJava(ex.java, ex.inputs.javaInputs || {});
  assert(res.trace.length > 0, "Execution must produce trace steps");
  const hasTree = res.trace.some(s => {
    return Object.values(s.variables || {}).some(v => v?.type === 'TreeNode' || v?.value?.__type === 'TreeNode');
  });
  assert(hasTree, "Trace must contain variables/objects of type 'TreeNode'");
});

test("Heap / Priority Queue preset executes and emits PriorityQueue Binary Heap in trace", () => {
  const ex = MULTI_LANG_EXAMPLES['heap-priority-queue'];
  const res = runJava(ex.java, ex.inputs.javaInputs || {});
  assert(res.trace.length > 0, "Execution must produce trace steps");
  const hasHeap = res.trace.some(s => s.collections?.pq?.__type === 'PriorityQueue');
  assert(hasHeap, "Trace must contain a collection with __type: 'PriorityQueue'");
});

test("Graphs preset executes and emits graph BFS traversal steps", () => {
  const ex = MULTI_LANG_EXAMPLES['graphs'];
  const res = runJava(ex.java, ex.inputs.javaInputs || {});
  assert(res.trace.length > 0, "Execution must produce trace steps");
  const hasQueue = res.trace.some(s => s.collections?.queue?.__type === 'Queue');
  const hasVisited = res.trace.some(s => s.arrays?.visited !== undefined);
  assert(hasQueue, "Trace must include queue traversal");
  assert(hasVisited, "Trace must include visited array state");
});

console.log("\n--- Section 4: Learn Navigation Integrity ---");

test("GUIDES contains all 6 learning patterns", () => {
  assert.equal(GUIDES.length, 6, "Must contain exactly 6 guides");
});

test("Zero Learn guides have fake '/' navigation destination", () => {
  assert(!learnPageSrc.includes("navigate('/')"), "LearnPage.jsx must not contain navigate('/')");
  for (const g of GUIDES) {
    assert(g.topic, `Guide "${g.title}" must define a topic`);
    assert.notEqual(g.topic, "/", `Guide "${g.title}" must not point to root '/'`);
  }
});

test("Every Learn guide topic corresponds to a genuine topic in TOPICS", () => {
  for (const g of GUIDES) {
    assert(TOPICS.includes(g.topic), `Topic "${g.topic}" in guide "${g.title}" must exist in roadmap TOPICS`);
  }
});

test("Every Learn guide topic has at least 5 matching problems in ALL_PROBLEMS", () => {
  for (const g of GUIDES) {
    const matching = ALL_PROBLEMS.filter(p => p.topic === g.topic);
    assert(matching.length >= 5, `Expected >= 5 problems for topic "${g.topic}", found ${matching.length}`);
  }
});

test("ProblemsPage integrates useSearchParams for deep-linking topic filter", () => {
  assert(problemsPageSrc.includes("useSearchParams"), "ProblemsPage.jsx must import and use useSearchParams");
  assert(problemsPageSrc.includes("searchParams.get('topic')"), "ProblemsPage.jsx must inspect 'topic' parameter");
});

console.log("\n--- Section 5: Sidebar Categories & Integrity ---");

test("Sidebar categories include authentic data structure problems", () => {
  const llCat = SIDEBAR_CATEGORIES.find(c => c.id === 'linked-list');
  assert(llCat && llCat.problems.some(p => p.id === 'linked-list'), "Sidebar linked-list must have linked-list problem");

  const stackCat = SIDEBAR_CATEGORIES.find(c => c.id === 'stack');
  assert(stackCat && stackCat.problems.some(p => p.id === 'stack'), "Sidebar stack must have stack problem");

  const queueCat = SIDEBAR_CATEGORIES.find(c => c.id === 'queue');
  assert(queueCat && queueCat.problems.some(p => p.id === 'queue-deque'), "Sidebar queue must have queue-deque problem");

  const mapCat = SIDEBAR_CATEGORIES.find(c => c.id === 'hashmap');
  assert(mapCat && mapCat.problems.some(p => p.id === 'hashmap-hashset'), "Sidebar hashmap must have hashmap-hashset problem");

  const treeCat = SIDEBAR_CATEGORIES.find(c => c.id === 'binary-tree');
  assert(treeCat && treeCat.problems.some(p => p.id === 'binary-tree'), "Sidebar binary-tree must have binary-tree problem");

  const heapCat = SIDEBAR_CATEGORIES.find(c => c.id === 'heap');
  assert(heapCat && heapCat.problems.some(p => p.id === 'heap-priority-queue'), "Sidebar heap must have heap-priority-queue problem");

  const graphCat = SIDEBAR_CATEGORIES.find(c => c.id === 'graph');
  assert(graphCat && graphCat.problems.some(p => p.id === 'graphs'), "Sidebar graph must have graphs problem");
});

test("Every problem in SIDEBAR_CATEGORIES exists in MULTI_LANG_EXAMPLES", () => {
  for (const cat of SIDEBAR_CATEGORIES) {
    for (const prob of cat.problems) {
      assert(MULTI_LANG_EXAMPLES[prob.id], `Problem "${prob.id}" in category "${cat.name}" must exist in MULTI_LANG_EXAMPLES`);
    }
  }
});

console.log("\n========================================================");
console.log(`Hardening #10 Directory Suite: ${passed}/${total} PASSED`);
console.log("========================================================\n");
