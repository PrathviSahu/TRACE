import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTraceStore } from '../store/traceStore.js';

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

  if (!isOpen) return null;

  // Gather system diagnostics
  const diagnostics = `
---
**System & Environment Diagnostics:**
- **URL**: ${window.location.href}
- **Route**: ${loc.pathname}
- **Active Problem / Tab**: ${activeTab || 'N/A'}
- **Language**: ${language || 'java'}
- **Recent Error**: ${error ? `\`${error}\`` : 'None'}
- **Screen**: ${window.innerWidth}x${window.innerHeight}
- **User Agent**: ${navigator.userAgent}
- **Timestamp**: ${new Date().toISOString()}
`.trim();

  const fullReport = `
**Type**: ${feedbackType.toUpperCase()}
**From**: ${userContact || 'Anonymous'}
**Subject**: ${subject || 'TRACE Feedback'}

**Message**:
${message || '(No detailed description provided)'}

${includeDiag ? `\n${diagnostics}` : ''}
`.trim();

  function showToast(msg) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  }

  // Open email client via mailto
  function handleSendEmail() {
    const targetEmail = 'prathvisahu2004@gmail.com'; // Developer contact
    const mailSubject = encodeURIComponent(`[TRACE ${feedbackType.toUpperCase()}] ${subject || 'Feedback'}`);
    const mailBody = encodeURIComponent(fullReport);
    const mailtoUrl = `mailto:${targetEmail}?subject=${mailSubject}&body=${mailBody}`;
    window.location.href = mailtoUrl;
    showToast('Opening default email client...');
  }

  // Open GitHub Issue
  function handleOpenGitHubIssue() {
    const repoUrl = 'https://github.com/PrathviSahu/TRACE/issues/new';
    const issueTitle = encodeURIComponent(`[${feedbackType.toUpperCase()}] ${subject || 'Issue report'}`);
    const issueBody = encodeURIComponent(fullReport);
    window.open(`${repoUrl}?title=${issueTitle}&body=${issueBody}`, '_blank', 'noopener,noreferrer');
    showToast('Opened GitHub Issues in new tab');
  }

  // Copy report to clipboard
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
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
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
          borderRadius: 12,
          width: '100%',
          maxWidth: 540,
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
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
                Connect directly with the developer
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

        {/* Modal Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14, maxHeight: 'calc(85vh - 120px)', overflowY: 'auto' }}>
          {/* Feedback Type Selector */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--txt-main, #c9d1d9)', marginBottom: 6 }}>
              What kind of feedback is this?
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {[
                { id: 'bug', icon: '🐛', label: 'Bug Report' },
                { id: 'feature', icon: '💡', label: 'Feature Request' },
                { id: 'general', icon: '✨', label: 'General Feedback' }
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
              Subject
            </label>
            <input
              type="text"
              className="input-field"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder={
                feedbackType === 'bug'
                  ? 'e.g., Array visualizer index off by 1 in 3Sum'
                  : feedbackType === 'feature'
                  ? 'e.g., Add Dijkstra shortest path visualizer'
                  : 'e.g., Loving the step-by-step debugger!'
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
              Description
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder={
                feedbackType === 'bug'
                  ? 'Describe what happened and how to reproduce it...'
                  : 'Describe your idea, use cases, or feedback...'
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
                minHeight: 80
              }}
            />
          </div>

          {/* User Contact */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--txt-main, #c9d1d9)', marginBottom: 6 }}>
              Your Email / Discord / Twitter (optional)
            </label>
            <input
              type="text"
              value={userContact}
              onChange={e => setUserContact(e.target.value)}
              placeholder="e.g. alex@example.com or @alex on GitHub"
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

          {/* Include Diagnostics Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              id="include-diag"
              checked={includeDiag}
              onChange={e => setIncludeDiag(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <label htmlFor="include-diag" style={{ fontSize: 11, color: 'var(--txt-dim, #6e7681)', cursor: 'pointer' }}>
              Include system diagnostics (browser, active problem, error trace)
            </label>
          </div>

          {/* Direct Developer Profiles Card */}
          <div style={{
            padding: '10px 14px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle, #21262d)',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 11
          }}>
            <div>
              <span style={{ color: 'var(--txt-dim, #6e7681)' }}>Built by </span>
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
                GitHub Repo ↗
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
                color: 'var(--accent-cyan, #38d9c5)',
                fontWeight: 600
              }}>
                ✓ {toastMsg}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={handleCopyReport}
              style={{
                padding: '6px 12px',
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
              Copy Report
            </button>

            <button
              type="button"
              onClick={handleOpenGitHubIssue}
              style={{
                padding: '6px 12px',
                fontSize: 11.5,
                fontFamily: 'inherit',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--border-card, #30363d)',
                color: 'var(--txt-bright, #f0f6fc)',
                borderRadius: 6,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5
              }}
              title="Create issue on GitHub"
            >
              <span>GitHub Issue</span>
              <span>↗</span>
            </button>

            <button
              type="button"
              onClick={handleSendEmail}
              style={{
                padding: '6px 14px',
                fontSize: 11.5,
                fontWeight: 600,
                fontFamily: 'inherit',
                background: 'linear-gradient(135deg, #ff9f43, #ff7e1b)',
                border: 'none',
                color: '#090b0e',
                borderRadius: 6,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5
              }}
              title="Send directly to developer via email"
            >
              <span>Send Email</span>
              <span>✉</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
