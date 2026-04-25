import { Link, useNavigate } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useAuth } from '../context/AuthContext';
import { snippetsAPI, collectionsAPI } from '../services/api';
import { useState, useEffect } from 'react';
import { FaEye, FaCodeBranch, FaUser, FaTrash, FaLock, FaUnlock, FaPlus, FaCopy, FaCheck } from 'react-icons/fa';

const SnippetCard = ({ snippet }) => {
  const codePreview = snippet.code ? snippet.code.substring(0, 100) : '';
  const { user } = useAuth();
  const navigate = useNavigate();
  const [forking, setForking] = useState(false);
  const [forkUsers, setForkUsers] = useState([]);
  const [showForkTooltip, setShowForkTooltip] = useState(false);
  const [loadingForks, setLoadingForks] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showViewsTooltip, setShowViewsTooltip] = useState(false);
  const [eyeAnimation, setEyeAnimation] = useState(false);
  const [showAddToCollection, setShowAddToCollection] = useState(false);
  const [userCollections, setUserCollections] = useState([]);
  const [addingToCollection, setAddingToCollection] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const isOwner = user && snippet.author?._id === user._id;

  const handleCopy = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(snippet.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  useEffect(() => {
    if (showAddToCollection && user) {
      loadUserCollections();
    }
  }, [showAddToCollection, user]);

  const loadUserCollections = async () => {
    try {
      const response = await collectionsAPI.getAll();
      setUserCollections(response.data.filter(c => c.owner?._id === user?._id));
    } catch (err) {
      console.error('Error loading collections:', err);
    }
  };

  const handleAddToCollection = async (collectionId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setAddingToCollection(true);
    try {
      await collectionsAPI.addSnippet(collectionId, snippet._id);
      setShowAddToCollection(false);
      // Show success message
      const successMsg = document.createElement('div');
      successMsg.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg z-50';
      successMsg.textContent = 'Added to collection!';
      document.body.appendChild(successMsg);
      setTimeout(() => successMsg.remove(), 2000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add to collection');
    } finally {
      setAddingToCollection(false);
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this snippet?')) return;
    
    setDeleting(true);
    try {
      await snippetsAPI.delete(snippet._id);
      window.location.reload(); // Reload to refresh the list
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete snippet');
    } finally {
      setDeleting(false);
    }
  };

  const handleTogglePublic = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setUpdating(true);
    try {
      await snippetsAPI.update(snippet._id, { isPublic: !snippet.isPublic });
      window.location.reload(); // Reload to refresh the list
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update snippet');
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    if (snippet.forkCount > 0 && showForkTooltip) {
      loadForkUsers();
    }
  }, [showForkTooltip, snippet._id, snippet.forkCount]);

  const loadForkUsers = async () => {
    if (forkUsers.length > 0) return; // Already loaded
    
    setLoadingForks(true);
    try {
      const response = await snippetsAPI.getForks(snippet._id);
      setForkUsers(response.data.forks || []);
    } catch (err) {
      console.error('Error loading forks:', err);
    } finally {
      setLoadingForks(false);
    }
  };
  
  const handleFork = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (isOwner || !snippet.isPublic) {
      return;
    }
    
    setForking(true);
    try {
      const response = await snippetsAPI.fork(snippet._id);
      navigate(`/snippets/${response.data._id}/edit`);
    } catch (err) {
      console.error('Fork error:', err);
      alert(err.response?.data?.message || 'Failed to fork snippet');
    } finally {
      setForking(false);
    }
  };

  return (
    <div className="group bg-white dark:bg-custom-dark-card border border-slate-200 dark:border-white/10 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden relative">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <Link to={`/snippets/${snippet._id}`} className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 group-hover:text-custom-orangered">
              {snippet.title}
            </h3>
          </Link>
          <div className="flex items-center gap-2 ml-2">
            {isOwner && (
              <div className="flex gap-1">
                <button
                  onClick={handleTogglePublic}
                  disabled={updating}
                  className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 disabled:opacity-50"
                  title={snippet.isPublic ? 'Make Private' : 'Make Public'}
                >
                  {snippet.isPublic ? <FaUnlock className="w-4 h-4" /> : <FaLock className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="p-1.5 rounded-md bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 disabled:opacity-50"
                  title="Delete Snippet"
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              </div>
            )}
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize">
              {snippet.language}
            </span>
          </div>
        </div>

        {snippet.description && (
          <p className="text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">{snippet.description}</p>
        )}

        <div className="mb-4 rounded-md overflow-hidden ring-1 ring-slate-900/5 dark:ring-white/5 relative group">
          <SyntaxHighlighter
            language={snippet.language}
            style={oneDark}
            customStyle={{ margin: 0, borderRadius: '0.375rem', fontSize: '0.875rem' }}
            showLineNumbers={false}
          >
            {codePreview}
          </SyntaxHighlighter>
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-2 bg-slate-800/80 hover:bg-slate-700/90 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
            title="Copy code"
          >
            {copied ? <FaCheck className="w-4 h-4" /> : <FaCopy className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <span className="inline-flex items-center gap-1">
              <FaUser className="w-4 h-4" />
              {snippet.author?.username || 'Unknown'}
            </span>
            {snippet.views > 0 && (
              <div 
                className="relative inline-flex items-center gap-1 cursor-help"
                onMouseEnter={() => {
                  setShowViewsTooltip(true);
                  setEyeAnimation(true);
                  setTimeout(() => setEyeAnimation(false), 500);
                }}
                onMouseLeave={() => setShowViewsTooltip(false)}
              >
                <span className="inline-flex items-center gap-1">
                  <FaEye className={`w-4 h-4 ${eyeAnimation ? 'animate-pulse' : ''}`} />
                  {snippet.views}
                </span>
                {showViewsTooltip && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-56 bg-custom-white dark:bg-custom-dark-card text-custom-black dark:text-custom-dark-text text-xs rounded-lg shadow-xl p-4 z-50 border-2 border-custom-orangered/30 dark:border-custom-orangered/50">
                    <div className="font-bold text-sm mb-2 text-custom-orangered">
                      {snippet.views} {snippet.views === 1 ? 'view' : 'views'}
                    </div>
                    <div className="space-y-1 text-custom-grey dark:text-slate-300">
                      {snippet.views < 10 && (
                        <div>New snippet! Keep sharing!</div>
                      )}
                      {snippet.views >= 10 && snippet.views < 50 && (
                        <div>Getting popular! People are watching!</div>
                      )}
                      {snippet.views >= 50 && snippet.views < 100 && (
                        <div>Hot snippet! Trending now!</div>
                      )}
                      {snippet.views >= 100 && snippet.views < 500 && (
                        <div>Popular! Over 100 views!</div>
                      )}
                      {snippet.views >= 500 && (
                        <div>Viral! This is amazing!</div>
                      )}
                      <div className="text-xs mt-2 pt-2 border-t border-custom-grey/30 dark:border-slate-600">
                        {snippet.views} people found this useful
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                      <div className="border-4 border-transparent border-t-custom-white dark:border-t-custom-dark-card"></div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {snippet.forkCount > 0 && (
              <div 
                className="relative inline-flex items-center gap-1"
                onMouseEnter={() => setShowForkTooltip(true)}
                onMouseLeave={() => setShowForkTooltip(false)}
              >
                <span className="inline-flex items-center gap-1 cursor-help">
                  <FaCodeBranch className="w-4 h-4" />
                  {snippet.forkCount}
                </span>
                {showForkTooltip && (
                  <div className="absolute bottom-full left-0 mb-2 w-64 bg-slate-900 text-white text-xs rounded-lg shadow-lg p-3 z-50 border border-slate-700">
                    <div className="font-semibold mb-2 text-sm">Forked by:</div>
                    {loadingForks ? (
                      <div className="text-slate-400">Loading...</div>
                    ) : forkUsers.length > 0 ? (
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {forkUsers.slice(0, 10).map((fork, idx) => (
                          <div key={idx} className="text-slate-300">
                            • {fork.username}
                            <span className="text-slate-500 text-xs ml-2">
                              {new Date(fork.forkedAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                        {forkUsers.length > 10 && (
                          <div className="text-slate-400 text-xs pt-1">
                            +{forkUsers.length - 10} more
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-slate-400">No forks yet</div>
                    )}
                    <div className="absolute bottom-0 left-4 transform translate-y-full">
                      <div className="border-4 border-transparent border-t-slate-900"></div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {snippet.forkedFrom && (
              <span className="text-custom-orangered">Forked</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {snippet.isPublic ? (
              <span className="text-xs sm:text-sm text-emerald-600">Public</span>
            ) : (
              <span className="text-xs sm:text-sm text-slate-500">Private</span>
            )}
            {!isOwner && snippet.isPublic && user && (
              <button
                onClick={handleFork}
                disabled={forking}
                className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                title="Fork this snippet"
              >
                <FaCodeBranch className="w-4 h-4" />
                {forking ? 'Forking...' : 'Fork'}
              </button>
            )}
            {!isOwner && snippet.isPublic && !user && (
              <Link
                to="/login"
                onClick={(e) => e.stopPropagation()}
                className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
                title="Login to fork"
              >
                <FaCodeBranch className="w-4 h-4" />
                Fork
              </Link>
            )}
            {user && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowAddToCollection(true);
                }}
                className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
                title="Add to Collection"
              >
                <FaPlus className="w-4 h-4" />
                Add
              </button>
            )}
          </div>
        </div>
        {showAddToCollection && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" 
            onClick={() => setShowAddToCollection(false)}
          >
            <div 
              className="bg-custom-white dark:bg-custom-dark-card rounded-lg p-6 max-w-md w-full mx-4 shadow-xl" 
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-custom-black dark:text-custom-dark-text mb-4">Add to Collection</h2>
              {userCollections.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">📁</div>
                  <p className="text-custom-grey dark:text-slate-300 mb-4">You don't have any collections yet.</p>
                  <Link
                    to="/collections"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAddToCollection(false);
                    }}
                    className="px-4 py-2 bg-custom-orangered text-white rounded-md hover:bg-orange-600 text-sm font-medium inline-block"
                  >
                    Create Collection
                  </Link>
                </div>
              ) : (() => {
       
                const matchingCollections = userCollections.filter(collection => 
                  snippet.isPublic || !collection.isPublic
                );
                
                if (matchingCollections.length === 0) {
                  return (
                    <div className="text-center py-8">
                      <div className="text-5xl mb-4">📁</div>
                      <p className="text-custom-grey dark:text-slate-300 mb-2">
                        No {snippet.isPublic ? 'public' : 'private'} collections available
                      </p>
                      <p className="text-custom-grey dark:text-slate-400 text-sm mb-4">
                      {snippet.isPublic 
                        ? 'Create a collection to add this public snippet'
                        : 'Create a private collection to add this private snippet'}
                    </p>
                    <Link
                      to="/collections"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAddToCollection(false);
                      }}
                      className="px-4 py-2 bg-custom-orangered text-white rounded-md hover:bg-orange-600 text-sm font-medium inline-block"
                    >
                      Create {snippet.isPublic ? 'Collection' : 'Private Collection'}
                    </Link>
                    </div>
                  );
                }
                
                return (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {matchingCollections.map((collection) => {
                      const isInCollection = collection.snippets?.some(s => {
                        const snippetId = typeof s === 'object' ? s._id : s;
                        return snippetId === snippet._id;
                      });
                      return (
                        <button
                          key={collection._id}
                          onClick={(e) => !isInCollection && handleAddToCollection(collection._id, e)}
                          disabled={isInCollection || addingToCollection}
                          className={`w-full text-left p-3 rounded-md border transition ${
                            isInCollection
                              ? 'bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 cursor-not-allowed'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-custom-orangered hover:bg-orange-50 dark:hover:bg-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-custom-black dark:text-custom-dark-text">{collection.name}</div>
                              {collection.description && (
                                <div className="text-sm text-custom-grey dark:text-slate-400 mt-1">{collection.description}</div>
                              )}
                              <div className="text-xs text-custom-grey dark:text-slate-500 mt-1">
                                {collection.snippets?.length || 0} snippets
                              </div>
                            </div>
                            {isInCollection && (
                              <span className="text-green-600 dark:text-green-400 text-sm">✓ Added</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })()}
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setShowAddToCollection(false)}
                  className="px-4 py-2 border border-custom-grey rounded-md text-custom-grey dark:text-slate-300 hover:bg-custom-cement dark:hover:bg-slate-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {snippet.tags && snippet.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {snippet.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SnippetCard;
