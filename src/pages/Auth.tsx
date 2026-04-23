import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('userRole', data.permissions);
        navigate('/dashboard');
      } else {
        setError(data.error || 'Authentication Failed');
      }
    } catch (err) {
      setError('System Offline. Check Connection.');
    }
    setLoading(false);
  };
  return (
    <div className="auth-root w-full h-full">
      
{/* Atmospheric Background */}
<div className="fixed inset-0 z-0">
<div className="absolute inset-0 bg-gradient-to-tr from-surface-container-lowest via-surface-dim to-surface-container-low"></div>
<img className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-20 scale-110" data-alt="dramatic wide shot of a commercial jet silhouette flying through a dark deep navy stratospheric sky with distant faint stars" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1hewYXjpCh4CiEXCnW6XfE8Rih60ns_Mk1C8VsNcLVxB2IWxPMA-gbSls6b-4fmtHvKP7tSmRddn-MhOGOsGkSUO_ujT3uzeHzizcu-mmED4Wh0Ev7FUCHBEadLj_8KoZ_oTSifLW1yAHbUN0vkLHixI9baaOhVq_K0KrZManyhrVpcAu7W_0IN-MQ21EQylfA-OyUY3f7-vxrtIi1ytnRrCxCRMZQi8C18MxylZsHTagMSbv7xKcqAwhH6awd0UaJRD8Cx_SV88"/>
<div className="absolute inset-0 hud-scanline pointer-events-none"></div>
{/* Ambient Glow */}
<div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]"></div>
</div>
{/* Main Viewport */}
<main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
{/* Brand Identity */}
<header className="mb-12 text-center">
<div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-surface-container-highest mb-6 shadow-[0_0_40px_rgba(173,198,255,0.1)] group">
<span className="material-symbols-outlined text-primary text-4xl" data-icon="flight_takeoff">flight_takeoff</span>
</div>
<h1 className="text-3xl font-extrabold tracking-[-0.03em] text-on-background uppercase">
                IAMS
            </h1>
<p className="text-on-surface-variant font-medium tracking-wide text-xs mt-1">
                HIGH-ALTITUDE COMMAND CENTER
            </p>
</header>
{/* Auth Card */}
<div className="w-full max-w-md">
<div className="glass-panel p-8 md:p-10 rounded-[2rem] border border-white/5 shadow-2xl">
<div className="mb-6 flex border-b border-white/10">
  <button type="button" className="flex-1 pb-3 text-sm font-bold text-primary border-b-2 border-primary uppercase tracking-wider">Direct Access</button>
  <button type="button" onClick={() => alert("OTP System Offline. Please use Direct Access Node.")} className="flex-1 pb-3 text-sm font-bold text-slate-500 hover:text-slate-300 uppercase tracking-wider transition-colors">Generate OTP</button>
</div>
<div className="mb-8">
<h2 className="text-2xl font-bold tracking-tight text-on-background">System Access</h2>
<p className="text-on-surface-variant text-sm mt-2">Enter credentials for secure flight operations.</p>
<div className="bg-primary-container/20 border border-primary/20 rounded-xl p-3 mt-4">
  <p className="text-primary text-xs font-mono"><strong className="mr-2">HINTS:</strong><br/>admin@iams.com / admin123 (Admin)<br/>controller@iams.com / command (Super Admin)</p>
