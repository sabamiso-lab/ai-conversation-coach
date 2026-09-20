import { useState, useEffect, useCallback } from 'react';
import { evaluateShadowingPerformance } from '../../services/gemini';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { CoachShadowingContext, ShadowingScript, ShadowingEvaluation } from '../../types';

export interface UseShadowingSessionOptions {
  script: ShadowingScript;
  apiKey?: string;
  model?: string;
  onOpenApiKeyModal?: () => void;
  onContextChange?: (context: CoachShadowingContext) => void;
}

export function useShadowingSession({
  script,
  apiKey,
  model,
  onOpenApiKeyModal,
  onContextChange
}: UseShadowingSessionOptions) {
  const scriptText = script?.text || '';

  // Audio Playback Hook
  const {
    playbackSpeed,
    setPlaybackSpeed,
    isPlaying,
    isLooping,
    setIsLooping,
    togglePlayAudio,
    stopAudio,
    clearLoopTimer
  } = useAudioPlayer();

  // Recording & Evaluation States
  const [userTranscript, setUserTranscript] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState<ShadowingEvaluation | null>(null);

  const handleSpeechResult = useCallback(({ full }: { full: string }) => {
    setUserTranscript(full);
  }, []);

  const handleSpeechError = useCallback((speechErr: string) => {
    setErrorMsg(speechErr);
  }, []);

  const { isSupported, isRecording, abortRecording, toggleRecording: rawToggleRecording } = useSpeechRecognition({
    onResult: handleSpeechResult,
    onError: handleSpeechError,
    continuous: true
  });

  // 親コンポーネント（AIコーチ）へ現在のリアルタイム状況を通知
  useEffect(() => {
    if (onContextChange && script) {
      onContextChange({
        title: script.title,
        category: script.category,
        fullText: script.text,
        targetText: script.text,
        sentences: script.sentences,
        userSpeech: userTranscript.trim(),
        hasRecorded: Boolean(userTranscript.trim()),
        isRecording,
        evalResult: evalResult ? {
          overallScore: evalResult.overallScore,
          accuracyScore: evalResult.accuracyScore,
          pronunciationScore: evalResult.pronunciationScore,
          feedbackJa: evalResult.feedbackJa || evalResult.feedback,
          recognizedText: evalResult.recognizedText || userTranscript
        } : null
      });
    }
  }, [onContextChange, script, userTranscript, isRecording, evalResult]);

  useEffect(() => {
    return () => {
      clearLoopTimer();
      abortRecording();
    };
  }, [abortRecording, clearLoopTimer]);

  const handlePlayAudio = useCallback(() => {
    togglePlayAudio(scriptText);
  }, [togglePlayAudio, scriptText]);

  const toggleRecording = () => {
    clearLoopTimer();
    if (!isRecording) {
      setErrorMsg('');
      setUserTranscript('');
      setEvalResult(null);
    }
    if (isPlaying) {
      stopAudio();
    }
    rawToggleRecording();
  };

  const handleEvaluate = async () => {
    if (!userTranscript.trim()) return;
    if (!apiKey) {
      if (onOpenApiKeyModal) onOpenApiKeyModal();
      return;
    }

    setIsEvaluating(true);
    setErrorMsg('');

    try {
      const evaluation = await evaluateShadowingPerformance({
        apiKey,
        model,
        originalText: script.text,
        userSpeechText: userTranscript
      });

      setEvalResult({
        score: evaluation.score,
        feedbackJa: evaluation.feedbackJa,
        strengthsJa: evaluation.strengthsJa || [],
        improvementsJa: evaluation.improvementsJa || [],
        accuracyScore: evaluation.score,
        pronunciationScore: Math.min(100, Math.round(evaluation.score * 0.95 + 5)),
        overallScore: evaluation.score,
        feedback: evaluation.feedbackJa,
        recognizedText: userTranscript
      });
    } catch (err: unknown) {
      console.error('Failed to evaluate shadowing:', err);
      const msg = err instanceof Error ? err.message : 'AI診断に失敗しました。';
      setErrorMsg(msg);
    } finally {
      setIsEvaluating(false);
    }
  };

  return {
    playbackSpeed,
    setPlaybackSpeed,
    isPlaying,
    isLooping,
    setIsLooping,
    isRecording,
    isSupported,
    userTranscript,
    errorMsg,
    isEvaluating,
    evalResult,
    handlePlayAudio,
    toggleRecording,
    handleEvaluate
  };
}
