import React from 'react';
import { motion } from 'framer-motion';
import {
  BatteryCharging,
  Cpu,
  EyeOff,
  HardDrive,
  RotateCcw,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import { useDockStore } from '../store/useDockStore';

export const ControlCenter: React.FC = () => {
  const systemStatus = useDockStore((s) => s.systemStatus);
  const autoHide = useDockStore((s) => s.autoHide);
  const magnificationEnabled = useDockStore((s) => s.magnificationEnabled);
  const baseIconSize = useDockStore((s) => s.baseIconSize);

  const setAutoHide = useDockStore((s) => s.setAutoHide);
  const setMagnificationEnabled = useDockStore((s) => s.setMagnificationEnabled);
  const setBaseIconSize = useDockStore((s) => s.setBaseIconSize);
  const resetDefaultApps = useDockStore((s) => s.resetDefaultApps);
  const setActivePopover = useDockStore((s) => s.setActivePopover);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 18, scale: 0.94 }}
      transition={{ duration: 0.18 }}
      className="mb-3 w-[380px] rounded-3xl macos-dock-glass p-4 text-white"
    >
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/15">
        <span className="text-xs font-semibold text-zinc-100">
          macOS Dock Control Center
        </span>
        <button
          onClick={() => setActivePopover('none')}
          className="p-1 rounded-full hover:bg-white/15 text-zinc-300 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* System Metrics Row */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="rounded-2xl bg-white/10 p-2.5 flex flex-col">
          <div className="flex items-center justify-between text-[11px] text-zinc-300">
            <span>CPU</span>
            <Cpu className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <span className="text-base font-bold mt-1">{systemStatus.cpuPercent}%</span>
        </div>

        <div className="rounded-2xl bg-white/10 p-2.5 flex flex-col">
          <div className="flex items-center justify-between text-[11px] text-zinc-300">
            <span>RAM</span>
            <HardDrive className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <span className="text-base font-bold mt-1">{systemStatus.ramPercent}%</span>
        </div>

        <div className="rounded-2xl bg-white/10 p-2.5 flex flex-col">
          <div className="flex items-center justify-between text-[11px] text-zinc-300">
            <span>Battery</span>
            <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <span className="text-base font-bold mt-1">{systemStatus.batteryPercent}%</span>
        </div>
      </div>

      {/* Dock Toggles */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <button
          onClick={() => setMagnificationEnabled(!magnificationEnabled)}
          className={`p-2.5 rounded-2xl border flex items-center gap-2 text-left transition ${
            magnificationEnabled
              ? 'bg-sky-500/25 border-sky-400/40 text-white'
              : 'bg-white/5 border-white/10 text-zinc-400'
          }`}
        >
          <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
          <div>
            <div className="text-xs font-semibold">Magnification</div>
            <div className="text-[10px] opacity-80">
              {magnificationEnabled ? 'Aktif (macOS Curve)' : 'Nonaktif'}
            </div>
          </div>
        </button>

        <button
          onClick={() => setAutoHide(!autoHide)}
          className={`p-2.5 rounded-2xl border flex items-center gap-2 text-left transition ${
            autoHide
              ? 'bg-emerald-500/25 border-emerald-400/40 text-white'
              : 'bg-white/5 border-white/10 text-zinc-400'
          }`}
        >
          <EyeOff className="w-4 h-4 text-emerald-400 shrink-0" />
          <div>
            <div className="text-xs font-semibold">Auto-Hide Dock</div>
            <div className="text-[10px] opacity-80">
              {autoHide ? 'Sembunyi Otomatis' : 'Selalu Tampil'}
            </div>
          </div>
        </button>
      </div>

      {/* Icon Size Selector & Reset */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-zinc-300 text-[11px]">Ukuran:</span>
          {[44, 50, 56].map((sz) => (
            <button
              key={sz}
              onClick={() => setBaseIconSize(sz)}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition ${
                baseIconSize === sz
                  ? 'bg-white text-black'
                  : 'bg-white/10 text-zinc-300 hover:bg-white/20'
              }`}
            >
              {sz}px
            </button>
          ))}
        </div>

        <button
          onClick={resetDefaultApps}
          className="flex items-center gap-1 text-[11px] text-zinc-300 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10 transition"
          title="Reset Pinned Icons"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Icon</span>
        </button>
      </div>

      {/* Eco Memory Badge */}
      <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-between text-[11px] text-emerald-300">
        <span className="flex items-center gap-1">
          <Zap className="w-3.5 h-3.5" />
          Eco Memory Engine
        </span>
        <span className="font-mono font-semibold">Dock RAM: ~{systemStatus.appRamMB} MB</span>
      </div>
    </motion.div>
  );
};
