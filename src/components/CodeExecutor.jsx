import { useState, useRef, useEffect } from 'react';

/**
 * Strips TypeScript interfaces, type aliases, and type annotations
 * so standard JS evaluators can run the code without syntax errors.
 */
export const stripTypeScript = (code) => {
  if (!code) return '';
  let cleaned = code;
  // 1. Remove interfaces: interface Foo { ... }
  cleaned = cleaned.replace(/interface\s+[A-Za-z0-9_$]+(?:\s*<[^>]*>)?(?:\s+extends\s+[^{]+)?\s*\{[\s\S]*?\}/g, '');
  // 2. Remove type aliases: type Foo = ...;
  cleaned = cleaned.replace(/type\s+[A-Za-z0-9_$]+(?:\s*<[^>]*>)?\s*=\s*[\s\S]*?;/g, '');
  // 3. Remove 'as Type' type assertions
  cleaned = cleaned.replace(/\s+as\s+[A-Za-z0-9_$]+(?:\s*<[^>]*>)?(?:\[\])?/g, '');
  // 4. Remove variable type annotations: let/const/var x: Type =
  cleaned = cleaned.replace(/(\b(?:let|const|var)\s+[A-Za-z0-9_$]+)\s*:\s*[A-Za-z0-9_$<>[\s|&]+(?=\s*=)/g, '$1 ');
  // 5. Remove function parameter type annotations: (a: string, b: number = 1)
  cleaned = cleaned.replace(/(\b[A-Za-z0-9_$]+)\s*:\s*[A-Za-z0-9_$<>[\s|&]+(?=\s*[,)=])/g, '$1');
  // 6. Remove function return type annotations: ): Type { or ): Type =>
  cleaned = cleaned.replace(/\)\s*:\s*[A-Za-z0-9_$<>[\s|&]+\s*(?=[{=])/g, ') ');
  return cleaned;
};

/**
 * Runs JavaScript with an execution timeout guard (default: 2000ms)
 * using Web Worker when available, falling back gracefully in non-worker environments.
 */
export const runWithTimeout = (cleanCode, timeoutMs = 2000) => {
  return new Promise((resolve, reject) => {
    let timer = null;
    let worker = null;
    let workerUrl = null;

    try {
      if (typeof Worker !== 'undefined' && typeof Blob !== 'undefined' && typeof URL !== 'undefined') {
        const workerBlob = new Blob([`
          self.onmessage = function(e) {
            var logs = [];
            var customConsole = {
              log: function() {
                var args = Array.prototype.slice.call(arguments);
                logs.push(args.map(function(a) {
                  return (a !== null && typeof a === 'object') ? JSON.stringify(a, null, 2) : String(a);
                }).join(' '));
              },
              error: function() {
                var args = Array.prototype.slice.call(arguments);
                logs.push('ERROR: ' + args.map(function(a) {
                  return (a !== null && typeof a === 'object') ? JSON.stringify(a, null, 2) : String(a);
                }).join(' '));
              },
              warn: function() {
                var args = Array.prototype.slice.call(arguments);
                logs.push('WARN: ' + args.map(function(a) {
                  return (a !== null && typeof a === 'object') ? JSON.stringify(a, null, 2) : String(a);
                }).join(' '));
              }
            };
            try {
              var func = new Function('console', 'return (function() {\\n' + e.data + '\\n})();');
              var res = func(customConsole);
              self.postMessage({ success: true, result: res, logs: logs });
            } catch(err) {
              self.postMessage({ success: false, error: err.message, stack: err.stack, logs: logs });
            }
          };
        `], { type: 'application/javascript' });

        workerUrl = URL.createObjectURL(workerBlob);
        worker = new Worker(workerUrl);

        timer = setTimeout(() => {
          if (worker) {
            worker.terminate();
            try { URL.revokeObjectURL(workerUrl); } catch { /* ignore */ }
          }
          reject(new Error('Execution timed out: code took longer than ' + timeoutMs + 'ms to run.'));
        }, timeoutMs);

        worker.onmessage = function(event) {
          clearTimeout(timer);
          try { URL.revokeObjectURL(workerUrl); } catch { /* ignore */ }
          worker.terminate();
          resolve(event.data);
        };

        worker.onerror = function(err) {
          clearTimeout(timer);
          try { URL.revokeObjectURL(workerUrl); } catch { /* ignore */ }
          worker.terminate();
          reject(new Error(err.message || 'Worker execution error'));
        };

        worker.postMessage(cleanCode);
        return;
      }
    } catch {
      // Worker creation not supported, proceed to fallback
    }

    try {
      const logs = [];
      const customConsole = {
        log: (...args) => logs.push(args.map(a => (a !== null && typeof a === 'object') ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
        error: (...args) => logs.push('ERROR: ' + args.map(a => (a !== null && typeof a === 'object') ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
        warn: (...args) => logs.push('WARN: ' + args.map(a => (a !== null && typeof a === 'object') ? JSON.stringify(a, null, 2) : String(a)).join(' '))
      };
      const func = new Function('console', 'return (function() {\n' + cleanCode + '\n})();');
      const res = func(customConsole);
      resolve({ success: true, result: res, logs });
    } catch (err) {
      resolve({ success: false, error: err.message, stack: err.stack, logs: [] });
    }
  });
};

const CodeExecutor = ({ code, language }) => {
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const iframeRef = useRef(null);
  const outputRef = useRef(null);

  const safeLanguages = ['javascript', 'html', 'css', 'typescript'];

  const isSafeLanguage = safeLanguages.includes(language?.toLowerCase());

  useEffect(() => {
    setOutput('');
    setError('');
  }, [code, language]);

  const executeJavaScript = async () => {
    setOutput('');
    setError('');
    setIsRunning(true);

    try {
      const isTypeScript = language?.toLowerCase() === 'typescript';
      const codeToRun = isTypeScript ? stripTypeScript(code) : code;

      if (!codeToRun.trim()) {
        setOutput('Code executed successfully (no runnable statements)');
        setIsRunning(false);
        return;
      }

      const executionResult = await runWithTimeout(codeToRun, 2000);

      if (!executionResult.success) {
        setError(executionResult.error || 'Execution error');
        if (executionResult.stack) {
          setOutput('Stack trace:\n' + executionResult.stack);
        }
      } else {
        const logs = executionResult.logs || [];
        if (logs.length > 0) {
          setOutput(logs.join('\n'));
        }

        if (executionResult.result !== undefined) {
          const resultStr = typeof executionResult.result === 'object'
            ? JSON.stringify(executionResult.result, null, 2)
            : String(executionResult.result);

          if (logs.length > 0) {
            setOutput(prev => prev + '\n\nReturn value: ' + resultStr);
          } else {
            setOutput('Return value: ' + resultStr);
          }
        } else if (logs.length === 0) {
          setOutput('Code executed successfully (no output)');
        }
      }
    } catch (err) {
      setError(err.message || 'Execution error');
      setOutput('');
    } finally {
      setIsRunning(false);
    }
  };

  const executeHTML = () => {
    setOutput('');
    setError('');
    setIsRunning(true);

    try {
      if (!iframeRef.current) {
        setError('Iframe not available');
        setIsRunning(false);
        return;
      }

      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      
    
      iframeDoc.open();
      iframeDoc.write(code);
      iframeDoc.close();

      setOutput('HTML rendered in preview');
    } catch (err) {
      setError(err.message || 'Rendering error');
    } finally {
      setIsRunning(false);
    }
  };

  const executeCSS = () => {
    setOutput('');
    setError('');
    setIsRunning(true);

    try {
      if (!iframeRef.current) {
        setError('Iframe not available');
        setIsRunning(false);
        return;
      }

      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      
 
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>${code}</style>
        </head>
        <body>
          <h1>CSS Preview</h1>
          <p>This is a paragraph to preview your CSS styles.</p>
          <div class="box">Styled Box</div>
          <button>Styled Button</button>
        </body>
        </html>
      `;

      iframeDoc.open();
      iframeDoc.write(html);
      iframeDoc.close();

      setOutput('CSS rendered in preview');
    } catch (err) {
      setError(err.message || 'Rendering error');
    } finally {
      setIsRunning(false);
    }
  };

  const handleRun = () => {
    const lang = language?.toLowerCase();
    
    if (lang === 'javascript' || lang === 'typescript') {
      executeJavaScript();
    } else if (lang === 'html') {
      executeHTML();
    } else if (lang === 'css') {
      executeCSS();
    }
  };

  if (!isSafeLanguage || !code) {
    return null;
  }

  const lang = language?.toLowerCase();
  const showIframe = lang === 'html' || lang === 'css';

  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">Code Execution Preview</h3>
        <button
          onClick={handleRun}
          disabled={isRunning || !code}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          {isRunning ? 'Running...' : 'Run Code'}
        </button>
      </div>

      {showIframe && (
        <div className="border border-slate-200 dark:border-custom-dark-border rounded-lg overflow-hidden">
          <iframe
            ref={iframeRef}
            title="code-preview"
            sandbox="allow-same-origin allow-scripts"
            className="w-full h-64 border-0"
          />
        </div>
      )}

      {(output || error) && (
        <div className="border border-slate-200 dark:border-custom-dark-border rounded-lg overflow-hidden">
          <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-custom-dark-border">
            Output
          </div>
          <div
            ref={outputRef}
            className="p-4 bg-slate-900 text-green-400 font-mono text-sm overflow-auto max-h-64"
          >
            {error ? (
              <div className="text-red-400">Error: {error}</div>
            ) : (
              <pre className="whitespace-pre-wrap">{output}</pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeExecutor;

