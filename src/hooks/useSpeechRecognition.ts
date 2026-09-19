import { useState, useEffect, useRef, useCallback } from 'react';
import { SpeechRecognizer, isSpeechRecognitionSupported } from '../services/speech';

interface UseSpeechRecognitionOptions {
  onFinalResult: (finalText: string) => void;
  onInterimResult?: (interimText: string) => void;
  onError?: (errorMessage: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
  lang?: string;
  continuous?: boolean;
}

export function useSpeechRecognition({
  onFinalResult,
  onInterimResult,
  onError,
  onStart,
  onEnd,
  lang = 'en-US',
  continuous = false
}: UseSpeechRecognitionOptions) {
  const [isRecording, setIsRecording] = useState(false);
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

    return () => {
      if (recognizerRef.current) {
        recognizerRef.current.abort();
      }
    };
  }, [isSupported, lang, continuous]);

  const startRecording = useCallback(() => {
    if (!recognizerRef.current) {
      const unsupportedMsg = 'お使いのブラウザは音声認識(Web Speech API)に対応していません。テキスト入力をご利用ください。';
      setError(unsupportedMsg);
      if (onErrorRef.current) {
        onErrorRef.current(unsupportedMsg);
      }
      return;
    }
    setError('');
    recognizerRef.current.start();
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

  return {
    isSupported,
    isRecording,
    error,
    setError,
    startRecording,
    stopRecording,
    abortRecording,
    toggleRecording
  };
}
