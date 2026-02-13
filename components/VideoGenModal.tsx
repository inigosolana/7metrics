import React, { useState, useEffect } from 'react';
import { generateTrainingVideo, pollVideoOperation } from '../services/geminiService';

export const VideoGenModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const [prompt, setPrompt] = useState('Handball player executing a jump shot in slow motion, professional lighting, 4k');
    const [status, setStatus] = useState<'idle' | 'generating' | 'polling' | 'completed' | 'error'>('idle');
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [progressText, setProgressText] = useState('');

    const handleGenerate = async () => {
        setStatus('generating');
        setProgressText('Initializing Veo Model...');
        try {
            let operation = await generateTrainingVideo(prompt);
            setStatus('polling');
            
            // Poll loop
            const pollInterval = setInterval(async () => {
                setProgressText('Rendering video frames...');
                try {
                    const updatedOp = await pollVideoOperation(operation);
                    if (updatedOp.done) {
                        clearInterval(pollInterval);
                        if (updatedOp.error) {
                            setStatus('error');
                            setProgressText('Generation failed.');
                        } else {
                            // Fetching requires key appending as per strict instructions
                            const uri = updatedOp.response?.generatedVideos?.[0]?.video?.uri;
                            if (uri) {
                                // In a real app we'd fetch the blob, but here we construct the URL
                                // Assuming process.env.API_KEY is available or we use the URI directly if signed
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
            <div className="bg-[#1a120b] border border-primary/30 w-[600px] rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">movie_filter</span>
                        Veo Training Simulation
                    </h2>
                    <button onClick={onClose} className="text-white/50 hover:text-white">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                
                <div className="p-6 space-y-6">
                    {status === 'idle' && (
                        <>
                            <div>
                                <label className="block text-xs font-bold text-[#cbad90] uppercase mb-2">Prompt</label>
                                <textarea 
                                    value={prompt}
                                    onChange={e => setPrompt(e.target.value)}
                                    className="w-full h-32 bg-black/20 border border-white/10 rounded-lg p-3 text-sm focus:border-primary outline-none resize-none"
                                />
                                <p className="text-[10px] text-white/40 mt-2">Uses Veo-3.1-fast-generate-preview model.</p>
                            </div>
                            <button 
                                onClick={handleGenerate}
                                className="w-full py-3 bg-gradient-to-r from-primary to-orange-600 rounded-lg font-bold text-white shadow-lg shadow-primary/20 hover:scale-[1.01] transition-transform"
                            >
                                Generate Video
                            </button>
                        </>
                    )}

                    {(status === 'generating' || status === 'polling') && (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                            <p className="text-neon-green font-mono text-sm animate-pulse">{progressText}</p>
                        </div>
                    )}

                    {status === 'completed' && videoUrl && (
                        <div className="space-y-4">
                            <div className="aspect-video bg-black rounded-lg overflow-hidden border border-white/10 relative group">
                                <video src={videoUrl} controls autoPlay loop className="w-full h-full object-cover"></video>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setStatus('idle')} className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm">Generate New</button>
                                <a href={videoUrl} download className="flex-1 py-2 bg-primary hover:bg-primary/80 rounded-lg text-sm font-bold text-center">Download MP4</a>
                            </div>
                        </div>
                    )}

                    {status === 'error' && (
                         <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
                            <span className="material-symbols-outlined text-4xl text-neon-red">error_outline</span>
                            <p className="text-neon-red text-sm">Generation failed. Please try again.</p>
                            <button onClick={() => setStatus('idle')} className="px-6 py-2 bg-white/10 rounded-lg text-sm">Retry</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
