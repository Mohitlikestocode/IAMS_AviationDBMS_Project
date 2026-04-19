import React from 'react';

const Analytics = () => {
  return (
    <React.Fragment>
      <main  className="ml-64 pt-24 pb-12 px-8 min-h-screen">
{/* Header Section */}
<div className="flex items-end justify-between mb-12">
<div>
<h2 className="text-4xl font-extrabold tracking-[-0.04em] text-on-surface mb-2">Fleet Analytics</h2>
<p className="text-on-surface-variant max-w-md font-medium tracking-tight">Real-time performance metrics and predictive growth modeling for global flight operations.</p>
</div>
<div className="flex gap-3">
<button onClick={() => alert("Date range updated to Last 30 Days.")} className="bg-surface-container-high text-on-surface px-4 py-2 rounded-xl text-sm font-semibold border border-white/5 hover:bg-surface-container-highest transition-all flex items-center gap-2">
<span className="material-symbols-outlined text-sm">calendar_today</span>
                    Last 30 Days
                </button>
<button onClick={() => alert("Report successfully exported to PDF.")} className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-sm font-bold border border-primary/20 hover:bg-primary/20 transition-all flex items-center gap-2">
<span className="material-symbols-outlined text-sm">download</span>
                    Export Report
                </button>
</div>
</div>
{/* KPI Cards Grid */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
<div className="bg-surface-container-low rounded-2xl p-6 border border-white/5 hud-shadow relative overflow-hidden group">
<div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
<span className="material-symbols-outlined text-6xl">group</span>
</div>
<p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-2">Total Passengers</p>
<h3 className="text-3xl font-extrabold text-on-surface tracking-tight">1.28M</h3>
<div className="mt-4 flex items-center gap-2">
<span className="text-xs font-bold text-primary px-2 py-0.5 rounded-full bg-primary/10">+12.4%</span>
<span className="text-slate-600 text-[10px] font-medium uppercase tracking-tighter">vs last month</span>
</div>
</div>
<div className="bg-surface-container-low rounded-2xl p-6 border border-white/5 hud-shadow relative overflow-hidden group">
<div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
<span className="material-symbols-outlined text-6xl">confirmation_number</span>
</div>
<p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-2">Total Bookings</p>
<h3 className="text-3xl font-extrabold text-on-surface tracking-tight">842,019</h3>
<div className="mt-4 flex items-center gap-2">
<span className="text-xs font-bold text-primary px-2 py-0.5 rounded-full bg-primary/10">+8.1%</span>
<span className="text-slate-600 text-[10px] font-medium uppercase tracking-tighter">vs last month</span>
</div>
</div>
<div className="bg-surface-container-low rounded-2xl p-6 border border-white/5 hud-shadow relative overflow-hidden group">
<div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
<span className="material-symbols-outlined text-6xl">payments</span>
</div>
<p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-2">Revenue</p>
<h3 className="text-3xl font-extrabold text-on-surface tracking-tight">$412.5M</h3>
<div className="mt-4 flex items-center gap-2">
<span className="text-xs font-bold text-error px-2 py-0.5 rounded-full bg-error/10">-2.3%</span>
<span className="text-slate-600 text-[10px] font-medium uppercase tracking-tighter">vs last month</span>
</div>
</div>
<div className="bg-surface-container-low rounded-2xl p-6 border border-white/5 hud-shadow relative overflow-hidden group">
<div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
<span className="material-symbols-outlined text-6xl">flight</span>
</div>
<p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-2">Active Flights</p>
<h3 className="text-3xl font-extrabold text-on-surface tracking-tight">1,492</h3>
<div className="mt-4 flex items-center gap-2 text-primary">
<span className="relative flex h-2 w-2">
<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
<span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
</span>
<span className="text-[10px] font-bold uppercase tracking-widest">Live Monitoring</span>
</div>
</div>
</div>
{/* Charts Layout (Asymmetric Bento) */}
<div className="grid grid-cols-12 gap-8">
{/* Revenue over Time (Large Main Chart) */}
<div className="col-span-12 lg:col-span-8 bg-surface-container-low rounded-3xl p-8 border border-white/5">
<div className="flex items-center justify-between mb-12">
<div>
<h4 className="text-xl font-bold tracking-tight text-on-surface">Revenue over Time</h4>
<p className="text-sm text-slate-500 font-medium tracking-tight">Global earnings aggregated by day</p>
</div>
<div className="flex gap-2">
<div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-container-highest text-[11px] font-bold text-primary border border-primary/20">
<span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                            Current Period
                        </div>
<div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-container-highest text-[11px] font-bold text-slate-500">
<span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                            Target
                        </div>
</div>
</div>
{/* SVG Line Chart Mockup */}
<div className="relative w-full h-[320px]">
<svg className="w-full h-full overflow-visible" viewbox="0 0 800 320">
{/* Grid Lines */}
<line stroke="rgba(255,255,255,0.03)" strokeWidth="1" x1="0" x2="800" y1="0" y2="0"></line>
<line stroke="rgba(255,255,255,0.03)" strokeWidth="1" x1="0" x2="800" y1="80" y2="80"></line>
<line stroke="rgba(255,255,255,0.03)" strokeWidth="1" x1="0" x2="800" y1="160" y2="160"></line>
<line stroke="rgba(255,255,255,0.03)" strokeWidth="1" x1="0" x2="800" y1="240" y2="240"></line>
<line stroke="rgba(255,255,255,0.03)" strokeWidth="1" x1="0" x2="800" y1="320" y2="320"></line>
{/* Line Path */}
<path d="M0 240 L80 200 L160 220 L240 120 L320 180 L400 90 L480 150 L560 60 L640 100 L720 30 L800 50" fill="none" stroke="#adc6ff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4"></path>
{/* Gradient Fill Area */}
<path d="M0 240 L80 200 L160 220 L240 120 L320 180 L400 90 L480 150 L560 60 L640 100 L720 30 L800 50 V320 H0 Z" fill="url(#chartGradient)"></path>
<defs>
<lineargradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
<stop offset="0%" stop-color="#adc6ff" stop-opacity="0.15"></stop>
<stop offset="100%" stop-color="#adc6ff" stop-opacity="0"></stop>
</lineargradient>
</defs>
{/* Data Point Indicators */}
<circle cx="560" cy="60" fill="#adc6ff" r="6"></circle>
<circle cx="560" cy="60" fill="#adc6ff" fillOpacity="0.2" r="12"></circle>
</svg>
<div className="absolute top-[40px] left-[570px] bg-surface-container-highest/90 backdrop-blur-md p-3 rounded-xl border border-primary/30 shadow-2xl">
<p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Peak Earnings</p>
<p className="text-sm font-extrabold text-on-surface">$18.4M</p>
<p className="text-[10px] text-primary">May 24, 2024</p>
</div>
</div>
<div className="mt-8 flex justify-between text-[11px] font-bold text-slate-600 uppercase tracking-widest">
<span>May 01</span>
<span>May 08</span>
<span>May 15</span>
<span>May 22</span>
<span>May 30</span>
</div>
</div>
{/* Side Card: Passenger Count by Month (Dense Cluster) */}
<div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
<div className="bg-surface-container-low rounded-3xl p-8 border border-white/5 flex-1">
<h4 className="text-xl font-bold tracking-tight text-on-surface mb-8">Passenger Trends</h4>
<div className="space-y-6">
<div className="group">
<div className="flex justify-between items-end mb-2">
<span className="text-sm font-bold text-on-surface">January</span>
<span className="text-xs font-medium text-slate-500">102K</span>
</div>
<div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
<div className="h-full bg-primary/40 group-hover:bg-primary transition-all duration-500" style={{}}></div>
</div>
</div>
<div className="group">
<div className="flex justify-between items-end mb-2">
<span className="text-sm font-bold text-on-surface">February</span>
<span className="text-xs font-medium text-slate-500">94K</span>
</div>
<div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
<div className="h-full bg-primary/40 group-hover:bg-primary transition-all duration-500" style={{}}></div>
</div>
</div>
<div className="group">
<div className="flex justify-between items-end mb-2">
<span className="text-sm font-bold text-on-surface">March</span>
<span className="text-xs font-medium text-slate-500">118K</span>
</div>
<div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
<div className="h-full bg-primary/40 group-hover:bg-primary transition-all duration-500" style={{}}></div>
</div>
</div>
<div className="group">
<div className="flex justify-between items-end mb-2">
<span className="text-sm font-bold text-on-surface">April</span>
<span className="text-xs font-medium text-slate-500">132K</span>
</div>
<div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
<div className="h-full bg-primary/40 group-hover:bg-primary transition-all duration-500" style={{}}></div>
</div>
</div>
<div className="group">
<div className="flex justify-between items-end mb-2">
<span className="text-sm font-bold text-[#adc6ff] active-glow">May (Projected)</span>
<span className="text-xs font-medium text-primary">156K</span>
</div>
<div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
<div className="h-full bg-primary shadow-[0_0_10px_rgba(173,198,255,0.4)] transition-all duration-500" style={{}}></div>
</div>
</div>
</div>
<div className="mt-12 p-5 bg-surface-container-lowest rounded-2xl border border-white/5">
<div className="flex items-center gap-3 mb-3">
<div className="w-8 h-8 rounded-lg bg-tertiary-container/20 flex items-center justify-center">
<span className="material-symbols-outlined text-tertiary text-lg">insights</span>
</div>
<p className="text-xs font-bold text-on-surface">AI Prediction</p>
</div>
<p className="text-xs leading-relaxed text-slate-500 italic">Seasonal volume suggests a 14.2% increase in transatlantic bookings for the next quarter.</p>
</div>
</div>
</div>
{/* Bookings per Route (Bar Chart Section) */}
<div className="col-span-12 bg-surface-container-low rounded-3xl p-8 border border-white/5">
<div className="flex items-center justify-between mb-12">
<div>
<h4 className="text-xl font-bold tracking-tight text-on-surface">Bookings per Route</h4>
<p className="text-sm text-slate-500 font-medium tracking-tight">High-frequency corridor analysis</p>
</div>
<div className="bg-surface-container-lowest p-1 rounded-xl flex gap-1 border border-white/5">
<button onClick={() => alert("Sorting by Volume")} className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-surface-container-high text-on-surface">Volume</button>
<button onClick={() => alert("Sorting by Revenue")} className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg text-slate-500 hover:text-slate-300">Revenue</button>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-12">
{/* Route Bar Group */}
<div className="space-y-4">
<div className="flex justify-between items-center text-xs font-bold">
<span className="text-on-surface tracking-tight">LHR → JFK</span>
<span className="text-primary">12,402</span>
</div>
<div className="flex items-end gap-2 h-40">
<div className="flex-1 bg-white/5 rounded-t-lg transition-all hover:bg-primary/20 h-[30%]"></div>
<div className="flex-1 bg-white/5 rounded-t-lg transition-all hover:bg-primary/20 h-[45%]"></div>
<div className="flex-1 bg-white/5 rounded-t-lg transition-all hover:bg-primary/20 h-[60%]"></div>
<div className="flex-1 bg-primary rounded-t-lg shadow-[0_0_15px_rgba(173,198,255,0.2)] h-[95%]"></div>
</div>
<p className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter text-center">North Atlantic 01</p>
</div>
<div className="space-y-4">
<div className="flex justify-between items-center text-xs font-bold">
<span className="text-on-surface tracking-tight">SIN → SYD</span>
<span className="text-primary">9,842</span>
</div>
<div className="flex items-end gap-2 h-40">
<div className="flex-1 bg-white/5 rounded-t-lg transition-all hover:bg-primary/20 h-[50%]"></div>
<div className="flex-1 bg-white/5 rounded-t-lg transition-all hover:bg-primary/20 h-[65%]"></div>
<div className="flex-1 bg-white/5 rounded-t-lg transition-all hover:bg-primary/20 h-[80%]"></div>
<div className="flex-1 bg-primary/70 rounded-t-lg h-[75%]"></div>
</div>
<p className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter text-center">Oceania South</p>
</div>
<div className="space-y-4">
<div className="flex justify-between items-center text-xs font-bold">
<span className="text-on-surface tracking-tight">DXB → CDG</span>
<span className="text-primary">8,110</span>
</div>
<div className="flex items-end gap-2 h-40">
<div className="flex-1 bg-white/5 rounded-t-lg transition-all hover:bg-primary/20 h-[40%]"></div>
<div className="flex-1 bg-white/5 rounded-t-lg transition-all hover:bg-primary/20 h-[55%]"></div>
<div className="flex-1 bg-primary/70 rounded-t-lg h-[65%]"></div>
<div className="flex-1 bg-white/5 rounded-t-lg transition-all hover:bg-primary/20 h-[60%]"></div>
</div>
<p className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter text-center">Euro-Gulf Connect</p>
</div>
<div className="space-y-4">
<div className="flex justify-between items-center text-xs font-bold">
<span className="text-on-surface tracking-tight">HND → SFO</span>
<span className="text-primary">7,629</span>
</div>
<div className="flex items-end gap-2 h-40">
<div className="flex-1 bg-white/5 rounded-t-lg transition-all hover:bg-primary/20 h-[60%]"></div>
<div className="flex-1 bg-primary/70 rounded-t-lg h-[65%]"></div>
<div className="flex-1 bg-white/5 rounded-t-lg transition-all hover:bg-primary/20 h-[55%]"></div>
<div className="flex-1 bg-white/5 rounded-t-lg transition-all hover:bg-primary/20 h-[45%]"></div>
</div>
<p className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter text-center">Trans-Pacific Central</p>
</div>
</div>
</div>
</div>
</main>
    </React.Fragment>
  );
};

export default Analytics;
