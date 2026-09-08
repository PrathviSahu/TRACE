// ─────────────────────────────────────────────────────────────
//  TRACE — Hardening #2 Test Suite: XSS Elimination & Safe Markdown
// ─────────────────────────────────────────────────────────────

import assert from "node:assert/strict";
import { sanitizeHtml, renderSafeMarkdown, escapeHtml } from "../src/utils/sanitize.js";

console.log("=================================================");
console.log("TRACE — Hardening #2: XSS Security & Markdown Test Suite");
console.log("=================================================\n");

let passed = 0;
function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
    process.exit(1);
  }
}

// ──────────────────────────────────────────────────────────────
// 1. SECURITY ATTACK VECTORS
// ──────────────────────────────────────────────────────────────

test("Security: <script> tag payload is neutralized and does not render executable script", () => {
  const payload = `<script>alert("XSS")</script>`;
  const rendered = renderSafeMarkdown(payload);
  const directSanitized = sanitizeHtml(payload);

  assert.equal(rendered.includes("<script"), false, "Rendered output must not contain <script");
  assert.equal(rendered.includes("alert("), false, "Rendered output must not contain script content");
  assert.equal(directSanitized.includes("<script"), false, "Direct sanitized must not contain <script");
});

test("Security: <img onerror=...> event handler injection is completely stripped", () => {
  const payload = `<img src=x onerror=alert("XSS")>`;
  const rendered = renderSafeMarkdown(payload);
  const directSanitized = sanitizeHtml(payload);

  assert.equal(rendered.includes("onerror"), false, "Rendered output must not contain onerror attribute");
  assert.equal(directSanitized.includes("onerror"), false, "Direct sanitized must not contain onerror attribute");
});

test("Security: <div onclick=...> event handler attribute is stripped from elements", () => {
  const payload = `<div onclick="alert('XSS')">Safe text</div>`;
  const rendered = renderSafeMarkdown(payload);
  const directSanitized = sanitizeHtml(payload);

  assert.equal(rendered.includes("onclick"), false, "Rendered output must not contain onclick attribute");
  assert.equal(rendered.includes("Safe text"), true, "Safe inner text must be preserved");
  assert.equal(directSanitized.includes("onclick"), false, "Direct sanitized must not contain onclick attribute");
});

