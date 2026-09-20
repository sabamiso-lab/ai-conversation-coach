import { useSpeechRecognition, UseSpeechRecognitionOptions } from '../../hooks/useSpeechRecognition';

export type UseBlitzSpeechOptions = UseSpeechRecognitionOptions;

export function useBlitzSpeech(options: UseBlitzSpeechOptions = {}) {
  return useSpeechRecognition({
    lang: 'en-US',
    continuous: true,
    stopSpeakingOnCleanup: true,
    ...options
  });
}
