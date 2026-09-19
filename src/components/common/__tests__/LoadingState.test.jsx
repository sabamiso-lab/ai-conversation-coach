import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoadingState from '../LoadingState';

describe('LoadingState component', () => {
  it('renders message when provided', () => {
    render(<LoadingState message="データを読み込み中..." />);
    expect(screen.getByText('データを読み込み中...')).toBeInTheDocument();
  });

  it('renders title and subMessage when both are provided', () => {
    render(
      <LoadingState
        message="AIが分析中..."
        subMessage="詳細な評価レポートを作成しています。"
        icon="sparkles"
      />
    );

    expect(screen.getByText('AIが分析中...')).toBeInTheDocument();
    expect(screen.getByText('詳細な評価レポートを作成しています。')).toBeInTheDocument();
  });

  it('applies animate-spin class to icon', () => {
    const { container } = render(<LoadingState message="Loading..." />);
    const icon = container.querySelector('.animate-spin');
    expect(icon).toBeInTheDocument();
  });
});
