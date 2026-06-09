import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const avatarInitials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : '??';

  const navLinks = [
    {
      to: '/',
      label: 'Home',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M9 21V12h6v9" />
        </svg>
      ),
    },
    {
      to: '/search',
      label: 'Search',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx={11} cy={11} r={7} />
          <line x1={21} y1={21} x2={16.65} y2={16.65} />
        </svg>
      ),
    },
    ...(user
      ? [{
          to: '/collections',
          label: 'Collections',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 12 12 17 22 12" />
              <polyline points="2 17 12 22 22 17" />
            </svg>
          ),
        }]
      : []),
  ];

  return (
    <nav className="sticky top-0 z-50 glass border-b border-slate-900/10 dark:border-custom-dark-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center shadow-md group-hover:shadow-orange-500/40 transition-shadow">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </div>
            <span className="text-lg font-bold gradient-text hidden sm:inline">CodeSnippet</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon }) => (
              <Link
                key={to}
                to={to}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-custom-dark-surface hover:text-slate-900 dark:hover:text-white transition-all duration-150"
              >
                {icon}
                {label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-custom-dark-surface hover:text-slate-900 dark:hover:text-white transition-all duration-150"
              aria-label="Toggle theme"
            >
              {darkMode ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx={12} cy={12} r={4} />
                  <line x1={12} y1={1} x2={12} y2={3} />
                  <line x1={12} y1={21} x2={12} y2={23} />
                  <line x1={4.22} y1={4.22} x2={5.64} y2={5.64} />
                  <line x1={18.36} y1={18.36} x2={19.78} y2={19.78} />
                  <line x1={1} y1={12} x2={3} y2={12} />
                  <line x1={21} y1={12} x2={23} y2={12} />
                  <line x1={4.22} y1={19.78} x2={5.64} y2={18.36} />
                  <line x1={18.36} y1={5.64} x2={19.78} y2={4.22} />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>

            {user ? (
              <>
                <Link
                  to="/create"
                  className="hidden sm:inline-flex btn-primary py-1.5 px-3 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <line x1={12} y1={5} x2={12} y2={19} />
                    <line x1={5} y1={12} x2={19} y2={12} />
                  </svg>
                  <span>New Snippet</span>
                </Link>

                {/* Avatar dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setOpen(!open)}
                    className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-custom-dark-surface transition-all duration-150 group"
                  >
                    <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      {avatarInitials}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-slate-700 dark:text-slate-200">
                      {user.username}
                    </span>
                    <svg className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {open && (
                    <div className="absolute right-0 mt-2 w-48 glass-strong rounded-xl shadow-xl border border-slate-200 dark:border-custom-dark-border animate-scale-in overflow-hidden">
                      <Link
                        to="/profile"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-custom-dark-surface transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <circle cx={12} cy={8} r={4} />
                          <path strokeLinecap="round" d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                        </svg>
                        My Profile
                      </Link>
                      <Link
                        to="/create"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-custom-dark-surface transition-colors sm:hidden"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <line x1={12} y1={5} x2={12} y2={19} />
                          <line x1={5} y1={12} x2={19} y2={12} />
                        </svg>
                        New Snippet
                      </Link>
                      <div className="border-t border-slate-200 dark:border-custom-dark-border" />
                      <button
                        onClick={() => { setOpen(false); handleLogout(); }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                          <polyline points="16 17 21 12 16 7" />
                          <line x1={21} y1={12} x2={9} y2={12} />
                        </svg>
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary py-1.5 px-3 text-sm">Sign in</Link>
                <Link to="/register" className="btn-primary py-1.5 px-3 text-sm hidden sm:inline-flex">Get started</Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-custom-dark-surface ml-1 transition-colors"
              aria-label="Toggle menu"
              onClick={() => setOpen(!open)}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {open
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden py-3 border-t border-slate-900/10 dark:border-custom-dark-border animate-fade-in">
            <div className="flex flex-col gap-1">
              {navLinks.map(({ to, label, icon }) => (
                <Link
                  key={to}
                  onClick={() => setOpen(false)}
                  to={to}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-custom-dark-surface transition-colors"
                >
                  {icon}
                  {label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link onClick={() => setOpen(false)} to="/profile" className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-custom-dark-surface transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx={12} cy={8} r={4} /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
                    My Profile
                  </Link>
                  <Link onClick={() => setOpen(false)} to="/create" className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-custom-dark-surface transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><line x1={12} y1={5} x2={12} y2={19} /><line x1={5} y1={12} x2={19} y2={12} /></svg>
                    New Snippet
                  </Link>
                  <button onClick={() => { setOpen(false); handleLogout(); }} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1={21} y1={12} x2={9} y2={12} /></svg>
                    Sign out
                  </button>
                </>
              ) : (
                <div className="flex gap-2 px-3 pt-2">
                  <Link onClick={() => setOpen(false)} to="/login" className="btn-secondary flex-1 text-sm py-2 text-center">Sign in</Link>
                  <Link onClick={() => setOpen(false)} to="/register" className="btn-primary flex-1 text-sm py-2 text-center">Get started</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
