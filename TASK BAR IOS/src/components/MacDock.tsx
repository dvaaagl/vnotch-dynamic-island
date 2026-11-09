import React, { useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue } from 'framer-motion';
import { useDockStore } from '../store/useDockStore';
import { DockItem } from './DockItem';
import { LaunchpadModal } from './LaunchpadModal';
import { ControlCenter } from './ControlCenter';
import { DockAppItem, RunningWindowInfo } from '../shared/types';

export const MacDock: React.FC = () => {
  const mouseX = useMotionValue(Infinity);

  const pinnedApps = useDockStore((s) => s.pinnedApps);
  const runningApps = useDockStore((s) => s.runningApps);
  const autoHide = useDockStore((s) => s.autoHide);
  const magnificationEnabled = useDockStore((s) => s.magnificationEnabled);
  const baseIconSize = useDockStore((s) => s.baseIconSize);
  const activePopover = useDockStore((s) => s.activePopover);

  const setActivePopover = useDockStore((s) => s.setActivePopover);
  const addCustomPinnedApp = useDockStore((s) => s.addCustomPinnedApp);
  const removePinnedApp = useDockStore((s) => s.removePinnedApp);

  const [isHidden, setIsHidden] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Match running Windows processes to pinned items
  const findMatchingRunningWindow = (item: DockAppItem): RunningWindowInfo | undefined => {
    if (!item.processKeywords || item.processKeywords.length === 0) return undefined;
    return runningApps.find((win) => {
      const lowerProc = win.processName.toLowerCase();
      return item.processKeywords!.some((kw) => lowerProc.includes(kw.toLowerCase()));
    });
  };

  // Extra unpinned running Windows apps (up to 4) for the middle Dock section
  const unpinnedRunningApps = runningApps
    .filter((win) => {
      const lowerProc = win.processName.toLowerCase();
      return !pinnedApps.some(
        (pin) =>
          pin.processKeywords &&
          pin.processKeywords.some((kw) => lowerProc.includes(kw.toLowerCase()))
      );
    })
    .slice(0, 4);

  const handleMouseEnterArea = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    setIsHidden(false);
    window.dockAPI?.setIgnoreMouseEvents(false);
  };

  const handleMouseLeaveArea = () => {
    mouseX.set(Infinity);
    hideTimerRef.current = setTimeout(() => {
      if (activePopover === 'none') {
        if (autoHide) setIsHidden(true);
        window.dockAPI?.setIgnoreMouseEvents(true);
      }
    }, 300);
  };

  const handlePinnedClick = (item: DockAppItem) => {
    if (item.id === 'launchpad') {
      setActivePopover('launchpad');
      return;
    }
    const runningMatch = findMatchingRunningWindow(item);
    if (runningMatch) {
      window.dockAPI?.focusOrToggleWindow(runningMatch.pid, runningMatch.hwnd);
    } else {
      window.dockAPI?.launchApp(item);
    }
  };

  const handleDropToPin = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    for (const f of files) {
      const electronFile = f as File & { path?: string };
      if (!electronFile.path) continue;
      const cleanName = f.name.replace(/\.(exe|lnk|url)$/i, '');
      addCustomPinnedApp({
        id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: cleanName,
        iconType: 'custom',
        command: electronFile.path,
        processKeywords: [cleanName.toLowerCase()],
        isPinned: true,
      });
    }
  };

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-end pb-3 relative"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDropToPin}
    >
      {/* Bottom 6px Edge Sensor when Auto-Hide is active */}
      {autoHide && isHidden && (
        <div
          onMouseEnter={handleMouseEnterArea}
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[520px] h-2 bg-white/10 hover:bg-sky-400/40 rounded-t-full transition cursor-pointer z-50"
        />
      )}

      {/* Interactive Area Wrapper */}
      <div
        onMouseEnter={handleMouseEnterArea}
        onMouseLeave={handleMouseLeaveArea}
        className="flex flex-col items-center justify-end"
      >
        {/* Popover Modals (Launchpad / Control Center) */}
        <AnimatePresence mode="wait">
          {activePopover === 'launchpad' && <LaunchpadModal key="launchpad" />}
          {activePopover === 'control' && <ControlCenter key="control" />}
        </AnimatePresence>

        {/* Floating macOS Dock Shelf */}
        <motion.div
          animate={{
            y: autoHide && isHidden ? 95 : 0,
            opacity: autoHide && isHidden ? 0 : 1,
          }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          onMouseMove={(e) => mouseX.set(e.pageX)}
          onMouseLeave={() => mouseX.set(Infinity)}
          className="macos-dock-glass rounded-[26px] px-3.5 pt-2.5 pb-1.5 flex items-end gap-2.5"
        >
          {/* 1. LEFT SECTION: Authentic macOS Pinned Icons */}
          {pinnedApps.map((item) => {
            const matchedWin = findMatchingRunningWindow(item);
            return (
              <DockItem
                key={item.id}
                mouseX={mouseX}
                baseSize={baseIconSize}
                magnificationEnabled={magnificationEnabled}
                label={matchedWin ? `${item.name} — ${matchedWin.windowTitle}` : item.name}
                iconType={item.iconType}
                isRunning={Boolean(matchedWin)}
                onClick={() => handlePinnedClick(item)}
                onContextMenuAction={() => {
                  if (item.iconType === 'custom') {
                    removePinnedApp(item.id);
                  }
                }}
              />
            );
          })}

          {/* 2. MIDDLE SECTION: Active Unpinned Windows Apps */}
          {unpinnedRunningApps.length > 0 && (
            <>
              <div className="w-[1px] h-10 bg-white/20 mx-0.5 self-center rounded-full" />
              {unpinnedRunningApps.map((win) => (
                <DockItem
                  key={win.pid}
                  mouseX={mouseX}
                  baseSize={baseIconSize}
                  magnificationEnabled={magnificationEnabled}
                  label={`${win.processName} — ${win.windowTitle}`}
                  iconType="custom"
                  isRunning={true}
                  onClick={() => window.dockAPI?.focusOrToggleWindow(win.pid, win.hwnd)}
                  onContextMenuAction={() => window.dockAPI?.closeWindow(win.pid)}
                />
              ))}
            </>
          )}

          {/* 3. RIGHT SECTION: Stacks (Downloads), Control Center, & Trash Bin */}
          <div className="w-[1px] h-10 bg-white/20 mx-0.5 self-center rounded-full" />

          <DockItem
            mouseX={mouseX}
            baseSize={baseIconSize}
            magnificationEnabled={magnificationEnabled}
            label="Downloads Folder"
            iconType="downloads"
            onClick={() => window.dockAPI?.openSpecialFolder('downloads')}
          />

          <DockItem
            mouseX={mouseX}
            baseSize={baseIconSize}
            magnificationEnabled={magnificationEnabled}
            label="Dock Control Center"
            iconType="control"
            isRunning={activePopover === 'control'}
            onClick={() => setActivePopover('control')}
          />

          <DockItem
            mouseX={mouseX}
            baseSize={baseIconSize}
            magnificationEnabled={magnificationEnabled}
            label="Trash (Recycle Bin)"
            iconType="trash"
            onClick={() => window.dockAPI?.openSpecialFolder('recyclebin')}
          />
        </motion.div>
      </div>
    </div>
  );
};
