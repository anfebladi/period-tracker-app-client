import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Calendar from './pages/Calendar';
import Log from './pages/Log';
import Setup from './pages/Setup';
import Insights from './pages/Insights';
import Onboarding from './pages/Onboarding';
import { isNewUser } from './context/AuthContext.jsx';

const Placeholder = ({ title }) => (
  <div className="flex min-h-[50vh] items-center justify-center px-6">
    <p className="text-center text-body text-[var(--text-muted)]">
      <span className="block text-4xl mb-4">🌸</span>
      {title} coming soon...
    </p>
  </div>
);

function AppContent() {
  const [showOnboarding, setShowOnboarding] = useState(isNewUser);
  const [onboardingStep, setOnboardingStep] = useState('welcome');
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = () => {
      setShowOnboarding(true);
      setOnboardingStep('welcome');
      navigate('/', { replace: true });
    };
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [navigate]);

  if (showOnboarding) {
    return onboardingStep === 'welcome' ? (
      <Onboarding onComplete={() => setOnboardingStep('setup')} />
    ) : (
      <Setup
        onComplete={() => {
          setShowOnboarding(false);
        }}
      />
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="log" element={<Log />} />
        <Route path="setup" element={<Setup title="Update cycle info" />} />
        <Route path="onboarding" element={<Onboarding />} />
        <Route path="insights" element={<Insights />} />
        <Route path="settings" element={<Placeholder title="Settings" />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
