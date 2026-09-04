import { Link } from 'react-router-dom';
import { FiCode, FiSearch, FiFolder, FiBookmark, FiExternalLink, FiHeart } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="mt-20 border-t border-slate-200/80 dark:border-custom-dark-border bg-slate-50/70 dark:bg-custom-dark-surface/40 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 group w-fit">
              <img src={`${import.meta.env.BASE_URL}logo.png`} alt="CSM Logo" className="w-9 h-9 rounded-full object-contain shadow-md group-hover:shadow-orange-500/40 transition-all" />
              <span className="text-lg font-bold gradient-text tracking-wide">
                Code Snippet Manager
              </span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              A modern, production-ready developer library to organize, discover, and share reusable code snippets and collections effortlessly.
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
              Quick Navigation
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="text-slate-600 dark:text-slate-300 hover:text-custom-orangered dark:hover:text-custom-orangered transition-colors inline-flex items-center gap-2">
                  <FiCode className="w-4 h-4 text-slate-400" /> Home
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-slate-600 dark:text-slate-300 hover:text-custom-orangered dark:hover:text-custom-orangered transition-colors inline-flex items-center gap-2">
                  <FiSearch className="w-4 h-4 text-slate-400" /> Search Library
                </Link>
              </li>
              <li>
                <Link to="/collections" className="text-slate-600 dark:text-slate-300 hover:text-custom-orangered dark:hover:text-custom-orangered transition-colors inline-flex items-center gap-2">
                  <FiFolder className="w-4 h-4 text-slate-400" /> Collections
                </Link>
              </li>
              <li>
                <Link to="/create" className="text-slate-600 dark:text-slate-300 hover:text-custom-orangered dark:hover:text-custom-orangered transition-colors inline-flex items-center gap-2">
                  <FiBookmark className="w-4 h-4 text-slate-400" /> Create Snippet
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Popular Languages */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
              Popular Languages
            </h3>
            <div className="flex flex-wrap gap-2">
              {['javascript', 'python', 'typescript', 'cpp', 'java', 'react', 'go', 'html', 'css', 'sql'].map((lang) => (
                <Link
                  key={lang}
                  to={`/search?language=${lang}`}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white dark:bg-custom-dark-card border border-slate-200 dark:border-custom-dark-border text-slate-600 dark:text-slate-300 hover:border-custom-orangered hover:text-custom-orangered transition-colors capitalize"
                >
                  {lang}
                </Link>
              ))}
            </div>
          </div>

          {/* Col 4: Portfolio Developer Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent border border-orange-200/70 dark:border-orange-900/30 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                Developer Portfolio
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                Built with precision, responsive UX, and optimized full-text indexing.
              </p>
            </div>
            <a
              href="https://rayulumukku.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-white gradient-bg shadow-md hover:shadow-orange-500/30 hover:opacity-95 transition-all cursor-pointer"
            >
              Visit Portfolio <FiExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Bottom Credits Bar */}
        <div className="pt-8 border-t border-slate-200/60 dark:border-custom-dark-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div>
            © 2025 Code Snippet Manager. All rights reserved.
          </div>

          {/* Developer Credit with Pointer Mode & Route to rayulumukku.com */}
          <div className="flex items-center gap-1.5 font-medium">
            <span>Developed by</span>
            <a
              href="https://rayulumukku.com"
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer font-bold gradient-text hover:underline inline-flex items-center gap-1 transition-all"
              title="Visit Rayulu Mukku's Portfolio (rayulumukku.com)"
            >
              Rayulu Mukku
              <FiExternalLink className="w-3 h-3 text-custom-orangered inline-block" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
