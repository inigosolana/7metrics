import React, { useState, useEffect } from 'react';
import { VideoProcessorService } from '../services/videoProcessorService';

interface HighlightClip {
    id: string;
    url: string;
    action: string;
    team: string;
    thumbnailUrl?: string;
    player?: string;
}

const SafeImage: React.FC<{ src: string; alt?: string; className?: string }> = ({ src, alt, className }) => {
    const [blobUrl, setBlobUrl] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const loadImage = async () => {
            if (!src) return;
            if (!src.includes('ngrok-free.dev') && !src.includes('localhost') && src.startsWith('http') && !src.includes('127.0.0.1')) {
                setBlobUrl(src);
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(src, {
                    headers: { 'ngrok-skip-browser-warning': 'true' }
                });
                const blob = await response.blob();
                if (mounted) {
                    const url = URL.createObjectURL(blob);
                    setBlobUrl(url);
                    setLoading(false);
                }
            } catch (error) {
                console.error("Error loading secure image:", error);
            }
        };

        loadImage();
        return () => {
            mounted = false;
            if (blobUrl && blobUrl.startsWith('blob:')) {
                URL.revokeObjectURL(blobUrl);
            }
        };
    }, [src]);

    if (loading) return <div className={`bg-slate-900 animate-pulse ${className}`} />;

    return <img src={blobUrl} alt={alt} className={className} />;
};

const SafeVideo: React.FC<{ src: string; poster?: string; onMouseOver?: (e: any) => void; onMouseOut?: (e: any) => void; className?: string }> = ({ src, poster, onMouseOver, onMouseOut, className }) => {
    const [blobUrl, setBlobUrl] = useState<string>('');
    const [posterBlobUrl, setPosterBlobUrl] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const fetchResource = async (url: string) => {
            if (!url) return '';
            if (!url.includes('ngrok-free.dev') && !url.includes('localhost') && url.startsWith('http') && !url.includes('127.0.0.1')) {
                return url;
            }
            try {
                const response = await fetch(url, {
                    headers: { 'ngrok-skip-browser-warning': 'true' }
                });
                const blob = await response.blob();
                return URL.createObjectURL(blob);
            } catch (e) {
                console.error("Error fetching resource:", e);
                return '';
            }
        };

        const loadMedia = async () => {
            const [vUrl, pUrl] = await Promise.all([
                fetchResource(src),
                poster ? fetchResource(poster) : Promise.resolve('')
            ]);

            if (mounted) {
                setBlobUrl(vUrl);
                setPosterBlobUrl(pUrl);
                setLoading(false);
            }
        };

        loadMedia();
        return () => {
            mounted = false;
            [blobUrl, posterBlobUrl].forEach(url => {
                if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
            });
        };
    }, [src, poster]);

    if (loading) return <div className="w-full h-full bg-slate-900 animate-pulse flex items-center justify-center"><span className="material-symbols-outlined animate-spin text-white/20">progress_activity</span></div>;

    return (
        <video
            src={blobUrl}
            poster={posterBlobUrl}
            muted
            loop
            playsInline
            className={className}
            onMouseOver={onMouseOver}
            onMouseOut={onMouseOut}
        />
    );
};

