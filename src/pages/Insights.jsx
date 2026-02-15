import { useState, useEffect } from 'react';
import api from '../api.js';

const SEVERITY_LABELS = {
  '1': 'Mild',
  '2': 'Moderate',
  '3': 'Moderate–strong',
  '4': 'Strong',
  '5': 'Very strong',
};

function formatDate(str) {
  if (!str) return '—';
  const d = new Date(str);
  if (isNaN(d.getTime())) return str;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateKey(str) {
  if (!str) return '';
  const d = new Date(str);
  if (isNaN(d.getTime())) return str;
  return d.toISOString().split('T')[0];
}

export default function Insights() {
  const [logs, setLogs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchLogs() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/logs');
        if (!cancelled) setLogs(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.error ?? err.message ?? 'Could not load logs.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchLogs();
    return () => { cancelled = true; };
  }, []);

  const byDate = (logs || []).reduce((acc, entry) => {
    const key = formatDateKey(entry.created_at ?? entry.date ?? entry.logged_at) || 'no-date';
    if (!acc[key]) acc[key] = [];
    acc[key].push(entry);
    return acc;
  }, {});

  const sortedDates = Object.keys(byDate).sort((a, b) => (a === 'no-date' ? 1 : b === 'no-date' ? -1 : b.localeCompare(a)));

  const severityCounts = (logs || []).reduce((acc, entry) => {
    const s = String(entry.severity ?? '');
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const symptomCounts = (logs || []).reduce((acc, entry) => {
    const name = entry.symptomname ?? entry.symptom_name ?? 'Other';
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});

  const topSymptom = Object.entries(symptomCounts).sort((a, b) => b[1] - a[1])[0];

  if (loading) {
    return (
      <div className="mx-auto min-h-full max-w-lg px-6 pt-8 pb-8">
        <p className="text-center text-body text-[var(--text-muted)]">Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto min-h-full max-w-lg px-6 pt-8 pb-8">
        <p className="rounded-[var(--radius-sm)] bg-[var(--accent-soft)] px-4 py-3 text-caption text-rose-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-full max-w-lg px-6 pt-8 pb-8">
      <header className="mb-8">
        <h1 className="text-title text-[var(--text-primary)]">Your data</h1>
        <p className="mt-2 text-body text-[var(--text-secondary)]">Symptom logs over time</p>
      </header>

      {(logs == null || logs.length === 0) ? (
        <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-12 text-center shadow-[var(--shadow-soft)]">
          <p className="text-5xl">📋</p>
          <p className="mt-4 text-body font-medium text-[var(--text-secondary)]">No logs yet</p>
          <p className="mt-2 text-caption text-[var(--text-muted)]">Log symptoms from the + tab to see them here.</p>
        </div>
      ) : (
        <>
          <section className="mb-8 grid grid-cols-2 gap-4">
            <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-soft)]">
              <p className="text-label text-[var(--text-muted)]">Total logs</p>
              <p className="mt-1.5 text-title text-[var(--text-primary)]">{logs.length}</p>
            </div>
            {topSymptom && (
              <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-soft)]">
                <p className="text-label text-[var(--text-muted)]">Most logged</p>
                <p className="mt-1.5 text-body font-semibold text-[var(--text-primary)] capitalize">{topSymptom[0]}</p>
                <p className="text-caption text-[var(--text-secondary)]">{topSymptom[1]} time{topSymptom[1] !== 1 ? 's' : ''}</p>
              </div>
            )}
          </section>

          {Object.keys(severityCounts).length > 0 && (
            <section className="mb-8">
              <h2 className="text-label mb-3 text-[var(--text-muted)]">By severity</h2>
              <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-soft)]">
                <div className="space-y-3">
                  {Object.entries(severityCounts)
                    .sort((a, b) => b[1] - a[1])
                    .map(([sev, count]) => (
                      <div key={sev} className="flex items-center gap-3">
                        <span className="w-28 text-body text-[var(--text-secondary)]">
                          {SEVERITY_LABELS[sev] ?? `Level ${sev}`}
                        </span>
                        <div className="flex-1 h-2 rounded-full bg-[var(--accent-soft)] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-rose-500 transition-all"
                            style={{ width: `${(count / logs.length) * 100}%` }}
                          />
                        </div>
                        <span className="text-body font-semibold text-[var(--text-primary)] w-6">{count}</span>
                      </div>
                    ))}
                </div>
              </div>
            </section>
          )}

          <section>
            <h2 className="text-label mb-3 text-[var(--text-muted)]">Logs by date</h2>
            <div className="space-y-4">
              {sortedDates.map((dateKey) => (
                <div key={dateKey} className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white shadow-[var(--shadow-soft)] overflow-hidden">
                  <div className="bg-[var(--bg-app)] px-4 py-2.5 text-label text-[var(--text-muted)]">
                    {dateKey === 'no-date' ? 'No date' : formatDate(dateKey)}
                  </div>
                  <ul className="divide-y divide-[var(--border)]">
                    {(byDate[dateKey] || []).map((entry, i) => (
                      <li key={entry.id ?? `${dateKey}-${i}`} className="flex items-center justify-between px-4 py-3.5">
                        <span className="text-body font-medium text-[var(--text-primary)] capitalize">
                          {entry.symptomname ?? entry.symptom_name ?? '—'}
                        </span>
                        <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-caption font-semibold text-rose-600">
                          {SEVERITY_LABELS[String(entry.severity)] ?? entry.severity}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
