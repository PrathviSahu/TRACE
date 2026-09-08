// ─────────────────────────────────────────────────────────────
// TRACE — Hardening #5: Progress Store Unification Test Suite
// ─────────────────────────────────────────────────────────────

// Mock minimal browser environment for Node
const storage = {};
global.localStorage = {
  getItem: (k) => (k in storage ? storage[k] : null),
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: (k) => { delete storage[k]; },
  clear: () => { for (const k of Object.keys(storage)) delete storage[k]; }
};

const eventListeners = {};
global.window = {
  dispatchEvent: (event) => {
    const list = eventListeners[event.type] || [];
    for (const fn of list) fn(event);
  },
  addEventListener: (type, fn) => {
    if (!eventListeners[type]) eventListeners[type] = [];
    eventListeners[type].push(fn);
  },
  removeEventListener: (type, fn) => {
    if (eventListeners[type]) {
      eventListeners[type] = eventListeners[type].filter(f => f !== fn);
    }
  }
};
global.CustomEvent = class CustomEvent {
  constructor(type, params = {}) {
    this.type = type;
    this.detail = params.detail;
  }
};

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (!condition) {
    console.error('FAIL: ' + message);
    throw new Error('Assertion failed: ' + message);
  }
  passed++;
  console.log('PASS: ' + message);
}

