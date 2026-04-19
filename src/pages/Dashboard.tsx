import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [kpis, setKpis] = useState({ flights: 0, passengers: 0, bookings: 0, revenue: 0 });

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        const fetchSql = async (sql) => {
          const res = await fetch('http://localhost:5000/api/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sql })
          });
          const data = await res.json();
          return data.rows[0];
        };

        const flights = await fetchSql('SELECT COUNT(*) as count FROM flight');
        const passengers = await fetchSql('SELECT COUNT(*) as count FROM passenger');
        const bookings = await fetchSql('SELECT COUNT(*) as count FROM booking');
        const revenue = await fetchSql('SELECT SUM(amount) as count FROM payment WHERE status="Completed"');

        setKpis({
          flights: flights.count || 0,
          passengers: passengers.count || 0,
          bookings: bookings.count || 0,
          revenue: revenue.count || 0
        });
      } catch (err) {
         console.error('Network Error:', err);
      }
    };
    fetchKPIs();
  }, []);

  return (
    <React.Fragment>
      <main  className="pl-72 pt-24 pr-8 pb-12 min-h-screen z-10 relative bg-surface">
{/* Dashboard Header */}
<div className="flex justify-between items-end mb-12">
<div>
<h2 className="text-4xl font-extrabold tracking-[-0.02em] mb-2">Fleet Overview</h2>
<p className="text-on-surface-variant text-sm">Real-time telemetry and operational synchronization</p>
</div>
<div className="flex gap-3">
<div className="flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-xl text-xs font-medium">
<span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    Live Data: Sector 7G
                </div>
</div>
</div>
{/* KPI Instruments Bento Grid */}
<div className="grid grid-cols-4 gap-6 mb-12">
<div className="bg-surface-container-low p-6 rounded-xl relative overflow-hidden group">
<div className="flex justify-between items-start mb-4">
<span className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest">Total Flights</span>
<span className="material-symbols-outlined text-primary" data-icon="flight">flight</span>
</div>
<div className="text-4xl font-black mb-1">{kpis.flights.toLocaleString()}</div>
<div className="text-primary text-xs flex items-center gap-1">
<span className="material-symbols-outlined text-xs" data-icon="trending_up">trending_up</span>
                    +12.4% vs L.M.
                </div>
<div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
<span className="material-symbols-outlined text-9xl" data-icon="flight">flight</span>
</div>
</div>
<div className="bg-surface-container-low p-6 rounded-xl relative overflow-hidden group">
<div className="flex justify-between items-start mb-4">
<span className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest">Active Passengers</span>
<span className="material-symbols-outlined text-primary" data-icon="groups">groups</span>
</div>
<div className="text-4xl font-black mb-1">{kpis.passengers.toLocaleString()}</div>
<div className="text-primary text-xs flex items-center gap-1">
<span className="material-symbols-outlined text-xs" data-icon="trending_up">trending_up</span>
                    +5.2% vs L.M.
                </div>
<div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
<span className="material-symbols-outlined text-9xl" data-icon="groups">groups</span>
</div>
</div>
<div className="bg-surface-container-low p-6 rounded-xl relative overflow-hidden group">
<div className="flex justify-between items-start mb-4">
<span className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest">New Bookings</span>
<span className="material-symbols-outlined text-primary" data-icon="book_online">book_online</span>
</div>
<div className="text-4xl font-black mb-1">{kpis.bookings.toLocaleString()}</div>
<div className="text-primary text-xs flex items-center gap-1">
<span className="material-symbols-outlined text-xs" data-icon="trending_up">trending_up</span>
                    +8.7% vs L.M.
                </div>
<div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
<span className="material-symbols-outlined text-9xl" data-icon="book_online">book_online</span>
</div>
</div>
<div className="bg-surface-container-low p-6 rounded-xl relative overflow-hidden group">
<div className="flex justify-between items-start mb-4">
<span className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest">Total Revenue</span>
<span className="material-symbols-outlined text-primary" data-icon="payments">payments</span>
</div>
<div className="text-4xl font-black mb-1">${kpis.revenue.toLocaleString()}</div>
<div className="text-primary text-xs flex items-center gap-1">
<span className="material-symbols-outlined text-xs" data-icon="trending_up">trending_up</span>
                    +15.9% vs L.M.
                </div>
<div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
<span className="material-symbols-outlined text-9xl" data-icon="payments">payments</span>
</div>
</div>
</div>
{/* Asymmetric Data Section */}
<div className="grid grid-cols-12 gap-8 mb-12">
{/* Bookings Over Time (Primary Visual) */}
<div className="col-span-8 bg-surface-container-low rounded-xl p-8 relative overflow-hidden">
<div className="flex justify-between items-center mb-8">
<div>
<h3 className="text-xl font-bold">Bookings over time</h3>
<p className="text-xs text-on-surface-variant">Daily passenger reservation volume (24h)</p>
</div>
<div className="flex gap-2">
<button className="px-3 py-1 bg-surface-container-highest text-[10px] font-bold rounded-full">D</button>
<button className="px-3 py-1 text-[10px] font-bold rounded-full text-on-surface-variant">W</button>
<button className="px-3 py-1 text-[10px] font-bold rounded-full text-on-surface-variant">M</button>
</div>
</div>
{/* Mock Chart Visualization */}
<div className="h-64 flex items-end gap-1 px-2 relative">
{/* Grid Lines */}
<div className="absolute inset-0 flex flex-col justify-between pointer-events-none py-2">
<div className="border-b border-outline-variant/10 w-full"></div>
<div className="border-b border-outline-variant/10 w-full"></div>
<div className="border-b border-outline-variant/10 w-full"></div>
<div className="border-b border-outline-variant/10 w-full"></div>
</div>
{/* Area/Line Chart Mockup */}
<svg className="absolute inset-0 w-full h-full p-4 overflow-visible" viewbox="0 0 800 200">
<defs>
<lineargradient id="chartGradient" x1="0%" x2="0%" y1="0%" y2="100%">
<stop offset="0%" stop-color="#adc6ff" stop-opacity="0.3"></stop>
<stop offset="100%" stop-color="#adc6ff" stop-opacity="0"></stop>
</lineargradient>
</defs>
<path d="M0,150 Q100,140 150,160 T300,100 T450,120 T600,60 T800,80 L800,200 L0,200 Z" fill="url(#chartGradient)"></path>
<path d="M0,150 Q100,140 150,160 T300,100 T450,120 T600,60 T800,80" fill="none" stroke="#adc6ff" strokeWidth="3"></path>
<circle cx="600" cy="60" fill="#adc6ff" r="4"></circle>
</svg>
</div>
<div className="mt-6 flex justify-between text-[10px] text-on-surface-variant font-medium px-2">
<span>00:00</span><span>04:00</span><span>08:00</span><span>12:00</span><span>16:00</span><span>20:00</span><span>23:59</span>
</div>
</div>
{/* Revenue Trend (Secondary Sidebar Visual) */}
<div className="col-span-4 bg-surface-container-highest/40 border border-outline-variant/10 rounded-xl p-8 flex flex-col">
<div className="mb-8">
<h3 className="text-xl font-bold">Revenue Trend</h3>
<p className="text-xs text-on-surface-variant">Regional performance metrics</p>
</div>
<div className="flex-grow space-y-6">
<div>
<div className="flex justify-between text-xs mb-2">
<span>Domestic (N.A.)</span>
<span className="font-bold text-primary">$2.1M</span>
</div>
<div className="w-full h-2 bg-surface-container-low rounded-full overflow-hidden">
<div className="bg-primary h-full w-[65%] rounded-full"></div>
</div>
</div>
<div>
<div className="flex justify-between text-xs mb-2">
<span>Europe (E.U.)</span>
<span className="font-bold text-primary">$1.4M</span>
</div>
<div className="w-full h-2 bg-surface-container-low rounded-full overflow-hidden">
<div className="bg-primary h-full w-[45%] rounded-full opacity-80"></div>
</div>
</div>
<div>
<div className="flex justify-between text-xs mb-2">
<span>Asia Pacific</span>
<span className="font-bold text-primary">$0.7M</span>
</div>
<div className="w-full h-2 bg-surface-container-low rounded-full overflow-hidden">
<div className="bg-primary h-full w-[22%] rounded-full opacity-60"></div>
</div>
</div>
</div>
<button onClick={() => alert("Report generation complete: full_report.pdf downloaded")} className="mt-8 w-full py-2 bg-surface-container-high rounded-lg text-xs font-bold hover:bg-surface-container-highest transition-colors">Generate Full Report</button>
</div>
</div>
{/* System Health & Alerts Section */}
<div className="grid grid-cols-12 gap-8">
{/* Operational Health */}
<div className="col-span-5 bg-surface-container-low rounded-xl p-8">
<div className="flex items-center gap-3 mb-8">
<span className="material-symbols-outlined text-primary" data-icon="health_and_safety">health_and_safety</span>
<h3 className="text-xl font-bold">Operational Health</h3>
</div>
<div className="grid grid-cols-2 gap-4">
<div className="bg-surface-container-lowest p-4 rounded-xl">
<p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mb-1">Server Load</p>
<div className="text-2xl font-bold">14.2%</div>
<div className="w-full h-1 bg-surface-container-high mt-3 rounded-full">
<div className="bg-primary h-full w-[14%]"></div>
</div>
</div>
<div className="bg-surface-container-lowest p-4 rounded-xl">
<p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mb-1">Latency</p>
<div className="text-2xl font-bold">42ms</div>
<div className="w-full h-1 bg-surface-container-high mt-3 rounded-full">
<div className="bg-primary h-full w-[30%]"></div>
</div>
</div>
<div className="bg-surface-container-lowest p-4 rounded-xl">
<p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mb-1">Active Nodes</p>
<div className="text-2xl font-bold">894/894</div>
<div className="w-full h-1 bg-primary mt-3 rounded-full"></div>
</div>
<div className="bg-surface-container-lowest p-4 rounded-xl">
<p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mb-1">Cache Hit</p>
<div className="text-2xl font-bold">99.8%</div>
<div className="w-full h-1 bg-primary mt-3 rounded-full"></div>
</div>
</div>
</div>
{/* Recent System Alerts */}
<div className="col-span-7 bg-surface-container-low rounded-xl p-8">
<div className="flex justify-between items-center mb-8">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-primary" data-icon="warning">warning</span>
<h3 className="text-xl font-bold">Recent System Alerts</h3>
</div>
<button onClick={() => alert("Loading history logs...")} className="text-xs text-primary font-bold">View History</button>
</div>
<div className="space-y-4">
<div className="flex items-center gap-4 bg-surface-container-highest/20 p-4 rounded-xl">
<div className="bg-error-container/20 w-10 h-10 rounded-full flex items-center justify-center">
<span className="material-symbols-outlined text-error" data-icon="error">error</span>
</div>
<div className="flex-grow">
<h4 className="text-sm font-bold">Delayed Signal: flight-X702</h4>
<p className="text-xs text-on-surface-variant">Telemetry sync lost in North Atlantic sector 4.</p>
</div>
<div className="text-right">
<div className="text-[10px] text-on-surface-variant mb-1">02m ago</div>
<span className="px-2 py-0.5 bg-error-container text-on-error-container text-[10px] font-bold rounded-full">CRITICAL</span>
</div>
</div>
<div className="flex items-center gap-4 bg-surface-container-highest/20 p-4 rounded-xl opacity-80">
<div className="bg-primary/20 w-10 h-10 rounded-full flex items-center justify-center">
<span className="material-symbols-outlined text-primary" data-icon="info">info</span>
</div>
<div className="flex-grow">
<h4 className="text-sm font-bold">Protocol Update Scheduled</h4>
<p className="text-xs text-on-surface-variant">Auto-deployment of firmware v2.4.1 starting at 04:00 UTC.</p>
</div>
<div className="text-right">
<div className="text-[10px] text-on-surface-variant mb-1">45m ago</div>
<span className="px-2 py-0.5 bg-surface-container-highest text-on-surface text-[10px] font-bold rounded-full">INFO</span>
</div>
</div>
<div className="flex items-center gap-4 bg-surface-container-highest/20 p-4 rounded-xl opacity-80">
<div className="bg-primary/20 w-10 h-10 rounded-full flex items-center justify-center">
<span className="material-symbols-outlined text-primary" data-icon="settings_input_component">settings_input_component</span>
</div>
<div className="flex-grow">
<h4 className="text-sm font-bold">Component Calibrated</h4>
<p className="text-xs text-on-surface-variant">LIDAR array at Zurich Hub recalibration successful.</p>
</div>
<div className="text-right">
<div className="text-[10px] text-on-surface-variant mb-1">1h ago</div>
<span className="px-2 py-0.5 bg-surface-container-highest text-on-surface text-[10px] font-bold rounded-full">RESOLVED</span>
</div>
</div>
</div>
</div>
</div>
</main>
    </React.Fragment>
  );
};

export default Dashboard;
