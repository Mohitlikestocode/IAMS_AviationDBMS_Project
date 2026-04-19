import React, { useState, useEffect } from 'react';

const Reservations = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Deep JOIN combining booking via passenger
        body: JSON.stringify({ sql: "SELECT b.booking_id, p.name as passenger_name, DATE_FORMAT(b.booking_date, '%Y-%m-%d') as date, b.total_amount FROM booking b JOIN passenger p ON b.passenger_id = p.passenger_id ORDER BY b.booking_id DESC LIMIT 10" })
      });
      const data = await res.json();
      setBookings(data.rows || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = (id) => {
    if(!window.confirm("Cancel this booking?")) return;
    fetch(`http://localhost:5000/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql: `DELETE FROM booking WHERE booking_id = ${id}` })
    }).then(() => fetchBookings());
  };

  return (
    <React.Fragment>
      <main className="ml-64 pt-24 px-12 pb-12 min-h-screen">
        <section className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-extrabold tracking-[-0.04em] text-on-background mb-2">Bookings</h1>
            <p className="text-on-surface-variant text-sm font-medium tracking-[-0.01em]">System-wide reservation management tracking live data.</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={fetchBookings} className="bg-primary text-on-primary-container px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-[0_0_20px_rgba(173,198,255,0.15)]">
              <span className="material-symbols-outlined text-lg">sync</span> Refresh Ledger
            </button>
          </div>
        </section>

        <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-white/5">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#181c23]/40">
            <h2 className="text-xs uppercase tracking-[0.25em] font-bold text-slate-400">Live Transaction Stream</h2>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                <span className="w-2 h-2 rounded-full bg-primary-container animate-ping"></span> SYNCING LIVE
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low">
                  <th className="px-8 py-4 text-[10px] uppercase tracking-widest text-slate-500 font-extrabold">Booking ID</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-slate-500 font-extrabold">Passenger Name</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-slate-500 font-extrabold">Date</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-slate-500 font-extrabold">Total Amount</th>
                  <th className="px-8 py-4 text-[10px] uppercase tracking-widest text-slate-500 font-extrabold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                   <tr><td colSpan={5} className="p-8 text-center text-sm text-on-surface-variant">Loading relational queries...</td></tr>
                ) : bookings.length === 0 ? (
                   <tr><td colSpan={5} className="p-8 text-center text-sm text-on-surface-variant">No items found. Seed backend.</td></tr>
                ) : (
                  bookings.map((b, idx) => (
                    <tr key={idx} className="hover:bg-surface-container-high transition-all group">
                      <td className="px-8 py-5">
                        <span className="font-mono text-xs text-primary tracking-tighter font-bold">#BK-{b.booking_id}</span>
                      </td>
                      <td className="px-6 py-5 flex flex-col">
                        <span className="text-sm font-bold text-on-surface">{b.passenger_name}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[11px] text-slate-400 font-mono">{b.date}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-bold text-on-surface">${b.total_amount}</span>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <button onClick={() => cancelBooking(b.booking_id)} className="text-xs font-bold text-error bg-error-container/10 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error-container/20">
                           Cancel Booking
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </React.Fragment>
  );
};

export default Reservations;
