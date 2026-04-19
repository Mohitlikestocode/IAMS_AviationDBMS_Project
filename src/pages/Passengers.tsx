import React, { useState, useEffect } from 'react';

const Passengers = () => {
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPassengers();
  }, []);

  const fetchPassengers = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: "SELECT * FROM passenger LIMIT 10" })
      });
      const data = await res.json();
      setPassengers(data.rows || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPassenger = () => {
    const name = window.prompt("Enter Passenger Name:");
    if (!name) return;
    const passport = window.prompt("Enter Passport Number:");
    const phone = window.prompt("Enter Phone Number:");
    
    fetch(`http://localhost:5000/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql: `INSERT INTO passenger (name, passport_no, phone) VALUES ('${name}', '${passport}', '${phone}')` })
    }).then(() => {
      alert("Passenger added successfully!");
      fetchPassengers();
    }).catch(err => alert("Error adding passenger"));
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete passenger?")) {
      fetch(`http://localhost:5000/api/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: `DELETE FROM passenger WHERE passenger_id = ${id}` })
      }).then(() => fetchPassengers());
    }
  };

  return (
    <React.Fragment>
      <main className="ml-64 min-h-screen flex flex-col bg-surface overflow-y-auto">
        <header className="h-16 w-full flex justify-between items-center px-8 bg-[#10131b]/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-40">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">search</span>
              <input className="w-full bg-surface-container-lowest border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-slate-600" placeholder="Search passenger records..." type="text"/>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <img className="w-8 h-8 rounded-full border border-white/10 object-cover" alt="Profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVNW5Hb0MnPySVhAX65fSt4frlFot_0BKn3saCmDIgcS4QE_wRx5HcvWUgwzTF5nQkqPckpvuH1hGIekWXvZM6Zbsm94hZHTq2EtXheqA1Hy8Ozbjp78IyZYeFZbgHQa7vCxMu8DfjRFPt-GNY-5Qa6kZGNnFynhzYSTGsuxRU6c1-D2wjDkX9eTwPlzQM5MxxuZfrSQ0PoPw1RVSheUV_cYPnhHj2NZmQpY6XBtZbIFKCi1q178EccClx54-YfTt0uTBYBnBpfM8"/>
              <span className="text-sm font-medium text-on-surface">Chief Controller</span>
            </div>
          </div>
        </header>

        <section className="px-8 pt-8 pb-6">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-on-background">Passengers</h2>
              <p className="text-on-surface-variant text-sm mt-1">Live database synchronization enabled.</p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-highest/40 hover:bg-surface-container-highest text-on-surface text-sm font-medium transition-all border border-white/5">
                <span className="material-symbols-outlined text-sm">filter_list</span> Filters
              </button>
              <button onClick={handleAddPassenger} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary text-sm font-bold shadow-[0_0_20px_rgba(173,198,255,0.15)] hover:opacity-90 active:scale-[0.98] transition-all">
                <span className="material-symbols-outlined text-sm">person_add</span> Add Passenger
              </button>
            </div>
          </div>
        </section>

        <section className="px-8 pb-12 flex-1">
          <div className="bg-surface-container-low rounded-xl overflow-hidden shadow-2xl">
            <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/5 bg-surface-container-high/30">
              <div className="col-span-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Pass ID</div>
              <div className="col-span-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Name</div>
              <div className="col-span-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Contact / Phone</div>
              <div className="col-span-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Passport No.</div>
              <div className="col-span-1"></div>
            </div>

            <div className="divide-y divide-white/5">
              {loading ? (
                 <div className="p-8 text-center text-sm text-on-surface-variant animate-pulse">Syncing passenger manifest...</div>
              ) : passengers.length === 0 ? (
                 <div className="p-8 text-center text-sm text-on-surface-variant">No items found. Run backend.</div>
              ) : (
                passengers.map((p, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-surface-container-high/50 transition-colors group cursor-pointer">
                    <div className="col-span-2">
                      <span className="font-mono text-xs text-primary-fixed-dim bg-primary/5 px-2 py-1 rounded">PS-{p.passenger_id}</span>
                    </div>
                    <div className="col-span-3 flex items-center gap-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-on-surface">{p.name}</span>
                      </div>
                    </div>
                    <div className="col-span-3 flex flex-col">
                      <span className="text-[11px] text-slate-500">{p.phone}</span>
                    </div>
                    <div className="col-span-3">
                      <span className="text-sm text-on-surface-variant font-mono">{p.passport_no}</span>
                    </div>
                    <div className="col-span-1 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(p.passenger_id); }} className="p-1 hover:text-error hover:bg-white/10 rounded">
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </main>
    </React.Fragment>
  );
};

export default Passengers;
