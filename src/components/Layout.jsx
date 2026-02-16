import { Link, Outlet, useLocation } from 'react-router-dom';
import { HomeIcon, CalendarIcon, PlusIcon, ChartIcon, UserIcon } from './NavIcons.jsx';
import CloudBackground from './CloudBackground.jsx';

export default function Layout() {
  const { pathname } = useLocation();

  const navItems = [
    { path: '/', label: 'Home', Icon: HomeIcon },
    { path: '/calendar', label: 'Cycle', Icon: CalendarIcon },
    { path: '/log', label: 'Log', Icon: PlusIcon, isCenter: true },
    { path: '/insights', label: 'Data', Icon: ChartIcon },
    { path: '/settings', label: 'Me', Icon: UserIcon },
  ];

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden font-sans">
      <main className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden pb-24">
        <div key={pathname} className="animate-page-in min-h-full">
          <Outlet />
        </div>
      </main>

      <nav
        className="nav-glass fixed bottom-0 left-0 right-0 z-50 rounded-t-[var(--radius-xl)] pb-[env(safe-area-inset-bottom)] pt-3"
        aria-label="Main navigation"
      >
        <div className="mx-auto flex max-w-lg items-end justify-around px-2">
          {navItems.map(({ path, label, Icon, isCenter }) => {
            const isSelected = pathname === path;
            if (isCenter) {
              return (
                <Link
                  key={path}
                  to={path}
                  className="glass-button flex h-14 w-14 -translate-y-4 flex-shrink-0 items-center justify-center rounded-full text-white shadow-lg transition-all duration-150 hover:opacity-90 active:scale-[0.92]"
                  aria-label={label}
                >
                  <Icon className="w-6 h-6" />
                </Link>
              );
            }
            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center gap-1 rounded-xl px-3 py-2.5 transition ${isSelected ? 'text-[var(--accent-deep)] font-semibold' : 'text-[var(--text-secondary)] hover:text-[var(--accent)]'}`}
              >
                <Icon />
                <span className="text-[10px] font-semibold uppercase tracking-wider">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
