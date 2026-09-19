import React from 'react';

interface DifficultyConfigItem {
  label: string;
  bg: string;
  color: string;
  border: string;
  className: string;
}

const DIFFICULTY_CONFIG: Record<string, DifficultyConfigItem> = {
  beginner: {
    label: 'Beginner',
    bg: '#ECFDF5',
    color: '#047857',
    border: '#A7F3D0',
    className: 'badge-green'
  },
  intermediate: {
    label: 'Intermediate',
    bg: '#FEF3C7',
    color: '#B45309',
    border: '#FDE68A',
    className: 'badge-yellow'
  },
  advanced: {
    label: 'Advanced',
    bg: '#F3E8FF',
    color: '#6B21A8',
    border: '#E9D5FF',
    className: 'badge-purple'
  }
};

export interface DifficultyBadgeProps {
  difficulty?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function DifficultyBadge({ difficulty, className = '', style = {} }: DifficultyBadgeProps) {
  if (!difficulty) return null;

  const normalized = String(difficulty).toLowerCase();
  const config = DIFFICULTY_CONFIG[normalized] || {
    label: difficulty,
    bg: '#F1F5F9',
    color: '#475569',
    border: '#E2E8F0',
    className: ''
  };

  const displayText = DIFFICULTY_CONFIG[normalized] ? config.label : difficulty;

  return (
    <span
      className={`badge ${config.className} ${className}`.trim()}
      style={{
        background: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        fontWeight: 700,
        ...style
      }}
    >
      {displayText}
    </span>
  );
}
