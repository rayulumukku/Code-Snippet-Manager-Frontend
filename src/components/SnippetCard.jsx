import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { snippetsAPI, collectionsAPI, pinnedAPI } from '../services/api';
import { useState, useEffect, useRef } from 'react';
import { useToast } from '../context/ToastContext';
import LazySyntaxHighlighter from './LazySyntaxHighlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useIntersectionObserver } from '../utils/useIntersectionObserver';
import TagChip from './TagChip';
import FavoriteButton from './FavoriteButton';
import PinnedBadge from './PinnedBadge';
import { FiFolder } from 'react-icons/fi';

const LangColor = {
  javascript: 'from-yellow-400/20 to-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700/40',
  typescript: 'from-blue-400/20 to-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700/40',
  python: 'from-green-400/20 to-green-500/10 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700/40',
  rust: 'from-orange-400/20 to-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700/40',
  go: 'from-sky-400/20 to-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-700/40',
};
const defaultLangColor = 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800/40';

const SnippetCard = ({ snippet, onDeleted, onUpdated, onLikeToggled, onTagClick }) => {
  const codePreview = snippet.code ? snippet.code.substring(0, 150) : '';
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [forking, setForking] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [liking, setLiking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAddToCollection, setShowAddToCollection] = useState(false);
  const [userCollections, setUserCollections] = useState([]);
  const [addingToCollection, setAddingToCollection] = useState(false);

  const containerRef = useRef(null);
  const isIntersecting = useIntersectionObserver(containerRef, { triggerOnce: true });

  const isOwner = user && snippet.author?._id === user._id;
  const langClass = LangColor[snippet.language] || defaultLangColor;

  useEffect(() => {
    if (showAddToCollection && user) {
      collectionsAPI.getAll()
        .then(r => setUserCollections(r.data.filter(c => c.owner?._id === user?._id)))
        .catch(console.error);
    }
  }, [showAddToCollection, user]);

  const handleCopy = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(snippet.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Delete this snippet? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await snippetsAPI.delete(snippet._id);
      onDeleted?.(snippet._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const handleTogglePublic = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setUpdating(true);
    try {
      const res = await snippetsAPI.update(snippet._id, { isPublic: !snippet.isPublic });
      onUpdated?.(res.data);
      toast.success(res.data.isPublic ? 'Snippet is now public' : 'Snippet is now private');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setUpdating(false);
    }
  };

  const handleFork = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    if (isOwner || !snippet.isPublic) return;
    setForking(true);
    try {
      const res = await snippetsAPI.fork(snippet._id);
      toast.success('Snippet forked! Redirecting to editor...');
      setTimeout(() => navigate(`/snippets/${res.data._id}/edit`), 800);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fork');
    } finally {
      setForking(false);
    }
  };

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    setLiking(true);
    try {
      if (snippet.isLiked) {
        const res = await snippetsAPI.unlike(snippet._id);
        onLikeToggled?.(snippet._id, false, res.data.likeCount);
      } else {
        const res = await snippetsAPI.like(snippet._id);
        onLikeToggled?.(snippet._id, true, res.data.likeCount);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update like');
    } finally {
      setLiking(false);
    }
  };

  const handleAddToCollection = async (collectionId, e) => {
    e.preventDefault();
    e.stopPropagation();
    setAddingToCollection(true);
    try {
      await collectionsAPI.addSnippet(collectionId, snippet._id);
      setShowAddToCollection(false);
      toast.success('Added to collection!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to collection');
    } finally {
      setAddingToCollection(false);
    }
  };

  const handleTogglePin = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOwner) return;
    try {
      if (snippet.isPinned) {
        const res = await pinnedAPI.unpin(snippet._id);
        onUpdated?.(res.data.snippet);
        toast.success('Snippet unpinned');
      } else {
        const res = await pinnedAPI.pin(snippet._id);
        onUpdated?.(res.data.snippet);
        toast.success('Snippet pinned!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update pin status');
    }
  };

  return (
    <div className="group bg-white dark:bg-custom-dark-card border border-slate-200 dark:border-custom-dark-border rounded-2xl shadow-sm hover:shadow-xl dark:hover:shadow-black/40 hover:-translate-y-1 transition-all duration-200 overflow-hidden animate-fade-in">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <Link to={`/snippets/${snippet._id}`} className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 group-hover:text-custom-orangered transition-colors duration-150 truncate">
                {snippet.title}
              </h3>
              {snippet.isPinned && <PinnedBadge />}
            </div>
          </Link>
          <div className="flex items-center gap-1 shrink-0">
            {isOwner && (
              <>
                <button
                  onClick={handleTogglePin}
                  className={`p-1.5 rounded-lg transition-colors ${
                    snippet.isPinned
                      ? 'bg-orange-50 dark:bg-orange-950/30 text-custom-orangered'
                      : 'bg-slate-100 dark:bg-custom-dark-surface text-slate-400 hover:text-custom-orangered'
                  }`}
                  title={snippet.isPinned ? 'Unpin Snippet' : 'Pin Snippet'}
                >
                  <svg className={`w-3.5 h-3.5 ${snippet.isPinned ? 'rotate-45 text-custom-orangered' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
                <button
                  onClick={handleTogglePublic}
                  disabled={updating}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-custom-dark-surface hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 disabled:opacity-50 transition-colors"
                  title={snippet.isPublic ? 'Make Private' : 'Make Public'}
                >
                  {snippet.isPublic ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M17 8l4 4-4 4M3 12h18" /><path d="M3 6h7m0 12H3" /></svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x={3} y={11} width={18} height={11} rx={2} /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                  )}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-500 dark:text-red-400 disabled:opacity-50 transition-colors"
                  title="Delete"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
                  </svg>
                </button>
              </>
            )}
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize bg-gradient-to-r border ${langClass}`}>
              {snippet.language}
            </span>
          </div>
        </div>

        {/* Description */}
        {snippet.description && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">{snippet.description}</p>
        )}

        {/* Code preview */}
        <div ref={containerRef} className="relative rounded-xl overflow-hidden ring-1 ring-slate-900/5 dark:ring-white/5 mb-4 group/code min-h-[90px]">
          {isIntersecting ? (
            <LazySyntaxHighlighter
              language={snippet.language === 'other' ? 'text' : snippet.language}
              style={oneDark}
              customStyle={{ margin: 0, borderRadius: '0.75rem', fontSize: '0.75rem', maxHeight: '120px', overflow: 'hidden' }}
              showLineNumbers={false}
            >
              {codePreview}
            </LazySyntaxHighlighter>
          ) : (
            <pre
              className="font-mono text-xs p-4 bg-slate-950 text-slate-300 rounded-xl overflow-hidden leading-relaxed whitespace-pre font-normal select-none"
              style={{ margin: 0, borderRadius: '0.75rem', fontSize: '0.75rem', maxHeight: '120px', overflow: 'hidden' }}
            >
              <code>{codePreview}</code>
            </pre>
          )}
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-1.5 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg opacity-0 group-hover/code:opacity-100 transition-all duration-150"
            title="Copy"
          >
            {copied
              ? <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              : <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x={9} y={9} width={13} height={13} rx={2} /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
            }
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            {/* Author */}
            <span className="flex items-center gap-1">
              <div className="w-5 h-5 rounded-full gradient-bg flex items-center justify-center text-white text-[9px] font-bold">
                {snippet.author?.username?.slice(0, 1).toUpperCase() || '?'}
              </div>
              {snippet.author?.username || 'Unknown'}
            </span>
            {/* Views */}
            {snippet.views > 0 && (
              <span className="flex items-center gap-0.5">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx={12} cy={12} r={3} /></svg>
                {snippet.views}
              </span>
            )}
            {/* Forks */}
            {snippet.forkCount > 0 && (
              <span className="flex items-center gap-0.5">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx={18} cy={18} r={3} /><circle cx={6} cy={6} r={3} /><circle cx={18} cy={6} r={3} /><path d="M6 9v3a3 3 0 003 3h6" /><path d="M18 9v3" /></svg>
                {snippet.forkCount}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            {/* Favorite button */}
            <FavoriteButton
              snippetId={snippet._id}
              initialFavorited={Boolean(snippet.isFavorited)}
              initialCount={snippet.favoriteCount || 0}
              size="sm"
            />

            {/* Like button */}
            <button
              onClick={handleLike}
              disabled={liking}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all duration-150 ${
                snippet.isLiked
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400'
                  : 'text-slate-400 dark:text-slate-500 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
              }`}
              title={snippet.isLiked ? 'Unlike' : 'Like'}
            >
              <svg className="w-3.5 h-3.5" fill={snippet.isLiked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {snippet.likeCount > 0 && <span>{snippet.likeCount}</span>}
            </button>

            {/* Fork */}
            {!isOwner && snippet.isPublic && user && (
              <button
                onClick={handleFork}
                disabled={forking}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx={18} cy={18} r={3} /><circle cx={6} cy={6} r={3} /><circle cx={18} cy={6} r={3} /><path d="M6 9v3a3 3 0 003 3h6" /><path d="M18 9v3" /></svg>
                {forking ? '...' : 'Fork'}
              </button>
            )}

            {/* Add to collection */}
            {user && (
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowAddToCollection(true); }}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                title="Add to Collection"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><line x1={12} y1={5} x2={12} y2={19} /><line x1={5} y1={12} x2={19} y2={12} /></svg>
              </button>
            )}

            {/* Visibility badge */}
            <span className={`text-xs font-medium ${snippet.isPublic ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
              {snippet.isPublic ? 'Public' : 'Private'}
            </span>
          </div>
        </div>

        {/* Tags */}
        {snippet.tags?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {snippet.tags.slice(0, 4).map((tag, i) => (
              <TagChip
                key={i}
                tag={tag}
                onClick={onTagClick ? () => onTagClick(tag) : () => navigate(`/search?tags=${encodeURIComponent(tag)}`)}
                size="sm"
              />
            ))}
            {snippet.tags.length > 4 && (
              <span className="text-xs px-2 py-0.5 font-medium rounded-full bg-slate-100 dark:bg-custom-dark-surface text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-custom-dark-border">
                +{snippet.tags.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Add to Collection modal */}
      {showAddToCollection && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setShowAddToCollection(false)}
        >
          <div
            className="glass-strong rounded-2xl p-6 max-w-md w-full shadow-2xl animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Add to Collection</h2>
            {userCollections.length === 0 ? (
              <div className="text-center py-8">
                <div className="flex justify-center text-slate-400 mb-3">
                  <FiFolder className="text-5xl" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 mb-4">No collections yet.</p>
                <Link
                  to="/collections"
                  onClick={e => { e.stopPropagation(); setShowAddToCollection(false); }}
                  className="btn-primary text-sm"
                >
                  Create Collection
                </Link>
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
                        onClick={e => !inCollection && handleAddToCollection(c._id, e)}
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
    </div>
  );
};

export default SnippetCard;
