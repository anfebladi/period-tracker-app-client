import { useNavigate } from 'react-router-dom';
import { CalendarIcon, PlusIcon, HomeIcon, FlowerIcon } from '../components/NavIcons.jsx';

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
    <div className="flex min-h-dvh flex-col px-6 pt-16 pb-12">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="glass mb-10 flex h-28 w-28 items-center justify-center rounded-full">
          <FlowerIcon className="w-14 h-14 text-[var(--accent)]" />
        </div>
        <h1 className="text-display text-[var(--text-primary)]">
          Hey there
        </h1>
        <p className="mt-4 max-w-[300px] text-body text-[var(--text-secondary)]">
          Track your cycle, log how you feel, and see when your next period is likely.
        </p>
        <ul className="mt-10 flex flex-col gap-5 text-left">
          <li className="flex items-center gap-4">
            <span className="glass flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--accent)]">
              <CalendarIcon />
            </span>
            <span className="text-body text-[var(--text-secondary)]">View predictions on the calendar</span>
          </li>
          <li className="flex items-center gap-4">
            <span className="glass flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--accent)]">
              <PlusIcon className="w-5 h-5" />
            </span>
            <span className="text-body text-[var(--text-secondary)]">Log when you get your period or log symptoms</span>
          </li>
          <li className="flex items-center gap-4">
            <span className="glass flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--accent)]">
              <HomeIcon />
            </span>
            <span className="text-body text-[var(--text-secondary)]">See your cycle day and phase on the home screen</span>
          </li>
        </ul>
      </div>
      <button
        type="button"
        onClick={handleGetStarted}
        className="glass-button w-full rounded-[var(--radius-lg)] py-4 text-body font-semibold text-white transition hover:opacity-90 active:scale-[0.99]"
      >
        Get started
      </button>
    </div>
  );
}
