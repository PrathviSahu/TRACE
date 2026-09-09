// ─────────────────────────────────────────────────────────────
//  TRACE — AI Service
//  100% Server-Mediated via /api/gemini proxy
//  No client-side keys, no localStorage, no direct third-party calls
// ─────────────────────────────────────────────────────────────

export const SUPPORTED_LANGUAGES = [
  { id: "python",     label: "Python",     icon: "🐍", ext: "py" },
  { id: "java",       label: "Java",       icon: "☕", ext: "java" },
  { id: "cpp",        label: "C++",        icon: "⚡", ext: "cpp" },
  { id: "javascript", label: "JavaScript", icon: "🌐", ext: "js" },
  { id: "c",          label: "C",          icon: "⚙", ext: "c" },
];

export const SYSTEM_TUTOR_PROMPT = `You are ARIA (Algorithm Reasoning & Insight Assistant) — an elite DSA tutor embedded in TRACE, an interactive visual code execution and algorithm debugger.

TRACE executes algorithms with step-by-step memory, variable, call-stack, and diagrammatic data structure visualization (supporting Java AST interpretation and limited Python trace support).

Your personality:
- Encouraging, concise, structured like a senior FAANG interviewer.
- When someone is stuck, offer guiding hints first before giving away the full answer.
- Always explain time and space complexity with Big-O notation.
- When writing code, adapt cleanly to the requested programming language (Java, Python, C++, etc.).
- Use Markdown formatting with backticks and bullet points.`;

/**
 * Extracts and parses JSON from raw LLM text, stripping code fences if present.
 */
export function extractJsonFromText(rawText) {
  if (!rawText || typeof rawText !== "string") {
    throw new Error("Empty response received from AI service.");
  }

  let cleaned = rawText.trim();
  if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
  else if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
  if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
  cleaned = cleaned.trim();

  try {
    return JSON.parse(cleaned);
  } catch (_) {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const candidate = cleaned.slice(firstBrace, lastBrace + 1);
      return JSON.parse(candidate);
    }
    throw new Error("Failed to extract valid JSON from AI response.");
  }
}

/**
 * Strict Semantic Validator for AI Solution Response
 * Enforces correct types and non-empty mandatory fields without mutating data.
 */
export function validateSolutionResponse(parsed) {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("AI solution response must be a non-null JSON object.");
  }
  if (!Array.isArray(parsed.approaches) || parsed.approaches.length === 0) {
    throw new Error("AI solution response must contain a non-empty 'approaches' array.");
  }

  for (let i = 0; i < parsed.approaches.length; i++) {
    const app = parsed.approaches[i];
    if (!app || typeof app !== "object" || Array.isArray(app)) {
      throw new Error(`Approach #${i + 1} must be a JSON object.`);
    }
    if (typeof app.name !== "string" || !app.name.trim()) {
      throw new Error(`Approach #${i + 1} missing required non-empty string 'name'.`);
    }
    if (typeof app.code !== "string" || !app.code.trim()) {
      throw new Error(`Approach #${i + 1} ("${app.name}") missing valid runnable 'code' string.`);
    }
  }

  return parsed;
}

/**
 * Normalizes and sets fallback defaults on a pre-validated AI solution object
 */
export function normalizeSolutionDefaults(validated, expectedLanguage = "java") {
  const normalized = {
    ...validated,
    language: expectedLanguage,
    approaches: validated.approaches.map(app => ({
      name: String(app.name || "").trim(),
      label: String(app.label || app.name || "").trim(),
      idea: String(app.idea || "").trim(),
      complexity: {
        time: String(app.complexity?.time || "O(N)").trim(),
        space: String(app.complexity?.space || "O(1)").trim()
      },
      code: String(app.code || "").trim()
    }))
  };
  return normalized;
}

/**
 * Validates AI problem description schema
 */
