import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';

const ALERT_CONFIGS = {
  error: {
    bg: '#FFE4E6',
    border: '#FECDD3',
    color: '#E11D48',
    Icon: AlertCircle
  },
  warning: {
    bg: '#FEF3C7',
    border: '#FDE68A',
    color: '#B45309',
    Icon: AlertTriangle
  },
  info: {
    bg: '#E0F2FE',
    border: '#BAE6FD',
    color: '#0369A1',
    Icon: Info
  },
  success: {
    bg: '#ECFDF5',
    border: '#A7F3D0',
    color: '#047857',
    Icon: CheckCircle
  }
};

/**
 * 汎用インラインアラートコンポーネント
 * 
 * @param {Object} props
 * @param {'error' | 'warning' | 'info' | 'success'} [props.variant='error'] - アラート種類
 * @param {React.ReactNode} [props.title] - タイトル
 * @param {React.ReactNode} props.children - アラート本文
 * @param {React.ReactNode} [props.icon] - カスタムアイコン
 * @param {string} [props.className=''] - 追加クラス名
 * @param {React.CSSProperties} [props.style] - 追加スタイル
 */
export default function Alert({
  variant = 'error',
  title,
  children,
  icon,
  className = '',
  style = {}
}) {
  const config = ALERT_CONFIGS[variant] || ALERT_CONFIGS.error;
  const IconComponent = config.Icon;

  return (
    <div
      role="alert"
      className={`alert-banner ${className}`.trim()}
      style={{
        background: config.bg,
        border: `1px solid ${config.border}`,
        color: config.color,
        padding: '14px 16px',
        borderRadius: '12px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: title ? 'flex-start' : 'center',
        gap: '12px',
        fontSize: '0.9rem',
        ...style
      }}
    >
      {icon ? (
        <span style={{ flexShrink: 0, marginTop: title ? '2px' : '0' }}>{icon}</span>
      ) : (
        <IconComponent size={20} style={{ flexShrink: 0, marginTop: title ? '2px' : '0' }} />
      )}
      <div style={{ flex: 1 }}>
        {title && (
          <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: children ? '4px' : '0' }}>
            {title}
          </div>
        )}
        {children && (
          <div style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
