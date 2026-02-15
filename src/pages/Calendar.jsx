import { useState, useEffect } from 'react';
import api from '../api.js';

function dateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getPredictedDateSet(predictions) {
  const set = new Set();
  if (!Array.isArray(predictions)) return set;
  for (const p of predictions) {
    const startStr = p?.estimated_start;
    if (!startStr) continue;
    const [y, m, d] = startStr.split('-').map(Number);
    if (isNaN(y) || isNaN(m) || isNaN(d)) continue;
    const start = new Date(y, m - 1, d);
    set.add(dateKey(start));
    const endStr = p?.estimated_end;
    if (endStr) {
      const [ey, em, ed] = endStr.split('-').map(Number);
      if (!isNaN(ey) && !isNaN(em) && !isNaN(ed)) {
        const end = new Date(ey, em - 1, ed);
        for (let i = 0; i <= Math.round((end - start) / (1000 * 60 * 60 * 24)); i++) {
          const d = new Date(start);
          d.setDate(d.getDate() + i);
          set.add(dateKey(d));
        }
        continue;
      }
    }
    for (let i = 1; i <= 5; i++) {
      const next = new Date(y, m - 1, d + i);
      set.add(dateKey(next));
    }
  }
  return set;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function Calendar() {
  const [viewDate, setViewDate] = useState(() => new Date());
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchPredictions() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/predictions');
        if (!cancelled) setPredictions(res.data);
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.error ?? err.message ?? 'Could not load predictions.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchPredictions();
    return () => { cancelled = true; };
  }, []);

  const predictedDates = getPredictedDateSet(predictions ?? []);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = MONTHS[month];

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startWeekday = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const todayKey = dateKey(new Date());

  const calendarDays = [];
  for (let i = 0; i < startWeekday; i++) {
    calendarDays.push({ empty: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    calendarDays.push({ date, key: dateKey(date), day: d });
  }

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
        <h1 className="text-title text-[var(--text-primary)]">Cycle calendar</h1>
        <p className="mt-2 text-body text-[var(--text-secondary)]">Predicted period dates</p>
      </header>

      <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-soft)]">
        <div className="mb-5 flex items-center justify-between">
          <button
            type="button"
            onClick={prevMonth}
            className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--text-muted)] transition hover:bg-[var(--accent-soft)] hover:text-rose-500"
            aria-label="Previous month"
          >
            ←
          </button>
          <span className="text-title text-[var(--text-primary)]">
            {monthName} {year}
          </span>
          <button
            type="button"
            onClick={nextMonth}
            className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--text-muted)] transition hover:bg-[var(--accent-soft)] hover:text-rose-500"
            aria-label="Next month"
          >
            →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center">
          {WEEKDAYS.map((wd) => (
            <div key={wd} className="py-1.5 text-label text-[var(--text-muted)]">
              {wd}
            </div>
          ))}
          {calendarDays.map((cell, i) => {
            if (cell.empty) {
              return <div key={`empty-${i}`} className="aspect-square" />;
            }
            const isPredicted = predictedDates.has(cell.key);
            const isToday = cell.key === todayKey;
            return (
              <div
                key={cell.key}
                className={`flex aspect-square items-center justify-center rounded-[var(--radius-sm)] text-body font-medium transition
                  ${isPredicted ? 'bg-rose-500 text-white' : 'text-[var(--text-primary)]'}
                  ${isToday && !isPredicted ? 'ring-2 ring-rose-400' : ''}
                  ${isToday && isPredicted ? 'ring-2 ring-white ring-offset-2 ring-offset-rose-500' : ''}
                `}
              >
                {cell.day}
              </div>
            );
          })}
        </div>
        <p className="mt-5 text-center text-caption text-[var(--text-muted)]">
          <span className="inline-block h-3 w-3 rounded-full bg-rose-500 align-middle" /> Predicted period
        </p>
      </section>
    </div>
  );
}
