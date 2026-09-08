# TRACE — Interactive Visual DSA Debugger & AI Interview Platform

<p align="center">
  <b>Step-by-step memory, stack, and variable execution visualizer for Data Structures & Algorithms, powered by multi-language adapters and server-side Gemini AI tutoring.</b>
</p>

---

## 🌟 Core Features

### 1. 🔍 Visual DSA Execution Engine
- **Step-by-Step Playback**: Step forward, backward, auto-play, adjust execution speed, or jump directly to critical breakpoints.
- **Dynamic State Tracking**: Live visual memory heap, variable state mutations, call stack inspection, and step-by-step pedagogical explanations.
- **Multi-Language Architecture**: Clean decoupled adapter pattern supporting:
  - ☕ **Java**
  - 🐍 **Python**
  - ⚡ **C++**
  - 🌐 **JavaScript**
  - ⚙ **C**

### 2. 💡 3-Tier Solutions for Every Problem
- **Three Structured Approaches**: Every question features **Brute Force (🔴)** → **Better (🟡)** → **Optimal (🟢)** solutions.
- **Full Big-O Breakdown**: Explicit Time Complexity and Space Complexity analysis with mathematical reasoning for each approach.
- **▶ Trace This**: 1-click button loads any solution directly into the execution engine to visualize and debug it live.
- **On-Demand AI Solution Engine**: Automatically formulates 3 battle-tested approaches in your chosen programming language for any problem on the fly, cached locally for instant return visits.

### 3. 🏢 183 Company-Wise Interview Sets
- Comprehensive company datasets covering **183 tech companies** (Google, Meta, Amazon, Microsoft, Apple, Bloomberg, Uber, and more).
- Over **900 unique LeetCode problems** tagged with real interview frequency and acceptance rates.
- Filter by interview time window: **🔥 Last 30 Days**, **📅 Last 6 Months**, **⏳ > 6 Months**, and **📚 All Time**.

### 4. 🗺 Curated Roadmap (250+ Problems)
- 15 core algorithmic patterns: Arrays, Two Pointers, Sliding Window, Stack, Binary Search, Linked Lists, Trees, Tries, Heaps, Backtracking, Graphs, Dynamic Programming, Intervals, Greedy, and Bit Manipulation.
- Topic progress tracking with difficulty badges (Easy, Medium, Hard).

### 5. 🧠 TRACE Brain & Embedded AI Tutor
- **Problem-Grounded AI Tutor**: Context-aware guidance inside every problem modal with 1-click prompts (*"Give me a subtle hint"*, *"Which pattern fits this best?"*, *"Edge cases to watch out for"*).
- **Persistent Floating Brain Widget**: Available on all pages to answer algorithmic concepts, explain trade-offs, and conduct FAANG-style interview prep.

---

## 🔒 Security Architecture

- **100% Server-Mediated API Proxy**: All Gemini AI interactions are routed strictly through the backend `/api/gemini` proxy.
- **Zero Client Key Exposure**: API keys are never stored in browser storage (`localStorage`), never sent in client request headers, and never bundled into client-side JS.
- **Production & Dev Ready**:
  - `npm run dev`: Handled via Vite development middleware.
  - `npm run preview`: Handled via Vite preview middleware.
  - `npm start`: Handled via standalone native Node production server (`server.js`).

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/PrathviSahu/TRACE.git
cd TRACE
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Copy `.env.example` to `.env` and add your Gemini API key:
```bash
cp .env.example .env
```
Edit `.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
*(Get a free key from [Google AI Studio](https://aistudio.google.com/app/apikey))*.

### 4. Run development server
```bash
npm run dev
```
Open [http://localhost:5174](http://localhost:5174) in your browser.

---

## 📦 Production Deployment

To build and run the optimized production bundle:
```bash
npm run build
npm start
```
The standalone server will serve the production bundle from `dist/` with full `/api/gemini` proxy support.

---

## 🛠 Tech Stack

- **Frontend**: React 19, Vite, GSAP, Monaco Editor, Zustand
- **Backend / Proxy**: Node.js HTTP Server, Google Gemini 3.6 Flash
- **Styling**: Vanilla CSS, Modern Glassmorphism, Responsive Dark Mode
