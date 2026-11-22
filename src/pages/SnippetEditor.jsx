import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { snippetsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import CodeExecutor from '../components/CodeExecutor';
import TagInput from '../components/TagInput';
import { FiGlobe, FiLock } from 'react-icons/fi';

const languages = [
  'javascript','python','java','typescript','cpp','c','csharp','ruby',
  'go','rust','php','swift','kotlin','html','css','sql','json','xml',
  'markdown','shell','other',
];

const STARTER_TEMPLATES = [
  {
    name: 'Binary Search (Python)',
    title: 'Binary Search Algorithm',
    language: 'python',
    tags: ['algorithms', 'binary-search', 'python'],
    description: 'Classic logarithmic O(log n) search on a sorted array',
    code: `def binary_search(arr, target):\n    left, right = 0, len(arr) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1\n\n# Example usage:\nprint(binary_search([1, 3, 5, 7, 9, 11], 7)) # Output: 3`,
  },
  {
    name: 'Debounce Function (JavaScript)',
    title: 'Debounce Utility',
    language: 'javascript',
    tags: ['utility', 'javascript', 'performance'],
    description: 'Debounce rapid events like search input keystrokes',
    code: `function debounce(func, wait = 300) {\n  let timeout;\n  return function (...args) {\n    clearTimeout(timeout);\n    timeout = setTimeout(() => func.apply(this, args), wait);\n  };\n}\n\n// Example usage:\nconst handleSearch = debounce((q) => console.log('Searching:', q), 300);\nhandleSearch('react');`,
  },
  {
    name: 'Competitive Programming Template (C++)',
    title: 'C++ Competitive Programming Boilerplate',
    language: 'cpp',
    tags: ['competitive-programming', 'cpp', 'algorithms'],
    description: 'Fast I/O template with standard includes and solver routine',
    code: `#include <bits/stdc++.h>\nusing namespace std;\n\nvoid solve() {\n    int n;\n    if (!(cin >> n)) return;\n    vector<int> a(n);\n    for (int i = 0; i < n; i++) cin >> a[i];\n    cout << "Processed " << n << " elements\\n";\n}\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    int t = 1;\n    // cin >> t;\n    while (t--) solve();\n    return 0;\n}`,
  },
  {
    name: 'Fetch with Retry & Backoff (TypeScript)',
    title: 'Async Fetch with Exponential Backoff',
    language: 'typescript',
    tags: ['typescript', 'api', 'async'],
    description: 'Resilient HTTP fetch wrapper with retry and exponential delay',
    code: `async function fetchWithRetry<T>(\n  url: string,\n  options: RequestInit = {},\n  retries = 3,\n  delayMs = 500\n): Promise<T> {\n  for (let attempt = 0; attempt <= retries; attempt++) {\n    try {\n      const res = await fetch(url, options);\n      if (!res.ok) throw new Error(\`HTTP \${res.status}: \${res.statusText}\`);\n      return (await res.json()) as T;\n    } catch (err) {\n      if (attempt === retries) throw err;\n      await new Promise((r) => setTimeout(r, delayMs * Math.pow(2, attempt)));\n    }\n  }\n  throw new Error('Failed after retries');\n}`,
  },
  {
    name: 'LRU Cache (Python)',
    title: 'LRU Cache Implementation',
    language: 'python',
    tags: ['datastructures', 'python', 'lru-cache'],
    description: 'O(1) get and put Least Recently Used cache with OrderedDict',
    code: `from collections import OrderedDict\n\nclass LRUCache:\n    def __init__(self, capacity: int):\n        self.capacity = capacity\n        self.cache = OrderedDict()\n\n    def get(self, key: int) -> int:\n        if key not in self.cache:\n            return -1\n        self.cache.move_to_end(key)\n        return self.cache[key]\n\n    def put(self, key: int, value: int) -> None:\n        if key in self.cache:\n            self.cache.move_to_end(key)\n        self.cache[key] = value\n        if len(self.cache) > self.capacity:\n            self.cache.popitem(last=False)`,
  },
];

const SnippetEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    code: '',
    language: 'javascript',
    tags: [],
    isPublic: false,
  });
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    document.title = isEdit ? 'Edit Snippet | Code Snippet Manager' : 'Create Snippet | Code Snippet Manager';
  }, [isEdit]);

  const fetchSnippet = useCallback(async () => {
    try {
      const res = await snippetsAPI.getById(id);
      const snippet = res.data;

      // Redirect if not the owner
      const authorId = snippet.author?._id || snippet.author;
      const currentUserId = user?._id;
      if (authorId && currentUserId && authorId.toString() !== currentUserId.toString()) {
        navigate('/');
        return;
      }

      setFormData({
        title: snippet.title,
        description: snippet.description || '',
        code: snippet.code,
        language: snippet.language,
        tags: snippet.tags || [],
        isPublic: snippet.isPublic,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load snippet');
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [id, user, navigate, toast]);

  useEffect(() => {
    if (isEdit) fetchSnippet();
  }, [isEdit, fetchSnippet]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const formatCurrentCode = () => {
    if (!formData.code || !formData.code.trim()) return;
    try {
      if (formData.language === 'json') {
        const parsed = JSON.parse(formData.code);
        setFormData(f => ({ ...f, code: JSON.stringify(parsed, null, 2) }));
        toast.success('JSON formatted!');
        return;
      }

      const lines = formData.code.split(/\r?\n/);
      let indentLevel = 0;
      const formattedLines = [];

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) {
          formattedLines.push('');
          continue;
        }

        if (/^[}\])]/.test(trimmed)) {
          indentLevel = Math.max(0, indentLevel - 1);
        }

        const indentSpaces = '  '.repeat(indentLevel);
        formattedLines.push(indentSpaces + trimmed);

        const openMatches = (trimmed.match(/[{[(]/g) || []).length;
        const closeMatches = (trimmed.match(/[})]/g) || []).length;
        if (openMatches > closeMatches) {
          indentLevel += (openMatches - closeMatches);
        } else if (trimmed.endsWith(':') && formData.language === 'python') {
          indentLevel += 1;
        }
      }

      const formatted = formattedLines.join('\n').replace(/\n{3,}/g, '\n\n');
      setFormData(f => ({ ...f, code: formatted }));
      toast.success('Code formatted!');
    } catch {
      toast.error('Unable to auto-format syntax');
    }
  };

  const handleKeyDown = (e) => {
    // Alt + Shift + F shortcut for formatting
    if (e.altKey && e.shiftKey && (e.key === 'F' || e.key === 'f')) {
      e.preventDefault();
      formatCurrentCode();
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const { selectionStart, selectionEnd, value } = e.target;
      if (e.shiftKey) {
        const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
        if (value.substring(lineStart, lineStart + 2) === '  ') {
          const newValue = value.substring(0, lineStart) + value.substring(lineStart + 2);
          setFormData(f => ({ ...f, code: newValue }));
          setTimeout(() => {
            e.target.selectionStart = Math.max(lineStart, selectionStart - 2);
            e.target.selectionEnd = Math.max(lineStart, selectionEnd - 2);
          }, 0);
        }
      } else {
        const newValue = value.substring(0, selectionStart) + '  ' + value.substring(selectionEnd);
        setFormData(f => ({ ...f, code: newValue }));
        setTimeout(() => {
          e.target.selectionStart = e.target.selectionEnd = selectionStart + 2;
        }, 0);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await snippetsAPI.update(id, formData);
        toast.success('Snippet updated!');
      } else {
        const res = await snippetsAPI.create(formData);
        toast.success('Snippet created!');
        navigate(`/snippets/${res.data._id}`);
        return;
      }
      navigate(`/snippets/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to save snippet');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-custom-dark-bg">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-custom-orangered border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">Loading snippet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          {isEdit ? 'Edit Snippet' : 'Create New Snippet'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          {isEdit ? 'Update your snippet below.' : 'Share a piece of code with the community.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            maxLength={200}
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Debounce function in JavaScript"
            className="input-style"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Description <span className="text-slate-400 text-xs font-normal">(optional)</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            maxLength={1000}
            value={formData.description}
            onChange={handleChange}
            placeholder="Briefly describe what this snippet does..."
            className="input-style resize-none"
          />
        </div>

        {/* Language */}
        <div>
          <label htmlFor="language" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Language <span className="text-red-500">*</span>
          </label>
          <select
            id="language"
            name="language"
            required
            value={formData.language}
            onChange={handleChange}
            className="input-style capitalize"
          >
            {languages.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>

        {/* Code */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
            <label htmlFor="code" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Code <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <select
                aria-label="Starter Templates"
                onChange={(e) => {
                  const selected = STARTER_TEMPLATES.find(t => t.name === e.target.value);
                  if (selected) {
                    setFormData(f => ({
                      ...f,
                      title: f.title || selected.title,
                      description: f.description || selected.description,
                      language: selected.language,
                      tags: selected.tags,
                      code: selected.code,
                    }));
                    toast.info(`Loaded template: ${selected.name}`);
                  }
                  e.target.value = '';
                }}
                defaultValue=""
                className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 dark:border-custom-dark-border bg-white dark:bg-custom-dark-card text-slate-700 dark:text-slate-300 hover:border-custom-orangered transition-colors cursor-pointer"
              >
                <option value="" disabled>⚡ Load Template...</option>
                {STARTER_TEMPLATES.map(t => (
                  <option key={t.name} value={t.name}>{t.name}</option>
                ))}
              </select>
              {formData.code && (
                <>
                  <button
                    type="button"
                    onClick={formatCurrentCode}
                    title="Clean up indentation & formatting (Alt+Shift+F)"
                    className="text-xs text-slate-600 dark:text-slate-300 hover:text-custom-orangered font-medium transition-colors"
                  >
                    ✨ Format
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-xs text-custom-orangered hover:text-orange-600 font-medium transition-colors"
                  >
                    {showPreview ? 'Hide preview' : 'Show preview'}
                  </button>
                </>
              )}
            </div>
          </div>
          <textarea
            id="code"
            name="code"
            required
            rows={15}
            value={formData.code}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Paste your code here (press Tab to indent with 2 spaces)..."
            className="input-style font-mono text-sm resize-y"
          />
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>💡 Press <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono">Tab</kbd> to indent, <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono">Shift+Tab</kbd> to unindent, or <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono">Alt+Shift+F</kbd> to auto-format.</span>
          </div>
          {formData.code && showPreview && (
            <div className="mt-3 rounded-xl overflow-hidden border border-slate-200 dark:border-custom-dark-border animate-fade-in">
              <div className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-custom-dark-surface border-b border-slate-200 dark:border-custom-dark-border">
                Preview
              </div>
              <SyntaxHighlighter
                language={formData.language === 'other' ? 'text' : formData.language}
                style={oneDark}
                showLineNumbers
                customStyle={{ margin: 0, borderRadius: '0 0 0.75rem 0.75rem', fontSize: '0.8125rem' }}
              >
                {formData.code}
              </SyntaxHighlighter>
            </div>
          )}
          {formData.code && <CodeExecutor code={formData.code} language={formData.language} />}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Tags <span className="text-slate-400 text-xs font-normal">(optional, max 10)</span>
          </label>
          <TagInput
            tags={formData.tags}
            onChange={(tags) => setFormData(f => ({ ...f, tags }))}
          />
        </div>

        {/* Visibility toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-custom-dark-border bg-slate-50 dark:bg-custom-dark-surface">
          <div>
            <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
              {formData.isPublic ? <FiGlobe className="w-4 h-4 text-emerald-500" /> : <FiLock className="w-4 h-4 text-slate-400" />}
              {formData.isPublic ? 'Public snippet' : 'Private snippet'}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {formData.isPublic ? 'Visible to everyone on the platform' : 'Only visible to you'}
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={formData.isPublic}
            onClick={() => setFormData(f => ({ ...f, isPublic: !f.isPublic }))}
            className={`relative w-11 h-6 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-custom-orangered/40 ${
              formData.isPublic ? 'gradient-bg' : 'bg-slate-200 dark:bg-slate-700'
            }`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200 ${
              formData.isPublic ? 'left-5' : 'left-0.5'
            }`} />
          </button>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            id="snippet-save"
            disabled={saving}
            className="btn-primary"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (isEdit ? 'Update Snippet' : 'Create Snippet')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SnippetEditor;
