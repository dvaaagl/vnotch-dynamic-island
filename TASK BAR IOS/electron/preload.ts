import { contextBridge, ipcRenderer } from 'electron';
import {
  DockAppItem,
  DockElectronAPI,
  DockSystemStatus,
  RunningWindowInfo,
} from '../src/shared/types';

const dockAPI: DockElectronAPI = {
  setIgnoreMouseEvents: (ignore: boolean) => {
    ipcRenderer.send('dock:set-ignore-mouse', ignore);
  },

  launchApp: (item: DockAppItem) => {
    return ipcRenderer.invoke('dock:launch-app', item);
  },

  focusOrToggleWindow: (pid: number, hwnd: number) => {
    return ipcRenderer.invoke('dock:focus-window', pid, hwnd);
  },

  closeWindow: (pid: number) => {
    return ipcRenderer.invoke('dock:close-window', pid);
  },

  openSpecialFolder: (folder) => {
    return ipcRenderer.invoke('dock:open-special-folder', folder);
  },

  onRunningAppsUpdate: (callback: (apps: RunningWindowInfo[]) => void) => {
    const handler = (_e: Electron.IpcRendererEvent, apps: RunningWindowInfo[]) => {
      callback(apps);
    };
    ipcRenderer.on('dock:running-apps', handler);
    return () => ipcRenderer.removeListener('dock:running-apps', handler);
  },

  onSystemStatusUpdate: (callback: (status: DockSystemStatus) => void) => {
    const handler = (_e: Electron.IpcRendererEvent, status: DockSystemStatus) => {
      callback(status);
    };
    ipcRenderer.on('dock:system-status', handler);
    return () => ipcRenderer.removeListener('dock:system-status', handler);
  },

  getInitialData: () => {
    return ipcRenderer.invoke('dock:get-initial-data');
  },
};

contextBridge.exposeInMainWorld('dockAPI', dockAPI);
