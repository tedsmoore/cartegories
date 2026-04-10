import { useEffect, useRef, useState } from 'react';

type UseCountdownOptions = {
  initialSeconds: number;
  paused: boolean;
  onExpire: () => void;
};

export const useCountdown = ({ initialSeconds, paused, onExpire }: UseCountdownOptions) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const expiredRef = useRef(false);

  // Single interval effect — handles start, pause, resume
  useEffect(() => {
    if (paused || expiredRef.current) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [paused]);

  // Expiry detection — separate from the interval to avoid side effects in setState
  useEffect(() => {
    if (timeLeft <= 0 && !expiredRef.current) {
      expiredRef.current = true;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      onExpire();
    }
  }, [timeLeft, onExpire]);

  const stop = () => {
    expiredRef.current = true;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  return { timeLeft, stop };
};
