import { useCallback, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { useSoundContext } from '../state/SoundContext';

const NAILED_SOUND = require('../../assets/sounds/nailed.mp3');
const MISSED_SOUND = require('../../assets/sounds/missed.mp3');

export const useSound = () => {
  const { soundEnabled } = useSoundContext();
  const nailedRef = useRef<Audio.Sound | null>(null);
  const missedRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    const load = async () => {
      const { sound: nailed } = await Audio.Sound.createAsync(NAILED_SOUND);
      nailedRef.current = nailed;
      const { sound: missed } = await Audio.Sound.createAsync(MISSED_SOUND);
      missedRef.current = missed;
    };
    load();

    return () => {
      nailedRef.current?.unloadAsync();
      missedRef.current?.unloadAsync();
    };
  }, []);

  const playNailed = useCallback(async () => {
    if (!soundEnabled || !nailedRef.current) return;
    await nailedRef.current.replayAsync();
  }, [soundEnabled]);

  const playMissed = useCallback(async () => {
    if (!soundEnabled || !missedRef.current) return;
    await missedRef.current.replayAsync();
  }, [soundEnabled]);

  return { playNailed, playMissed };
};
