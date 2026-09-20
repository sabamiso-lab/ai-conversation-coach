import { describe, it, expect } from 'vitest';
import { normalizeText, calculateTextMatchScore } from '../textMatcher';

describe('textMatcher utility', () => {
  describe('normalizeText', () => {
    it('normalizes punctuation, case, and whitespace', () => {
      expect(normalizeText('  Hello, World!  ')).toBe('hello world');
      expect(normalizeText("I'm fine.")).toBe('im fine');
      expect(normalizeText('')).toBe('');
      expect(normalizeText(null)).toBe('');
    });
  });

  describe('calculateTextMatchScore', () => {
    it('returns 100 for exact matches', () => {
      expect(calculateTextMatchScore('I want a coffee', 'I want a coffee')).toBe(100);
      expect(calculateTextMatchScore('I want a coffee.', 'I want a coffee')).toBe(100);
    });

    it('returns 100 when matching any accepted answer', () => {
      expect(calculateTextMatchScore("I'd like a coffee", 'I want a coffee', ["I'd like a coffee"])).toBe(100);
    });

    it('returns partial score for subset of matching words', () => {
      const score = calculateTextMatchScore('I want coffee', 'I want a hot coffee');
      // 3 of 5 words = 60%
      expect(score).toBe(60);
    });

    it('returns 0 for empty or completely mismatched inputs', () => {
      expect(calculateTextMatchScore('', 'I want a coffee')).toBe(0);
      expect(calculateTextMatchScore('completely different', 'I want a coffee')).toBe(0);
    });
  });
});
