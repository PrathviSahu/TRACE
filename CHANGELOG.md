# Changelog

All notable changes to the TRACE platform are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
