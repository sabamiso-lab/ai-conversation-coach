import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useChatSession } from '../useChatSession';
import * as geminiService from '../../services/gemini';
import { Situation } from '../../types';

describe('useChatSession hook', () => {
  const mockSituation: Situation = {
    id: 'cafe-order',
    title: 'Cafe Coffee Order',
    titleJa: 'カフェでの注文',
    category: 'Daily',
    difficulty: 'Beginner',
    systemRole: 'Friendly Barista',
    descriptionJa: 'コーヒーを注文する',
    initialMessage: 'Hi! Welcome to our cafe!',
    initialMessageJa: 'いらっしゃいませ！',
    goals: ['Order a drink']
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with the situation initial message', () => {
    const { result } = renderHook(() =>
      useChatSession({
        situation: mockSituation,
        apiKey: 'test-key',
        model: 'gemini-3.5-flash-lite'
      })
    );

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].text).toBe('Hi! Welcome to our cafe!');
    expect(result.current.messages[0].translation).toBe('いらっしゃいませ！');
  });

  it('sends message and appends user and AI responses', async () => {
    vi.spyOn(geminiService, 'sendChatMessage').mockResolvedValueOnce({
      aiResponseText: 'What size would you like?',
      aiResponseTranslation: 'サイズはどうしますか？',
      userTextTranslation: 'ホットコーヒーをください。',
      clarityStatus: 'FULL',
      clarityBadgeJa: '🟢 100% 意図が伝わった！',
      clarityFeedbackJa: '完璧です！'
    });

    const { result } = renderHook(() =>
      useChatSession({
        situation: mockSituation,
        apiKey: 'test-key',
        model: 'gemini-3.5-flash-lite'
      })
    );

    const onAiText = vi.fn();

    await act(async () => {
      await result.current.sendMessage('Hot coffee, please.', onAiText);
    });

    expect(result.current.messages).toHaveLength(3); // Initial AI + User + Reply AI
    expect(result.current.messages[1].text).toBe('Hot coffee, please.');
    expect(result.current.messages[1].clarityStatus).toBe('FULL');
    expect(result.current.messages[2].text).toBe('What size would you like?');
    expect(onAiText).toHaveBeenCalledWith('What size would you like?');
  });

  it('handles hints fetching', async () => {
    vi.spyOn(geminiService, 'getHintSuggestions').mockResolvedValueOnce([
      { english: 'Could I get a latte?', japanese: 'ラテをいただけますか？', difficulty: 'Beginner' }
    ]);

    const { result } = renderHook(() =>
      useChatSession({
        situation: mockSituation,
        apiKey: 'test-key',
        model: 'gemini-3.5-flash-lite'
      })
    );

    await act(async () => {
      await result.current.fetchHints();
    });

    expect(result.current.isHintOpen).toBe(true);
    expect(result.current.hints).toHaveLength(1);
    expect(result.current.hints[0].english).toBe('Could I get a latte?');
  });

  it('sets errorMsg when sendMessage is called without apiKey', async () => {
    const { result } = renderHook(() =>
      useChatSession({
        situation: mockSituation,
        apiKey: '',
        model: 'gemini-3.5-flash-lite'
      })
    );

    await act(async () => {
      await result.current.sendMessage('Hello');
    });

    expect(result.current.errorMsg).toContain('Gemini API Key が設定されていません');
    expect(result.current.messages).toHaveLength(1); // Only initial message
  });

  it('ignores empty message or whitespace in sendMessage', async () => {
    const { result } = renderHook(() =>
      useChatSession({
        situation: mockSituation,
        apiKey: 'test-key',
        model: 'gemini-3.5-flash-lite'
      })
    );

    await act(async () => {
      await result.current.sendMessage('   ');
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.isAiThinking).toBe(false);
  });

  it('handles API error in sendMessage gracefully and resets isAiThinking', async () => {
    vi.spyOn(geminiService, 'sendChatMessage').mockRejectedValueOnce(new Error('Network failure'));

    const { result } = renderHook(() =>
      useChatSession({
        situation: mockSituation,
        apiKey: 'test-key',
        model: 'gemini-3.5-flash-lite'
      })
    );

    await act(async () => {
      await result.current.sendMessage('Can I order?');
    });

    expect(result.current.errorMsg).toBe('Network failure');
    expect(result.current.isAiThinking).toBe(false);
    expect(result.current.messages).toHaveLength(2); // Initial AI + User message
  });

  it('handles error in fetchHints gracefully and resets isHintLoading', async () => {
    vi.spyOn(geminiService, 'getHintSuggestions').mockRejectedValueOnce(new Error('Hint service error'));

    const { result } = renderHook(() =>
      useChatSession({
        situation: mockSituation,
        apiKey: 'test-key',
        model: 'gemini-3.5-flash-lite'
      })
    );

    await act(async () => {
      await result.current.fetchHints();
    });

    expect(result.current.errorMsg).toContain('ヒントの生成に失敗しました');
    expect(result.current.isHintLoading).toBe(false);
    expect(result.current.isHintOpen).toBe(true);
  });

  describe('finishSession', () => {
    it('generates session report successfully and opens report modal', async () => {
      const mockReport = {
        overallScore: 92,
        grammarScore: 90,
        vocabScore: 95,
        fluencyScore: 90,
        summaryJa: '素晴らしい英会話でした！',
        strengthsJa: ['自然な挨拶'],
        improvementsJa: ['接続詞の使い方'],
        keyPhrases: [{ phrase: 'Could I get...', meaning: '〜をいただけますか？' }],
        goalsAchieved: [{ goal: 'Order a drink', achieved: true }]
      };

      vi.spyOn(geminiService, 'generateSessionReport').mockResolvedValueOnce(mockReport);

      const { result } = renderHook(() =>
        useChatSession({
          situation: mockSituation,
          apiKey: 'test-key',
          model: 'gemini-3.5-flash-lite'
        })
      );

      await act(async () => {
        await result.current.finishSession();
      });

      expect(result.current.isReportOpen).toBe(true);
      expect(result.current.isReportLoading).toBe(false);
      expect(result.current.reportData).toEqual(mockReport);
      expect(result.current.reportError).toBe('');
    });

    it('handles error during finishSession and sets reportError', async () => {
      vi.spyOn(geminiService, 'generateSessionReport').mockRejectedValueOnce(new Error('Report generation failed'));

      const { result } = renderHook(() =>
        useChatSession({
          situation: mockSituation,
          apiKey: 'test-key',
          model: 'gemini-3.5-flash-lite'
        })
      );

      await act(async () => {
        await result.current.finishSession();
      });

      expect(result.current.isReportOpen).toBe(true);
      expect(result.current.isReportLoading).toBe(false);
      expect(result.current.reportData).toBeNull();
      expect(result.current.reportError).toBe('Report generation failed');
      expect(result.current.errorMsg).toBe('Report generation failed');
    });
  });
});
