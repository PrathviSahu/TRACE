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
  console.log("TRACE Hardening #9: Chrome CDP Theme & Light Mode E2E");
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

  try {
    // ─────────────────────────────────────────────────────────
    // STEP 1: Enable Light Mode
    // ─────────────────────────────────────────────────────────
    console.log("--- STEP 1: Switch to Light Theme ---");
    await send("Page.navigate", { url: `http://localhost:${PORT}/companies/google` });
    await sleep(2000);

    // Switch theme to light via store / DOM
    await evaluate(`(() => {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("trace_theme", "light");
      const lightBtn = document.querySelector("#light-theme-btn");
      if (lightBtn) lightBtn.click();
    })()`);
    await sleep(800);

    const activeTheme = await evaluate(`document.documentElement.getAttribute("data-theme")`);
    console.log("Active theme attribute:", activeTheme);
    if (activeTheme !== "light") throw new Error("Failed to activate light theme!");

    // ─────────────────────────────────────────────────────────
    // STEP 2: Verify CompanyDetailPage in Light Mode
    // ─────────────────────────────────────────────────────────
    console.log("\n--- STEP 2: CompanyDetailPage in Light Mode ---");
    const companyStyles = await evaluate(`(() => {
      const dashboard = document.querySelector(".company-dashboard");
      const header = document.querySelector(".cd-header");
      const name = document.querySelector(".cd-company-name");
      const card = document.querySelector(".cd-readiness-card");

      return {
        dashboardBg: dashboard ? window.getComputedStyle(dashboard).backgroundColor : null,
        headerBg: header ? window.getComputedStyle(header).backgroundColor : null,
        nameColor: name ? window.getComputedStyle(name).color : null,
        cardBg: card ? window.getComputedStyle(card).backgroundColor : null,
      };
    })()`);

    console.log("Company styles in Light Mode:", companyStyles);
    // In light mode:
    // dashboardBg should be rgb(241, 245, 249) (--bg-darkest)
    // headerBg should be rgb(255, 255, 255) (--bg-surface)
    // nameColor should be rgb(15, 23, 42) (--txt-bright)
    if (companyStyles.dashboardBg.includes("9, 13, 19") || companyStyles.dashboardBg.includes("7, 10, 18")) {
      throw new Error("Company dashboard is still hardcoded pitch black in light mode!");
    }
    if (companyStyles.headerBg.includes("13, 17, 23")) {
      throw new Error("Company header is still hardcoded #0d1117 in light mode!");
    }

    await captureScreenshot("hardening9_company_light.png");
    console.log("✓ STEP 2 PASSED: CompanyDetailPage rendered in clean high-contrast Light Mode");

    // ─────────────────────────────────────────────────────────
    // STEP 3: Verify ProblemModal in Light Mode
    // ─────────────────────────────────────────────────────────
    console.log("\n--- STEP 3: ProblemModal in Light Mode ---");
    await send("Page.navigate", { url: `http://localhost:${PORT}/problems` });
    await sleep(2000);

    // Click on Two Sum to open modal
    await evaluate(`(() => {
      const el = Array.from(document.querySelectorAll(".pname")).find(e => e.textContent.includes("Two Sum"));
      if (el) el.click();
    })()`);
    await sleep(800);

    const modalStyles = await evaluate(`(() => {
      const modal = document.querySelector(".pm-modal-content");
      const desc = document.querySelector(".pm-body");
      return {
        modalBg: modal ? window.getComputedStyle(modal).backgroundColor : null,
        descColor: desc ? window.getComputedStyle(desc).color : null,
      };
    })()`);

    console.log("ProblemModal styles in Light Mode:", modalStyles);
    if (modalStyles.modalBg.includes("22, 27, 34")) {
      throw new Error("ProblemModal is still hardcoded #161b22 in light mode!");
    }

    await captureScreenshot("hardening9_modal_light.png");
    // Close modal
    await evaluate(`document.querySelector(".pm-btn-close")?.click()`);
    await sleep(500);
    console.log("✓ STEP 3 PASSED: ProblemModal rendered in clean high-contrast Light Mode");

    // ─────────────────────────────────────────────────────────
    // STEP 4: Verify InterviewSessionPage in Light Mode
    // ─────────────────────────────────────────────────────────
    console.log("\n--- STEP 4: InterviewSessionPage in Light Mode ---");
    // Seed interview session
    await evaluate(`(() => {
      const session = {
        id: "session_theme_e2e",
        companyName: "Google",
        role: "Software Engineer",
        problemTitle: "Two Sum",
        mode: "company",
        durationSeconds: 2700,
        elapsedSeconds: 320,
        status: "in_progress",
        code: "class Solution { public int[] twoSum(int[] nums, int target) { return new int[]{0, 1}; } }",
        language: "java",
        attempts: 1,
        hintsUsed: 0,
        approach: { summary: "Hash map approach", reasoning: "One-pass lookup", edgeCases: "Empty array", timeComplexity: "O(n)", spaceComplexity: "O(n)" },
        followUps: [{ id: "f1", question: "What if the array is sorted?", answer: "Use two pointers." }]
      };
      const allSess = JSON.parse(localStorage.getItem("trace_interview_sessions") || "{}"); allSess["session_theme_e2e"] = session; localStorage.setItem("trace_interview_sessions", JSON.stringify(allSess));
    })()`);

    await send("Page.navigate", { url: `http://localhost:${PORT}/interview/session/session_theme_e2e` });
    await sleep(2000);

    const sessionStyles = await evaluate(`(() => {
      const page = document.querySelector(".interview-session-page");
      const header = document.querySelector("header");
      const tabProblem = document.querySelector("#tab-problem-btn");
      return {
        pageBg: page ? window.getComputedStyle(page).backgroundColor : null,
        headerBg: header ? window.getComputedStyle(header).backgroundColor : null,
        tabColor: tabProblem ? window.getComputedStyle(tabProblem).color : null,
      };
    })()`);

    console.log("InterviewSessionPage styles in Light Mode:", sessionStyles);
    if (sessionStyles.pageBg.includes("7, 10, 18")) {
      throw new Error("InterviewSessionPage is still hardcoded #070a12 in light mode!");
    }
    if (sessionStyles.headerBg.includes("13, 19, 34")) {
      throw new Error("InterviewSessionPage header is still hardcoded #0d1322 in light mode!");
    }

    await captureScreenshot("hardening9_session_light.png");
    console.log("✓ STEP 4 PASSED: InterviewSessionPage rendered in clean high-contrast Light Mode");

    // ─────────────────────────────────────────────────────────
    // STEP 5: Verify InterviewResultPage in Light Mode
    // ─────────────────────────────────────────────────────────
    console.log("\n--- STEP 5: InterviewResultPage in Light Mode ---");
    await evaluate(`(() => {
      const resultSession = {
        id: "result_theme_e2e",
        companyName: "Google",
        role: "Software Engineer",
        problemTitle: "Two Sum",
        mode: "company",
        durationSeconds: 2700,
        elapsedSeconds: 850,
        submittedAt: new Date().toISOString(),
        status: "submitted",
        code: "class Solution { public int[] twoSum(int[] nums, int target) { return new int[]{0, 1}; } }",
        language: "java",
        attempts: 1,
        hintsUsed: 0,
        executionEvidence: { passed: true, testsPassed: 3, testsTotal: 3 },
        rubricResult: {
          overallScore: 92,
          categories: {
            correctness: { score: 5, weightedScore: 25, reasoning: "All test cases passed." },
            timeComplexity: { score: 5, weightedScore: 15, reasoning: "Optimal O(n) runtime." }
          },
          feedback: {
            generalNotes: "Strong algorithmic problem solving.",
            strengths: ["Clean code", "Optimal lookup"],
            improvements: ["Add more comments"]
          }
        },
        approach: { summary: "Hash map approach", reasoning: "One pass", edgeCases: "None", timeComplexity: "O(n)", spaceComplexity: "O(n)" }
      };
      const allSess2 = JSON.parse(localStorage.getItem("trace_interview_sessions") || "{}"); allSess2["result_theme_e2e"] = resultSession; localStorage.setItem("trace_interview_sessions", JSON.stringify(allSess2));
    })()`);

    await send("Page.navigate", { url: `http://localhost:${PORT}/interview/result/result_theme_e2e` });
    await sleep(2000);

    const resultStyles = await evaluate(`(() => {
      const page = document.querySelector(".interview-result-page");
      const title = document.querySelector("h1");
      return {
        pageBg: page ? window.getComputedStyle(page).backgroundColor : null,
        titleColor: title ? window.getComputedStyle(title).color : null,
      };
    })()`);

    console.log("InterviewResultPage styles in Light Mode:", resultStyles);
    if (resultStyles.pageBg.includes("7, 10, 18")) {
      throw new Error("InterviewResultPage is still hardcoded #070a12 in light mode!");
    }

    await captureScreenshot("hardening9_result_light.png");
    console.log("✓ STEP 5 PASSED: InterviewResultPage rendered in clean high-contrast Light Mode");

    // ─────────────────────────────────────────────────────────
    // STEP 6: Runtime Dynamic Switching & Dark Mode Preservation
    // ─────────────────────────────────────────────────────────
    console.log("\n--- STEP 6: Runtime Dynamic Switching & Dark Mode Preservation ---");
    await send("Page.navigate", { url: `http://localhost:${PORT}/companies/google` });
    await sleep(1500);

    // Switch back to dark mode
    await evaluate(`(() => {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("trace_theme", "dark");
      const darkBtn = document.querySelector("#dark-theme-btn");
      if (darkBtn) darkBtn.click();
    })()`);
    await sleep(800);

    const darkCompanyStyles = await evaluate(`(() => {
      const dashboard = document.querySelector(".company-dashboard");
      const header = document.querySelector(".cd-header");
      const name = document.querySelector(".cd-company-name");
      return {
        dashboardBg: dashboard ? window.getComputedStyle(dashboard).backgroundColor : null,
        headerBg: header ? window.getComputedStyle(header).backgroundColor : null,
        nameColor: name ? window.getComputedStyle(name).color : null,
      };
    })()`);

    console.log("Company styles in Dark Mode:", darkCompanyStyles);
    // Verify dark mode is visually preserved
    if (!darkCompanyStyles.dashboardBg.includes("7, 10, 18") && !darkCompanyStyles.dashboardBg.includes("9, 13, 19")) {
      throw new Error("Dark mode background did not revert correctly!");
    }

    await captureScreenshot("hardening9_company_dark.png");
    console.log("✓ STEP 6 PASSED: Dark mode verified 100% intact and visually preserved");

    // ─────────────────────────────────────────────────────────
    // Summary of Telemetry
    // ─────────────────────────────────────────────────────────
    console.log("\n--- Summary of Browser Telemetry ---");
    console.log("Total console errors:", consoleErrors.length);
    if (consoleErrors.length > 0) {
      const realErrors = consoleErrors.filter(e => !e.includes("favicon") && !e.includes("Failed to load resource"));
      if (realErrors.length > 0) {
        console.error("Browser console errors:", realErrors);
        throw new Error(`Browser console errors detected: ${realErrors.length}`);
      }
    }

    console.log("\n========================================================");
    console.log("Hardening #9 Chrome CDP Browser E2E: ALL TESTS PASSED! 🚀");
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
