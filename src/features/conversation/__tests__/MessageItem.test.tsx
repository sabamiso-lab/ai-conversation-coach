import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MessageItem from '../MessageItem';
import type { ChatMessage } from '../../../types';

// Mock speech service
vi.mock('../../../services/speech', () => ({
  speakText: vi.fn(),
}));

describe('MessageItem component', () => {
  it('renders AI message text correctly', () => {
    const message: Partial<ChatMessage> & { role: 'ai'; text: string } = {
      role: 'ai',
      text: 'Hello, how can I help you today?',
      translation: 'こんにちは、今日はどのようなご用件でしょうか？',
    };

    render(<MessageItem message={message} />);

    expect(screen.getByText('AI Coach')).toBeInTheDocument();
    expect(screen.getByText('Hello, how can I help you today?')).toBeInTheDocument();
    expect(screen.queryByText('こんにちは、今日はどのようなご用件でしょうか？')).not.toBeInTheDocument();
  });

  it('toggles Japanese translation when button is clicked', () => {
    const message: Partial<ChatMessage> & { role: 'ai'; text: string } = {
      role: 'ai',
      text: 'Hello!',
      translation: 'こんにちは！',
    };

    render(<MessageItem message={message} />);

    const translationBtn = screen.getByRole('button', { name: /日本語訳/i });
    fireEvent.click(translationBtn);

    expect(screen.getByText('こんにちは！')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /日本語を隠す/i })).toBeInTheDocument();

    fireEvent.click(translationBtn);
    expect(screen.queryByText('こんにちは！')).not.toBeInTheDocument();
  });

  it('renders user message with clarity badge and feedback card', () => {
    const message: Partial<ChatMessage> & { role: 'user'; text: string } = {
      role: 'user',
      text: 'I want coffee please.',
      clarityBadgeJa: '🟢 意図明確',
      clarityStatus: 'FULL',
      clarityFeedbackJa: 'バッチリ伝わります！',
      simpleAlternative: 'Can I have a coffee, please?',
    };

    render(<MessageItem message={message} />);

    expect(screen.getByText('You')).toBeInTheDocument();
    expect(screen.getByText('🟢 意図明確')).toBeInTheDocument();
    expect(screen.getByText('💬 バッチリ伝わります！')).toBeInTheDocument();
    expect(screen.getByText('"Can I have a coffee, please?"')).toBeInTheDocument();
  });
});
