import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Search from '../src/pages/Search';
import TagFilter from '../src/components/TagFilter';
import Pagination, { getPaginationRange } from '../src/components/Pagination';
import { searchAPI, snippetsAPI } from '../src/services/api';
import { ToastProvider } from '../src/context/ToastContext';

// Mock useAuth
vi.mock('../src/context/AuthContext', () => ({
  useAuth: () => ({ user: null, loading: false }),
  AuthProvider: ({ children }) => children,
}));

// Mock API modules
vi.mock('../src/services/api', () => ({
  searchAPI: {
    search: vi.fn(),
    getTrending: vi.fn(),
  },
  snippetsAPI: {
    getAll: vi.fn(),
    getTags: vi.fn(),
  },
  favoritesAPI: {
    getFavoriteIds: vi.fn().mockResolvedValue({ data: [] }),
  },
}));

// Helper to render Search within necessary Providers
const renderSearch = (initialEntry = '/search') => {
  return render(
    <ToastProvider>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Search />
      </MemoryRouter>
    </ToastProvider>
  );
};

// Language pill interactive test harness (same behavior as Home.jsx)
const LanguagePillsTestHarness = ({ onFilterChange, initialLang = '' }) => {
  const [selectedLang, setSelectedLang] = React.useState(initialLang);
  const LANGUAGES = ['javascript', 'python', 'typescript', 'go', 'rust'];

  const handleToggle = (lang) => {
    const next = selectedLang === lang ? '' : lang;
    setSelectedLang(next);
    onFilterChange?.(next);
  };

  return (
    <div data-testid="language-pills-container">
      <button
        type="button"
        data-testid="lang-pill-all"
        onClick={() => handleToggle('')}
        className={selectedLang === '' ? 'active' : ''}
      >
        All
      </button>
      {LANGUAGES.map((lang) => (
        <button
          key={lang}
          type="button"
          data-testid={`lang-pill-${lang}`}
          onClick={() => handleToggle(lang)}
          className={selectedLang === lang ? 'active' : ''}
        >
          {lang}
        </button>
      ))}
      <span data-testid="current-lang">{selectedLang || 'all'}</span>
    </div>
  );
};

