import React, { useRef, useEffect, useState } from 'react';
import JSONEditor from 'jsoneditor';
import 'jsoneditor/dist/jsoneditor.min.css';

interface Props {
  response: any;
  error: any;
  rawStream: string;
  isStreaming: boolean;
}

export function ResponseView({ response, error, rawStream, isStreaming }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<JSONEditor | null>(null);
  const [view, setView] = useState<'tree' | 'raw'>('raw');
  const isStream = isStreaming || rawStream.length > 0;

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
          <button 
            onClick={() => setView('raw')} 
            style={{ ...styles.tab, ...(view === 'raw' ? styles.tabActive : {}) }}
          >Raw</button>
          <button 
            onClick={() => setView('tree')} 
            style={{ ...styles.tab, ...(view === 'tree' ? styles.tabActive : {}) }}
          >Tree</button>
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

const styles: Record<string, React.CSSProperties> = {
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
    padding: '4px 8px',
    borderBottom: '1px solid #1e293b',
    flexShrink: 0,
  },
  tabs: {
    display: 'flex',
    gap: '2px',
  },
  tab: {
    padding: '3px 8px',
    borderRadius: '3px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#64748b',
    cursor: 'pointer',
    fontSize: '10px',
  },
  tabActive: {
    backgroundColor: '#334155',
    color: '#e2e8f0',
  },
  content: {
    flex: 1,
    overflow: 'auto',
  },
  editorWrap: {
    height: '100%',
  },
  rawContent: {
    padding: '8px',
    margin: 0,
    color: '#e2e8f0',
    fontSize: '11px',
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
  },
  errorBox: {
    padding: '8px',
    flex: 1,
    overflow: 'auto',
  },
  errorTitle: {
    color: '#f87171',
    fontWeight: 600,
    marginBottom: '6px',
    fontSize: '12px',
  },
  errorContent: {
    margin: 0,
    color: '#fca5a5',
    fontSize: '11px',
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    backgroundColor: '#1a0000',
    padding: '8px',
    borderRadius: '4px',
  },
  streamBox: {
    flex: 1,
    overflow: 'auto',
    padding: '8px',
  },
  streamContent: {
    margin: 0,
    color: '#7dd3fc',
    fontSize: '11px',
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
  },
  empty: {
    padding: '20px',
    textAlign: 'center',
    color: '#64748b',
    fontSize: '12px',
  },
};