import React, { useState } from 'react';
import { Club } from '../types';

interface SuperAdminDashboardProps {
    clubs: Club[];
    updateClubSubscription: (clubId: string, features: any) => void;
    onAddClub: (club: Club) => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ clubs, updateClubSubscription, onAddClub }) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newClubName, setNewClubName] = useState('');
    const [newClubTier, setNewClubTier] = useState<'BASIC' | 'PRO' | 'ELITE'>('BASIC');

    const handleCreateClub = () => {
        if (!newClubName) return;

        const features = {
            BASIC: { aiStats: false, clipEditor: false, externalApp: false, videoGen: false },
            PRO: { aiStats: true, clipEditor: true, externalApp: false, videoGen: false },
            ELITE: { aiStats: true, clipEditor: true, externalApp: true, videoGen: true }
        };

        const newClub: Club = {
            id: `c${Date.now()}`,
            name: newClubName,
            logoUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100', // Default placeholder
            subscription: {
                tier: newClubTier,
                features: features[newClubTier]
            }
        };

        onAddClub(newClub);
        setIsAddModalOpen(false);
        setNewClubName('');
    };

    return (
        <div className="p-4 lg:p-8 space-y-8 max-w-[1600px] mx-auto w-full animate-slide-in">
            <div className="glass-panel p-8 rounded-2xl border-l-4 border-l-red-500 bg-gradient-to-r from-red-900/20 to-transparent flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        <span className="material-symbols-outlined text-red-500 text-4xl">admin_panel_settings</span>
                        Super Admin Console
                    </h2>
                    <p className="text-[#cbad90] mt-2">Manage Global Club Subscriptions & Feature Flags</p>
                </div>
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-red-500/20 flex items-center gap-2"
                >
                    <span className="material-symbols-outlined">add_business</span>
                    Add New Club
                </button>
            </div>

            {/* Add Club Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-slide-in">
                    <div className="bg-[#1a120b] border border-white/10 w-[500px] rounded-2xl overflow-hidden p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-6">Register New Club</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-[#cbad90] uppercase mb-2">Club Name</label>
                                <input 
                                    type="text" 
                                    value={newClubName}
                                    onChange={(e) => setNewClubName(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-red-500 outline-none"
                                    placeholder="e.g. Barcelona Handball"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#cbad90] uppercase mb-2">Subscription Tier</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['BASIC', 'PRO', 'ELITE'].map((tier) => (
                                        <button 
                                            key={tier}
                                            onClick={() => setNewClubTier(tier as any)}
                                            className={`py-3 rounded-lg text-xs font-bold border ${newClubTier === tier ? 'bg-red-500 border-red-500 text-white' : 'bg-white/5 border-white/10 text-white/50 hover:text-white'}`}
                                        >
                                            {tier}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-white/60">Cancel</button>
                            <button onClick={handleCreateClub} className="flex-1 py-3 bg-red-500 hover:bg-red-600 rounded-xl font-bold text-white">Create Club</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6">
                {clubs.map(club => (
                    <div key={club.id} className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <img src={club.logoUrl} alt={club.name} className="w-16 h-16 rounded-full object-cover border-2 border-white/10" />
                            <div>
                                <h3 className="text-xl font-bold text-white">{club.name}</h3>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${club.subscription.tier === 'ELITE' ? 'bg-purple-500/20 text-purple-400' : 'bg-white/10 text-white/60'}`}>
                                    {club.subscription.tier} PLAN
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {/* Feature Toggles */}
                            <button 
                                onClick={() => updateClubSubscription(club.id, { ...club.subscription.features, aiStats: !club.subscription.features.aiStats })}
                                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 border transition-all ${club.subscription.features.aiStats ? 'bg-neon-green/10 border-neon-green text-neon-green' : 'bg-black/40 border-white/10 text-white/40'}`}
                            >
                                <span className="material-symbols-outlined text-sm">insights</span>
                                AI Stats
                            </button>

                            <button 
                                onClick={() => updateClubSubscription(club.id, { ...club.subscription.features, clipEditor: !club.subscription.features.clipEditor })}
                                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 border transition-all ${club.subscription.features.clipEditor ? 'bg-primary/10 border-primary text-primary' : 'bg-black/40 border-white/10 text-white/40'}`}
                            >
                                <span className="material-symbols-outlined text-sm">content_cut</span>
                                Clip Editor
                            </button>

                             <button 
                                onClick={() => updateClubSubscription(club.id, { ...club.subscription.features, videoGen: !club.subscription.features.videoGen })}
                                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 border transition-all ${club.subscription.features.videoGen ? 'bg-purple-500/10 border-purple-500 text-purple-400' : 'bg-black/40 border-white/10 text-white/40'}`}
                            >
                                <span className="material-symbols-outlined text-sm">view_in_ar</span>
                                3D Board
                            </button>

                            <button 
                                onClick={() => updateClubSubscription(club.id, { ...club.subscription.features, externalApp: !club.subscription.features.externalApp })}
                                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 border transition-all ${club.subscription.features.externalApp ? 'bg-cyan-400/10 border-cyan-400 text-cyan-400' : 'bg-black/40 border-white/10 text-white/40'}`}
                            >
                                <span className="material-symbols-outlined text-sm">tablet_mac</span>
                                Ext. API
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};