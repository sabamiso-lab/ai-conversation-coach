import React from 'react';
import { Volume2 } from 'lucide-react';
import { speakText } from '../../services/speech';

export interface AudioPlayButtonProps {
  text: string;
  rate?: number;
  lang?: string;
  variant?: 'button' | 'icon';
  label?: string;
  iconSize?: number;
  title?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}

export default function AudioPlayButton({
  text,
  rate = 0.95,
  lang = 'en-US',
  variant = 'button',
  label = '聴く',
  iconSize = 16,
  title = '音声を聞く',
  className = '',
  style = {},
  onClick,
  disabled = false
}: AudioPlayButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!text || disabled) return;
    speakText(text, { rate, lang });
    if (onClick) {
      onClick(e);
    }
  };

  if (variant === 'icon') {
    return (
      <button
        type="button"
        className={className}
        style={style}
        onClick={handleClick}
        title={title}
        disabled={disabled}
        aria-label={title}
      >
        <Volume2 size={iconSize} />
      </button>
    );
  }

  return (
    <button
      type="button"
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...style
      }}
      onClick={handleClick}
      title={title}
      disabled={disabled}
      aria-label={title}
    >
      <Volume2 size={iconSize} />
      {label && <span>{label}</span>}
    </button>
  );
}
