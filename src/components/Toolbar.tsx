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
}

export function Toolbar({ parsed, canUndo, canRedo, onUndo, onRedo, onRun, isRunning }: Props) {
  const copyCurl = (format: 'minified' | 'pretty') => {
    if (!parsed) return;
    const curl = format === 'minified' ? toMinifiedCurl(parsed) : toPrettyCurl(parsed);
    navigator.clipboard.writeText(curl);
  };

  return (
    <div style={styles.container}>
      <div style={styles.group}>
        <button 
          onClick={onUndo} 
          disabled={!canUndo}
          style={{ ...styles.btn, ...styles.btnSmall, ...(canUndo ? {} : styles.btnDisabled) }}
        >↶ Undo</button>
        <button 
          onClick={onRedo} 
          disabled={!canRedo}
          style={{ ...styles.btn, ...styles.btnSmall, ...(canRedo ? {} : styles.btnDisabled) }}
        >↷ Redo</button>
      </div>
      
      <div style={styles.group}>
        <button 
          onClick={() => copyCurl('minified')} 
          disabled={!parsed}
          style={{ ...styles.btn, ...styles.btnSecondary, ...styles.btnSmall, ...(parsed ? {} : styles.btnDisabled) }}
        >Copy Minified</button>
        <button 
          onClick={() => copyCurl('pretty')} 
          disabled={!parsed}
          style={{ ...styles.btn, ...styles.btnSecondary, ...styles.btnSmall, ...(parsed ? {} : styles.btnDisabled) }}
        >Copy Pretty</button>
      </div>

      <button 
        onClick={onRun} 
        disabled={!parsed || isRunning}
        style={{ ...styles.btn, ...styles.btnRun, ...((parsed && !isRunning) ? {} : styles.btnDisabled) }}
      >
        {isRunning ? 'Running...' : '▶ Run'}
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    padding: '12px',
    backgroundColor: '#1e293b',
    borderRadius: '8px',
    flexWrap: 'wrap',
  },
  group: {
    display: 'flex',
    gap: '6px',
  },
  btn: {
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '13px',
  },
  btnSmall: {
    padding: '6px 12px',
    fontSize: '12px',
  },
  btnSecondary: {
    backgroundColor: '#334155',
    color: '#e2e8f0',
  },
  btnRun: {
    backgroundColor: '#059669',
    color: 'white',
    marginLeft: 'auto',
    padding: '8px 24px',
  },
  btnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
};
