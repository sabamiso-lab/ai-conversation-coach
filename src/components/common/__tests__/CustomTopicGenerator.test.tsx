import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CustomTopicGenerator from '../CustomTopicGenerator';

describe('CustomTopicGenerator component', () => {
  it('renders with closed accordion by default and opens on toggle', () => {
    render(
      <CustomTopicGenerator
        hasApiKey={true}
        title="カスタムテストタイトル"
        description="カスタムテスト説明文"
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByText('カスタムテストタイトル')).toBeInTheDocument();
    expect(screen.getByText('カスタムテスト説明文')).toBeInTheDocument();

    const toggleBtn = screen.getByRole('button', { name: /AIで作成する/i });
    fireEvent.click(toggleBtn);

    expect(screen.getByPlaceholderText(/空欄でおまかせ/i)).toBeInTheDocument();
  });

  it('populates topic via suggestion chips and random button', () => {
    const handleRandom = vi.fn().mockReturnValue('ランダムなお題');
    render(
      <CustomTopicGenerator
        hasApiKey={true}
        title="トピックテスト"
        description="説明"
        suggestionChips={['☕ カフェ', '✈️ 空港']}
        getRandomTopic={handleRandom}
        onSubmit={vi.fn()}
        isOpen={true}
      />
    );

    const input = screen.getByPlaceholderText(/空欄でおまかせ/i) as HTMLInputElement;
    expect(input.value).toBe('');

    // Click chip
    fireEvent.click(screen.getByRole('button', { name: '☕ カフェ' }));
    expect(input.value).toBe('☕ カフェ');

    // Click random
    fireEvent.click(screen.getByRole('button', { name: /🎲 ランダムに選ぶ/i }));
    expect(handleRandom).toHaveBeenCalled();
    expect(input.value).toBe('ランダムなお題');
  });

  it('calls onSubmit with topic and difficulty when submitted', () => {
    const handleSubmit = vi.fn();
    render(
      <CustomTopicGenerator
        hasApiKey={true}
        title="送信テスト"
        description="説明"
        onSubmit={handleSubmit}
        isOpen={true}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /おまかせ/i });
    fireEvent.click(submitBtn);

    expect(handleSubmit).toHaveBeenCalledWith({
      topic: '',
      difficulty: 'Intermediate'
    });
  });

  it('prompts API key modal when submitted without apiKey', () => {
    const handleOpenApiKey = vi.fn();
    const handleSubmit = vi.fn();

    render(
      <CustomTopicGenerator
        hasApiKey={false}
        onOpenApiKeyModal={handleOpenApiKey}
        title="キーなしテスト"
        description="説明"
        onSubmit={handleSubmit}
        isOpen={true}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /おまかせ/i });
    fireEvent.click(submitBtn);

    expect(handleOpenApiKey).toHaveBeenCalled();
    expect(handleSubmit).not.toHaveBeenCalled();
  });
});
