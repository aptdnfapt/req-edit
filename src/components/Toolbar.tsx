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
          style={{ ...styles.btn, ...(canUndo ? {} : styles.btnDisabled) }}
          title="Undo"
        >↶</button>
        <button 
          onClick={onRedo} 
          disabled={!canRedo}
          style={{ ...styles.btn, ...(canRedo ? {} : styles.btnDisabled) }}
          title="Redo"
        >↷</button>
      </div>
      
      <div style={styles.group}>
        <button 
          onClick={() => copyCurl('minified')} 
          disabled={!parsed}
          style={{ ...styles.btn, ...(parsed ? {} : styles.btnDisabled) }}
          title="Copy minified curl"
        >{ }{ }{ }</button>
        <button 
          onClick={() => copyCurl('pretty')} 
          disabled={!parsed}
          style={{ ...styles.btn, ...(parsed ? {} : styles.btnDisabled) }}
          title="Copy pretty curl"
        >{  }</button>
      </div>

      <button 
        onClick={onRun} 
        disabled={!parsed || isRunning}
        style={{ ...styles.btn, ...styles.btnRun, ...((parsed && !isRunning) ? {} : styles.btnDisabled) }}
      >
        {isRunning ? '...' : '▶'}
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  group: {
    display: 'flex',
    gap: '2px',
  },
  btn: {
    padding: '5px 10px',
    borderRadius: '4px',
    border: '1px solid #334155',
    backgroundColor: '#1e293b',
    color: '#94a3b8',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '12px',
  },
  btnRun: {
    backgroundColor: '#059669',
    borderColor: '#059669',
    color: 'white',
    padding: '5px 14px',
  },
  btnDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
};