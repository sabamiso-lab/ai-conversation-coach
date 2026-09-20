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

import { CoachProvider } from '../../../contexts/CoachContext';
import { useCoach } from '../../../hooks/useCoach';
import FloatingCoachWidget from '../../coach/FloatingCoachWidget';

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

function TestChatRoomWithCoach() {
  const coach = useCoach();
  return (
    <>
      <ChatRoom situation={mockSituation} apiKey="dummy-key" model="gemini-3.5-flash-lite" onBack={() => {}} />
      <FloatingCoachWidget
        mode={coach.mode}
        situation={coach.situation}
        conversationHistory={coach.conversationHistory}
        conversationContext={coach.conversationContext}
        isOpen={coach.isOpen}
        onToggle={coach.toggleOpen}
        onClose={() => coach.setIsOpen(false)}
        coachMessages={coach.coachMessages}
        isLoading={coach.isLoading}
        error={coach.error}
        questionInput={coach.questionInput}
        onQuestionInputChange={coach.setQuestionInput}
        onAskQuestion={coach.askQuestion}
        onClearHistory={coach.clearHistory}
      />
    </>
  );
}

describe('ChatRoom component', () => {

  it('renders initial AI message with situation-specific translation', () => {
    render(
      <CoachProvider>
        <TestChatRoomWithCoach />
      </CoachProvider>
    );

    // Initial English message should be displayed
    expect(screen.getByText("Hi there! Welcome to Green Mountain Coffee. What can I get started for you today?")).toBeInTheDocument();

    // Toggle Japanese translation button
    const translationBtn = screen.getByRole('button', { name: /日本語訳/i });
    fireEvent.click(translationBtn);

    // Dynamic initialMessageJa should be rendered instead of hardcoded fallback
    expect(screen.getByText("いらっしゃいませ！グリーンマウンテンコーヒーへようこそ。本日ご注文は何にいたしましょうか？")).toBeInTheDocument();
  });

  it('toggles floating AI coach assistant from FAB and does not show duplicate header button', () => {
    render(
      <CoachProvider>
        <TestChatRoomWithCoach />
      </CoachProvider>
    );

    // Duplicate header "AI相談" button should NOT be in document
    expect(screen.queryByRole('button', { name: /AI相談/i })).not.toBeInTheDocument();

    // FAB should be in document
    const fab = screen.getByRole('button', { name: /AIコーチに質問する/i });
    expect(fab).toBeInTheDocument();

    // Click FAB to open floating panel
    fireEvent.click(fab);
    expect(screen.getByText('AI学習コーチ')).toBeInTheDocument();
    expect(screen.getByText('現在の会話内容について何でも相談')).toBeInTheDocument();

    // Close button
    const closeBtn = screen.getByRole('button', { name: /閉じる/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByText('AI学習コーチ')).not.toBeInTheDocument();
  });
});
