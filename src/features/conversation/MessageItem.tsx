import React, { useState } from 'react';
import { Languages, Sparkles, User, Bot, Zap } from 'lucide-react';
import AudioPlayButton from '../../components/common/AudioPlayButton';
import type { ChatMessage } from '../../types';

export interface MessageItemProps {
  message: Partial<ChatMessage> & {
    role: 'user' | 'ai';
    text: string;
  };
}

export default function MessageItem({ message }: MessageItemProps) {
  const [showTranslation, setShowTranslation] = useState(false);
  const isUser = message.role === 'user';

  // Determine badge style
  const getBadgeClass = (status?: string) => {
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
        <div className="message-actions">
          <AudioPlayButton
            text={message.text}
            lang="en-US"
            iconSize={14}
            label="聴く"
            title="音声を聞く"
            className="msg-action-btn"
          />

          {(message.translation || message.userTextTranslation) && (
            <button
              onClick={() => setShowTranslation(!showTranslation)}
              className="msg-action-btn"
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
            <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={14} color="#6366F1" style={{ flexShrink: 0 }} />
              <span>ネイティブ風表現: <strong style={{ color: '#4F46E5' }}>"{message.betterPhrasing}"</strong></span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
