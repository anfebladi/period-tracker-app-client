const SEVERITY_LABELS = {
  '1': 'Mild',
  '2': 'Moderate',
  '3': 'Moderate–strong',
  '4': 'Strong',
  '5': 'Very strong',
};

// Fake data for now – replace with API fetch when ready
const FAKE_LOGS = [
  { id: 1, symptomname: 'Cramps', severity: '3', created_at: '2025-02-10T14:00:00' },
  { id: 2, symptomname: 'Headache', severity: '2', created_at: '2025-02-10T09:30:00' },
  { id: 3, symptomname: 'Fatigue', severity: '4', created_at: '2025-02-09T18:00:00' },
  { id: 4, symptomname: 'Mood', severity: '2', created_at: '2025-02-09T12:00:00' },
  { id: 5, symptomname: 'Bloating', severity: '3', created_at: '2025-02-08T10:00:00' },
  { id: 6, symptomname: 'Cramps', severity: '4', created_at: '2025-02-08T08:00:00' },
  { id: 7, symptomname: 'Back pain', severity: '2', created_at: '2025-02-07T16:00:00' },
  { id: 8, symptomname: 'Cramps', severity: '2', created_at: '2025-02-07T09:00:00' },
  { id: 9, symptomname: 'Headache', severity: '1', created_at: '2025-02-06T14:00:00' },
  { id: 10, symptomname: 'Breast tenderness', severity: '2', created_at: '2025-02-05T11:00:00' },
];

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
  const logs = FAKE_LOGS;

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

  return (
    <div className="mx-auto min-h-full max-w-lg px-5 pt-6 pb-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-stone-800">Your data</h1>
        <p className="mt-1 text-sm text-stone-500">Symptom logs over time</p>
      </header>

      {(logs == null || logs.length === 0) ? (
        <div className="rounded-2xl border border-rose-100 bg-white p-8 text-center">
          <p className="text-5xl">📋</p>
          <p className="mt-3 font-medium text-stone-600">No logs yet</p>
          <p className="mt-1 text-sm text-stone-400">Log symptoms from the + tab to see them here.</p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <section className="mb-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Total logs</p>
              <p className="mt-1 text-2xl font-bold text-stone-800">{logs.length}</p>
            </div>
            {topSymptom && (
              <div className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Most logged</p>
                <p className="mt-1 text-lg font-bold text-stone-800 capitalize">{topSymptom[0]}</p>
                <p className="text-xs text-stone-500">{topSymptom[1]} time{topSymptom[1] !== 1 ? 's' : ''}</p>
              </div>
            )}
          </section>

          {/* Severity breakdown */}
          {Object.keys(severityCounts).length > 0 && (
            <section className="mb-6">
              <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-stone-500">By severity</h2>
              <div className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm">
                <div className="space-y-2">
                  {Object.entries(severityCounts)
                    .sort((a, b) => b[1] - a[1])
                    .map(([sev, count]) => (
                      <div key={sev} className="flex items-center gap-3">
                        <span className="w-24 text-sm text-stone-600">
                          {SEVERITY_LABELS[sev] ?? `Level ${sev}`}
                        </span>
                        <div className="flex-1 h-2 rounded-full bg-rose-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-rose-500"
                            style={{ width: `${(count / logs.length) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-stone-700 w-6">{count}</span>
                      </div>
                    ))}
                </div>
              </div>
            </section>
          )}

          {/* Logs by date */}
          <section>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-stone-500">Logs by date</h2>
            <div className="space-y-4">
              {sortedDates.map((dateKey) => (
                <div key={dateKey} className="rounded-2xl border border-rose-100 bg-white shadow-sm overflow-hidden">
                  <div className="bg-rose-50/50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-stone-500">
                    {dateKey === 'no-date' ? 'No date' : formatDate(dateKey)}
                  </div>
                  <ul className="divide-y divide-rose-50">
                    {(byDate[dateKey] || []).map((entry, i) => (
                      <li key={entry.id ?? `${dateKey}-${i}`} className="flex items-center justify-between px-4 py-3">
                        <span className="font-medium text-stone-800 capitalize">
                          {entry.symptomname ?? entry.symptom_name ?? '—'}
                        </span>
                        <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
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
