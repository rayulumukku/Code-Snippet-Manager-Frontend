import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collectionsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { hasProfanity } from '../utils/profanityFilter';
import { FiFolder, FiPlus, FiSearch, FiTrash2, FiAlertTriangle, FiX } from 'react-icons/fi';

const Collections = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [filteredCollections, setFilteredCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newCollection, setNewCollection] = useState({ name: '', description: '', isPublic: false });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPublic, setFilterPublic] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    document.title = 'Collections | Code Snippet Manager';
  }, []);

  const fetchCollections = useCallback(async () => {
    try {
      const response = await collectionsAPI.getAll();
      setCollections(response.data || []);
      setFilteredCollections(response.data || []);
    } catch (error) {
      toast.error('Failed to load collections');
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCollections();
  }, [user, navigate, fetchCollections]);

  useEffect(() => {
    let filtered = collections;

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (collection) =>
          collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          collection.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterPublic === 'public') {
      filtered = filtered.filter((collection) => collection.isPublic);
    } else if (filterPublic === 'private') {
      filtered = filtered.filter((collection) => !collection.isPublic);
    }

    setFilteredCollections(filtered);
  }, [searchQuery, filterPublic, collections]);

  const handleCreate = async (e) => {
    e.preventDefault();

    if (hasProfanity(newCollection.name) || hasProfanity(newCollection.description)) {
      toast.error('Profanity detected in name or description. Please use appropriate language.');
      return;
    }

    try {
      await collectionsAPI.create(newCollection);
      toast.success('Collection created successfully!');
      setShowModal(false);
      setNewCollection({ name: '', description: '', isPublic: false });
      fetchCollections();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create collection');
      console.error('Error creating collection:', error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      await collectionsAPI.delete(deleteTarget._id);
      toast.success('Collection deleted successfully');
      setDeleteTarget(null);
      fetchCollections();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete collection');
      console.error('Error deleting collection:', error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Collections
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm sm:text-base">
            Organize your code snippets into folders for easy access and sharing
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="btn-primary self-start sm:self-center shrink-0 flex items-center gap-2 px-4 py-2.5"
        >
          <FiPlus className="w-4 h-4" />
          Create Collection
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <FiSearch className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search collections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-custom-dark-surface/50 border border-slate-200 dark:border-custom-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-custom-orangered/30 focus:border-custom-orangered text-slate-900 dark:text-white transition-all text-sm placeholder-slate-400"
          />
        </div>
        <div className="flex items-center gap-1.5 self-start sm:self-center">
          {['all', 'public', 'private'].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilterPublic(f)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                filterPublic === f
                  ? 'gradient-bg text-white shadow-sm'
                  : 'border border-slate-200 dark:border-custom-dark-border bg-white dark:bg-custom-dark-card text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-custom-dark-surface'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-48 rounded-2xl border border-slate-200 dark:border-custom-dark-border bg-slate-100 dark:bg-custom-dark-surface animate-pulse"
            />
          ))}
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-custom-dark-card rounded-3xl shadow-sm border border-slate-200 dark:border-custom-dark-border">
          <div className="flex justify-center text-slate-300 dark:text-slate-600 mb-4">
            <FiFolder className="text-6xl" />
          </div>
          <p className="text-slate-800 dark:text-slate-200 text-lg font-semibold mb-1">No collections yet</p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mb-6 max-w-sm mx-auto">
            Create collections to organize your code snippets into folders and categories.
          </p>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="btn-primary text-xs px-5 py-2.5"
          >
            Create Your First Collection
          </button>
        </div>
      ) : filteredCollections.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-custom-dark-card rounded-3xl shadow-sm border border-slate-200 dark:border-custom-dark-border">
          <p className="text-slate-700 dark:text-slate-300 text-base font-medium">No collections match your search</p>
          <button
            type="button"
            onClick={() => { setSearchQuery(''); setFilterPublic('all'); }}
            className="btn-secondary text-xs mt-3 px-4 py-2"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {filteredCollections.map((collection) => {
            const validSnippets = (collection.snippets || []).filter(Boolean);
            const snippetCount = validSnippets.length;
            const isOwner = Boolean(user && (collection.owner?._id || collection.owner)?.toString() === user._id?.toString());

            return (
              <div
                key={collection._id}
                className="group bg-white dark:bg-custom-dark-card rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-slate-200 dark:border-custom-dark-border p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FiFolder className="w-5 h-5 text-custom-orangered shrink-0" />
                    <Link to={`/collections/${collection._id}`} className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-custom-orangered transition-colors truncate">
                        {collection.name}
                      </h3>
                    </Link>
                  </div>
                  {collection.description && (
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-2 leading-relaxed">
                      {collection.description}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-custom-dark-border/60 flex items-center justify-between gap-2 mt-auto">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {snippetCount} {snippetCount === 1 ? 'snippet' : 'snippets'}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[11px] font-semibold rounded-full ${
                        collection.isPublic
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {collection.isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>

                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(collection)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xs font-semibold flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                      title="Delete Collection"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Collection In-App Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white dark:bg-custom-dark-card border border-slate-200 dark:border-custom-dark-border rounded-3xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create Collection</h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. React Custom Hooks"
                  value={newCollection.name}
                  onChange={(e) =>
                    setNewCollection({ ...newCollection, name: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-custom-dark-surface/50 border border-slate-200 dark:border-custom-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-custom-orangered/30 focus:border-custom-orangered text-slate-900 dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  Description
                </label>
                <textarea
                  value={newCollection.description}
                  onChange={(e) =>
                    setNewCollection({ ...newCollection, description: e.target.value })
                  }
                  placeholder="What code snippets will live in this collection?"
                  rows="3"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-custom-dark-surface/50 border border-slate-200 dark:border-custom-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-custom-orangered/30 focus:border-custom-orangered text-slate-900 dark:text-white text-sm"
                />
              </div>
              <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-custom-dark-surface/50 rounded-xl border border-slate-200 dark:border-custom-dark-border">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={newCollection.isPublic}
                    onChange={(e) =>
                      setNewCollection({ ...newCollection, isPublic: e.target.checked })
                    }
                    className="h-4 w-4 text-custom-orangered focus:ring-custom-orangered rounded cursor-pointer"
                  />
                  <label htmlFor="isPublic" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    {newCollection.isPublic ? 'Public collection' : 'Private collection'}
                  </label>
                </div>
                <span
                  className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                    newCollection.isPublic
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {newCollection.isPublic ? 'Public' : 'Private'}
                </span>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary text-xs px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs px-5 py-2"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Collection Confirmation Modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setDeleteTarget(null)}
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
              Are you sure you want to delete <strong className="text-slate-800 dark:text-slate-100">{deleteTarget.name}</strong>? This cannot be undone. Snippets inside will remain safe.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
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

export default Collections;
