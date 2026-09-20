import React, { useRef, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  RotateCcw, 
  AlertCircle 
} from 'lucide-react';
import { 
  CoachMode, 
  Situation, 
  ChatMessage, 
  CoachConversationContext, 
  CoachShadowingContext, 
  CoachBlitzContext, 
  CoachMessage 
} from '../../types';
import { resolveCoachQuickPrompts } from './coachPrompts';
import { CoachContextBanner } from './CoachContextBanner';
import { CoachMessageItem } from './CoachMessageItem';

export interface FloatingCoachWidgetProps {
  mode?: CoachMode;
  situation?: Partial<Situation> | null;
  conversationHistory?: ChatMessage[];
  conversationContext?: CoachConversationContext | null;
  shadowingContext?: CoachShadowingContext | null;
  blitzContext?: CoachBlitzContext | null;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  coachMessages: CoachMessage[];
  isLoading: boolean;
  error?: string | null;
  questionInput: string;
  onQuestionInputChange: (val: string) => void;
  onAskQuestion: (question?: string) => Promise<unknown> | void;
  onClearHistory: () => void;
  hideFabOnMobile?: boolean;
}

export default function FloatingCoachWidget({
  mode = 'conversation',
  situation = null,
  conversationHistory = [],
  conversationContext = null,
  shadowingContext = null,
  blitzContext = null,
  isOpen,
  onToggle,
  onClose,
  coachMessages,
  isLoading,
  error = null,
  questionInput,
  onQuestionInputChange,
  onAskQuestion,
  onClearHistory,
  hideFabOnMobile = false
}: FloatingCoachWidgetProps) {
  // Find latest AI and User utterance in conversation
  const reversedHistory = [...conversationHistory].reverse();
  const lastAiMsg = reversedHistory.find(m => m.role === 'ai') || (situation?.initialMessage ? { text: situation.initialMessage } : null);
  const lastAiText = lastAiMsg?.text || '';
  const lastMsg = conversationHistory.length > 0 ? conversationHistory[conversationHistory.length - 1] : (situation?.initialMessage ? { role: 'ai', text: situation.initialMessage } : null);
  const isWaitingForUser = lastMsg?.role === 'ai';

  const quickPrompts = resolveCoachQuickPrompts({
    mode,
    situation,
    lastAiText,
    isWaitingForUser,
    shadowingContext,
    blitzContext
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom of coach messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [coachMessages, isLoading, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const timer = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionInput.trim() || isLoading) return;
    onAskQuestion();
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <button
        type="button"
        className={`floating-coach-fab ${isOpen ? 'active' : ''} ${hideFabOnMobile ? 'hide-on-mobile' : ''}`}
        onClick={onToggle}
        aria-label="AIコーチに質問する"
        title="AIコーチに現在の会話について相談する"
      >
        <div className="floating-coach-fab-content">
          <Sparkles size={20} className="fab-icon-spin" />
          <span className="fab-text">AIに相談</span>
        </div>
        <span className="fab-ping" />
      </button>

      {/* Floating Coach Panel */}
      {isOpen && (
        <div className="floating-coach-panel" role="region" aria-label="AI会話相談パネル">
          {/* Header */}
          <div className="floating-coach-header">
            <div className="coach-header-info">
              <div className="coach-avatar">
                <Bot size={18} color="#FFFFFF" />
              </div>
              <div>
                <div className="coach-header-title">
                  {mode === 'shadowing' ? 'シャドーイングAIコーチ' : mode === 'blitz' ? '瞬間英作文AIコーチ' : 'AI学習コーチ'}
                  <span className={`coach-status-tag ${situation || mode === 'shadowing' || mode === 'blitz' ? 'connected' : 'general'}`}>
                    {mode === 'shadowing' ? 'スクリプト連携中 🎧' : mode === 'blitz' ? 'お題連携中 ⚡' : situation ? '会話ログ連携中 🟢' : '英語学習相談 💡'}
                  </span>
                </div>
                <div className="coach-header-sub">
                  {mode === 'shadowing' 
                    ? '発音・リエゾン・構文を何でも相談' 
                    : mode === 'blitz' 
                    ? '語順・別表現・瞬発力のコツを相談' 
                    : situation 
                    ? '現在の会話内容について何でも相談' 
                    : '英語表現や学習のコツを何でも相談'}
                </div>
              </div>
            </div>

            <div className="coach-header-actions">
              <button
                type="button"
                className="btn-icon-subtle"
                onClick={onClearHistory}
                title="相談履歴をリセット"
                aria-label="相談履歴をリセット"
              >
                <RotateCcw size={15} />
              </button>
              <button
                type="button"
                className="btn-icon-subtle"
                onClick={onClose}
                title="閉じる"
                aria-label="閉じる"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Active Context Banner */}
          <CoachContextBanner
            mode={mode}
            situation={situation}
            conversationContext={conversationContext}
            shadowingContext={shadowingContext}
            blitzContext={blitzContext}
            lastAiText={lastAiText}
            isWaitingForUser={isWaitingForUser}
          />

          {/* Quick Prompts Bar */}
          <div className="coach-quick-prompts">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                className="coach-chip"
                onClick={() => onAskQuestion(prompt.query)}
                disabled={isLoading}
              >
                {prompt.icon}
                <span>{prompt.label}</span>
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div className="coach-messages-area">
            {coachMessages.map((msg, i) => (
              <CoachMessageItem
                key={msg.id || i}
                message={msg}
                index={i}
              />
            ))}

            {isLoading && (
              <div className="coach-msg-row assistant">
                <div className="coach-bubble-avatar">
                  <Bot size={14} color="#4F46E5" />
                </div>
                <div className="coach-msg-content">
                  <div className="coach-bubble loading-bubble">
                    <Sparkles size={14} className="animate-spin text-indigo-600" />
                    <span>会話ログを読み込み、アドバイスを考え中...</span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="coach-error-banner">
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Question Input Footer */}
          <form className="coach-input-footer" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              className="coach-input"
              placeholder="現在話している内容について質問... (日本語OK)"
              value={questionInput}
              onChange={(e) => onQuestionInputChange(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="btn btn-primary coach-send-btn"
              disabled={!questionInput.trim() || isLoading}
              aria-label="質問を送信"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
