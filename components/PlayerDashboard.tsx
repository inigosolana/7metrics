import React, { useState } from 'react';

export const PlayerDashboard: React.FC = () => {
    const [photo, setPhoto] = useState('https://images.unsplash.com/photo-1547347298-4074fc3043af?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60');

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setPhoto(URL.createObjectURL(e.target.files[0]));
        }
    };

    return (
        <div className="p-4 lg:p-8 space-y-8 max-w-4xl mx-auto w-full animate-slide-in">
            <div className="glass-panel p-8 rounded-2xl border-l-4 border-l-neon-green bg-gradient-to-r from-green-900/10 to-transparent flex flex-col md:flex-row items-center gap-8">
                <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl">
                        <img src={photo} alt="Me" className="w-full h-full object-cover" />
                    </div>
                    <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <span className="material-symbols-outlined text-white">photo_camera</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                    </label>
                </div>
                <div className="text-center md:text-left">
                    <h2 className="text-3xl font-bold text-white">Mikkel Hansen</h2>
                    <p className="text-[#cbad90] text-lg">Left Back #24 • Senior A Men</p>
                    <div className="flex gap-4 mt-4 justify-center md:justify-start">
                        <div className="text-center">
                            <span className="block text-2xl font-bold text-white">84</span>
                            <span className="text-xs text-white/50 uppercase">Goals</span>
                        </div>
                        <div className="w-px h-10 bg-white/10"></div>
                        <div className="text-center">
                            <span className="block text-2xl font-bold text-white">42</span>
                            <span className="text-xs text-white/50 uppercase">Assists</span>
                        </div>
                        <div className="w-px h-10 bg-white/10"></div>
                        <div className="text-center">
                            <span className="block text-2xl font-bold text-neon-green">9.2</span>
                            <span className="text-xs text-white/50 uppercase">Rating</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl">
                <h3 className="text-white font-bold mb-4">My Performance History</h3>
                 <div className="h-64 border-b border-l border-white/10 relative mt-4">
                     {/* Mock Graph */}
                     <div className="absolute bottom-0 left-0 right-0 top-0 flex items-end justify-between px-4 pb-2">
                        {[5, 8, 4, 9, 7, 10, 6, 8, 12, 9].map((val, i) => (
                             <div key={i} className="w-1/12 bg-neon-green/50 hover:bg-neon-green rounded-t transition-colors relative group" style={{ height: `${val * 8}%` }}>
                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-white text-xs opacity-0 group-hover:opacity-100">{val}</span>
                             </div>
                        ))}
                     </div>
                 </div>
                 <p className="text-center text-xs text-white/40 mt-2">Goals per Match</p>
            </div>
        </div>
    );
};