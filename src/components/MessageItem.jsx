import React, { useState } from 'react';
import { Volume2, Languages, Sparkles, User, Bot } from 'lucide-react';
import { speakText } from '../services/speech';

export default function MessageItem({ message }) {
  const [showTranslation, setShowTranslation] = useState(false);
  const isUser = message.role === 'user';

  const handleSpeak = () => {
    speakText(message.text, { lang: 'en-US' });
  };

  return (
    <div className={`message-row ${isUser ? 'user' : 'ai'}`}>
      <div className="message-sender">
        {isUser ? <User size={14} /> : <Bot size={14} />}
        {isUser ? 'You' : 'AI Coach'}
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

      {/* Better Phrasing Suggestion for User Messages */}
      {isUser && message.betterPhrasing && (
        <div className="better-phrasing-card">
          <div className="better-phrasing-title">
            <Sparkles size={14} /> より自然なネイティブ表現:
          </div>
          <div style={{ fontWeight: 700, margin: '2px 0' }}>
            "{message.betterPhrasing}"
          </div>
          {message.phrasingTip && (
            <div style={{ fontSize: '0.78rem', opacity: 0.9 }}>
              💡 {message.phrasingTip}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
