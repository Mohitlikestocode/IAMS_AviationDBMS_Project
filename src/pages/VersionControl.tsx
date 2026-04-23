import React, { useState, useEffect } from 'react';

const VersionControl = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/audit-logs');
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleUndo = async (audit_id) => {
    const role = localStorage.getItem('userRole');
    if (role === 'ADMIN') {
      alert("Permission Denied: Only Super Admins can undo database transactions.");
      return;
    }
    
    if (!window.confirm("Are you sure you want to revert this transaction?")) return;
    
    try {
      const res = await fetch('http://localhost:5000/api/undo-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audit_id })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchLogs(); // Reload logs
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Network Error");
    }
  };

  return (
    <main className="pl-72 pt-24 pr-8 pb-12 min-h-screen z-10 relative bg-surface">
      <div className="mb-12">
        <h2 className="text-4xl font-extrabold tracking-[-0.02em] mb-2">Version Control</h2>
        <p className="text-on-surface-variant text-sm">System transaction history and atomic rollbacks</p>
      </div>

      <div className="bg-surface-container-low rounded-xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-on-surface-variant">Loading audit logs...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-highest/20 text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">
                <th className="p-4 border-b border-white/5">Audit ID</th>
                <th className="p-4 border-b border-white/5">Timestamp</th>
                <th className="p-4 border-b border-white/5">Action Type</th>
                <th className="p-4 border-b border-white/5 w-1/3">Transaction Details</th>
                <th className="p-4 border-b border-white/5 text-right">Operation</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium">
              {logs.map((log: any) => (
                <tr key={log.audit_id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-mono text-xs text-primary">{log.audit_id}</td>
                  <td className="p-4 text-on-surface-variant">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded text-[10px] font-bold tracking-wider">
                      {log.action_type}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-xs text-on-surface-variant truncate max-w-xs" title={log.log_details}>
                    {log.log_details}
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleUndo(log.audit_id)}
                      className="px-3 py-1.5 bg-error/10 hover:bg-error/20 text-error rounded shadow transition-colors text-xs font-bold"
                    >
                      UNDO
                    </button>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-on-surface-variant">No transaction history found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
};

export default VersionControl;
