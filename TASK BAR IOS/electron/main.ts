import {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  nativeImage,
  screen,
  Tray,
} from 'electron';
import path from 'path';
import { Win32TaskbarService } from './services/Win32TaskbarService';
import { AppLauncherService } from './services/AppLauncherService';
import { DockAppItem } from '../src/shared/types';

// ============================================================================
// ULTRA-LOW RAM CHROMIUM & V8 CONFIGURATION
// ============================================================================
app.commandLine.appendSwitch('js-flags', '--max-old-space-size=64');
app.commandLine.appendSwitch('disable-http-cache');
app.commandLine.appendSwitch('disk-cache-size', '1');
app.commandLine.appendSwitch('media-cache-size', '1');
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');
app.commandLine.appendSwitch('disable-extensions');
app.commandLine.appendSwitch('disable-background-networking');
app.commandLine.appendSwitch('disable-sync');

const WINDOW_WIDTH = 1040;
const WINDOW_HEIGHT = 280;

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let taskbarService: Win32TaskbarService | null = null;
const launcherService = new AppLauncherService();

function positionWindowBottomCenter(): void {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  const display = screen.getPrimaryDisplay();
  const { x, y, width, height } = display.bounds;
  const targetX = Math.round(x + (width - WINDOW_WIDTH) / 2);
  const targetY = Math.round(y + height - WINDOW_HEIGHT);

  mainWindow.setBounds({
    x: targetX,
    y: targetY,
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
  });
}

function createWindow(): void {
  const display = screen.getPrimaryDisplay();
  const { x, y, width, height } = display.bounds;

  mainWindow = new BrowserWindow({
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    x: Math.round(x + (width - WINDOW_WIDTH) / 2),
    y: Math.round(y + height - WINDOW_HEIGHT),
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

  mainWindow.setAlwaysOnTop(true, 'screen-saver');
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  mainWindow.setIgnoreMouseEvents(true, { forward: true });

  const isDev = process.argv.includes('--dev') || Boolean(process.env.VITE_DEV_SERVER_URL);
  if (isDev) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL || 'http://localhost:5174');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray(): void {
  const iconDataUrl =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAADdJREFUOE9jZKAQMFKon2HUAIbRMGAYDQNQAJgwMjL+p6SkhG8wNjY+T0lJAdUNowaMGkBpAAD2hwMRbS6Z1wAAAABJRU5ErkJggg==';
  const icon = nativeImage.createFromDataURL(iconDataUrl);
  tray = new Tray(icon);
  tray.setToolTip('macOS Floating Dock (TASK BAR IOS)');

  const menu = Menu.buildFromTemplate([
    { label: 'macOS Floating Dock (Active)', enabled: false },
    { type: 'separator' },
    {
      label: 'Re-center Dock (Bottom-Center)',
      click: () => positionWindowBottomCenter(),
    },
    { type: 'separator' },
    {
      label: 'Quit macOS Dock',
      click: () => app.quit(),
    },
  ]);
  tray.setContextMenu(menu);
}

function setupIPCAndServices(): void {
  taskbarService = new Win32TaskbarService(
    (apps) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('dock:running-apps', apps);
      }
    },
    (status) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('dock:system-status', status);
      }
    }
  );
  taskbarService.start();

  ipcMain.on('dock:set-ignore-mouse', (_e, ignore: boolean) => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    if (ignore) {
      mainWindow.setIgnoreMouseEvents(true, { forward: true });
    } else {
      mainWindow.setIgnoreMouseEvents(false);
    }
  });

  ipcMain.handle('dock:launch-app', async (_e, item: DockAppItem) => {
    return launcherService.launchDockItem(item);
  });

  ipcMain.handle('dock:focus-window', async (_e, pid: number, hwnd: number) => {
    if (!taskbarService) return false;
    return taskbarService.focusOrToggleWindow(pid, hwnd);
  });

  ipcMain.handle('dock:close-window', async (_e, pid: number) => {
    if (!taskbarService) return false;
    return taskbarService.closeWindow(pid);
  });

  ipcMain.handle('dock:open-special-folder', async (_e, folder) => {
    await launcherService.openSpecialFolder(folder);
  });

  ipcMain.handle('dock:get-initial-data', async () => {
    return {
      runningApps: taskbarService?.getRunningApps() ?? [],
      systemStatus: taskbarService!.getSystemStatusSnapshot(),
    };
  });

  screen.on('display-metrics-changed', () => {
    positionWindowBottomCenter();
  });
}

// Use custom userData path so it doesn't conflict with VNotch Dynamic Island single-instance lock!
app.setPath('userData', path.join(app.getPath('appData'), 'taskbar-macos-dock'));

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.whenReady().then(() => {
    createWindow();
    createTray();
    setupIPCAndServices();
  });

  app.on('before-quit', () => {
    taskbarService?.stop();
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}
