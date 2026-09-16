import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Sparkles, Key, RotateCcw, MessageSquare, Headphones } from 'lucide-react';

export default function Header({ onOpenApiKeyModal, hasApiKey, selectedSituation, onResetSession }) {
  const location = useLocation();
  const isConversationPage = location.pathname === '/' || location.pathname === '/conversation';

  return (
    <>
      <header className="app-header">
        <div className="header-left">
          <NavLink to="/" className="logo-area" onClick={() => selectedSituation && onResetSession && onResetSession()}>
            <div className="logo-icon">
              <Sparkles size={22} />
            </div>
            <div>
              <div className="logo-title">
                SpeakFlow <span className="logo-badge">Gemini 3.5</span>
              </div>
            </div>
          </NavLink>

          {/* デスクトップ用ナビゲーションタブ */}
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
            <button className="btn btn-secondary" onClick={onResetSession} title="シチュエーション一覧へ">
              <RotateCcw size={16} /> 
              <span className="btn-text-desktop">シチュエーション一覧</span>
            </button>
          )}

          <button 
            className={`btn ${hasApiKey ? 'btn-secondary' : 'btn-primary'}`}
            onClick={onOpenApiKeyModal}
            title={hasApiKey ? "API Key 設定済み" : "API Key を設定"}
          >
            <Key size={16} /> 
            <span>{hasApiKey ? 'Key 設定中' : 'API Key 設定'}</span>
          </button>
        </div>
      </header>

      {/* スマホ用固定ボトムナビゲーションバー */}
      <nav className="mobile-bottom-nav">
        <NavLink 
          to="/" 
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
          end
        >
          <MessageSquare size={20} className="bottom-nav-icon" />
          <span>会話練習</span>
        </NavLink>
        <NavLink 
          to="/shadowing" 
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        >
          <Headphones size={20} className="bottom-nav-icon" />
          <span>シャドーイング</span>
        </NavLink>
      </nav>
    </>
  );
}

