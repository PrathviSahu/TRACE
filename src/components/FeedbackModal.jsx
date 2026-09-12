import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTraceStore } from '../store/traceStore.js';

const WEB3FORMS_ACCESS_KEY = "fa33ed03-b3a8-43b6-af8d-d988de13a232";

export default function FeedbackModal({ isOpen, onClose }) {
  const loc = useLocation();
  const activeTab = useTraceStore(s => s.activeTab);
  const language = useTraceStore(s => s.language);
  const error = useTraceStore(s => s.error);

  const [feedbackType, setFeedbackType] = useState('bug'); // 'bug' | 'feature' | 'general'
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [userContact, setUserContact] = useState('');
  const [includeDiag, setIncludeDiag] = useState(true);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null
  const [toastMsg, setToastMsg] = useState('');

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset status when opened
  useEffect(() => {
    if (isOpen) {
      setSubmitStatus(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Gather system diagnostics
  const diagnostics = `
---
System & Environment Diagnostics:
- URL: ${window.location.href}
- Route: ${loc.pathname}
- Active Problem: ${activeTab || 'N/A'}
- Language: ${language || 'java'}
- Recent Error: ${error ? error : 'None'}
- Viewport: ${window.innerWidth}x${window.innerHeight}
- User Agent: ${navigator.userAgent}
- Timestamp: ${new Date().toISOString()}
`.trim();

  const fullReport = `
Type: ${feedbackType.toUpperCase()}
Sender: ${userContact || 'Anonymous'}
Subject: ${subject || 'TRACE Feedback'}

Message:
${message || '(No description provided)'}

${includeDiag ? `\n${diagnostics}` : ''}
`.trim();

  function showToast(msg) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  }

  // ── 1. Direct In-App Submission via Web3Forms ──────────────────
  async function handleSubmit(e) {
    if (e) e.preventDefault();
    if (!message.trim() && !subject.trim()) {
      showToast('Please enter a short message or subject');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const payload = {
        access_key: WEB3FORMS_ACCESS_KEY,
        from_name: "TRACE — Visual DSA Debugger",
        subject: `[TRACE ${feedbackType.toUpperCase()}] ${subject || 'New Feedback'}`,
        name: userContact.trim() || "TRACE User",
        email: userContact.includes('@') ? userContact.trim() : "prathvisahu31@gmail.com",
        category: feedbackType,
        message: fullReport
      };

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        setSubmitStatus('success');
        showToast('Email sent directly to developer!');
        // Reset fields
        setMessage('');
        setSubject('');
        // Auto close after 2.5 seconds
        setTimeout(() => {
          onClose();
        }, 2500);
      } else {
        setSubmitStatus('error');
        showToast(data.message || 'Failed to submit form');
      }
    } catch (err) {
      console.error("Web3Forms submission error:", err);
      setSubmitStatus('error');
      showToast('Network error. You can also send via email.');
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── 2. Auxiliary: Open GitHub Issue ───────────────────────────
  function handleOpenGitHubIssue() {
    const repoUrl = 'https://github.com/PrathviSahu/TRACE/issues/new';
    const issueTitle = encodeURIComponent(`[${feedbackType.toUpperCase()}] ${subject || 'Issue report'}`);
    const issueBody = encodeURIComponent(fullReport);
    window.open(`${repoUrl}?title=${issueTitle}&body=${issueBody}`, '_blank', 'noopener,noreferrer');
    showToast('Opened GitHub Issues in new tab');
  }

  // ── 3. Auxiliary: Copy to Clipboard ───────────────────────────
  async function handleCopyReport() {
    try {
      await navigator.clipboard.writeText(fullReport);
      showToast('Report copied to clipboard!');
    } catch (_) {
      showToast('Could not copy report');
    }
  }

  return (
    <div
      className="feedback-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16
      }}
    >
      <div
        className="feedback-modal-container"
        style={{
          background: 'var(--bg-raised, #161b22)',
          border: '1px solid var(--border-card, #30363d)',
          borderRadius: 14,
          width: '100%',
          maxWidth: 540,
          boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'fadeIn 0.2s ease-out'
        }}
      >
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle, #21262d)',
          background: 'var(--bg-canvas, #0d1117)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(255, 159, 67, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              color: 'var(--accent-amber, #ff9f43)'
            }}>
              💬
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--txt-bright, #f0f6fc)' }}>
                Send Feedback & Report Bugs
              </h3>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--txt-dim, #6e7681)' }}>
                Directly reaches Prathvi Sahu's inbox
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--txt-dim, #6e7681)',
              fontSize: 18,
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 4
            }}
            title="Close (Esc)"
          >
            ✕
          </button>
        </div>

        {/* Success Banner */}
        {submitStatus === 'success' ? (
          <div style={{
            padding: '36px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12
          }}>
            <div style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'rgba(74, 222, 128, 0.15)',
              border: '1.5px solid rgba(74, 222, 128, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              color: '#4ade80'
            }}>
              ✓
            </div>
            <h4 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--txt-bright, #f0f6fc)' }}>
              Feedback Delivered!
            </h4>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--txt-dim, #6e7681)', maxWidth: 360, lineHeight: 1.5 }}>
              Thank you! Your message has been sent directly to the developer's inbox. We'll look into it right away.
            </p>
            <button
              type="button"
              onClick={onClose}
              style={{
                marginTop: 8,
                padding: '7px 20px',
                fontSize: 12,
                fontWeight: 600,
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid var(--border-subtle, #21262d)',
                color: 'var(--txt-bright, #f0f6fc)',
                borderRadius: 6,
                cursor: 'pointer'
              }}
            >
              Done
            </button>
          </div>
        ) : (
          /* Modal Form Body */
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', margin: 0 }}>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14, maxHeight: 'calc(85vh - 140px)', overflowY: 'auto' }}>
              {/* Category Selector */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--txt-main, #c9d1d9)', marginBottom: 6 }}>
                  Category
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {[
                    { id: 'bug', icon: '🐛', label: 'Bug Report' },
                    { id: 'feature', icon: '💡', label: 'Feature Request' },
                    { id: 'general', icon: '✨', label: 'Feedback' }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setFeedbackType(t.id)}
                      style={{
                        padding: '8px 10px',
                        fontSize: 11.5,
                        fontFamily: 'inherit',
                        fontWeight: feedbackType === t.id ? 700 : 500,
                        borderRadius: 6,
                        border: feedbackType === t.id
                          ? '1.5px solid var(--accent-amber, #ff9f43)'
                          : '1px solid var(--border-subtle, #21262d)',
                        background: feedbackType === t.id
                          ? 'rgba(255, 159, 67, 0.12)'
                          : 'rgba(255, 255, 255, 0.02)',
                        color: feedbackType === t.id
                          ? 'var(--accent-amber, #ff9f43)'
                          : 'var(--txt-main, #c9d1d9)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span>{t.icon}</span>
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--txt-main, #c9d1d9)', marginBottom: 6 }}>
                  Subject / Summary
                </label>
                <input
                  type="text"
                  name="subject"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder={
                    feedbackType === 'bug'
                      ? 'e.g., Array pointer off by 1 in 3Sum'
                      : feedbackType === 'feature'
                      ? 'e.g., Add Dijkstra algorithm visualizer'
                      : 'e.g., Love the visual step-by-step debugger!'
                  }
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: 12,
                    borderRadius: 6,
                    background: 'var(--bg-canvas, #0d1117)',
                    border: '1px solid var(--border-subtle, #21262d)',
                    color: 'var(--txt-bright, #f0f6fc)',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Message / Description */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--txt-main, #c9d1d9)', marginBottom: 6 }}>
                  Details / Steps to reproduce <span style={{ color: 'var(--accent-amber)' }}>*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  name="message"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={
                    feedbackType === 'bug'
                      ? 'Please describe what happened, what code was running, or how to reproduce it...'
                      : 'Tell us more about what you would like to see or your thoughts...'
                  }
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: 12,
                    borderRadius: 6,
                    background: 'var(--bg-canvas, #0d1117)',
                    border: '1px solid var(--border-subtle, #21262d)',
                    color: 'var(--txt-bright, #f0f6fc)',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    minHeight: 85
                  }}
                />
              </div>

              {/* Contact info */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--txt-main, #c9d1d9)', marginBottom: 6 }}>
                  Your Email / Handle <span style={{ fontSize: 10, opacity: 0.6 }}>(for reply if needed)</span>
                </label>
                <input
                  type="text"
                  name="email"
                  value={userContact}
                  onChange={e => setUserContact(e.target.value)}
                  placeholder="e.g., yourname@gmail.com or @handle"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: 12,
                    borderRadius: 6,
                    background: 'var(--bg-canvas, #0d1117)',
                    border: '1px solid var(--border-subtle, #21262d)',
                    color: 'var(--txt-bright, #f0f6fc)',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Diagnostics checkbox */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  id="include-diag"
                  checked={includeDiag}
                  onChange={e => setIncludeDiag(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <label htmlFor="include-diag" style={{ fontSize: 11, color: 'var(--txt-dim, #6e7681)', cursor: 'pointer' }}>
                  Auto-attach browser, route, and problem diagnostics
                </label>
              </div>

              {/* Error fallback banner */}
              {submitStatus === 'error' && (
                <div style={{
                  padding: '10px 12px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  fontSize: 11.5
                }}>
                  <span style={{ color: '#f87171' }}>
                    Network issue? Send directly to inbox:
                  </span>
                  <a
                    href={`mailto:prathvisahu31@gmail.com?subject=${encodeURIComponent(`[TRACE ${feedbackType.toUpperCase()}] ${subject || 'Feedback'}`)}&body=${encodeURIComponent(fullReport)}`}
                    style={{
                      padding: '5px 11px',
                      background: '#ef4444',
                      color: '#ffffff',
                      borderRadius: 5,
                      textDecoration: 'none',
                      fontWeight: 600,
                      fontSize: 11,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Open Mail App ✉
                  </a>
                </div>
              )}

              {/* Author badge */}
              <div style={{
                padding: '9px 12px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle, #21262d)',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 11
              }}>
                <div>
                  <span style={{ color: 'var(--txt-dim, #6e7681)' }}>Developer: </span>
                  <strong style={{ color: 'var(--txt-bright, #f0f6fc)' }}>Prathvi Sahu</strong>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <a
                    href="https://prathvisahu.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--accent-amber, #ff9f43)', textDecoration: 'none', fontWeight: 600 }}
                  >
                    Portfolio ↗
                  </a>
                  <a
                    href="https://github.com/PrathviSahu/TRACE"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--accent-cyan, #38d9c5)', textDecoration: 'none', fontWeight: 600 }}
                  >
                    GitHub ↗
                  </a>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '14px 20px',
              borderTop: '1px solid var(--border-subtle, #21262d)',
              background: 'var(--bg-canvas, #0d1117)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                {toastMsg && (
                  <span style={{
                    fontSize: 11,
                    fontFamily: 'var(--font-mono, monospace)',
                    color: submitStatus === 'error' ? '#ef4444' : 'var(--accent-cyan, #38d9c5)',
                    fontWeight: 600
                  }}>
                    {submitStatus === 'error' ? '⚠️ ' : '✓ '} {toastMsg}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={handleCopyReport}
                  style={{
                    padding: '7px 11px',
                    fontSize: 11.5,
                    fontFamily: 'inherit',
                    background: 'transparent',
                    border: '1px solid var(--border-subtle, #21262d)',
                    color: 'var(--txt-main, #c9d1d9)',
                    borderRadius: 6,
                    cursor: 'pointer'
                  }}
                  title="Copy markdown report to clipboard"
                >
                  Copy
                </button>

                <button
                  type="button"
                  onClick={handleOpenGitHubIssue}
                  style={{
                    padding: '7px 11px',
                    fontSize: 11.5,
                    fontFamily: 'inherit',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-card, #30363d)',
                    color: 'var(--txt-bright, #f0f6fc)',
                    borderRadius: 6,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                  title="Create public issue on GitHub"
                >
                  <span>GitHub</span>
                  <span>↗</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '7px 18px',
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: 'inherit',
                    background: isSubmitting
                      ? 'rgba(255, 159, 67, 0.5)'
                      : 'linear-gradient(135deg, #ff9f43, #ff7e1b)',
                    border: 'none',
                    color: '#090b0e',
                    borderRadius: 6,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '0 2px 8px rgba(255, 159, 67, 0.35)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Send to Developer</span>
                      <span>✉</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
