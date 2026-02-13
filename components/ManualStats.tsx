import React, { useState } from 'react';
import { HandballEvent } from '../types';
import { TacticalEntryModal } from './TacticalEntryModal';

export const ManualStats: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'MATCH' | 'TEAM' | 'PLAYERS'>('MATCH');
    const [taggedEvents, setTaggedEvents] = useState<HandballEvent[]>([
        {
            id: '1',
            timestamp: Date.now() - 500000,
            timeFormatted: '01:23',
            action: 'Goal',
            player: 'M. Hansen',
            team: 'HOME',
            courtZone: 'Central',
            goalZone: 1
        },
        {
            id: '2',
            timestamp: Date.now() - 300000,
            timeFormatted: '02:45',
            action: 'Missed Shot',
            player: 'S. Sagosen',
            team: 'HOME',
            courtZone: 'Lateral Izq',
            goalZone: 5
        },
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<string>('');

    const openTagWizard = (label: string) => {
        setPendingAction(label);
        setIsModalOpen(true);
    };

    const handleSaveEvent = (details: Partial<HandballEvent>) => {
        const newEvent: HandballEvent = {
            id: Date.now().toString(),
            timestamp: Date.now(),
            timeFormatted: `0${Math.floor(Math.random() * 9)}:${Math.floor(Math.random() * 59)}`,
            action: details.action || pendingAction,
            player: 'M. Hansen', // Mock default player
            team: 'HOME',
            ...details
        } as HandballEvent;

        setTaggedEvents([newEvent, ...taggedEvents]);
    };

    const deleteEvent = (id: string) => {
        setTaggedEvents(taggedEvents.filter(e => e.id !== id));
    };

    return (
        <div className="p-4 lg:p-8 space-y-6 max-w-[1600px] mx-auto w-full animate-slide-in">
            <TacticalEntryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveEvent}
                initialAction={pendingAction}
            />

            {/* Header */}
            <div className="flex items-center justify-between glass-panel p-6 rounded-2xl border-l-4 border-l-primary bg-gradient-to-r from-primary/10 to-transparent">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-2xl">edit_note</span>
                        Professional Technical Tagging
                    </h2>
                    <p className="text-[#cbad90] text-sm mt-1">Advanced Handball Data Entry Wizard</p>
                </div>
                <div className="bg-black/40 px-4 py-2 rounded-xl border border-white/10 flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-[10px] text-white/40 uppercase font-bold">Session Active</p>
                        <p className="text-xs font-mono text-white">Match_24_Final.mp4</p>
                    </div>
                    <span className="material-symbols-outlined text-neon-green animate-pulse">sensors</span>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-white/10 pb-1">
                <button onClick={() => setActiveTab('MATCH')} className={`px-4 py-2 text-sm font-bold transition-all ${activeTab === 'MATCH' ? 'text-primary border-b-2 border-primary' : 'text-white/40 hover:text-white'}`}>Technical Breakdown</button>
                <button onClick={() => setActiveTab('TEAM')} className={`px-4 py-2 text-sm font-bold transition-all ${activeTab === 'TEAM' ? 'text-primary border-b-2 border-primary' : 'text-white/40 hover:text-white'}`}>Team Strategy</button>
                <button onClick={() => setActiveTab('PLAYERS')} className={`px-4 py-2 text-sm font-bold transition-all ${activeTab === 'PLAYERS' ? 'text-primary border-b-2 border-primary' : 'text-white/40 hover:text-white'}`}>Player Analysis</button>
            </div>

            {activeTab === 'MATCH' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-slide-in">
                    {/* Video Player Area */}
                    <div className="lg:col-span-8 flex flex-col gap-4">
                        <div className="aspect-video bg-black rounded-xl overflow-hidden border border-white/10 relative shadow-2xl group">
                            <div className="absolute inset-0 flex items-center justify-center text-white/20">
                                <div className="flex flex-col items-center">
                                    <span className="material-symbols-outlined text-6xl group-hover:scale-110 transition-transform">play_circle</span>
                                    <span className="text-sm font-mono mt-2">VIDEO LOADED: BARCA_KIE_FINAL.mp4</span>
                                </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                                <div className="h-full bg-primary w-1/3"></div>
                            </div>
                        </div>
                        {/* Tagging Controls */}
                        <div className="glass-panel p-6 rounded-xl">
                            <p className="text-[10px] text-[#cbad90] uppercase font-bold tracking-widest mb-4 flex justify-between">
                                Quick Action Tags
                                <span className="text-white/20 italic font-normal">Opens advanced entry wizard</span>
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <button onClick={() => openTagWizard('Goal')} className="bg-neon-green/10 hover:bg-neon-green/20 border border-neon-green/30 text-neon-green py-5 rounded-xl font-black transition-all active:scale-95 flex flex-col items-center gap-1 group">
                                    <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">sports_score</span>
                                    GOAL
                                </button>
                                <button onClick={() => openTagWizard('Missed Shot')} className="bg-neon-red/10 hover:bg-neon-red/20 border border-neon-red/30 text-neon-red py-5 rounded-xl font-black transition-all active:scale-95 flex flex-col items-center gap-1 group">
                                    <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">close</span>
                                    MISS
                                </button>
                                <button onClick={() => openTagWizard('Turnover')} className="bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary py-5 rounded-xl font-black transition-all active:scale-95 flex flex-col items-center gap-1 group">
                                    <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">sync_problem</span>
                                    TURNOVER
                                </button>
                                <button onClick={() => openTagWizard('Foul')} className="bg-white/5 hover:bg-white/10 border border-white/20 text-white py-5 rounded-xl font-black transition-all active:scale-95 flex flex-col items-center gap-1 group">
                                    <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">report</span>
                                    FOUL
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tagged List */}
                    <div className="lg:col-span-4 glass-panel p-0 rounded-xl overflow-hidden flex flex-col h-[650px]">
                        <div className="p-4 bg-white/5 border-b border-white/5 flex justify-between items-center">
                            <h3 className="text-white font-bold text-sm">Event Stream</h3>
                            <button className="text-[10px] bg-primary/20 text-primary px-2 py-1 rounded font-bold">EXPORT CSV</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {taggedEvents.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-white/20 italic text-sm">No events tagged yet</div>
                            ) : (
                                taggedEvents.map((evt) => (
                                    <div key={evt.id} className="bg-black/40 p-4 rounded-xl border border-white/5 flex flex-col gap-3 group animate-slide-in relative overflow-hidden">
                                        {/* Activity line indicator */}
                                        <div className={`absolute top-0 left-0 bottom-0 w-1 ${evt.action === 'Goal' ? 'bg-neon-green' : evt.action === 'Missed Shot' ? 'bg-neon-red' : 'bg-primary'}`}></div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="font-mono text-xs text-primary font-bold">{evt.timeFormatted}</span>
                                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${evt.action === 'Goal' ? 'bg-neon-green/20 text-neon-green' : 'bg-white/10 text-white/60'}`}>{evt.action}</span>
                                            </div>
                                            <button onClick={() => deleteEvent(evt.id)} className="text-white/10 hover:text-neon-red transition-colors opacity-0 group-hover:opacity-100">
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <p className="text-sm font-bold text-white">#{evt.player}</p>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {evt.courtZone && <span className="text-[9px] bg-white/5 px-2 py-0.5 rounded text-white/40 border border-white/5">Zone: {evt.courtZone}</span>}
                                                {evt.goalZone && <span className="text-[9px] bg-white/5 px-2 py-0.5 rounded text-white/40 border border-white/5">Goal Target: {evt.goalZone}</span>}
                                                {evt.defenseAtMoment && <span className="text-[9px] bg-white/5 px-2 py-0.5 rounded text-white/40 border border-white/5">Vs Def: {evt.defenseAtMoment}</span>}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'TEAM' && (
                <div className="glass-panel p-8 rounded-2xl animate-slide-in space-y-6">
                    <div>
                        <h3 className="text-white font-bold text-xl mb-2">Team-Level Strategic Insights</h3>
                        <p className="text-white/40 text-sm">Capture collective tactical behaviors and patterns.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <button onClick={() => openTagWizard('Offensive Rotation')} className="p-6 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/50 rounded-2xl text-left transition-all group">
                            <span className="material-symbols-outlined text-primary text-3xl mb-4 group-hover:rotate-12 transition-transform">rebase_edit</span>
                            <h4 className="font-bold text-white mb-1">Execution Quality</h4>
                            <p className="text-xs text-white/40">Mark success/failure of predefined playbooks.</p>
                        </button>
                        <button onClick={() => openTagWizard('Defensive Gap')} className="p-6 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-neon-red/50 rounded-2xl text-left transition-all group">
                            <span className="material-symbols-outlined text-neon-red text-3xl mb-4 group-hover:rotate-12 transition-transform">emergency_home</span>
                            <h4 className="font-bold text-white mb-1">Defensive Lapse</h4>
                            <p className="text-xs text-white/40">Identify exact moment of sliding/covering failure.</p>
                        </button>
                        <button onClick={() => openTagWizard('Transition')} className="p-6 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-400/50 rounded-2xl text-left transition-all group">
                            <span className="material-symbols-outlined text-cyan-400 text-3xl mb-4 group-hover:rotate-12 transition-transform">bolt</span>
                            <h4 className="font-bold text-white mb-1">Transition Speed</h4>
                            <p className="text-xs text-white/40">Time measurement for Fast Breaks or Retreats.</p>
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'PLAYERS' && (
                <div className="glass-panel p-0 rounded-2xl overflow-hidden animate-slide-in shadow-2xl">
                    <div className="p-6 border-b border-white/10 bg-white/5">
                        <h3 className="text-white font-bold text-lg">In-Match Technical Grading</h3>
                        <p className="text-white/40 text-xs mt-1">Acknowledge technical details for individual performance reviews.</p>
                    </div>
                    <table className="w-full text-left text-sm">
                        <thead className="bg-black/40 text-[#cbad90] text-[10px] uppercase font-bold tracking-widest">
                            <tr>
                                <th className="p-6">Technical Profile</th>
                                <th className="p-6 text-center">Form (Visual)</th>
                                <th className="p-6 text-center">Coach Comments</th>
                                <th className="p-6 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {[
                                { name: 'M. Hansen', grade: 'A', note: 'Mastering the 9m shot today' },
                                { name: 'S. Sagosen', grade: 'B+', note: 'Exceptional assists, 2 turnovers' },
                                { name: 'D. Mem', grade: 'A-', note: 'Aggressive on defense' },
                            ].map((p, i) => (
                                <tr key={i} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-6">
                                        <p className="font-bold text-white text-base">{p.name}</p>
                                        <p className="text-[10px] text-white/30 uppercase tracking-widest">Season Average: 8.8</p>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex justify-center gap-1">
                                            {[1, 2, 3, 4, 5].map(dot => (
                                                <div key={dot} className={`w-2 h-2 rounded-full ${dot <= (p.grade.startsWith('A') ? 5 : 4) ? 'bg-primary' : 'bg-white/10'}`}></div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-6 text-center text-white/60 text-xs italic font-serif">"{p.note}"</td>
                                    <td className="p-6 text-center">
                                        <button className="text-[10px] bg-white/5 border border-white/10 px-4 py-2 rounded-lg hover:bg-primary hover:text-white hover:border-primary transition-all font-bold">ADD NOTE</button>
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