import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api.js';
import { setOnboardingComplete } from './Onboarding';

const CYCLE_LENGTH_MIN = 21;
const CYCLE_LENGTH_MAX = 45;
const CYCLE_LENGTH_DEFAULT = 28;

export default function Setup({ onComplete, title = 'Set up your cycle' }) {
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];
  const defaultLastPeriod = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [lastPeriod, setLastPeriod] = useState(defaultLastPeriod);
  const [avgCycleLength, setAvgCycleLength] = useState(CYCLE_LENGTH_DEFAULT);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setStatus(null);
    setSaving(true);
    const length = Number(avgCycleLength);
    if (length < CYCLE_LENGTH_MIN || length > CYCLE_LENGTH_MAX) {
      setError(`Cycle length is usually between ${CYCLE_LENGTH_MIN} and ${CYCLE_LENGTH_MAX} days.`);
      setSaving(false);
      return;
    }
    try {
      await api.put('/profile', {
        lastperiod: lastPeriod,
        avgcyclelength: length,
      });
      setStatus('Saved.');
      setOnboardingComplete();
      if (typeof onComplete === 'function') {
        onComplete();
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.error ?? err.message ?? 'Could not save.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto min-h-dvh max-w-lg bg-[#fef7f5] px-6 pt-10 pb-10">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-stone-800">{title}</h1>
        <p className="mt-1 text-sm text-stone-500">
          This helps us predict your next period.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="lastperiod" className="block text-xs font-bold uppercase tracking-wider text-stone-500">
            First day of your last period
          </label>
          <input
            id="lastperiod"
            type="date"
            value={lastPeriod}
            max={today}
            onChange={(e) => setLastPeriod(e.target.value)}
            className="mt-2 w-full rounded-xl border border-rose-100 bg-white px-4 py-3 text-stone-800 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200"
          />
        </div>

        <div>
          <label htmlFor="avgcyclelength" className="block text-xs font-bold uppercase tracking-wider text-stone-500">
            Average cycle length (days)
          </label>
          <p className="mt-1 text-xs text-stone-400">
            From day 1 of one period to day 1 of the next. Most people use 21–35 days.
          </p>
          <input
            id="avgcyclelength"
            type="number"
            min={CYCLE_LENGTH_MIN}
            max={CYCLE_LENGTH_MAX}
            value={avgCycleLength}
            onChange={(e) => setAvgCycleLength(e.target.value)}
            className="mt-2 w-full rounded-xl border border-rose-100 bg-white px-4 py-3 text-stone-800 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200"
          />
          <div className="mt-2 flex gap-2">
            {[21, 28, 30, 35].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setAvgCycleLength(n)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  Number(avgCycleLength) === n ? 'bg-rose-500 text-white' : 'bg-rose-50 text-stone-600 hover:bg-rose-100'
                }`}
              >
                {n} days
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
        )}
        {status && (
          <p className="text-sm text-rose-600">{status}</p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 py-4 text-lg font-bold text-white shadow-lg shadow-rose-300/30 transition disabled:opacity-70 active:scale-[0.99]"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </form>
    </div>
  );
}
