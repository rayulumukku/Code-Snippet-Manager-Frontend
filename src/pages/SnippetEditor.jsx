import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { snippetsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import CodeExecutor from '../components/CodeExecutor';

const languages = [
  'javascript','python','java','typescript','cpp','c','csharp','ruby',
  'go','rust','php','swift','kotlin','html','css','sql','json','xml',
  'markdown','shell','other',
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
  const [tagInput, setTagInput] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    document.title = isEdit ? 'Edit Snippet | Code Snippet Manager' : 'Create Snippet | Code Snippet Manager';
  }, [isEdit]);

  useEffect(() => {
    if (isEdit) fetchSnippet();
  }, [id]);

  const fetchSnippet = async () => {
    try {
      const res = await snippetsAPI.getById(id);
      const snippet = res.data;

      // Redirect if not the owner
      if (snippet.author._id !== user?._id) {
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
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleTagAdd = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const trimmed = tagInput.trim().toLowerCase();
      if (!formData.tags.includes(trimmed) && formData.tags.length < 10) {
        setFormData(f => ({ ...f, tags: [...f.tags, trimmed] }));
      }
      setTagInput('');
    }
  };

  const handleTagRemove = (tag) => {
    setFormData(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }));
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
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="code" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Code <span className="text-red-500">*</span>
            </label>
            {formData.code && (
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="text-xs text-custom-orangered hover:text-orange-600 font-medium transition-colors"
              >
                {showPreview ? 'Hide preview' : 'Show preview'}
              </button>
            )}
          </div>
          <textarea
            id="code"
            name="code"
            required
            rows={15}
            value={formData.code}
            onChange={handleChange}
            placeholder="Paste your code here..."
            className="input-style font-mono text-sm resize-y"
          />
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
            Tags <span className="text-slate-400 text-xs font-normal">(press Enter to add, max 10)</span>
          </label>
          <input
            type="text"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={handleTagAdd}
            placeholder="e.g. utility, async, hooks"
            className="input-style mb-2"
          />
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map(tag => (
                <span key={tag} className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800/40 rounded-full text-sm">
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleTagRemove(tag)}
                    className="text-orange-400 hover:text-red-500 transition-colors leading-none"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Visibility toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-custom-dark-border bg-slate-50 dark:bg-custom-dark-surface">
          <div>
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {formData.isPublic ? '🌐 Public snippet' : '🔒 Private snippet'}
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
