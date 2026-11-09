import { app as electronApp, shell as electronShell } from 'electron';
import { spawn } from 'child_process';
import { DockAppItem } from '../../src/shared/types';

export class AppLauncherService {
  public async launchDockItem(item: DockAppItem): Promise<boolean> {
    try {
      const cmd = item.command;

      if (cmd === 'special:explorer') {
        spawn('explorer.exe', [], { detached: true, stdio: 'ignore' }).unref();
        return true;
      }
      if (cmd === 'special:browser') {
        await electronShell.openExternal('https://www.google.com');
        return true;
      }
      if (cmd === 'special:messages') {
        await electronShell.openExternal('https://web.whatsapp.com');
        return true;
      }
      if (cmd === 'special:mail') {
        await electronShell.openExternal('mailto:');
        return true;
      }
      if (cmd === 'special:photos') {
        await electronShell.openExternal('ms-photos:');
        return true;
      }
      if (cmd === 'special:music') {
        await electronShell.openPath(electronApp.getPath('music'));
        return true;
      }
      if (cmd === 'special:code') {
        spawn('cmd.exe', ['/c', 'code'], { detached: true, windowsHide: true, stdio: 'ignore' }).unref();
        return true;
      }
      if (cmd === 'special:terminal') {
        spawn('cmd.exe', ['/c', 'start', 'powershell.exe'], {
          detached: true,
          windowsHide: true,
          stdio: 'ignore',
        }).unref();
        return true;
      }
      if (cmd === 'special:settings') {
        await electronShell.openExternal('ms-settings:');
        return true;
      }
      if (cmd === 'special:downloads') {
        await electronShell.openPath(electronApp.getPath('downloads'));
        return true;
      }
      if (cmd === 'special:recyclebin') {
        spawn('explorer.exe', ['shell:RecycleBinFolder'], {
          detached: true,
          stdio: 'ignore',
        }).unref();
        return true;
      }

      // Custom dragged path or URI
      if (cmd.startsWith('http://') || cmd.startsWith('https://')) {
        await electronShell.openExternal(cmd);
        return true;
      }

      await electronShell.openPath(cmd);
      return true;
    } catch {
      return false;
    }
  }

  public async openSpecialFolder(
    folder: 'downloads' | 'documents' | 'recyclebin' | 'explorer' | 'settings'
  ): Promise<void> {
    if (folder === 'downloads') {
      await electronShell.openPath(electronApp.getPath('downloads'));
    } else if (folder === 'documents') {
      await electronShell.openPath(electronApp.getPath('documents'));
    } else if (folder === 'recyclebin') {
      spawn('explorer.exe', ['shell:RecycleBinFolder'], {
        detached: true,
        stdio: 'ignore',
      }).unref();
    } else if (folder === 'settings') {
      await electronShell.openExternal('ms-settings:');
    } else {
      spawn('explorer.exe', [], { detached: true, stdio: 'ignore' }).unref();
    }
  }
}
