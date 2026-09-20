import { useAudioPlayer, UseAudioPlayerOptions } from '../../hooks/useAudioPlayer';

export type UseShadowingAudioOptions = UseAudioPlayerOptions;

export function useShadowingAudio(options: UseShadowingAudioOptions = {}) {
  return useAudioPlayer(options);
}
