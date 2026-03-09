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
          headers: parsed.headers,
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
        <h1 style={styles.title}>LLM Request Block Editor</h1>
      </header>

      <main style={styles.main}>
        <section style={styles.inputSection}>
          <CurlInput
            value={curlInput}
            onChange={setCurlInput}
            onParse={handleParse}
          />
        </section>

        {parsed.url && (
          <>
            <Toolbar
              parsed={parsed}
              canUndo={canUndo}
              canRedo={canRedo}
              onUndo={undo}
              onRedo={redo}
              onRun={handleRun}
              isRunning={isRunning}
            />

            <section style={styles.editSection}>
              <div style={styles.topRow}>
                <UrlBar
                  url={parsed.url}
                  method={parsed.method}
                  onUrlChange={handleUrlChange}
                  onMethodChange={handleMethodChange}
                />
              </div>
              <HeadersEditor
                headers={parsed.headers}
                onChange={handleHeadersChange}
              />
              <div style={styles.payloadSection}>
                <PayloadTree
                  data={parsed.body}
                  url={parsed.url}
                  onChange={handleBodyChange}
                />
              </div>
            </section>

            <section style={styles.responseSection}>
              <ResponseView
                response={response}
                error={error}
                rawStream={rawStream}
                isStreaming={isStreaming}
              />
            </section>
          </>
        )}
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#020617',
    color: '#e2e8f0',
  },
  header: {
    padding: '16px 24px',
    borderBottom: '1px solid #1e293b',
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 700,
    color: '#f8fafc',
  },
  main: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  inputSection: {
    marginBottom: '8px',
  },
  editSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  topRow: {
    display: 'flex',
    gap: '16px',
  },
  payloadSection: {
    marginTop: '8px',
  },
  responseSection: {
    marginTop: '8px',
  },
};
