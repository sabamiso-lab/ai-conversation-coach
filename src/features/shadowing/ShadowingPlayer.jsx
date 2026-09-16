import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Square, Volume2, Mic, MicOff, RotateCcw, 
  ArrowLeft, Sparkles, Check, AlertCircle, Eye, EyeOff, 
  Gauge, Repeat, Award, Lightbulb, Loader2 
} from 'lucide-react';
import { speakText, stopSpeaking, SpeechRecognizer, isSpeechRecognitionSupported } from '../../services/speech';
import { evaluateShadowingPerformance } from '../../services/gemini';

export default function ShadowingPlayer({ script, onBack, apiKey, model, onOpenApiKeyModal }) {
  // Speech Playback Settings
  const [playbackSpeed, setPlaybackSpeed] = useState(0.85); // Default slightly easy
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);

  // View Options
  const [viewMode, setViewMode] = useState('slash'); // 'full' | 'slash' | 'blank'
  const [showTranslation, setShowTranslation] = useState(true);

  // Recording & Evaluation States
  const [isRecording, setIsRecording] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Evaluation Result State
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState(null);

  const recognizerRef = useRef(null);

  // Initialize Speech Recognizer
  useEffect(() => {
    if (isSpeechRecognitionSupported()) {
      recognizerRef.current = new SpeechRecognizer({
        onResult: ({ final, interim }) => {
          if (final) {
            setUserTranscript(final);
          } else if (interim) {
            setUserTranscript(interim);
          }
        },
        onError: (err) => {
          console.warn("Speech Rec Error:", err);
          setErrorMsg(err);
          setIsRecording(false);
        },
        onEnd: () => {
          setIsRecording(false);
        }
      });
    }

    return () => {
      stopSpeaking();
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }
    };
  }, []);

  // Handle Speech Playback
  const handlePlayAudio = () => {
    if (isPlaying) {
      stopSpeaking();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    speakText(script.text, {
      lang: 'en-US',
      rate: playbackSpeed,
      onEnd: () => {
        setIsPlaying(false);
        if (isLooping) {
          setTimeout(() => handlePlayAudio(), 500);
        }
      }
    });
  };

  // Handle Recording Toggle
  const toggleRecording = () => {
    if (!recognizerRef.current) {
      setErrorMsg("お使いのブラウザは音声認識(Web Speech API)に対応していません。");
      return;
    }

    if (isRecording) {
      recognizerRef.current.stop();
      setIsRecording(false);
    } else {
      setErrorMsg('');
      setUserTranscript('');
      setEvalResult(null);
      setIsRecording(true);
      
      // Auto play audio if not playing when user starts recording
      if (!isPlaying) {
        handlePlayAudio();
      }
      
      recognizerRef.current.start();
    }
  };

  // Handle Evaluation via Gemini API
  const handleEvaluate = async () => {
    if (!userTranscript.trim()) return;
    if (!apiKey) {
      if (onOpenApiKeyModal) onOpenApiKeyModal();
      return;
    }

    setIsEvaluating(true);
    setErrorMsg('');

    try {
      const res = await evaluateShadowingPerformance({
        apiKey,
        model,
        originalText: script.text,
        userSpeechText: userTranscript
      });
      setEvalResult(res);
    } catch (err) {
      console.error("Evaluation error:", err);
      setErrorMsg(err.message || "評価の生成に失敗しました。");
    } finally {
      setIsEvaluating(false);
    }
  };

  // Simple Word-level Diff Matcher
  const renderWordDiff = () => {
    if (!userTranscript) return null;

    const clean = (str) => str.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
    const origWords = clean(script.text);
    const userWords = clean(userTranscript);

    const userWordSet = new Set(userWords);
    const wordsInScript = script.text.split(/(\s+)/);

    let matchCount = 0;
    const diffElements = wordsInScript.map((segment, idx) => {
      const cleaned = segment.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!cleaned) return <span key={idx}>{segment}</span>;

      const isMatched = userWordSet.has(cleaned);
      if (isMatched) matchCount++;

      return (
        <span
          key={idx}
          style={{
            background: isMatched ? '#DCFCE7' : '#FFE4E6',
            color: isMatched ? '#15803D' : '#BE123C',
            padding: '2px 4px',
            borderRadius: '4px',
            fontWeight: 700,
            transition: 'all 0.2s ease'
          }}
        >
          {segment}
        </span>
      );
    });

    const matchScore = origWords.length > 0 ? Math.round((matchCount / origWords.length) * 100) : 0;

    return {
      elements: diffElements,
      score: Math.min(matchScore, 100)
    };
  };

  const wordDiff = renderWordDiff();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '860px', margin: '0 auto', width: '100%', animation: 'fadeIn 0.3s ease-out' }}>
      {/* Top Header Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button className="btn btn-ghost" onClick={onBack} style={{ paddingLeft: 0 }}>
          <ArrowLeft size={18} /> 教材一覧に戻る
        </button>

        <span className="badge badge-purple" style={{ fontSize: '0.85rem' }}>
          {script.difficultyLabel || script.difficulty}
        </span>
      </div>

      {errorMsg && (
        <div style={{ background: '#FFE4E6', border: '1px solid #FECDD3', color: '#E11D48', padding: '12px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
          <AlertCircle size={18} />
          {errorMsg}
        </div>
      )}

      {/* Main Practice Card */}
      <div className="chat-container" style={{ display: 'block', padding: '28px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
            {script.title}
          </h2>
          <div style={{ fontSize: '0.9rem', color: '#64748B', fontWeight: 600 }}>
            {script.titleJa}
          </div>
        </div>

        {/* Player Controls Bar */}
        <div 
          style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '24px'
          }}
        >
          {/* Play/Stop Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              className={`btn ${isPlaying ? 'btn-accent' : 'btn-primary'}`}
              onClick={handlePlayAudio}
              style={{ padding: '10px 20px', borderRadius: '9999px', fontSize: '0.95rem' }}
            >
              {isPlaying ? <><Square size={18} /> 音声停止</> : <><Play size={18} /> お手本再生</>}
            </button>

            <button
              className={`btn ${isLooping ? 'btn-secondary' : 'btn-ghost'}`}
              onClick={() => setIsLooping(!isLooping)}
              style={{
                color: isLooping ? '#4F46E5' : '#64748B',
                borderColor: isLooping ? '#818CF8' : 'transparent',
                fontWeight: 600
              }}
              title="リピート再生モード"
            >
              <Repeat size={16} /> リピート {isLooping ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Speed Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Gauge size={15} /> 再生速度:
            </span>
            {[0.7, 0.85, 1.0, 1.2].map(speed => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                style={{
                  background: playbackSpeed === speed ? '#4F46E5' : '#FFFFFF',
                  color: playbackSpeed === speed ? '#FFFFFF' : '#475569',
                  border: '1px solid',
                  borderColor: playbackSpeed === speed ? '#4F46E5' : '#CBD5E1',
                  borderRadius: '8px',
                  padding: '4px 10px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {speed === 1.0 ? '1.0x (標準)' : `${speed}x`}
              </button>
            ))}
          </div>
        </div>

        {/* Display Mode Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              className={`btn ${viewMode === 'slash' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('slash')}
              style={{ fontSize: '0.82rem', padding: '6px 14px', borderRadius: '8px' }}
            >
              / スラッシュ区切り
            </button>
            <button
              className={`btn ${viewMode === 'full' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('full')}
              style={{ fontSize: '0.82rem', padding: '6px 14px', borderRadius: '8px' }}
            >
              標準テキスト
            </button>
            <button
              className={`btn ${viewMode === 'blank' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('blank')}
              style={{ fontSize: '0.82rem', padding: '6px 14px', borderRadius: '8px' }}
            >
              🙈 穴埋めブラインド
            </button>
          </div>

          <button
            className="btn btn-ghost"
            onClick={() => setShowTranslation(!showTranslation)}
            style={{ fontSize: '0.82rem', color: '#64748B' }}
          >
            {showTranslation ? <><EyeOff size={15} /> 日本語訳を隠す</> : <><Eye size={15} /> 日本語訳を表示</>}
          </button>
        </div>

        {/* Script Content Card */}
        <div 
          style={{
            background: '#F1F5F9',
            borderRadius: '16px',
            padding: '24px',
            lineHeight: 1.8,
            fontSize: '1.15rem',
            fontWeight: 600,
            color: '#0F172A',
            letterSpacing: '0.01em',
            marginBottom: '16px'
          }}
        >
          {viewMode === 'slash' ? (
            script.slashedText || script.text
          ) : viewMode === 'blank' ? (
            script.text.split(' ').map((word, i) => (
              i % 3 === 1 ? ' ____ ' : `${word} `
            ))
          ) : (
            script.text
          )}
        </div>

        {/* Japanese Translation Box */}
        {showTranslation && script.translation && (
          <div style={{ background: '#EEF2FF', padding: '14px 18px', borderRadius: '12px', color: '#3730A3', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '24px' }}>
            <strong>日本語訳:</strong> {script.translation}
          </div>
        )}

        {/* Practice Tip */}
        {script.tipsJa && (
          <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', color: '#92400E', padding: '12px 16px', borderRadius: '12px', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <Lightbulb size={18} color="#D97706" style={{ flexShrink: 0 }} />
            <div><strong>発声のコツ:</strong> {script.tipsJa}</div>
          </div>
        )}

        {/* Shadowing Mic Recording Section */}
        <div 
          style={{
            borderTop: '2px dashed #E2E8F0',
            paddingTop: '24px',
            marginTop: '12px'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
              🎙️ シャドーイングを録音 ＆ 発音チェック
            </div>
            <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0 }}>
              マイクボタンを押すとお手本音声が流れます。すぐ追っかけて発声してみましょう！
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <button
              className={`mic-btn ${isRecording ? 'recording' : ''}`}
              onClick={toggleRecording}
              style={{ width: '64px', height: '64px' }}
              title={isRecording ? "録音停止" : "シャドーイング録音開始"}
            >
              {isRecording ? <MicOff size={28} /> : <Mic size={28} />}
            </button>
          </div>

          {/* User Transcript & Real-time Diff */}
          {userTranscript && (
            <div style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569' }}>
                  あなたの発声文字起こし (Recognition)
                </div>
                {wordDiff && (
                  <span className="badge badge-purple" style={{ fontSize: '0.82rem' }}>
                    単語一致率: {wordDiff.score}%
                  </span>
                )}
              </div>

              <div style={{ fontSize: '1rem', lineHeight: 1.7, marginBottom: '16px', color: '#1E293B' }}>
                "{userTranscript}"
              </div>

              {/* Diff view */}
              {wordDiff && (
                <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '10px', fontSize: '0.95rem', lineHeight: 1.8 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', marginBottom: '6px' }}>
                    原文との一致判定（緑＝認識完了 / 赤＝聞き取れず・抜け）:
                  </div>
                  {wordDiff.elements}
                </div>
              )}

              {/* Gemini AI Detailed Coach Evaluation */}
              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-primary"
                  onClick={handleEvaluate}
                  disabled={isEvaluating}
                  style={{ borderRadius: '10px' }}
                >
                  {isEvaluating ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> AIコーチが評価中...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} /> Gemini AI に詳細診断してもらう
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Evaluation Result Feedback Card */}
          {evalResult && (
            <div style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #EEF2FF 100%)', border: '1px solid #C7D2FE', borderRadius: '16px', padding: '24px', animation: 'fadeIn 0.3s ease-out' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#3730A3', fontSize: '1.05rem' }}>
                  <Award size={22} color="#4F46E5" /> AI Coach 発音・シャドーイング評価
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#4F46E5' }}>
                  {evalResult.score}<span style={{ fontSize: '1rem', color: '#6366F1' }}>点</span>
                </div>
              </div>

              <p style={{ fontSize: '0.92rem', color: '#1E1B4B', lineHeight: 1.6, marginBottom: '16px', background: '#FFFFFF', padding: '14px', borderRadius: '12px' }}>
                💬 {evalResult.feedbackJa}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: '#ECFDF5', padding: '12px', borderRadius: '10px', border: '1px solid #A7F3D0' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#047857', marginBottom: '4px' }}>
                    👍 良かった点
                  </div>
                  {evalResult.strengthsJa?.map((s, i) => (
                    <div key={i} style={{ fontSize: '0.8rem', color: '#065F46', marginTop: '2px' }}>
                      • {s}
                    </div>
                  ))}
                </div>

                <div style={{ background: '#FFFBEB', padding: '12px', borderRadius: '10px', border: '1px solid #FDE68A' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#B45309', marginBottom: '4px' }}>
                    🎯 さらに良くするポイント
                  </div>
                  {evalResult.improvementsJa?.map((imp, i) => (
                    <div key={i} style={{ fontSize: '0.8rem', color: '#92400E', marginTop: '2px' }}>
                      • {imp}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
