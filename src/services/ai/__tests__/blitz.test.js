import { describe, it, expect, vi } from 'vitest';
import { evaluateBlitzSpeech, generateBlitzQuestions } from '../blitz';
import * as clientModule from '../client';

describe('services/ai/blitz.js', () => {
  describe('evaluateBlitzSpeech', () => {
    it('throws error when apiKey is missing', async () => {
      await expect(
        evaluateBlitzSpeech({
          apiKey: '',
          prompt: 'テスト',
          standardAnswer: 'Test',
          userSpeech: 'Test'
        })
      ).rejects.toThrow('Gemini APIキーを設定してください。');
    });

    it('throws error when userSpeech is empty', async () => {
      await expect(
        evaluateBlitzSpeech({
          apiKey: 'fake-key',
          prompt: 'テスト',
          standardAnswer: 'Test',
          userSpeech: '   '
        })
      ).rejects.toThrow('ユーザーの発話内容がありません。');
    });

    it('successfully calls Gemini API and returns structured evaluation', async () => {
      const mockApiResponse = JSON.stringify({
        isCorrect: true,
        status: 'PERFECT',
        statusLabelJa: '🎉 完璧！',
        score: 95,
        evaluationJa: '自然で的確な表現です。',
        improvedSpeech: 'I should have woken up earlier.',
        grammarAdviceJa: 'should have + 過去分詞の使い方が正確です。'
      });

      const callGeminiSpy = vi.spyOn(clientModule, 'callGeminiApi').mockResolvedValueOnce(mockApiResponse);

      const result = await evaluateBlitzSpeech({
        apiKey: 'test-api-key',
        model: 'gemini-3.5-flash-lite',
        prompt: 'もっと早く起きるべきでした。',
        standardAnswer: 'I should have woken up earlier.',
        acceptedAnswers: ['I ought to have woken up earlier.'],
        grammarPoint: 'should have + p.p.',
        userSpeech: 'I should have woken up earlier.'
      });

      expect(callGeminiSpy).toHaveBeenCalled();
      expect(result.isCorrect).toBe(true);
      expect(result.status).toBe('PERFECT');
      expect(result.score).toBe(95);
      expect(result.evaluationJa).toBe('自然で的確な表現です。');
      expect(result.improvedSpeech).toBe('I should have woken up earlier.');

      callGeminiSpy.mockRestore();
    });

    it('handles ACCEPTABLE rating with minor error', async () => {
      const mockApiResponse = JSON.stringify({
        isCorrect: true,
        status: 'ACCEPTABLE',
        statusLabelJa: '👍 通じる！（惜しい）',
        score: 75,
        evaluationJa: '意図は通じますが、冠詞に注意しましょう。',
        improvedSpeech: 'I should have woken up earlier.',
        grammarAdviceJa: '冠詞の有無に注意してください。'
      });

      const callGeminiSpy = vi.spyOn(clientModule, 'callGeminiApi').mockResolvedValueOnce(mockApiResponse);

      const result = await evaluateBlitzSpeech({
        apiKey: 'test-api-key',
        prompt: 'テスト',
        standardAnswer: 'I should have woken up earlier.',
        userSpeech: 'I should wake up earlier.'
      });

      expect(result.isCorrect).toBe(true);
      expect(result.status).toBe('ACCEPTABLE');
      expect(result.score).toBe(75);

      callGeminiSpy.mockRestore();
    });
  });

  describe('generateBlitzQuestions', () => {
    it('throws error when apiKey is missing', async () => {
      await expect(
        generateBlitzQuestions({ apiKey: '' })
      ).rejects.toThrow('Gemini APIキーを設定してください。');
    });

    it('generates questions and parses response', async () => {
      const mockQuestions = {
        title: '旅行トラブル英語',
        questions: [
          {
            prompt: '荷物を預かっていただけますか？',
            answer: 'Could you keep my luggage?',
            acceptedAnswers: ['Can you hold my luggage?'],
            explanation: '丁寧なお願い',
            grammarPoint: 'Could you...?'
          }
        ]
      };

      const callGeminiSpy = vi.spyOn(clientModule, 'callGeminiApi').mockResolvedValueOnce(JSON.stringify(mockQuestions));

      const result = await generateBlitzQuestions({
        apiKey: 'test-api-key',
        topicPrompt: '旅行トラブル',
        difficulty: 'Intermediate'
      });

      expect(result.title).toBe('旅行トラブル英語');
      expect(result.questions.length).toBe(1);
      expect(result.questions[0].answer).toBe('Could you keep my luggage?');

      callGeminiSpy.mockRestore();
    });
  });
});
