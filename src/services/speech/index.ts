/**
 * Central Entry Point for Speech Services
 * Re-exports STT, TTS, AudioManager, and types with 100% backward compatibility.
 */

import { audioManager, AudioManager } from './audioManager';
import { SpeakTextOptions } from './types';

// Export all types
export * from './types';

// Export STT module
export * from './stt';

// Export TTS module utilities
export {
  isSpeechSynthesisSupported,
  findPreferredVoice,
  isSpeaking,
  rawSpeakText
} from './tts';

// Export AudioManager
export { audioManager, AudioManager };

/**
 * High-level Text-to-Speech playback with automatic mutual exclusion against STT.
 * Existing callers of `speakText` automatically benefit from STT abort protection.
 */
export function speakText(text: string, options: SpeakTextOptions = {}): void {
  audioManager.speak(text, options);
}

/**
 * Stop speech synthesis playback.
 */
export function stopSpeaking(): void {
  audioManager.stopPlayback();
}

/**
 * Complete audio stop (both TTS and STT).
 */
export function stopAllAudio(): void {
  audioManager.stopAll();
}
