import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

/**
 * 統一ローディング状態表示コンポーネント
 * 
 * @param {Object} props
 * @param {React.ReactNode} [props.message] - メインメッセージまたはタイトル
 * @param {React.ReactNode} [props.subMessage] - 補足説明メッセージ
 * @param {'loader' | 'sparkles' | React.ReactNode} [props.icon='loader'] - スピナーアイコン
 * @param {number} [props.iconSize=32] - アイコンのサイズ (px)
 * @param {string} [props.iconColor='#4F46E5'] - アイコンの色
 * @param {string} [props.padding='60px 20px'] - 内側余白
 * @param {string} [props.className=''] - 追加クラス名
 * @param {React.CSSProperties} [props.style] - 追加スタイル
 */
export default function LoadingState({
  message,
  subMessage,
  icon = 'loader',
  iconSize = 32,
  iconColor = '#4F46E5',
  padding = '60px 20px',
  className = '',
  style = {}
}) {
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
