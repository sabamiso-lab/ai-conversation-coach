import React from 'react';
import { Sparkles, Key, RotateCcw } from 'lucide-react';

export default function Header({ onOpenApiKeyModal, hasApiKey, selectedSituation, onResetSession }) {
  return (
    <header className="app-header">
      <div className="logo-area" onClick={() => selectedSituation && onResetSession()}>
        <div className="logo-icon">
          <Sparkles size={24} />
        </div>
        <div>
          <div className="logo-title">
            SpeakFlow <span className="logo-badge">Gemini 3.5</span>
          </div>
        </div>
      </div>

      <div className="header-actions">
        {selectedSituation && (
          <button className="btn btn-secondary" onClick={onResetSession}>
            <RotateCcw size={16} /> シチュエーション一覧
          </button>
        )}

        <button 
          className={`btn ${hasApiKey ? 'btn-secondary' : 'btn-primary'}`}
          onClick={onOpenApiKeyModal}
        >
          <Key size={16} /> 
          {hasApiKey ? 'API Key 設定中' : 'API Key を設定'}
        </button>
      </div>
    </header>
  );
}
