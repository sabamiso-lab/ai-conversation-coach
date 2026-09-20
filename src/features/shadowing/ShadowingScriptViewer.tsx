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
      <div className="shadowing-mode-bar">
        <div className="shadowing-mode-group">
          <button
            className={`btn ${viewMode === 'slash' ? 'btn-primary' : 'btn-secondary'} shadowing-mode-btn`}
            onClick={() => setViewMode('slash')}
          >
            / 区切り
          </button>
          <button
            className={`btn ${viewMode === 'full' ? 'btn-primary' : 'btn-secondary'} shadowing-mode-btn`}
            onClick={() => setViewMode('full')}
          >
            標準
          </button>
          <button
            className={`btn ${viewMode === 'blank' ? 'btn-primary' : 'btn-secondary'} shadowing-mode-btn`}
            onClick={() => setViewMode('blank')}
          >
            🙈 穴埋め
          </button>
        </div>

        <button
          className="btn btn-ghost shadowing-trans-toggle-btn"
          onClick={() => setShowTranslation(!showTranslation)}
        >
          {showTranslation ? <><EyeOff size={14} /> 訳を隠す</> : <><Eye size={14} /> 訳を表示</>}
        </button>
      </div>

      {/* Script Content Card */}
      <div className="shadowing-script-card">
        {viewMode === 'slash' ? (
          slashedText || text || ''
        ) : viewMode === 'blank' ? (
          (text || '').split(' ').map((word, i) => (
            <React.Fragment key={i}>
              {i % 3 === 1 ? ' ____ ' : `${word} `}
            </React.Fragment>
          ))
        ) : (
          text || ''
        )}
      </div>

      {/* Japanese Translation Box */}
      {showTranslation && translation && (
        <div className="shadowing-translation-box">
          <strong>日本語訳:</strong> {translation}
        </div>
      )}

      {/* Pronunciation & Linking Tips */}
      {tipsJa && (
        <div className="shadowing-tips-box">
          <Lightbulb size={18} className="shadowing-tips-icon" />
          <div>
            <strong>発音・リンキングのコツ:</strong> {tipsJa}
          </div>
        </div>
      )}
    </div>
  );
}
