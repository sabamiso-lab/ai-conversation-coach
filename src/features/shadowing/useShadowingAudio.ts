import { useState, useRef, useEffect, useCallback } from 'react';
import { speakText, stopSpeaking } from '../../services/speech';

export interface UseShadowingAudioOptions {
  defaultSpeed?: number;
}

export function useShadowingAudio({ defaultSpeed = 0.85 }: UseShadowingAudioOptions = {}) {
  const [playbackSpeed, setPlaybackSpeed] = useState(defaultSpeed);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);

  const isLoopingRef = useRef(isLooping);
  const loopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playAudioRef = useRef<(targetText: string) => void>(() => {});

  useEffect(() => {
    isLoopingRef.current = isLooping;
    if (!isLooping && loopTimeoutRef.current) {
      clearTimeout(loopTimeoutRef.current);
      loopTimeoutRef.current = null;
    }
  }, [isLooping]);

  const clearLoopTimer = useCallback(() => {
    if (loopTimeoutRef.current) {
      clearTimeout(loopTimeoutRef.current);
      loopTimeoutRef.current = null;
    }
  }, []);

  const stopAudio = useCallback(() => {
    clearLoopTimer();
    stopSpeaking();
    setIsPlaying(false);
  }, [clearLoopTimer]);

  const playAudio = useCallback((textToPlay: string) => {
    clearLoopTimer();

    if (!textToPlay) return;

    setIsPlaying(true);
    speakText(textToPlay, {
      lang: 'en-US',
      rate: playbackSpeed,
      onEnd: () => {
        setIsPlaying(false);
        if (isLoopingRef.current) {
          clearLoopTimer();
          loopTimeoutRef.current = setTimeout(() => {
            if (isLoopingRef.current) {
              playAudioRef.current(textToPlay);
            }
          }, 500);
        }
      }
    });
  }, [playbackSpeed, clearLoopTimer]);

  const togglePlayAudio = useCallback((textToPlay: string) => {
    if (isPlaying) {
      stopAudio();
    } else {
      playAudio(textToPlay);
    }
  }, [isPlaying, stopAudio, playAudio]);

  useEffect(() => {
    playAudioRef.current = playAudio;
  }, [playAudio]);

  useEffect(() => {
    return () => {
      clearLoopTimer();
      stopSpeaking();
    };
  }, [clearLoopTimer]);

  return {
    playbackSpeed,
    setPlaybackSpeed,
    isPlaying,
    isLooping,
    setIsLooping,
    playAudio,
    stopAudio,
    togglePlayAudio,
    clearLoopTimer
  };
}
