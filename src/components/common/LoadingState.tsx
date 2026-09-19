import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

export interface LoadingStateProps {
  message?: React.ReactNode;
  subMessage?: React.ReactNode;
  icon?: 'loader' | 'sparkles' | React.ReactNode;
  iconSize?: number;
  iconColor?: string;
  padding?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function LoadingState({
  message,
  subMessage,
  icon = 'loader',
  iconSize = 32,
  iconColor = '#4F46E5',
  padding = '60px 20px',
  className = '',
  style = {}
}: LoadingStateProps) {
  const renderIcon = () => {
    if (React.isValidElement(icon)) {
      return icon;
    }
    if (icon === 'sparkles') {
      return (
        <Sparkles
          className="animate-spin"
          size={iconSize}
          color={iconColor}
          style={{ margin: `0 auto ${subMessage ? '16px' : '12px'} auto`, display: 'block' }}
        />
      );
    }
    return (
      <Loader2
        className="animate-spin"
        size={iconSize}
        color={iconColor}
        style={{ margin: `0 auto ${subMessage ? '16px' : '12px'} auto`, display: 'block' }}
      />
    );
  };

  return (
    <div
      className={`loading-state-container ${className}`.trim()}
      style={{
        padding,
        textAlign: 'center',
        color: '#64748B',
        ...style
      }}
    >
      {renderIcon()}
      {message && (
        subMessage ? (
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>
            {message}
          </h3>
        ) : (
          <p style={{ fontWeight: 600 }}>{message}</p>
        )
      )}
      {subMessage && (
        <p style={{ fontSize: '0.88rem', marginTop: '6px' }}>
          {subMessage}
        </p>
      )}
    </div>
  );
}
