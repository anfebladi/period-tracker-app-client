import { useNavigate } from 'react-router-dom';

const ONBOARDING_KEY = 'period_app_onboarding_done';

export function setOnboardingComplete() {
  try {
    localStorage.setItem(ONBOARDING_KEY, 'true');
  } catch (_) {}
}

export function isNewUser() {
  try {
    return localStorage.getItem(ONBOARDING_KEY) !== 'true';
  } catch {
    return true;
  }
}

export default function Onboarding({ onComplete }) {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    setOnboardingComplete();
    if (onComplete) onComplete();
    else navigate('/setup', { replace: true });
  };

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--bg-app)] px-6 pt-16 pb-12">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="mb-10 flex h-28 w-28 items-center justify-center rounded-full bg-white text-5xl shadow-[var(--shadow-soft)] ring-1 ring-[var(--border)]">
          🌸
        </div>
        <h1 className="text-display text-[var(--text-primary)]">
          Hey there
        </h1>
        <p className="mt-4 max-w-[300px] text-body text-[var(--text-secondary)]">
          Track your cycle, log how you feel, and see when your next period is likely.
        </p>
        <ul className="mt-10 flex flex-col gap-5 text-left">
          <li className="flex items-center gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-rose-500">📅</span>
            <span className="text-body text-[var(--text-secondary)]">View predictions on the calendar</span>
          </li>
          <li className="flex items-center gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-rose-500">➕</span>
            <span className="text-body text-[var(--text-secondary)]">Log when you get your period or log symptoms</span>
          </li>
          <li className="flex items-center gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-rose-500">🏠</span>
            <span className="text-body text-[var(--text-secondary)]">See your cycle day and phase on the home screen</span>
          </li>
        </ul>
      </div>
      <button
        type="button"
        onClick={handleGetStarted}
        className="w-full rounded-[var(--radius-lg)] bg-gradient-to-br from-rose-500 to-rose-600 py-4 text-body font-semibold text-white shadow-[var(--shadow-card)] transition hover:from-rose-600 hover:to-rose-700 active:scale-[0.99]"
      >
        Get started
      </button>
    </div>
  );
}
