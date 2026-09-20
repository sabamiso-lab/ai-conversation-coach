import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useBlitzSession } from '../useBlitzSession';
import * as speechService from '../../../services/speech';
import * as aiBlitzService from '../../../services/ai/blitz';
import { BlitzQuestion } from '../../../types';

// Mock speech service
vi.mock('../../../services/speech', () => ({
  speakText: vi.fn(),
  stopSpeaking: vi.fn(),
  isSpeechRecognitionSupported: () => false,
  SpeechRecognizer: vi.fn(),
}));

// Mock aiBlitzService
vi.mock('../../../services/ai/blitz', () => ({
  evaluateBlitzSpeech: vi.fn(),
  generateBlitzQuestions: vi.fn(),
}));

describe('useBlitzSession hook', () => {
  const mockQuestions: BlitzQuestion[] = [
    {
      id: 'q1',
      prompt: '私はコーヒーが好きです。',
      answer: 'I like coffee.',
      explanation: 'Simple present',
      grammarPoint: 'Simple present',
      acceptedAnswers: ['I love coffee.']
    },
    {
      id: 'q2',
      prompt: '私は昨日本を読みました。',
      answer: 'I read a book yesterday.',
      explanation: 'Simple past',
      grammarPoint: 'Simple past',
    }
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with the first question and unrevealed answer', () => {
    const handleComplete = vi.fn();
    const handleContext = vi.fn();

    const { result } = renderHook(() =>
      useBlitzSession({
        title: '基礎英文法',
        questions: mockQuestions,
        timerSeconds: 5,
        onCompleteSession: handleComplete,
        onContextChange: handleContext,
      })
    );

    expect(result.current.currentIndex).toBe(0);
    expect(result.current.currentQuestion?.id).toBe('q1');
    expect(result.current.isRevealed).toBe(false);
    expect(handleContext).toHaveBeenCalledWith(
      expect.objectContaining({
        topicTitle: '基礎英文法',
        currentIndex: 0,
        totalQuestions: 2,
      })
    );
  });

  it('reveals answer, plays native model audio, and marks isRevealed as true', () => {
    const { result } = renderHook(() =>
      useBlitzSession({
        title: '基礎英文法',
        questions: mockQuestions,
        timerSeconds: 5,
        onCompleteSession: vi.fn(),
      })
    );

    act(() => {
      result.current.revealAnswer();
    });

    expect(result.current.isRevealed).toBe(true);
    expect(speechService.speakText).toHaveBeenCalledWith('I like coffee.', { rate: 0.95 });
  });

  it('triggers AI evaluation on revealAnswer if speech exists and apiKey is provided', async () => {
    vi.mocked(aiBlitzService.evaluateBlitzSpeech).mockResolvedValueOnce({
      isCorrect: true,
      status: 'PERFECT',
      statusLabelJa: '🎉 完璧！',
      score: 100,
      evaluationJa: 'パーフェクトです！',
      improvedSpeech: 'I like coffee.',
      grammarAdviceJa: '正確な文法です。'
    });

    const { result } = renderHook(() =>
      useBlitzSession({
        title: '基礎英文法',
        questions: mockQuestions,
        timerSeconds: 5,
        apiKey: 'test-api-key',
        onCompleteSession: vi.fn(),
      })
    );

    // Provide speech input via handleSaveEditedSpeech
    await act(async () => {
      result.current.handleSaveEditedSpeech('I like coffee.');
    });

    expect(aiBlitzService.evaluateBlitzSpeech).toHaveBeenCalledWith(
      expect.objectContaining({
        apiKey: 'test-api-key',
        prompt: '私はコーヒーが好きです。',
        userSpeech: 'I like coffee.'
      })
    );
  });

  it('advances to next question on handleJudge when more questions remain', () => {
    const { result } = renderHook(() =>
      useBlitzSession({
        title: '基礎英文法',
        questions: mockQuestions,
        timerSeconds: 5,
        onCompleteSession: vi.fn(),
      })
    );

    // Reveal question 1
    act(() => {
      result.current.revealAnswer();
    });
    expect(result.current.isRevealed).toBe(true);

    // Judge correct
    act(() => {
      result.current.handleJudge(true);
    });

    // Should advance to question 2 and reset isRevealed
    expect(result.current.currentIndex).toBe(1);
    expect(result.current.currentQuestion?.id).toBe('q2');
    expect(result.current.isRevealed).toBe(false);
  });

  it('completes session and invokes onCompleteSession on last question judgment', () => {
    const handleComplete = vi.fn();

    const { result } = renderHook(() =>
      useBlitzSession({
        title: '基礎英文法',
        questions: mockQuestions,
        timerSeconds: 5,
        onCompleteSession: handleComplete,
      })
    );

    // Question 1: correct
    act(() => {
      result.current.revealAnswer();
      result.current.handleJudge(true);
    });

    // Question 2: incorrect
    act(() => {
      result.current.revealAnswer();
      result.current.handleJudge(false);
    });

    expect(handleComplete).toHaveBeenCalledTimes(1);
    expect(handleComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '基礎英文法',
        totalQuestions: 2,
        correctCount: 1,
        results: expect.arrayContaining([
          expect.objectContaining({ questionId: 'q1', isCorrect: true }),
          expect.objectContaining({ questionId: 'q2', isCorrect: false }),
        ])
      })
    );
  });
});
