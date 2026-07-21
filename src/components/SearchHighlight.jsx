import React from 'react';

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const SearchHighlight = ({ text, query, className = '' }) => {
  if (!text || typeof text !== 'string') return null;
  if (!query || typeof query !== 'string' || !query.trim()) {
    return <span className={className}>{text}</span>;
  }

  const terms = query.trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return <span className={className}>{text}</span>;

  const pattern = new RegExp(`(${terms.map(escapeRegExp).join('|')})`, 'gi');
  const parts = text.split(pattern);

  return (
    <span className={className}>
      {parts.map((part, i) =>
        pattern.test(part) ? (
          <mark
            key={i}
            className="bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-100 font-semibold rounded px-0.5"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
};

export default React.memo(SearchHighlight);
