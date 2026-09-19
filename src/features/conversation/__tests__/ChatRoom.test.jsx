import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ChatRoom from '../ChatRoom';

// Mock speech service
vi.mock('../../../services/speech', () => ({
  speakText: vi.fn(),
  stopSpeaking: vi.fn(),
  isSpeechRecognitionSupported: () => false,
  SpeechRecognizer: vi.fn(),
}));

window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('ChatRoom component', () => {
  const mockSituation = {
    id: 'cafe-order',
    title: 'Cafe Coffee Order',
    titleJa: 'カフェでの注文',
    category: 'Daily',
    icon: 'Coffee',
    difficulty: 'Beginner',
    systemRole: 'Friendly Barista',
    userRole: 'Customer',
    description: 'Order coffee.',
    descriptionJa: 'コーヒーを注文します。',
    initialMessage: "Hi there! Welcome to Green Mountain Coffee. What can I get started for you today?",
    initialMessageJa: "いらっしゃいませ！グリーンマウンテンコーヒーへようこそ。本日ご注文は何にいたしましょうか？",
    goals: ['Order a drink']
  };

  it('renders initial AI message with situation-specific translation', () => {
    render(<ChatRoom situation={mockSituation} apiKey="dummy-key" model="gemini-3.5-flash-lite" onBack={() => {}} />);

    // Initial English message should be displayed
    expect(screen.getByText("Hi there! Welcome to Green Mountain Coffee. What can I get started for you today?")).toBeInTheDocument();

    // Toggle Japanese translation button
    const translationBtn = screen.getByRole('button', { name: /日本語訳/i });
    fireEvent.click(translationBtn);

    // Dynamic initialMessageJa should be rendered instead of hardcoded fallback
    expect(screen.getByText("いらっしゃいませ！グリーンマウンテンコーヒーへようこそ。本日ご注文は何にいたしましょうか？")).toBeInTheDocument();
  });
});
