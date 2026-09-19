import { describe, expect, it } from 'vitest';
import { repairJson, truncateRepetitiveLoops, cleanPhrase } from '../gemini';

describe('gemini service (repairJson)', () => {
  it('parses standard valid JSON cleanly', () => {
    const jsonStr = '{"title": "Hello", "count": 42}';
    const result = repairJson(jsonStr);
    expect(result).toEqual({ title: 'Hello', count: 42 });
  });

  it('strips markdown code blocks before parsing', () => {
    const jsonStr = '```json\n{\n  "title": "Markdown JSON",\n  "active": true\n}\n```';
    const result = repairJson(jsonStr);
    expect(result).toEqual({ title: 'Markdown JSON', active: true });
  });

  it('extracts JSON when surrounded by conversational greetings and markdown code block', () => {
    const jsonWithCommentary = `Here is the requested data for you:\n\`\`\`json\n{\n  "title": "AI Response",\n  "status": "ready"\n}\n\`\`\`\nHope this helps! Let me know if you need anything else.`;
    const result = repairJson(jsonWithCommentary);
    expect(result).toEqual({ title: 'AI Response', status: 'ready' });
  });

  it('extracts raw JSON object surrounded by plain text commentary without markdown blocks', () => {
    const rawWithCommentary = `Certainly! Here is the JSON:\n{"name": "test", "score": 100}\nGood luck with your practice!`;
    const result = repairJson(rawWithCommentary);
    expect(result).toEqual({ name: 'test', score: 100 });
  });

  it('sanitizes unescaped newlines inside JSON string literals', () => {
    const rawWithNewlines = `{\n  "title": "First Line\nSecond Line",\n  "status": "ok"\n}`;
    const result = repairJson(rawWithNewlines);
    expect(result).toEqual({ title: 'First Line\nSecond Line', status: 'ok' });
  });

  it('auto-closes truncated string literals and unclosed JSON objects', () => {
    // Truncated string at end of JSON object (simulating Unterminated string error)
    const truncatedStr = `{\n  "title": "News Scenario",\n  "descriptionJa": "本日のトレンドニュースに関する議論で、最新のAI`;
    const result = repairJson(truncatedStr);
    expect(result.title).toBe('News Scenario');
    expect(result.descriptionJa).toBe('本日のトレンドニュースに関する議論で、最新のAI');
  });

  it('auto-closes truncated JSON inside array items', () => {
    const truncatedArray = `{\n  "title": "Test",\n  "goals": ["Goal 1", "Goal 2`;
    const result = repairJson(truncatedArray);
    expect(result.title).toBe('Test');
    expect(result.goals).toEqual(['Goal 1', 'Goal 2']);
  });

  it('auto-closes JSON with trailing comma after truncation', () => {
    const truncatedWithComma = `{\n  "title": "Test",\n  "goals": ["Goal 1"],\n`;
    const result = repairJson(truncatedWithComma);
    expect(result.title).toBe('Test');
    expect(result.goals).toEqual(['Goal 1']);
  });

  it('throws error for empty input', () => {
    expect(() => repairJson('')).toThrow('Empty response from API');
    expect(() => repairJson(null)).toThrow('Empty response from API');
  });

  it('re-throws syntax error if JSON cannot be repaired at all', () => {
    const unrepairable = `Random non-json text that cannot be parsed {{{`;
    expect(() => repairJson(unrepairable)).toThrow();
  });
});

describe('gemini service (truncateRepetitiveLoops)', () => {
  it('passes normal short feedback unchanged', () => {
    const normalText = '多少の文法ミスはありますが、意思は100%相手に伝わっています！自信を持って話し続けましょう！';
    expect(truncateRepetitiveLoops(normalText)).toBe(normalText);
  });

  it('detects and truncates repetitive praise loop', () => {
    const loopText = "素晴らしい！グッジョブ！お見事！バッチリ！最高！ナイス！ハッピー！素晴らしい！イエス！グッジョブ！素晴らしい！お見事！バッチリ！最高！ナイス！ハッピー！素晴らしい！イエス！グッジョブ！素晴らしい！お見事！バッチリ！最高！ナイス！ハッピー！";
    const cleaned = truncateRepetitiveLoops(loopText);
    expect(cleaned.length).toBeLessThan(loopText.length);
    expect(cleaned.includes('素晴らしい！')).toBe(true);
  });
});

describe('gemini service (cleanPhrase)', () => {
  it('cleans quotes, prefixes, and extra whitespace from simpleAlternative and betterPhrasing', () => {
    expect(cleanPhrase('"Could I get a water, please?"')).toBe('Could I get a water, please?');
    expect(cleanPhrase('1. "I want water."')).toBe('I want water.');
    expect(cleanPhrase('You can say: "Can I have some water?"')).toBe('Can I have some water?');
    expect(cleanPhrase(null)).toBe(null);
    expect(cleanPhrase('')).toBe(null);
  });
});

