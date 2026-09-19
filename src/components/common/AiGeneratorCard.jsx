import React from 'react';
import { Sparkles, PlusCircle } from 'lucide-react';

/**
 * AI生成セクションのアコーディオン共通カード
 * 
 * @param {Object} props
 * @param {string} [props.badgeText='Gemini AI カスタム作成'] - バッジラベル
 * @param {boolean} [props.hasApiKey=true] - APIキーが設定されているか
 * @param {React.ReactNode} props.title - カードタイトル
 * @param {React.ReactNode} [props.description] - カード説明文
 * @param {boolean} props.isOpen - 開閉状態
 * @param {() => void} props.onToggle - 開閉トグルハンドラ
 * @param {React.ReactNode} props.children - 展開時のフォームコンテンツ
 * @param {string} [props.className=''] - 追加クラス名
 * @param {React.CSSProperties} [props.style] - 追加スタイル
 */
export default function AiGeneratorCard({
  badgeText = 'Gemini AI カスタム作成',
  hasApiKey = true,
  title,
  description,
  isOpen,
  onToggle,
  children,
  className = '',
  style = {}
}) {
  return (
    <div
      className={`ai-generator-card ${className}`.trim()}
      style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)',
        borderRadius: '16px',
        padding: '20px',
        color: '#FFFFFF',
        marginBottom: '28px',
        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.4)',
        position: 'relative',
        overflow: 'hidden',
        ...style
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(99, 102, 241, 0.25)',
              color: '#A5B4FC',
              padding: '4px 10px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: 700,
              marginBottom: '6px'
            }}
          >
            <Sparkles size={13} /> {badgeText}
            {!hasApiKey && (
              <span
                style={{
                  background: '#F59E0B',
                  color: '#FFF',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '0.72rem',
                  marginLeft: '4px'
                }}
              >
                ⚠️ Key未設定
              </span>
            )}
          </div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 4px 0', letterSpacing: '-0.01em' }}>
            {title}
          </h2>
          {description && (
            <p style={{ fontSize: '0.84rem', color: '#94A3B8', margin: 0, maxWidth: '680px' }}>
              {description}
            </p>
          )}
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={onToggle}
          style={{
            borderRadius: '12px',
            padding: '9px 16px',
            fontSize: '0.88rem',
            background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)'
          }}
        >
          <PlusCircle size={18} /> {isOpen ? '閉じる' : 'AIで作成する'}
        </button>
      </div>

      {isOpen && (
        <div
          style={{
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
