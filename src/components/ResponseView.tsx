import React, { useRef, useEffect, useState } from 'react';
import JSONEditor from 'jsoneditor';
import 'jsoneditor/dist/jsoneditor.min.css';

interface Props {
  response: any;
  error: any;
  rawStream: string;
  isStreaming: boolean;
  colors: any;
}

export function ResponseView({ response, error, rawStream, isStreaming, colors }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<JSONEditor | null>(null);
  const [view, setView] = useState<'tree' | 'raw'>('raw');
  const isStream = isStreaming || rawStream.length > 0;
  const styles = getStyles(colors);

  useEffect(() => {
    if (containerRef.current && !editorRef.current && view === 'tree' && response) {
      editorRef.current = new JSONEditor(containerRef.current, {
        mode: 'view',
        modes: ['view', 'code'],
      });
      editorRef.current.set(response);
    }
    
    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [view, response]);

  useEffect(() => {
    if (editorRef.current && response) {
      try {
        editorRef.current.update(response);
      } catch {}
    }
  }, [response]);

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorBox}>
          <div style={styles.errorTitle}>Error</div>
          <pre style={styles.errorContent}>
            {typeof error === 'string' ? error : JSON.stringify(error, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  if (isStream) {
    return (
      <div style={styles.container}>
        <div style={styles.streamBox}>
          <pre style={styles.streamContent}>{rawStream}</pre>
        </div>
      </div>
    );
  }

  if (!response) {
    return <div style={styles.empty}>Run request to see response</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.tabs}>
          <button onClick={() => setView('raw')} style={{ ...styles.tab, ...(view === 'raw' ? styles.tabActive : {}) }}>RAW</button>
          <button onClick={() => setView('tree')} style={{ ...styles.tab, ...(view === 'tree' ? styles.tabActive : {}) }}>TREE</button>
        </div>
      </div>
      
      <div style={styles.content}>
        {view === 'tree' ? (
          <div ref={containerRef} style={styles.editorWrap} />
        ) : (
          <pre style={styles.rawContent}>{JSON.stringify(response, null, 2)}</pre>
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
      overflow: 'hidden',
    },
    header: {
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      padding: '3px 6px',
      borderBottom: `1px solid ${c.border}`,
      flexShrink: 0,
    },
    tabs: {
      display: 'flex',
      gap: '2px',
    },
    tab: {
      padding: '2px 6px',
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
      overflow: 'auto',
    },
    editorWrap: {
      height: '100%',
    },
    rawContent: {
      padding: '6px',
      margin: 0,
      color: c.text,
      fontSize: '10px',
      fontFamily: 'monospace',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-all',
    },
    errorBox: {
      padding: '6px',
      flex: 1,
      overflow: 'auto',
    },
    errorTitle: {
      color: c.errorText,
      fontWeight: 600,
      marginBottom: '4px',
      fontSize: '11px',
    },
    errorContent: {
      margin: 0,
      color: c.errorText,
      fontSize: '10px',
      fontFamily: 'monospace',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-all',
      backgroundColor: c.error,
      padding: '6px',
    },
    streamBox: {
      flex: 1,
      overflow: 'auto',
      padding: '6px',
    },
    streamContent: {
      margin: 0,
      color: c.textMuted,
      fontSize: '10px',
      fontFamily: 'monospace',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-all',
    },
    empty: {
      padding: '20px',
      textAlign: 'center',
      color: c.textMuted,
      fontSize: '11px',
    },
  };
}