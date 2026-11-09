import React, { useRef, useState } from 'react';
import {
  motion,
  MotionValue,
  useSpring,
  useTransform,
} from 'framer-motion';
import { MacIconType } from '../shared/types';
import { MacAppIcon } from './MacAppIcon';

interface DockItemProps {
  mouseX: MotionValue<number>;
  baseSize: number;
  magnificationEnabled: boolean;
  label: string;
  iconType: MacIconType;
  isRunning?: boolean;
  onClick: () => void;
  onContextMenuAction?: () => void;
}

export const DockItem: React.FC<DockItemProps> = ({
  mouseX,
  baseSize,
  magnificationEnabled,
  label,
  iconType,
  isRunning = false,
  onClick,
  onContextMenuAction,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [bouncing, setBouncing] = useState(false);

  const maxSize = magnificationEnabled ? Math.round(baseSize * 1.54) : baseSize;

  // Compute horizontal distance from cursor to icon center without React re-renders
  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  // Parabolic magnification curve within [-140px, +140px]
  const sizeSync = useTransform(
    distance,
    [-145, -70, 0, 70, 145],
    [
      baseSize,
      Math.round(baseSize + (maxSize - baseSize) * 0.45),
      maxSize,
      Math.round(baseSize + (maxSize - baseSize) * 0.45),
      baseSize,
    ]
  );

  const size = useSpring(sizeSync, {
    mass: 0.1,
    stiffness: 190,
    damping: 14,
  });

  const handleClick = () => {
    setBouncing(true);
    setTimeout(() => setBouncing(false), 760);
    onClick();
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onContextMenuAction) onContextMenuAction();
  };

  return (
    <div className="relative flex flex-col items-center justify-end group">
      {/* macOS Frosted Tooltip Pill */}
      {hovered && (
        <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg macos-tooltip text-[12px] font-medium text-white whitespace-nowrap z-50 flex flex-col items-center">
          <span>{label}</span>
          <div className="w-2 h-2 rotate-45 bg-[#1c1d24] border-r border-b border-white/20 -mb-2 mt-0.5" />
        </div>
      )}

      {/* Icon Container with Parabolic Magnification & Bounce */}
      <motion.div
        ref={ref}
        style={{ width: size, height: size }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={handleClick}
        onContextMenu={handleRightClick}
        className={`relative cursor-pointer flex items-center justify-center transition-transform active:brightness-90 ${
          bouncing ? 'animate-macos-bounce' : ''
        }`}
      >
        <MacAppIcon iconType={iconType} label={label} />
      </motion.div>

      {/* Active Running Indicator Dot (macOS Glowing Dot beneath icon) */}
      <div className="h-2.5 flex items-center justify-center mt-1">
        {isRunning && (
          <span className="w-1 h-1 rounded-full bg-white/90 shadow-[0_0_6px_rgba(255,255,255,0.95)]" />
        )}
      </div>
    </div>
  );
};
