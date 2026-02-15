import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api.js';

const TREND_POPUP_KEY = 'trend_popup_seen';

function daysUntil(targetISO) {
  const today = new Date().toISOString().split('T')[0];
  const target = new Date(targetISO);
  const now = new Date();
  const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  return diff;
}

export default function Home() {
  const [showTrendPopup, setShowTrendPopup] = useState(() => {
    try {
      return sessionStorage.getItem(TREND_POPUP_KEY) !== 'true';
    } catch {
      return true;
    }
  });
  const [period, setPeriod] = useState(null);
  const [trends, setTrends] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const results = await Promise.allSettled([
          api.get('/period'),
          api.get('/trends'),
          api.get('/predictions'),
        ]);
        if (cancelled) return;
        const [periodResult, trendsResult, predictionsResult] = results;
        if (periodResult.status === 'fulfilled') setPeriod(periodResult.value.data);
        if (trendsResult.status === 'fulfilled') setTrends(trendsResult.value.data);
        if (predictionsResult.status === 'fulfilled') setPredictions(predictionsResult.value.data);
        const failed = results.filter((r) => r.status === 'rejected');
        if (failed.length > 0 && periodResult.status !== 'fulfilled') {
          setError(failed[0].reason?.response?.data?.error ?? failed[0].reason?.message ?? 'Could not load data.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, []);

  const closeTrendPopup = () => {
    try {
      sessionStorage.setItem(TREND_POPUP_KEY, 'true');
    } catch (_) {}
    setShowTrendPopup(false);
  };

  const phase = period?.phase ?? null;
  const dayInCycle = period?.day_in_cycle ?? null;
  const hasTrend = trends?.has_trend ?? false;
  const trendMessage = trends?.message ?? '';
  const suggestedSymptoms = trends?.suggested_symptoms ?? [];

  const nextPrediction = Array.isArray(predictions) && predictions.length > 0
    ? predictions[0]
    : null;
  const daysToNext = nextPrediction?.estimated_start
    ? daysUntil(nextPrediction.estimated_start)
    : null;

  const isOvulation = phase === 'Ovulation';
  const isFertile = isOvulation || (phase === 'Follicular' && dayInCycle != null && dayInCycle >= 8);

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
      {showTrendPopup && trendMessage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          role="dialog"
          aria-labelledby="trend-title"
          aria-modal="true"
          onClick={closeTrendPopup}
        >
          <div
            className="relative max-w-sm rounded-[var(--radius-xl)] bg-white p-6 shadow-[var(--shadow-card)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeTrendPopup}
              className="absolute right-3 top-3 rounded-full p-2 text-[var(--text-muted)] transition hover:bg-[var(--accent-soft)] hover:text-rose-500"
              aria-label="Close"
            >
              ✕
            </button>
            <div className="mb-3 text-2xl">📊</div>
            <h2 id="trend-title" className="text-title text-[var(--text-primary)]">
              Your trend
            </h2>
            <p className="mt-3 text-body text-[var(--text-secondary)]">
              {trendMessage}
            </p>
            <button
              type="button"
              onClick={closeTrendPopup}
              className="mt-6 w-full rounded-[var(--radius-sm)] bg-rose-500 py-3 text-body font-semibold text-white transition hover:bg-rose-600 active:scale-[0.99]"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      <header className="mb-10 flex items-end justify-between">
        <div>
          <p className="text-label text-[var(--text-muted)]">
            Current phase
          </p>
          <h1 className="mt-1 text-title text-[var(--text-primary)] capitalize">
            {phase ?? '—'}
          </h1>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl shadow-[var(--shadow-soft)] ring-1 ring-[var(--border)]">
          ✨
        </div>
      </header>

      <section className="mb-12 flex flex-col items-center">
        <div className="relative flex h-56 w-56 flex-col items-center justify-center rounded-full border-[14px] border-rose-100/70 bg-white shadow-[var(--shadow-soft)] ring-2 ring-white">
          <div className="absolute inset-0 rounded-full border-[14px] border-transparent border-t-rose-200 border-r-rose-100 -rotate-45" />
          <span className="text-label text-[var(--text-muted)]">
            Day
          </span>
          <span className="text-6xl font-semibold tabular-nums text-[var(--text-primary)] tracking-tight">
            {dayInCycle ?? '—'}
          </span>
          {isFertile && (
            <span className="mt-2 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-label text-rose-500">
              Fertile window
            </span>
          )}
        </div>
      </section>

      <section className="mb-8">
        <div className="flex items-center justify-between rounded-[var(--radius-xl)] bg-gradient-to-br from-rose-500 to-rose-600 px-6 py-6 text-white shadow-[var(--shadow-card)]">
          <div>
            <p className="text-label opacity-90">
              Next period
            </p>
            <p className="mt-1.5 text-title">
              {daysToNext != null
                ? daysToNext > 0
                  ? `In ${daysToNext} days`
                  : daysToNext === 0
                    ? 'Today'
                    : 'Soon'
                : '—'}
            </p>
          </div>
          <Link
            to="/calendar"
            className="rounded-full bg-white/20 px-4 py-2.5 text-caption font-semibold transition hover:bg-white/30 active:scale-[0.98]"
          >
            Details
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4">
        <StatCard label="Phase" value={phase ?? '—'} icon="🌸" />
        <StatCard label="Cycle day" value={dayInCycle != null ? String(dayInCycle) : '—'} icon="📅" />
        <StatCard label="Next period" value={daysToNext != null ? (daysToNext > 0 ? `${daysToNext}d` : 'Soon') : '—'} icon="💧" />
        <StatCard label="Trends" value={hasTrend ? 'Available' : '—'} icon="📊" />
      </section>
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="flex flex-col gap-2.5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-4 text-left shadow-[var(--shadow-soft)]">
      <span className="text-xl" aria-hidden>{icon}</span>
      <div>
        <p className="text-label text-[var(--text-muted)]">{label}</p>
        <p className="mt-0.5 text-body font-semibold text-[var(--text-primary)]">{value}</p>
      </div>
    </div>
  );
}
