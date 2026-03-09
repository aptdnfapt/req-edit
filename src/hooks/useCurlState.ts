import { useState, useCallback } from 'react';
import { parseCurl, ParsedCurl } from '../utils/curlParser';

export function useCurlState() {
  const [curlInput, setCurlInput] = useState('');
  const [parsed, setParsed] = useState<ParsedCurl | null>(null);

  const parseAndSet = useCallback((curl: string) => {
    setCurlInput(curl);
    const result = parseCurl(curl);
    setParsed(result);
    return result;
  }, []);

  const updateParsed = useCallback((updates: Partial<ParsedCurl>) => {
    setParsed(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  return {
    curlInput,
    setCurlInput,
    parsed,
    setParsed,
    parseAndSet,
    updateParsed
  };
}
