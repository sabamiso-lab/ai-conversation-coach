import { useState, useRef, useEffect, useCallback } from 'react';
import { SpeechRecognizer, isSpeechRecognitionSupported, stopSpeaking } from '../../services/speech';

export function useBlitzSpeech() {
  const [isListening, setIsListening] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speechError, setSpeechError] = useState('');
  const recognizerRef = useRef<SpeechRecognizer | null>(null);

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

  const startListening = useCallback(() => {
    if (!recognizerRef.current) {
      setSpeechError('お使いのブラウザは音声認識に対応していません。');
      return;
    }
    setSpeechError('');
    try {
      recognizerRef.current.start();
      setIsListening(true);
    } catch {
      // already active
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognizerRef.current) {
      recognizerRef.current.stop();
    }
    setIsListening(false);
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const resetSpeech = useCallback(() => {
    stopListening();
    setUserTranscript('');
    setInterimTranscript('');
    setSpeechError('');
  }, [stopListening]);

  const fullUserText = `${userTranscript} ${interimTranscript}`.trim();

  return {
    isListening,
    userTranscript,
    setUserTranscript,
    interimTranscript,
    fullUserText,
    speechError,
    setSpeechError,
    startListening,
    stopListening,
    toggleListening,
    resetSpeech
  };
}
