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
  private isStopped: boolean = false;
  private recognition: ISpeechRecognition | null = null;
  private options: SpeechRecognizerOptions;
  private startIndex: number = 0;
  private lastResultsLength: number = 0;

  constructor(options: SpeechRecognizerOptions) {
    this.options = {
      lang: 'en-US',
      continuous: false,
      ...options
    };

    const SpeechRecognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
    if (!SpeechRecognition) {
      this.supported = false;
      this.isListening = false;
      this.isStopped = false;
      return;
    }

    this.supported = true;
    this.isListening = false;
    this.isStopped = false;
    this.startIndex = 0;
    this.lastResultsLength = 0;
    this.createRecognitionInstance();
  }

  private createRecognitionInstance(): ISpeechRecognition | null {
    const SpeechRecognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
    if (!SpeechRecognition) return null;

    // Detach listeners from previous instance if any
    if (this.recognition) {
      try {
        this.recognition.onstart = null;
        this.recognition.onresult = null;
        this.recognition.onerror = null;
        this.recognition.onend = null;
        this.recognition.abort();
      } catch {
        // ignore
      }
    }

    const rec = new SpeechRecognition();
    rec.continuous = Boolean(this.options.continuous);
    rec.interimResults = true;
    rec.lang = this.options.lang || 'en-US';

    rec.onstart = () => {
      this.isListening = true;
      this.isStopped = false;
      this.startIndex = 0;
      this.lastResultsLength = 0;
      if (this.options.onStart) this.options.onStart();
    };

    rec.onresult = (event: SpeechRecognitionEvent) => {
      // If recognition was explicitly stopped or aborted, ignore trailing events
      if (this.isStopped) return;

      this.lastResultsLength = event.results.length;
      let finalTranscript = '';
      let interimTranscript = '';

      // Aggregate results from startIndex to allow clearing past transcripts during an active session
      for (let i = this.startIndex; i < event.results.length; ++i) {
        const piece = event.results[i][0]?.transcript;
        if (!piece) continue;

        if (event.results[i].isFinal) {
          if (finalTranscript && !finalTranscript.endsWith(' ') && !piece.startsWith(' ')) {
            finalTranscript += ' ';
          }
          finalTranscript += piece;
        } else {
          if (interimTranscript && !interimTranscript.endsWith(' ') && !piece.startsWith(' ')) {
            interimTranscript += ' ';
          }
          interimTranscript += piece;
        }
      }

      if (this.options.onResult) {
        this.options.onResult({
          final: finalTranscript.trim(),
          interim: interimTranscript.trim()
        });
      }
    };

    rec.onerror = (event: SpeechRecognitionErrorEvent) => {
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

      if (this.options.onError) this.options.onError(userFriendlyError, event.error);
    };

    rec.onend = () => {
      this.isListening = false;
      this.startIndex = 0;
      this.lastResultsLength = 0;
      if (this.options.onEnd) this.options.onEnd();
    };

    this.recognition = rec;
    return rec;
  }

  start(): void {
    if (!this.supported) return;

    try {
      this.isStopped = false;
      this.startIndex = 0;
      this.lastResultsLength = 0;
      // Re-create instance to avoid browser hang on re-start and ensure clean state
      const rec = this.createRecognitionInstance();
      if (rec) {
        rec.start();
        this.isListening = true;
      }
    } catch (err: unknown) {
      this.isListening = false;
      console.warn("Speech recognition start failed:", err);
      // If already started, do not crash
      const isInvalidState = err instanceof DOMException && err.name === 'InvalidStateError';
      if (!isInvalidState && this.options.onError) {
        const msg = err instanceof Error ? err.message : undefined;
        this.options.onError('マイクの起動に失敗しました。もう一度お試しください。', msg);
      }
    }
  }

  stop(): void {
    this.isStopped = true;
    if (this.recognition && this.isListening) {
      this.isListening = false;
      try {
        this.recognition.stop();
      } catch (err) {
        console.warn("Speech recognition stop error:", err);
      } finally {
        this.startIndex = 0;
        this.lastResultsLength = 0;
      }
    }
  }

  abort(): void {
    this.isStopped = true;
    if (this.recognition) {
      this.isListening = false;
      this.startIndex = 0;
      this.lastResultsLength = 0;
      const rec = this.recognition;
      try {
        rec.onstart = null;
        rec.onresult = null;
        rec.onerror = null;
        rec.onend = null;
        rec.abort();
      } catch (err) {
        console.warn("Speech recognition abort error:", err);
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
let keepAliveTimer: ReturnType<typeof setInterval> | null = null;
// Retain reference to active utterances to prevent garbage collection in Chrome during long playback
const activeUtterances = new Set<SpeechSynthesisUtterance>();

function stopKeepAlive(): void {
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }
}

function startKeepAlive(): void {
  stopKeepAlive();
  // Chrome bug workaround: Chrome speech synthesis pauses after ~15s
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    keepAliveTimer = setInterval(() => {
      try {
        if (window.speechSynthesis && window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      } catch {
        // ignore
      }
    }, 10000);
  }
}

export function findPreferredVoice(voices: SpeechSynthesisVoice[], targetLang: string = 'en-US'): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;
  const langPrefix = targetLang.split('-')[0].toLowerCase();

  // 1. First priority: High-quality / natural English voices
  const highQualityVoice = voices.find(v => {
    const vLang = (v.lang || '').replace('_', '-').toLowerCase();
    const isMatchingLang = vLang.startsWith(langPrefix);
    const name = v.name || '';
    const hasQualityKeyword = name.includes('Natural') || name.includes('Google') || name.includes('Samantha') || name.includes('Jenny') || name.includes('Guy');
    return isMatchingLang && hasQualityKeyword;
  });
  if (highQualityVoice) return highQualityVoice;

  // 2. Second priority: Standard voice matching langPrefix (e.g. Windows Microsoft David, Zira, Mark, etc.)
  const standardLangVoice = voices.find(v => {
    const vLang = (v.lang || '').replace('_', '-').toLowerCase();
    return vLang.startsWith(langPrefix);
  });
  if (standardLangVoice) return standardLangVoice;

  // 3. Fallback: Any voice containing langPrefix
  const anyMatching = voices.find(v => (v.lang || '').toLowerCase().includes(langPrefix));
  return anyMatching || null;
}

function setVoiceAndSpeak(
  utterance: SpeechSynthesisUtterance,
  onEnd?: () => void,
  onError?: (event: SpeechSynthesisErrorEvent) => void
): void {
  activeUtterances.add(utterance);
  startKeepAlive();

  let isCleanedUp = false;
  const cleanup = (isNormalCompletion: boolean) => {
    if (isCleanedUp) return;
    isCleanedUp = true;
    activeUtterances.delete(utterance);
    if (activeUtterances.size === 0) {
      stopKeepAlive();
    }
    // Only invoke onEnd on normal successful completion, NOT on error/cancel
    if (isNormalCompletion && onEnd) {
      onEnd();
    }
  };

  const voices = window.speechSynthesis.getVoices();
  const targetVoice = findPreferredVoice(voices, utterance.lang || 'en-US');
  if (targetVoice) {
    utterance.voice = targetVoice;
  }

  utterance.onend = () => {
    cleanup(true);
  };

  utterance.onerror = (event) => {
    // If canceled or interrupted by stopSpeaking(), do not trigger onEnd or onError
    const isCancelled = event.error === 'canceled' || event.error === 'interrupted';
    if (!isCancelled) {
      console.warn('Speech synthesis error:', event);
      if (onError) {
        onError(event);
      }
    }
    cleanup(false);
  };

  window.speechSynthesis.speak(utterance);
}

export interface SpeakTextOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  onEnd?: () => void;
  onError?: (event: SpeechSynthesisErrorEvent) => void;
}

let lastSpeakRequest = { text: '', time: 0 };

export function speakText(text: string, { lang = 'en-US', rate = 0.95, pitch = 1.0, onEnd, onError }: SpeakTextOptions = {}): void {
  if (!isSpeechSynthesisSupported() || !text) return;

  const now = Date.now();
  // Prevent duplicate playback when called in quick succession (< 150ms) with the exact same text
  if (lastSpeakRequest.text === text && (now - lastSpeakRequest.time) < 150) {
    return;
  }
  lastSpeakRequest = { text, time: now };

  // Cancel any ongoing speech & clear pending timers/event listeners
  stopSpeaking();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = rate;
  utterance.pitch = pitch;

  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    setVoiceAndSpeak(utterance, onEnd, onError);
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

      setVoiceAndSpeak(utterance, onEnd, onError);
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
    stopKeepAlive();
    activeUtterances.clear();
    if (pendingSpeechTimeout) {
      clearTimeout(pendingSpeechTimeout);
      pendingSpeechTimeout = null;
    }
    window.speechSynthesis.onvoiceschanged = null;
    window.speechSynthesis.cancel();
  }
}
