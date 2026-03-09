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
  const [view, setView] = useState<'tree' | 'raw'>('tree');
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
        <div style={styles.header}>
          <span style={styles.title}>Response (Streaming)</span>
        </div>
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
        <span style={styles.title}>Response</span>
        <div style={styles.tabs}>
          <button 
            onClick={() => setView('tree')} 
            style={{ ...styles.tab, ...(view === 'tree' ? styles.tabActive : {}) }}
          >Tree</button>
          <button 
            onClick={() => setView('raw')} 
            style={{ ...styles.tab, ...(view === 'raw' ? styles.tabActive : {}) }}
          >Raw</button>
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
    gap: '8px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#e2e8f0',
  },
  tabs: {
    display: 'flex',
    gap: '4px',
  },
  tab: {
    padding: '4px 12px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#1e293b',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '12px',
  },
  tabActive: {
    backgroundColor: '#3b82f6',
    color: 'white',
  },
  content: {
    borderRadius: '8px',
    border: '1px solid #334155',
    backgroundColor: '#0f172a',
    overflow: 'hidden',
  },
  editorWrap: {
    height: '400px',
  },
  rawContent: {
    padding: '12px',
    margin: 0,
    color: '#e2e8f0',
    fontSize: '13px',
    fontFamily: 'monospace',
    maxHeight: '400px',
    overflow: 'auto',
    whiteSpace: 'pre-wrap',
  },
  errorBox: {
    borderRadius: '8px',
    border: '1px solid #991b1b',
    backgroundColor: '#1a0000',
    padding: '12px',
  },
  errorTitle: {
    color: '#f87171',
    fontWeight: 600,
    marginBottom: '8px',
    fontSize: '14px',
  },
  errorContent: {
    margin: 0,
    color: '#fca5a5',
    fontSize: '12px',
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
  },
  streamBox: {
    borderRadius: '8px',
    border: '1px solid #334155',
    backgroundColor: '#0f172a',
    padding: '12px',
    maxHeight: '400px',
    overflow: 'auto',
  },
  streamContent: {
    margin: 0,
    color: '#7dd3fc',
    fontSize: '12px',
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
  },
  empty: {
    padding: '40px',
    textAlign: 'center',
    color: '#64748b',
    fontSize: '14px',
    borderRadius: '8px',
    border: '1px dashed #334155',
  },
};
