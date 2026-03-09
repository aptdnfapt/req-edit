import { useState, useCallback } from 'react';

export function useHistory<T>(initialState: T) {
  const [history, setHistory] = useState<T[]>([initialState]);

  const push = useCallback((newState: T) => {
    setHistory(prev => [...prev, newState]);
  }, []);

  const undo = useCallback(() => {
    setHistory(prev => prev.length > 1 ? prev.slice(0, -1) : prev);
  }, []);

  const redo = useCallback(() => {
  }, []);

  const reset = useCallback((newState: T) => {
    setHistory([newState]);
  }, []);

  const canUndo = history.length > 1;
  const canRedo = false;

  return {
    state: history[history.length - 1],
    push,
    undo,
    redo,
    canUndo,
    canRedo,
    reset
  };
}