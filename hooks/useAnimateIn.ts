import { useState, useEffect } from 'react';

export function useAnimateIn(delayMs: number = 100) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimated(true);
    }, delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  return animated;
}
