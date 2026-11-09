import React from 'react';
import { BatteryCharging, Battery, Cpu, HardDrive, Zap } from 'lucide-react';
import { useIslandStore } from '../../store/useIslandStore';

export const SystemWidget: React.FC = () => {
  const system = useIslandStore((s) => s.system);

  const cpuColor =
    system.cpuUsagePercent > 80
      ? 'bg-red-500'
      : system.cpuUsagePercent > 50
      ? 'bg-amber-400'
      : 'bg-cyan-400';

  const ramColor =
    system.ramUsagePercent > 85
      ? 'bg-red-500'
      : system.ramUsagePercent > 65
      ? 'bg-amber-400'
      : 'bg-purple-400';

  const batColor = system.battery.isCharging
    ? 'bg-emerald-400'
    : system.battery.percent <= 20
    ? 'bg-red-500'
    : 'bg-green-400';

  return (
    <div className="flex flex-col justify-between h-full gap-2">
      {/* 3 Metric Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* CPU Card */}
        <div className="rounded-2xl bg-white/[0.05] border border-white/[0.08] p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-medium">CPU</span>
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="my-1.5">
            <span className="text-xl font-bold text-white">{system.cpuUsagePercent}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${cpuColor}`}
              style={{ width: `${system.cpuUsagePercent}%` }}
            />
          </div>
        </div>

        {/* RAM Card */}
        <div className="rounded-2xl bg-white/[0.05] border border-white/[0.08] p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-medium">RAM</span>
            <HardDrive className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="my-1">
            <span className="text-xl font-bold text-white">{system.ramUsagePercent}%</span>
            <span className="block text-[10px] text-zinc-400">
              {system.ramUsedGB}/{system.ramTotalGB} GB
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${ramColor}`}
              style={{ width: `${system.ramUsagePercent}%` }}
            />
          </div>
        </div>

        {/* Battery Card */}
        <div className="rounded-2xl bg-white/[0.05] border border-white/[0.08] p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-medium">Power</span>
            {system.battery.isCharging ? (
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Battery className="w-3.5 h-3.5 text-green-400" />
            )}
          </div>
          <div className="my-1">
            <span className="text-xl font-bold text-white">{system.battery.percent}%</span>
            <span className="block text-[10px] text-emerald-400">
              {system.battery.isCharging ? 'Charging AC' : 'On Battery'}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${batColor}`}
              style={{ width: `${system.battery.percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Low-RAM Optimization Status Footer */}
      <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px]">
        <div className="flex items-center gap-1.5 text-emerald-300">
          <Zap className="w-3.5 h-3.5" />
          <span>Eco Memory Mode Aktif (Zero-Spawn)</span>
        </div>
        <span className="font-mono text-emerald-400 font-semibold">
          VNotch RAM: ~{system.appRamMB} MB
        </span>
      </div>
    </div>
  );
};
