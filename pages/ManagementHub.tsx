import React from 'react';
import { Link } from 'react-router-dom';

const ManagementHub: React.FC = () => {
  return (
    <div className="bg-[#020617] min-h-screen text-slate-100 font-lexend flex flex-col">
       {/* Simple Header */}
       <header className="px-10 py-4 border-b border-slate-800 bg-[#0f172a] flex justify-between items-center">
          <div className="flex items-center gap-4 text-primary-orange">
             <span className="material-symbols-outlined">dashboard</span>
             <h2 className="text-white text-xl font-bold">7metrics</h2>
          </div>
          <Link to="/select-role" className="text-sm text-slate-400 hover:text-white">Switch Mode</Link>
       </header>

       <main className="flex-1 p-8 overflow-y-auto">
          <div className="flex justify-between items-end mb-8">
             <div>
                <h1 className="text-4xl font-black italic uppercase tracking-tighter">Management Hub</h1>
                <p className="text-slate-400 mt-2">Allocate coaches and manage feature access.</p>
             </div>
             <button className="bg-primary-orange hover:bg-orange-600 px-6 py-2 rounded-lg text-white font-bold flex items-center gap-2">
                <span className="material-symbols-outlined">add</span> Register Team
             </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
             <div className="bg-[#0f172a] p-6 rounded-xl border border-slate-800">
                <p className="text-slate-400 text-sm font-bold">Total Teams</p>
                <p className="text-3xl font-bold mt-1">14</p>
             </div>
             <div className="bg-[#0f172a] p-6 rounded-xl border border-slate-800">
                <p className="text-slate-400 text-sm font-bold">Active Coaches</p>
                <p className="text-3xl font-bold mt-1">28</p>
             </div>
             <div className="bg-[#0f172a] p-6 rounded-xl border border-slate-800 border-l-4 border-l-primary-orange">
                <p className="text-slate-400 text-sm font-bold">AI Video Licenses</p>
                <p className="text-3xl font-bold mt-1">12/15</p>
             </div>
          </div>

          <div className="grid grid-cols-12 gap-8">
             <div className="col-span-12 lg:col-span-8 space-y-6">
                {/* Team Card 1 */}
                <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6">
                   <div className="flex justify-between mb-6">
                      <div>
                         <h4 className="text-lg font-bold">Senior Men's First Team</h4>
                         <span className="text-xs bg-primary-orange/20 text-primary-orange px-2 py-0.5 rounded font-bold uppercase">Active</span>
                      </div>
                      <div className="flex -space-x-3">
                         <div className="w-8 h-8 rounded-full bg-slate-700 border-2 border-[#0f172a] flex items-center justify-center text-[10px] font-bold">+4</div>
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-6">
                      <div>
                         <p className="text-[10px] uppercase font-bold text-slate-500 mb-2">Coaching Staff</p>
                         <div className="flex items-center gap-3 p-3 bg-[#1e293b] rounded-lg border border-slate-700">
                            <div className="w-8 h-8 rounded-full bg-gray-500"></div>
                            <div>
                               <p className="text-xs font-bold">Marc Henderson</p>
                               <p className="text-[10px] text-primary-orange">Head Coach</p>
                            </div>
                         </div>
                      </div>
                      <div>
                         <p className="text-[10px] uppercase font-bold text-slate-500 mb-2">Features</p>
                         <div className="p-2 bg-primary-orange/10 border border-primary-orange/20 rounded flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm text-primary-orange">check_circle</span>
                            <span className="text-xs font-bold text-slate-300">AI Video Lab</span>
                         </div>
                      </div>
                   </div>
                </div>

                 {/* Team Card 2 */}
                 <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6 opacity-80">
                   <div className="flex justify-between mb-6">
                      <div>
                         <h4 className="text-lg font-bold">U18 Elite Boys</h4>
                         <span className="text-xs bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded font-bold uppercase">Action Required</span>
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-6">
                      <div>
                         <p className="text-[10px] uppercase font-bold text-slate-500 mb-2">Coaching Staff</p>
                         <div className="flex items-center gap-3 p-3 border-2 border-dashed border-primary-orange/30 bg-primary-orange/5 rounded-lg text-primary-orange cursor-pointer hover:border-primary-orange transition-colors">
                            <span className="material-symbols-outlined">person_add</span>
                            <span className="text-xs font-bold">No coach assigned</span>
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             <div className="col-span-12 lg:col-span-4 bg-[#0f172a] border border-slate-800 rounded-xl p-5 flex flex-col h-[600px]">
                <h3 className="font-bold mb-4">Available Coaches</h3>
                <div className="flex-1 overflow-y-auto space-y-2">
                   {['Sarah Jenkins', 'David Rossi', 'Elena Belova'].map((name, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 hover:bg-[#1e293b] rounded-lg cursor-grab active:cursor-grabbing border border-transparent hover:border-slate-700 transition-all">
                         <div className="w-10 h-10 rounded-full bg-gray-600"></div>
                         <div>
                            <p className="text-sm font-bold">{name}</p>
                            <p className="text-[10px] text-slate-500">Certified Level 3</p>
                         </div>
                         <span className="material-symbols-outlined ml-auto text-slate-600">drag_indicator</span>
                      </div>
                   ))}
                </div>
             </div>
          </div>
       </main>
    </div>
  );
};

export default ManagementHub;