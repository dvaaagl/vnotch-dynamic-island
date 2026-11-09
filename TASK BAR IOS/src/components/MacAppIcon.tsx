import React from 'react';
import { MacIconType } from '../shared/types';

interface MacAppIconProps {
  iconType: MacIconType;
  label?: string;
}

export const MacAppIcon: React.FC<MacAppIconProps> = React.memo(({ iconType, label = 'App' }) => {
  const squircleBase =
    'w-full h-full rounded-[22.5%] relative overflow-hidden flex items-center justify-center shadow-[0_6px_14px_rgba(0,0,0,0.42),inset_0_1px_1px_rgba(255,255,255,0.45)] select-none';

  switch (iconType) {
    // 1. Authentic macOS Finder Icon (Two-tone Blue Smiling Face)
    case 'finder':
      return (
        <div
          className={squircleBase}
          style={{
            background: 'linear-gradient(180deg, #2596ff 0%, #126be3 100%)',
          }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Right half light blue face */}
            <path
              d="M52 0 H100 V100 H52 C52 72 44 58 44 48 C44 36 52 24 52 0 Z"
              fill="#b5dfff"
            />
            {/* Nose & center division line */}
            <path
              d="M53 0 C53 26 44 36 44 51 L55 51 C55 68 53 84 53 100"
              fill="none"
              stroke="#143a66"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Left Eye */}
            <rect x="25" y="27" width="5.5" height="12" rx="2.75" fill="#143a66" />
            {/* Right Eye */}
            <rect x="70" y="27" width="5.5" height="12" rx="2.75" fill="#143a66" />
            {/* Iconic Finder Smile */}
            <path
              d="M23 65 C36 81 65 81 78 65"
              fill="none"
              stroke="#143a66"
              strokeWidth="4.2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      );

    // 2. Authentic macOS Launchpad Icon (Colorful 3x3 App Grid on Frosted Silver)
    case 'launchpad':
      return (
        <div
          className={squircleBase}
          style={{
            background: 'linear-gradient(145deg, #3c4252 0%, #1c1f29 100%)',
          }}
        >
          <div className="grid grid-cols-3 gap-[10%] w-[64%] h-[64%]">
            <span className="rounded-[26%] bg-gradient-to-br from-sky-400 to-blue-600 shadow-sm" />
            <span className="rounded-[26%] bg-gradient-to-br from-emerald-400 to-green-600 shadow-sm" />
            <span className="rounded-[26%] bg-gradient-to-br from-amber-300 to-orange-500 shadow-sm" />
            <span className="rounded-[26%] bg-gradient-to-br from-pink-400 to-rose-600 shadow-sm" />
            <span className="rounded-[26%] bg-gradient-to-br from-purple-400 to-indigo-600 shadow-sm" />
            <span className="rounded-[26%] bg-gradient-to-br from-cyan-300 to-teal-500 shadow-sm" />
            <span className="rounded-[26%] bg-gradient-to-br from-red-400 to-red-600 shadow-sm" />
            <span className="rounded-[26%] bg-gradient-to-br from-yellow-300 to-amber-500 shadow-sm" />
            <span className="rounded-[26%] bg-gradient-to-br from-blue-400 to-indigo-500 shadow-sm" />
          </div>
        </div>
      );

    // 3. Authentic macOS Safari Icon (White Rim + Blue Compass + Red/White Needle)
    case 'safari':
      return (
        <div
          className={squircleBase}
          style={{
            background: 'linear-gradient(180deg, #ffffff 0%, #dcdcdc 100%)',
          }}
        >
          <svg viewBox="0 0 100 100" className="w-[86%] h-[86%]">
            <defs>
              <linearGradient id="safariBlue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#28b8ff" />
                <stop offset="100%" stopColor="#0062e6" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="46" fill="url(#safariBlue)" />
            {/* Compass degree ticks */}
            <circle
              cx="50"
              cy="50"
              r="39"
              fill="none"
              stroke="rgba(255,255,255,0.65)"
              strokeWidth="3"
              strokeDasharray="2 5.5"
            />
            {/* Tilted Compass Needle */}
            <g transform="rotate(45 50 50)">
              <polygon points="50,12 56,50 44,50" fill="#ff3b30" />
              <polygon points="50,88 56,50 44,50" fill="#ffffff" />
              <circle cx="50" cy="50" r="3.5" fill="#d1d5db" />
            </g>
          </svg>
        </div>
      );

    // 4. Authentic macOS Messages Icon (Apple Green + 3D White Speech Bubble)
    case 'messages':
      return (
        <div
          className={squircleBase}
          style={{
            background: 'linear-gradient(180deg, #52e56b 0%, #17b334 100%)',
          }}
        >
          <svg viewBox="0 0 100 100" className="w-[74%] h-[74%] drop-shadow">
            <path
              d="M50 18 C28 18 12 31.5 12 48.5 C12 57.5 17 65.5 25.5 71 C24.5 76.5 20.5 82 20.5 82 C27.5 82 34 78.5 38 76 C41.8 77 45.8 77.5 50 77.5 C72 77.5 88 64 88 47.5 C88 31 72 18 50 18 Z"
              fill="#ffffff"
            />
          </svg>
        </div>
      );

    // 5. Authentic macOS Mail Icon (Sky Blue Gradient + White Envelope)
    case 'mail':
      return (
        <div
          className={squircleBase}
          style={{
            background: 'linear-gradient(180deg, #1cc8ff 0%, #0d6efd 100%)',
          }}
        >
          <svg viewBox="0 0 100 100" className="w-[72%] h-[72%] drop-shadow">
            <rect x="10" y="22" width="80" height="56" rx="8" fill="#ffffff" />
            <path
              d="M12 25 L50 54 L88 25"
              fill="none"
              stroke="#1c88f5"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M13 75 L39 50 M87 75 L61 50"
              stroke="#cfe4ff"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      );

    // 6. Authentic macOS Photos Icon (White Squircle + 8-Petal Rainbow Flower)
    case 'photos':
      return (
        <div
          className={squircleBase}
          style={{
            background: 'linear-gradient(180deg, #ffffff 0%, #ededf2 100%)',
          }}
        >
          <svg viewBox="0 0 100 100" className="w-[82%] h-[82%]">
            <g transform="translate(50,50)" opacity="0.88">
              <ellipse rx="11" ry="22" cy="-16" fill="#ff9500" transform="rotate(0)" />
              <ellipse rx="11" ry="22" cy="-16" fill="#ffcc00" transform="rotate(45)" />
              <ellipse rx="11" ry="22" cy="-16" fill="#34c759" transform="rotate(90)" />
              <ellipse rx="11" ry="22" cy="-16" fill="#00c7be" transform="rotate(135)" />
              <ellipse rx="11" ry="22" cy="-16" fill="#007aff" transform="rotate(180)" />
              <ellipse rx="11" ry="22" cy="-16" fill="#5856d6" transform="rotate(225)" />
              <ellipse rx="11" ry="22" cy="-16" fill="#af52de" transform="rotate(270)" />
              <ellipse rx="11" ry="22" cy="-16" fill="#ff2d55" transform="rotate(315)" />
            </g>
          </svg>
        </div>
      );

    // 7. Authentic macOS Apple Music Icon (Coral Red Gradient + Beamed Note)
    case 'music':
      return (
        <div
          className={squircleBase}
          style={{
            background: 'linear-gradient(180deg, #ff5369 0%, #f92246 100%)',
          }}
        >
          <svg viewBox="0 0 100 100" className="w-[68%] h-[68%] drop-shadow">
            <path
              d="M38 69 V27 L78 19 V61"
              fill="none"
              stroke="#ffffff"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M38 38 L78 30" stroke="#ffffff" strokeWidth="7" />
            <circle cx="29" cy="70" r="11" fill="#ffffff" />
            <circle cx="69" cy="62" r="11" fill="#ffffff" />
          </svg>
        </div>
      );

    // 8. VS Code / Developer Icon (macOS Squircle Style)
    case 'code':
      return (
        <div
          className={squircleBase}
          style={{
            background: 'linear-gradient(180deg, #ffffff 0%, #e4eef8 100%)',
          }}
        >
          <svg viewBox="0 0 100 100" className="w-[74%] h-[74%] drop-shadow">
            <path
              d="M71 14 L86 21 V79 L71 86 L34 55 L19 67 L12 63 V37 L19 33 L34 45 Z"
              fill="#007acc"
            />
            <polygon points="71,14 71,86 38,50" fill="#1f9cf0" />
          </svg>
        </div>
      );

    // 9. Authentic macOS Terminal Icon (Obsidian Black + Silver Frame + >_)
    case 'terminal':
      return (
        <div
          className={squircleBase}
          style={{
            background: 'linear-gradient(180deg, #3a3d45 0%, #15171c 100%)',
          }}
        >
          <div className="w-[86%] h-[86%] rounded-[18%] bg-[#101216] border border-white/15 p-2 flex items-start">
            <span className="text-white font-mono font-bold text-xs tracking-tighter leading-none mt-1 ml-1">
              &gt;_
            </span>
          </div>
        </div>
      );

    // 10. Authentic macOS System Settings Icon (Metallic Brushed Steel + Precision Gears)
    case 'settings':
      return (
        <div
          className={squircleBase}
          style={{
            background: 'linear-gradient(180deg, #b8bec9 0%, #6e7582 100%)',
          }}
        >
          <svg viewBox="0 0 100 100" className="w-[78%] h-[78%] drop-shadow">
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="#3b4048"
              stroke="#d8dde6"
              strokeWidth="5"
            />
            <circle
              cx="50"
              cy="50"
              r="27"
              fill="none"
              stroke="#9da5b4"
              strokeWidth="6"
              strokeDasharray="7 5"
            />
            <line x1="50" y1="14" x2="50" y2="86" stroke="#d8dde6" strokeWidth="5" />
            <line x1="14" y1="50" x2="86" y2="50" stroke="#d8dde6" strokeWidth="5" />
            <circle cx="50" cy="50" r="11" fill="#d8dde6" />
          </svg>
        </div>
      );

    // 11. Authentic macOS Downloads Folder Stack Icon
    case 'downloads':
      return (
        <div
          className={squircleBase}
          style={{
            background: 'linear-gradient(180deg, #62c7ff 0%, #1982f8 100%)',
          }}
        >
          <svg viewBox="0 0 100 100" className="w-[78%] h-[78%]">
            <path
              d="M10 24 C10 19 14 16 19 16 H39 L47 25 H81 C86 25 90 29 90 34 V78 C90 83 86 86 81 86 H19 C14 86 10 83 10 78 Z"
              fill="#a3dfff"
              opacity="0.45"
            />
            <rect x="10" y="30" width="80" height="55" rx="9" fill="#ffffff" opacity="0.22" />
            <path
              d="M50 38 V66 M38 55 L50 67 L62 55"
              fill="none"
              stroke="#ffffff"
              strokeWidth="6.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      );

    // 12. Authentic macOS Control Center Icon (Dual Switches)
    case 'control':
      return (
        <div
          className={squircleBase}
          style={{
            background: 'linear-gradient(180deg, #4b5563 0%, #1f2937 100%)',
          }}
        >
          <svg viewBox="0 0 100 100" className="w-[72%] h-[72%]">
            <rect x="14" y="22" width="72" height="24" rx="12" fill="rgba(255,255,255,0.25)" />
            <circle cx="68" cy="34" r="10" fill="#ffffff" />
            <rect x="14" y="54" width="72" height="24" rx="12" fill="#38bdf8" />
            <circle cx="32" cy="66" r="10" fill="#ffffff" />
          </svg>
        </div>
      );

    // 13. Authentic macOS Trash Bin Icon (Silver Mesh Cylinder)
    case 'trash':
      return (
        <div
          className={squircleBase}
          style={{
            background: 'linear-gradient(180deg, #e5e9f0 0%, #9aa3b2 100%)',
          }}
        >
          <svg viewBox="0 0 100 100" className="w-[74%] h-[74%]">
            <ellipse cx="50" cy="22" rx="30" ry="7" fill="#5c6470" />
            <path
              d="M20 22 L26 82 C26 86 37 89 50 89 C63 89 74 86 74 82 L80 22 Z"
              fill="rgba(255,255,255,0.55)"
              stroke="#6b7280"
              strokeWidth="3"
            />
            <line x1="36" y1="30" x2="39" y2="83" stroke="#6b7280" strokeWidth="2.5" />
            <line x1="50" y1="31" x2="50" y2="85" stroke="#6b7280" strokeWidth="2.5" />
            <line x1="64" y1="30" x2="61" y2="83" stroke="#6b7280" strokeWidth="2.5" />
          </svg>
        </div>
      );

    // 14. Custom / Active Running Windows App Squircle Icon
    default: {
      const initials = label.slice(0, 2).toUpperCase();
      return (
        <div
          className={squircleBase}
          style={{
            background: 'linear-gradient(145deg, #6366f1 0%, #3b82f6 50%, #1d4ed8 100%)',
          }}
        >
          <span className="text-white font-bold text-sm tracking-tight drop-shadow">
            {initials}
          </span>
        </div>
      );
    }
  }
});
