/**
 * Text-to-Speech (TTS) Module
 * Handles speech synthesis, voice selection, Chrome keep-alive, and playback management.
 */

import { SpeakTextOptions } from './types';

let pendingSpeechTimeout: ReturnType<typeof setTimeout> | null = null;
let keepAliveTimer: ReturnType<typeof setInterval> | null = null;
// Retain reference to active utterances to prevent garbage collection in Chrome during long playback
const activeUtterances = new Set<SpeechSynthesisUtterance>();
let lastSpeakRequest = { text: '', time: 0 };

export const isSpeechSynthesisSupported = (): boolean => {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
};

export function isSpeaking(): boolean {
  if (!isSpeechSynthesisSupported()) return false;
  return window.speechSynthesis.speaking || activeUtterances.size > 0;
}

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

/**
 * Stop any currently playing speech synthesis.
 */
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

/**
 * Play text using Web Speech API SpeechSynthesis.
 */
export function rawSpeakText(
  text: string,
  { lang = 'en-US', rate = 0.95, pitch = 1.0, onEnd, onError }: SpeakTextOptions = {}
): void {
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
