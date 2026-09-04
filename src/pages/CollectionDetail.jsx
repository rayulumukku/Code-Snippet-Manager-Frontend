import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { collectionsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SnippetCard from '../components/SnippetCard';
import { FaEye, FaCodeBranch, FaFolderOpen, FaTrash } from 'react-icons/fa';

const CollectionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (collection) {
      document.title = `${collection.name} | Code Snippet Manager`;
    } else {
      document.title = 'Collection | Code Snippet Manager';
    }
  }, [collection]);

  const fetchCollection = useCallback(async () => {
    try {
      const response = await collectionsAPI.getById(id);
      setCollection(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load collection');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCollection();
  }, [fetchCollection]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this collection?')) return;

    try {
      await collectionsAPI.delete(id);
      navigate('/collections');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete collection');
    }
  };

  const handleRemoveSnippet = async (snippetId) => {
    try {
      await collectionsAPI.removeSnippet(id, snippetId);
      fetchCollection();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove snippet');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-custom-orangered"></div>
          <p className="mt-4 text-custom-grey dark:text-slate-300">Loading collection...</p>
        </div>
      </div>
    );
  }

  if (error && !collection) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!collection) return null;

  const isOwner = user && collection.owner && (collection.owner._id || collection.owner).toString() === user._id?.toString();


  const getCollectionStats = () => {
    const validSnippets = (collection.snippets || []).filter(Boolean);
    if (validSnippets.length === 0) {
      return { languages: {}, totalViews: 0, totalForks: 0 };
    }

    const languages = {};
    let totalViews = 0;
    let totalForks = 0;

    validSnippets.forEach((snippet) => {
      if (snippet.language) {
        languages[snippet.language] = (languages[snippet.language] || 0) + 1;
      }
      totalViews += snippet.views || 0;
      totalForks += snippet.forkCount || 0;
    });

    return { languages, totalViews, totalForks };
  };

  const stats = getCollectionStats();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {error && (
        <div className="mb-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-custom-white dark:bg-custom-dark-card rounded-lg shadow-md p-6 mb-6 border border-slate-200 dark:border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-custom-black dark:text-custom-dark-text mb-2">{collection.name}</h1>
            {collection.description && (
              <p className="text-custom-grey dark:text-slate-300 mb-4">{collection.description}</p>
            )}
            <div className="flex items-center space-x-4 text-sm text-custom-grey dark:text-slate-300 flex-wrap gap-2">
              <span>By {collection.owner?.username || 'Unknown'}</span>
              <span>•</span>
              <span>{collection.snippets?.length || 0} snippets</span>
              {stats.totalViews > 0 && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <FaEye className="w-4 h-4" />
                    {stats.totalViews} total views
                  </span>
                </>
              )}
              {stats.totalForks > 0 && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <FaCodeBranch className="w-4 h-4" />
                    {stats.totalForks} total forks
                  </span>
                </>
              )}
            </div>
            {Object.keys(stats.languages).length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-medium text-custom-grey dark:text-slate-300 mb-2">Languages:</div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(stats.languages)
                    .sort((a, b) => b[1] - a[1])
                    .map(([lang, count]) => (
                      <span
                        key={lang}
                        className="px-3 py-1 text-xs font-medium rounded-full bg-custom-cement dark:bg-slate-700 text-custom-black dark:text-slate-200 capitalize"
                      >
                        {lang} ({count})
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full ${
                collection.isPublic
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
              }`}
            >
              {collection.isPublic ? 'Public' : 'Private'}
            </span>
            {isOwner && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium flex items-center gap-2"
              >
                <FaTrash className="w-4 h-4" />
                Delete Collection
              </button>
            )}
          </div>
        </div>
      </div>

      {collection.snippets && collection.snippets.filter(Boolean).length > 0 ? (
        <div>
          <h2 className="text-2xl font-bold text-custom-black dark:text-custom-dark-text mb-4">Snippets ({collection.snippets.filter(Boolean).length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collection.snippets.filter(Boolean).map((snippet) => (
              <div key={snippet._id} className="relative">
                <SnippetCard snippet={snippet} />
                {isOwner && (
                  <button
                    onClick={() => handleRemoveSnippet(snippet._id)}
                    className="absolute top-4 right-4 bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-custom-white dark:bg-custom-dark-card rounded-lg shadow-md border border-slate-200 dark:border-white/10">
          <div className="flex justify-center mb-4">
            <FaFolderOpen className="w-16 h-16 text-custom-grey dark:text-slate-400" />
          </div>
          <p className="text-custom-grey dark:text-slate-300 text-lg mb-2">This collection is empty</p>
          <p className="text-custom-grey dark:text-slate-400 text-sm">
            Add snippets to this collection to organize your code
          </p>
        </div>
      )}
    </div>
  );
};

export default CollectionDetail;
