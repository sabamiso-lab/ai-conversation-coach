import React from 'react';
import { Play, Square, Repeat, Gauge } from 'lucide-react';

const SPEED_OPTIONS = [0.7, 0.85, 1.0, 1.2];

export interface ShadowingAudioControlsProps {
  isPlaying: boolean;
  isLooping: boolean;
  playbackSpeed: number;
  onPlayToggle: () => void;
  onLoopToggle: () => void;
  onSpeedChange: (speed: number) => void;
  className?: string;
}

/**
 * シャドーイングお手本音声の再生・リピート・速度変更コントロールバー
 */
export default function ShadowingAudioControls({
  isPlaying,
  isLooping,
  playbackSpeed,
  onPlayToggle,
  onLoopToggle,
  onSpeedChange,
  className = 'player-controls-wrap'
}: ShadowingAudioControlsProps) {
  return (
    <div className={`shadowing-controls-bar ${className}`.trim()}>
      {/* Play/Stop Button & Repeat */}
      <div className="shadowing-play-group">
        <button
          className={`btn ${isPlaying ? 'btn-accent' : 'btn-primary'} shadowing-play-btn`}
          onClick={onPlayToggle}
        >
          {isPlaying ? (
            <>
              <Square size={16} /> 音声停止
            </>
          ) : (
            <>
              <Play size={16} /> お手本再生
            </>
          )}
        </button>

        <button
          className={`btn ${isLooping ? 'btn-secondary' : 'btn-ghost'} shadowing-repeat-btn ${isLooping ? 'is-looping' : ''}`}
          onClick={onLoopToggle}
          title="リピート再生モード"
        >
          <Repeat size={15} /> リピート {isLooping ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Speed Controls */}
      <div className="shadowing-speed-group">
        <span className="shadowing-speed-label">
          <Gauge size={14} /> 速度:
        </span>
        {SPEED_OPTIONS.map(speed => (
          <button
            key={speed}
            onClick={() => onSpeedChange(speed)}
            className={`shadowing-speed-btn ${playbackSpeed === speed ? 'is-active' : ''}`}
          >
            {speed === 1.0 ? '1.0x' : `${speed}x`}
          </button>
        ))}
      </div>
    </div>
  );
}
