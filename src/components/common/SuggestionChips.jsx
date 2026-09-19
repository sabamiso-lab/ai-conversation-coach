import React from 'react';

/**
 * 話題例・おすすめキーワード選択チップス
 * 
 * @param {Object} props
 * @param {{ label: string, topic: string }[]} props.chips - チップ一覧
 * @param {(topic: string) => void} props.onSelect - チップ選択時のコールバック
 * @param {string} [props.label='話題例:'] - 先頭ラベル
 * @param {string} [props.className=''] - 追加クラス名
 * @param {React.CSSProperties} [props.style] - 追加スタイル
 */
export default function SuggestionChips({
  chips = [],
  onSelect,
  label = '話題例:',
  className = '',
  style = {}
}) {
  if (!chips.length) return null;

  return (
    <div
      className={`suggestion-chips-container ${className}`.trim()}
      style={{
        marginTop: '10px',
        display: 'flex',
        gap: '6px',
        flexWrap: 'wrap',
        alignItems: 'center',
        ...style
      }}
    >
      {label && (
        <span style={{ fontSize: '0.74rem', color: '#94A3B8', fontWeight: 600 }}>
          {label}
        </span>
      )}
      {chips.map((chip, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => onSelect(chip.topic)}
          style={{
            background: 'rgba(255, 255, 255, 0.07)',
            color: '#CBD5E1',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '6px',
            padding: '2px 8px',
            fontSize: '0.74rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}
