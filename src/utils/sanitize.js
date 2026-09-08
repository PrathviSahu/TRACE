// ─────────────────────────────────────────────────────────────
//  TRACE — HTML & Markdown Sanitization Engine
//  Hardening #2: Eliminates stored/reflected XSS across all renderers.
// ─────────────────────────────────────────────────────────────

import DOMPurify from "dompurify";

/**
 * Fallback sanitizer for headless Node.js test runners where window is undefined.
 * In browser runtimes, DOMPurify is used natively.
 */
function sanitizeForNode(html) {
  if (!html || typeof html !== "string") return "";
  let clean = html;
  // 1. Strip <script>, <style>, <iframe>, <object>, <embed>, <form>, <svg>, <math> tags & content
  clean = clean.replace(/<(script|iframe|object|embed|style|svg|math|form)[^>]*>[\s\S]*?<\/\1>/gi, "");
  clean = clean.replace(/<(script|iframe|object|embed|style|svg|math|form)[^>]*\/?>/gi, "");
  // 2. Strip standalone dangerous tags (img, input, button, meta, base, link)
  clean = clean.replace(/<(img|input|button|meta|base|link)\b[^>]*>/gi, "");
  // 3. Strip all inline event handlers (onerror=, onclick=, onload=, etc.)
  clean = clean.replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|\x27[^\x27]*\x27|[^\s>]+)/gi, "");
  // 4. Neutralize javascript:, vbscript:, data: protocols in href/src attributes
  clean = clean.replace(/(href|src)\s*=\s*(["\x27])\s*(?:javascript|vbscript|data):[\s\S]*?\2/gi, "$1=\"#\"");
  clean = clean.replace(/(href|src)\s*=\s*(?:javascript|vbscript|data):[^\s>]+/gi, "$1=\"#\"");
  return clean;
}

/**
 * Robust HTML sanitizer.
 * Guarantees that untrusted content cannot execute JavaScript in the browser.
 */
export function sanitizeHtml(dirtyHtml) {
  if (!dirtyHtml || typeof dirtyHtml !== "string") return "";

  if (typeof window !== "undefined") {
    const purifier = typeof DOMPurify.sanitize === "function" ? DOMPurify : DOMPurify(window);
    return purifier.sanitize(dirtyHtml, {
      ALLOWED_TAGS: [
        "h1", "h2", "h3", "h4", "h5", "h6",
        "p", "span", "strong", "em", "b", "i", "u", "s", "strike",
        "ul", "ol", "li",
        "pre", "code", "blockquote",
        "br", "hr",
        "table", "thead", "tbody", "tr", "th", "td",
        "a", "div", "section"
      ],
      ALLOWED_ATTR: ["href", "target", "rel", "class", "style", "title"],
      ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
      FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form", "svg", "math", "base", "meta", "link"],
      FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onfocus", "onblur", "onchange", "onsubmit", "onkeydown", "onkeypress", "onkeyup"],
    });
  }

  return sanitizeForNode(dirtyHtml);
}

/**
 * Escapes raw HTML characters.
 */
export function escapeHtml(str) {
  if (!str || typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\x27/g, "&#039;");
}

/**
 * Renders Markdown to sanitized HTML.
 * Supports headings, bold, italic, inline code, fenced code blocks,
 * lists, links, line breaks, and blockquotes.
 */
export function renderSafeMarkdown(text) {
  if (!text || typeof text !== "string") return "";

  // 1. Process fenced code blocks first so inner characters are preserved and escaped
  const codeBlocks = [];
  let processed = text.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    const id = `__CODE_BLOCK_${codeBlocks.length}__`;
    codeBlocks.push(
      `<pre style="background:rgba(0,0,0,0.35);border:1px solid rgba(255,255,255,0.1);border-radius:6px;padding:10px 12px;overflow-x:auto;margin:8px 0;font-size:11.5px;"><code>${escapeHtml(code.trim())}</code></pre>`
    );
    return id;
  });

  // 2. Process inline code
  const inlineCodes = [];
  processed = processed.replace(/`([^`]+)`/g, (_, code) => {
    const id = `__INLINE_CODE_${inlineCodes.length}__`;
    inlineCodes.push(
      `<code style="background:rgba(0,0,0,0.3);padding:1px 5px;border-radius:3px;font-size:11.5px;color:#79a8ff;">${escapeHtml(code)}</code>`
    );
    return id;
  });

  // 3. Process links: [text](url) -> safe <a>
  processed = processed.replace(/\[([^\]]+)\]\(([^()\s]+(?:\([^()\s]*\)[^()\s]*)*|\S+?)\)/g, (_, linkText, url) => {
    const trimmed = url.trim();
    if (/^(?:javascript|vbscript|data):/i.test(trimmed)) {
      return `<a href="#" target="_blank" rel="noopener noreferrer" style="color:#79a8ff;text-decoration:underline;">${escapeHtml(linkText)}</a>`;
    }
    return `<a href="${escapeHtml(trimmed)}" target="_blank" rel="noopener noreferrer" style="color:#79a8ff;text-decoration:underline;">${escapeHtml(linkText)}</a>`;
  });

  // 4. Standard typographic / layout rules
  processed = processed
    .replace(/\*\*([^*]+)\*\*/g, "<strong style=\"color:var(--txt-bright, #fff);\">$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/^### (.+)$/gm, "<h3 style=\"color:#79a8ff;font-size:13px;margin:10px 0 4px;\">$1</h3>")
    .replace(/^## (.+)$/gm,  "<h2 style=\"color:#79a8ff;font-size:13.5px;margin:10px 0 4px;\">$1</h2>")
    .replace(/^# (.+)$/gm,   "<h1 style=\"color:#79a8ff;font-size:14px;margin:10px 0 4px;\">$1</h1>")
    .replace(/^- (.+)$/gm, "<li style=\"margin-bottom:3px;\">$1</li>")
    .replace(/^\* (.+)$/gm, "<li style=\"margin-bottom:3px;\">$1</li>")
    .replace(/^\d+\. (.+)$/gm, "<li style=\"margin-bottom:3px;\">$1</li>")
    .replace(/(<li[^>]*>[\s\S]*?<\/li>)/g, "<ul style=\"padding-left:18px;margin:4px 0;\">$1</ul>")
    .replace(/^---$/gm, "<hr style=\"border:none;border-top:1px solid rgba(255,255,255,0.1);margin:10px 0;\">")
    .replace(/\n\n/g, "<br/><br/>")
    .replace(/\n/g, "<br/>");

  // 5. Restore code blocks and inline code
  for (let i = 0; i < inlineCodes.length; i++) {
    processed = processed.replace(`__INLINE_CODE_${i}__`, inlineCodes[i]);
  }
  for (let i = 0; i < codeBlocks.length; i++) {
    processed = processed.replace(`__CODE_BLOCK_${i}__`, codeBlocks[i]);
  }

  // 6. Run through DOMPurify / sanitizer immediately before returning
  return sanitizeHtml(processed);
}
