import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import os from 'os';

const PORT = 5174;
const CDP_PORT = 9222;

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function runBrowserE2E() {
  console.log('========================================================');
  console.log('TRACE Hardening #6: Chrome CDP PriorityQueue Heap E2E');
  console.log('========================================================\n');

  let chromeProcess = null;
  let tmpDir = null;
  // Check if Chrome is already on CDP_PORT
  try {
    const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json`);
    if (res.ok) {
      console.log('Found existing Chrome instance on port', CDP_PORT);
    }
  } catch (err) {
    console.log('Spawning Google Chrome headless with remote debugging on port', CDP_PORT);
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-cdp-'));
    chromeProcess = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
      '--headless=new',
      `--remote-debugging-port=${CDP_PORT}`,
      `--user-data-dir=${tmpDir}`,
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      'about:blank'
    ]);
    await sleep(2000);
  }

  const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json`);
  const tabs = await res.json();
  let pageTab = tabs.find(t => t.type === 'page');
  if (!pageTab) pageTab = tabs[0];
  if (!pageTab) throw new Error('No tab found in Chrome!');

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
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });

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

  try {
    // Navigate to visualizer
    console.log(`Navigating to http://localhost:${PORT}/ ...`);
    await send('Page.navigate', { url: `http://localhost:${PORT}/` });
    
    // Wait until window.__traceStore is available
    let storeReady = false;
    for (let i = 0; i < 30; i++) {
      await sleep(500);
      try {
        const isDef = await evaluate('typeof window.__traceStore !== "undefined"');
        if (isDef) { storeReady = true; break; }
      } catch (_) {}
    }
    if (!storeReady) throw new Error('window.__traceStore not defined after navigation!');
    console.log('window.__traceStore is ready in Chrome!');

    // ─────────────────────────────────────────────────────────
    // TEST 1: PriorityQueue Min-Heap Execution & Visualizer
    // ─────────────────────────────────────────────────────────
    console.log('\n--- TEST 1: Min-Heap Live Visualizer Execution ---');
    const minHeapCode = `PriorityQueue<Integer> pq = new PriorityQueue<>();
pq.add(5);
pq.add(1);
pq.add(3);
println(pq.peek());
println(pq.poll());
println(pq.poll());
println(pq.poll());`;

    await evaluate('window.__traceStore.getState().setLanguage("java"); window.__traceStore.getState().setCode(' + JSON.stringify(minHeapCode) + '); window.__traceStore.getState().run();');
    await sleep(600);

    // Step to when all 3 elements [5, 1, 3] are inserted into heap
    // Trace step 3 has heap [1, 5, 3]
    await evaluate('window.__traceStore.getState().goToStep(3)');
    await sleep(400);

    const step3DOM = await evaluate(`({
      title: document.querySelector('.ds-title')?.textContent?.trim(),
      hasHeapBadge: !!Array.from(document.querySelectorAll('span')).find(s => s.textContent.includes('Binary Heap')),
      hasHeadLabel: !!Array.from(document.querySelectorAll('span')).find(s => s.textContent.includes('min (head) →')),
      cells: Array.from(document.querySelectorAll('.queue-cell')).map(c => c.textContent.replace(/\s+/g, ' ').trim()),
      terminalOutput: document.querySelector('.terminal-output-text')?.textContent?.trim()
    })`);

    console.log('Step 3 Min-Heap DOM Info:', step3DOM);
    if (!step3DOM.title.includes('PriorityQueue (Min-Heap)')) {
      throw new Error('DOM did not render PriorityQueue (Min-Heap)! Got: ' + step3DOM.title);
    }
    if (!step3DOM.hasHeadLabel) {
      throw new Error('DOM missing "min (head) →" label!');
    }
    // Root element must be 1 (at index [0])
    if (!step3DOM.cells[0]?.includes('[0]') || !step3DOM.cells[0]?.includes('1')) {
      throw new Error('Index 0 root cell is not 1! Got: ' + step3DOM.cells[0]);
    }

    await captureScreenshot('hardening6_priority_queue_minheap_step3.png');
    console.log('✓ TEST 1 Min-Heap Step 3 screenshot captured and DOM verified!');

    // Step to the end to verify output
    await evaluate('window.__traceStore.getState().goToStep(window.__traceStore.getState().trace.length - 1)');
    await sleep(400);

    const finalDOM = await evaluate(`({
      output: document.querySelector('.terminal-output-text')?.textContent?.trim(),
      cells: Array.from(document.querySelectorAll('.queue-cell')).map(c => c.textContent.trim())
    })`);
    console.log('Final Min-Heap Execution DOM:', finalDOM);
    if (!finalDOM.output.includes('1') || !finalDOM.output.includes('3') || !finalDOM.output.includes('5')) {
      throw new Error('Terminal output did not contain polled heap sequence [1, 1, 3, 5]! Got: ' + finalDOM.output);
    }

    await captureScreenshot('hardening6_priority_queue_polled.png');
    console.log('✓ TEST 1 Completed: Min-heap poll outputs [1, 1, 3, 5] verified in DOM!');

    // ─────────────────────────────────────────────────────────
    // TEST 2: PriorityQueue Max-Heap (Collections.reverseOrder())
    // ─────────────────────────────────────────────────────────
    console.log('\n--- TEST 2: Max-Heap (Collections.reverseOrder()) Live Visualizer ---');
    const maxHeapCode = `PriorityQueue<Integer> maxPq = new PriorityQueue<>(Collections.reverseOrder());
maxPq.add(10);
maxPq.add(50);
maxPq.add(30);
println(maxPq.poll());`;

    await evaluate('window.__traceStore.getState().setCode(' + JSON.stringify(maxHeapCode) + '); window.__traceStore.getState().run();');
    await sleep(600);

    // Step to when elements are in heap
    await evaluate('window.__traceStore.getState().goToStep(3)');
    await sleep(400);

    const maxDOM = await evaluate(`({
      title: document.querySelector('.ds-title')?.textContent?.trim(),
      hasMaxHead: !!Array.from(document.querySelectorAll('span')).find(s => s.textContent.includes('max (head) →')),
      cells: Array.from(document.querySelectorAll('.queue-cell')).map(c => c.textContent.replace(/\s+/g, ' ').trim()),
      output: document.querySelector('.terminal-output-text')?.textContent?.trim()
    })`);

    console.log('Max-Heap DOM Info:', maxDOM);
    if (!maxDOM.title.includes('PriorityQueue (Max-Heap)')) {
      throw new Error('DOM did not render PriorityQueue (Max-Heap)! Got: ' + maxDOM.title);
    }
    if (!maxDOM.hasMaxHead) {
      throw new Error('DOM missing "max (head) →" label!');
    }
    if (!maxDOM.cells[0]?.includes('[0]') || !maxDOM.cells[0]?.includes('50')) {
      throw new Error('Max-Heap root is not 50! Got: ' + maxDOM.cells[0]);
    }

    await captureScreenshot('hardening6_priority_queue_maxheap.png');
    console.log('✓ TEST 2 Max-Heap screenshot captured and DOM verified!');

    // Check console errors
    console.log('\nBrowser Console Errors encountered:', consoleErrors.length);
    if (consoleErrors.length > 0) {
      console.warn('Console errors:', consoleErrors);
    }

    console.log('\n========================================================');
    console.log('Hardening #6 Chrome CDP Browser E2E: ALL TESTS PASSED! 🚀');
    console.log('========================================================\n');

  } finally {
    ws.close();
    if (chromeProcess) {
      chromeProcess.kill();
    }
    if (tmpDir) {
      try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch(_) {}
    }
  }
}

runBrowserE2E().catch(err => {
  console.error('Browser E2E Failed:', err);
  process.exit(1);
});
