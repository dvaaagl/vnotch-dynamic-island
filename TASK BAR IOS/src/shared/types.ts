export type MacIconType =
  | 'finder'
  | 'launchpad'
  | 'safari'
  | 'messages'
  | 'mail'
  | 'photos'
  | 'music'
  | 'code'
  | 'terminal'
  | 'settings'
  | 'downloads'
  | 'control'
  | 'trash'
  | 'custom';

export interface DockAppItem {
  id: string;
  name: string;
  iconType: MacIconType;
  command: string;
  args?: string[];
  processKeywords?: string[];
  isPinned: boolean;
}

export interface RunningWindowInfo {
  pid: number;
  processName: string;
  windowTitle: string;
  hwnd: number;
}

export interface DockSystemStatus {
  cpuPercent: number;
  ramPercent: number;
  appRamMB: number;
  batteryPercent: number;
  isCharging: boolean;
}

export interface DockElectronAPI {
  setIgnoreMouseEvents: (ignore: boolean) => void;
  launchApp: (item: DockAppItem) => Promise<boolean>;
  focusOrToggleWindow: (pid: number, hwnd: number) => Promise<boolean>;
  closeWindow: (pid: number) => Promise<boolean>;
  openSpecialFolder: (
    folder: 'downloads' | 'documents' | 'recyclebin' | 'explorer' | 'settings'
  ) => Promise<void>;
  onRunningAppsUpdate: (callback: (apps: RunningWindowInfo[]) => void) => () => void;
  onSystemStatusUpdate: (callback: (status: DockSystemStatus) => void) => () => void;
  getInitialData: () => Promise<{
    runningApps: RunningWindowInfo[];
    systemStatus: DockSystemStatus;
  }>;
}

declare global {
  interface Window {
    dockAPI?: DockElectronAPI;
  }
}
