import { useState, useRef, useCallback } from "react";

export interface StopwatchState {
  elapsed: number; // ms
  laps: number[];
  isRunning: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
  lap: () => void;
}

export function useStopwatch(): StopwatchState {
  const [elapsed, setElapsed] = useState(0);
  const [laps, setLaps] = useState<number[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const startTimeRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const accumulatedRef = useRef(0);

  const start = useCallback(() => {
    // Guard: prevent duplicate intervals if already running
    if (intervalRef.current) return;
    startTimeRef.current = Date.now();
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setElapsed(accumulatedRef.current + (Date.now() - startTimeRef.current));
    }, 10);
  }, []);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    accumulatedRef.current += Date.now() - startTimeRef.current;
    setElapsed(accumulatedRef.current);
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    accumulatedRef.current = 0;
    startTimeRef.current = 0;
    setElapsed(0);
    setLaps([]);
    setIsRunning(false);
  }, []);

  const lap = useCallback(() => {
    const currentElapsed = accumulatedRef.current + (Date.now() - startTimeRef.current);
    setLaps((prev) => [currentElapsed, ...prev]);
  }, []);

  return { elapsed, laps, isRunning, start, stop, reset, lap };
}
