import React from 'react';
import {
  CoachMode,
  Situation,
  CoachConversationContext,
  CoachShadowingContext,
  CoachBlitzContext
} from '../../../types';

export interface CoachContextBannerProps {
  mode: CoachMode;
  situation?: Partial<Situation> | null;
  conversationContext?: CoachConversationContext | null;
  shadowingContext?: CoachShadowingContext | null;
  blitzContext?: CoachBlitzContext | null;
  lastAiText?: string;
  isWaitingForUser?: boolean;
}

export function CoachContextBanner({
  mode,
  situation,
  conversationContext,
  shadowingContext,
  blitzContext,
  lastAiText = '',
  isWaitingForUser = false
}: CoachContextBannerProps) {
  if (!situation && !shadowingContext && !blitzContext) {
    return null;
  }

  return (
    <div className="coach-active-context-banner">
      {mode === 'conversation' && situation && (
        <div className="coach-context-item">
          <div className="coach-context-badge">
            <span className="coach-context-dot" />
            <span className="coach-context-label">{situation.systemRole || 'AI Partner'} の直前の発言:</span>
            <span className={`coach-answer-pill ${isWaitingForUser ? 'waiting' : 'replied'}`}>
              {isWaitingForUser ? '未返答・考え中' : '返答済み'}
            </span>
          </div>
          <div className="coach-context-quote" title={lastAiText || situation.initialMessage || '（会話開始待ち）'}>
            "{lastAiText || situation.initialMessage || '（会話開始待ち）'}"
          </div>
          {conversationContext?.currentUserInput && conversationContext.currentUserInput.trim() && (
            <div className="coach-context-input-preview">
              <span className="input-preview-label">入力中:</span> "{conversationContext.currentUserInput.trim()}"
            </div>
          )}
        </div>
      )}

      {mode === 'shadowing' && shadowingContext && (
        <div className="coach-context-item">
          <div className="coach-context-badge">
            <span className="coach-context-dot" />
            <span className="coach-context-label">英文スクリプト: {shadowingContext.title}</span>
            <span className={`coach-answer-pill ${shadowingContext.userSpeech ? 'replied' : 'waiting'}`}>
              {shadowingContext.userSpeech ? '発話録音済み' : '未録音・発話前'}
            </span>
          </div>
          <div className="coach-context-quote" title={shadowingContext.targetText || shadowingContext.fullText || ''}>
            {(() => {
              const text = shadowingContext.targetText || shadowingContext.fullText || '';
              return `"${text.length > 70 ? `${text.slice(0, 70)}...` : text}"`;
            })()}
          </div>
          {shadowingContext.userSpeech && (
            <div className="coach-context-input-preview">
              <span className="input-preview-label">あなたの発話:</span> "{shadowingContext.userSpeech}"
              {shadowingContext.evalResult?.overallScore !== undefined && (
                <span className="score-tag"> ({shadowingContext.evalResult.overallScore}点)</span>
              )}
            </div>
          )}
        </div>
      )}

      {mode === 'blitz' && blitzContext && (
        <div className="coach-context-item">
          <div className="coach-context-badge">
            <span className="coach-context-dot" />
            <span className="coach-context-label">お題 ({blitzContext.topicTitle}):</span>
            <span className={`coach-answer-pill ${blitzContext.userSpeech ? 'replied' : 'waiting'}`}>
              {blitzContext.userSpeech ? '回答・発話済み' : '未回答・考え中'}
            </span>
          </div>
          <div className="coach-context-quote" title={blitzContext.currentQuestion?.japanese || blitzContext.topicTitle}>
            {blitzContext.currentQuestion ? `「${blitzContext.currentQuestion.japanese || blitzContext.currentQuestion.prompt}」` : blitzContext.topicTitle}
          </div>
          {blitzContext.userSpeech && (
            <div className="coach-context-input-preview">
              <span className="input-preview-label">あなたの回答:</span> "{blitzContext.userSpeech}"
              {blitzContext.isCorrect !== undefined && blitzContext.isCorrect !== null && (
                <span className={`result-tag ${blitzContext.isCorrect ? 'pass' : 'retry'}`}>
                  {blitzContext.isCorrect ? ' ✓合格' : ' ✗惜しい'}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
