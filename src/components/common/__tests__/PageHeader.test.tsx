import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PageHeader from '../PageHeader';

describe('PageHeader component', () => {
  it('renders title, description and badge', () => {
    render(
      <PageHeader
        badgeIcon={<span data-testid="badge-icon">Icon</span>}
        badgeText="Studio Badge"
        title="Main Page Title"
        description="This is the description."
      />
    );

    expect(screen.getByText('Main Page Title')).toBeInTheDocument();
    expect(screen.getByText('This is the description.')).toBeInTheDocument();
    expect(screen.getByText('Studio Badge')).toBeInTheDocument();
    expect(screen.getByTestId('badge-icon')).toBeInTheDocument();
  });
});
