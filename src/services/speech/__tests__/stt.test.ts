import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { SpeechRecognizer, isSpeechRecognitionSupported } from '../index';
import type { SpeechRecognitionEvent, SpeechRecognitionErrorEvent } from '../types';

describe('STT Module (SpeechRecognizer)', () => {
  let mockStart: Mock;
  let mockStop: Mock;
  let mockAbort: Mock;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let latestInstance: any = null;
  let originalSpeechRecognition: unknown;

  beforeEach(() => {
    mockStart = vi.fn();
    mockStop = vi.fn();
    mockAbort = vi.fn();
    latestInstance = null;

    originalSpeechRecognition = window.SpeechRecognition;

    class MockSpeechRecognition {
      continuous = false;
      interimResults = false;
      lang = '';
      onstart: (() => void) | null = null;
      onresult: ((ev: SpeechRecognitionEvent) => void) | null = null;
      onerror: ((ev: SpeechRecognitionErrorEvent) => void) | null = null;
      onend: (() => void) | null = null;
      start = mockStart;
      stop = mockStop;
      abort = mockAbort;

      constructor() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        latestInstance = this;
      }
    }

    window.SpeechRecognition = MockSpeechRecognition as unknown as typeof window.SpeechRecognition;
    delete (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
  });

  afterEach(() => {
    window.SpeechRecognition = originalSpeechRecognition as typeof window.SpeechRecognition;
  });

  it('reports speech recognition support correctly', () => {
    expect(isSpeechRecognitionSupported()).toBe(true);

    delete (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition;
    expect(isSpeechRecognitionSupported()).toBe(false);
  });

  it('instantiates correctly with options and calls start', () => {
    const recognizer = new SpeechRecognizer({ lang: 'en-US', continuous: true });
    expect(recognizer.supported).toBe(true);
    expect(recognizer.isListening).toBe(false);

    recognizer.start();
    expect(mockStart).toHaveBeenCalled();
    expect(recognizer.isListening).toBe(true);
  });

  it('handles results correctly with final and interim transcripts', () => {
    const onResult = vi.fn();
    const recognizer = new SpeechRecognizer({ onResult });
    recognizer.start();

    // Trigger onresult
    const mockEvent = {
      results: [
        Object.assign([{ transcript: 'Hello' }], { isFinal: true }),
        Object.assign([{ transcript: 'world' }], { isFinal: false })
      ]
    } as unknown as SpeechRecognitionEvent;

    if (latestInstance?.onresult) {
      latestInstance.onresult(mockEvent);
    }

    expect(onResult).toHaveBeenCalledWith({
      final: 'Hello',
      interim: 'world'
    });
  });

  it('adds spaces between multiple consecutive transcripts correctly', () => {
    const onResult = vi.fn();
    const recognizer = new SpeechRecognizer({ onResult });
    recognizer.start();

    const mockEvent = {
      results: [
        Object.assign([{ transcript: 'First' }], { isFinal: true }),
        Object.assign([{ transcript: 'Second' }], { isFinal: true }),
        Object.assign([{ transcript: 'interim1' }], { isFinal: false }),
        Object.assign([{ transcript: 'interim2' }], { isFinal: false })
      ]
    } as unknown as SpeechRecognitionEvent;

    if (latestInstance?.onresult) {
      latestInstance.onresult(mockEvent);
    }

    expect(onResult).toHaveBeenCalledWith({
      final: 'First Second',
      interim: 'interim1 interim2'
    });
  });

  it('deduplicates identical consecutive final results (Android Chrome quirk)', () => {
    const onResult = vi.fn();
    const recognizer = new SpeechRecognizer({ onResult });
    recognizer.start();

    // Android Chrome bug: duplicate identical final results
    const mockEvent = {
      results: [
        Object.assign([{ transcript: 'Hello' }], { isFinal: true }),
        Object.assign([{ transcript: 'Hello' }], { isFinal: true })
      ]
    } as unknown as SpeechRecognitionEvent;

    if (latestInstance?.onresult) {
      latestInstance.onresult(mockEvent);
    }

    expect(onResult).toHaveBeenCalledWith({
      final: 'Hello',
      interim: ''
    });
  });

  it('eliminates word overlap at chunk boundaries', () => {
    const onResult = vi.fn();
    const recognizer = new SpeechRecognizer({ onResult });
    recognizer.start();

    const mockEvent = {
      results: [
        Object.assign([{ transcript: 'I want to' }], { isFinal: true }),
        Object.assign([{ transcript: 'to go home' }], { isFinal: true })
      ]
    } as unknown as SpeechRecognitionEvent;

    if (latestInstance?.onresult) {
      latestInstance.onresult(mockEvent);
    }

    expect(onResult).toHaveBeenCalledWith({
      final: 'I want to go home',
      interim: ''
    });
  });

  it('fires onStart and onEnd callbacks properly', () => {
    const onStart = vi.fn();
    const onEnd = vi.fn();
    const recognizer = new SpeechRecognizer({ onStart, onEnd });
    recognizer.start();

    if (latestInstance?.onstart) {
      latestInstance.onstart();
    }
    expect(onStart).toHaveBeenCalled();
    expect(recognizer.isListening).toBe(true);

    if (latestInstance?.onend) {
      latestInstance.onend();
    }
    expect(onEnd).toHaveBeenCalled();
    expect(recognizer.isListening).toBe(false);
  });

  it('maps standard speech errors to user-friendly messages', () => {
    const onError = vi.fn();
    const recognizer = new SpeechRecognizer({ onError });
    recognizer.start();

    if (latestInstance?.onerror) {
      latestInstance.onerror({ error: 'not-allowed' } as SpeechRecognitionErrorEvent);
    }
    expect(onError).toHaveBeenCalledWith(
      expect.stringContaining('マイクの使用が拒否されています'),
      'not-allowed'
    );
    expect(recognizer.isListening).toBe(false);
  });

  it('ignores user-initiated abort error', () => {
    const onError = vi.fn();
    const recognizer = new SpeechRecognizer({ onError });
    recognizer.start();

    if (latestInstance?.onerror) {
      latestInstance.onerror({ error: 'aborted' } as SpeechRecognitionErrorEvent);
    }
    expect(onError).not.toHaveBeenCalled();
    expect(recognizer.isListening).toBe(false);
  });

  it('stops recognition when stop() is called', () => {
    const recognizer = new SpeechRecognizer({});
    recognizer.start();
    expect(recognizer.isListening).toBe(true);

    recognizer.stop();
    expect(mockStop).toHaveBeenCalled();
    expect(recognizer.isListening).toBe(false);
  });

  it('ignores results received after recognition has been stopped', () => {
    const onResult = vi.fn();
    const recognizer = new SpeechRecognizer({ onResult });
    recognizer.start();

    recognizer.stop();

    const mockEvent = {
      results: [Object.assign([{ transcript: 'Late packet' }], { isFinal: true })]
    } as unknown as SpeechRecognitionEvent;

    if (latestInstance?.onresult) {
      latestInstance.onresult(mockEvent);
    }

    expect(onResult).not.toHaveBeenCalled();
  });

  it('aborts recognition when abort() is called and removes event listeners', () => {
    const recognizer = new SpeechRecognizer({});
    recognizer.start();

    recognizer.abort();
    expect(mockAbort).toHaveBeenCalled();
    expect(recognizer.isListening).toBe(false);
    expect(latestInstance?.onstart).toBeNull();
    expect(latestInstance?.onresult).toBeNull();
    expect(latestInstance?.onerror).toBeNull();
    expect(latestInstance?.onend).toBeNull();
  });

  it('clears recognized transcript starting index via clear()', () => {
    const onResult = vi.fn();
    const recognizer = new SpeechRecognizer({ onResult });
    recognizer.start();

    const mockEvent1 = {
      results: [Object.assign([{ transcript: 'First batch' }], { isFinal: true })]
    } as unknown as SpeechRecognitionEvent;
    if (latestInstance?.onresult) {
      latestInstance.onresult(mockEvent1);
    }
    expect(onResult).toHaveBeenLastCalledWith({ final: 'First batch', interim: '' });

    // User clears speech
    recognizer.clear();

    // Subsequent event with first result plus new result
    const mockEvent2 = {
      results: [
        Object.assign([{ transcript: 'First batch' }], { isFinal: true }),
        Object.assign([{ transcript: 'Second batch' }], { isFinal: true })
      ]
    } as unknown as SpeechRecognitionEvent;
    if (latestInstance?.onresult) {
      latestInstance.onresult(mockEvent2);
    }

    // Should only yield Second batch
    expect(onResult).toHaveBeenLastCalledWith({ final: 'Second batch', interim: '' });
  });
});
