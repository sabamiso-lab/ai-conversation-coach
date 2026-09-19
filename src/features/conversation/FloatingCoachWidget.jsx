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
  AlertCircle,
  Volume2,
  Music,
  Zap
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

const SHADOWING_QUICK_PROMPTS = [
  {
    label: 'リエゾン・発音のコツ',
    icon: <Volume2 size={13} />,
    query: 'この英文スクリプトで、音が繋がる部分（リエゾン/リンキング）や脱落・弱形になる発音の注意点を分かりやすく解説してください。'
  },
  {
    label: '構文・文法の分解解説',
    icon: <HelpCircle size={13} />,
    query: 'この英文の文法構造・スラッシュリーディングの区切り方と、重要な語彙のニュアンスを教えてください。'
  },
  {
    label: '抑揚・リズムのポイント',
    icon: <Music size={13} />,
    query: 'この英文を自然な英語らしく読むための、強く読む単語（強勢）とイントネーション（上げ下げ）のポイントを教えてください。'
  },
  {
    label: '舌が回らない時の練習法',
    icon: <Lightbulb size={13} />,
    query: 'シャドーイングでスピードについていけない、舌がもつれる時の効果的なステップ別練習法を教えてください。'
  }
];

const BLITZ_QUICK_PROMPTS = [
  {
    label: '別の自然な言い回し・表現',
    icon: <Lightbulb size={13} />,
    query: 'この日本語のお題に対して、標準の解答以外にネイティブがよく使う自然な別表現やカジュアルな言い方を教えてください。'
  },
  {
    label: 'なぜこの語順・文法になる？',
    icon: <HelpCircle size={13} />,
    query: 'この英文の語順や文法ルールの理由を初心者にも分かりやすく解説してください。'
  },
  {
    label: '瞬時に口から出すコツ',
    icon: <Zap size={13} />,
    query: 'この文型・パターンを頭で考え込まず、瞬時に0.5秒で口から発話できるようになるためのパターンプラクティスのコツを教えてください。'
  },
  {
    label: '日米のニュアンスの違い',
    icon: <Globe size={13} />,
    query: '直訳した日本語と、実際の英語表現が持つニュアンスの違いやシチュエーションでの使い分けを教えてください。'
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
  error,
  questionInput,
  onQuestionInputChange,
  onAskQuestion,
  onClearHistory,
  onApplyPhrase
}) {
  // Find latest AI and User utterance in conversation
  const reversedHistory = [...conversationHistory].reverse();
  const lastAiMsg = reversedHistory.find(m => m.role === 'ai') || (situation?.initialMessage ? { text: situation.initialMessage } : null);
  const lastAiText = lastAiMsg?.text || '';
  const lastMsg = conversationHistory.length > 0 ? conversationHistory[conversationHistory.length - 1] : (situation?.initialMessage ? { role: 'ai', text: situation.initialMessage } : null);
  const isWaitingForUser = lastMsg?.role === 'ai';

  let quickPrompts = GENERAL_QUICK_PROMPTS;
  if (mode === 'shadowing') {
    quickPrompts = SHADOWING_QUICK_PROMPTS.map(p => {
      if (p.label === 'リエゾン・発音のコツ' && shadowingContext?.title) {
        return { ...p, query: `スクリプト「${shadowingContext.title}」について、音が繋がる部分（リエゾン/リンキング）や脱落の発音の注意点を詳しく解説してください。` };
      }
      return p;
    });
  } else if (mode === 'blitz') {
    quickPrompts = BLITZ_QUICK_PROMPTS.map(p => {
      if (p.label === '別の自然な言い回し・表現' && blitzContext?.currentQuestion) {
        if (blitzContext.userSpeech) {
          return {
            ...p,
            query: `お題「${blitzContext.currentQuestion.japanese}」に対して自分は「${blitzContext.userSpeech}」と答えました。模範解答「${blitzContext.currentQuestion.sampleAnswer}」と比較して、どこを直すとより自然か、別の表現も交えて教えてください。`
          };
        }
        return { ...p, query: `お題「${blitzContext.currentQuestion.japanese}」に対して、標準解答「${blitzContext.currentQuestion.sampleAnswer}」以外の別の自然な表現を教えてください。` };
      }
      if (p.label === 'なぜこの語順・文法になる？' && blitzContext?.currentQuestion) {
        return { ...p, query: `お題「${blitzContext.currentQuestion.japanese}」（英語: "${blitzContext.currentQuestion.sampleAnswer}"）の語順や文法の理由を初心者向けに解説してください。` };
      }
      return p;
    });
  } else if (situation) {
    quickPrompts = CONVERSATION_QUICK_PROMPTS.map(p => {
      if (p.label === '相手の発言のニュアンス' && lastAiText) {
        return { ...p, query: `直前の相手の発言「${lastAiText}」の日本語訳とニュアンス、言外の意図を詳しく分かりやすく解説してください。` };
      }
      if (p.label === 'ここで使える自然な返答' && lastAiText) {
        if (isWaitingForUser) {
          return { ...p, query: `相手の直前の発言「${lastAiText}」に対してまだ返答していません。ここで自然に返答できるおすすめの英語フレーズの選択肢を教えてください。` };
        }
        return { ...p, query: `直前の相手の発言「${lastAiText}」に対して、ここで自然に返答できるおすすめの英語フレーズを教えてください。` };
      }
      return p;
    });
  }
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
          {(situation || shadowingContext || blitzContext) && (
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
                    {blitzContext.currentQuestion ? `「${blitzContext.currentQuestion.japanese}」` : blitzContext.topicTitle}
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
          )}

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
