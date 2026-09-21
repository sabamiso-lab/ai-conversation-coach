import { useState, useEffect, useRef, useCallback } from 'react';
import { SpeechRecognizer, isSpeechRecognitionSupported, stopSpeaking, mergeTranscripts } from '../services/speech';
import { audioManager } from '../services/speech/audioManager';

export interface UseSpeechRecognitionOptions {
  onFinalResult?: (finalText: string) => void;
  onInterimResult?: (interimText: string) => void;
  onResult?: (result: { final: string; interim: string; full: string }) => void;
  onError?: (errorMessage: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
  lang?: string;
  continuous?: boolean;
  stopSpeakingOnCleanup?: boolean;
}

export function useSpeechRecognition({
  onFinalResult,
  onInterimResult,
  onResult,
  onError,
  onStart,
  onEnd,
  lang = 'en-US',
  continuous = false,
  stopSpeakingOnCleanup = false
}: UseSpeechRecognitionOptions = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState('');
  const recognizerRef = useRef<SpeechRecognizer | null>(null);

  const onFinalResultRef = useRef(onFinalResult);
  const onInterimResultRef = useRef(onInterimResult);
  const onResultRef = useRef(onResult);
  const onErrorRef = useRef(onError);
  const onStartRef = useRef(onStart);
  const onEndRef = useRef(onEnd);

  useEffect(() => {
    onFinalResultRef.current = onFinalResult;
    onInterimResultRef.current = onInterimResult;
    onResultRef.current = onResult;
    onErrorRef.current = onError;
    onStartRef.current = onStart;
    onEndRef.current = onEnd;
  }, [onFinalResult, onInterimResult, onResult, onError, onStart, onEnd]);

  const isSupported = isSpeechRecognitionSupported();

  useEffect(() => {
    if (!isSupported) return;

    const recognizer = new SpeechRecognizer({
      lang,
      continuous,
      onStart: () => {
        setIsRecording(true);
        if (onStartRef.current) {
          onStartRef.current();
        }
      },
      onResult: ({ final, interim }: { final: string; interim: string }) => {
        setUserTranscript(final);
        setInterimTranscript(interim);
        const full = mergeTranscripts(final, interim);
        if (onResultRef.current) {
          onResultRef.current({ final, interim, full });
        }
        if (final && onFinalResultRef.current) {
          onFinalResultRef.current(final);
        }
        if (interim && onInterimResultRef.current) {
          onInterimResultRef.current(interim);
        }
      },
      onError: (userFriendlyError: string) => {
        console.warn('Speech Rec Error:', userFriendlyError);
        setError(userFriendlyError);
        setIsRecording(false);
        if (onErrorRef.current) {
          onErrorRef.current(userFriendlyError);
        }
      },
      onEnd: () => {
        setIsRecording(false);
        if (onEndRef.current) {
          onEndRef.current();
        }
      }
    });

    recognizerRef.current = recognizer;
    audioManager?.registerRecognizer?.(recognizer);

    return () => {
      audioManager?.unregisterRecognizer?.(recognizer);
      recognizer.abort();
      if (stopSpeakingOnCleanup) {
        audioManager?.stopPlayback?.();
      }
    };
  }, [isSupported, lang, continuous, stopSpeakingOnCleanup]);

  const startRecording = useCallback(() => {
    stopSpeaking();
    // Automatically stop ongoing TTS and register this recognizer
    audioManager?.onRecognitionStart?.(recognizerRef.current);
    if (!recognizerRef.current) {
      const unsupportedMsg = 'お使いのブラウザは音声認識に対応していません。';
      setError(unsupportedMsg);
      if (onErrorRef.current) {
        onErrorRef.current(unsupportedMsg);
      }
      return;
    }
    setError('');
    setUserTranscript('');
    setInterimTranscript('');
    try {
      recognizerRef.current.start();
      setIsRecording(true);
    } catch {
      // already active
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (recognizerRef.current) {
      recognizerRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  const abortRecording = useCallback(() => {
    if (recognizerRef.current) {
      recognizerRef.current.abort();
      setIsRecording(false);
    }
  }, []);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  const resetSpeech = useCallback(() => {
    abortRecording();
    setUserTranscript('');
    setInterimTranscript('');
    setError('');
  }, [abortRecording]);

  const clearSpeech = useCallback(() => {
    if (recognizerRef.current) {
      recognizerRef.current.clear();
    }
    setUserTranscript('');
    setInterimTranscript('');
    setError('');
    if (onResultRef.current) {
      onResultRef.current({ final: '', interim: '', full: '' });
    }
  }, []);

  const fullTranscript = mergeTranscripts(userTranscript, interimTranscript);

  return {
    isSupported,
    isRecording,
    isListening: isRecording,
    userTranscript,
    setUserTranscript,
    interimTranscript,
    setInterimTranscript,
    fullTranscript,
    fullUserText: fullTranscript,
    error,
    setError,
    speechError: error,
    setSpeechError: setError,
    startRecording,
    startListening: startRecording,
    stopRecording,
    stopListening: stopRecording,
    abortRecording,
    abortListening: abortRecording,
    toggleRecording,
    toggleListening: toggleRecording,
    resetSpeech,
    clearSpeech
  };
}
