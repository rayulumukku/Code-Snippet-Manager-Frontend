/**
 * Student Active-Recall & Quiz Question Generator
 * Generates interactive concept, complexity, and edge-case quiz questions based on snippet context.
 */

export function generateSnippetQuiz(snippet) {
  if (!snippet) return [];

  const { title = 'Snippet', code = '', language = 'javascript' } = snippet;
  const lowerCode = code.toLowerCase();

  const questions = [];

  // Question 1: Time Complexity Question
  let expectedComplexity = 'O(n) - Linear';
  let complexityExplanation = 'The code contains a single linear traversal or standard iteration.';

  if (lowerCode.includes('while') && (lowerCode.includes('mid') || lowerCode.includes('>>') || lowerCode.includes('/ 2') || lowerCode.includes('math.floor'))) {
    expectedComplexity = 'O(log n) - Logarithmic';
    complexityExplanation = 'The search space is halved at each iteration, indicative of binary division or divide-and-conquer.';
  } else if ((lowerCode.match(/\bfor\b/g) || []).length >= 2 || lowerCode.includes('.flatmap')) {
    expectedComplexity = 'O(n²) - Quadratic';
    complexityExplanation = 'Nested loops traverse elements proportionally to n * n in the worst case.';
  } else if (!lowerCode.includes('for') && !lowerCode.includes('while') && !lowerCode.includes('.map') && !lowerCode.includes('.reduce')) {
    expectedComplexity = 'O(1) - Constant';
    complexityExplanation = 'The logic executes in a fixed number of operations regardless of input size.';
  }

  const complexityOptions = [
    'O(1) - Constant',
    'O(log n) - Logarithmic',
    'O(n) - Linear',
    'O(n²) - Quadratic',
  ];

  questions.push({
    id: 'complexity',
    type: 'single',
    question: `What is the expected asymptotic Time Complexity of "${title}"?`,
    options: complexityOptions,
    correctAnswer: expectedComplexity,
    explanation: complexityExplanation,
    category: 'Big-O Analysis',
  });

  // Question 2: Edge Case Analysis
  let primaryEdgeCase = 'Empty or null/undefined input';
  let edgeCaseReason = 'Functions receiving dynamic data collections should always safeguard against null or length-zero payloads.';

  if (lowerCode.includes('/') || lowerCode.includes('%')) {
    primaryEdgeCase = 'Division by zero or floating-point precision loss';
    edgeCaseReason = 'Arithmetic division operations must guard against 0 denominators to prevent runtime exceptions.';
  } else if (lowerCode.includes('find') || lowerCode.includes('indexof') || lowerCode.includes('includes')) {
    primaryEdgeCase = 'Element not found (missing key or -1 index)';
    edgeCaseReason = 'Lookup methods can return -1 or undefined when the requested key or needle does not exist.';
  } else if (lowerCode.includes('async') || lowerCode.includes('promise') || lowerCode.includes('fetch')) {
    primaryEdgeCase = 'Network timeout or unhandled promise rejection';
    edgeCaseReason = 'Asynchronous operations rely on external I/O and require robust try/catch or .catch() boundaries.';
  }

  questions.push({
    id: 'edge-case',
    type: 'single',
    question: `Which edge-case is most critical to validate when executing this ${language} snippet?`,
    options: [
      primaryEdgeCase,
      'Memory stack overflow from unlimited threads',
      'Cyclic graph loops during serial XML conversion',
      'CPU architecture endianness mismatch',
    ].sort(() => 0.5 - Math.random()),
    correctAnswer: primaryEdgeCase,
    explanation: edgeCaseReason,
    category: 'Edge Case Testing',
  });

  // Question 3: Paradigm & Language Feature
  let paradigmConcept = 'Functional data transformation';
  let paradigmDetail = 'Using first-class functions and transformation pipelines to produce immutable results.';

  if (lowerCode.includes('class ') || lowerCode.includes('this.') || lowerCode.includes('constructor')) {
    paradigmConcept = 'Object-Oriented Programming (OOP) Encapsulation';
    paradigmDetail = 'Utilizes class instances and encapsulated member state.';
  } else if (lowerCode.includes('async') || lowerCode.includes('await') || lowerCode.includes('promise')) {
    paradigmConcept = 'Asynchronous non-blocking event-driven execution';
    paradigmDetail = 'Leverages the event loop and task queue for non-blocking asynchronous I/O.';
  } else if (lowerCode.includes('memo') || lowerCode.includes('cache') || lowerCode.includes('dp')) {
    paradigmConcept = 'Dynamic Programming & Memoization';
    paradigmDetail = 'Caches previously computed subproblem outcomes to optimize exponential overlapping work.';
  }

  questions.push({
    id: 'paradigm',
    type: 'single',
    question: `Which core programming paradigm or design technique is highlighted in this snippet?`,
    options: [
      paradigmConcept,
      'Actor model concurrency',
      'Procedural assembly macro expansion',
      'Aspect-Oriented byte compilation',
    ].sort(() => 0.5 - Math.random()),
    correctAnswer: paradigmConcept,
    explanation: paradigmDetail,
    category: 'Software Design',
  });

  return questions;
}
