import { useState, useEffect, useRef } from 'react';
import TagChip from './TagChip';
import { snippetsAPI } from '../services/api';

const MAX_TAGS = 10;
const MAX_TAG_LENGTH = 30;

const TagInput = ({ tags = [], onChange, placeholder = 'Add tags (press Enter or comma)' }) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [errorMsg, setErrorMsg] = useState('');
  const wrapperRef = useRef(null);

  // Debounced search for autocomplete suggestions
  useEffect(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    const timer = setTimeout(async () => {
      try {
        const res = await snippetsAPI.getTags({ search: trimmed, limit: 8 });
        // Filter out tags already added
        const filtered = (res.data || []).filter(item => !tags.includes(item.tag));
        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
        setActiveIndex(-1);
      } catch (err) {
        console.error('Failed to fetch tag suggestions:', err);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [inputValue, tags]);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addTag = (rawInput) => {
    setErrorMsg('');
    const rawList = typeof rawInput === 'string' ? rawInput.split(',') : [rawInput];
    let currentTags = [...tags];

    for (const rawTag of rawList) {
      const cleaned = String(rawTag || '').trim().toLowerCase().replace(/^[#\s]+/, '');
      if (!cleaned) continue;

      if (cleaned.length > MAX_TAG_LENGTH) {
        setErrorMsg(`Tag must be ${MAX_TAG_LENGTH} characters or less`);
        continue;
      }

      if (currentTags.includes(cleaned)) {
        setErrorMsg(`Tag "#${cleaned}" is already added`);
        continue;
      }

      if (currentTags.length >= MAX_TAGS) {
        setErrorMsg(`Maximum of ${MAX_TAGS} tags allowed`);
        break;
      }

      currentTags.push(cleaned);
    }

    if (currentTags.length !== tags.length) {
      onChange(currentTags);
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeTag = (tagToRemove) => {
    setErrorMsg('');
    onChange(tags.filter(t => t !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        addTag(suggestions[activeIndex].tag);
      } else if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    } else if (e.key === 'ArrowDown' && showSuggestions) {
      e.preventDefault();
      setActiveIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp' && showSuggestions) {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-custom-dark-border bg-white dark:bg-custom-dark-surface focus-within:ring-2 focus-within:ring-custom-orangered/40 focus-within:border-custom-orangered transition-all duration-200 min-h-[46px]">
        {tags.map((tag) => (
          <TagChip key={tag} tag={tag} onRemove={() => removeTag(tag)} size="md" />
        ))}

        {tags.length < MAX_TAGS && (
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (!e.target.value.trim()) {
                setSuggestions([]);
                setShowSuggestions(false);
              }
            }}
            onPaste={(e) => {
              const pasted = e.clipboardData.getData('text');
              if (pasted && pasted.includes(',')) {
                e.preventDefault();
                addTag(pasted);
              }
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => inputValue.trim() && suggestions.length > 0 && setShowSuggestions(true)}
            placeholder={tags.length === 0 ? placeholder : 'Add more...'}
            className="flex-1 min-w-[140px] bg-transparent border-0 outline-none text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-0 p-0"
          />
        )}
      </div>

      {/* Counter & Warning */}
      <div className="flex items-center justify-between mt-1.5 px-1 text-xs">
        {errorMsg ? (
          <span className="text-red-500 font-medium animate-fade-in">{errorMsg}</span>
        ) : (
          <span className="text-slate-400 dark:text-slate-500">Press Enter or comma to add</span>
        )}
        <span className={`font-mono ${tags.length >= MAX_TAGS ? 'text-amber-500 font-semibold' : 'text-slate-400 dark:text-slate-500'}`}>
          {tags.length}/{MAX_TAGS} tags
        </span>
      </div>

      {/* Autocomplete Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-20 w-full mt-1.5 py-1 bg-white dark:bg-custom-dark-card border border-slate-200 dark:border-custom-dark-border rounded-xl shadow-xl overflow-hidden animate-fade-in">
          {suggestions.map((item, idx) => (
            <li
              key={item.tag}
              onClick={() => addTag(item.tag)}
              onMouseEnter={() => setActiveIndex(idx)}
              className={`flex items-center justify-between px-3.5 py-2 text-sm cursor-pointer transition-colors ${
                idx === activeIndex
                  ? 'bg-orange-50 dark:bg-orange-950/40 text-custom-orangered font-medium'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-custom-dark-surface'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <span className="text-slate-400">#</span>
                {item.tag}
              </span>
              <span className="text-xs text-slate-400 font-mono">{item.count} snippets</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TagInput;
