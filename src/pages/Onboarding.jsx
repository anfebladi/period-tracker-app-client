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
  } catch (_) {
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
    <div className="flex min-h-dvh flex-col bg-[#fef7f5] px-6 pt-12 pb-10">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-white text-5xl shadow-sm ring-2 ring-rose-100">
          🌸
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-stone-800">
          Hey there
        </h1>
        <p className="mt-3 max-w-[280px] text-base leading-relaxed text-stone-600">
          Track your cycle, log how you feel, and see when your next period is likely.
        </p>
        <ul className="mt-8 flex flex-col gap-4 text-left text-sm text-stone-600">
          <li className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">📅</span>
            View predictions on the calendar
          </li>
          <li className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">➕</span>
            Log when you get your period or log symptoms
          </li>
          <li className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">🏠</span>
            See your cycle day and phase on the home screen
          </li>
        </ul>
      </div>
      <button
        type="button"
        onClick={handleGetStarted}
        className="w-full rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 py-4 text-lg font-bold text-white shadow-lg shadow-rose-300/30 transition active:scale-[0.99]"
      >
        Get started
      </button>
    </div>
  );
}
