import React, { useState } from 'react';
import { Volume2, Languages, Sparkles, User, Bot, Zap } from 'lucide-react';
import { speakText } from '../../services/speech';

export default function MessageItem({ message }) {
  const [showTranslation, setShowTranslation] = useState(false);
  const isUser = message.role === 'user';

  const handleSpeak = () => {
    speakText(message.text, { lang: 'en-US' });
  };

  // Determine badge style
  const getBadgeClass = (status) => {
    if (status === 'FULL') return 'clarity-badge full';
    if (status === 'PARTIAL') return 'clarity-badge partial';
    return 'clarity-badge unclear';
  };

  return (
    <div className={`message-row ${isUser ? 'user' : 'ai'}`}>
      <div className="message-sender">
        {isUser ? <User size={14} /> : <Bot size={14} />}
        {isUser ? 'You' : 'AI Coach'}
        
        {/* Clarity Badge for User Messages */}
        {isUser && message.clarityBadgeJa && (
          <span className={getBadgeClass(message.clarityStatus)}>
            {message.clarityBadgeJa}
          </span>
        )}
      </div>

      <div className="message-bubble">
        <div>{message.text}</div>

        {/* Translation Toggle & Audio Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
          <button
            onClick={handleSpeak}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: isUser ? '#E0E7FF' : '#64748B',
              padding: '2px 4px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.78rem',
              fontWeight: 600
            }}
            title="音声を聞く"
          >
            <Volume2 size={15} /> 聴く
          </button>

          {(message.translation || message.userTextTranslation) && (
            <button
              onClick={() => setShowTranslation(!showTranslation)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: isUser ? '#E0E7FF' : '#64748B',
                padding: '2px 4px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.78rem',
                fontWeight: 600
              }}
            >
              <Languages size={14} /> 
              {showTranslation ? '日本語を隠す' : '日本語訳'}
            </button>
          )}
        </div>

        {/* Translation Text */}
        {showTranslation && (
          <div className="translation-box">
            {message.translation || message.userTextTranslation}
          </div>
        )}
      </div>

      {/* Meaning Clarity & Communicative Intent Feedback Card */}
      {isUser && (message.clarityFeedbackJa || message.simpleAlternative || message.betterPhrasing) && (
        <div className="clarity-feedback-card">
          {/* Main Feedback text */}
          {message.clarityFeedbackJa && (
            <div className="clarity-feedback-text">
              💬 {message.clarityFeedbackJa}
            </div>
          )}

          {/* Simple Alternative / Survival English */}
          {message.simpleAlternative && (
            <div className="simple-alt-box">
              <span className="simple-alt-label">
                <Zap size={13} /> もっと簡単・確実な伝え方:
              </span>
              <span className="simple-alt-text">"{message.simpleAlternative}"</span>
            </div>
          )}

          {/* Better Phrasing (Optional) */}
          {message.betterPhrasing && message.betterPhrasing !== message.simpleAlternative && (
            <div style={{ marginTop: '6px', fontSize: '0.78rem', color: '#475569' }}>
              <Sparkles size={13} style={{ display: 'inline', marginRight: '4px', color: '#6366F1' }} />
              ネイティブ風に言うなら: <strong>"{message.betterPhrasing}"</strong>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
