const PinnedBadge = ({ className = '', size = 'sm' }) => {
  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  return (
    <span
      className={`inline-flex items-center font-bold tracking-wide rounded-full bg-gradient-to-r from-orange-500/15 to-amber-500/15 text-orange-600 dark:text-orange-400 border border-orange-300/60 dark:border-orange-800/60 shadow-xs ${
        sizes[size] || sizes.sm
      } ${className}`}
      title="Pinned Snippet"
    >
      <svg className="w-3 h-3 text-custom-orangered rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
      Pinned
    </span>
  );
};

export default PinnedBadge;
