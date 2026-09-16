import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ShadowingSelector from '../ShadowingSelector';

describe('ShadowingSelector component', () => {
  it('renders title and script cards correctly', () => {
    render(<ShadowingSelector onSelectScript={vi.fn()} />);

    expect(screen.getByText('シャドーイング訓練教材を選択')).toBeInTheDocument();
    expect(screen.getByText('Order at a Coffee Shop')).toBeInTheDocument();
  });

  it('filters scripts when category button is clicked', () => {
    render(<ShadowingSelector onSelectScript={vi.fn()} />);

    // Click "Travel" category
    const travelButton = screen.getByRole('button', { name: 'Travel' });
    fireEvent.click(travelButton);

    expect(screen.queryByText('Order at a Coffee Shop')).not.toBeInTheDocument();
    expect(screen.getByText('Asking for Hotel Amenities')).toBeInTheDocument();
  });

  it('triggers onSelectScript when card is clicked', () => {
    const handleSelect = vi.fn();
    render(<ShadowingSelector onSelectScript={handleSelect} />);

    const cardTitle = screen.getByText('Order at a Coffee Shop');
    const card = cardTitle.closest('.situation-card');
    fireEvent.click(card);

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect.mock.calls[0][0].id).toBe('script-1');
  });

  it('populates topic input when random button or topic chips are clicked', () => {
    render(<ShadowingSelector onSelectScript={vi.fn()} />);

    // Open custom AI form
    const createBtn = screen.getByRole('button', { name: /AIで作成する/i });
    fireEvent.click(createBtn);

    const input = screen.getByPlaceholderText(/例: レストランの予約、病院受診.../i);
    expect(input.value).toBe('');

    // Click popular topic chip
    const chipBtn = screen.getByRole('button', { name: '☕ カフェ注文' });
    fireEvent.click(chipBtn);
    expect(input.value).toBe('カフェでの注文とカスタマイズ');

    // Click random button
    const randomBtn = screen.getByRole('button', { name: /🎲 ランダムに選ぶ/i });
    fireEvent.click(randomBtn);
    expect(input.value).not.toBe('');
  });
});
