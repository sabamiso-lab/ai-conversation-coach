import { useState, useEffect, useRef, useCallback } from 'react';

interface UseBlitzTimerOptions {
  timerSeconds: number;
  isPaused?: boolean;
  onTimeUp?: () => void;
}

export function useBlitzTimer({ timerSeconds, isPaused = false, onTimeUp }: UseBlitzTimerOptions) {
  const [timeLeft, setTimeLeft] = useState(timerSeconds);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onTimeUpRef = useRef(onTimeUp);

  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resetTimer = useCallback((newSeconds?: number) => {
    stopTimer();
    setTimeLeft(newSeconds !== undefined ? newSeconds : timerSeconds);
  }, [stopTimer, timerSeconds]);

  useEffect(() => {
    if (isPaused || timerSeconds <= 0) {
      stopTimer();
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          stopTimer();
          if (onTimeUpRef.current) {
            onTimeUpRef.current();
          }
          return 0;
        }
        return Math.max(0, +(prev - 0.1).toFixed(1));
      });
    }, 100);

    return () => {
      stopTimer();
    };
  }, [isPaused, timerSeconds, stopTimer]);

  const progressPercent = timerSeconds > 0
    ? Math.max(0, Math.min(100, (timeLeft / timerSeconds) * 100))
    : 100;

  return {
    timeLeft,
    progressPercent,
    stopTimer,
    resetTimer
  };
}
