import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { speakText, stopSpeaking, SpeechRecognizer, isSpeechRecognitionSupported, findPreferredVoice } from '../speech';

describe('speech.js TTS module', () => {
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
        onvoiceschanged: null
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

    // Advance 100ms to trigger fallback timeout
    vi.advanceTimersByTime(100);

    expect(mockSpeak).toHaveBeenCalledTimes(1);

    // Now trigger onvoiceschanged late
    if (window.speechSynthesis.onvoiceschanged) {
      (window.speechSynthesis.onvoiceschanged as unknown as () => void)();
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

  it('selects high quality voices first, and falls back to standard Windows voices', () => {
    const mockVoices = [
      { name: 'Microsoft Haruka Desktop - Japanese', lang: 'ja-JP' },
      { name: 'Microsoft David Desktop - English (United States)', lang: 'en-US' },
      { name: 'Google US English', lang: 'en-US' }
    ] as unknown as SpeechSynthesisVoice[];

    // Priority 1: Google / Natural
    const preferred1 = findPreferredVoice(mockVoices, 'en-US');
    expect(preferred1?.name).toBe('Google US English');

    // Without Google voice, standard Windows voice should be selected, NOT Japanese Haruka
    const mockWindowsOnly = [
      { name: 'Microsoft Haruka Desktop - Japanese', lang: 'ja-JP' },
      { name: 'Microsoft David Desktop - English (United States)', lang: 'en-US' }
    ] as unknown as SpeechSynthesisVoice[];

    const preferred2 = findPreferredVoice(mockWindowsOnly, 'en-US');
    expect(preferred2?.name).toBe('Microsoft David Desktop - English (United States)');
  });

  it('does not call onEnd when utterance is cancelled or aborted', () => {
    mockGetVoices.mockReturnValue([{ name: 'Google US English', lang: 'en-US' }]);
    const onEnd = vi.fn();

    speakText('Hello interrupt', { onEnd });

    expect(mockSpeak).toHaveBeenCalledTimes(1);
    const utterance = mockSpeak.mock.calls[0][0];

    // Simulate browser error event on cancellation
    utterance.onerror({ error: 'canceled' });

    expect(onEnd).not.toHaveBeenCalled();
  });

  it('calls onEnd when utterance finishes normally', () => {
    mockGetVoices.mockReturnValue([{ name: 'Google US English', lang: 'en-US' }]);
    const onEnd = vi.fn();

    speakText('Hello finish', { onEnd });

    expect(mockSpeak).toHaveBeenCalledTimes(1);
    const utterance = mockSpeak.mock.calls[0][0];

    // Simulate normal finish
    utterance.onend();

    expect(onEnd).toHaveBeenCalledTimes(1);
  });
});

describe('SpeechRecognizer module', () => {
  interface MockRecognitionInstance {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: Mock;
    stop: Mock;
    abort: Mock;
    onstart: (() => void) | null;
    onresult: ((event: unknown) => void) | null;
    onerror: ((event: unknown) => void) | null;
    onend: (() => void) | null;
  }

  let mockRecognitionInstance: MockRecognitionInstance;
  let originalSpeechRecognition: typeof window.SpeechRecognition;

  beforeEach(() => {
    mockRecognitionInstance = {
      continuous: false,
      interimResults: false,
      lang: '',
      start: vi.fn(),
      stop: vi.fn(),
      abort: vi.fn(),
      onstart: null,
      onresult: null,
      onerror: null,
      onend: null
    };

    originalSpeechRecognition = window.SpeechRecognition;
    window.SpeechRecognition = vi.fn().mockImplementation(() => mockRecognitionInstance) as unknown as typeof window.SpeechRecognition;
  });

  afterEach(() => {
    window.SpeechRecognition = originalSpeechRecognition;
  });

  it('detects speech recognition support correctly', () => {
    expect(isSpeechRecognitionSupported()).toBe(true);

    delete (window as { SpeechRecognition?: unknown }).SpeechRecognition;
    delete (window as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
    expect(isSpeechRecognitionSupported()).toBe(false);
  });

  it('configures recognition with custom continuous and lang options', () => {
    const recognizer = new SpeechRecognizer({
      lang: 'en-GB',
      continuous: true
    });

    expect(recognizer.supported).toBe(true);
    expect(mockRecognitionInstance.continuous).toBe(true);
    expect(mockRecognitionInstance.lang).toBe('en-GB');
    expect(mockRecognitionInstance.interimResults).toBe(true);
  });

  it('aggregates all results from index 0 across multiple result events', () => {
    const onResult = vi.fn();
    new SpeechRecognizer({ onResult });

    // Event 1: First final sentence
    mockRecognitionInstance.onresult!({
      resultIndex: 0,
      results: [
        Object.assign([{ transcript: 'Hello world. ' }], { isFinal: true })
      ]
    });

    expect(onResult).toHaveBeenCalledWith({
      final: 'Hello world.',
      interim: ''
    });

    // Event 2: Second sentence in progress (interim)
    mockRecognitionInstance.onresult!({
      resultIndex: 1,
      results: [
        Object.assign([{ transcript: 'Hello world. ' }], { isFinal: true }),
        Object.assign([{ transcript: 'How are you' }], { isFinal: false })
      ]
    });

    // Both final (sentence 1) and interim (sentence 2) should be retained!
    expect(onResult).toHaveBeenLastCalledWith({
      final: 'Hello world.',
      interim: 'How are you'
    });

    // Event 3: Second sentence finalized
    mockRecognitionInstance.onresult!({
      resultIndex: 1,
      results: [
        Object.assign([{ transcript: 'Hello world. ' }], { isFinal: true }),
        Object.assign([{ transcript: 'How are you?' }], { isFinal: true })
      ]
    });

    expect(onResult).toHaveBeenLastCalledWith({
      final: 'Hello world. How are you?',
      interim: ''
    });
  });

  it('clears recognized transcript results from startIndex when clear() is called', () => {
    const onResult = vi.fn();
    const recognizer = new SpeechRecognizer({ onResult });

    mockRecognitionInstance.onresult!({
      resultIndex: 0,
      results: [
        Object.assign([{ transcript: 'First attempt.' }], { isFinal: true })
      ]
    });

    expect(onResult).toHaveBeenLastCalledWith({
      final: 'First attempt.',
      interim: ''
    });

    // Clear past results
    recognizer.clear();

    // Event after clear: previous item still exists in event.results, but a new item is added
    mockRecognitionInstance.onresult!({
      resultIndex: 1,
      results: [
        Object.assign([{ transcript: 'First attempt.' }], { isFinal: true }),
        Object.assign([{ transcript: 'Second attempt.' }], { isFinal: true })
      ]
    });

    // Only 'Second attempt.' should be returned!
    expect(onResult).toHaveBeenLastCalledWith({
      final: 'Second attempt.',
      interim: ''
    });
  });

  it('handles onstart and onend callbacks and manages isListening state', () => {
    const onStart = vi.fn();
    const onEnd = vi.fn();
    const recognizer = new SpeechRecognizer({ onStart, onEnd });

    recognizer.start();
    expect(mockRecognitionInstance.start).toHaveBeenCalled();

    // Trigger onstart
    mockRecognitionInstance.onstart!();
    expect(recognizer.isListening).toBe(true);
    expect(onStart).toHaveBeenCalled();

    // Trigger onend
    mockRecognitionInstance.onend!();
    expect(recognizer.isListening).toBe(false);
    expect(onEnd).toHaveBeenCalled();
  });

  it('ignores user abort error and does not report error for aborted', () => {
    const onError = vi.fn();
    const recognizer = new SpeechRecognizer({ onError });

    recognizer.isListening = true;
    mockRecognitionInstance.onerror!({ error: 'aborted' });

    expect(recognizer.isListening).toBe(false);
    expect(onError).not.toHaveBeenCalled();
  });

  it('maps standard speech errors to user-friendly messages', () => {
    const onError = vi.fn();
    new SpeechRecognizer({ onError });

    mockRecognitionInstance.onerror!({ error: 'not-allowed' });
    expect(onError).toHaveBeenCalledWith(
      expect.stringContaining('マイクの使用が拒否されています'),
      'not-allowed'
    );
  });

  it('aborts recognition and resets listening state', () => {
    const recognizer = new SpeechRecognizer({});
    recognizer.isListening = true;

    recognizer.abort();
    expect(mockRecognitionInstance.abort).toHaveBeenCalled();
    expect(recognizer.isListening).toBe(false);
  });

  it('inserts space between consecutive recognition chunks without leading space', () => {
    const onResult = vi.fn();
    new SpeechRecognizer({ onResult });

    mockRecognitionInstance.onresult!({
      results: [
        Object.assign([{ transcript: 'I have' }], { isFinal: true }),
        Object.assign([{ transcript: 'a pen' }], { isFinal: true })
      ]
    });

    expect(onResult).toHaveBeenCalledWith({
      final: 'I have a pen',
      interim: ''
    });
  });

  it('safely re-initializes and starts recognition across multiple sessions', () => {
    const recognizer = new SpeechRecognizer({});
    recognizer.start();
    expect(mockRecognitionInstance.start).toHaveBeenCalledTimes(1);

    // Stop and re-start
    recognizer.stop();
    expect(recognizer.isListening).toBe(false);

    recognizer.start();
    expect(mockRecognitionInstance.start).toHaveBeenCalledTimes(2);
    expect(recognizer.isListening).toBe(true);
  });
});
