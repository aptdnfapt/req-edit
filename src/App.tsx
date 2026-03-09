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

export type Theme = 'dark' | 'light';

export const ThemeContext = React.createContext<{
  theme: Theme;
  toggleTheme: () => void;
}>({ theme: 'dark', toggleTheme: () => {} });

export function App() {
  const [curlInput, setCurlInput] = useState('');
  const [showInput, setShowInput] = useState(true);
  const [showResponse, setShowResponse] = useState(true);
  const [responseHeight, setResponseHeight] = useState(200);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [theme, setTheme] = useState<Theme>('dark');
  const { state: parsed, push: pushHistory, undo, redo, canUndo, canRedo, reset: resetHistory } = useHistory<ParsedCurl>(emptyParsed);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [rawStream, setRawStream] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  const toggleTheme = useCallback(() => {
    setTheme(t => t === 'dark' ? 'light' : 'dark');
  }, []);

  const colors = theme === 'dark' ? {
    bg: '#0a0a0a',
    bgAlt: '#141414',
    bgAlt2: '#1a1a1a',
    border: '#2a2a2a',
    borderAlt: '#3a3a3a',
    text: '#e0e0e0',
    textMuted: '#808080',
    accent: '#606060',
    accentHover: '#707070',
    success: '#505050',
    error: '#402020',
    errorText: '#ff8080',
  } : {
    bg: '#ffffff',
    bgAlt: '#f5f5f5',
    bgAlt2: '#eaeaea',
    border: '#d0d0d0',
    borderAlt: '#c0c0c0',
    text: '#1a1a1a',
    textMuted: '#606060',
    accent: '#a0a0a0',
    accentHover: '#909090',
    success: '#808080',
    error: '#ffe0e0',
    errorText: '#cc0000',
  };

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

  const styles = getStyles(colors);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div style={{ ...styles.container, color: colors.text }}>
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <span style={styles.title}>ReqEdit</span>
            <button onClick={() => setShowInput(!showInput)} style={styles.headerBtn} title="Toggle input">
              IN
            </button>
            <button onClick={() => setShowResponse(!showResponse)} style={styles.headerBtn} title="Toggle response">
              OUT
            </button>
          </div>
          <div style={styles.headerRight}>
            <button onClick={toggleTheme} style={styles.themeBtn}>
              {theme === 'dark' ? 'LIGHT' : 'DARK'}
            </button>
            <Toolbar
              parsed={parsed}
              canUndo={canUndo}
              canRedo={canRedo}
              onUndo={undo}
              onRedo={redo}
              onRun={handleRun}
              isRunning={isRunning}
              colors={colors}
            />
          </div>
        </header>

        {showInput && (
          <div style={styles.inputBar}>
            <CurlInput value={curlInput} onChange={setCurlInput} onParse={handleParse} colors={colors} />
          </div>
        )}

        {parsed.url && (
          <div style={{ ...styles.main, ...(showResponse ? { height: `calc(100vh - 52px - ${responseHeight}px)` } : {}) }}>
            <aside style={{ ...styles.sidebar, width: sidebarWidth }}>
              <div style={styles.sidebarSection}>
                <div style={styles.sidebarTitle}>REQUEST</div>
                <UrlBar url={parsed.url} method={parsed.method} onUrlChange={handleUrlChange} onMethodChange={handleMethodChange} colors={colors} />
              </div>
              <div style={styles.sidebarSection}>
                <div style={styles.sidebarTitle}>HEADERS</div>
                <HeadersEditor headers={parsed.headers} onChange={handleHeadersChange} colors={colors} />
              </div>
              <div
                style={styles.sidebarResize}
                onMouseDown={(e) => {
                  e.preventDefault();
                  const startX = e.clientX;
                  const startWidth = sidebarWidth;
                  const onMouseMove = (e: MouseEvent) => {
                    const newWidth = startWidth + (e.clientX - startX);
                    setSidebarWidth(Math.max(200, Math.min(600, newWidth)));
                  };
                  const onMouseUp = () => {
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                  };
                  document.addEventListener('mousemove', onMouseMove);
                  document.addEventListener('mouseup', onMouseUp);
                }}
              />
            </aside>
            <main style={styles.editor}>
              <PayloadTree data={parsed.body} url={parsed.url} onChange={handleBodyChange} colors={colors} />
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
              <span style={styles.responseTitle}>RESPONSE</span>
              <button onClick={() => setShowResponse(false)} style={styles.closeBtn}>X</button>
            </div>
            <div style={styles.responseContent}>
              <ResponseView response={response} error={error} rawStream={rawStream} isStreaming={isStreaming} colors={colors} />
            </div>
          </div>
        )}
      </div>
    </ThemeContext.Provider>
  );
}

