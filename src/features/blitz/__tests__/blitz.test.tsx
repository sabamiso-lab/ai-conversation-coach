import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PRESET_BLITZ_TOPICS, RANDOM_BLITZ_TOPICS, getRandomBlitzTopic } from '../blitzTopics';
import BlitzTopicSelector from '../BlitzTopicSelector';
import BlitzSession from '../BlitzSession';
import BlitzSummary from '../BlitzSummary';
import { evaluateBlitzSpeech } from '../../../services/ai/blitz';
import type { BlitzSessionSummaryData } from '../../../types';

let mockSpeechText = '';

vi.mock('../useBlitzSpeech', () => ({
  useBlitzSpeech: () => ({
    isListening: false,
    userTranscript: mockSpeechText,
    setUserTranscript: (t: string) => { mockSpeechText = t; },
    interimTranscript: '',
    fullUserText: mockSpeechText,
    speechError: '',
    startListening: vi.fn(),
    stopListening: vi.fn(),
    abortListening: vi.fn(),
    toggleListening: vi.fn(),
    resetSpeech: () => { mockSpeechText = ''; },
    clearSpeech: () => { mockSpeechText = ''; },
  })
}));

vi.mock('../../../services/ai/blitz', () => ({
  evaluateBlitzSpeech: vi.fn(),
  generateBlitzQuestions: vi.fn()
}));

