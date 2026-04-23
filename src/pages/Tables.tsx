import React, { useState, useEffect } from 'react';

const tablesList = ['airline', 'airport', 'aircraft', 'flight', 'seat', 'passenger', 'booking', 'ticket', 'payment', 'crew', 'flight_crew', 'pricing'];

const Tables = () => {
  const [activeTable, setActiveTable] = useState('flight');
  const [data, setData] = useState({ rows: [], columns: [] });
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState('');
  
  // Edit Modal State
  const [editingRow, setEditingRow] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    fetchTableData(activeTable);
    setFilterText(''); // Clear filter on table change
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
      if (col.name.includes('_id') && col.name === data.columns[0].name) continue; 
      const input = window.prompt(`Enter value for ${col.name} (${col.type}):`);
      if (input === null) return; 
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

  const startEdit = (row) => {
    setEditingRow(row);
    setEditFormData({ ...row });
  };

  const saveEdit = async () => {
    if (!editingRow || !data.columns.length) return;
    const pk = data.columns[0].name;
    const id = editingRow[pk];
    
    // Send PUT request to backend
    try {
      await fetch(`http://localhost:5000/api/tables/${activeTable}/${id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(editFormData)
      });
      setEditingRow(null);
      fetchTableData(activeTable);
    } catch (e) {
      console.error(e);
      alert("Failed to update row.");
    }
  };

  const handleEditChange = (colName, value) => {
    setEditFormData(prev => ({ ...prev, [colName]: value }));
  };

  // Advanced Local Filtering
  const filteredRows = data.rows.filter(row => {
    if (!filterText) return true;
    return Object.values(row).some(val => 
      String(val).toLowerCase().includes(filterText.toLowerCase())
    );
  });


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
              <button onClick={() => {
                const el = document.querySelector('input[placeholder="Filter records..."]');
                if(el) el.focus();
              }} className="flex items-center gap-2 px-4 py-2 bg-surface-container-high text-on-surface rounded-lg text-xs font-semibold hover:bg-surface-variant transition-colors border border-outline-variant/10">
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
              {/* Advanced Filter Input */}
              <div className="flex items-center bg-surface-container-high px-4 py-2 border-b border-outline-variant/10">
                <span className="material-symbols-outlined text-on-surface-variant text-sm mr-2">search</span>
                <input 
                  type="text" 
                  placeholder="Filter records..." 
                  value={filterText}
                  onChange={e => setFilterText(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-sm text-on-surface w-full p-0 outline-none placeholder-on-surface-variant"
                />
              </div>

              {loading ? (
                 <div className="flex flex-1 items-center justify-center text-on-surface-variant">Loading Data...</div>
              ) : (
                <div className="flex-1 overflow-auto w-full min-w-max pb-12">
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead className="bg-surface-container-high/50 sticky top-0 z-10 shadow-sm border-b border-surface-variant/20">
                      <tr>
                        <th className="w-12 px-3 py-3 text-center border-r border-surface-variant/20">
                          <input className="rounded border-outline-variant bg-surface-container-lowest focus:ring-primary" type="checkbox"/>
                        </th>
                        {data.columns?.map((col, idx) => (
                          <th key={idx} className="px-4 py-3 border-r border-surface-variant/20 text-[10px] font-bold uppercase tracking-wider text-primary">
                            {col.name}
                          </th>
                        ))}
                        <th className="w-24 px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-on-surface text-center">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    
                    <tbody className="divide-y divide-surface-variant/5">
                      {filteredRows?.map((row, rowIdx) => {
                         const pkValue = data.columns[0] ? row[data.columns[0].name] : null;
                         return (
                           <tr key={rowIdx} className="hover:bg-surface-container-high/30 transition-colors group">
                             <td className="w-12 text-center border-r border-surface-variant/10">
                               <input className="rounded border-outline-variant bg-surface-container-lowest" type="checkbox"/>
                             </td>
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
                                 <td key={colIdx} className="px-4 py-3 border-r border-surface-variant/10 text-[12px] text-on-surface font-medium max-w-[200px] overflow-hidden text-ellipsis">
                                   {renderVal}
                                 </td>
                               );
                             })}
                             <td className="w-24 px-4 py-3 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                               <button onClick={() => startEdit(row)} className="text-on-surface-variant hover:text-primary"><span className="material-symbols-outlined text-[16px]">edit</span></button>
                               <button onClick={() => deleteRow(pkValue, data.columns[0].name)} className="text-on-surface-variant hover:text-error"><span className="material-symbols-outlined text-[16px]">delete</span></button>
                             </td>
                           </tr>
                         );
                      })}
                      {filteredRows?.length === 0 && (
                         <tr>
                           <td colSpan={(data.columns?.length || 0) + 2} className="p-8 text-center text-sm text-on-surface-variant">
                             No records match the filter.
                           </td>
                         </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Modal Overlay for Edit */}
        {editingRow && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-surface-container-high rounded-2xl w-[500px] max-w-full p-6 shadow-2xl border border-white/10">
              <h3 className="text-lg font-bold text-on-surface mb-4">Edit Record in {activeTable}</h3>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {data.columns.map(col => {
                  const isPrimaryKey = col.name.includes('_id') && col.name === data.columns[0].name;
                  return (
                    <div key={col.name} className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{col.name}</label>
                      <input 
                        type="text" 
                        value={editFormData[col.name] ?? ''} 
                        onChange={(e) => handleEditChange(col.name, e.target.value)}
                        disabled={isPrimaryKey}
                        className={`px-3 py-2 rounded-lg text-sm bg-surface-container-lowest border ${isPrimaryKey ? 'border-transparent opacity-50' : 'border-outline-variant/30 text-on-surface focus:border-primary'} outline-none`}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-white/5">
                <button onClick={() => setEditingRow(null)} className="px-4 py-2 rounded-lg text-sm font-bold text-on-surface-variant hover:bg-surface-variant transition-colors border border-transparent">Cancel</button>
                <button onClick={saveEdit} className="px-4 py-2 rounded-lg text-sm font-bold bg-primary text-on-primary hover:glow-primary transition-all">Save Changes</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </React.Fragment>
  );
};

export default Tables;
