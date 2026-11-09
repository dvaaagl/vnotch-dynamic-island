import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useDockStore } from '../store/useDockStore';
import { MacAppIcon } from './MacAppIcon';
import { DockAppItem } from '../shared/types';

export const LaunchpadModal: React.FC = () => {
  const pinnedApps = useDockStore((s) => s.pinnedApps);
  const setActivePopover = useDockStore((s) => s.setActivePopover);

  const launchable = pinnedApps.filter((a) => a.id !== 'launchpad');

  const handleLaunch = (item: DockAppItem) => {
    window.dockAPI?.launchApp(item);
    setActivePopover('none');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 18, scale: 0.94 }}
      transition={{ duration: 0.18 }}
      className="mb-3 w-[480px] rounded-3xl macos-dock-glass p-4 text-white"
    >
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/15">
        <div>
          <h3 className="text-xs font-semibold tracking-wide text-zinc-100">
            macOS Launchpad • Quick Applications
          </h3>
          <p className="text-[10px] text-zinc-400">
            Klik ikon untuk membuka atau tarik file .exe ke Dock untuk menyematkan
          </p>
        </div>
        <button
          onClick={() => setActivePopover('none')}
          className="p-1 rounded-full hover:bg-white/15 text-zinc-300 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {launchable.map((item) => (
          <button
            key={item.id}
            onClick={() => handleLaunch(item)}
            className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-white/10 transition group"
          >
            <div className="w-11 h-11 group-hover:scale-105 transition-transform">
              <MacAppIcon iconType={item.iconType} label={item.name} />
            </div>
            <span className="text-[11px] text-zinc-200 truncate w-full text-center">
              {item.name.split(' ')[0]}
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  );
};
