/**
 * Speech-to-Text (STT) Module
 * Handles speech recognition using Web Speech API (SpeechRecognition).
 */

import {
  ISpeechRecognition,
  SpeechRecognitionEvent,
  SpeechRecognitionErrorEvent,
  SpeechRecognizerOptions
} from './types';
import { mergeTranscripts } from './transcriptUtils';

export const isSpeechRecognitionSupported = (): boolean => {
  return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
};

/**
 * Speech Recognition Manager Class
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
          finalTranscript = mergeTranscripts(finalTranscript, piece);
        } else {
          interimTranscript = mergeTranscripts(interimTranscript, piece);
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
