import React, { useState } from 'react';

// Props to know if data is ready
export const AIStats: React.FC<{ hasProcessedData: boolean }> = ({ hasProcessedData }) => {
    const [activeTab, setActiveTab] = useState<'MATCH' | 'TEAM' | 'PLAYERS'>('MATCH');

    if (!hasProcessedData) {
        return (
             <div className="p-4 lg:p-8 max-w-[1600px] mx-auto w-full h-full flex items-center justify-center animate-slide-in">
                <div className="glass-panel p-12 rounded-2xl text-center max-w-lg border border-white/10">
                    <span className="material-symbols-outlined text-6xl text-white/20 mb-4">memory</span>
                    <h2 className="text-2xl font-bold text-white mb-2">No AI Data Available</h2>
                    <p className="text-white/50 text-sm mb-8">You haven't processed any video yet. Please go to Video Labs to extract statistics from match footage.</p>
                    {/* Note: In a real app we might use a router link here, but the user must navigate via sidebar */}
                    <div className="bg-white/5 p-4 rounded text-xs text-[#cbad90]">
                        Tip: Navigate to <strong>Video Labs &gt; AI Processor</strong> in the sidebar.
                    </div>
                </div>
             </div>
        );
    }

    return (
        <div className="p-4 lg:p-8 space-y-6 max-w-[1600px] mx-auto w-full animate-slide-in">
            {/* Header */}
            <div className="flex items-center justify-between glass-panel p-6 rounded-2xl border-l-4 border-l-neon-green">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                        <span className="material-symbols-outlined text-neon-green text-2xl">insights</span>
                        AI Auto-Stats Results
                    </h2>
                    <p className="text-[#cbad90] text-sm mt-1">Data extracted from: Match_Final_v2.mp4</p>
                </div>
                <div className="flex items-center gap-2 bg-neon-green/10 px-3 py-1 rounded-lg border border-neon-green/20">
                    <span className="material-symbols-outlined text-neon-green text-sm">check_circle</span>
                    <span className="text-neon-green text-xs font-bold">ANALYSIS COMPLETE</span>
                </div>
            </div>

            {/* Tabs */}
             <div className="flex gap-4 border-b border-white/10 pb-1">
                <button onClick={() => setActiveTab('MATCH')} className={`px-4 py-2 text-sm font-bold transition-all ${activeTab === 'MATCH' ? 'text-neon-green border-b-2 border-neon-green' : 'text-white/40 hover:text-white'}`}>Match Insights</button>
                <button onClick={() => setActiveTab('TEAM')} className={`px-4 py-2 text-sm font-bold transition-all ${activeTab === 'TEAM' ? 'text-neon-green border-b-2 border-neon-green' : 'text-white/40 hover:text-white'}`}>Tactical Formations</button>
                <button onClick={() => setActiveTab('PLAYERS')} className={`px-4 py-2 text-sm font-bold transition-all ${activeTab === 'PLAYERS' ? 'text-neon-green border-b-2 border-neon-green' : 'text-white/40 hover:text-white'}`}>Physical Metrics</button>
            </div>

            {/* CONTENT */}
            {activeTab === 'MATCH' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-in">
                    <div className="glass-panel p-6 rounded-2xl">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-neon-green">blur_on</span>
                            Global Heatmap (Ball Movement)
                        </h3>
                        <div className="relative aspect-[2/1] bg-[#2f2519] rounded-lg overflow-hidden border border-white/5 flex items-center justify-center group">
                            {/* Court simulation */}
                            <div className="absolute inset-0 border-2 border-white/10 m-4 rounded"></div>
                            <div className="absolute inset-y-0 left-1/2 border-l-2 border-white/10"></div>
                             {/* Blobs */}
                            <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-neon-red/40 blur-3xl rounded-full animate-pulse"></div>
                            <div className="absolute bottom-1/3 right-1/3 w-40 h-40 bg-primary/30 blur-3xl rounded-full"></div>
                        </div>
                    </div>
                     <div className="glass-panel p-0 rounded-2xl overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-white/5 bg-white/5">
                            <h3 className="font-bold text-sm text-white">AI Event Detection Log</h3>
                        </div>
                        <div className="overflow-y-auto flex-1 p-2 space-y-2 h-[300px]">
                            {[
                                { time: '04:22', type: 'Fast Break', conf: '98%', color: 'text-neon-green' },
                                { time: '08:15', type: 'Wing Shot', conf: '92%', color: 'text-neon-green' },
                                { time: '12:40', type: 'Defensive Foul', conf: '88%', color: 'text-primary' },
                                { time: '15:10', type: 'Passive Play', conf: '95%', color: 'text-neon-green' },
                            ].map((clip, idx) => (
                                <div key={idx} className="bg-black/20 p-3 rounded-lg flex items-center justify-between border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-white/50 text-sm">videocam</span>
                                        <div>
                                            <p className="text-xs font-bold text-white">{clip.type}</p>
                                            <p className="text-[10px] text-[#cbad90] font-mono">{clip.time}</p>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] font-bold ${clip.color}`}>{clip.conf}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'TEAM' && (
                <div className="glass-panel p-6 rounded-2xl animate-slide-in">
                    <h3 className="text-white font-bold mb-4">Tactical Setup Detection</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                            <h4 className="text-neon-green font-bold text-sm mb-2">Offensive Shape</h4>
                            <p className="text-3xl font-mono font-bold text-white">3 - 3</p>
                            <p className="text-xs text-white/50 mt-1">Detected in 75% of possessions</p>
                            <div className="w-full bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
                                <div className="bg-neon-green h-full w-[75%]"></div>
                            </div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                            <h4 className="text-neon-green font-bold text-sm mb-2">Defensive Shape</h4>
                            <p className="text-3xl font-mono font-bold text-white">6 - 0</p>
                            <p className="text-xs text-white/50 mt-1">Detected in 90% of possessions</p>
                             <div className="w-full bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
                                <div className="bg-neon-green h-full w-[90%]"></div>
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
                                <th className="p-4">Player Tracking</th>
                                <th className="p-4 text-center">Distance (km)</th>
                                <th className="p-4 text-center">Max Speed (km/h)</th>
                                <th className="p-4 text-center">Sprints</th>
                                <th className="p-4 text-center">Load Index</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {[
                                { name: 'M. Hansen', dist: '4.2', speed: '28.4', sprints: 12, load: 'High' },
                                { name: 'S. Sagosen', dist: '5.1', speed: '29.1', sprints: 18, load: 'Critical' },
                                { name: 'D. Mem', dist: '3.8', speed: '27.5', sprints: 8, load: 'Normal' },
                            ].map((p, i) => (
                                <tr key={i} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-bold text-white">{p.name}</td>
                                    <td className="p-4 text-center font-mono">{p.dist}</td>
                                    <td className="p-4 text-center font-mono">{p.speed}</td>
                                    <td className="p-4 text-center text-white/60">{p.sprints}</td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${p.load === 'Critical' ? 'bg-neon-red/20 text-neon-red' : 'bg-neon-green/20 text-neon-green'}`}>{p.load}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};