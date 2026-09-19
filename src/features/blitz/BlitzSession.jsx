import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SpeechRecognizer, speakText, stopSpeaking, isSpeechRecognitionSupported } from '../../services/speech';
import {
  Mic,
  MicOff,
  CheckCircle,
  XCircle,
  RotateCcw,
  Zap,
  Eye,
  Timer,
  Sparkles,
  Edit2,
  Check,
  Loader2,
  AlertCircle
} from 'lucide-react';
import AudioPlayButton from '../../components/common/AudioPlayButton';
import { calculateTextMatchScore } from '../../utils/textMatcher';
import { evaluateBlitzSpeech } from '../../services/gemini';

export default function BlitzSession({
  title,
  questions,
  timerSeconds = 5,
  apiKey,
  model,
  onCompleteSession,
  onExitSession
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timerSeconds);
  const [isListening, setIsListening] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speechError, setSpeechError] = useState('');
  const [userResults, setUserResults] = useState([]); // [{ questionId, question, isCorrect, userSpeech, matchScore, responseTimeSec, aiEvaluation }]
  const [startTime] = useState(() => Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(() => Date.now());

  // AI 自動発話評価用の状態
  const [enableAiEvaluation, setEnableAiEvaluation] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [aiEvaluation, setAiEvaluation] = useState(null);
  const [evaluationError, setEvaluationError] = useState(null);

  // 発話テキスト手動編集用
  const [isEditingSpeech, setIsEditingSpeech] = useState(false);
  const [editedSpeechText, setEditedSpeechText] = useState('');

  const currentQuestion = questions[currentIndex];
  const recognizerRef = useRef(null);
  const timerRef = useRef(null);

  const requestAiEvaluation = useCallback(async (speechText) => {
    const textToEvaluate = (speechText !== undefined ? speechText : `${userTranscript} ${interimTranscript}`).trim();
    if (!apiKey || !textToEvaluate) return;

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
    } catch (err) {
      console.warn('AI evaluation error:', err);
      setEvaluationError(err.message || 'AI発話評価に失敗しました');
    } finally {
      setIsEvaluating(false);
    }
  }, [apiKey, model, currentQuestion, userTranscript, interimTranscript]);

  const revealAnswer = useCallback(() => {
    if (isRevealed) return;
    if (timerRef.current) clearInterval(timerRef.current);
    if (recognizerRef.current) {
      recognizerRef.current.stop();
      setIsListening(false);
    }

    setIsRevealed(true);

    // ネイティブ模範音声の自動再生
    speakText(currentQuestion.answer, { rate: 0.95 });

    // AI評価が有効かつ発話テキストがある場合、自動評価を開始
    const fullSpeech = `${userTranscript} ${interimTranscript}`.trim();
    if (enableAiEvaluation && apiKey && fullSpeech) {
      requestAiEvaluation(fullSpeech);
    }
  }, [isRevealed, currentQuestion, userTranscript, interimTranscript, enableAiEvaluation, apiKey, requestAiEvaluation]);

  const handleTimeUp = useCallback(() => {
    if (recognizerRef.current) {
      recognizerRef.current.stop();
      setIsListening(false);
    }
    revealAnswer();
  }, [revealAnswer]);

  // 音声認識のセットアップ
  useEffect(() => {
    if (isSpeechRecognitionSupported()) {
      recognizerRef.current = new SpeechRecognizer({
        lang: 'en-US',
        onResult: ({ final, interim }) => {
          if (final) {
            setUserTranscript((prev) => (prev ? `${prev} ${final}` : final));
            setInterimTranscript('');
          } else {
            setInterimTranscript(interim);
          }
        },
        onError: (errMsg) => {
          setSpeechError(errMsg);
          setIsListening(false);
        },
        onEnd: () => {
          setIsListening(false);
        }
      });
    }

    return () => {
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }
      stopSpeaking();
    };
  }, []);

  const startSpeechForNextQuestion = () => {
    setIsRevealed(false);
    setUserTranscript('');
    setInterimTranscript('');
    setSpeechError('');
    setAiEvaluation(null);
    setIsEvaluating(false);
    setEvaluationError(null);
    setIsEditingSpeech(false);
    setEditedSpeechText('');
    setQuestionStartTime(Date.now());
    setTimeLeft(timerSeconds);
    stopSpeaking();

    if (recognizerRef.current && isSpeechRecognitionSupported()) {
      try {
        recognizerRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.warn('Auto start speech failed', e);
      }
    }
  };

  // カウントダウンタイマー処理
  useEffect(() => {
    if (isRevealed) return; // 回答表示済みならタイマー停止

    if (timerSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0.1) {
            clearInterval(timerRef.current);
            handleTimeUp();
            return 0;
          }
          return Math.max(0, +(prev - 0.1).toFixed(1));
        });
      }, 100);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, isRevealed, timerSeconds, handleTimeUp]);

  const toggleMic = () => {
    if (!recognizerRef.current) return;

    if (isListening) {
      recognizerRef.current.stop();
      setIsListening(false);
    } else {
      setSpeechError('');
      recognizerRef.current.start();
      setIsListening(true);
    }
  };

  const handleStartEditSpeech = () => {
    const fullSpeech = `${userTranscript} ${interimTranscript}`.trim();
    setEditedSpeechText(fullSpeech);
    setIsEditingSpeech(true);
  };

  const handleSaveAndReEvaluate = () => {
    const newText = editedSpeechText.trim();
    setUserTranscript(newText);
    setInterimTranscript('');
    setIsEditingSpeech(false);
    if (newText) {
      requestAiEvaluation(newText);
    }
  };

  const handleJudge = (isCorrect) => {
    stopSpeaking();

    const responseTimeSec = +((Date.now() - questionStartTime) / 1000).toFixed(1);
    const fullSpeech = `${userTranscript} ${interimTranscript}`.trim();
    const matchScore = calculateTextMatchScore(
      fullSpeech,
      currentQuestion.answer,
      currentQuestion.acceptedAnswers
    );

    const resultItem = {
      questionId: currentQuestion.id,
      question: currentQuestion,
      isCorrect,
      userSpeech: fullSpeech,
      matchScore,
      responseTimeSec,
      aiEvaluation: aiEvaluation || null
    };

    const nextResults = [...userResults, resultItem];
    setUserResults(nextResults);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      startSpeechForNextQuestion();
    } else {
      // 全問終了
      const totalTimeSec = +((Date.now() - startTime) / 1000).toFixed(1);
      onCompleteSession({
        title,
        results: nextResults,
        totalTimeSec
      });
    }
  };

  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);
  const timerPercent = timerSeconds > 0 ? (timeLeft / timerSeconds) * 100 : 100;
  const fullUserText = `${userTranscript} ${interimTranscript}`.trim();

  return (
    <div className="blitz-session-container">
      {/* 上部ヘッダー ＆ プログレス */}
      <div className="blitz-header-bar">
        <button className="btn btn-secondary btn-sm" onClick={onExitSession}>
          <RotateCcw size={16} /> 終了して戻る
        </button>
        <div className="session-title-badge">
          <Zap size={16} className="text-yellow-500" />
          <span>{title}</span>
        </div>
        <div className="blitz-header-right flex-row items-center gap-md">
          {apiKey && (
            <label className="ai-eval-toggle-label" title="回答表示時にAIが発話を自動添削・判定します">
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

        {/* ユーザー発話（リアルタイム認識結果） */}
        <div className="user-speech-box">
          <div className="mic-status-row">
            <button
              type="button"
              className={`btn-mic-toggle ${isListening ? 'listening' : ''}`}
              onClick={toggleMic}
              title={isListening ? 'マイク停止' : 'マイク開始'}
              disabled={isRevealed}
            >
              {isListening ? <Mic size={20} className="pulse-mic" /> : <MicOff size={20} />}
            </button>
            <span className="mic-label font-medium">
              {isListening ? 'マイク起動中... 英語で発話してください' : 'マイクオフ'}
            </span>

            {/* 回答開示後で発話テキストがある場合、テキスト修正ボタン */}
            {isRevealed && !isEditingSpeech && fullUserText && (
              <button
                type="button"
                className="btn-edit-speech"
                onClick={handleStartEditSpeech}
                title="認識テキストを修正して再評価"
              >
                <Edit2 size={13} /> 修正
              </button>
            )}
          </div>

          {isEditingSpeech ? (
            <div className="speech-edit-form mt-2">
              <input
                type="text"
                className="speech-edit-input"
                value={editedSpeechText}
                onChange={(e) => setEditedSpeechText(e.target.value)}
                placeholder="話した英語を入力・修正..."
                autoFocus
              />
              <div className="speech-edit-actions">
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={handleSaveAndReEvaluate}
                >
                  <Check size={14} /> 確定してAI再評価
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={() => setIsEditingSpeech(false)}
                >
                  キャンセル
                </button>
              </div>
            </div>
          ) : (
            <div className="speech-transcript-text">
              {fullUserText ? (
                <span>
                  {userTranscript}{' '}
                  <span className="interim-text">{interimTranscript}</span>
                </span>
              ) : (
                <span className="placeholder-text">
                  {isListening ? 'あなたの発話を待っています...' : '（マイクを押すか、頭の中で英文を作って「答え合わせ」を押してください）'}
                </span>
              )}
            </div>
          )}

          {speechError && <div className="speech-error-msg">{speechError}</div>}
        </div>

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
          /* 回答開示後の表示 ＆ 判定ボタン */
          <div className="answer-reveal-section animate-fade-in mt-6">
            <div className="answer-card">
              <div className="answer-header">
                <span className="answer-label">✅ 模範解答 (Target Answer)</span>
                <AudioPlayButton
                  text={currentQuestion.answer}
                  rate={0.95}
                  variant="icon"
                  className="btn btn-icon btn-secondary"
                  title="ネイティブ音声再生"
                  iconSize={18}
                />
              </div>
              <h3 className="answer-english-text">{currentQuestion.answer}</h3>

              {currentQuestion.acceptedAnswers && currentQuestion.acceptedAnswers.length > 0 && (
                <div className="accepted-answers-list mt-2">
                  <span className="text-xs text-sub font-semibold">他のOKな言い回し:</span>
                  <ul>
                    {currentQuestion.acceptedAnswers.map((alt, idx) => (
                      <li key={idx} className="text-xs text-sub">• {alt}</li>
                    ))}
                  </ul>
                </div>
              )}

              {currentQuestion.explanation && (
                <div className="explanation-box mt-3">
                  <p className="text-sm">📖 {currentQuestion.explanation}</p>
                </div>
              )}
            </div>

            {/* AI 発話評価セクション */}
            {apiKey && fullUserText && (
              <div className="blitz-ai-eval-wrapper mt-4">
                {isEvaluating ? (
                  <div className="ai-eval-loading-card animate-fade-in">
                    <Loader2 size={18} className="animate-spin text-primary" />
                    <span>Gemini AI があなたの発話を分析・添削中...</span>
                  </div>
                ) : aiEvaluation ? (
                  <div className={`ai-eval-result-card animate-fade-in status-${aiEvaluation.status.toLowerCase()}`}>
                    <div className="ai-eval-header">
                      <div className="ai-eval-title">
                        <Sparkles size={16} className="text-indigo-600" />
                        <span>AI 発話判定</span>
                        <span className={`ai-status-badge badge-${aiEvaluation.status.toLowerCase()}`}>
                          {aiEvaluation.statusLabelJa}
                        </span>
                      </div>
                      <div className="ai-eval-score font-mono">
                        {aiEvaluation.score}<span className="score-unit-sm">点</span>
                      </div>
                    </div>

                    {aiEvaluation.evaluationJa && (
                      <p className="ai-eval-comment mt-2">
                        {aiEvaluation.evaluationJa}
                      </p>
                    )}

                    {aiEvaluation.improvedSpeech && (
                      <div className="ai-improved-speech mt-2">
                        <span className="improved-label">✍️ おすすめの自然な表現・添削:</span>
                        <div className="improved-text font-mono">"{aiEvaluation.improvedSpeech}"</div>
                      </div>
                    )}

                    {aiEvaluation.grammarAdviceJa && (
                      <div className="ai-grammar-advice mt-2 text-xs text-sub">
                        <span>📌 {aiEvaluation.grammarAdviceJa}</span>
                      </div>
                    )}
                  </div>
                ) : evaluationError ? (
                  <div className="ai-eval-error-card mt-2">
                    <AlertCircle size={14} />
                    <span>{evaluationError}</span>
                    <button
                      type="button"
                      className="btn btn-xs btn-secondary ml-2"
                      onClick={() => requestAiEvaluation(fullUserText)}
                    >
                      再試行
                    </button>
                  </div>
                ) : (
                  <div className="ai-eval-manual-trigger mt-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => requestAiEvaluation(fullUserText)}
                    >
                      <Sparkles size={14} /> AI にこの発話を添削・判定してもらう
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 判定ボタン (言えた / 言えなかった) */}
            <div className="judgment-box mt-6">
              <div className="judgment-title">
                言えましたか？
                {aiEvaluation && (
                  <span className="judgment-ai-hint text-xs ml-2">
                    (AI判定: {aiEvaluation.isCorrect ? '合格 👍' : '要復習 ⚠️'})
                  </span>
                )}
              </div>
              <div className="judgment-buttons-row">
                <button
                  className={`btn btn-danger btn-lg flex-1 ${aiEvaluation && !aiEvaluation.isCorrect ? 'ai-recommended' : ''}`}
                  onClick={() => handleJudge(false)}
                >
                  <XCircle size={22} /> 言えなかった... (復習)
                  {aiEvaluation && !aiEvaluation.isCorrect && <span className="ai-chip ml-1">AI判定</span>}
                </button>

                <button
                  className={`btn btn-success btn-lg flex-1 ${aiEvaluation && aiEvaluation.isCorrect ? 'ai-recommended' : ''}`}
                  onClick={() => handleJudge(true)}
                >
                  <CheckCircle size={22} /> 言えた！ (次へ)
                  {aiEvaluation && aiEvaluation.isCorrect && <span className="ai-chip ml-1">AI判定</span>}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
