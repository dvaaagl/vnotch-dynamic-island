import { create } from 'zustand';
import {
  IslandAlertPayload,
  IslandSizeMode,
  IslandTab,
  MediaControlAction,
  MediaSessionData,
  ShelfFileItem,
  SystemStatsData,
} from '../shared/types';

interface IslandState {
  mode: IslandSizeMode;
  activeTab: IslandTab;
  media: MediaSessionData | null;
  system: SystemStatsData;
  shelfFiles: ShelfFileItem[];
  activeAlert: IslandAlertPayload | null;

  // Live Activity Timer state
  timerRemainingSec: number;
  timerTotalSec: number;
  timerRunning: boolean;

  // Actions
  setMode: (mode: IslandSizeMode) => void;
  setActiveTab: (tab: IslandTab) => void;
  setMedia: (media: MediaSessionData | null) => void;
  setSystem: (system: SystemStatsData) => void;
  triggerAlert: (alert: IslandAlertPayload) => void;
  dismissAlert: () => void;

  // Media control action (supports both real Windows SMTC and demo mode)
  triggerMediaControl: (action: MediaControlAction) => Promise<void>;
  loadDemoMedia: (source: 'spotify' | 'youtube') => void;

  // Shelf actions
  addShelfFiles: (files: ShelfFileItem[]) => void;
  removeShelfFile: (id: string) => void;
  clearShelfFiles: () => void;

  // Timer actions
  startTimer: (seconds: number) => void;
  toggleTimerPause: () => void;
  resetTimer: () => void;
  tickTimer: () => void;
}

let alertTimeoutId: ReturnType<typeof setTimeout> | null = null;

export const useIslandStore = create<IslandState>((set, get) => ({
  mode: 'compact',
  activeTab: 'media',
  media: null,
  system: {
    cpuUsagePercent: 4,
    ramUsagePercent: 42,
    ramUsedGB: 6.7,
    ramTotalGB: 16.0,
    appRamMB: 38,
    battery: {
      hasBattery: true,
      percent: 100,
      isCharging: true,
    },
    timestamp: Date.now(),
  },
  shelfFiles: [],
  activeAlert: null,

  timerRemainingSec: 0,
  timerTotalSec: 0,
  timerRunning: false,

  setMode: (mode) => {
    const prevMode = get().mode;
    if (prevMode === mode) return;
    set({ mode });
    // Notify Electron Main Process to adjust polling speed for RAM/CPU savings
    window.vnotchAPI?.setPollingMode(mode === 'expanded' ? 'active' : 'idle');
  },

  setActiveTab: (activeTab) => set({ activeTab }),

  setMedia: (media) => set({ media }),

  setSystem: (system) => set({ system }),

  triggerAlert: (alert) => {
    if (alertTimeoutId) clearTimeout(alertTimeoutId);
    const currentMode = get().mode;
    // Do not interrupt if user is actively interacting in expanded mode
    if (currentMode === 'expanded') return;

    set({ activeAlert: alert, mode: 'alert' });
    alertTimeoutId = setTimeout(() => {
      if (get().mode === 'alert') {
        set({ mode: 'compact', activeAlert: null });
      }
    }, alert.durationMs ?? 2600);
  },

  dismissAlert: () => {
    if (alertTimeoutId) clearTimeout(alertTimeoutId);
    set({ activeAlert: null, mode: 'compact' });
  },

  triggerMediaControl: async (action) => {
    const currentMedia = get().media;
    if (currentMedia && currentMedia.appId.startsWith('demo-')) {
      if (action === 'play-pause') {
        set({
          media: { ...currentMedia, isPlaying: !currentMedia.isPlaying },
        });
      } else if (action === 'next') {
        const isSpotify = currentMedia.sourceType === 'spotify';
        set({
          media: {
            ...currentMedia,
            title: isSpotify ? 'Starboy (feat. Daft Punk)' : 'Build a Dynamic Island in TypeScript',
            artist: isSpotify ? 'The Weeknd' : 'YouTube Tech Channel',
            isPlaying: true,
          },
        });
      } else if (action === 'previous') {
        const isSpotify = currentMedia.sourceType === 'spotify';
        set({
          media: {
            ...currentMedia,
            title: isSpotify ? 'Midnight City' : 'Lo-Fi Coding Beats 24/7 Live',
            artist: isSpotify ? 'M83' : 'ChilledCow YouTube',
            isPlaying: true,
          },
        });
      }
      return;
    }
    await window.vnotchAPI?.sendMediaControl(action);
  },

  loadDemoMedia: (source) => {
    if (source === 'spotify') {
      set({
        media: {
          isPlaying: true,
          title: 'Blinding Lights',
          artist: 'The Weeknd',
          album: 'After Hours',
          appId: 'demo-Spotify.exe',
          sourceType: 'spotify',
        },
      });
    } else {
      set({
        media: {
          isPlaying: true,
          title: 'Lofi Hip Hop Radio - Beats to Relax/Study to',
          artist: 'Lofi Girl • YouTube',
          album: 'YouTube Live',
          appId: 'demo-chrome.exe',
          sourceType: 'youtube',
        },
      });
    }
  },

  addShelfFiles: (files) =>
    set((state) => {
      const existingPaths = new Set(state.shelfFiles.map((f) => f.path));
      const uniqueNew = files.filter((f) => !existingPaths.has(f.path));
      return {
        shelfFiles: [...uniqueNew, ...state.shelfFiles].slice(0, 12),
      };
    }),

  removeShelfFile: (id) =>
    set((state) => ({
      shelfFiles: state.shelfFiles.filter((f) => f.id !== id),
    })),

  clearShelfFiles: () => set({ shelfFiles: [] }),

  startTimer: (seconds) =>
    set({
      timerRemainingSec: seconds,
      timerTotalSec: seconds,
      timerRunning: true,
    }),

  toggleTimerPause: () =>
    set((state) => ({
      timerRunning: state.timerRemainingSec > 0 ? !state.timerRunning : false,
    })),

  resetTimer: () =>
    set({
      timerRemainingSec: 0,
      timerTotalSec: 0,
      timerRunning: false,
    }),

  tickTimer: () => {
    const { timerRunning, timerRemainingSec, triggerAlert } = get();
    if (!timerRunning || timerRemainingSec <= 0) return;

    if (timerRemainingSec === 1) {
      set({ timerRemainingSec: 0, timerRunning: false });
      triggerAlert({
        id: `timer-${Date.now()}`,
        type: 'timer-done',
        title: 'Timer Selesai!',
        subtitle: 'Waktu hitung mundur telah habis',
        accentColor: '#f97316',
        durationMs: 3500,
      });
    } else {
      set({ timerRemainingSec: timerRemainingSec - 1 });
    }
  },
}));
