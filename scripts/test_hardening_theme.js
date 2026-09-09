// ─────────────────────────────────────────────────────────────
//  TRACE — Hardening #9: Light Mode & Theme Consistency Suite
// ─────────────────────────────────────────────────────────────

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getProblemTemplate } from "../src/data/problemTemplates.js";
import { sanitizeHtml } from "../src/utils/sanitize.js";

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
console.log("TRACE Hardening #9: Light Mode & Theme Consistency Suite");
console.log("========================================================\n");

// ── Test 1: Verify Presence of Target Components ───────────────
console.log("--- Section 1: Component File Existence & Integrity ---");
const files = {
  companyDetail: path.resolve(__dirname, "../src/pages/CompanyDetailPage.jsx"),
  problemModal: path.resolve(__dirname, "../src/components/ProblemModal.jsx"),
  interviewSession: path.resolve(__dirname, "../src/pages/InterviewSessionPage.jsx"),
  interviewResult: path.resolve(__dirname, "../src/pages/InterviewResultPage.jsx"),
  indexCss: path.resolve(__dirname, "../src/index.css")
};

for (const [key, filePath] of Object.entries(files)) {
  assert(fs.existsSync(filePath), `Test 1: Target file exists: ${path.basename(filePath)}`);
}

// ── Test 2: Global Theme Tokens Definition in index.css ───────
console.log("\n--- Section 2: Established Theme System Architecture ---");
const indexCss = fs.readFileSync(files.indexCss, "utf8");
assert(indexCss.includes("--bg-darkest:"), "Test 2: index.css defines --bg-darkest token");
assert(indexCss.includes("--bg-surface:"), "Test 2: index.css defines --bg-surface token");
assert(indexCss.includes("--bg-main:"), "Test 2: index.css defines --bg-main token");
assert(indexCss.includes("--txt-bright:"), "Test 2: index.css defines --txt-bright token");
assert(indexCss.includes("--txt-main:"), "Test 2: index.css defines --txt-main token");
assert(indexCss.includes("--txt-muted:"), "Test 2: index.css defines --txt-muted token");
assert(indexCss.includes("[data-theme=\"light\"]"), "Test 2: index.css contains [data-theme=\"light\"] token overrides");
assert(indexCss.includes("--bg-surface: #ffffff;"), "Test 2: Clean Slate Light defines pure white surface token");

// ── Test 3: CompanyDetailPage Theme Token Integration ─────────
console.log("\n--- Section 3: CompanyDetailPage Theming Audit ---");
const cdpContent = fs.readFileSync(files.companyDetail, "utf8");

// Assert dashboard and header use theme tokens
assert(cdpContent.includes("background: var(--bg-darkest"), "Test 3: .company-dashboard uses var(--bg-darkest)");
assert(cdpContent.includes("color: var(--txt-main"), "Test 3: .company-dashboard uses var(--txt-main)");
assert(cdpContent.includes("background: var(--bg-surface"), "Test 3: .cd-header uses var(--bg-surface)");
assert(cdpContent.includes(".cd-readiness-card {\n          background: var(--bg-surface"), "Test 3: .cd-readiness-card uses var(--bg-surface)");
assert(cdpContent.includes("background: var(--bg-main"), "Test 3: .cd-input and .cd-select use var(--bg-main)");
assert(cdpContent.includes("color: var(--txt-bright"), "Test 3: .cd-company-name uses var(--txt-bright)");
assert(cdpContent.includes("color: var(--txt-muted"), "Test 3: .cd-breadcrumb uses var(--txt-muted)");

// Assert no hardcoded pitch-black surfaces on main wrappers
assert(!cdpContent.includes("background: #090d13;"), "Test 4: .company-dashboard no longer has hardcoded #090d13 background");
assert(!cdpContent.includes("background: #0d1117;\n            color: #c9d1d9;"), "Test 4: .company-not-found no longer has hardcoded #0d1117 background");

// ── Test 4: ProblemModal Theme Token Integration ───────────────
console.log("\n--- Section 4: ProblemModal Theming Audit ---");
const pmContent = fs.readFileSync(files.problemModal, "utf8");

assert(pmContent.includes("var(--bg-surface, #161b22)"), "Test 5: ProblemModal card uses var(--bg-surface) with dark fallback");
assert(pmContent.includes(".code-block { background:var(--bg-darkest"), "Test 5: .code-block uses var(--bg-darkest)");
assert(pmContent.includes(".pm-example { background: var(--bg-darkest"), "Test 5: .pm-example uses var(--bg-darkest)");
assert(pmContent.includes("var(--bg-main, #0d1117)"), "Test 5: Status/confidence dropdowns use var(--bg-main)");
assert(pmContent.includes("color:var(--txt-main"), "Test 5: Code and hint text use var(--txt-main)");

// Assert Hardening #2 XSS sanitizeHtml intact
assert(pmContent.includes("dangerouslySetInnerHTML={{ __html: sanitizeHtml(desc.description) }}"), "Test 6: DOMPurify XSS sanitization intact in ProblemModal");

