import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAudioPlayer } from '../useAudioPlayer';
import * as speechService from '../../services/speech';

describe('useAudioPlayer', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with default options', () => {
    const { result } = renderHook(() => useAudioPlayer({ defaultSpeed: 1.0 }));

    expect(result.current.playbackSpeed).toBe(1.0);
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.isLooping).toBe(false);
  });

  it('updates playback speed and looping', () => {
    const { result } = renderHook(() => useAudioPlayer());

    act(() => {
      result.current.setPlaybackSpeed(1.25);
      result.current.setIsLooping(true);
    });

    expect(result.current.playbackSpeed).toBe(1.25);
    expect(result.current.isLooping).toBe(true);
  });

  it('plays and stops audio via speechService', () => {
    const speakSpy = vi.spyOn(speechService, 'speakText').mockImplementation(() => {});
    const stopSpy = vi.spyOn(speechService, 'stopSpeaking').mockImplementation(() => {});

    const { result } = renderHook(() => useAudioPlayer());

    act(() => {
      result.current.playAudio('Test speech text');
    });

    expect(result.current.isPlaying).toBe(true);
    expect(speakSpy).toHaveBeenCalledWith('Test speech text', expect.objectContaining({
      rate: 0.85,
      lang: 'en-US'
    }));

    act(() => {
      result.current.stopAudio();
    });

    expect(result.current.isPlaying).toBe(false);
    expect(stopSpy).toHaveBeenCalled();
  });

  it('resets isPlaying to false when speakText encounters an error', () => {
    let capturedOnError: (() => void) | undefined;
    vi.spyOn(speechService, 'speakText').mockImplementation((_text, options) => {
      capturedOnError = options?.onError as (() => void) | undefined;
    });

    const { result } = renderHook(() => useAudioPlayer());

    act(() => {
      result.current.playAudio('Error test speech');
    });

    expect(result.current.isPlaying).toBe(true);
    expect(capturedOnError).toBeDefined();

    // Trigger synthesis error
    act(() => {
      capturedOnError?.();
    });

    expect(result.current.isPlaying).toBe(false);
  });
});
