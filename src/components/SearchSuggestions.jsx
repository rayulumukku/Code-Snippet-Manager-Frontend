import { FiFileText, FiTag, FiUser, FiArrowRight } from 'react-icons/fi';

const SearchSuggestions = ({ suggestions, onSelectTitle, onSelectTag, onSelectAuthor, activeIndex = -1 }) => {
  const { titles = [], tags = [], authors = [] } = suggestions;

  const hasSuggestions = titles.length > 0 || tags.length > 0 || authors.length > 0;

  if (!hasSuggestions) return null;

  return (
    <div className="py-2 bg-white dark:bg-custom-dark-card border border-slate-200 dark:border-custom-dark-border rounded-2xl shadow-xl overflow-hidden animate-fade-in text-sm">
      {/* Titles */}
      {titles.length > 0 && (
        <div className="px-3 py-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-2">
            Snippets
          </div>
          {titles.map((title, i) => (
            <button
              key={title}
              type="button"
              onClick={() => onSelectTitle(title)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:text-custom-orangered transition-colors text-left"
            >
              <span className="flex items-center gap-2 truncate">
                <FiFileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{title}</span>
              </span>
              <FiArrowRight className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="px-3 py-1 border-t border-slate-100 dark:border-custom-dark-border/40 mt-1 pt-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-2">
            Tags
          </div>
          <div className="flex flex-wrap gap-1.5 px-2 py-0.5">
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onSelectTag(tag)}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-300 rounded-full text-xs font-medium border border-orange-200/60 dark:border-orange-900/40 hover:bg-orange-100 transition-colors"
              >
                <FiTag className="w-3 h-3" />
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Authors */}
      {authors.length > 0 && (
        <div className="px-3 py-1 border-t border-slate-100 dark:border-custom-dark-border/40 mt-1 pt-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-2">
            Authors
          </div>
          {authors.map((author) => (
            <button
              key={author.username}
              type="button"
              onClick={() => onSelectAuthor(author.username)}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:text-custom-orangered transition-colors text-left"
            >
              <div className="w-4 h-4 rounded-full gradient-bg flex items-center justify-center text-white text-[8px] font-bold">
                {author.username.slice(0, 1).toUpperCase()}
              </div>
              <span className="truncate">@{author.username}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchSuggestions;
