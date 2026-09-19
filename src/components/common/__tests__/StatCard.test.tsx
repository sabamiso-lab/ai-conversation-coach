import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StatCard from '../StatCard';

describe('StatCard component', () => {
  it('renders value, label, and icon', () => {
    render(
      <StatCard
        icon={<span data-testid="stat-icon">Icon</span>}
        value="8 / 10"
        label="正解数"
      />
    );

    expect(screen.getByText('8 / 10')).toBeInTheDocument();
    expect(screen.getByText('正解数')).toBeInTheDocument();
    expect(screen.getByTestId('stat-icon')).toBeInTheDocument();
  });
});
