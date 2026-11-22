import React, { useState } from 'react';
import { FiShare2, FiX, FiCopy, FiCheck, FiCode, FiExternalLink, FiTerminal } from 'react-icons/fi';
import { useToast } from '../context/ToastContext';

const ShareEmbedModal = ({ isOpen, onClose, snippet }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('link'); // 'link' | 'embed' | 'markdown' | 'raw'
  const [copiedKey, setCopiedKey] = useState(null);

  if (!isOpen || !snippet) return null;

  const currentUrl = window.location.href;
  const baseUrl = window.location.origin;
  const rawApiUrl = `${baseUrl.replace(':5173', ':5000')}/api/snippets/${snippet._id}/raw`;
  
  const iframeCode = `<iframe 
  src="${currentUrl}?embed=true" 
  width="100%" 
  height="450" 
  frameborder="0" 
  style="border-radius: 16px; border: 1px solid rgba(0,0,0,0.1); overflow: hidden;"
  title="${snippet.title}"
></iframe>`;

  const markdownBadge = `[![Code Snippet - ${snippet.title}](https://img.shields.io/badge/Snippet-${encodeURIComponent(snippet.language || 'Code')}-ff4500?style=for-the-badge&logo=code)](${currentUrl})`;

  const curlCommand = `curl -sL "${rawApiUrl}"`;

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: snippet.title,
          text: snippet.description || `Check out this ${snippet.language} snippet!`,
          url: currentUrl,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          copyToClipboard(currentUrl, 'native');
        }
      }
    } else {
      copyToClipboard(currentUrl, 'native');
    }
  };

  const TABS = [
    { id: 'link', label: 'Share Link', icon: FiShare2 },
    { id: 'embed', label: 'HTML Embed', icon: FiCode },
    { id: 'markdown', label: 'Markdown Badge', icon: FiExternalLink },
    { id: 'raw', label: 'cURL & CLI', icon: FiTerminal },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-white dark:bg-custom-dark-card border border-slate-200 dark:border-custom-dark-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-custom-dark-border bg-slate-50/50 dark:bg-custom-dark-surface/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-custom-orangered flex items-center justify-center border border-orange-500/20">
              <FiShare2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                Share & Embed Snippet
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Generate embed codes, links, or CLI streams
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-custom-dark-surface text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls: Segmented pill style (no one-sided borders) */}
        <div className="px-6 pt-4 pb-2">
          <div className="flex items-center p-1.5 bg-slate-100 dark:bg-custom-dark-surface rounded-2xl gap-1.5 overflow-x-auto scrollbar-none border border-slate-200/80 dark:border-custom-dark-border/80">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-white dark:bg-custom-dark-card text-custom-orangered font-bold shadow-xs border border-slate-200/60 dark:border-custom-dark-border/60'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm flex-1">
          {activeTab === 'link' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                  Direct Snippet URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={currentUrl}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-custom-dark-border bg-slate-50 dark:bg-custom-dark-surface text-slate-700 dark:text-slate-300 font-mono text-xs outline-none select-all"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(currentUrl, 'url')}
                    className="btn-primary py-2 px-4 rounded-xl text-xs shrink-0"
                  >
                    {copiedKey === 'url' ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {navigator.share && (
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="w-full btn-secondary py-2.5 text-xs rounded-xl flex items-center justify-center gap-2"
                >
                  <FiShare2 className="w-4 h-4 text-custom-orangered" /> Share via System Dialog
                </button>
              )}
            </div>
          )}

          {activeTab === 'embed' && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                Responsive Responsive iframe Embed
              </label>
              <textarea
                rows={5}
                readOnly
                value={iframeCode}
                className="w-full p-3 rounded-2xl border border-slate-200 dark:border-custom-dark-border bg-slate-50 dark:bg-custom-dark-surface text-slate-700 dark:text-slate-300 font-mono text-xs outline-none select-all"
              />
              <button
                type="button"
                onClick={() => copyToClipboard(iframeCode, 'embed')}
                className="btn-primary w-full py-2.5 text-xs rounded-xl flex items-center justify-center gap-1.5"
              >
                {copiedKey === 'embed' ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                Copy iframe Embed Code
              </button>
            </div>
          )}

          {activeTab === 'markdown' && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                GitHub README & Docs Badge
              </label>
              <textarea
                rows={3}
                readOnly
                value={markdownBadge}
                className="w-full p-3 rounded-2xl border border-slate-200 dark:border-custom-dark-border bg-slate-50 dark:bg-custom-dark-surface text-slate-700 dark:text-slate-300 font-mono text-xs outline-none select-all"
              />
              <button
                type="button"
                onClick={() => copyToClipboard(markdownBadge, 'markdown')}
                className="btn-primary w-full py-2.5 text-xs rounded-xl flex items-center justify-center gap-1.5"
              >
                {copiedKey === 'markdown' ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                Copy Markdown Badge
              </button>
            </div>
          )}

          {activeTab === 'raw' && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                Terminal / Bash One-Liner
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={curlCommand}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-custom-dark-border bg-slate-900 text-emerald-400 font-mono text-xs outline-none select-all"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(curlCommand, 'curl')}
                  className="btn-primary py-2 px-4 rounded-xl text-xs shrink-0"
                >
                  {copiedKey === 'curl' ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Streams raw code in plaintext directly to stdout. Pipe into node or python: <code>curl -sL "{rawApiUrl}" | node</code>
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-custom-dark-border bg-slate-50/50 dark:bg-custom-dark-surface/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary text-xs py-2 px-4 rounded-xl"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareEmbedModal;
