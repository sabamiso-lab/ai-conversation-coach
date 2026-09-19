import React, { useState, useEffect, useRef } from 'react';
import { SpeechRecognizer, speakText, stopSpeaking, isSpeechRecognitionSupported } from '../../services/speech';
import { Mic, MicOff, Volume2, CheckCircle, XCircle, ArrowRight, RotateCcw, Zap, HelpCircle, Eye, Timer } from 'lucide-react';

/**
 * テキスト一致率（単語レベルの簡易類似度 %）を計算
 */
function calculateTextMatchScore(userText, targetAnswer, acceptedAnswers = []) {
  if (!userText) return 0;
  
  const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  const userNorm = normalize(userText);
  if (!userNorm) return 0;

  const targets = [targetAnswer, ...acceptedAnswers].map(normalize);

  let maxScore = 0;

  for (const target of targets) {
    if (userNorm === target) return 100;

    const targetWords = target.split(/\s+/);
    const userWords = userNorm.split(/\s+/);

    if (targetWords.length === 0) continue;

    let matchedCount = 0;
    const targetWordsCopy = [...targetWords];

    for (const uWord of userWords) {
      const foundIdx = targetWordsCopy.indexOf(uWord);
      if (foundIdx !== -1) {
        matchedCount++;
        targetWordsCopy.splice(foundIdx, 1);
      }
    }

    const score = Math.round((matchedCount / targetWords.length) * 100);
    if (score > maxScore) {
      maxScore = score;
    }
  }

  return Math.min(100, maxScore);
}

export default function BlitzSession({
  title,
  questions,
  timerSeconds = 5,
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
  const [userResults, setUserResults] = useState([]); // [{ questionId, question, isCorrect, userSpeech, matchScore, responseTimeSec }]
  const [startTime, setStartTime] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  const currentQuestion = questions[currentIndex];
  const recognizerRef = useRef(null);
  const timerRef = useRef(null);

  // カウントダウンタイマー処理
  useEffect(() => {
    if (isRevealed) return; // 回答表示済みならタイマー停止

    setQuestionStartTime(Date.now());
    setTimeLeft(timerSeconds);

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
  }, [currentIndex, isRevealed, timerSeconds]);

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

  // 新しい質問に移る際の状態クリア ＆ 音声認識スタート（オプション）
  useEffect(() => {
    setIsRevealed(false);
    setUserTranscript('');
    setInterimTranscript('');
    setSpeechError('');
    stopSpeaking();

    // 制限時間なし、またはタイマーがある場合でも自動で音声認識を開始
    if (recognizerRef.current && isSpeechRecognitionSupported()) {
      try {
        recognizerRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.warn('Auto start speech failed', e);
      }
    }
  }, [currentIndex]);

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

  const handleTimeUp = () => {
    if (recognizerRef.current) {
      recognizerRef.current.stop();
      setIsListening(false);
    }
    revealAnswer();
  };

  const revealAnswer = () => {
    if (isRevealed) return;
    if (timerRef.current) clearInterval(timerRef.current);
    if (recognizerRef.current) {
      recognizerRef.current.stop();
      setIsListening(false);
    }

    setIsRevealed(true);

    // ネイティブ模範音声の自動再生
    speakText(currentQuestion.answer, { rate: 0.95 });
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
      responseTimeSec
    };

    const nextResults = [...userResults, resultItem];
    setUserResults(nextResults);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
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

  const handlePlaySpeech = () => {
    speakText(currentQuestion.answer, { rate: 0.95 });
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
        <div className="session-counter font-mono font-bold">
          {currentIndex + 1} / {questions.length}
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
            >
              {isListening ? <Mic size={20} className="pulse-mic" /> : <MicOff size={20} />}
            </button>
            <span className="mic-label font-medium">
              {isListening ? 'マイク起動中... 英語で発話してください' : 'マイクオフ (クリックして発話)'}
            </span>
          </div>

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
                <button
                  className="btn btn-icon btn-secondary"
                  onClick={handlePlaySpeech}
                  title="ネイティブ音声再生"
                >
                  <Volume2 size={18} />
                </button>
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

            {/* 判定ボタン (言えた / 言えなかった) */}
            <div className="judgment-box mt-6">
              <div className="judgment-title">言えましたか？</div>
              <div className="judgment-buttons-row">
                <button
                  className="btn btn-danger btn-lg flex-1"
                  onClick={() => handleJudge(false)}
                >
                  <XCircle size={22} /> 言えなかった... (復習)
                </button>

                <button
                  className="btn btn-success btn-lg flex-1"
                  onClick={() => handleJudge(true)}
                >
                  <CheckCircle size={22} /> 言えた！ (次へ)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
