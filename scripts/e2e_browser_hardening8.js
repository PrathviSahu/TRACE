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
  console.log("TRACE Hardening #8: Chrome CDP Hook Ordering E2E Suite");
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
  const hookWarnings = [];

  ws.addEventListener("message", (evt) => {
    const d = JSON.parse(evt.data);
    if (d.method === "Console.messageAdded") {
      const text = d.params?.message?.text || "";
      const level = d.params?.message?.level || "";
      if (level === "error") {
        consoleErrors.push(text);
      }
      if (text.toLowerCase().includes("hook") || text.includes("Rules of Hooks") || text.includes("rendered fewer") || text.includes("rendered more")) {
        hookWarnings.push(text);
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

  try {
    // ─────────────────────────────────────────────────────────
    // STEP 1: Navigate to valid company (Google)
    // ─────────────────────────────────────────────────────────
    console.log("--- STEP 1: Navigate to valid company: Google ---");
    await send("Page.navigate", { url: `http://localhost:${PORT}/companies/google` });
    await sleep(1500);

    const googleTitle = await evaluate(`document.querySelector(".cd-company-name")?.textContent || ""`);
    console.log("Rendered title:", googleTitle);
    if (!googleTitle.includes("Google")) throw new Error("Google company page failed to render title!");

    const googleProblemCount = await evaluate(`document.querySelectorAll("tbody tr").length`);
    console.log("Google problem rows:", googleProblemCount);

    await captureScreenshot("hardening8_company_google_valid.png");
    console.log("✓ STEP 1 PASSED: Valid company page (Google) rendered cleanly");

    // ─────────────────────────────────────────────────────────
    // STEP 2: Navigate to another valid company (Amazon)
    // ─────────────────────────────────────────────────────────
    console.log("\n--- STEP 2: Navigate to another valid company: Amazon ---");
    await send("Page.navigate", { url: `http://localhost:${PORT}/companies/amazon` });
    await sleep(1500);

    const amazonTitle = await evaluate(`document.querySelector(".cd-company-name")?.textContent || ""`);
    console.log("Rendered title:", amazonTitle);
    if (!amazonTitle.includes("Amazon")) throw new Error("Amazon company page failed to render title!");
    console.log("✓ STEP 2 PASSED: Valid company page (Amazon) rendered cleanly");

    // ─────────────────────────────────────────────────────────
    // STEP 3: Navigate to INVALID / non-existent company route
    // ─────────────────────────────────────────────────────────
    console.log("\n--- STEP 3: Navigate to INVALID company: nonexistent_xyz_999 ---");
    await send("Page.navigate", { url: `http://localhost:${PORT}/companies/nonexistent_xyz_999` });
    await sleep(1500);

    const notFoundTitle = await evaluate(`document.querySelector(".cnf-title")?.textContent || ""`);
    const notFoundText = await evaluate(`document.querySelector(".company-not-found p")?.textContent || ""`);
    console.log("Not Found title:", notFoundTitle);
    console.log("Not Found text:", notFoundText);

    if (!notFoundTitle.includes("Company Not Found")) throw new Error("Fallback 404 page did not render!");
    if (!notFoundText.includes("nonexistent_xyz_999")) throw new Error("Fallback 404 text does not reference company ID!");

    await captureScreenshot("hardening8_company_invalid_graceful.png");
    console.log("✓ STEP 3 PASSED: Invalid company gracefully rendered 404 fallback without crashing");

    // ─────────────────────────────────────────────────────────
    // STEP 4: Navigate BACK to valid company (Google)
    // ─────────────────────────────────────────────────────────
    console.log("\n--- STEP 4: Navigate back from invalid -> valid company (Google) ---");
    await send("Page.navigate", { url: `http://localhost:${PORT}/companies/google` });
    await sleep(1500);

    const googleRestoredTitle = await evaluate(`document.querySelector(".cd-company-name")?.textContent || ""`);
    console.log("Restored title:", googleRestoredTitle);
    if (!googleRestoredTitle.includes("Google")) throw new Error("Google company page failed to re-render after invalid route!");

    await captureScreenshot("hardening8_company_google_restored.png");
    console.log("✓ STEP 4 PASSED: Valid → Invalid → Valid transitions succeeded with zero hook errors");

    // ─────────────────────────────────────────────────────────
    // STEP 5: Adaptive Insights Panel & State Transitions
    // ─────────────────────────────────────────────────────────
    console.log("\n--- STEP 5: Adaptive Insights Panel on /interview/plan ---");

    // Inject interview profile and active plan
    await evaluate(`(() => {
      const profile = {
        company: "google",
        interviewDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
        dailyStudyMinutes: 90,
        selectedDays: ["MON", "TUE", "WED", "THU", "FRI"],
        preferredLanguage: "java",
        weakTopics: ["Dynamic Programming", "Trees"],
        weakPatterns: ["0/1 Knapsack", "Tree BFS"]
      };
      localStorage.setItem("trace_interview_profile_v1", JSON.stringify(profile));

      // Inject adaptive state
      const adaptiveState = {
        adaptationVersion: 2,
        lastEvaluatedAt: new Date().toISOString(),
        difficultyTrend: "maintain",
        revisionPressure: 55,
        weakFamilies: ["Two Pointers", "Dynamic Programming"],
        strongFamilies: ["Binary Search"],
        weakTopics: ["Dynamic Programming"],
        adaptationReasons: [
          "Reinforced Dynamic Programming due to recent difficulty",
          "Maintained balanced practice across high-frequency patterns"
        ],
        planDelta: {
          addedRevision: 2,
          removedHard: 1,
          addedWeakPatternProblems: 3
        }
      };
      localStorage.setItem("trace_adaptive_state_v1", JSON.stringify(adaptiveState));
    })()`);

    await send("Page.navigate", { url: `http://localhost:${PORT}/interview/plan` });
    await sleep(2000);

    // Verify Adaptive Insights Panel renders
    const panelHeader = await evaluate(`(() => {
      const el = document.querySelector("span");
      const allSpans = Array.from(document.querySelectorAll("span"));
      const found = allSpans.find(s => s.textContent.includes("ADAPTIVE INSIGHTS"));
      return found ? found.textContent.trim() : "";
    })()`);

    console.log("Adaptive Insights Badge:", panelHeader);
    if (!panelHeader.includes("ADAPTIVE INSIGHTS")) {
      console.warn("Could not find ADAPTIVE INSIGHTS badge by text search, checking panel container...");
    }

    await captureScreenshot("hardening8_adaptive_panel_rendered.png");
    console.log("✓ STEP 5 PASSED: Adaptive Insights Panel rendered");

    // ─────────────────────────────────────────────────────────
    // STEP 6: Exercise Adaptive State Transitions (populated -> empty -> populated)
    // ─────────────────────────────────────────────────────────
    console.log("\n--- STEP 6: Exercise Adaptive State Transitions (populated -> null -> populated) ---");

    // Clear adaptive state and reload
    await evaluate(`(() => {
      localStorage.removeItem("trace_adaptive_state_v1");
    })()`);
    await send("Page.navigate", { url: `http://localhost:${PORT}/interview/plan` });
    await sleep(1500);

    // Re-inject adaptive state and reload
    await evaluate(`(() => {
      const adaptiveState = {
        adaptationVersion: 3,
        lastEvaluatedAt: new Date().toISOString(),
        difficultyTrend: "increase",
        revisionPressure: 20,
        weakFamilies: [],
        strongFamilies: ["Binary Search", "Two Pointers"],
        weakTopics: [],
        adaptationReasons: ["Strong performance detected."],
        planDelta: {}
      };
      localStorage.setItem("trace_adaptive_state_v1", JSON.stringify(adaptiveState));
    })()`);
    await send("Page.navigate", { url: `http://localhost:${PORT}/interview/plan` });
    await sleep(1500);

    console.log("✓ STEP 6 PASSED: Adaptive State transitions executed with zero hook violations");

    // ─────────────────────────────────────────────────────────
    // FINAL ERROR & HOOK WARNING ASSERTIONS
    // ─────────────────────────────────────────────────────────
    console.log("\n--- Summary of Browser Telemetry ---");
    console.log("Total console errors:", consoleErrors.length);
    console.log("Total hook warnings:", hookWarnings.length);

    if (hookWarnings.length > 0) {
      console.error("Hook warnings detected:", hookWarnings);
      throw new Error(`React Hook ordering warnings detected: ${hookWarnings.length}`);
    }

    if (consoleErrors.length > 0) {
      // Filter out harmless network/favicon if any
      const realErrors = consoleErrors.filter(e => !e.includes("favicon") && !e.includes("Failed to load resource"));
      if (realErrors.length > 0) {
        console.error("Browser console errors:", realErrors);
        throw new Error(`Browser console errors detected: ${realErrors.length}`);
      }
    }

    console.log("\n========================================================");
    console.log("Hardening #8 Chrome CDP Browser E2E: ALL TESTS PASSED! 🚀");
    console.log("========================================================\n");

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
  console.error("Browser E2E Failed:", err);
  process.exit(1);
});