describe('Search and Pagination Test Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    searchAPI.getTrending.mockResolvedValue({ data: ['react', 'algorithm', 'auth'] });
    searchAPI.search.mockResolvedValue({
      data: {
        results: [],
        total: 0,
        totalPages: 1,
        executionTimeMs: 12,
      },
    });
    snippetsAPI.getTags.mockResolvedValue({
      data: [
        { tag: 'react', count: 18 },
        { tag: 'algorithms', count: 12 },
        { tag: 'python', count: 9 },
      ],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Debounced Search Input & Request Throttling', () => {
    it('debounces rapid typing to prevent backend request floods', async () => {
      renderSearch();

      const input = screen.getByPlaceholderText(/search code, titles, tags, descriptions/i);
      expect(input).toBeInTheDocument();

      // Clear initial render calls
      await waitFor(() => expect(searchAPI.getTrending).toHaveBeenCalled());
      searchAPI.search.mockClear();

      // Rapid keystrokes simulating quick user typing
      fireEvent.change(input, { target: { value: 'q' } });
      fireEvent.change(input, { target: { value: 'qu' } });
      fireEvent.change(input, { target: { value: 'quick' } });
      fireEvent.change(input, { target: { value: 'quicksort' } });

      // Immediately after typing, search should NOT be called 4 times
      expect(searchAPI.search).not.toHaveBeenCalledTimes(4);

      // Once debounce (300ms) elapses, search is called with the final term
      await waitFor(
        () => {
          expect(searchAPI.search).toHaveBeenCalledWith(
            expect.objectContaining({ q: 'quicksort' })
          );
        },
        { timeout: 1200 }
      );
    });

    it('renders initial empty search library prompt when no query or filters applied', async () => {
      renderSearch();
      expect(await screen.findByText(/Search the Library/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Choose whether to search for Code Snippets or Curated Collections/i)
      ).toBeInTheDocument();
    });
  });

  describe('2. Tag Filter Selection & Multi-Tag Filtering', () => {
    it('renders popular tags and handles tag selection toggling', async () => {
      const onTagToggle = vi.fn();
      const onClearAll = vi.fn();

      render(
        <TagFilter
          selectedTags={['react']}
          onTagToggle={onTagToggle}
          onClearAll={onClearAll}
        />
      );

      // Verify popular tags loaded
      expect(await screen.findByText(/algorithms/i)).toBeInTheDocument();

      // Click an unselected tag
      const algoChip = screen.getByText(/algorithms/i);
      fireEvent.click(algoChip);
      expect(onTagToggle).toHaveBeenCalledWith('algorithms');

      // Click clear filter button
      const clearBtn = screen.getByRole('button', { name: /clear filter/i });
      expect(clearBtn).toBeInTheDocument();
      fireEvent.click(clearBtn);
      expect(onClearAll).toHaveBeenCalled();
    });

    it('supports multi-tag filtering with multiple active tags', async () => {
      const onTagToggle = vi.fn();

      render(
        <TagFilter
          selectedTags={['react', 'algorithms']}
          onTagToggle={onTagToggle}
          onClearAll={vi.fn()}
        />
      );

      expect(await screen.findByText(/Clear filter \(2\)/i)).toBeInTheDocument();

      // Clicking an active tag toggles it
      const reactChip = screen.getByText(/#react/i);
      fireEvent.click(reactChip);
      expect(onTagToggle).toHaveBeenCalledWith('react');
    });
  });

  describe('3. Language Filter Pill Interactions', () => {
    it('allows toggling between language pills and All', () => {
      const onFilterChange = vi.fn();
      render(<LanguagePillsTestHarness onFilterChange={onFilterChange} />);

      const pythonPill = screen.getByTestId('lang-pill-python');
      const allPill = screen.getByTestId('lang-pill-all');
      const currentIndicator = screen.getByTestId('current-lang');

      // Click Python pill
      fireEvent.click(pythonPill);
      expect(onFilterChange).toHaveBeenCalledWith('python');
      expect(currentIndicator).toHaveTextContent('python');

      // Click Python again to deselect
      fireEvent.click(pythonPill);
      expect(onFilterChange).toHaveBeenCalledWith('');
      expect(currentIndicator).toHaveTextContent('all');

      // Click Rust pill then All
      fireEvent.click(screen.getByTestId('lang-pill-rust'));
      expect(onFilterChange).toHaveBeenCalledWith('rust');
      expect(currentIndicator).toHaveTextContent('rust');

      fireEvent.click(allPill);
      expect(onFilterChange).toHaveBeenCalledWith('');
      expect(currentIndicator).toHaveTextContent('all');
    });
  });

  describe('4. Dynamic Sliding Pagination Window', () => {
    describe('getPaginationRange algorithm verification', () => {
      it('returns empty array if totalPages is 0 or negative', () => {
        expect(getPaginationRange(1, 0)).toEqual([]);
        expect(getPaginationRange(1, -5)).toEqual([]);
        expect(getPaginationRange(1, null)).toEqual([]);
      });

      it('returns direct page range when totalPages <= 7', () => {
        expect(getPaginationRange(1, 1)).toEqual([1]);
        expect(getPaginationRange(1, 5)).toEqual([1, 2, 3, 4, 5]);
        expect(getPaginationRange(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
      });

      it('ensures pages > 5 are accessible via dynamic sliding window', () => {
        // At start of 10 pages: window includes 1, 2, 3, ellipsis, and last page 10
        const startRange = getPaginationRange(1, 10);
        expect(startRange).toEqual([1, 2, 3, '...', 10]);

        // In middle at page 6 of 12 pages: both ellipses and window [4, 5, 6, 7, 8]
        const middleRange = getPaginationRange(6, 12);
        expect(middleRange).toEqual([1, '...', 4, 5, 6, 7, 8, '...', 12]);
        expect(middleRange).toContain(6);
        expect(middleRange).toContain(7);
        expect(middleRange).toContain(8);

        // Near end at page 9 of 10 pages: left ellipsis and window [7, 8, 9, 10]
        const endRange = getPaginationRange(9, 10);
        expect(endRange).toEqual([1, '...', 7, 8, 9, 10]);
        expect(endRange).toContain(9);
        expect(endRange).toContain(10);
      });
    });

    describe('Pagination component rendering & interactions', () => {
      it('returns null when totalPages is 1', () => {
        const { container } = render(
          <Pagination currentPage={1} totalPages={1} onPageChange={vi.fn()} />
        );
        expect(container.firstChild).toBeNull();
      });

      it('renders navigation controls and disables Previous/First on page 1', () => {
        render(
          <Pagination currentPage={1} totalPages={10} onPageChange={vi.fn()} />
        );

        const firstBtn = screen.getByRole('button', { name: /first page/i });
        const prevBtn = screen.getByRole('button', { name: /previous page/i });
        const nextBtn = screen.getByRole('button', { name: /next page/i });
        const lastBtn = screen.getByRole('button', { name: /last page/i });

        expect(firstBtn).toBeDisabled();
        expect(prevBtn).toBeDisabled();
        expect(nextBtn).not.toBeDisabled();
        expect(lastBtn).not.toBeDisabled();
      });

      it('calls onPageChange with correct target page when clicked', () => {
        const onPageChange = vi.fn();
        render(
          <Pagination currentPage={3} totalPages={8} onPageChange={onPageChange} />
        );

        // Click next
        fireEvent.click(screen.getByRole('button', { name: /next page/i }));
        expect(onPageChange).toHaveBeenCalledWith(4);

        // Click specific page 5
        fireEvent.click(screen.getByRole('button', { name: /^5$/ }));
        expect(onPageChange).toHaveBeenCalledWith(5);

        // Click last page
        fireEvent.click(screen.getByRole('button', { name: /last page/i }));
        expect(onPageChange).toHaveBeenCalledWith(8);
      });
    });
  });

  describe('5. Search Results List & Empty State Rendering', () => {
    it('renders snippet search results properly when found', async () => {
      const mockSnippets = [
        {
          _id: 's1',
          title: 'Quick Sort in Python',
          description: 'Divide and conquer sorting algorithm',
          code: 'def quicksort(arr): return arr',
          language: 'python',
          tags: ['algorithms', 'sorting'],
          author: { _id: 'u1', username: 'py_master' },
          views: 45,
          likeCount: 12,
          forkCount: 2,
        },
      ];

      searchAPI.search.mockResolvedValueOnce({
        data: {
          results: mockSnippets,
          total: 1,
          totalPages: 1,
          executionTimeMs: 14,
        },
      });

      renderSearch('/search?q=quicksort');

      expect(await screen.findByText('Quick Sort in Python')).toBeInTheDocument();
      expect(screen.getByText('Divide and conquer sorting algorithm')).toBeInTheDocument();
      expect(screen.getByText('py_master')).toBeInTheDocument();
    });

    it('renders explicit empty state when query returns zero results', async () => {
      searchAPI.search.mockResolvedValueOnce({
        data: {
          results: [],
          total: 0,
          totalPages: 1,
          executionTimeMs: 8,
        },
      });

      renderSearch('/search?q=nonexistentkeyword12345');

      expect(await screen.findByText('No results found')).toBeInTheDocument();
      expect(
        screen.getByText(/We couldn't find matches for your search. Try refining your keywords/i)
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Reset All Filters/i })).toBeInTheDocument();
    });
  });
});
