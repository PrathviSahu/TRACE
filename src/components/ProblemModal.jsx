import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTraceStore } from '../store/traceStore.js';
import { getProblemTemplate, PRESET_SOLUTIONS } from '../data/problemTemplates.js';
import { getProblemDescription } from '../data/problemDescriptions.js';
import { getProblemSolutions } from '../data/problemSolutions.js';
import {
  generateProblemSolutions,
  generateProblemDescription,
  callGeminiApi,
  SUPPORTED_LANGUAGES,
  SYSTEM_TUTOR_PROMPT
} from '../services/aiService.js';

const DIFF_COLORS = {
  easy: '#00b8a3',
  medium: '#ffa116',
  hard: '#ef4743',
};

const DIFF_BG = {
  easy: 'rgba(0,184,163,0.12)',
  medium: 'rgba(255,161,22,0.12)',
  hard: 'rgba(239,71,67,0.12)',
};

const APPROACH_COLORS = [
  { name: 'Brute Force', accent: '#ef4743', bg: 'rgba(239,71,67,0.06)', border: 'rgba(239,71,67,0.25)' },
  { name: 'Better',      accent: '#ffa116', bg: 'rgba(255,161,22,0.06)', border: 'rgba(255,161,22,0.25)' },
  { name: 'Optimal',     accent: '#00b8a3', bg: 'rgba(0,184,163,0.06)', border: 'rgba(0,184,163,0.25)' },
];

