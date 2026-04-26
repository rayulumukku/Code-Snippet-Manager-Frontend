import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { snippetsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CodeExecutor from '../components/CodeExecutor';
import { hasProfanity } from '../utils/profanityFilter';

const SnippetEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = id && id !== 'new';
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    code: '',
    language: 'javascript',
    tags: [],
    isPublic: false,
  });

  const [tagInput, setTagInput] = useState('');

  const languages = [
    'javascript',
    'python',
    'java',
    'typescript',
    'cpp',
    'c',
    'csharp',
    'ruby',
    'go',
    'rust',
    'php',
    'swift',
    'kotlin',
    'html',
    'css',
    'sql',
    'json',
    'xml',
    'markdown',
    'shell',
    'other',
  ];

  useEffect(() => {
    document.title = isEdit ? 'Edit Snippet | Rayulu M' : 'Create Snippet | Rayulu M';
  }, [isEdit]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (isEdit) {
      fetchSnippet();
    }
  }, [id, user]);

  const fetchSnippet = async () => {
    try {
      const response = await snippetsAPI.getById(id);
      const snippet = response.data;

      if (snippet.author._id !== user._id) {
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
      setError(err.response?.data?.message || 'Failed to load snippet');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleTagAdd = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData({
          ...formData,
          tags: [...formData.tags, tagInput.trim()],
        });
      }
      setTagInput('');
    }
  };

  const handleTagRemove = (tag) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    if (hasProfanity(formData.title)) {
      setError('Profanity detected in title. Please use appropriate language.');
      setSaving(false);
      return;
    }

    if (hasProfanity(formData.description)) {
      setError('Profanity detected in description. Please use appropriate language.');
      setSaving(false);
      return;
    }

    try {
      if (isEdit) {
        await snippetsAPI.update(id, formData);
      } else {
        await snippetsAPI.create(formData);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save snippet');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-custom-orangered"></div>
          <p className="mt-4 text-custom-grey">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-custom-black mb-6">
        {isEdit ? 'Edit Snippet' : 'Create New Snippet'}
      </h1>

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-custom-white rounded-lg shadow-md p-6 space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-custom-grey mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-custom-grey rounded-md focus:outline-none focus:ring-custom-orangered focus:border-custom-orangered text-custom-black dark:text-slate-100 bg-white dark:bg-slate-800"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-custom-grey mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-custom-grey rounded-md focus:outline-none focus:ring-custom-orangered focus:border-custom-orangered text-custom-black dark:text-slate-100 bg-white dark:bg-slate-800"
          />
        </div>

        <div>
          <label htmlFor="language" className="block text-sm font-medium text-custom-grey mb-2">
            Language *
          </label>
          <select
            id="language"
            name="language"
            required
            value={formData.language}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-custom-grey rounded-md focus:outline-none focus:ring-custom-orangered focus:border-custom-orangered capitalize text-custom-black dark:text-slate-100 bg-white dark:bg-slate-800"
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="code" className="block text-sm font-medium text-custom-grey mb-2">
            Code *
          </label>
          <textarea
            id="code"
            name="code"
            required
            rows="15"
            value={formData.code}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-custom-grey rounded-md focus:outline-none focus:ring-custom-orangered focus:border-custom-orangered font-mono text-custom-black dark:text-slate-100 bg-white dark:bg-slate-800"
          />
          {formData.code && (
            <>
              <div className="mt-4 rounded-lg overflow-hidden border border-custom-grey">
                <div className="bg-custom-cement px-4 py-2 text-sm font-medium text-custom-black">
                  Syntax Preview
                </div>
                <SyntaxHighlighter
                  language={formData.language}
                  style={oneDark}
                  customStyle={{ margin: 0, borderRadius: '0 0 0.5rem 0.5rem' }}
                  showLineNumbers={true}
                >
                  {formData.code}
                </SyntaxHighlighter>
              </div>
              <CodeExecutor code={formData.code} language={formData.language} />
            </>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-custom-grey mb-2">Tags</label>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={handleTagAdd}
            placeholder="Press Enter to add a tag"
            className="w-full px-3 py-2 border border-custom-grey rounded-md focus:outline-none focus:ring-custom-orangered focus:border-custom-orangered mb-2 text-custom-black dark:text-slate-100 bg-white dark:bg-slate-800"
          />
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 bg-custom-cement text-custom-black rounded-full text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleTagRemove(tag)}
                  className="ml-2 text-custom-orangered hover:text-orange-600"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-custom-grey">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublic"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleChange}
              className="h-5 w-5 text-custom-orangered focus:ring-custom-orangered border-custom-grey rounded cursor-pointer"
            />
            <label htmlFor="isPublic" className="ml-3 block text-sm font-medium text-custom-black dark:text-slate-200 cursor-pointer">
              {formData.isPublic ? 'Public' : 'Private'} - {formData.isPublic ? 'Visible to everyone' : 'Only visible to you'}
            </label>
          </div>
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
            formData.isPublic
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
          }`}>
            {formData.isPublic ? 'Public' : 'Private'}
          </span>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-2 border border-custom-grey rounded-md text-custom-grey hover:bg-custom-cement"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-custom-orangered text-custom-white rounded-md hover:bg-orange-600 disabled:opacity-50"
          >
            {saving ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SnippetEditor;
