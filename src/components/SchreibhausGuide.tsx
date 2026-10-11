import React from 'react';
import { HouseFloor } from '../types';
import { speakText, playSound } from '../utils/audio';

interface SchreibhausGuideProps {
  char: string;
  activeFloors: HouseFloor[];
  className?: string;
  compact?: boolean;
}

export const SchreibhausGuide: React.FC<SchreibhausGuideProps> = ({
  char,
  activeFloors,
  className = '',
  compact = false,
}) => {
  const hasRoof = activeFloors.includes('roof');
  const hasLiving = activeFloors.includes('living');
  const hasCellar = activeFloors.includes('cellar');

  const handleFloorClick = (floor: HouseFloor) => {
    playSound.tap();
    if (floor === 'roof') {
      speakText('Das ist das Dach! Hier oben wohnen die großen Buchstaben wie das A und B und die mit langem Hals wie das b, d oder k.', 'de');
    } else if (floor === 'living') {
      speakText('Das ist das gemütliche Wohnzimmer! Hier wohnen die kleinen Buchstaben wie a, e, m, o und s.', 'de');
    } else if (floor === 'cellar') {
      speakText('Das ist der Keller! Buchstaben wie das g, j, p, q und y hängen ihre Beinchen hier hinunter.', 'de');
    }
  };

  return (
    <div className={`flex flex-col items-center select-none w-full ${className}`}>
      {/* SVG Schreibhaus mathematically matching 1:1:1 Anton App Lineatur */}
      <div className="relative w-full aspect-square max-w-[130px] sm:max-w-[140px] h-full flex flex-col justify-between">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full filter drop-shadow-sm"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="roofActive" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="livingActive" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="cellarActive" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>

          {/* Guidelines matching the canvas exactly */}
          {/* Dachlinie y=10 */}
          <line x1="0" y1="10" x2="100" y2="10" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />
          {/* Mittellinie y=38 (Trennlinie 1) */}
          <line x1="0" y1="38" x2="100" y2="38" stroke="#0284c7" strokeWidth="1.2" strokeDasharray="3 2" opacity="0.8" />
          {/* Grundlinie y=66 (Trennlinie 2) - Dicke durchgezogene Linie */}
          <line x1="0" y1="66" x2="100" y2="66" stroke="#0f172a" strokeWidth="2.2" opacity="0.95" />
          {/* Kellerlinie y=94 */}
          <line x1="0" y1="94" x2="100" y2="94" stroke="#818cf8" strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />

          {/* ==================================================== */}
          {/* 1. DACH (y = 10 bis y = 38) - genau 28 Einheiten     */}
          {/* ==================================================== */}
          <g
            onClick={() => handleFloorClick('roof')}
            className="cursor-pointer group"
          >
            {/* Chimney */}
            <rect x="70" y="11" width="10" height="15" fill="#b91c1c" />
            <rect x="68" y="10" width="14" height="3" fill="#991b1b" />

            {/* Roof Triangle */}
            <polygon
              points="50,10 15,38 85,38"
              fill={hasRoof ? 'url(#roofActive)' : '#fef3c7'}
              stroke="#b45309"
              strokeWidth="2.5"
              className="transition-colors duration-300 group-hover:brightness-105"
            />
            {/* Attic Window */}
            <circle cx="50" cy="24" r="6" fill="#ffffff" stroke="#b45309" strokeWidth="1.5" />
            <line x1="50" y1="18" x2="50" y2="30" stroke="#b45309" strokeWidth="1" />
            <line x1="44" y1="24" x2="56" y2="24" stroke="#b45309" strokeWidth="1" />

            {/* Label */}
            <text
              x="50"
              y="35"
              textAnchor="middle"
              fontSize="5.5"
              fontWeight="900"
              fill={hasRoof ? '#ffffff' : '#92400e'}
            >
              DACH
            </text>
          </g>

          {/* ==================================================== */}
          {/* 2. WOHNBEREICH (y = 38 bis y = 66) - genau 28 Einheiten */}
          {/* ==================================================== */}
          <g
            onClick={() => handleFloorClick('living')}
            className="cursor-pointer group"
          >
            {/* Living room body */}
            <rect
              x="18"
              y="38"
              width="64"
              height="28"
              fill={hasLiving ? 'url(#livingActive)' : '#ecfdf5'}
              stroke="#047857"
              strokeWidth="2.5"
              className="transition-colors duration-300 group-hover:brightness-105"
            />
            {/* Window */}
            <rect x="25" y="43" width="14" height="13" rx="2" fill="#ffffff" stroke="#047857" strokeWidth="1.2" />
            <line x1="32" y1="43" x2="32" y2="56" stroke="#047857" strokeWidth="0.8" />
            <line x1="25" y1="49.5" x2="39" y2="49.5" stroke="#047857" strokeWidth="0.8" />

            {/* Door */}
            <rect x="52" y="43" width="16" height="23" rx="2" fill="#d97706" stroke="#92400e" strokeWidth="1.2" />
            <circle cx="55" cy="54" r="1.2" fill="#fde68a" />

            {/* Label */}
            <text
              x="50"
              y="63"
              textAnchor="middle"
              fontSize="5"
              fontWeight="900"
              fill={hasLiving ? '#ffffff' : '#065f46'}
            >
              WOHNEN
            </text>
          </g>

          {/* ==================================================== */}
          {/* 3. KELLER (y = 66 bis y = 94) - genau 28 Einheiten   */}
          {/* ==================================================== */}
          <g
            onClick={() => handleFloorClick('cellar')}
            className="cursor-pointer group"
          >
            {/* Cellar foundation */}
            <rect
              x="20"
              y="66"
              width="60"
              height="28"
              fill={hasCellar ? 'url(#cellarActive)' : '#e0e7ff'}
              stroke="#4338ca"
              strokeWidth="2.5"
              className="transition-colors duration-300 group-hover:brightness-105"
            />
            {/* Masonry stone lines */}
            <line x1="20" y1="75" x2="80" y2="75" stroke="#4338ca" strokeWidth="0.8" strokeDasharray="6 3" />
            <line x1="20" y1="84" x2="80" y2="84" stroke="#4338ca" strokeWidth="0.8" strokeDasharray="4 4" />

            {/* Cellar window with bars */}
            <rect x="38" y="72" width="24" height="10" rx="1.5" fill="#312e81" />
            <line x1="44" y1="72" x2="44" y2="82" stroke="#c7d2fe" strokeWidth="1" />
            <line x1="50" y1="72" x2="50" y2="82" stroke="#c7d2fe" strokeWidth="1" />
            <line x1="56" y1="72" x2="56" y2="82" stroke="#c7d2fe" strokeWidth="1" />

            {/* Label */}
            <text
              x="50"
              y="91"
              textAnchor="middle"
              fontSize="5"
              fontWeight="900"
              fill={hasCellar ? '#ffffff' : '#3730a3'}
            >
              KELLER
            </text>
          </g>
        </svg>
      </div>

      {/* Explanatory text under house */}
      {!compact && (
        <div className="mt-1 text-center">
          <span className="text-[10px] font-semibold text-amber-950/80 leading-tight">
            „<strong className="text-amber-900">{char}</strong>“ wohnt in:{' '}
            {[
              hasRoof ? 'Dach' : null,
              hasLiving ? 'Wohnen' : null,
              hasCellar ? 'Keller' : null,
            ]
              .filter(Boolean)
              .join(' + ')}
          </span>
        </div>
      )}
    </div>
  );
};
