import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSpeechRecognition } from '../useSpeechRecognition';
import * as speechService from '../../services/speech';

describe('useSpeechRecognition hook', () => {
  let mockRecognizerInstance: {
    start: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
    abort: ReturnType<typeof vi.fn>;
    options: speechService.SpeechRecognizerOptions;
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(speechService, 'isSpeechRecognitionSupported').mockReturnValue(true);

    vi.spyOn(speechService, 'SpeechRecognizer').mockImplementation((options: speechService.SpeechRecognizerOptions) => {
      mockRecognizerInstance = {
        start: vi.fn(),
        stop: vi.fn(),
        abort: vi.fn(),
        options
      };
      return mockRecognizerInstance as unknown as speechService.SpeechRecognizer;
    });
  });

  it('initializes with default states', () => {
    const { result } = renderHook(() => useSpeechRecognition());

    expect(result.current.isSupported).toBe(true);
    expect(result.current.isRecording).toBe(false);
    expect(result.current.userTranscript).toBe('');
    expect(result.current.interimTranscript).toBe('');
    expect(result.current.fullTranscript).toBe('');
    expect(result.current.error).toBe('');
  });

  it('handles speech recognition result with both final and interim text without duplication', () => {
    const handleResult = vi.fn();
    const handleFinalResult = vi.fn();
    const handleInterimResult = vi.fn();

    const { result } = renderHook(() =>
      useSpeechRecognition({
        onResult: handleResult,
        onFinalResult: handleFinalResult,
        onInterimResult: handleInterimResult
      })
    );

    // Event 1: Interim text
    act(() => {
      mockRecognizerInstance.options.onResult?.({
        final: '',
        interim: 'Hello'
      });
    });

    expect(result.current.userTranscript).toBe('');
    expect(result.current.interimTranscript).toBe('Hello');
    expect(result.current.fullTranscript).toBe('Hello');
    expect(handleInterimResult).toHaveBeenCalledWith('Hello');
    expect(handleResult).toHaveBeenCalledWith({ final: '', interim: 'Hello', full: 'Hello' });

    // Event 2: Final text confirmed
    act(() => {
      mockRecognizerInstance.options.onResult?.({
        final: 'Hello world.',
        interim: ''
      });
    });

    expect(result.current.userTranscript).toBe('Hello world.');
    expect(result.current.interimTranscript).toBe('');
    expect(result.current.fullTranscript).toBe('Hello world.');
    expect(handleFinalResult).toHaveBeenCalledWith('Hello world.');

    // Event 3: Next sentence interim alongside existing final
    act(() => {
      mockRecognizerInstance.options.onResult?.({
        final: 'Hello world.',
        interim: 'How are you'
      });
    });

    // Should NOT duplicate 'Hello world.' and should correctly retain both final and interim
    expect(result.current.userTranscript).toBe('Hello world.');
    expect(result.current.interimTranscript).toBe('How are you');
    expect(result.current.fullTranscript).toBe('Hello world. How are you');
    expect(handleResult).toHaveBeenLastCalledWith({
      final: 'Hello world.',
      interim: 'How are you',
      full: 'Hello world. How are you'
    });
  });

  it('resets transcripts when startRecording is called', () => {
    const { result } = renderHook(() => useSpeechRecognition());

    act(() => {
      mockRecognizerInstance.options.onResult?.({
        final: 'Existing text',
        interim: ''
      });
    });

    expect(result.current.userTranscript).toBe('Existing text');

    // Start recording again
    act(() => {
      result.current.startRecording();
    });

    expect(result.current.userTranscript).toBe('');
    expect(result.current.interimTranscript).toBe('');
    expect(result.current.fullTranscript).toBe('');
    expect(mockRecognizerInstance.start).toHaveBeenCalled();
  });

  it('handles unsupported browser gracefully', () => {
    vi.spyOn(speechService, 'isSpeechRecognitionSupported').mockReturnValue(false);

    const handleError = vi.fn();
    const { result } = renderHook(() => useSpeechRecognition({ onError: handleError }));

    act(() => {
      result.current.startRecording();
    });

    expect(result.current.error).toContain('お使いのブラウザは音声認識に対応していません');
    expect(handleError).toHaveBeenCalled();
  });
});
