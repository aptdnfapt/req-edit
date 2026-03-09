import React, { useState, useCallback, useEffect } from 'react';
import { CurlInput } from './components/CurlInput';
import { UrlBar } from './components/UrlBar';
import { HeadersEditor } from './components/HeadersEditor';
import { PayloadTree } from './components/PayloadTree';
import { ResponseView } from './components/ResponseView';
import { Toolbar } from './components/Toolbar';
import { useHistory } from './hooks/useHistory';
import { parseCurl, ParsedCurl, toPrettyCurl } from './utils/curlParser';
import { runRequest } from './utils/apiProxy';

const emptyHeaders = { url: '', method: 'POST', headers: [] as { key: string; value: string }[] };

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
  const [sidebarView, setSidebarView] = useState<'structured' | 'raw'>('structured');
  const [theme, setTheme] = useState<Theme>('dark');
  
  // Separate histories for headers and body
  const headerHistory = useHistory<typeof emptyHeaders>(emptyHeaders);
  const bodyHistory = useHistory<any>(null);
  
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [rawStream, setRawStream] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  const toggleTheme = useCallback(() => {
    setTheme(t => t === 'dark' ? 'light' : 'dark');
  }, []);

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

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

  // Combined parsed object
  const parsed: ParsedCurl = {
    url: headerHistory.state.url,
    method: headerHistory.state.method,
    headers: headerHistory.state.headers,
    body: bodyHistory.state,
    raw: ''
  };

  const handleParse = useCallback(() => {
    if (!curlInput.trim()) return;
    const result = parseCurl(curlInput);
    headerHistory.reset({
      url: result.url,
      method: result.method,
      headers: result.headers
    });
    bodyHistory.reset(result.body);
    setResponse(null);
    setError(null);
    setRawStream('');
    setShowInput(false);
  }, [curlInput, headerHistory, bodyHistory]);

  const handleUrlChange = useCallback((url: string) => {
    headerHistory.push({ ...headerHistory.state, url });
  }, [headerHistory]);

  const handleMethodChange = useCallback((method: string) => {
    headerHistory.push({ ...headerHistory.state, method });
  }, [headerHistory]);

  const handleHeadersChange = useCallback((headers: { key: string; value: string }[]) => {
    headerHistory.push({ ...headerHistory.state, headers });
  }, [headerHistory]);

  const handleBodyChange = useCallback((body: any) => {
    bodyHistory.push(body);
  }, [bodyHistory]);

  const isStreamRequest = bodyHistory.state?.stream === true;

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
          // Redo - determine which section is focused
          if (document.activeElement?.closest('[data-section="body"]')) {
            bodyHistory.redo();
          } else {
            headerHistory.redo();
          }
        } else {
          // Undo
          if (document.activeElement?.closest('[data-section="body"]')) {
            bodyHistory.undo();
          } else {
            headerHistory.undo();
          }
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [headerHistory, bodyHistory, handleRun]);

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
              canUndo={false}
              canRedo={false}
              onUndo={() => {}}
              onRedo={() => {}}
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
            <aside style={{ ...styles.sidebar, width: sidebarWidth }} data-section="headers">
              <div style={styles.sidebarSection}>
                <div style={styles.sidebarHeader}>
                  <span style={styles.sidebarTitle}>REQUEST</span>
                  <div style={styles.viewToggle}>
                    <button onClick={() => setSidebarView('structured')} style={{ ...styles.viewBtn, ...(sidebarView === 'structured' ? styles.viewBtnActive : {}) }}>FORM</button>
                    <button onClick={() => setSidebarView('raw')} style={{ ...styles.viewBtn, ...(sidebarView === 'raw' ? styles.viewBtnActive : {}) }}>RAW</button>
                  </div>
                </div>
                {sidebarView === 'structured' ? (
                  <>
                    <UrlBar url={parsed.url} method={parsed.method} onUrlChange={handleUrlChange} onMethodChange={handleMethodChange} colors={colors} />
                    <div style={styles.sectionSpacer}>
                      <div style={styles.sidebarTitleWithActions}>
                        <div style={styles.undoBtns}>
                          <button onClick={headerHistory.undo} disabled={!headerHistory.canUndo} style={{ ...styles.undoBtn, ...(!headerHistory.canUndo ? styles.undoDisabled : {}) }}>UNDO</button>
                          <button onClick={headerHistory.redo} disabled={!headerHistory.canRedo} style={{ ...styles.undoBtn, ...(!headerHistory.canRedo ? styles.undoDisabled : {}) }}>REDO</button>
                        </div>
                      </div>
                      <HeadersEditor headers={parsed.headers} onChange={handleHeadersChange} colors={colors} />
                    </div>
                  </>
                ) : (
                  <textarea
                    value={toPrettyCurl(parsed)}
                    readOnly
                    style={styles.rawTextarea}
                    spellCheck={false}
                  />
                )}
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
            <main style={styles.editor} data-section="body">
              <PayloadTree 
                data={parsed.body} 
                url={parsed.url} 
                onChange={handleBodyChange} 
                colors={colors}
                canUndo={bodyHistory.canUndo}
                canRedo={bodyHistory.canRedo}
                onUndo={bodyHistory.undo}
                onRedo={bodyHistory.redo}
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

function getStyles(c: any): Record<string, React.CSSProperties> {
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
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    },
    sidebarHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '8px',
    },
    sidebarTitle: {
      fontSize: '9px',
      fontWeight: 700,
      textTransform: 'uppercase',
      color: c.textMuted,
      letterSpacing: '1px',
    },
    sidebarTitleWithActions: {
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'center',
      gap: '4px',
      marginBottom: '8px',
    },
    undoBtns: {
      display: 'flex',
      gap: '4px',
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
    viewToggle: {
      display: 'flex',
      gap: '2px',
    },
    viewBtn: {
      padding: '2px 6px',
      border: 'none',
      backgroundColor: 'transparent',
      color: c.textMuted,
      cursor: 'pointer',
      fontSize: '9px',
      fontWeight: 600,
    },
    viewBtnActive: {
      backgroundColor: c.accent,
      color: c.text,
    },
    sectionSpacer: {
      marginTop: '10px',
      flex: 1,
      overflow: 'auto',
    },
    rawTextarea: {
      flex: 1,
      width: '100%',
      padding: '8px',
      border: 'none',
      backgroundColor: c.bgAlt2,
      color: c.text,
      fontSize: '10px',
      fontFamily: 'monospace',
      resize: 'none',
      whiteSpace: 'pre',
      overflow: 'auto',
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