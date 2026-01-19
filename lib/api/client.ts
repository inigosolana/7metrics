import axios from 'axios';

// Base configuration
const API_BASE_URL = 'https://sevenmetrics-api.onrender.com';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Types from OpenAPI
export interface Match {
    id?: string;
    team_a_name: string;
    team_b_name: string;
    defense_a?: string;
    defense_b?: string;
    initial_possession?: 'A' | 'B';
    local_score?: number;
    visitor_score?: number;
    total_time_seconds?: number;
    status?: 'SETUP' | 'IN_PROGRESS' | 'PAUSED' | 'FINISHED';
    created_at?: string;
    updated_at?: string;
}

export interface Player {
    id?: string;
    match_id: string;
    team: 'A' | 'B';
    number: number;
    name: string;
    is_goalkeeper: boolean;
    position?: string;
    hand?: string;
}

export interface Event {
    id?: string;
    match_id: string;
    timestamp: number;
    time_formatted: string;
    player: number; // Player number
    team: 'A' | 'B';
    action: string;
    court_zone?: string;
    goal_zone?: number;
    defense_at_moment?: string;
    context?: string[];
    rival_goalkeeper?: number;
}

// API Methods
export const metricsApi = {
    // Matches
    createMatch: async (data: Match): Promise<Match> => {
        const response = await apiClient.post<Match>('/matches/', data);
        return response.data;
    },
    listMatches: async (skip = 0, limit = 50): Promise<Match[]> => {
        try {
            console.log("Fetching matches from API...");
            const response = await apiClient.get<Match[]>('/matches/', { params: { skip, limit } });
            console.log("Matches API Response:", response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching matches:", error);
            throw error;
        }
    },
    getMatch: async (matchId: string): Promise<Match> => {
        const response = await apiClient.get<Match>(`/matches/${matchId}`);
        return response.data;
    },
    startMatch: async (matchId: string) => {
        return apiClient.post(`/matches/${matchId}/start`);
    },
    pauseMatch: async (matchId: string) => {
        return apiClient.post(`/matches/${matchId}/pause`);
    },
    finishMatch: async (matchId: string) => {
        return apiClient.post(`/matches/${matchId}/finish`);
    },
    deleteMatch: async (matchId: string) => {
        return apiClient.delete(`/matches/${matchId}`);
    },

    // Players
    createPlayer: async (matchId: string, player: Player): Promise<Player> => {
        return (await apiClient.post<Player>(`/matches/${matchId}/players/`, player)).data;
    },
    createPlayersBulk: async (matchId: string, players: Record<string, any>[]): Promise<Player[]> => {
        // According to docs, post body is { "players": [...] }
        return (await apiClient.post<Player[]>(`/matches/${matchId}/players/bulk`, { players })).data;
    },
    listPlayers: async (matchId: string, team?: string): Promise<Player[]> => {
        return (await apiClient.get<Player[]>(`/matches/${matchId}/players/`, { params: { team } })).data;
    },

    // Events
    registerEvent: async (event: Event): Promise<Event> => {
        return (await apiClient.post<Event>('/events/', event)).data;
    },
    listEvents: async (matchId: string): Promise<Event[]> => {
        return (await apiClient.get<Event[]>(`/events/${matchId}`)).data;
    },
    undoLastEvent: async (matchId: string) => {
        return apiClient.delete(`/events/last/${matchId}`);
    },

    // Stats
    getFullStats: async (matchId: string) => {
        return (await apiClient.get(`/matches/${matchId}/statistics/`)).data;
    }
};
