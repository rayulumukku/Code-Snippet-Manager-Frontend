import React, { useMemo } from 'react';
import { FiActivity, FiX, FiCode, FiClock, FiFileText, FiCpu, FiCheckCircle } from 'react-icons/fi';
import { analyzeCodeMetrics } from '../utils/codeMetrics';

const CodeMetricsModal = ({ isOpen, onClose, code = '', language = '' }) => {
  const metrics = useMemo(() => analyzeCodeMetrics(code, language), [code, language]);

  if (!isOpen) return null;

  const getScoreBadgeColor = (color) => {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40';
      case 'amber':
        return 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40';
      case 'red':
        return 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/40';
      default:
        return 'bg-slate-100 dark:bg-custom-dark-surface text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-custom-dark-border';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-custom-dark-card border border-slate-200 dark:border-custom-dark-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-custom-dark-border bg-slate-50/50 dark:bg-custom-dark-surface/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-custom-orangered flex items-center justify-center border border-orange-500/20">
              <FiActivity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                Code Complexity & Health Metrics
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Automated AST structure & readability analysis
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Complexity Banner */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-custom-dark-surface/60 border border-slate-200/80 dark:border-custom-dark-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                Cyclomatic Complexity
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
                  {metrics.complexityScore}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  branching execution paths
                </span>
              </div>
            </div>
            <div className={`px-3.5 py-1.5 rounded-xl text-xs font-bold ${getScoreBadgeColor(metrics.complexityColor)} self-start sm:self-auto`}>
              Rating: {metrics.complexityLevel}
            </div>
          </div>

          {/* Stat Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-custom-dark-card border border-slate-200/80 dark:border-custom-dark-border shadow-xs">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mb-1">
                <FiCode className="w-3.5 h-3.5" /> Code Lines
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">
                {metrics.codeLines} <span className="text-xs font-normal text-slate-400">/ {metrics.totalLines}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-custom-dark-card border border-slate-200/80 dark:border-custom-dark-border shadow-xs">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mb-1">
                <FiFileText className="w-3.5 h-3.5" /> Comments
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">
                {metrics.commentRatio}%
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-custom-dark-card border border-slate-200/80 dark:border-custom-dark-border shadow-xs">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mb-1">
                <FiCpu className="w-3.5 h-3.5" /> Payload
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">
                {metrics.byteSize} <span className="text-xs font-normal text-slate-400">B</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-custom-dark-card border border-slate-200/80 dark:border-custom-dark-border shadow-xs">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mb-1">
                <FiClock className="w-3.5 h-3.5" /> Read Time
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">
                ~{metrics.readingTimeSeconds} <span className="text-xs font-normal text-slate-400">s</span>
              </div>
            </div>
          </div>

          {/* Actionable Health Insights */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Code Health & Architecture Insights
            </h3>
            <div className="space-y-2">
              {metrics.insights.map((insight, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-custom-dark-surface/40 border border-slate-200/70 dark:border-custom-dark-border/70 flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed"
                >
                  <FiCheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-custom-dark-border bg-slate-50/50 dark:bg-custom-dark-surface/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary text-xs py-2 px-4 rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CodeMetricsModal;