describe('Instant Oral Blitz Feature', () => {
  describe('PRESET_BLITZ_TOPICS & RANDOM_BLITZ_TOPICS', () => {
    it('contains preset topics with valid questions, unique IDs, and acceptedAnswers', () => {
      expect(PRESET_BLITZ_TOPICS.length).toBeGreaterThanOrEqual(12);

      const topicIds = new Set();
      const questionIds = new Set();
      const grammarTopics = PRESET_BLITZ_TOPICS.filter(t => t.category === 'Grammar');
      expect(grammarTopics.length).toBeGreaterThanOrEqual(10);

      PRESET_BLITZ_TOPICS.forEach((topic) => {
        expect(topic.id).toBeTruthy();
        expect(topicIds.has(topic.id)).toBe(false);
        topicIds.add(topic.id);

        expect(topic.title).toBeTruthy();
        expect(topic.questions.length).toBeGreaterThan(0);

        topic.questions.forEach((q) => {
          expect(q.id).toBeTruthy();
          expect(questionIds.has(q.id)).toBe(false);
          questionIds.add(q.id);

          expect(q.prompt).toBeTruthy();
          expect(q.answer).toBeTruthy();
          expect(q.explanation).toBeTruthy();
          expect(q.grammarPoint).toBeTruthy();
          expect(Array.isArray(q.acceptedAnswers)).toBe(true);
        });
      });
    });

    it('returns a valid random topic from RANDOM_BLITZ_TOPICS', () => {
      expect(RANDOM_BLITZ_TOPICS.length).toBeGreaterThan(0);
      const randomTopic = getRandomBlitzTopic();
      expect(RANDOM_BLITZ_TOPICS).toContain(randomTopic);
    });
  });

  describe('BlitzTopicSelector', () => {
    it('renders hero title and preset topics', () => {
      const handleStart = vi.fn();
      render(
        <BlitzTopicSelector
          onStartSession={handleStart}
          onGenerateCustom={vi.fn()}
          isGenerating={false}
          hasApiKey={true}
          onOpenApiKeyModal={vi.fn()}
        />
      );

      expect(screen.getByText(/瞬間英作文・パターンプラクティス/i)).toBeInTheDocument();
      expect(screen.getByText(/基礎構文パターン/)).toBeInTheDocument();
      expect(screen.getByText('ビジネス即レス会話')).toBeInTheDocument();

      const startButtons = screen.getAllByRole('button', { name: /瞬間英作文を開始/i });
      expect(startButtons.length).toBeGreaterThan(0);

      fireEvent.click(startButtons[0]);
      expect(handleStart).toHaveBeenCalled();
    });

    it('handles AI custom form toggle, random topic button, and omakase submission', () => {
      const handleGenerateCustom = vi.fn();
      render(
        <BlitzTopicSelector
          onStartSession={vi.fn()}
          onGenerateCustom={handleGenerateCustom}
          isGenerating={false}
          hasApiKey={true}
          onOpenApiKeyModal={vi.fn()}
        />
      );

      // Open AI form
      const openFormBtn = screen.getByRole('button', { name: /AIで作成する/i });
      fireEvent.click(openFormBtn);

      expect(screen.getByPlaceholderText(/空欄でおまかせ/i)).toBeInTheDocument();

      // Click random topic button
      const randomBtn = screen.getByRole('button', { name: /ランダムに選ぶ/i });
      fireEvent.click(randomBtn);

      const input = screen.getByPlaceholderText(/空欄でおまかせ/i) as HTMLInputElement;
      expect(input.value).toBeTruthy();

      // Submit form
      const submitBtn = screen.getByRole('button', { name: /AI英作文セットを生成/i });
      fireEvent.click(submitBtn);

      expect(handleGenerateCustom).toHaveBeenCalledWith({
        topicPrompt: input.value,
        difficulty: 'Intermediate',
        timerSeconds: 5
      });
    });
  });

  describe('BlitzSession', () => {
    const mockQuestions = [
      {
        id: 'q1',
        prompt: 'もっと早く起きるべきでした。',
        answer: 'I should have woken up earlier.',
        explanation: 'should have + p.p.',
        grammarPoint: 'should have + p.p.'
      }
    ];

    it('renders current question prompt and handles reveal & judgment', () => {
      const handleComplete = vi.fn();
      const handleExit = vi.fn();

      render(
        <BlitzSession
          title="テストセッション"
          questions={mockQuestions}
          timerSeconds={0}
          onCompleteSession={handleComplete}
          onExitSession={handleExit}
        />
      );

      expect(screen.getByText('もっと早く起きるべきでした。')).toBeInTheDocument();

      // Click Reveal
      const revealBtn = screen.getByRole('button', { name: /答え合わせ/i });
      fireEvent.click(revealBtn);

      expect(screen.getByText('I should have woken up earlier.')).toBeInTheDocument();

      // Click Correct
      const correctBtn = screen.getByRole('button', { name: /言えた/i });
      fireEvent.click(correctBtn);

      expect(handleComplete).toHaveBeenCalled();
    });

    it('calls onExitSession when back button is clicked', () => {
      const handleExit = vi.fn();

      render(
        <BlitzSession
          title="テストセッション"
          questions={mockQuestions}
          timerSeconds={0}
          onCompleteSession={vi.fn()}
          onExitSession={handleExit}
        />
      );

      const backBtn = screen.getByRole('button', { name: /お題一覧に戻る/i });
      expect(backBtn).toBeInTheDocument();
      fireEvent.click(backBtn);
      expect(handleExit).toHaveBeenCalledTimes(1);
    });

    it('triggers AI evaluation and displays feedback and improved speech', async () => {
      mockSpeechText = 'I should have wake up early.';

      vi.mocked(evaluateBlitzSpeech).mockResolvedValueOnce({
        isCorrect: true,
        status: 'PERFECT',
        statusLabelJa: '🎉 完璧！',
        score: 95,
        evaluationJa: '素晴らしい発話です！自然に表現できています。',
        improvedSpeech: 'I should have gotten up earlier.',
        grammarAdviceJa: 'should have + 過去分詞が完璧に使えています。'
      });

      const handleComplete = vi.fn();

      render(
        <BlitzSession
          title="AIテストセッション"
          questions={mockQuestions}
          timerSeconds={0}
          apiKey="test-api-key"
          model="gemini-3.5-flash-lite"
          onCompleteSession={handleComplete}
          onExitSession={vi.fn()}
        />
      );

      // Verify user spoken text is rendered
      expect(screen.getByText('I should have wake up early.')).toBeInTheDocument();

      // Click reveal answer
      const revealBtn = screen.getByRole('button', { name: /答え合わせ/i });
      fireEvent.click(revealBtn);

      // Verify evaluateBlitzSpeech was called
      expect(evaluateBlitzSpeech).toHaveBeenCalledWith(expect.objectContaining({
        apiKey: 'test-api-key',
        prompt: mockQuestions[0].prompt,
        standardAnswer: mockQuestions[0].answer,
        userSpeech: 'I should have wake up early.'
      }));

      // Verify AI evaluation result is rendered in the evaluation card
      expect(await screen.findByText('🎉 完璧！')).toBeInTheDocument();
      expect(screen.getByText(/素晴らしい発話です！自然に表現できています。/)).toBeInTheDocument();
      expect(screen.getByText(/I should have gotten up earlier./)).toBeInTheDocument();
      expect(screen.getByText(/should have \+ 過去分詞が完璧に使えています。/)).toBeInTheDocument();

      mockSpeechText = '';
    });

    it('shows clear button when user has speech and clears it on click', () => {
      mockSpeechText = 'I am saying something wrong.';

      render(
        <BlitzSession
          title="クリアテストセッション"
          questions={mockQuestions}
          timerSeconds={0}
          onCompleteSession={vi.fn()}
          onExitSession={vi.fn()}
        />
      );

      expect(screen.getByText('I am saying something wrong.')).toBeInTheDocument();

      const clearBtn = screen.getByRole('button', { name: /クリア/i });
      expect(clearBtn).toBeInTheDocument();

      fireEvent.click(clearBtn);

      expect(mockSpeechText).toBe('');
    });

    it('renders AI evaluation result card and highlights recommended button', async () => {
      vi.mocked(evaluateBlitzSpeech).mockResolvedValueOnce({
        isCorrect: true,
        status: 'PERFECT',
        statusLabelJa: '🎉 完璧！',
        score: 98,
        evaluationJa: 'パーフェクトな文法と発話です！',
        improvedSpeech: 'I should have woken up earlier.',
        grammarAdviceJa: '助動詞の完了形が的確です。'
      });

      const handleComplete = vi.fn();

      render(
        <BlitzSession
          title="AIテスト"
          questions={mockQuestions}
          timerSeconds={0}
          apiKey="test-api-key"
          model="gemini-3.5-flash-lite"
          onCompleteSession={handleComplete}
          onExitSession={vi.fn()}
        />
      );

      // Reveal answer
      const revealBtn = screen.getByRole('button', { name: /答え合わせ/i });
      fireEvent.click(revealBtn);

      // Verify AI toggle is displayed
      expect(screen.getByText('AI自動判定')).toBeInTheDocument();

      // Simulate completing session
      const correctBtn = screen.getByRole('button', { name: /言えた/i });
      fireEvent.click(correctBtn);

      expect(handleComplete).toHaveBeenCalledWith(expect.objectContaining({
        title: 'AIテスト',
        results: expect.arrayContaining([
          expect.objectContaining({
            questionId: 'q1',
            isCorrect: true
          })
        ])
      }));
    });
  });

  describe('BlitzSummary', () => {
    const mockSummaryData: BlitzSessionSummaryData = {
      title: '基礎構文テスト',
      totalDurationSec: 12.5,
      totalTimeSec: 12.5,
      totalQuestions: 2,
      correctCount: 1,
      avgResponseTimeSec: 3.5,
      results: [
        {
          questionId: 'q1',
          question: { id: 'q1', prompt: 'テスト1', answer: 'Test 1' },
          isCorrect: true,
          userSpeech: 'Test 1',
          matchScore: 100,
          responseTimeSec: 2.1,
          aiEvaluation: {
            isCorrect: true,
            status: 'PERFECT',
            statusLabelJa: '🎉 完璧！',
            score: 95,
            evaluationJa: '完璧な発話です！',
            improvedSpeech: 'Test 1',
            grammarAdviceJa: '構文が正確です。'
          }
        },
        {
          questionId: 'q2',
          question: { id: 'q2', prompt: 'テスト2', answer: 'Test 2' },
          isCorrect: false,
          userSpeech: '',
          matchScore: 0,
          responseTimeSec: 5.0,
          aiEvaluation: null
        }
      ]
    };

    it('displays summary score, AI average score, and retry button', () => {
      const handleRetry = vi.fn();
      render(
        <BlitzSummary
          summaryData={mockSummaryData}
          onRetryIncorrect={handleRetry}
          onRestartAll={vi.fn()}
          onBackToSelector={vi.fn()}
        />
      );

      expect(screen.getByText('Blitz セッション完了！')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument(); // 50%

      // Verify AI Average score stat
      expect(screen.getAllByText('95点').length).toBeGreaterThan(0);
      expect(screen.getByText(/AI平均スコア/i)).toBeInTheDocument();

      // Verify individual AI evaluation card
      expect(screen.getByText('🎉 完璧！')).toBeInTheDocument();
      expect(screen.getByText('完璧な発話です！')).toBeInTheDocument();

      const retryBtn = screen.getByRole('button', { name: /言えなかった1問をリトライ/i });
      expect(retryBtn).toBeInTheDocument();

      fireEvent.click(retryBtn);
      expect(handleRetry).toHaveBeenCalledWith([mockSummaryData.results![1].question]);
    });
  });
});

