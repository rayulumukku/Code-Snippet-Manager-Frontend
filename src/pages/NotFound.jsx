import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = '404 — Page Not Found | Code Snippet Manager';
  }, []);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 animate-fade-in">
      <div className="text-center max-w-md">
        {/* Animated 404 */}
        <div className="relative mb-8 select-none">
          <div className="text-[8rem] sm:text-[10rem] font-black gradient-text leading-none animate-fade-in-up">
            404
          </div>
          <div className="absolute inset-0 text-[8rem] sm:text-[10rem] font-black text-transparent leading-none"
               style={{ WebkitTextStroke: '2px rgba(255,69,0,0.15)' }}>
            404
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white mb-3">
          Page not found
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8 text-lg">
          Looks like this snippet escaped into the void. Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => navigate(-1)} className="btn-secondary">
            ← Go back
          </button>
          <Link to="/" className="btn-primary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M9 21V12h6v9" />
            </svg>
            Back to home
          </Link>
        </div>

        {/* Decorative code block */}
        <div className="mt-12 mx-auto max-w-xs bg-slate-900 rounded-xl p-4 text-left font-mono text-xs text-left opacity-70">
          <div className="text-slate-400 mb-1">// Page not found</div>
          <div><span className="text-purple-400">const</span> <span className="text-sky-300">page</span> <span className="text-white">= </span><span className="text-red-400">null</span><span className="text-white">;</span></div>
          <div><span className="text-purple-400">if</span> <span className="text-white">(!</span><span className="text-sky-300">page</span><span className="text-white">) {'{'}</span></div>
          <div className="pl-4"><span className="text-custom-orangered">throw</span> <span className="text-amber-300">Error</span><span className="text-white">(</span><span className="text-emerald-300">'404'</span><span className="text-white">);</span></div>
          <div><span className="text-white">{'}'}</span></div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
