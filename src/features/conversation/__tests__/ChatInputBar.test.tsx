import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ChatInputBar from '../ChatInputBar';

describe('ChatInputBar', () => {
  it('renders idle status and input elements correctly', () => {
    const onInputChange = vi.fn();
    const onSendMessage = vi.fn();
    const onToggleRecording = vi.fn();

    render(
      <ChatInputBar
        inputText=""
        onInputChange={onInputChange}
        onSendMessage={onSendMessage}
        isRecording={false}
        onToggleRecording={onToggleRecording}
        isAiThinking={false}
      />
    );

    expect(screen.getByText(/マイクで発話するか、テキストを入力して送信してください/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('英語でメッセージを入力...')).toBeInTheDocument();

    const sendButton = screen.getByRole('button', { name: '' });
    expect(sendButton).toBeDisabled();
  });

  it('renders recording state and allows input and send', () => {
    const onInputChange = vi.fn();
    const onSendMessage = vi.fn();
    const onToggleRecording = vi.fn();

    render(
      <ChatInputBar
        inputText="Hello AI"
        onInputChange={onInputChange}
        onSendMessage={onSendMessage}
        isRecording={true}
        onToggleRecording={onToggleRecording}
        isAiThinking={false}
      />
    );

    expect(screen.getByText(/音声認識中... 英語で発話してください/)).toBeInTheDocument();

    const input = screen.getByPlaceholderText(/音声認識中.../);
    fireEvent.change(input, { target: { value: 'Hello again' } });
    expect(onInputChange).toHaveBeenCalledWith('Hello again');

    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSendMessage).toHaveBeenCalledTimes(1);
  });
});
