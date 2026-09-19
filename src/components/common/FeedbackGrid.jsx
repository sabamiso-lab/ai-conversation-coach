import React from 'react';

/**
 * 良かった点 (Strengths) と 改善ポイント (Improvements) を並列カードで表示する共通グリッド
 * @param {Object} props
 * @param {string[]} [props.strengths] - 良かった点のリスト
 * @param {string[]} [props.improvements] - 改善ポイントのリスト
 * @param {string} [props.strengthsTitle='💪 良かった点'] - 良かった点カードのタイトル
 * @param {string} [props.improvementsTitle='🎯 次回の改善ポイント'] - 改善ポイントカードのタイトル
 * @param {string} [props.minColWidth='220px'] - グリッドの最小列幅
 * @param {boolean} [props.compact=false] - パディングと文字サイズを抑えたコンパクト表示
 * @param {string} [props.className='']
 * @param {React.CSSProperties} [props.style]
 */
export default function FeedbackGrid({
  strengths = [],
  improvements = [],
  strengthsTitle = '💪 良かった点',
  improvementsTitle = '🎯 次回の改善ポイント',
  minColWidth = '220px',
  compact = false,
  className = '',
  style = {}
}) {
  const hasStrengths = strengths && strengths.length > 0;
  const hasImprovements = improvements && improvements.length > 0;

  if (!hasStrengths && !hasImprovements) {
    return null;
  }

  const padding = compact ? '12px' : '14px';
  const titleSize = compact ? '0.82rem' : '0.88rem';
  const itemSize = compact ? '0.8rem' : '0.82rem';
  const borderRadius = compact ? '10px' : '12px';

  return (
    <div
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(${minColWidth}, 1fr))`,
        gap: '12px',
        ...style
      }}
    >
      {hasStrengths && (
        <div
          style={{
            background: '#ECFDF5',
            border: '1px solid #A7F3D0',
            padding,
            borderRadius
          }}
        >
          <div
            style={{
              fontWeight: 800,
              fontSize: titleSize,
              color: '#047857',
              marginBottom: compact ? '4px' : '8px'
            }}
          >
            {strengthsTitle}
          </div>
          {strengths.map((item, idx) => (
            <div
              key={idx}
              style={{
                fontSize: itemSize,
                color: '#065F46',
                marginTop: compact ? '2px' : '4px'
              }}
            >
              • {item}
            </div>
          ))}
        </div>
      )}

      {hasImprovements && (
        <div
          style={{
            background: '#FFFBEB',
            border: '1px solid #FDE68A',
            padding,
            borderRadius
          }}
        >
          <div
            style={{
              fontWeight: 800,
              fontSize: titleSize,
              color: '#B45309',
              marginBottom: compact ? '4px' : '8px'
            }}
          >
            {improvementsTitle}
          </div>
          {improvements.map((item, idx) => (
            <div
              key={idx}
              style={{
                fontSize: itemSize,
                color: '#92400E',
                marginTop: compact ? '2px' : '4px'
              }}
            >
              • {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
