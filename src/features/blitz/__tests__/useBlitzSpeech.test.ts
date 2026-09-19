import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBlitzSpeech } from '../useBlitzSpeech';
import * as speechService from '../../../services/speech';

describe('useBlitzSpeech', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with default speech states', () => {
    const { result } = renderHook(() => useBlitzSpeech());

    expect(result.current.isListening).toBe(false);
    expect(result.current.userTranscript).toBe('');
    expect(result.current.interimTranscript).toBe('');
    expect(result.current.fullUserText).toBe('');
    expect(result.current.speechError).toBe('');
  });

  it('updates userTranscript manually via setUserTranscript', () => {
    const { result } = renderHook(() => useBlitzSpeech());

    act(() => {
      result.current.setUserTranscript('Hello world');
    });

    expect(result.current.userTranscript).toBe('Hello world');
    expect(result.current.fullUserText).toBe('Hello world');
  });

  it('resets speech states on resetSpeech', () => {
    const { result } = renderHook(() => useBlitzSpeech());

    act(() => {
      result.current.setUserTranscript('Some words');
      result.current.setSpeechError('Some error');
    });

    expect(result.current.userTranscript).toBe('Some words');
    expect(result.current.speechError).toBe('Some error');

    act(() => {
      result.current.resetSpeech();
    });

    expect(result.current.userTranscript).toBe('');
    expect(result.current.interimTranscript).toBe('');
    expect(result.current.speechError).toBe('');
    expect(result.current.isListening).toBe(false);
  });

  it('handles speech recognition unsupported gracefully', () => {
    vi.spyOn(speechService, 'isSpeechRecognitionSupported').mockReturnValue(false);

    const { result } = renderHook(() => useBlitzSpeech());

    act(() => {
      result.current.startListening();
    });

    expect(result.current.speechError).toBe('お使いのブラウザは音声認識に対応していません。');
    expect(result.current.isListening).toBe(false);
  });
});
