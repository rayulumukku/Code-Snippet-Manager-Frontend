import React from 'react';
import { FiAlertTriangle, FiRefreshCw, FiHome } from 'react-icons/fi';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = (import.meta.env.BASE_URL || '/');
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-custom-dark-bg transition-colors duration-200">
          <div className="max-w-md w-full glass-strong rounded-2xl p-8 text-center shadow-2xl border border-slate-200 dark:border-white/10 animate-fade-in-up">
            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center shadow-inner">
              <FiAlertTriangle className="w-8 h-8" />
            </div>

            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
              An unexpected error occurred while rendering this page. Our team has been notified.
            </p>

            {this.state.error?.message && (
              <div className="mb-6 p-3 bg-red-50/70 dark:bg-red-950/40 border border-red-200/60 dark:border-red-800/40 rounded-xl text-left overflow-auto max-h-32">
                <p className="text-xs font-mono text-red-700 dark:text-red-300 break-words">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto btn-primary inline-flex items-center justify-center gap-2 text-sm"
              >
                <FiRefreshCw className="w-4 h-4" />
                Reload Page
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto btn-secondary inline-flex items-center justify-center gap-2 text-sm"
              >
                <FiHome className="w-4 h-4" />
                Back to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
