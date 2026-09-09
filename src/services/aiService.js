// ─────────────────────────────────────────────────────────────
//  TRACE — AI Service
//  100% Server-Mediated via /api/gemini proxy
//  No client-side keys, no localStorage, no direct third-party calls
// ─────────────────────────────────────────────────────────────

export const SUPPORTED_LANGUAGES = [
  { id: 'python',     label: 'Python',     icon: '🐍', ext: 'py' },
  { id: 'java',       label: 'Java',       icon: '☕', ext: 'java' },
  { id: 'cpp',        label: 'C++',        icon: '⚡', ext: 'cpp' },
  { id: 'javascript', label: 'JavaScript', icon: '🌐', ext: 'js' },
  { id: 'c',          label: 'C',          icon: '⚙', ext: 'c' },
];

export const SYSTEM_TUTOR_PROMPT = `You are ARIA (Algorithm Reasoning & Insight Assistant) — an elite DSA tutor embedded in TRACE, an interactive multi-language visual code debugger supporting Java, Python, C++, C, and JavaScript.

Your personality:
- Encouraging, concise, structured like a senior FAANG interviewer.
- When someone is stuck, offer guiding hints first before giving away the full answer.
- Always explain time and space complexity with Big-O notation.
- When writing code, adapt cleanly to the requested programming language (Java, Python, C++, etc.).
- Use Markdown formatting with backticks and bullet points.`;

/**
 * Server-only API Caller
 * Routes all traffic strictly through /api/gemini backend proxy
 */
export async function callGeminiApi({ systemInstruction, contents, generationConfig, model = 'gemini-3.6-flash' }) {
  const payload = {
    contents,
    generationConfig: generationConfig || { temperature: 0.7, maxOutputTokens: 1500 }
  };
  if (systemInstruction) {
    payload.systemInstruction = typeof systemInstruction === 'string'
      ? { parts: [{ text: systemInstruction }] }
      : systemInstruction;
  }

  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
export async function generateProblemSolutions({ problem, language = 'java', description = null }) {
  const langConfig = SUPPORTED_LANGUAGES.find(l => l.id === language) || SUPPORTED_LANGUAGES[1];
  const descText = description?.description?.replace(/<[^>]*>/g, '') || problem.name;

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

  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const match = rawText.match(/\{[\s\S]*"approaches"[\s\S]*\}/);
  if (!match) throw new Error('Could not parse generated solution format.');

  const parsed = JSON.parse(match[0]);
  if (!parsed.approaches || parsed.approaches.length === 0) {
    throw new Error('No approaches returned in response.');
  }

  parsed.language = langConfig.id;
  return parsed;
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

  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const match = rawText.match(/\{[\s\S]*"description"[\s\S]*\}/);
  if (!match) throw new Error('Could not parse generated description format.');

  return JSON.parse(match[0]);
}
