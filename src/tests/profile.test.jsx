import { describe, it, expect } from 'vitest';
import { normalizeGithubUrl } from '../pages/Profile';

describe('Profile URL Normalization & Logic', () => {
  describe('normalizeGithubUrl', () => {
    it('returns empty string for null, undefined, or empty input', () => {
      expect(normalizeGithubUrl(null)).toBe('');
      expect(normalizeGithubUrl(undefined)).toBe('');
      expect(normalizeGithubUrl('')).toBe('');
      expect(normalizeGithubUrl('   ')).toBe('');
    });

    it('normalizes plain username without prefix', () => {
      expect(normalizeGithubUrl('octocat')).toBe('https://github.com/octocat');
    });

    it('normalizes github.com/username without duplicate domain', () => {
      expect(normalizeGithubUrl('github.com/octocat')).toBe('https://github.com/octocat');
    });

    it('normalizes www.github.com/username without duplicate domain', () => {
      expect(normalizeGithubUrl('www.github.com/octocat')).toBe('https://github.com/octocat');
    });

    it('normalizes http://github.com/username to https://github.com/username', () => {
      expect(normalizeGithubUrl('http://github.com/octocat')).toBe('https://github.com/octocat');
    });

    it('preserves valid https://github.com/username without duplicate prefix', () => {
      expect(normalizeGithubUrl('https://github.com/octocat')).toBe('https://github.com/octocat');
    });

    it('handles leading and trailing whitespace properly', () => {
      expect(normalizeGithubUrl('  github.com/alice  ')).toBe('https://github.com/alice');
    });
  });
});
