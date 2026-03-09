import React from 'react';
import { ParsedCurl, toMinifiedCurl, toPrettyCurl } from '../utils/curlParser';

interface Props {
  parsed: ParsedCurl | null;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onRun: () => void;
  isRunning: boolean;
  colors: any;
}

export function Toolbar({ parsed, onRun, isRunning, colors }: Props) {
  const styles = getStyles(colors);

  const copyCurl = (format: 'minified' | 'pretty') => {
    if (!parsed) return;
    const curl = format === 'minified' ? toMinifiedCurl(parsed) : toPrettyCurl(parsed);
    navigator.clipboard.writeText(curl);
  };

  return (
    <div style={styles.container}>
      <button onClick={() => copyCurl('minified')} disabled={!parsed} style={{ ...styles.btn, ...(!parsed ? styles.btnDisabled : {}) }} title="Copy minified">MIN</button>
      <button onClick={() => copyCurl('pretty')} disabled={!parsed} style={{ ...styles.btn, ...(!parsed ? styles.btnDisabled : {}) }} title="Copy pretty">FMT</button>
      <button onClick={onRun} disabled={!parsed || isRunning} style={{ ...styles.btn, ...styles.btnRun, ...((parsed && !isRunning) ? {} : styles.btnDisabled) }}>
        {isRunning ? '...' : 'RUN'}
      </button>
    </div>
  );
}

function getStyles(c: any): Record<string, React.CSSProperties> {
  return {
    container: {
      display: 'flex',
      gap: '4px',
      alignItems: 'center',
    },
    btn: {
      padding: '4px 10px',
      border: 'none',
      backgroundColor: c.bgAlt2,
      color: c.textMuted,
      fontWeight: 600,
      cursor: 'pointer',
      fontSize: '10px',
    },
    btnRun: {
      backgroundColor: c.success,
      color: c.text,
      fontWeight: 700,
    },
    btnDisabled: {
      opacity: 0.4,
      cursor: 'not-allowed',
    },
  };
}