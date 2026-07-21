import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiX, FiCommand, FiClock, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { searchAPI } from '../services/api';
import { getStaticCommands, addRecentCommand } from '../utils/commandRegistry';
import CommandItem from './CommandItem';

const CommandPalette = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { toggleTheme } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [suggestions, setSuggestions] = useState({ titles: [], tags: [], authors: [] });
  const [loading, setLoading] = useState(false);

  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Static commands list
  const staticCommands = useMemo(() => {
    return getStaticCommands(user, { navigate, toggleTheme, logout, toast });
  }, [user, navigate, toggleTheme, logout, toast]);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Fetch live suggestions on query change
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
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  // Filter static commands by search query
  const filteredStatic = useMemo(() => {
    if (!query.trim()) return staticCommands;
    const q = query.toLowerCase().trim();
    return staticCommands.filter((cmd) => {
      const matchTitle = cmd.title.toLowerCase().includes(q);
      const matchCat = cmd.category.toLowerCase().includes(q);
      const matchKw = (cmd.keywords || []).some((kw) => kw.toLowerCase().includes(q));
      return matchTitle || matchCat || matchKw;
    });
  }, [staticCommands, query]);

  // Flattened items list for index calculation
  const allItems = useMemo(() => {
    const list = [];

    // Static commands
    filteredStatic.forEach((cmd) => {
      list.push({
        id: cmd.id,
        title: cmd.title,
        category: cmd.category,
        shortcut: cmd.shortcut,
        type: 'command',
        perform: cmd.perform,
      });
    });

    // Dynamic Snippets
    (suggestions.titles || []).forEach((title) => {
      list.push({
        id: `snip-${title}`,
        title,
        category: 'Snippets',
        type: 'snippet',
        perform: () => {
          onClose();
          navigate(`/search?q=${encodeURIComponent(title)}`);
        },
      });
    });

    // Dynamic Tags
    (suggestions.tags || []).forEach((tag) => {
      list.push({
        id: `tag-${tag}`,
        title: `#${tag}`,
        category: 'Tags',
        badge: 'tag',
        type: 'tag',
        perform: () => {
          onClose();
          navigate(`/search?tags=${encodeURIComponent(tag)}`);
        },
      });
    });

    // Dynamic Authors
    (suggestions.authors || []).forEach((author) => {
      list.push({
        id: `author-${author.username}`,
        title: `@${author.username}`,
        category: 'Authors',
        badge: 'author',
        type: 'author',
        perform: () => {
          onClose();
          navigate(`/search?author=${encodeURIComponent(author.username)}`);
        },
      });
    });

    return list;
  }, [filteredStatic, suggestions, navigate, onClose]);

  // Keep index within bounds
  useEffect(() => {
    setSelectedIndex((prev) => Math.min(prev, Math.max(0, allItems.length - 1)));
  }, [allItems]);

  // Execute active item
  const executeItem = (item) => {
    if (!item) return;
    addRecentCommand(item.id);
    onClose();
    item.perform();
  };

  // Keyboard navigation dispatcher
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown' || (e.ctrlKey && e.key === 'n')) {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, allItems.length));
    } else if (e.key === 'ArrowUp' || (e.ctrlKey && e.key === 'p')) {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + allItems.length) % Math.max(1, allItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allItems[selectedIndex]) {
        executeItem(allItems[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  // Group items by category for rendering
  const groupedItems = useMemo(() => {
    const groups = {};
    allItems.forEach((item, index) => {
      const cat = item.category || 'General';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push({ ...item, globalIndex: index });
    });
    return groups;
  }, [allItems]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 px-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div
        onKeyDown={handleKeyDown}
        className="relative w-full max-w-2xl bg-white dark:bg-custom-dark-card border border-slate-200 dark:border-custom-dark-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-scale-up"
      >
        {/* Input Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-custom-dark-border">
          <FiCommand className="w-5 h-5 text-custom-orangered shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search library..."
            className="flex-1 bg-transparent border-none outline-none text-base text-slate-900 dark:text-white placeholder-slate-400 focus:ring-0 p-0"
          />
          {loading && (
            <div className="w-4 h-4 border-2 border-custom-orangered border-t-transparent rounded-full animate-spin shrink-0" />
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-custom-dark-surface text-slate-400 hover:text-slate-600 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Command List */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-3 space-y-4">
          {allItems.length > 0 ? (
            Object.entries(groupedItems).map(([category, items]) => (
              <div key={category}>
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 px-3">
                  {category}
                </div>
                <div className="space-y-0.5">
                  {items.map((item) => (
                    <CommandItem
                      key={item.id}
                      item={item}
                      isSelected={selectedIndex === item.globalIndex}
                      onClick={() => executeItem(item)}
                      onMouseEnter={() => setSelectedIndex(item.globalIndex)}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-sm">
              No matching commands or snippets found.
            </div>
          )}
        </div>

        {/* Footer Keyboard Hints */}
        <div className="px-5 py-2.5 bg-slate-50 dark:bg-custom-dark-surface border-t border-slate-100 dark:border-custom-dark-border flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-white dark:bg-custom-dark-card border border-slate-200 dark:border-custom-dark-border rounded shadow-xs">↑↓</kbd> Navigate</span>
            <span><kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-white dark:bg-custom-dark-card border border-slate-200 dark:border-custom-dark-border rounded shadow-xs">↵</kbd> Select</span>
          </div>
          <span><kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-white dark:bg-custom-dark-card border border-slate-200 dark:border-custom-dark-border rounded shadow-xs">Esc</kbd> Close</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
