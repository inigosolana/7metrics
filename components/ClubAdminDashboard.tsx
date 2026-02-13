import React, { useState } from 'react';

export const ClubAdminDashboard: React.FC = () => {
    // Mock Data
    const [teams, setTeams] = useState([
        { id: '1', name: 'Senior A Men', coach: 'Coach Anderson' },
        { id: '2', name: 'Senior B Men', coach: 'Unassigned' },
        { id: '3', name: 'U19 Academy', coach: 'Coach Sarah' },
    ]);

    const [coaches, setCoaches] = useState([
        { id: 'c1', name: 'Coach Anderson', assignedTeam: 'Senior A Men', isPlayer: false },
        { id: 'c2', name: 'Coach Sarah', assignedTeam: 'U19 Academy', isPlayer: true, playerTeam: 'Senior Women' },
        { id: 'c3', name: 'New Hire', assignedTeam: null, isPlayer: false },
    ]);

    const [isAddTeamOpen, setIsAddTeamOpen] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');
    const [newTeamCoach, setNewTeamCoach] = useState('');

    const handleAddTeam = () => {
        if (!newTeamName) return;
        const newTeam = {
            id: Date.now().toString(),
            name: newTeamName,
            coach: newTeamCoach || 'Unassigned'
        };
        setTeams([...teams, newTeam]);
        setNewTeamName('');
        setNewTeamCoach('');
        setIsAddTeamOpen(false);
    };

    return (
        <div className="p-4 lg:p-8 space-y-8 max-w-[1600px] mx-auto w-full animate-slide-in">
             <div className="glass-panel p-8 rounded-2xl border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-900/20 to-transparent flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        <span className="material-symbols-outlined text-blue-500 text-4xl">domain</span>
                        Club Admin Portal
                    </h2>
                    <p className="text-[#cbad90] mt-2">Manage Teams, Roster & Coaching Staff</p>
                </div>
                <button 
                    onClick={() => setIsAddTeamOpen(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
                >
                    <span className="material-symbols-outlined">add</span>
                    Add New Team
                </button>
            </div>

            {/* Add Team Modal */}
            {isAddTeamOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-slide-in">
                    <div className="bg-[#1a120b] border border-white/10 w-[400px] rounded-2xl overflow-hidden p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-6">Create New Team</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-[#cbad90] uppercase mb-2">Team Name</label>
                                <input 
                                    type="text" 
                                    value={newTeamName}
                                    onChange={(e) => setNewTeamName(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                                    placeholder="e.g. U17 Boys"
                                />
                            </div>
                             <div>
                                <label className="block text-xs font-bold text-[#cbad90] uppercase mb-2">Assign Coach (Optional)</label>
                                <select 
                                    value={newTeamCoach}
                                    onChange={(e) => setNewTeamCoach(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                                >
                                    <option value="">-- Unassigned --</option>
                                    {coaches.map(c => (
                                        <option key={c.id} value={c.name}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setIsAddTeamOpen(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-white/60">Cancel</button>
                            <button onClick={handleAddTeam} className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl font-bold text-white">Save Team</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Team Management */}
                <div className="glass-panel p-6 rounded-2xl">
                    <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Active Teams</h3>
                    <div className="space-y-4">
                        {teams.map(team => (
                            <div key={team.id} className="bg-white/5 p-4 rounded-xl flex items-center justify-between group hover:bg-white/10 transition-colors">
                                <div>
                                    <h4 className="font-bold text-white">{team.name}</h4>
                                    <p className="text-xs text-white/50">Head Coach: <span className="text-primary">{team.coach}</span></p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 bg-black/20 rounded hover:text-white text-white/60">
                                        <span className="material-symbols-outlined text-sm">group</span>
                                    </button>
                                    <button className="p-2 bg-black/20 rounded hover:text-white text-white/60">
                                        <span className="material-symbols-outlined text-sm">settings</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Staff Management */}
                <div className="glass-panel p-6 rounded-2xl">
                    <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Coaching Staff</h3>
                    <div className="space-y-4">
                        {coaches.map(coach => (
                            <div key={coach.id} className="bg-white/5 p-4 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                                        {coach.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-sm">{coach.name}</h4>
                                        <p className="text-[10px] text-white/50">{coach.assignedTeam || 'No Assignment'}</p>
                                        {coach.isPlayer && (
                                            <span className="text-[10px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded mt-1 inline-block">
                                                Also Player ({coach.playerTeam})
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button className="text-xs font-bold text-blue-400 hover:text-white">Edit Access</button>
                            </div>
                        ))}
                        <button className="w-full py-3 border border-dashed border-white/20 rounded-xl text-white/40 hover:text-white hover:border-white/40 transition-all text-sm font-bold">
                            + Register New Coach
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};