import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  RotateCcw, 
  Check, 
  CornerDownLeft, 
  Lightbulb, 
  Globe, 
  MessageCircleQuestion,
  HelpCircle,
  AlertCircle
} from 'lucide-react';

const CONVERSATION_QUICK_PROMPTS = [
  {
    label: '相手の発言のニュアンス',
    icon: <MessageCircleQuestion size={13} />,
    query: '直前の相手の発言の日本語訳とニュアンス、言外の意図を詳しく分かりやすく解説してください。'
  },
  {
    label: 'ここで使える自然な返答',
    icon: <Lightbulb size={13} />,
    query: 'この場面で相手に自然に返答できるおすすめの英語フレーズをいくつか教えてください。'
  },
  {
    label: '現地のマナー・文化のコツ',
    icon: <Globe size={13} />,
    query: 'このシチュエーションにおいて、海外（英語圏）で知っておくべき文化的なマナーやコミュニケーションの注意点はありますか？'
  },
  {
    label: '簡単・シンプルな言い回し',
    icon: <HelpCircle size={13} />,
    query: '中学英語レベルの簡単な単語を使って、言いたいことを相手に確実に伝えるシンプルな表現を教えてください。'
  }
];

const GENERAL_QUICK_PROMPTS = [
  {
    label: '初心者におすすめの会話は？',
    icon: <Lightbulb size={13} />,
    query: '英会話初心者ですが、まずはどのシチュエーションから練習するのがおすすめですか？効果的な練習手順も教えてください。'
  },
  {
    label: '海外旅行で役立つ定番フレーズ',
    icon: <Globe size={13} />,
    query: '海外旅行（カフェ、空港、ホテル、タクシーなど）で絶対に役立つ重要フレーズを5つ教えてください。'
  },
  {
    label: '英会話が続く相槌のコツ',
    icon: <MessageCircleQuestion size={13} />,
    query: 'ネイティブとの会話で自然にリアクションできる「相槌（あいづち）」や繋ぎ言葉の使い分けを教えてください。'
  },
  {
    label: '言いたい言葉が出ないときの対処法',
    icon: <HelpCircle size={13} />,
    query: '英語を話す時に言いたい単語や表現が出てこない時、どう言い換えたり切り抜ければいいですか？'
  }
];

export default function FloatingCoachWidget({
  situation = null,
  isOpen,
  onToggle,
  onClose,
  coachMessages,
  isLoading,
  error,
  questionInput,
  onQuestionInputChange,
  onAskQuestion,
  onClearHistory,
  onApplyPhrase
}) {
  const quickPrompts = situation ? CONVERSATION_QUICK_PROMPTS : GENERAL_QUICK_PROMPTS;
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto scroll to bottom of coach messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [coachMessages, isLoading, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!questionInput.trim() || isLoading) return;
    onAskQuestion();
  };

  const handleApplyPhrase = (phraseText, indexKey) => {
    if (onApplyPhrase) {
      onApplyPhrase(phraseText);
      setCopiedIndex(indexKey);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <button
        type="button"
        className={`floating-coach-fab ${isOpen ? 'active' : ''}`}
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
                  AI学習コーチ
                  <span className={`coach-status-tag ${situation ? 'connected' : 'general'}`}>
                    {situation ? '会話ログ連携中 🟢' : '英語学習相談 💡'}
                  </span>
                </div>
                <div className="coach-header-sub">
                  {situation ? '現在の会話内容について何でも相談' : '英語表現や学習のコツを何でも相談'}
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
              <div key={msg.id || i} className={`coach-msg-row ${msg.role}`}>
                {msg.role === 'assistant' && (
                  <div className="coach-bubble-avatar">
                    <Bot size={14} color="#4F46E5" />
                  </div>
                )}

                <div className="coach-msg-content">
                  <div className="coach-bubble">
                    {msg.text.split('\n').map((line, lIdx) => (
                      <p key={lIdx} style={{ margin: line ? '0 0 6px 0' : '0 0 4px 0' }}>
                        {line}
                      </p>
                    ))}
                  </div>

                  {/* Suggested phrases if any */}
                  {msg.suggestedPhrases && msg.suggestedPhrases.length > 0 && (
                    <div className="coach-phrases-card">
                      <div className="coach-phrases-title">
                        <Lightbulb size={13} color="#F59E0B" /> 使えるおすすめ英語フレーズ:
                      </div>
                      <div className="coach-phrases-list">
                        {msg.suggestedPhrases.map((phrase, pIdx) => {
                          const key = `${i}-${pIdx}`;
                          const isCopied = copiedIndex === key;
                          return (
                            <div key={pIdx} className="coach-phrase-item">
                              <div className="phrase-text-col">
                                <div className="phrase-en">"{phrase.english}"</div>
                                {phrase.japanese && (
                                  <div className="phrase-ja">{phrase.japanese}</div>
                                )}
                              </div>
                              <button
                                type="button"
                                className={`btn-apply-phrase ${isCopied ? 'copied' : ''}`}
                                onClick={() => handleApplyPhrase(phrase.english, key)}
                                title="会話入力欄にセット"
                                aria-label="会話入力欄にセット"
                              >
                                {isCopied ? (
                                  <>
                                    <Check size={12} /> 反映済
                                  </>
                                ) : (
                                  <>
                                    <CornerDownLeft size={12} /> 入力欄へ
                                  </>
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
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
