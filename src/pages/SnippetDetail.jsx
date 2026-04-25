import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { snippetsAPI, collectionsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CodeExecutor from '../components/CodeExecutor';
import { FaEye, FaEdit, FaTrash, FaPlus, FaCopy, FaCheck } from 'react-icons/fa';

const SnippetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [snippet, setSnippet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [forking, setForking] = useState(false);
  const [forkUsers, setForkUsers] = useState([]);
  const [showForkTooltip, setShowForkTooltip] = useState(false);
  const [loadingForks, setLoadingForks] = useState(false);
  const [showViewsTooltip, setShowViewsTooltip] = useState(false);
  const [eyeAnimation, setEyeAnimation] = useState(false);
  const [showAddToCollection, setShowAddToCollection] = useState(false);
  const [userCollections, setUserCollections] = useState([]);
  const [addingToCollection, setAddingToCollection] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (snippet) {
      document.title = `${snippet.title} | Rayulu M`;
    } else {
      document.title = 'Snippet | Rayulu M';
    }
  }, [snippet]);

  useEffect(() => {
    fetchSnippet();
  }, [id]);

  useEffect(() => {
    if (snippet?.forkCount > 0 && showForkTooltip) {
      loadForkUsers();
    }
  }, [showForkTooltip, snippet?._id, snippet?.forkCount]);

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

  const handleAddToCollection = async (collectionId) => {
    setAddingToCollection(true);
    try {
      await collectionsAPI.addSnippet(collectionId, id);
      setShowAddToCollection(false);
      alert('Snippet added to collection!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add to collection');
    } finally {
      setAddingToCollection(false);
    }
  };

  const loadForkUsers = async () => {
    if (forkUsers.length > 0 || !snippet?._id) return;
    
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

  const fetchSnippet = async () => {
    try {
      const response = await snippetsAPI.getById(id);
      setSnippet(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load snippet');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this snippet?')) return;

    try {
      await snippetsAPI.delete(id);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete snippet');
    }
  };

  const handleFork = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setForking(true);
    try {
      const response = await snippetsAPI.fork(id);
      navigate(`/snippets/${response.data._id}/edit`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fork snippet');
    } finally {
      setForking(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-custom-orangered"></div>
          <p className="mt-4 text-custom-grey">Loading snippet...</p>
        </div>
      </div>
    );
  }

  if (error && !snippet) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!snippet) return null;

  const isOwner = user && snippet.author._id === user._id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-custom-white rounded-lg shadow-md p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-custom-black mb-2">{snippet.title}</h1>
            <div className="flex items-center space-x-4 text-sm text-custom-grey mb-4">
              <span>By {snippet.author?.username || 'Unknown'}</span>
              <span>•</span>
              <div 
                className="relative inline-block cursor-help"
                onMouseEnter={() => {
                  setShowViewsTooltip(true);
                  setEyeAnimation(true);
                  setTimeout(() => setEyeAnimation(false), 500);
                }}
                onMouseLeave={() => setShowViewsTooltip(false)}
              >
                <span className="inline-flex items-center gap-1">
                  <FaEye className={`w-4 h-4 ${eyeAnimation ? 'animate-pulse' : ''}`} />
                  {snippet.views} views
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
              {snippet.forkCount > 0 && (
                <>
                  <span>•</span>
                  <div 
                    className="relative inline-block cursor-help"
                    onMouseEnter={() => setShowForkTooltip(true)}
                    onMouseLeave={() => setShowForkTooltip(false)}
                  >
                    <span>{snippet.forkCount} forks</span>
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
                </>
              )}
              {snippet.forkedFrom && (
                <>
                  <span>•</span>
                  <Link
                    to={`/snippets/${snippet.forkedFrom._id}`}
                    className="text-custom-orangered hover:underline"
                  >
                    Forked from {snippet.forkedFrom.title}
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full ${
                snippet.isPublic
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {snippet.isPublic ? 'Public' : 'Private'}
            </span>
            <span className="px-3 py-1 text-sm font-medium rounded-full bg-custom-cement text-custom-black capitalize">
              {snippet.language}
            </span>
          </div>
        </div>

        {snippet.description && (
          <p className="text-custom-grey mb-6 whitespace-pre-wrap">{snippet.description}</p>
        )}

        {snippet.tags && snippet.tags.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {snippet.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 text-sm bg-custom-grey text-custom-white rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="mb-6 rounded-lg overflow-hidden border border-custom-grey relative group">
          <SyntaxHighlighter
            language={snippet.language}
            style={oneDark}
            customStyle={{ margin: 0, borderRadius: '0.5rem' }}
            showLineNumbers={true}
          >
            {snippet.code}
          </SyntaxHighlighter>
          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(snippet.code);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              } catch (err) {
                console.error('Failed to copy:', err);
              }
            }}
            className="absolute top-4 right-4 p-2 bg-slate-800/80 hover:bg-slate-700/90 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
            title="Copy code"
          >
            {copied ? <FaCheck className="w-5 h-5" /> : <FaCopy className="w-5 h-5" />}
          </button>
        </div>

        <div className="mb-6">
          <CodeExecutor code={snippet.code} language={snippet.language} />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-custom-grey">
          <div className="text-sm text-custom-grey">
            Created {new Date(snippet.createdAt).toLocaleDateString()}
            {snippet.updatedAt !== snippet.createdAt && (
              <span> • Updated {new Date(snippet.updatedAt).toLocaleDateString()}</span>
            )}
          </div>
          <div className="flex space-x-2">
            {isOwner && (
              <>
                <Link
                  to={`/snippets/${id}/edit`}
                  className="px-4 py-2 bg-custom-orangered text-custom-white rounded-md hover:bg-orange-600 text-sm font-medium flex items-center gap-2"
                >
                  <FaEdit className="w-4 h-4" />
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium flex items-center gap-2"
                >
                  <FaTrash className="w-4 h-4" />
                  Delete
                </button>
              </>
            )}
            {!isOwner && snippet.isPublic && user && (
              <button
                onClick={handleFork}
                disabled={forking}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium disabled:opacity-50"
              >
                {forking ? 'Forking...' : 'Fork'}
              </button>
            )}
            {user && (
              <button
                onClick={() => setShowAddToCollection(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium flex items-center gap-2"
              >
                <FaPlus className="w-4 h-4" />
                Add to Collection
              </button>
            )}
            {!user && snippet.isPublic && (
              <Link
                to="/login"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
              >
                Login to Fork
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Add to Collection Modal */}
      {showAddToCollection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAddToCollection(false)}>
          <div className="bg-custom-white dark:bg-custom-dark-card rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-custom-black dark:text-custom-dark-text mb-4">Add to Collection</h2>
            {(() => {
              // Filter collections: private snippets -> private collections, public snippets -> public collections
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
                    const isInCollection = collection.snippets?.some(s => (typeof s === 'object' ? s._id : s) === snippet._id);
                    return (
                      <button
                        key={collection._id}
                        onClick={() => !isInCollection && handleAddToCollection(collection._id)}
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
    </div>
  );
};

export default SnippetDetail;
