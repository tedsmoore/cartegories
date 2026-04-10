import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SoundContextValue = {
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
};

const SoundContext = createContext<SoundContextValue | undefined>(undefined);

export const parseSoundPreference = (stored: string | null): boolean => {
  if (stored === 'false') return false;
  return true;
};

export const SoundProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [soundEnabled, setSoundEnabledState] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('soundFxEnabled').then((val) => {
      setSoundEnabledState(parseSoundPreference(val));
    });
  }, []);

  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
    AsyncStorage.setItem('soundFxEnabled', String(enabled)).catch(() => {});
  };

  return (
    <SoundContext.Provider value={{ soundEnabled, setSoundEnabled }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSoundContext = () => {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error('useSoundContext must be used within SoundProvider');
  return ctx;
};
