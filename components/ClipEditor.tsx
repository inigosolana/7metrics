import React, { useState } from 'react';
import { VideoClip } from '../types';
import { VideoProcessorService } from '../services/videoProcessorService';

export const ClipEditor: React.FC = () => {
    const [status, setStatus] = useState<'IDLE' | 'PROCESSING' | 'READY'>('IDLE');
    const [progress, setProgress] = useState(0);
    const [progressMsg, setProgressMsg] = useState("Iniciando carga...");
    const [clips, setClips] = useState<VideoClip[]>([]);
    const [selectedClip, setSelectedClip] = useState<VideoClip | null>(null);
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Filters
    const [selectedTeam, setSelectedTeam] = useState<'ALL' | 'HOME' | 'AWAY'>('ALL');
    const [selectedPlayer, setSelectedPlayer] = useState<string>('ALL');
    const [selectedActions, setSelectedActions] = useState<string[]>(['GOAL', 'POST', 'MISS', 'TURNOVER', 'STEAL', 'STEPS', 'DOUBLE_DRIBBLE', 'FOUL']);

    const [isGeneratingHighlight, setIsGeneratingHighlight] = useState(false);
    const [selectedClips, setSelectedClips] = useState<string[]>([]);

    const toggleClipSelection = (clipId: string) => {
        setSelectedClips(prev =>
            prev.includes(clipId)
                ? prev.filter(id => id !== clipId)
                : [...prev, clipId]
        );
    };

    const handleSelectAll = () => setSelectedClips(filteredClips.map(c => c.id));
    const handleClearSelection = () => setSelectedClips([]);

    const handleCreateHighlight = async () => {
        if (selectedClips.length === 0) {
            alert("Por favor, selecciona al menos un clip para crear el video.");
            return;
        }

        setIsGeneratingHighlight(true);
        setProgressMsg("Uniendo clips seleccionados en el servidor...");

        try {
            // Mandamos SOLO los clips seleccionados al backend
            const response = await fetch(`${VideoProcessorService.API_BASE_URL}/generate-highlight`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({ clips: selectedClips })
            });

            if (response.ok) {
                const data = await response.json();
                const downloadUrl = `${VideoProcessorService.API_BASE_URL}${data.url}`;

                const link = document.createElement('a');
                link.href = downloadUrl;
                link.setAttribute('download', `Mi_Highlight_Personalizado.mp4`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                setSelectedClips([]);
                alert("¡Highlight generado y descargado con éxito!");
            }
        } catch (error) {
            console.error("Error uniendo clips:", error);
            alert("Hubo un error al generar el Video.");
        } finally {
            setIsGeneratingHighlight(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setStatus('PROCESSING');
            setProgress(0);

            try {
                // Call our new "Backend" service
                // Real progress callback from backend
                const processedClips = await VideoProcessorService.processFullMatch(
                    file,
                    { targetActions: selectedActions },
                    (backendProgress, msg) => {
                        setProgress(backendProgress);
                        if (msg) setProgressMsg(msg);
                    },
                    (liveClips) => {
                        // Live update clips!
                        setClips(liveClips);
                        if (status !== 'READY') setStatus('READY');
                    }
                );

                setProgress(100);
                setClips(processedClips);
                setStatus('READY');
            } catch (error) {
                console.error("Processing failed", error);
                setStatus('IDLE');
            }
        }
    };

    const toggleAction = (action: string) => {
        if (selectedActions.includes(action)) {
            setSelectedActions(selectedActions.filter(a => a !== action));
        } else {
            setSelectedActions([...selectedActions, action]);
        }
    };

    const handleClipAnalysis = async (clip: VideoClip) => {
        setSelectedClip(clip);
        setIsAnalyzing(true);
        setAnalysis(null);
        try {
            const result = await VideoProcessorService.generateTacticalDescription(clip);
            setAnalysis(result);
        } catch (e) {
            setAnalysis("Failed to analyze clip. Please check your AI connection.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const filteredClips = clips.filter(clip => {
        const matchTeam = selectedTeam === 'ALL' || clip.team === selectedTeam;
        const matchPlayer = selectedPlayer === 'ALL' || clip.player === selectedPlayer;
        const matchAction = selectedActions.includes(clip.actionType);
        return matchTeam && matchPlayer && matchAction;
    });

    const getActionColor = (action: string) => {
        switch (action) {
            case 'GOAL': return 'text-neon-green bg-neon-green/10 border-neon-green/20';
            case 'POST': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
            case 'MISS': return 'text-neon-red bg-neon-red/10 border-neon-red/20';
            case 'TURNOVER': return 'text-neon-red bg-neon-red/10 border-neon-red/20';
            case 'STEAL': return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
            default: return 'text-white/60 bg-white/5 border-white/10';
        }
    };

    const handleDownload = (clip: VideoClip) => {
        if (!clip.url) {
            alert(`Downloading mock clip ${clip.id}.mp4`);
            return;
        }
        const link = document.createElement('a');
        link.href = clip.url;
        link.setAttribute('download', `${clip.player}_${clip.actionType}.mp4`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleBatchDownload = () => {
        alert(`Downloading ${filteredClips.length} clips... En producción esto generaría un ZIP en el servidor.`);
        filteredClips.forEach((clip, index) => {
            setTimeout(() => handleDownload(clip), index * 500);
        });
    };

    return (
        <div className="p-4 lg:p-8 space-y-6 max-w-[1600px] mx-auto w-full animate-slide-in h-[calc(100vh-100px)] flex flex-col">
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between glass-panel p-6 rounded-2xl border-l-4 border-l-primary bg-gradient-to-r from-primary/10 to-transparent">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-2xl">content_cut</span>
                        AI Clip Auto-Slicer
                    </h2>
                    <p className="text-[#cbad90] text-sm mt-1">AI-powered backend processes the match and extracts key moments with tactical context.</p>
                </div>
                <div className="flex gap-4 items-center">
                    <div className="flex flex-col gap-1">
                        <p className="text-[10px] text-white/40 font-bold uppercase">Backend IA URL</p>
                        <input
                            type="text"
                            placeholder="http://localhost:8000"
                            className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-primary font-mono outline-none focus:border-primary w-64"
                            defaultValue={VideoProcessorService.API_BASE_URL}
                            onChange={(e) => { VideoProcessorService.API_BASE_URL = e.target.value; }}
                        />
                    </div>
                    <a href="/docs/Colab_AI_Server_Setup.md" target="_blank" className="flex items-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 rounded-lg text-xs font-bold text-primary transition-colors border border-primary/20 h-fit mt-4">
                        <span className="material-symbols-outlined text-sm">rocket_launch</span>
                        Abrir en Colab
                    </a>
                </div>
            </div>

            {status === 'IDLE' && (
                <div className="flex-1 glass-panel p-12 rounded-2xl border-dashed border-2 border-white/20 flex flex-col items-center justify-center text-center">
                    <div className="bg-primary/20 p-6 rounded-full mb-6">
                        <span className="material-symbols-outlined text-6xl text-primary">movie</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Upload Match Video</h3>
                    <p className="text-white/40 text-sm mb-6 max-w-sm">The processor will apply the 40x20m mapping and Re-ID logic defined in the manual.</p>
                    <label className="cursor-pointer bg-primary hover:bg-primary/80 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-primary/20">
                        Select Full Match (.mp4, .mkv)
                        <input type="file" className="hidden" accept="video/*" onChange={handleFileUpload} />
                    </label>
                </div>
            )}

            {status === 'PROCESSING' && clips.length === 0 && (
                <div className="flex-1 glass-panel p-12 rounded-2xl flex flex-col items-center justify-center">
                    <div className="w-full max-w-md space-y-4">
                        <div className="flex justify-between text-sm font-bold">
                            <span className="text-white">{progressMsg}</span>
                            <span className="text-primary">{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                            <div className="bg-primary h-full transition-all duration-200" style={{ width: `${progress}%` }}></div>
                        </div>
                        <div className="flex flex-col gap-2 mt-6">
                            <p className="text-[10px] text-center text-white/40 animate-pulse">Running Homography Transform...</p>
                            <p className="text-[10px] text-center text-[#cbad90] font-mono">Status: Calibrating 6m and 9m lines...</p>
                        </div>
                    </div>
                </div>
            )}

            {(status === 'READY' || (status === 'PROCESSING' && clips.length > 0)) && (
                <div className="flex-1 flex flex-col gap-6 min-h-0">
                    {status === 'PROCESSING' && (
                        <div className="glass-panel p-4 rounded-xl border-l-4 border-l-primary bg-primary/5 flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                                <div className="w-48 bg-white/10 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-primary h-full transition-all duration-200" style={{ width: `${progress}%` }}></div>
                                </div>
                                <span className="text-[10px] font-bold text-white/60 uppercase">{progressMsg}</span>
                            </div>
                            <span className="text-[10px] font-mono text-primary animate-pulse flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
                                IA DETECTANDO CLIPS EN TIEMPO REAL...
                            </span>
                        </div>
                    )}
                    <div className="flex-1 flex gap-6 min-h-0">
                        {/* Sidebar Filters */}
                        <div className="w-72 flex-shrink-0 glass-panel p-4 rounded-xl overflow-y-auto flex flex-col gap-6">
                            <div>
                                <h3 className="text-xs font-bold text-[#cbad90] uppercase tracking-widest mb-3">Team Filter</h3>
                                <div className="flex p-1 bg-black/40 rounded-lg">
                                    {['ALL', 'HOME', 'AWAY'].map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setSelectedTeam(t as any)}
                                            className={`flex-1 py-1.5 text-xs font-bold rounded ${selectedTeam === t ? 'bg-primary text-white shadow' : 'text-white/40 hover:text-white'}`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold text-[#cbad90] uppercase tracking-widest mb-3">Player</h3>
                                <select
                                    value={selectedPlayer}
                                    onChange={(e) => setSelectedPlayer(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 text-white text-xs rounded-lg p-2.5 outline-none focus:border-primary"
                                >
                                    <option value="ALL">All Players</option>
                                    {Array.from(new Set(clips.map(c => c.player))).sort().map(player => (
                                        <option key={player} value={player}>{player}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-xs font-bold text-[#cbad90] uppercase tracking-widest">Action Type</h3>
                                    <button onClick={() => setSelectedActions([])} className="text-[10px] text-white/40 hover:text-white">Clear</button>
                                </div>
                                <div className="space-y-2">
                                    {['GOAL', 'POST', 'MISS', 'TURNOVER', 'STEAL', 'STEPS', 'DOUBLE_DRIBBLE', 'FOUL'].map(action => (
                                        <label key={action} className="flex items-center gap-2 cursor-pointer group">
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedActions.includes(action) ? 'bg-primary border-primary' : 'border-white/20 bg-transparent'}`}>
                                                {selectedActions.includes(action) && <span className="material-symbols-outlined text-white text-[10px]">check</span>}
                                            </div>
                                            <input type="checkbox" className="hidden" checked={selectedActions.includes(action)} onChange={() => toggleAction(action)} />
                                            <span className={`text-xs ${selectedActions.includes(action) ? 'text-white' : 'text-white/50 group-hover:text-white'}`}>{action.replace('_', ' ')}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-auto pt-4 border-t border-white/10 space-y-3">
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-xs text-white/60">Seleccionados: <strong className="text-primary">{selectedClips.length}</strong></span>
                                    <div className="flex gap-2">
                                        <button onClick={handleSelectAll} className="text-[10px] text-white/40 hover:text-white">Todos</button>
                                        <button onClick={handleClearSelection} className="text-[10px] text-white/40 hover:text-white">Ninguno</button>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCreateHighlight}
                                    disabled={isGeneratingHighlight || selectedClips.length === 0}
                                    className="w-full bg-primary hover:bg-primary/80 text-white py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isGeneratingHighlight ? (
                                        <span className="material-symbols-outlined text-lg animate-spin">sync</span>
                                    ) : (
                                        <span className="material-symbols-outlined text-lg">movie_edit</span>
                                    )}
                                    {isGeneratingHighlight ? 'Creando Video...' : `Unir Selección (${selectedClips.length})`}
                                </button>
                            </div>
                        </div>

                        {/* Results Grid */}
                        <div className="flex-1 glass-panel p-4 rounded-xl overflow-hidden flex flex-col">
                            <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
                                <h3 className="font-bold text-white">{filteredClips.length} Clips Found</h3>
                                <div className="flex gap-2">
                                    <span className="text-xs text-white/40">Sort by:</span>
                                    <span className="text-xs font-bold text-white cursor-pointer">Time</span>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 content-start pr-2">
                                {filteredClips.map((clip) => {
                                    const isSelected = selectedClips.includes(clip.id);

                                    return (
                                        <div
                                            key={clip.id}
                                            className={`bg-black/40 rounded-lg overflow-hidden border transition-all group ${isSelected ? 'border-primary ring-2 ring-primary/50' : 'border-white/5 hover:border-primary/50'
                                                }`}
                                        >
                                            <div className="relative aspect-video bg-black">
                                                {/* CHECKBOX DE SELECCIÓN DE CLIP */}
                                                <div
                                                    onClick={() => toggleClipSelection(clip.id)}
                                                    className="absolute top-2 left-2 z-10 cursor-pointer bg-black/60 p-1.5 rounded hover:bg-black"
                                                >
                                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-primary border-primary' : 'border-white/50 bg-transparent'
                                                        }`}>
                                                        {isSelected && <span className="material-symbols-outlined text-white text-[14px]">check</span>}
                                                    </div>
                                                </div>

                                                <video
                                                    src={clip.url}
                                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                                    muted
                                                    playsInline
                                                    loop
                                                    preload="metadata"
                                                    onMouseOver={(e) => e.currentTarget.play()}
                                                    onMouseOut={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                                                />
                                                <div className="absolute top-2 right-2 bg-black/80 text-white text-[10px] font-mono px-1.5 py-0.5 rounded pointer-events-none">
                                                    {clip.duration}
                                                </div>
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 cursor-pointer pointer-events-none">
                                                    <span className="material-symbols-outlined text-4xl text-white">play_circle</span>
                                                </div>
                                            </div>
                                            <div className="p-3">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getActionColor(clip.actionType)}`}>
                                                        {clip.actionType.replace('_', ' ')}
                                                    </span>
                                                    <span className="text-[10px] text-white/40 font-mono">{clip.startTime}</span>
                                                </div>
                                                <h4 className="text-sm font-bold text-white truncate">{clip.player}</h4>
                                                <div className="flex justify-between items-center mt-3">
                                                    <button
                                                        onClick={() => handleClipAnalysis(clip)}
                                                        className="text-[10px] font-bold text-primary hover:text-white transition-colors flex items-center gap-1"
                                                    >
                                                        <span className="material-symbols-outlined text-xs">analytics</span>
                                                        AI ANALYSIS
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownload(clip)}
                                                        className="text-white/40 hover:text-white hover:bg-white/10 p-1.5 rounded transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">download</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Analysis Modal Side Overlay */}
                        {selectedClip && (
                            <div className="w-96 flex-shrink-0 glass-panel border-l border-white/20 flex flex-col animate-slide-in-right">
                                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-primary/10">
                                    <h3 className="font-bold text-white flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">smart_toy</span>
                                        Tactical Detail
                                    </h3>
                                    <button onClick={() => setSelectedClip(null)} className="text-white/40 hover:text-white">
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                </div>
                                <div className="p-6 overflow-y-auto space-y-6">
                                    <div className="aspect-video rounded-lg overflow-hidden border border-white/10 bg-black">
                                        <img src={selectedClip.thumbnailUrl} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-[#cbad90] font-bold uppercase tracking-widest">Metadata</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="bg-white/5 p-2 rounded border border-white/5">
                                                <p className="text-[8px] text-white/40 uppercase">Action</p>
                                                <p className="text-xs font-bold text-white">{selectedClip.actionType}</p>
                                            </div>
                                            <div className="bg-white/5 p-2 rounded border border-white/5">
                                                <p className="text-[8px] text-white/40 uppercase">Timestamp</p>
                                                <p className="text-xs font-bold text-white font-mono">{selectedClip.startTime}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <p className="text-[10px] text-[#cbad90] font-bold uppercase tracking-widest flex items-center gap-2">
                                            Coach AI Insight
                                            {isAnalyzing && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>}
                                        </p>
                                        <div className="bg-white/5 p-4 rounded-xl border border-white/10 relative overflow-hidden">
                                            {isAnalyzing ? (
                                                <div className="space-y-2 py-4">
                                                    <div className="h-3 w-3/4 bg-white/10 rounded animate-pulse"></div>
                                                    <div className="h-3 w-full bg-white/10 rounded animate-pulse"></div>
                                                    <div className="h-3 w-5/6 bg-white/10 rounded animate-pulse"></div>
                                                </div>
                                            ) : (
                                                <p className="text-xs text-white/70 leading-relaxed italic">
                                                    "{analysis}"
                                                </p>
                                            )}
                                            <div className="absolute top-0 right-0 p-2 opacity-10">
                                                <span className="material-symbols-outlined text-4xl">format_quote</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};