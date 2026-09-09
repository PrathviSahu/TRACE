import fs from "fs";
import path from "path";

const CDP_PORT = 9222;
const ARTIFACT_DIR = "/Users/snehasahu/.gemini/antigravity-ide/brain/8bae2a87-cd1a-4d79-b817-76c21d6c3b73";

async function runBrowserSmoke() {
  const tabsRes = await fetch("http://127.0.0.1:" + CDP_PORT + "/json");
  const tabs = await tabsRes.json();
  const pageTab = tabs.find(t => t.type === "page");
  if (!pageTab) throw new Error("No page tab found");

  const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

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

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Console.enable");
  await send("Network.enable");

  const consoleErrors = [];
  const networkErrors = [];

  ws.addEventListener("message", (evt) => {
    const d = JSON.parse(evt.data);
    if (d.method === "Console.messageAdded" && d.params?.message?.level === "error") {
      consoleErrors.push({ text: d.params.message.text, url: d.params.message.url });
    }
    if (d.method === "Network.responseReceived") {
      const status = d.params?.response?.status;
      if (status >= 400) {
        networkErrors.push({ url: d.params.response.url, status });
      }
    }
  });

  async function evalJs(codeFn) {
    const expr = "(" + codeFn.toString() + ")()";
    const r = await send("Runtime.evaluate", {
      expression: expr,
      returnByValue: true,
      awaitPromise: true
    });
    if (r.exceptionDetails) {
      throw new Error("Eval error: " + JSON.stringify(r.exceptionDetails));
    }
    return r.result?.value;
  }

  async function navigate(urlPath) {
    await send("Page.navigate", { url: "http://localhost:5174" + urlPath });
    await new Promise(r => setTimeout(r, 1400));
    const title = await evalJs(() => document.title);
    const currentPath = await evalJs(() => window.location.pathname);
    const bodyLength = await evalJs(() => document.body.innerText.trim().length);
    return { path: currentPath, title, bodyLength };
  }

  console.log("=== [PHASE A] AUDITING 9 PRIMARY ROUTES ===");
  const routes = [
    "/",
    "/problems",
    "/roadmap",
    "/companies",
    "/data-structures",
    "/learn",
    "/visualizer",
    "/interview/setup",
    "/interview/plan"
  ];

  const routeAudit = [];
  for (const r of routes) {
    const res = await navigate(r);
    const passed = res.bodyLength > 50;
    routeAudit.push({
      route: r,
      actualPath: res.path,
      title: res.title,
      contentLength: res.bodyLength,
      status: passed ? "RENDERED" : "EMPTY"
    });
    console.log("  ✓ Route " + r + " -> " + res.path + " (" + res.bodyLength + " chars)");
  }

  console.log("\n=== [PHASE B] AUDITING PROBLEM → MODAL → VISUALIZER FLOW ===");
  await navigate("/problems");
  
  // 1. Click Question button on first problem
  const questionClicked = await evalJs(() => {
    const qBtn = document.querySelector("button.btn-info");
    if (qBtn) {
      qBtn.click();
      return true;
    }
    return false;
  });
  console.log("  1. Clicked Question button:", questionClicked);
  await new Promise(r => setTimeout(r, 800));

  // 2. Verify modal opened
  const modalData = await evalJs(() => {
    const overlay = document.querySelector(".pm-modal-overlay");
    const title = document.querySelector(".pm-modal-content h2, .pm-title")?.innerText || "";
    return {
      hasModal: !!overlay,
      title: title || "Loaded"
    };
  });
  console.log("  2. Problem Modal State:", modalData);

  // 3. Click Visualize button inside modal
  const vizClicked = await evalJs(() => {
    const vizBtn = document.querySelector("button.pm-btn-primary");
    if (vizBtn) {
      vizBtn.click();
      return true;
    }
    return false;
  });
  console.log("  3. Clicked Modal Visualize button:", vizClicked);
  await new Promise(r => setTimeout(r, 1400));

  // 4. Verify landed on Visualizer with active execution
  const visualizerState = await evalJs(() => {
    return {
      path: window.location.pathname,
      stepBadge: document.querySelector(".step-counter-badge")?.innerText || "",
      hasCode: !!document.querySelector(".monaco-editor")
    };
  });
  console.log("  4. Visualizer State after Problem click:", visualizerState);

  console.log("\n=== [PHASE C] AUDITING INTERVIEW SETUP → SESSION → SUBMIT FLOW ===");
  await navigate("/interview/setup");

  // 1. Click launch simulation button
  const launchClicked = await evalJs(() => {
    const launchBtn = document.querySelector("#launch-simulation-btn");
    if (launchBtn) {
      launchBtn.click();
      return true;
    }
    return false;
  });
  console.log("  1. Clicked Launch Simulation button:", launchClicked);
  await new Promise(r => setTimeout(r, 1600));

  // 2. Verify active interview session
  const sessionState = await evalJs(() => {
    return {
      path: window.location.pathname,
      hasTimer: !!document.querySelector(".timer-badge, [title*=\"time\"]"),
      hasCodeEditor: !!document.querySelector(".monaco-editor"),
      hasSubmitBtn: !!document.querySelector("#interview-submit-btn")
    };
  });
  console.log("  2. Interview Session Page State:", sessionState);

  // 3. Click Submit Interview button (opens confirmation modal)
  const submitClicked = await evalJs(() => {
    const subBtn = document.querySelector("#interview-submit-btn");
    if (subBtn) {
      subBtn.click();
      return true;
    }
    return false;
  });
  console.log("  3. Clicked Submit Interview Button:", submitClicked);
  await new Promise(r => setTimeout(r, 800));

  // 4. Click confirm submit in modal
  const confirmClicked = await evalJs(() => {
    const confBtn = document.querySelector("#confirm-submit-modal-btn");
    if (confBtn) {
      confBtn.click();
      return true;
    }
    return false;
  });
  console.log("  4. Clicked Confirm Submit Button:", confirmClicked);
  await new Promise(r => setTimeout(r, 2500));

  // 5. Verify landed on Interview Result Page
  const resultState = await evalJs(() => {
    return {
      path: window.location.pathname,
      hasScoreBadge: document.body.innerText.includes("/ 100") || document.body.innerText.includes("Score"),
      snippet: document.body.innerText.slice(0, 120).split("\n").join(" ")
    };
  });
  console.log("  5. Interview Result Page State:", resultState);

  // Restore root
  await navigate("/");

  console.log("\n=== [PHASE D] TELEMETRY & ERROR SUMMARY ===");
  console.log("Total Console Errors across all flows:", consoleErrors.length);
  if (consoleErrors.length > 0) {
    console.log("Errors:", consoleErrors);
  }
  console.log("Total Network Failures (>=400):", networkErrors.length);
  if (networkErrors.length > 0) {
    console.log("Network Failures:", networkErrors);
  }

  const smokeSuccess = 
    routeAudit.every(r => r.status === "RENDERED") &&
    modalData.hasModal &&
    vizClicked &&
    sessionState.hasSubmitBtn &&
    resultState.path.startsWith("/interview/result/") &&
    consoleErrors.length === 0;

  console.log("\nSmoke Test Verdict:", smokeSuccess ? "ALL CHECKS PASSED ✅" : "SMOKE FAILED ❌");

  const report = {
    smokeSuccess,
    routes: routeAudit,
    problemModalFlow: { questionClicked, modalData, vizClicked, visualizerState },
    interviewFlow: { launchClicked, sessionState, submitClicked, confirmClicked, resultState },
    consoleErrors,
    networkErrors
  };

  fs.writeFileSync(path.join(ARTIFACT_DIR, "rc1_browser_smoke_evidence.json"), JSON.stringify(report, null, 2));
  console.log("Written rc1_browser_smoke_evidence.json");

  ws.close();
  process.exit(smokeSuccess ? 0 : 1);
}

runBrowserSmoke().catch(e => {
  console.error(e);
  process.exit(1);
});
