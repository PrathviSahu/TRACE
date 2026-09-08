// ─────────────────────────────────────────────────────────────
//  TRACE — Interview Evaluator (Gemini Qualitative + Deterministic Fallback)
//  Phase 3.4: Dual qualitative evaluation and robust deterministic fallback.
//  Objective evidence (Correctness & Time Management) is ALWAYS authoritative.
// ─────────────────────────────────────────────────────────────

import { callGeminiApi } from "./aiService.js";
import {
  RUBRIC_WEIGHTS,
  computeCorrectnessScore,
  computeTimeManagementScore,
  computeOverallRubricScore,
} from "./interviewSimulationEngine.js";

const SYSTEM_INTERVIEW_EVALUATOR = `You are a Senior Staff Software Engineer and Technical Bar Raiser at a top technology company (FAANG/Tier-1).
You are evaluating a candidate's timed technical coding interview in TRACE.

You will receive:
1. Problem statement & constraints
2. Candidate's written approach & reasoning
3. Edge cases identified by the candidate
4. Time & space complexity claimed
5. Final code submitted
6. Objective execution evidence (tests passed/failed, errors)

Evaluate the candidate on these 6 qualitative categories using a 0 to 5 score:
- problemUnderstanding (0-5): Did they understand constraints and requirements?
- approachReasoning (0-5): Is the planned algorithm sound, optimal, and properly justified?
- patternRecognition (0-5): Did they identify the correct underlying DSA pattern?
- codeQuality (0-5): Cleanliness, naming, modularity, idiomatic syntax, readability?
- complexityAnalysis (0-5): Accuracy of Big-O time and space complexity explanations?
- communication (0-5): Clarity of written explanations, structure, edge-case coverage?

CRITICAL: Return ONLY a valid JSON object with this exact structure (NO markdown wrappers, NO extra text):
{
  "problemUnderstanding": { "score": 4, "reasoning": "Clear grasp of constraints..." },
  "approachReasoning": { "score": 4, "reasoning": "Optimal hash map strategy chosen..." },
  "patternRecognition": { "score": 5, "reasoning": "Accurately recognized Two Pointers / Hash Set pattern..." },
  "codeQuality": { "score": 4, "reasoning": "Clean variable naming and idiomatic syntax..." },
  "complexityAnalysis": { "score": 4, "reasoning": "Correctly identified O(n) time and O(n) space..." },
  "communication": { "score": 4, "reasoning": "Structured reasoning and proactive edge cases..." },
  "strengths": ["Proactive edge-case coverage", "Optimal algorithm selection"],
  "improvements": ["Consider memory optimization for large inputs", "Add defensive bounds checks"],
  "generalNotes": "Strong performance showing solid algorithmic instincts."
}`;

/**
 * Validates that an AI evaluation object conforms strictly to the rubric schema
 */
export function validateEvaluationSchema(data) {
  if (!data || typeof data !== "object") return null;

  const target = (data.categories && typeof data.categories === "object") ? data.categories : data;

  const categories = [
    "problemUnderstanding",
    "approachReasoning",
    "patternRecognition",
    "codeQuality",
    "complexityAnalysis",
    "communication",
  ];

  for (const cat of categories) {
    if (!target[cat] || typeof target[cat] !== "object") return null;
    const score = Number(target[cat].score);
    if (isNaN(score) || score < 0 || score > 5) return null;
    if (typeof target[cat].reasoning !== "string") return null;
  }

  return target;
}

/**
 * Deterministic fallback rubric generator when Gemini is unavailable,
 * unconfigured, or returns invalid data.
 */
