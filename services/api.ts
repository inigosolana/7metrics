const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export interface JobStatusResponse {
    job_id: string;
    status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'ERROR';
    progress_percentage: number;
    current_step?: string;
    created_at: string;
    error?: string;
}

export interface VideoUploadResponse {
    video_id: string;
    path: string;
}

export interface MatchReport {
    match_id: string;
    metadata: any;
    summary_stats: any;
    timeline: any[];
}

export const apiService = {
    uploadVideo: async (file: File): Promise<VideoUploadResponse> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Upload failed');
        }

        return response.json();
    },

    startClipper: async (videoId: string, config: any = {}): Promise<JobStatusResponse> => {
        const response = await fetch(`${API_BASE_URL}/clipper/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ video_id: videoId, config }),
        });

        if (!response.ok) throw new Error('Failed to start clipper');
        return response.json();
    },

    startStats: async (videoId: string, config: any = {}): Promise<JobStatusResponse> => {
        const response = await fetch(`${API_BASE_URL}/stats/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ video_id: videoId, config }),
        });

        if (!response.ok) throw new Error('Failed to start stats analysis');
        return response.json();
    },

    getJobStatus: async (jobId: string, type: 'clipper' | 'stats'): Promise<JobStatusResponse> => {
        const response = await fetch(`${API_BASE_URL}/${type}/jobs/${jobId}`);
        if (!response.ok) throw new Error('Failed to get job status');
        return response.json();
    },

    getMatchReport: async (jobId: string): Promise<MatchReport> => {
        const response = await fetch(`${API_BASE_URL}/stats/report/${jobId}`);
        if (!response.ok) throw new Error('Failed to get report');
        return response.json();
    },

    getZipDownloadUrl: (jobId: string) => `${API_BASE_URL}/clipper/download/zip/${jobId}`,
    getSingleClipUrl: (eventId: string) => `${API_BASE_URL}/clipper/download/single/${eventId}`,
};
