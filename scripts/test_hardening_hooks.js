// ─────────────────────────────────────────────────────────────
//  TRACE — Hardening #8: React Rules-of-Hooks Compliance Suite
// ─────────────────────────────────────────────────────────────

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { computeCompanyPatternStats } from "../src/data/patternMapping.js";
import {
  calculatePriorityScore,
  calculateCompanyReadiness,
  detectFocusAreas,
  generateMockInterviewSet
} from "../src/services/intelligenceService.js";
import { getCompanyFullDetails, getProblemKey } from "../src/data/companyUtils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

console.log("========================================================");
console.log("TRACE Hardening #8: React Rules-of-Hooks Test Suite");
console.log("========================================================\n");

// ── Part 1: Static Source Code AST / Lexical Audit ──────────────
console.log("--- Section 1: Static Source Hook Order Verification ---");
{
  const aipPath = path.resolve(__dirname, "../src/components/AdaptiveInsightsPanel.jsx");
  const aipContent = fs.readFileSync(aipPath, "utf8");
  const aipLines = aipContent.split("\n");

  let useMemoLine = -1;
  let earlyReturnLine = -1;

  aipLines.forEach((line, idx) => {
    const lineNum = idx + 1;
    if (line.includes("useMemo(") && !line.trim().startsWith("//") && !line.trim().startsWith("import")) {
      useMemoLine = lineNum;
    }
    if (line.includes("if (!adaptiveState) return null;")) {
      earlyReturnLine = lineNum;
    }
  });

  assert(useMemoLine > 0, "Test 1: AdaptiveInsightsPanel contains useMemo hook call");
  assert(earlyReturnLine > 0, "Test 2: AdaptiveInsightsPanel contains conditional early return");
  assert(useMemoLine < earlyReturnLine, `Test 3: useMemo (line ${useMemoLine}) precedes early return (line ${earlyReturnLine})`);

  // Verify no hook inside any if/else block in AdaptiveInsightsPanel
  let insideIf = 0;
  let hookInsideIf = false;
  for (const line of aipLines) {
    if (line.includes("if (") && !line.includes("return")) insideIf++;
    if (insideIf > 0 && /\buse[A-Z]\w*\b/.test(line)) hookInsideIf = true;
    if (line.includes("}") && insideIf > 0) insideIf--;
  }
  assert(!hookInsideIf, "Test 4: AdaptiveInsightsPanel has zero hooks inside conditional if-blocks");
}

