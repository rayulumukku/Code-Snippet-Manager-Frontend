import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { analyzeCodeMetrics } from '../src/utils/codeMetrics';
import { generateSnippetQuiz } from '../src/utils/quizGenerator';
import CodeMetricsModal from '../src/components/CodeMetricsModal';
import StudentQuizModal from '../src/components/StudentQuizModal';
import ShareEmbedModal from '../src/components/ShareEmbedModal';
import { ToastProvider } from '../src/context/ToastContext';

describe('Advanced Developer & Student Features Test Suite', () => {
  const sampleSnippet = {
    _id: 'snip-12345',
    title: 'Binary Search Implementation',
    description: 'Efficient logarithmic search in sorted array',
    language: 'javascript',
    code: `// Binary Search in sorted array
function binarySearch(arr, target) {
  let low = 0;
  let high = arr.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return -1;
}`,
  };

  describe('1. Code Metrics & Complexity Analyzer', () => {
    it('correctly calculates lines of code, comments, and complexity score', () => {
      const metrics = analyzeCodeMetrics(sampleSnippet.code, sampleSnippet.language);

      expect(metrics.totalLines).toBeGreaterThan(15);
      expect(metrics.commentLines).toBe(1);
      expect(metrics.blankLines).toBe(2);
      expect(metrics.complexityScore).toBeGreaterThan(3);
      expect(metrics.complexityLevel).toBeDefined();
      expect(metrics.byteSize).toBeGreaterThan(0);
      expect(metrics.readingTimeSeconds).toBeGreaterThan(0);
      expect(metrics.insights.length).toBeGreaterThan(0);
    });

    it('handles empty code safely without throwing', () => {
      const metrics = analyzeCodeMetrics('', 'javascript');
      expect(metrics.totalLines).toBe(0);
      expect(metrics.codeLines).toBe(0);
      expect(metrics.complexityScore).toBe(1);
    });

    it('renders CodeMetricsModal with correct metrics and rating', () => {
      render(
        <CodeMetricsModal
          isOpen={true}
          onClose={vi.fn()}
          code={sampleSnippet.code}
          language={sampleSnippet.language}
        />
      );

      expect(screen.getByText(/Code Complexity & Health Metrics/i)).toBeInTheDocument();
      expect(screen.getByText(/Cyclomatic Complexity/i)).toBeInTheDocument();
      expect(screen.getByText(/Code Lines/i)).toBeInTheDocument();
      expect(screen.getByText(/Comments/i)).toBeInTheDocument();
    });
  });

  describe('2. Student Active-Recall & Quiz Mode', () => {
    it('generates context-aware quiz questions for binary search', () => {
      const questions = generateSnippetQuiz(sampleSnippet);

      expect(questions.length).toBeGreaterThanOrEqual(3);
      const complexityQ = questions.find((q) => q.id === 'complexity');
      expect(complexityQ).toBeDefined();
      expect(complexityQ.correctAnswer).toBe('O(log n) - Logarithmic');

      const edgeCaseQ = questions.find((q) => q.id === 'edge-case');
      expect(edgeCaseQ).toBeDefined();
      expect(edgeCaseQ.correctAnswer).toBeDefined();
    });

    it('allows student to select answers and view instant feedback', () => {
      render(
        <StudentQuizModal
          isOpen={true}
          onClose={vi.fn()}
          snippet={sampleSnippet}
        />
      );

      expect(screen.getByText(/Student Practice & Quiz Mode/i)).toBeInTheDocument();
      const optionButtons = screen.getAllByRole('button');
      // Find the logarithmic option button
      const logOption = optionButtons.find((btn) => btn.textContent.includes('O(log n)'));
      expect(logOption).toBeDefined();

      fireEvent.click(logOption);
      // Feedback explanation should appear
      expect(screen.getByText(/Correct Analysis!|Answer Insight/i)).toBeInTheDocument();
    });
  });

  describe('3. Share & Responsive Embed Suite', () => {
    it('generates responsive iframe embed code and raw API links', () => {
      render(
        <ToastProvider>
          <ShareEmbedModal
            isOpen={true}
            onClose={vi.fn()}
            snippet={sampleSnippet}
          />
        </ToastProvider>
      );

      expect(screen.getByText(/Share & Embed Snippet/i)).toBeInTheDocument();
      expect(screen.getByText(/Share Link/i)).toBeInTheDocument();
      expect(screen.getByText(/HTML Embed/i)).toBeInTheDocument();
      expect(screen.getByText(/Markdown Badge/i)).toBeInTheDocument();
      expect(screen.getByText(/cURL & CLI/i)).toBeInTheDocument();

      // Switch to HTML Embed
      fireEvent.click(screen.getByText(/HTML Embed/i));
      expect(screen.getByText(/Copy iframe Embed Code/i)).toBeInTheDocument();

      // Switch to cURL tab
      fireEvent.click(screen.getByText(/cURL & CLI/i));
      expect(screen.getByText(/Terminal \/ Bash One-Liner/i)).toBeInTheDocument();
    });
  });
});
