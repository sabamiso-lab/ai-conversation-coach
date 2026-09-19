import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PRESET_BLITZ_TOPICS } from '../blitzTopics';
import BlitzTopicSelector from '../BlitzTopicSelector';
import BlitzSession from '../BlitzSession';
import BlitzSummary from '../BlitzSummary';

describe('Instant Oral Blitz Feature', () => {
  describe('PRESET_BLITZ_TOPICS', () => {
    it('contains preset topics with valid questions', () => {
      expect(PRESET_BLITZ_TOPICS.length).toBeGreaterThan(0);
      PRESET_BLITZ_TOPICS.forEach((topic) => {
        expect(topic.id).toBeTruthy();
        expect(topic.title).toBeTruthy();
        expect(topic.questions.length).toBeGreaterThan(0);

        topic.questions.forEach((q) => {
          expect(q.prompt).toBeTruthy();
          expect(q.answer).toBeTruthy();
        });
      });
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
      expect(screen.getByText('基礎構文パターン')).toBeInTheDocument();
      expect(screen.getByText('ビジネス即レス会話')).toBeInTheDocument();

      const startButtons = screen.getAllByRole('button', { name: /瞬間英作文を開始/i });
      expect(startButtons.length).toBeGreaterThan(0);

      fireEvent.click(startButtons[0]);
      expect(handleStart).toHaveBeenCalled();
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
  });

  describe('BlitzSummary', () => {
    const mockSummaryData = {
      title: '基礎構文テスト',
      totalTimeSec: 12.5,
      results: [
        {
          questionId: 'q1',
          question: { prompt: 'テスト1', answer: 'Test 1' },
          isCorrect: true,
          userSpeech: 'Test 1',
          matchScore: 100,
          responseTimeSec: 2.1
        },
        {
          questionId: 'q2',
          question: { prompt: 'テスト2', answer: 'Test 2' },
          isCorrect: false,
          userSpeech: '',
          matchScore: 0,
          responseTimeSec: 5.0
        }
      ]
    };

    it('displays summary score and retry button', () => {
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

      const retryBtn = screen.getByRole('button', { name: /言えなかった1問をリトライ/i });
      expect(retryBtn).toBeInTheDocument();

      fireEvent.click(retryBtn);
      expect(handleRetry).toHaveBeenCalledWith([mockSummaryData.results[1].question]);
    });
  });
});
