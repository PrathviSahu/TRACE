import { create } from 'zustand';
import { runJava } from '../engine/interpreter.js';
import { runPython } from '../engine/pythonRunner.js';
import { MULTI_LANG_EXAMPLES } from '../engine/multiLangExamples.js';

const getInitialTheme = () => {
  if (typeof window !== "undefined" && window.localStorage) {
    const saved = localStorage.getItem("trace_theme");
    if (saved === "light" || saved === "dark") return saved;
  }
  return "dark";
};

const initialTheme = getInitialTheme();
if (typeof document !== "undefined") {
  document.documentElement.setAttribute("data-theme", initialTheme);
  if (initialTheme === "light") {
    document.documentElement.classList.add("light-theme");
  } else {
    document.documentElement.classList.remove("light-theme");
  }
}

export const useTraceStore = create((set, get) => ({
  // ── Theme State
  theme: initialTheme,
  setTheme: (newTheme) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("trace_theme", newTheme);
      document.documentElement.setAttribute("data-theme", newTheme);
      if (newTheme === "light") {
        document.documentElement.classList.add("light-theme");
      } else {
        document.documentElement.classList.remove("light-theme");
      }
    }
    set({ theme: newTheme });
  },
  toggleTheme: () => {
    const next = get().theme === "dark" ? "light" : "dark";
    get().setTheme(next);
  },

  // ── Language & Active Selection
  language: 'python', // 'python' | 'java' | 'cpp'
  activeExampleId: 'two-sum',
  activeTab: 'Two Sum',
  viewMode: 'visualization', // 'visualization' | 'dry-run' | 'code-flow'
  outputTab: 'output',       // 'output' | 'logs'
  inputText: "nums = [2, 7, 11, 15]\ntarget = 9",

  // ── Code & inputs
  code: MULTI_LANG_EXAMPLES['two-sum'].python,
  inputs: { nums: '[2, 7, 11, 15]', target: '9' },

  setLanguage: (lang) => {
    const { activeExampleId } = get();
    const ex = MULTI_LANG_EXAMPLES[activeExampleId] || MULTI_LANG_EXAMPLES['two-sum'];
    const newCode = lang === 'python' ? ex.python : ex.java;
    set({
      language: lang,
      code: newCode,
      status: 'idle',
      trace: [],
      currentStep: 0,
      isPlaying: false
    });
    // Auto-run to show immediate visualization
    setTimeout(() => get().run(), 50);
  },

  selectExample: (id) => {
    const ex = MULTI_LANG_EXAMPLES[id];
    if (!ex) return;
    const { language } = get();
    const code = language === 'python' ? ex.python : ex.java;
    set({
      activeExampleId: id,
      activeTab: ex.name,
      code,
      inputText: ex.defaultInputDisplay,
      inputs: ex.inputs.javaInputs || {},
      status: 'idle',
      trace: [],
      currentStep: 0,
      isPlaying: false
    });
    setTimeout(() => get().run(), 50);
  },

  setCode: (code) => set({ code }),
  setInputText: (text) => set({ inputText: text }),
  setInput: (name, value) => set(s => ({ inputs: { ...s.inputs, [name]: value } })),
  setInputs: (inputs) => set({ inputs }),
  setViewMode: (viewMode) => set({ viewMode }),
  setOutputTab: (outputTab) => set({ outputTab }),

  // ── Execution state
  status: 'idle',   // idle | running | done | error
  error: null,
  trace: [],
  currentStep: 0,
  returnValue: undefined,
  outputs: [],

  // ── Playback
  isPlaying: false,
  speed: 1,
  playTimer: null,

  // ── Run
  run: () => {
    const { code, inputs, inputText, language } = get();
    set({ status: 'running', error: null, isPlaying: false });

    setTimeout(() => {
      try {
        let result;
        // Strict language dispatch — no heuristic sniffing.
        // C++ and JavaScript are editor-only; routing them to runJava would produce
        // confusing errors. Surface a clear notice instead.
        if (language === 'python') {
          result = runPython(code, inputText);
        } else if (language === 'java') {
          result = runJava(code, inputs);
        } else {
          // Editor-only languages (cpp, javascript, etc.)
          result = {
            trace: [
              {
                step: 1,
                line: 1,
                type: 'editor_only',
                variables: {},
                dataStructures: {},
                callStack: [],
                explanation: {
                  lineText: `// ${language.toUpperCase()} Editor Mode`,
                  summary: `${language.toUpperCase()} is available as an editor in TRACE. Execution and step-through are supported for Java and Python (Two Sum).`,
                  bullets: [
                    'Syntax highlighting and code editing are active.',
                    'Switch to ☕ Java for full execution tracing.',
                    'Switch to 🐍 Python for Two Sum step-through.'
                  ],
                  why: `TRACE does not yet include a ${language.toUpperCase()} execution engine.`
                }
              }
            ],
            output: [`[${language.toUpperCase()} Editor Mode] Execution not available. Switch to Java or Python.`],
            returnValue: null
          };
        }

        set({
          trace: result.trace,
          outputs: result.output || [],
          returnValue: result.returnValue,
          status: 'done',
          currentStep: 0,
        });
      } catch (e) {
        set({ status: 'error', error: e.message });
      }
    }, 10);
  },

  // ── Navigation
  goToStep: (idx) => {
    const { trace } = get();
    if (!trace || trace.length === 0) return;
    const clamped = Math.max(0, Math.min(idx, trace.length - 1));
    set({ currentStep: clamped });
  },
  next: () => {
    const { currentStep, trace } = get();
    if (trace && currentStep < trace.length - 1) set({ currentStep: currentStep + 1 });
  },
  prev: () => {
    const { currentStep } = get();
    if (currentStep > 0) set({ currentStep: currentStep - 1 });
  },
  first: () => set({ currentStep: 0 }),
  last: () => {
    const { trace } = get();
    if (trace && trace.length > 0) set({ currentStep: trace.length - 1 });
  },

  reset: () => {
    const { playTimer } = get();
    if (playTimer) clearInterval(playTimer);
    set({ currentStep: 0, isPlaying: false, playTimer: null });
  },

  setSpeed: (speed) => set({ speed }),

  play: () => {
    const { isPlaying, playTimer } = get();
    if (isPlaying) {
      clearInterval(playTimer);
      set({ isPlaying: false, playTimer: null });
      return;
    }
    const timer = setInterval(() => {
      const { currentStep, trace } = get();
      if (!trace || currentStep >= trace.length - 1) {
        clearInterval(timer);
        set({ isPlaying: false, playTimer: null });
        return;
      }
      set({ currentStep: currentStep + 1 });
    }, 1000 / get().speed);
    set({ isPlaying: true, playTimer: timer });
  },

  pause: () => {
    const { playTimer } = get();
    if (playTimer) clearInterval(playTimer);
    set({ isPlaying: false, playTimer: null });
  },

  // ── Current step data
  currentStepData: () => {
    const { trace, currentStep } = get();
    return trace && trace[currentStep] ? trace[currentStep] : null;
  },
}));

// Initialize initial trace run immediately
setTimeout(() => {
  useTraceStore.getState().run();
}, 0);

if (import.meta.env.DEV && typeof window !== "undefined") {
  window.__traceStore = useTraceStore;
}
