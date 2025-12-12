import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';


const Icon = ({ children, className = '' }) => (
  <svg
    className={`w-4 h-4 ${className}`}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-slate-900/10 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle menu"
              onClick={() => setOpen(!open)}
            >
              <span className="sr-only">Open menu</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <Link to="/" className="text-xl font-semibold tracking-tight text-custom-orangered">
              CodeSnippet Manager
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-1">
            <Link to="/" className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
              <Icon><path d="M3 12l9-9 9 9"/><path d="M9 21V12h6v9"/></Icon> Home
            </Link>
            <Link to="/search" className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
              <Icon><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></Icon> Search
            </Link>
            {user && (
              <Link to="/collections" className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                <Icon>
                  <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                  <polyline points="2 12 12 17 22 12"/>
                  <polyline points="2 17 12 22 22 17"/>
                </Icon>
                Collections
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 rounded-md border border-slate-900/10 dark:border-white/10 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {darkMode ? (
                <Icon>
                  <circle cx="12" cy="12" r="4"/>
                  <line x1="12" y1="1" x2="12" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/>
                  <line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </Icon>
              ) : (
                <Icon>
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </Icon>
              )}
              <span className="hidden sm:inline">{darkMode ? 'Light' : 'Dark'}</span>
            </button>

            {user ? (
              <>
                <Link
                  to="/create"
                  className="inline-flex items-center gap-2 rounded-md bg-custom-orangered text-white px-3 py-2 text-sm font-medium hover:brightness-110 shadow-sm"
                >
                  <Icon><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></Icon>
                  <span className="hidden sm:inline">Create</span>
                </Link>
                <span className="hidden sm:inline text-sm text-slate-600 dark:text-slate-300 mr-1">Hi, {user.username}</span>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Icon>
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </Icon>
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <Icon>
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                    <polyline points="10 17 15 12 10 7"/>
                    <line x1="15" y1="12" x2="3" y2="12"/>
                  </Icon>
                  Login
                </Link>
                <Link to="/register" className="inline-flex items-center gap-2 rounded-md bg-custom-orangered text-white px-3 py-2 text-sm font-medium hover:brightness-110 shadow-sm">
                  <Icon>
                    <circle cx="10" cy="7" r="4"/>
                    <path d="M20 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M4 21v-2a4 4 0 0 1 3-3.87"/>
                    <line x1="19" y1="8" x2="19" y2="14"/>
                    <line x1="16" y1="11" x2="22" y2="11"/>
                  </Icon>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden py-2 border-t border-slate-900/10 dark:border-white/10">
            <div className="flex flex-col gap-1">
              <Link onClick={() => setOpen(false)} to="/" className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                <Icon><path d="M3 12l9-9 9 9"/><path d="M9 21V12h6v9"/></Icon> Home
              </Link>
              <Link onClick={() => setOpen(false)} to="/search" className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                <Icon><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></Icon> Search
              </Link>
              {user && (
                <Link onClick={() => setOpen(false)} to="/collections" className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <Icon>
                    <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                    <polyline points="2 12 12 17 22 12"/>
                    <polyline points="2 17 12 22 22 17"/>
                  </Icon>
                  Collections
                </Link>
              )}
              {user ? (
                <>
                  <Link onClick={() => setOpen(false)} to="/create" className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                    <Icon><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></Icon> Create
                  </Link>
                  <button onClick={() => { setOpen(false); handleLogout(); }} className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                    <Icon>
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </Icon>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link onClick={() => setOpen(false)} to="/login" className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                    <Icon>
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                      <polyline points="10 17 15 12 10 7"/>
                      <line x1="15" y1="12" x2="3" y2="12"/>
                    </Icon>
                    Login
                  </Link>
                  <Link onClick={() => setOpen(false)} to="/register" className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-white bg-custom-orangered">
                    <Icon>
                      <circle cx="10" cy="7" r="4"/>
                      <path d="M20 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M4 21v-2a4 4 0 0 1 3-3.87"/>
                      <line x1="19" y1="8" x2="19" y2="14"/>
                      <line x1="16" y1="11" x2="22" y2="11"/>
                    </Icon>
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
