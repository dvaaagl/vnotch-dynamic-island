import React from 'react';
import {
  Disc3,
  Music2,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Tv,
  Globe,
} from 'lucide-react';
import { useIslandStore } from '../../store/useIslandStore';
import { AudioWaveform } from '../AudioWaveform';

export const MediaWidget: React.FC = () => {
  const media = useIslandStore((s) => s.media);
  const triggerMediaControl = useIslandStore((s) => s.triggerMediaControl);
  const loadDemoMedia = useIslandStore((s) => s.loadDemoMedia);
  const setMedia = useIslandStore((s) => s.setMedia);

  if (!media) {
    return (
      <div className="flex flex-col items-center justify-between h-full py-1 text-center">
        <div className="flex items-center gap-2 text-zinc-400 text-xs mt-1">
          <Disc3 className="w-4 h-4 text-zinc-500 animate-spin" style={{ animationDuration: '8s' }} />
          <span>Putar lagu/video di Spotify, YouTube, atau Browser</span>
        </div>

        <div className="flex items-center gap-2 my-auto">
          <button
            onClick={() => loadDemoMedia('spotify')}
            className="px-3 py-1.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-medium transition flex items-center gap-1.5"
          >
            <Music2 className="w-3.5 h-3.5" />
            Simulasi Spotify
          </button>
          <button
            onClick={() => loadDemoMedia('youtube')}
            className="px-3 py-1.5 rounded-full bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 text-xs font-medium transition flex items-center gap-1.5"
          >
            <Tv className="w-3.5 h-3.5" />
            Simulasi YouTube
          </button>
        </div>

        <p className="text-[10px] text-zinc-500">
          Otomatis mendeteksi Windows SMTC (Spotify, Chrome, Edge, Brave, VLC)
        </p>
      </div>
    );
  }

  const isSpotify = media.sourceType === 'spotify';
  const isYouTube = media.sourceType === 'youtube';
  const isDemo = media.appId.startsWith('demo-');

  const accentGradient = isSpotify
    ? 'from-emerald-500/30 via-emerald-900/10 to-transparent'
    : isYouTube
    ? 'from-red-500/30 via-red-900/10 to-transparent'
    : 'from-cyan-500/25 via-blue-900/10 to-transparent';

  const badgeBg = isSpotify
    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    : isYouTube
    ? 'bg-red-500/20 text-red-300 border-red-500/30'
    : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';

  return (
    <div className="relative flex flex-col justify-between h-full overflow-hidden">
      {/* Subtle ambient glow */}
      <div
        className={`pointer-events-none absolute -top-6 -left-6 w-40 h-40 rounded-full bg-gradient-to-br ${accentGradient} blur-2xl`}
      />

      {/* Top row: Artwork + Title/Artist + Waveform */}
      <div className="relative flex items-center gap-3.5">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 shadow-inner ${
            isSpotify
              ? 'bg-gradient-to-br from-emerald-600 to-zinc-900'
              : isYouTube
              ? 'bg-gradient-to-br from-red-600 to-zinc-900'
              : 'bg-gradient-to-br from-cyan-600 to-zinc-900'
          }`}
        >
          {isSpotify ? (
            <Music2 className="w-7 h-7 text-white/90" />
          ) : isYouTube ? (
            <Tv className="w-7 h-7 text-white/90" />
          ) : (
            <Globe className="w-7 h-7 text-white/90" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wider ${badgeBg}`}
            >
              {isSpotify ? 'Spotify' : isYouTube ? 'YouTube' : 'Media'}
            </span>
            {isDemo && (
              <button
                onClick={() => setMedia(null)}
                className="text-[10px] text-zinc-400 hover:text-white underline ml-1"
              >
                Reset Demo
              </button>
            )}
          </div>
          <h3 className="text-sm font-semibold text-white truncate">{media.title}</h3>
          <p className="text-xs text-zinc-400 truncate">{media.artist}</p>
        </div>

        <div className="px-2">
          <AudioWaveform isPlaying={media.isPlaying} sourceType={media.sourceType} size="md" />
        </div>
      </div>

      {/* Bottom row: Progress bar + Transport Controls */}
      <div className="relative flex items-center justify-between gap-4 pt-2 mt-1 border-t border-white/5">
        <div className="flex-1 flex flex-col gap-1">
          <div className="h-1 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isSpotify ? 'bg-emerald-400' : isYouTube ? 'bg-red-500' : 'bg-cyan-400'
              } ${media.isPlaying ? 'w-3/5' : 'w-2/5'}`}
            />
          </div>
          <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
            <span>{media.isPlaying ? 'LIVE' : 'PAUSED'}</span>
            <span>SMTC SYNC</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => triggerMediaControl('previous')}
            className="p-2 rounded-full hover:bg-white/10 text-zinc-300 hover:text-white transition active:scale-90"
            title="Previous Track"
          >
            <SkipBack className="w-4 h-4 fill-current" />
          </button>
          <button
            onClick={() => triggerMediaControl('play-pause')}
            className="p-2.5 rounded-full bg-white text-black hover:bg-zinc-200 transition active:scale-90 shadow-md"
            title={media.isPlaying ? 'Pause' : 'Play'}
          >
            {media.isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>
          <button
            onClick={() => triggerMediaControl('next')}
            className="p-2 rounded-full hover:bg-white/10 text-zinc-300 hover:text-white transition active:scale-90"
            title="Next Track"
          >
            <SkipForward className="w-4 h-4 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
};
