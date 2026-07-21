import { FiCalendar, FiUser, FiSliders, FiX, FiCode } from 'react-icons/fi';

const LANGUAGES = [
  'javascript', 'python', 'java', 'typescript', 'cpp', 'c',
  'csharp', 'go', 'rust', 'php', 'html', 'css', 'sql', 'json', 'markdown', 'shell',
];

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'views', label: 'Most Viewed' },
  { value: 'likes', label: 'Most Liked' },
  { value: 'forks', label: 'Most Forked' },
];

const DATE_OPTIONS = [
  { value: '', label: 'All Time' },
  { value: '24h', label: 'Past 24 Hours' },
  { value: '7d', label: 'Past 7 Days' },
  { value: '30d', label: 'Past 30 Days' },
  { value: '1y', label: 'Past Year' },
];

const SearchFilterPanel = ({
  sort,
  onSortChange,
  language,
  onLanguageChange,
  dateRange,
  onDateRangeChange,
  author,
  onAuthorChange,
  onClearAll,
}) => {
  const hasActiveFilters = Boolean(language || dateRange || author || (sort && sort !== 'relevance'));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 bg-slate-50 dark:bg-custom-dark-surface/50 border border-slate-200 dark:border-custom-dark-border rounded-2xl shadow-inner text-sm animate-fade-in">
      {/* Sort By */}
      <div>
        <label htmlFor="search-sort" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5 text-xs">
          <FiSliders className="w-3.5 h-3.5 text-custom-orangered" />
          Sort By
        </label>
        <select
          id="search-sort"
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full px-3 py-2 bg-white dark:bg-custom-dark-card border border-slate-200 dark:border-custom-dark-border rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-custom-orangered/40"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Language */}
      <div>
        <label htmlFor="search-language" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5 text-xs">
          <FiCode className="w-3.5 h-3.5 text-custom-orangered" />
          Language
        </label>
        <select
          id="search-language"
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="w-full px-3 py-2 bg-white dark:bg-custom-dark-card border border-slate-200 dark:border-custom-dark-border rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-custom-orangered/40 capitalize"
        >
          <option value="">All Languages</option>
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </div>

      {/* Date Range */}
      <div>
        <label htmlFor="search-date" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5 text-xs">
          <FiCalendar className="w-3.5 h-3.5 text-custom-orangered" />
          Timeframe
        </label>
        <select
          id="search-date"
          value={dateRange}
          onChange={(e) => onDateRangeChange(e.target.value)}
          className="w-full px-3 py-2 bg-white dark:bg-custom-dark-card border border-slate-200 dark:border-custom-dark-border rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-custom-orangered/40"
        >
          {DATE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Author Input */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="search-author" className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 text-xs">
            <FiUser className="w-3.5 h-3.5 text-custom-orangered" />
            Author
          </label>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearAll}
              className="text-[11px] text-custom-orangered hover:underline font-medium flex items-center gap-0.5"
            >
              <FiX className="w-3 h-3" /> Reset
            </button>
          )}
        </div>
        <input
          type="text"
          id="search-author"
          value={author}
          onChange={(e) => onAuthorChange(e.target.value)}
          placeholder="Filter by username"
          className="w-full px-3 py-2 bg-white dark:bg-custom-dark-card border border-slate-200 dark:border-custom-dark-border rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-custom-orangered/40 text-sm"
        />
      </div>
    </div>
  );
};

export default SearchFilterPanel;
