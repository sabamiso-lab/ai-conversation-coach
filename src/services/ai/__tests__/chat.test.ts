import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendChatMessage, getHintSuggestions, generateSessionReport } from '../chat';
import * as clientModule from '../client';
import { Situation } from '../../../types';

describe('services/ai/chat.ts', () => {
  const mockSituation: Situation = {
    id: 'cafe-order',
    title: 'Cafe Coffee Order',
    titleJa: 'カフェでの注文',
    category: 'Daily',
    difficulty: 'Beginner',
    systemRole: 'Friendly Barista',
    descriptionJa: 'コーヒーを注文する',
    initialMessage: 'Hi! What can I get for you?',
    goals: ['Order coffee']
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('sendChatMessage', () => {
    it('throws error when apiKey is missing', async () => {
      await expect(
        sendChatMessage({
          apiKey: '',
          situation: mockSituation,
          history: [],
          userText: 'Hello'
        })
      ).rejects.toThrow('Gemini API key is required');
    });

    it('successfully calls Gemini and parses chat response', async () => {
      const mockResponse = JSON.stringify({
        aiResponseText: 'Sure! What size would you like?',
        aiResponseTranslation: 'かしこまりました！サイズはいかがなさいますか？',
        userTextTranslation: 'コーヒーを1つください。',
        clarityStatus: 'FULL',
        clarityBadgeJa: '🟢 100% 意図が伝わった！',
        clarityFeedbackJa: '素晴らしいです！簡潔で自然に伝わっています。',
        simpleAlternative: 'Can I have a coffee?',
        betterPhrasing: 'Could I get a coffee, please?',
        phrasingTip: 'Could I get... はカフェで最も自然な定番表現です。'
      });

      vi.spyOn(clientModule, 'callGeminiApi').mockResolvedValueOnce(mockResponse);

      const result = await sendChatMessage({
        apiKey: 'test-key',
        model: 'gemini-3.5-flash-lite',
        situation: mockSituation,
        history: [],
        userText: 'I want a coffee.'
      });

      expect(result.aiResponseText).toBe('Sure! What size would you like?');
      expect(result.clarityStatus).toBe('FULL');
      expect(result.clarityBadgeJa).toContain('100%');
      expect(result.simpleAlternative).toBe('Can I have a coffee?');
      expect(result.betterPhrasing).toBe('Could I get a coffee, please?');
    });

    it('cleans quotes and prefixes from suggested phrases', async () => {
      const mockResponse = JSON.stringify({
        aiResponseText: 'OK!',
        aiResponseTranslation: '了解！',
        userTextTranslation: 'テスト',
        clarityStatus: 'PARTIAL',
        clarityBadgeJa: '🟡 おおむね伝わった',
        clarityFeedbackJa: '伝わります。',
        simpleAlternative: '"One coffee, please."',
        betterPhrasing: '1. "May I have a coffee?"'
      });

      vi.spyOn(clientModule, 'callGeminiApi').mockResolvedValueOnce(mockResponse);

      const result = await sendChatMessage({
        apiKey: 'test-key',
        situation: mockSituation,
        history: [],
        userText: 'Coffee please.'
      });

      expect(result.simpleAlternative).toBe('One coffee, please.');
      expect(result.betterPhrasing).toBe('May I have a coffee?');
    });
  });

  describe('getHintSuggestions', () => {
    it('throws error when apiKey is missing', async () => {
      await expect(
        getHintSuggestions({
          apiKey: '',
          situation: mockSituation,
          history: []
        })
      ).rejects.toThrow('API Key required');
    });

    it('parses and returns 3 hint suggestions', async () => {
      const mockResponse = JSON.stringify([
        { english: 'A latte, please.', japanese: 'ラテをお願いします。', difficulty: 'Beginner' },
        { english: 'What roasts do you have?', japanese: 'どんな豆がありますか？', difficulty: 'Intermediate' }
      ]);

      vi.spyOn(clientModule, 'callGeminiApi').mockResolvedValueOnce(mockResponse);

      const result = await getHintSuggestions({
        apiKey: 'test-key',
        situation: mockSituation,
        history: []
      });

      expect(result).toHaveLength(2);
      expect(result[0].english).toBe('A latte, please.');
      expect(result[0].difficulty).toBe('Beginner');
    });
  });

  describe('generateSessionReport', () => {
    it('throws error when apiKey is missing', async () => {
      await expect(
        generateSessionReport({
          apiKey: '',
          situation: mockSituation,
          history: []
        })
      ).rejects.toThrow('API Key required');
    });

    it('parses and returns comprehensive session report', async () => {
      const mockReport = JSON.stringify({
        overallScore: 88,
        grammarScore: 85,
        vocabScore: 90,
        fluencyScore: 90,
        summaryJa: 'とてもスムーズな対話ができました。',
        strengthsJa: ['自然な挨拶', '的確な質問'],
        improvementsJa: ['冠詞の使い分け'],
        keyPhrases: [{ phrase: 'Could I get...', meaning: '〜をいただけますか？' }],
        goalsAchieved: [{ goal: 'Order coffee', achieved: true }]
      });

      vi.spyOn(clientModule, 'callGeminiApi').mockResolvedValueOnce(mockReport);

      const report = await generateSessionReport({
        apiKey: 'test-key',
        situation: mockSituation,
        history: [{ role: 'user', text: 'I want coffee.' }]
      });

      expect(report.overallScore).toBe(88);
      expect(report.goalsAchieved[0].achieved).toBe(true);
      expect(report.strengthsJa).toHaveLength(2);
    });
  });
});