function getStyles(c: typeof colors): Record<string, React.CSSProperties> {
  return {
    container: {
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: c.bg,
      overflow: 'hidden',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '6px 12px',
      borderBottom: `1px solid ${c.border}`,
      backgroundColor: c.bgAlt,
      flexShrink: 0,
      height: '28px',
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    headerRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    title: {
      fontSize: '12px',
      fontWeight: 700,
      color: c.text,
      letterSpacing: '1px',
    },
    headerBtn: {
      padding: '3px 8px',
      border: 'none',
      backgroundColor: c.bgAlt2,
      color: c.textMuted,
      cursor: 'pointer',
      fontSize: '10px',
      fontWeight: 600,
    },
    themeBtn: {
      padding: '3px 8px',
      border: 'none',
      backgroundColor: c.bgAlt2,
      color: c.textMuted,
      cursor: 'pointer',
      fontSize: '10px',
      fontWeight: 600,
    },
    inputBar: {
      padding: '8px 12px',
      borderBottom: `1px solid ${c.border}`,
      backgroundColor: c.bgAlt,
      flexShrink: 0,
    },
    main: {
      display: 'flex',
      flex: 1,
      minHeight: 0,
      overflow: 'hidden',
    },
    sidebar: {
      backgroundColor: c.bgAlt,
      borderRight: `1px solid ${c.border}`,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'auto',
      flexShrink: 0,
      position: 'relative',
    },
    sidebarResize: {
      position: 'absolute',
      right: 0,
      top: 0,
      bottom: 0,
      width: '4px',
      cursor: 'ew-resize',
      backgroundColor: c.border,
    },
    sidebarSection: {
      padding: '10px',
      borderBottom: `1px solid ${c.border}`,
    },
    sidebarTitle: {
      fontSize: '9px',
      fontWeight: 700,
      textTransform: 'uppercase',
      color: c.textMuted,
      marginBottom: '8px',
      letterSpacing: '1px',
    },
    editor: {
      flex: 1,
      overflow: 'auto',
      padding: '10px',
      backgroundColor: c.bg,
    },
    responseDrawer: {
      backgroundColor: c.bgAlt,
      borderTop: `1px solid ${c.border}`,
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    },
    resizeHandle: {
      height: '3px',
      cursor: 'ns-resize',
      backgroundColor: c.border,
    },
    responseHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '4px 10px',
      borderBottom: `1px solid ${c.border}`,
      backgroundColor: c.bgAlt2,
    },
    responseTitle: {
      fontSize: '9px',
      fontWeight: 700,
      color: c.textMuted,
      textTransform: 'uppercase',
      letterSpacing: '1px',
    },
    closeBtn: {
      background: 'none',
      border: 'none',
      color: c.textMuted,
      fontSize: '10px',
      cursor: 'pointer',
      fontWeight: 600,
    },
    responseContent: {
      flex: 1,
      overflow: 'auto',
    },
  };
}

const colors = {
  bg: '#0a0a0a',
  bgAlt: '#141414',
  bgAlt2: '#1a1a1a',
  border: '#2a2a2a',
  borderAlt: '#3a3a3a',
  text: '#e0e0e0',
  textMuted: '#808080',
  accent: '#606060',
  accentHover: '#707070',
  success: '#505050',
  error: '#402020',
  errorText: '#ff8080',
};