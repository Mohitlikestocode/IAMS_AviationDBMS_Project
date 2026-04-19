import React, { useState, useEffect } from 'react';

const tablesList = ['airline', 'airport', 'aircraft', 'flight', 'seat', 'passenger', 'booking', 'ticket', 'payment', 'crew', 'flight_crew', 'pricing'];

const Tables = () => {
  const [activeTable, setActiveTable] = useState('flight');
  const [data, setData] = useState({ rows: [], columns: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTableData(activeTable);
  }, [activeTable]);

  const fetchTableData = async (tableName) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/tables/${tableName}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch table data', error);
    } finally {
      setLoading(false);
    }
  };

  const addRow = async () => {
    if (!data.columns || data.columns.length === 0) return;
    const bodyArgs = {};
    for (const col of data.columns) {
      // typically auto increment primary keys shouldn't be asked
      if (col.name.includes('_id') && col.name === data.columns[0].name) continue; 
      const input = window.prompt(`Enter value for ${col.name} (${col.type}):`);
      if (input === null) return; // user cancelled
      if (input !== "") bodyArgs[col.name] = input;
    }
    try {
      await fetch(`http://localhost:5000/api/tables/${activeTable}`, { 
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(bodyArgs)
      });
      fetchTableData(activeTable);
    } catch (e) {
      console.error(e);
      alert("Failed to insert row.");
    }
  };

  const deleteRow = async (id, pk) => {
    if (!window.confirm("Are you sure you want to delete this row?")) return;
    try {
      await fetch(`http://localhost:5000/api/tables/${activeTable}/${id}`, { method: 'DELETE' });
      fetchTableData(activeTable);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <React.Fragment>
      <main className="ml-64 pt-16 h-screen flex overflow-hidden">
        {/* Table List Sidebar (Inner) */}
        <aside className="w-72 shrink-0 bg-surface-container-low flex flex-col border-r border-surface-variant/10 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-black uppercase tracking-[0.1em] text-on-surface-variant">Database Tables</h2>
              <button className="p-1 hover:bg-surface-container-high rounded-lg text-primary transition-colors">
                <span className="material-symbols-outlined text-sm">add_box</span>
              </button>
            </div>
            <div className="space-y-1">
              {tablesList.map(name => (
                <button 
                  key={name}
                  onClick={() => setActiveTable(name)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-[13px] font-bold tracking-tight
                    ${activeTable === name ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-variant/20 hover:text-on-surface'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-base opacity-70">table_rows</span>
                    <span className="capitalize">{name.replace('_', ' ')}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          {/* SQL Inset Card */}
          <div className="mt-auto p-4 m-4 bg-surface-container-lowest rounded-xl border border-primary/5">
            <h3 className="text-[10px] font-bold text-primary mb-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">bolt</span>
              QUICK QUERY
            </h3>
            <p className="text-[11px] text-on-surface-variant leading-relaxed mb-3">Run optimized aggregations on flight trajectories.</p>
            <button className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline">
              Open SQL Playground <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </button>
          </div>
        </aside>
        
        {/* Data Grid Explorer */}
        <section className="flex-1 flex flex-col bg-surface relative min-w-0">
          {/* Table Header */}
          <div className="px-8 py-6 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 text-on-surface-variant mb-1">
                <span className="text-[10px] font-mono tracking-tighter opacity-50">public / tables /</span>
                <h2 className="text-2xl font-black text-on-surface tracking-[-0.03em]">{activeTable}</h2>
              </div>
              <p className="text-xs text-on-surface-variant">Viewing live database records.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => alert("Advanced data filtering module loaded.")} className="flex items-center gap-2 px-4 py-2 bg-surface-container-high text-on-surface rounded-lg text-xs font-semibold hover:bg-surface-variant transition-colors border border-outline-variant/10">
                <span className="material-symbols-outlined text-sm">filter_list</span>
                Filter
              </button>
              <button onClick={addRow} className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-bold hover:glow-primary transition-all active:scale-95 shadow-[0_0_15px_rgba(173,198,255,0.15)]">
                <span className="material-symbols-outlined text-sm">add</span>
                Add new row
              </button>
            </div>
          </div>
          
          {/* Table Container */}
          <div className="flex-1 px-8 pb-8 overflow-hidden">
            <div className="h-full bg-surface-container-low rounded-xl flex flex-col overflow-hidden border border-outline-variant/5">
              {loading ? (
                 <div className="flex flex-1 items-center justify-center text-on-surface-variant">Loading Data...</div>
              ) : (
                <>
                  {/* Column Headers */}
                  <div className="flex bg-surface-container-high/50 border-b border-surface-variant/20 sticky top-0 z-10 w-full min-w-max">
                    <div className="w-12 shrink-0 border-r border-surface-variant/20 flex items-center justify-center">
                      <input className="rounded border-outline-variant bg-surface-container-lowest focus:ring-primary" type="checkbox"/>
                    </div>
                    {data.columns?.map((col, idx) => (
                      <div key={idx} className="flex-1 min-w-[150px] px-3 py-2 border-r border-surface-variant/20 flex flex-col gap-0.5" style={{ minWidth: `${Math.max(120, 1000/data.columns.length)}px` }}>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{col.name}</span>
                      </div>
                    ))}
                    <div className="w-24 shrink-0 px-3 py-2 flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface">actions</span>
                    </div>
                  </div>
                  
                  {/* Table Body */}
                  <div className="flex-1 overflow-auto w-full min-w-max pb-12">
                    {data.rows?.map((row, rowIdx) => {
                       const pkValue = data.columns[0] ? row[data.columns[0].name] : null;
                       return (
                         <div key={rowIdx} className="flex border-b border-surface-variant/5 hover:bg-surface-container-high/30 transition-colors group">
                           <div className="w-12 shrink-0 border-r border-surface-variant/10 flex items-center justify-center">
                             <input className="rounded border-outline-variant bg-surface-container-lowest" type="checkbox"/>
                           </div>
                           {data.columns?.map((col, colIdx) => {
                             const valString = String(row[col.name] ?? '-');
                             let renderVal = <span className="truncate">{valString}</span>;
                             
                             if (valString === 'Completed' || valString === 'Confirmed') {
                               renderVal = <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20">{valString}</span>;
                             } else if (valString === 'Active') {
                               renderVal = <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">{valString}</span>;
                             } else if (valString === 'Scheduled' || valString === 'Pending') {
                               renderVal = <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">{valString}</span>;
                             } else if (valString === 'Delayed' || valString === 'Cancelled') {
                               renderVal = <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-error/10 text-error border border-error/20">{valString}</span>;
                             }

                             return (
                               <div key={colIdx} className="flex-1 min-w-[150px] px-3 py-2 border-r border-surface-variant/10 text-[11px] text-on-surface flex items-center overflow-hidden" style={{ minWidth: `${Math.max(120, 1000/data.columns.length)}px` }}>
                                 {renderVal}
                               </div>
                             );
                           })}
                           <div className="w-24 shrink-0 px-3 py-2 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => alert("Edit prompt opening...")} className="text-on-surface-variant hover:text-primary"><span className="material-symbols-outlined text-[16px]">edit</span></button>
                             <button onClick={() => deleteRow(pkValue, data.columns[0].name)} className="text-on-surface-variant hover:text-error"><span className="material-symbols-outlined text-[16px]">delete</span></button>
                           </div>
                         </div>
                       );
                    })}
                    {data.rows?.length === 0 && (
                       <div className="p-8 text-center text-sm text-on-surface-variant">No records found.</div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </main>
    </React.Fragment>
  );
};

export default Tables;