test("Security: Markdown link with javascript: URI protocol is neutralized", () => {
  const payload = `[Click here](javascript:alert("XSS"))`;
  const rendered = renderSafeMarkdown(payload);

  assert.equal(/href\s*=\s*["']javascript:/i.test(rendered), false, "Rendered link must not have javascript: protocol");
  assert.equal(rendered.includes("alert("), false, "Rendered link must not contain javascript payload in href");
  assert.equal(rendered.includes("Click here"), true, "Link text must be preserved");
});

test("Security: Raw <a href=\"javascript:...\"> HTML tag is neutralized", () => {
  const payload = `<a href="javascript:alert('XSS')">Click</a>`;
  const rendered = renderSafeMarkdown(payload);
  const directSanitized = sanitizeHtml(payload);

  assert.equal(/href\s*=\s*["']javascript:/i.test(rendered), false, "Raw link must not have javascript: protocol");
  assert.equal(rendered.includes("Click"), true, "Link anchor text must be preserved");
  assert.equal(/href\s*=\s*["']javascript:/i.test(directSanitized), false, "Sanitized link must not have javascript:");
});

test("Security: <iframe> and <object> embedded tags are completely removed", () => {
  const payload = `<iframe src="javascript:alert(1)"></iframe><object data="test.swf"></object>`;
  const rendered = renderSafeMarkdown(payload);
  const directSanitized = sanitizeHtml(payload);

  assert.equal(rendered.includes("<iframe"), false, "Rendered must not contain iframe");
  assert.equal(rendered.includes("<object"), false, "Rendered must not contain object");
  assert.equal(directSanitized.includes("<iframe"), false, "Sanitized must not contain iframe");
  assert.equal(directSanitized.includes("<object"), false, "Sanitized must not contain object");
});

// ──────────────────────────────────────────────────────────────
// 2. LEGITIMATE DSA MARKDOWN RENDERING
// ──────────────────────────────────────────────────────────────

test("Legitimate: Headings 1, 2, and 3 render proper structural HTML tags", () => {
  const md = `# Main Title\n## Secondary Title\n### Minor Title`;
  const html = renderSafeMarkdown(md);

  assert.equal(html.includes("<h1"), true, "Should render <h1> tag");
  assert.equal(html.includes("Main Title</h1>"), true, "Should contain Main Title text");
  assert.equal(html.includes("<h2"), true, "Should render <h2> tag");
  assert.equal(html.includes("Secondary Title</h2>"), true, "Should contain Secondary Title text");
  assert.equal(html.includes("<h3"), true, "Should render <h3> tag");
  assert.equal(html.includes("Minor Title</h3>"), true, "Should contain Minor Title text");
});

test("Legitimate: Bold and Italic text formatting render correctly", () => {
  const md = `Use a **HashMap** for *O(1)* lookups.`;
  const html = renderSafeMarkdown(md);

  assert.equal(html.includes("<strong"), true, "Should render <strong> tag");
  assert.equal(html.includes("HashMap</strong>"), true, "Should bold HashMap");
  assert.equal(html.includes("<em>O(1)</em>"), true, "Should italicize O(1)");
});

test("Legitimate: Inline code formatting renders properly", () => {
  const md = `Call \`nums.length\` to get the size.`;
  const html = renderSafeMarkdown(md);

  assert.equal(html.includes("<code"), true, "Should render <code> tag");
  assert.equal(html.includes("nums.length</code>"), true, "Should preserve code text exactly");
});

test("Legitimate: Fenced code blocks with language annotations preserve indentation and syntax", () => {
  const md = "```java\nclass Solution {\n    public int twoSum(int[] nums) {\n        return 0;\n    }\n}\n```";
  const html = renderSafeMarkdown(md);

  assert.equal(html.includes("<pre"), true, "Should render <pre> tag");
  assert.equal(html.includes("<code"), true, "Should render <code> tag inside pre");
  assert.equal(html.includes("class Solution"), true, "Should preserve class Solution code");
  assert.equal(html.includes("twoSum(int[] nums)"), true, "Should preserve method code");
});

test("Legitimate: Unordered and ordered lists render proper <ul> and <li> tags", () => {
  const md = `- O(n) time\n- O(n) space\n\n1. First step\n2. Second step`;
  const html = renderSafeMarkdown(md);

  assert.equal(html.includes("<ul"), true, "Should render <ul> tag");
  assert.equal(html.includes("<li"), true, "Should render <li> tags");
  assert.equal(html.includes("O(n) time</li>"), true, "Should preserve list text");
  assert.equal(html.includes("First step</li>"), true, "Should preserve ordered item text");
});

test("Legitimate: Safe HTTPS links render with target=_blank and rel=noopener", () => {
  const md = `Check the official documentation at [LeetCode](https://leetcode.com/problems/two-sum).`;
  const html = renderSafeMarkdown(md);

  assert.equal(html.includes('href="https://leetcode.com/problems/two-sum"'), true, "Should render valid safe href");
  assert.equal(html.includes('target="_blank"'), true, "Should open link in new tab");
  assert.equal(html.includes('rel="noopener noreferrer"'), true, "Should include secure rel attributes");
  assert.equal(html.includes("LeetCode</a>"), true, "Should render link text");
});

test("Legitimate: Complete realistic DSA tutor explanation renders cleanly", () => {
  const realisticTutorOutput = `## Optimal Approach: One-Pass Hash Table

We can solve this in **O(n) time** by inspecting each element once.

\`\`\`java
class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[0];
    }
}
\`\`\`

### Complexity
- **Time Complexity**: \`O(n)\`
- **Space Complexity**: \`O(n)\`
`;

  const html = renderSafeMarkdown(realisticTutorOutput);

  assert.equal(html.includes("<h2"), true, "Header 2 present");
  assert.equal(html.includes("<h3"), true, "Header 3 present");
  assert.equal(html.includes("<strong"), true, "Bold tags present");
  assert.equal(html.includes("<pre"), true, "Code block present");
  assert.equal(html.includes("<ul"), true, "List block present");
  assert.equal(html.includes("One-Pass Hash Table"), true, "Title preserved");
  assert.equal(html.includes("map.containsKey(complement)"), true, "Code content preserved");
  // Invariant: no script, no onerror, no onload
  assert.equal(/<script|onerror|onclick|onload/i.test(html), false, "No dangerous tokens in output");
});

console.log("\n-------------------------------------------------");
console.log(`Hardening #2 Tests Completed: ${passed}/13 PASSED`);
console.log("-------------------------------------------------");
console.log("ALL HARDENING #2 SECURITY & MARKDOWN TESTS PASSED! 🛡️\n");