export function validateProblemDescription(parsed) {
  if (!parsed || typeof parsed !== "object") {
    throw new Error("AI problem description must be a JSON object.");
  }
  if (typeof parsed.description !== "string" || !parsed.description.trim()) {
    throw new Error("AI problem description missing valid 'description' text.");
  }
  if (!Array.isArray(parsed.examples)) {
    parsed.examples = [];
  }
  if (!Array.isArray(parsed.constraints)) {
    parsed.constraints = [];
  }
  if (!parsed.complexity || typeof parsed.complexity !== "object") {
    parsed.complexity = { time: "O(N)", space: "O(1)" };
  }
  if (!Array.isArray(parsed.hints)) {
    parsed.hints = [];
  }
  return parsed;
}

/**
 * Server-only API Caller
 * Routes all traffic strictly through /api/gemini backend proxy
 */
export async function callGeminiApi({ systemInstruction, contents, generationConfig, model = "gemini-2.5-flash" }) {
  const payload = {
    contents,
    generationConfig: generationConfig || { temperature: 0.7, maxOutputTokens: 1500 }
  };
  if (systemInstruction) {
    payload.systemInstruction = typeof systemInstruction === "string"
      ? { parts: [{ text: systemInstruction }] }
      : systemInstruction;
  }

  const res = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, payload })
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `API Error (${res.status})`);
  }

  return await res.json();
}

/**
 * Language-aware 3-Approach Solution Generator
 */
export async function generateProblemSolutions({ problem, language = "java", description = null }) {
  const langConfig = SUPPORTED_LANGUAGES.find(l => l.id === language) || SUPPORTED_LANGUAGES[1];
  const descText = description?.description?.replace(/<[^>]*>/g, "") || problem.name;

  const prompt = `You are a DSA expert. Provide exactly 3 approaches in ${langConfig.label} for LeetCode #${problem.id} "${problem.name}" (${problem.difficulty}):
Problem statement: ${descText}

The 3 approaches must be:
1. Brute Force (naive)
2. Better (intermediate optimization)
3. Optimal (best known time/space complexity)

Return ONLY a valid JSON object matching this schema with NO markdown code block wrappers around the JSON:
{
  "language": "${langConfig.id}",
  "approaches": [
    {
      "name": "Brute Force",
      "label": "O(...) brief summary",
      "idea": "1-2 sentence core concept",
      "complexity": { "time": "O(...)", "space": "O(...)" },
      "code": "// Runnable ${langConfig.label} code\\n"
    },
    {
      "name": "Better",
      "label": "O(...) brief summary",
      "idea": "1-2 sentence core concept",
      "complexity": { "time": "O(...)", "space": "O(...)" },
      "code": "// Runnable ${langConfig.label} code\\n"
    },
    {
      "name": "Optimal",
      "label": "O(...) brief summary",
      "idea": "1-2 sentence core concept",
      "complexity": { "time": "O(...)", "space": "O(...)" },
      "code": "// Runnable ${langConfig.label} code\\n"
    }
  ]
}`;

  const data = await callGeminiApi({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.2, maxOutputTokens: 2500 }
  });

  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const parsed = extractJsonFromText(rawText);
  const validated = validateSolutionResponse(parsed);
  return normalizeSolutionDefaults(validated, langConfig.id);
}

/**
 * On-Demand Problem Description Generator
 */
export async function generateProblemDescription({ problem }) {
  const prompt = `Provide the exact problem description, test examples, constraints, and target complexity for LeetCode #${problem.id} "${problem.name}" (${problem.difficulty}).
Return ONLY a valid JSON object matching this schema:
{
  "description": "<p>Detailed problem description...</p>",
  "examples": [
    { "input": "...", "output": "...", "explanation": "..." }
  ],
  "constraints": [
    "1 <= nums.length <= 10^5"
  ],
  "complexity": { "time": "O(...)", "space": "O(...)" },
  "hints": ["Hint 1..."]
}`;

  const data = await callGeminiApi({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.2, maxOutputTokens: 1500 }
  });

  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const parsed = extractJsonFromText(rawText);
  return validateProblemDescription(parsed);
}
