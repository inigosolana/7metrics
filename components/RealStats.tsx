import React, { useState, useEffect } from 'react';
import { TabletEvent } from '../types';

export const RealStats: React.FC = () => {
    const [isConnected, setIsConnected] = useState(true);
    const [activeTab, setActiveTab] = useState<'MATCH' | 'TEAM' | 'PLAYERS'>('MATCH');
    const [events, setEvents] = useState<TabletEvent[]>([
        { id: '1', time: '14:22', player: '#24 M. Hansen', action: 'Shot 9m', result: 'Goal' },
        { id: '2', time: '14:05', player: '#10 S. Sagosen', action: 'Pass', result: 'Completed' },
    ]);

    // Simulate incoming data
    useEffect(() => {
        const interval = setInterval(() => {
            const newEvent: TabletEvent = {
                id: Date.now().toString(),
                time: `14:${Math.floor(Math.random() * 60)}`,
                player: Math.random() > 0.5 ? '#24 M. Hansen' : '#19 M. Gidsel',
                action: Math.random() > 0.5 ? 'Shot' : 'Tackle',
                result: Math.random() > 0.5 ? 'Success' : 'Fail'
            };
            setEvents(prev => [newEvent, ...prev].slice(0, 10));
        }, 3500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="p-4 lg:p-8 space-y-6 max-w-[1600px] mx-auto w-full animate-slide-in">
            {/* Header / API Status */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border-l-4 border-l-cyan-400">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                        <span className="material-symbols-outlined text-cyan-400 text-2xl">tablet_mac</span>
                        External Tablet API Integration
                    </h2>
                    <p className="text-[#cbad90] text-sm mt-1">Real-time data synchronization from Court-Side App v2.4</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 px-4 py-2 bg-cyan-400/10 border border-cyan-400/20 rounded-lg">
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-cyan-400 animate-pulse' : 'bg-red-500'}`}></div>
                        <span className="text-xs font-bold text-cyan-400">{isConnected ? 'LIVE FEED' : 'OFFLINE'}</span>
                    </div>
                </div>
            </div>

            {/* Sub-Navigation Tabs */}
            <div className="flex gap-4 border-b border-white/10 pb-1">
                <button 
                    onClick={() => setActiveTab('MATCH')} 
                    className={`px-4 py-2 text-sm font-bold transition-all ${activeTab === 'MATCH' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-white/40 hover:text-white'}`}
                >
                    Match Overview
                </button>
                <button 
                    onClick={() => setActiveTab('TEAM')} 
                    className={`px-4 py-2 text-sm font-bold transition-all ${activeTab === 'TEAM' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-white/40 hover:text-white'}`}
                >
                    Team Comparison
                </button>
                <button 
                    onClick={() => setActiveTab('PLAYERS')} 
                    className={`px-4 py-2 text-sm font-bold transition-all ${activeTab === 'PLAYERS' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-white/40 hover:text-white'}`}
                >
                    Individual Stats
                </button>
            </div>

            {/* Content Based on Tab */}
            {activeTab === 'MATCH' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-in">
                    {/* Live Feed Column */}
                    <div className="lg:col-span-1 glass-panel rounded-2xl p-0 overflow-hidden flex flex-col h-[600px]">
                        <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                            <h3 className="font-bold text-sm">Incoming Stream</h3>
                            <span className="text-[10px] bg-black/40 px-2 py-1 rounded text-[#cbad90]">JSON Feed</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {events.map((evt, idx) => (
                                <div key={evt.id} className={`p-3 rounded-lg border border-white/5 flex items-center justify-between animate-slide-in ${idx === 0 ? 'bg-cyan-400/10 border-cyan-400/30' : 'bg-transparent'}`}>
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono text-[10px] text-[#cbad90]">{evt.time}</span>
                                        <div>
                                            <p className="text-xs font-bold text-white">{evt.player}</p>
                                            <p className="text-[10px] text-white/60">{evt.action}</p>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded ${evt.result === 'Success' || evt.result === 'Goal' ? 'text-neon-green bg-neon-green/10' : 'text-neon-red bg-neon-red/10'}`}>
                                        {evt.result}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* General Match Stats */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <div className="glass-panel p-6 rounded-2xl">
                             <div className="flex justify-between items-center mb-6">
                                <div className="text-center w-1/3">
                                    <h3 className="text-2xl font-bold text-white">HOME</h3>
                                    <p className="text-4xl font-mono text-cyan-400 font-bold mt-2">28</p>
                                </div>
                                <div className="text-center w-1/3">
                                    <div className="bg-black/40 px-4 py-1 rounded text-xs text-[#cbad90] font-mono">2nd HALF - 14:22</div>
                                    <p className="text-xs text-white/40 mt-1">vs</p>
                                </div>
                                <div className="text-center w-1/3">
                                    <h3 className="text-2xl font-bold text-white">AWAY</h3>
                                    <p className="text-4xl font-mono text-white font-bold mt-2">24</p>
                                </div>
                            </div>
                            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden flex">
                                <div className="bg-cyan-400 h-full" style={{width: '58%'}}></div>
                                <div className="bg-white/20 h-full flex-1"></div>
                            </div>
                            <div className="flex justify-between text-[10px] text-[#cbad90] mt-2 font-bold uppercase tracking-widest">
                                <span>Momentum: Home</span>
                                <span>Possession: 58%</span>
                            </div>
                        </div>

                         <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'Shot Efficiency', h: '62%', a: '54%' },
                                { label: '7m Penalties', h: '3/4', a: '1/2' },
                                { label: 'Turnovers', h: '5', a: '9' },
                                { label: 'Fast Breaks', h: '8', a: '3' },
                            ].map((s, i) => (
                                <div key={i} className="glass-panel p-4 rounded-xl flex flex-col justify-center">
                                    <p className="text-[10px] text-[#cbad90] uppercase text-center mb-2">{s.label}</p>
                                    <div className="flex justify-between items-center px-4">
                                        <span className="text-xl font-bold text-cyan-400">{s.h}</span>
                                        <span className="text-xl font-bold text-white/60">{s.a}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'TEAM' && (
                <div className="glass-panel p-6 rounded-2xl animate-slide-in">
                    <h3 className="text-white font-bold mb-6">Team Performance Metrics</h3>
                    <div className="space-y-8">
                         {/* Shot Distribution */}
                         <div>
                            <h4 className="text-xs text-[#cbad90] uppercase font-bold mb-3">Shot Distribution by Zone</h4>
                            <div className="h-48 flex items-end gap-2 px-4 border-b border-white/5 pb-2">
                                {['Left Wing', 'Left Back', 'Center', 'Right Back', 'Right Wing', '6m Line', '9m'].map((zone, i) => (
                                    <div key={i} className="flex-1 flex flex-col justify-end gap-1 h-full group">
                                        <div className="w-full bg-cyan-400/80 rounded-t-sm hover:opacity-100 transition-all" style={{height: `${Math.random() * 60 + 20}%`}}></div>
                                        <p className="text-[10px] text-white/40 text-center truncate">{zone}</p>
                                    </div>
                                ))}
                            </div>
                         </div>
                         
                         {/* Defense Stats */}
                         <div className="grid grid-cols-3 gap-6">
                            <div className="bg-white/5 p-4 rounded-lg">
                                <p className="text-xs text-[#cbad90]">Blocks</p>
                                <p className="text-2xl font-mono text-white">8</p>
                            </div>
                            <div className="bg-white/5 p-4 rounded-lg">
                                <p className="text-xs text-[#cbad90]">Steals</p>
                                <p className="text-2xl font-mono text-white">12</p>
                            </div>
                             <div className="bg-white/5 p-4 rounded-lg">
                                <p className="text-xs text-[#cbad90]">Goalkeeper Saves</p>
                                <p className="text-2xl font-mono text-white">34%</p>
                            </div>
                         </div>
                    </div>
                </div>
            )}

            {activeTab === 'PLAYERS' && (
                <div className="glass-panel p-0 rounded-2xl overflow-hidden animate-slide-in">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-[#cbad90] text-xs uppercase font-bold">
                            <tr>
                                <th className="p-4">Player</th>
                                <th className="p-4 text-center">G / S</th>
                                <th className="p-4 text-center">%</th>
                                <th className="p-4 text-center">Ast</th>
                                <th className="p-4 text-center">TO</th>
                                <th className="p-4 text-center">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {[
                                { name: 'M. Hansen', num: 24, g: 8, s: 10, a: 4, to: 1, min: '42:00' },
                                { name: 'S. Sagosen', num: 10, g: 5, s: 9, a: 6, to: 2, min: '38:15' },
                                { name: 'D. Mem', num: 15, g: 4, s: 5, a: 2, to: 0, min: '22:10' },
                                { name: 'A. Landin', num: 5, g: 2, s: 3, a: 1, to: 1, min: '55:00' },
                                { name: 'G. Gidsel', num: 19, g: 6, s: 7, a: 3, to: 1, min: '40:30' },
                            ].map((p, i) => (
                                <tr key={i} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-bold text-white">#{p.num} {p.name}</td>
                                    <td className="p-4 text-center font-mono">{p.g}/{p.s}</td>
                                    <td className="p-4 text-center font-mono text-cyan-400">{Math.round((p.g/p.s)*100)}%</td>
                                    <td className="p-4 text-center text-white/60">{p.a}</td>
                                    <td className="p-4 text-center text-neon-red">{p.to}</td>
                                    <td className="p-4 text-center text-white/40">{p.min}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};