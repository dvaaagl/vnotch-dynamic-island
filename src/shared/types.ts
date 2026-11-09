export type IslandSizeMode = 'compact' | 'peek' | 'expanded' | 'alert';

export type IslandTab = 'media' | 'system' | 'timer' | 'shelf';

export type MediaControlAction = 'play-pause' | 'next' | 'previous';

export type PollingMode = 'idle' | 'active';

export interface MediaSessionData {
  isPlaying: boolean;
  title: string;
  artist: string;
  album?: string;
  appId: string;
  sourceType: 'spotify' | 'youtube' | 'browser' | 'music' | 'unknown';
  thumbnailUrl?: string;
  positionSeconds?: number;
  durationSeconds?: number;
}

export interface SystemStatsData {
  cpuUsagePercent: number;
  ramUsagePercent: number;
  ramUsedGB: number;
  ramTotalGB: number;
  appRamMB: number;
  battery: {
    hasBattery: boolean;
    percent: number;
    isCharging: boolean;
  };
  timestamp: number;
}

export interface ShelfFileItem {
  id: string;
  name: string;
  path: string;
  sizeBytes: number;
  extension: string;
  addedAt: number;
}

export interface IslandAlertPayload {
  id: string;
  type: 'battery-charging' | 'battery-low' | 'timer-done' | 'media-change' | 'system-warn';
  title: string;
  subtitle?: string;
  accentColor?: string;
  durationMs?: number;
}

export interface VNotchElectronAPI {
  setIgnoreMouseEvents: (ignore: boolean) => void;
  setPollingMode: (mode: PollingMode) => void;
  sendMediaControl: (action: MediaControlAction) => Promise<boolean>;
  startFileDrag: (filePath: string) => void;
  getInitialState: () => Promise<{
    media: MediaSessionData | null;
    system: SystemStatsData;
  }>;
  onMediaUpdate: (callback: (data: MediaSessionData | null) => void) => () => void;
  onSystemUpdate: (callback: (data: SystemStatsData) => void) => () => void;
  onAlertEvent: (callback: (alert: IslandAlertPayload) => void) => () => void;
}

declare global {
  interface Window {
    vnotchAPI?: VNotchElectronAPI;
  }
}
