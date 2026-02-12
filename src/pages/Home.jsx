import { useState } from 'react';

const TREND_POPUP_KEY = 'trend_popup_seen';

export default function Home() {
  const [showTrendPopup, setShowTrendPopup] = useState(() => {
    try {
      return sessionStorage.getItem(TREND_POPUP_KEY) !== 'true';
    } catch {
      return true;
    }
  });

  const closeTrendPopup = () => {
    try {
      sessionStorage.setItem(TREND_POPUP_KEY, 'true');
    } catch (_) {}
    setShowTrendPopup(false);
  };

  return (
    <div className="mx-auto min-h-full max-w-lg px-5 pt-6 pb-8">
      {/* Trend popup – once per session when entering app */}
      {showTrendPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-labelledby="trend-title"
          aria-modal="true"
          onClick={closeTrendPopup}
        >
          <div
            className="relative max-w-sm rounded-3xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeTrendPopup}
              className="absolute right-3 top-3 rounded-full p-1.5 text-stone-400 hover:bg-rose-50 hover:text-stone-600"
              aria-label="Close"
            >
              ✕
            </button>
            <div className="mb-2 text-2xl">📊</div>
            <h2 id="trend-title" className="text-lg font-bold text-stone-800">
              Your trend
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              Based on your symptoms around this time in your cycle, you often experience{' '}
              <span className="font-semibold text-rose-600">cramps</span> and{' '}
              <span className="font-semibold text-rose-600">fatigue</span>. We’ll refine this as you log more.
            </p>
            <p className="mt-2 text-xs text-stone-400">
              (Trends are based on your usual symptoms for these cycle days — you’ll hook this up to your backend later.)
            </p>
            <button
              type="button"
              onClick={closeTrendPopup}
              className="mt-5 w-full rounded-xl bg-rose-500 py-3 font-semibold text-white transition hover:bg-rose-600 active:scale-[0.99]"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-stone-400">
            Current phase
          </p>
          <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-stone-800 capitalize">
            Follicular
          </h1>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl shadow-sm ring-1 ring-rose-100">
          ✨
        </div>
      </header>

      {/* Day circle */}
      <section className="mb-10 flex flex-col items-center">
        <div className="relative flex h-56 w-56 flex-col items-center justify-center rounded-full border-[14px] border-rose-100/80 bg-white shadow-inner ring-4 ring-white/50">
          <div className="absolute inset-0 rounded-full border-[14px] border-transparent border-t-rose-300 border-r-rose-200 -rotate-45" />
          <span className="text-xs font-semibold uppercase tracking-widest text-stone-400">
            Day
          </span>
          <span className="text-6xl font-bold tabular-nums text-stone-700">12</span>
          <span className="mt-1.5 rounded-full bg-rose-100 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-600">
            Fertile window
          </span>
        </div>
      </section>

      {/* Next period card */}
      <section className="mb-6">
        <div className="flex items-center justify-between rounded-3xl bg-gradient-to-br from-rose-500 to-rose-600 px-6 py-5 text-white shadow-lg shadow-rose-300/30">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider opacity-90">
              Next period
            </p>
            <p className="mt-1 text-2xl font-bold">In 5 days</p>
          </div>
          <button
            type="button"
            className="rounded-full bg-white/20 px-4 py-2.5 text-sm font-semibold transition hover:bg-white/30 active:scale-[0.98]"
          >
            Details
          </button>
        </div>
      </section>

      {/* Stat cards grid */}
      <section className="grid grid-cols-2 gap-3">
        <StatCard label="Sleep" value="7.5h" icon="🌙" />
        <StatCard label="Mood" value="Steady" icon="🎭" />
        <StatCard label="Energy" value="High" icon="⚡" />
        <StatCard label="Flow" value="None" icon="💧" />
      </section>
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <button
      type="button"
      className="flex flex-col gap-2 rounded-2xl border border-rose-50 bg-white p-4 text-left shadow-sm ring-1 ring-rose-50/50 transition hover:border-rose-100 hover:shadow-md active:scale-[0.99]"
    >
      <span className="text-xl" aria-hidden>{icon}</span>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">{label}</p>
        <p className="mt-0.5 text-base font-bold text-stone-700">{value}</p>
      </div>
    </button>
  );
}
