import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { searchAPI } from '../services/api';
import SnippetCard from '../components/SnippetCard';
import TagInput from '../components/TagInput';
import TagFilter from '../components/TagFilter';
import TagChip from '../components/TagChip';
import SearchFilterPanel from '../components/SearchFilterPanel';
import { FiSearch, FiSliders, FiFolder, FiTag, FiClock, FiX, FiTrendingUp, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { addRecentSearch } from '../utils/searchHistory';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [language, setLanguage] = useState(searchParams.get('language') || '');
  const [author, setAuthor] = useState(searchParams.get('author') || '');
  const [dateRange, setDateRange] = useState(searchParams.get('dateRange') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'relevance');
  const [tags, setTags] = useState(() => {
    const paramTags = searchParams.get('tags');
    return paramTags ? paramTags.split(',').map((t) => t.trim()).filter(Boolean) : [];
  });
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0, executionTimeMs: 0 });
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState(searchParams.get('type') || 'snippets');
  const [showFilters, setShowFilters] = useState(
    Boolean(searchParams.get('tags') || searchParams.get('language') || searchParams.get('author') || searchParams.get('dateRange'))
  );

  useEffect(() => {
    document.title = 'Search Snippets & Collections | Code Snippet Manager';
    fetchTrending();
  }, []);

  const fetchTrending = async () => {
    try {
      const res = await searchAPI.getTrending();
      setTrending(res.data || []);
    } catch (err) {
      console.error('Failed to load trending searches:', err);
    }
  };

  const calculateDateFrom = useCallback((range) => {
    if (!range) return undefined;
    const now = new Date();
    if (range === '24h') return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    if (range === '7d') return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    if (range === '30d') return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    if (range === '1y') return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
    return undefined;
  }, []);

  const handleSearch = useCallback(async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    if (query.trim()) {
      addRecentSearch(query.trim());
    }

    try {
      const params = {
        q: query || undefined,
        type,
        language: type === 'snippets' && language ? language : undefined,
        author: type === 'snippets' && author ? author : undefined,
        dateFrom: type === 'snippets' ? calculateDateFrom(dateRange) : undefined,
        sort: type === 'snippets' ? sort : undefined,
        tags: type === 'snippets' && tags.length > 0 ? tags.join(',') : undefined,
        page,
        limit: 12,
      };

      const response = await searchAPI.search(params);
      setResults(response.data.results || []);
      setPagination({
        totalPages: response.data.totalPages || 1,
        total: response.data.total || 0,
        executionTimeMs: response.data.executionTimeMs || 0,
      });
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query, type, language, author, dateRange, sort, tags, page, calculateDateFrom]);

  useEffect(() => {
    const qParam = searchParams.get('q') || '';
    const typeParam = searchParams.get('type') || 'snippets';
    const langParam = searchParams.get('language') || '';
    const authorParam = searchParams.get('author') || '';
    const dateRangeParam = searchParams.get('dateRange') || '';
    const sortParam = searchParams.get('sort') || 'relevance';
    const paramTags = searchParams.get('tags');
    const tagsParam = paramTags ? paramTags.split(',').map((t) => t.trim()).filter(Boolean) : [];
    const pageParam = parseInt(searchParams.get('page') || '1', 10);

    setQuery(qParam);
    setType(typeParam);
    setLanguage(langParam);
    setAuthor(authorParam);
    setDateRange(dateRangeParam);
    setSort(sortParam);
    setTags(tagsParam);
    setPage(pageParam);
    if (tagsParam.length > 0 || langParam || authorParam || dateRangeParam) {
      setShowFilters(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const newParams = {};
    if (query) newParams.q = query;
    if (type !== 'snippets') newParams.type = type;
    if (language) newParams.language = language;
    if (author) newParams.author = author;
    if (dateRange) newParams.dateRange = dateRange;
    if (sort && sort !== 'relevance') newParams.sort = sort;
    if (tags.length > 0) newParams.tags = tags.join(',');
    if (page > 1) newParams.page = String(page);

    setSearchParams(newParams, { replace: true });
    handleSearch();
  }, [query, type, language, author, dateRange, sort, tags, page, setSearchParams, handleSearch]);

  const handleTagToggle = (tag) => {
    setPage(1);
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleClearAllFilters = () => {
    setLanguage('');
    setAuthor('');
    setDateRange('');
    setSort('relevance');
    setTags([]);
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      {/* Header */}
      <div className="mb-8 max-w-xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
          Explore the <span className="gradient-text">Library</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-base leading-relaxed">
          Search helper functions, algorithms, or snippets with weighted full-text matching.
        </p>
      </div>

      {/* Main Search Panel */}
      <form
        onSubmit={handleSearch}
        className="bg-white dark:bg-custom-dark-card border border-slate-200 dark:border-custom-dark-border/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 mb-8"
      >
        <div className="space-y-6">
          {/* Top Controls: Search Type + Advanced Filters Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Segmented Control / Tab Switcher for Search Type */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-custom-dark-surface rounded-xl w-fit">
              <button
                type="button"
                onClick={() => {
                  setType('snippets');
                  setPage(1);
                }}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  type === 'snippets'
                    ? 'bg-white dark:bg-custom-dark-card text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                Snippets
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('collections');
                  setPage(1);
                }}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  type === 'collections'
                    ? 'bg-white dark:bg-custom-dark-card text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                Collections
              </button>
            </div>

            {/* Advanced Filters Button (only for snippets) */}
            {type === 'snippets' && (
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-1.5 text-sm font-semibold px-4.5 py-2 rounded-xl transition-all duration-200 ${
                  showFilters
                    ? 'bg-orange-50 dark:bg-orange-950/20 text-custom-orangered'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <FiSliders className="w-4 h-4" />
                {showFilters ? 'Hide Filters' : 'Advanced Filters'}
              </button>
            )}
          </div>

          {/* Search Query Input Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <FiSearch className="w-5 h-5" />
              </div>
              <input
                type="text"
                id="query"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder={
                  type === 'snippets'
                    ? 'Search code, titles, tags, descriptions...'
                    : 'Search collection names or descriptions...'
                }
                className="w-full pl-12 pr-10 py-3.5 bg-slate-50 dark:bg-custom-dark-surface/50 border border-slate-200 dark:border-custom-dark-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-custom-orangered/30 focus:border-custom-orangered text-slate-900 dark:text-white transition-all duration-150 placeholder-slate-400 dark:placeholder-slate-500 text-sm sm:text-base shadow-inner"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setPage(1);
                  }}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>
            <button type="submit" className="btn-primary shrink-0 py-3.5 px-6">
              Search
            </button>
          </div>

          {/* Trending Search Topics */}
          {trending.length > 0 && (
            <div className="flex items-center gap-2 pt-1 overflow-x-auto text-xs">
              <span className="flex items-center gap-1 font-semibold text-slate-400 dark:text-slate-500 shrink-0">
                <FiTrendingUp className="w-3.5 h-3.5 text-custom-orangered" /> Trending:
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                {trending.map(({ term }) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setQuery(term);
                      setPage(1);
                    }}
                    className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-custom-dark-surface hover:bg-orange-50 dark:hover:bg-orange-950/20 text-slate-600 dark:text-slate-300 hover:text-custom-orangered transition-colors border border-slate-200/60 dark:border-custom-dark-border"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Expandable Advanced Filters Section (Snippets Only) */}
          {type === 'snippets' && showFilters && (
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-custom-dark-border/60">
              <SearchFilterPanel
                sort={sort}
                onSortChange={(s) => {
                  setSort(s);
                  setPage(1);
                }}
                language={language}
                onLanguageChange={(l) => {
                  setLanguage(l);
                  setPage(1);
                }}
                dateRange={dateRange}
                onDateRangeChange={(d) => {
                  setDateRange(d);
                  setPage(1);
                }}
                author={author}
                onAuthorChange={(a) => {
                  setAuthor(a);
                  setPage(1);
                }}
                onClearAll={handleClearAllFilters}
              />

              {/* Tag Input & Cloud */}
              <div className="p-5 bg-white dark:bg-custom-dark-card border border-slate-200 dark:border-custom-dark-border rounded-2xl shadow-sm">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Filter by Tags
                </label>
                <TagInput
                  tags={tags}
                  onChange={(newTags) => {
                    setTags(newTags);
                    setPage(1);
                  }}
                  placeholder="Type tag and press enter or select below..."
                />
                <TagFilter
                  selectedTags={tags}
                  onTagToggle={handleTagToggle}
                  onClearAll={() => {
                    setTags([]);
                    setPage(1);
                  }}
                  className="mt-4"
                />
              </div>
            </div>
          )}
        </div>
      </form>

      {/* Results Header / Stats Info */}
      {results.length > 0 && !loading && (
        <div className="flex items-center justify-between mb-5 px-1 animate-fade-in">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {type === 'snippets' ? 'Snippets' : 'Collections'} ({pagination.total})
          </h2>
          <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 font-mono">
            <FiClock className="w-3.5 h-3.5 text-slate-400" /> Resolved in {pagination.executionTimeMs}ms
          </span>
        </div>
      )}

      {/* Results Grid / Loading State / Empty State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-64 rounded-2xl border border-slate-200 dark:border-custom-dark-border bg-slate-100 dark:bg-custom-dark-surface animate-pulse"
            />
          ))}
        </div>
      ) : results.length > 0 ? (
        <div>
          {type === 'snippets' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((snippet) => (
                <SnippetCard
                  key={snippet._id}
                  snippet={snippet}
                  onTagClick={handleTagToggle}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((collection) => (
                <div
                  key={collection._id}
                  className="group bg-white dark:bg-custom-dark-card border border-slate-200 dark:border-custom-dark-border rounded-2xl p-5 shadow-sm hover:shadow-xl dark:hover:shadow-black/40 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <FiFolder className="w-5 h-5 text-custom-orangered" />
                      <Link to={`/collections/${collection._id}`} className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-custom-orangered transition-colors duration-150 truncate">
                          {collection.name}
                        </h3>
                      </Link>
                    </div>
                    {collection.description && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                        {collection.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100 dark:border-custom-dark-border/60">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      By <span className="font-semibold text-slate-700 dark:text-slate-200">{collection.owner?.username}</span> · {collection.snippets?.length || 0} snippets
                    </span>
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        collection.isPublic
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {collection.isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="mt-10 flex justify-center items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setPage((p) => Math.max(1, p - 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={page === 1}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-custom-dark-border bg-white dark:bg-custom-dark-card text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-custom-dark-surface transition-colors flex items-center gap-1 text-sm font-medium"
              >
                <FiChevronLeft className="w-4 h-4" /> Previous
              </button>
              <span className="text-sm font-mono text-slate-500 dark:text-slate-400 px-3 py-2">
                Page {page} of {pagination.totalPages}
              </span>
              <button
                type="button"
                onClick={() => {
                  setPage((p) => Math.min(pagination.totalPages, p + 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={page >= pagination.totalPages}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-custom-dark-border bg-white dark:bg-custom-dark-card text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-custom-dark-surface transition-colors flex items-center gap-1 text-sm font-medium"
              >
                Next <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : query || language || author || dateRange || tags.length > 0 ? (
        <div className="text-center py-16 bg-white dark:bg-custom-dark-card border border-slate-200 dark:border-custom-dark-border/80 rounded-3xl shadow-sm animate-fade-in">
          <div className="flex justify-center text-slate-300 dark:text-slate-600 mb-4">
            <FiFolder className="text-6xl" />
          </div>
          <p className="text-slate-700 dark:text-slate-300 text-lg font-semibold">No results found</p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1 max-w-xs mx-auto mb-4">
            We couldn't find matches for your search. Try refining your keywords or resetting filters.
          </p>
          <button type="button" onClick={handleClearAllFilters} className="btn-secondary text-xs">
            Reset All Filters
          </button>
        </div>
      ) : (
        /* Initial Search Page Info State */
        <div className="text-center py-20 bg-slate-50/50 dark:bg-custom-dark-card/30 border border-dashed border-slate-200 dark:border-custom-dark-border rounded-3xl animate-fade-in">
          <div className="flex justify-center text-slate-300 dark:text-slate-600 mb-4">
            <FiSearch className="text-6xl" />
          </div>
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">
            Search the Library
          </h3>
          <p className="text-slate-400 dark:text-slate-500 text-sm max-w-sm mx-auto">
            Choose whether to search for Code Snippets or Curated Collections above.
          </p>
        </div>
      )}
    </div>
  );
};

export default Search;
