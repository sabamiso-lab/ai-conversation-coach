import React from 'react';
import { Mic, MicOff } from 'lucide-react';

export interface MicButtonProps {
  isRecording: boolean;
  onClick: () => void;
  title?: string;
  iconSize?: number;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function MicButton({
  isRecording,
  onClick,
  title,
  iconSize = 24,
  disabled = false,
  ariaLabel,
  className = '',
  style = {}
}: MicButtonProps) {
  const defaultTitle = isRecording ? '録音停止' : 'マイクで英語を話す';
  const resolvedTitle = title || defaultTitle;
  const resolvedAriaLabel = ariaLabel || resolvedTitle;

  return (
    <button
      type="button"
      className={`mic-btn ${isRecording ? 'recording' : ''} ${className}`.trim()}
      onClick={onClick}
      disabled={disabled}
      title={resolvedTitle}
      aria-label={resolvedAriaLabel}
      aria-pressed={isRecording}
      style={style}
    >
      {isRecording ? <MicOff size={iconSize} /> : <Mic size={iconSize} />}
    </button>
  );
}
