import React from 'react';

const sizeStyles = {
  sm: 'text-xs px-2.5 py-0.5 gap-1',
  md: 'text-sm px-3 py-1 gap-1.5',
  lg: 'text-base px-3.5 py-1.5 gap-2',
};

const TagChip = ({
  tag,
  count,
  onClick,
  onRemove,
  selected = false,
  size = 'sm',
  className = '',
}) => {
  const isClickable = Boolean(onClick);
  const isRemovable = Boolean(onRemove);

  const handleClick = (e) => {
    if (isClickable) {
      e.preventDefault();
      e.stopPropagation();
      onClick(tag);
    }
  };

  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isRemovable) {
      onRemove(tag);
    }
  };

  const baseStyle = `inline-flex items-center font-medium rounded-full transition-all duration-150 select-none ${sizeStyles[size] || sizeStyles.sm}`;

  const colorStyle = selected
    ? 'gradient-bg text-white shadow-sm ring-2 ring-custom-orangered/40'
    : isClickable
    ? 'bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-300 border border-orange-200/80 dark:border-orange-800/40 hover:bg-orange-100 dark:hover:bg-orange-900/40 hover:border-orange-300 dark:hover:border-orange-700 hover:scale-[1.02]'
    : 'bg-slate-100 dark:bg-custom-dark-surface text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-custom-dark-border';

  return (
    <span
      onClick={isClickable ? handleClick : undefined}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleClick(e);
              }
            }
          : undefined
      }
      className={`${baseStyle} ${colorStyle} ${isClickable ? 'cursor-pointer' : ''} ${className}`}
    >
      <span className="truncate">#{tag}</span>

      {count !== undefined && (
        <span
          className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
            selected
              ? 'bg-white/20 text-white'
              : 'bg-orange-200/60 dark:bg-orange-900/60 text-orange-800 dark:text-orange-200'
          }`}
        >
          {count}
        </span>
      )}

      {isRemovable && (
        <button
          type="button"
          onClick={handleRemove}
          className="ml-0.5 p-0.5 hover:bg-black/10 dark:hover:bg-white/20 rounded-full transition-colors leading-none focus:outline-none"
          title={`Remove #${tag}`}
          aria-label={`Remove tag ${tag}`}
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
};

export default React.memo(TagChip);