export const ClipEditor: React.FC = () => {
    const [clips, setClips] = useState<HighlightClip[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

    // AI Processing states
    const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
    const [processProgress, setProcessProgress] = useState(0);
    const [processETA, setProcessETA] = useState(0);
    const [processStatus, setProcessStatus] = useState<string | null>(null);
    const [teamColors, setTeamColors] = useState<string[]>([]);

    // Drag and Drop State
    const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

    const onDragStart = (idx: number) => {
        setDraggedIdx(idx);
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const onDrop = (idx: number) => {
        if (draggedIdx === null) return;
        const newIds = [...selectedIds];
        const draggedId = newIds[draggedIdx];
        newIds.splice(draggedIdx, 1);
        newIds.splice(idx, 0, draggedId);
        setSelectedIds(newIds);
        setDraggedIdx(null);
    };

    // Filters
    const [actionFilter, setActionFilter] = useState<string>('ALL');
    const [teamFilter, setTeamFilter] = useState<string>('ALL');

    useEffect(() => {
        fetchClips();
    }, []);

    const fetchClips = async () => {
        setIsLoading(true);
        try {
            const baseUrl = VideoProcessorService.API_BASE_URL;
            // Quitamos la barra final de baseUrl si la tiene
            const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
            const res = await fetch(`${base}/api/clips/default`, {
                headers: { 'ngrok-skip-browser-warning': 'true' }
            });
            if (res.ok) {
                const data = await res.json();
                setClips(data);
            } else {
                throw new Error("Failed to load from backend");
            }
        } catch (e) {
            console.warn("Using mock data due to fetch error:", e);
            setClips([
                { id: "clip_mock_1", url: "https://www.w3schools.com/html/mov_bbb.mp4", action: "GOAL", team: "Equipo Local", player: "M. Hansen" },
                { id: "clip_mock_2", url: "https://www.w3schools.com/html/mov_bbb.mp4", action: "JUMP-SHOT", team: "Equipo Visitante", player: "S. Sagosen" },
                { id: "clip_mock_3", url: "https://www.w3schools.com/html/mov_bbb.mp4", action: "PASSING", team: "Equipo Local", player: "D. Mem" },
                { id: "clip_mock_4", url: "https://www.w3schools.com/html/mov_bbb.mp4", action: "DEFENCE", team: "Equipo Visitante", player: "A. Landin" },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const getFullUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        const baseUrl = VideoProcessorService.API_BASE_URL;
        const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        const relative = url.startsWith('/') ? url : `/${url}`;
        return `${base}${relative}`;
    };

    const toggleClip = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
        );
        // Reseteamos el enlace de descarga si cambiamos la selección
        if (downloadUrl) setDownloadUrl(null);
    };

    const removeClip = (id: string) => {
        setSelectedIds(prev => prev.filter(cId => cId !== id));
        if (downloadUrl) setDownloadUrl(null);
    };

    const generateHighlight = async () => {
        if (selectedIds.length === 0) return;
        setIsGenerating(true);
        setDownloadUrl(null);

        try {
            const baseUrl = VideoProcessorService.API_BASE_URL;
            const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

            const urlsToMerge = selectedClipsObjects.map(c => c.url);
            const res = await fetch(`${base}/api/merge-clips`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({ clips: urlsToMerge })
            });

            if (res.ok) {
                const data = await res.json();
                setDownloadUrl(getFullUrl(data.url));
            } else {
                alert("Error al intentar generar el highlight.");
            }
        } catch (error) {
            console.error("Error uniendo clips:", error);
            alert("Hubo un problema de conexión al generar el Highlight.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleUpload = async () => {
        if (!uploadFile) return;
        setIsUploading(true);
        setClips([]);
        setSelectedIds([]);
        setProcessProgress(0);
        setProcessStatus("Iniciando...");

        try {
            const baseUrl = VideoProcessorService.API_BASE_URL;
            const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

            const formData = new FormData();
            formData.append('file', uploadFile);

            const res = await fetch(`${base}/api/upload`, {
                method: 'POST',
                headers: { 'ngrok-skip-browser-warning': 'true' },
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                if (data.task_id) {
                    setActiveTaskId(data.task_id);
                    setUploadFile(null);
                }
            } else {
                alert("Error al subir el video.");
                setIsUploading(false);
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert("Error de conexión al subir el video.");
            setIsUploading(false);
        }
    };

    // Polling Effect
    useEffect(() => {
        let interval: any;
        if (activeTaskId) {
            const baseUrl = VideoProcessorService.API_BASE_URL;
            const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

            interval = setInterval(async () => {
                try {
                    const res = await fetch(`${base}/api/status/${activeTaskId}`, {
                        headers: { 'ngrok-skip-browser-warning': 'true' }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setProcessProgress(data.progress || 0);
                        setProcessETA(data.eta_seconds || 0);
                        setProcessStatus(data.status);

                        if (data.team_colors) {
                            setTeamColors(data.team_colors);
                        }

                        if (data.clips && data.clips.length > 0) {
                            // Actualización reactiva de clips 'al vuelo'
                            setClips(data.clips);
                        }

                        if (data.status === 'completed') {
                            clearInterval(interval);
                            setActiveTaskId(null);
                            setIsUploading(false);
                            // fetchClips(); // Ya los tenemos del polling
                        }
                    }
                } catch (e) {
                    console.error("Polling error:", e);
                }
            }, 1500);
        }
        return () => clearInterval(interval);
    }, [activeTaskId]);

    const formatETA = (seconds: number) => {
        if (!seconds) return 'Calculando...';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const uniqueActions = Array.from(new Set(clips.map(c => c.action))).sort();
    const uniqueTeams = Array.from(new Set(clips.map(c => c.team))).sort();

    const filteredClips = clips.filter(clip => {
        const mAction = actionFilter === 'ALL' || clip.action === actionFilter;
        const mTeam = teamFilter === 'ALL' || clip.team === teamFilter;
        return mAction && mTeam;
    });

    const selectedClipsObjects = selectedIds
        .map(id => clips.find(c => c.id === id))
        .filter(Boolean) as HighlightClip[];

    const getActionBadgeColor = (action: string) => {
        const act = action.toUpperCase();
        if (act.includes('GOAL')) return 'bg-neon-green/20 text-neon-green border-neon-green/30';
        if (act.includes('DEFENCE')) return 'bg-red-500/20 text-red-500 border-red-500/30';
        if (act.includes('PASS')) return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
        if (act.includes('SHOT')) return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
        return 'bg-white/10 text-white/80 border-white/20';
    };

    return (
        <div className="p-4 lg:p-6 space-y-4 max-w-[1600px] mx-auto w-full h-[calc(100vh-80px)] flex flex-col animate-slide-in text-white">

            {/* Header / Top Bar */}
            <div className="flex-shrink-0 flex items-center justify-between glass-panel p-4 rounded-xl border-b-2 border-primary/50 bg-gradient-to-r from-primary/10 to-transparent">
                <div>
                    <h2 className="text-xl font-black text-white flex items-center gap-2 uppercase tracking-wide">
                        <span className="material-symbols-outlined text-primary text-2xl">movie_filter</span>
                        Highlights Studio
                    </h2>
                    <div className="flex items-center gap-3 mt-1">
                        <label className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg cursor-pointer transition text-xs group">
                            <span className="material-symbols-outlined text-sm text-primary group-hover:scale-110 transition">upload_file</span>
                            <span className="text-white/70">{uploadFile ? uploadFile.name : 'Seleccionar Video (.mp4)'}</span>
                            <input
                                type="file"
                                accept="video/mp4"
                                className="hidden"
                                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                            />
                        </label>
                        {uploadFile && (
                            <button
                                onClick={handleUpload}
                                disabled={isUploading}
                                className="bg-primary hover:bg-primary/90 text-white text-[10px] font-black px-4 py-2 rounded-lg transition uppercase flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
                            >
                                {isUploading ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin text-sm">autorenew</span>
                                        Analizando con IA...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-sm">science</span>
                                        Analizar Partido
                                    </>
                                )}
                            </button>
                        )}
                        <p className="text-white/30 text-[10px] italic">Sube tu partido y deja que la IA haga el resto.</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button onClick={fetchClips} disabled={isLoading} className="text-white/50 hover:text-white transition-colors duration-200" title="Refrescar Clips">
                        <span className={`material-symbols-outlined ${isLoading ? 'animate-spin' : ''}`}>refresh</span>
                    </button>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-white/40 uppercase font-bold">API Backend</span>
                        <input
                            title="Backend API"
                            className="bg-black/50 border border-white/10 rounded px-2 py-1 text-xs font-mono text-primary w-48 outline-none focus:border-primary"
                            defaultValue={VideoProcessorService.API_BASE_URL}
                            onChange={(e) => { VideoProcessorService.API_BASE_URL = e.target.value; }}
                        />
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex gap-4 min-h-0">
                {/* LEFT: GALLERY */}
                <div className="flex-1 flex flex-col glass-panel rounded-xl overflow-hidden border border-white/10 shadow-xl bg-slate-900/50">
                    {/* Filters */}
                    <div className="flex-shrink-0 p-4 border-b border-white/5 flex gap-4 bg-black/20 items-center">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-white/40 text-sm">filter_list</span>
                            <span className="text-xs font-bold text-white/60 uppercase">Filtros:</span>
                        </div>
                        <select
                            className="bg-slate-800 text-xs text-white border border-white/10 rounded px-3 py-1.5 outline-none focus:border-primary cursor-pointer hover:bg-slate-700 transition"
                            value={actionFilter}
                            onChange={(e) => setActionFilter(e.target.value)}
                        >
                            <option value="ALL">Todas las Acciones</option>
                            {uniqueActions.map(act => <option key={act} value={act}>{act}</option>)}
                        </select>

                        <select
                            className="bg-slate-800 text-xs text-white border border-white/10 rounded px-3 py-1.5 outline-none focus:border-primary cursor-pointer hover:bg-slate-700 transition"
                            value={teamFilter}
                            onChange={(e) => setTeamFilter(e.target.value)}
                        >
                            <option value="ALL">Todos los Equipos</option>
                            {uniqueTeams.map(tm => <option key={tm} value={tm}>{tm}</option>)}
                        </select>
                        <div className="ml-auto text-xs text-primary font-bold">
                            {filteredClips.length} Clips Disponibles
                        </div>
                    </div>

                    {/* Clip Grid Scroll Area */}
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">

                        {/* 🚀 AI PROCESSING HEADER (Banner mode for real-time) */}
                        {isUploading && activeTaskId && (
                            <div className="mb-6 glass-panel rounded-xl p-6 bg-slate-950/60 border-2 border-primary/40 relative overflow-hidden animate-fade-in shadow-2xl shadow-primary/20">
                                <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                                    <div
                                        className="h-full bg-primary transition-all duration-500 shadow-[0_0_15px_#ff5722]"
                                        style={{ width: `${processProgress}%` }}
                                    ></div>
                                </div>

                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                    <div className="flex items-center gap-5">
                                        <div className="bg-primary/20 p-4 rounded-full animate-bounce">
                                            <span className="material-symbols-outlined text-primary text-4xl">smart_toy</span>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black uppercase text-white tracking-widest leading-none">Análisis en Vivo</h3>
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className="flex h-3 w-3 rounded-full bg-green-500 animate-ping"></span>
                                                <p className="text-[11px] text-white/60 font-black uppercase tracking-widest leading-none">IA Generando Clips tácticos</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-6">
                                        {teamColors.length > 0 && (
                                            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex flex-col gap-1">
                                                <p className="text-[9px] text-white/40 font-black uppercase tracking-widest mb-1">Equipos Detectados</p>
                                                <div className="flex gap-2">
                                                    {teamColors.map(color => (
                                                        <span key={color} className="text-[10px] font-black uppercase bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
                                                            {color}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        <div className="text-right p-2">
                                            <p className="text-5xl font-black text-white tabular-nums leading-none tracking-tighter">{Math.round(processProgress)}%</p>
                                            <p className="text-[11px] text-primary/80 font-mono mt-2 flex items-center justify-end gap-1 uppercase">
                                                <span className="material-symbols-outlined text-[14px]">timer</span>
                                                ETA: {formatETA(processETA)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center justify-between text-[10px] text-white/30 font-bold uppercase tracking-widest border-t border-white/5 pt-3">
                                    <span>Servidor: Google Colab T4 Cloud</span>
                                    <span>Acción: {processStatus?.toUpperCase() || 'BUSCANDO JUGADAS...'}</span>
                                </div>
                            </div>
                        )}

                        {isLoading && clips.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-white/40">
                                <span className="material-symbols-outlined text-6xl animate-spin text-primary/20 mb-4">progress_activity</span>
                                <p className="text-sm font-bold animate-pulse uppercase tracking-widest">Iniciando conexión IA...</p>
                            </div>
                        ) : filteredClips.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-white/20">
                                <span className="material-symbols-outlined text-6xl mb-4 opacity-20">movie_off</span>
                                <p className="text-lg font-bold uppercase tracking-widest">Esperando primer clip...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pr-2 pb-4">
                                {filteredClips.map(clip => {
                                    const isSelected = selectedIds.includes(clip.id);
                                    return (
                                        <div key={clip.id} className={`flex flex-col bg-slate-800 border-2 rounded-xl overflow-hidden group transition-all duration-300 ${isSelected ? 'border-primary shadow-[0_0_20px_rgba(255,87,34,0.4)]' : 'border-slate-700 hover:border-white/20 hover:-translate-y-1'}`}>
                                            <div className="relative aspect-video bg-black/80">
                                                <SafeVideo
                                                    src={getFullUrl(clip.url)}
                                                    poster={getFullUrl(clip.thumbnailUrl || '')}
                                                    className="w-full h-full object-cover"
                                                    onMouseOver={e => e.currentTarget.play()}
                                                    onMouseOut={e => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                                                />
                                                <div className="absolute top-2 left-2 flex gap-1">
                                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border shadow-sm backdrop-blur-md ${getActionBadgeColor(clip.action)}`}>
                                                        {clip.action.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <div className="absolute top-2 right-2">
                                                    <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded border border-white/20 bg-black/60 text-white shadow-sm backdrop-blur-md">
                                                        {clip.team}
                                                    </span>
                                                </div>

                                                {isSelected && (
                                                    <div className="absolute inset-0 bg-primary/20 flex flex-col items-center justify-center backdrop-blur-[2px]">
                                                        <span className="material-symbols-outlined text-white text-5xl drop-shadow-lg">check_circle</span>
                                                        <span className="text-white text-xs font-bold mt-1 shadow-black drop-shadow-md">Seleccionado</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="p-3 flex items-center justify-between bg-slate-800/80 border-t border-white/5">
                                                <div className="flex flex-col overflow-hidden mr-2">
                                                    <span className="text-xs font-bold text-white truncate" title={clip.player || clip.id}>
                                                        {clip.player || clip.id}
                                                    </span>
                                                    <span className="text-[9px] text-white/30 font-bold uppercase tracking-wider mt-0.5">IA Detection</span>
                                                </div>
                                                <button
                                                    onClick={() => toggleClip(clip.id)}
                                                    className={`flex-shrink-0 p-1.5 rounded-lg border transition-all flex items-center justify-center ${isSelected
                                                        ? 'bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500 hover:text-white'
                                                        : 'bg-primary/10 text-primary border-primary/30 hover:bg-primary hover:text-white'
                                                        }`}
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">
                                                        {isSelected ? 'remove' : 'add'}
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: TIMELINE / CART */}
                <div className="w-80 flex-shrink-0 flex flex-col glass-panel rounded-xl overflow-hidden border border-white/10 shadow-xl bg-slate-900/80">
                    <div className="p-4 border-b border-white/10 bg-black/30 flex items-center justify-between">
                        <h3 className="text-sm font-black uppercase text-[#cbad90] tracking-wider flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">view_timeline</span>
                            Línea de Tiempo
                        </h3>
                        <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {selectedIds.length}
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                        {selectedClipsObjects.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-white/30 text-center px-4">
                                <span className="material-symbols-outlined text-5xl mb-3 opacity-50">movie_edit</span>
                                <p className="text-sm font-bold uppercase tracking-widest opacity-40">Timeline Vacía</p>
                                <p className="text-[10px] mt-2 opacity-50 italic">Selecciona jugadas del partido para crear tu resumen personalizado.</p>
                            </div>
                        ) : (
                            selectedClipsObjects.map((clip, idx) => (
                                <div
                                    key={`cart-${clip.id}-${idx}`}
                                    draggable
                                    onDragStart={() => onDragStart(idx)}
                                    onDragOver={onDragOver}
                                    onDrop={() => onDrop(idx)}
                                    className={`flex gap-2 items-stretch bg-black/40 rounded-lg p-2 border transition-colors group ${draggedIdx === idx ? 'opacity-50 border-primary' : 'border-white/5 hover:border-white/10'}`}
                                >
                                    <div className="flex-shrink-0 w-6 flex items-center justify-center cursor-move text-white/20 group-hover:text-white/50">
                                        <span className="material-symbols-outlined text-sm">drag_indicator</span>
                                    </div>
                                    <div className="flex-shrink-0 w-16 aspect-video bg-black rounded overflow-hidden shadow-inner">
                                        <SafeImage src={getFullUrl(clip.thumbnailUrl || '')} alt="thumb" className="w-full h-full object-cover opacity-80" />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-center min-w-0">
                                        <span className="text-[10px] text-primary font-bold uppercase truncate tracking-tighter">{clip.action}</span>
                                        <span className="text-xs text-white/90 font-medium truncate">{clip.player || clip.id}</span>
                                    </div>
                                    <button
                                        onClick={() => removeClip(clip.id)}
                                        className="w-8 flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-sm">close</span>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Bottom Action Area */}
                    <div className="p-4 border-t border-white/10 bg-black/40 flex flex-col gap-3">
                        {downloadUrl && !isGenerating ? (
                            <a
                                href={downloadUrl}
                                target="_blank" rel="noreferrer"
                                download="Highlight_Final.mp4"
                                className="w-full bg-green-500 hover:bg-green-400 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all animate-pulse-slight text-sm uppercase tracking-widest"
                            >
                                <span className="material-symbols-outlined font-bold">download</span>
                                Descargar Summary
                            </a>
                        ) : (
                            <button
                                onClick={generateHighlight}
                                disabled={selectedIds.length === 0 || isGenerating}
                                className={`w-full font-black py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all text-sm uppercase tracking-widest ${selectedIds.length === 0
                                    ? 'bg-slate-800 text-white/20 cursor-not-allowed border border-white/5'
                                    : isGenerating
                                        ? 'bg-primary/80 text-white cursor-wait opacity-80'
                                        : 'bg-primary hover:bg-primary/90 text-white shadow-primary/30 hover:shadow-primary/50'
                                    }`}
                            >
                                {isGenerating ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                                        UNIENDO CLIPS...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-lg font-bold">movie_edit</span>
                                        Generar Highlights
                                    </>
                                )}
                            </button>
                        )}
                        {!downloadUrl && !isGenerating && selectedIds.length > 0 && (
                            <p className="text-[9px] text-center text-white/30 font-bold uppercase tracking-wider">* Fusión procesada por el motor FFmpeg Cloud.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};