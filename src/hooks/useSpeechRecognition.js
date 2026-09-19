import { useState, useEffect, useRef, useCallback } from 'react';
import { SpeechRecognizer, isSpeechRecognitionSupported } from '../services/speech';

/**
 * Web Speech API による音声認識を管理するカスタムフック
 *
 * @param {Object} options
 * @param {Function} options.onFinalResult - 最終的な認識テキストが得られた際のコールバック (finalText: string) => void
 * @param {Function} [options.onInterimResult] - 中間経過のテキストが得られた際のコールバック (interimText: string) => void
 * @param {Function} [options.onError] - エラー発生時のコールバック (errorMessage: string) => void
 * @param {string} [options.lang='en-US'] - 認識言語
 */
export function useSpeechRecognition({ onFinalResult, onInterimResult, onError, lang = 'en-US' } = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState('');
  const recognizerRef = useRef(null);

  const onFinalResultRef = useRef(onFinalResult);
  const onInterimResultRef = useRef(onInterimResult);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onFinalResultRef.current = onFinalResult;
    onInterimResultRef.current = onInterimResult;
    onErrorRef.current = onError;
  }, [onFinalResult, onInterimResult, onError]);

  const isSupported = isSpeechRecognitionSupported();

  useEffect(() => {
    if (!isSupported) return;

    recognizerRef.current = new SpeechRecognizer({
      lang,
      onResult: ({ final, interim }) => {
        if (final) {
          if (onFinalResultRef.current) {
            onFinalResultRef.current(final);
          }
        } else if (interim) {
          if (onInterimResultRef.current) {
            onInterimResultRef.current(interim);
          }
        }
      },
      onError: (userFriendlyError) => {
        console.warn('Speech Rec Error:', userFriendlyError);
        setError(userFriendlyError);
        setIsRecording(false);
        if (onErrorRef.current) {
          onErrorRef.current(userFriendlyError);
        }
      },
      onEnd: () => {
        setIsRecording(false);
      }
    });

    return () => {
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }
    };
  }, [isSupported, lang]);

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
    setIsRecording(true);
    recognizerRef.current.start();
  }, []);

  const stopRecording = useCallback(() => {
    if (recognizerRef.current) {
      recognizerRef.current.stop();
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
    toggleRecording
  };
}
