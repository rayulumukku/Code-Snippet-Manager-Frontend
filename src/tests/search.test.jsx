import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Search from '../pages/Search';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { searchAPI } from '../services/api';

vi.mock('../services/api', () => ({
  searchAPI: {
    getTrending: vi.fn().mockResolvedValue({ data: [{ term: 'react', count: 10 }] }),
    search: vi.fn().mockResolvedValue({
      data: {
        results: [
          {
            _id: 'snip-101',
            title: 'Debounced Test Snippet',
            description: 'A test snippet description',
            code: 'console.log("hello");',
            language: 'javascript',
            tags: ['test'],
            views: 5,
            likeCount: 2,
            favoriteCount: 1,
            author: { username: 'testdev' },
          },
        ],
        totalPages: 1,
        total: 1,
        executionTimeMs: 12,
      },
    }),
  },
}));

const renderSearch = () =>
  render(
    <MemoryRouter initialEntries={['/search']}>
      <AuthProvider>
        <ToastProvider>
          <Search />
        </ToastProvider>
      </AuthProvider>
    </MemoryRouter>
  );

describe('Search Page Debounce & Race Condition Guard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders search input with initial placeholder', async () => {
    renderSearch();

    const input = screen.getByPlaceholderText(/search code, titles, tags, descriptions/i);
    expect(input).toBeInTheDocument();
  });

  it('debounces rapid typing so multiple keystrokes do not flood backend', async () => {
    renderSearch();

    const input = screen.getByPlaceholderText(/search code, titles, tags, descriptions/i);
    await waitFor(() => expect(searchAPI.search).toHaveBeenCalledTimes(1));

    searchAPI.search.mockClear();

    // Rapidly change input 3 times
    fireEvent.change(input, { target: { value: 're' } });
    fireEvent.change(input, { target: { value: 'rea' } });
    fireEvent.change(input, { target: { value: 'react' } });

    // Immediately after typing, searchAPI.search should not have been called 3 times
    expect(searchAPI.search).not.toHaveBeenCalledTimes(3);

    // After 300ms debounce expires, it should call search with the final term
    await waitFor(() => {
      expect(searchAPI.search).toHaveBeenCalledWith(
        expect.objectContaining({ q: 'react' })
      );
    }, { timeout: 1000 });
  });

  it('discards stale response when a later query finishes first', async () => {
    renderSearch();

    const input = screen.getByPlaceholderText(/search code, titles, tags, descriptions/i);
    await waitFor(() => expect(searchAPI.search).toHaveBeenCalledTimes(1));

    let resolveFirst;
    let resolveSecond;

    searchAPI.search.mockImplementationOnce(() => {
      return new Promise((resolve) => {
        resolveFirst = resolve;
      });
    }).mockImplementationOnce(() => {
      return new Promise((resolve) => {
        resolveSecond = resolve;
      });
    });

    // First search
    fireEvent.change(input, { target: { value: 'query1' } });
    await waitFor(() => expect(searchAPI.search).toHaveBeenCalledTimes(2));

    // Second search
    fireEvent.change(input, { target: { value: 'query2' } });
    await waitFor(() => expect(searchAPI.search).toHaveBeenCalledTimes(3));

    // Resolve second request first (fresher data)
    resolveSecond({
      data: {
        results: [{ _id: 's2', title: 'Fresh Result Query2', language: 'javascript' }],
        totalPages: 1,
        total: 1,
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Fresh Result Query2')).toBeInTheDocument();
    });

    // Now resolve first request later (stale data)
    resolveFirst({
      data: {
        results: [{ _id: 's1', title: 'Stale Result Query1', language: 'javascript' }],
        totalPages: 1,
        total: 1,
      },
    });

    // The UI should STILL display the fresher result, not overwritten by stale query1
    expect(screen.getByText('Fresh Result Query2')).toBeInTheDocument();
    expect(screen.queryByText('Stale Result Query1')).not.toBeInTheDocument();
  });
});
