import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SuggestionChips from '../SuggestionChips';

describe('SuggestionChips component', () => {
  const chips = [
    { label: 'ITスクラム', topic: 'ITスクラム開発でのスタンドアップ' },
    { label: '海外旅行', topic: '海外旅行のホテルチェックイン' }
  ];

  it('renders chips with default label and calls onSelect on click', () => {
    const handleSelect = vi.fn();
    render(<SuggestionChips chips={chips} onSelect={handleSelect} />);

    expect(screen.getByText('話題例:')).toBeInTheDocument();
    expect(screen.getByText('ITスクラム')).toBeInTheDocument();
    expect(screen.getByText('海外旅行')).toBeInTheDocument();

    fireEvent.click(screen.getByText('ITスクラム'));
    expect(handleSelect).toHaveBeenCalledWith('ITスクラム開発でのスタンドアップ');
  });

  it('does not render when chips array is empty', () => {
    const { container } = render(<SuggestionChips chips={[]} onSelect={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });
});
