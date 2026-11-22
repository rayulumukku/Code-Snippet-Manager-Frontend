import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Pagination, { getPaginationRange } from '../components/Pagination';

describe('Pagination Unit & Component Tests', () => {
  describe('getPaginationRange algorithm', () => {
    it('returns empty array if totalPages <= 0 or null', () => {
      expect(getPaginationRange(1, 0)).toEqual([]);
      expect(getPaginationRange(1, null)).toEqual([]);
    });

    it('returns all pages directly if totalPages <= 7', () => {
      expect(getPaginationRange(1, 5)).toEqual([1, 2, 3, 4, 5]);
      expect(getPaginationRange(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it('calculates sliding window with right ellipsis when at the start', () => {
      // currentPage = 1, totalPages = 10 -> window [1..3], then ellipsis, then 10
      const range = getPaginationRange(1, 10);
      expect(range).toContain(1);
      expect(range).toContain(2);
      expect(range).toContain(3);
      expect(range).toContain('...');
      expect(range).toContain(10);
      expect(range[range.length - 1]).toBe(10);
    });

    it('calculates sliding window with both ellipses when in the middle', () => {
      // currentPage = 6, totalPages = 12 -> 1, '...', 4, 5, 6, 7, 8, '...', 12
      const range = getPaginationRange(6, 12);
      expect(range[0]).toBe(1);
      expect(range[1]).toBe('...');
      expect(range).toEqual([1, '...', 4, 5, 6, 7, 8, '...', 12]);
    });

    it('calculates sliding window with left ellipsis when near the end', () => {
      // currentPage = 10, totalPages = 10 -> 1, '...', 8, 9, 10
      const range = getPaginationRange(10, 10);
      expect(range[0]).toBe(1);
      expect(range[1]).toBe('...');
      expect(range).toEqual([1, '...', 8, 9, 10]);
    });
  });

  describe('Pagination Component Rendering & Interactions', () => {
    it('renders null if totalPages <= 1', () => {
      const { container } = render(
        <Pagination currentPage={1} totalPages={1} onPageChange={() => {}} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders page buttons and triggers onPageChange on click', () => {
      const onPageChange = vi.fn();
      render(
        <Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />
      );

      const page3Btn = screen.getByRole('button', { name: '3' });
      fireEvent.click(page3Btn);
      expect(onPageChange).toHaveBeenCalledWith(3);
    });

    it('disables previous and first buttons when on page 1', () => {
      const onPageChange = vi.fn();
      render(
        <Pagination currentPage={1} totalPages={10} onPageChange={onPageChange} />
      );

      const firstBtn = screen.getByRole('button', { name: /first page/i });
      const prevBtn = screen.getByRole('button', { name: /previous page/i });
      expect(firstBtn).toBeDisabled();
      expect(prevBtn).toBeDisabled();

      const nextBtn = screen.getByRole('button', { name: /next page/i });
      const lastBtn = screen.getByRole('button', { name: /last page/i });
      expect(nextBtn).not.toBeDisabled();
      expect(lastBtn).not.toBeDisabled();

      fireEvent.click(nextBtn);
      expect(onPageChange).toHaveBeenCalledWith(2);

      fireEvent.click(lastBtn);
      expect(onPageChange).toHaveBeenCalledWith(10);
    });

    it('disables next and last buttons when on last page', () => {
      const onPageChange = vi.fn();
      render(
        <Pagination currentPage={10} totalPages={10} onPageChange={onPageChange} />
      );

      const nextBtn = screen.getByRole('button', { name: /next page/i });
      const lastBtn = screen.getByRole('button', { name: /last page/i });
      expect(nextBtn).toBeDisabled();
      expect(lastBtn).toBeDisabled();

      const prevBtn = screen.getByRole('button', { name: /previous page/i });
      fireEvent.click(prevBtn);
      expect(onPageChange).toHaveBeenCalledWith(9);
    });

    it('highlights active page with aria-current="page"', () => {
      render(
        <Pagination currentPage={3} totalPages={5} onPageChange={() => {}} />
      );
      const page3 = screen.getByRole('button', { name: '3' });
      expect(page3).toHaveAttribute('aria-current', 'page');

      const page2 = screen.getByRole('button', { name: '2' });
      expect(page2).not.toHaveAttribute('aria-current');
    });
  });
});
