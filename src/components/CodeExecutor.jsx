import { useState, useRef, useEffect } from 'react';

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

  const executeJavaScript = () => {
    setOutput('');
    setError('');
    setIsRunning(true);

    setTimeout(() => {
      try {
        const logs = [];

        const sandboxConsole = {
          log: (...args) => {
            logs.push(args.map(arg => {
              if (arg === null) return 'null';
              if (arg === undefined) return 'undefined';
              if (typeof arg === 'object') {
                try {
                  return JSON.stringify(arg, null, 2);
                } catch {
                  return String(arg);
                }
              }
              return String(arg);
            }).join(' '));
          },
          error: (...args) => {
            logs.push('ERROR: ' + args.map(arg => {
              if (typeof arg === 'object') {
                try {
                  return JSON.stringify(arg, null, 2);
                } catch {
                  return String(arg);
                }
              }
              return String(arg);
            }).join(' '));
          },
          warn: (...args) => {
            logs.push('WARN: ' + args.map(arg => {
              if (typeof arg === 'object') {
                try {
                  return JSON.stringify(arg, null, 2);
                } catch {
                  return String(arg);
                }
              }
              return String(arg);
            }).join(' '));
          }
        };

        const sandbox = {
          console: sandboxConsole,
          setTimeout: setTimeout,
          clearTimeout: clearTimeout,
          setInterval: setInterval,
          clearInterval: clearInterval,
          Date: Date,
          Math: Math,
          JSON: JSON,
          Array: Array,
          Object: Object,
          String: String,
          Number: Number,
          Boolean: Boolean,
          RegExp: RegExp,
          Error: Error,
          Promise: Promise,
          parseInt: parseInt,
          parseFloat: parseFloat,
          isNaN: isNaN,
          isFinite: isFinite,
          encodeURIComponent: encodeURIComponent,
          decodeURIComponent: decodeURIComponent,
        };

        const wrappedCode = `
          (function() {
            try {
              const result = (function() {
                ${code}
              })();
              return { success: true, result: result };
            } catch (e) {
              return { success: false, error: e.message, stack: e.stack };
            }
          })();
        `;

        const func = new Function(...Object.keys(sandbox), `return ${wrappedCode}`);
        const executionResult = func(...Object.values(sandbox));

        if (!executionResult.success) {
          setError(executionResult.error || 'Execution error');
          if (executionResult.stack) {
            setOutput('Stack trace:\n' + executionResult.stack);
          }
        } else {
         
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
    }, 10);
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
        <h3 className="text-sm font-medium text-custom-black">Code Execution Preview</h3>
        <button
          onClick={handleRun}
          disabled={isRunning || !code}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          {isRunning ? 'Running...' : 'Run Code'}
        </button>
      </div>

      {showIframe && (
        <div className="border border-custom-grey rounded-lg overflow-hidden">
          <iframe
            ref={iframeRef}
            title="code-preview"
            sandbox="allow-same-origin allow-scripts"
            className="w-full h-64 border-0"
          />
        </div>
      )}

      {(output || error) && (
        <div className="border border-custom-grey rounded-lg overflow-hidden">
          <div className="bg-custom-cement px-4 py-2 text-sm font-medium text-custom-black">
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

