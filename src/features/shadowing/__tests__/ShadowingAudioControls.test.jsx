import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ShadowingAudioControls from '../ShadowingAudioControls';

describe('ShadowingAudioControls', () => {
  it('renders play and loop controls, and toggles speed', () => {
    const onPlayToggle = vi.fn();
    const onLoopToggle = vi.fn();
    const onSpeedChange = vi.fn();

    render(
      <ShadowingAudioControls
        isPlaying={false}
        isLooping={false}
        playbackSpeed={1.0}
        onPlayToggle={onPlayToggle}
        onLoopToggle={onLoopToggle}
        onSpeedChange={onSpeedChange}
      />
    );

    const playBtn = screen.getByRole('button', { name: /お手本再生/i });
    expect(playBtn).toBeInTheDocument();
    fireEvent.click(playBtn);
    expect(onPlayToggle).toHaveBeenCalledTimes(1);

    const loopBtn = screen.getByRole('button', { name: /リピート OFF/i });
    expect(loopBtn).toBeInTheDocument();
    fireEvent.click(loopBtn);
    expect(onLoopToggle).toHaveBeenCalledTimes(1);

    const speed085Btn = screen.getByRole('button', { name: '0.85x' });
    fireEvent.click(speed085Btn);
    expect(onSpeedChange).toHaveBeenCalledWith(0.85);
  });

  it('renders playing state correctly', () => {
    render(
      <ShadowingAudioControls
        isPlaying={true}
        isLooping={true}
        playbackSpeed={0.85}
        onPlayToggle={() => {}}
        onLoopToggle={() => {}}
        onSpeedChange={() => {}}
      />
    );

    expect(screen.getByRole('button', { name: /音声停止/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /リピート ON/i })).toBeInTheDocument();
  });
});