export default function ProblemModal({ problem, onClose }) {
  const storeLanguage = useTraceStore(s => s.language) || 'java';
  const setStoreLanguage = useTraceStore(s => s.setLanguage);
  const setCode = useTraceStore(s => s.setCode);
  const setInputs = useTraceStore(s => s.setInputs);

  const [selectedLanguage, setSelectedLanguage] = useState(storeLanguage);
  const [activeTab, setActiveTab] = useState('description');
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [expandedApproach, setExpandedApproach] = useState(2);
  const [description, setDescription] = useState(null);
  const [solutions, setSolutions] = useState(null);

  // Dynamic AI generation states
  const [generatingSolutions, setGeneratingSolutions] = useState(false);
  const [genSolutionError, setGenSolutionError] = useState('');
  const [generatingDesc, setGeneratingDesc] = useState(false);
  const [genDescError, setGenDescError] = useState('');

  // AI Tutor states inside modal
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const aiEndRef = useRef(null);

  const navigate = useNavigate();
  const overlayRef = useRef(null);

  // Load problem description & solutions whenever problem or selectedLanguage changes
  useEffect(() => {
    if (!problem) return;

    // 1. Description: check static first, then localStorage
    let desc = getProblemDescription(problem.id, problem.name);
    if (!desc) {
      try {
        const cachedDesc = localStorage.getItem('trace_desc_' + problem.id);
        if (cachedDesc) desc = JSON.parse(cachedDesc);
      } catch (e) {}
    }
    setDescription(desc);

    // 2. Solutions: check language-specific cache first
    let sols = null;
    try {
      const cachedLangSols = localStorage.getItem(`trace_solutions_${problem.id}_${selectedLanguage}`);
      if (cachedLangSols) sols = JSON.parse(cachedLangSols);
    } catch (e) {}

    // If selected language is Java, check static problemSolutions.js
    if (!sols && selectedLanguage === 'java') {
      sols = getProblemSolutions(problem.id, problem.name);
    }

    setSolutions(sols);
    setGeneratingSolutions(false);
    setGenSolutionError('');
    setGeneratingDesc(false);
    setGenDescError('');

    // Reset AI tutor session for this problem
    const langLabel = SUPPORTED_LANGUAGES.find(l => l.id === selectedLanguage)?.label || selectedLanguage;
    setAiMessages([
      {
        role: 'assistant',
        content: `👋 Hi! I'm your AI Tutor for **#${problem.id} ${problem.name}** (${problem.difficulty}).\n\nI can explain concepts, walk through algorithms, or analyze Big-O complexity in **${langLabel}**.\n\nStuck? Pick a prompt below or ask me anything!`,
      }
    ]);
  }, [problem, selectedLanguage]);

  useEffect(() => {
    if (activeTab === 'ai-tutor') {
      aiEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiMessages, activeTab]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!problem) return null;

  function handleOverlayClick(e) {
    if (e.target === overlayRef.current) onClose();
  }

  function handleVisualize(customCode) {
    // Set matching language in store
    if (setStoreLanguage && selectedLanguage) {
      setStoreLanguage(selectedLanguage);
    }

    const codeToUse = customCode || (() => {
      const preset = PRESET_SOLUTIONS[problem.id];
      if (preset && selectedLanguage === 'java') return preset.code;
      const template = getProblemTemplate(problem.name, problem.difficulty);
      if (template?.code) return template.code;
      return null;
    })();

    if (codeToUse) {
      setCode(codeToUse);
      const preset = PRESET_SOLUTIONS[problem.id];
      if (preset?.inputs) setInputs(preset.inputs);
      const template = getProblemTemplate(problem.name, problem.difficulty);
      if (template?.inputs && !preset?.inputs) setInputs(template.inputs);
      onClose();
      navigate('/');
    } else {
      const template = getProblemTemplate(problem.name, problem.difficulty);
      if (template?.code) {
        setCode(template.code);
        if (template.inputs) setInputs(template.inputs);
      }
      onClose();
      navigate('/');
    }
  }

  function copyCode(code, idx) {
    navigator.clipboard.writeText(code);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  }

  async function handleGenerateSolutions() {
    setGeneratingSolutions(true);
    setGenSolutionError('');
    try {
      const res = await generateProblemSolutions({
        problem,
        language: selectedLanguage,
        description
      });
      setSolutions(res);
      setExpandedApproach(res.approaches.length - 1);
      try {
        localStorage.setItem(`trace_solutions_${problem.id}_${selectedLanguage}`, JSON.stringify(res));
      } catch (e) {}
    } catch (err) {
      setGenSolutionError(err.message);
    } finally {
      setGeneratingSolutions(false);
    }
  }

  async function handleGenerateDescription() {
    setGeneratingDesc(true);
    setGenDescError('');
    try {
      const res = await generateProblemDescription({ problem });
      setDescription(res);
      try {
        localStorage.setItem('trace_desc_' + problem.id, JSON.stringify(res));
      } catch (e) {}
    } catch (err) {
      setGenDescError(err.message);
    } finally {
      setGeneratingDesc(false);
    }
  }

  async function sendAiQuestion(text) {
    const q = (text || aiInput).trim();
    if (!q || aiLoading) return;

    setAiInput('');
    setAiError('');
    const newMsgs = [...aiMessages, { role: 'user', content: q }];
    setAiMessages(newMsgs);
    setAiLoading(true);

    const langLabel = SUPPORTED_LANGUAGES.find(l => l.id === selectedLanguage)?.label || selectedLanguage;
    const problemContextPrompt = `${SYSTEM_TUTOR_PROMPT}
The student is viewing:
- Problem: #${problem.id} ${problem.name} (${problem.difficulty})
- Selected Language: ${langLabel}
- Description: ${description?.description?.replace(/<[^>]*>/g, '') || problem.name}
${solutions ? `- 3 Approaches available: Brute Force, Better, Optimal in ${langLabel}.` : ''}

Guidelines:
- Prefer ${langLabel} for any code snippets unless another language is requested.
- Give subtle hints first to encourage active thinking.
- Always include Big-O Time and Space analysis.`;

    try {
      const contents = newMsgs.slice(1).map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      const data = await callGeminiApi({
        systemInstruction: problemContextPrompt,
        contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 1200 }
      });

      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!reply) throw new Error('No response received from AI.');

      setAiMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (e) {
      setAiError(e.message);
      setAiMessages(prev => [...prev, { role: 'assistant', content: `⚠️ **AI Tutor:** ${e.message}` }]);
    } finally {
      setAiLoading(false);
    }
  }

  function openInFloatingBrain() {
    const langLabel = SUPPORTED_LANGUAGES.find(l => l.id === selectedLanguage)?.label || selectedLanguage;
    window.dispatchEvent(new CustomEvent('open-trace-brain', {
      detail: {
        prompt: `I am working on problem #${problem.id} ${problem.name} (${problem.difficulty}) in ${langLabel}. Can you give me a structured walkthrough and hints on how to approach it?`
      }
    }));
  }

  const diff = problem.difficulty;
  const desc = description;
  const hasFull = desc && desc.description;
  const activeLangObj = SUPPORTED_LANGUAGES.find(l => l.id === selectedLanguage) || SUPPORTED_LANGUAGES[0];

  const TABS = [
    { id: 'description', label: '📋 Problem' },
    { id: 'solutions',   label: solutions ? `💡 Solutions (3 · ${activeLangObj.icon})` : `💡 Solutions (${activeLangObj.icon})` },
    { id: 'ai-tutor',    label: '🧠 AI Tutor' },
  ];

  return (
    <div ref={overlayRef} onClick={handleOverlayClick} style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px', animation: 'fadeInOverlay 0.15s ease'
    }}>
      <style>{`
        @keyframes fadeInOverlay { from { opacity:0 } to { opacity:1 } }
        @keyframes slideInModal  { from { opacity:0;transform:translateY(24px) scale(0.97) } to { opacity:1;transform:none } }
        .pm-body::-webkit-scrollbar { width: 5px; }
        .pm-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
        .pm-example { background: rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:14px 16px; margin-bottom:10px; }
        .pm-example pre { margin:0; font-family:var(--mono,'JetBrains Mono',monospace); font-size:12px; color:#c9d1d9; white-space:pre-wrap; word-break:break-all; }
        .pm-section-title { font-size:11px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#6e7681; margin:0 0 10px; }
        .pm-hint-item { background:rgba(255,161,22,0.07); border-left:3px solid rgba(255,161,22,0.5); padding:8px 12px; border-radius:0 6px 6px 0; margin-bottom:6px; font-size:12.5px; color:#c9d1d9; }
        .pm-topic-chip { background:rgba(82,130,255,0.12); color:#79a8ff; border:1px solid rgba(82,130,255,0.25); padding:3px 10px; border-radius:20px; font-size:11px; }
        .pm-company-chip { background:rgba(255,255,255,0.06); color:#8b949e; border:1px solid rgba(255,255,255,0.1); padding:3px 10px; border-radius:20px; font-size:11px; cursor:pointer; transition:all 0.15s; }
        .pm-company-chip:hover { background:rgba(255,161,22,0.1); color:#ffa116; border-color:rgba(255,161,22,0.3); }
        .pm-btn { display:inline-flex; align-items:center; gap:6px; padding:9px 18px; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; border:none; transition:all 0.18s; }
        .pm-btn-primary { background:linear-gradient(135deg,#5282ff,#8b6ff0); color:#fff; }
        .pm-btn-primary:hover { transform:translateY(-1px); box-shadow:0 4px 16px rgba(82,130,255,0.4); }
        .pm-btn-brain { background:rgba(139,111,240,0.15); color:#c792ea; border:1px solid rgba(139,111,240,0.3); }
        .pm-btn-brain:hover { background:rgba(139,111,240,0.25); color:#fff; }
        .pm-btn-lc { background:rgba(255,161,22,0.12); color:#ffa116; border:1px solid rgba(255,161,22,0.25); text-decoration:none; }
        .pm-btn-lc:hover { background:rgba(255,161,22,0.2); }
        .pm-btn-close { background:rgba(255,255,255,0.07); color:#8b949e; }
        .pm-btn-close:hover { background:rgba(255,255,255,0.12); color:#c9d1d9; }
        .pm-tab { padding:10px 18px; font-size:13px; font-weight:600; cursor:pointer; border:none; background:transparent; color:#8b949e; border-bottom:2px solid transparent; transition:all 0.15s; white-space:nowrap; display:flex; align-items:center; gap:6px; }
        .pm-tab:hover { color:#c9d1d9; }
        .pm-tab.active { color:#79a8ff; border-bottom-color:#79a8ff; }
        
        /* Language Selector Pills */
        .pm-lang-bar { display:flex; align-items:center; gap:6px; background:rgba(0,0,0,0.25); padding:3px 6px; border-radius:8px; border:1px solid rgba(255,255,255,0.08); }
        .pm-lang-pill { background:transparent; border:none; color:#8b949e; font-size:11.5px; font-weight:600; padding:4px 8px; border-radius:6px; cursor:pointer; transition:all 0.15s; display:flex; align-items:center; gap:4px; }
        .pm-lang-pill:hover { color:#e6edf3; background:rgba(255,255,255,0.05); }
        .pm-lang-pill.active { color:#fff; background:linear-gradient(135deg,#5282ff,#8b6ff0); box-shadow:0 2px 8px rgba(82,130,255,0.3); }

        .approach-card { border-radius:10px; overflow:hidden; margin-bottom:12px; transition:all 0.2s; }
        .approach-header { display:flex; align-items:center; gap:10px; padding:12px 16px; cursor:pointer; user-select:none; }
        .approach-header:hover { filter:brightness(1.1); }
        .approach-title { font-size:14px; font-weight:700; flex:1; }
        .approach-complexity { display:flex; gap:8px; }
        .complexity-chip { font-size:11px; font-family:var(--mono,monospace); padding:2px 8px; border-radius:4px; background:rgba(255,255,255,0.08); color:#8b949e; }
        .approach-body { padding:0 16px 16px; }
        .approach-idea { font-size:13px; color:#c9d1d9; line-height:1.7; margin-bottom:12px; padding:10px 14px; background:rgba(255,255,255,0.04); border-radius:6px; border-left:3px solid; }
        .code-block-wrap { position:relative; }
        .code-block { background:#0d1117; border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:16px; overflow-x:auto; font-family:var(--mono,'JetBrains Mono',monospace); font-size:12px; line-height:1.7; color:#c9d1d9; margin:0; white-space:pre; }
        .copy-btn { position:absolute; top:8px; right:8px; padding:4px 10px; border-radius:5px; font-size:11px; font-weight:600; cursor:pointer; border:1px solid rgba(255,255,255,0.15); background:rgba(255,255,255,0.07); color:#8b949e; transition:all 0.15s; }
        .copy-btn:hover { background:rgba(255,255,255,0.12); color:#c9d1d9; }
        .copy-btn.copied { color:#00b8a3; border-color:rgba(0,184,163,0.4); }
        .trace-this-btn { display:flex; align-items:center; gap:6px; padding:7px 16px; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer; border:1px solid rgba(82,130,255,0.35); background:rgba(82,130,255,0.1); color:#79a8ff; margin-top:10px; transition:all 0.15s; }
        .trace-this-btn:hover { background:rgba(82,130,255,0.2); color:#fff; }

        .ai-prompt-chip {
          background: rgba(82,130,255,0.08);
          border: 1px solid rgba(82,130,255,0.25);
          border-radius: 18px;
          padding: 6px 14px;
          font-size: 12px;
          color: #79a8ff;
          cursor: pointer;
          transition: all 0.15s;
          text-align: left;
        }
        .ai-prompt-chip:hover {
          background: rgba(82,130,255,0.2);
          color: #fff;
          border-color: rgba(82,130,255,0.5);
        }
      `}</style>

      <div style={{
        background:'#161b22', border:'1px solid rgba(255,255,255,0.1)', borderRadius:14,
        width:'100%', maxWidth:880, maxHeight:'92vh',
        display:'flex', flexDirection:'column',
        animation:'slideInModal 0.2s cubic-bezier(0.34,1.56,0.64,1)',
        boxShadow:'0 24px 80px rgba(0,0,0,0.6)'
      }}>
        {/* ── Header ─────────────────────────────────────── */}
        <div style={{ padding:'18px 24px 0', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display:'flex', alignItems:'flex-start', gap:14, marginBottom:14 }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:6 }}>
                <span style={{ fontFamily:'var(--mono)', fontSize:12, color:'#6e7681' }}>#{problem.id}</span>
                <span style={{ fontSize:11, fontWeight:700, padding:'2px 10px', borderRadius:20, color:DIFF_COLORS[diff], background:DIFF_BG[diff], textTransform:'capitalize' }}>{diff}</span>
                {PRESET_SOLUTIONS[problem.id] && <span style={{ fontSize:11, fontWeight:600, padding:'2px 10px', borderRadius:20, color:'#79a8ff', background:'rgba(82,130,255,0.12)', border:'1px solid rgba(82,130,255,0.2)' }}>⚡ Ready to Trace</span>}
                {solutions && <span style={{ fontSize:11, fontWeight:600, padding:'2px 10px', borderRadius:20, color:'#c792ea', background:'rgba(160,90,255,0.1)', border:'1px solid rgba(160,90,255,0.2)' }}>💡 3 Solutions</span>}
                
                {/* Language Switcher */}
                <div className="pm-lang-bar" title="Select target programming language">
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <button
                      key={lang.id}
                      className={`pm-lang-pill ${selectedLanguage === lang.id ? 'active' : ''}`}
                      onClick={() => setSelectedLanguage(lang.id)}
                    >
                      <span>{lang.icon}</span> {lang.label}
                    </button>
                  ))}
                </div>
              </div>
              <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:'#e6edf3', letterSpacing:'-0.01em', lineHeight:1.3 }}>{problem.name}</h2>
              {desc?.category && <div style={{ marginTop:4, fontSize:12, color:'#6e7681' }}>{desc.category}</div>}
            </div>
            <button onClick={onClose} className="pm-btn pm-btn-close" style={{ padding:'6px 12px', flexShrink:0 }}>✕</button>
          </div>
          
          {/* Tabs */}
          <div style={{ display:'flex', gap:0, marginBottom:-1 }}>
            {TABS.map(t => (
              <button key={t.id} className={`pm-tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Body ───────────────────────────────────────── */}
        <div className="pm-body" style={{ overflowY:'auto', padding:'20px 24px', flex:1 }}>

          {/* ── TAB: Description ─────────── */}
          {activeTab === 'description' && (
            hasFull ? (
              <>
                <div style={{ marginBottom:22 }}>
                  <p className="pm-section-title">Problem</p>
                  <div style={{ fontSize:14, lineHeight:1.75, color:'#c9d1d9' }} dangerouslySetInnerHTML={{ __html: desc.description }} />
                </div>
                {desc.examples?.length > 0 && (
                  <div style={{ marginBottom:22 }}>
                    <p className="pm-section-title">Examples</p>
                    {desc.examples.map((ex, i) => (
                      <div key={i} className="pm-example">
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                          <div>
                            <div style={{ fontSize:10, fontWeight:700, color:'#6e7681', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>Input</div>
                            <pre>{ex.input}</pre>
                          </div>
                          <div>
                            <div style={{ fontSize:10, fontWeight:700, color:'#6e7681', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>Output</div>
                            <pre style={{ color:'#7ee787' }}>{ex.output}</pre>
                          </div>
                        </div>
                        {ex.explanation && (
                          <div style={{ marginTop:8, fontSize:12, color:'#8b949e', borderTop:'1px solid rgba(255,255,255,0.05)', paddingTop:8 }}>
                            <strong style={{ color:'#6e7681' }}>Explanation: </strong>{ex.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
                  {desc.constraints?.length > 0 && (
                    <div>
                      <p className="pm-section-title">Constraints</p>
                      {desc.constraints.map((c,i) => (
                        <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:8, padding:'5px 0', borderBottom:'1px solid rgba(255,255,255,0.05)', fontSize:12.5, color:'#8b949e' }}>
                          <span style={{ color:'#ffa116', flexShrink:0 }}>•</span>
                          <code style={{ fontFamily:'var(--mono)', fontSize:12 }}>{c}</code>
                        </div>
                      ))}
                    </div>
                  )}
                  {desc.complexity && (
                    <div>
                      <p className="pm-section-title">Target Complexity</p>
                      <div style={{ display:'flex', gap:10 }}>
                        {['time','space'].map(k => (
                          <div key={k} style={{ flex:1, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, padding:'10px 14px' }}>
                            <div style={{ fontSize:10, color:'#6e7681', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>{k}</div>
                            <div style={{ fontFamily:'var(--mono)', fontSize:13, color:'#e6edf3' }}>{desc.complexity[k]}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {desc.hints?.length > 0 && (
                  <div style={{ marginBottom:20 }}>
                    <p className="pm-section-title">💡 Hints</p>
                    {desc.hints.map((h,i) => <div key={i} className="pm-hint-item">{h}</div>)}
                  </div>
                )}
                {desc.topics?.length > 0 && (
                  <div style={{ marginBottom:16 }}>
                    <p className="pm-section-title">Topics</p>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                      {desc.topics.map(t => <span key={t} className="pm-topic-chip">{t}</span>)}
                    </div>
                  </div>
                )}
                {desc.companies?.length > 0 && (
                  <div>
                    <p className="pm-section-title">Companies</p>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                      {desc.companies.map(c => <span key={c} className="pm-company-chip">{c}</span>)}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign:'center', padding:'40px 20px', background:'rgba(255,255,255,0.02)', borderRadius:12, border:'1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ fontSize:40, marginBottom:12 }}>📋</div>
                <div style={{ fontSize:17, fontWeight:700, color:'#e6edf3', marginBottom:6 }}>LeetCode #{problem.id} {problem.name}</div>
                <div style={{ fontSize:13, color:'#8b949e', maxWidth:460, margin:'0 auto 20px', lineHeight:1.6 }}>
                  Generate full problem description, test examples, and constraints on the fly with AI.
                </div>
                {generatingDesc ? (
                  <div style={{ display:'inline-flex', alignItems:'center', gap:8, color:'#79a8ff', fontSize:13 }}>
                    ⏳ Generating problem statement...
                  </div>
                ) : (
                  <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
                    <button className="pm-btn pm-btn-primary" onClick={handleGenerateDescription}>
                      ⚡ Generate Problem Statement with AI
                    </button>
                    <a href={problem.url} target="_blank" rel="noopener noreferrer" className="pm-btn pm-btn-lc">
                      View on LeetCode ↗
                    </a>
                  </div>
                )}
                {genDescError && <div style={{ marginTop:14, color:'#ff7b72', fontSize:12 }}>⚠ {genDescError}</div>}
              </div>
            )
          )}

          {/* ── TAB: Solutions ─────────── */}
          {activeTab === 'solutions' && (
            solutions ? (
              <div>
                <div style={{ marginBottom:18, padding:'10px 14px', background:'rgba(82,130,255,0.07)', border:'1px solid rgba(82,130,255,0.2)', borderRadius:8, fontSize:13, color:'#79a8ff', lineHeight:1.6, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
                  <div>
                    📖 Showing 3 approaches in <strong>{activeLangObj.label}</strong>: <strong>Brute Force → Better → Optimal</strong>. Hit <strong>▶ Trace This Solution</strong> to visualize live.
                  </div>
                  <button onClick={() => setActiveTab('ai-tutor')} style={{ background:'rgba(139,111,240,0.2)', border:'1px solid rgba(139,111,240,0.4)', color:'#c792ea', borderRadius:6, padding:'4px 12px', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                    🧠 Stuck? Ask AI Tutor
                  </button>
                </div>
                {solutions.approaches.map((approach, idx) => {
                  const colors = APPROACH_COLORS[idx] || APPROACH_COLORS[2];
                  const isOpen = expandedApproach === idx;
                  return (
                    <div key={idx} className="approach-card" style={{ border:`1px solid ${colors.border}`, background:colors.bg }}>
                      <div className="approach-header" style={{ background:`${colors.bg}` }} onClick={() => setExpandedApproach(isOpen ? null : idx)}>
                        <div style={{ width:10, height:10, borderRadius:'50%', background:colors.accent, flexShrink:0 }} />
                        <div style={{ flex:1 }}>
                          <div className="approach-title" style={{ color:'#e6edf3' }}>
                            {approach.name}
                            <span style={{ fontSize:12, fontWeight:400, color:'#8b949e', marginLeft:10 }}>{approach.label}</span>
                          </div>
                        </div>
                        <div className="approach-complexity">
                          <span className="complexity-chip">⏱ {approach.complexity?.time}</span>
                          <span className="complexity-chip">💾 {approach.complexity?.space}</span>
                        </div>
                        <span style={{ color:colors.accent, fontSize:16, marginLeft:4 }}>{isOpen ? '▲' : '▼'}</span>
                      </div>
                      {isOpen && (
                        <div className="approach-body">
                          <div className="approach-idea" style={{ borderColor:colors.accent }}>
                            <strong style={{ color:colors.accent }}>Idea: </strong>{approach.idea}
                          </div>
                          <div className="code-block-wrap">
                            <pre className="code-block">{approach.code}</pre>
                            <button
                              className={`copy-btn ${copiedIdx === idx ? 'copied' : ''}`}
                              onClick={() => copyCode(approach.code, idx)}
                            >
                              {copiedIdx === idx ? '✓ Copied' : '📋 Copy'}
                            </button>
                          </div>
                          <button className="trace-this-btn" onClick={() => handleVisualize(approach.code)}>
                            ▶ Trace This Solution in {activeLangObj.label}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign:'center', padding:'40px 24px', background:'rgba(255,255,255,0.025)', borderRadius:12, border:'1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize:40, marginBottom:12 }}>⚡</div>
                <div style={{ fontSize:18, fontWeight:700, color:'#e6edf3', marginBottom:8 }}>
                  Generate 3 Approaches in {activeLangObj.label}
                </div>
                <div style={{ fontSize:13, color:'#8b949e', maxWidth:520, margin:'0 auto 24px', lineHeight:1.6 }}>
                  Generate <strong>Brute Force (🔴)</strong>, <strong>Better (🟡)</strong>, and <strong>Optimal (🟢)</strong> solutions in <strong>{activeLangObj.label}</strong> for <strong>#{problem.id} {problem.name}</strong>, complete with time/space complexity analysis and runnable visualizer code.
                </div>
                {generatingSolutions ? (
                  <div style={{ display:'inline-flex', alignItems:'center', gap:10, padding:'12px 28px', background:'rgba(82,130,255,0.15)', border:'1px solid rgba(82,130,255,0.3)', borderRadius:8, color:'#79a8ff', fontSize:13, fontWeight:600 }}>
                    <span>⏳ Generating 3 approaches in {activeLangObj.label}...</span>
                  </div>
                ) : (
                  <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
                    <button
                      className="pm-btn pm-btn-primary"
                      onClick={handleGenerateSolutions}
                      style={{ padding:'12px 28px', fontSize:14, fontWeight:700 }}
                    >
                      ⚡ Generate 3 Solutions ({activeLangObj.icon} {activeLangObj.label})
                    </button>
                    <button className="pm-btn pm-btn-brain" onClick={() => setActiveTab('ai-tutor')}>
                      🧠 Ask AI Tutor
                    </button>
                  </div>
                )}
                {genSolutionError && (
                  <div style={{ marginTop:16, fontSize:12, color:'#ff7b72' }}>
                    ⚠ {genSolutionError}
                  </div>
                )}
              </div>
            )
          )}

          {/* ── TAB: AI Tutor ─────────── */}
          {activeTab === 'ai-tutor' && (
            <div style={{ display:'flex', flexDirection:'column', height:'100%', minHeight:380 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12, paddingBottom:8, borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize:13, color:'#79a8ff', display:'flex', alignItems:'center', gap:6 }}>
                  <span>🧠</span> <strong>TRACE DSA Tutor</strong> · #{problem.id} {problem.name} ({activeLangObj.icon} {activeLangObj.label})
                </div>
                <button onClick={openInFloatingBrain} style={{ background:'transparent', border:'1px solid rgba(255,255,255,0.15)', color:'#8b949e', borderRadius:6, padding:'3px 10px', fontSize:11, cursor:'pointer' }}>
                  Pop out to Brain ↗
                </button>
              </div>

              {/* Suggested Questions */}
              <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:14 }}>
                {[
                  `💡 Give me a subtle hint`,
                  `🔍 Which pattern fits this best?`,
                  `🪜 Explain the optimal approach in ${activeLangObj.label}`,
                  `⚠️ Edge cases to watch out for`,
                  `⏱ Big-O time and space complexity`,
                ].map((chipPrompt) => (
                  <button key={chipPrompt} className="ai-prompt-chip" onClick={() => sendAiQuestion(chipPrompt)}>
                    {chipPrompt}
                  </button>
                ))}
              </div>

              {/* Chat messages */}
              <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:10, marginBottom:12, paddingRight:4, maxHeight:320 }}>
                {aiMessages.map((m, i) => (
                  <div key={i} style={{
                    display:'flex',
                    flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
                    gap:8,
                    alignItems:'flex-start'
                  }}>
                    {m.role === 'assistant' && (
                      <div style={{ width:24, height:24, borderRadius:'50%', background:'linear-gradient(135deg,#5282ff,#8b6ff0)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, flexShrink:0, marginTop:2 }}>🧠</div>
                    )}
                    <div style={{
                      maxWidth:'86%',
                      padding:'10px 14px',
                      borderRadius:12,
                      fontSize:12.5,
                      lineHeight:1.6,
                      background: m.role === 'user' ? 'linear-gradient(135deg, rgba(82,130,255,0.28), rgba(139,111,240,0.22))' : 'rgba(255,255,255,0.05)',
                      border: m.role === 'user' ? '1px solid rgba(82,130,255,0.35)' : '1px solid rgba(255,255,255,0.09)',
                      color: m.role === 'user' ? '#f0f6fc' : '#c9d1d9',
                    }}>
                      <RenderInlineMarkdown text={m.content} />
                    </div>
                  </div>
                ))}
                {aiLoading && (
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <div style={{ width:24, height:24, borderRadius:'50%', background:'linear-gradient(135deg,#5282ff,#8b6ff0)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, flexShrink:0 }}>🧠</div>
                    <div style={{ padding:'8px 14px', background:'rgba(255,255,255,0.05)', borderRadius:12, fontSize:12, color:'#8b949e' }}>
                      Thinking in {activeLangObj.label}...
                    </div>
                  </div>
                )}
                <div ref={aiEndRef} />
              </div>

              {aiError && (
                <div style={{ padding:'6px 12px', background:'rgba(239,71,67,0.12)', border:'1px solid rgba(239,71,67,0.3)', borderRadius:6, fontSize:12, color:'#ff7b72', marginBottom:8 }}>
                  ⚠ {aiError}
                </div>
              )}

              {/* Chat Input */}
              <div style={{ display:'flex', gap:8, alignItems:'center', marginTop:'auto', paddingTop:8, borderTop:'1px solid rgba(255,255,255,0.08)' }}>
                <input
                  type="text"
                  placeholder={`Ask anything about #${problem.id} in ${activeLangObj.label}...`}
                  value={aiInput}
                  onChange={e => setAiInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendAiQuestion()}
                  style={{
                    flex:1,
                    background:'rgba(255,255,255,0.05)',
                    border:'1px solid rgba(255,255,255,0.12)',
                    borderRadius:8,
                    padding:'9px 12px',
                    color:'#e6edf3',
                    fontSize:12.5,
                    outline:'none'
                  }}
                />
                <button
                  onClick={() => sendAiQuestion()}
                  disabled={!aiInput.trim() || aiLoading}
                  style={{
                    padding:'9px 18px',
                    borderRadius:8,
                    border:'none',
                    background:'linear-gradient(135deg,#5282ff,#8b6ff0)',
                    color:'#fff',
                    fontWeight:600,
                    fontSize:12.5,
                    cursor: (!aiInput.trim() || aiLoading) ? 'not-allowed' : 'pointer',
                    opacity: (!aiInput.trim() || aiLoading) ? 0.5 : 1
                  }}
                >
                  {aiLoading ? 'Thinking...' : 'Ask AI'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────── */}
        <div style={{ padding:'14px 24px', borderTop:'1px solid rgba(255,255,255,0.08)', display:'flex', gap:10, alignItems:'center', justifyContent:'flex-end', flexWrap:'wrap' }}>
          {desc?.acceptance && <div style={{ flex:1, fontSize:12, color:'#6e7681' }}>Acceptance: <strong style={{ color:'#8b949e' }}>{desc.acceptance}</strong></div>}
          <button className="pm-btn pm-btn-brain" onClick={() => setActiveTab('ai-tutor')}>
            🧠 Ask AI Tutor
          </button>
          <a href={problem.url} target="_blank" rel="noopener noreferrer" className="pm-btn pm-btn-lc" style={{ textDecoration:'none' }}>
            LeetCode ↗
          </a>
          <button className="pm-btn pm-btn-primary" onClick={() => handleVisualize(null)}>
            ▶ Visualize in {activeLangObj.label}
          </button>
        </div>
      </div>
    </div>
  );
}

function RenderInlineMarkdown({ text }) {
  const html = text
    .replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) =>
      `<pre style="background:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.1);border-radius:6px;padding:8px 10px;overflow-x:auto;margin:6px 0;font-size:11px;"><code>${escapeHtml(code.trim())}</code></pre>`
    )
    .replace(/`([^`]+)`/g, '<code style="background:rgba(0,0,0,0.3);padding:1px 5px;border-radius:3px;font-size:11.5px;color:#79a8ff;">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#fff;">$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li style="margin-bottom:2px;">$1</li>')
    .replace(/^\* (.+)$/gm, '<li style="margin-bottom:2px;">$1</li>')
    .replace(/(<li[^>]*>[\s\S]*?<\/li>)/g, '<ul style="padding-left:18px;margin:3px 0;">$1</ul>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
