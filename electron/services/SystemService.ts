import os from 'os';
import { SystemStatsData, PollingMode } from '../../src/shared/types';

interface CpuTimesSnapshot {
  idle: number;
  total: number;
}

export class SystemService {
  private prevCpuSnapshot: CpuTimesSnapshot;
  private timer: NodeJS.Timeout | null = null;
  private pollingMode: PollingMode = 'idle';
  private batteryState = {
    hasBattery: true,
    percent: 100,
    isCharging: true,
  };
  private onUpdateCallback: (stats: SystemStatsData) => void;

  constructor(onUpdate: (stats: SystemStatsData) => void) {
    this.onUpdateCallback = onUpdate;
    this.prevCpuSnapshot = this.takeCpuSnapshot();
  }

  private takeCpuSnapshot(): CpuTimesSnapshot {
    const cpus = os.cpus();
    let idle = 0;
    let total = 0;
    for (let i = 0; i < cpus.length; i++) {
      const times = cpus[i].times;
      idle += times.idle;
      total += times.user + times.nice + times.sys + times.irq + times.idle;
    }
    return { idle, total };
  }

  public updateBatteryFromBridge(percent: number, isCharging: boolean, hasBattery = true): void {
    this.batteryState = {
      hasBattery,
      percent: Math.max(0, Math.min(100, Math.round(percent))),
      isCharging,
    };
  }

  public setChargingStatus(isCharging: boolean): void {
    this.batteryState.isCharging = isCharging;
    this.emitNow();
  }

  public getSnapshot(): SystemStatsData {
    const currentCpu = this.takeCpuSnapshot();
    const idleDiff = currentCpu.idle - this.prevCpuSnapshot.idle;
    const totalDiff = currentCpu.total - this.prevCpuSnapshot.total;
    this.prevCpuSnapshot = currentCpu;

    const cpuUsagePercent =
      totalDiff > 0 ? Math.max(1, Math.min(100, Math.round((1 - idleDiff / totalDiff) * 100))) : 2;

    const totalMemBytes = os.totalmem();
    const freeMemBytes = os.freemem();
    const usedMemBytes = totalMemBytes - freeMemBytes;

    const ramTotalGB = Math.round((totalMemBytes / (1024 ** 3)) * 10) / 10;
    const ramUsedGB = Math.round((usedMemBytes / (1024 ** 3)) * 10) / 10;
    const ramUsagePercent = Math.round((usedMemBytes / totalMemBytes) * 100);

    const appRamMB = Math.round(process.memoryUsage().rss / (1024 * 1024));

    return {
      cpuUsagePercent,
      ramUsagePercent,
      ramUsedGB,
      ramTotalGB,
      appRamMB,
      battery: { ...this.batteryState },
      timestamp: Date.now(),
    };
  }

  public emitNow(): void {
    this.onUpdateCallback(this.getSnapshot());
  }

  public setPollingMode(mode: PollingMode): void {
    if (this.pollingMode === mode && this.timer) return;
    this.pollingMode = mode;
    this.restartLoop();
  }

  public start(): void {
    this.restartLoop();
  }

  private restartLoop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    // Adaptive Polling: 1.5s when Expanded/Active, 10s when Compact/Idle to save CPU & RAM
    const intervalMs = this.pollingMode === 'active' ? 1500 : 10000;
    this.timer = setInterval(() => {
      this.emitNow();
    }, intervalMs);
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
