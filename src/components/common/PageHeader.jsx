import React from 'react';

/**
 * ページ上部のタイトルバナー共通コンポーネント
 * 
 * @param {Object} props
 * @param {React.ReactNode} [props.badgeIcon] - ピル型バッジのアイコン
 * @param {string} [props.badgeText] - ピル型バッジのテキスト (例: 'Conversation Studio')
 * @param {React.ReactNode} props.title - ページメイン見出し
 * @param {React.ReactNode} [props.description] - ページ説明文
 * @param {React.ReactNode} [props.children] - 追加コンテンツ
 * @param {string} [props.className=''] - 追加クラス名
 * @param {React.CSSProperties} [props.style] - 追加スタイル
 */
export default function PageHeader({
  badgeIcon,
  badgeText,
  title,
  description,
  children,
  className = '',
  style = {}
}) {
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
