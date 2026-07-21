import { useState, useEffect } from 'react';
import SnippetCard from './SnippetCard';
import { pinnedAPI } from '../services/api';

const PinnedSection = ({ onTagClick }) => {
  const [pinnedSnippets, setPinnedSnippets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPinned();
  }, []);

  const fetchPinned = async () => {
    try {
      const res = await pinnedAPI.getPinned();
      setPinnedSnippets(res.data || []);
    } catch (err) {
      console.error('Failed to load pinned snippets:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || pinnedSnippets.length === 0) return null;

  return (
    <div className="mb-10 p-6 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent dark:from-orange-950/30 dark:via-custom-dark-surface dark:to-custom-dark-card border border-orange-200/80 dark:border-orange-900/40 rounded-3xl animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-custom-orangered flex items-center justify-center">
            <svg className="w-4 h-4 text-custom-orangered" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
              Featured Pinned Snippets
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Curated top snippets pinned for quick access
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold text-custom-orangered bg-orange-100 dark:bg-orange-950/40 px-3 py-1 rounded-full">
          {pinnedSnippets.length} Pinned
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pinnedSnippets.map((snippet) => (
          <SnippetCard
            key={snippet._id}
            snippet={snippet}
            onTagClick={onTagClick}
          />
        ))}
      </div>
    </div>
  );
};

export default PinnedSection;
