import React from 'react';

/**
 * 統計・スコア表示カード
 * 
 * @param {Object} props
 * @param {React.ReactNode} [props.icon] - アイコン
 * @param {React.ReactNode} props.value - メイン数値・値
 * @param {React.ReactNode} props.label - ラベル・説明
 * @param {string} [props.className=''] - 追加クラス名
 * @param {React.CSSProperties} [props.style] - 追加スタイル
 */
export default function StatCard({
  icon,
  value,
  label,
  className = '',
  style = {}
}) {
  return (
    <div className={`stat-card ${className}`.trim()} style={style}>
      {icon && <div className="stat-icon-wrapper">{icon}</div>}
      <div className="stat-val font-mono">{value}</div>
      <div className="stat-lbl">{label}</div>
    </div>
  );
}
