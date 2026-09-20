import React from 'react';
import { ArrowRight } from 'lucide-react';
import DifficultyBadge from './DifficultyBadge';

export interface PracticeItemCardProps {
  icon?: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
  isSpecial?: boolean;
  badges?: React.ReactNode;
  difficulty?: string;
  title: string;
  titleJa?: string;
  description?: string;
  children?: React.ReactNode;
  actionText?: string;
  actionIcon?: React.ReactNode;
  actionButton?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export default function PracticeItemCard({
  icon,
  iconBg,
  iconColor,
  isSpecial = false,
  badges,
  difficulty,
  title,
  titleJa,
  description,
  children,
  actionText = '開始する',
  actionIcon = <ArrowRight size={16} />,
  actionButton,
  onClick,
  className = '',
  style = {}
}: PracticeItemCardProps) {
  return (
    <div
      className={`situation-card ${className}`.trim()}
      onClick={onClick}
      style={{
        border: isSpecial ? '2px solid #6366F1' : '1px solid #E2E8F0',
        background: isSpecial ? 'linear-gradient(180deg, #EEF2FF 0%, #FFFFFF 100%)' : '#FFFFFF',
        ...style
      }}
    >
      <div>
        <div className="card-top">
          {icon && (
            <div
              className="icon-box"
              style={{
                background: iconBg || (isSpecial ? '#EEF2FF' : '#F1F5F9'),
                color: iconColor || (isSpecial ? '#4F46E5' : '#475569')
              }}
            >
              {icon}
            </div>
          )}
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {badges}
            {difficulty && <DifficultyBadge difficulty={difficulty} />}
          </div>
        </div>

        <div className="card-title">{title}</div>
        {titleJa && <div className="card-title-ja">{titleJa}</div>}

        {description && (
          <p className="card-desc">
            {description}
          </p>
        )}

        {children}
      </div>

      <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', color: '#4F46E5', fontWeight: 700, fontSize: '0.9rem' }}>
        {actionButton || (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            {actionText} {actionIcon}
          </span>
        )}
      </div>
    </div>
  );
}