export function computeDeterministicRubricFallback(session, evidenceOverride = null) {
  let approach = session?.approach || {};
  if (typeof approach === "string") {
    approach = {
      summary: session.approach,
      reasoning: session.explanation,
      edgeCases: session.edgeCases,
      timeComplexity: session.complexity?.time || session.timeComplexity,
      spaceComplexity: session.complexity?.space || session.spaceComplexity
    };
  }
  const code = session?.code || "";
  const evidence = evidenceOverride || session?.executionEvidence || session?.executionResult || {};

  // 1. Problem Understanding (heuristic based on approach + edge cases)
  let understandScore = 2;
  if (approach.summary && approach.summary.length > 20) understandScore += 1;
  if (approach.edgeCases && approach.edgeCases.length > 10) understandScore += 2;
  understandScore = Math.min(5, understandScore);

  // 2. Approach Reasoning
  let approachScore = 2;
  if (approach.reasoning && approach.reasoning.length > 30) approachScore += 2;
  if (evidence.passed) approachScore += 1;
  approachScore = Math.min(5, approachScore);

  // 3. Pattern Recognition
  let patternScore = 3;
  if (approach.summary && (approach.summary.toLowerCase().includes("pointer") ||
      approach.summary.toLowerCase().includes("window") ||
      approach.summary.toLowerCase().includes("hash") ||
      approach.summary.toLowerCase().includes("dp") ||
      approach.summary.toLowerCase().includes("tree") ||
      approach.summary.toLowerCase().includes("graph"))) {
    patternScore = 4;
  }
  if (evidence.passed) patternScore = Math.max(patternScore, 4);

  // 4. Correctness (AUTHORITATIVE DETERMINISTIC)
  const correctnessScore = computeCorrectnessScore(evidence);

  // 5. Code Quality (heuristic: indentation, comments, length)
  let codeQualityScore = 2;
  if (code.length > 50) codeQualityScore += 1;
  if (code.includes("//") || code.includes("#")) codeQualityScore += 1;
  if (!evidence.compileError && !evidence.runtimeError && code.length > 80) codeQualityScore += 1;
  codeQualityScore = Math.min(5, codeQualityScore);

  // 6. Complexity Analysis
  let complexityScore = 2;
  if (approach.timeComplexity && approach.timeComplexity.includes("O(")) complexityScore += 1;
  if (approach.spaceComplexity && approach.spaceComplexity.includes("O(")) complexityScore += 2;
  complexityScore = Math.min(5, complexityScore);

  // 7. Communication
  let communicationScore = 2;
  const totalNotesLen = (approach.summary?.length || 0) + (approach.reasoning?.length || 0) + (approach.edgeCases?.length || 0);
  if (totalNotesLen > 80) communicationScore += 2;
  else if (totalNotesLen > 30) communicationScore += 1;
  communicationScore = Math.min(5, communicationScore);

  // 8. Time Management (AUTHORITATIVE DETERMINISTIC)
  const timeScore = computeTimeManagementScore(
    session.elapsedSeconds,
    session.durationSeconds,
    session.attempts,
    session.status
  );

  const categories = {
    problemUnderstanding: {
      score: understandScore,
      weight: RUBRIC_WEIGHTS.problemUnderstanding,
      weightedScore: Math.round((understandScore / 5) * 100 * RUBRIC_WEIGHTS.problemUnderstanding),
      source: "deterministic_fallback",
      reasoning: approach.summary ? "Approach summary and edge cases recorded." : "Minimal approach notes submitted.",
    },
    approachReasoning: {
      score: approachScore,
      weight: RUBRIC_WEIGHTS.approachReasoning,
      weightedScore: Math.round((approachScore / 5) * 100 * RUBRIC_WEIGHTS.approachReasoning),
      source: "deterministic_fallback",
      reasoning: approach.reasoning ? "Algorithm logic described by candidate." : "Algorithm reasoning partially documented.",
    },
    patternRecognition: {
      score: patternScore,
      weight: RUBRIC_WEIGHTS.patternRecognition,
      weightedScore: Math.round((patternScore / 5) * 100 * RUBRIC_WEIGHTS.patternRecognition),
      source: "deterministic_fallback",
      reasoning: "Pattern alignment evaluated against problem taxonomy.",
    },
    correctness: {
      score: correctnessScore,
      weight: RUBRIC_WEIGHTS.correctness,
      weightedScore: Math.round((correctnessScore / 5) * 100 * RUBRIC_WEIGHTS.correctness),
      source: "deterministic",
      reasoning: evidence.testsTotal > 0
        ? `Passed ${evidence.testsPassed}/${evidence.testsTotal} verification test cases.`
        : (evidence.passed ? "Code executed cleanly and produced expected output." : "Execution did not pass all requirements."),
    },
    codeQuality: {
      score: codeQualityScore,
      weight: RUBRIC_WEIGHTS.codeQuality,
      weightedScore: Math.round((codeQualityScore / 5) * 100 * RUBRIC_WEIGHTS.codeQuality),
      source: "deterministic_fallback",
      reasoning: "Code structure and formatting evaluated deterministically.",
    },
    complexityAnalysis: {
      score: complexityScore,
      weight: RUBRIC_WEIGHTS.complexityAnalysis,
      weightedScore: Math.round((complexityScore / 5) * 100 * RUBRIC_WEIGHTS.complexityAnalysis),
      source: "deterministic_fallback",
      reasoning: (approach.timeComplexity && approach.spaceComplexity)
        ? `Analyzed Time: ${approach.timeComplexity}, Space: ${approach.spaceComplexity}`
        : "Partial Big-O complexity documentation.",
    },
    communication: {
      score: communicationScore,
      weight: RUBRIC_WEIGHTS.communication,
      weightedScore: Math.round((communicationScore / 5) * 100 * RUBRIC_WEIGHTS.communication),
      source: "deterministic_fallback",
      reasoning: "Written explanation completeness evaluated across approach phases.",
    },
    timeManagement: {
      score: timeScore,
      weight: RUBRIC_WEIGHTS.timeManagement,
      weightedScore: Math.round((timeScore / 5) * 100 * RUBRIC_WEIGHTS.timeManagement),
      source: "deterministic",
      reasoning: `Completed in ${Math.floor(session.elapsedSeconds / 60)}m of ${Math.floor(session.durationSeconds / 60)}m time budget.`,
    },
  };

  const overallScore = computeOverallRubricScore(categories);

  const strengths = [];
  if (evidence.passed) strengths.push("Successfully executed and verified solution");
  if (approach.edgeCases) strengths.push("Proactively considered edge cases");
  if (timeScore >= 4) strengths.push("Strong time management pacing");
  if (strengths.length === 0) strengths.push("Completed interview within allocated time");

  const improvements = [];
  if (!evidence.passed) improvements.push("Verify code against edge cases to resolve execution failures");
  if (!approach.timeComplexity) improvements.push("Explicitly state Big-O time and space complexity");
  if (session.hintsUsed > 0) improvements.push("Aim for independent reasoning without hints");

  return {
    overallScore,
    categories,
    feedback: "Evaluated with Deterministic Offline Evaluator (Gemini unavailable).",
    feedbackDetails: {
      strengths,
      improvements,
      generalNotes: "Evaluated via TRACE Deterministic Objective Rubric.",
    },
    isGeminiEvaluated: false,
  };
}

