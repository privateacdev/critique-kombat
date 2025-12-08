import { useEffect, useRef, useLayoutEffect } from 'react';

export const useGameLoop = (
  callback: () => void,
  isRunning: boolean
) => {
  const savedCallback = useRef(callback);
  const requestRef = useRef<number | undefined>(undefined);
  const previousTimeRef = useRef<number | undefined>(undefined);
  const accumulatorRef = useRef<number>(0);
  const FIXED_TIME_STEP = 1000 / 60; // 16.67ms

  useLayoutEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!isRunning) {
      previousTimeRef.current = undefined;
      accumulatorRef.current = 0;
      if (requestRef.current !== undefined) cancelAnimationFrame(requestRef.current);
      return;
    }

    const animate = (time: number) => {
      if (previousTimeRef.current === undefined) {
        previousTimeRef.current = time;
      }
      
      const deltaTime = time - previousTimeRef.current;
      previousTimeRef.current = time;
      
      accumulatorRef.current += deltaTime;
      
      // Prevent spiral of death if tab was backgrounded
      if (accumulatorRef.current > 250) accumulatorRef.current = 250;

      while (accumulatorRef.current >= FIXED_TIME_STEP) {
        savedCallback.current();
        accumulatorRef.current -= FIXED_TIME_STEP;
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current !== undefined) cancelAnimationFrame(requestRef.current);
    };
  }, [isRunning]);
};
