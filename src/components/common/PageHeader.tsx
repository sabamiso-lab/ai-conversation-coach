import React from 'react';

export interface PageHeaderProps {
  badgeIcon?: React.ReactNode;
  badgeText?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function PageHeader({
  badgeIcon,
  badgeText,
  title,
  description,
  children,
  className = '',
  style = {}
}: PageHeaderProps) {
  return (
    <div
      className={`page-header-banner ${className}`.trim()}
      style={{
        textAlign: 'center',
        marginBottom: '24px',
        padding: '0 8px',
        ...style
      }}
    >
      {(badgeIcon || badgeText) && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#EEF2FF',
            color: '#4F46E5',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '0.82rem',
            fontWeight: 700,
            marginBottom: '10px'
          }}
        >
          {badgeIcon}
          {badgeText && <span>{badgeText}</span>}
        </div>
      )}

      {title && (
        <h1
          style={{
            fontSize: 'clamp(1.3rem, 4vw, 2rem)',
            fontWeight: 800,
            color: '#0F172A',
            letterSpacing: '-0.02em',
            lineHeight: 1.3
          }}
        >
          {title}
        </h1>
      )}

      {description && (
        <p
          style={{
            color: '#64748B',
            fontSize: '0.92rem',
            maxWidth: '640px',
            margin: '8px auto 0 auto',
            lineHeight: 1.5
          }}
        >
          {description}
        </p>
      )}

      {children}
    </div>
  );
}
