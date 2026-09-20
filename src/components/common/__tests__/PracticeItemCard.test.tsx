import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PracticeItemCard from '../PracticeItemCard';

describe('PracticeItemCard component', () => {
  it('renders title, description, and action button', () => {
    const handleClick = vi.fn();
    render(
      <PracticeItemCard
        title="Test Card Title"
        titleJa="テストカード"
        description="This is a test description."
        difficulty="Intermediate"
        actionText="テスト開始"
        onClick={handleClick}
      />
    );

    expect(screen.getByText('Test Card Title')).toBeInTheDocument();
    expect(screen.getByText('テストカード')).toBeInTheDocument();
    expect(screen.getByText('This is a test description.')).toBeInTheDocument();
    expect(screen.getByText(/テスト開始/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText('Test Card Title'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders custom children and special border styles', () => {
    const { container } = render(
      <PracticeItemCard
        title="Special Card"
        isSpecial={true}
      >
        <div data-testid="custom-child">Extra Content</div>
      </PracticeItemCard>
    );

    expect(screen.getByTestId('custom-child')).toBeInTheDocument();
    const cardEl = container.querySelector('.situation-card');
    expect(cardEl).not.toBeNull();
  });
});
