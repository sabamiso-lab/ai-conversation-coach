import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SpeechEvaluationCard from '../SpeechEvaluationCard';

describe('SpeechEvaluationCard component', () => {
  it('renders loading state when isLoading is true', () => {
    render(<SpeechEvaluationCard isLoading loadingMessage="評価中..." />);
    expect(screen.getByText('評価中...')).toBeInTheDocument();
  });

  it('renders error state with retry button', () => {
    const handleRetry = vi.fn();
    render(<SpeechEvaluationCard error="エラーが発生しました" onRetry={handleRetry} />);

    expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
    const retryBtn = screen.getByRole('button', { name: /再試行/i });
    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('renders score, status, feedback, improved speech and advice', () => {
    render(
      <SpeechEvaluationCard
        title="AI 発話判定"
        score={95}
        statusLabel="🎉 完璧！"
        statusVariant="PERFECT"
        feedbackJa="素晴らしい英語です！"
        improvedSpeech="I should have woken up earlier."
        adviceJa="should have + p.p.の使い方が正確です。"
      />
    );

    expect(screen.getByText('AI 発話判定')).toBeInTheDocument();
    expect(screen.getByText('95')).toBeInTheDocument();
    expect(screen.getByText('🎉 完璧！')).toBeInTheDocument();
    expect(screen.getByText('💬 素晴らしい英語です！')).toBeInTheDocument();
    expect(screen.getByText('"I should have woken up earlier."')).toBeInTheDocument();
    expect(screen.getByText(/should have \+ p\.p\./i)).toBeInTheDocument();
  });
});
