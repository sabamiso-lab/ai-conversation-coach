import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CategoryFilter from '../CategoryFilter';

describe('CategoryFilter component', () => {
  const categories = ['All', 'Daily', 'Business'];

  it('renders all category buttons and sets "All" to "すべて" by default', () => {
    render(
      <CategoryFilter
        categories={categories}
        selectedCategory="All"
        onSelectCategory={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'すべて' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Daily' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Business' })).toBeInTheDocument();
  });

  it('applies primary button class to selected category', () => {
    render(
      <CategoryFilter
        categories={categories}
        selectedCategory="Daily"
        onSelectCategory={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Daily' })).toHaveClass('btn-primary');
    expect(screen.getByRole('button', { name: 'すべて' })).toHaveClass('btn-secondary');
    expect(screen.getByRole('button', { name: 'Business' })).toHaveClass('btn-secondary');
  });

  it('calls onSelectCategory when a button is clicked', () => {
    const handleSelect = vi.fn();
    render(
      <CategoryFilter
        categories={categories}
        selectedCategory="All"
        onSelectCategory={handleSelect}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Business' }));
    expect(handleSelect).toHaveBeenCalledWith('Business');
  });

  it('uses custom getLabel when provided', () => {
    const getLabel = (cat: string) => (cat === 'Daily' ? '日常会話' : cat);
    render(
      <CategoryFilter
        categories={categories}
        selectedCategory="All"
        onSelectCategory={vi.fn()}
        getLabel={getLabel}
      />
    );

    expect(screen.getByRole('button', { name: '日常会話' })).toBeInTheDocument();
  });
});
