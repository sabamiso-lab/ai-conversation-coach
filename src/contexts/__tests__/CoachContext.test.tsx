import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CoachProvider } from '../CoachContext';
import { useCoach } from '../../hooks/useCoach';
import * as geminiService from '../../services/gemini';

vi.mock('../../hooks/useSettings', () => ({
  useSettings: () => ({
    apiKey: 'mock-key',
    model: 'gemini-3.5-flash-lite'
  })
}));

vi.mock('../../services/gemini', () => ({
  askConversationCoach: vi.fn()
}));

describe('CoachContext & CoachProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides default initial state and greeting message', () => {
    const { result } = renderHook(() => useCoach(), {
      wrapper: ({ children }) => <CoachProvider>{children}</CoachProvider>
    });

    expect(result.current.mode).toBe('general');
    expect(result.current.situation).toBeNull();
    expect(result.current.coachMessages).toHaveLength(1);
    expect(result.current.coachMessages[0].text).toContain('バイリンガルAIコーチです');
    expect(result.current.isOpen).toBe(false);
  });

  it('toggles isOpen state', () => {
    const { result } = renderHook(() => useCoach(), {
      wrapper: ({ children }) => <CoachProvider>{children}</CoachProvider>
    });

    act(() => {
      result.current.toggleOpen();
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.setIsOpen(false);
    });
    expect(result.current.isOpen).toBe(false);
  });

  it('switches to shadowing mode and updates greeting message', () => {
    const { result } = renderHook(() => useCoach(), {
      wrapper: ({ children }) => <CoachProvider>{children}</CoachProvider>
    });

    act(() => {
      result.current.updateCoachContext({
        mode: 'shadowing',
        shadowingContext: {
          title: 'Airport Check-in',
          category: 'Travel',
          fullText: 'I want to check in.'
        }
      });
    });

    expect(result.current.mode).toBe('shadowing');
    expect(result.current.shadowingContext?.title).toBe('Airport Check-in');
    expect(result.current.coachMessages[0].text).toContain('シャドーイング専属AIコーチです');
    expect(result.current.coachMessages[0].text).toContain('Airport Check-in');
  });

  it('live-syncs shadowing speech and evaluation without resetting conversation', () => {
    const { result } = renderHook(() => useCoach(), {
      wrapper: ({ children }) => <CoachProvider>{children}</CoachProvider>
    });

    // 1. Initial shadowing context
    act(() => {
      result.current.updateCoachContext({
        mode: 'shadowing',
        shadowingContext: {
          title: 'Airport Check-in',
          category: 'Travel',
          fullText: 'I want to check in.',
          targetText: 'I want to check in.'
        }
      });
    });

    // 2. User records speech and gets evaluated
    act(() => {
      result.current.updateCoachContext({
        mode: 'shadowing',
        shadowingContext: {
          title: 'Airport Check-in',
          category: 'Travel',
          fullText: 'I want to check in.',
          targetText: 'I want to check in.',
          userSpeech: 'I want check in',
          evalResult: {
            overallScore: 88,
            feedbackJa: 'Good rhythm'
          }
        }
      });
    });

    // Verify context was NOT discarded
    expect(result.current.shadowingContext?.userSpeech).toBe('I want check in');
    expect(result.current.shadowingContext?.evalResult?.overallScore).toBe(88);
    expect(result.current.coachMessages).toHaveLength(1);
  });

  it('switches to blitz mode and live-syncs questions and user answers', () => {
    const { result } = renderHook(() => useCoach(), {
      wrapper: ({ children }) => <CoachProvider>{children}</CoachProvider>
    });

    // 1. Enter blitz mode
    act(() => {
      result.current.updateCoachContext({
        mode: 'blitz',
        blitzContext: {
          topicTitle: '日常依頼',
          allQuestions: []
        }
      });
    });

    expect(result.current.mode).toBe('blitz');
    expect(result.current.coachMessages[0].text).toContain('瞬間英作文AIコーチです');

    // 2. Question 1 arrives with user response
    act(() => {
      result.current.updateCoachContext({
        mode: 'blitz',
        blitzContext: {
          topicTitle: '日常依頼',
          currentIndex: 0,
          currentQuestion: {
            id: 1,
            japanese: '手伝ってくれますか？',
            sampleAnswer: 'Could you help me?'
          },
          userSpeech: 'Could you help me',
          isCorrect: true
        }
      });
    });

    // Verify live blitz context updated properly
    expect(result.current.blitzContext?.currentQuestion?.japanese).toBe('手伝ってくれますか？');
    expect(result.current.blitzContext?.userSpeech).toBe('Could you help me');
    expect(result.current.blitzContext?.isCorrect).toBe(true);
  });

  it('resets messages when situation id changes', () => {
    const { result } = renderHook(() => useCoach(), {
      wrapper: ({ children }) => <CoachProvider>{children}</CoachProvider>
    });

    // 1. Situation A
    act(() => {
      result.current.updateCoachContext({
        mode: 'conversation',
        situation: {
          id: 'cafe-order',
          title: 'Cafe Order',
          titleJa: 'カフェでの注文',
          category: 'Daily',
          systemRole: 'Barista',
          initialMessage: 'What can I get for you?',
          descriptionJa: '注文する',
          goals: []
        }
      });
    });

    expect(result.current.coachMessages[0].text).toContain('カフェでの注文');

    // 2. Switch to Situation B
    act(() => {
      result.current.updateCoachContext({
        mode: 'conversation',
        situation: {
          id: 'hotel-checkin',
          title: 'Hotel Check-in',
          titleJa: 'ホテルチェックイン',
          category: 'Travel',
          systemRole: 'Receptionist',
          initialMessage: 'May I help you?',
          descriptionJa: 'チェックインする',
          goals: []
        }
      });
    });

    expect(result.current.coachMessages[0].text).toContain('ホテルチェックイン');
    expect(result.current.situation?.id).toBe('hotel-checkin');
  });

  it('successfully asks question and updates coach messages', async () => {
    vi.mocked(geminiService.askConversationCoach).mockResolvedValueOnce({
      answer: 'ラテを頼む時は「Could I get a latte?」と言いましょう。',
      suggestedPhrases: [
        { english: 'Could I get a latte?', japanese: 'ラテをいただけますか？' }
      ]
    });

    const { result } = renderHook(() => useCoach(), {
      wrapper: ({ children }) => <CoachProvider>{children}</CoachProvider>
    });

    await act(async () => {
      await result.current.askQuestion('ラテの頼み方を教えて');
    });

    expect(geminiService.askConversationCoach).toHaveBeenCalledTimes(1);
    expect(result.current.coachMessages).toHaveLength(3); // Greeting + User + Assistant
    expect(result.current.coachMessages[1].role).toBe('user');
    expect(result.current.coachMessages[1].text).toBe('ラテの頼み方を教えて');
    expect(result.current.coachMessages[2].role).toBe('assistant');
    expect(result.current.coachMessages[2].text).toContain('Could I get a latte?');
  });

  it('clears history when clearHistory is called', async () => {
    vi.mocked(geminiService.askConversationCoach).mockResolvedValueOnce({
      answer: '回答です。',
      suggestedPhrases: []
    });

    const { result } = renderHook(() => useCoach(), {
      wrapper: ({ children }) => <CoachProvider>{children}</CoachProvider>
    });

    await act(async () => {
      await result.current.askQuestion('質問です');
    });

    expect(result.current.coachMessages).toHaveLength(3);

    act(() => {
      result.current.clearHistory();
    });

    expect(result.current.coachMessages).toHaveLength(1);
    expect(result.current.coachMessages[0].id).toBe('coach-init');
  });
});
