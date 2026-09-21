import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { speakText, stopSpeaking, isSpeechSynthesisSupported, findPreferredVoice, isSpeaking } from '../index';

describe('TTS Module (Speech Synthesis)', () => {
  let mockSpeak: Mock;
  let mockCancel: Mock;
  let mockGetVoices: Mock;
  let originalSpeechSynthesis: SpeechSynthesis;
  let originalUtterance: typeof SpeechSynthesisUtterance;

  beforeEach(() => {
    vi.useFakeTimers();

    mockSpeak = vi.fn();
    mockCancel = vi.fn();
    mockGetVoices = vi.fn().mockReturnValue([]);

    originalSpeechSynthesis = window.speechSynthesis;
    originalUtterance = window.SpeechSynthesisUtterance;

    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        speak: mockSpeak,
        cancel: mockCancel,
        getVoices: mockGetVoices,
        onvoiceschanged: null,
        speaking: false,
        paused: false
      },
      writable: true,
      configurable: true
    });

    window.SpeechSynthesisUtterance = class {
      text: string;
      lang = '';
      rate = 1;
      pitch = 1;
      volume = 1;
      voice = null;
      onstart = null;
      onend = null;
      onerror = null;
      onpause = null;
      onresume = null;
      onmark = null;
      onboundary = null;
      addEventListener = vi.fn();
      removeEventListener = vi.fn();
      dispatchEvent = vi.fn();

      constructor(text?: string) {
        this.text = text || '';
      }
    } as unknown as typeof SpeechSynthesisUtterance;
  });

  afterEach(() => {
    vi.useRealTimers();
    Object.defineProperty(window, 'speechSynthesis', {
      value: originalSpeechSynthesis,
      writable: true,
      configurable: true
    });
    window.SpeechSynthesisUtterance = originalUtterance;
  });

  it('reports speech synthesis support correctly', () => {
    expect(isSpeechSynthesisSupported()).toBe(true);
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
      (window.speechSynthesis.onvoiceschanged as unknown as () => void)();
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

    // Fast-forward 100ms timeout
    vi.advanceTimersByTime(100);

    expect(mockSpeak).toHaveBeenCalledTimes(1);

    // Now trigger onvoiceschanged late
    if (window.speechSynthesis.onvoiceschanged) {
      (window.speechSynthesis.onvoiceschanged as unknown as () => void)();
    }

    // Should STILL be 1 call, not 2!
    expect(mockSpeak).toHaveBeenCalledTimes(1);
  });

  it('cancels speech and clears timeout when stopSpeaking is called', () => {
    mockGetVoices.mockReturnValue([]);

    speakText('Hello cancel');

    expect(mockSpeak).not.toHaveBeenCalled();

    stopSpeaking();
    expect(mockCancel).toHaveBeenCalled();

    // Advance timers past the 100ms fallback
    vi.advanceTimersByTime(200);

    // Should NOT speak because it was stopped
    expect(mockSpeak).not.toHaveBeenCalled();
  });

  it('prevents duplicate playback when speakText is called rapidly with identical text', () => {
    mockGetVoices.mockReturnValue([{ name: 'Google US English', lang: 'en-US' }]);

    // First call
    speakText('Duplicate check');
    expect(mockSpeak).toHaveBeenCalledTimes(1);

    // Second call immediately with same text
    speakText('Duplicate check');
    // Should NOT trigger second speak
    expect(mockSpeak).toHaveBeenCalledTimes(1);

    // Advance timer past duplicate debounce window (> 150ms)
    vi.advanceTimersByTime(200);

    // Third call after delay with same text
    speakText('Duplicate check');
    // Should trigger speak now
    expect(mockSpeak).toHaveBeenCalledTimes(2);
  });

  it('selects preferred natural voice matching language prefix', () => {
    const voices = [
      { name: 'Microsoft David', lang: 'en-US' },
      { name: 'Google US English Natural', lang: 'en-US' },
      { name: 'Kyoko', lang: 'ja-JP' }
    ] as SpeechSynthesisVoice[];

    const preferred = findPreferredVoice(voices, 'en-US');
    expect(preferred?.name).toBe('Google US English Natural');
  });

  it('falls back to standard language voice if no natural voice found', () => {
    const voices = [
      { name: 'Microsoft David', lang: 'en-US' },
      { name: 'Kyoko', lang: 'ja-JP' }
    ] as SpeechSynthesisVoice[];

    const preferred = findPreferredVoice(voices, 'en-US');
    expect(preferred?.name).toBe('Microsoft David');
  });

  it('returns null if voice list is empty', () => {
    expect(findPreferredVoice([])).toBeNull();
  });

  it('does not invoke onEnd when utterance is cancelled or interrupted', () => {
    mockGetVoices.mockReturnValue([{ name: 'Google US English', lang: 'en-US' }]);
    const onEnd = vi.fn();

    speakText('Hello interrupt', { onEnd });

    expect(mockSpeak).toHaveBeenCalledTimes(1);
    const utterance = mockSpeak.mock.calls[0][0];

    // Simulate cancel/interrupt error event
    if (utterance.onerror) {
      utterance.onerror({ error: 'canceled' });
    }

    expect(onEnd).not.toHaveBeenCalled();
  });

  it('invokes onEnd on normal successful completion', () => {
    mockGetVoices.mockReturnValue([{ name: 'Google US English', lang: 'en-US' }]);
    const onEnd = vi.fn();

    speakText('Hello finish', { onEnd });

    expect(mockSpeak).toHaveBeenCalledTimes(1);
    const utterance = mockSpeak.mock.calls[0][0];

    // Simulate normal onend
    if (utterance.onend) {
      utterance.onend();
    }

    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  it('calls onError when utterance encounters non-cancelled error', () => {
    mockGetVoices.mockReturnValue([{ name: 'Google US English', lang: 'en-US' }]);
    const onEnd = vi.fn();
    const onError = vi.fn();

    speakText('Hello error', { onEnd, onError });

    expect(mockSpeak).toHaveBeenCalledTimes(1);
    const utterance = mockSpeak.mock.calls[0][0];

    // Simulate error event
    if (utterance.onerror) {
      utterance.onerror({ error: 'audio-busy' });
    }

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onEnd).not.toHaveBeenCalled();
  });

  it('reports isSpeaking status correctly', () => {
    expect(isSpeaking()).toBe(false);
  });
});
