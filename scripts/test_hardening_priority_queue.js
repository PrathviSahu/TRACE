// ─────────────────────────────────────────────────────────────
//  TRACE — Hardening #6 Test Suite: PriorityQueue / Heap Correctness
// ─────────────────────────────────────────────────────────────

import { runJava } from '../src/engine/interpreter.js';

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`PASS: ${message}`);
  passed++;
}

console.log('========================================================');
console.log('TRACE Hardening #6: PriorityQueue / Heap Correctness Suite');
console.log('========================================================\n');

// ── Test 1: User Gate Test Case 1 (5, 1, 3) ───────────────────
{
  const res = runJava(`
    void main() {
      PriorityQueue<Integer> pq = new PriorityQueue<>();
      pq.add(5);
      pq.add(1);
      pq.add(3);
      println(pq.peek());
      println(pq.poll());
      println(pq.poll());
      println(pq.poll());
    }
  `);
  assert(res.output[0] === '1', 'Test 1: peek() returns 1');
  assert(res.output[1] === '1', 'Test 1: first poll() returns 1');
  assert(res.output[2] === '3', 'Test 1: second poll() returns 3');
  assert(res.output[3] === '5', 'Test 1: third poll() returns 5');
}

// ── Test 2: User Gate Test Case 2 (10, -2, 7, 7, 0) ───────────
{
  const res = runJava(`
    void main() {
      PriorityQueue<Integer> pq = new PriorityQueue<>();
      pq.add(10);
      pq.add(-2);
      pq.add(7);
      pq.add(7);
      pq.add(0);
      println(pq.poll());
      println(pq.poll());
      println(pq.poll());
      println(pq.poll());
      println(pq.poll());
    }
  `);
  assert(res.output[0] === '-2', 'Test 2: first poll() returns -2');
  assert(res.output[1] === '0', 'Test 2: second poll() returns 0');
  assert(res.output[2] === '7', 'Test 2: third poll() returns 7');
  assert(res.output[3] === '7', 'Test 2: fourth poll() returns 7 (duplicate handled)');
  assert(res.output[4] === '10', 'Test 2: fifth poll() returns 10');
}

// ── Test 3: Descending Insertion Order ─────────────────────────
{
  const res = runJava(`
    void main() {
      PriorityQueue<Integer> pq = new PriorityQueue<>();
      pq.add(100);
      pq.add(50);
      pq.add(25);
      pq.add(10);
      pq.add(5);
      pq.add(1);
      while (!pq.isEmpty()) {
        println(pq.poll());
      }
    }
  `);
  const expected = ['1', '5', '10', '25', '50', '100'];
  assert(res.output.length === 6, 'Test 3: polled all 6 descending items');
  for (let i = 0; i < expected.length; i++) {
    assert(res.output[i] === expected[i], `Test 3: poll index ${i} is ${expected[i]}`);
  }
}

// ── Test 4: Ascending Insertion Order ──────────────────────────
{
  const res = runJava(`
    void main() {
      PriorityQueue<Integer> pq = new PriorityQueue<>();
      pq.offer(1);
      pq.offer(2);
      pq.offer(3);
      pq.offer(4);
      while (!pq.isEmpty()) {
        println(pq.poll());
      }
    }
  `);
  assert(res.output.join(',') === '1,2,3,4', 'Test 4: ascending insertion polls in correct order');
}

// ── Test 5: Empty Queue Semantics ──────────────────────────────
{
  const res = runJava(`
    void main() {
      PriorityQueue<Integer> pq = new PriorityQueue<>();
      println(pq.isEmpty());
      println(pq.size());
      println(pq.peek());
      println(pq.poll());
    }
  `);
  assert(res.output[0] === 'true', 'Test 5: isEmpty() is true initially');
  assert(res.output[1] === '0', 'Test 5: size() is 0 initially');
  assert(res.output[2] === 'null', 'Test 5: peek() on empty returns null');
  assert(res.output[3] === 'null', 'Test 5: poll() on empty returns null');
}

// ── Test 6: Null Safety (NullPointerException) ─────────────────
{
  let caughtAddNull = false;
  try {
    runJava(`
      void main() {
        PriorityQueue<Integer> pq = new PriorityQueue<>();
        pq.add(null);
      }
    `);
  } catch (e) {
    if (e.message.includes('NullPointerException')) caughtAddNull = true;
  }
  assert(caughtAddNull, 'Test 6: pq.add(null) throws NullPointerException');

  let caughtOfferNull = false;
  try {
    runJava(`
      void main() {
        PriorityQueue<Integer> pq = new PriorityQueue<>();
        pq.offer(null);
      }
    `);
  } catch (e) {
    if (e.message.includes('NullPointerException')) caughtOfferNull = true;
  }
  assert(caughtOfferNull, 'Test 6: pq.offer(null) throws NullPointerException');
}

// ── Test 7: Arbitrary Element Removal (remove(o)) ──────────────
{
  const res = runJava(`
    void main() {
      PriorityQueue<Integer> pq = new PriorityQueue<>();
      pq.add(10);
      pq.add(20);
      pq.add(30);
      pq.add(40);
      boolean removed = pq.remove(20);
      println(removed);
      println(pq.size());
      println(pq.poll());
      println(pq.poll());
      println(pq.poll());
    }
  `);
  assert(res.output[0] === 'true', 'Test 7: remove(20) returns true');
  assert(res.output[1] === '3', 'Test 7: size is 3 after remove');
  assert(res.output[2] === '10', 'Test 7: remaining min is 10');
  assert(res.output[3] === '30', 'Test 7: remaining next is 30');
  assert(res.output[4] === '40', 'Test 7: remaining last is 40');
}

