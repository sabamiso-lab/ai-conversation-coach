import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  callGeminiApi,
  callGeminiApiWithGrounding,
  callGeminiJson,
  DEFAULT_MODEL,
  GeminiContent
} from '../client';

describe('services/ai/client.ts', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe('DEFAULT_MODEL', () => {
    it('is configured as gemini-3.5-flash-lite', () => {
      expect(DEFAULT_MODEL).toBe('gemini-3.5-flash-lite');
    });
  });

  describe('callGeminiApi', () => {
    const mockContents: GeminiContent[] = [
      { role: 'user', parts: [{ text: 'Hello AI' }] }
    ];

    it('sends correct request payload and returns candidate text on 200 OK', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: 'Hello, how can I help you today?' }]
              }
            }
          ]
        })
      } as unknown as Response);

      const result = await callGeminiApi(
        'test-api-key',
        'gemini-3.5-flash-lite',
        'You are a helpful tutor.',
        mockContents
      );

      expect(result).toBe('Hello, how can I help you today?');
      expect(globalThis.fetch).toHaveBeenCalledTimes(1);

      const [url, options] = vi.mocked(globalThis.fetch).mock.calls[0];
      expect(url).toContain('gemini-3.5-flash-lite:generateContent?key=test-api-key');

      const body = JSON.parse(options?.body as string);
      expect(body.contents).toEqual(mockContents);
      expect(body.systemInstruction.parts[0].text).toBe('You are a helpful tutor.');
      expect(body.generationConfig.temperature).toBe(0.7);
      expect(body.generationConfig.responseMimeType).toBeUndefined();
    });

    it('uses DEFAULT_MODEL when model parameter is undefined', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: 'Response' }] } }]
        })
      } as unknown as Response);

      await callGeminiApi('test-key', undefined, 'Instruction', mockContents);

      const [url] = vi.mocked(globalThis.fetch).mock.calls[0];
      expect(url).toContain(`models/${DEFAULT_MODEL}:generateContent?key=test-key`);
    });

    it('attaches responseSchema and responseMimeType when schema is provided', async () => {
      const testSchema = {
        type: 'OBJECT',
        properties: { answer: { type: 'STRING' } }
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: '{"answer": "yes"}' }] } }]
        })
      } as unknown as Response);

      const result = await callGeminiApi(
        'test-key',
        'gemini-3.5-flash-lite',
        'System instruction',
        mockContents,
        testSchema
      );

      expect(result).toBe('{"answer": "yes"}');

      const [, options] = vi.mocked(globalThis.fetch).mock.calls[0];
      const body = JSON.parse(options?.body as string);
      expect(body.generationConfig.responseMimeType).toBe('application/json');
      expect(body.generationConfig.responseSchema).toEqual(testSchema);
    });

    it('throws custom error message when API responds with error JSON', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({
          error: { message: 'API key not valid. Please pass a valid API key.' }
        })
      } as unknown as Response);

      await expect(
        callGeminiApi('invalid-key', undefined, 'Sys', mockContents)
      ).rejects.toThrow('API key not valid. Please pass a valid API key.');
    });

    it('falls back to status code error message when error JSON has no message', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({})
      } as unknown as Response);

      await expect(
        callGeminiApi('test-key', undefined, 'Sys', mockContents)
      ).rejects.toThrow('API Error: 500 Internal Server Error');
    });

    it('throws error when candidates array is empty or parts text is missing', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: []
        })
      } as unknown as Response);

      await expect(
        callGeminiApi('test-key', undefined, 'Sys', mockContents)
      ).rejects.toThrow('No response received from Gemini API.');
    });
  });

  describe('callGeminiApiWithGrounding', () => {
    it('sends googleSearch tool and extracts text and groundingMetadata', async () => {
      const mockMetadata = {
        webSearchQueries: ['Latest AI news 2026'],
        groundingChunks: [{ web: { uri: 'https://news.example.com', title: 'AI News' } }]
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: 'Here is the latest news.' }]
              },
              groundingMetadata: mockMetadata
            }
          ]
        })
      } as unknown as Response);

      const result = await callGeminiApiWithGrounding(
        'test-key',
        'gemini-3.5-flash-lite',
        'Find latest AI news'
      );

      expect(result.text).toBe('Here is the latest news.');
      expect(result.groundingMetadata).toEqual(mockMetadata);

      const [, options] = vi.mocked(globalThis.fetch).mock.calls[0];
      const body = JSON.parse(options?.body as string);
      expect(body.tools).toEqual([{ googleSearch: {} }]);
    });

    it('throws error on non-ok response in grounding call', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: async () => ({
          error: { message: 'Grounding search quota exceeded' }
        })
      } as unknown as Response);

      await expect(
        callGeminiApiWithGrounding('test-key', undefined, 'Query')
      ).rejects.toThrow('Grounding search quota exceeded');
    });
  });

  describe('callGeminiJson', () => {
    it('throws error when apiKey is empty', async () => {
      await expect(
        callGeminiJson('', undefined, 'System', [])
      ).rejects.toThrow('Gemini APIキーを設定してください。');
    });

    it('calls API and returns cleanly parsed JSON object', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: '```json\n{\n  "score": 95,\n  "status": "ok"\n}\n```' }]
              }
            }
          ]
        })
      } as unknown as Response);

      const result = await callGeminiJson<{ score: number; status: string }>(
        'test-key',
        'gemini-3.5-flash-lite',
        'System prompt',
        [{ parts: [{ text: 'prompt' }] }]
      );

      expect(result).toEqual({ score: 95, status: 'ok' });
    });
  });
});
