import { useState, useEffect } from 'react';
import { versionsAPI } from '../services/api';
import VersionCard from './VersionCard';
import CodeDiffView from './CodeDiffView';
import { useToast } from '../context/ToastContext';
import { FiX, FiClock, FiRotateCcw, FiGitBranch } from 'react-icons/fi';

const VersionHistoryDrawer = ({ snippetId, currentSnippet, isOpen, onClose, onSnippetRestored, isOwner = false }) => {
  const { toast } = useToast();

  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(false);
  const [confirmRestoreVersion, setConfirmRestoreVersion] = useState(null);

  useEffect(() => {
    if (isOpen && snippetId) {
      fetchHistory();
    } else {
      setSelectedVersion(null);
      setConfirmRestoreVersion(null);
    }
  }, [isOpen, snippetId]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await versionsAPI.getHistory(snippetId);
      setVersions(res.data.versions || []);
      if (res.data.versions?.length > 0) {
        setSelectedVersion(res.data.versions[0]);
      }
    } catch (err) {
      console.error('Failed to load version history:', err);
      toast.error('Failed to load version history');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (version) => {
    setRestoring(true);
    try {
      const res = await versionsAPI.restore(snippetId, version._id);
      toast.success(res.data.message || 'Snippet restored successfully!');
      setConfirmRestoreVersion(null);
      onClose();
      onSnippetRestored?.(res.data.snippet);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to restore version');
    } finally {
      setRestoring(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white dark:bg-custom-dark-card border-l border-slate-200 dark:border-custom-dark-border h-full shadow-2xl flex flex-col overflow-hidden animate-slide-left">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-custom-dark-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-custom-orangered flex items-center justify-center">
              <FiGitBranch className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                Version History
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Compare line diffs or restore past code snapshots
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-custom-dark-surface text-slate-400 hover:text-slate-600 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 rounded-2xl bg-slate-100 dark:bg-custom-dark-surface animate-pulse" />
              ))}
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-16">
              <FiClock className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">
                No past versions recorded
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Version history is automatically logged when code is edited.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Diff Comparison Panel if a version is selected */}
              {selectedVersion && currentSnippet && (
                <div>
                  <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                    Line Diff (Active Code vs v{selectedVersion.versionNumber})
                  </h3>
                  <CodeDiffView
                    oldCode={selectedVersion.code}
                    newCode={currentSnippet.code}
                    oldTitle={`v${selectedVersion.versionNumber} (${new Date(selectedVersion.createdAt).toLocaleDateString()})`}
                    newTitle="Active Current Snippet"
                  />
                </div>
              )}

              {/* Version History Cards Timeline */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                  Snapshots History ({versions.length})
                </h3>
                <div className="space-y-3">
                  {versions.map((ver) => (
                    <VersionCard
                      key={ver._id}
                      version={ver}
                      isCurrent={false}
                      isComparing={selectedVersion?._id === ver._id}
                      onSelectCompare={(v) => setSelectedVersion(v)}
                      onRestore={(v) => setConfirmRestoreVersion(v)}
                      isOwner={isOwner}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Restore Confirmation Modal */}
        {confirmRestoreVersion && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-custom-dark-card border border-slate-200 dark:border-custom-dark-border p-6 rounded-3xl shadow-2xl max-w-sm w-full animate-scale-up text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center mx-auto">
                <FiRotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  Restore Version v{confirmRestoreVersion.versionNumber}?
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  This will update active snippet code to version v{confirmRestoreVersion.versionNumber} and create a new restore snapshot point.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmRestoreVersion(null)}
                  className="btn-secondary flex-1 py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleRestore(confirmRestoreVersion)}
                  disabled={restoring}
                  className="btn-primary flex-1 py-2 text-xs bg-amber-500 hover:bg-amber-600 border-none text-white"
                >
                  {restoring ? 'Restoring...' : 'Confirm Restore'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VersionHistoryDrawer;
