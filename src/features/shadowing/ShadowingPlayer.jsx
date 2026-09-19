import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, Sparkles, Eye, EyeOff, 
  Lightbulb, Loader2 
} from 'lucide-react';
import MicButton from '../../components/common/MicButton';
import Alert from '../../components/common/Alert';
import ShadowingAudioControls from './ShadowingAudioControls';
import ShadowingEvaluationCard from './ShadowingEvaluationCard';
import { speakText, stopSpeaking } from '../../services/speech';
import { evaluateShadowingPerformance } from '../../services/gemini';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

export default function ShadowingPlayer({ script, onBack, apiKey, model, onOpenApiKeyModal }) {
  // Speech Playback Settings
  const [playbackSpeed, setPlaybackSpeed] = useState(0.85); // Default slightly easy
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);

  // View Options
  const [viewMode, setViewMode] = useState('slash'); // 'full' | 'slash' | 'blank'
  const [showTranslation, setShowTranslation] = useState(true);

  // Recording & Evaluation States
  const [userTranscript, setUserTranscript] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Evaluation Result State
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState(null);

  const handleFinalResult = useCallback((finalText) => {
    setUserTranscript(finalText);
  }, []);

  const handleInterimResult = useCallback((interimText) => {
    setUserTranscript(interimText);
  }, []);

  const handleSpeechError = useCallback((speechErr) => {
    setErrorMsg(speechErr);
  }, []);

  const { isRecording, toggleRecording: rawToggleRecording } = useSpeechRecognition({
    onFinalResult: handleFinalResult,
    onInterimResult: handleInterimResult,
    onError: handleSpeechError
  });

  useEffect(() => {
    return () => {
      stopSpeaking();
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
    if (!isRecording) {
      setErrorMsg('');
      setUserTranscript('');
      setEvalResult(null);

      // Auto play audio if not playing when user starts recording
      if (!isPlaying) {
        handlePlayAudio();
      }
    }
    rawToggleRecording();
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
        <Alert variant="error" style={{ marginBottom: '16px' }}>
          {errorMsg}
        </Alert>
      )}

      {/* Main Practice Card */}
      <div className="chat-container" style={{ display: 'block', padding: '18px 16px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: 'clamp(1.15rem, 3.5vw, 1.4rem)', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
            {script.title}
          </h2>
          <div style={{ fontSize: '0.86rem', color: '#64748B', fontWeight: 600 }}>
            {script.titleJa}
          </div>
        </div>

        {/* Player Controls Bar */}
        <ShadowingAudioControls
          isPlaying={isPlaying}
          isLooping={isLooping}
          playbackSpeed={playbackSpeed}
          onPlayToggle={handlePlayAudio}
          onLoopToggle={() => setIsLooping(!isLooping)}
          onSpeedChange={setPlaybackSpeed}
        />

        {/* Display Mode Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            <button
              className={`btn ${viewMode === 'slash' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('slash')}
              style={{ fontSize: '0.78rem', padding: '5px 10px', borderRadius: '8px' }}
            >
              / 区切り
            </button>
            <button
              className={`btn ${viewMode === 'full' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('full')}
              style={{ fontSize: '0.78rem', padding: '5px 10px', borderRadius: '8px' }}
            >
              標準
            </button>
            <button
              className={`btn ${viewMode === 'blank' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('blank')}
              style={{ fontSize: '0.78rem', padding: '5px 10px', borderRadius: '8px' }}
            >
              🙈 穴埋め
            </button>
          </div>

          <button
            className="btn btn-ghost"
            onClick={() => setShowTranslation(!showTranslation)}
            style={{ fontSize: '0.78rem', color: '#64748B', padding: '4px 8px' }}
          >
            {showTranslation ? <><EyeOff size={14} /> 訳を隠す</> : <><Eye size={14} /> 訳を表示</>}
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
            <MicButton
              isRecording={isRecording}
              onClick={toggleRecording}
              iconSize={28}
              style={{ width: '64px', height: '64px' }}
              title={isRecording ? '録音停止' : 'シャドーイング録音開始'}
            />
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
          <ShadowingEvaluationCard evalResult={evalResult} />
        </div>
      </div>
    </div>
  );
}
