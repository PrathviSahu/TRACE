# Changelog

All notable changes to the TRACE platform are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0-rc1.2] - 2026-09-10

### Added
- **Formal TRACE Java Subset v1 Specification**:
  - Published comprehensive language specification in `docs/JAVA_SUBSET_SPEC.md`.
  - Added 11/11 contract verification suite in `scripts/test_java_subset_spec_contract.js`.
- **Multi-Dimensional Native Array Allocation**:
  - Added support in parser and runtime interpreter for 2D array declarations (`new int[r][c]`, `new boolean[r][c]`) with nested row-column indexing.
- **Draggable Resizable Studio Layout**:
  - Horizontal splitter between Code Editor and Visualizer Studio (20%–80%).
  - Vertical splitter between upper workspace and bottom panels (260px–800px).
  - Column splitters between Input, Variables, Call Stack, and Output/Logs cards.
  - Sidebar edge resizer (160px–400px) and bottom panels height resizer.
  - Automatic Monaco editor relayout synchronization on drag release.
  - Session layout persistence across browser refreshes via `localStorage`.
- **Dedicated Dry Run & Code Flow Views**:
  - Dedicated step-by-step Trace Table with spotlighting.
  - Code Flow Heatmap visualizing execution density across code lines.
- **Collapsible Sidebar**:
  - Floating edge expander and `Ctrl+B` / `Cmd+B` shortcut for distraction-free workspace.
- **Formal Trace Step Contract Guard**:
  - Added `src/engine/traceSchema.js` validating every emitted trace step at interpreter emission time.
- **Deep Reference Tests**:
  - Added multi-frame recursion (`fib(7) == 13`), boolean short-circuiting (`false && (1/0 == 0)`), and collections runtime suites.

### Changed
- **Strict Error Handling (Zero Silent Failures)**:
  - Lexer throws `LexerError` with line, column, and visual pointer `^` on invalid characters (eliminated silent skips).
  - Parser throws `UnsupportedSyntaxError` with line and column for constructs outside TRACE Java Subset v1 (`try/catch`, `throw`, `switch`, `synchronized`, `interface`).
  - Interpreter throws descriptive `RuntimeError` instead of falling back to `null` for unknown AST statements/expressions.
- **Security & Proxy Unification**:
  - Extracted shared proxy middleware to `server/geminiProxy.js` shared by Node server and Vite dev server.
  - Implemented true sliding-window IP rate limiter (`30 requests / minute / IP`) using timestamp arrays.
  - Implemented trusted-proxy client IP resolution (`getClientIp`), protecting standalone servers from spoofed `X-Forwarded-For` headers.
  - Encapsulated safe static path resolver (`server/pathUtils.js`), blocking directory traversal attacks (`../../`, `/..%2F..%2F`).
  - Sanitized Gemini model allowlist to production models (`gemini-2.5-flash` default).
- **Deterministic Intelligence**:
  - Replaced `Math.random()` in `intelligenceService.js` with `mulberry32` seeded PRNG for 100% reproducible mock interview sets.
- **AI Validation Decoupling**:
  - Decoupled pure semantic validation (`validateSolutionResponse`) from normalization defaults (`normalizeSolutionDefaults`).
  - Aligned ARIA system prompt to accurately declare Java AST interpretation and limited Python trace support.

## [0.1.0-rc1.1] - 2026-09-09

### Added
- Interactive ARIA guidance buttons in Variables, Call Stack, and Output panels.
- Universal style reset to eliminate white edges and scrollbar corners on high-DPI displays.

### Fixed
- Fixed API key loading across `configDir` and `cwd` in Vite development proxy.

## [0.1.0-rc1] - 2026-09-09

### Added
- **Amber Terminal Visual Design System**:
  - Full developer-tool theme tokens: graphite (#090B0E / #1C2128), warm amber execution (#FF9F43), and teal data semantics (#38D9C5).
  - True dark and light modes with persistent local preference.
  - Developer Observability Hub showcasing live architecture metrics (15 categories, 290 problems, AST interpreter status).
- **Core Java AST Execution Engine (v1.0)**:
  - Client-side tree-walker interpreter supporting variables, loops, conditionals, arrays, dynamic lists, `HashMap`, `HashSet`, binary trees, and `PriorityQueue` (Min/Max Heaps).
  - Call stack inspector with frame tracking and parameter/variable scopes.
  - Time-travel debugger with bidirectional stepping, auto-play, scrub controls, and speed adjustments.
- **Execution Safety Protections**:
  - Runaway loop protection capped at `MAX_STEPS = 1000`.
  - Recursion depth limit capped at `MAX_RECURSION_DEPTH = 50`.
  - Stale trace eviction: guarantees UI purges previous execution steps immediately upon runtime or syntax error.
  - Orphaned play timer cleanup on reset, re-run, or navigation.
- **Honest Language Dispatch**:
  - Java established as default executable engine.
  - Python honestly scoped to limited trace support (Two Sum reference pattern); clear notice provided for arbitrary code.
  - C++, JavaScript, and C supported as high-fidelity syntax/editor modes with 3-tier solutions.
- **Curated Problem Library & Roadmap**:
  - 15 canonical DSA categories comprising 290 LeetCode-standard problems.
  - 3-tier structured solutions (Brute Force, Better, Optimal) with explicit Time and Space Big-O complexity for every problem.
- **Tier-1 Company Intelligence**:
  - 10 top tech companies (Google, Meta, Amazon, Microsoft, Apple, Bloomberg, Uber, Netflix, Stripe, ByteDance) with frequency distributions and recency filters.
- **Technical Interview Simulation Engine**:
  - Full timed mock interview lifecycle (Setup -> Active Session -> Confirmation -> Evaluation -> Result Review).
  - Multi-criteria rubric evaluation (Correctness, Complexity, Code Quality, Communication).
  - Server-mediated Gemini AI proxy with seamless, deterministic offline fallback.
  - Post-submission session immutability.
- **Security & Proxy Architecture**:
  - Standalone Node.js server (`server.js`) with server-side `/api/gemini` proxy.
  - Whitelisted models, 1MB payload limits, and automatic API key redaction.
  - Client-side DOMPurify integration for XSS prevention.

### Changed
- Default editor language switched from Python to Java to match true execution engine capabilities.
- Readiness percentage calculations replaced with verified `Problems Solved / Total Problems` counts.
- Monaco Editor active line highlight updated to amber accent tokens.

### Fixed (Hardenings #1 - #12)
- **#1 - #3**: Normalization and stability of core visualizer canvas across complex data structures.
- **#4**: Array mutation step synchronization and object graph pointer consistency.
- **#5**: Cross-route solved state reactivity and navigation sync between Roadmap and Problems.
- **#6**: PriorityQueue heap invariants and poll/offer visualization step fidelity.
- **#7**: Non-preset user input parsing and execution recovery.
- **#8**: React hook ordering compliance and invalid company slug fallback handling.
- **#9**: Modal, session, and result theme contrast consistency in light mode.
- **#10**: Data Structure Directory and Learn section navigation path preservation.
- **#11**: Python execution boundary honesty and strict language routing.
- **#12**: Execution safety: runaway loop capping, stale trace elimination on error, and timer leak prevention.

### Verification
- 14/14 automated test suites passing.
- 0 lint errors across 95 files via Oxlint.
- Production build verified in 298ms.
- 9-route and 2-flow browser smoke test passing with 0 console errors and 0 network failures.
