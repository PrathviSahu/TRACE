// ─────────────────────────────────────────────────────────────
//  TRACE — Senior Code Review Remediation & Reference Suite
//  Validates P1 & P2 execution integrity, security, determinism,
//  and deep interpreter correctness.
// ─────────────────────────────────────────────────────────────

import assert from "node:assert";
import path from "node:path";
import { tokenize, LexerError } from "../src/engine/lexer.js";
import { parse, ParseError, UnsupportedSyntaxError } from "../src/engine/parser.js";
import { runJava } from "../src/engine/interpreter.js";
import { validateTraceStep, validateTrace, TraceContractError } from "../src/engine/traceSchema.js";
import { mulberry32, generateMockInterviewSet } from "../src/services/intelligenceService.js";
import {
  extractJsonFromText,
  validateSolutionResponse,
  normalizeSolutionDefaults,
  validateProblemDescription
} from "../src/services/aiService.js";
import { checkRateLimit, getClientIp, ALLOWED_MODELS } from "../server/geminiProxy.js";
import { resolveSafeStaticPath } from "../server/pathUtils.js";

async function runTests() {
  console.log("=== STARTING TRACE COMPREHENSIVE REMEDIATION SUITE ===\n");

  // ── 1. Lexer Strict Character Checks
  console.log("[1/9] Testing Lexer Strict Character Checks...");
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
  console.log("  ✓ Lexer throws descriptive LexerError on unknown characters with line & col");

  // ── 2. Parser Strict Syntax & Boundary Checks
  console.log("[2/9] Testing Parser Strict Syntax & Boundary Checks...");
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

  // ── 3. Trace Schema Contract Rejection
  console.log("[3/9] Testing Trace Schema Validation & Rejection on Malformed Steps...");
  assert.throws(
    () => validateTraceStep({ step: 1 }),
    (err) => err instanceof TraceContractError,
    "Schema must reject malformed trace steps"
  );
  console.log("  ✓ TraceSchema correctly rejects incomplete step objects");

  // ── 4. Deep Interpreter Reference Tests (Recursion, Collections, Short-Circuit)
  console.log("[4/9] Testing Deep Interpreter Correctness (Reference Tests)...");

  // 4A: Recursion (Fibonacci)
  const fibCode = `
  class Solution {
    public int fib(int n) {
      if (n <= 1) return n;
      return fib(n - 1) + fib(n - 2);
    }
  }`;
  const fibRes = runJava(fibCode, { n: 7 });
  assert.strictEqual(fibRes.returnValue, 13, "fib(7) must equal 13");
  validateTrace(fibRes.trace);
  console.log("  ✓ Recursive execution (fib(7) = 13) verified with step validation");

  // 4B: Short-Circuit Evaluation (must not divide by zero)
  const shortCircuitCode = `
  class Solution {
    public boolean testShortCircuit() {
      boolean flag = false;
      if (flag && (1 / 0 == 0)) {
        return false;
      }
      return true;
    }
  }`;
  const scRes = runJava(shortCircuitCode, {});
  assert.strictEqual(scRes.returnValue, true, "Short-circuit boolean AND must protect division by zero");
  console.log("  ✓ Boolean short-circuiting verified (no divide-by-zero failure)");

  // 4C: Collections (HashMap & Stack operations)
  const collectionsCode = `
  class Solution {
    public int testCollections() {
      Map<String, Integer> map = new HashMap<>();
      map.put("alpha", 100);
      map.put("beta", 200);

      Stack<Integer> st = new Stack<>();
      st.push(map.get("alpha"));
      st.push(map.get("beta"));

      int popped = st.pop();
      return popped + map.get("alpha");
    }
  }`;
  const collRes = runJava(collectionsCode, {});
  assert.strictEqual(collRes.returnValue, 300, "HashMap + Stack operations must sum to 300");
  validateTrace(collRes.trace);
  console.log("  ✓ Collections runtime (HashMap + Stack) verified");

  // ── 5. Deterministic Seeded PRNG
  console.log("[5/9] Testing Deterministic Intelligence (Mulberry32)...");
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

  // ── 6. AI Output Validation vs Normalization
  console.log("[6/9] Testing AI Validation vs Normalization Separation...");
  const rawAiJson = {
    approaches: [
      {
        name: "Two Pointers",
        code: "return new int[]{0, 1};"
        // Notice complexity and idea omitted
      }
    ]
  };
  // Pure validation does NOT mutate
  const validated = validateSolutionResponse(rawAiJson);
  assert.strictEqual(validated.approaches[0].complexity, undefined, "validateSolutionResponse must not mutate or inject defaults");

  // Normalization applies defaults
  const normalized = normalizeSolutionDefaults(validated, "java");
  assert.strictEqual(normalized.approaches[0].complexity.time, "O(N)", "normalizeSolutionDefaults sets default time");
  assert.strictEqual(normalized.language, "java");
  console.log("  ✓ Separation of pure validation from normalization defaults verified");

  // ── 7. Path Traversal Boundary Resolver
  console.log("[7/9] Testing Encapsulated Safe Static Path Resolver...");
  const DIST_DIR = path.resolve("dist");
  assert.strictEqual(resolveSafeStaticPath(DIST_DIR, "/assets/index.js").isInsideDist, true);
  assert.strictEqual(resolveSafeStaticPath(DIST_DIR, "../../package.json").isInsideDist, false);
  assert.strictEqual(resolveSafeStaticPath(DIST_DIR, "/../../package.json").isInsideDist, false);
  assert.strictEqual(resolveSafeStaticPath(DIST_DIR, "/..%2F..%2Fpackage.json").isInsideDist, false);
  console.log("  ✓ resolveSafeStaticPath safely restricts paths strictly to dist directory");

  // ── 8. True Sliding-Window Rate Limiter
  console.log("[8/9] Testing True Sliding-Window Rate Limiter...");
  const testIp = "10.0.0.1";
  // Fill up quota (30 requests)
  for (let i = 0; i < 30; i++) {
    const res = checkRateLimit(testIp, 30, 1000);
    assert.strictEqual(res.allowed, true);
  }
  // 31st request must be denied
  const deniedRes = checkRateLimit(testIp, 30, 1000);
  assert.strictEqual(deniedRes.allowed, false, "31st request must be denied in sliding window");
  assert.ok(deniedRes.resetInSec > 0, "Must calculate resetInSec");
  console.log("  ✓ True sliding window rate limiter triggers at threshold");

  // ── 9. Trusted-Proxy IP Resolution
  console.log("[9/9] Testing Trusted-Proxy IP Resolution...");
  const mockReqWithSpoof = {
    headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
    socket: { remoteAddress: "192.168.1.50" }
  };
  // Untrusted proxy -> must use socket remoteAddress
  const untrustedIp = getClientIp(mockReqWithSpoof, false);
  assert.strictEqual(untrustedIp, "192.168.1.50", "Untrusted proxy must reject X-Forwarded-For");

  // Trusted proxy -> must use first forwarded IP
  const trustedIp = getClientIp(mockReqWithSpoof, true);
  assert.strictEqual(trustedIp, "1.2.3.4", "Trusted proxy must parse first client IP");
  console.log("  ✓ getClientIp distinguishes between trusted and untrusted proxy environments");

  console.log("\n=== ALL 9 COMPREHENSIVE REMEDIATION TESTS PASSED! ===");
}

runTests().catch((err) => {
  console.error("Test Suite Failed:", err);
  process.exit(1);
});
