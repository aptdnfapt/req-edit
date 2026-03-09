import React, { useRef, useEffect, useState } from 'react';
import JSONEditor from 'jsoneditor';
import 'jsoneditor/dist/jsoneditor.min.css';
import { detectProvider } from '../utils/llmFormat';

interface Props {
  data: any;
  url: string;
  onChange: (data: any) => void;
  colors: any;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

export function PayloadTree({ data, url, onChange, colors, canUndo, canRedo, onUndo, onRedo }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<JSONEditor | null>(null);
  const [view, setView] = useState<'tree' | 'raw'>('tree');
  const provider = detectProvider(url);
  const styles = getStyles(colors);

  useEffect(() => {
    if (containerRef.current && !editorRef.current && view === 'tree') {
      editorRef.current = new JSONEditor(containerRef.current, {
        mode: 'tree',
        modes: ['tree', 'code'],
        onChangeText: (jsonStr: string) => {
          try {
            const parsed = JSON.parse(jsonStr);
            onChange(parsed);
          } catch {}
        },
      });
      if (data) {
        editorRef.current.set(data);
      }
    }
    
    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [view]);

  useEffect(() => {
    if (editorRef.current && data) {
      try {
        editorRef.current.update(data);
      } catch {}
    }
  }, [data]);

  if (!data) {
    return <div style={styles.empty}>No payload</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>PAYLOAD ({provider})</span>
        <div style={styles.tabs}>
          {(canUndo || canRedo) && (
            <div style={styles.undoBtns}>
              <button onClick={onUndo} disabled={!canUndo} style={{ ...styles.undoBtn, ...(!canUndo ? styles.undoDisabled : {}) }}>UNDO</button>
              <button onClick={onRedo} disabled={!canRedo} style={{ ...styles.undoBtn, ...(!canRedo ? styles.undoDisabled : {}) }}>REDO</button>
            </div>
          )}
          <button onClick={() => setView('tree')} style={{ ...styles.tab, ...(view === 'tree' ? styles.tabActive : {}) }}>TREE</button>
          <button onClick={() => setView('raw')} style={{ ...styles.tab, ...(view === 'raw' ? styles.tabActive : {}) }}>RAW</button>
        </div>
      </div>
      
      <div style={styles.content}>
        {view === 'tree' ? (
          <div ref={containerRef} style={styles.editorWrap} />
        ) : (
          <textarea
            value={JSON.stringify(data, null, 2)}
            onChange={e => {
              try {
                const parsed = JSON.parse(e.target.value);
                onChange(parsed);
              } catch {}
            }}
            style={styles.rawInput}
            spellCheck={false}
          />
        )}
      </div>
    </div>
  );
}

function getStyles(c: any): Record<string, React.CSSProperties> {
  return {
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: c.bgAlt,
      border: `1px solid ${c.border}`,
      overflow: 'hidden',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '6px 10px',
      borderBottom: `1px solid ${c.border}`,
      backgroundColor: c.bgAlt2,
      flexShrink: 0,
    },
    title: {
      fontSize: '9px',
      fontWeight: 700,
      color: c.textMuted,
      textTransform: 'uppercase',
      letterSpacing: '1px',
    },
    tabs: {
      display: 'flex',
      gap: '2px',
    },
    undoBtns: {
      display: 'flex',
      gap: '4px',
      marginRight: '8px',
    },
    undoBtn: {
      padding: '2px 8px',
      border: 'none',
      backgroundColor: c.bgAlt2,
      color: c.textMuted,
      cursor: 'pointer',
      fontSize: '9px',
      fontWeight: 600,
    },
    undoDisabled: {
      opacity: 0.3,
      cursor: 'not-allowed',
    },
    tab: {
      padding: '3px 8px',
      border: 'none',
      backgroundColor: 'transparent',
      color: c.textMuted,
      cursor: 'pointer',
      fontSize: '9px',
      fontWeight: 600,
    },
    tabActive: {
      backgroundColor: c.accent,
      color: c.text,
    },
    content: {
      flex: 1,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    },
    editorWrap: {
      flex: 1,
      minHeight: '400px',
    },
    rawInput: {
      flex: 1,
      width: '100%',
      padding: '10px',
      border: 'none',
      backgroundColor: c.bgAlt,
      color: c.text,
      fontSize: '11px',
      fontFamily: 'monospace',
      resize: 'none',
    },
    empty: {
      padding: '40px',
      textAlign: 'center',
      color: c.textMuted,
      fontSize: '12px',
    },
  };
}