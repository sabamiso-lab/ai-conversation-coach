import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ShadowingEvaluationCard from '../ShadowingEvaluationCard';

describe('ShadowingEvaluationCard', () => {
  it('renders null when evalResult is null or undefined', () => {
    const { container } = render(<ShadowingEvaluationCard evalResult={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders score, feedback, strengths, and improvements', () => {
    const mockEval = {
      score: 92,
      feedbackJa: 'とても流暢で聞き取りやすい発音でした！',
      strengthsJa: ['イントネーションが自然', '子音の発音がクリア'],
      improvementsJa: ['接続詞の前で少し間を置くとさらに良いです']
    };

    render(<ShadowingEvaluationCard evalResult={mockEval} />);

    expect(screen.getByText('AI Coach 発音・シャドーイング評価')).toBeInTheDocument();
    expect(screen.getByText('92')).toBeInTheDocument();
    expect(screen.getByText('💬 とても流暢で聞き取りやすい発音でした！')).toBeInTheDocument();
    expect(screen.getByText('👍 良かった点')).toBeInTheDocument();
    expect(screen.getByText('• イントネーションが自然')).toBeInTheDocument();
    expect(screen.getByText('🎯 さらに良くするポイント')).toBeInTheDocument();
    expect(screen.getByText('• 接続詞の前で少し間を置くとさらに良いです')).toBeInTheDocument();
  });
});
