import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DifficultyBadge from '../DifficultyBadge';

describe('DifficultyBadge component', () => {
  it('does not render when difficulty is empty or null', () => {
    const { container } = render(<DifficultyBadge difficulty="" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders Beginner badge correctly regardless of case', () => {
    const { rerender } = render(<DifficultyBadge difficulty="beginner" />);
    expect(screen.getByText('Beginner')).toBeInTheDocument();
    expect(screen.getByText('Beginner')).toHaveClass('badge-green');

    rerender(<DifficultyBadge difficulty="Beginner" />);
    expect(screen.getByText('Beginner')).toBeInTheDocument();
    expect(screen.getByText('Beginner')).toHaveClass('badge-green');
  });

  it('renders Intermediate badge correctly', () => {
    render(<DifficultyBadge difficulty="Intermediate" />);
    expect(screen.getByText('Intermediate')).toBeInTheDocument();
    expect(screen.getByText('Intermediate')).toHaveClass('badge-yellow');
  });

  it('renders Advanced badge correctly', () => {
    render(<DifficultyBadge difficulty="advanced" />);
    expect(screen.getByText('Advanced')).toBeInTheDocument();
    expect(screen.getByText('Advanced')).toHaveClass('badge-purple');
  });

  it('falls back gracefully for unknown difficulty', () => {
    render(<DifficultyBadge difficulty="Expert" />);
    expect(screen.getByText('Expert')).toBeInTheDocument();
  });
});
