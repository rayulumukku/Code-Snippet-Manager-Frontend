import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { searchAPI } from '../services/api';
import SnippetCard from '../components/SnippetCard';
import TagInput from '../components/TagInput';
import TagFilter from '../components/TagFilter';
import TagChip from '../components/TagChip';
import { FiSearch, FiSliders, FiFolder, FiTag, FiClock, FiX } from 'react-icons/fi';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [language, setLanguage] = useState(searchParams.get('language') || '');
  const [tags, setTags] = useState(() => {
    const paramTags = searchParams.get('tags');
    return paramTags ? paramTags.split(',').map(t => t.trim()).filter(Boolean) : [];
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState(searchParams.get('type') || 'snippets');
  const [showFilters, setShowFilters] = useState(Boolean(searchParams.get('tags') || searchParams.get('language')));

  useEffect(() => {
    document.title = 'Search Snippets & Collections | Code Snippet Manager';
  }, []);

  const languages = [
    'javascript',
    'python',
    'java',
    'typescript',
    'cpp',
    'c',
    'csharp',
    'go',
    'rust',
    'php',
    'html',
    'css',
    'sql',
  ];

  useEffect(() => {
    const newParams = {};
    if (query) newParams.q = query;
    if (type !== 'snippets') newParams.type = type;
    if (language) newParams.language = language;
    if (tags.length > 0) newParams.tags = tags.join(',');
    setSearchParams(newParams, { replace: true });

    handleSearch();
  }, [query, type, language, tags]);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const params = {
        q: query || undefined,
        type,
        language: type === 'snippets' && language ? language : undefined,
        tags: type === 'snippets' && tags.length > 0 ? tags.join(',') : undefined,
      };

      const response = await searchAPI.search(params);
      setResults(response.data.results || []);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTagToggle = (tag) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      {/* Header */}
      <div className="mb-8 max-w-xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
          Explore the <span className="gradient-text">Library</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-base leading-relaxed">
          Find helper functions, algorithms, or snippets shared by the developer community.
        </p>
      </div>

      {/* Main Search Panel */}
      <form onSubmit={handleSearch} className="bg-white dark:bg-custom-dark-card border border-slate-200 dark:border-custom-dark-border/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 mb-8">
        <div className="space-y-6">
          {/* Top Controls: Search Type + Advanced Filters Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Segmented Control / Tab Switcher for Search Type */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-custom-dark-surface rounded-xl w-fit">
              <button
                type="button"
                onClick={() => setType('snippets')}
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
                onClick={() => setType('collections')}
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
                onChange={(e) => setQuery(e.target.value)}
                placeholder={type === 'snippets' ? "Search title, description, code tags..." : "Search collections by name..."}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-custom-dark-surface/50 border border-slate-200 dark:border-custom-dark-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-custom-orangered/30 focus:border-custom-orangered text-slate-900 dark:text-white transition-all duration-150 placeholder-slate-400 dark:placeholder-slate-500 text-sm shadow-inner"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-orange-500/25 hover:shadow-xl transition-all duration-150 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <FiSearch className="w-4 h-4" />
              )}
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Expandable Filters Section (Snippets Only) */}
          {type === 'snippets' && showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-5 border-t border-slate-100 dark:border-custom-dark-border/60 animate-fade-in">
              {/* Language Selector */}
              <div>
                <label htmlFor="language" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Filter by Language
                </label>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3.5 py-3 bg-slate-50 dark:bg-custom-dark-surface/50 border border-slate-200 dark:border-custom-dark-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-custom-orangered/30 focus:border-custom-orangered capitalize text-slate-800 dark:text-slate-200 text-sm shadow-inner cursor-pointer"
                >
                  <option value="">All Languages</option>
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags Input & Badges */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Filter by Tags
                </label>
                <TagInput
                  tags={tags}
                  onChange={(newTags) => setTags(newTags)}
                  placeholder="Type tag and press enter or select below..."
                />
                <TagFilter
                  selectedTags={tags}
                  onTagToggle={handleTagToggle}
                  onClearAll={() => setTags([])}
                  className="mt-4"
                />
              </div>
            </div>
          )}
        </div>
      </form>

      {/* Results Header / Info */}
      {results.length > 0 && !loading && (
        <div className="flex items-center justify-between mb-5 px-1 animate-fade-in">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {type === 'snippets' ? 'Snippets' : 'Collections'} ({results.length})
          </h2>
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
        </div>
      ) : (query || language || tags.length > 0) ? (
        <div className="text-center py-16 bg-white dark:bg-custom-dark-card border border-slate-200 dark:border-custom-dark-border/80 rounded-3xl shadow-sm animate-fade-in">
          <div className="flex justify-center text-slate-300 dark:text-slate-600 mb-4">
            <FiFolder className="text-6xl" />
          </div>
          <p className="text-slate-700 dark:text-slate-300 text-lg font-semibold">No results found</p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1 max-w-xs mx-auto">
            We couldn't find matches for your search. Try refining your keywords or filters.
          </p>
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
