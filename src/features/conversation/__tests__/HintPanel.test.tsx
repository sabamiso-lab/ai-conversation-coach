import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HintPanel from '../HintPanel';
import type { HintSuggestion } from '../../../types';

describe('HintPanel component', () => {
  const mockHints: HintSuggestion[] = [
    {
      english: 'Could I get a medium latte, please?',
      japanese: 'Mサイズのラテをいただけますか？',
      difficulty: 'Beginner'
    },
    {
      english: 'What blend of beans do you recommend?',
      japanese: 'おすすめのブレンド豆は何ですか？',
      difficulty: 'Intermediate'
    }
  ];

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <HintPanel
        isOpen={false}
        onClose={vi.fn()}
        hints={mockHints}
        onSelectHint={vi.fn()}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders loading state when loading is true', () => {
    render(
      <HintPanel
        isOpen={true}
        onClose={vi.fn()}
        hints={[]}
        loading={true}
        onSelectHint={vi.fn()}
      />
    );

    expect(screen.getByText(/AIが最適な回答フレーズを考えています.../i)).toBeInTheDocument();
  });

  it('renders hint list and triggers onSelectHint and onClose when a hint is clicked', () => {
    const handleSelectHint = vi.fn();
    const handleClose = vi.fn();

    render(
      <HintPanel
        isOpen={true}
        onClose={handleClose}
        hints={mockHints}
        loading={false}
        onSelectHint={handleSelectHint}
      />
    );

    expect(screen.getByText('次に言えるフレーズのヒント')).toBeInTheDocument();
    expect(screen.getByText(/どれか1つをタップすると、その内容で会話を続けることができます。/i)).toBeInTheDocument();

    // Check hint items
    expect(screen.getByText('"Could I get a medium latte, please?"')).toBeInTheDocument();
    expect(screen.getByText('Mサイズのラテをいただけますか？')).toBeInTheDocument();
    expect(screen.getByText('"What blend of beans do you recommend?"')).toBeInTheDocument();
    expect(screen.getByText('おすすめのブレンド豆は何ですか？')).toBeInTheDocument();

    // Check difficulty badge
    expect(screen.getByText('Beginner')).toBeInTheDocument();
    expect(screen.getByText('Intermediate')).toBeInTheDocument();

    // Click first hint
    const firstHint = screen.getByText('"Could I get a medium latte, please?"').closest('.hint-bubble');
    expect(firstHint).toBeInTheDocument();
    fireEvent.click(firstHint!);

    expect(handleSelectHint).toHaveBeenCalledWith('Could I get a medium latte, please?');
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
