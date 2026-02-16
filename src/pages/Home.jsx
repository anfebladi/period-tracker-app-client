import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api.js';
import { ChartIcon, FlowerIcon, CalendarIcon, DropletIcon, SparkleIcon } from '../components/NavIcons.jsx';

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
          const err = failed[0].reason;
          const status = err?.response?.status;
          const msg = err?.response?.data?.error ?? err?.message ?? 'Could not load data.';
          const hint = status === 500
            ? ' Make sure the backend is running (node app.js in period-tracker-app) and on the same network.'
            : status >= 500 || !err?.response
              ? ' Ensure the backend is running on your computer.'
              : '';
          setError(msg + hint);
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
        <div className="glass-card rounded-[var(--radius-lg)] p-5 space-y-4">
          <p className="text-body text-[var(--text-secondary)]">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="glass-button w-full rounded-[var(--radius-sm)] py-3 text-body font-semibold text-white"
          >
            Retry
          </button>
        </div>
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
            className="glass-card relative max-w-sm rounded-[var(--radius-xl)] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeTrendPopup}
              className="absolute right-3 top-3 rounded-full p-2 text-[var(--text-muted)] transition hover:bg-white/30 hover:text-[var(--accent)]"
              aria-label="Close"
            >
              ✕
            </button>
            <div className="mb-3 text-[var(--accent)]"><ChartIcon className="w-8 h-8" /></div>
            <h2 id="trend-title" className="text-title text-[var(--text-primary)]">
              Your trend
            </h2>
            <p className="mt-3 text-body text-[var(--text-secondary)]">
              {trendMessage}
            </p>
            <button
              type="button"
              onClick={closeTrendPopup}
              className="glass-button mt-6 w-full rounded-[var(--radius-sm)] py-3 text-body font-semibold text-white transition hover:opacity-90 active:scale-[0.99]"
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
        <div className="glass flex h-12 w-12 items-center justify-center rounded-full text-[var(--accent)]">
          <SparkleIcon />
        </div>
      </header>

      <section className="mb-12 flex flex-col items-center">
        <div className="glass-card relative flex h-56 w-56 flex-col items-center justify-center rounded-full border-[14px] border-white/40">
          <div className="absolute inset-0 rounded-full border-[14px] border-transparent border-t-white/50 border-r-white/30 -rotate-45" />
          <span className="text-label text-[var(--text-muted)]">
            Day
          </span>
          <span className="text-6xl font-semibold tabular-nums text-[var(--text-primary)] tracking-tight">
            {dayInCycle ?? '—'}
          </span>
          {isFertile && (
            <span className="glass mt-2 rounded-full px-3 py-1 text-label text-[var(--accent-deep)]">
              Fertile window
            </span>
          )}
        </div>
      </section>

      <section className="mb-8">
        <div className="glass-button flex items-center justify-between rounded-[var(--radius-xl)] px-6 py-6 text-white">
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
            className="glass rounded-full px-4 py-2.5 text-caption font-semibold transition hover:bg-white/40 active:scale-[0.98]"
          >
            Details
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4">
        <StatCard label="Phase" value={phase ?? '—'} Icon={FlowerIcon} />
        <StatCard label="Cycle day" value={dayInCycle != null ? String(dayInCycle) : '—'} Icon={CalendarIcon} />
        <StatCard label="Next period" value={daysToNext != null ? (daysToNext > 0 ? `${daysToNext}d` : 'Soon') : '—'} Icon={DropletIcon} />
        <StatCard label="Trends" value={hasTrend ? 'Available' : '—'} Icon={ChartIcon} />
      </section>
    </div>
  );
}

function StatCard({ label, value, Icon }) {
  return (
    <div className="glass-card flex flex-col gap-2.5 rounded-[var(--radius-lg)] p-4 text-left">
      <span className="text-[var(--accent)]" aria-hidden><Icon /></span>
      <div>
        <p className="text-label text-[var(--text-muted)]">{label}</p>
        <p className="mt-0.5 text-body font-semibold text-[var(--text-primary)]">{value}</p>
      </div>
    </div>
  );
}
