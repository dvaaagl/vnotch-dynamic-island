import {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  nativeImage,
  powerMonitor,
  screen,
  Tray,
} from 'electron';
import path from 'path';
import { MediaService } from './services/MediaService';
import { SystemService } from './services/SystemService';
import { FileShelfService } from './services/FileShelfService';
import {
  IslandAlertPayload,
  MediaControlAction,
  PollingMode,
} from '../src/shared/types';

// ============================================================================
// 1. ULTRA-LOW RAM & CHROMIUM OPTIMIZATION SWITCHES
// ============================================================================
app.commandLine.appendSwitch('js-flags', '--max-old-space-size=64');
app.commandLine.appendSwitch('disable-http-cache');
app.commandLine.appendSwitch('disk-cache-size', '1');
app.commandLine.appendSwitch('media-cache-size', '1');
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');
app.commandLine.appendSwitch('disable-extensions');
app.commandLine.appendSwitch('disable-component-extensions-with-background-pages');
app.commandLine.appendSwitch('disable-background-networking');
app.commandLine.appendSwitch('disable-sync');
app.commandLine.appendSwitch(
  'disable-features',
  'TranslateUI,AutofillServerCommunication,MediaRouter'
);

const WINDOW_WIDTH = 520;
const WINDOW_HEIGHT = 270;

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let systemService: SystemService | null = null;
let mediaService: MediaService | null = null;
const fileShelfService = new FileShelfService();

function positionWindowTopCenter(): void {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  const primaryDisplay = screen.getPrimaryDisplay();
  const { x, y, width } = primaryDisplay.bounds;
  const targetX = Math.round(x + (width - WINDOW_WIDTH) / 2);
  const targetY = y; // Flush with the top bezel of the Windows screen
  mainWindow.setBounds({
    x: targetX,
    y: targetY,
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
  });
}

function sendAlertToRenderer(alert: IslandAlertPayload): void {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.webContents.send('vnotch:alert-event', alert);
}

function createWindow(): void {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { x, y, width } = primaryDisplay.bounds;

  mainWindow = new BrowserWindow({
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    x: Math.round(x + (width - WINDOW_WIDTH) / 2),
    y: y,
    frame: false,
    transparent: true,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    hasShadow: false,
    focusable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false,
      webgl: false,
      enableWebSQL: false,
      backgroundThrottling: false,
    },
  });

  // Keep above fullscreen/normal windows on Windows
  mainWindow.setAlwaysOnTop(true, 'screen-saver');
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  // By default allow clicks outside the capsule to pass through to underlying Windows apps
  mainWindow.setIgnoreMouseEvents(true, { forward: true });

  const isDevMode = process.argv.includes('--dev') || Boolean(process.env.VITE_DEV_SERVER_URL);
  if (isDevMode) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
  }

  mainWindow.webContents.on('did-finish-load', () => {
    setTimeout(() => {
      sendAlertToRenderer({
        id: `ready-${Date.now()}`,
        type: 'system-warn',
        title: 'VNotch Active',
        subtitle: 'Hover atau klik untuk membuka kontrol',
        accentColor: '#38bdf8',
        durationMs: 3000,
      });
    }, 400);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createSystemTray(): void {
  const trayIconDataUrl =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAADdJREFUOE9jZKAQMFKon2HUAIbRMGAYDQNQAJgwMjL+p6SkhG8wNjY+T0lJAdUNowaMGkBpAAD2hwMRbS6Z1wAAAABJRU5ErkJggg==';
  const icon = nativeImage.createFromDataURL(trayIconDataUrl);
  tray = new Tray(icon);
  tray.setToolTip('VNotch Dynamic Island');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'VNotch Dynamic Island (Active)',
      enabled: false,
    },
    { type: 'separator' },
    {
      label: 'Reset Position (Top-Center)',
      click: () => positionWindowTopCenter(),
    },
    {
      label: 'Test Battery Charging Alert',
      click: () => {
        sendAlertToRenderer({
          id: `bat-${Date.now()}`,
          type: 'battery-charging',
          title: 'Charging Connected',
          subtitle: `${systemService?.getSnapshot().battery.percent ?? 100}% Power`,
          accentColor: '#22c55e',
          durationMs: 2800,
        });
      },
    },
    { type: 'separator' },
    {
      label: 'Quit VNotch',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
}

function setupServicesAndIPC(): void {
  systemService = new SystemService((stats) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('vnotch:system-update', stats);
    }
  });

  mediaService = new MediaService(
    (session, isNewTrack) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('vnotch:media-update', session);
        if (isNewTrack && session) {
          sendAlertToRenderer({
            id: `track-${Date.now()}`,
            type: 'media-change',
            title: session.title,
            subtitle: session.artist,
            accentColor: session.sourceType === 'spotify' ? '#1db954' : '#ef4444',
            durationMs: 2600,
          });
        }
      }
    },
    (percent, isCharging, hasBattery) => {
      systemService?.updateBatteryFromBridge(percent, isCharging, hasBattery);
    }
  );

  systemService.start();
  mediaService.start();

  // IPC Handlers
  ipcMain.on('vnotch:set-ignore-mouse', (_event, ignore: boolean) => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    if (ignore) {
      mainWindow.setIgnoreMouseEvents(true, { forward: true });
    } else {
      mainWindow.setIgnoreMouseEvents(false);
    }
  });

  ipcMain.on('vnotch:set-polling-mode', (_event, mode: PollingMode) => {
    systemService?.setPollingMode(mode);
    if (mode === 'active') {
      systemService?.emitNow();
    } else if (mainWindow && !mainWindow.isDestroyed()) {
      // Clear unused image caches when collapsing back to idle compact mode
      mainWindow.webContents.session.clearCache().catch(() => {});
    }
  });

  ipcMain.handle('vnotch:media-control', async (_event, action: MediaControlAction) => {
    if (!mediaService) return false;
    return mediaService.sendControl(action);
  });

  ipcMain.on('vnotch:shelf-start-drag', (event, filePath: string) => {
    fileShelfService.startNativeFileDrag(event.sender, filePath);
  });

  ipcMain.handle('vnotch:get-initial-state', async () => {
    return {
      media: mediaService?.getCurrentSession() ?? null,
      system: systemService!.getSnapshot(),
    };
  });

  // Power Events (Charger Plugged / Unplugged)
  powerMonitor.on('on-ac', () => {
    systemService?.setChargingStatus(true);
    const pct = systemService?.getSnapshot().battery.percent ?? 100;
    sendAlertToRenderer({
      id: `ac-${Date.now()}`,
      type: 'battery-charging',
      title: 'Charging',
      subtitle: `${pct}% Battery`,
      accentColor: '#22c55e',
      durationMs: 2800,
    });
  });

  powerMonitor.on('on-battery', () => {
    systemService?.setChargingStatus(false);
    const pct = systemService?.getSnapshot().battery.percent ?? 100;
    sendAlertToRenderer({
      id: `bat-${Date.now()}`,
      type: 'battery-low',
      title: 'On Battery Power',
      subtitle: `${pct}% Remaining`,
      accentColor: '#f59e0b',
      durationMs: 2600,
    });
  });

  screen.on('display-metrics-changed', () => {
    positionWindowTopCenter();
  });
}

const gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) {
  app.quit();
} else {
  app.whenReady().then(() => {
    createWindow();
    createSystemTray();
    setupServicesAndIPC();
  });

  app.on('before-quit', () => {
    systemService?.stop();
    mediaService?.stop();
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}
