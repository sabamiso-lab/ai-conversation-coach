import React, { useState } from 'react';
import { Eye, EyeOff, Lightbulb } from 'lucide-react';

export interface ShadowingScriptViewerProps {
  text: string;
  slashedText?: string;
  translation?: string;
  tipsJa?: string;
}

export default function ShadowingScriptViewer({
  text,
  slashedText,
  translation,
  tipsJa
}: ShadowingScriptViewerProps) {
  const [viewMode, setViewMode] = useState<'slash' | 'full' | 'blank'>('slash');
  const [showTranslation, setShowTranslation] = useState(true);

  return (
    <div>
      {/* Display Mode Toggles */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          <button
            className={`btn ${viewMode === 'slash' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('slash')}
            style={{ fontSize: '0.78rem', padding: '5px 10px', borderRadius: '8px' }}
          >
            / 区切り
          </button>
          <button
            className={`btn ${viewMode === 'full' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('full')}
            style={{ fontSize: '0.78rem', padding: '5px 10px', borderRadius: '8px' }}
          >
            標準
          </button>
          <button
            className={`btn ${viewMode === 'blank' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('blank')}
            style={{ fontSize: '0.78rem', padding: '5px 10px', borderRadius: '8px' }}
          >
            🙈 穴埋め
          </button>
        </div>

        <button
          className="btn btn-ghost"
          onClick={() => setShowTranslation(!showTranslation)}
          style={{ fontSize: '0.78rem', color: '#64748B', padding: '4px 8px' }}
        >
          {showTranslation ? <><EyeOff size={14} /> 訳を隠す</> : <><Eye size={14} /> 訳を表示</>}
        </button>
      </div>

      {/* Script Content Card */}
      <div 
        style={{
          background: '#F1F5F9',
          borderRadius: '16px',
          padding: '24px',
          lineHeight: 1.8,
          fontSize: '1.15rem',
          fontWeight: 600,
          color: '#0F172A',
          letterSpacing: '0.01em',
          marginBottom: '16px'
        }}
      >
        {viewMode === 'slash' ? (
          slashedText || text
        ) : viewMode === 'blank' ? (
          text.split(' ').map((word, i) => (
            i % 3 === 1 ? ' ____ ' : `${word} `
          ))
        ) : (
          text
        )}
      </div>

      {/* Japanese Translation Box */}
      {showTranslation && translation && (
        <div style={{ background: '#EEF2FF', padding: '14px 18px', borderRadius: '12px', color: '#3730A3', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '24px' }}>
          <strong>日本語訳:</strong> {translation}
        </div>
      )}

      {/* Pronunciation & Linking Tips */}
      {tipsJa && (
        <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', padding: '12px 16px', borderRadius: '12px', color: '#92400E', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '24px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <Lightbulb size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#D97706' }} />
          <div>
            <strong>発音・リンキングのコツ:</strong> {tipsJa}
          </div>
        </div>
      )}
    </div>
  );
}
