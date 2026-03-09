import React, { useState, useCallback, useEffect } from 'react';
import { CurlInput } from './components/CurlInput';
import { UrlBar } from './components/UrlBar';
import { HeadersEditor } from './components/HeadersEditor';
import { PayloadTree } from './components/PayloadTree';
import { ResponseView } from './components/ResponseView';
import { Toolbar } from './components/Toolbar';
import { useHistory } from './hooks/useHistory';
import { parseCurl, ParsedCurl } from './utils/curlParser';
import { runRequest } from './utils/apiProxy';

const emptyParsed: ParsedCurl = {
  url: '',
  method: 'POST',
  headers: [],
  body: null,
  raw: ''
};

export function App() {
  const [curlInput, setCurlInput] = useState('');
  const [showInput, setShowInput] = useState(true);
  const [showResponse, setShowResponse] = useState(true);
  const [responseHeight, setResponseHeight] = useState(250);
  const { state: parsed, push: pushHistory, undo, redo, canUndo, canRedo, reset: resetHistory } = useHistory<ParsedCurl>(emptyParsed);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [rawStream, setRawStream] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  const handleParse = useCallback(() => {
    if (!curlInput.trim()) return;
    const result = parseCurl(curlInput);
    resetHistory(result);
    setResponse(null);
    setError(null);
    setRawStream('');
    setShowInput(false);
  }, [curlInput, resetHistory]);

  const handleUrlChange = useCallback((url: string) => {
    pushHistory({ ...parsed, url });
  }, [parsed, pushHistory]);

  const handleMethodChange = useCallback((method: string) => {
    pushHistory({ ...parsed, method });
  }, [parsed, pushHistory]);

  const handleHeadersChange = useCallback((headers: { key: string; value: string }[]) => {
    pushHistory({ ...parsed, headers });
  }, [parsed, pushHistory]);

  const handleBodyChange = useCallback((body: any) => {
    pushHistory({ ...parsed, body });
  }, [parsed, pushHistory]);

  const isStreamRequest = parsed.body?.stream === true;

  const handleRun = useCallback(async () => {
    if (!parsed.url) return;
    
    setIsRunning(true);
    setError(null);
    setResponse(null);
    setRawStream('');
    setShowResponse(true);
    
    if (isStreamRequest) {
      setIsStreaming(true);
      try {
        await runRequest({
          url: parsed.url,
          method: parsed.method,
          headers: parsed.headers,
          body: parsed.body,
          stream: true,
          onChunk: (chunk) => {
            setRawStream(prev => prev + chunk);
          }
        });
      } catch (e) {
        setError(e);
      }
      setIsStreaming(false);
      setIsRunning(false);
    } else {
      try {
        const result = await runRequest({
          url: parsed.url,
          method: parsed.method,
          headers: parsed.body,
          body: parsed.body,
        });
        if (result.error) {
          setError(result.error);
        } else {
          setResponse(result.data);
        }
      } catch (e) {
        setError(e);
      }
      setIsRunning(false);
    }
  }, [parsed, isStreamRequest]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, handleRun]);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>LLM Request Editor</h1>
          <button 
            onClick={() => setShowInput(!showInput)} 
            style={{ ...styles.headerBtn, ...(showInput ? styles.headerBtnActive : {}) }}
            title="Toggle curl input"
          >
            {showInput ? '📋' : '📄'}
          </button>
          <button 
            onClick={() => setShowResponse(!showResponse)} 
            style={{ ...styles.headerBtn, ...(showResponse ? styles.headerBtnActive : {}) }}
            title="Toggle response panel"
          >
            {showResponse ? '📤' : '📥'}
          </button>
        </div>
        <Toolbar
          parsed={parsed}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={undo}
          onRedo={redo}
          onRun={handleRun}
          isRunning={isRunning}
        />
      </header>

      {showInput && (
        <div style={styles.inputBar}>
          <CurlInput
            value={curlInput}
            onChange={setCurlInput}
            onParse={handleParse}
          />
        </div>
      )}

      {parsed.url && (
        <div style={{ ...styles.main, ...(showResponse ? { height: `calc(100vh - 120px - ${responseHeight}px)` } : {}) }}>
          <aside style={styles.sidebar}>
            <div style={styles.sidebarSection}>
              <div style={styles.sidebarTitle}>Request</div>
              <UrlBar
                url={parsed.url}
                method={parsed.method}
                onUrlChange={handleUrlChange}
                onMethodChange={handleMethodChange}
              />
            </div>
            <div style={styles.sidebarSection}>
              <div style={styles.sidebarTitle}>Headers</div>
              <HeadersEditor
                headers={parsed.headers}
                onChange={handleHeadersChange}
              />
            </div>
          </aside>
          <main style={styles.editor}>
            <PayloadTree
              data={parsed.body}
              url={parsed.url}
              onChange={handleBodyChange}
            />
          </main>
        </div>
      )}

      {showResponse && (response || error || rawStream || isStreaming) && (
        <div style={{ ...styles.responseDrawer, height: responseHeight }}>
          <div 
            style={styles.resizeHandle}
            onMouseDown={(e) => {
              e.preventDefault();
              const startY = e.clientY;
              const startHeight = responseHeight;
              const onMouseMove = (e: MouseEvent) => {
                const newHeight = startHeight - (e.clientY - startY);
                setResponseHeight(Math.max(100, Math.min(500, newHeight)));
              };
              const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
              };
              document.addEventListener('mousemove', onMouseMove);
              document.addEventListener('mouseup', onMouseUp);
            }}
          />
          <div style={styles.responseHeader}>
            <span style={styles.responseTitle}>Response</span>
            <button onClick={() => setShowResponse(false)} style={styles.closeBtn}>×</button>
          </div>
          <div style={styles.responseContent}>
            <ResponseView
              response={response}
              error={error}
              rawStream={rawStream}
              isStreaming={isStreaming}
            />
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#020617',
    color: '#e2e8f0',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 16px',
    borderBottom: '1px solid #1e293b',
    backgroundColor: '#0f172a',
    flexShrink: 0,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  title: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 600,
    color: '#f8fafc',
  },
  headerBtn: {
    padding: '6px 8px',
    borderRadius: '4px',
    border: '1px solid #334155',
    backgroundColor: '#1e293b',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '14px',
    opacity: 0.6,
  },
  headerBtnActive: {
    opacity: 1,
    backgroundColor: '#334155',
    borderColor: '#475569',
  },
  inputBar: {
    padding: '12px 16px',
    borderBottom: '1px solid #1e293b',
    flexShrink: 0,
  },
  main: {
    display: 'flex',
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  sidebar: {
    width: '320px',
    minWidth: '280px',
    backgroundColor: '#0f172a',
    borderRight: '1px solid #1e293b',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    flexShrink: 0,
  },
  sidebarSection: {
    padding: '12px',
    borderBottom: '1px solid #1e293b',
  },
  sidebarTitle: {
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    color: '#64748b',
    marginBottom: '10px',
    letterSpacing: '0.5px',
  },
  editor: {
    flex: 1,
    overflow: 'auto',
    padding: '12px',
    backgroundColor: '#020617',
  },
  responseDrawer: {
    backgroundColor: '#0f172a',
    borderTop: '1px solid #1e293b',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
  },
  resizeHandle: {
    height: '4px',
    cursor: 'ns-resize',
    backgroundColor: '#1e293b',
    transition: 'background-color 0.2s',
  },
  responseHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    borderBottom: '1px solid #1e293b',
    backgroundColor: '#1e293b',
  },
  responseTitle: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '0 4px',
  },
  responseContent: {
    flex: 1,
    overflow: 'auto',
    padding: '8px',
  },
};