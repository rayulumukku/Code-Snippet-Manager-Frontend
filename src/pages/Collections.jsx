import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collectionsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { hasProfanity } from '../utils/profanityFilter';

const Collections = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [filteredCollections, setFilteredCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newCollection, setNewCollection] = useState({ name: '', description: '', isPublic: false });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPublic, setFilterPublic] = useState('all'); 

  useEffect(() => {
    document.title = 'Collections | Rayulu Mukku';
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCollections();
  }, [user]);

  const fetchCollections = async () => {
    try {
      const response = await collectionsAPI.getAll();
      setCollections(response.data);
      setFilteredCollections(response.data);
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
    }
  };

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
      alert('Profanity detected in name or description. Please use appropriate language.');
      return;
    }

    try {
      await collectionsAPI.create(newCollection);
      setShowModal(false);
      setNewCollection({ name: '', description: '', isPublic: false });
      fetchCollections();
    } catch (error) {
      console.error('Error creating collection:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this collection?')) return;

    try {
      await collectionsAPI.delete(id);
      fetchCollections();
    } catch (error) {
      console.error('Error deleting collection:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-custom-orangered"></div>
          <p className="mt-4 text-custom-grey dark:text-slate-300">Loading collections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-custom-black dark:text-custom-dark-text">Collections</h1>
          <p className="text-custom-grey dark:text-slate-400 mt-1">
            Organize your code snippets into folders for easy access
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-custom-orangered text-white px-4 py-2 rounded-md hover:bg-orange-600 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Collection
        </button>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search collections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-custom-grey rounded-md focus:outline-none focus:ring-custom-orangered focus:border-custom-orangered text-custom-black dark:text-custom-dark-text bg-white dark:bg-slate-800"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterPublic('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filterPublic === 'all'
                ? 'bg-custom-orangered text-white'
                : 'bg-custom-cement dark:bg-slate-700 text-custom-black dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterPublic('public')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filterPublic === 'public'
                ? 'bg-custom-orangered text-white'
                : 'bg-custom-cement dark:bg-slate-700 text-custom-black dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            Public
          </button>
          <button
            onClick={() => setFilterPublic('private')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filterPublic === 'private'
                ? 'bg-custom-orangered text-white'
                : 'bg-custom-cement dark:bg-slate-700 text-custom-black dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            Private
          </button>
        </div>
      </div>

      {collections.length === 0 ? (
        <div className="text-center py-12 bg-custom-white dark:bg-custom-dark-card rounded-lg shadow-md">
          <div className="text-6xl mb-4">📁</div>
          <p className="text-custom-grey dark:text-slate-300 text-lg mb-2">No collections yet</p>
          <p className="text-custom-grey dark:text-slate-400 text-sm mb-4">
            Create collections to organize your code snippets into folders
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-custom-orangered text-white px-4 py-2 rounded-md hover:bg-orange-600"
          >
            Create Your First Collection
          </button>
        </div>
      ) : filteredCollections.length === 0 ? (
        <div className="text-center py-12 bg-custom-white dark:bg-custom-dark-card rounded-lg shadow-md">
          <p className="text-custom-grey dark:text-slate-300 text-lg">No collections match your search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCollections.map((collection) => {
          
            const snippetCount = collection.snippets?.length || 0;
            const languages = collection.snippets?.reduce((acc, snippet) => {
              const lang = typeof snippet === 'object' ? snippet.language : null;
              if (lang) acc[lang] = (acc[lang] || 0) + 1;
              return acc;
            }, {}) || {};
            const languageCount = Object.keys(languages).length;

            return (
              <div
                key={collection._id}
                className="bg-custom-white dark:bg-custom-dark-card rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-slate-200 dark:border-white/10"
              >
                <Link to={`/collections/${collection._id}`}>
                  <h3 className="text-xl font-semibold text-custom-black dark:text-custom-dark-text mb-2 hover:text-custom-orangered">
                    {collection.name}
                  </h3>
                </Link>
                {collection.description && (
                  <p className="text-custom-grey dark:text-slate-300 mb-4 line-clamp-2">{collection.description}</p>
                )}
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div className="flex items-center gap-3 text-sm text-custom-grey dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {snippetCount} {snippetCount === 1 ? 'snippet' : 'snippets'}
                    </span>
                    {languageCount > 0 && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {languageCount} {languageCount === 1 ? 'language' : 'languages'}
                      </span>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      collection.isPublic
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                    }`}
                  >
                    {collection.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>
                {collection.owner?._id === user?._id && (
                  <button
                    onClick={() => handleDelete(collection._id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-custom-white dark:bg-custom-dark-card rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-custom-black dark:text-custom-dark-text mb-4">Create Collection</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-custom-grey dark:text-slate-300 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCollection.name}
                  onChange={(e) =>
                    setNewCollection({ ...newCollection, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-custom-grey rounded-md focus:outline-none focus:ring-custom-orangered focus:border-custom-orangered text-custom-black dark:text-custom-dark-text bg-white dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-custom-grey dark:text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newCollection.description}
                  onChange={(e) =>
                    setNewCollection({ ...newCollection, description: e.target.value })
                  }
                  rows="3"
                  className="w-full px-3 py-2 border border-custom-grey rounded-md focus:outline-none focus:ring-custom-orangered focus:border-custom-orangered text-custom-black dark:text-custom-dark-text bg-white dark:bg-slate-800"
                />
              </div>
              <div className="flex items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-custom-grey">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={newCollection.isPublic}
                  onChange={(e) =>
                    setNewCollection({ ...newCollection, isPublic: e.target.checked })
                  }
                  className="h-5 w-5 text-custom-orangered focus:ring-custom-orangered border-custom-grey rounded cursor-pointer"
                />
                <label htmlFor="isPublic" className="ml-3 block text-sm text-custom-black dark:text-custom-dark-text cursor-pointer">
                  {newCollection.isPublic ? 'Public' : 'Private'} - {newCollection.isPublic ? 'Visible to everyone' : 'Only visible to you'}
                </label>
                <span className={`ml-auto px-3 py-1 text-xs font-medium rounded-full ${
                  newCollection.isPublic
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                }`}>
                  {newCollection.isPublic ? 'Public' : 'Private'}
                </span>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-custom-grey rounded-md text-custom-grey dark:text-slate-300 hover:bg-custom-cement dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-custom-orangered text-white rounded-md hover:bg-orange-600"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Collections;
