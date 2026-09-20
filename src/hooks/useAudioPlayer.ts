import { useState, useRef, useEffect, useCallback } from 'react';
import { speakText, stopSpeaking } from '../services/speech';

export interface UseAudioPlayerOptions {
  defaultSpeed?: number;
  lang?: string;
  loopDelayMs?: number;
}

export function useAudioPlayer({
  defaultSpeed = 0.85,
  lang = 'en-US',
  loopDelayMs = 500
}: UseAudioPlayerOptions = {}) {
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
      lang,
      rate: playbackSpeed,
      onEnd: () => {
        setIsPlaying(false);
        if (isLoopingRef.current) {
          clearLoopTimer();
          loopTimeoutRef.current = setTimeout(() => {
            if (isLoopingRef.current) {
              playAudioRef.current(textToPlay);
            }
          }, loopDelayMs);
        }
      },
      onError: () => {
        setIsPlaying(false);
        clearLoopTimer();
      }
    });
  }, [playbackSpeed, lang, loopDelayMs, clearLoopTimer]);

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
