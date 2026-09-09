# Release Notes — TRACE v0.1.0-rc1.2

**Date:** September 10, 2026  
**Release Tag:** `v0.1.0-rc1.2`  
**Product:** TRACE — See your algorithm think.  
**Live Production URL:** [https://trace-algo-three.vercel.app](https://trace-algo-three.vercel.app)

---

## Executive Summary

TRACE `v0.1.0-rc1.2` is a major hardening and architectural milestone. Following a rigorous senior-level code review, this release eliminates silent failures across the execution pipeline, implements production-grade security (path traversal containment and true sliding-window IP rate limiting), establishes a formal contract schema for trace visualizers, formalizes the **TRACE Java Subset v1** specification, and introduces fully draggable, resizable layout splitters across the entire studio workspace.

---

## What Changed in v0.1.0-rc1.2

### 1. Execution Engine Integrity (Zero Silent Failures)
- **Lexer Error Reporting**: Replaced silent character skipping with `LexerError`, capturing `line`, `column`, and formatted code pointers (`^`).
- **Parser Language Boundary**: Replaced silent `null` literal fallbacks with `UnsupportedSyntaxError`. Added explicit guards for unsupported Java constructs (`try/catch`, `throw`, `switch`, `synchronized`, `interface`).
- **Runtime Strictness**: Replaced `default: return null;` in the interpreter with explicit `RuntimeError` reporting.
- **Multi-Dimensional Arrays**: Added parser and interpreter support for 2D array declarations (`new int[r][c]`) with row-column cell access.

### 2. Formal Trace Contract Schema
- Created `src/engine/traceSchema.js` with `validateTraceStep()` to strictly enforce contract shapes between the runtime interpreter and downstream visualizers.

### 3. Production Security & Proxy Architecture
- **True Sliding-Window Rate Limiting**: Implemented in `server/geminiProxy.js` using millisecond timestamp arrays (30 req/min/IP) with dynamic `Retry-After` headers.
- **Trusted-Proxy Client IP Resolution**: `getClientIp(req, trustProxy)` distinguishes between cloud edge environments (Vercel) and standalone servers to prevent `X-Forwarded-For` header spoofing.
- **Encapsulated Static Path Resolver**: Extracted `resolveSafeStaticPath` in `server/pathUtils.js`, strictly barring path traversal (`../../`).
- **Sanitized Model Allowlist**: Replaced invalid model names with production Gemini models (`gemini-2.5-flash` default).

### 4. Deterministic Intelligence & AI Validation
- **Deterministic PRNG**: Replaced `Math.random()` with `mulberry32` in `intelligenceService.js` so mock interview sets are 100% reproducible for a given seed.
- **Decoupled AI Validator**: Separated pure schema validation (`validateSolutionResponse`) from default values (`normalizeSolutionDefaults`).
- **System Prompt Alignment**: Aligned ARIA tutor prompt to state: *"supporting Java AST interpretation and limited Python trace support"*.

### 5. Draggable Resizable Studio Layout
- Horizontal splitter between Code Editor and Visualizer Studio (20%–80%).
- Vertical splitter between upper workspace and bottom panels (260px–800px).
- Column splitters between Input, Variables, Call Stack, and Output/Logs cards.
- Sidebar edge resizer (160px–400px) and bottom panels height resizer.
- Automatic Monaco editor relayout synchronization and session persistence via `localStorage`.

### 6. Formal Specifications & Test Verification
- Published [`docs/JAVA_SUBSET_SPEC.md`](./JAVA_SUBSET_SPEC.md) detailing supported vs. unsupported language boundaries.
- 11/11 contract tests passing in `scripts/test_java_subset_spec_contract.js`.
- 9/9 comprehensive remediation tests passing in `scripts/test_code_review_remediation.js`.
