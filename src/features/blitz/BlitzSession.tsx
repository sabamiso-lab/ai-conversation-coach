import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Zap, Eye, Timer, Sparkles } from 'lucide-react';
import { speakText, stopSpeaking } from '../../services/speech';
import { calculateTextMatchScore } from '../../utils/textMatcher';
import { evaluateBlitzSpeech, BlitzSpeechEvaluationResult } from '../../services/ai/blitz';
import { BlitzQuestion, BlitzResult, CoachBlitzContext } from '../../types';
import { useBlitzTimer } from './useBlitzTimer';
import { useBlitzSpeech } from './useBlitzSpeech';
import BlitzEvaluationPanel from './BlitzEvaluationPanel';
import BlitzSpeechBox from './BlitzSpeechBox';
import BlitzAnswerPanel from './BlitzAnswerPanel';

export interface BlitzSessionProps {
  title: string;
  questions: BlitzQuestion[];
  timerSeconds?: number;
  apiKey?: string;
  model?: string;
  onCompleteSession: (data: {
    title: string;
    totalQuestions: number;
    correctCount: number;
    results: BlitzResult[];
    totalDurationSec: number;
    totalTimeSec?: number;
    avgResponseTimeSec: number;
  }) => void;
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [userResults, setUserResults] = useState<BlitzResult[]>([]);
  const [startTime] = useState(() => Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(() => Date.now());

  // Speech recognition custom hook
  const {
    isListening,
    userTranscript,
    setUserTranscript,
    interimTranscript,
    fullUserText,
    speechError,
    startListening,
    stopListening,
    toggleListening: toggleMic,
    resetSpeech
  } = useBlitzSpeech();

  // AI 自動発話評価用の状態
  const [enableAiEvaluation, setEnableAiEvaluation] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [aiEvaluation, setAiEvaluation] = useState<BlitzSpeechEvaluationResult | null>(null);
  const [evaluationError, setEvaluationError] = useState<string | null>(null);

  const currentQuestion = questions[currentIndex];

  // AI 発話評価リクエスト
  const requestAiEvaluation = useCallback(async (speechText?: string) => {
    const textToEvaluate = (speechText !== undefined ? speechText : fullUserText).trim();
    if (!apiKey || !textToEvaluate || !currentQuestion) return;

    setIsEvaluating(true);
    setEvaluationError(null);
    try {
      const result = await evaluateBlitzSpeech({
        apiKey,
        model,
        prompt: currentQuestion.prompt,
        standardAnswer: currentQuestion.answer,
        acceptedAnswers: currentQuestion.acceptedAnswers,
        grammarPoint: currentQuestion.grammarPoint,
        userSpeech: textToEvaluate
      });
      setAiEvaluation(result);
    } catch (err: unknown) {
      console.warn('AI evaluation error:', err);
      const msg = err instanceof Error ? err.message : 'AI発話評価に失敗しました';
      setEvaluationError(msg);
    } finally {
      setIsEvaluating(false);
    }
  }, [apiKey, model, currentQuestion, fullUserText]);

  // 回答開示
  const revealAnswer = useCallback(() => {
    if (isRevealed) return;
    stopListening();
    setIsRevealed(true);

    // ネイティブ模範音声の自動再生
    if (currentQuestion?.answer) {
      speakText(currentQuestion.answer, { rate: 0.95 });
    }

    // AI評価が有効かつ発話テキストがある場合、自動評価を開始
    if (enableAiEvaluation && apiKey && fullUserText) {
      requestAiEvaluation(fullUserText);
    }
  }, [isRevealed, stopListening, currentQuestion, enableAiEvaluation, apiKey, fullUserText, requestAiEvaluation]);

  // タイマーカスタムフック
  const { timeLeft, progressPercent: timerPercent, resetTimer } = useBlitzTimer({
    timerSeconds,
    isPaused: isRevealed,
    onTimeUp: revealAnswer
  });

  // 親コンポーネント（AIコーチ）へ現在のリアルタイム状況を通知
  useEffect(() => {
    if (onContextChange && currentQuestion) {
      onContextChange({
        topicTitle: title,
        currentIndex,
        totalQuestions: questions.length,
        currentQuestion: {
          id: currentQuestion.id,
          japanese: currentQuestion.prompt || currentQuestion.japanese,
          sampleAnswer: currentQuestion.answer || currentQuestion.sampleAnswer,
          keyPoints: currentQuestion.grammarPoint ? [currentQuestion.grammarPoint] : (currentQuestion.keyPoints || [])
        },
        userSpeech: fullUserText,
        hasAnswered: Boolean(fullUserText),
        isRevealed,
        isCorrect: aiEvaluation ? aiEvaluation.isCorrect : null,
        aiEvaluation: aiEvaluation ? {
          isCorrect: aiEvaluation.isCorrect,
          feedbackJa: aiEvaluation.evaluationJa,
          improvedAnswer: aiEvaluation.improvedSpeech
        } : null,
        allQuestions: questions
      });
    }
  }, [onContextChange, title, currentIndex, questions, currentQuestion, fullUserText, isRevealed, aiEvaluation]);

  const startSpeechForNextQuestion = () => {
    setIsRevealed(false);
    resetSpeech();
    setAiEvaluation(null);
    setIsEvaluating(false);
    setEvaluationError(null);
    setQuestionStartTime(Date.now());
    resetTimer(timerSeconds);
    stopSpeaking();
    startListening();
  };

  const handleSaveEditedSpeech = (newText: string) => {
    setUserTranscript(newText);
    if (newText) {
      requestAiEvaluation(newText);
    }
  };

  const handleJudge = (isCorrect: boolean) => {
    stopSpeaking();

    const responseTimeSec = +((Date.now() - questionStartTime) / 1000).toFixed(1);
    const matchScore = calculateTextMatchScore(
      fullUserText,
      currentQuestion.answer,
      currentQuestion.acceptedAnswers
    );

    const resultItem: BlitzResult = {
      questionId: currentQuestion.id,
      question: currentQuestion,
      isCorrect,
      userSpeech: fullUserText,
      matchScore,
      responseTimeSec,
      aiEvaluation: aiEvaluation ? {
        ...aiEvaluation,
        score: aiEvaluation.score,
        status: aiEvaluation.status,
        statusLabelJa: aiEvaluation.statusLabelJa,
        evaluationJa: aiEvaluation.evaluationJa,
        improvedSpeech: aiEvaluation.improvedSpeech,
        feedbackJa: aiEvaluation.evaluationJa,
        improvedAnswer: aiEvaluation.improvedSpeech
      } : null
    };

    const nextResults = [...userResults, resultItem];
    setUserResults(nextResults);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      startSpeechForNextQuestion();
    } else {
      const totalDurationSec = Math.round((Date.now() - startTime) / 1000);
      const correctCount = nextResults.filter((r) => r.isCorrect).length;
      const totalResponseTime = nextResults.reduce((acc, cur) => acc + (cur.responseTimeSec ?? 0), 0);
      const avgResponseTimeSec = +(totalResponseTime / nextResults.length).toFixed(1);

      onCompleteSession({
        title,
        totalQuestions: questions.length,
        correctCount,
        results: nextResults,
        totalDurationSec,
        totalTimeSec: totalDurationSec,
        avgResponseTimeSec
      });
    }
  };

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
        />

        {/* 回答開示前の操作ボタン */}
        {!isRevealed ? (
          <div className="blitz-actions-row mt-6">
            <button
              className="btn btn-primary btn-lg btn-reveal"
              onClick={revealAnswer}
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
              onRequestEvaluation={requestAiEvaluation}
            />
          </>
        )}
      </div>
    </div>
  );
}
