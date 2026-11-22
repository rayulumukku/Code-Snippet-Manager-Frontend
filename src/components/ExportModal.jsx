import { useState } from 'react';
import { FiDownload, FiCopy, FiFileText, FiCheck, FiX, FiTerminal, FiCode } from 'react-icons/fi';
import { downloadSnippetAsFile, downloadSnippetAsJson, formatAsMarkdown, getFileExtension } from '../utils/exportUtils';
import { useToast } from '../context/ToastContext';

const ExportModal = ({ isOpen, onClose, snippet }) => {
  const { toast } = useToast();
  const [copiedType, setCopiedType] = useState('');

  if (!isOpen || !snippet) return null;

  const rawApiUrl = `${window.location.origin}/api/snippets/${snippet._id}/raw`;
  const ext = getFileExtension(snippet.language);

  const handleCopyMarkdown = async () => {
    try {
      const md = formatAsMarkdown(snippet);
      await navigator.clipboard.writeText(md);
      setCopiedType('markdown');
      toast.success('Markdown copied to clipboard!');
      setTimeout(() => setCopiedType(''), 2000);
    } catch {
      toast.error('Failed to copy markdown');
    }
  };

  const handleCopyRawCode = async () => {
    try {
      await navigator.clipboard.writeText(snippet.code);
      setCopiedType('code');
      toast.success('Code copied to clipboard!');
      setTimeout(() => setCopiedType(''), 2000);
    } catch {
      toast.error('Failed to copy code');
    }
  };

  const handleCopyCurl = async () => {
    try {
      const curlCommand = `curl -sL "${rawApiUrl}"`;
      await navigator.clipboard.writeText(curlCommand);
      setCopiedType('curl');
      toast.success('cURL command copied!');
      setTimeout(() => setCopiedType(''), 2000);
    } catch {
      toast.error('Failed to copy cURL command');
    }
  };

  const handleDownloadFile = () => {
    try {
      downloadSnippetAsFile(snippet);
      toast.success(`Downloaded .${ext} file!`);
    } catch {
      toast.error('Failed to download file');
    }
  };

  const handleDownloadJson = () => {
    try {
      downloadSnippetAsJson(snippet);
      toast.success('Downloaded snippet JSON!');
    } catch {
      toast.error('Failed to download JSON');
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="glass-strong rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-custom-dark-border p-6 animate-scale-in space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white text-sm">
              <FiDownload />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Export Snippet</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Save, copy, or stream this code</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {/* Download file */}
          <button
            onClick={handleDownloadFile}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-custom-dark-border hover:border-custom-orangered dark:hover:border-custom-orangered hover:bg-orange-50/50 dark:hover:bg-orange-950/20 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-custom-orangered flex items-center justify-center font-mono font-bold text-xs uppercase">
                .{ext}
              </div>
              <div>
                <div className="font-semibold text-sm text-slate-900 dark:text-white">Download as Source File</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Save as native .{ext} file</div>
              </div>
            </div>
            <FiDownload className="text-slate-400 group-hover:text-custom-orangered transition-colors" />
          </button>

          {/* Copy Markdown */}
          <button
            onClick={handleCopyMarkdown}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-custom-dark-border hover:border-custom-orangered dark:hover:border-custom-orangered hover:bg-orange-50/50 dark:hover:bg-orange-950/20 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm">
                <FiFileText />
              </div>
              <div>
                <div className="font-semibold text-sm text-slate-900 dark:text-white">Copy as Formatted Markdown</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Formatted with fenced syntax highlighting</div>
              </div>
            </div>
            {copiedType === 'markdown' ? <FiCheck className="text-emerald-500" /> : <FiCopy className="text-slate-400 group-hover:text-custom-orangered transition-colors" />}
          </button>

          {/* Download JSON */}
          <button
            onClick={handleDownloadJson}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-custom-dark-border hover:border-custom-orangered dark:hover:border-custom-orangered hover:bg-orange-50/50 dark:hover:bg-orange-950/20 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-mono font-bold text-xs">
                JSON
              </div>
              <div>
                <div className="font-semibold text-sm text-slate-900 dark:text-white">Export Complete Metadata (JSON)</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Includes tags, author, and description</div>
              </div>
            </div>
            <FiDownload className="text-slate-400 group-hover:text-custom-orangered transition-colors" />
          </button>

          {/* Copy Raw Code */}
          <button
            onClick={handleCopyRawCode}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-custom-dark-border hover:border-custom-orangered dark:hover:border-custom-orangered hover:bg-orange-50/50 dark:hover:bg-orange-950/20 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-sm">
                <FiCode />
              </div>
              <div>
                <div className="font-semibold text-sm text-slate-900 dark:text-white">Copy Plain Source Code</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Copy plain code text without markdown or wrapper</div>
              </div>
            </div>
            {copiedType === 'code' ? <FiCheck className="text-emerald-500" /> : <FiCopy className="text-slate-400 group-hover:text-custom-orangered transition-colors" />}
          </button>

          {/* Copy cURL for CLI / Terminal */}
          <button
            onClick={handleCopyCurl}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-custom-dark-border hover:border-custom-orangered dark:hover:border-custom-orangered hover:bg-orange-50/50 dark:hover:bg-orange-950/20 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center text-sm">
                <FiTerminal />
              </div>
              <div>
                <div className="font-semibold text-sm text-slate-900 dark:text-white">Copy cURL Command</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Stream code directly into terminal or pipe to files</div>
              </div>
            </div>
            {copiedType === 'curl' ? <FiCheck className="text-emerald-500" /> : <FiCopy className="text-slate-400 group-hover:text-custom-orangered transition-colors" />}
          </button>
        </div>

        <div className="pt-2 flex justify-end">
          <button onClick={onClose} className="btn-secondary text-xs">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
