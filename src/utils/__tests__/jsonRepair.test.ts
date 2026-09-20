import { describe, it, expect } from 'vitest';
import {
  cleanAndParseJson,
  sanitizeControlChars,
  autoCloseJson,
  truncateRepetitiveLoops,
  cleanPhrase
} from '../jsonRepair';

describe('utils/jsonRepair.ts', () => {
  describe('sanitizeControlChars', () => {
    it('escapes unescaped raw newlines inside quoted strings', () => {
      const input = '{"desc": "Line 1\nLine 2"}';
      const output = sanitizeControlChars(input);
      expect(output).toBe('{"desc": "Line 1\\nLine 2"}');
    });

    it('preserves already escaped newlines', () => {
      const input = '{"desc": "Line 1\\nLine 2"}';
      const output = sanitizeControlChars(input);
      expect(output).toBe('{"desc": "Line 1\\nLine 2"}');
    });
  });

  describe('autoCloseJson', () => {
    it('auto-closes truncated string and object brace', () => {
      const truncated = '{"message": "Incomplete text';
      const repaired = autoCloseJson(truncated);
      expect(repaired).toBe('{"message": "Incomplete text"}');
      expect(JSON.parse(repaired)).toEqual({ message: 'Incomplete text' });
    });

    it('auto-closes nested array and objects', () => {
      const truncated = '{"items": [{"id": 1}, {"id": 2';
      const repaired = autoCloseJson(truncated);
      expect(JSON.parse(repaired)).toEqual({ items: [{ id: 1 }, { id: 2 }] });
    });

    it('strips trailing comma before auto-closing', () => {
      const truncated = '{"items": [1, 2, ';
      const repaired = autoCloseJson(truncated);
      expect(JSON.parse(repaired)).toEqual({ items: [1, 2] });
    });
  });

  describe('cleanAndParseJson', () => {
    it('parses valid json string directly', () => {
      const json = '{"success": true, "count": 10}';
      expect(cleanAndParseJson(json)).toEqual({ success: true, count: 10 });
    });

    it('strips markdown code blocks and conversational filler text', () => {
      const input = `Sure! Here is the JSON response:\n\`\`\`json\n{"status": "ok"}\n\`\`\`\nLet me know if you need more!`;
      expect(cleanAndParseJson(input)).toEqual({ status: 'ok' });
    });
  });

  describe('truncateRepetitiveLoops & cleanPhrase', () => {
    it('leaves normal non-repetitive text intact', () => {
      const text = 'よく頑張りました。次の質問に進みましょう。';
      expect(truncateRepetitiveLoops(text)).toBe(text);
    });

    it('cleans enclosing quotes and list numbers from phrases', () => {
      expect(cleanPhrase('"Hello, world!"')).toBe('Hello, world!');
      expect(cleanPhrase('1. "Good morning."')).toBe('Good morning.');
    });
  });
});
