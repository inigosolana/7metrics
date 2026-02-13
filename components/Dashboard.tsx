import React, { useRef, useState } from 'react';
import { analyzeMatchImage } from '../services/geminiService';
import { ImageAnalysisResult } from '../types';

export const Dashboard: React.FC = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<ImageAnalysisResult | null>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsAnalyzing(true);
        setAnalysisResult(null);

        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = (reader.result as string).split(',')[1];
                const result = await analyzeMatchImage(base64String, file.type);
                setAnalysisResult({
                    analysis: result.tacticalAnalysis,
                    tags: result.detectedTags
                });
                setIsAnalyzing(false);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error("Analysis failed", error);
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="p-4 lg:p-8 space-y-8 max-w-[1600px] mx-auto w-full animate-slide-in">
            <section className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-6 bg-primary rounded-full"></div>
                        <h3 className="text-white text-lg font-bold">Data Sources Overview (3-Way Sync)</h3>
                    </div>
                </div>
                {/* 3 Columns for the 3 Data Sources */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Source 1: Clip Library (Manual) */}
                    <div className="glass-panel rounded-2xl p-6 border-l-4 border-l-primary flex flex-col gap-4">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-primary/20 p-3 rounded-xl">
                                    <span className="material-symbols-outlined text-primary">content_cut</span>
                                </div>
                                <div>
                                    <h4 className="text-white font-bold">Clip Library</h4>
                                    <p className="text-[#cbad90] text-xs">Source: Manual Tagging</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                             <div className="flex-1 bg-[#1a120b]/50 p-2 rounded border border-white/5">
                                <span className="text-xs text-[#cbad90] block">Clips</span>
                                <span className="text-lg font-mono font-bold">1,420</span>
                             </div>
                             <div className="flex-1 bg-[#1a120b]/50 p-2 rounded border border-white/5">
                                <span className="text-xs text-[#cbad90] block">Avg/Game</span>
                                <span className="text-lg font-mono font-bold">45</span>
                             </div>
                        </div>
                    </div>

                    {/* Source 2: AI Analyzer (Video) */}
                    <div className="glass-panel rounded-2xl p-6 border-l-4 border-l-neon-green flex flex-col gap-4 relative overflow-hidden">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-neon-green/20 p-3 rounded-xl">
                                    <span className="material-symbols-outlined text-neon-green">memory</span>
                                </div>
                                <div>
                                    <h4 className="text-white font-bold">AI Analyzer</h4>
                                    <p className="text-[#cbad90] text-xs">Source: Video Processing</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 bg-neon-green/10 px-2 py-1 rounded">
                                <div className={`w-1.5 h-1.5 rounded-full bg-neon-green ${isAnalyzing ? 'animate-ping' : 'animate-pulse'}`}></div>
                                <span className="text-neon-green text-[10px] font-bold">{isAnalyzing ? 'BUSY' : 'READY'}</span>
                            </div>
                        </div>

                         {analysisResult ? (
                            <div className="space-y-2 mt-1 animate-slide-in">
                                <p className="text-xs text-white line-clamp-2">{analysisResult.analysis}</p>
                                <button onClick={() => setAnalysisResult(null)} className="text-[10px] text-neon-green underline">Clear</button>
                            </div>
                        ) : (
                            <>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                />
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="mt-2 w-full py-2 bg-neon-green/10 hover:bg-neon-green/20 rounded-lg text-xs font-semibold text-neon-green transition-colors border border-neon-green/10"
                                >
                                    {isAnalyzing ? 'Analyzing...' : 'Upload Frame'}
                                </button>
                            </>
                        )}
                    </div>

                    {/* Source 3: Tablet API (External App) */}
                    <div className="glass-panel rounded-2xl p-6 border-l-4 border-l-cyan-400 flex flex-col gap-4 relative overflow-hidden bg-gradient-to-br from-cyan-900/10 to-transparent">
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                            <span className="material-symbols-outlined text-6xl text-cyan-400">tablet_mac</span>
                        </div>
                        <div className="flex items-start justify-between relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="bg-cyan-400/20 p-3 rounded-xl">
                                    <span className="material-symbols-outlined text-cyan-400">api</span>
                                </div>
                                <div>
                                    <h4 className="text-white font-bold">External App</h4>
                                    <p className="text-[#cbad90] text-xs">Source: Tablet API v2</p>
                                </div>
                            </div>
                            <span className="bg-cyan-400 text-black text-[10px] font-bold px-2 py-1 rounded">CONNECTED</span>
                        </div>
                        <div className="mt-2 relative z-10">
                             <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-[#cbad90]">Data Stream Rate</span>
                                <span className="text-cyan-400 font-mono">120 events/m</span>
                             </div>
                             <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-cyan-400 h-full animate-pulse" style={{ width: '92%' }}></div>
                            </div>
                            <p className="text-[10px] text-white/40 mt-2 italic">Syncing with Court-Side Tablet...</p>
                        </div>
                    </div>

                </div>
            </section>

            <div className="grid grid-cols-12 gap-6">
                {/* Shot Efficiency Matrix */}
                <div className="col-span-12 lg:col-span-5 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-white font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-xl">target</span>
                            Shot Efficiency Matrix
                        </h3>
                        <span className="text-[10px] text-[#cbad90] uppercase tracking-widest font-bold">Zone Analysis</span>
                    </div>
                    <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center min-h-[420px]">
                        <div className="relative w-full max-w-[340px] aspect-[3/2] border-8 border-neutral-300 shadow-2xl bg-neutral-900 rounded-sm">
                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '8px 8px' }}></div>
                            <div className="grid grid-cols-3 grid-rows-3 h-full w-full">
                                <div className="border border-white/10 flex flex-col items-center justify-center bg-primary/20"><span className="font-mono font-bold">45%</span></div>
                                <div className="border border-white/10 flex flex-col items-center justify-center bg-primary/10"><span className="font-mono font-bold">30%</span></div>
                                <div className="border border-white/10 flex flex-col items-center justify-center bg-neon-green/40"><span className="font-mono font-bold">82%</span></div>
                                <div className="border border-white/10 flex flex-col items-center justify-center bg-primary/50"><span className="font-mono font-bold">12%</span></div>
                                <div className="border border-white/10 flex flex-col items-center justify-center bg-primary/5"><span className="font-mono font-bold">50%</span></div>
                                <div className="border border-white/10 flex flex-col items-center justify-center bg-primary/30"><span className="font-mono font-bold">33%</span></div>
                                <div className="border border-white/10 flex flex-col items-center justify-center bg-neon-green/30"><span className="font-mono font-bold">75%</span></div>
                                <div className="border border-white/10 flex flex-col items-center justify-center bg-neon-green/60"><span className="font-mono font-bold">90%</span></div>
                                <div className="border border-white/10 flex flex-col items-center justify-center bg-primary/40"><span className="font-mono font-bold">25%</span></div>
                            </div>
                        </div>
                        <div className="flex gap-4 mt-8">
                            <div className="flex items-center gap-2 text-[10px] text-[#cbad90] font-bold uppercase"><div className="w-3 h-3 bg-neon-green rounded-sm"></div> Optimal</div>
                            <div className="flex items-center gap-2 text-[10px] text-[#cbad90] font-bold uppercase"><div className="w-3 h-3 bg-primary rounded-sm"></div> Critical</div>
                        </div>
                    </div>
                </div>

                {/* Player Impact */}
                <div className="col-span-12 lg:col-span-7 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-white font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-xl">leaderboard</span>
                            Player Impact (+/-)
                        </h3>
                        <button className="text-[10px] bg-white/5 hover:bg-white/10 px-3 py-1 rounded text-white font-bold transition-all">DETAILED VIEW</button>
                    </div>
                    <div className="glass-panel p-6 rounded-2xl flex-1 min-h-[420px]">
                        <div className="space-y-5">
                            {[
                                { name: 'M. Hansen', val: '+12.4', width: '40%', color: 'bg-neon-green', pos: 'left-1/2' },
                                { name: 'S. Sagosen', val: '+8.1', width: '28%', color: 'bg-neon-green', pos: 'left-1/2' },
                                { name: 'D. Mem', val: '+3.2', width: '12%', color: 'bg-neon-green', pos: 'left-1/2' },
                                { name: 'A. Dujshebaev', val: '-2.5', width: '15%', color: 'bg-neon-red', pos: 'right-1/2' },
                                { name: 'N. Landin', val: '-5.8', width: '22%', color: 'bg-neon-red', pos: 'right-1/2' },
                            ].map((p, idx) => (
                                <div className="group" key={idx}>
                                    <div className="flex justify-between text-xs mb-2">
                                        <span className="font-bold">{p.name}</span>
                                        <span className={`font-mono ${p.color.replace('bg-', 'text-')}`}>{p.val}</span>
                                    </div>
                                    <div className="relative h-4 bg-white/5 rounded-full overflow-hidden">
                                        <div className={`absolute ${p.pos} h-full ${p.color}/60 rounded-full`} style={{ width: p.width }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-12 flex justify-center items-center gap-12 border-t border-white/5 pt-6">
                            <div className="text-center">
                                <p className="text-[10px] text-[#cbad90] uppercase font-bold tracking-widest mb-1">Defense</p>
                                <p className="text-xl font-mono text-neon-red font-bold">24.2</p>
                            </div>
                            <div className="w-px h-8 bg-white/10"></div>
                            <div className="text-center">
                                <p className="text-[10px] text-[#cbad90] uppercase font-bold tracking-widest mb-1">Offense</p>
                                <p className="text-xl font-mono text-neon-green font-bold">32.8</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Efficiency Matrix', val: '64.2%', sub: '↑ 2.4%', subColor: 'text-neon-green', desc: 'Positional Attack vs Counter' },
                    { label: 'Tablet Data Events', val: '1,204', sub: 'LIVE', subColor: 'text-cyan-400', desc: 'External API Sync Active' },
                    { label: 'AI Extraction', val: '92%', sub: 'CONF', subColor: 'text-neon-green', desc: 'Confidence score for Match_24' },
                    { label: 'Tags / Hour', val: '342', sub: 'Manual', subColor: 'text-primary', desc: 'Coaching staff tagging rate' },
                ].map((kpi, idx) => (
                    <div className="glass-panel p-6 rounded-2xl" key={idx}>
                        <p className="text-[#cbad90] text-[10px] font-bold uppercase tracking-widest mb-2">{kpi.label}</p>
                        <div className="flex items-end gap-3">
                            <span className="text-3xl font-mono font-bold">{kpi.val}</span>
                            <span className={`${kpi.subColor} text-xs font-bold mb-1`}>{kpi.sub}</span>
                        </div>
                        <p className="text-[10px] text-white/40 mt-3 italic">{kpi.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
