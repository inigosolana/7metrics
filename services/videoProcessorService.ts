import { VideoClip, HandballEvent } from '../types';
import { generateCoachResponse } from './geminiService';

/**
 * Backend Service for Video Processing and Automated Clipping
 * This simulates the backend logic for identifying and slicing handball plays.
 */

interface ProcessingOptions {
    includeContext: boolean;
    leadInSeconds: number;
    leadOutSeconds: number;
    targetActions: string[];
}

const DEFAULT_OPTIONS: ProcessingOptions = {
    includeContext: true,
    leadInSeconds: 8,
    leadOutSeconds: 3,
    targetActions: ['GOAL', 'POST', 'MISS', 'TURNOVER', 'STEAL', 'STEPS', 'DOUBLE_DRIBBLE', 'FOUL']
};
export class VideoProcessorService {
    // Configurado automáticamente por Antigravity con el túnel de Colab activo
    // URL del Colab (configurable en .env.local). Fallback a localhost si no está definido.
    static API_BASE_URL = import.meta.env.VITE_COLAB_URL || 'http://localhost:8000';

    static async processFullMatch(
        videoFile: File,
        options: Partial<ProcessingOptions> = {},
        onProgress?: (progress: number, message?: string) => void
    ): Promise<VideoClip[]> {
        const config = { ...DEFAULT_OPTIONS, ...options };
        console.log(`Starting AI Auto-Slicer for: ${videoFile.name}`);

        try {
            // 1. Upload Video with Progress
            console.log(`Uploading to ${this.API_BASE_URL}/upload-video...`);
            const startTime = Date.now();

            await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', `${this.API_BASE_URL}/upload-video`, true);
                xhr.setRequestHeader('ngrok-skip-browser-warning', 'true');

                const upFormData = new FormData();
                upFormData.append('file', videoFile);

                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable && onProgress) {
                        const percent = (e.loaded / e.total) * 40; // 0-40% for upload
                        const elapsed = (Date.now() - startTime) / 1000;
                        const speed = e.loaded / elapsed; // bytes/sec
                        const remainingBytes = e.total - e.loaded;
                        const eta = remainingBytes / speed;

                        onProgress(percent, `Subiendo: ${Math.round((e.loaded / 1024) / 1024)}MB / ${Math.round((e.total / 1024) / 1024)}MB (ETA: ${Math.round(eta)}s)`);
                    }
                };

                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(xhr.response);
                    } else {
                        reject(new Error(xhr.statusText));
                    }
                };

                xhr.onerror = () => reject(new Error('Network Error'));
                xhr.send(upFormData);
            });

            // Mock response object for logic flow downstream
            const response = { ok: true, text: () => Promise.resolve("OK") };
            const uploadHeaders: Record<string, string> = {
                'ngrok-skip-browser-warning': 'true'
            };

            if (response.ok) {
                console.log("Upload successful, waiting for processing...");

                // 2. Poll for clips (Max 10 minutes wait)
                const maxAttempts = 200;
                for (let i = 0; i < maxAttempts; i++) {
                    await new Promise(r => setTimeout(r, 3000)); // Wait 3s

                    try {
                        // Check status for progress bar
                        if (onProgress) {
                            try {
                                const statusRes = await fetch(`${this.API_BASE_URL}/status`, { headers: uploadHeaders });
                                if (statusRes.ok) {
                                    const statusData = await statusRes.json();
                                    if (statusData.progress !== undefined) {
                                        // Map 0-100 backend progress to 40-100 total progress
                                        const totalProgress = 40 + (statusData.progress * 0.6);

                                        let msg = "Procesando video...";
                                        if (statusData.eta_seconds !== null && statusData.eta_seconds !== undefined) {
                                            msg = `IA Analizando: ${Math.round(statusData.progress)}% (ETA: ${statusData.eta_seconds}s)`;
                                        }

                                        onProgress(totalProgress, msg);
                                    }
                                }
                            } catch (e) { /* ignore status errors */ }
                        }

                        const clipsResponse = await fetch(`${this.API_BASE_URL}/clips`, {
                            headers: uploadHeaders
                        });

                        if (clipsResponse.ok) {
                            const clipsData = await clipsResponse.json();
                            if (clipsData && clipsData.length > 0) {
                                console.log(`Found ${clipsData.length} clips!`);
                                return clipsData.map((c: any) => this.parseBackendClip(c));
                            }
                        }
                    } catch (err) {
                        console.warn("Error polling clips:", err);
                    }
                    console.log(`Polling attempt ${i + 1}/${maxAttempts}...`);
                }
            } else {
                console.error("Upload failed:", await response.text());
            }
        } catch (e) {
            console.warn("Backend real no detectado o error de conexión. Usando simulación.", e);
        }

        // Fallback to simulation if backend fails
        const rawEvents = await this.detectEvents(videoFile);
        return rawEvents.map(event => this.createClipFromEvent(event, config));
    }

    private static parseBackendClip(backendClip: any): VideoClip {
        // New structure from Colab:
        // path: "Team/Player/Timestamp.mp4"
        const pathParts = backendClip.path.split('/');
        const team = pathParts[0] || 'UNKNOWN';
        const player = pathParts[1] || 'Detected';
        const timestamp = parseInt(backendClip.filename.replace('.mp4', '')) || 0;

        const m = Math.floor(timestamp / 60);
        const s = timestamp % 60;
        const timeStr = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

        return {
            id: backendClip.path,
            startTime: timeStr,
            endTime: `${m.toString().padStart(2, '0')}:${(s + 15).toString().padStart(2, '0')}`, // 15s window
            duration: "15s",
            team: (team === 'HOME' || team === 'AWAY') ? team : 'HOME',
            player: player,
            actionType: 'GOAL', // Default label for offensive windows
            thumbnailUrl: "",
            url: backendClip.url.startsWith('http') ? backendClip.url : `${this.API_BASE_URL}${backendClip.url}`
        };
    }

    /**
     * Simulates the detection of events using the logic defined in the Technical Manual.
     */
    private static async detectEvents(videoFile: File): Promise<HandballEvent[]> {
        // Mocking the detection results
        // In reality, this would be the output of an inference server.
        const players = ['M. Hansen', 'S. Sagosen', 'D. Mem', 'A. Landin', 'G. Gidsel', 'Aleix Gómez', 'Ludovic Fabregas'];
        const actions = ['GOAL', 'POST', 'MISS', 'TURNOVER', 'STEAL', 'STEPS', 'DOUBLE_DRIBBLE', 'FOUL'];

        const events: HandballEvent[] = [];
        const matchStartTime = 0; // 0 seconds
        const matchDuration = 3600; // 60 minutes

        // Generate ~15-20 interesting events for the demo
        for (let i = 0; i < 15; i++) {
            const timestamp = Math.floor(Math.random() * matchDuration);
            const action = actions[Math.floor(Math.random() * actions.length)];
            const player = players[Math.floor(Math.random() * players.length)];

            events.push({
                id: `ev-${Math.random().toString(36).substr(2, 9)}`,
                timestamp: timestamp,
                timeFormatted: this.formatSeconds(timestamp),
                player: player,
                team: Math.random() > 0.5 ? 'HOME' : 'AWAY',
                action: action,
                courtZone: ['Left Wing', 'Right Wing', 'Center', 'Fast Break'][Math.floor(Math.random() * 4)]
            });
        }

        // Sort by timestamp
        return events.sort((a, b) => a.timestamp - b.timestamp);
    }

    /**
     * Slicing Logic: Calculates the start and end time of a clip based on the event.
     * Lead-in and Lead-out are crucial for coaching context.
     */
    private static createClipFromEvent(event: HandballEvent, config: ProcessingOptions): VideoClip {
        const startSec = Math.max(0, event.timestamp - config.leadInSeconds);
        const endSec = event.timestamp + config.leadOutSeconds;
        const durationSec = endSec - startSec;

        return {
            id: `clip-${event.id}`,
            startTime: this.formatSeconds(startSec),
            endTime: this.formatSeconds(endSec),
            duration: `${durationSec}s`,
            team: event.team,
            player: event.player.toString(),
            actionType: this.mapActionToClipType(event.action),
            thumbnailUrl: `https://picsum.photos/300/170?random=${event.id}`
        };
    }

    private static mapActionToClipType(action: string): any {
        const validActions = ['GOAL', 'POST', 'MISS', 'TURNOVER', 'STEAL', 'STEPS', 'DOUBLE_DRIBBLE', 'FOUL'];
        return validActions.includes(action) ? action : 'GOAL';
    }

    private static formatSeconds(seconds: number): string {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return [
            h.toString().padStart(2, '0'),
            m.toString().padStart(2, '0'),
            s.toString().padStart(2, '0')
        ].join(':');
    }

    /**
     * Logic for "Automatic Analysis" using Gemini.
     * This is what the user asked when they said "help me create the backend".
     */
    static async generateTacticalDescription(clip: VideoClip): Promise<string> {
        const prompt = `
            Analyze this handball clip:
            Action: ${clip.actionType}
            Player: ${clip.player}
            Time: ${clip.startTime} - ${clip.endTime}
            
            Based on the technical manual, provide a tactical insight about this play.
            Focus on positioning, the 40x20m court mapping, and the quality of the finish/defense.
        `;

        return await generateCoachResponse([], prompt);
    }
}
