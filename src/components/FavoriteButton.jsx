import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBookmark } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { favoritesAPI } from '../services/api';

const FavoriteButton = ({
  snippetId,
  initialFavorited = false,
  initialCount = 0,
  onToggle,
  size = 'md',
  showCount = true,
  className = '',
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [favoriteCount, setFavoriteCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsFavorited(initialFavorited);
  }, [initialFavorited]);

  useEffect(() => {
    setFavoriteCount(initialCount);
  }, [initialCount]);

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Please log in to save favorites');
      navigate('/login');
      return;
    }

    if (loading) return;

    // Optimistic UI Update
    const prevFavorited = isFavorited;
    const prevCount = favoriteCount;
    const nextFavorited = !prevFavorited;
    const nextCount = nextFavorited ? prevCount + 1 : Math.max(0, prevCount - 1);

    setIsFavorited(nextFavorited);
    setFavoriteCount(nextCount);
    onToggle?.(snippetId, nextFavorited, nextCount);

    setLoading(true);

    try {
      if (nextFavorited) {
        await favoritesAPI.favorite(snippetId);
        toast.success('Added to favorites!');
      } else {
        await favoritesAPI.unfavorite(snippetId);
        toast.success('Removed from favorites');
      }
    } catch (err) {
      // Revert Optimistic State on Failure
      setIsFavorited(prevFavorited);
      setFavoriteCount(prevCount);
      onToggle?.(snippetId, prevFavorited, prevCount);
      toast.error(err.response?.data?.message || 'Failed to update favorite');
    } finally {
      setLoading(false);
    }
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const buttonPadding = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-2.5 py-1.5 text-xs sm:text-sm gap-1.5',
    lg: 'px-3.5 py-2 text-sm gap-2',
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex items-center font-medium rounded-xl transition-all duration-150 ${
        buttonPadding[size] || buttonPadding.md
      } ${
        isFavorited
          ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 shadow-sm scale-[1.02]'
          : 'text-slate-500 dark:text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-custom-dark-surface'
      } ${className}`}
      title={isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
    >
      <FiBookmark
        className={`${iconSizes[size] || iconSizes.md} transition-transform duration-200 ${
          isFavorited ? 'fill-current scale-110' : ''
        }`}
      />
      {showCount && (
        <span className="font-mono">{favoriteCount > 0 ? favoriteCount : ''}</span>
      )}
    </button>
  );
};

export default FavoriteButton;