/**
 * Evaluates an interview session using Gemini qualitative analysis
 * with automatic deterministic fallback on any error.
 *
 * @param {Object} session
 * @param {Object} problemDetails
 * @returns {Promise<Object>} rubricResult
 */
export async function evaluateInterviewSession(session, problemDetails = null) {
  // Always compute authoritative objective scores
  const correctnessScore = computeCorrectnessScore(session.executionEvidence);
  const timeScore = computeTimeManagementScore(
    session.elapsedSeconds,
    session.durationSeconds,
    session.attempts,
    session.status
  );

  const fallback = computeDeterministicRubricFallback(session);

  try {
    const prompt = `Evaluate this coding interview session:
Problem: #${session.problemId} "${session.problemTitle}"
Difficulty: ${problemDetails?.difficulty || "Medium"}
Description: ${problemDetails?.description?.replace(/<[^>]*>/g, '') || session.problemTitle}

Candidate Approach:
Summary: ${session.approach?.summary || "None provided"}
Reasoning: ${session.approach?.reasoning || "None provided"}
Edge Cases: ${session.approach?.edgeCases || "None provided"}
Time Complexity: ${session.approach?.timeComplexity || "Not specified"}
Space Complexity: ${session.approach?.spaceComplexity || "Not specified"}

Submitted Code (${session.language}):
\`\`\`${session.language}
${session.code || "// No code submitted"}
\`\`\`

Objective Execution Evidence:
- Compiled: ${session.executionEvidence?.compiled}
- Executed: ${session.executionEvidence?.executed}
- Passed: ${session.executionEvidence?.passed}
- Tests Passed: ${session.executionEvidence?.testsPassed} / ${session.executionEvidence?.testsTotal}
- Runtime Error: ${session.executionEvidence?.runtimeError || "None"}
- Attempts: ${session.attempts}
- Hints Used: ${session.hintsUsed}
- Solution Viewed: ${session.solutionViewed}
- Time Elapsed: ${Math.floor(session.elapsedSeconds / 60)} min / ${Math.floor(session.durationSeconds / 60)} min

Return valid JSON with the 6 qualitative scores (problemUnderstanding, approachReasoning, patternRecognition, codeQuality, complexityAnalysis, communication), strengths, improvements, and generalNotes.`;

    const aiRes = await callGeminiApi({
      systemInstruction: SYSTEM_INTERVIEW_EVALUATOR,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 1200 },
    });

    const candidateText = aiRes?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error("Empty response from AI evaluation service.");
    }

    const cleaned = candidateText.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    const parsed = JSON.parse(cleaned);

    if (!validateEvaluationSchema(parsed)) {
      console.warn("AI evaluation response failed schema validation. Falling back to deterministic rubric.");
      return fallback;
    }

    // Merge AI qualitative scores with AUTHORITATIVE deterministic correctness & time management
    const categories = {
      problemUnderstanding: {
        score: Math.max(0, Math.min(5, Number(parsed.problemUnderstanding.score))),
        weight: RUBRIC_WEIGHTS.problemUnderstanding,
        weightedScore: Math.round((parsed.problemUnderstanding.score / 5) * 100 * RUBRIC_WEIGHTS.problemUnderstanding),
        source: "gemini",
        reasoning: parsed.problemUnderstanding.reasoning,
      },
      approachReasoning: {
        score: Math.max(0, Math.min(5, Number(parsed.approachReasoning.score))),
        weight: RUBRIC_WEIGHTS.approachReasoning,
        weightedScore: Math.round((parsed.approachReasoning.score / 5) * 100 * RUBRIC_WEIGHTS.approachReasoning),
        source: "gemini",
        reasoning: parsed.approachReasoning.reasoning,
      },
      patternRecognition: {
        score: Math.max(0, Math.min(5, Number(parsed.patternRecognition.score))),
        weight: RUBRIC_WEIGHTS.patternRecognition,
        weightedScore: Math.round((parsed.patternRecognition.score / 5) * 100 * RUBRIC_WEIGHTS.patternRecognition),
        source: "gemini",
        reasoning: parsed.patternRecognition.reasoning,
      },
      correctness: {
        score: correctnessScore, // STRICTLY DETERMINISTIC
        weight: RUBRIC_WEIGHTS.correctness,
        weightedScore: Math.round((correctnessScore / 5) * 100 * RUBRIC_WEIGHTS.correctness),
        source: "deterministic",
        reasoning: session.executionEvidence?.testsTotal > 0
          ? `Passed ${session.executionEvidence.testsPassed}/${session.executionEvidence.testsTotal} verification test cases.`
          : (session.executionEvidence?.passed ? "Code executed cleanly and produced expected output." : "Execution did not pass all requirements."),
      },
      codeQuality: {
        score: Math.max(0, Math.min(5, Number(parsed.codeQuality.score))),
        weight: RUBRIC_WEIGHTS.codeQuality,
        weightedScore: Math.round((parsed.codeQuality.score / 5) * 100 * RUBRIC_WEIGHTS.codeQuality),
        source: "gemini",
        reasoning: parsed.codeQuality.reasoning,
      },
      complexityAnalysis: {
        score: Math.max(0, Math.min(5, Number(parsed.complexityAnalysis.score))),
        weight: RUBRIC_WEIGHTS.complexityAnalysis,
        weightedScore: Math.round((parsed.complexityAnalysis.score / 5) * 100 * RUBRIC_WEIGHTS.complexityAnalysis),
        source: "gemini",
        reasoning: parsed.complexityAnalysis.reasoning,
      },
      communication: {
        score: Math.max(0, Math.min(5, Number(parsed.communication.score))),
        weight: RUBRIC_WEIGHTS.communication,
        weightedScore: Math.round((parsed.communication.score / 5) * 100 * RUBRIC_WEIGHTS.communication),
        source: "gemini",
        reasoning: parsed.communication.reasoning,
      },
      timeManagement: {
        score: timeScore, // STRICTLY DETERMINISTIC
        weight: RUBRIC_WEIGHTS.timeManagement,
        weightedScore: Math.round((timeScore / 5) * 100 * RUBRIC_WEIGHTS.timeManagement),
        source: "deterministic",
        reasoning: `Completed in ${Math.floor(session.elapsedSeconds / 60)}m of ${Math.floor(session.durationSeconds / 60)}m time budget.`,
      },
    };

    const overallScore = computeOverallRubricScore(categories);

    return {
      overallScore,
      categories,
      feedback: {
        strengths: parsed.strengths || fallback.feedback.strengths,
        improvements: parsed.improvements || fallback.feedback.improvements,
        generalNotes: parsed.generalNotes || "Evaluated by TRACE AI Bar Raiser with authoritative objective execution scoring.",
      },
      isGeminiEvaluated: true,
    };
  } catch (err) {
    console.warn("Gemini interview evaluation unavailable. Using deterministic rubric fallback:", err.message);
    return fallback;
  }
}

export const evaluateInterviewWithGemini = evaluateInterviewSession;
