# TRACE — See your algorithm think.

<p align="center">
  <img src="src/assets/hero.png" alt="TRACE — Visual DSA Debugger" width="850" />
</p>

<p align="center">
  <b>Interactive Visual DSA Debugger & Technical Interview Readiness Platform</b>
  <br />
  <i>Step-by-step memory, stack, and variable execution visualizer with honest language boundaries, true sliding-window rate limiting, and server-mediated AI tutoring.</i>
</p>

<p align="center">
  <a href="https://trace-algo-three.vercel.app"><img src="https://img.shields.io/badge/Live_Demo-Production-FF9F43?style=flat-square" alt="Live Demo" /></a>
  <a href="https://github.com/PrathviSahu/TRACE/releases/tag/v0.1.0-rc1.2"><img src="https://img.shields.io/badge/Release-v0.1.0--rc1.2-38D9C5?style=flat-square" alt="Release v0.1.0-rc1.2" /></a>
  <img src="https://img.shields.io/badge/Tests-100%25_Passing-brightgreen?style=flat-square" alt="Tests 100% Passing" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="License MIT" />
</p>

---

## 🌟 Overview

**TRACE** is a high-performance developer tool designed to bridge the gap between abstract algorithmic code and mental models. Instead of relying on mental tracing or static slide animations, TRACE parses and executes your code step-by-step through a client-side tree-walking interpreter, rendering real-time state mutations across native arrays, object reference graphs, pointer chains, recursion call-stack frames, and complex data structures.

### Design System: Amber Terminal
Crafted with a distraction-free, terminal-inspired aesthetic:
- **Palette**: Neutral graphite canvas (`#090B0E` / `#1C2128`), signature amber execution highlight (`#FF9F43`), and crisp teal data semantics (`#38D9C5`).
- **Typography**: JetBrains Mono for code, memory addresses, and data cells; modern sans for responsive controls.
- **Dynamic Resizing**: Every box and container is dynamic and fluidly resizable by dragging horizontal and vertical splitters.

---

## ⚡ Execution Engine & Language Boundaries

TRACE enforces **transparent, honest boundaries** regarding code execution:

| Language | Engine Status | Capabilities | Language Specification |
| :--- | :--- | :--- | :--- |
| **Java** (Default) | **AST Tree-Walker Interpreter (v1.0)** | Full client-side execution. Supports primitives, 1D/2D native arrays, `ArrayList`, `HashMap`, `HashSet`, `Stack`, `Queue`, `PriorityQueue` (Min/Max Heaps with lambdas), custom classes, pointer mutations, recursion, and bidirectional time-travel debugging. | [TRACE Java Subset v1 Specification](docs/JAVA_SUBSET_SPEC.md) |
| **Python** | **Limited Trace Support** | Bounded executable trace support for the Two Sum reference pattern. Arbitrary Python code routes cleanly to an honest notification explaining language boundary. | Reference Interpreter |
| **C++** | **Syntax / Editor Mode** | Monaco syntax highlighting, curated 3-tier solutions (Brute Force, Better, Optimal), Big-O complexity breakdown, and interactive AI tutoring. | Syntax Mode |
| **JavaScript** | **Syntax / Editor Mode** | Monaco syntax highlighting, 3-tier solutions, Big-O breakdown, and AI tutoring. | Syntax Mode |
| **C** | **Syntax / Editor Mode** | Monaco syntax highlighting and curated reference solutions. | Syntax Mode |

> [!NOTE]
> For the complete formal grammar, supported collections, and defensive limits of the Java engine, see the **[TRACE Java Subset v1 Specification](docs/JAVA_SUBSET_SPEC.md)**.

---

## 🚀 Key Features

### 1. Visual Execution Studio
- **Draggable Multi-Split Layout**:
  - Horizontal splitter between Monaco Editor and Visualizer Studio (20%–80%).
  - Vertical splitter between upper workspace and bottom panels (260px–800px).
  - 3 column splitters between Input, Variables, Call Stack, and Output/Logs cards.
  - Sidebar edge resizer (160px–400px) and bottom panels vertical height resizer.
  - Automatic Monaco editor relayout synchronization and session persistence via `localStorage`.
- **Bidirectional Time-Travel Debugger**: Step forward, step backward, auto-play, scrub directly to steps, and adjust playback speed (0.5x to 4x).
- **Dedicated View Modes**:
  - **Step Visualizer**: Interactive canvas visualizing arrays, pointers, linked lists, trees, and heaps.
  - **Dry Run Trace Table**: Comprehensive tabular trace recording line-by-line variable changes and loop iterations with focused spotlight navigation.
  - **Code Flow Heatmap**: Execution frequency and density visualization across every line of code.

