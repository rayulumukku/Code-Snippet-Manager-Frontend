import { useState, useEffect } from 'react';
import { searchAPI } from '../services/api';
import SnippetCard from '../components/SnippetCard';

const Search = () => {
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('snippets');

  useEffect(() => {
    document.title = 'Search | Rayulu Mukku';
  }, []);

  const languages = [
    'javascript',
    'python',
    'java',
    'typescript',
    'cpp',
    'c',
    'csharp',
    'go',
    'rust',
    'php',
    'html',
    'css',
    'sql',
  ];

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const params = {
        q: query,
        type,
        language: language || undefined,
        tags: tags.length > 0 ? tags.join(',') : undefined,
      };

      const response = await searchAPI.search(params);
      setResults(response.data.results || []);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTagAdd = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleTagRemove = (tag) => {
    setTags(tags.filter((t) => t !== tag));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-custom-black dark:text-custom-dark-text mb-6">Search</h1>

      <form onSubmit={handleSearch} className="bg-custom-white dark:bg-custom-dark-card rounded-lg shadow-md p-6 mb-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-custom-black dark:text-custom-dark-text mb-2">
              Search Type
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-custom-orangered focus:border-custom-orangered bg-white dark:bg-slate-800 text-custom-black dark:text-slate-100"
            >
              <option value="snippets">Snippets</option>
              <option value="collections">Collections</option>
            </select>
          </div>

          <div>
            <label htmlFor="query" className="block text-sm font-medium text-custom-black dark:text-custom-dark-text mb-2">
              Search Query
            </label>
            <input
              type="text"
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for snippets..."
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-custom-orangered focus:border-custom-orangered bg-white dark:bg-slate-800 text-custom-black dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>

          {type === 'snippets' && (
            <>
              <div>
                <label
                  htmlFor="language"
                  className="block text-sm font-medium text-custom-black dark:text-custom-dark-text mb-2"
                >
                  Language
                </label>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-custom-orangered focus:border-custom-orangered capitalize bg-white dark:bg-slate-800 text-custom-black dark:text-slate-100"
                >
                  <option value="">All Languages</option>
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-custom-black dark:text-custom-dark-text mb-2">Tags</label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleTagAdd}
                  placeholder="Press Enter to add a tag"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-custom-orangered focus:border-custom-orangered mb-2 bg-white dark:bg-slate-800 text-custom-black dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                />
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-custom-orangered dark:text-orange-400 rounded-full text-sm border border-orange-200 dark:border-orange-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleTagRemove(tag)}
                        className="ml-2 text-custom-orangered dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-custom-orangered text-white px-4 py-2 rounded-md hover:bg-orange-600 disabled:opacity-50 transition-colors font-medium"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-custom-orangered"></div>
          <p className="mt-4 text-custom-grey dark:text-slate-300">Searching...</p>
        </div>
      ) : results.length === 0 && (query || language || tags.length > 0) ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-custom-grey dark:text-slate-300 text-lg">No results found</p>
          <p className="text-custom-grey dark:text-slate-400 text-sm mt-2">Try adjusting your search criteria</p>
        </div>
      ) : results.length > 0 ? (
        <div>
          <h2 className="text-2xl font-bold text-custom-black dark:text-custom-dark-text mb-4">
            Results ({results.length})
          </h2>
          {type === 'snippets' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((snippet) => (
                <SnippetCard key={snippet._id} snippet={snippet} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((collection) => (
                <div
                  key={collection._id}
                  className="bg-custom-white dark:bg-custom-dark-card rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-slate-200 dark:border-slate-700"
                >
                  <h3 className="text-xl font-semibold text-custom-black dark:text-custom-dark-text mb-2">
                    {collection.name}
                  </h3>
                  {collection.description && (
                    <p className="text-custom-grey dark:text-slate-400 mb-4">{collection.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-custom-grey dark:text-slate-400">
                      By {collection.owner?.username} • {collection.snippets?.length || 0} snippets
                    </span>
                    <span
                      className={`px-3 py-1 text-sm font-medium rounded-full ${
                        collection.isPublic
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {collection.isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default Search;
