import { FiFileText, FiFolder, FiTag, FiUser, FiCornerDownLeft } from 'react-icons/fi';

const CommandItem = ({ item, isSelected, onClick, onMouseEnter }) => {
  const getIcon = () => {
    if (item.type === 'snippet') return <FiFileText className="w-4 h-4 text-orange-500 shrink-0" />;
    if (item.type === 'collection') return <FiFolder className="w-4 h-4 text-amber-500 shrink-0" />;
    if (item.type === 'tag') return <FiTag className="w-4 h-4 text-orange-400 shrink-0" />;
    if (item.type === 'author') return <FiUser className="w-4 h-4 text-blue-500 shrink-0" />;
    return <FiCornerDownLeft className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer text-sm transition-all duration-150 ${
        isSelected
          ? 'bg-orange-50 dark:bg-orange-950/40 text-custom-orangered dark:text-orange-300 font-semibold shadow-xs'
          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-custom-dark-surface'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {getIcon()}
        <span className="truncate">{item.title}</span>
        {item.badge && (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-custom-dark-surface text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-custom-dark-border shrink-0 capitalize">
            {item.badge}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {item.shortcut && (
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-400 dark:text-slate-500 bg-white dark:bg-custom-dark-card border border-slate-200 dark:border-custom-dark-border rounded shadow-xs">
            {item.shortcut}
          </kbd>
        )}
        <span className={`text-xs ${isSelected ? 'opacity-100 text-custom-orangered' : 'opacity-0 group-hover:opacity-100 text-slate-400'} transition-opacity`}>
          ↵
        </span>
      </div>
    </div>
  );
};

export default CommandItem;