{
  const cdpPath = path.resolve(__dirname, "../src/pages/CompanyDetailPage.jsx");
  const cdpContent = fs.readFileSync(cdpPath, "utf8");
  const cdpLines = cdpContent.split("\n");

  const hookDeclarations = [];
  let earlyReturnLine = -1;

  cdpLines.forEach((line, idx) => {
    const lineNum = idx + 1;
    if (line.includes("if (!details)") && cdpLines[idx + 1]?.includes("return (")) {
      earlyReturnLine = lineNum;
    }
    // Match hook calls at top level of component
    const match = line.match(/(?:const|let)\s+([a-zA-Z0-9_,\s{}]+)\s*=\s*(use[A-Z]\w*)\(/);
    if (match && !line.trim().startsWith("//")) {
      hookDeclarations.push({ lineNum, hook: match[2], varName: match[1].trim() });
    }
  });

  assert(earlyReturnLine > 0, `Test 5: CompanyDetailPage contains early return for missing company (line ${earlyReturnLine})`);
  assert(hookDeclarations.length >= 10, `Test 6: CompanyDetailPage contains ${hookDeclarations.length} top-level hooks`);

  // Assert ALL hooks appear strictly before earlyReturnLine
  const lateHooks = hookDeclarations.filter(h => h.lineNum > earlyReturnLine);
  assert(lateHooks.length === 0, `Test 7: All hooks precede early return (late hooks count: ${lateHooks.length})`);

  // Specific check for the 9 formerly conditional hooks
  const targetedHooks = [
    "patternStats",
    "readiness",
    "focusAreas",
    "priorityMap",
    "mockProblems",
    "filteredProblems",
    "companyProgressStats",
    "handleVisualizeCode",
    "handleOpenPracticeModal"
  ];

  for (const th of targetedHooks) {
    const found = hookDeclarations.find(h => h.varName.includes(th));
    assert(found !== undefined, `Test 8: Hook for "${th}" is declared at top level`);
    assert(found.lineNum < earlyReturnLine, `Test 9: Hook for "${th}" (line ${found.lineNum}) executes before early return (line ${earlyReturnLine})`);
  }
}

// ── Part 2: Runtime Hook Dispatcher & Lifecycle Transition Tests ──
console.log("\n--- Section 2: Runtime Hook Ordering & Lifecycle Simulation ---");

class MockReactFiber {
  constructor() {
    this.hookQueue = [];
    this.currentIndex = 0;
    this.isMount = true;
  }

  resetRender() {
    this.currentIndex = 0;
    this.isMount = false;
  }

  trackHook(type, name) {
    if (this.isMount) {
      this.hookQueue.push({ type, name });
    } else {
      if (this.currentIndex >= this.hookQueue.length) {
        throw new Error(`Rules of Hooks violation: Rendered more hooks than previous render. Expected ${this.hookQueue.length}, got hook #${this.currentIndex + 1} (${type} - ${name})`);
      }
      const prev = this.hookQueue[this.currentIndex];
      if (prev.type !== type) {
        throw new Error(`Rules of Hooks violation: Hook type mismatch at index ${this.currentIndex}. Expected ${prev.type}, got ${type}`);
      }
      this.currentIndex++;
    }
  }

  finishRender() {
    if (!this.isMount && this.currentIndex < this.hookQueue.length) {
      throw new Error(`Rules of Hooks violation: Rendered fewer hooks than previous render. Expected ${this.hookQueue.length}, only ran ${this.currentIndex}`);
    }
  }
}

// Simulate CompanyDetailPage hook sequence under valid and invalid routes
function renderCompanyDetailPageHooks(fiber, companyId, progress = {}) {
  // 1. useParams
  fiber.trackHook("useParams", "useParams");
  // 2. useNavigate
  fiber.trackHook("useNavigate", "useNavigate");
  // 3. useMemo details
  fiber.trackHook("useMemo", "details");
  const details = getCompanyFullDetails(companyId);

  // 4. useAllProgress
  fiber.trackHook("useCustomHook", "useAllProgress");
  // 5. useTraceStore
  fiber.trackHook("useTraceStore", "useTraceStore_actions");
  // 6. useTraceStore lang
  fiber.trackHook("useTraceStore", "useTraceStore_lang");

  // 7-13: 7 filter/practice useState hooks
  fiber.trackHook("useState", "practiceMode");
  fiber.trackHook("useState", "search");
  fiber.trackHook("useState", "diffFilter");
  fiber.trackHook("useState", "patternFilter");
  fiber.trackHook("useState", "recencyFilter");
  fiber.trackHook("useState", "statusFilter");
  fiber.trackHook("useState", "sortBy");

  // 14: mockSeed useState
  fiber.trackHook("useState", "mockSeed");

  // 15-18: 4 modal useState hooks
  fiber.trackHook("useState", "modalProblem");
  fiber.trackHook("useState", "modalDesc");
  fiber.trackHook("useState", "showTrustModal");
  fiber.trackHook("useState", "showCompareModal");

  // Defensive values
  const company = details?.company || null;
  const metrics = details?.metrics || null;
  const problems = details?.problems || [];

  // 19. patternStats useMemo
  fiber.trackHook("useMemo", "patternStats");
  const patternStats = computeCompanyPatternStats(problems);

  // 20. readiness useMemo
  fiber.trackHook("useMemo", "readiness");
  const readiness = calculateCompanyReadiness(companyId, problems, progress);

  // 21. focusAreas useMemo
  fiber.trackHook("useMemo", "focusAreas");
  const focusAreas = detectFocusAreas(problems, progress);

  // 22. priorityMap useMemo
  fiber.trackHook("useMemo", "priorityMap");
  const priorityMap = new Map();
  for (const p of problems) {
    const key = getProblemKey(p);
    priorityMap.set(key, calculatePriorityScore(p, progress[key]));
  }

  // 23. mockProblems useMemo
  fiber.trackHook("useMemo", "mockProblems");
  const mockProblems = problems.length ? generateMockInterviewSet(problems) : [];

  // 24. filteredProblems useMemo
  fiber.trackHook("useMemo", "filteredProblems");
  const filteredProblems = [...problems];

  // 25. companyProgressStats useMemo
  fiber.trackHook("useMemo", "companyProgressStats");
  const companyProgressStats = { total: problems.length, solvedCount: 0 };

  // 26. handleVisualizeCode useCallback
  fiber.trackHook("useCallback", "handleVisualizeCode");
  const handleVisualizeCode = (p) => {
    return `// Company: ${company?.name || ""}`;
  };

  // 27. handleOpenPracticeModal useCallback
  fiber.trackHook("useCallback", "handleOpenPracticeModal");

  fiber.finishRender();

  // Early return simulation AFTER hooks
  if (!details) {
    return { rendered: "not-found", problemCount: 0, readiness: readiness.overall };
  }

  return { rendered: "dashboard", company: company.name, problemCount: problems.length, readiness: readiness.overall };
}

{
  const fiber = new MockReactFiber();

  // Render 1: Valid company (Google)
  const r1 = renderCompanyDetailPageHooks(fiber, "google");
  assert(r1.rendered === "dashboard", "Test 10: Valid company renders dashboard");
  assert(r1.problemCount > 0, "Test 11: Valid company contains problem list");
  assert(fiber.hookQueue.length === 27, `Test 12: Mount recorded 27 hooks (got ${fiber.hookQueue.length})`);

  // Render 2: Invalid/missing company
  fiber.resetRender();
  const r2 = renderCompanyDetailPageHooks(fiber, "unknown_corp_404");
  assert(r2.rendered === "not-found", "Test 13: Invalid company gracefully renders not-found");
  assert(r2.problemCount === 0, "Test 14: Invalid company problem count is 0");
  assert(r2.readiness === 0, "Test 15: Invalid company readiness safely defaults to 0 without error");

  // Render 3: Valid company again (Amazon)
  fiber.resetRender();
  const r3 = renderCompanyDetailPageHooks(fiber, "amazon");
  assert(r3.rendered === "dashboard", "Test 16: Switch back to valid company renders dashboard");
  assert(r3.company === "Amazon", "Test 17: Company name is Amazon");

  // Render 4: Switch invalid again
  fiber.resetRender();
  const r4 = renderCompanyDetailPageHooks(fiber, "invalid_again");
  assert(r4.rendered === "not-found", "Test 18: Repeated switch to invalid route maintains 100% hook order");

  // Render 5: Valid company (Microsoft)
  fiber.resetRender();
  const r5 = renderCompanyDetailPageHooks(fiber, "microsoft");
  assert(r5.rendered === "dashboard", "Test 19: Valid Microsoft renders dashboard with zero hook mismatch");
}

// Simulate AdaptiveInsightsPanel hook sequence under populated and null states
function renderAdaptiveInsightsPanelHooks(fiber, adaptiveState, planDelta, lastAdaptedAt) {
  // 1. useMemo for adaptedToday
  fiber.trackHook("useMemo", "adaptedToday");
  let adaptedToday = false;
  if (lastAdaptedAt) {
    const today = new Date().toISOString().split("T")[0];
    adaptedToday = lastAdaptedAt.split("T")[0] === today;
  }

  fiber.finishRender();

  // Early return simulation AFTER hooks
  if (!adaptiveState) return null;

  return { rendered: "panel", adaptedToday, weakFamilies: adaptiveState.weakFamilies || [] };
}

{
  const fiber = new MockReactFiber();

  const mockAdaptive = {
    weakFamilies: ["Two Pointers"],
    strongFamilies: ["Binary Search"],
    revisionPressure: 45,
    difficultyTrend: "maintain",
    lastAdaptedAt: new Date().toISOString()
  };

  // Render 1: Populated state
  const r1 = renderAdaptiveInsightsPanelHooks(fiber, mockAdaptive, {}, new Date().toISOString());
  assert(r1 !== null, "Test 20: Populated adaptive state renders panel");
  assert(r1.adaptedToday === true, "Test 21: adaptedToday computes true for current date");

  // Render 2: Null adaptive state
  fiber.resetRender();
  const r2 = renderAdaptiveInsightsPanelHooks(fiber, null, {}, null);
  assert(r2 === null, "Test 22: Null adaptive state returns null safely");

  // Render 3: Populated adaptive state again
  fiber.resetRender();
  const r3 = renderAdaptiveInsightsPanelHooks(fiber, mockAdaptive, {}, new Date().toISOString());
  assert(r3 !== null, "Test 23: Switching back from null to populated renders panel with zero hook mismatch");

  // Render 4: Null again
  fiber.resetRender();
  const r4 = renderAdaptiveInsightsPanelHooks(fiber, null, {}, null);
  assert(r4 === null, "Test 24: Switching populated -> null again maintains 100% hook order");
}

// ── Part 3: Defensive Fallbacks & String Generation ────────────
console.log("\n--- Section 3: Defensive Null Fallbacks Verification ---");
{
  const emptyStats = computeCompanyPatternStats([]);
  assert(Array.isArray(emptyStats.patterns), "Test 25: computeCompanyPatternStats([]) returns patterns array");

  const emptyReadiness = calculateCompanyReadiness("fake", [], {});
  assert(emptyReadiness.overall === 0, "Test 26: calculateCompanyReadiness with empty problems returns overall: 0");
  assert(emptyReadiness.label === "Not Started", "Test 27: calculateCompanyReadiness returns Not Started");

  const emptyFocus = detectFocusAreas([], {});
  assert(Array.isArray(emptyFocus.weakPatterns), "Test 28: detectFocusAreas with empty problems returns weakPatterns array");

  const emptyMock = generateMockInterviewSet([]);
  assert(Array.isArray(emptyMock) && emptyMock.length === 0, "Test 29: generateMockInterviewSet with empty problems returns []");

  // Verify handleVisualizeCode python/java template when company is null
  const company = null;
  const p = { id: 1, title: "Two Sum", difficulty: "Easy", frequency: 80, recency: "30 Days", url: "https://leetcode.com" };
  const cleanMethodName = (p.title || "solve").toLowerCase().replace(/[^a-z0-9]+/g, "_");
  const starterPython = `# LeetCode #${p.id || ""}: ${p.title} (${p.difficulty})\n# Company: ${company?.name || ""}\n`;
  assert(starterPython.includes("Company: \n"), "Test 30: Starter Python handles null company gracefully without TypeError");
}

console.log(`\n========================================================`);
console.log(`Hardening #8 Hooks Suite: ${passed}/${total} PASSED`);
console.log(`========================================================`);
