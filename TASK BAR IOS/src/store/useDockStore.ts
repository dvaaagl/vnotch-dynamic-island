import { create } from 'zustand';
import { DockAppItem, DockSystemStatus, RunningWindowInfo } from '../shared/types';

const STORAGE_KEY = 'macos_dock_pinned_apps_v1';

const DEFAULT_PINNED_APPS: DockAppItem[] = [
  {
    id: 'finder',
    name: 'Finder (Explorer)',
    iconType: 'finder',
    command: 'special:explorer',
    processKeywords: ['explorer'],
    isPinned: true,
  },
  {
    id: 'launchpad',
    name: 'Launchpad',
    iconType: 'launchpad',
    command: 'internal:launchpad',
    isPinned: true,
  },
  {
    id: 'safari',
    name: 'Safari / Browser',
    iconType: 'safari',
    command: 'special:browser',
    processKeywords: ['chrome', 'msedge', 'brave', 'firefox', 'opera'],
    isPinned: true,
  },
  {
    id: 'messages',
    name: 'Messages (WhatsApp)',
    iconType: 'messages',
    command: 'special:messages',
    processKeywords: ['whatsapp', 'telegram', 'discord'],
    isPinned: true,
  },
  {
    id: 'mail',
    name: 'Mail',
    iconType: 'mail',
    command: 'special:mail',
    processKeywords: ['outlook', 'hxoutlook', 'thunderbird'],
    isPinned: true,
  },
  {
    id: 'photos',
    name: 'Photos',
    iconType: 'photos',
    command: 'special:photos',
    processKeywords: ['photos'],
    isPinned: true,
  },
  {
    id: 'music',
    name: 'Music / Spotify',
    iconType: 'music',
    command: 'special:music',
    processKeywords: ['spotify', 'music'],
    isPinned: true,
  },
  {
    id: 'code',
    name: 'Visual Studio Code',
    iconType: 'code',
    command: 'special:code',
    processKeywords: ['code'],
    isPinned: true,
  },
  {
    id: 'terminal',
    name: 'Terminal',
    iconType: 'terminal',
    command: 'special:terminal',
    processKeywords: ['windowsterminal', 'powershell', 'cmd'],
    isPinned: true,
  },
  {
    id: 'settings',
    name: 'System Settings',
    iconType: 'settings',
    command: 'special:settings',
    processKeywords: ['systemsettings'],
    isPinned: true,
  },
];

function loadInitialPinned(): DockAppItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as DockAppItem[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_PINNED_APPS;
}

interface DockState {
  pinnedApps: DockAppItem[];
  runningApps: RunningWindowInfo[];
  systemStatus: DockSystemStatus;
  autoHide: boolean;
  magnificationEnabled: boolean;
  baseIconSize: number;
  activePopover: 'none' | 'launchpad' | 'control';

  setRunningApps: (apps: RunningWindowInfo[]) => void;
  setSystemStatus: (status: DockSystemStatus) => void;
  setAutoHide: (val: boolean) => void;
  setMagnificationEnabled: (val: boolean) => void;
  setBaseIconSize: (size: number) => void;
  setActivePopover: (popover: 'none' | 'launchpad' | 'control') => void;
  addCustomPinnedApp: (app: DockAppItem) => void;
  removePinnedApp: (id: string) => void;
  resetDefaultApps: () => void;
}

export const useDockStore = create<DockState>((set, get) => ({
  pinnedApps: loadInitialPinned(),
  runningApps: [],
  systemStatus: {
    cpuPercent: 4,
    ramPercent: 40,
    appRamMB: 36,
    batteryPercent: 100,
    isCharging: true,
  },
  autoHide: false,
  magnificationEnabled: true,
  baseIconSize: 50,
  activePopover: 'none',

  setRunningApps: (runningApps) => set({ runningApps }),
  setSystemStatus: (systemStatus) => set({ systemStatus }),
  setAutoHide: (autoHide) => set({ autoHide }),
  setMagnificationEnabled: (magnificationEnabled) => set({ magnificationEnabled }),
  setBaseIconSize: (baseIconSize) => set({ baseIconSize }),
  setActivePopover: (activePopover) =>
    set((s) => ({
      activePopover: s.activePopover === activePopover ? 'none' : activePopover,
    })),

  addCustomPinnedApp: (newApp) => {
    const current = get().pinnedApps;
    if (current.some((a) => a.command === newApp.command)) return;
    const updated = [...current, newApp];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
    set({ pinnedApps: updated });
  },

  removePinnedApp: (id) => {
    const updated = get().pinnedApps.filter((a) => a.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
    set({ pinnedApps: updated });
  },

  resetDefaultApps: () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PINNED_APPS));
    } catch {}
    set({ pinnedApps: DEFAULT_PINNED_APPS });
  },
}));
