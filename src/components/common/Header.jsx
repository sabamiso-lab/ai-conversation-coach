import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Sparkles, Key, RotateCcw, MessageSquare, Headphones } from 'lucide-react';

export default function Header({ onOpenApiKeyModal, hasApiKey, selectedSituation, onResetSession }) {
  const location = useLocation();
  const isConversationPage = location.pathname === '/' || location.pathname === '/conversation';

  return (
    <header className="app-header">
      <div className="header-left">
        <NavLink to="/" className="logo-area" onClick={() => selectedSituation && onResetSession && onResetSession()}>
          <div className="logo-icon">
            <Sparkles size={24} />
          </div>
          <div>
            <div className="logo-title">
              SpeakFlow <span className="logo-badge">Gemini 3.5</span>
            </div>
          </div>
        </NavLink>

        {/* ナビゲーションタブ */}
        <nav className="nav-tabs">
          <NavLink 
            to="/" 
            className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
            end
          >
            <MessageSquare size={18} />
            <span>会話練習</span>
          </NavLink>
          <NavLink 
            to="/shadowing" 
            className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
          >
            <Headphones size={18} />
            <span>シャドーイング</span>
          </NavLink>
        </nav>
      </div>

      <div className="header-actions">
        {isConversationPage && selectedSituation && (
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