async function runTests() {
  console.log('========================================================');
  console.log('TRACE Hardening #5: Progress Store Unification Suite');
  console.log('========================================================\n');

  const {
    getAllProgress,
    getProblemProgress,
    getProblemKey,
    updateProblemProgress,
    toggleProblemSolved,
    getSolvedProblemIds,
    isProblemSolved,
    resetAllProgress,
    computePatternPerformance,
    computeTopicPerformance
  } = await import('../src/services/progressStore.js');

  // ── 1. Clean Storage Initial State ───────────────────────
  {
    localStorage.clear();
    const progress = getAllProgress();
    const solvedSet = getSolvedProblemIds();
    assert(solvedSet.size === 0, 'Test 1: Clean storage has 0 solved problems');
    assert(isProblemSolved(1) === false, 'Test 1: isProblemSolved(1) is false on clean storage');
    assert(isProblemSolved(9999) === false, 'Test 1: isProblemSolved(9999) is false');

    // Solve problem 1
    updateProblemProgress(1, { status: 'solved' });
    assert(isProblemSolved(1) === true, 'Test 1: isProblemSolved(1) becomes true after solve');
    const updatedSet = getSolvedProblemIds();
    assert(updatedSet.has(1) && updatedSet.has('1'), 'Test 1: Solved set has numeric and string 1');
  }

  // ── 2. Legacy Migration ───────────────────────────────────
  {
    localStorage.clear();
    // Simulate legacy storage having [42, 99] but trace_problem_progress empty
    localStorage.setItem('trace_solved_problems', JSON.stringify([42, '99']));
    localStorage.setItem('trace_problem_progress', JSON.stringify({}));

    const progress = getAllProgress();
    assert(progress['42']?.status === 'solved', 'Test 2: Legacy ID 42 migrated to solved');
    assert(progress['99']?.status === 'solved', 'Test 2: Legacy ID 99 migrated to solved');
    const solvedSet = getSolvedProblemIds();
    assert(solvedSet.has(42) && solvedSet.has('42'), 'Test 2: Solved set recognizes migrated 42');
    assert(solvedSet.has(99) && solvedSet.has('99'), 'Test 2: Solved set recognizes migrated 99');
  }

  // ── 3. Dual-Write Synchronization on Solve ────────────────
  {
    localStorage.clear();
    localStorage.setItem('trace_problem_progress', JSON.stringify({}));
    localStorage.setItem('trace_solved_problems', JSON.stringify([]));

    updateProblemProgress(105, { status: 'solved', confidence: 'high' });
    const rawProgress = JSON.parse(localStorage.getItem('trace_problem_progress') || '{}');
    const rawLegacy = JSON.parse(localStorage.getItem('trace_solved_problems') || '[]');

    assert(rawProgress['105']?.status === 'solved', 'Test 3: Problem 105 solved in trace_problem_progress');
    assert(rawProgress['105']?.confidence === 'high', 'Test 3: Confidence recorded in trace_problem_progress');
    assert(rawLegacy.includes(105) || rawLegacy.includes('105'), 'Test 3: Problem 105 mirrored into trace_solved_problems');
    assert(isProblemSolved(105) === true, 'Test 3: isProblemSolved(105) returns true');
  }

  // ── 4. Dual-Write Synchronization on Unsolve ──────────────
  {
    updateProblemProgress(105, { status: 'unsolved' });
    const rawProgress = JSON.parse(localStorage.getItem('trace_problem_progress') || '{}');
    const rawLegacy = JSON.parse(localStorage.getItem('trace_solved_problems') || '[]');

    assert(rawProgress['105']?.status === 'unsolved', 'Test 4: Problem 105 status is unsolved in progress map');
    assert(!rawLegacy.some(id => String(id) === '105'), 'Test 4: Problem 105 removed from trace_solved_problems');
    assert(isProblemSolved(105) === false, 'Test 4: isProblemSolved(105) returns false');
  }

  // ── 5. toggleProblemSolved Behavior ───────────────────────
  {
    localStorage.clear();
    localStorage.setItem('trace_problem_progress', JSON.stringify({}));
    localStorage.setItem('trace_solved_problems', JSON.stringify([]));

    assert(isProblemSolved(200) === false, 'Test 5: Problem 200 initially unsolved');
    const toggled1 = toggleProblemSolved(200);
    assert(toggled1.status === 'solved', 'Test 5: First toggle sets status to solved');
    assert(toggled1.lastSolvedAt !== null, 'Test 5: First toggle records lastSolvedAt timestamp');
    assert(isProblemSolved(200) === true, 'Test 5: isProblemSolved(200) is true');

    const toggled2 = toggleProblemSolved(200);
    assert(toggled2.status === 'unsolved', 'Test 5: Second toggle sets status to unsolved');
    assert(isProblemSolved(200) === false, 'Test 5: isProblemSolved(200) is false');
  }

  // ── 6. String vs Numeric ID Queries ───────────────────────
  {
    localStorage.clear();
    localStorage.setItem('trace_problem_progress', JSON.stringify({}));
    localStorage.setItem('trace_solved_problems', JSON.stringify([]));

    toggleProblemSolved('15');
    const solvedSet = getSolvedProblemIds();
    assert(solvedSet.has(15), 'Test 6: Set contains numeric 15');
    assert(solvedSet.has('15'), 'Test 6: Set contains string "15"');
    assert(isProblemSolved(15) === true, 'Test 6: isProblemSolved with number is true');
    assert(isProblemSolved('15') === true, 'Test 6: isProblemSolved with string is true');
  }

  // ── 7. Global Event Emission on Updates ───────────────────
  {
    let eventReceived = null;
    const listener = (e) => { eventReceived = e.detail; };
    window.addEventListener('trace_progress_updated', listener);

    toggleProblemSolved(300);
    assert(eventReceived !== null, 'Test 7: CustomEvent dispatched on toggle');
    assert(eventReceived.key === '300', 'Test 7: Event detail has correct problem key 300');
    assert(eventReceived.progress.status === 'solved', 'Test 7: Event detail progress status is solved');

    window.removeEventListener('trace_progress_updated', listener);
  }

  // ── 8. resetAllProgress Behavior ──────────────────────────
  {
    let resetEventReceived = false;
    const resetListener = (e) => {
      if (e.detail?.reset) resetEventReceived = true;
    };
    window.addEventListener('trace_progress_updated', resetListener);

    resetAllProgress();
    assert(resetEventReceived === true, 'Test 8: Reset event dispatched');
    assert(localStorage.getItem('trace_problem_progress') === '{}', 'Test 8: trace_problem_progress is empty object');
    assert(localStorage.getItem('trace_solved_problems') === '[]', 'Test 8: trace_solved_problems is empty array');
    const solvedSet = getSolvedProblemIds();
    assert(solvedSet.size === 0, 'Test 8: getSolvedProblemIds() is completely empty after reset');

    window.removeEventListener('trace_progress_updated', resetListener);
  }

  // ── 9. Pattern Performance Dynamic Calculation ────────────
  {
    localStorage.clear();
    localStorage.setItem('trace_problem_progress', JSON.stringify({}));
    localStorage.setItem('trace_solved_problems', JSON.stringify([]));

    // Initially 0 solved
    const initialPatterns = computePatternPerformance();
    const twoPointers1 = initialPatterns.find(p => p.pattern === 'Two Pointers');
    assert(twoPointers1 && twoPointers1.solved === 0, 'Test 9: Two Pointers initial solved is 0');

    // Solve Container With Most Water (id 11) which has Two Pointers pattern
    toggleProblemSolved(11);
    const updatedPatterns = computePatternPerformance();
    const twoPointers2 = updatedPatterns.find(p => p.pattern === 'Two Pointers');
    assert(twoPointers2 && twoPointers2.solved >= 1, 'Test 9: Two Pointers reflects solved problem count');

    // Solve Two Sum (id 1) which has Complement Lookup
    toggleProblemSolved(1);
    const updatedPatterns2 = computePatternPerformance();
    const compLookup = updatedPatterns2.find(p => p.pattern === 'Complement Lookup');
    assert(compLookup && compLookup.solved >= 1, 'Test 9: Complement Lookup reflects solved problem 1');
  }

  // ── 10. Topic Performance Dynamic Calculation ─────────────
  {
    const initialTopics = computeTopicPerformance();
    const hashTopic = initialTopics.find(t => t.topic === 'HashMap / HashSet');
    assert(hashTopic && hashTopic.solved >= 1, 'Test 10: HashMap / HashSet topic reflects solved problem 1');
    const arrayTopic = initialTopics.find(t => t.topic === 'Array');
    assert(arrayTopic && arrayTopic.solved >= 1, 'Test 10: Array topic reflects solved problem 11');
  }

  console.log('\n========================================================');
  console.log('Hardening #5 Progress Suite: ' + passed + '/' + total + ' PASSED');
  console.log('========================================================');
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
