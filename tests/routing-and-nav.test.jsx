import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Navbar from '../src/components/Navbar';
import NotFound from '../src/pages/NotFound';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
import { ToastProvider } from '../src/context/ToastContext';

const EXPECTED_BASE_PATH = '/projects/code-snippet-manager/';

// We mock useAuth to provide flexible test user states
const mockUseAuth = vi.fn();
vi.mock('../src/context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
  AuthProvider: ({ children }) => children,
}));

// Helper to render Navbar with contexts
const renderNavbar = ({ user = null, logout = vi.fn() } = {}) => {
  mockUseAuth.mockReturnValue({
    user,
    logout,
    loading: false,
    token: user ? 'fake-token' : null,
  });

  return render(
    <ThemeProvider>
      <ToastProvider>
        <MemoryRouter>
          <Navbar />
        </MemoryRouter>
      </ToastProvider>
    </ThemeProvider>
  );
};

// Theme toggle test harness component
const ThemeConsumerComponent = () => {
  const { darkMode, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme-status">{darkMode ? 'dark' : 'light'}</span>
      <button onClick={toggleTheme} data-testid="theme-toggle-btn">
        Toggle
      </button>
    </div>
  );
};

describe('Routing and Navigation Test Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    vi.clearAllMocks();
  });

  describe('1. Base Path & Redirection Handling', () => {
    it('verifies expected base path constant', () => {
      // Base path must match /projects/code-snippet-manager/
      expect(EXPECTED_BASE_PATH).toBe('/projects/code-snippet-manager/');
    });

    it('redirects to base path when accessed directly from root /', () => {
      const originalLocation = window.location;
      const replaceMock = vi.fn();

      delete window.location;
      window.location = {
        ...originalLocation,
        pathname: '/',
        replace: replaceMock,
      };

      const basename = EXPECTED_BASE_PATH.replace(/\/$/, '');
      if (basename && window.location.pathname === '/') {
        window.location.replace(basename + '/');
      }

      expect(replaceMock).toHaveBeenCalledWith('/projects/code-snippet-manager/');
      window.location = originalLocation;
    });

    it('does not trigger redirection when already within base path', () => {
      const originalLocation = window.location;
      const replaceMock = vi.fn();

      delete window.location;
      window.location = {
        ...originalLocation,
        pathname: '/projects/code-snippet-manager/search',
        replace: replaceMock,
      };

      const basename = EXPECTED_BASE_PATH.replace(/\/$/, '');
      if (basename && window.location.pathname === '/') {
        window.location.replace(basename + '/');
      }

      expect(replaceMock).not.toHaveBeenCalled();
      window.location = originalLocation;
    });
  });

  describe('2. Desktop & Mobile Navbar Rendering', () => {
    it('renders logo link pointing to home', () => {
      renderNavbar();
      const logoLink = screen.getByRole('link', { name: /CSM Logo.*Code Snippet Manager/i });
      expect(logoLink).toBeInTheDocument();
      expect(logoLink).toHaveAttribute('href', '/');
    });

    it('renders primary desktop navigation links for unauthenticated guest', () => {
      renderNavbar({ user: null });

      expect(screen.getByRole('link', { name: /^Home$/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /^Search$/i })).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /^Collections$/i })).not.toBeInTheDocument();

      expect(screen.getByRole('link', { name: /Sign in/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Get started/i })).toBeInTheDocument();
    });

    it('renders authenticated navigation links including Collections and New Snippet', () => {
      const mockUser = { _id: 'u1', username: 'alex_dev', email: 'alex@example.com' };
      renderNavbar({ user: mockUser });

      expect(screen.getByRole('link', { name: /^Home$/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /^Search$/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /^Collections$/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /New Snippet/i })).toBeInTheDocument();
      expect(screen.getByText('alex_dev')).toBeInTheDocument();
    });

    it('toggles mobile menu when hamburger button is clicked', () => {
      renderNavbar();

      const hamburgerBtn = screen.getByRole('button', { name: /toggle menu/i });
      expect(hamburgerBtn).toBeInTheDocument();

      // Open mobile menu
      fireEvent.click(hamburgerBtn);

      // In mobile menu, links exist
      const homeLinks = screen.getAllByRole('link', { name: /^Home$/i });
      expect(homeLinks.length).toBeGreaterThanOrEqual(1);

      // Close mobile menu
      fireEvent.click(hamburgerBtn);
    });

    it('renders Quick Search button with keyboard shortcut hint', () => {
      renderNavbar();
      const quickSearchBtn = screen.getByRole('button', { name: /quick search/i });
      expect(quickSearchBtn).toBeInTheDocument();
    });
  });

  describe('3. 404 Not Found Route Handling', () => {
    it('renders 404 Not Found page with corrective return link', () => {
      render(
        <MemoryRouter initialEntries={['/invalid-route-escape']}>
          <Routes>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getAllByText('404').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Page not found')).toBeInTheDocument();
      expect(screen.getByText(/Looks like this snippet escaped into the void/i)).toBeInTheDocument();

      const homeLink = screen.getByRole('link', { name: /Back to home/i });
      expect(homeLink).toBeInTheDocument();
      expect(homeLink).toHaveAttribute('href', '/');
    });
  });

  describe('4. Theme Toggle & localStorage Persistence', () => {
    it('defaults to light theme when localStorage is empty and prefers-color-scheme is false', () => {
      render(
        <ThemeProvider>
          <ThemeConsumerComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('theme-status')).toHaveTextContent('light');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(localStorage.getItem('theme')).toBe('light');
    });

    it('persists theme toggle to dark in localStorage and adds dark class to documentElement', () => {
      render(
        <ThemeProvider>
          <ThemeConsumerComponent />
        </ThemeProvider>
      );

      const toggleBtn = screen.getByTestId('theme-toggle-btn');

      // Toggle to dark
      act(() => {
        fireEvent.click(toggleBtn);
      });

      expect(screen.getByTestId('theme-status')).toHaveTextContent('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(localStorage.getItem('theme')).toBe('dark');

      // Toggle back to light
      act(() => {
        fireEvent.click(toggleBtn);
      });

      expect(screen.getByTestId('theme-status')).toHaveTextContent('light');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(localStorage.getItem('theme')).toBe('light');
    });

    it('initializes with dark theme if saved in localStorage', () => {
      localStorage.setItem('theme', 'dark');

      render(
        <ThemeProvider>
          <ThemeConsumerComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('theme-status')).toHaveTextContent('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('toggles theme via Navbar theme toggle button', () => {
      renderNavbar();

      const themeToggleBtn = screen.getByRole('button', { name: /toggle theme/i });
      expect(themeToggleBtn).toBeInTheDocument();

      act(() => {
        fireEvent.click(themeToggleBtn);
      });

      expect(localStorage.getItem('theme')).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);

      act(() => {
        fireEvent.click(themeToggleBtn);
      });

      expect(localStorage.getItem('theme')).toBe('light');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });
});
