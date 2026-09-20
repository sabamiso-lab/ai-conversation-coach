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
});
