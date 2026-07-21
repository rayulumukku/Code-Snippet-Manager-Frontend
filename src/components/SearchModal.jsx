import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiX, FiClock, FiTrash2 } from 'react-icons/fi';
import { searchAPI } from '../services/api';
import SearchSuggestions from './SearchSuggestions';
import { getRecentSearches, addRecentSearch, removeRecentSearch, clearRecentSearches } from '../utils/searchHistory';

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState({ titles: [], tags: [], authors: [] });
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setRecentSearches(getRecentSearches());
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSuggestions({ titles: [], tags: [], authors: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions({ titles: [], tags: [], authors: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchAPI.getSuggestions({ q: query.trim() });
        setSuggestions(res.data || { titles: [], tags: [], authors: [] });
      } catch (err) {
        console.error('Failed to fetch suggestions:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const executeSearch = (targetQuery) => {
    const finalQuery = targetQuery || query;
    if (!finalQuery.trim()) return;
    addRecentSearch(finalQuery.trim());
    onClose();
    navigate(`/search?q=${encodeURIComponent(finalQuery.trim())}`);
  };

  const handleSelectTag = (tag) => {
    addRecentSearch(tag);
    onClose();
    navigate(`/search?tags=${encodeURIComponent(tag)}`);
  };

  const handleSelectAuthor = (author) => {
    onClose();
    navigate(`/search?author=${encodeURIComponent(author)}`);
  };

  const handleRemoveRecent = (e, item) => {
    e.stopPropagation();
    setRecentSearches(removeRecentSearch(item));
  };

  const handleClearAllRecent = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-custom-dark-card border border-slate-200 dark:border-custom-dark-border rounded-3xl shadow-2xl overflow-hidden animate-scale-up">
        {/* Header Search Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            executeSearch();
          }}
          className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-custom-dark-border"
        >
          <FiSearch className="w-5 h-5 text-custom-orangered shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search code, titles, tags, or authors..."
            className="flex-1 bg-transparent border-none outline-none text-base text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-0 p-0"
          />
          {loading && (
            <div className="w-4 h-4 border-2 border-custom-orangered border-t-transparent rounded-full animate-spin shrink-0" />
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-custom-dark-surface text-slate-400 hover:text-slate-600 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </form>

        {/* Content Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {/* Autocomplete Suggestions */}
          {query.trim() ? (
            <SearchSuggestions
              suggestions={suggestions}
              onSelectTitle={(t) => executeSearch(t)}
              onSelectTag={handleSelectTag}
              onSelectAuthor={handleSelectAuthor}
            />
          ) : (
            /* Recent Searches when query is empty */
            recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between px-2 mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FiClock className="w-3.5 h-3.5" /> Recent Searches
                  </span>
                  <button
                    type="button"
                    onClick={handleClearAllRecent}
                    className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                  >
                    <FiTrash2 className="w-3 h-3" /> Clear
                  </button>
                </div>
                <div className="space-y-1">
                  {recentSearches.map((item) => (
                    <div
                      key={item}
                      onClick={() => executeSearch(item)}
                      className="group flex items-center justify-between px-3 py-2 rounded-xl text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-custom-dark-surface cursor-pointer transition-colors"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <FiClock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{item}</span>
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleRemoveRecent(e, item)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity"
                        title="Remove"
                      >
                        <FiX className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-5 py-2.5 bg-slate-50 dark:bg-custom-dark-surface border-t border-slate-100 dark:border-custom-dark-border flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
          <span>Press <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-white dark:bg-custom-dark-card border border-slate-200 dark:border-custom-dark-border rounded shadow-sm">Enter</kbd> to search</span>
          <span>Press <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-white dark:bg-custom-dark-card border border-slate-200 dark:border-custom-dark-border rounded shadow-sm">Esc</kbd> to close</span>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