</div>
</div>
<form className="space-y-6" onSubmit={handleSubmit}>
{/* Error Display */}
{error && <div className="p-3 bg-error/10 border border-error/20 text-error text-xs font-bold rounded-lg">{error}</div>}
{/* Email Field */}
<div className="space-y-2">
<label className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant ml-1">Controller Email</label>
<div className="relative group">
<div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
<span className="material-symbols-outlined text-outline text-lg" data-icon="alternate_email">alternate_email</span>
</div>
<input value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-surface-container-lowest/80 border-none rounded-xl py-4 pl-12 pr-4 text-on-surface placeholder:text-outline/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm" placeholder="admin@iams.com" type="email"/>
</div>
</div>
{/* Password Field */}
<div className="space-y-2">
<div className="flex justify-between items-end ml-1">
<label className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">Access Sequence</label>
<a className="text-[10px] font-bold text-primary hover:text-primary-fixed-dim transition-colors" href="#">FORGOT KEY?</a>
</div>
<div className="relative group">
<div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
<span className="material-symbols-outlined text-outline text-lg" data-icon="lock">lock</span>
</div>
<input value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-surface-container-lowest/80 border-none rounded-xl py-4 pl-12 pr-4 text-on-surface placeholder:text-outline/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm" placeholder="••••••••" type="password"/>
</div>
</div>
{/* Action Button */}
<div className="pt-4">
<button disabled={loading} className="w-full bg-primary hover:bg-primary-container disabled:opacity-50 text-on-primary-container font-bold py-4 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(173,198,255,0.15)] active:scale-95 flex items-center justify-center gap-2 group" type="submit">
<span>{loading ? 'AUTHENTICATING...' : 'INITIALIZE SESSION'}</span>
<span className="material-symbols-outlined text-xl transition-transform group-hover:translate-x-1" data-icon="arrow_forward">arrow_forward</span>
</button>
</div>
</form>
{/* Footer Links */}
<div className="mt-10 pt-8 border-t border-white/5 text-center">
<p className="text-sm text-on-surface-variant">
                        New personnel? 
                        <a className="text-primary font-bold ml-1 hover:underline underline-offset-4 decoration-primary/30" href="#">Create an account</a>
</p>
</div>
</div>
{/* Operational Status (Decorative) */}
<div className="mt-8 grid grid-cols-3 gap-4">
<div className="flex flex-col items-center p-3 rounded-xl bg-surface-container-low/50 border border-white/5">
<span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-1">Status</span>
<div className="flex items-center gap-1.5">
<span className="w-1.5 h-1.5 rounded-full bg-primary-container shadow-[0_0_8px_#4d8eff]"></span>
<span className="text-[10px] font-mono text-on-surface font-bold">READY</span>
</div>
</div>
<div className="flex flex-col items-center p-3 rounded-xl bg-surface-container-low/50 border border-white/5">
<span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-1">Region</span>
<span className="text-[10px] font-mono text-on-surface font-bold uppercase">Global-4</span>
</div>
<div className="flex flex-col items-center p-3 rounded-xl bg-surface-container-low/50 border border-white/5">
<span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-1">Enc</span>
<span className="text-[10px] font-mono text-on-surface font-bold uppercase">AES-256</span>
</div>
</div>
</div>
{/* System Footer */}
<footer className="mt-12 opacity-40 hover:opacity-100 transition-opacity">
<div className="flex items-center gap-6">
<span className="text-[10px] font-bold tracking-[0.2em] uppercase">© 2024 IAMS Corp</span>
<span className="w-1 h-1 rounded-full bg-outline"></span>
<span className="text-[10px] font-bold tracking-[0.2em] uppercase">Terms of Protocol</span>
<span className="w-1 h-1 rounded-full bg-outline"></span>
<span className="text-[10px] font-bold tracking-[0.2em] uppercase">Privacy Grid</span>
</div>
</footer>
</main>
{/* UI Decor Overlays */}
<div className="fixed top-8 right-8 z-20 hidden lg:block">
<div className="flex flex-col items-end">
<span className="text-[10px] font-mono text-primary leading-none">STRAT-X v2.4.01</span>
<div className="w-24 h-[1px] bg-primary/20 mt-1"></div>
</div>
</div>
<div className="fixed bottom-8 left-8 z-20 hidden lg:block">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-on-surface-variant/40 text-xl" data-icon="hub">hub</span>
<div className="h-8 w-[1px] bg-white/10"></div>
<span className="text-[10px] font-mono text-on-surface-variant/60 leading-tight">NODE: LHR-PRIMARY-01<br/>CONNECTED: TRUE</span>
</div>
</div>

    </div>
  );
};

export default Auth;
