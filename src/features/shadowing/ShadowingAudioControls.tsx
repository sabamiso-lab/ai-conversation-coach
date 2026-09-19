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
    <div 
      className={className}
      style={{
        background: '#F8FAFC',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '20px'
      }}
    >
      {/* Play/Stop Button & Repeat */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <button
          className={`btn ${isPlaying ? 'btn-accent' : 'btn-primary'}`}
          onClick={onPlayToggle}
          style={{ padding: '8px 16px', borderRadius: '9999px', fontSize: '0.9rem' }}
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
          className={`btn ${isLooping ? 'btn-secondary' : 'btn-ghost'}`}
          onClick={onLoopToggle}
          style={{
            color: isLooping ? '#4F46E5' : '#64748B',
            borderColor: isLooping ? '#818CF8' : 'transparent',
            fontWeight: 600,
            padding: '8px 12px',
            fontSize: '0.84rem'
          }}
          title="リピート再生モード"
        >
          <Repeat size={15} /> リピート {isLooping ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Speed Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Gauge size={14} /> 速度:
        </span>
        {SPEED_OPTIONS.map(speed => (
          <button
            key={speed}
            onClick={() => onSpeedChange(speed)}
            style={{
              background: playbackSpeed === speed ? '#4F46E5' : '#FFFFFF',
              color: playbackSpeed === speed ? '#FFFFFF' : '#475569',
              border: '1px solid',
              borderColor: playbackSpeed === speed ? '#4F46E5' : '#CBD5E1',
              borderRadius: '6px',
              padding: '3px 8px',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {speed === 1.0 ? '1.0x' : `${speed}x`}
          </button>
        ))}
      </div>
    </div>
  );
}
