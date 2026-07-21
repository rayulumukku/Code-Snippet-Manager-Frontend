import { useState, useMemo } from 'react';
import { FiColumns, FiList } from 'react-icons/fi';

function computeLineDiff(oldText = '', newText = '') {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');

  const diff = [];
  let i = 0;
  let j = 0;

  while (i < oldLines.length || j < newLines.length) {
    if (i < oldLines.length && j < newLines.length && oldLines[i] === newLines[j]) {
      diff.push({ type: 'same', oldLine: i + 1, newLine: j + 1, value: oldLines[i] });
      i++;
      j++;
    } else if (j < newLines.length && (!oldLines.slice(i).includes(newLines[j]))) {
      diff.push({ type: 'added', newLine: j + 1, value: newLines[j] });
      j++;
    } else if (i < oldLines.length) {
      diff.push({ type: 'removed', oldLine: i + 1, value: oldLines[i] });
      i++;
    }
  }

  return diff;
}

const CodeDiffView = ({ oldCode = '', newCode = '', oldTitle = 'Previous Version', newTitle = 'Selected Version' }) => {
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'unified'

  const diffLines = useMemo(() => computeLineDiff(oldCode, newCode), [oldCode, newCode]);

  const oldLines = useMemo(() => oldCode.split('\n'), [oldCode]);
  const newLines = useMemo(() => newCode.split('\n'), [newCode]);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-custom-dark-border bg-slate-900 overflow-hidden font-mono text-xs shadow-xl animate-fade-in">
      {/* Controls Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800/80 border-b border-slate-700/60 text-slate-300">
        <span className="font-sans font-semibold text-xs text-slate-400">
          Comparing Versions
        </span>
        <div className="flex items-center gap-1 p-0.5 bg-slate-900 rounded-lg border border-slate-700/60">
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
              viewMode === 'split' ? 'bg-orange-500 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FiColumns className="w-3.5 h-3.5" /> Split
          </button>
          <button
            type="button"
            onClick={() => setViewMode('unified')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
              viewMode === 'unified' ? 'bg-orange-500 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FiList className="w-3.5 h-3.5" /> Unified
          </button>
        </div>
      </div>

      {/* Code Diff Display */}
      {viewMode === 'split' ? (
        <div className="grid grid-cols-2 divide-x divide-slate-800 overflow-x-auto max-h-[60vh]">
          {/* Left Column (Old Version) */}
          <div className="p-3">
            <div className="text-[11px] font-bold text-red-400 mb-2 border-b border-slate-800 pb-1 font-sans truncate">
              - {oldTitle}
            </div>
            <pre className="space-y-0.5">
              {diffLines.map((line, idx) => {
                if (line.type === 'added') return <div key={idx} className="h-5" />;
                const isRemoved = line.type === 'removed';
                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 px-1.5 py-0.5 rounded ${
                      isRemoved ? 'bg-red-950/40 text-red-300' : 'text-slate-300'
                    }`}
                  >
                    <span className="w-6 text-right select-none text-slate-600 shrink-0">{line.oldLine}</span>
                    <span className="whitespace-pre truncate">{line.value || ' '}</span>
                  </div>
                );
              })}
            </pre>
          </div>

          {/* Right Column (New Version) */}
          <div className="p-3">
            <div className="text-[11px] font-bold text-emerald-400 mb-2 border-b border-slate-800 pb-1 font-sans truncate">
              + {newTitle}
            </div>
            <pre className="space-y-0.5">
              {diffLines.map((line, idx) => {
                if (line.type === 'removed') return <div key={idx} className="h-5" />;
                const isAdded = line.type === 'added';
                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 px-1.5 py-0.5 rounded ${
                      isAdded ? 'bg-emerald-950/40 text-emerald-300' : 'text-slate-300'
                    }`}
                  >
                    <span className="w-6 text-right select-none text-slate-600 shrink-0">{line.newLine}</span>
                    <span className="whitespace-pre truncate">{line.value || ' '}</span>
                  </div>
                );
              })}
            </pre>
          </div>
        </div>
      ) : (
        /* Unified View */
        <div className="p-3 overflow-x-auto max-h-[60vh]">
          <pre className="space-y-0.5">
            {diffLines.map((line, idx) => {
              const isAdded = line.type === 'added';
              const isRemoved = line.type === 'removed';
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-3 px-2 py-0.5 rounded ${
                    isAdded
                      ? 'bg-emerald-950/40 text-emerald-300'
                      : isRemoved
                      ? 'bg-red-950/40 text-red-300'
                      : 'text-slate-300'
                  }`}
                >
                  <span className="w-4 text-center font-bold shrink-0">
                    {isAdded ? '+' : isRemoved ? '-' : ' '}
                  </span>
                  <span className="w-6 text-right select-none text-slate-600 shrink-0">
                    {line.oldLine || line.newLine}
                  </span>
                  <span className="whitespace-pre truncate">{line.value || ' '}</span>
                </div>
              );
            })}
          </pre>
        </div>
      )}
    </div>
  );
};

export default CodeDiffView;