### 2. Comprehensive Data Structure Visualization
- **1D & 2D Arrays**: Color-coded indices, read/write highlights, active pointer tags (`i`, `j`, `left`, `right`).
- **Linked Lists**: Pointer arrows, `val` cells, and dynamic reference mutation (`node.next = ...`).
- **Binary Trees**: Hierarchical tree layout with parent-child edges and traversal paths.
- **PriorityQueue & Heaps**: Min-heap and max-heap tree diagrams with comparator tracking.
- **HashMaps & HashSets**: Key-value bucket visualizations and membership indicators.
- **Call Stack**: Interactive stack frames displaying active parameters, lexical scope variables, and return unwinding.

### 3. Technical Interview Preparation & Intelligence
- **Deterministic Seeded Roadmaps**: Daily study plan generation powered by `mulberry32` PRNG for 100% reproducible interview paths.
- **Tier-1 Company Intelligence**: Curated frequency distributions and recency filters for 10 top tech companies (Google, Meta, Amazon, Microsoft, Apple, Bloomberg, Uber, Netflix, Stripe, ByteDance).
- **Timed Mock Interview Simulator**: Real-time timed rounds with rubric scoring across Correctness, Complexity, Code Quality, and Communication.
- **Embedded AI Tutor (ARIA)**: Context-aware progressive hints and complexity explanations routed via secure server proxy.

---

## 🔒 Security & Reliability Architecture

- **Server-Side API Proxy**: Gemini API keys are never exposed in client bundles, headers, or browser storage.
- **True Sliding-Window Rate Limiting**: `server/geminiProxy.js` maintains millisecond timestamp sliding windows (30 req/min/IP) with dynamic `Retry-After` headers.
- **Trusted-Proxy Resolution**: `getClientIp` inspects reverse proxy headers (`X-Forwarded-For`) only when configured (`TRUST_PROXY=true` or on Vercel), defaulting to socket addresses to bar client header spoofing.
- **Path Traversal Containment**: `server/pathUtils.js` encapsulates strict `dist` directory boundary resolution, rejecting directory escape attempts (`../../`).
- **Decoupled AI Schema Validation**: Raw AI responses are strictly validated for required keys and code strings before application state is touched.
- **Formal Trace Step Guard**: Emitted interpreter steps are validated against `traceSchema.js` at runtime.
- **Zero eval() Execution**: AST tree-walking interpreter operates with complete process isolation and zero dynamic string code evaluation.

---

## 🛠 Tech Stack

- **Frontend**: React 19, Vite 8, Monaco Editor (`@monaco-editor/react`), Zustand 5, GSAP 3, DOMPurify
- **Backend / Proxy**: Node.js HTTP Server, Google Gemini 2.5 Flash
- **Styling**: Vanilla CSS, Amber Terminal design tokens, resizable CSS Flexbox/Grid
- **Quality & Testing**: 9 comprehensive remediation suites, 11 Java subset contract tests, 41 visualizer contract tests, Oxlint

---

## 🏁 Quickstart

### Prerequisites
- Node.js `>= 18.0.0`
- npm `>= 9.0.0`

### 1. Clone & Install
```bash
git clone https://github.com/PrathviSahu/TRACE.git
cd TRACE
npm install
```

### 2. Environment Configuration (Optional)
To enable live Gemini AI tutoring and dynamic interview evaluations:
```bash
cp .env.example .env
```
Edit `.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
*(Get a free key from [Google AI Studio](https://aistudio.google.com/app/apikey). If omitted, TRACE operates seamlessly using its built-in deterministic evaluation engine).*

### 3. Development Server
```bash
npm run dev
```
Visit [http://localhost:5174](http://localhost:5174) in your browser.

---

## 🧪 Testing & Verification

Run the automated test suites:
```bash
# Run Comprehensive Code Review Remediation Suite (9 suites)
node scripts/test_code_review_remediation.js

# Run Java Subset Specification Contract Suite (11 suites)
node scripts/test_java_subset_spec_contract.js

# Run Visualizer Contract Regression Suite (41 tests)
node scripts/test_hardening_visualizer_contract.js
```

---

## 📦 Production Deployment

### Build Client Bundle
```bash
npm run build
```

### Run Standalone Production Server
```bash
npm start
```
The standalone server serves the optimized static bundle from `dist/` and exposes the secure `/api/gemini` proxy on `http://localhost:5174`.

---

## 📚 Documentation Index

- **[Java Subset v1 Specification](docs/JAVA_SUBSET_SPEC.md)**: Supported grammar, collections, and defensive limits.
- **[Release Notes v0.1.0-rc1.2](docs/RELEASE_NOTES_v0.1.0-rc1.2.md)**: Detailed changelog of the RC1.2 release.
- **[Changelog](CHANGELOG.md)**: Full chronological release history.

---

## 📄 License
MIT License. Open source and built for learners and engineers worldwide.
