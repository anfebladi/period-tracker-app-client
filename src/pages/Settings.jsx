import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api.js';
import { downloadSymptomPdf } from '../utils/pdfExport.js';

export default function Settings() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(scrollToBottom, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = message.trim();
    if (!text || loading) return;
    setMessage('');
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/assistant', { message: text });
      const reply = res.data?.reply ?? 'No reply.';
      setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
    } catch (err) {
      const msg = err.response?.data?.error ?? err.message ?? 'Something went wrong.';
      setError(msg);
      setMessages((prev) => [...prev, { role: 'assistant', text: `Error: ${msg}` }]);
    } finally {
      setLoading(false);
    }
  };

  const [pdfError, setPdfError] = useState(null);

  const handlePdfClick = () => {
    setPdfError(null);
    setPdfLoading(true);
    downloadSymptomPdf()
      .catch((err) => setPdfError(err?.message || 'Download failed'))
      .finally(() => setPdfLoading(false));
  };

  return (
    <div className="mx-auto min-h-full max-w-lg px-6 pt-8 pb-8">
      <header className="mb-8">
        <h1 className="text-title text-[var(--text-primary)]">Me</h1>
        <p className="mt-2 text-body text-[var(--text-secondary)]">Settings, assistant & export</p>
      </header>

      <section className="space-y-4">
        <Link
          to="/setup"
          className="glass-card flex items-center justify-between rounded-[var(--radius-lg)] p-4 transition hover:bg-white/50"
        >
          <span className="text-body font-medium text-[var(--text-primary)]">Update cycle info</span>
          <span className="text-[var(--text-muted)]">→</span>
        </Link>

        {pdfError && (
          <p className="rounded-lg bg-red-50 px-4 py-2 text-caption text-red-700">{pdfError}</p>
        )}
        <button
          type="button"
          onClick={handlePdfClick}
          disabled={pdfLoading}
          className="glass-card flex w-full items-center justify-between rounded-[var(--radius-lg)] p-4 transition hover:bg-white/50 disabled:opacity-70"
        >
          <span className="text-body font-medium text-[var(--text-primary)]">Export symptom report (PDF)</span>
          <span className="text-[var(--text-muted)]">{pdfLoading ? '…' : '↓'}</span>
        </button>
      </section>

      <section className="mt-10">
        <h2 className="text-label mb-4 text-[var(--text-muted)]">Health assistant</h2>
        <div className="glass-card rounded-[var(--radius-lg)] overflow-hidden">
          <div className="h-64 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <p className="text-caption text-[var(--text-muted)]">
                Ask about cycles, symptoms, or wellness. I&apos;m not a doctor—see a healthcare provider for medical advice.
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                    m.role === 'user'
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-[var(--bg-app)] text-[var(--text-primary)]'
                  }`}
                >
                  <p className="text-body whitespace-pre-wrap">{m.text}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl glass px-4 py-2.5">
                  <p className="text-body text-[var(--text-muted)]">Thinking…</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSend} className="border-t border-[var(--border)] p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask a question…"
                className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg-app)] px-4 py-3 text-body text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !message.trim()}
                className="glass-button rounded-xl px-4 py-3 text-body font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
