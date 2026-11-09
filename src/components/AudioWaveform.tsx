import React from 'react';
import { MediaSessionData } from '../shared/types';

interface AudioWaveformProps {
  isPlaying: boolean;
  sourceType?: MediaSessionData['sourceType'];
  size?: 'sm' | 'md';
}

export const AudioWaveform: React.FC<AudioWaveformProps> = React.memo(
  ({ isPlaying, sourceType = 'unknown', size = 'sm' }) => {
    const colorClass =
      sourceType === 'spotify'
        ? 'bg-emerald-400'
        : sourceType === 'youtube'
        ? 'bg-red-500'
        : 'bg-cyan-400';

    const heightClass = size === 'sm' ? 'h-3.5' : 'h-5';
    const barWidth = size === 'sm' ? 'w-[2.5px]' : 'w-[3px]';

    return (
      <div className={`flex items-center gap-[2.5px] ${heightClass}`} aria-hidden="true">
        <span
          className={`${barWidth} h-full rounded-full ${colorClass} wave-bar ${
            isPlaying ? 'wave-playing-1' : 'scale-y-[0.25]'
          }`}
        />
        <span
          className={`${barWidth} h-full rounded-full ${colorClass} wave-bar ${
            isPlaying ? 'wave-playing-2' : 'scale-y-[0.35]'
          }`}
        />
        <span
          className={`${barWidth} h-full rounded-full ${colorClass} wave-bar ${
            isPlaying ? 'wave-playing-3' : 'scale-y-[0.25]'
          }`}
        />
        <span
          className={`${barWidth} h-full rounded-full ${colorClass} wave-bar ${
            isPlaying ? 'wave-playing-4' : 'scale-y-[0.3]'
          }`}
        />
      </div>
    );
  }
);
