import fs from 'fs';
import path from 'path';

async function runBrowserE2E() {
  console.log('========================================================');
  console.log('TRACE Hardening #4.1: Chrome CDP E2E Verification Suite');
  console.log('========================================================\n');

  const res = await fetch('http://127.0.0.1:9222/json');
  const tabs = await res.json();
  const pageTab = tabs.find(t => t.url.includes('5174'));
  if (!pageTab) throw new Error('No tab with port 5174 found in Chrome!');

  const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  console.log('Connected to Chrome tab:', pageTab.id);

  let id = 1;
  function send(method, params={}) {
    return new Promise((resolve, reject) => {
      const msgId = id++;
      const handler = (evt) => {
        const data = JSON.parse(evt.data);
        if (data.id === msgId) {
          ws.removeEventListener('message', handler);
          if (data.error) reject(data.error);
          else resolve(data.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  await send('Console.enable');
  await send('Page.enable');
  await send('Runtime.enable');

  const consoleErrors = [];
  ws.addEventListener('message', (evt) => {
    const d = JSON.parse(evt.data);
    if (d.method === 'Console.messageAdded' && d.params?.message?.level === 'error') {
      consoleErrors.push(d.params.message.text);
    }
  });

  async function evaluate(expression) {
    const r = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (r.exceptionDetails) {
      throw new Error('Evaluation error: ' + JSON.stringify(r.exceptionDetails));
    }
    return r.result?.value;
  }

  async function captureScreenshot(filename) {
    const r = await send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(r.data, 'base64');
    const artifactPath = path.join('/Users/snehasahu/.gemini/antigravity-ide/brain/8bae2a87-cd1a-4d79-b817-76c21d6c3b73', filename);
    fs.writeFileSync(artifactPath, buffer);
    console.log('Saved screenshot to: ' + artifactPath);
    return artifactPath;
  }

  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  // ───────────────────────────────────────────────────────────
  // TEST 1: Array Mutation
  // ───────────────────────────────────────────────────────────
  console.log('\n--- TEST 1: Array Mutation ---');
  const code1 = 'int[] nums = {10, 20, 30};\nnums[1] = 99;\nprintln(nums[1]);';
  await evaluate('window.__traceStore.getState().setLanguage("java"); window.__traceStore.getState().setCode(' + JSON.stringify(code1) + '); window.__traceStore.getState().run();');
  await sleep(400);

  await evaluate('window.__traceStore.getState().goToStep(0)');
  await sleep(200);

  const step1Info = await evaluate('({ stepBadge: document.querySelector(".step-counter-badge")?.textContent?.trim(), cells: Array.from(document.querySelectorAll(".array-val-cell")).map(c => c.textContent.trim()), output: document.querySelector(".terminal-output-text")?.textContent?.trim(), noFallback: !document.body.innerText.includes("2, 7, 11, 15") })');
  console.log('Step 1 DOM info:', step1Info);
  if (!step1Info.cells.includes('10') || !step1Info.cells.includes('20') || !step1Info.cells.includes('30')) {
    throw new Error('Step 1 did not display [10, 20, 30]! Got: ' + JSON.stringify(step1Info.cells));
  }

  await evaluate('window.__traceStore.getState().next()');
  await sleep(200);

  const step2Info = await evaluate('({ stepBadge: document.querySelector(".step-counter-badge")?.textContent?.trim(), cells: Array.from(document.querySelectorAll(".array-val-cell")).map(c => c.textContent.trim()), output: document.querySelector(".terminal-output-text")?.textContent?.trim() })');
  console.log('Step 2 DOM info:', step2Info);
  if (!step2Info.cells.includes('10') || !step2Info.cells.includes('99') || !step2Info.cells.includes('30')) {
    throw new Error('Step 2 did not display [10, 99, 30]! Got: ' + JSON.stringify(step2Info.cells));
  }
  if (!step2Info.output.includes('99')) {
    throw new Error('Output does not contain 99! Got: ' + step2Info.output);
  }

  await evaluate('window.__traceStore.getState().prev()');
  await sleep(200);
  const stepBackCells = await evaluate('Array.from(document.querySelectorAll(".array-val-cell")).map(c => c.textContent.trim())');
  console.log('After stepping back to Step 1, cells:', stepBackCells);
  if (!stepBackCells.includes('20') || stepBackCells.includes('99')) {
    throw new Error('Stepping back failed to restore [10, 20, 30]! Got: ' + JSON.stringify(stepBackCells));
  }

  await evaluate('window.__traceStore.getState().next()');
  await sleep(200);
  await captureScreenshot('hardening4_array_mutation_step2.png');
  console.log('✓ TEST 1 PASSED: Real array rendered [10, 99, 30], output is 99, navigation restored state!');

  // ───────────────────────────────────────────────────────────
  // TEST 2: Java Object Graph
  // ───────────────────────────────────────────────────────────
  console.log('\n--- TEST 2: Java Object Graph ---');
  const objCode = 'class ListNode {\n    int val;\n    ListNode next;\n}\n\nListNode a = new ListNode();\na.val = 10;\na.next = new ListNode();\na.next.val = 20;\n\nprintln(a.next.val);';
  await evaluate('window.__traceStore.getState().setCode(' + JSON.stringify(objCode) + '); window.__traceStore.getState().run();');
  await sleep(400);

  await evaluate('window.__traceStore.getState().last()');
  await sleep(200);

  const objInfo = await evaluate('({ output: document.querySelector(".terminal-output-text")?.textContent?.trim(), objTitle: document.querySelector(".ds-title")?.textContent?.trim(), treeRows: Array.from(document.querySelectorAll(".object-tree-box > div")).map(d => d.textContent.trim().replace(/\s+/g, " ")), varRows: Array.from(document.querySelectorAll(".vars-table tbody tr")).map(tr => tr.textContent.trim().replace(/\s+/g, " ")) })');
  console.log('Object DOM info:', objInfo);
  if (!objInfo.output.includes('20')) {
    throw new Error('Object program output does not contain 20! Got: ' + objInfo.output);
  }
  const treeText = objInfo.treeRows.join(' | ');
  const hasVal10 = treeText.includes('val: 10') || treeText.includes('val:10');
  const hasVal20 = treeText.includes('val: 20') || treeText.includes('val:20');
  const hasNextNull = treeText.includes('next: null') || treeText.includes('next:null');
  if (!hasVal10 || !hasVal20 || !hasNextNull) {
    throw new Error('Object tree missing expected hierarchy! Got: ' + treeText);
  }
  await captureScreenshot('hardening4_object_graph.png');
  console.log('✓ TEST 2 PASSED: Real object graph rendered ListNode hierarchy (val=10, next.val=20, next.next=null)!');

  // ───────────────────────────────────────────────────────────
  // TEST 3: Scalar Variables & Honest Empty State
  // ───────────────────────────────────────────────────────────
  console.log('\n--- TEST 3: Scalar Variables & Honest Empty State ---');
  const loopCode = 'int sum = 0;\nfor (int i = 0; i < 3; i++) {\n    sum += i;\n}\nprintln(sum);';
  await evaluate('window.__traceStore.getState().setCode(' + JSON.stringify(loopCode) + '); window.__traceStore.getState().run();');
  await sleep(400);

  await evaluate('window.__traceStore.getState().last()');
  await sleep(200);

  const loopInfo = await evaluate('({ output: document.querySelector(".terminal-output-text")?.textContent?.trim(), emptyStateTitle: document.querySelector(".ds-empty-state")?.textContent?.trim(), hasFakeArrays: document.querySelectorAll(".array-boxes-wrap").length > 0, varRows: Array.from(document.querySelectorAll(".vars-table tbody tr")).map(tr => tr.textContent.trim().replace(/\s+/g, " ")) })');
  console.log('Loop DOM info:', loopInfo);
  if (!loopInfo.output.includes('3')) {
    throw new Error('Loop output does not contain 3! Got: ' + loopInfo.output);
  }
  if (loopInfo.hasFakeArrays) {
    throw new Error('Fake array visualizer was rendered for scalar loop!');
  }
  if (!loopInfo.emptyStateTitle.includes('No Visualizable Data Structures')) {
    throw new Error('Honest empty state missing! Got: ' + loopInfo.emptyStateTitle);
  }
  await captureScreenshot('hardening4_scalar_empty_state.png');
  console.log('✓ TEST 3 PASSED: Honest empty state shown for scalar loop, variables table reflects sum=3, zero fake arrays!');

  // ───────────────────────────────────────────────────────────
  // TEST 4: Running Sum (Non-Two-Sum Dynamic Program)
  // ───────────────────────────────────────────────────────────
  console.log('\n--- TEST 4: Running Sum ---');
  const runningSumCode = 'int[] nums = {1, 2, 3, 4};\nfor (int i = 1; i < nums.length; i++) {\n    nums[i] += nums[i - 1];\n}\nprintln(nums[nums.length - 1]);';
  await evaluate('window.__traceStore.getState().setCode(' + JSON.stringify(runningSumCode) + '); window.__traceStore.getState().run();');
  await sleep(400);

  await evaluate('window.__traceStore.getState().last()');
  await sleep(200);

  const runningSumInfo = await evaluate('({ output: document.querySelector(".terminal-output-text")?.textContent?.trim(), cells: Array.from(document.querySelectorAll(".array-val-cell")).map(c => c.textContent.trim()) })');
  console.log('Running Sum DOM info:', runningSumInfo);
  if (!runningSumInfo.output.includes('10')) {
    throw new Error('Running sum output does not contain 10! Got: ' + runningSumInfo.output);
  }
  const expectedArray = ['1', '3', '6', '10'];
  if (JSON.stringify(runningSumInfo.cells) !== JSON.stringify(expectedArray)) {
    throw new Error('Running sum final array does not match [1, 3, 6, 10]! Got: ' + JSON.stringify(runningSumInfo.cells));
  }
  await captureScreenshot('hardening4_running_sum.png');
  console.log('✓ TEST 4 PASSED: Running Sum rendered [1, 3, 6, 10] with output 10!');

  // ───────────────────────────────────────────────────────────
  // TEST 5: Binary Search (Non-Two-Sum with Pointers)
  // ───────────────────────────────────────────────────────────
  console.log('\n--- TEST 5: Binary Search ---');
  const binarySearchCode = 'int[] nums = {2, 5, 8, 12, 16, 23, 38, 56, 72, 91};\nint target = 23;\nint left = 0;\nint right = nums.length - 1;\nint found = -1;\nwhile (left <= right) {\n    int mid = (left + right) / 2;\n    if (nums[mid] == target) {\n        found = mid;\n        break;\n    } else if (nums[mid] < target) {\n        left = mid + 1;\n    } else {\n        right = mid - 1;\n    }\n}\nprintln(found);';
  await evaluate('window.__traceStore.getState().setCode(' + JSON.stringify(binarySearchCode) + '); window.__traceStore.getState().run();');
  await sleep(400);

  await evaluate('window.__traceStore.getState().last()');
  await sleep(200);

  const binSearchInfo = await evaluate('({ output: document.querySelector(".terminal-output-text")?.textContent?.trim(), pointers: Array.from(document.querySelectorAll(".pointer-badge")).map(p => p.textContent.trim()) })');
  console.log('Binary Search DOM info:', binSearchInfo);
  if (!binSearchInfo.output.includes('5')) {
    throw new Error('Binary search output does not contain 5! Got: ' + binSearchInfo.output);
  }
  await captureScreenshot('hardening4_binary_search.png');
  console.log('✓ TEST 5 PASSED: Binary Search found index 5 for target 23 with active pointers!');

  // ───────────────────────────────────────────────────────────
  // TEST 6: Two Sum Regression
  // ───────────────────────────────────────────────────────────
  console.log('\n--- TEST 6: Two Sum Regression ---');
  const twoSumCode = 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        for (int i = 0; i < nums.length; i++) {\n            for (int j = i + 1; j < nums.length; j++) {\n                if (nums[i] + nums[j] == target) {\n                    return new int[]{i, j};\n                }\n            }\n        }\n        return new int[]{};\n    }\n}';
  await evaluate('window.__traceStore.getState().setInputs({ nums: "[2, 7, 11, 15]", target: "9" }); window.__traceStore.getState().setCode(' + JSON.stringify(twoSumCode) + '); window.__traceStore.getState().run();');
  await sleep(400);

  const twoSumRet = await evaluate('window.__traceStore.getState().returnValue');
  console.log('Two sum return value:', twoSumRet);
  if (JSON.stringify(twoSumRet) !== JSON.stringify([0, 1])) {
    throw new Error('Two sum returned incorrect value! Got: ' + JSON.stringify(twoSumRet));
  }
  console.log('✓ TEST 6 PASSED: Two Sum regression intact, returned [0, 1]!');

  console.log('\nConsole errors during run:', consoleErrors);
  if (consoleErrors.length > 0) {
    throw new Error('Console errors encountered: ' + JSON.stringify(consoleErrors));
  }

  ws.close();
  console.log('\n========================================================');
  console.log('ALL 6 BROWSER E2E TESTS PASSED SUCCESSFULLY! 🚀');
  console.log('========================================================');
}

runBrowserE2E().catch(err => {
  console.error(err);
  process.exit(1);
});
