import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FeedbackGrid from '../FeedbackGrid';

describe('FeedbackGrid', () => {
  it('renders nothing when strengths and improvements are empty', () => {
    const { container } = render(<FeedbackGrid strengths={[]} improvements={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders strengths and improvements with default titles', () => {
    render(
      <FeedbackGrid
        strengths={['クリアな発音', '適切な文法']}
        improvements={['話すスピードを一定にする', 'イントネーションの改善']}
      />
    );

    expect(screen.getByText('💪 良かった点')).toBeInTheDocument();
    expect(screen.getByText('• クリアな発音')).toBeInTheDocument();
    expect(screen.getByText('• 適切な文法')).toBeInTheDocument();

    expect(screen.getByText('🎯 次回の改善ポイント')).toBeInTheDocument();
    expect(screen.getByText('• 話すスピードを一定にする')).toBeInTheDocument();
    expect(screen.getByText('• イントネーションの改善')).toBeInTheDocument();
  });

  it('customizes titles and handles only strengths or only improvements', () => {
    const { rerender } = render(
      <FeedbackGrid
        strengths={['良かったところ']}
        strengthsTitle="👍 Good Points"
      />
    );

    expect(screen.getByText('👍 Good Points')).toBeInTheDocument();
    expect(screen.getByText('• 良かったところ')).toBeInTheDocument();
    expect(screen.queryByText('🎯 次回の改善ポイント')).toBeNull();

    rerender(
      <FeedbackGrid
        improvements={['改善点']}
        improvementsTitle="🎯 Needs Work"
      />
    );

    expect(screen.queryByText('👍 Good Points')).toBeNull();
    expect(screen.getByText('🎯 Needs Work')).toBeInTheDocument();
    expect(screen.getByText('• 改善点')).toBeInTheDocument();
  });
});
