import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ChatSidebar from '../ChatSidebar';

describe('ChatSidebar', () => {
  const mockSituation = {
    title: 'Cafe Order',
    descriptionJa: 'カフェで注文するシチュエーションです。',
    goals: ['コーヒーを注文する', '持ち帰りを伝える'],
    newsSource: {
      title: 'Coffee Trend 2026',
      url: 'https://example.com/coffee'
    }
  };

  it('renders null if situation is not provided', () => {
    const { container } = render(<ChatSidebar situation={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders situation goals, description, and news citation', () => {
    render(<ChatSidebar situation={mockSituation} />);

    expect(screen.getByText('会話シナリオ目標')).toBeInTheDocument();
    expect(screen.getByText('カフェで注文するシチュエーションです。')).toBeInTheDocument();
    expect(screen.getByText('コーヒーを注文する')).toBeInTheDocument();
    expect(screen.getByText('持ち帰りを伝える')).toBeInTheDocument();
    expect(screen.getByText('💡 学習アドバイス')).toBeInTheDocument();
    expect(screen.getByText('Coffee Trend 2026')).toBeInTheDocument();
  });
});
