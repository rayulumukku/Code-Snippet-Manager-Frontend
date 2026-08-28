import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { snippetsAPI, collectionsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import CodeExecutor from '../components/CodeExecutor';
import TagChip from '../components/TagChip';
import FavoriteButton from '../components/FavoriteButton';
import PinnedBadge from '../components/PinnedBadge';
import VersionHistoryDrawer from '../components/VersionHistoryDrawer';
import { FiFrown, FiFolder, FiGlobe, FiLock, FiGitBranch } from 'react-icons/fi';

const SnippetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [snippet, setSnippet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [forking, setForking] = useState(false);
  const [liking, setLiking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAddToCollection, setShowAddToCollection] = useState(false);
  const [userCollections, setUserCollections] = useState([]);
  const [addingToCollection, setAddingToCollection] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    document.title = snippet ? `${snippet.title} | Code Snippet Manager` : 'Snippet | Code Snippet Manager';
  }, [snippet]);

  const fetchSnippet = useCallback(async () => {
    try {
      const res = await snippetsAPI.getById(id);
      setSnippet(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load snippet');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSnippet();
  }, [fetchSnippet]);

  useEffect(() => {
    if (showAddToCollection && user) {
      collectionsAPI.getAll()
        .then(r => setUserCollections(r.data.filter(c => c.owner?._id === user?._id)))
        .catch(console.error);
    }
  }, [showAddToCollection, user]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this snippet? This cannot be undone.')) return;
    try {
      await snippetsAPI.delete(id);
      toast.success('Snippet deleted');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleFork = async () => {
    if (!user) { navigate('/login'); return; }
    setForking(true);
    try {
      const res = await snippetsAPI.fork(id);
      toast.success('Snippet forked! Opening editor...');
      setTimeout(() => navigate(`/snippets/${res.data._id}/edit`), 800);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fork');
    } finally {
      setForking(false);
    }
  };

  const handleLike = async () => {
    if (!user) { navigate('/login'); return; }
    setLiking(true);
    try {
      if (snippet.isLiked) {
        const res = await snippetsAPI.unlike(id);
        setSnippet(s => ({ ...s, isLiked: false, likeCount: res.data.likeCount }));
      } else {
        const res = await snippetsAPI.like(id);
        setSnippet(s => ({ ...s, isLiked: true, likeCount: res.data.likeCount }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update like');
    } finally {
      setLiking(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy code');
    }
  };

  const handleAddToCollection = async (collectionId) => {
    setAddingToCollection(true);
    try {
      await collectionsAPI.addSnippet(collectionId, id);
      setShowAddToCollection(false);
      toast.success('Added to collection!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to collection');
    } finally {
      setAddingToCollection(false);
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

  if (error || !snippet) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center animate-fade-in">
        <div className="flex justify-center text-slate-400 mb-4">
          <FiFrown className="text-6xl" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Snippet not found</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">{error || 'This snippet may have been deleted or is private.'}</p>
        <Link to="/" className="btn-primary">← Back to home</Link>
      </div>
    );
  }

  const isOwner = user && snippet.author._id === user._id;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-6 transition-colors group">
        <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        Back
      </button>

      {/* Main card */}
      <div className="bg-white dark:bg-custom-dark-card border border-slate-200 dark:border-custom-dark-border rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-custom-dark-border">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3 leading-tight">
                {snippet.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full gradient-bg flex items-center justify-center text-white text-[10px] font-bold">
                    {snippet.author?.username?.slice(0, 1).toUpperCase()}
                  </div>
                  {snippet.author?.username}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx={12} cy={12} r={3} /></svg>
                  {snippet.views} views
                </span>
                {snippet.forkCount > 0 && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx={18} cy={18} r={3} /><circle cx={6} cy={6} r={3} /><circle cx={18} cy={6} r={3} /><path d="M6 9v3a3 3 0 003 3h6" /><path d="M18 9v3" /></svg>
                    {snippet.forkCount} forks
                  </span>
                )}
                {snippet.forkedFrom && (
                  <Link to={`/snippets/${snippet.forkedFrom._id}`} className="text-custom-orangered hover:underline">
                    Forked from {snippet.forkedFrom.title}
                  </Link>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Favorite Button */}
              <FavoriteButton
                snippetId={id}
                initialFavorited={Boolean(snippet.isFavorited)}
                initialCount={snippet.favoriteCount || 0}
                size="md"
              />

              <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm font-semibold rounded-full ${
                snippet.isPublic
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
              }`}>
                {snippet.isPublic ? <FiGlobe className="w-3.5 h-3.5" /> : <FiLock className="w-3.5 h-3.5" />}
                {snippet.isPublic ? 'Public' : 'Private'}
              </span>
              <span className="lang-badge capitalize">{snippet.language}</span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Description */}
          {snippet.description && (
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{snippet.description}</p>
          )}

          {/* Tags */}
          {snippet.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {snippet.tags.map((tag, i) => (
                <TagChip
                  key={i}
                  tag={tag}
                  onClick={() => navigate(`/search?tags=${encodeURIComponent(tag)}`)}
                  size="md"
                />
              ))}
            </div>
          )}

          {/* Code block */}
          <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-custom-dark-border group/code">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>
              <span className="text-xs text-slate-400 font-mono capitalize">{snippet.language}</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
              >
                {copied ? (
                  <>
                    <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x={9} y={9} width={13} height={13} rx={2} /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
                    Copy
                  </>
                )}
              </button>
            </div>
            <SyntaxHighlighter
              language={snippet.language === 'other' ? 'text' : snippet.language}
              style={oneDark}
              showLineNumbers
              customStyle={{ margin: 0, borderRadius: '0 0 0.75rem 0.75rem', fontSize: '0.8125rem' }}
            >
              {snippet.code}
            </SyntaxHighlighter>
          </div>

          {/* Code executor */}
          <CodeExecutor code={snippet.code} language={snippet.language} />

          {/* Footer actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-slate-100 dark:border-custom-dark-border gap-4">
            <div className="text-xs text-slate-400 dark:text-slate-500">
              Created {new Date(snippet.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              {snippet.updatedAt !== snippet.createdAt && (
                <span> · Updated {new Date(snippet.updatedAt).toLocaleDateString()}</span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {/* Like */}
              <button
                onClick={handleLike}
                disabled={liking}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                  snippet.isLiked
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 border border-red-200 dark:border-red-800/40'
                    : 'btn-secondary'
                }`}
              >
                <svg className="w-4 h-4" fill={snippet.isLiked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {snippet.isLiked ? 'Liked' : 'Like'}
                {snippet.likeCount > 0 && <span className="ml-0.5">· {snippet.likeCount}</span>}
              </button>

              {/* Version History Button */}
              <button
                type="button"
                onClick={() => setHistoryOpen(true)}
                className="btn-secondary text-sm flex items-center gap-1.5"
                title="View Version History & Line Diffs"
              >
                <FiGitBranch className="w-4 h-4 text-orange-500" />
                Version History
              </button>

              {/* Add to collection */}
              {user && (
                <button onClick={() => setShowAddToCollection(true)} className="btn-secondary text-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><line x1={12} y1={5} x2={12} y2={19} /><line x1={5} y1={12} x2={19} y2={12} /></svg>
                  Add to Collection
                </button>
              )}

              {/* Owner actions */}
              {isOwner && (
                <>
                  <Link to={`/snippets/${id}/edit`} className="btn-primary text-sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                    Edit
                  </Link>
                  <button onClick={handleDelete} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/40 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6M9 6V4h6v2" /></svg>
                    Delete
                  </button>
                </>
              )}

              {/* Fork */}
              {!isOwner && snippet.isPublic && (
                <button
                  onClick={user ? handleFork : () => navigate('/login')}
                  disabled={forking}
                  className="btn-secondary text-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx={18} cy={18} r={3} /><circle cx={6} cy={6} r={3} /><circle cx={18} cy={6} r={3} /><path d="M6 9v3a3 3 0 003 3h6" /><path d="M18 9v3" /></svg>
                  {forking ? 'Forking...' : (user ? 'Fork' : 'Login to Fork')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add to Collection modal */}
      {showAddToCollection && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setShowAddToCollection(false)}
        >
          <div className="glass-strong rounded-2xl p-6 max-w-md w-full shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Add to Collection</h2>
            {userCollections.length === 0 ? (
              <div className="text-center py-8">
                <div className="flex justify-center text-slate-400 mb-3">
                  <FiFolder className="text-5xl" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 mb-4">No collections yet.</p>
                <Link to="/collections" onClick={() => setShowAddToCollection(false)} className="btn-primary text-sm">Create Collection</Link>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {userCollections
                  .filter(c => snippet.isPublic || !c.isPublic)
                  .map(c => {
                    const inCollection = c.snippets?.some(s => (typeof s === 'object' ? s._id : s) === snippet._id);
                    return (
                      <button
                        key={c._id}
                        onClick={() => !inCollection && handleAddToCollection(c._id)}
                        disabled={inCollection || addingToCollection}
                        className={`w-full text-left p-3 rounded-xl border transition-all ${
                          inCollection
                            ? 'border-slate-200 dark:border-custom-dark-border bg-slate-50 dark:bg-custom-dark-surface cursor-not-allowed opacity-60'
                            : 'border-slate-200 dark:border-custom-dark-border hover:border-custom-orangered hover:bg-orange-50 dark:hover:bg-orange-900/10'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-sm text-slate-900 dark:text-white">{c.name}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{c.snippets?.length || 0} snippets</div>
                          </div>
                          {inCollection && <span className="text-emerald-500 text-xs font-medium">✓ Added</span>}
                        </div>
                      </button>
                    );
                  })}
              </div>
            )}
            <div className="flex justify-end mt-4">
              <button onClick={() => setShowAddToCollection(false)} className="btn-secondary text-sm">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Version History Drawer */}
      <VersionHistoryDrawer
        snippetId={id}
        currentSnippet={snippet}
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onSnippetRestored={(updated) => setSnippet(updated)}
        isOwner={isOwner}
      />
    </div>
  );
};

export default SnippetDetail;
