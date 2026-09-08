// ─────────────────────────────────────────────────────────────
//  TRACE — Interview Execution Adapter
//  Phase 3.4.1: Genuine multi-test execution, strict normalized comparison,
//  and honest language execution boundaries.
// ─────────────────────────────────────────────────────────────

import { runJava } from "../engine/interpreter.js";
import { runPython } from "../engine/pythonRunner.js";
import { PROBLEM_DESCRIPTIONS } from "../data/problemDescriptions.js";

/**
 * Languages genuinely supported by TRACE execution engines.
 */
export const EXECUTABLE_LANGUAGES = ["java", "python"];

/**
 * Parses example input strings like "nums = [2,7,11,15], target = 9"
 * into structured parameter maps keyed by name and positional index.
 */
export function parseInputStringToMap(inputStr) {
  if (!inputStr || typeof inputStr !== "string") return {};
  const map = {};
  const regex = /([a-zA-Z_]\w*)\s*=\s*(\[[^\]]*\]|"[^"]*"|'[^']*'|[^,;\n]+)/g;
  let match;
  let idx = 0;
  let hasMatches = false;
  while ((match = regex.exec(inputStr)) !== null) {
    hasMatches = true;
    const key = match[1].trim();
    const val = match[2].trim();
    map[key] = val;
    map[idx] = val;
    idx++;
  }
  if (!hasMatches) map[0] = inputStr.trim();
  return map;
}

/**
 * Authoritative normalized comparison between actual execution output and expected output.
 * Never uses substring matching (no .includes()).
 * Normalizes line endings, whitespace, JSON formatting, and array bracket spacing.
 */
export function normalizeAndCompareOutputs(actual, expected) {
  if (actual === expected) return true;
  if (actual == null || expected == null) return false;

  const actualRaw = String(actual).trim();
  const expectedRaw = String(expected).trim();
  if (actualRaw === expectedRaw) return true;

  // 1. Normalize line endings
  const actualLines = actualRaw.replace(/\r\n/g, "\n").trim();
  const expectedLines = expectedRaw.replace(/\r\n/g, "\n").trim();
  if (actualLines === expectedLines) return true;

  // 2. Try structural JSON / Array parsing
  try {
    const parsedActual = JSON.parse(actualLines);
    const parsedExpected = JSON.parse(expectedLines);
    if (JSON.stringify(parsedActual) === JSON.stringify(parsedExpected)) {
      return true;
    }
  } catch {}

  // 3. Normalize bracket whitespace (e.g. "[0, 1]" -> "[0,1]")
  const normActual = actualLines.replace(/\s*,\s*/g, ",").replace(/\[\s+/g, "[").replace(/\s+\]/g, "]").toLowerCase();
  const normExpected = expectedLines.replace(/\s*,\s*/g, ",").replace(/\[\s+/g, "[").replace(/\s+\]/g, "]").toLowerCase();

  return normActual === normExpected;
}

/**
 * Executes an interview session's code against the problem's test cases
 * and captures complete structured execution evidence.
 *
 * @param {Object} session - InterviewSession
 * @param {Object} problem - Normalized problem object
 * @returns {Promise<Object>} updated session with evidence and history
 */
