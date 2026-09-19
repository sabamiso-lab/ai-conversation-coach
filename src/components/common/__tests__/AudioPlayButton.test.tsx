import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AudioPlayButton from '../AudioPlayButton';
import { speakText } from '../../../services/speech';

vi.mock('../../../services/speech', () => ({
  speakText: vi.fn(),
  stopSpeaking: vi.fn(),
}));

describe('AudioPlayButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders button with default label and speaks text when clicked', () => {
    render(<AudioPlayButton text="Hello world" />);

    const button = screen.getByRole('button', { name: /音声を聞く/i });
    expect(button).toBeInTheDocument();
    expect(screen.getByText('聴く')).toBeInTheDocument();

    fireEvent.click(button);
    expect(speakText).toHaveBeenCalledTimes(1);
    expect(speakText).toHaveBeenCalledWith('Hello world', { rate: 0.95, lang: 'en-US' });
  });

  it('renders icon variant without label text', () => {
    render(<AudioPlayButton text="Test answer" variant="icon" title="模範音声を再生" />);

    const button = screen.getByRole('button', { name: '模範音声を再生' });
    expect(button).toBeInTheDocument();
    expect(screen.queryByText('聴く')).toBeNull();

    fireEvent.click(button);
    expect(speakText).toHaveBeenCalledWith('Test answer', { rate: 0.95, lang: 'en-US' });
  });

  it('does not speak text when disabled or text is empty', () => {
    const { rerender } = render(<AudioPlayButton text="Hello" disabled />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(speakText).not.toHaveBeenCalled();

    rerender(<AudioPlayButton text="" />);
    fireEvent.click(button);
    expect(speakText).not.toHaveBeenCalled();
  });

  it('invokes custom onClick handler', () => {
    const handleClick = vi.fn();
    render(<AudioPlayButton text="Hello" onClick={handleClick} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(speakText).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
