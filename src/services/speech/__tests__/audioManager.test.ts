import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AudioManager } from '../audioManager';
import { SpeechRecognizer } from '../stt';
import * as ttsModule from '../tts';

describe('AudioManager (Central Orchestrator)', () => {
  let manager: AudioManager;
  let mockRecognizer: SpeechRecognizer;

  beforeEach(() => {
    manager = new AudioManager();

    mockRecognizer = {
      isListening: false,
      supported: true,
      start: vi.fn(),
      stop: vi.fn(),
      abort: vi.fn(),
      clear: vi.fn()
    } as unknown as SpeechRecognizer;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes in idle state', () => {
    expect(manager.getState()).toBe('idle');
    expect(manager.isSpeaking).toBe(false);
    expect(manager.isListening).toBe(false);
  });

  it('automatically aborts active STT recognition when speak() is called', () => {
    mockRecognizer.isListening = true;
    manager.registerRecognizer(mockRecognizer);

    const rawSpeakSpy = vi.spyOn(ttsModule, 'rawSpeakText').mockImplementation(() => {});

    manager.speak('Hello from AI');

    // Speech recognition should be aborted to prevent mic feedback
    expect(mockRecognizer.abort).toHaveBeenCalledTimes(1);
    expect(rawSpeakSpy).toHaveBeenCalledWith('Hello from AI', expect.any(Object));
  });

  it('does not abort recognizer if recognizer is not currently listening', () => {
    mockRecognizer.isListening = false;
    manager.registerRecognizer(mockRecognizer);

    vi.spyOn(ttsModule, 'rawSpeakText').mockImplementation(() => {});

    manager.speak('Hello again');

    expect(mockRecognizer.abort).not.toHaveBeenCalled();
  });

  it('stops TTS playback when onRecognitionStart is triggered', () => {
    const stopPlaybackSpy = vi.spyOn(manager, 'stopPlayback');

    manager.onRecognitionStart(mockRecognizer);

    expect(stopPlaybackSpy).toHaveBeenCalledTimes(1);
  });

  it('stops both TTS and STT when stopAll() is called', () => {
    manager.registerRecognizer(mockRecognizer);
    const stopPlaybackSpy = vi.spyOn(manager, 'stopPlayback');

    manager.stopAll();

    expect(stopPlaybackSpy).toHaveBeenCalledTimes(1);
    expect(mockRecognizer.abort).toHaveBeenCalledTimes(1);
  });

  it('reflects listening state when recognizer is active', () => {
    mockRecognizer.isListening = true;
    manager.registerRecognizer(mockRecognizer);

    expect(manager.getState()).toBe('listening');
    expect(manager.isListening).toBe(true);
  });

  it('unregisters recognizer cleanly', () => {
    manager.registerRecognizer(mockRecognizer);
    manager.unregisterRecognizer(mockRecognizer);

    manager.stopAll();
    // Since it was unregistered, abort should not be called from manager
    expect(mockRecognizer.abort).not.toHaveBeenCalled();
  });
});
