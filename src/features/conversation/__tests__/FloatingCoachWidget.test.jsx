import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FloatingCoachWidget from '../FloatingCoachWidget';

describe('FloatingCoachWidget component', () => {
  const mockSituation = {
    id: 'cafe-order',
    title: 'Cafe Order',
    titleJa: 'カフェでの注文'
  };

  const defaultProps = {
    situation: mockSituation,
    isOpen: false,
    onToggle: vi.fn(),
    onClose: vi.fn(),
    coachMessages: [
      {
        id: 'init-1',
        role: 'assistant',
        text: 'こんにちは！AIコーチです。何でも質問してください。',
        timestamp: 0
      }
    ],
    isLoading: false,
    error: null,
    questionInput: '',
    onQuestionInputChange: vi.fn(),
    onAskQuestion: vi.fn(),
    onClearHistory: vi.fn(),
    onApplyPhrase: vi.fn()
  };

  it('renders floating action button (FAB) by default', () => {
    render(<FloatingCoachWidget {...defaultProps} />);

    const fab = screen.getByRole('button', { name: /AIコーチに質問する/i });
    expect(fab).toBeInTheDocument();
    expect(screen.getByText('AIに相談')).toBeInTheDocument();

    fireEvent.click(fab);
    expect(defaultProps.onToggle).toHaveBeenCalledTimes(1);
  });

  it('renders coach panel when isOpen is true in conversation mode', () => {
    render(<FloatingCoachWidget {...defaultProps} isOpen={true} />);

    expect(screen.getByText('AI学習コーチ')).toBeInTheDocument();
    expect(screen.getByText(/会話ログ連携中/i)).toBeInTheDocument();
    expect(screen.getByText('こんにちは！AIコーチです。何でも質問してください。')).toBeInTheDocument();
  });

  it('renders general prompts when situation is null', () => {
    render(<FloatingCoachWidget {...defaultProps} situation={null} isOpen={true} />);

    expect(screen.getByText(/英語学習相談/i)).toBeInTheDocument();
    expect(screen.getByText('初心者におすすめの会話は？')).toBeInTheDocument();
  });

  it('triggers onAskQuestion when quick prompt chip is clicked', () => {
    const onAskQuestion = vi.fn();
    render(<FloatingCoachWidget {...defaultProps} isOpen={true} onAskQuestion={onAskQuestion} />);

    const nuanceChip = screen.getByText('相手の発言のニュアンス');
    fireEvent.click(nuanceChip);

    expect(onAskQuestion).toHaveBeenCalledWith(
      expect.stringContaining('直前の相手の発言の日本語訳とニュアンス')
    );
  });

  it('handles question input change and form submit', () => {
    const onQuestionInputChange = vi.fn();
    const onAskQuestion = vi.fn();

    render(
      <FloatingCoachWidget
        {...defaultProps}
        isOpen={true}
        questionInput="この表現は失礼ですか？"
        onQuestionInputChange={onQuestionInputChange}
        onAskQuestion={onAskQuestion}
      />
    );

    const input = screen.getByPlaceholderText(/現在話している内容について質問/i);
    fireEvent.change(input, { target: { value: '新しい質問' } });
    expect(onQuestionInputChange).toHaveBeenCalledWith('新しい質問');

    const submitBtn = screen.getByRole('button', { name: /質問を送信/i });
    fireEvent.click(submitBtn);
    expect(onAskQuestion).toHaveBeenCalledTimes(1);
  });

  it('calls onApplyPhrase when suggested phrase button is clicked', () => {
    const onApplyPhrase = vi.fn();
    const messagesWithPhrases = [
      {
        id: 'msg-1',
        role: 'assistant',
        text: '以下のフレーズがおすすめです。',
        suggestedPhrases: [
          { english: 'Could I have a cup of tea?', japanese: 'お茶を一杯いただけますか？' }
        ],
        timestamp: 0
      }
    ];

    render(
      <FloatingCoachWidget
        {...defaultProps}
        isOpen={true}
        coachMessages={messagesWithPhrases}
        onApplyPhrase={onApplyPhrase}
      />
    );

    expect(screen.getByText('"Could I have a cup of tea?"')).toBeInTheDocument();
    expect(screen.getByText('お茶を一杯いただけますか？')).toBeInTheDocument();

    const applyBtn = screen.getByRole('button', { name: /会話入力欄にセット/i });
    fireEvent.click(applyBtn);

    expect(onApplyPhrase).toHaveBeenCalledWith('Could I have a cup of tea?');
  });

  it('calls onClearHistory and onClose when buttons are clicked', () => {
    const onClearHistory = vi.fn();
    const onClose = vi.fn();

    render(
      <FloatingCoachWidget
        {...defaultProps}
        isOpen={true}
        onClearHistory={onClearHistory}
        onClose={onClose}
      />
    );

    const clearBtn = screen.getByRole('button', { name: /相談履歴をリセット/i });
    fireEvent.click(clearBtn);
    expect(onClearHistory).toHaveBeenCalledTimes(1);

    const closeBtn = screen.getByRole('button', { name: /閉じる/i });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders shadowing mode title, status, and prompts', () => {
    render(
      <FloatingCoachWidget
        {...defaultProps}
        mode="shadowing"
        isOpen={true}
      />
    );

    expect(screen.getByText('シャドーイングAIコーチ')).toBeInTheDocument();
    expect(screen.getByText(/スクリプト連携中/i)).toBeInTheDocument();
    expect(screen.getByText('リエゾン・発音のコツ')).toBeInTheDocument();
    expect(screen.getByText('構文・文法の分解解説')).toBeInTheDocument();
  });

  it('renders blitz mode title, status, and prompts', () => {
    render(
      <FloatingCoachWidget
        {...defaultProps}
        mode="blitz"
        isOpen={true}
      />
    );

    expect(screen.getByText('瞬間英作文AIコーチ')).toBeInTheDocument();
    expect(screen.getByText(/お題連携中/i)).toBeInTheDocument();
    expect(screen.getByText('別の自然な言い回し・表現')).toBeInTheDocument();
    expect(screen.getByText('なぜこの語順・文法になる？')).toBeInTheDocument();
  });

  it('renders active context banner with latest AI utterance and passes it to dynamic quick prompts', () => {
    const onAskQuestion = vi.fn();
    const conversationHistory = [
      { id: '1', role: 'ai', text: 'Good morning! What size latte would you like?' },
      { id: '2', role: 'user', text: 'I want a medium one.' },
      { id: '3', role: 'ai', text: 'Would you like whole milk or oat milk?' }
    ];

    render(
      <FloatingCoachWidget
        {...defaultProps}
        conversationHistory={conversationHistory}
        isOpen={true}
        onAskQuestion={onAskQuestion}
      />
    );

    // Active context banner shows the latest AI message
    expect(screen.getByText(/の直前の発言:/)).toBeInTheDocument();
    expect(screen.getByText('"Would you like whole milk or oat milk?"')).toBeInTheDocument();

    // Quick prompt chip includes the actual utterance
    const nuanceChip = screen.getByText('相手の発言のニュアンス');
    fireEvent.click(nuanceChip);

    expect(onAskQuestion).toHaveBeenCalledWith(
      expect.stringContaining('Would you like whole milk or oat milk?')
    );
  });

  it('renders active context banner in shadowing mode', () => {
    render(
      <FloatingCoachWidget
        {...defaultProps}
        mode="shadowing"
        shadowingContext={{
          title: 'Morning Routine',
          category: 'Daily',
          fullText: 'First, I wake up at 7 AM and stretch.'
        }}
        isOpen={true}
      />
    );

    expect(screen.getByText(/英文スクリプト: Morning Routine/)).toBeInTheDocument();
    expect(screen.getByText('"First, I wake up at 7 AM and stretch."')).toBeInTheDocument();
  });

  it('renders active context banner in blitz mode', () => {
    render(
      <FloatingCoachWidget
        {...defaultProps}
        mode="blitz"
        blitzContext={{
          topicTitle: '過去進行形',
          currentQuestion: {
            japanese: 'その時私は本を読んでいました。',
            sampleAnswer: 'I was reading a book at that time.'
          }
        }}
        isOpen={true}
      />
    );

    expect(screen.getByText(/出題中のお題 \(過去進行形\):/)).toBeInTheDocument();
    expect(screen.getByText('「その時私は本を読んでいました。」')).toBeInTheDocument();
  });
});

