import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { snippetsAPI, favoritesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SnippetCard from '../components/SnippetCard';
import TagFilter from '../components/TagFilter';
import PinnedSection from '../components/PinnedSection';
import { useToast } from '../context/ToastContext';
import { FiSearch, FiBookmark } from 'react-icons/fi';

const LANGUAGES = [
  'javascript', 'python', 'java', 'typescript', 'cpp', 'c',
  'csharp', 'go', 'rust', 'php', 'html', 'css', 'sql',
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'views', label: 'Most Viewed' },
  { value: 'likes', label: 'Most Liked' },
  { value: 'forks', label: 'Most Forked' },
];

const Home = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'mine' | 'favorites'
  const [filters, setFilters] = useState({ language: '', tags: '', page: 1, limit: 12, sort: 'newest' });
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    document.title = 'Code Snippet Manager — Find, save and share code';
  }, []);

  const fetchSnippets = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      const response = activeTab === 'mine' && user
        ? await snippetsAPI.getMy(params)
        : activeTab === 'favorites' && user
        ? await favoritesAPI.getFavorites(params)
        : await snippetsAPI.getAll(params);

      setSnippets(response.data.snippets);
      setPagination({
        totalPages: response.data.totalPages,
        currentPage: response.data.currentPage,
        total: response.data.total,
      });
    } catch (error) {
      toast.error('Failed to load snippets');
      console.error('Error fetching snippets:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, activeTab, user, toast]);

  useEffect(() => {
    fetchSnippets();
  }, [fetchSnippets]);

  const handleSnippetDeleted = (deletedId) => {
    setSnippets(prev => prev.filter(s => s._id !== deletedId));
    toast.success('Snippet deleted');
  };

  const handleSnippetUpdated = (updatedSnippet) => {
    setSnippets(prev => prev.map(s => s._id === updatedSnippet._id ? updatedSnippet : s));
  };

  const handleLikeToggled = (snippetId, liked, likeCount) => {
    setSnippets(prev => prev.map(s =>
      s._id === snippetId ? { ...s, isLiked: liked, likeCount } : s
    ));
  };

  const handleLanguageFilter = (lang) => {
    setFilters(f => ({ ...f, language: f.language === lang ? '' : lang, page: 1 }));
  };

  const handleTagToggle = (tag) => {
    setFilters(f => {
      const currentTags = f.tags ? f.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
      const updated = currentTags.includes(tag)
        ? currentTags.filter(t => t !== tag)
        : [...currentTags, tag];
      return { ...f, tags: updated.join(','), page: 1 };
    });
  };

  const handleClearTags = () => {
    setFilters(f => ({ ...f, tags: '', page: 1 }));
  };

  const handlePageChange = (page) => {
    setFilters(f => ({ ...f, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-custom-dark-surface dark:via-custom-dark-bg dark:to-custom-dark-surface border-b border-slate-200 dark:border-custom-dark-border">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-gradient-to-br from-orange-400/15 to-red-400/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-tr from-orange-300/10 to-red-300/15 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="max-w-2xl animate-fade-in-up">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-4 leading-tight">
              Find, save and share<br />
              <span className="gradient-text">your best code</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-lg mb-8 leading-relaxed">
              A curated collection of reusable code snippets. Organize into collections, fork others' work, and share with the community.
            </p>
            <div className="flex flex-wrap gap-3">
              {user ? (
                <Link to="/create" className="btn-primary">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <line x1={12} y1={5} x2={12} y2={19} /><line x1={5} y1={12} x2={19} y2={12} />
                  </svg>
                  Create snippet
                </Link>
              ) : (
                <Link to="/register" className="btn-primary">Get started free</Link>
              )}
              <Link to="/search" className="btn-secondary">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx={11} cy={11} r={7} /><line x1={21} y1={21} x2={16.65} y2={16.65} />
                </svg>
                Browse all
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Pinned Snippets Banner */}
        <PinnedSection onTagClick={handleTagToggle} />

        {/* Tabs + Sort controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-custom-dark-surface rounded-xl w-fit">
            <button
              onClick={() => { setActiveTab('all'); setFilters(f => ({ ...f, page: 1 })); }}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-custom-dark-card text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              All Snippets
            </button>
            {user && (
              <>
                <button
                  onClick={() => { setActiveTab('mine'); setFilters(f => ({ ...f, page: 1 })); }}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    activeTab === 'mine'
                      ? 'bg-white dark:bg-custom-dark-card text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  My Snippets
                </button>
                <button
                  onClick={() => { setActiveTab('favorites'); setFilters(f => ({ ...f, page: 1 })); }}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                    activeTab === 'favorites'
                      ? 'bg-white dark:bg-custom-dark-card text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  <FiBookmark className="w-3.5 h-3.5 text-amber-500" />
                  Favorites
                </button>
              </>
            )}
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="sort-select" className="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">Sort by</label>
            <select
              id="sort-select"
              value={filters.sort}
              onChange={(e) => setFilters(f => ({ ...f, sort: e.target.value, page: 1 }))}
              className="text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-custom-dark-border bg-white dark:bg-custom-dark-surface text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-custom-orangered/40"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tag filters */}
        <TagFilter
          selectedTags={filters.tags ? filters.tags.split(',').map(t => t.trim()).filter(Boolean) : []}
          onTagToggle={handleTagToggle}
          onClearAll={handleClearTags}
          className="mb-6 p-4 bg-white dark:bg-custom-dark-card border border-slate-200 dark:border-custom-dark-border rounded-2xl shadow-sm"
        />

        {/* Language filters */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleLanguageFilter('')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 ${
                filters.language === ''
                  ? 'bg-custom-orangered text-white border-transparent shadow-sm shadow-orange-500/30'
                  : 'border-slate-200 dark:border-custom-dark-border text-slate-600 dark:text-slate-300 hover:border-custom-orangered/50'
              }`}
            >
              All
            </button>
            {LANGUAGES.map(lang => (
              <button
                key={lang}
                onClick={() => handleLanguageFilter(lang)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize border transition-all duration-150 ${
                  filters.language === lang
                    ? 'bg-custom-orangered text-white border-transparent shadow-sm shadow-orange-500/30'
                    : 'border-slate-200 dark:border-custom-dark-border text-slate-600 dark:text-slate-300 hover:border-custom-orangered/50'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Snippet grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 rounded-xl border border-slate-200 dark:border-custom-dark-border bg-slate-100 dark:bg-custom-dark-surface animate-pulse" />
            ))}
          </div>
        ) : snippets.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="flex justify-center text-slate-300 dark:text-slate-600 mb-4">
              <FiSearch className="text-6xl" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No snippets found</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              {activeTab === 'mine' ? "You haven't created any snippets yet." : 'Try adjusting your filters.'}
            </p>
            {activeTab === 'mine' && (
              <Link to="/create" className="btn-primary">Create your first snippet</Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {snippets.map(snippet => (
                <SnippetCard
                  key={snippet._id}
                  snippet={snippet}
                  onDeleted={handleSnippetDeleted}
                  onUpdated={handleSnippetUpdated}
                  onLikeToggled={handleLikeToggled}
                  onTagClick={handleTagToggle}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-10 flex justify-center items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="btn-secondary py-2 px-4 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                          pagination.currentPage === page
                            ? 'gradient-bg text-white shadow-md'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-custom-dark-surface'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="btn-secondary py-2 px-4 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
