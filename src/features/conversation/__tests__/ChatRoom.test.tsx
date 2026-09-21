import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ChatRoom from '../ChatRoom';

let mockRecognizerCallbacks: {
  onStart?: () => void;
  onResult?: (result: { final: string; interim: string }) => void;
  onError?: (err: string) => void;
  onEnd?: () => void;
} = {};

// Mock speech service
vi.mock('../../../services/speech', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../services/speech')>();
  return {
    ...actual,
    speakText: vi.fn(),
    stopSpeaking: vi.fn(),
    isSpeechRecognitionSupported: () => true,
    SpeechRecognizer: vi.fn().mockImplementation((options) => {
      mockRecognizerCallbacks = options;
      return {
        start: vi.fn(() => {
          options.onStart?.();
        }),
        stop: vi.fn(() => {
          options.onEnd?.();
        }),
        abort: vi.fn(() => {
          options.onEnd?.();
        })
      };
    })
  };
});

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

  it('appends speech recognition result to existing input text without overwriting on subsequent input', () => {
    render(
      <CoachProvider>
        <TestChatRoomWithCoach />
      </CoachProvider>
    );

    const inputField = screen.getByPlaceholderText(/英語でメッセージを入力/i) as HTMLInputElement;
    const micButton = screen.getByRole('button', { name: /マイクで英語を話す/i });

    // Step 1: User types manual text
    fireEvent.change(inputField, { target: { value: 'I would like' } });
    expect(inputField.value).toBe('I would like');

    // Step 2: Start recording
    fireEvent.click(micButton);

    // Simulate recognition result
    act(() => {
      mockRecognizerCallbacks.onResult?.({
        final: 'a hot coffee',
        interim: ''
      });
    });

    // Existing text should NOT be erased; speech should be appended with a space
    expect(inputField.value).toBe('I would like a hot coffee');

    // Step 3: Stop recording
    const stopMicButton = screen.getByRole('button', { name: /録音停止/i });
    fireEvent.click(stopMicButton);

    // Step 4: Start recording AGAIN to add more text
    const restartMicButton = screen.getByRole('button', { name: /マイクで英語を話す/i });
    fireEvent.click(restartMicButton);

    // Simulate subsequent recognition
    act(() => {
      mockRecognizerCallbacks.onResult?.({
        final: 'please',
        interim: ''
      });
    });

    // Previous text must NOT be erased; new speech is appended
    expect(inputField.value).toBe('I would like a hot coffee please');
  });

  it('prevents duplicate word input when speech repeats existing word or overlaps', () => {
    render(
      <CoachProvider>
        <TestChatRoomWithCoach />
      </CoachProvider>
    );

    const inputField = screen.getByPlaceholderText(/英語でメッセージを入力/i) as HTMLInputElement;
    const micButton = screen.getByRole('button', { name: /マイクで英語を話す/i });

    // Step 1: User types manual text "Hello"
    fireEvent.change(inputField, { target: { value: 'Hello' } });
    expect(inputField.value).toBe('Hello');

    // Step 2: Start recording
    fireEvent.click(micButton);

    // Simulate speech echoing or repeating "Hello"
    act(() => {
      mockRecognizerCallbacks.onResult?.({
        final: 'Hello, nice to meet you',
        interim: ''
      });
    });

    // Should NOT become "Hello Hello, nice to meet you"
    expect(inputField.value).toBe('Hello, nice to meet you');
  });
});
