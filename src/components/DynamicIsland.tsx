import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  BatteryCharging,
  BellRing,
  Clock,
  FolderKanban,
  Music2,
  Pause,
  Play,
  SkipForward,
  Sparkles,
  Timer,
  Tv,
} from 'lucide-react';
import { useIslandStore } from '../store/useIslandStore';
import { AudioWaveform } from './AudioWaveform';
import { MediaWidget } from './widgets/MediaWidget';
import { SystemWidget } from './widgets/SystemWidget';
import { formatSeconds, TimerWeatherWidget } from './widgets/TimerWeatherWidget';
import { FileShelfWidget } from './widgets/FileShelfWidget';
import { IslandTab, ShelfFileItem } from '../shared/types';

const SPRING_TRANSITION = {
  type: 'spring' as const,
  stiffness: 380,
  damping: 28,
  mass: 0.8,
};

export const DynamicIsland: React.FC = () => {
  const mode = useIslandStore((s) => s.mode);
  const activeTab = useIslandStore((s) => s.activeTab);
  const media = useIslandStore((s) => s.media);
  const system = useIslandStore((s) => s.system);
  const shelfFiles = useIslandStore((s) => s.shelfFiles);
  const activeAlert = useIslandStore((s) => s.activeAlert);
  const timerRemainingSec = useIslandStore((s) => s.timerRemainingSec);

  const setMode = useIslandStore((s) => s.setMode);
  const setActiveTab = useIslandStore((s) => s.setActiveTab);
  const triggerMediaControl = useIslandStore((s) => s.triggerMediaControl);
  const addShelfFiles = useIslandStore((s) => s.addShelfFiles);
  const dismissAlert = useIslandStore((s) => s.dismissAlert);

  const [clockText, setClockText] = useState(() =>
    new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  );

  const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const expandHoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setClockText(
        new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      );
    }, 15000);
    return () => clearInterval(id);
  }, []);

  // Calculate dynamic dimensions based on state & live activities
  const getDimensions = () => {
    if (mode === 'expanded') {
      return { width: 460, height: 215, borderRadius: 34 };
    }
    if (mode === 'alert') {
      return { width: 330, height: 58, borderRadius: 29 };
    }
    if (mode === 'peek') {
      return { width: 315, height: 52, borderRadius: 26 };
    }
    // Compact mode sizes
    if (media && timerRemainingSec > 0) {
      return { width: 275, height: 36, borderRadius: 20 };
    }
    if (media || timerRemainingSec > 0) {
      return { width: 230, height: 36, borderRadius: 20 };
    }
    return { width: 184, height: 36, borderRadius: 20 };
  };

  const dims = getDimensions();

  const handleMouseEnter = () => {
    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }
    window.vnotchAPI?.setIgnoreMouseEvents(false);

    if (mode === 'compact') {
      setMode('peek');
      expandHoverTimerRef.current = setTimeout(() => {
        setMode('expanded');
      }, 420);
    }
  };

  const handleMouseLeave = () => {
    if (expandHoverTimerRef.current) {
      clearTimeout(expandHoverTimerRef.current);
      expandHoverTimerRef.current = null;
    }

    collapseTimerRef.current = setTimeout(() => {
      setMode('compact');
      window.vnotchAPI?.setIgnoreMouseEvents(true);
    }, 260);
  };

  const handleIslandClick = () => {
    if (expandHoverTimerRef.current) {
      clearTimeout(expandHoverTimerRef.current);
      expandHoverTimerRef.current = null;
    }
    if (mode === 'alert') {
      dismissAlert();
      setMode('expanded');
      return;
    }
    if (mode !== 'expanded') {
      setMode('expanded');
    }
  };

  const handleDragEnterGlobal = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    window.vnotchAPI?.setIgnoreMouseEvents(false);
    setActiveTab('shelf');
    setMode('expanded');
  };

  const handleDropGlobal = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      const mapped: ShelfFileItem[] = droppedFiles.map((f) => {
        const electronFile = f as File & { path?: string };
        const ext = f.name.includes('.') ? f.name.split('.').pop() || 'file' : 'file';
        return {
          id: `${f.name}-${f.size}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: f.name,
          path: electronFile.path || f.name,
          sizeBytes: f.size,
          extension: ext.toUpperCase(),
          addedAt: Date.now(),
        };
      });
      addShelfFiles(mapped);
      setActiveTab('shelf');
      setMode('expanded');
    }
  };

  const tabs: { id: IslandTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'media', label: 'Media', icon: <Music2 className="w-3.5 h-3.5" /> },
    { id: 'system', label: 'System', icon: <Activity className="w-3.5 h-3.5" /> },
    { id: 'timer', label: 'Timer', icon: <Clock className="w-3.5 h-3.5" /> },
    {
      id: 'shelf',
      label: 'Shelf',
      icon: <FolderKanban className="w-3.5 h-3.5" />,
      badge: shelfFiles.length > 0 ? shelfFiles.length : undefined,
    },
  ];

  return (
    <div
      className="w-full h-full flex justify-center items-start pt-1.5"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDropGlobal}
    >
      <motion.div
        layout
        initial={false}
        animate={{
          width: dims.width,
          height: dims.height,
          borderRadius: dims.borderRadius,
        }}
        transition={SPRING_TRANSITION}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleIslandClick}
        onDragEnter={handleDragEnterGlobal}
        className="relative bg-[#070709]/95 border border-white/[0.13] shadow-[0_14px_38px_rgba(0,0,0,0.75)] text-white overflow-hidden cursor-pointer"
        style={{
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Top lens camera hardware dot (iPhone Notch Aesthetic) */}
        {mode === 'compact' && !media && timerRemainingSec === 0 && (
          <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#11131a] border border-white/10 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-indigo-500/50" />
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* ================================================================
              1. COMPACT MODE (Ultra-Lightweight DOM: < 12 elements)
             ================================================================ */}
          {mode === 'compact' && (
            <motion.div
              key="compact"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.14 }}
              className="w-full h-full px-3.5 flex items-center justify-between gap-2"
            >
              {/* Left side of Compact Island */}
              {media ? (
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                      media.sourceType === 'spotify'
                        ? 'bg-emerald-500/25 text-emerald-400'
                        : media.sourceType === 'youtube'
                        ? 'bg-red-500/25 text-red-400'
                        : 'bg-cyan-500/25 text-cyan-400'
                    }`}
                  >
                    {media.sourceType === 'youtube' ? (
                      <Tv className="w-3 h-3" />
                    ) : (
                      <Music2 className="w-3 h-3" />
                    )}
                  </div>
                  <span className="text-xs font-medium text-zinc-100 truncate max-w-[115px]">
                    {media.title}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold tracking-tight text-zinc-200">
                    {clockText}
                  </span>
                </div>
              )}

              {/* Right side of Compact Island */}
              <div className="flex items-center gap-2.5 shrink-0">
                {timerRemainingSec > 0 && (
                  <div className="flex items-center gap-1 text-orange-400 font-mono text-xs font-semibold">
                    <Timer className="w-3 h-3" />
                    <span>{formatSeconds(timerRemainingSec)}</span>
                  </div>
                )}

                {media ? (
                  <AudioWaveform
                    isPlaying={media.isPlaying}
                    sourceType={media.sourceType}
                    size="sm"
                  />
                ) : (
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-300">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        system.battery.isCharging ? 'bg-emerald-400' : 'bg-cyan-400'
                      }`}
                    />
                    <span className="font-mono">{system.battery.percent}%</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ================================================================
              2. PEEK MODE (Quick Hover Preview)
             ================================================================ */}
          {mode === 'peek' && (
            <motion.div
              key="peek"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.14 }}
              className="w-full h-full px-4 flex items-center justify-between gap-3"
            >
              {media ? (
                <>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        media.sourceType === 'spotify'
                          ? 'bg-emerald-500/25 text-emerald-300'
                          : media.sourceType === 'youtube'
                          ? 'bg-red-500/25 text-red-300'
                          : 'bg-cyan-500/25 text-cyan-300'
                      }`}
                    >
                      <Music2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{media.title}</p>
                      <p className="text-[10px] text-zinc-400 truncate">{media.artist}</p>
                    </div>
                  </div>
                  <div
                    className="flex items-center gap-1.5 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => triggerMediaControl('play-pause')}
                      className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition"
                    >
                      {media.isPlaying ? (
                        <Pause className="w-3.5 h-3.5" />
                      ) : (
                        <Play className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => triggerMediaControl('next')}
                      className="p-1.5 rounded-full hover:bg-white/15 text-zinc-300 transition"
                    >
                      <SkipForward className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <div>
                      <p className="text-xs font-semibold text-white">VNotch Dynamic Island</p>
                      <p className="text-[10px] text-zinc-400">
                        CPU {system.cpuUsagePercent}% • RAM {system.ramUsagePercent}% • Bat{' '}
                        {system.battery.percent}%
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-zinc-300">
                    Buka Panel
                  </span>
                </>
              )}
            </motion.div>
          )}

          {/* ================================================================
              3. ALERT / HUD TOAST MODE (Charger, Track Change, Timer Done)
             ================================================================ */}
          {mode === 'alert' && activeAlert && (
            <motion.div
              key="alert"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16 }}
              className="w-full h-full px-4 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: `${activeAlert.accentColor || '#22c55e'}25`,
                    color: activeAlert.accentColor || '#22c55e',
                  }}
                >
                  {activeAlert.type === 'battery-charging' ? (
                    <BatteryCharging className="w-5 h-5" />
                  ) : (
                    <BellRing className="w-5 h-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{activeAlert.title}</p>
                  {activeAlert.subtitle && (
                    <p className="text-[11px] text-zinc-300 truncate">{activeAlert.subtitle}</p>
                  )}
                </div>
              </div>
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
                style={{
                  backgroundColor: `${activeAlert.accentColor || '#22c55e'}20`,
                  color: activeAlert.accentColor || '#22c55e',
                }}
              >
                LIVE
              </span>
            </motion.div>
          )}

          {/* ================================================================
              4. EXPANDED MODE (Full Control Center - Unmounted when collapsed!)
             ================================================================ */}
          {mode === 'expanded' && (
            <motion.div
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full h-full p-4 flex flex-col justify-between cursor-default"
            >
              {/* Top Navigation Bar */}
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5 mb-2.5">
                <div className="flex items-center gap-1">
                  {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition ${
                          isActive
                            ? 'bg-white text-black shadow-sm'
                            : 'text-zinc-400 hover:text-white hover:bg-white/[0.07]'
                        }`}
                      >
                        {tab.icon}
                        <span>{tab.label}</span>
                        {tab.badge !== undefined && (
                          <span
                            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                              isActive ? 'bg-black text-white' : 'bg-indigo-500 text-white'
                            }`}
                          >
                            {tab.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono pr-1">
                  <span>{clockText}</span>
                </div>
              </div>

              {/* Active Widget Body (Only 1 active tab mounted at a time to save RAM!) */}
              <div className="flex-1 min-h-0">
                {activeTab === 'media' && <MediaWidget />}
                {activeTab === 'system' && <SystemWidget />}
                {activeTab === 'timer' && <TimerWeatherWidget />}
                {activeTab === 'shelf' && <FileShelfWidget />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
