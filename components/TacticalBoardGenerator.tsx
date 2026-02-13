import React, { useState } from 'react';
import { generateTrainingVideo, pollVideoOperation } from '../services/geminiService';

export const TacticalBoardGenerator: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const [prompt, setPrompt] = useState('3D Animation: Handball defensive drill, 6-0 formation sliding to 5-1, blue court, tactical view');
    const [status, setStatus] = useState<'idle' | 'generating' | 'polling' | 'completed' | 'error'>('idle');
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [progressText, setProgressText] = useState('');

    const handleGenerate = async () => {
        setStatus('generating');
        setProgressText('Initializing 3D Tactical Engine...');
        try {
            let operation = await generateTrainingVideo(prompt);
            setStatus('polling');
            
            // Poll loop
            const pollInterval = setInterval(async () => {
                setProgressText('Rendering physics & player movement...');
                try {
                    const updatedOp = await pollVideoOperation(operation);
                    if (updatedOp.done) {
                        clearInterval(pollInterval);
                        if (updatedOp.error) {
                            setStatus('error');
                            setProgressText('Generation failed.');
                        } else {
                            const uri = updatedOp.response?.generatedVideos?.[0]?.video?.uri;
                            if (uri) {
                                const finalUrl = `${uri}&key=${process.env.API_KEY}`;
                                setVideoUrl(finalUrl);
                                setStatus('completed');
                            } else {
                                setStatus('error');
                            }
                        }
                    }
                } catch (e) {
                    clearInterval(pollInterval);
                    setStatus('error');
                }
            }, 5000);

        } catch (error) {
            console.error(error);
            setStatus('error');
            setProgressText('Failed to start generation. Check API Key.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-slide-in">
            <div className="bg-[#1a120b] border border-primary/30 w-[700px] rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-primary/10 to-transparent">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                        <span className="material-symbols-outlined text-primary text-2xl">view_in_ar</span>
                        AI 3D Tactical Board Generator
                    </h2>
                    <button onClick={onClose} className="text-white/50 hover:text-white">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                
                <div className="p-6 space-y-6">
                    {status === 'idle' && (
                        <>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <button className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left transition-colors group">
                                    <span className="material-symbols-outlined text-neon-green text-3xl mb-2 group-hover:scale-110 transition-transform">sports_handball</span>
                                    <h3 className="font-bold text-white text-sm">Recreate Match Play</h3>
                                    <p className="text-[10px] text-white/50">Turn a text description of a specific match moment into a 3D replay.</p>
                                </button>
                                <button className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left transition-colors group">
                                    <span className="material-symbols-outlined text-primary text-3xl mb-2 group-hover:scale-110 transition-transform">fitness_center</span>
                                    <h3 className="font-bold text-white text-sm">Generate Drill</h3>
                                    <p className="text-[10px] text-white/50">Create a new training exercise for defense or attack patterns.</p>
                                </button>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#cbad90] uppercase mb-2">Describe the Play or Exercise</label>
                                <textarea 
                                    value={prompt}
                                    onChange={e => setPrompt(e.target.value)}
                                    placeholder="E.g., Player A passes to Wing, Wing cuts inside, Pivot sets a block..."
                                    className="w-full h-32 bg-black/20 border border-white/10 rounded-lg p-3 text-sm focus:border-primary outline-none resize-none font-mono text-white/80"
                                />
                                <div className="flex justify-between mt-2">
                                    <p className="text-[10px] text-white/40">Powered by Veo Generative 3D Model.</p>
                                    <span className="text-[10px] text-primary font-bold">Costs 25 Tokens</span>
                                </div>
                            </div>
                            <button 
                                onClick={handleGenerate}
                                className="w-full py-4 bg-gradient-to-r from-primary to-orange-600 rounded-xl font-bold text-white shadow-lg shadow-primary/20 hover:scale-[1.01] transition-transform flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined">auto_awesome</span>
                                Generate 3D Simulation
                            </button>
                        </>
                    )}

                    {(status === 'generating' || status === 'polling') && (
                        <div className="flex flex-col items-center justify-center py-12 space-y-6">
                            <div className="relative">
                                <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary animate-pulse">3d_rotation</span>
                                </div>
                            </div>
                            <div className="text-center space-y-1">
                                <p className="text-white font-bold text-lg">Constructing 3D Environment</p>
                                <p className="text-neon-green font-mono text-sm">{progressText}</p>
                            </div>
                        </div>
                    )}

                    {status === 'completed' && videoUrl && (
                        <div className="space-y-4">
                            <div className="aspect-video bg-black rounded-xl overflow-hidden border border-white/10 relative group shadow-2xl">
                                <video src={videoUrl} controls autoPlay loop className="w-full h-full object-cover"></video>
                                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-white border border-white/10">
                                    AI GENERATED 3D
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setStatus('idle')} className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold text-white/70">Create Another</button>
                                <a href={videoUrl} download className="flex-1 py-3 bg-primary hover:bg-primary/80 rounded-xl text-sm font-bold text-center text-white flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-sm">download</span>
                                    Download to Board
                                </a>
                            </div>
                        </div>
                    )}

                    {status === 'error' && (
                         <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
                            <span className="material-symbols-outlined text-5xl text-neon-red">error_outline</span>
                            <p className="text-neon-red text-sm">Simulation failed to render. Please check your API key.</p>
                            <button onClick={() => handleGenerate()} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white">Retry & Select Key</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};