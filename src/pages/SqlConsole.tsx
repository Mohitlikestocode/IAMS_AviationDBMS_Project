import React, { useState } from 'react';

const SqlConsole = () => {
  const [query, setQuery] = useState('SELECT * FROM flight LIMIT 10;');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [execTime, setExecTime] = useState(0);

  const handleExecute = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    const startTime = performance.now();
    
    try {
      const response = await fetch('http://localhost:5000/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: query })
      });
      const data = await response.json();
      
      const timeTaken = Math.round(performance.now() - startTime);
      setExecTime(timeTaken);

      if (data.error) {
        setError(data.error);
        setHistory(prev => [{ sql: query, time: new Date(), error: data.error }, ...prev]);
      } else {
        setResults(data);
        setHistory(prev => [{ sql: query, time: new Date(), timeTaken, success: true }, ...prev]);
      }
    } catch (err) {
      setError('Connection refused. Is the backend running?');
      setHistory(prev => [{ sql: query, time: new Date(), error: 'Network Error' }, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <React.Fragment>
      <main className="ml-64 pt-16 h-screen flex flex-col bg-surface overflow-hidden">
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-[3] flex flex-col min-w-0">
            {/* Editor Header/Toolbar */}
            <div className="h-14 flex items-center justify-between px-6 bg-surface-container-low border-b border-white/5">
              <div className="flex items-center gap-4">
                <div className="flex bg-surface-container-lowest rounded-lg p-1">
                  <button className="px-4 py-1.5 text-xs font-bold bg-primary/10 text-primary rounded-md">Main Console</button>
                </div>
                <span className="text-on-surface-variant text-xs flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> MySQL Local
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleExecute} disabled={loading} className="flex items-center gap-2 px-6 py-2 bg-primary text-on-primary font-bold rounded-xl active:scale-95 transition-all shadow-lg shadow-primary/10 disabled:opacity-50">
                  <span className="material-symbols-outlined text-xl">{loading ? 'sync' : 'play_arrow'}</span>
                  Execute
                </button>
              </div>
            </div>
            
            {/* Multi-line Editor */}
            <div className="h-64 flex-shrink-0 bg-[#0a0e16] relative overflow-hidden border-b border-white/5 p-4 flex">
              <div className="flex flex-col text-on-surface-variant/30 text-right select-none pr-4 border-r border-white/5 w-8 font-mono">
                 {query.split('\\n').map((_, i) => <span key={i}>{i+1}</span>)}
              </div>
              <textarea 
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="flex-1 w-full h-full bg-transparent border-none focus:ring-0 text-on-surface resize-none font-mono text-sm leading-relaxed p-4 pt-0 outline-none" 
                spellCheck="false"
              />
            </div>
            
            {/* Results Pane */}
            <div className="flex flex-col min-h-0 bg-surface flex-1">
              <div className="px-6 py-3 bg-surface-container-low flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <button className="text-sm font-bold text-primary border-b-2 border-primary pb-1">Result Set</button>
                </div>
                <div className="flex items-center gap-3">
                  {results && <span className="text-[10px] text-on-surface-variant bg-surface-container-highest px-2 py-0.5 rounded uppercase tracking-tighter font-bold">{execTime}ms Execution Time</span>}
                </div>
              </div>
              
              <div className="flex-1 overflow-auto p-6">
                 {error ? (
                    <div className="p-4 bg-error-container text-on-error-container rounded-xl font-mono text-sm">{error}</div>
                 ) : loading ? (
                    <div className="flex items-center justify-center h-full text-on-surface-variant text-sm font-mono animate-pulse">Running query...</div>
                 ) : results ? (
                    <div className="rounded-2xl border border-white/5 overflow-hidden">
                      <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                          <tr className="bg-surface-container-highest/30">
                            {results.columns.map((col, idx) => (
                              <th key={idx} className="px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider border-b border-white/5">{col.name}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {results.rows.length === 0 ? (
                             <tr><td colSpan={results.columns.length} className="px-4 py-4 text-center text-on-surface-variant text-sm">Query executed successfully. 0 rows returned. Affected rows: {results.affectedRows}</td></tr>
                          ) : (
                            results.rows.map((row, idx) => (
                              <tr key={idx} className="hover:bg-primary/5 transition-colors group text-sm text-on-surface">
                                {results.columns.map((col, cIdx) => (
                                  <td key={cIdx} className="px-4 py-3">{String(row[col.name])}</td>
                                ))}
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                 ) : (
                    <div className="flex items-center justify-center h-full text-on-surface-variant opacity-50">Execute a query to see results.</div>
                 )}
              </div>
            </div>
          </div>
          
          {/* Query History Sidebar */}
          <aside className="w-80 border-l border-white/5 bg-surface-container-low flex flex-col shrink-0">
            <div className="p-6 border-b border-white/5">
              <h2 className="font-bold text-on-surface tracking-tight mb-2">Query History</h2>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {history.map((hist, idx) => (
                <div key={idx} onClick={() => setQuery(hist.sql)} className="p-4 rounded-2xl bg-surface-container-highest/40 hover:bg-surface-container-highest/80 transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-on-surface-variant tracking-widest uppercase">Query #{history.length - idx}</span>
                  </div>
                  <p className="text-[11px] font-mono text-on-surface-variant bg-surface-container-lowest p-2 rounded truncate">{hist.sql}</p>
                  <div className="mt-3 flex items-center justify-between">
                    {hist.error ? (
                       <span className="text-[10px] text-error flex items-center gap-1">Error</span>
                    ) : (
                       <span className="text-[10px] text-emerald-400 flex items-center gap-1">Success • {hist.timeTaken}ms</span>
                    )}
                  </div>
                </div>
              ))}
              {history.length === 0 && <div className="text-on-surface-variant text-xs text-center opacity-50 p-4">No history yet</div>}
            </div>
          </aside>
        </div>
      </main>
    </React.Fragment>
  );
};

export default SqlConsole;
