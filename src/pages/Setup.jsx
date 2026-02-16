import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { setOnboardingComplete } from './Onboarding';

const CYCLE_LENGTH_MIN = 21;
const CYCLE_LENGTH_MAX = 45;
const CYCLE_LENGTH_DEFAULT = 28;

export default function Setup({ onComplete, title = 'Set up your cycle' }) {
  const navigate = useNavigate();
  const { token, setToken } = useAuth();
  const today = new Date().toISOString().split('T')[0];
  const defaultLastPeriod = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [lastPeriod, setLastPeriod] = useState(defaultLastPeriod);
  const [avgCycleLength, setAvgCycleLength] = useState(CYCLE_LENGTH_DEFAULT);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const isUpdating = !!token;

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
      if (isUpdating) {
        await api.post('/new-period', { startDate: lastPeriod });
      } else {
        const newUserRes = await api.post('/newuser', { avgcyclelength: length });
        const userToken = newUserRes.data?.userToken;
        if (!userToken) {
          setError('Could not create profile. Please try again.');
          return;
        }
        setToken(userToken);
        await api.post('/first-period', { startDate: lastPeriod });
      }
      setStatus('Saved.');
      setOnboardingComplete();
      if (typeof onComplete === 'function') {
        onComplete();
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      const status = err?.response?.status;
      let msg = err?.response?.data?.error ?? err.message ?? 'Could not save.';
      if (status === 500 || status >= 500)
        msg += ' Make sure the backend is running (node app.js in period-tracker-app).';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto min-h-dvh max-w-lg px-6 pt-12 pb-12">
      <header className="mb-10">
        <h1 className="text-title text-[var(--text-primary)]">{title}</h1>
        <p className="mt-2 text-body text-[var(--text-secondary)]">
          This helps us predict your next period.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="lastperiod" className="text-label block text-[var(--text-muted)]">
            First day of your last period
          </label>
          <input
            id="lastperiod"
            type="date"
            value={lastPeriod}
            max={today}
            onChange={(e) => setLastPeriod(e.target.value)}
            className="glass-input mt-3 w-full rounded-[var(--radius-sm)] px-4 py-3.5 text-body text-[var(--text-primary)] transition focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-white/50"
          />
        </div>

        <div>
          <label htmlFor="avgcyclelength" className="text-label block text-[var(--text-muted)]">
            Average cycle length (days)
          </label>
          <p className="mt-1 text-caption text-[var(--text-muted)]">
            From day 1 of one period to day 1 of the next. Most people use 21–35 days.
          </p>
          <input
            id="avgcyclelength"
            type="number"
            min={CYCLE_LENGTH_MIN}
            max={CYCLE_LENGTH_MAX}
            value={avgCycleLength}
            onChange={(e) => setAvgCycleLength(e.target.value)}
            className="glass-input mt-3 w-full rounded-[var(--radius-sm)] px-4 py-3.5 text-body text-[var(--text-primary)] transition focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-white/50"
          />
          <div className="mt-3 flex gap-2">
            {[21, 28, 30, 35].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setAvgCycleLength(n)}
                className={`rounded-full px-4 py-2 text-caption font-semibold transition ${
                  Number(avgCycleLength) === n
                    ? 'glass-button text-white'
                    : 'glass text-[var(--text-secondary)] hover:bg-white/50'
                }`}
              >
                {n} days
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="glass-card rounded-[var(--radius-sm)] px-4 py-3 text-caption text-[var(--accent-deep)]">{error}</p>
        )}
        {status && (
          <p className="text-caption text-[var(--accent-deep)]">{status}</p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="glass-button w-full rounded-[var(--radius-lg)] py-4 text-body font-semibold text-white transition hover:opacity-90 disabled:opacity-70 active:scale-[0.99]"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </form>
    </div>
  );
}
