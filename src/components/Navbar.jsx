import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import SearchModal from './SearchModal';
import { FiSearch } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
    <nav className="sticky top-0 z-50 glass border-b border-slate-200/60 dark:border-custom-dark-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo on the Left */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center shadow-md group-hover:shadow-orange-500/40 transition-shadow">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </div>
            <span className="text-sm sm:text-base font-bold gradient-text tracking-wide">
              Code Snippet Manager
            </span>
          </Link>

          {/* Desktop Nav Links (Center) */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon }) => (
              <Link
                key={to}
                to={to}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-105 dark:hover:bg-custom-dark-surface hover:text-slate-900 dark:hover:text-white transition-all duration-150"
              >
                {icon}
                {label}
              </Link>
            ))}
          </div>

          {/* Right side controls (Desktop actions vs Hamburger Menu) */}
          <div className="flex items-center gap-2">
            {/* Quick Search Button */}
            <button
              type="button"
              onClick={() => setSearchModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-custom-dark-surface hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Quick Search (Cmd+K or Ctrl+K)"
            >
              <FiSearch className="w-3.5 h-3.5 text-custom-orangered" />
              <span>Quick Search</span>
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-custom-dark-card border border-slate-200 dark:border-custom-dark-border rounded shadow-sm">
                ⌘K
              </kbd>
            </button>

            {/* Theme toggle (Desktop only) */}
            <button
              onClick={toggleTheme}
              className="hidden md:inline-flex p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-custom-dark-surface hover:text-slate-900 dark:hover:text-white transition-all duration-150"
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

            {/* Desktop Auth Section */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <>
                  <Link
                    to="/create"
                    className="btn-primary py-1.5 px-3.5 text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <line x1={12} y1={5} x2={12} y2={19} />
                      <line x1={5} y1={12} x2={19} y2={12} />
                    </svg>
                    <span>New Snippet</span>
                  </Link>

                  {/* Desktop Avatar Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                      className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-custom-dark-surface transition-all duration-150 group"
                    >
                      <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        {avatarInitials}
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        {user.username}
                      </span>
                      <svg className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${profileMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>

                    {profileMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 glass-strong rounded-xl shadow-xl border border-slate-200/80 dark:border-custom-dark-border animate-scale-in overflow-hidden">
                        <Link
                          to="/profile"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-custom-dark-surface transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <circle cx={12} cy={8} r={4} />
                            <path strokeLinecap="round" d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                          </svg>
                          My Profile
                        </Link>
                        <div className="border-t border-slate-200/60 dark:border-custom-dark-border" />
                        <button
                          onClick={() => { setProfileMenuOpen(false); handleLogout(); }}
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
                  <Link to="/login" className="btn-secondary py-1.5 px-3.5 text-sm">Sign in</Link>
                  <Link to="/register" className="btn-primary py-1.5 px-3.5 text-sm">Get started</Link>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Menu Button (Right Side) */}
            <button
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-custom-dark-surface transition-colors"
              aria-label="Toggle menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {mobileMenuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-200/60 dark:border-custom-dark-border/60 animate-fade-in bg-white/95 dark:bg-custom-dark-card/95 backdrop-blur-md">
            <div className="flex flex-col gap-1">
              {navLinks.map(({ to, label, icon }) => (
                <Link
                  key={to}
                  onClick={() => setMobileMenuOpen(false)}
                  to={to}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-custom-dark-surface transition-colors"
                >
                  {icon}
                  {label}
                </Link>
              ))}

              <div className="border-t border-slate-100 dark:border-custom-dark-border/40 my-2" />

              {/* Theme Toggle (Mobile Menu) */}
              <button
                onClick={() => { toggleTheme(); }}
                className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-custom-dark-surface transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  {darkMode ? (
                    <>
                      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
                      <span>Light Mode</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                      </svg>
                      <span>Dark Mode</span>
                    </>
                  )}
                </div>
                <div className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-250 cursor-pointer ${darkMode ? 'gradient-bg' : 'bg-slate-200 dark:bg-slate-700'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-250 ${darkMode ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </button>

              <div className="border-t border-slate-100 dark:border-custom-dark-border/40 my-2" />

              {user ? (
                <>
                  {/* Logged in User Badge inside Mobile Menu */}
                  <div className="flex items-center gap-3 px-3 py-2 mb-1">
                    <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      {avatarInitials}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{user.username}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{user.email}</div>
                    </div>
                  </div>

                  <Link
                    onClick={() => setMobileMenuOpen(false)}
                    to="/profile"
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-custom-dark-surface transition-colors"
                  >
                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <circle cx={12} cy={8} r={4} />
                      <path strokeLinecap="round" d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                    </svg>
                    My Profile
                  </Link>

                  <Link
                    onClick={() => setMobileMenuOpen(false)}
                    to="/create"
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-custom-dark-surface transition-colors"
                  >
                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <line x1={12} y1={5} x2={12} y2={19} />
                      <line x1={5} y1={12} x2={19} y2={12} />
                    </svg>
                    New Snippet
                  </Link>

                  <button
                    onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                  >
                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1={21} y1={12} x2={9} y2={12} />
                    </svg>
                    Sign out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 pt-2 px-3">
                  <Link
                    onClick={() => setMobileMenuOpen(false)}
                    to="/login"
                    className="btn-secondary w-full text-sm py-2.5 text-center rounded-xl"
                  >
                    Sign in
                  </Link>
                  <Link
                    onClick={() => setMobileMenuOpen(false)}
                    to="/register"
                    className="btn-primary w-full text-sm py-2.5 text-center rounded-xl"
                  >
                    Get started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </nav>
  );
};

export default Navbar;
