import { useState } from 'react';

function dateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Placeholder predictions – same shape as API for calendar highlighting
const PLACEHOLDER_PREDICTIONS = [
  { period_number: 1, estimated_start: '2025-02-04', estimated_end: '' },
  { period_number: 2, estimated_start: '2025-03-06', estimated_end: '' },
  { period_number: 3, estimated_start: '2025-04-05', estimated_end: '' },
  { period_number: 4, estimated_start: '2025-05-05', estimated_end: '' },
  { period_number: 5, estimated_start: '2025-06-04', estimated_end: '' },
  { period_number: 6, estimated_start: '2025-07-04', estimated_end: '' },
];

function getPredictedDateSet(predictions) {
  const set = new Set();
  if (!Array.isArray(predictions)) return set;
  for (const p of predictions) {
    const startStr = p?.estimated_start ?? p?.estimnated_start;
    if (!startStr) continue;
    const [y, m, d] = startStr.split('-').map(Number);
    if (isNaN(y) || isNaN(m) || isNaN(d)) continue;
    const start = new Date(y, m - 1, d);
    set.add(dateKey(start));
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
  const predictedDates = getPredictedDateSet(PLACEHOLDER_PREDICTIONS);

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

  return (
    <div className="mx-auto min-h-full max-w-lg px-5 pt-6 pb-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-stone-800">Cycle calendar</h1>
        <p className="mt-1 text-sm text-stone-500">Predicted period dates</p>
      </header>

      <section className="rounded-3xl border border-rose-100/80 bg-white p-4 shadow-sm ring-1 ring-rose-50/50">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={prevMonth}
            className="flex h-10 w-10 items-center justify-center rounded-full text-stone-500 transition hover:bg-rose-50 hover:text-rose-600"
            aria-label="Previous month"
          >
            ←
          </button>
          <span className="text-lg font-bold text-stone-800">
            {monthName} {year}
          </span>
          <button
            type="button"
            onClick={nextMonth}
            className="flex h-10 w-10 items-center justify-center rounded-full text-stone-500 transition hover:bg-rose-50 hover:text-rose-600"
            aria-label="Next month"
          >
            →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {WEEKDAYS.map((wd) => (
            <div key={wd} className="py-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
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
                className={`flex aspect-square items-center justify-center rounded-xl text-sm font-medium transition
                  ${isPredicted ? 'bg-rose-500 text-white' : 'text-stone-700'}
                  ${isToday && !isPredicted ? 'ring-2 ring-rose-400' : ''}
                  ${isToday && isPredicted ? 'ring-2 ring-white ring-offset-2 ring-offset-rose-500' : ''}
                `}
              >
                {cell.day}
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-center text-xs text-stone-400">
          <span className="inline-block h-3 w-3 rounded-full bg-rose-500 align-middle" /> Predicted period
        </p>
      </section>
    </div>
  );
}
