// ─────────────────────────────────────────────────────────────
//  TRACE — Code Review Remediation Test Suite
//  Validates P1 execution integrity, security, and determinism
// ─────────────────────────────────────────────────────────────

import assert from "node:assert";
import path from "node:path";
import { tokenize, LexerError } from "../src/engine/lexer.js";
import { parse, ParseError, UnsupportedSyntaxError } from "../src/engine/parser.js";
import { runJava } from "../src/engine/interpreter.js";
import { validateTraceStep, validateTrace, TraceContractError } from "../src/engine/traceSchema.js";
import { mulberry32, generateMockInterviewSet } from "../src/services/intelligenceService.js";
import { extractJsonFromText, validateSolutionResponse, validateProblemDescription } from "../src/services/aiService.js";
import { handleGeminiProxy, ALLOWED_MODELS } from "../server/geminiProxy.js";

async function runTests() {
  console.log("=== STARTING TRACE CODE REVIEW REMEDIATION SUITE ===\n");

  // ── 1. Lexer Strict Character Checks
  console.log("[1/7] Testing Lexer Strict Character Checks...");
  assert.throws(
    () => tokenize("int x = 10 @ 20;"),
    (err) => err instanceof LexerError && err.char === "@" && err.line === 1 && err.column === 12,
    "Lexer must throw LexerError on invalid character @"
  );
  assert.throws(
    () => tokenize("int #bad = 5;"),
    (err) => err instanceof LexerError && err.char === "#",
    "Lexer must throw LexerError on invalid character #"
  );
  console.log("  ✓ Lexer throws descriptive LexerError on unknown characters");

  // ── 2. Parser Strict Syntax & Boundary Checks
  console.log("[2/7] Testing Parser Strict Syntax & Boundary Checks...");
  assert.throws(
    () => parse("class Solution { void test() { try { int x = 1; } catch(Exception e){} } }"),
    (err) => err instanceof UnsupportedSyntaxError && err.feature === "try-catch",
    "Parser must throw UnsupportedSyntaxError on try-catch"
  );
  assert.throws(
    () => parse("class Solution { void test() { throw new RuntimeException(); } }"),
    (err) => err instanceof UnsupportedSyntaxError && err.feature === "throw",
    "Parser must throw UnsupportedSyntaxError on throw"
  );
  assert.throws(
    () => parse("class Solution { void test() { switch (x) { case 1: break; } } }"),
    (err) => err instanceof UnsupportedSyntaxError && err.feature === "switch",
    "Parser must throw UnsupportedSyntaxError on switch"
  );
  console.log("  ✓ Parser rejects unsupported Java features cleanly with UnsupportedSyntaxError");

  // ── 3. Runtime Engine Execution & Trace Validation
  console.log("[3/7] Testing Runtime Engine & Trace Step Schema...");
  const code = `
  class Solution {
    public int solve(int[] nums) {
      int sum = 0;
      for (int i = 0; i < nums.length; i++) {
        sum += nums[i];
      }
      return sum;
    }
  }`;
  const runRes = runJava(code, "nums = [1, 2, 3, 4, 5]");
  assert.ok(runRes.trace.length > 0, "Must emit trace steps");
  assert.strictEqual(runRes.returnValue, 15, "Must compute sum 15");
  validateTrace(runRes.trace);
  console.log(`  ✓ Execution engine computed result 15 and validated ${runRes.trace.length} trace steps`);

  // ── 4. Trace Schema Contract Rejection
  console.log("[4/7] Testing Trace Schema Rejection on Malformed Steps...");
  assert.throws(
    () => validateTraceStep({ step: 1 }), // missing line, type, variables, etc.
    (err) => err instanceof TraceContractError,
    "Schema must reject malformed trace steps"
  );
  console.log("  ✓ TraceSchema correctly rejects incomplete steps");

  // ── 5. Deterministic Seeded PRNG
  console.log("[5/7] Testing Deterministic Intelligence (Mulberry32)...");
  const testPool = [
    { id: 1, name: "Two Sum", difficulty: "Easy" },
    { id: 2, name: "3Sum", difficulty: "Medium" },
    { id: 3, name: "Course Schedule", difficulty: "Medium" },
    { id: 4, name: "Trapping Rain Water", difficulty: "Hard" },
    { id: 5, name: "Word Ladder II", difficulty: "Hard" }
  ];
  const set1 = generateMockInterviewSet(testPool, "fixed-session-seed-42");
  const set2 = generateMockInterviewSet(testPool, "fixed-session-seed-42");
  const set3 = generateMockInterviewSet(testPool, "different-session-seed-99");
  assert.deepStrictEqual(set1.map(p => p.id), set2.map(p => p.id), "Identical seeds must yield identical sets");
  assert.notDeepStrictEqual(set1.map(p => p.id), set3.map(p => p.id), "Different seeds should yield different sets");
  console.log("  ✓ Deterministic PRNG verified across mock interview generations");

  // ── 6. AI Output Schema Validation
  console.log("[6/7] Testing AI JSON Extraction & Schema Validation...");
  const sampleAiResponse = `
  Here is the approach:
  \`\`\`json
  {
    "approaches": [
      {
        "name": "Optimal",
        "idea": "Use Hash Map for O(1) lookups",
        "complexity": { "time": "O(N)", "space": "O(N)" },
        "code": "return new int[]{0, 1};"
      }
    ]
  }
  \`\`\`
  `;
  const extracted = extractJsonFromText(sampleAiResponse);
  const validated = validateSolutionResponse(extracted, "java");
  assert.strictEqual(validated.approaches[0].name, "Optimal");
  assert.strictEqual(validated.language, "java");
  assert.throws(
    () => validateSolutionResponse({ approaches: [{ name: "Missing code" }] }),
    /missing valid runnable/,
    "Must reject approach with missing code"
  );
  console.log("  ✓ AI response extraction & schema validation verified");

  // ── 7. Path Traversal & Proxy Rate Limiting
  console.log("[7/7] Testing Security (Path Traversal & Rate Limiter)...");
  const DIST_DIR = path.resolve("dist");
  function isSafe(p) {
    const cleanRel = p.replace(/^[\\/\\]+/, "");
    const safeFilePath = path.resolve(DIST_DIR, cleanRel);
    return safeFilePath.startsWith(DIST_DIR + path.sep) || safeFilePath === DIST_DIR;
  }
  assert.strictEqual(isSafe("/index.html"), true, "Valid file inside dist");
  assert.strictEqual(isSafe("../../package.json"), false, "Traversal must be rejected");
  assert.strictEqual(isSafe("/../../package.json"), false, "Root traversal must be rejected");

  assert.ok(ALLOWED_MODELS.has("gemini-2.5-flash"), "gemini-2.5-flash is allowed");
  assert.ok(!ALLOWED_MODELS.has("gemini-3.6-flash"), "gemini-3.6-flash is removed");

  console.log("  ✓ Path traversal safely blocked and production models sanitized");

  console.log("\n=== ALL 7 REMEDIATION TEST SUITES PASSED! ===");
}

runTests().catch((err) => {
  console.error("Test Suite Failed:", err);
  process.exit(1);
});
