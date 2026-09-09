import { useState, useRef, useEffect, useCallback } from 'react';
import { callGeminiApi, SYSTEM_TUTOR_PROMPT } from '../services/aiService.js';
import { useTraceStore } from '../store/traceStore.js';
import { renderSafeMarkdown } from '../utils/sanitize.js';

const SUGGESTED_PROMPTS = [
  "Explain the sliding window pattern",
  "When should I use BFS vs DFS?",
  "How do I recognize a DP problem?",
  "Explain Two Pointers in Python & Java",
  "What's the difference between Stack and Queue?",
  "How to approach graph problems?",
  "Explain backtracking with an example",
  "Tips for FAANG DSA interviews",
];

const ARIA_WELCOME = `Hey! 👋 I'm **ARIA** — your Algorithm Reasoning & Insight Assistant.

Ask me anything: algorithm patterns, Big-O complexity, hints for tricky LeetCode problems, or multi-language code (Python, Java, C++, JS).

What are you working on?`;

export default function DSABrain() {
  const [open, setOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const activeLanguage = useTraceStore(s => s.language);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: ARIA_WELCOME }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const sendMessageRef = useRef(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [messages, open]);

  const sendMessage = useCallback(async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;

    setInput('');
    setError('');

    let snapshot;
    setMessages(prev => {
      snapshot = [...prev, { role: 'user', content: userText }];
      return snapshot;
    });

    setLoading(true);

    try {
      await new Promise(r => setTimeout(r, 0));

      const HISTORY_LIMIT = 12;
      const history = (snapshot || []).slice(1);
      const recent = history.slice(Math.max(0, history.length - HISTORY_LIMIT));

      const contents = recent.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      const sysInstruction = `${SYSTEM_TUTOR_PROMPT}\nThe user's currently active debugger language is: ${activeLanguage.toUpperCase()}. When code examples are requested without specifying a language, prefer ${activeLanguage.toUpperCase()} or provide clean comparisons.`;

      const data = await callGeminiApi({
        systemInstruction: sysInstruction,
        contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 1200 }
      });

      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!reply) throw new Error('No response from ARIA. Please check your Gemini API key in .env file.');

      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (e) {
      const msg = e.message || 'Unknown error';
      setError(msg);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `⚠️ **ARIA:** ${msg}` }
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, activeLanguage]);

  useEffect(() => { sendMessageRef.current = sendMessage; }, [sendMessage]);

  useEffect(() => {
    function handleExternalPrompt(e) {
      const promptText = e.detail?.prompt;
      setOpen(true);
      if (promptText) {
        setTimeout(() => sendMessageRef.current?.(promptText), 250);
      }
    }
    window.addEventListener('open-trace-brain', handleExternalPrompt);
    return () => window.removeEventListener('open-trace-brain', handleExternalPrompt);
  }, []);

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  useEffect(() => {
    function handleKeyDownGlobal(e) {
      if (e.key === "Escape" && open) {
        if (isFullScreen) {
          setIsFullScreen(false);
        } else {
          setOpen(false);
        }
      }
    }
    window.addEventListener("keydown", handleKeyDownGlobal);
    return () => window.removeEventListener("keydown", handleKeyDownGlobal);
  }, [open, isFullScreen]);

  function clearChat() {
    setMessages([{ role: 'assistant', content: ARIA_WELCOME }]);
    setError('');
  }

  return (
    <>
      <style>{`
        .aria-fab {
          position: fixed; bottom: 24px; right: 24px; z-index: 9999;
          width: 56px; height: 56px; border-radius: 50%; border: none; cursor: pointer;
          background: linear-gradient(135deg, #5282ff 0%, #8b6ff0 50%, #ff9f43 100%);
          box-shadow: 0 6px 28px rgba(82,130,255,0.45), 0 2px 8px rgba(0,0,0,0.4);
          display: flex; align-items: center; justify-content: center; font-size: 22px;
          transition: transform 0.2s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s;
          animation: aria-pulse 3s infinite; color: white;
        }
        .aria-fab:hover { transform: scale(1.1); box-shadow: 0 8px 32px rgba(82,130,255,0.65), 0 2px 8px rgba(0,0,0,0.4); }
        .aria-fab.open { animation: none; background: linear-gradient(135deg, #ef4444, #8b1111); box-shadow: 0 4px 18px rgba(239,68,68,0.4); }
        @keyframes aria-pulse {
          0%, 100% { box-shadow: 0 6px 28px rgba(82,130,255,0.45), 0 0 0 0 rgba(82,130,255,0.35); }
          50%       { box-shadow: 0 6px 28px rgba(82,130,255,0.45), 0 0 0 10px rgba(82,130,255,0); }
        }
        .aria-backdrop {
          position: fixed; inset: 0; background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
          z-index: 9999; animation: aria-fade-in 0.2s ease-out;
        }
        @keyframes aria-fade-in { from { opacity: 0; } to { opacity: 1; } }
        .aria-panel {
          position: fixed; bottom: 90px; right: 24px;
          width: 400px; height: 560px;
          background: linear-gradient(180deg, #0d1117 0%, #0a0e14 100%);
          border: 1px solid rgba(82,130,255,0.25); border-radius: 18px;
          box-shadow: 0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04);
          display: flex; flex-direction: column; overflow: hidden; z-index: 9998;
          animation: aria-slide-in 0.22s cubic-bezier(.34,1.56,.64,1);
        }
        @keyframes aria-slide-in { from { opacity:0; transform:translateY(20px) scale(0.96); } to { opacity:1; transform:translateY(0) scale(1); } }
        .aria-panel.fullscreen {
          top: 18px; bottom: 18px; left: 18px; right: 18px;
          width: auto; height: auto; max-width: 1200px;
          margin: 0 auto; border-radius: 18px; z-index: 10000;
          box-shadow: 0 24px 90px rgba(0,0,0,0.85), 0 0 0 1px rgba(82,130,255,0.3);
          border-color: rgba(82,130,255,0.35);
        }
        .aria-panel.fullscreen .aria-messages {
          max-width: 960px; width: 100%; margin: 0 auto;
          padding: 20px 24px;
        }
        .aria-panel.fullscreen .aria-bubble {
          max-width: 82%; font-size: 13px; padding: 12px 18px;
        }
        .aria-panel.fullscreen .aria-bubble pre {
          font-size: 12px; padding: 12px 16px;
        }
        .aria-panel.fullscreen .aria-input-row {
          max-width: 960px; width: 100%; margin: 0 auto;
          box-sizing: border-box; padding: 14px 20px 16px;
        }
        .aria-panel.fullscreen .aria-suggestions {
          max-width: 960px; width: 100%; margin: 0 auto;
          box-sizing: border-box; padding: 12px 20px 8px;
        }
        .aria-panel.fullscreen .aria-header {
          padding: 14px 24px;
        }
        .aria-header {
          padding: 14px 16px;
          background: linear-gradient(135deg, rgba(82,130,255,0.1) 0%, rgba(139,111,240,0.07) 100%);
          border-bottom: 1px solid rgba(82,130,255,0.18);
          display: flex; align-items: center; gap: 12px; flex-shrink: 0;
        }
        .aria-avatar-ring { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #5282ff, #8b6ff0, #ff9f43); padding: 2px; flex-shrink: 0; }
        .aria-avatar-inner { width: 100%; height: 100%; border-radius: 50%; background: #0d1117; display: flex; align-items: center; justify-content: center; font-size: 18px; color: #fff; }
        .aria-name { font-size: 15px; font-weight: 700; color: #f0f6fc; letter-spacing: 0.02em; display: flex; align-items: center; gap: 7px; }
        .aria-name-tag { font-size: 9px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #79a8ff; padding: 2px 6px; border: 1px solid rgba(82,130,255,0.3); border-radius: 4px; }
        .aria-sub { font-size: 11px; color: #6e7681; margin-top: 1px; }
        .aria-status-dot { width: 7px; height: 7px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 6px #22c55e; animation: aria-blink 2s infinite; display: inline-block; margin-right: 4px; vertical-align: middle; }
        @keyframes aria-blink { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        .aria-header-actions { margin-left: auto; display: flex; gap: 4px; }
        .aria-icon-btn { background: transparent; border: none; color: #6e7681; cursor: pointer; width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 13px; transition: all 0.15s; }
        .aria-icon-btn:hover { background: rgba(255,255,255,0.07); color: #c9d1d9; }
        .aria-messages { flex: 1; overflow-y: auto; padding: 14px 16px; display: flex; flex-direction: column; gap: 14px; scroll-behavior: smooth; }
        .aria-messages::-webkit-scrollbar { width: 4px; }
        .aria-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        .aria-msg { display: flex; gap: 8px; align-items: flex-start; }
        .aria-msg.user { flex-direction: row-reverse; }
        .aria-msg-avatar { width: 26px; height: 26px; border-radius: 50%; background: linear-gradient(135deg,#5282ff,#8b6ff0); display: flex; align-items: center; justify-content: center; font-size: 12px; color: #fff; flex-shrink: 0; margin-top: 2px; }
        .aria-bubble { max-width: 85%; padding: 10px 14px; border-radius: 14px; font-size: 12.5px; line-height: 1.65; color: #c9d1d9; }
        .aria-bubble.assistant { background: rgba(82,130,255,0.07); border: 1px solid rgba(82,130,255,0.14); border-radius: 4px 14px 14px 14px; }
        .aria-bubble.user { background: linear-gradient(135deg,rgba(255,159,67,0.16),rgba(255,159,67,0.08)); border: 1px solid rgba(255,159,67,0.3); border-radius: 14px 4px 14px 14px; color: #f0f6fc; }
        .aria-bubble pre { font-family: 'JetBrains Mono',monospace; font-size: 11.5px; background: rgba(0,0,0,0.35); border-radius: 6px; padding: 10px 12px; overflow-x: auto; margin: 8px 0; border: 1px solid rgba(255,255,255,0.08); }
        .aria-bubble code { font-family: 'JetBrains Mono',monospace; font-size: 11px; background: rgba(0,0,0,0.3); padding: 1px 5px; border-radius: 3px; color: #38d9c5; }
        .aria-bubble strong { color: #ffffff; }
        .aria-typing { display: flex; gap: 5px; align-items: center; padding: 4px 2px; }
        .aria-dot { width: 6px; height: 6px; border-radius: 50%; animation: adot 1.2s infinite ease-in-out; }
        .aria-dot:nth-child(1) { background: #5282ff; }
        .aria-dot:nth-child(2) { background: #8b6ff0; animation-delay: 0.2s; }
        .aria-dot:nth-child(3) { background: #ff9f43; animation-delay: 0.4s; }
        @keyframes adot { 0%,80%,100%{transform:scale(0.6);opacity:0.4;} 40%{transform:scale(1.1);opacity:1;} }
        .aria-suggestions { padding: 10px 14px 6px; display: flex; flex-wrap: wrap; gap: 6px; border-top: 1px solid rgba(255,255,255,0.05); background: rgba(255,255,255,0.02); }
        .aria-chip { background: rgba(82,130,255,0.08); border: 1px solid rgba(82,130,255,0.22); color: #79a8ff; border-radius: 20px; padding: 4px 10px; font-size: 11px; cursor: pointer; transition: all 0.15s; text-align: left; }
        .aria-chip:hover { background: rgba(82,130,255,0.2); color: #c9d1d9; border-color: rgba(82,130,255,0.45); transform: translateY(-1px); }
        .aria-error { padding: 8px 14px; background: rgba(239,71,67,0.1); border-top: 1px solid rgba(239,71,67,0.25); font-size: 11.5px; color: #ff7b72; }
        .aria-input-row { padding: 10px 14px 12px; border-top: 1px solid rgba(255,255,255,0.07); display: flex; gap: 8px; align-items: flex-end; background: rgba(255,255,255,0.02); flex-shrink: 0; }
        .aria-textarea { flex: 1; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #e6edf3; padding: 9px 13px; font-size: 12.5px; font-family: inherit; resize: none; outline: none; min-height: 40px; max-height: 100px; line-height: 1.45; box-sizing: border-box; transition: border-color 0.15s, background 0.15s; }
        .aria-textarea:focus { border-color: rgba(82,130,255,0.5); background: rgba(82,130,255,0.04); }
        .aria-textarea::placeholder { color: #484f58; }
        .aria-send { width: 40px; height: 40px; border-radius: 12px; border: none; background: linear-gradient(135deg,#5282ff,#8b6ff0); color: #fff; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 15px; flex-shrink: 0; transition: all 0.15s; box-shadow: 0 2px 12px rgba(82,130,255,0.35); }
        .aria-send:hover:not(:disabled) { transform: scale(1.06); box-shadow: 0 4px 18px rgba(82,130,255,0.55); }
        .aria-send:disabled { opacity: 0.35; cursor: not-allowed; box-shadow: none; }
        @media (max-width: 480px) { .aria-panel { width: calc(100vw - 20px); right: 10px; } }
      `}</style>

      <button
        className={`aria-fab ${open ? 'open' : ''}`}
        onClick={() => setOpen(o => { if (o) setIsFullScreen(false); return !o; })}
        title="ARIA — Algorithm Reasoning & Insight Assistant"
      >
        {open ? '✕' : '✦'}
      </button>

      {open && isFullScreen && (
        <div className="aria-backdrop" onClick={() => setIsFullScreen(false)} />
      )}

      {open && (
        <div className={`aria-panel ${isFullScreen ? "fullscreen" : ""}`}>
          <div className="aria-header">
            <div className="aria-avatar-ring">
              <div className="aria-avatar-inner">✦</div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="aria-name">
                ARIA
                <span className="aria-name-tag">AI Tutor</span>
              </div>
              <div className="aria-sub">
                <span className="aria-status-dot" />
                Algorithm Reasoning & Insight Assistant
              </div>
            </div>
            <div className="aria-header-actions">
              <button className="aria-icon-btn" onClick={clearChat} title="Clear chat">🗑</button>
              <button
                className="aria-icon-btn"
                onClick={() => setIsFullScreen(f => !f)}
                title={isFullScreen ? "Exit Fullscreen (Esc)" : "Expand to Fullscreen"}
              >
                {isFullScreen ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                  </svg>
                )}
              </button>
              <button
                className="aria-icon-btn"
                onClick={() => { setOpen(false); setIsFullScreen(false); }}
                title="Close ARIA"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="aria-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`aria-msg ${msg.role}`}>
                {msg.role === 'assistant' && (
                  <div className="aria-msg-avatar">✦</div>
                )}
                <div className={`aria-bubble ${msg.role}`}>
                  <RenderMarkdown text={msg.content} />
                </div>
              </div>
            ))}
            {loading && (
              <div className="aria-msg assistant">
                <div className="aria-msg-avatar">✦</div>
                <div className="aria-bubble assistant">
                  <div className="aria-typing">
                    <div className="aria-dot" />
                    <div className="aria-dot" />
                    <div className="aria-dot" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {messages.length <= 1 && (
            <div className="aria-suggestions">
              {SUGGESTED_PROMPTS.map(p => (
                <button key={p} className="aria-chip" onClick={() => sendMessage(p)}>{p}</button>
              ))}
            </div>
          )}

          {error && <div className="aria-error">⚠ {error}</div>}

          <div className="aria-input-row">
            <textarea
              ref={inputRef}
              className="aria-textarea"
              placeholder="Ask ARIA anything about DSA…"
              value={input}
              onChange={e => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
              }}
              onKeyDown={handleKeyDown}
              disabled={loading}
              rows={1}
            />
            <button
              className="aria-send"
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              title="Send (Enter)"
            >
              {loading ? '⏳' : '➤'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function RenderMarkdown({ text }) {
  return <div dangerouslySetInnerHTML={{ __html: renderSafeMarkdown(text) }} />;
}
