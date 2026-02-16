import { useState } from 'react';
import api from '../api.js';

const SYMPTOM_OPTIONS = [
  { value: '', label: 'Choose a symptom…' },
  { value: 'Cramps', label: 'Cramps' },
  { value: 'Headache', label: 'Headache' },
  { value: 'Mood', label: 'Mood' },
  { value: 'Fatigue', label: 'Fatigue' },
  { value: 'Bloating', label: 'Bloating' },
  { value: 'Acne', label: 'Acne' },
  { value: 'Back pain', label: 'Back pain' },
  { value: 'Breast tenderness', label: 'Breast tenderness' },
  { value: 'Nausea', label: 'Nausea' },
  { value: 'Anxiety', label: 'Anxiety' },
  { value: 'Insomnia', label: 'Insomnia' },
  { value: 'Other', label: 'Other' },
];

const SEVERITY_OPTIONS = [
  { value: '1', label: 'Mild' },
  { value: '2', label: 'Moderate' },
  { value: '3', label: 'Moderate–strong' },
  { value: '4', label: 'Strong' },
  { value: '5', label: 'Very strong' },
];

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

export default function Log() {
  const [periodStatus, setPeriodStatus] = useState(null);
  const [periodError, setPeriodError] = useState(null);
  const [symptomName, setSymptomName] = useState('');
  const [severity, setSeverity] = useState('');
  const [symptomStatus, setSymptomStatus] = useState(null);
  const [symptomError, setSymptomError] = useState(null);

  const handlePeriodClick = async () => {
    setPeriodError(null);
    setPeriodStatus(null);
    try {
      const res = await api.post('/new-period', { startDate: todayISO() });
      setPeriodStatus(res.data?.message ?? 'Cycle updated.');
    } catch (err) {
      setPeriodError(err.response?.data?.error ?? err.message ?? 'Failed to update.');
    }
  };

  const handleSymptomSubmit = async (e) => {
    e.preventDefault();
    setSymptomError(null);
    setSymptomStatus(null);
    if (!symptomName || !severity) {
      setSymptomError('Please choose both symptom and severity.');
      return;
    }
    try {
      await api.post('/logger', {
        symptomname: symptomName,
        severity,
      });
      setSymptomStatus('Logged successfully.');
      setSymptomName('');
      setSeverity('');
    } catch (err) {
      const msg = err.response?.data?.error ?? err.message ?? 'Something went wrong.';
      setSymptomError(msg);
    }
  };

  return (
    <div className="mx-auto min-h-full max-w-lg px-6 pt-8 pb-8">
      <header className="mb-10">
        <h1 className="text-title text-[var(--text-primary)]">Log</h1>
        <p className="mt-2 text-body text-[var(--text-secondary)]">Track your period & how you feel</p>
      </header>

      <section className="mb-10">
        <h2 className="text-label mb-3 text-[var(--text-muted)]">
          Period start
        </h2>
        <button
          type="button"
          onClick={handlePeriodClick}
          className="glass-button w-full rounded-[var(--radius-lg)] py-4 text-body font-semibold text-white transition hover:opacity-90 active:scale-[0.99]"
        >
          I got my period today
        </button>
        {periodStatus && (
          <p className="mt-3 text-center text-caption text-[var(--accent-deep)]">{periodStatus}</p>
        )}
        {periodError && (
          <p className="mt-3 text-center text-caption text-[var(--accent-deep)]">{periodError}</p>
        )}
      </section>

      <section>
        <h2 className="text-label mb-4 text-[var(--text-muted)]">
          How you're feeling
        </h2>
        <form
          onSubmit={handleSymptomSubmit}
          className="glass-card rounded-[var(--radius-lg)] p-5"
        >
          <label className="text-label block text-[var(--text-muted)]">
            Symptom or feeling
          </label>
          <select
            value={symptomName}
            onChange={(e) => setSymptomName(e.target.value)}
            className="glass-input mt-3 w-full rounded-[var(--radius-sm)] px-4 py-3.5 text-body text-[var(--text-primary)] transition focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            {SYMPTOM_OPTIONS.map((opt) => (
              <option key={opt.value || 'empty'} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <label className="text-label mt-5 block text-[var(--text-muted)]">
            Severity
          </label>
          <div className="mt-3 flex flex-wrap gap-2">
            {SEVERITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSeverity(opt.value)}
                className={`rounded-full px-4 py-2.5 text-caption font-semibold transition ${
                  severity === opt.value
                    ? 'bg-[var(--accent)] text-white shadow-[var(--shadow-soft)]'
                    : 'bg-[var(--bg-app)] text-[var(--text-secondary)] ring-1 ring-[var(--border)] hover:ring-[var(--accent-soft)]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            type="submit"
            className="glass-button mt-6 w-full rounded-[var(--radius-sm)] py-3.5 text-body font-semibold text-white transition hover:opacity-90 active:scale-[0.99]"
          >
            Log feeling
          </button>
          {symptomStatus && (
            <p className="mt-3 text-center text-caption text-[var(--accent-deep)]">{symptomStatus}</p>
          )}
          {symptomError && (
            <p className="mt-3 text-center text-caption text-[var(--accent-deep)]">{symptomError}</p>
          )}
        </form>
      </section>
    </div>
  );
}