export async function executeInterviewCode(session, problem = null) {
  const pId = session.problemId;
  const descObj = PROBLEM_DESCRIPTIONS[pId] || null;
  const code = session.code || "";
  const language = (session.language || "java").toLowerCase();

  const startMs = Date.now();
  const attemptNum = (session.attempts || 0) + 1;
  const nowIso = new Date().toISOString();

  // ── Language Execution Honesty Check (Issue 1) ─────────────
  if (!EXECUTABLE_LANGUAGES.includes(language)) {
    const examples = descObj?.examples || [];
    const executionEvidence = {
      compiled: false,
      executed: false,
      output: [`[Notice] Runtime execution for "${language}" is currently unavailable in the interview environment. Supported execution engines: Java 17, Python 3.`],
      expectedOutput: examples.length > 0 ? examples[0].output : null,
      passed: false,
      failed: false,
      testsPassed: 0,
      testsFailed: examples.length,
      testsTotal: examples.length,
      testResults: [],
      runtimeError: `Execution for "${language}" is unavailable. The code has been saved for rubric evaluation.`,
      compileError: null,
      traceSteps: 0,
      executionDurationMs: 0,
    };

    const attemptRecord = {
      attemptNumber: attemptNum,
      timestamp: nowIso,
      status: "unsupported_language",
      output: executionEvidence.output,
      error: executionEvidence.runtimeError,
      testsPassed: 0,
      testsTotal: examples.length,
      durationMs: 0,
    };

    return {
      ...session,
      attempts: attemptNum,
      attemptsHistory: [...(session.attemptsHistory || []), attemptRecord],
      executionEvidence,
      phase: "execution",
      updatedAt: nowIso,
    };
  }

  let compiled = true;
  let executed = false;
  let compileError = null;
  let runtimeError = null;
  let rawOutputs = [];
  let traceSteps = 0;

  // Gather test cases from verified description if available
  const examples = descObj?.examples || [];
  const testResults = [];
  let testsPassed = 0;
  let testsTotal = examples.length;

  try {
    if (language === "python") {
      // Execute Python per test case (Issue 2)
      if (examples.length > 0) {
        for (const ex of examples) {
          const testRes = runPython(code, ex.input);
          executed = true;
          traceSteps = Math.max(traceSteps, testRes.trace?.length || 0);

          const actualStr = (testRes.output || []).join(" ").trim();
          if (rawOutputs.length === 0 && (testRes.output || []).length > 0) {
            rawOutputs = testRes.output;
          }

          // Strict normalized comparison (Issue 3)
          const passedTest = normalizeAndCompareOutputs(actualStr, ex.output);
          if (passedTest) testsPassed++;

          testResults.push({
            input: ex.input,
            expected: ex.output,
            actual: actualStr || "None",
            passed: passedTest,
          });
        }
      } else {
        const result = runPython(code, "");
        executed = true;
        rawOutputs = result.output || [];
        traceSteps = result.trace?.length || 0;
      }
    } else if (language === "java") {
      // Execute Java per test case (Issue 2)
      if (examples.length > 0) {
        for (const ex of examples) {
          const testInputs = parseInputStringToMap(ex.input);
          const testRes = runJava(code, testInputs);
          executed = true;
          traceSteps = Math.max(traceSteps, testRes.trace?.length || 0);

          let actualStr;
          if (testRes.returnValue !== undefined) {
            actualStr = Array.isArray(testRes.returnValue)
              ? JSON.stringify(testRes.returnValue)
              : String(testRes.returnValue);
          } else {
            actualStr = (testRes.output || []).join(" ").trim();
          }

          if (rawOutputs.length === 0 && (testRes.output || []).length > 0) {
            rawOutputs = testRes.output;
          }

          // Strict normalized comparison (Issue 3)
          const passedTest = normalizeAndCompareOutputs(actualStr, ex.output);
          if (passedTest) testsPassed++;

          testResults.push({
            input: ex.input,
            expected: ex.output,
            actual: actualStr || "None",
            passed: passedTest,
          });
        }
      } else {
        const result = runJava(code, {});
        executed = true;
        rawOutputs = result.output || [];
        traceSteps = result.trace?.length || 0;
      }
    }
  } catch (err) {
    executed = false;
    const msg = err?.message || String(err);
    if (msg.toLowerCase().includes("parse") || msg.toLowerCase().includes("syntax") || msg.toLowerCase().includes("token")) {
      compileError = msg;
      compiled = false;
    } else {
      runtimeError = msg;
    }
    rawOutputs = [msg];
  }

  const durationMs = Date.now() - startMs;

  const passed = Boolean(
    !compileError &&
    !runtimeError &&
    (testsTotal > 0 ? testsPassed === testsTotal : executed)
  );

  const attemptStatus = compileError ? "compile_error" : (runtimeError ? "runtime_error" : (passed ? "passed" : "failed"));

  const attemptRecord = {
    attemptNumber: attemptNum,
    timestamp: nowIso,
    status: attemptStatus,
    output: rawOutputs,
    error: compileError || runtimeError,
    testsPassed,
    testsTotal,
    durationMs,
  };

  const updatedHistory = [...(session.attemptsHistory || []), attemptRecord];

  const executionEvidence = {
    compiled,
    executed,
    output: rawOutputs,
    expectedOutput: examples.length > 0 ? examples[0].output : null,
    passed,
    failed: !passed,
    testsPassed,
    testsFailed: testsTotal - testsPassed,
    testsTotal,
    testResults,
    runtimeError,
    compileError,
    traceSteps,
    executionDurationMs: durationMs,
  };

  return {
    ...session,
    attempts: attemptNum,
    attemptsHistory: updatedHistory,
    executionEvidence,
    phase: "execution",
    updatedAt: nowIso,
  };
}