// Assert Hardening #7 ProblemModal template contract intact
assert(pmContent.includes("getProblemTemplate(problem)"), "Test 7: ProblemModal template contract intact");

// Test runtime behavior of sanitizeHtml and getProblemTemplate
{
  const clean = sanitizeHtml("<script>alert('xss')</script><b>Clean</b>");
  assert(!clean.includes("<script>"), "Test 8: sanitizeHtml strips script tags");
  assert(clean.includes("<b>Clean</b>"), "Test 8: sanitizeHtml preserves legitimate tags");

  const template = getProblemTemplate({ id: 1, name: "Two Sum", difficulty: "Easy" });
  assert(template.isPreset === true, "Test 9: getProblemTemplate resolves preset Two Sum");
  assert(template.code.includes("class Solution"), "Test 9: getProblemTemplate generates valid solution class");
}

// ── Test 5: InterviewSessionPage Theming Audit ─────────────────
console.log("\n--- Section 5: InterviewSessionPage Theming Audit ---");
const isContent = fs.readFileSync(files.interviewSession, "utf8");

assert(isContent.includes('background: "var(--bg-darkest, #070a12)"'), "Test 10: InterviewSessionPage wrapper uses var(--bg-darkest)");
assert(isContent.includes('background: "var(--bg-surface, #0d1322)"'), "Test 10: Top bar header uses var(--bg-surface)");
assert(isContent.includes('background: "var(--bg-main, #0a0e1a)"'), "Test 10: Left panel problem container uses var(--bg-main)");
assert(isContent.includes('activeTab === "problem" ? "var(--bg-main, #0a0e1a)" : "transparent"'), "Test 10: Active tab button uses var(--bg-main)");
assert(isContent.includes('activeTab === "problem" ? "var(--txt-bright, #f8fafc)" : "var(--txt-muted, #94a3b8)"'), "Test 10: Tab typography uses var(--txt-bright) and var(--txt-muted)");

// ── Test 6: InterviewResultPage Theming Audit ──────────────────
console.log("\n--- Section 6: InterviewResultPage Theming Audit ---");
const irContent = fs.readFileSync(files.interviewResult, "utf8");

assert(irContent.includes('background: "var(--bg-darkest, #070a12)"'), "Test 11: InterviewResultPage wrapper uses var(--bg-darkest)");
assert(irContent.includes('color: "var(--txt-main, #e2e8f0)"'), "Test 11: InterviewResultPage typography uses var(--txt-main)");
assert(irContent.includes('background: "var(--bg-surface, #0d1322)"'), "Test 11: Header stats cards use var(--bg-surface)");
assert(irContent.includes('activeReviewTab === "rubric" ? "var(--bg-surface, #161f36)" : "transparent"'), "Test 11: Active review tab uses var(--bg-surface)");
assert(irContent.includes('background: "var(--bg-darkest, #080c16)"'), "Test 11: Code review and evidence container uses var(--bg-darkest)");

// ── Test 7: Subpanels Theming Audit ────────────────────────────
console.log("\n--- Section 7: Subpanels Theming Audit ---");
const problemPanel = fs.readFileSync(path.resolve(__dirname, "../src/components/interview/InterviewProblemPanel.jsx"), "utf8");
assert(problemPanel.includes("var(--bg-surface, #0d1322)"), "Test 12: InterviewProblemPanel uses var(--bg-surface)");
assert(problemPanel.includes("var(--bg-darkest, #080c16)"), "Test 12: InterviewProblemPanel examples use var(--bg-darkest)");

const rubricPanel = fs.readFileSync(path.resolve(__dirname, "../src/components/interview/InterviewRubricPanel.jsx"), "utf8");
assert(rubricPanel.includes("var(--bg-surface, #0d1322)"), "Test 13: InterviewRubricPanel category cards use var(--bg-surface)");
assert(rubricPanel.includes("var(--bg-darkest, #080c16)"), "Test 13: InterviewRubricPanel stats strip uses var(--bg-darkest)");

const approachPanel = fs.readFileSync(path.resolve(__dirname, "../src/components/interview/InterviewApproachPanel.jsx"), "utf8");
assert(approachPanel.includes("var(--bg-surface, #080c16)"), "Test 14: InterviewApproachPanel textareas use var(--bg-surface)");

const followupPanel = fs.readFileSync(path.resolve(__dirname, "../src/components/interview/InterviewFollowupPanel.jsx"), "utf8");
assert(followupPanel.includes("var(--bg-surface, #080c16)"), "Test 15: InterviewFollowupPanel card uses var(--bg-surface)");

// ── Test 8: Zero Third-Party / Duplicate Theme Systems ─────────
console.log("\n--- Section 8: Architectural Scope & Constraint Check ---");
const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../package.json"), "utf8"));
const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
assert(!allDeps["tailwindcss"], "Test 16: No tailwindcss introduced");
assert(!allDeps["styled-components"], "Test 16: No styled-components introduced");
assert(!allDeps["@emotion/react"], "Test 16: No emotion introduced");

console.log(`\n========================================================`);
console.log(`Hardening #9 Theme Suite: ${passed}/${total} PASSED`);
console.log(`========================================================`);
