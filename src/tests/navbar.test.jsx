import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { ToastProvider } from '../context/ToastContext';

describe('Navbar Component & Responsive Quick Search', () => {
  it('renders quick search button accessible on mobile viewports (<640px)', () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <Navbar />
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </MemoryRouter>
    );

    const searchButtons = screen.getAllByRole('button', { name: /quick search/i });
    expect(searchButtons.length).toBeGreaterThan(0);

    const searchButton = searchButtons[0];
    expect(searchButton).toBeInTheDocument();
    // It should have inline-flex, not hidden on all screen sizes
    expect(searchButton.className).toContain('inline-flex');
    expect(searchButton.className).not.toMatch(/^hidden$/);
  });

  it('contains valid Tailwind classes on navigation links (no hover:bg-slate-105 typo)', () => {
    const { container } = render(
      <MemoryRouter>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <Navbar />
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </MemoryRouter>
    );

    const html = container.innerHTML;
    expect(html).not.toContain('hover:bg-slate-105');
    expect(html).toContain('hover:bg-slate-100');
  });
});
