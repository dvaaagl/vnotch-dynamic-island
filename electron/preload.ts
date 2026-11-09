import { contextBridge, ipcRenderer } from 'electron';
import {
  IslandAlertPayload,
  MediaControlAction,
  MediaSessionData,
  PollingMode,
  SystemStatsData,
  VNotchElectronAPI,
} from '../src/shared/types';

const api: VNotchElectronAPI = {
  setIgnoreMouseEvents: (ignore: boolean) => {
    ipcRenderer.send('vnotch:set-ignore-mouse', ignore);
  },

  setPollingMode: (mode: PollingMode) => {
    ipcRenderer.send('vnotch:set-polling-mode', mode);
  },

  sendMediaControl: (action: MediaControlAction) => {
    return ipcRenderer.invoke('vnotch:media-control', action);
  },

  startFileDrag: (filePath: string) => {
    ipcRenderer.send('vnotch:shelf-start-drag', filePath);
  },

  getInitialState: () => {
    return ipcRenderer.invoke('vnotch:get-initial-state');
  },

  onMediaUpdate: (callback: (data: MediaSessionData | null) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: MediaSessionData | null) => {
      callback(data);
    };
    ipcRenderer.on('vnotch:media-update', handler);
    return () => ipcRenderer.removeListener('vnotch:media-update', handler);
  },

  onSystemUpdate: (callback: (data: SystemStatsData) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: SystemStatsData) => {
      callback(data);
    };
    ipcRenderer.on('vnotch:system-update', handler);
    return () => ipcRenderer.removeListener('vnotch:system-update', handler);
  },

  onAlertEvent: (callback: (alert: IslandAlertPayload) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, alert: IslandAlertPayload) => {
      callback(alert);
    };
    ipcRenderer.on('vnotch:alert-event', handler);
    return () => ipcRenderer.removeListener('vnotch:alert-event', handler);
  },
};

contextBridge.exposeInMainWorld('vnotchAPI', api);
