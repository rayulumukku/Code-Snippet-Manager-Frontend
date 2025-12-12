import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { snippetsAPI } from '../services/api';
import SnippetCard from '../components/SnippetCard';

const Home = () => {
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    language: '',
    page: 1,
    limit: 12,
  });
  const [pagination, setPagination] = useState({});

  const languages = [
    'javascript',
    'python',
    'java',
    'typescript',
    'cpp',
    'c',
    'csharp',
    'go',
    'rust',
    'php',
    'html',
    'css',
    'sql',
  ];

  useEffect(() => {
    document.title = 'Home | Rayulu M';
  }, []);

  useEffect(() => {
    fetchSnippets();
  }, [filters]);

  const fetchSnippets = async () => {
    setLoading(true);
    try {
      const response = await snippetsAPI.getAll(filters);
      setSnippets(response.data.snippets);
      setPagination({
        totalPages: response.data.totalPages,
        currentPage: response.data.currentPage,
        total: response.data.total,
      });
    } catch (error) {
      console.error('Error fetching snippets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageFilter = (language) => {
    setFilters({ ...filters, language: filters.language === language ? '' : language, page: 1 });
  };

  const handlePageChange = (page) => {
    setFilters({ ...filters, page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <div className="mb-10 rounded-2xl border border-slate-200 dark:border-white/10 bg-gradient-to-br from-orange-50 to-white dark:from-slate-800/40 dark:to-slate-900 p-6 sm:p-10">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
          Find, save and share your best code snippets
        </h1>
        <p className="text-slate-600 dark:text-slate-300 max-w-2xl">
          Browse a curated collection of reusable pieces of code. Organize them into collections and quickly copy when you need them.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/create" className="inline-flex items-center gap-2 rounded-md bg-custom-orangered text-white px-4 py-2 text-sm font-medium hover:brightness-110 shadow-sm">
            Create snippet
          </Link>
          <Link to="/collections" className="inline-flex items-center gap-2 rounded-md border border-slate-200 dark:border-white/10 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
            Browse collections
          </Link>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleLanguageFilter('')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
              filters.language === ''
                ? 'bg-custom-orangered text-white border-transparent'
                : 'border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All
          </button>
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => handleLanguageFilter(lang)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize border transition ${
                filters.language === lang
                  ? 'bg-custom-orangered text-white border-transparent'
                  : 'border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-60 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : snippets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-600 dark:text-slate-300 text-lg">No snippets found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {snippets.map((snippet) => (
              <SnippetCard key={snippet._id} snippet={snippet} />
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-4 py-2 border border-slate-300 dark:border-white/10 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-slate-600 dark:text-slate-300">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-4 py-2 border border-slate-300 dark:border-white/10 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
