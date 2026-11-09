import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import os from 'os';
import { DockSystemStatus, RunningWindowInfo } from '../../src/shared/types';

interface WorkerPayload {
  batteryPercent: number;
  isCharging: boolean;
  windows: RunningWindowInfo[];
}

export class Win32TaskbarService {
  private psWorker: ChildProcessWithoutNullStreams | null = null;
  private pollTimer: NodeJS.Timeout | null = null;
  private stdoutBuffer = '';
  private prevCpu = this.takeCpuSnapshot();
  private runningApps: RunningWindowInfo[] = [];
  private lastWindowsHash = '';
  private battery = { percent: 100, isCharging: true };

  private onAppsChange: (apps: RunningWindowInfo[]) => void;
  private onStatusChange: (status: DockSystemStatus) => void;

  constructor(
    onAppsChange: (apps: RunningWindowInfo[]) => void,
    onStatusChange: (status: DockSystemStatus) => void
  ) {
    this.onAppsChange = onAppsChange;
    this.onStatusChange = onStatusChange;
  }

  private takeCpuSnapshot() {
    const cpus = os.cpus();
    let idle = 0;
    let total = 0;
    for (let i = 0; i < cpus.length; i++) {
      const t = cpus[i].times;
      idle += t.idle;
      total += t.user + t.nice + t.sys + t.irq + t.idle;
    }
    return { idle, total };
  }

  public getSystemStatusSnapshot(): DockSystemStatus {
    const cur = this.takeCpuSnapshot();
    const idleDiff = cur.idle - this.prevCpu.idle;
    const totalDiff = cur.total - this.prevCpu.total;
    this.prevCpu = cur;

    const cpuPercent =
      totalDiff > 0 ? Math.max(1, Math.min(100, Math.round((1 - idleDiff / totalDiff) * 100))) : 2;
    const totalMem = os.totalmem();
    const usedMem = totalMem - os.freemem();
    const ramPercent = Math.round((usedMem / totalMem) * 100);
    const appRamMB = Math.round(process.memoryUsage().rss / (1024 * 1024));

    return {
      cpuPercent,
      ramPercent,
      appRamMB,
      batteryPercent: this.battery.percent,
      isCharging: this.battery.isCharging,
    };
  }

  public getRunningApps(): RunningWindowInfo[] {
    return this.runningApps;
  }

  public start(): void {
    this.initWorker();
    this.pollTimer = setInterval(() => {
      this.requestPoll();
    }, 3000);
    setTimeout(() => this.requestPoll(), 500);
  }

  private initWorker(): void {
    if (this.psWorker) return;

    const worker = spawn(
      'powershell.exe',
      ['-NoProfile', '-NoLogo', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', '-'],
      {
        windowsHide: true,
        stdio: ['pipe', 'pipe', 'pipe'],
      }
    );
    this.psWorker = worker;

    const bootstrap = `
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Add-Type -AssemblyName System.Windows.Forms -ErrorAction SilentlyContinue

Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class Win32DockHelper {
    [DllImport("user32.dll")]
    public static extern bool SetForegroundWindow(IntPtr hWnd);
    [DllImport("user32.dll")]
    public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
    [DllImport("user32.dll")]
    public static extern bool IsIconic(IntPtr hWnd);
    [DllImport("user32.dll")]
    public static extern IntPtr GetForegroundWindow();

    public static void ToggleOrFocus(long hwndLong) {
        IntPtr hWnd = new IntPtr(hwndLong);
        if (hWnd == IntPtr.Zero) return;
        if (IsIconic(hWnd)) {
            ShowWindow(hWnd, 9); // SW_RESTORE
            SetForegroundWindow(hWnd);
        } else {
            IntPtr fg = GetForegroundWindow();
            if (fg == hWnd) {
                ShowWindow(hWnd, 6); // SW_MINIMIZE
            } else {
                ShowWindow(hWnd, 5); // SW_SHOW
                SetForegroundWindow(hWnd);
            }
        }
    }
}
"@ -ErrorAction SilentlyContinue

$ignoredProcs = @('TextInputHost', 'ApplicationFrameHost', 'SystemSettings', 'electron', 'VNotch', 'MacOSDock', 'SearchHost', 'ShellExperienceHost', 'StartMenuExperienceHost')

function Get-DockState {
    $pwr = [System.Windows.Forms.SystemInformation]::PowerStatus
    $batPct = [Math]::Round($pwr.BatteryLifePercent * 100)
    if ($batPct -gt 100 -or $batPct -lt 0) { $batPct = 100 }
    $charging = ($pwr.PowerLineStatus -eq [System.Windows.Forms.PowerLineStatus]::Online)

    $winList = @()
    $procs = Get-Process | Where-Object { $_.MainWindowHandle -ne 0 -and $_.MainWindowTitle -ne "" }
    foreach ($p in $procs) {
        if ($ignoredProcs -contains $p.ProcessName) { continue }
        $winList += @{
            pid = $p.Id
            processName = $p.ProcessName
            windowTitle = $p.MainWindowTitle
            hwnd = [int64]$p.MainWindowHandle
        }
    }

    $payload = @{
        batteryPercent = $batPct
        isCharging = $charging
        windows = $winList
    }
    $json = $payload | ConvertTo-Json -Compress -Depth 3
    Write-Output "DOCK_JSON:$json"
}
`;

    worker.stdin.write(bootstrap + '\n');

    worker.stdout.on('data', (chunk: Buffer) => {
      this.stdoutBuffer += chunk.toString('utf8');
      const lines = this.stdoutBuffer.split(/\r?\n/);
      this.stdoutBuffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('DOCK_JSON:')) {
          this.handleWorkerJson(trimmed.slice('DOCK_JSON:'.length));
        }
      }
    });

    worker.on('exit', () => {
      this.psWorker = null;
    });
  }

  private requestPoll(): void {
    if (this.psWorker && this.psWorker.stdin.writable) {
      this.psWorker.stdin.write('Get-DockState\n');
    }
  }

  private handleWorkerJson(jsonStr: string): void {
    try {
      const data = JSON.parse(jsonStr) as WorkerPayload;
      this.battery = {
        percent: data.batteryPercent,
        isCharging: data.isCharging,
      };

      const winArray = Array.isArray(data.windows) ? data.windows : [];
      const hash = JSON.stringify(winArray.map((w) => `${w.pid}:${w.windowTitle}`));
      if (hash !== this.lastWindowsHash) {
        this.lastWindowsHash = hash;
        this.runningApps = winArray;
        this.onAppsChange(winArray);
      }

      this.onStatusChange(this.getSystemStatusSnapshot());
    } catch {
      // Ignore parse errors
    }
  }

  public async focusOrToggleWindow(_pid: number, hwnd: number): Promise<boolean> {
    if (!this.psWorker || !this.psWorker.stdin.writable) return false;
    this.psWorker.stdin.write(`[Win32DockHelper]::ToggleOrFocus(${hwnd})\n`);
    return true;
  }

  public async closeWindow(pid: number): Promise<boolean> {
    if (!this.psWorker || !this.psWorker.stdin.writable) return false;
    this.psWorker.stdin.write(
      `Stop-Process -Id ${pid} -ErrorAction SilentlyContinue; Get-DockState\n`
    );
    return true;
  }

  public stop(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    if (this.psWorker) {
      try {
        this.psWorker.kill();
      } catch {}
      this.psWorker = null;
    }
  }
}
