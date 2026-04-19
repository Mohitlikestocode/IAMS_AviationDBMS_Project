import React from 'react';
const Topbar = () => {
  return (
    <React.Fragment>
      <header  className="flex justify-between items-center w-full pl-72 pr-8 h-16 fixed top-0 z-40 bg-[#10131b]/60 backdrop-blur-3xl shadow-[0_4px_20px_rgba(59,130,246,0.05)] font-['Inter'] tracking-[-0.02em] text-sm">
<div className="flex items-center gap-8">
<span className="text-xl font-black text-[#e0e2ed]">IAMS Command</span>
<div className="relative w-64">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm" data-icon="search">search</span>
<input className="w-full bg-surface-container-lowest border-none rounded-full py-1.5 pl-10 text-xs focus:ring-1 focus:ring-primary/40" placeholder="Quick search signals..." type="text"/>
</div>
</div>
<div className="flex items-center gap-6">
<nav className="flex gap-6">
<a className="text-[#adc6ff] font-bold border-b-2 border-[#adc6ff] pb-1" href="#">Operations</a>
<a className="text-[#c2c6d6] hover:text-[#adc6ff]" href="#">Analytics</a>
<a className="text-[#c2c6d6] hover:text-[#adc6ff]" href="#">Admin</a>
</nav>
<div className="h-4 w-px bg-outline-variant/30"></div>
<div className="flex items-center gap-4">
<span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors" data-icon="notifications">notifications</span>
<span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors" data-icon="dark_mode">dark_mode</span>
<button className="bg-surface-container-highest/40 border border-outline-variant/20 px-4 py-1.5 rounded-full text-xs hover:bg-surface-container-high transition-colors">Logs</button>
<button className="bg-primary text-on-primary px-4 py-1.5 rounded-full text-xs font-bold hover:glow-primary transition-all">Deploy Update</button>
<img className="w-8 h-8 rounded-full border border-primary/20" data-alt="Portrait of a focused senior aviation operations officer with graying hair in a clean professional setting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDaROqJeb4LQhbcdQBvCWcMoIoEYVU5R-PwDWZhpArEKwBCiFlGSnIHeHZeoIFr1mkaAlzWcV3q6nCOBL6LN1SRkbYyPWxLxBE95RjsxKCkBxlHyRnP6_HiNgsi1EZm5wEKjrLngD4zV4DJNSmyMYyZqq7AZCBUam2U9JEEycRTePwGHdwhtbDWHQNn2CxCWwpcPAZsSZpqnZlaXXPPA1KWey2t7TQ1QK_jcdlLwzlkntGpKIiU12co4bjR-A6KUyJy0dhVEHPVL8Q"/>
</div>
</div>
</header>
    </React.Fragment>
  );
};
export default Topbar;
