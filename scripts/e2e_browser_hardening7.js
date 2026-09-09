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
  console.log('TRACE Hardening #7: Chrome CDP ProblemModal Contract E2E');
  console.log('========================================================\n');

  let chromeProcess = null;
  let tmpDir = null;

  try {
    const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json`);
    if (res.ok) {
      console.log('Found existing Chrome instance on port', CDP_PORT);
    }
  } catch (err) {
    console.log('Spawning Google Chrome headless on port', CDP_PORT);
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-cdp-'));
    chromeProcess = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
      '--headless=new',
      `--remote-debugging-port=${CDP_PORT}`,
      `--user-data-dir=${tmpDir}`,
      '--disable-gpu',
      '--no-first-run',
      `http://localhost:${PORT}/problems`
    ]);
    await sleep(2500);
  }

  const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json`);
  const tabs = await res.json();
  const pageTab = tabs.find(t => t.url.includes('5174')) || tabs[0];
  if (!pageTab) throw new Error('No Chrome tab found!');

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
    // ─────────────────────────────────────────────────────────
    // SCENARIO 1: Preset Problem (Two Sum #1)
    // ─────────────────────────────────────────────────────────
    console.log('--- SCENARIO 1: Preset Problem Visualize Code ---');
    await send('Page.navigate', { url: `http://localhost:${PORT}/problems` });
    await sleep(2000);

    // Wait for problems table
    await evaluate(`new Promise(resolve => {
      const check = () => {
        if (document.querySelectorAll('.pname').length > 0) resolve();
        else setTimeout(check, 100);
      };
      check();
    })`);

    // Click on Two Sum (#1)
    const clickedPreset = await evaluate(`(() => {
      const el = Array.from(document.querySelectorAll('.pname')).find(e => e.textContent.includes('Two Sum'));
      if (el) { el.click(); return true; }
      return false;
    })()`);
    if (!clickedPreset) throw new Error('Two Sum row not found in problems table!');
    await sleep(600);

    // Verify modal is open
    const modalVisible = await evaluate(`!!document.querySelector('.pm-modal-overlay')`);
    if (!modalVisible) throw new Error('ProblemModal did not open!');
    console.log('ProblemModal opened for Preset Two Sum');

    // Click '▶ Visualize in Java'
    await evaluate(`document.querySelector('.pm-btn.pm-btn-primary')?.click()`);
    await sleep(1000);

    // Verify navigation to visualizer and code loaded
    const presetVisualizerState = await evaluate(`({
      pathname: window.location.pathname,
      hasCode: !!window.__traceStore?.getState().code.includes('twoSum'),
      hasTrace: (window.__traceStore?.getState().trace?.length || 0) > 0,
      status: window.__traceStore?.getState().status
    })`);
    console.log('Preset Visualizer State:', presetVisualizerState);
    if (presetVisualizerState.pathname !== '/') throw new Error('Did not navigate to /');
    if (!presetVisualizerState.hasCode) throw new Error('Code was not loaded in store!');

    await captureScreenshot('hardening7_preset_visualize.png');
    console.log('✓ SCENARIO 1 PASSED: Preset problem visualized successfully!');

    // ─────────────────────────────────────────────────────────
    // SCENARIO 2: Non-Preset Problem (No TypeError, Generates Code)
    // ─────────────────────────────────────────────────────────
    console.log('\n--- SCENARIO 2: Non-Preset Problem Visualize Code ---');
    await send('Page.navigate', { url: `http://localhost:${PORT}/problems` });
    await sleep(2000);

    // Find non-preset problem (a row WITHOUT .preset-badge)
    const nonPresetInfo = await evaluate(`(() => {
      const rows = Array.from(document.querySelectorAll('tbody tr'));
      for (const row of rows) {
        if (!row.querySelector('.preset-badge')) {
          const nameEl = row.querySelector('.pname');
          if (nameEl) {
            const name = nameEl.textContent.trim();
            nameEl.click();
            return { found: true, name };
          }
        }
      }
      return { found: false };
    })()`);

    if (!nonPresetInfo.found) throw new Error('No non-preset problem found in table!');
    console.log('Clicked non-preset problem:', nonPresetInfo.name);
    await sleep(600);

    // Verify modal is open
    const nonPresetModalVisible = await evaluate(`!!document.querySelector('.pm-modal-overlay')`);
    if (!nonPresetModalVisible) throw new Error('Modal did not open for non-preset problem!');

    // Click '▶ Visualize in Java' (the exact line that previously crashed!)
    await evaluate(`document.querySelector('.pm-btn.pm-btn-primary')?.click()`);
    await sleep(1000);

    // Verify navigation to visualizer and code loaded without error
    const nonPresetVisualizerState = await evaluate(`({
      pathname: window.location.pathname,
      codeSnippet: window.__traceStore?.getState().code?.slice(0, 100),
      hasTrace: (window.__traceStore?.getState().trace?.length || 0) > 0,
      status: window.__traceStore?.getState().status
    })`);
    console.log('Non-Preset Visualizer State:', nonPresetVisualizerState);
    if (nonPresetVisualizerState.pathname !== '/') throw new Error('Did not navigate to / for non-preset problem!');
    if (!nonPresetVisualizerState.hasTrace) throw new Error('Trace did not execute for generated template!');

    await captureScreenshot('hardening7_non_preset_visualize.png');
    console.log('✓ SCENARIO 2 PASSED: Non-preset problem visualized with valid template and zero crashes!');

    console.log('\nBrowser Console Errors encountered:', consoleErrors.length);
    if (consoleErrors.length > 0) {
      console.warn('Console errors:', consoleErrors);
      throw new Error('Console errors encountered during E2E!');
    }

    console.log('\n========================================================');
    console.log('Hardening #7 Chrome CDP Browser E2E: ALL TESTS PASSED! 🚀');
    console.log('========================================================\n');

  } finally {
    ws.close();
    if (chromeProcess) {
      chromeProcess.kill();
    }
    if (tmpDir) {
      try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
    }
  }
}

runBrowserE2E().catch(err => {
  console.error('Browser E2E Failed:', err);
  process.exit(1);
});