// ── Test 8: Collections.reverseOrder() Max-Heap ────────────────
{
  const res = runJava(`
    void main() {
      PriorityQueue<Integer> maxHeap = new PriorityQueue<>(Collections.reverseOrder());
      maxHeap.add(15);
      maxHeap.add(5);
      maxHeap.add(40);
      maxHeap.add(25);
      println(maxHeap.peek());
      println(maxHeap.poll());
      println(maxHeap.poll());
      println(maxHeap.poll());
      println(maxHeap.poll());
    }
  `);
  assert(res.output[0] === '40', 'Test 8: maxHeap peek() is 40');
  assert(res.output[1] === '40', 'Test 8: poll 1 is 40');
  assert(res.output[2] === '25', 'Test 8: poll 2 is 25');
  assert(res.output[3] === '15', 'Test 8: poll 3 is 15');
  assert(res.output[4] === '5', 'Test 8: poll 4 is 5');
}

// ── Test 9: Lambda Comparator Max-Heap ─────────────────────────
{
  const res = runJava(`
    void main() {
      PriorityQueue<Integer> maxHeap = new PriorityQueue<>((a, b) -> b - a);
      maxHeap.add(10);
      maxHeap.add(80);
      maxHeap.add(30);
      while (!maxHeap.isEmpty()) {
        println(maxHeap.poll());
      }
    }
  `);
  assert(res.output.join(',') === '80,30,10', 'Test 9: lambda comparator produces max-heap order');
}

// ── Test 10: Array Pairs / Dijkstra-Style Ordering ─────────────
{
  const res = runJava(`
    void main() {
      PriorityQueue<int[]> pq = new PriorityQueue<>();
      pq.add(new int[]{12, 3});
      pq.add(new int[]{2, 1});
      pq.add(new int[]{7, 4});
      int[] p1 = pq.poll();
      int[] p2 = pq.poll();
      int[] p3 = pq.poll();
      println(p1[0] + "," + p1[1]);
      println(p2[0] + "," + p2[1]);
      println(p3[0] + "," + p3[1]);
    }
  `);
  assert(res.output[0] === '2,1', 'Test 10: closest distance 2 is polled first');
  assert(res.output[1] === '7,4', 'Test 10: distance 7 polled second');
  assert(res.output[2] === '12,3', 'Test 10: distance 12 polled third');
}

// ── Test 11: Object Comparison (ListNode) ──────────────────────
{
  const res = runJava(`
    class ListNode {
      int val;
      ListNode next;
      ListNode(int val) { this.val = val; }
    }
    void main() {
      PriorityQueue<ListNode> pq = new PriorityQueue<>();
      pq.add(new ListNode(45));
      pq.add(new ListNode(12));
      pq.add(new ListNode(30));
      println(pq.poll().val);
      println(pq.poll().val);
      println(pq.poll().val);
    }
  `);
  assert(res.output[0] === '12', 'Test 11: ListNode(12) polled first');
  assert(res.output[1] === '30', 'Test 11: ListNode(30) polled second');
  assert(res.output[2] === '45', 'Test 11: ListNode(45) polled third');
}

// ── Test 12: Top K Elements Algorithm ──────────────────────────
{
  const res = runJava(`
    void main() {
      int[] nums = {5, 2, 8, 1, 9, 3};
      int k = 3;
      PriorityQueue<Integer> minHeap = new PriorityQueue<>();
      for (int i = 0; i < nums.length; i++) {
        minHeap.offer(nums[i]);
        if (minHeap.size() > k) {
          minHeap.poll();
        }
      }
      println(minHeap.size());
      while (!minHeap.isEmpty()) {
        println(minHeap.poll());
      }
    }
  `);
  assert(res.output[0] === '3', 'Test 12: final heap has size 3');
  assert(res.output[1] === '5', 'Test 12: smallest of top 3 is 5');
  assert(res.output[2] === '8', 'Test 12: next of top 3 is 8');
  assert(res.output[3] === '9', 'Test 12: largest of top 3 is 9');
}

// ── Test 13: Strict FIFO Isolation for Queue/ArrayDeque ────────
{
  const res = runJava(`
    void main() {
      Queue<Integer> q = new ArrayDeque<>();
      q.offer(50);
      q.offer(10);
      q.offer(30);
      println(q.poll());
      println(q.poll());
      println(q.poll());
    }
  `);
  assert(res.output[0] === '50', 'Test 13: ArrayDeque poll 1 is 50 (FIFO preserved)');
  assert(res.output[1] === '10', 'Test 13: ArrayDeque poll 2 is 10 (FIFO preserved)');
  assert(res.output[2] === '30', 'Test 13: ArrayDeque poll 3 is 30 (FIFO preserved)');
}

// ── Test 14: Trace Step Snapshot Immutability ───────────────────
{
  const res = runJava(`
    void main() {
      PriorityQueue<Integer> pq = new PriorityQueue<>();
      pq.add(10);
      pq.add(5);
      pq.add(20);
      pq.poll();
    }
  `);
  const pqSteps = res.trace.filter(s => s.collections?.pq);
  assert(pqSteps.length >= 4, 'Test 14: recorded steps for PriorityQueue');
  const stepItems = pqSteps.map(s => s.collections.pq.items.slice());
  assert(stepItems[1].length === 1 && stepItems[1][0] === 10, 'Test 14: Step 1 contains exactly [10]');
  assert(stepItems[2].length === 2 && stepItems[2][0] === 5, 'Test 14: Step 2 contains [5, 10] with min at root');
  assert(stepItems[stepItems.length - 1].length === 2, 'Test 14: Final step after poll has 2 items');
}

console.log('\n========================================================');
console.log(`Hardening #6 PriorityQueue Suite: ${passed}/${total} PASSED`);
console.log('========================================================\n');
