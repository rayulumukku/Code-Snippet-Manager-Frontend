/**
 * Code Metrics & Complexity Analyzer
 * Analyzes code structure, volume, branching complexity, and readability for developers & students.
 */

export function analyzeCodeMetrics(code = '', language = '') {
  if (!code || typeof code !== 'string') {
    return {
      totalLines: 0,
      codeLines: 0,
      blankLines: 0,
      commentLines: 0,
      commentRatio: 0,
      charCount: 0,
      byteSize: 0,
      wordCount: 0,
      complexityScore: 1,
      complexityLevel: 'Low',
      complexityColor: 'emerald',
      readingTimeSeconds: 5,
      insights: ['Add code to analyze structure and complexity.'],
    };
  }

  const lines = code.split(/\r?\n/);
  const totalLines = lines.length;

  let blankLines = 0;
  let commentLines = 0;
  let inBlockComment = false;

  const isPython = ['python', 'py'].includes(language.toLowerCase());
  const isSQL = ['sql'].includes(language.toLowerCase());
  const isHTML = ['html', 'xml'].includes(language.toLowerCase());

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      blankLines++;
      continue;
    }

    if (inBlockComment) {
      commentLines++;
      if (trimmed.includes('*/') || (isHTML && trimmed.includes('-->')) || (isPython && (trimmed.includes('"""') || trimmed.includes("'''")))) {
        inBlockComment = false;
      }
      continue;
    }

    // Check single-line comments
    if (trimmed.startsWith('//') || (isPython && trimmed.startsWith('#')) || (isSQL && trimmed.startsWith('--'))) {
      commentLines++;
      continue;
    }

    // Check block comment start
    if (trimmed.startsWith('/*')) {
      commentLines++;
      if (!trimmed.endsWith('*/') || trimmed === '/*') {
        inBlockComment = true;
      }
      continue;
    }

    if (isPython && (trimmed.startsWith('"""') || trimmed.startsWith("'''"))) {
      commentLines++;
      if (trimmed.length > 3 && !trimmed.slice(3).includes(trimmed.slice(0, 3))) {
        inBlockComment = true;
      }
      continue;
    }

    if (isHTML && trimmed.startsWith('<!--')) {
      commentLines++;
      if (!trimmed.includes('-->')) {
        inBlockComment = true;
      }
      continue;
    }
  }

  const codeLines = Math.max(0, totalLines - blankLines - commentLines);
  const commentRatio = totalLines > 0 ? Math.round((commentLines / totalLines) * 100) : 0;
  const charCount = code.length;
  const byteSize = new Blob([code]).size;
  const wordCount = code.trim().split(/\s+/).filter(Boolean).length;

  // Branching & Cyclomatic Complexity estimate
  let branchCount = 1; // base complexity
  const branchPatterns = [
    /\bif\b/g,
    /\belse\s+if\b/g,
    /\belif\b/g,
    /\bfor\b/g,
    /\bwhile\b/g,
    /\bcase\b/g,
    /\bcatch\b/g,
    /\bexcept\b/g,
    /\bswitch\b/g,
    /&&/g,
    /\|\|/g,
    /\?/g, // ternary
  ];

  for (const pattern of branchPatterns) {
    const matches = code.match(pattern);
    if (matches) {
      branchCount += matches.length;
    }
  }

  // Deduct ternary if in regex or comments (heuristic clamp)
  const complexityScore = Math.max(1, branchCount);

  let complexityLevel = 'Low';
  let complexityColor = 'emerald';

  if (complexityScore >= 16) {
    complexityLevel = 'High (Complex)';
    complexityColor = 'red';
  } else if (complexityScore >= 8) {
    complexityLevel = 'Moderate';
    complexityColor = 'amber';
  }

  // Estimated reading time (~120 words per minute for code)
  const readingTimeSeconds = Math.max(5, Math.round((wordCount / 120) * 60));

  // Actionable Insights
  const insights = [];
  if (commentRatio < 10 && codeLines > 15) {
    insights.push('Low documentation ratio (< 10%). Consider adding explanatory comments for key logic.');
  } else if (commentRatio >= 20) {
    insights.push('Well-documented codebase with good comment coverage.');
  }

  if (complexityScore > 15) {
    insights.push('High cyclomatic branching. Decomposing nested branches into helper functions can improve testability.');
  } else if (complexityScore <= 5) {
    insights.push('Linear and readable control flow with minimal branching overhead.');
  }

  if (codeLines > 100) {
    insights.push('Snippet exceeds 100 code lines. Consider splitting into reusable sub-modules.');
  } else {
    insights.push('Compact snippet size suitable for quick developer integration.');
  }

  return {
    totalLines,
    codeLines,
    blankLines,
    commentLines,
    commentRatio,
    charCount,
    byteSize,
    wordCount,
    complexityScore,
    complexityLevel,
    complexityColor,
    readingTimeSeconds,
    insights,
  };
}
