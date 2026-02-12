import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Calendar from './pages/Calendar';
import Log from './pages/Log';
import Setup from './pages/Setup';
import Insights from './pages/Insights';
import Onboarding from './pages/Onboarding';
import { isNewUser } from './pages/Onboarding';

const Placeholder = ({ title }) => (
  <div className="flex min-h-[50vh] items-center justify-center px-6">
    <p className="text-center text-base font-medium text-stone-400">
      <span className="block text-3xl mb-3">🌸</span>
      {title} coming soon...
    </p>
  </div>
);

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(isNewUser);
  const [onboardingStep, setOnboardingStep] = useState('welcome');

  if (showOnboarding) {
    return (
      <BrowserRouter>
        {onboardingStep === 'welcome' ? (
          <Onboarding onComplete={() => setOnboardingStep('setup')} />
        ) : (
          <Setup onComplete={() => setShowOnboarding(false)} />
        )}
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}