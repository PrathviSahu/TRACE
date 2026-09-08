import { useState, useRef, useEffect } from 'react';
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

export default function DSABrain() {
  const [open, setOpen] = useState(false);
  const activeLanguage = useTraceStore(s => s.language);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hey! 👋 I'm **TRACE Brain** — your personal DSA tutor.\n\nAsk me anything: algorithm patterns, Big-O complexity, hints for tricky LeetCode problems, or multi-language code (Python, Java, C++, JS).\n\nWhat are you working on?",
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [messages, open]);

  // Listen for external open-trace-brain custom events
  useEffect(() => {
    function handleExternalPrompt(e) {
      const promptText = e.detail?.prompt;
      setOpen(true);
      if (promptText) {
        setTimeout(() => {
          sendMessage(promptText);
        }, 200);
      }
    }
    window.addEventListener('open-trace-brain', handleExternalPrompt);
    return () => window.removeEventListener('open-trace-brain', handleExternalPrompt);
  }, []);

  async function sendMessage(text) {
    const userText = (text || input).trim();
    if (!userText || loading) return;

    setInput('');
    setError('');
    const newMessages = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const conversationHistory = newMessages.slice(1);
      const contents = conversationHistory.map(msg => ({
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
      if (!reply) throw new Error('No response returned from AI.');

      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (e) {
      setError(e.message);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ **AI Tutor:** ${e.message}`
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function clearChat() {
    setMessages([{
      role: 'assistant',
      content: "Hey! 👋 I'm **TRACE Brain** — your personal DSA tutor.\n\nAsk me anything: algorithm concepts, complexity analysis, or how to tackle any problem!",
    }]);
    setError('');
  }

  return (
    <>
      <style>{`
        .brain-fab {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          width: 54px; height: 54px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          background: linear-gradient(135deg, #5282ff, #8b6ff0);
          box-shadow: 0 4px 24px rgba(82,130,255,0.45);
          display: flex; align-items: center; justify-content: center;
          font-size: 24px;
          transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
          animation: fabPop 0.4s cubic-bezier(0.34,1.56,0.64,1);
        }
        .brain-fab:hover { transform: scale(1.08); box-shadow: 0 6px 32px rgba(82,130,255,0.6); }
        .brain-fab.open { background: linear-gradient(135deg, #ef4743, #c0392b); }
        @keyframes fabPop { from { transform: scale(0); opacity: 0 } to { transform: scale(1); opacity: 1 } }
        .brain-panel {
          position: fixed;
          bottom: 90px; right: 24px;
          width: 440px; height: 600px;
          max-height: calc(100vh - 120px);
          max-width: calc(100vw - 32px);
          z-index: 9998;
          background: #141820;
          border: 1px solid rgba(82,130,255,0.25);
          border-radius: 16px;
          display: flex; flex-direction: column;
          box-shadow: 0 24px 64px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.05);
          animation: brainSlide 0.25s cubic-bezier(0.34,1.56,0.64,1);
          overflow: hidden;
        }
        @keyframes brainSlide { from { opacity: 0; transform: translateY(16px) scale(0.96) } to { opacity: 1; transform: none } }
        .brain-header {
          padding: 13px 18px;
          background: linear-gradient(135deg, rgba(82,130,255,0.18), rgba(139,111,240,0.12));
          border-bottom: 1px solid rgba(255,255,255,0.08);
          display: flex; align-items: center; gap: 10px;
        }
        .brain-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: linear-gradient(135deg, #5282ff, #8b6ff0);
          display: flex; align-items: center; justify-content: center;
          font-size: 19px; flex-shrink: 0;
          box-shadow: 0 2px 10px rgba(82,130,255,0.35);
        }
        .brain-title { font-size: 14px; font-weight: 700; color: #e6edf3; display: flex; align-items: center; gap: 6px; }
        .brain-badge { font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 4px; background: rgba(126,231,135,0.15); color: #7ee787; border: 1px solid rgba(126,231,135,0.3); }
        .brain-sub { font-size: 11px; color: #8b949e; }
        .brain-actions { margin-left: auto; display: flex; gap: 6px; }
        .brain-icon-btn { background: transparent; border: 1px solid rgba(255,255,255,0.1); color: #8b949e; width: 28px; height: 28px; border-radius: 6px; cursor: pointer; font-size: 13px; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
        .brain-icon-btn:hover { background: rgba(255,255,255,0.08); color: #c9d1d9; }
        .brain-messages {
          flex: 1; overflow-y: auto; padding: 14px 16px;
          display: flex; flex-direction: column; gap: 12px;
        }
        .brain-messages::-webkit-scrollbar { width: 5px; }
        .brain-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 3px; }
        .brain-msg { display: flex; gap: 8px; align-items: flex-start; }
        .brain-msg.user { flex-direction: row-reverse; }
        .brain-bubble {
          max-width: 86%; padding: 10px 14px;
          border-radius: 12px; font-size: 12.5px; line-height: 1.6; color: #c9d1d9;
        }
        .brain-bubble.assistant {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 4px 12px 12px 12px;
        }
        .brain-bubble.user {
          background: linear-gradient(135deg, rgba(82,130,255,0.28), rgba(139,111,240,0.22));
          border: 1px solid rgba(82,130,255,0.35);
          border-radius: 12px 4px 12px 12px;
          color: #f0f6fc;
        }
        .brain-bubble pre, .brain-bubble code {
          font-family: var(--mono, 'JetBrains Mono', monospace);
          font-size: 11.5px;
          background: rgba(0,0,0,0.35);
          border-radius: 4px;
        }
        .brain-bubble pre { padding: 10px 12px; overflow-x: auto; margin: 8px 0; border: 1px solid rgba(255,255,255,0.1); }
        .brain-bubble code { padding: 1px 5px; color: #79a8ff; }
        .brain-bubble strong { color: #ffffff; }
        .brain-typing { display: flex; gap: 4px; align-items: center; padding: 4px 6px; }
        .brain-dot { width: 6px; height: 6px; border-radius: 50%; background: #5282ff; animation: bdot 1.2s infinite ease-in-out; }
        .brain-dot:nth-child(2) { animation-delay: 0.2s; background: #79a8ff; }
        .brain-dot:nth-child(3) { animation-delay: 0.4s; background: #8b6ff0; }
        @keyframes bdot { 0%, 80%, 100% { transform: scale(0.6); opacity: 0.4 } 40% { transform: scale(1); opacity: 1 } }
        .brain-suggestions {
          padding: 8px 14px;
          display: flex; flex-wrap: wrap; gap: 6px;
          background: rgba(0,0,0,0.15);
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .brain-suggest-chip {
          background: rgba(82,130,255,0.1);
          border: 1px solid rgba(82,130,255,0.25);
          color: #79a8ff;
          border-radius: 20px;
          padding: 4px 10px;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.15s;
          text-align: left;
        }
        .brain-suggest-chip:hover { background: rgba(82,130,255,0.22); color: #c9d1d9; border-color: rgba(82,130,255,0.45); }
        .brain-input-row {
          padding: 10px 14px;
          border-top: 1px solid rgba(255,255,255,0.08);
          display: flex; gap: 8px; align-items: flex-end;
          background: #11141c;
        }
        .brain-textarea {
          flex: 1;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 10px;
          color: #e6edf3;
          padding: 8px 12px;
          font-size: 12.5px;
          font-family: inherit;
          resize: none;
          outline: none;
          min-height: 38px;
          max-height: 100px;
          line-height: 1.4;
          box-sizing: border-box;
          transition: border-color 0.15s;
        }
        .brain-textarea:focus { border-color: rgba(82,130,255,0.5); background: rgba(255,255,255,0.07); }
        .brain-send {
          width: 38px; height: 38px; border-radius: 10px;
          border: none;
          background: linear-gradient(135deg, #5282ff, #8b6ff0);
          color: #fff;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px;
          flex-shrink: 0;
          transition: all 0.15s;
        }
        .brain-send:hover:not(:disabled) { transform: scale(1.05); box-shadow: 0 4px 14px rgba(82,130,255,0.4); }
        .brain-send:disabled { opacity: 0.4; cursor: not-allowed; }
        .brain-error { padding: 8px 14px; background: rgba(239,71,67,0.12); border-top: 1px solid rgba(239,71,67,0.3); font-size: 11.5px; color: #ff7b72; }
        @media (max-width: 480px) { .brain-panel { width: calc(100vw - 20px); right: 10px; } }
      `}</style>

      {/* FAB Button */}
      <button className={`brain-fab ${open ? 'open' : ''}`} onClick={() => setOpen(o => !o)} title="TRACE Brain — DSA AI Tutor">
        {open ? '✕' : '🧠'}
      </button>

      {/* Chat Panel */}
      {open && (
        <div className="brain-panel">
          {/* Header */}
          <div className="brain-header">
            <div className="brain-avatar">🧠</div>
            <div>
              <div className="brain-title">
                TRACE Brain
                <span className="brain-badge">AI Ready</span>
              </div>
              <div className="brain-sub">DSA AI Tutor · Multi-Language Debugger</div>
            </div>
            <div className="brain-actions">
              <button className="brain-icon-btn" onClick={clearChat} title="Clear chat">🗑</button>
            </div>
          </div>

          {/* Messages */}
          <div className="brain-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`brain-msg ${msg.role}`}>
                {msg.role === 'assistant' && (
                  <div style={{ width:24, height:24, borderRadius:'50%', background:'linear-gradient(135deg,#5282ff,#8b6ff0)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, flexShrink:0, marginTop:2 }}>🧠</div>
                )}
                <div className={`brain-bubble ${msg.role}`}>
                  <RenderMarkdown text={msg.content} />
                </div>
              </div>
            ))}
            {loading && (
              <div className="brain-msg assistant">
                <div style={{ width:24, height:24, borderRadius:'50%', background:'linear-gradient(135deg,#5282ff,#8b6ff0)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, flexShrink:0 }}>🧠</div>
                <div className="brain-bubble assistant">
                  <div className="brain-typing">
                    <div className="brain-dot" /><div className="brain-dot" /><div className="brain-dot" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested prompts — show only at start */}
          {messages.length <= 1 && (
            <div className="brain-suggestions">
              {SUGGESTED_PROMPTS.map(p => (
                <button key={p} className="brain-suggest-chip" onClick={() => sendMessage(p)}>{p}</button>
              ))}
            </div>
          )}

          {error && <div className="brain-error">⚠ {error}</div>}

          {/* Input */}
          <div className="brain-input-row">
            <textarea
              ref={inputRef}
              className="brain-textarea"
              placeholder="Ask TRACE Brain anything about DSA..."
              value={input}
              onChange={e => { setInput(e.target.value); e.target.style.height='auto'; e.target.style.height=Math.min(e.target.scrollHeight,100)+'px'; }}
              onKeyDown={handleKeyDown}
              disabled={loading}
              rows={1}
            />
            <button className="brain-send" onClick={() => sendMessage()} disabled={!input.trim() || loading} title="Send (Enter)">
              {loading ? '⏳' : '➤'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// Secured Markdown renderer (Hardening #2: XSS protected)
function RenderMarkdown({ text }) {
  return <div dangerouslySetInnerHTML={{ __html: renderSafeMarkdown(text) }} />;
}
