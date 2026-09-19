import React from 'react';
import { Globe, ExternalLink } from 'lucide-react';

/**
 * ニュース検索 (Grounding) に基づく出典リンクコンポーネント
 * @param {Object} props
 * @param {{ title: string, url: string }} [props.newsSource] - 出典ニュース情報
 * @param {'card' | 'badge'} [props.variant='card'] - 表示バリアント ('card': 詳細カード, 'badge': インラインリンクバッジ)
 * @param {string} [props.className='']
 * @param {React.CSSProperties} [props.style]
 */
export default function NewsCitation({
  newsSource,
  variant = 'card',
  className = '',
  style = {}
}) {
  if (!newsSource || !newsSource.url) {
    return null;
  }

  const title = newsSource.title || 'ニュースソース';

  if (variant === 'badge') {
    const displayTitle = title.length > 35 ? `${title.slice(0, 35)}...` : title;

    return (
      <div
        className={className}
        style={{ marginTop: '8px', marginBottom: '12px', ...style }}
      >
        <a
          href={newsSource.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{
            color: '#4F46E5',
            fontSize: '0.78rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            textDecoration: 'none',
            background: '#EEF2FF',
            padding: '4px 8px',
            borderRadius: '6px'
          }}
          title="元ニュース記事を読む"
        >
          <ExternalLink size={12} /> 出典: {displayTitle}
        </a>
      </div>
    );
  }

  return (
    <div
      className={`info-card ${className}`.trim()}
      style={{
        background: '#F5F3FF',
        borderColor: '#DDD6FE',
        ...style
      }}
    >
      <div
        className="info-title"
        style={{
          color: '#5B21B6',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        <Globe size={16} /> 関連ニュース記事 (Grounding)
      </div>
      <div
        style={{
          fontSize: '0.82rem',
          color: '#4C1D95',
          marginBottom: '8px',
          fontWeight: 600
        }}
      >
        {title}
      </div>
      <a
        href={newsSource.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '0.78rem',
          color: '#4F46E5',
          fontWeight: 700,
          textDecoration: 'underline'
        }}
      >
        <ExternalLink size={12} /> 元ニュース記事を開く
      </a>
    </div>
  );
}
