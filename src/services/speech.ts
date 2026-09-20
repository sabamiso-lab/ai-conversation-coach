import {
  ISpeechRecognition,
  SpeechRecognitionConstructor,
  SpeechRecognitionEvent,
  SpeechRecognitionErrorEvent
} from '../types/speech';

// Global Web Speech API type declarations
declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export const isSpeechRecognitionSupported = (): boolean => {
  return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
};

export const isSpeechSynthesisSupported = (): boolean => {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
};

export interface SpeechRecognizerOptions {
  onResult?: (result: { final: string; interim: string }) => void;
  onError?: (userFriendlyError: string, rawError?: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
  lang?: string;
  continuous?: boolean;
}

/**
 * Speech Recognition Manager
 */
export class SpeechRecognizer {
  public supported: boolean;
  public isListening: boolean;
  private recognition: ISpeechRecognition | null = null;
  private onErrorCallback?: (userFriendlyError: string, rawError?: string) => void;
  private startIndex: number = 0;
  private lastResultsLength: number = 0;

  constructor({ onResult, onError, onStart, onEnd, lang = 'en-US', continuous = false }: SpeechRecognizerOptions) {
    const SpeechRecognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
    if (!SpeechRecognition) {
      this.supported = false;
      this.isListening = false;
      return;
    }

    this.supported = true;
    this.isListening = false;
    this.onErrorCallback = onError;
    this.startIndex = 0;
    this.lastResultsLength = 0;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = continuous;
    this.recognition.interimResults = true;
    this.recognition.lang = lang;

    this.recognition.onstart = () => {
      this.isListening = true;
      this.startIndex = 0;
      this.lastResultsLength = 0;
      if (onStart) onStart();
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      this.lastResultsLength = event.results.length;
      let finalTranscript = '';
      let interimTranscript = '';

      // Aggregate results from startIndex to allow clearing past transcripts during an active session
      for (let i = this.startIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (onResult) {
        onResult({
          final: finalTranscript.trim(),
          interim: interimTranscript.trim()
        });
      }
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // Ignore user-initiated abort or cancel
      if (event.error === 'aborted') {
        this.isListening = false;
        return;
      }

      console.warn('Speech recognition error:', event.error);
      this.isListening = false;
      let userFriendlyError = '音声認識エラーが発生しました。';
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        userFriendlyError = 'マイクの使用が拒否されています。ブラウザのアドレスバーにある鍵マーク（またはマイクアイコン）からマイクの使用を許可してください。';
      } else if (event.error === 'no-speech') {
        userFriendlyError = '音声が検出されませんでした。マイクに向かってハッキリと話すか、もう一度ボタンを押してください。';
      } else if (event.error === 'audio-capture') {
        userFriendlyError = 'マイクが検出されませんでした。マイクが接続されているか確認してください。';
      } else if (event.error === 'network') {
        userFriendlyError = '音声認識ネットワーク接続エラーが発生しました。';
      }

      if (this.onErrorCallback) this.onErrorCallback(userFriendlyError, event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.startIndex = 0;
      this.lastResultsLength = 0;
      if (onEnd) onEnd();
    };
  }

  start(): void {
    if (this.recognition && !this.isListening) {
      try {
        this.startIndex = 0;
        this.lastResultsLength = 0;
        this.recognition.start();
        this.isListening = true;
      } catch (err: unknown) {
        this.isListening = false;
        console.warn("Speech recognition start failed:", err);
        // If already started, do not crash
        const isInvalidState = err instanceof DOMException && err.name === 'InvalidStateError';
        if (!isInvalidState) {
          if (this.onErrorCallback) {
            const msg = err instanceof Error ? err.message : undefined;
            this.onErrorCallback('マイクの起動に失敗しました。もう一度お試しください。', msg);
          }
        }
      }
    }
  }

  stop(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (err) {
        console.warn("Speech recognition stop error:", err);
      } finally {
        this.isListening = false;
        this.startIndex = 0;
        this.lastResultsLength = 0;
      }
    }
  }

  abort(): void {
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (err) {
        console.warn("Speech recognition abort error:", err);
      } finally {
        this.isListening = false;
        this.startIndex = 0;
        this.lastResultsLength = 0;
      }
    }
  }

  clear(): void {
    this.startIndex = this.lastResultsLength;
  }
}

/**
 * Text-to-Speech Helper
 */
let pendingSpeechTimeout: ReturnType<typeof setTimeout> | null = null;

function setVoiceAndSpeak(utterance: SpeechSynthesisUtterance, onEnd?: () => void): void {
  const voices = window.speechSynthesis.getVoices();
  const naturalVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
  if (naturalVoice) {
    utterance.voice = naturalVoice;
  }

  if (onEnd) {
    utterance.onend = () => onEnd();
  }

  window.speechSynthesis.speak(utterance);
}

export interface SpeakTextOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  onEnd?: () => void;
}

export function speakText(text: string, { lang = 'en-US', rate = 0.95, pitch = 1.0, onEnd }: SpeakTextOptions = {}): void {
  if (!isSpeechSynthesisSupported()) return;

  // Cancel any ongoing speech & clear pending timers/event listeners
  stopSpeaking();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = rate;
  utterance.pitch = pitch;

  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    setVoiceAndSpeak(utterance, onEnd);
  } else {
    let hasSpoken = false;

    const doSpeak = () => {
      if (hasSpoken) return;
      hasSpoken = true;

      if (pendingSpeechTimeout) {
        clearTimeout(pendingSpeechTimeout);
        pendingSpeechTimeout = null;
      }
      window.speechSynthesis.onvoiceschanged = null;

      setVoiceAndSpeak(utterance, onEnd);
    };

    window.speechSynthesis.onvoiceschanged = () => {
      doSpeak();
    };

    pendingSpeechTimeout = setTimeout(() => {
      doSpeak();
    }, 100);
  }
}

export function stopSpeaking(): void {
  if (isSpeechSynthesisSupported()) {
    if (pendingSpeechTimeout) {
      clearTimeout(pendingSpeechTimeout);
      pendingSpeechTimeout = null;
    }
    window.speechSynthesis.onvoiceschanged = null;
    window.speechSynthesis.cancel();
  }
}
