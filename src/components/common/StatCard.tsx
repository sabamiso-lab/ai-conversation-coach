import React from 'react';

export interface StatCardProps {
  icon?: React.ReactNode;
  value: React.ReactNode;
  label: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function StatCard({
  icon,
  value,
  label,
  className = '',
  style = {}
}: StatCardProps) {
  return (
    <div className={`stat-card ${className}`.trim()} style={style}>
      {icon && <div className="stat-icon-wrapper">{icon}</div>}
      <div className="stat-val font-mono">{value}</div>
      <div className="stat-lbl">{label}</div>
    </div>
  );
}
