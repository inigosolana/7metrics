import React from 'react';
import { Link } from 'react-router-dom';

const RoleSelection: React.FC = () => {
  return (
    <div className="bg-[#120d08] font-lexend text-white min-h-screen flex flex-col overflow-x-hidden relative">
      <div className="absolute top-[-200px] left-[-100px] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-200px] right-[-100px] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>

      <header className="w-full max-w-7xl mx-auto px-6 py-8 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(242,127,13,0.3)]">
            <span className="material-symbols-outlined text-[#120d08] font-bold">analytics</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">7metrics</h2>
        </div>
        <div className="flex items-center gap-6">
          <button className="text-sm font-medium text-white/60 hover:text-primary transition-colors">Support</button>
          <div className="h-4 w-px bg-white/10"></div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-white">Alex Johnson</p>
              <p className="text-[10px] text-white/40 uppercase tracking-widest">Standard User</p>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-primary/20 bg-center bg-cover ring-4 ring-black/20" style={{ backgroundImage: "url('https://picsum.photos/100')" }}></div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10">
        <div className="max-w-4xl w-full text-center mb-16">
          <span className="text-primary text-xs font-bold uppercase tracking-[0.3em] mb-4 block">Organization Portal</span>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">Welcome back, select your workspace</h1>
          <p className="text-lg text-white/50 max-w-2xl mx-auto leading-relaxed">Choose your specialized environment for handball performance tracking and tactical analysis.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
          {[
            { title: "Admin", icon: "admin_panel_settings", desc: "Manage your club's roster, oversee user access permissions, and configure organizational settings.", link: "/admin" },
            { title: "Coach", icon: "strategy", desc: "Access team performance metrics, tactical playbooks, and individual player development plans.", link: "/coach" },
            { title: "Player", icon: "query_stats", desc: "Review personal game stats, track physical progression, and view coach feedback summaries.", link: "/player" }
          ].map((role, idx) => (
            <Link key={idx} to={role.link} className="glass-card bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-10 flex flex-col items-center text-center cursor-pointer group relative overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:border-primary/50 hover:shadow-[0_0_30px_rgba(242,108,13,0.1)]">
              <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 group-hover:border-primary/50 group-hover:scale-110 transition-all duration-500 shadow-xl">
                <span className="material-symbols-outlined text-primary !text-5xl group-hover:drop-shadow-[0_0_15px_rgba(242,127,13,0.5)]">{role.icon}</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight group-hover:text-primary transition-colors">{role.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed mb-8 flex-grow">{role.desc}</p>
              <div className="w-full pt-6 border-t border-white/5">
                <span className="text-primary text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                  Enter {role.title === 'Player' ? 'Dashboard' : role.title === 'Admin' ? 'Management' : 'Performance'} 
                  <span className="material-symbols-outlined !text-sm">arrow_forward</span>
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-20 flex flex-col items-center gap-4">
          <p className="text-white/30 text-sm">
            Accessing as a system administrator? <a href="#" className="text-white/40 hover:text-white underline underline-offset-4 transition-colors">Secure Owner Login</a>
          </p>
        </div>
      </main>
    </div>
  );
};

export default RoleSelection;