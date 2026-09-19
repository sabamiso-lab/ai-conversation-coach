import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BlitzSummary from '../BlitzSummary';
import type { BlitzSessionSummaryData } from '../../../types';

describe('BlitzSummary Component', () => {
  const mockSummaryData: BlitzSessionSummaryData = {
    title: '基礎構文パターン（総合実力テスト）',
    totalQuestions: 2,
    correctCount: 1,
    totalDurationSec: 12,
    avgResponseTimeSec: 4.2,
    results: [
      {
        questionId: 'gf-1',
        question: {
          id: 'gf-1',
          prompt: 'もっと早く起きるべきでした。',
          answer: 'I should have woken up earlier.',
          explanation: '「〜すべきだった」は should have + p.p.'
        },
        isCorrect: true,
        userSpeech: 'I should have woken up earlier',
        matchScore: 100,
        responseTimeSec: 3.5,
        aiEvaluation: {
          isCorrect: true,
          score: 95,
          status: 'PERFECT',
          statusLabelJa: '🎉 完璧！',
          evaluationJa: '完璧な発話です！',
          improvedSpeech: 'I should have woken up earlier.'
        }
      },
      {
        questionId: 'gf-2',
        question: {
          id: 'gf-2',
          prompt: 'もし時間があれば、一緒に行けるのに。',
          answer: 'If I had time, I could go with you.',
          explanation: '仮定法過去'
        },
        isCorrect: false,
        userSpeech: 'If I have time',
        matchScore: 40,
        responseTimeSec: 5.0,
        aiEvaluation: {
          isCorrect: false,
          score: 50,
          status: 'NEEDS_WORK',
          statusLabelJa: '💪 要復習',
          evaluationJa: '惜しいです。仮定法過去を使いましょう。',
          improvedSpeech: 'If I had time, I could go with you.'
        }
      }
    ]
  };

  it('renders correct score percentage, questions count, and response times without NaN or undefined', () => {
    render(
      <BlitzSummary
        summaryData={mockSummaryData}
        onRetryIncorrect={vi.fn()}
        onRestartAll={vi.fn()}
        onBackToSelector={vi.fn()}
      />
    );

    // Score percentage: 1/2 = 50%
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('%')).toBeInTheDocument();

    // Stats
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
    expect(screen.getByText('4.2s')).toBeInTheDocument(); // avg time
    expect(screen.getByText('73点')).toBeInTheDocument(); // average AI score: (95 + 50) / 2 = 72.5 -> 73

    // Ensure no undefineds or NaNs
    expect(screen.queryByText(/undefined/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/NaN/i)).not.toBeInTheDocument();
  });

  it('handles fallback totalTimeSec when totalDurationSec is not directly present', () => {
    const legacyData: BlitzSessionSummaryData = {
      title: 'Legacy Topic',
      totalQuestions: 1,
      correctCount: 1,
      totalTimeSec: 8,
      results: [
        {
          questionId: 'q-1',
          question: { id: 'q-1', prompt: 'テスト', answer: 'Test' },
          isCorrect: true,
          userSpeech: 'Test',
          matchScore: 100,
          responseTimeSec: 8
        }
      ]
    };

    render(
      <BlitzSummary
        summaryData={legacyData}
        onRetryIncorrect={vi.fn()}
        onRestartAll={vi.fn()}
        onBackToSelector={vi.fn()}
      />
    );

    expect(screen.getByText('8.0s')).toBeInTheDocument();
    expect(screen.getByText('8s')).toBeInTheDocument();
    expect(screen.queryByText(/NaN/i)).not.toBeInTheDocument();
  });

  it('renders AI evaluation details for each question item', () => {
    render(
      <BlitzSummary
        summaryData={mockSummaryData}
        onRetryIncorrect={vi.fn()}
        onRestartAll={vi.fn()}
        onBackToSelector={vi.fn()}
      />
    );

    expect(screen.getByText('95点')).toBeInTheDocument();
    expect(screen.getByText('50点')).toBeInTheDocument();
    expect(screen.getByText('🎉 完璧！')).toBeInTheDocument();
    expect(screen.getByText('💪 要復習')).toBeInTheDocument();
    expect(screen.getByText('完璧な発話です！')).toBeInTheDocument();
  });

  it('triggers action buttons (retry, restart, back)', () => {
    const handleRetry = vi.fn();
    const handleRestart = vi.fn();
    const handleBack = vi.fn();

    render(
      <BlitzSummary
        summaryData={mockSummaryData}
        onRetryIncorrect={handleRetry}
        onRestartAll={handleRestart}
        onBackToSelector={handleBack}
      />
    );

    const retryBtn = screen.getByRole('button', { name: /言えなかった1問をリトライ/i });
    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledWith([mockSummaryData.results![1].question]);

    const restartBtn = screen.getByRole('button', { name: /最初からもう一度/i });
    fireEvent.click(restartBtn);
    expect(handleRestart).toHaveBeenCalled();

    const backBtn = screen.getByRole('button', { name: /お題一覧へ戻る/i });
    fireEvent.click(backBtn);
    expect(handleBack).toHaveBeenCalled();
  });
});
