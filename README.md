# TRACE — See your algorithm think.

<p align="center">
  <b>Interactive Visual DSA Debugger & Technical Interview Readiness Platform</b>
  <br />
  <i>Step-by-step memory, stack, and variable execution visualizer with honest multi-language boundaries and server-mediated AI tutoring.</i>
</p>

---

## 🌟 Overview

**TRACE** is a developer tool designed to bridge the gap between abstract algorithmic code and mental models. Instead of relying on guesswork or static diagrams, TRACE runs your code step-by-step through a client-side execution engine and renders real-time state mutations: arrays, pointers, call stack frames, linked lists, trees, heaps, and hash maps.

### Design System: Amber Terminal
Built with a sleek developer-first aesthetic:
- **Palette**: Neutral graphite (`#090B0E` / `#1C2128`), warm amber execution (`#FF9F43`), subtle teal data semantics (`#38D9C5`).
- **Typography**: JetBrains Mono for code and data displays; clean modern sans for controls.
- **Modes**: True dark mode and high-contrast light mode.

---

## ⚡ Execution Engine & Language Boundaries

TRACE believes in **transparent, honest boundaries** regarding code execution:

| Language | Engine Status | Capabilities |
| :--- | :--- | :--- |
| **Java** (Default) | **AST Tree-Walker Interpreter (v1.0)** | Full client-side execution. Supports primitives, arrays, `ArrayList`, `HashMap`, `HashSet`, `LinkedList`, `Stack`, `Queue`, `PriorityQueue` (Min/Max Heaps), recursion, pointers, and full time-travel debugging. |
| **Python** | **Limited Trace Support** | Executable trace support for Two Sum reference pattern. Arbitrary code routes cleanly to an honest notification explaining language boundary. |
| **C++** | **Syntax / Editor Mode** | Monaco syntax highlighting, 3-tier solutions (Brute Force, Better, Optimal), Big-O complexity breakdown, and AI tutoring. |
| **JavaScript** | **Syntax / Editor Mode** | Monaco syntax highlighting, 3-tier solutions, Big-O breakdown, and AI tutoring. |
| **C** | **Syntax / Editor Mode** | Monaco syntax highlighting and reference solutions. |

---

## 🚀 Key Features

### 1. Visual Execution Studio
- **Time-Travel Stepping**: Step forward, step backward, auto-play, scrub directly to steps, adjust playback speed (0.5x to 4x).
- **Execution Safety Protections**: Hard limits on runaway loops (`MAX_STEPS = 1000`) and recursion depth (`MAX_RECURSION_DEPTH = 50`) prevent browser lockups.
- **Multi-Structure Canvas**: Automatically normalizes and visualizes Arrays (with dynamic index pointers), 2D Grids, Linked Lists, Binary Trees, Priority Queues / Heaps, and Hash Maps.
- **Variable Inspector & Call Stack**: Inspect active scope variables, return values, and nested stack frames in real time.

### 2. Curated Problem Roadmap (290 Problems)
- **15 Canonical DSA Categories**: Arrays & Hashing, Two Pointers, Sliding Window, Stack, Binary Search, Linked List, Trees, Tries, Heap / Priority Queue, Backtracking, Graphs, Advanced Graphs, 1D DP, 2D DP, Greedy, Intervals, and Bit Manipulation.
- **3-Tier Solutions**: Every problem includes Brute Force, Better, and Optimal solutions with explicit Time and Space Big-O analysis.
- **1-Click Trace**: Direct launch from problem modals straight into the execution engine.

### 3. Tier-1 Company Intelligence
- Interview frequency, pattern distributions, and difficulty breakdowns for **10 top-tier tech companies**:
  - Google, Meta, Amazon, Microsoft, Apple, Bloomberg, Uber, Netflix, Stripe, ByteDance.
- Filter problem sets by company and recency (Last 30 Days, 6 Months, All Time).

### 4. Technical Interview Simulation Engine
- **Full Mock Interview Flow**: Timed problem sessions with difficulty-calibrated countdowns, Monaco code editor, real-time feedback, and structured submission.
- **Rubric-Based Evaluation**: Assesses Correctness, Time/Space Complexity, Code Quality, and Communication.
- **Hybrid AI & Deterministic Fallback**: Powered by server-side Gemini 3.6 Flash; gracefully degrades to a deterministic algorithmic rubric when offline or unconfigured.
- **Post-Submission Immutability**: Submitted interview sessions are strictly locked to preserve audit integrity.

### 5. TRACE Brain AI Tutor
- **Problem-Grounded Assistance**: Instant algorithmic hints, pattern identification, and edge-case reminders.
- **Zero Client Key Exposure**: All AI requests are mediated server-side through `/api/gemini`.

---

## 🔒 Security & Reliability Architecture

- **Server-Side API Proxy**: Gemini API keys never exist in client-side bundles, headers, or `localStorage`.
- **Key Redaction**: Upstream error messages automatically redact API keys (`key=[REDACTED]`).
- **Input Sanitization**: Markdown and AI output rendered through `DOMPurify` to prevent XSS.
- **Execution Isolation**: In-memory AST tree-walker operates with zero `eval()` or `Function()` constructor usage.
- **State Integrity**: Store resets completely purge stale trace steps, pointers, and memory snapshots upon execution failure or input mutation.

---

## 🛠 Tech Stack

- **Frontend**: React 19, Vite 8, Monaco Editor (`@monaco-editor/react`), Zustand 5, GSAP 3, DOMPurify
- **Backend / Proxy**: Node.js HTTP Server, Google Gemini 3.6 Flash
- **Styling**: Vanilla CSS, Amber Terminal design tokens, fully responsive CSS Grid/Flexbox
- **Testing & Quality**: Oxlint (0 errors across 95 files), 14 regression test suites, CDP browser smoke testing

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
To enable live Gemini AI tutoring and dynamic interview evaluations, configure your API key:
```bash
cp .env.example .env
```
Edit `.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
*(Get a free key from [Google AI Studio](https://aistudio.google.com/app/apikey). If omitted, TRACE operates seamlessly using its built-in deterministic evaluation engine).*

### 3. Development Mode
```bash
npm run dev
```
Visit [http://localhost:5174](http://localhost:5174) in your browser.

---

## 📦 Production Deployment

### Build the Optimized Client Bundle
```bash
npm run build
```

### Launch Production Server
```bash
npm start
```
The standalone server (`server.js`) serves the optimized static assets from `dist/` and exposes the secure `/api/gemini` proxy on `http://localhost:5174`.

---

## ⚠️ Known Limitations (RC1)

1. **Python Trace Execution Scope**: Python execution is currently limited to the Two Sum reference implementation. Other Python algorithms provide full syntax highlighting and 3-tier solutions but do not generate interactive AST memory steps.
2. **C++ / JavaScript / C Execution**: These languages provide interactive code editing, syntax highlighting, curated 3-tier solutions, and AI hints, but do not execute client-side AST traces.
3. **Bundle Size**: Initial production bundle warning (~1.4 MB) due to Monaco Editor and DOMPurify. Code splitting and lazy chunking are scheduled for post-RC1 optimization.
4. **Interpreter Scope**: The Java interpreter is tailored for DSA algorithms (control flow, recursion, standard collections). It does not support multithreading, networking, or reflection.

---

## 📄 License & Release
- **Release**: `v0.1.0-rc1`
- **License**: MIT
