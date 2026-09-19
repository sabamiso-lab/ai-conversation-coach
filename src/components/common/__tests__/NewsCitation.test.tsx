import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import NewsCitation from '../NewsCitation';

describe('NewsCitation', () => {
  const mockNews = {
    title: 'AI Technology Breakthrough in Global Markets 2026',
    url: 'https://example.com/news/ai-breakthrough'
  };

  it('renders nothing when newsSource is missing or has no url', () => {
    const { container, rerender } = render(<NewsCitation />);
    expect(container.firstChild).toBeNull();

    rerender(<NewsCitation newsSource={{}} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders card variant by default', () => {
    render(<NewsCitation newsSource={mockNews} />);

    expect(screen.getByText('関連ニュース記事 (Grounding)')).toBeInTheDocument();
    expect(screen.getByText(mockNews.title)).toBeInTheDocument();
    
    const link = screen.getByRole('link', { name: /元ニュース記事を開く/ });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', mockNews.url);
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('renders badge variant with truncated title and prevents click bubbling', () => {
    const handleClick = vi.fn();
    render(
      <div onClick={handleClick}>
        <NewsCitation newsSource={mockNews} variant="badge" />
      </div>
    );

    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link.textContent).toContain('出典: AI Technology Breakthrough in Globa...');
    expect(link).toHaveAttribute('href', mockNews.url);

    // Stop propagation check
    fireEvent.click(link);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
