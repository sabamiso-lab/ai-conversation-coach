import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import InstantBlitzPage from '../InstantBlitzPage';
import { CoachProvider } from '../../contexts/CoachContext';
import { SettingsProvider } from '../../contexts/SettingsContext';
import { PRESET_BLITZ_TOPICS } from '../../features/blitz/data/blitzTopics';

// Mock speech service
vi.mock('../../services/speech', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../services/speech')>();
  return {
    ...actual,
    speakText: vi.fn(),
    stopSpeaking: vi.fn(),
    isSpeechRecognitionSupported: () => false,
    SpeechRecognizer: vi.fn(),
  };
});

// Mock ai services
vi.mock('../../services/ai/blitz', () => ({
  evaluateBlitzSpeech: vi.fn(),
  generateBlitzQuestions: vi.fn(),
}));

function renderInstantBlitzPage() {
  return render(
    <SettingsProvider>
      <CoachProvider>
        <InstantBlitzPage />
      </CoachProvider>
    </SettingsProvider>
  );
}

describe('InstantBlitzPage Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders topic selector initially', () => {
    renderInstantBlitzPage();

    expect(screen.getByText('Oral Blitz Studio')).toBeInTheDocument();
    expect(screen.getByText(PRESET_BLITZ_TOPICS[0].title)).toBeInTheDocument();
  });

  it('preserves and restores original question set when restarting after retry', async () => {
    renderInstantBlitzPage();

    const firstTopic = PRESET_BLITZ_TOPICS[0];
    const originalCount = firstTopic.questions.length;
    const startButtons = screen.getAllByRole('button', { name: /瞬間英作文を開始/i });
    fireEvent.click(startButtons[0]);

    // Now in session view: verify counter shows 1 / originalCount
    expect(screen.getByText(`1 / ${originalCount}`)).toBeInTheDocument();
    expect(screen.getByText(firstTopic.title)).toBeInTheDocument();

    // Answer all questions, marking Q1 as incorrect and others as correct
    for (let i = 0; i < originalCount; i++) {
      // Reveal answer
      const revealBtn = screen.getByRole('button', { name: /答え合わせ・模範解答を見る/i });
      fireEvent.click(revealBtn);

      // Judge
      if (i === 0) {
        // Q1 is incorrect
        const incorrectBtn = screen.getByRole('button', { name: /言えなかった/i });
        fireEvent.click(incorrectBtn);
      } else {
        const correctBtn = screen.getByRole('button', { name: /言えた！/i });
        fireEvent.click(correctBtn);
      }
    }

    // Now in summary view
    await waitFor(() => {
      expect(screen.getByText('Blitz セッション完了！')).toBeInTheDocument();
    });

    // Summary should show retry button for 1 question
    const retryBtn = screen.getByRole('button', { name: /言えなかった1問をリトライ/i });
    expect(retryBtn).toBeInTheDocument();

    // Click retry
    fireEvent.click(retryBtn);

    // Now in retry session view: counter should show 1 / 1
    expect(screen.getByText('1 / 1')).toBeInTheDocument();
    expect(screen.getByText(`${firstTopic.title} (言えなかった問題リトライ)`)).toBeInTheDocument();

    // Finish retry question
    const revealRetryBtn = screen.getByRole('button', { name: /答え合わせ・模範解答を見る/i });
    fireEvent.click(revealRetryBtn);
    const correctRetryBtn = screen.getByRole('button', { name: /言えた！/i });
    fireEvent.click(correctRetryBtn);

    // Now back in summary view
    await waitFor(() => {
      expect(screen.getByText('Blitz セッション完了！')).toBeInTheDocument();
    });

    // Click "最初からもう一度" (Restart All)
    const restartAllBtn = screen.getByRole('button', { name: /最初からもう一度/i });
    fireEvent.click(restartAllBtn);

    // Crucial assertion: Session must be restored to original full question set (e.g. 5 questions), NOT 1 question!
    expect(screen.getByText(`1 / ${originalCount}`)).toBeInTheDocument();
    expect(screen.getByText(firstTopic.title)).toBeInTheDocument();
  });
});
