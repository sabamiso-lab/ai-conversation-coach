import React from 'react';
import { ArrowLeft, Zap, Eye, Timer, Sparkles } from 'lucide-react';
import { BlitzQuestion, CoachBlitzContext, BlitzSessionSummaryData, BlitzResult } from '../../types';
import { useBlitzSession } from './useBlitzSession';
import BlitzEvaluationPanel from './BlitzEvaluationPanel';
import BlitzSpeechBox from './BlitzSpeechBox';
import BlitzAnswerPanel from './BlitzAnswerPanel';

export interface BlitzSessionProps {
  title: string;
  questions: BlitzQuestion[];
  timerSeconds?: number;
  apiKey?: string;
  model?: string;
  onCompleteSession: (data: BlitzSessionSummaryData & { results: BlitzResult[] }) => void;
  onExitSession: () => void;
  onContextChange?: (context: CoachBlitzContext) => void;
}

export default function BlitzSession({
  title,
  questions = [],
  timerSeconds = 5,
  apiKey,
  model,
  onCompleteSession,
  onExitSession,
  onContextChange
}: BlitzSessionProps) {
  const {
    currentIndex,
    currentQuestion,
    isRevealed,
    timeLeft,
    timerPercent,
    isListening,
    userTranscript,
    interimTranscript,
    fullUserText,
    speechError,
    isEvaluating,
    aiEvaluation,
    evaluationError,
    enableAiEvaluation,
    setEnableAiEvaluation,
    revealAnswer,
    toggleMic,
    handleSaveEditedSpeech,
    handleClearSpeech,
    handleJudge
  } = useBlitzSession({
    title,
    questions,
    timerSeconds,
    apiKey,
    model,
    onCompleteSession,
    onContextChange
  });

  if (!questions || questions.length === 0 || !currentQuestion) {
    return (
      <div className="blitz-session-container animate-fade-in" style={{ textAlign: 'center', padding: '40px 20px' }}>
        <p style={{ color: '#64748B', marginBottom: '16px' }}>出題データがありません。</p>
        <button type="button" className="btn btn-primary" onClick={onExitSession}>
          お題一覧へ戻る
        </button>
      </div>
    );
  }

  const progressPercent = questions.length > 0 ? Math.round(((currentIndex + 1) / questions.length) * 100) : 0;

  return (
    <div className="blitz-session-container animate-fade-in">
      {/* 上部ヘッダー */}
      <div className="blitz-header-bar session-header-row">
        <button
          type="button"
          className="btn btn-ghost btn-exit-session"
          onClick={onExitSession}
          style={{ paddingLeft: 0 }}
          title="お題一覧に戻る"
        >
          <ArrowLeft size={18} /> お題一覧に戻る
        </button>
        <div className="session-title-badge">
          <Zap size={15} /> {title}
        </div>
        <div className="session-controls-group">
          {apiKey && (
            <label className="ai-eval-toggle-label" title="回答表示時にGemini AIが自動で発話を判定します">
              <Sparkles size={14} className={enableAiEvaluation ? "text-primary" : "text-muted"} />
              <span className="text-xs font-semibold">AI自動判定</span>
              <input
                type="checkbox"
                checked={enableAiEvaluation}
                onChange={(e) => setEnableAiEvaluation(e.target.checked)}
                className="ai-eval-checkbox"
              />
            </label>
          )}
          <div className="session-counter font-mono font-bold">
            {currentIndex + 1} / {questions.length}
          </div>
        </div>
      </div>

      <div className="progress-bar-bg">
        <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
      </div>

      {/* メイン問題カード */}
      <div className="blitz-card">
        {/* タイマーバー */}
        {timerSeconds > 0 && !isRevealed && (
          <div className="timer-bar-wrapper">
            <div
              className={`timer-bar-fill ${timeLeft <= 1.5 ? 'urgent' : ''}`}
              style={{ width: `${timerPercent}%` }}
            />
            <div className="timer-text font-mono">
              <Timer size={14} /> {timeLeft.toFixed(1)}s
            </div>
          </div>
        )}

        {/* 出題（日本語プロンプト） */}
        <div className="prompt-section">
          <div className="prompt-label">日本語を出答 ➔ 瞬時に英語で発話！</div>
          <h2 className="prompt-japanese">{currentQuestion.prompt}</h2>
          {currentQuestion.grammarPoint && (
            <span className="grammar-tag">💡 {currentQuestion.grammarPoint}</span>
          )}
        </div>

        {/* ユーザー発話（リアルタイム認識結果＆編集） */}
        <BlitzSpeechBox
          isListening={isListening}
          isRevealed={isRevealed}
          userTranscript={userTranscript}
          interimTranscript={interimTranscript}
          speechError={speechError}
          onToggleMic={toggleMic}
          onSaveEditedSpeech={handleSaveEditedSpeech}
          onClearSpeech={handleClearSpeech}
        />

        {/* 回答開示前の操作ボタン */}
        {!isRevealed ? (
          <div className="blitz-actions-row mt-6">
            <button
              type="button"
              className="btn btn-primary btn-lg btn-reveal"
              onClick={revealAnswer}
              disabled={isRevealed}
            >
              <Eye size={20} /> 答え合わせ・模範解答を見る
            </button>
          </div>
        ) : (
          /* 回答開示後の表示 ＆ AI評価 ＆ 判定ボタン */
          <>
            <BlitzAnswerPanel
              question={currentQuestion}
              aiEvaluation={aiEvaluation}
              onJudge={handleJudge}
            />

            <BlitzEvaluationPanel
              apiKey={apiKey}
              fullUserText={fullUserText}
              isEvaluating={isEvaluating}
              aiEvaluation={aiEvaluation}
              evaluationError={evaluationError}
              onRequestEvaluation={handleSaveEditedSpeech}
            />
          </>
        )}
      </div>
    </div>
  );
}
