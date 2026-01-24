import React from 'react';

const PlayerPortal: React.FC = () => {
  return (
    <div className="bg-[#1a1614] min-h-screen text-white font-lexend flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 border-r border-[#3d332d] p-6 flex flex-col gap-8 hidden md:flex">
         <div className="flex items-center gap-3">
             <div className="bg-[#ff6b00] p-2 rounded-lg text-[#1a1614] font-bold material-symbols-outlined">analytics</div>
             <div>
                 <h1 className="font-bold text-lg">7metrics</h1>
                 <p className="text-[#ff6b00] text-xs uppercase font-bold tracking-wider">Handball Pro</p>
             </div>
         </div>
         <nav className="space-y-2">
             <div className="flex items-center gap-3 px-4 py-3 bg-[#ff6b00]/10 text-[#ff6b00] rounded-xl border border-[#ff6b00]/20 font-semibold text-sm">
                 <span className="material-symbols-outlined">person</span> My Stats
             </div>
             <div className="flex items-center gap-3 px-4 py-3 text-[#c7b4a9] hover:bg-[#3d332d] rounded-xl font-medium text-sm transition-colors cursor-pointer">
                 <span className="material-symbols-outlined">group</span> Team Stats
             </div>
         </nav>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
         <div className="flex justify-between items-end mb-8">
             <div>
                 <h2 className="text-4xl font-black tracking-tight">Welcome back, Alex</h2>
                 <p className="text-[#c7b4a9] text-lg mt-1">Your efficiency is <span className="text-[#ff6b00] font-bold">+5%</span> above average.</p>
             </div>
             <div className="bg-[#3d332d] px-4 py-2 rounded-xl flex items-center gap-3 text-xs font-bold text-[#c7b4a9]">
                 <span className="uppercase">Next Match:</span>
                 <span className="text-white">vs. Berlin Lions</span>
             </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
             <div className="bg-[#2a2420] p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
                 <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-8xl text-[#ff6b00] opacity-10 group-hover:scale-110 transition-transform">bolt</span>
                 <p className="text-[#c7b4a9] text-sm uppercase font-bold mb-2">Efficiency</p>
                 <div className="flex items-baseline gap-2">
                     <h3 className="text-4xl font-black">78.5%</h3>
                     <span className="text-[#ff6b00] text-sm font-bold flex items-center"><span className="material-symbols-outlined text-sm">trending_up</span> 5.2%</span>
                 </div>
                 <div className="w-full bg-[#1a1614] h-1.5 rounded-full mt-4">
                     <div className="bg-[#ff6b00] h-full rounded-full w-[78.5%]"></div>
                 </div>
             </div>
             <div className="bg-[#2a2420] p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
                 <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-8xl text-[#ff6b00] opacity-10 group-hover:scale-110 transition-transform">timer</span>
                 <p className="text-[#c7b4a9] text-sm uppercase font-bold mb-2">Minutes Played</p>
                 <div className="flex items-baseline gap-2">
                     <h3 className="text-4xl font-black">32:15</h3>
                 </div>
                 <p className="text-xs text-[#c7b4a9] mt-4">Career Avg: 28:45</p>
             </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="lg:col-span-2 bg-[#2a2420] border border-[#3d332d] rounded-2xl p-6 min-h-[300px] flex flex-col">
                 <h3 className="text-xl font-bold mb-8">Team Progress</h3>
                 <div className="flex-1 flex items-end justify-between gap-4 px-4">
                     {[40, 30, 50, 40, 60].map((h, i) => (
                         <div key={i} className="w-full flex justify-center items-end gap-2 h-40">
                             <div className="w-4 bg-[#ff6b00]/20 rounded-t-sm" style={{height: `${h-10}%`}}></div>
                             <div className="w-4 bg-[#ff6b00] rounded-t-sm shadow-[0_0_15px_rgba(255,107,0,0.3)]" style={{height: `${h}%`}}></div>
                         </div>
                     ))}
                 </div>
                 <div className="flex justify-between text-[#c7b4a9] text-[10px] font-bold uppercase mt-4 px-4">
                     <span>Match 18</span><span>Match 19</span><span>Match 20</span><span>Match 21</span><span>Match 22</span>
                 </div>
             </div>
             <div className="bg-[#2a2420] border border-[#3d332d] rounded-2xl p-6">
                 <h3 className="text-xl font-bold mb-6">Upcoming Events</h3>
                 <div className="space-y-4">
                     <div className="p-4 bg-[#ff6b00]/10 border border-[#ff6b00]/20 rounded-xl">
                         <div className="flex justify-between mb-2">
                             <span className="text-[10px] bg-[#ff6b00] text-black font-black px-2 py-0.5 rounded-full uppercase">Next Game</span>
                             <span className="text-xs font-bold text-[#ff6b00]">In 2 days</span>
                         </div>
                         <p className="font-bold">vs. Berlin Lions</p>
                         <p className="text-xs text-[#c7b4a9]">Sat, 19:30 • Olympic Arena</p>
                     </div>
                     <div className="p-4 bg-[#3d332d]/30 border border-[#3d332d] rounded-xl">
                         <p className="font-bold">Strength & Conditioning</p>
                         <p className="text-xs text-[#c7b4a9]">Tomorrow • 09:00</p>
                     </div>
                 </div>
             </div>
         </div>
      </main>
    </div>
  );
};

export default PlayerPortal;