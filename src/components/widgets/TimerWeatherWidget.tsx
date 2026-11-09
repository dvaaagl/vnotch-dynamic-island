import React, { useState, useEffect } from 'react';
import { CloudSun, Pause, Play, RotateCcw, Timer } from 'lucide-react';
import { useIslandStore } from '../../store/useIslandStore';

export function formatSeconds(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const TimerWeatherWidget: React.FC = () => {
  const timerRemainingSec = useIslandStore((s) => s.timerRemainingSec);
  const timerRunning = useIslandStore((s) => s.timerRunning);
  const startTimer = useIslandStore((s) => s.startTimer);
  const toggleTimerPause = useIslandStore((s) => s.toggleTimerPause);
  const resetTimer = useIslandStore((s) => s.resetTimer);

  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(id);
  }, []);

  const presets = [
    { label: '1m', sec: 60 },
    { label: '5m', sec: 300 },
    { label: '15m', sec: 900 },
    { label: '25m', sec: 1500 },
  ];

  const timeStr = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const dateStr = now.toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <div className="grid grid-cols-12 gap-3 h-full">
      {/* Left: Live Activity Timer */}
      <div className="col-span-7 rounded-2xl bg-white/[0.05] border border-white/[0.08] p-3 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-orange-400 text-xs font-medium">
            <Timer className="w-3.5 h-3.5" />
            <span>Live Timer</span>
          </div>
          {timerRemainingSec > 0 && (
            <div className="flex items-center gap-1">
              <button
                onClick={toggleTimerPause}
                className="p-1.5 rounded-full bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 transition"
                title={timerRunning ? 'Pause' : 'Resume'}
              >
                {timerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </button>
              <button
                onClick={resetTimer}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 transition"
                title="Reset"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        <div className="my-auto">
          <span className="text-2xl font-mono font-bold text-white tracking-wider">
            {timerRemainingSec > 0 ? formatSeconds(timerRemainingSec) : '00:00'}
          </span>
          <p className="text-[10px] text-zinc-400">
            {timerRemainingSec > 0
              ? 'Tetap tampil di Compact Mode'
              : 'Pilih durasi hitung mundur:'}
          </p>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => startTimer(p.sec)}
              className="py-1 rounded-lg bg-white/10 hover:bg-orange-500/30 hover:text-orange-200 text-zinc-300 text-xs font-medium transition"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Right: Clock & Weather Card */}
      <div className="col-span-5 rounded-2xl bg-gradient-to-br from-sky-500/15 via-indigo-500/10 to-transparent border border-white/[0.08] p-3 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-sky-300 font-medium">{dateStr}</span>
          <CloudSun className="w-4 h-4 text-amber-300" />
        </div>

        <div>
          <div className="text-2xl font-bold text-white tracking-tight">{timeStr}</div>
          <div className="text-[11px] text-zinc-300 mt-0.5">29°C • Cerah Berawan</div>
        </div>

        <div className="text-[10px] text-zinc-400 flex items-center justify-between border-t border-white/10 pt-1.5">
          <span>Humidity 68%</span>
          <span className="text-emerald-400">UV Normal</span>
        </div>
      </div>
    </div>
  );
};
