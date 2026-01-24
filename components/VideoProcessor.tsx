import React, { useState, useEffect } from 'react';
import { apiService, JobStatusResponse } from '../services/api';

interface VideoProcessorProps {
    mode: 'clipper' | 'stats';
    title: string;
    description: string;
    icon: string;
    accentClass: string;
}

const VideoProcessor: React.FC<VideoProcessorProps> = ({
    mode,
    title,
    description,
    icon,
    accentClass
}) => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [jobId, setJobId] = useState<string | null>(null);
    const [status, setStatus] = useState<JobStatusResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const startProcess = async () => {
        if (!file) return;

        try {
            setUploading(true);
            setError(null);

            // 1. Upload
            const { video_id } = await apiService.uploadVideo(file);

            // 2. Start Job based on mode
            let job;
            if (mode === 'clipper') {
                job = await apiService.startClipper(video_id);
            } else {
                job = await apiService.startStats(video_id);
            }

            setJobId(job.job_id);
            setStatus(job);
            setUploading(false);
        } catch (err: any) {
            setError(err.message);
            setUploading(false);
        }
    };

    // Polling logic
    useEffect(() => {
        let interval: any;
        if (jobId && status?.status !== 'COMPLETED' && status?.status !== 'ERROR') {
            interval = setInterval(async () => {
                try {
                    const updatedStatus = await apiService.getJobStatus(jobId, mode);
                    setStatus(updatedStatus);

                    if (updatedStatus.status === 'COMPLETED' || updatedStatus.status === 'ERROR') {
                        clearInterval(interval);
                    }
                } catch (err) {
                    console.error("Polling error:", err);
                }
            }, 2000);
        }
        return () => clearInterval(interval);
    }, [jobId, status, mode]);

    const getStatusColor = () => {
        if (!status) return '';
        switch (status.status) {
            case 'COMPLETED': return 'bg-emerald-500/10 text-emerald-500';
            case 'ERROR': return 'bg-rose-500/10 text-rose-500';
            case 'PROCESSING': return 'bg-amber-500/10 text-amber-500';
            default: return 'bg-slate-500/10 text-slate-500';
        }
    };

    const getStatusDot = () => {
        if (!status) return '';
        switch (status.status) {
            case 'COMPLETED': return 'bg-emerald-500';
            case 'ERROR': return 'bg-rose-500';
            case 'PROCESSING': return 'bg-amber-500 animate-pulse';
            default: return 'bg-slate-500';
        }
    };

    return (
        <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-slate-200 dark:border-stone-800/50 flex flex-col h-full shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${accentClass}/10 flex items-center justify-center ${accentClass.replace('bg-', 'text-')}`}>
                        <span className="material-icons-outlined text-2xl">{icon}</span>
                    </div>
                    <div>
                        <h4 className="font-bold text-lg leading-none dark:text-white">{title}</h4>
                        <p className="text-xs text-slate-500 dark:text-stone-500 mt-1">{description}</p>
                    </div>
                </div>
                {status && (
                    <span className={`flex items-center gap-1.5 px-2 py-1 ${getStatusColor()} text-[10px] font-bold rounded-full uppercase`}>
                        <span className={`w-1 h-1 rounded-full ${getStatusDot()}`}></span>
                        {status.status}
                    </span>
                )}
            </div>

            <div className="flex-1 flex flex-col justify-center py-4">
                {!jobId ? (
                    <div className="space-y-4">
                        <div className="border-2 border-dashed border-slate-200 dark:border-stone-800/50 rounded-xl p-6 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-primary/50 transition-colors">
                            <span className="material-icons-outlined text-4xl text-slate-300 dark:text-stone-700 mb-2 group-hover:scale-110 transition-transform">video_library</span>
                            <p className="text-sm font-medium text-slate-600 dark:text-stone-400">
                                {file ? file.name : "Drag or select match video"}
                            </p>
                            <input
                                type="file"
                                id={`upload-${mode}`}
                                className="hidden"
                                accept="video/*"
                                onChange={handleFileChange}
                                disabled={uploading}
                            />
                            <label
                                htmlFor={`upload-${mode}`}
                                className="mt-4 px-4 py-2 bg-slate-100 dark:bg-stone-800 rounded-lg text-xs font-bold uppercase cursor-pointer hover:bg-slate-200 dark:hover:bg-stone-700 transition-colors"
                            >
                                Identify File
                            </label>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 px-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium truncate max-w-[150px] dark:text-slate-200">{file?.name}</span>
                            <span className="font-mono text-sm font-bold text-primary">{status?.progress_percentage}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-stone-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-500 rounded-full"
                                style={{ width: `${status?.progress_percentage}%` }}
                            ></div>
                        </div>
                        <p className="text-[10px] text-stone-500 italic text-center">
                            {status?.current_step || "Initializing pipeline..."}
                        </p>
                    </div>
                )}
            </div>

            {error && (
                <p className="text-rose-500 text-[10px] my-2 font-bold bg-rose-500/5 p-2 rounded border border-rose-500/20">
                    Error: {error}
                </p>
            )}

            <div className="mt-4">
                {!jobId ? (
                    <button
                        onClick={startProcess}
                        disabled={!file || uploading}
                        className={`w-full py-3 ${accentClass} text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98]`}
                    >
                        {uploading ? "Uploading..." : `Launch ${title.split(' ')[0]}`}
                    </button>
                ) : status?.status === 'COMPLETED' ? (
                    <div className="flex gap-2">
                        <button
                            onClick={() => window.location.reload()}
                            className="flex-1 py-3 border border-stone-200 dark:border-stone-700 text-slate-700 dark:text-stone-300 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-slate-50 dark:hover:bg-stone-800 transition-colors"
                        >
                            Reset
                        </button>
                        <a
                            href={mode === 'clipper' ? apiService.getZipDownloadUrl(jobId) : '#'}
                            className="flex-1 py-3 bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest rounded-xl text-center hover:bg-emerald-600 transition-colors"
                            onClick={(e) => mode === 'stats' && e.preventDefault()}
                        >
                            {mode === 'clipper' ? 'Download Clips' : 'Open Report'}
                        </a>
                    </div>
                ) : status?.status === 'ERROR' ? (
                    <button
                        onClick={() => { setJobId(null); setFile(null); }}
                        className="w-full py-3 bg-slate-200 dark:bg-stone-800 text-xs font-bold uppercase tracking-widest rounded-xl"
                    >
                        Try Again
                    </button>
                ) : (
                    <button disabled className="w-full py-3 bg-slate-100 dark:bg-stone-900/50 text-slate-400 text-xs font-bold uppercase tracking-widest rounded-xl cursor-not-allowed">
                        Generating Results...
                    </button>
                )}
            </div>
        </div>
    );
};

export default VideoProcessor;
