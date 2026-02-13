import React, { useState } from 'react';
import { Player } from '../types';

interface TeamHubProps {
    clubLogo: string;
    setClubLogo: (url: string) => void;
}

export const TeamHub: React.FC<TeamHubProps> = ({ clubLogo, setClubLogo }) => {
    const [viewMode, setViewMode] = useState<'PLAYERS' | 'TEAM' | 'SETTINGS'>('PLAYERS');
    const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);

    // Initial mock players
    const [players, setPlayers] = useState<Player[]>([
        { id: 1, name: 'Mikkel Hansen', pos: 'Left Back', goals: 84, assists: 42, matches: 12, rating: 9.2, photoUrl: 'https://images.unsplash.com/photo-1547347298-4074fc3043af?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' },
        { id: 2, name: 'Sander Sagosen', pos: 'Center Back', goals: 76, assists: 55, matches: 11, rating: 9.0, photoUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' },
        { id: 3, name: 'Dika Mem', pos: 'Right Back', goals: 62, assists: 28, matches: 12, rating: 8.8, photoUrl: 'https://images.unsplash.com/photo-1519340333755-56e9c1d04579?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' },
        { id: 4, name: 'Niklas Landin', pos: 'Goalkeeper', goals: 1, assists: 12, matches: 12, rating: 9.5, photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' },
    ]);

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            // In a real app, upload to server. Here, use local object URL or a mock
            // For persistence in this demo environment, we will just simulate a change or use a blob
            const url = URL.createObjectURL(e.target.files[0]);
            setClubLogo(url);
        }
    };

    const handlePlayerPhotoUpload = (playerId: number, e: React.ChangeEvent<HTMLInputElement>) => {
         if (e.target.files?.[0]) {
            const url = URL.createObjectURL(e.target.files[0]);
            setPlayers(players.map(p => p.id === playerId ? { ...p, photoUrl: url } : p));
        }
    };

    return (
        <div className="p-4 lg:p-8 space-y-6 max-w-[1600px] mx-auto w-full animate-slide-in">
             {/* Header */}
             <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-900/20 to-transparent flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <span className="material-symbols-outlined text-purple-500 text-3xl">hub</span>
                        Team Hub & Season Stats
                    </h2>
                    <p className="text-[#cbad90] text-sm mt-1">Cumulative statistics for Season 2024/2025</p>
                </div>
                {/* Logo Preview */}
                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs text-white/50">Club Branding</p>
                        <button onClick={() => setViewMode('SETTINGS')} className="text-xs text-primary underline">Edit</button>
                    </div>
                    <img src={clubLogo} alt="Club" className="w-16 h-16 rounded-full object-cover border-2 border-white/10" />
                </div>
            </div>

            <div className="flex gap-4">
                <button 
                    onClick={() => { setViewMode('PLAYERS'); setSelectedPlayer(null); }}
                    className={`px-6 py-3 rounded-xl font-bold transition-all ${viewMode === 'PLAYERS' ? 'bg-purple-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                >
                    Player Roster
                </button>
                <button 
                    onClick={() => setViewMode('TEAM')}
                    className={`px-6 py-3 rounded-xl font-bold transition-all ${viewMode === 'TEAM' ? 'bg-purple-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                >
                    Team Overview
                </button>
                <button 
                    onClick={() => setViewMode('SETTINGS')}
                    className={`px-6 py-3 rounded-xl font-bold transition-all ${viewMode === 'SETTINGS' ? 'bg-purple-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                >
                    Settings
                </button>
            </div>

            {/* PLAYER ROSTER WITH PHOTOS */}
            {viewMode === 'PLAYERS' && !selectedPlayer && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {players.map(player => (
                        <div 
                            key={player.id} 
                            onClick={() => setSelectedPlayer(player.id)}
                            className="glass-panel p-0 rounded-2xl cursor-pointer hover:border-purple-500/50 transition-all group relative overflow-hidden"
                        >
                            <div className="h-48 w-full relative">
                                <img src={player.photoUrl} alt={player.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#1a120b] to-transparent"></div>
                                <div className="absolute bottom-4 left-4">
                                     <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">{player.name}</h3>
                                     <p className="text-xs text-[#cbad90] uppercase tracking-wide">{player.pos}</p>
                                </div>
                            </div>
                            
                            <div className="p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/60">Matches</span>
                                    <span className="font-mono font-bold text-white">{player.matches}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/60">Goals</span>
                                    <span className="font-mono font-bold text-neon-green">{player.goals}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {/* Add Player Button */}
                    <div className="glass-panel rounded-2xl border-dashed border-2 border-white/10 flex flex-col items-center justify-center min-h-[300px] cursor-pointer hover:bg-white/5">
                        <span className="material-symbols-outlined text-4xl text-white/30">add_photo_alternate</span>
                        <p className="text-white/30 mt-2 text-sm font-bold">Add Player</p>
                    </div>
                </div>
            )}

            {/* PLAYER DETAIL VIEW */}
            {viewMode === 'PLAYERS' && selectedPlayer && (
                <div className="glass-panel p-6 rounded-2xl animate-slide-in">
                    <button onClick={() => setSelectedPlayer(null)} className="mb-4 text-xs text-purple-400 hover:text-white flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Roster
                    </button>
                    
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Photo Column */}
                        <div className="w-full md:w-1/3">
                            <div className="aspect-[3/4] rounded-xl overflow-hidden relative group">
                                <img 
                                    src={players.find(p => p.id === selectedPlayer)?.photoUrl} 
                                    className="w-full h-full object-cover" 
                                    alt="Player" 
                                />
                                <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <span className="text-white text-xs font-bold border border-white px-3 py-1 rounded">Change Photo</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handlePlayerPhotoUpload(selectedPlayer, e)} />
                                </label>
                            </div>
                        </div>

                        {/* Stats Column */}
                        <div className="w-full md:w-2/3">
                             <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-4xl font-bold text-white">{players.find(p => p.id === selectedPlayer)?.name}</h2>
                                    <p className="text-xl text-[#cbad90] mt-1">{players.find(p => p.id === selectedPlayer)?.pos}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-white/60">Season Rating</p>
                                    <p className="text-5xl font-mono font-bold text-purple-400">{players.find(p => p.id === selectedPlayer)?.rating}</p>
                                </div>
                            </div>

                            <div className="mt-8 h-64 border border-white/5 bg-black/20 rounded-xl flex items-end justify-between px-6 pb-4 gap-4">
                                {/* Mock Chart */}
                                {[1,2,3,4,5,6,7,8,9,10].map((match) => {
                                    const h = Math.random() * 80 + 20;
                                    return (
                                        <div key={match} className="flex-1 flex flex-col justify-end gap-2 group">
                                            <div 
                                                className="w-full bg-purple-500/50 rounded-t hover:bg-purple-500 transition-colors relative" 
                                                style={{ height: `${h}%` }}
                                            ></div>
                                            <p className="text-center text-[10px] text-white/30">M{match}</p>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TEAM OVERVIEW */}
            {viewMode === 'TEAM' && (
                <div className="space-y-6 animate-slide-in">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glass-panel p-6 rounded-2xl text-center">
                            <h3 className="text-[#cbad90] text-xs uppercase font-bold mb-2">League Position</h3>
                            <p className="text-5xl font-bold text-white">1st</p>
                        </div>
                        <div className="glass-panel p-6 rounded-2xl text-center">
                            <h3 className="text-[#cbad90] text-xs uppercase font-bold mb-2">Goals / Game</h3>
                            <p className="text-5xl font-bold text-white">32.4</p>
                        </div>
                         <div className="glass-panel p-6 rounded-2xl text-center">
                            <h3 className="text-[#cbad90] text-xs uppercase font-bold mb-2">Defense Efficiency</h3>
                            <p className="text-5xl font-bold text-white">68%</p>
                        </div>
                    </div>
                </div>
            )}

            {/* SETTINGS (LOGO UPLOAD) */}
            {viewMode === 'SETTINGS' && (
                <div className="glass-panel p-8 rounded-2xl animate-slide-in max-w-2xl mx-auto">
                    <h3 className="text-xl font-bold text-white mb-6">Club Identity</h3>
                    
                    <div className="flex items-center gap-8">
                        <div className="w-32 h-32 rounded-full border-4 border-white/10 overflow-hidden relative group">
                            <img src={clubLogo} className="w-full h-full object-cover" alt="Club Logo" />
                             <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <span className="material-symbols-outlined text-white">edit</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                             </label>
                        </div>
                        <div>
                            <h4 className="font-bold text-white">Club Logo</h4>
                            <p className="text-sm text-white/50 mb-4">Recommended size: 500x500px. PNG or JPG.</p>
                            <label className="bg-primary hover:bg-primary/80 text-white font-bold py-2 px-6 rounded-lg cursor-pointer transition-colors">
                                Upload New Logo
                                <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                            </label>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};