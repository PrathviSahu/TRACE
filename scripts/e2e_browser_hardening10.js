import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import os from "os";

const PORT = 5174;
const CDP_PORT = 9222;

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function runBrowserE2E() {
  console.log("========================================================");
  console.log("TRACE Hardening #10: Chrome CDP Directory & Learn E2E");
  console.log("========================================================\n");

  let chromeProcess = null;
  let tmpDir = null;

  try {
    const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json`);
    if (res.ok) {
      console.log("Found existing Chrome instance on port", CDP_PORT);
    }
  } catch (err) {
    console.log("Spawning Google Chrome headless on port", CDP_PORT);
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "chrome-cdp-"));
    chromeProcess = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
      "--headless=new",
      `--remote-debugging-port=${CDP_PORT}`,
      `--user-data-dir=${tmpDir}`,
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "about:blank"
    ]);
  }

  let connected = false;
  let tabs = [];
  for (let attempt = 0; attempt < 20; attempt++) {
    await sleep(500);
    try {
      const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json`);
      if (res.ok) {
        tabs = await res.json();
        connected = true;
        break;
      }
    } catch (_) {}
  }
  if (!connected) throw new Error("Could not connect to Chrome CDP on port " + CDP_PORT);

  let pageTab = tabs.find(t => t.type === "page") || tabs[0];
  if (!pageTab) throw new Error("No Chrome tab found!");

  const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  console.log("Connected to Chrome tab:", pageTab.id);

  let id = 1;
  function send(method, params={}) {
    return new Promise((resolve, reject) => {
      const msgId = id++;
      const handler = (evt) => {
        const data = JSON.parse(evt.data);
        if (data.id === msgId) {
          ws.removeEventListener("message", handler);
          if (data.error) reject(data.error);
          else resolve(data.result);
        }
      };
      ws.addEventListener("message", handler);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  await send("Console.enable");
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });

  const consoleErrors = [];
  ws.addEventListener("message", (evt) => {
    const d = JSON.parse(evt.data);
    if (d.method === "Console.messageAdded") {
      const text = d.params?.message?.text || "";
      const level = d.params?.message?.level || "";
      if (level === "error") {
        consoleErrors.push(text);
      }
    }
  });

  async function evaluate(expression) {
    const r = await send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (r.exceptionDetails) {
      throw new Error("Evaluation error: " + JSON.stringify(r.exceptionDetails));
    }
    return r.result?.value;
  }

  async function captureScreenshot(filename) {
    const r = await send("Page.captureScreenshot", { format: "png" });
    const buffer = Buffer.from(r.data, "base64");
    const artifactPath = path.join("/Users/snehasahu/.gemini/antigravity-ide/brain/8bae2a87-cd1a-4d79-b817-76c21d6c3b73", filename);
    fs.writeFileSync(artifactPath, buffer);
    console.log("Saved screenshot to: " + artifactPath);
    return artifactPath;
  }

  async function navigateTo(url) {
    await send("Page.navigate", { url });
    await sleep(800);
  }

  try {
    // ── Test 1: Data Structures Directory Page ────────────────
    console.log("\n--- Step 1: Verify Data Structures Directory ---");
    await navigateTo(`http://localhost:${PORT}/data-structures`);
    const cardCount = await evaluate(`document.querySelectorAll('.showcase-cards-grid .feature-card').length`);
    console.log(`Rendered directory cards count: ${cardCount}`);
    if (cardCount !== 8) throw new Error(`Expected 8 data structure cards, got ${cardCount}`);

    // ── Test 2: Linked List Navigation to Visualizer ─────────
    console.log("\n--- Step 2: Click Linked List Card ---");
    await evaluate(`
      const cards = Array.from(document.querySelectorAll('.feature-card'));
      const card = cards.find(c => c.querySelector('.feature-title')?.textContent.trim() === 'Linked List');
      if (card) card.querySelector('.btn-viz').click();
    `);
    await sleep(1000);
    const vizTabLL = await evaluate(`window.__traceStore ? window.__traceStore.getState().activeTab : ''`);
    const codeLL = await evaluate(`window.__traceStore ? window.__traceStore.getState().code : ''`);
    console.log(`Visualizer activeTab: "${vizTabLL}"`);
    console.log(`Code contains ListNode: ${codeLL.includes('ListNode')}`);
    if (vizTabLL !== 'Reverse Linked List') throw new Error(`Expected activeTab to be 'Reverse Linked List', got '${vizTabLL}'`);
    if (!codeLL.includes('ListNode')) throw new Error("Linked List failed to load ListNode into visualizer!");
    await captureScreenshot("hardening10_linked_list_viz.png");

    // ── Test 3: Stack Navigation to Visualizer ─────────────────
    console.log("\n--- Step 3: Click Stack Card ---");
    await navigateTo(`http://localhost:${PORT}/data-structures`);
    await evaluate(`
      const cards = Array.from(document.querySelectorAll('.feature-card'));
      const card = cards.find(c => c.querySelector('.feature-title')?.textContent.trim() === 'Stack');
      if (card) card.querySelector('.btn-viz').click();
    `);
    await sleep(1000);
    const vizTabStack = await evaluate(`window.__traceStore ? window.__traceStore.getState().activeTab : ''`);
    const codeStack = await evaluate(`window.__traceStore ? window.__traceStore.getState().code : ''`);
    console.log(`Visualizer activeTab: "${vizTabStack}"`);
    const isStackCode = codeStack.includes('Stack<Character>') || codeStack.includes('stack = []');
    console.log(`Code contains Stack data structure: ${isStackCode}`);
    if (vizTabStack !== 'Valid Parentheses') throw new Error(`Expected activeTab to be 'Valid Parentheses', got '${vizTabStack}'`);
    if (!isStackCode) throw new Error("Stack failed to load Stack code into visualizer!");
    await captureScreenshot("hardening10_stack_viz.png");

    // ── Test 4: Binary Tree & BST Navigation to Visualizer ─────
    console.log("\n--- Step 4: Click Binary Tree & BST Card ---");
    await navigateTo(`http://localhost:${PORT}/data-structures`);
    await evaluate(`
      const cards = Array.from(document.querySelectorAll('.feature-card'));
      const card = cards.find(c => c.querySelector('.feature-title')?.textContent.trim() === 'Binary Tree & BST');
      if (card) card.querySelector('.btn-viz').click();
    `);
    await sleep(1000);
    const vizTabTree = await evaluate(`window.__traceStore ? window.__traceStore.getState().activeTab : ''`);
    const codeTree = await evaluate(`window.__traceStore ? window.__traceStore.getState().code : ''`);
    console.log(`Visualizer activeTab: "${vizTabTree}"`);
    console.log(`Code contains TreeNode: ${codeTree.includes('TreeNode')}`);
    if (vizTabTree !== 'Invert Binary Tree') throw new Error(`Expected activeTab to be 'Invert Binary Tree', got '${vizTabTree}'`);
    if (!codeTree.includes('TreeNode')) throw new Error("Binary Tree failed to load TreeNode into visualizer!");
    await captureScreenshot("hardening10_tree_viz.png");

    // ── Test 5: Heap / Priority Queue Navigation to Visualizer ─
    console.log("\n--- Step 5: Click Heap / Priority Queue Card ---");
    await navigateTo(`http://localhost:${PORT}/data-structures`);
    await evaluate(`
      const cards = Array.from(document.querySelectorAll('.feature-card'));
      const card = cards.find(c => c.querySelector('.feature-title')?.textContent.trim() === 'Heap / Priority Queue');
      if (card) card.querySelector('.btn-viz').click();
    `);
    await sleep(1000);
    const vizTabHeap = await evaluate(`window.__traceStore ? window.__traceStore.getState().activeTab : ''`);
    const codeHeap = await evaluate(`window.__traceStore ? window.__traceStore.getState().code : ''`);
    console.log(`Visualizer activeTab: "${vizTabHeap}"`);
    const isHeapCode = codeHeap.includes('PriorityQueue') || codeHeap.includes('heapq');
    console.log(`Code contains Heap data structure: ${isHeapCode}`);
    if (vizTabHeap !== 'Kth Largest Element (Min-Heap)') throw new Error(`Expected activeTab to be 'Kth Largest Element (Min-Heap)', got '${vizTabHeap}'`);
    if (!isHeapCode) throw new Error("Heap failed to load Heap code into visualizer!");
    await captureScreenshot("hardening10_heap_viz.png");

    // ── Test 6: HashMap & HashSet Navigation to Visualizer ────
    console.log("\n--- Step 6: Click HashMap & HashSet Card ---");
    await navigateTo(`http://localhost:${PORT}/data-structures`);
    await evaluate(`
      const cards = Array.from(document.querySelectorAll('.feature-card'));
      const card = cards.find(c => c.querySelector('.feature-title')?.textContent.trim() === 'HashMap & HashSet');
      if (card) card.querySelector('.btn-viz').click();
    `);
    await sleep(1000);
    const vizTabMap = await evaluate(`window.__traceStore ? window.__traceStore.getState().activeTab : ''`);
    const codeMap = await evaluate(`window.__traceStore ? window.__traceStore.getState().code : ''`);
    console.log(`Visualizer activeTab: "${vizTabMap}"`);
    const isMapCode = codeMap.includes('HashMap') || codeMap.includes('lookup = {}');
    console.log(`Code contains HashMap data structure: ${isMapCode}`);
    if (vizTabMap !== 'Two Sum (Hash Map)') throw new Error(`Expected activeTab to be 'Two Sum (Hash Map)', got '${vizTabMap}'`);
    if (!isMapCode) throw new Error("HashMap failed to load HashMap code into visualizer!");
    await captureScreenshot("hardening10_hashmap_viz.png");

    // ── Test 7: Java Language Switching & Visualizer Execution ─
    console.log("\n--- Step 7: Verify Java Execution in Visualizer ---");
    await evaluate(`
      if (window.__traceStore) {
        window.__traceStore.getState().setLanguage('java');
      }
    `);
    await sleep(500);
    const javaCode = await evaluate(`window.__traceStore ? window.__traceStore.getState().code : ''`);
    console.log(`Java code contains HashMap: ${javaCode.includes('HashMap<Integer, Integer>')}`);
    if (!javaCode.includes('HashMap<Integer, Integer>')) throw new Error("Expected Java code with HashMap");

    // ── Test 8: Learn Page Pattern Navigation to Problems ─────
    console.log("\n--- Step 8: Verify Learn Page Navigation ---");
    await navigateTo(`http://localhost:${PORT}/learn`);
    const guideCount = await evaluate(`document.querySelectorAll('.showcase-cards-grid .feature-card').length`);
    console.log(`Rendered learn guide cards count: ${guideCount}`);
    if (guideCount !== 6) throw new Error(`Expected 6 learn guides, got ${guideCount}`);

    // Click "Two Pointers Pattern"
    await evaluate(`
      const cards = Array.from(document.querySelectorAll('.feature-card'));
      const card = cards.find(c => c.textContent.includes('Two Pointers'));
      if (card) card.querySelector('.btn-viz').click();
    `);
    await sleep(1000);
    const currentUrl = await evaluate(`window.location.href`);
    console.log(`Current URL after Two Pointers click: ${currentUrl}`);
    if (!currentUrl.includes('topic=Two%20Pointers')) throw new Error(`Expected URL to contain topic=Two%20Pointers, got ${currentUrl}`);

    const selectedTopic = await evaluate(`
      const select = document.querySelector('select');
      select ? select.value : ''
    `);
    console.log(`ProblemsPage selectedTopic: "${selectedTopic}"`);
    if (selectedTopic !== 'Two Pointers') throw new Error(`Expected ProblemsPage selectedTopic to be 'Two Pointers', got '${selectedTopic}'`);
    await captureScreenshot("hardening10_learn_two_pointers.png");

    // Click "Sliding Window Mastery"
    await navigateTo(`http://localhost:${PORT}/learn`);
    await evaluate(`
      const cards = Array.from(document.querySelectorAll('.feature-card'));
      const card = cards.find(c => c.textContent.includes('Sliding Window'));
      if (card) card.querySelector('.btn-viz').click();
    `);
    await sleep(1000);
    const currentUrlSW = await evaluate(`window.location.href`);
    console.log(`Current URL after Sliding Window click: ${currentUrlSW}`);
    if (!currentUrlSW.includes('topic=Sliding%20Window')) throw new Error(`Expected URL to contain topic=Sliding%20Window, got ${currentUrlSW}`);
    await captureScreenshot("hardening10_learn_sliding_window.png");

    // ── Test 9: Console Errors Check ──────────────────────────
    console.log("\n--- Step 9: Check Console Errors ---");
    console.log(`Total console errors captured: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.error("Console errors encountered:", consoleErrors);
      throw new Error(`Expected 0 console errors, but got ${consoleErrors.length}`);
    }

    console.log("\n========================================================");
    console.log("TRACE Hardening #10 Chrome CDP E2E: ALL CHECKS PASSED ✅");
    console.log("========================================================\n");

  } finally {
    ws.close();
    if (chromeProcess) {
      chromeProcess.kill();
      try {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      } catch (_) {}
    }
  }
}

runBrowserE2E().catch(err => {
  console.error("E2E Test Failed:", err);
  process.exit(1);
});
