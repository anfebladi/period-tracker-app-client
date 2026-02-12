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
      const res = await api.put('/update-period');
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
    <div className="mx-auto min-h-full max-w-lg px-5 pt-6 pb-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-stone-800">Log</h1>
        <p className="mt-1 text-sm text-stone-500">Track your period & how you feel</p>
      </header>

      {/* I got my period */}
      <section className="mb-8">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-stone-500">
          Period start
        </h2>
        <button
          type="button"
          onClick={handlePeriodClick}
          className="w-full rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 py-4 text-lg font-bold text-white shadow-lg shadow-rose-300/30 transition active:scale-[0.99]"
        >
          I got my period today
        </button>
        {periodStatus && (
          <p className="mt-3 text-center text-sm text-rose-600">{periodStatus}</p>
        )}
        {periodError && (
          <p className="mt-3 text-center text-sm text-rose-600">{periodError}</p>
        )}
      </section>

      {/* Log how you're feeling */}
      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-stone-500">
          How you're feeling
        </h2>
        <form
          onSubmit={handleSymptomSubmit}
          className="rounded-2xl border border-rose-100/80 bg-white p-4 shadow-sm ring-1 ring-rose-50/50"
        >
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">
            Symptom or feeling
          </label>
          <select
            value={symptomName}
            onChange={(e) => setSymptomName(e.target.value)}
            className="mt-2 w-full rounded-xl border border-rose-100 bg-rose-50/30 px-4 py-3 text-stone-800 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200"
          >
            {SYMPTOM_OPTIONS.map((opt) => (
              <option key={opt.value || 'empty'} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <label className="mt-4 block text-xs font-bold uppercase tracking-wider text-stone-500">
            Severity
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {SEVERITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSeverity(opt.value)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  severity === opt.value
                    ? 'bg-rose-500 text-white'
                    : 'bg-rose-50 text-stone-600 hover:bg-rose-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            type="submit"
            className="mt-5 w-full rounded-xl bg-rose-500 py-3 font-bold text-white transition hover:bg-rose-600 active:scale-[0.99]"
          >
            Log feeling
          </button>
          {symptomStatus && (
            <p className="mt-3 text-center text-sm text-rose-600">{symptomStatus}</p>
          )}
          {symptomError && (
            <p className="mt-3 text-center text-sm text-rose-600">{symptomError}</p>
          )}
        </form>
      </section>
    </div>
  );
}
