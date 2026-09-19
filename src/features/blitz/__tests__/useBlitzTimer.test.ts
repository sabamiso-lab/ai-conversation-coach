import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBlitzTimer } from '../useBlitzTimer';

describe('useBlitzTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes with given timerSeconds and 100% progress', () => {
    const { result } = renderHook(() => useBlitzTimer({ timerSeconds: 5 }));
    expect(result.current.timeLeft).toBe(5);
    expect(result.current.progressPercent).toBe(100);
  });

  it('counts down over time and invokes onTimeUp at zero', () => {
    const onTimeUp = vi.fn();
    const { result } = renderHook(() => useBlitzTimer({ timerSeconds: 1, onTimeUp }));

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current.timeLeft).toBeLessThanOrEqual(0.6);
    expect(onTimeUp).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(result.current.timeLeft).toBe(0);
    expect(onTimeUp).toHaveBeenCalledTimes(1);
  });

  it('stops countdown when paused', () => {
    const onTimeUp = vi.fn();
    const { result } = renderHook(() => useBlitzTimer({ timerSeconds: 5, isPaused: true, onTimeUp }));

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.timeLeft).toBe(5);
    expect(onTimeUp).not.toHaveBeenCalled();
  });

  it('resets timer properly with resetTimer', () => {
    const { result } = renderHook(() => useBlitzTimer({ timerSeconds: 5 }));

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.timeLeft).toBeLessThan(5);

    act(() => {
      result.current.resetTimer(3);
    });
    expect(result.current.timeLeft).toBe(3);
  });
});
