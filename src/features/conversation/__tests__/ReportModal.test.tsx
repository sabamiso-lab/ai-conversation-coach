import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ReportModal from '../ReportModal';
import type { SessionReport } from '../../../types';

describe('ReportModal component', () => {
  const mockReport: SessionReport = {
    overallScore: 88,
    grammarScore: 80,
    vocabScore: 90,
    fluencyScore: 85,
    summaryJa: '会話の流れがとてもスムーズで、相手の質問に的確に回答できていました。',
    strengthsJa: ['自然な挨拶と感謝の言葉', 'メニューの質問への的確な応答'],
    improvementsJa: ['過去形と完了形の使い分け'],
    keyPhrases: [
      { phrase: 'Could I get...', meaning: '〜をいただけますか？' },
      { phrase: 'How much is...', meaning: '〜はいくらですか？' },
    ],
    goalsAchieved: [
      { goal: 'Order coffee', achieved: true },
    ]
  };

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <ReportModal
        isOpen={false}
        onClose={vi.fn()}
        report={mockReport}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders loading state when loading is true', () => {
    render(
      <ReportModal
        isOpen={true}
        onClose={vi.fn()}
        loading={true}
      />
    );

    expect(screen.getByText(/会話データをAIが分析中.../i)).toBeInTheDocument();
    expect(screen.getByText(/文法正確さ・語彙の多様性・対話の流れを総合評価しています。/i)).toBeInTheDocument();
  });

  it('renders error alert and handles retry and close buttons', () => {
    const handleRetry = vi.fn();
    const handleClose = vi.fn();

    render(
      <ReportModal
        isOpen={true}
        onClose={handleClose}
        error="APIタイムアウトが発生しました"
        onRetry={handleRetry}
      />
    );

    expect(screen.getByText(/評価レポートの作成に失敗しました/i)).toBeInTheDocument();
    expect(screen.getByText(/APIタイムアウトが発生しました/i)).toBeInTheDocument();

    const retryBtn = screen.getByRole('button', { name: /再試行/i });
    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledTimes(1);

    const closeButtons = screen.getAllByRole('button', { name: /閉じる/i });
    fireEvent.click(closeButtons[0]);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('renders comprehensive report data when report is provided', () => {
    const handleClose = vi.fn();
    const handleRestart = vi.fn();

    render(
      <ReportModal
        isOpen={true}
        onClose={handleClose}
        report={mockReport}
        onRestart={handleRestart}
      />
    );

    // Title
    expect(screen.getByText('会話セッション診断レポート')).toBeInTheDocument();

    // Overall Score
    expect(screen.getByText(/88/)).toBeInTheDocument();
    expect(screen.getByText(/🌟 素晴らしいコミュニケーション力です！/)).toBeInTheDocument();

    // Scores
    expect(screen.getByText('80')).toBeInTheDocument();
    expect(screen.getByText('Grammar (文法)')).toBeInTheDocument();
    expect(screen.getByText('90')).toBeInTheDocument();
    expect(screen.getByText('Vocabulary (語彙)')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('Fluency (流れ)')).toBeInTheDocument();

    // Summary advice
    expect(screen.getByText(mockReport.summaryJa)).toBeInTheDocument();

    // Strengths and Improvements
    expect(screen.getByText(/自然な挨拶と感謝の言葉/)).toBeInTheDocument();
    expect(screen.getByText(/過去形と完了形の使い分け/)).toBeInTheDocument();

    // Key phrases
    expect(screen.getByText('Could I get...')).toBeInTheDocument();
    expect(screen.getByText('〜をいただけますか？')).toBeInTheDocument();

    // Action buttons
    const restartBtn = screen.getByRole('button', { name: /別のシチュエーションを試す/i });
    fireEvent.click(restartBtn);
    expect(handleRestart).toHaveBeenCalledTimes(1);

    const closeButtons = screen.getAllByRole('button', { name: /閉じる/i });
    fireEvent.click(closeButtons[0]);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('shows encouraging message when overallScore is below 80', () => {
    const lowScoreReport: SessionReport = {
      ...mockReport,
      overallScore: 65,
    };

    render(
      <ReportModal
        isOpen={true}
        onClose={vi.fn()}
        report={lowScoreReport}
      />
    );

    expect(screen.getByText(/よく頑張りました！着実に成長しています。/)).toBeInTheDocument();
  });
});
