import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { collectionsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import SnippetCard from '../components/SnippetCard';
import { FiEye, FiGitBranch, FiFolder, FiTrash2, FiAlertTriangle, FiArrowLeft } from 'react-icons/fi';

const CollectionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await collectionsAPI.delete(id);
      toast.success('Collection deleted');
      navigate('/collections');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete collection');
      setError(err.response?.data?.message || 'Failed to delete collection');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleRemoveSnippet = async (snippetId) => {
    try {
      await collectionsAPI.removeSnippet(id, snippetId);
      toast.success('Snippet removed from collection');
      setCollection(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          snippets: (prev.snippets || []).filter(s => (s._id || s) !== snippetId)
        };
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove snippet');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {/* Header skeleton */}
        <div className="bg-white dark:bg-custom-dark-card rounded-2xl p-6 mb-8 border border-slate-200 dark:border-custom-dark-border shadow-sm">
          <div className="h-8 w-1/3 bg-slate-200 dark:bg-custom-dark-surface rounded-xl animate-pulse mb-3" />
          <div className="h-4 w-2/3 bg-slate-100 dark:bg-custom-dark-surface/60 rounded-lg animate-pulse mb-4" />
          <div className="flex gap-4">
            <div className="h-4 w-24 bg-slate-100 dark:bg-custom-dark-surface/60 rounded animate-pulse" />
            <div className="h-4 w-24 bg-slate-100 dark:bg-custom-dark-surface/60 rounded animate-pulse" />
          </div>
        </div>

        {/* Snippets grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-64 rounded-2xl border border-slate-200 dark:border-custom-dark-border bg-slate-100 dark:bg-custom-dark-surface animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error && !collection) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-300 px-6 py-4 rounded-2xl flex items-center justify-between">
          <span>{error}</span>
          <Link to="/collections" className="btn-secondary text-xs">
            Back to Collections
          </Link>
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
  const validSnippets = (collection.snippets || []).filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Back button */}
      <Link
        to="/collections"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 mb-4 transition-colors"
      >
        <FiArrowLeft className="w-4 h-4" /> Back to Collections
      </Link>

      {/* Collection Header card */}
      <div className="bg-white dark:bg-custom-dark-card rounded-2xl shadow-sm p-6 mb-8 border border-slate-200 dark:border-custom-dark-border">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <FiFolder className="w-6 h-6 text-custom-orangered shrink-0" />
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
                {collection.name}
              </h1>
            </div>
            {collection.description && (
              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base mb-4 leading-relaxed">
                {collection.description}
              </p>
            )}
            <div className="flex items-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex-wrap gap-x-3 gap-y-1">
              <span>By <strong className="text-slate-700 dark:text-slate-200">{collection.owner?.username || 'Unknown'}</strong></span>
              <span>•</span>
              <span>{validSnippets.length} {validSnippets.length === 1 ? 'snippet' : 'snippets'}</span>
              {stats.totalViews > 0 && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <FiEye className="w-4 h-4" />
                    {stats.totalViews} views
                  </span>
                </>
              )}
              {stats.totalForks > 0 && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <FiGitBranch className="w-4 h-4" />
                    {stats.totalForks} forks
                  </span>
                </>
              )}
            </div>

            {Object.keys(stats.languages).length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-custom-dark-border/60">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Languages:</div>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(stats.languages)
                    .sort((a, b) => b[1] - a[1])
                    .map(([lang, count]) => (
                      <span
                        key={lang}
                        className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 dark:bg-custom-dark-surface text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-custom-dark-border capitalize"
                      >
                        {lang} ({count})
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 self-start shrink-0">
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full ${
                collection.isPublic
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {collection.isPublic ? 'Public' : 'Private'}
            </span>
            {isOwner && (
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="px-3.5 py-1.5 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <FiTrash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Snippet Grid or Empty State */}
      {validSnippets.length > 0 ? (
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Snippets ({validSnippets.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
            {validSnippets.map((snippet) => (
              <div key={snippet._id} className="flex flex-col">
                <div className="flex-1">
                  <SnippetCard snippet={snippet} />
                </div>
                {/* Non-overlapping clean action bar underneath card */}
                {isOwner && (
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveSnippet(snippet._id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-900/40 rounded-xl transition-colors"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                      Remove from Collection
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-custom-dark-card rounded-3xl shadow-sm border border-slate-200 dark:border-custom-dark-border">
          <div className="flex justify-center mb-4">
            <FiFolder className="w-16 h-16 text-slate-300 dark:text-slate-600" />
          </div>
          <p className="text-slate-800 dark:text-slate-200 font-semibold text-lg mb-1">This collection is empty</p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mb-6">
            Add snippets to this collection from any snippet card to organize your code
          </p>
          <Link to="/" className="btn-primary text-xs">
            Browse Snippets
          </Link>
        </div>
      )}

      {/* Delete Collection In-App Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="bg-white dark:bg-custom-dark-card border border-slate-200 dark:border-custom-dark-border rounded-3xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4 text-red-600 dark:text-red-400">
              <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center shrink-0">
                <FiAlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Delete Collection?
              </h3>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm mb-6 leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-800 dark:text-slate-100">{collection.name}</strong>? This action cannot be undone. Snippets inside this collection will not be deleted.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="btn-secondary text-sm px-4 py-2"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Collection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionDetail;
