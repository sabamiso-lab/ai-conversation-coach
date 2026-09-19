import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useShadowingAudio } from '../useShadowingAudio';
import * as speechService from '../../../services/speech';

describe('useShadowingAudio', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with default playback speed and paused state', () => {
    const { result } = renderHook(() => useShadowingAudio({ defaultSpeed: 0.85 }));

    expect(result.current.playbackSpeed).toBe(0.85);
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.isLooping).toBe(false);
  });

  it('updates playback speed', () => {
    const { result } = renderHook(() => useShadowingAudio());

    act(() => {
      result.current.setPlaybackSpeed(1.25);
    });

    expect(result.current.playbackSpeed).toBe(1.25);
  });

  it('toggles loop state', () => {
    const { result } = renderHook(() => useShadowingAudio());

    act(() => {
      result.current.setIsLooping(true);
    });

    expect(result.current.isLooping).toBe(true);
  });

  it('plays and stops audio via speakText and stopSpeaking', () => {
    const speakSpy = vi.spyOn(speechService, 'speakText').mockImplementation(() => {});
    const stopSpy = vi.spyOn(speechService, 'stopSpeaking').mockImplementation(() => {});

    const { result } = renderHook(() => useShadowingAudio());

    act(() => {
      result.current.playAudio('Hello shadowing');
    });

    expect(result.current.isPlaying).toBe(true);
    expect(speakSpy).toHaveBeenCalledWith('Hello shadowing', expect.objectContaining({
      lang: 'en-US',
      rate: 0.85
    }));

    act(() => {
      result.current.stopAudio();
    });

    expect(result.current.isPlaying).toBe(false);
    expect(stopSpy).toHaveBeenCalled();
  });
});
