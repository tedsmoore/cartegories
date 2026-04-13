import { useEffect, useRef } from 'react';
import { Accelerometer } from 'expo-sensors';

// Device at rest reads ~1.0g (gravity); 1.5 requires noticeable movement
const SHAKE_THRESHOLD = 1.5;
const DEBOUNCE_MS = 1000;

export const useShake = (onShake: () => void) => {
  const lastShakeRef = useRef(0);
  const onShakeRef = useRef(onShake);
  onShakeRef.current = onShake;

  useEffect(() => {
    Accelerometer.setUpdateInterval(100);

    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      const now = Date.now();

      if (magnitude > SHAKE_THRESHOLD && now - lastShakeRef.current > DEBOUNCE_MS) {
        lastShakeRef.current = now;
        onShakeRef.current();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);
};
