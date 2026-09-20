import React from 'react';
import { Bot, Lightbulb } from 'lucide-react';
import { CoachMessage } from '../../types';

export interface CoachMessageItemProps {
  message: CoachMessage;
  index: number;
}

export function CoachMessageItem({
  message,
  index: _index
}: CoachMessageItemProps) {
  return (
    <div className={`coach-msg-row ${message.role}`}>
      {message.role === 'assistant' && (
        <div className="coach-bubble-avatar">
          <Bot size={14} color="#4F46E5" />
        </div>
      )}

      <div className="coach-msg-content">
        <div className="coach-bubble">
          {(message.text || '').split('\n').map((line, lIdx) => (
            <p key={lIdx} style={{ margin: line ? '0 0 6px 0' : '0 0 4px 0' }}>
              {line}
            </p>
          ))}
        </div>

        {/* Suggested phrases if any */}
        {message.suggestedPhrases && message.suggestedPhrases.length > 0 && (
          <div className="coach-phrases-card">
            <div className="coach-phrases-title">
              <Lightbulb size={13} color="#F59E0B" /> 使えるおすすめ英語フレーズ:
            </div>
            <div className="coach-phrases-list">
              {message.suggestedPhrases.map((phrase, pIdx) => (
                <div key={pIdx} className="coach-phrase-item">
                  <div className="phrase-text-col">
                    <div className="phrase-en">"{phrase.english}"</div>
                    {phrase.japanese && (
                      <div className="phrase-ja">{phrase.japanese}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
