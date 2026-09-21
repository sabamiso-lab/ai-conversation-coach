import { describe, it, expect } from 'vitest';
import {
  cleanTranscript,
  deduplicateConsecutiveWords,
  mergeTranscripts,
  normalizeWord
} from '../transcriptUtils';

describe('transcriptUtils module', () => {
  describe('normalizeWord', () => {
    it('lowercases and removes surrounding punctuation', () => {
      expect(normalizeWord('Hello,')).toBe('hello');
      expect(normalizeWord('WORLD!')).toBe('world');
      expect(normalizeWord('...what?')).toBe('what');
      expect(normalizeWord('test-case')).toBe('test-case');
    });
  });

  describe('deduplicateConsecutiveWords', () => {
    it('removes immediate repeated words within a string', () => {
      expect(deduplicateConsecutiveWords('hello hello')).toBe('hello');
      expect(deduplicateConsecutiveWords('apple apple apple')).toBe('apple');
      expect(deduplicateConsecutiveWords('Hello hello world')).toBe('Hello world');
      expect(deduplicateConsecutiveWords('I like like apples')).toBe('I like apples');
    });

    it('preserves words with punctuation where appropriate', () => {
      expect(deduplicateConsecutiveWords('hello hello,')).toBe('hello,');
      expect(deduplicateConsecutiveWords('yes, yes')).toBe('yes,');
    });

    it('handles empty or single word string correctly', () => {
      expect(deduplicateConsecutiveWords('')).toBe('');
      expect(deduplicateConsecutiveWords('single')).toBe('single');
    });
  });

  describe('cleanTranscript', () => {
    it('trims and normalizes multiple spaces while deduplicating words', () => {
      expect(cleanTranscript('   hello    hello   ')).toBe('hello');
      expect(cleanTranscript('  this  is   a   test  ')).toBe('this is a test');
    });
  });

  describe('mergeTranscripts', () => {
    it('returns addition when base is empty', () => {
      expect(mergeTranscripts('', 'Hello world')).toBe('Hello world');
      expect(mergeTranscripts('   ', 'Hello world')).toBe('Hello world');
    });

    it('returns base when addition is empty', () => {
      expect(mergeTranscripts('Hello world', '')).toBe('Hello world');
      expect(mergeTranscripts('Hello world', '   ')).toBe('Hello world');
    });

    it('handles exact match without duplication', () => {
      expect(mergeTranscripts('Hello', 'Hello')).toBe('Hello');
      expect(mergeTranscripts('Hello', 'hello')).toBe('Hello');
      expect(mergeTranscripts('Thank you', 'thank you')).toBe('Thank you');
    });

    it('merges prefix addition without repeating prefix', () => {
      expect(mergeTranscripts('Hello', 'hello world')).toBe('Hello world');
      expect(mergeTranscripts('I think', 'I think that is good')).toBe('I think that is good');
    });

    it('returns base when addition is already subsumed at the end of base', () => {
      expect(mergeTranscripts('Hello world', 'world')).toBe('Hello world');
      expect(mergeTranscripts('I am very happy', 'happy')).toBe('I am very happy');
    });

    it('detects and eliminates word-level overlap at boundaries', () => {
      expect(mergeTranscripts('I want to', 'to eat an apple')).toBe('I want to eat an apple');
      expect(mergeTranscripts('How are', 'are you doing')).toBe('How are you doing');
      expect(mergeTranscripts('I would like to', 'like to have coffee')).toBe('I would like to have coffee');
    });

    it('joins with space when there is no overlap', () => {
      expect(mergeTranscripts('Hello', 'world')).toBe('Hello world');
      expect(mergeTranscripts('Good morning.', 'How are you?')).toBe('Good morning. How are you?');
    });

    it('prevents duplicate word when user re-speaks or browser echoes single word', () => {
      expect(mergeTranscripts('apple', 'apple')).toBe('apple');
      expect(mergeTranscripts('apple', 'apple apple')).toBe('apple');
      expect(mergeTranscripts('hello', 'hello')).toBe('hello');
    });
  });
});
