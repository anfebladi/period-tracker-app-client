import { Link, Outlet, useLocation } from 'react-router-dom';

export default function Layout() {
  const { pathname } = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/calendar', label: 'Cycle', icon: '📅' },
    { path: '/log', label: 'Log', icon: '+', isCenter: true },
    { path: '/insights', label: 'Data', icon: '📊' },
    { path: '/settings', label: 'Me', icon: '👤' },
  ];

  return (
    <div className="flex min-h-dvh flex-col overflow-hidden bg-[var(--bg-app)] font-sans">
      <main className="flex-1 overflow-y-auto overflow-x-hidden pb-24">
        <Outlet />
      </main>

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] bg-white/95 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-4px_24px_rgba(45,42,38,0.06)] backdrop-blur-xl"
        aria-label="Main navigation"
      >
        <div className="mx-auto flex max-w-lg items-end justify-around px-2">
          {navItems.map(({ path, label, icon, isCenter }) => {
            const isSelected = pathname === path;
            if (isCenter) {
              return (
                <Link
                  key={path}
                  to={path}
                  className="flex h-14 w-14 -translate-y-4 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-rose-400 to-rose-500 text-2xl font-semibold text-white shadow-[var(--shadow-card)] transition hover:from-rose-500 hover:to-rose-600 active:scale-95"
                  aria-label={label}
                >
                  {icon}
                </Link>
              );
            }
            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center gap-1 rounded-xl px-3 py-2.5 transition ${isSelected ? 'text-rose-500' : 'text-[var(--text-muted)]'}`}
              >
                <span className="text-xl leading-none">{icon}</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
