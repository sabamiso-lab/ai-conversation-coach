import { useState, useEffect, useCallback, useRef } from 'react';
import { speakText, stopSpeaking } from '../../services/speech';
import { calculateTextMatchScore } from '../../utils/textMatcher';
import { evaluateBlitzSpeech, BlitzSpeechEvaluationResult } from '../../services/ai/blitz';
import { BlitzQuestion, BlitzResult, CoachBlitzContext } from '../../types';
import { useBlitzTimer } from './useBlitzTimer';
import { useBlitzSpeech } from './useBlitzSpeech';

export interface UseBlitzSessionOptions {
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
  onContextChange?: (context: CoachBlitzContext) => void;
}

export function useBlitzSession({
  title,
  questions = [],
  timerSeconds = 5,
  apiKey,
  model,
  onCompleteSession,
  onContextChange
}: UseBlitzSessionOptions) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const isRevealedRef = useRef(false);
  const [userResults, setUserResults] = useState<BlitzResult[]>([]);
  const [startTime] = useState(() => Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(() => Date.now());

  // Speech recognition custom hook
  const {
    isListening,
    userTranscript,
    setUserTranscript,
    interimTranscript,
    setInterimTranscript,
    fullUserText,
    speechError,
    startListening,
    stopListening,
    abortListening: rawAbortListening,
    toggleListening: toggleMic,
    resetSpeech,
    clearSpeech
  } = useBlitzSpeech();
  const abortListening = rawAbortListening || stopListening;

  // AI 自動発話評価用の状態
  const [enableAiEvaluation, setEnableAiEvaluation] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [aiEvaluation, setAiEvaluation] = useState<BlitzSpeechEvaluationResult | null>(null);
  const [evaluationError, setEvaluationError] = useState<string | null>(null);
  const evalRequestIdRef = useRef(0);

  // 初回マウント時にお題開始と同時に音声認識を自動開始
  useEffect(() => {
    startListening();
    return () => {
      stopListening();
      stopSpeaking();
    };
  }, [startListening, stopListening]);

  const handleClearSpeech = useCallback(() => {
    evalRequestIdRef.current++;
    clearSpeech();
    if (isRevealed) {
      setAiEvaluation(null);
      setEvaluationError(null);
      setIsEvaluating(false);
    }
  }, [clearSpeech, isRevealed]);

  const currentQuestion = questions[currentIndex];

  // AI 発話評価リクエスト
  const requestAiEvaluation = useCallback(async (speechText?: string) => {
    const textToEvaluate = (speechText !== undefined ? speechText : fullUserText).trim();
    if (!apiKey || !textToEvaluate || !currentQuestion) return;

    const currentReqId = ++evalRequestIdRef.current;
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
      if (evalRequestIdRef.current === currentReqId) {
        setAiEvaluation(result);
      }
    } catch (err: unknown) {
      if (evalRequestIdRef.current === currentReqId) {
        console.warn('AI evaluation error:', err);
        const msg = err instanceof Error ? err.message : 'AI発話評価に失敗しました';
        setEvaluationError(msg);
      }
    } finally {
      if (evalRequestIdRef.current === currentReqId) {
        setIsEvaluating(false);
      }
    }
  }, [apiKey, model, currentQuestion, fullUserText]);

  // 回答開示
  const revealAnswer = useCallback(() => {
    if (isRevealedRef.current || isRevealed) return;
    isRevealedRef.current = true;
    setIsRevealed(true);

    // 音声認識を直ちに即時中断（スピーカーからの模範音声がマイクに拾われて二重入力されるのを防ぐ）
    abortListening();

    // ネイティブ模範音声の自動再生
    if (currentQuestion?.answer) {
      speakText(currentQuestion.answer, { rate: 0.95 });
    }

    // AI評価が有効かつ発話テキストがある場合、自動評価を開始
    if (enableAiEvaluation && apiKey && fullUserText) {
      requestAiEvaluation(fullUserText);
    }
  }, [isRevealed, abortListening, currentQuestion, enableAiEvaluation, apiKey, fullUserText, requestAiEvaluation]);

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
          prompt: currentQuestion.prompt,
          answer: currentQuestion.answer,
          japanese: currentQuestion.prompt,
          sampleAnswer: currentQuestion.answer,
          keyPoints: currentQuestion.grammarPoint ? [currentQuestion.grammarPoint] : []
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

  const nextQuestionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (nextQuestionTimeoutRef.current) {
        clearTimeout(nextQuestionTimeoutRef.current);
      }
    };
  }, []);

  const startSpeechForNextQuestion = () => {
    isRevealedRef.current = false;
    setIsRevealed(false);
    abortListening();
    resetSpeech();
    setAiEvaluation(null);
    setIsEvaluating(false);
    setEvaluationError(null);
    setQuestionStartTime(Date.now());
    resetTimer(timerSeconds);
    stopSpeaking();

    if (nextQuestionTimeoutRef.current) {
      clearTimeout(nextQuestionTimeoutRef.current);
    }
    // Give browser speech recognition engine a brief tick to cleanly initialize new session
    nextQuestionTimeoutRef.current = setTimeout(() => {
      startListening();
    }, 50);
  };

  const handleSaveEditedSpeech = (newText?: string) => {
    const textToUse = newText !== undefined ? newText : fullUserText;
    setInterimTranscript('');
    setUserTranscript(textToUse);
    if (textToUse) {
      requestAiEvaluation(textToUse);
    }
  };

  const handleJudge = (isCorrect: boolean) => {
    stopSpeaking();

    const responseTimeSec = +((Date.now() - questionStartTime) / 1000).toFixed(1);
    const matchScore = calculateTextMatchScore(
      fullUserText,
      currentQuestion?.answer || '',
      currentQuestion?.acceptedAnswers
    );

    const resultItem: BlitzResult = {
      questionId: currentQuestion?.id,
      question: currentQuestion!,
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

  return {
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
  };
}
