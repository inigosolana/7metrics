export enum View {
  DASHBOARD = 'DASHBOARD',
  REAL_STATS = 'REAL_STATS',
  VIDEO_LAB = 'VIDEO_LAB',
  AI_STATS = 'AI_STATS',
  PLANNING = 'PLANNING',
  MANUAL_STATS = 'MANUAL_STATS',
  TEAM_HUB = 'TEAM_HUB',
  VIDEO_LAB_PROCESS = 'VIDEO_LAB_PROCESS',
  CLIP_EDITOR = 'CLIP_EDITOR',
  SUPER_ADMIN = 'SUPER_ADMIN',
  CLUB_ADMIN = 'CLUB_ADMIN',
  PLAYER_DASHBOARD = 'PLAYER_DASHBOARD'
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  CLUB_ADMIN = 'CLUB_ADMIN',
  COACH = 'COACH',
  PLAYER = 'PLAYER'
}

export interface ClubSubscription {
  tier: 'BASIC' | 'PRO' | 'ELITE';
  features: {
    aiStats: boolean;
    clipEditor: boolean;
    externalApp: boolean;
    videoGen: boolean;
  };
}

export interface Club {
  id: string;
  name: string;
  logoUrl: string;
  subscription: ClubSubscription;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  clubId: string;
  teamId?: string; // If coach or player
  avatarUrl: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isThinking?: boolean;
}

export interface VideoGenerationState {
  isGenerating: boolean;
  progress: string;
  videoUrl?: string;
  error?: string;
}

export interface ImageAnalysisResult {
  analysis: string;
  tags: string[];
}

export type TurnoverType = 'Pasos' | 'Dobles' | 'Falta en ataque' | 'Pase y va' | 'Recepción fallida' | 'Pisando área' | '3 segundos';
export type DefenseType = '6:0' | '5:1' | '3:2:1' | '4:2' | 'Mixta' | 'Presión' | 'Otro';

export interface HandballEvent {
  id: string;
  timestamp: number;
  timeFormatted: string;
  player: number | string;
  team: 'HOME' | 'AWAY';
  action: string;
  courtZone?: string;
  goalZone?: number;
  defenseAtMoment?: DefenseType;
  turnoverType?: TurnoverType;
  is_7m?: boolean;
}

export interface TabletEvent {
  id: string;
  time: string;
  player: string;
  action: string;
  result: string;
}

export interface Player {
  id: number;
  name: string;
  pos: string;
  goals: number;
  assists: number;
  matches: number;
  rating: number;
  photoUrl?: string;
}

export interface VideoClip {
  id: string;
  startTime: string;
  endTime: string;
  duration: string;
  team: 'HOME' | 'AWAY';
  player: string; // Player Name
  actionType: 'GOAL' | 'JUMP-SHOT' | 'DRIBBLING' | 'SHOT' | 'DEFENCE' | 'PASSING' | 'POST' | 'MISS' | 'TURNOVER' | 'STEAL' | 'STEPS' | 'DOUBLE_DRIBBLE' | 'FOUL';
  thumbnailUrl: string;
  url?: string;
}