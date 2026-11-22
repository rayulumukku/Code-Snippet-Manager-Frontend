import { useState } from 'react';
import { FiX, FiBookOpen, FiCode, FiLayers, FiServer, FiTerminal } from 'react-icons/fi';

const TABS = [
  { id: 'bigo', label: 'Big-O Complexity', icon: FiLayers },
  { id: 'js', label: 'JavaScript Array & Async', icon: FiCode },
  { id: 'python', label: 'Python Idioms', icon: FiBookOpen },
  { id: 'git', label: 'Git Cheatsheet', icon: FiTerminal },
  { id: 'http', label: 'HTTP Status Codes', icon: FiServer },
];

const CheatSheetModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('bigo');

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="glass-strong rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 dark:border-custom-dark-border overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-custom-dark-border bg-slate-50 dark:bg-custom-dark-surface">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white text-sm">
              <FiBookOpen />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Developer & Student Cheat Sheet</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Quick syntax, Big-O reference, and daily shortcuts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation: Modern segmented pill container without one-sided border highlights */}
        <div className="px-6 pt-4 pb-1">
          <div className="flex items-center p-1.5 bg-slate-100 dark:bg-custom-dark-surface rounded-2xl gap-1.5 overflow-x-auto scrollbar-none border border-slate-200/80 dark:border-custom-dark-border/80">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-white dark:bg-custom-dark-card text-custom-orangered font-bold shadow-xs border border-slate-200/60 dark:border-custom-dark-border/60'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/40 dark:hover:bg-custom-dark-card/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm">
          {activeTab === 'bigo' && (
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Time & Space Complexity Reference</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-emerald-950/20">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm">O(1) - Constant</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 font-medium">Excellent</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Array index access, hash map get/put, stack push/pop</p>
                </div>

                <div className="p-3 rounded-xl border border-blue-200 dark:border-blue-800/40 bg-blue-50/50 dark:bg-blue-950/20">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-blue-700 dark:text-blue-400 text-sm">O(log n) - Logarithmic</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 font-medium">Great</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Binary search, balanced binary search tree lookup</p>
                </div>

                <div className="p-3 rounded-xl border border-amber-200 dark:border-amber-800/40 bg-amber-50/50 dark:bg-amber-950/20">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-amber-700 dark:text-amber-400 text-sm">O(n) - Linear</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-300 font-medium">Fair</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Iterating over an array, linear search, tree traversal</p>
                </div>

                <div className="p-3 rounded-xl border border-indigo-200 dark:border-indigo-800/40 bg-indigo-50/50 dark:bg-indigo-950/20">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-indigo-700 dark:text-indigo-400 text-sm">O(n log n) - Linearithmic</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-300 font-medium">Good</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Merge Sort, Quick Sort (average), Heap Sort</p>
                </div>

                <div className="p-3 rounded-xl border border-red-200 dark:border-red-800/40 bg-red-50/50 dark:bg-red-950/20">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-red-700 dark:text-red-400 text-sm">O(n²) - Quadratic</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 font-medium">Poor</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Nested loops, bubble sort, pairwise comparisons</p>
                </div>

                <div className="p-3 rounded-xl border border-rose-200 dark:border-rose-800/40 bg-rose-50/50 dark:bg-rose-950/20">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-rose-700 dark:text-rose-400 text-sm">O(2ⁿ) - Exponential</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-300 font-medium">Avoid</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Recursive Fibonacci without memoization, power set</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'js' && (
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-900 text-slate-200 space-y-2">
                <p className="text-emerald-400 font-bold">// Array Transformations</p>
                <p>const doubled = arr.map(x =&gt; x * 2);</p>
                <p>const evens = arr.filter(x =&gt; x % 2 === 0);</p>
                <p>const sum = arr.reduce((acc, curr) =&gt; acc + curr, 0);</p>
                <p>const exists = arr.some(x =&gt; x &gt; 10);</p>
                <p>const allPositive = arr.every(x =&gt; x &gt; 0);</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 text-slate-200 space-y-2">
                <p className="text-emerald-400 font-bold">// Promise & Async</p>
                <p>const [users, posts] = await Promise.all([fetchUsers(), fetchPosts()]);</p>
                <p>const result = await Promise.race([fetchData(), timeoutPromise]);</p>
              </div>
            </div>
          )}

          {activeTab === 'python' && (
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-900 text-slate-200 space-y-2">
                <p className="text-emerald-400 font-bold"># Comprehensions & Utilities</p>
                <p>squares = [x**2 for x in range(10) if x % 2 == 0]</p>
                <p>lookup = &#123;item['id']: item for item in items&#125;</p>
                <p>for idx, val in enumerate(items, start=1): print(idx, val)</p>
                <p>for name, score in zip(names, scores): print(name, score)</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 text-slate-200 space-y-2">
                <p className="text-emerald-400 font-bold"># Collections & Functools</p>
                <p>from collections import defaultdict, Counter</p>
                <p>counts = Counter(['apple', 'banana', 'apple']) # Counter(&#123;'apple': 2&#125;)</p>
                <p>from functools import lru_cache</p>
                <p>@lru_cache(maxsize=128)</p>
                <p>def fib(n): return n if n &lt; 2 else fib(n-1) + fib(n-2)</p>
              </div>
            </div>
          )}

          {activeTab === 'git' && (
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-900 text-slate-200 space-y-2">
                <p className="text-emerald-400 font-bold"># Daily Git Workflow</p>
                <p>git checkout -b feature/my-branch</p>
                <p>git add -A && git commit -m "feat: implement feature"</p>
                <p>git pull --rebase origin main</p>
                <p>git push -u origin feature/my-branch</p>
                <p className="text-emerald-400 font-bold mt-2"># Stashing & Cleanup</p>
                <p>git stash save "WIP work" && git stash pop</p>
                <p>git reset --soft HEAD~1 # Undo commit, keep changes staged</p>
              </div>
            </div>
          )}

          {activeTab === 'http' && (
            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">200 OK</span>: Successful request
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">201 Created</span>: New resource created
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">400 Bad Request</span>: Invalid payload/validation
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">401 Unauthorized</span>: Missing/invalid token
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">403 Forbidden</span>: Insufficient permissions
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">404 Not Found</span>: Endpoint or item missing
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400">429 Rate Limited</span>: Too many requests
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400">500 Server Error</span>: Unexpected backend exception
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-custom-dark-border bg-slate-50 dark:bg-custom-dark-surface flex justify-end">
          <button
            onClick={onClose}
            className="btn-secondary text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheatSheetModal;
