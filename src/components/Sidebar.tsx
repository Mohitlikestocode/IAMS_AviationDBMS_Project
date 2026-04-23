import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

    { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { name: 'Database Tables', path: '/tables', icon: 'table_chart' },
    { name: 'SQL Console', path: '/sql', icon: 'terminal' },
    { name: 'AI Query', path: '/ai-query', icon: 'psychology', fill: true },
    { name: 'Passengers', path: '/passengers', icon: 'group' },
    { name: 'Version Control', path: '/version-control', icon: 'history' },
  ];

  const baseClass = "flex items-center gap-3 px-4 py-3 rounded-xl font-['Inter'] tracking-[-0.01em] text-sm font-medium transition-colors duration-200";
  const inactiveClass = `${baseClass} text-slate-400 hover:text-slate-200 hover:bg-[#31353d]/20`;
  const activeClass = `${baseClass} text-[#adc6ff] bg-[#31353d]/30 border-r-2 border-[#adc6ff]`;

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 flex flex-col bg-[#0a0e16] shadow-[1px_0_0_0_rgba(255,255,255,0.05)] py-6 px-4 gap-2 z-50">
      <div className="flex items-center gap-3 px-4 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-on-primary-container">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>flight_takeoff</span>
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tighter text-[#adc6ff]">IAMS</h1>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Command Center</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={location.pathname === item.path ? activeClass : inactiveClass}
          >
            <span className="material-symbols-outlined" style={item.fill ? { fontVariationSettings: "'FILL' 1" } : {}}>
              {item.icon}
            </span>
            {item.name}
          </Link>
        ))}
      </nav>
      <div className="mt-auto space-y-1 mb-8">
        <p className="px-4 text-xs font-bold text-slate-600 uppercase tracking-widest text-center">Version 1.0 (PRO)</p>
      </div>
    </aside>
  );
};

export default Sidebar;
