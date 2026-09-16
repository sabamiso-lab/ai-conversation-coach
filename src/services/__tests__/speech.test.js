import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { speakText, stopSpeaking } from '../speech';

describe('speech.js TTS module', () => {
  let mockSpeak;
  let mockCancel;
  let mockGetVoices;
  let originalSpeechSynthesis;
  let originalUtterance;

  beforeEach(() => {
    vi.useFakeTimers();

    mockSpeak = vi.fn();
    mockCancel = vi.fn();
    mockGetVoices = vi.fn().mockReturnValue([]);

    originalSpeechSynthesis = window.speechSynthesis;
    originalUtterance = window.SpeechSynthesisUtterance;

    window.speechSynthesis = {
      speak: mockSpeak,
      cancel: mockCancel,
      getVoices: mockGetVoices,
      onvoiceschanged: null
    };

    window.SpeechSynthesisUtterance = class {
      constructor(text) {
        this.text = text;
        this.lang = '';
        this.rate = 1;
        this.pitch = 1;
      }
    };
  });

  afterEach(() => {
    vi.useRealTimers();
    window.speechSynthesis = originalSpeechSynthesis;
    window.SpeechSynthesisUtterance = originalUtterance;
  });

  it('speaks immediately when voices are available', () => {
    mockGetVoices.mockReturnValue([{ name: 'Google US English', lang: 'en-US' }]);

    speakText('Hello world');

    expect(mockCancel).toHaveBeenCalled();
    expect(mockSpeak).toHaveBeenCalledTimes(1);
    expect(mockSpeak.mock.calls[0][0].text).toBe('Hello world');
  });

  it('speaks only once when voices are empty and onvoiceschanged fires before timeout', () => {
    mockGetVoices.mockReturnValue([]);

    speakText('Hello delay');

    expect(mockSpeak).not.toHaveBeenCalled();

    // Trigger onvoiceschanged
    if (window.speechSynthesis.onvoiceschanged) {
      window.speechSynthesis.onvoiceschanged();
    }

    expect(mockSpeak).toHaveBeenCalledTimes(1);

    // Fast-forward 100ms timeout
    vi.advanceTimersByTime(100);

    // Should STILL be 1 call, not 2!
    expect(mockSpeak).toHaveBeenCalledTimes(1);
  });

  it('speaks only once when voices are empty and timeout fires before onvoiceschanged', () => {
    mockGetVoices.mockReturnValue([]);

    speakText('Hello timeout');

    expect(mockSpeak).not.toHaveBeenCalled();

    // Advance 100ms to trigger fallback timeout
    vi.advanceTimersByTime(100);

    expect(mockSpeak).toHaveBeenCalledTimes(1);

    // Now trigger onvoiceschanged late
    if (window.speechSynthesis.onvoiceschanged) {
      window.speechSynthesis.onvoiceschanged();
    }

    // Should STILL be 1 call!
    expect(mockSpeak).toHaveBeenCalledTimes(1);
  });

  it('clears pending timers and listeners when stopSpeaking is called', () => {
    mockGetVoices.mockReturnValue([]);

    speakText('Hello cancel');
    stopSpeaking();

    vi.advanceTimersByTime(100);

    expect(mockSpeak).not.toHaveBeenCalled();
  });
});
