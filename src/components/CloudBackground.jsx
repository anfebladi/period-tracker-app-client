import { useState, useEffect } from 'react';

/**
 * Soft white clouds for a calm background.
 * Slow drift animation; pauses when tab is hidden to save resources.
 */
export default function CloudBackground() {
  const [hidden, setHidden] = useState(
    typeof document !== 'undefined' ? document.hidden : false
  );

  useEffect(() => {
    const handler = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);

  return (
    <div
      className={`cloud-drift pointer-events-none fixed inset-0 z-0 ${hidden ? 'cloud-paused' : ''}`}
      aria-hidden
      style={{
        backgroundImage: `
          radial-gradient(ellipse 42% 28% at 10% 12%, rgba(255,255,255,0.65) 0%, transparent 55%),
          radial-gradient(ellipse 38% 26% at 88% 70%, rgba(255,250,252,0.6) 0%, transparent 55%),
          radial-gradient(ellipse 35% 24% at 48% 45%, rgba(255,255,255,0.55) 0%, transparent 55%)
        `,
        backgroundRepeat: 'no-repeat',
      }}
    />
  );
}
