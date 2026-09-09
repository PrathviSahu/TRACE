# Release Notes — TRACE v0.1.0-rc1

**Date:** September 9, 2026  
**Release Tag:** v0.1.0-rc1  
**Product:** TRACE — See your algorithm think.

---

## Executive Summary

TRACE v0.1.0-rc1 represents the culmination of all core development phases (Phase 3.1 through 3.4), 12 targeted hardening cycles, the Amber Terminal visual design refresh, and a rigorous Release Candidate 1 readiness audit.

TRACE delivers on its foundational promise:
> **Paste code -> Execute -> Trace -> Visualize -> Understand -> Output**

Crucially, RC1 adheres to **transparent and honest product boundaries**: Java is the default client-side AST execution engine; Python has bounded trace support for Two Sum with honest routing for arbitrary code; C++, JavaScript, and C serve as interactive syntax modes with 3-tier solutions.

---

## Key Highlights

### 1. Amber Terminal Visual Refresh
- Professional developer aesthetics: Graphite canvas (#090B0E), elevated cards (#1C2128), amber execution (#FF9F43), and teal data points (#38D9C5).
- Unified across 9 core routes: Visualizer Studio, Problems Library, Roadmap, Data Structures Directory, Company Intelligence, Company Detail, Learn, Interview Setup, and Interview Plan.
- Cohesive dark and light modes with persistent user preference.

### 2. Java AST Execution Engine (v1.0)
- Client-side tree-walker interpreter supporting 10 verified algorithmic presets and custom algorithmic code.
- Visual memory canvas supporting:
  - 1D / 2D Arrays with index pointers
  - Singly and Doubly Linked Lists
  - HashMaps and HashSets
  - Binary Trees (BST & traversal)
  - PriorityQueues (Min-Heap & Max-Heap)
  - Recursion Call Stack with active frames and variable scopes
- Execution safety: MAX_STEPS = 1000 runaway loop protection, MAX_RECURSION_DEPTH = 50 recursion depth cap, and guaranteed stale trace purge on error.

### 3. Interview Simulation & AI Tutor
- Mock interview engine with timer countdowns, Monaco editor, and submission lifecycle.
- Hybrid scoring via server-side Gemini 3.6 Flash proxy or deterministic fallback rubric when offline.
- Zero client-side API key leakage (.env server-side only; error responses redact API keys).

---

## Verification & Audit Telemetry

| Category | Target | Actual Result | Status |
| :--- | :--- | :--- | :--- |
| **P0 Blockers** | 0 | 0 | PASS |
| **P1 Critical Issues** | 0 | 0 | PASS |
| **P2 Moderate Issues** | 0 | 0 | PASS |
| **P3 Minor Warnings** | 0 | 1 (Bundle size ~1.4MB due to Monaco) | Post-RC1 |
| **Regression Suites** | 14/14 suites | 14 passed (100%) | PASS |
| **Linting** | 0 errors | 0 errors across 95 files (Oxlint) | PASS |
| **Production Build** | Clean | Compiled cleanly in 298ms | PASS |
| **Browser E2E Routes** | 9/9 routes | 9/9 rendered cleanly | PASS |
| **Problem -> Visualizer Flow** | Working | Modal opens, traces Two Sum, Step 1/17 | PASS |
| **Interview Simulation Flow** | Working | Setup -> Session -> Submit -> Evaluation | PASS |
| **Console Errors** | 0 | 0 errors across all routes & flows | PASS |
| **Network Failures** | 0 (excl. unauthed /api) | 0 unexpected failures | PASS |

---

## Known Limitations

1. **Python Execution Scope**: Bounded to the Two Sum reference implementation. Other Python algorithms provide syntax highlighting and reference solutions without client-side AST tracing.
2. **C++ / JavaScript / C Execution**: Supported as interactive syntax/editor modes with 3-tier solutions; client-side AST tracing is not implemented for these languages.
3. **Bundle Chunk Size**: Monaco Editor and DOMPurify contribute ~1.4MB to the initial bundle. Code splitting is deferred to post-RC1 optimizations.
4. **Interpreter Scope**: The Java interpreter is focused on algorithmic problem solving (data structures, loops, recursion, collections) and does not implement Java reflection, threads, or networking.

---

## Verification Artifacts
- walkthrough.md
- rc1_browser_smoke_evidence.json
- CHANGELOG.md
- README.md
