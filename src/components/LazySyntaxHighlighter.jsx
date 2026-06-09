import { lazy, Suspense } from 'react';

// Code split react-syntax-highlighter by importing the Prism component dynamically
const PrismHighlighter = lazy(() =>
  import('react-syntax-highlighter').then((module) => ({ default: module.Prism }))
);

const LazySyntaxHighlighter = ({ children, language, style, customStyle, showLineNumbers = false, ...props }) => {
  // A clean, stylized fallback block matching oneDark dark mode theme
  const fallbackClass = "font-mono text-xs p-4 bg-slate-950 text-slate-300 rounded-xl overflow-hidden leading-relaxed whitespace-pre font-normal select-none";

  return (
    <Suspense
      fallback={
        <pre
          className={fallbackClass}
          style={{
            margin: customStyle?.margin !== undefined ? customStyle.margin : 0,
            maxHeight: customStyle?.maxHeight || 'none',
            borderRadius: customStyle?.borderRadius || '0.75rem',
            fontSize: customStyle?.fontSize || '0.75rem',
            overflow: 'hidden'
          }}
        >
          <code>{children}</code>
        </pre>
      }
    >
      <PrismHighlighter
        language={language}
        style={style}
        customStyle={customStyle}
        showLineNumbers={showLineNumbers}
        {...props}
      >
        {children}
      </PrismHighlighter>
    </Suspense>
  );
};

export default LazySyntaxHighlighter;
