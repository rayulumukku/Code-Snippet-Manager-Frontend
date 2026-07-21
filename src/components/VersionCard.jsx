import { FiClock, FiRotateCcw, FiGitCommit, FiEye } from 'react-icons/fi';

const VersionCard = ({
  version,
  isCurrent = false,
  isComparing = false,
  onSelectCompare,
  onRestore,
  isOwner = false,
}) => {
  return (
    <div
      className={`p-4 rounded-2xl border transition-all duration-200 ${
        isComparing
          ? 'bg-orange-50/80 dark:bg-orange-950/30 border-custom-orangered shadow-md'
          : 'bg-white dark:bg-custom-dark-card border-slate-200 dark:border-custom-dark-border/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-100 dark:bg-custom-dark-surface text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-custom-dark-border">
            v{version.versionNumber}
          </span>
          {isCurrent && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">
              Active
            </span>
          )}
          {version.isRestorePoint && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center gap-1">
              <FiRotateCcw className="w-2.5 h-2.5" /> Restore Point
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onSelectCompare(version)}
            className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-colors flex items-center gap-1 ${
              isComparing
                ? 'bg-custom-orangered text-white'
                : 'bg-slate-100 dark:bg-custom-dark-surface text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FiEye className="w-3 h-3" /> {isComparing ? 'Comparing' : 'Compare'}
          </button>
          {isOwner && !isCurrent && (
            <button
              type="button"
              onClick={() => onRestore(version)}
              className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 hover:bg-amber-100 transition-colors flex items-center gap-1"
            >
              <FiRotateCcw className="w-3 h-3" /> Restore
            </button>
          )}
        </div>
      </div>

      <p className="text-xs font-medium text-slate-800 dark:text-slate-200 mb-2 truncate">
        {version.changeSummary || version.title}
      </p>

      <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-custom-dark-border/60">
        <span className="flex items-center gap-1">
          <FiGitCommit className="w-3 h-3 text-custom-orangered" />
          By {version.createdBy?.username || 'Author'}
        </span>
        <span className="flex items-center gap-1 font-mono">
          <FiClock className="w-3 h-3" />
          {new Date(version.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

export default VersionCard;
