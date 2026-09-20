import { useState, useEffect, useRef, useCallback } from 'react';
import { SpeechRecognizer, isSpeechRecognitionSupported, stopSpeaking } from '../services/speech';

export interface UseSpeechRecognitionOptions {
  onFinalResult?: (finalText: string) => void;
  onInterimResult?: (interimText: string) => void;
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
  const onErrorRef = useRef(onError);
  const onStartRef = useRef(onStart);
  const onEndRef = useRef(onEnd);

  useEffect(() => {
    onFinalResultRef.current = onFinalResult;
    onInterimResultRef.current = onInterimResult;
    onErrorRef.current = onError;
    onStartRef.current = onStart;
    onEndRef.current = onEnd;
  }, [onFinalResult, onInterimResult, onError, onStart, onEnd]);

  const isSupported = isSpeechRecognitionSupported();

  useEffect(() => {
    if (!isSupported) return;

    recognizerRef.current = new SpeechRecognizer({
      lang,
      continuous,
      onStart: () => {
        setIsRecording(true);
        if (onStartRef.current) {
          onStartRef.current();
        }
      },
      onResult: ({ final, interim }: { final: string; interim: string }) => {
        if (final) {
          setUserTranscript((prev) => (prev ? `${prev} ${final}` : final));
          setInterimTranscript('');
          if (onFinalResultRef.current) {
            onFinalResultRef.current(final);
          }
        } else if (interim) {
          setInterimTranscript(interim);
          if (onInterimResultRef.current) {
            onInterimResultRef.current(interim);
          }
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

    return () => {
      if (recognizerRef.current) {
        recognizerRef.current.abort();
      }
      if (stopSpeakingOnCleanup) {
        stopSpeaking();
      }
    };
  }, [isSupported, lang, continuous, stopSpeakingOnCleanup]);

  const startRecording = useCallback(() => {
    if (!recognizerRef.current) {
      const unsupportedMsg = 'お使いのブラウザは音声認識に対応していません。';
      setError(unsupportedMsg);
      if (onErrorRef.current) {
        onErrorRef.current(unsupportedMsg);
      }
      return;
    }
    setError('');
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
    stopRecording();
    setUserTranscript('');
    setInterimTranscript('');
    setError('');
  }, [stopRecording]);

  const fullTranscript = `${userTranscript} ${interimTranscript}`.trim();

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
    toggleRecording,
    toggleListening: toggleRecording,
    resetSpeech,
    clearTranscript: resetSpeech
  };
}
