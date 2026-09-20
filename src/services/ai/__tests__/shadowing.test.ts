import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateShadowingScript, evaluateShadowingPerformance } from '../shadowing';
import * as clientModule from '../client';

describe('services/ai/shadowing.ts', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateShadowingScript', () => {
    it('throws error when apiKey is missing', async () => {
      await expect(
        generateShadowingScript({ apiKey: '' })
      ).rejects.toThrow('Gemini APIキーを設定してください。');
    });

    it('generates and structures a custom shadowing script', async () => {
      const mockResponse = JSON.stringify({
        title: 'Morning Routine',
        titleJa: '朝のルーティン',
        category: 'Custom AI',
        text: 'I wake up at seven and make coffee.',
        slashedText: 'I wake up / at seven / and make coffee.',
        translation: '私は7時に起きてコーヒーを淹れます。',
        tipsJa: 'wake upのリエゾンを意識しましょう。'
      });

      vi.spyOn(clientModule, 'callGeminiApi').mockResolvedValueOnce(mockResponse);

      const script = await generateShadowingScript({
        apiKey: 'test-key',
        topic: '朝の習慣',
        difficulty: 'Beginner'
      });

      expect(script.title).toBe('Morning Routine');
      expect(script.slashedText).toContain(' / ');
      expect(script.difficulty).toBe('Beginner');
      expect(script.difficultyLabel).toBe('🌱 初級');
    });
  });

  describe('evaluateShadowingPerformance', () => {
    it('throws error when apiKey is missing', async () => {
      await expect(
        evaluateShadowingPerformance({
          apiKey: '',
          originalText: 'Hello',
          userSpeechText: 'Hello'
        })
      ).rejects.toThrow('Gemini APIキーを設定してください。');
    });

    it('evaluates user speech and returns scores with strengths and improvements', async () => {
      const mockResponse = JSON.stringify({
        score: 92,
        feedbackJa: '素晴らしい発音とリズムです！',
        strengthsJa: ['自然なイントネーション', '明瞭な母音'],
        improvementsJa: ['文末の脱落に注意']
      });

      vi.spyOn(clientModule, 'callGeminiApi').mockResolvedValueOnce(mockResponse);

      const result = await evaluateShadowingPerformance({
        apiKey: 'test-key',
        originalText: 'I wake up at seven and make coffee.',
        userSpeechText: 'I wake up at 7 and make coffee.'
      });

      expect(result.score).toBe(92);
      expect(result.strengthsJa).toHaveLength(2);
      expect(result.feedbackJa).toBe('素晴らしい発音とリズムです！');
    });
  });
});
