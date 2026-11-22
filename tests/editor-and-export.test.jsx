import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { getFileExtension, formatAsMarkdown } from '../src/utils/exportUtils';
import CheatSheetModal from '../src/components/CheatSheetModal';
import ExportModal from '../src/components/ExportModal';
import { ToastProvider } from '../src/context/ToastContext';

describe('Developer & Student Tools Test Suite', () => {
  const sampleSnippet = {
    _id: '507f1f77bcf86cd799439011',
    title: 'Quick Sort Implementation',
    description: 'Divide and conquer sorting algorithm',
    code: 'function quickSort(arr) { return arr; }',
    language: 'javascript',
    tags: ['algorithms', 'sorting'],
    author: { username: 'student_coder' },
    createdAt: new Date().toISOString(),
  };

  describe('1. File Extension & Export Utils', () => {
    it('maps programming languages to correct file extensions', () => {
      expect(getFileExtension('javascript')).toBe('js');
      expect(getFileExtension('python')).toBe('py');
      expect(getFileExtension('typescript')).toBe('ts');
      expect(getFileExtension('cpp')).toBe('cpp');
      expect(getFileExtension('java')).toBe('java');
      expect(getFileExtension('rust')).toBe('rs');
      expect(getFileExtension('go')).toBe('go');
      expect(getFileExtension('sql')).toBe('sql');
      expect(getFileExtension('html')).toBe('html');
      expect(getFileExtension('unknown_lang')).toBe('txt');
    });

    it('formats code as clean markdown with fences and metadata', () => {
      const md = formatAsMarkdown(sampleSnippet);
      expect(md).toContain('# Quick Sort Implementation');
      expect(md).toContain('Divide and conquer sorting algorithm');
      expect(md).toContain('Tags: #algorithms #sorting');
      expect(md).toContain('```javascript\nfunction quickSort(arr) { return arr; }\n```');
    });
  });

  describe('2. CheatSheetModal Component', () => {
    it('renders cheat sheet modal when open with default Big-O tab', () => {
      render(<CheatSheetModal isOpen={true} onClose={() => {}} />);
      expect(screen.getByText('Developer & Student Cheat Sheet')).toBeInTheDocument();
      expect(screen.getByText('Time & Space Complexity Reference')).toBeInTheDocument();
      expect(screen.getByText(/O\(1\) - Constant/i)).toBeInTheDocument();
      expect(screen.getByText(/O\(log n\) - Logarithmic/i)).toBeInTheDocument();
    });

    it('switches to Python Idioms and Git Cheatsheet tabs', () => {
      render(<CheatSheetModal isOpen={true} onClose={() => {}} />);
      
      const pythonTab = screen.getByText('Python Idioms');
      fireEvent.click(pythonTab);
      expect(screen.getByText(/# Comprehensions & Utilities/i)).toBeInTheDocument();

      const gitTab = screen.getByText('Git Cheatsheet');
      fireEvent.click(gitTab);
      expect(screen.getByText(/# Daily Git Workflow/i)).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
      const handleClose = vi.fn();
      render(<CheatSheetModal isOpen={true} onClose={handleClose} />);
      
      const closeButtons = screen.getAllByRole('button', { name: /close/i });
      fireEvent.click(closeButtons[0]);
      expect(handleClose).toHaveBeenCalled();
    });
  });

  describe('3. ExportModal Component', () => {
    it('renders export options for source file, markdown, and JSON', () => {
      render(
        <ToastProvider>
          <ExportModal isOpen={true} onClose={() => {}} snippet={sampleSnippet} />
        </ToastProvider>
      );

      expect(screen.getByText('Export Snippet')).toBeInTheDocument();
      expect(screen.getByText('Download as Source File')).toBeInTheDocument();
      expect(screen.getByText('Copy as Formatted Markdown')).toBeInTheDocument();
      expect(screen.getByText('Export Complete Metadata (JSON)')).toBeInTheDocument();
      expect(screen.getByText('Copy cURL Command')).toBeInTheDocument();
    });
  });
});
