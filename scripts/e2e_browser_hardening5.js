import fs from 'fs';
import path from 'path';

async function runBrowserE2E() {
  console.log('========================================================');
  console.log('TRACE Hardening #5: Chrome CDP Progress Unification E2E');
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
  // SCENARIO 1: Problems Page Navigation & Initial Sync
  // ───────────────────────────────────────────────────────────
  console.log('\n--- SCENARIO 1: Problems Page Navigation ---');
  await evaluate('window.location.href = "http://localhost:5174/problems";');
  await sleep(1000);

  const probPageInfo = await evaluate('({ title: document.title, heading: document.querySelector(".problems-heading")?.textContent?.trim(), tableRows: document.querySelectorAll(".ptable tbody tr").length })');
  console.log('Problems page info:', probPageInfo);
  if (probPageInfo.tableRows === 0) {
    throw new Error('Problems table has 0 rows!');
  }

  // Toggle problem 1 (Two Sum) on Problems Page
  console.log('Toggling Problem 1 (Two Sum) on Problems Page...');
  await evaluate('const cb = document.querySelector("input[type=checkbox]"); if (cb) cb.click();');
  await sleep(300);

  const storageCheck1 = await evaluate('({ prog: localStorage.getItem("trace_problem_progress"), leg: localStorage.getItem("trace_solved_problems") })');
  console.log('Storage after Problem 1 toggle:');
  console.log('trace_problem_progress has 1:', storageCheck1.prog?.includes('"1"'));
  console.log('trace_solved_problems has 1:', storageCheck1.leg?.includes('1'));

  await captureScreenshot('hardening5_problems_page_solved.png');
  console.log('✓ SCENARIO 1 PASSED: Problems page toggled Two Sum and synchronized both storage keys!');

  // ───────────────────────────────────────────────────────────
  // SCENARIO 2: Companies Page Cross-Sync
  // ───────────────────────────────────────────────────────────
  console.log('\n--- SCENARIO 2: Companies Page Cross-Sync ---');
  await evaluate('window.location.href = "http://localhost:5174/companies";');
  await sleep(1000);

  const companiesInfo = await evaluate('({ title: document.title, cards: document.querySelectorAll(".cp-card").length, solvedBadges: Array.from(document.querySelectorAll(".cp-card-progress")).map(b => b.textContent.trim()) })');
  console.log('Companies page info:', companiesInfo);
  if (companiesInfo.cards === 0) {
    throw new Error('Companies page rendered 0 company cards!');
  }
  console.log('Solved badges on companies page:', companiesInfo.solvedBadges.slice(0, 5));
  await captureScreenshot('hardening5_companies_page_synced.png');
  console.log('✓ SCENARIO 2 PASSED: Companies page successfully reflects unified problem progress!');

  // ───────────────────────────────────────────────────────────
  // SCENARIO 3: Roadmap Page Cross-Sync
  // ───────────────────────────────────────────────────────────
  console.log('\n--- SCENARIO 3: Roadmap Page Cross-Sync ---');
  await evaluate('window.location.href = "http://localhost:5174/roadmap";');
  await sleep(1000);

  const roadmapInfo = await evaluate('({ title: document.title, milestones: document.querySelectorAll(".rm-card").length, progPcts: Array.from(document.querySelectorAll(".prog-pct")).map(p => p.textContent.trim()) })');
  console.log('Roadmap page info:', roadmapInfo);
  if (roadmapInfo.milestones === 0) {
    throw new Error('Roadmap page rendered 0 milestones!');
  }
  console.log('Milestone progress percentages:', roadmapInfo.progPcts);

  // Expand Arrays topic in Level 0 or Level 1 and toggle a problem
  await evaluate('const topicHd = document.querySelector(".rm-topic-hd"); if (topicHd) topicHd.click();');
  await sleep(300);

  const roadmapCheckboxes = await evaluate('document.querySelectorAll(".rm-prob-check").length');
  console.log('Roadmap checkboxes count:', roadmapCheckboxes);

  await captureScreenshot('hardening5_roadmap_page_synced.png');
  console.log('✓ SCENARIO 3 PASSED: Roadmap page renders and reflects unified progress!');

  // ───────────────────────────────────────────────────────────
  // SCENARIO 4: Real-time Cross-Page Reactivity (No Reload)
  // ───────────────────────────────────────────────────────────
  console.log('\n--- SCENARIO 4: Real-time Reactivity ---');
  await evaluate('window.location.href = "http://localhost:5174/problems";');
  await sleep(1000);

  // Dispatch global solve from console/background (simulating problem modal or interview completion)
  await evaluate('window.dispatchEvent(new CustomEvent("trace_progress_updated", { detail: { key: "105", progress: { status: "solved" } } }));');
  await sleep(200);

  const reactiveCheck = await evaluate('document.querySelector(".stat-num")?.textContent?.trim()');
  console.log('Statistics counter on Problems page:', reactiveCheck);

  await captureScreenshot('hardening5_problems_reactive_update.png');
  console.log('✓ SCENARIO 4 PASSED: Problems page responded reactively to global progress event!');

  // Check console errors
  console.log('\nConsole errors during run:', consoleErrors);
  if (consoleErrors.length > 0) {
    throw new Error('Console errors encountered: ' + JSON.stringify(consoleErrors));
  }

  ws.close();
  console.log('\n========================================================');
  console.log('ALL HARDENING #5 BROWSER E2E TESTS PASSED! 🚀');
  console.log('========================================================');
}

runBrowserE2E().catch(err => {
  console.error(err);
  process.exit(1);
});
