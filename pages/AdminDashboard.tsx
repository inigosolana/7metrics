import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('master'); // master or directory

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-space h-screen flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col border-r border-[#314868] bg-[#101722]">
        <div className="p-6 flex items-center gap-3 border-b border-[#314868]/50">
          <div className="bg-primary-blue size-10 rounded-lg flex items-center justify-center shadow-lg shadow-primary-blue/20">
            <span className="material-symbols-outlined text-white text-2xl">monitoring</span>
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none tracking-tight text-white">7metrics</h1>
            <p className="text-xs text-primary-blue font-semibold uppercase tracking-widest mt-1">Master Access</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">Platform Overview</div>
          <button 
            onClick={() => setActiveTab('master')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${activeTab === 'master' ? 'bg-primary-blue text-white shadow-md' : 'text-slate-400 hover:bg-[#182434]'}`}
          >
            <span className="material-symbols-outlined text-[22px]">dashboard</span>
            <span className="text-sm font-medium">Master Control</span>
          </button>
          <button 
            onClick={() => setActiveTab('directory')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${activeTab === 'directory' ? 'bg-primary-blue text-white shadow-md' : 'text-slate-400 hover:bg-[#182434]'}`}
          >
            <span className="material-symbols-outlined text-[22px]">hub</span>
            <span className="text-sm font-medium">Global Directory</span>
          </button>
          <div className="pt-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">Administrative</div>
          <Link to="/management" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-[#182434] transition-all">
             <span className="material-symbols-outlined text-[22px]">admin_panel_settings</span>
             <span className="text-sm font-medium">Management Hub</span>
          </Link>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-[#182434] transition-all">
            <span className="material-symbols-outlined text-[22px]">security</span>
            <span className="text-sm font-medium">Security Logs</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#101722]">
        <header className="h-16 flex items-center justify-between px-8 border-b border-[#314868] z-20">
          <div className="flex items-center gap-6">
            <h2 className="text-lg font-bold text-white">Owner Master Control Center</h2>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 rounded-full border border-green-500/20">
              <span className="size-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-bold uppercase tracking-wider">Systems Online</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-3 ml-2 cursor-pointer hover:opacity-80 transition-opacity">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold leading-none text-white">Admin Owner</p>
                  <p className="text-[10px] text-slate-500 font-medium mt-1 uppercase tracking-tighter">Superuser Account</p>
                </div>
                <div className="size-9 rounded-full bg-gray-700 border-2 border-primary-blue/50"></div>
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
           {/* Stats Row */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total Platform Revenue', val: '$4.2M', delta: '+12.4%', icon: 'account_balance_wallet', color: 'text-green-500' },
                { label: 'Global Active Clubs', val: '1,284', delta: '+3.1%', icon: 'groups', color: 'text-green-500' },
                { label: 'Concurrent Users', val: '42.5k', delta: '+8.2%', icon: 'bolt', color: 'text-green-500' },
                { label: 'System API Latency', val: '12ms', delta: '-2.5%', icon: 'dns', color: 'text-orange-500' },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col gap-2 rounded-xl p-6 border border-[#314868] bg-[#182434] shadow-sm">
                  <div className="flex justify-between items-start">
                    <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                    <span className="material-symbols-outlined text-primary-blue">{stat.icon}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-white text-3xl font-bold tracking-tight">{stat.val}</p>
                    <p className={`${stat.color} text-sm font-bold`}>{stat.delta}</p>
                  </div>
                </div>
              ))}
           </div>

           {activeTab === 'master' ? (
             <div className="grid grid-cols-12 gap-6">
                {/* Map Placeholder */}
                <div className="col-span-12 lg:col-span-8 flex flex-col rounded-xl border border-[#314868] bg-[#182434] overflow-hidden min-h-[500px]">
                   <div className="p-5 border-b border-[#314868] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <span className="material-symbols-outlined text-primary-blue">public</span>
                         <h3 className="font-bold text-white">Real-time Global Operations</h3>
                      </div>
                   </div>
                   <div className="flex-1 relative bg-[#0c121b] overflow-hidden">
                      <div className="absolute inset-0 opacity-40 mix-blend-overlay bg-cover bg-center" style={{backgroundImage: "url('https://picsum.photos/1000/600?grayscale&blur=2')"}}></div>
                      {/* Fake Map Dots */}
                      <div className="absolute top-[30%] left-[20%] size-2 bg-primary-blue rounded-full shadow-[0_0_15px_#0d6cf2]"></div>
                      <div className="absolute top-[45%] left-[65%] size-2 bg-primary-blue rounded-full shadow-[0_0_15px_#0d6cf2]"></div>
                      <div className="absolute top-[70%] left-[40%] size-2 bg-primary-blue rounded-full shadow-[0_0_15px_#0d6cf2]"></div>
                   </div>
                </div>

                {/* Logs */}
                <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                   <div className="bg-primary-blue rounded-xl p-6 text-white shadow-xl shadow-primary-blue/30 relative overflow-hidden">
                      <h3 className="text-lg font-bold mb-1">Admin Jump-In</h3>
                      <p className="text-sm opacity-80 mb-4">Access any club dashboard instantly for support.</p>
                      <input className="w-full h-11 px-4 bg-white/10 border border-white/20 rounded-lg text-sm placeholder:text-white/60 focus:ring-2 focus:ring-white transition-all backdrop-blur-sm" placeholder="Enter Club ID..." type="text"/>
                   </div>
                   <div className="flex-1 flex flex-col rounded-xl border border-[#314868] bg-[#182434] overflow-hidden">
                      <div className="p-4 border-b border-[#314868] flex items-center justify-between">
                         <h3 className="font-bold text-sm uppercase tracking-widest text-slate-500">Live Health Logs</h3>
                         <span className="size-2 rounded-full bg-green-500"></span>
                      </div>
                      <div className="flex-1 p-4 bg-[#0c121b] font-mono text-[11px] leading-relaxed text-slate-400 overflow-y-auto">
                        <p className="text-green-500 mb-1">[14:22:01] CRON: Completed daily backup sync.</p>
                        <p className="mb-1 text-slate-500">[14:22:05] DB: Cluster 'AWS-East-1' healthy.</p>
                        <p className="text-primary-blue mb-1">[14:22:12] AUTH: SuperAdmin session validated.</p>
                        <p className="text-orange-500 mb-1">[14:22:18] WARN: Node-A4 reached 80% memory.</p>
                        <p className="mb-1 text-slate-500">[14:22:20] API: GET /api/v2/metrics/global - Status 200</p>
                      </div>
                   </div>
                </div>
             </div>
           ) : (
             <div className="flex flex-col rounded-xl border border-[#314868] bg-[#182434] overflow-hidden shadow-sm mb-6">
                <div className="p-6 border-b border-[#314868] flex items-center justify-between">
                  <h3 className="font-bold text-lg text-white">Global Club Directory</h3>
                  <button className="px-4 py-2 bg-primary-blue text-white text-sm font-bold rounded-lg hover:bg-primary-blue/90">Provision New Club</button>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left border-collapse text-white">
                      <thead>
                         <tr className="bg-[#0c121b]/50 text-[11px] font-bold text-slate-500 uppercase tracking-widest border-b border-[#314868]">
                            <th className="px-6 py-4">Club Entity</th>
                            <th className="px-6 py-4">Teams</th>
                            <th className="px-6 py-4 text-center">AI Video</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-[#314868]/50 text-sm">
                         {[
                           { code: 'FCB', name: 'FC Barcelona', color: 'bg-blue-600', ai: true },
                           { code: 'MCF', name: 'Manchester City', color: 'bg-sky-400', ai: true },
                           { code: 'AJA', name: 'Ajax Amsterdam', color: 'bg-red-600', ai: false },
                         ].map((club, i) => (
                           <tr key={i} className="hover:bg-[#1f2d40]">
                              <td className="px-6 py-4">
                                 <div className="flex items-center gap-3">
                                    <div className={`size-10 rounded-lg ${club.color} flex items-center justify-center font-bold text-white`}>{club.code}</div>
                                    <div>
                                       <p className="font-bold">{club.name}</p>
                                       <p className="text-xs text-slate-500">ID: {club.code}-00{i+1}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex gap-1">
                                   <span className="px-2 py-0.5 bg-[#0c121b] rounded text-[10px] text-slate-400">Senior A</span>
                                   <span className="px-2 py-0.5 bg-[#0c121b] rounded text-[10px] text-slate-400">U19</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                 <div className={`w-8 h-4 rounded-full mx-auto relative ${club.ai ? 'bg-primary-blue' : 'bg-slate-700'}`}>
                                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${club.ai ? 'left-4.5' : 'left-0.5'}`}></div>
                                 </div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                 <button className="text-slate-400 hover:text-primary-blue"><span className="material-symbols-outlined">settings</span></button>
                              </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
           )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;