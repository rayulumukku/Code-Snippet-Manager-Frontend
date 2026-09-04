import { useState, useEffect } from 'react';
import TagChip from './TagChip';
import { snippetsAPI } from '../services/api';
import { FiTag, FiX } from 'react-icons/fi';

const TagFilter = ({ selectedTags = [], onTagToggle, onClearAll, className = '' }) => {
  const [popularTags, setPopularTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPopularTags();
  }, []);

  const fetchPopularTags = async () => {
    try {
      const res = await snippetsAPI.getTags({ limit: 20 });
      setPopularTags(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load popular tags:', err);
      setPopularTags([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-2 py-2 text-xs text-slate-400 ${className}`}>
        <div className="w-3.5 h-3.5 border-2 border-custom-orangered border-t-transparent rounded-full animate-spin" />
        <span>Loading popular tags...</span>
      </div>
    );
  }

  if (popularTags.length === 0 && selectedTags.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-col gap-2.5 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
          <FiTag className="w-3.5 h-3.5 text-custom-orangered" />
          <span>Popular Tags</span>
        </div>

        {selectedTags.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="flex items-center gap-1 text-xs text-custom-orangered hover:text-orange-600 font-medium transition-colors"
          >
            <FiX className="w-3.5 h-3.5" />
            Clear filter ({selectedTags.length})
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {popularTags.map(({ tag, count }) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <TagChip
              key={tag}
              tag={tag}
              count={count}
              selected={isSelected}
              onClick={() => onTagToggle(tag)}
              size="sm"
            />
          );
        })}

        {/* Selected tags that are not in popular tags */}
        {selectedTags
          .filter(st => !popularTags.some(pt => pt.tag === st))
          .map(tag => (
            <TagChip
              key={tag}
              tag={tag}
              selected={true}
              onRemove={() => onTagToggle(tag)}
              onClick={() => onTagToggle(tag)}
              size="sm"
            />
          ))}
      </div>
    </div>
  );
};

export default TagFilter;
