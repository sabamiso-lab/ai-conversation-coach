import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AiGeneratorCard from '../AiGeneratorCard';

describe('AiGeneratorCard component', () => {
  it('renders title, badgeText, description and collapsed state', () => {
    render(
      <AiGeneratorCard
        badgeText="Test AI Badge"
        title="Custom Generator Title"
        description="Description for generator"
        isOpen={false}
        onToggle={vi.fn()}
      >
        <div data-testid="form-content">Form Fields</div>
      </AiGeneratorCard>
    );

    expect(screen.getByText('Custom Generator Title')).toBeInTheDocument();
    expect(screen.getByText('Test AI Badge')).toBeInTheDocument();
    expect(screen.getByText('Description for generator')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /AIで作成する/i })).toBeInTheDocument();
    expect(screen.queryByTestId('form-content')).not.toBeInTheDocument();
  });

  it('renders open state with children and "閉じる" button', () => {
    const handleToggle = vi.fn();
    render(
      <AiGeneratorCard
        title="Custom Generator Title"
        isOpen={true}
        onToggle={handleToggle}
      >
        <div data-testid="form-content">Form Fields</div>
      </AiGeneratorCard>
    );

    expect(screen.getByTestId('form-content')).toBeInTheDocument();
    const closeBtn = screen.getByRole('button', { name: /閉じる/i });
    expect(closeBtn).toBeInTheDocument();

    fireEvent.click(closeBtn);
    expect(handleToggle).toHaveBeenCalledTimes(1);
  });

  it('shows "Key未設定" warning badge when hasApiKey is false', () => {
    render(
      <AiGeneratorCard
        title="Custom Generator"
        hasApiKey={false}
        isOpen={false}
        onToggle={vi.fn()}
      />
    );

    expect(screen.getByText(/Key未設定/i)).toBeInTheDocument();
  });
});
