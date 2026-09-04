import { useState, useEffect } from 'react';

const Loader = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // Loader will show for 2 seconds

    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-slate-950 transition-all duration-700">
      <div className="relative flex flex-col items-center">
        {/* Logo Container */}
        <div className="relative h-24 w-24 animate-pulse">
          <img 
            src={`${import.meta.env.BASE_URL}logo.png`} 
            alt="Logo" 
            className="h-full w-full rounded-full object-contain shadow-xl ring-4 ring-orange-500/20"
          />
        </div>
      </div>
    </div>
  );
};

export default Loader;
