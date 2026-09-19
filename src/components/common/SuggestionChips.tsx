import React from 'react';

export interface SuggestionChipItem {
  label: string;
  topic: string;
}

export interface SuggestionChipsProps {
  chips: readonly SuggestionChipItem[] | SuggestionChipItem[];
  onSelect: (topic: string) => void;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function SuggestionChips({
  chips = [],
  onSelect,
  label = '話題例:',
  className = '',
  style = {}
}: SuggestionChipsProps) {
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
