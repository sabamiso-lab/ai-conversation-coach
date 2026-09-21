/**
 * Central Audio Manager (Orchestrator)
 * Manages mutual exclusion between TTS (SpeechSynthesis) and STT (SpeechRecognition)
 * to prevent echo, dual input, and resource leaks.
 */

import { AudioState, SpeakTextOptions } from './types';
import { rawSpeakText, stopSpeaking, isSpeaking } from './tts';
import { SpeechRecognizer } from './stt';

export class AudioManager {
  private activeRecognizer: SpeechRecognizer | null = null;
  private isTtsActive: boolean = false;

  /**
   * Register the currently active SpeechRecognizer instance
   */
  registerRecognizer(recognizer: SpeechRecognizer | null): void {
    this.activeRecognizer = recognizer;
  }

  /**
   * Unregister a SpeechRecognizer instance
   */
  unregisterRecognizer(recognizer: SpeechRecognizer): void {
    if (this.activeRecognizer === recognizer) {
      this.activeRecognizer = null;
    }
  }

  /**
   * Called when STT begins. Automatically stops any ongoing TTS playback.
   */
  onRecognitionStart(recognizer?: SpeechRecognizer | null): void {
    if (recognizer) {
      this.activeRecognizer = recognizer;
    }
    // Stop any speech synthesis immediately so it doesn't leak into the microphone
    this.stopPlayback();
  }

  /**
   * Play speech synthesis with automatic mutual exclusion.
   * If speech recognition is actively listening, it will be automatically aborted
   * to avoid speaker audio feedback into the microphone.
   */
  speak(text: string, options: SpeakTextOptions = {}): void {
    // 1. Immediately abort active speech recognition if listening
    if (this.activeRecognizer && this.activeRecognizer.isListening) {
      this.activeRecognizer.abort();
    }

    this.isTtsActive = true;

    const originalOnEnd = options.onEnd;
    const originalOnError = options.onError;

    const wrappedOptions: SpeakTextOptions = {
      ...options,
      onEnd: () => {
        this.isTtsActive = false;
        if (originalOnEnd) {
          originalOnEnd();
        }
      },
      onError: (event) => {
        this.isTtsActive = false;
        if (originalOnError) {
          originalOnError(event);
        }
      }
    };

    rawSpeakText(text, wrappedOptions);
  }

  /**
   * Stop TTS playback safely.
   */
  stopPlayback(): void {
    this.isTtsActive = false;
    stopSpeaking();
  }

  /**
   * Stop both TTS and STT completely.
   * Useful for page unmounts, route transitions, and session resets.
   */
  stopAll(): void {
    this.stopPlayback();
    if (this.activeRecognizer) {
      try {
        this.activeRecognizer.abort();
      } catch {
        // ignore
      }
    }
  }

  /**
   * Get the current global audio state
   */
  getState(): AudioState {
    if (this.isTtsActive || isSpeaking()) {
      return 'speaking';
    }
    if (this.activeRecognizer && this.activeRecognizer.isListening) {
      return 'listening';
    }
    return 'idle';
  }

  /**
   * Check if audio is currently speaking
   */
  get isSpeaking(): boolean {
    return this.isTtsActive || isSpeaking();
  }

  /**
   * Check if audio is currently listening
   */
  get isListening(): boolean {
    return Boolean(this.activeRecognizer && this.activeRecognizer.isListening);
  }
}

// Global Singleton Instance
export const audioManager = new AudioManager();
