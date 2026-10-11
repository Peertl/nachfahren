import React from 'react';

interface ChildIllustrationProps {
  type: string;
  size?: number;
  className?: string;
  animated?: boolean;
}

export const ChildIllustration: React.FC<ChildIllustrationProps> = ({
  type,
  size = 180,
  className = '',
  animated = true,
}) => {
  const norm = type.toLowerCase();

  const renderIllustration = () => {
    switch (norm) {
      case 'cat':
      case 'katze':
        return (
          <svg viewBox="0 0 200 200" width={size} height={size} className={className}>
            <defs>
              <linearGradient id="catGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
            </defs>
            <path
              d="M 140 140 C 175 140 185 110 170 95 C 160 85 155 100 150 115"
              fill="none"
              stroke="#d97706"
              strokeWidth="12"
              strokeLinecap="round"
              className={animated ? 'origin-bottom animate-[pulse_2s_ease-in-out_infinite]' : ''}
            />
            <ellipse cx="100" cy="140" rx="55" ry="42" fill="url(#catGrad)" />
            <ellipse cx="100" cy="145" rx="26" ry="22" fill="#fef3c7" />
            <polygon points="55,85 70,35 95,75" fill="#f59e0b" />
            <polygon points="62,75 72,45 88,72" fill="#fca5a5" />
            <polygon points="145,85 130,35 105,75" fill="#f59e0b" />
            <polygon points="138,75 128,45 112,72" fill="#fca5a5" />
            <circle cx="100" cy="90" r="42" fill="url(#catGrad)" />
            <ellipse cx="78" cy="96" rx="9" ry="6" fill="#fca5a5" opacity="0.6" />
            <ellipse cx="122" cy="96" rx="9" ry="6" fill="#fca5a5" opacity="0.6" />
            <circle cx="82" cy="84" r="8" fill="#1e293b" />
            <circle cx="80" cy="81" r="3" fill="#ffffff" />
            <circle cx="118" cy="84" r="8" fill="#1e293b" />
            <circle cx="116" cy="81" r="3" fill="#ffffff" />
            <polygon points="96,93 104,93 100,98" fill="#f43f5e" />
            <path d="M 94 99 Q 100 106 100 99 Q 100 106 106 99" fill="none" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
            <line x1="60" y1="92" x2="40" y2="88" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="60" y1="98" x2="38" y2="100" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="140" y1="92" x2="160" y2="88" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="140" y1="98" x2="162" y2="100" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="80" cy="172" r="14" fill="#fef3c7" stroke="#d97706" strokeWidth="3" />
            <circle cx="120" cy="172" r="14" fill="#fef3c7" stroke="#d97706" strokeWidth="3" />
          </svg>
        );

      case 'dog':
      case 'hund':
        return (
          <svg viewBox="0 0 200 200" width={size} height={size} className={className}>
            <defs>
              <linearGradient id="dogGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
            <ellipse cx="100" cy="142" rx="54" ry="40" fill="url(#dogGrad)" />
            <path d="M 148 135 C 180 135 185 105 175 90" fill="none" stroke="#7c3aed" strokeWidth="12" strokeLinecap="round" />
            <path d="M 64 68 C 45 68 36 105 48 118 C 58 126 68 110 68 85" fill="#6d28d9" />
            <path d="M 136 68 C 155 68 164 105 152 118 C 142 126 132 110 132 85" fill="#6d28d9" />
            <circle cx="100" cy="88" r="42" fill="url(#dogGrad)" />
            <ellipse cx="100" cy="98" rx="22" ry="16" fill="#ede9fe" />
            <ellipse cx="100" cy="92" rx="10" ry="7" fill="#1e1b4b" />
            <circle cx="82" cy="78" r="7" fill="#1e1b4b" />
            <circle cx="80" cy="75" r="2.5" fill="#ffffff" />
            <circle cx="118" cy="78" r="7" fill="#1e1b4b" />
            <circle cx="116" cy="75" r="2.5" fill="#ffffff" />
            <path d="M 96 105 Q 100 120 106 118 Q 108 105 104 105" fill="#f43f5e" />
          </svg>
        );

      case 'koala':
        return (
          <svg viewBox="0 0 200 200" width={size} height={size} className={className}>
            <defs>
              <linearGradient id="koalaBody" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#64748b" />
              </linearGradient>
              <linearGradient id="koalaEars" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#cbd5e1" />
                <stop offset="100%" stopColor="#94a3b8" />
              </linearGradient>
            </defs>
            {/* Green Eucalyptus branch/leaves */}
            <path d="M 145 155 Q 165 140 180 148 Q 165 160 145 155 Z" fill="#22c55e" stroke="#15803d" strokeWidth="2" />
            <path d="M 155 135 Q 180 120 185 132 Q 170 142 155 135 Z" fill="#4ade80" stroke="#15803d" strokeWidth="2" />
            <line x1="130" y1="160" x2="185" y2="130" stroke="#15803d" strokeWidth="3" strokeLinecap="round" />

            {/* Koala Body */}
            <ellipse cx="100" cy="148" rx="46" ry="38" fill="url(#koalaBody)" />
            {/* Soft tummy patch */}
            <ellipse cx="100" cy="150" rx="28" ry="24" fill="#f8fafc" />

            {/* Big Fluffy Ears */}
            {/* Left Ear */}
            <circle cx="50" cy="75" r="28" fill="url(#koalaEars)" stroke="#475569" strokeWidth="3" />
            <circle cx="52" cy="76" r="17" fill="#fce7f3" />
            <circle cx="34" cy="72" r="7" fill="#f8fafc" />
            <circle cx="36" cy="84" r="6" fill="#f8fafc" />
            <circle cx="44" cy="62" r="7" fill="#f8fafc" />

            {/* Right Ear */}
            <circle cx="150" cy="75" r="28" fill="url(#koalaEars)" stroke="#475569" strokeWidth="3" />
            <circle cx="148" cy="76" r="17" fill="#fce7f3" />
            <circle cx="166" cy="72" r="7" fill="#f8fafc" />
            <circle cx="164" cy="84" r="6" fill="#f8fafc" />
            <circle cx="156" cy="62" r="7" fill="#f8fafc" />

            {/* Koala Head */}
            <ellipse cx="100" cy="98" rx="46" ry="40" fill="url(#koalaBody)" stroke="#475569" strokeWidth="3" />

            {/* Rosy Cheeks */}
            <ellipse cx="70" cy="108" rx="9" ry="6" fill="#f472b6" opacity="0.65" />
            <ellipse cx="130" cy="108" rx="9" ry="6" fill="#f472b6" opacity="0.65" />

            {/* Friendly Sparkly Eyes */}
            <ellipse cx="76" cy="90" rx="7" ry="8" fill="#0f172a" />
            <circle cx="74" cy="87" r="2.8" fill="#ffffff" />
            <circle cx="78" cy="92" r="1.2" fill="#ffffff" />

            <ellipse cx="124" cy="90" rx="7" ry="8" fill="#0f172a" />
            <circle cx="122" cy="87" r="2.8" fill="#ffffff" />
            <circle cx="126" cy="92" r="1.2" fill="#ffffff" />

            {/* Signature Big Rounded Koala Nose */}
            <ellipse cx="100" cy="104" rx="14" ry="19" fill="#1e293b" />
            <ellipse cx="98" cy="97" rx="5" ry="3" fill="#64748b" opacity="0.75" />

            {/* Sweet smiling mouth */}
            <path d="M 94 125 Q 100 130 106 125" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />

            {/* Front Paws */}
            <ellipse cx="78" cy="158" rx="10" ry="13" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
            <ellipse cx="122" cy="158" rx="10" ry="13" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
          </svg>
        );

      case 'sun':
      case 'sonne':
        return (
          <svg viewBox="0 0 200 200" width={size} height={size} className={className}>
            <defs>
              <linearGradient id="sunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fde047" />
                <stop offset="100%" stopColor="#eab308" />
              </linearGradient>
            </defs>
            <g className={animated ? 'origin-center animate-[spin_12s_linear_infinite]' : ''}>
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => (
                <line
                  key={deg}
                  x1="100"
                  y1="25"
                  x2="100"
                  y2="10"
                  stroke="#f59e0b"
                  strokeWidth="8"
                  strokeLinecap="round"
                  transform={`rotate(${deg} 100 100)`}
                />
              ))}
            </g>
            <circle cx="100" cy="100" r="58" fill="url(#sunGrad)" stroke="#f59e0b" strokeWidth="4" />
            <circle cx="72" cy="110" r="10" fill="#f87171" opacity="0.6" />
            <circle cx="128" cy="110" r="10" fill="#f87171" opacity="0.6" />
            <circle cx="82" cy="92" r="7" fill="#78350f" />
            <circle cx="80" cy="89" r="2.5" fill="#ffffff" />
            <circle cx="118" cy="92" r="7" fill="#78350f" />
            <circle cx="116" cy="89" r="2.5" fill="#ffffff" />
            <path d="M 85 108 Q 100 126 115 108" fill="none" stroke="#78350f" strokeWidth="5" strokeLinecap="round" />
          </svg>
        );

      case 'car':
      case 'auto':
        return (
          <svg viewBox="0 0 200 200" width={size} height={size} className={className}>
            <defs>
              <linearGradient id="carGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#b91c1c" />
              </linearGradient>
            </defs>
            <path d="M 50 110 L 72 70 L 128 70 L 150 110 Z" fill="#93c5fd" stroke="#1e293b" strokeWidth="4" />
            <line x1="100" y1="70" x2="100" y2="110" stroke="#1e293b" strokeWidth="4" />
            <rect x="25" y="105" width="150" height="42" rx="14" fill="url(#carGrad)" stroke="#7f1d1d" strokeWidth="4" />
            <circle cx="168" cy="118" r="8" fill="#fef08a" stroke="#ca8a04" strokeWidth="2" />
            <circle cx="32" cy="118" r="6" fill="#fca5a5" />
            <circle cx="65" cy="148" r="22" fill="#1e293b" />
            <circle cx="65" cy="148" r="10" fill="#94a3b8" />
            <circle cx="135" cy="148" r="22" fill="#1e293b" />
            <circle cx="135" cy="148" r="10" fill="#94a3b8" />
          </svg>
        );

      // --- VERBS ILLUSTRATIONS ---
      case 'run':
      case 'laufen':
        return (
          <svg viewBox="0 0 200 200" width={size} height={size} className={className}>
            <defs>
              <linearGradient id="runGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#ea580c" />
              </linearGradient>
            </defs>
            {/* Speed wind trails */}
            <path d="M 20 80 L 50 80" stroke="#fdba74" strokeWidth="4" strokeLinecap="round" />
            <path d="M 10 100 L 45 100" stroke="#fdba74" strokeWidth="5" strokeLinecap="round" />
            <path d="M 25 120 L 55 120" stroke="#fdba74" strokeWidth="4" strokeLinecap="round" />
            {/* Sneaker Shoe running */}
            <path
              d="M 50 130 C 50 110 70 95 110 95 C 130 95 145 115 170 120 C 180 122 185 135 175 145 C 160 152 70 152 50 130 Z"
              fill="url(#runGrad)"
              stroke="#9a3412"
              strokeWidth="4"
              className={animated ? 'animate-bounce-subtle' : ''}
            />
            {/* White shoe sole */}
            <path d="M 45 132 C 65 156 160 156 180 142 L 180 150 C 160 162 65 162 45 138 Z" fill="#ffffff" stroke="#9a3412" strokeWidth="3" />
            {/* Laces */}
            <line x1="100" y1="105" x2="115" y2="105" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
            <line x1="95" y1="115" x2="112" y2="115" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
            <line x1="90" y1="125" x2="110" y2="125" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
            {/* Star badge */}
            <circle cx="75" cy="120" r="10" fill="#fde047" />
          </svg>
        );

      case 'paint':
      case 'malen':
        return (
          <svg viewBox="0 0 200 200" width={size} height={size} className={className}>
            {/* Palette */}
            <path
              d="M 60 50 C 110 30 160 60 160 110 C 160 150 120 170 80 160 C 50 150 40 100 40 80 C 40 60 50 55 60 50 Z"
              fill="#fde68a"
              stroke="#b45309"
              strokeWidth="4"
            />
            {/* Palette hole */}
            <ellipse cx="68" cy="135" rx="10" ry="12" fill="#ffffff" stroke="#b45309" strokeWidth="3" />
            {/* Colorful paint blobs */}
            <circle cx="80" cy="70" r="10" fill="#ef4444" />
            <circle cx="115" cy="65" r="10" fill="#3b82f6" />
            <circle cx="140" cy="95" r="10" fill="#10b981" />
            <circle cx="130" cy="130" r="10" fill="#f59e0b" />
            <circle cx="95" cy="148" r="10" fill="#8b5cf6" />
            {/* Brush crossing */}
            <g transform="rotate(45 110 110)">
              <rect x="105" y="40" width="10" height="90" rx="3" fill="#854d0e" stroke="#451a03" strokeWidth="2" />
              <rect x="103" y="130" width="14" height="15" fill="#94a3b8" />
              <path d="M 103 145 C 103 165 117 165 117 145 Z" fill="#ec4899" stroke="#be185d" strokeWidth="2" />
            </g>
          </svg>
        );

      case 'sing':
      case 'singen':
        return (
          <svg viewBox="0 0 200 200" width={size} height={size} className={className}>
            {/* Musical notes floating */}
            <path d="M 140 40 L 165 30 L 165 60 L 140 70 Z" fill="#ec4899" />
            <circle cx="140" cy="70" r="7" fill="#ec4899" />
            <circle cx="165" cy="60" r="7" fill="#ec4899" />
            <path d="M 35 60 L 50 52 L 50 75 L 35 82 Z" fill="#a855f7" />
            <circle cx="35" cy="82" r="6" fill="#a855f7" />
            {/* Microphone head */}
            <rect x="80" y="50" width="40" height="60" rx="20" fill="#94a3b8" stroke="#334155" strokeWidth="4" />
            <line x1="80" y1="70" x2="120" y2="70" stroke="#475569" strokeWidth="2" />
            <line x1="80" y1="90" x2="120" y2="90" stroke="#475569" strokeWidth="2" />
            {/* Mic holder */}
            <path d="M 70 85 C 70 125 130 125 130 85" fill="none" stroke="#334155" strokeWidth="5" strokeLinecap="round" />
            <line x1="100" y1="125" x2="100" y2="155" stroke="#334155" strokeWidth="5" />
            <ellipse cx="100" cy="158" rx="24" ry="6" fill="#475569" />
          </svg>
        );

      case 'swim':
      case 'schwimmen':
        return (
          <svg viewBox="0 0 200 200" width={size} height={size} className={className}>
            {/* Water Waves */}
            <path d="M 20 120 Q 50 105 80 120 T 140 120 T 200 120" fill="none" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" />
            <path d="M 10 145 Q 40 130 70 145 T 130 145 T 190 145" fill="none" stroke="#0284c7" strokeWidth="6" strokeLinecap="round" />
            {/* Swimmer Head & Goggles */}
            <circle cx="100" cy="75" r="30" fill="#fde047" stroke="#ca8a04" strokeWidth="3" />
            {/* Goggles */}
            <rect x="80" y="68" width="18" height="12" rx="4" fill="#06b6d4" stroke="#0891b2" strokeWidth="2" />
            <rect x="102" y="68" width="18" height="12" rx="4" fill="#06b6d4" stroke="#0891b2" strokeWidth="2" />
            <line x1="98" y1="74" x2="102" y2="74" stroke="#0891b2" strokeWidth="3" />
            {/* Happy smile */}
            <path d="M 92 90 Q 100 98 108 90" fill="none" stroke="#713f12" strokeWidth="3" strokeLinecap="round" />
            {/* Water splash bubbles */}
            <circle cx="65" cy="95" r="5" fill="#bae6fd" />
            <circle cx="135" cy="90" r="6" fill="#bae6fd" />
          </svg>
        );

      case 'fly':
      case 'fliegen':
        return (
          <svg viewBox="0 0 200 200" width={size} height={size} className={className}>
            {/* Rocket ship flying up */}
            <g transform="rotate(25 100 100)">
              {/* Rocket body */}
              <path d="M 100 30 C 80 60 75 110 75 130 L 125 130 C 125 110 120 60 100 30 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="4" />
              {/* Window */}
              <circle cx="100" cy="80" r="14" fill="#bae6fd" stroke="#0284c7" strokeWidth="3" />
              {/* Fins */}
              <polygon points="75,110 50,135 75,130" fill="#3b82f6" />
              <polygon points="125,110 150,135 125,130" fill="#3b82f6" />
              {/* Rocket Flame */}
              <polygon points="85,130 100,165 115,130" fill="#facc15" />
              <polygon points="90,130 100,150 110,130" fill="#f97316" />
            </g>
          </svg>
        );

      // --- ADJECTIVES ILLUSTRATIONS ---
      case 'fast':
      case 'schnell':
        return (
          <svg viewBox="0 0 200 200" width={size} height={size} className={className}>
            {/* Lightning bolt with golden glow */}
            <polygon
              points="110,20 60,105 105,105 85,180 145,90 105,90"
              fill="#facc15"
              stroke="#ca8a04"
              strokeWidth="5"
              strokeLinejoin="round"
              className={animated ? 'animate-pulse' : ''}
            />
            {/* Speed lines */}
            <line x1="30" y1="60" x2="60" y2="60" stroke="#fde047" strokeWidth="4" strokeLinecap="round" />
            <line x1="20" y1="100" x2="50" y2="100" stroke="#fde047" strokeWidth="4" strokeLinecap="round" />
            <line x1="35" y1="140" x2="65" y2="140" stroke="#fde047" strokeWidth="4" strokeLinecap="round" />
          </svg>
        );

      case 'colorful':
      case 'bunt':
        return (
          <svg viewBox="0 0 200 200" width={size} height={size} className={className}>
            {/* Rainbow Arcs */}
            <path d="M 30 150 A 70 70 0 0 1 170 150" fill="none" stroke="#ef4444" strokeWidth="10" strokeLinecap="round" />
            <path d="M 42 150 A 58 58 0 0 1 158 150" fill="none" stroke="#f97316" strokeWidth="10" strokeLinecap="round" />
            <path d="M 54 150 A 46 46 0 0 1 146 150" fill="none" stroke="#eab308" strokeWidth="10" strokeLinecap="round" />
            <path d="M 66 150 A 34 34 0 0 1 134 150" fill="none" stroke="#22c55e" strokeWidth="10" strokeLinecap="round" />
            <path d="M 78 150 A 22 22 0 0 1 122 150" fill="none" stroke="#3b82f6" strokeWidth="10" strokeLinecap="round" />
            {/* Little clouds at ends */}
            <circle cx="35" cy="150" r="16" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />
            <circle cx="165" cy="150" r="16" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />
          </svg>
        );

      case 'strong':
      case 'stark':
        return (
          <svg viewBox="0 0 200 200" width={size} height={size} className={className}>
            {/* Flexing muscular arm */}
            <path
              d="M 50 140 C 60 100 85 90 100 110 C 115 80 150 90 145 125 C 140 150 110 160 50 155 Z"
              fill="#f59e0b"
              stroke="#b45309"
              strokeWidth="5"
            />
            {/* Bicep bump highlight */}
            <ellipse cx="120" cy="115" rx="14" ry="18" fill="#fbbf24" transform="rotate(-15 120 115)" />
            {/* Sparkles of power */}
            <polygon points="150,60 154,72 166,76 154,80 150,92 146,80 134,76 146,72" fill="#eab308" />
          </svg>
        );

      case 'star':
      case 'stern':
        return (
          <svg viewBox="0 0 200 200" width={size} height={size} className={className}>
            <polygon
              points="100,20 124,76 184,82 138,122 152,180 100,150 48,180 62,122 16,82 76,76"
              fill="#fbbf24"
              stroke="#d97706"
              strokeWidth="5"
              strokeLinejoin="round"
              className={animated ? 'animate-[pulse_2.5s_ease-in-out_infinite]' : ''}
            />
            <circle cx="84" cy="100" r="6" fill="#78350f" />
            <circle cx="116" cy="100" r="6" fill="#78350f" />
            <path d="M 90 114 Q 100 124 110 114" fill="none" stroke="#78350f" strokeWidth="4" strokeLinecap="round" />
          </svg>
        );

      case 'house':
      case 'haus':
        return (
          <svg viewBox="0 0 200 200" width={size} height={size} className={className}>
            <polygon points="100,45 35,95 165,95" fill="#ef4444" stroke="#b91c1c" strokeWidth="4" />
            <rect x="125" y="55" width="16" height="25" fill="#b91c1c" />
            <rect x="48" y="95" width="104" height="75" fill="#fef08a" stroke="#ca8a04" strokeWidth="4" />
            <rect x="85" y="125" width="30" height="45" rx="4" fill="#a16207" stroke="#713f12" strokeWidth="3" />
            <circle cx="108" cy="148" r="3" fill="#fef08a" />
            <rect x="60" y="108" width="20" height="20" fill="#93c5fd" stroke="#1e3a8a" strokeWidth="2" />
            <rect x="120" y="108" width="20" height="20" fill="#93c5fd" stroke="#1e3a8a" strokeWidth="2" />
          </svg>
        );

      case 'apple':
      case 'apfel':
        return (
          <svg viewBox="0 0 200 200" width={size} height={size} className={className}>
            {/* Stem & Leaf */}
            <path d="M 100 45 C 105 30 115 25 120 20" fill="none" stroke="#78350f" strokeWidth="5" strokeLinecap="round" />
            <path d="M 105 35 C 125 25 140 35 130 50 C 115 50 110 40 105 35 Z" fill="#22c55e" stroke="#15803d" strokeWidth="2" />
            {/* Apple body */}
            <path
              d="M 100 65 C 80 50 45 55 45 95 C 45 140 85 165 100 165 C 115 165 155 140 155 95 C 155 55 120 50 100 65 Z"
              fill="#ef4444"
              stroke="#b91c1c"
              strokeWidth="5"
            />
            {/* Shine */}
            <ellipse cx="70" cy="85" rx="8" ry="18" fill="#fca5a5" opacity="0.6" transform="rotate(-25 70 85)" />
            {/* Cute eyes & smile */}
            <circle cx="85" cy="105" r="4" fill="#7f1d1d" />
            <circle cx="115" cy="105" r="4" fill="#7f1d1d" />
            <path d="M 94 116 Q 100 122 106 116" fill="none" stroke="#7f1d1d" strokeWidth="3" strokeLinecap="round" />
          </svg>
        );

      case 'tree':
      case 'baum':
        return (
          <svg viewBox="0 0 200 200" width={size} height={size} className={className}>
            {/* Trunk */}
            <path d="M 88 120 L 88 165 C 88 170 80 175 75 175 L 125 175 C 120 175 112 170 112 165 L 112 120 Z" fill="#854d0e" stroke="#543007" strokeWidth="4" />
            {/* Crown */}
            <circle cx="75" cy="95" r="32" fill="#22c55e" />
            <circle cx="125" cy="95" r="32" fill="#22c55e" />
            <circle cx="100" cy="70" r="36" fill="#4ade80" />
            <circle cx="70" cy="120" r="26" fill="#16a34a" />
            <circle cx="130" cy="120" r="26" fill="#16a34a" />
            {/* Little apples on tree */}
            <circle cx="85" cy="80" r="5" fill="#ef4444" />
            <circle cx="118" cy="85" r="5" fill="#ef4444" />
            <circle cx="95" cy="115" r="5" fill="#ef4444" />
          </svg>
        );

      case 'flower':
      case 'blume':
        return (
          <svg viewBox="0 0 200 200" width={size} height={size} className={className}>
            {/* Stem & Leaves */}
            <path d="M 100 110 Q 100 145 100 175" fill="none" stroke="#16a34a" strokeWidth="6" strokeLinecap="round" />
            <ellipse cx="80" cy="145" rx="16" ry="8" fill="#22c55e" transform="rotate(-25 80 145)" />
            <ellipse cx="120" cy="135" rx="16" ry="8" fill="#22c55e" transform="rotate(25 120 135)" />
            {/* Petals */}
            {[0, 60, 120, 180, 240, 300].map(deg => (
              <circle
                key={deg}
                cx={100 + Math.cos((deg * Math.PI) / 180) * 32}
                cy={80 + Math.sin((deg * Math.PI) / 180) * 32}
                r="20"
                fill="#ec4899"
                stroke="#db2777"
                strokeWidth="2"
              />
            ))}
            {/* Flower Center */}
            <circle cx="100" cy="80" r="22" fill="#facc15" stroke="#ca8a04" strokeWidth="3" />
            <circle cx="93" cy="76" r="3" fill="#713f12" />
            <circle cx="107" cy="76" r="3" fill="#713f12" />
            <path d="M 94 85 Q 100 91 106 85" fill="none" stroke="#713f12" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        );

      case 'fish':
      case 'fisch':
        return (
          <svg viewBox="0 0 200 200" width={size} height={size} className={className}>
            {/* Tail */}
            <polygon points="50,100 20,70 25,100 20,130" fill="#38bdf8" stroke="#0284c7" strokeWidth="3" />
            {/* Body */}
            <ellipse cx="105" cy="100" rx="60" ry="38" fill="#0ea5e9" stroke="#0284c7" strokeWidth="4" />
            {/* Belly highlight */}
            <path d="M 65 108 C 85 130 130 130 150 108 Z" fill="#bae6fd" />
            {/* Fins */}
            <polygon points="100,62 115,45 125,62" fill="#38bdf8" />
            <polygon points="100,138 115,155 125,138" fill="#38bdf8" />
            {/* Eye */}
            <circle cx="138" cy="92" r="8" fill="#ffffff" stroke="#0369a1" strokeWidth="2" />
            <circle cx="140" cy="92" r="4" fill="#0f172a" />
            <circle cx="142" cy="90" r="1.5" fill="#ffffff" />
            {/* Smile */}
            <path d="M 152 104 Q 158 108 152 112" fill="none" stroke="#0369a1" strokeWidth="3" strokeLinecap="round" />
            {/* Bubbles */}
            <circle cx="170" cy="85" r="4" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1.5" />
            <circle cx="180" cy="75" r="6" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1.5" />
          </svg>
        );

      case 'ball':
        return (
          <svg viewBox="0 0 200 200" width={size} height={size} className={className}>
            <circle cx="100" cy="100" r="65" fill="#f8fafc" stroke="#334155" strokeWidth="5" />
            {/* Colorful soccer stripes */}
            <path d="M 100 35 C 70 65 70 135 100 165" fill="none" stroke="#ef4444" strokeWidth="8" />
            <path d="M 100 35 C 130 65 130 135 100 165" fill="none" stroke="#3b82f6" strokeWidth="8" />
            <line x1="35" y1="100" x2="165" y2="100" stroke="#facc15" strokeWidth="8" />
            <circle cx="100" cy="100" r="16" fill="#22c55e" stroke="#15803d" strokeWidth="3" />
          </svg>
        );

      case 'bird':
      case 'vogel':
        return (
          <svg viewBox="0 0 200 200" width={size} height={size} className={className}>
            {/* Legs */}
            <line x1="90" y1="145" x2="85" y2="170" stroke="#f97316" strokeWidth="3" />
            <line x1="110" y1="145" x2="115" y2="170" stroke="#f97316" strokeWidth="3" />
            {/* Body */}
            <ellipse cx="100" cy="115" rx="42" ry="34" fill="#38bdf8" stroke="#0284c7" strokeWidth="4" />
            {/* Belly */}
            <ellipse cx="108" cy="122" rx="26" ry="20" fill="#fef08a" />
            {/* Wing */}
            <ellipse cx="78" cy="112" rx="22" ry="14" fill="#0284c7" transform="rotate(-15 78 112)" />
            {/* Head */}
            <circle cx="130" cy="85" r="24" fill="#38bdf8" stroke="#0284c7" strokeWidth="3" />
            {/* Eye */}
            <circle cx="136" cy="80" r="5" fill="#0f172a" />
            <circle cx="138" cy="78" r="1.8" fill="#ffffff" />
            {/* Beak */}
            <polygon points="152,82 172,88 150,94" fill="#f97316" stroke="#c2410c" strokeWidth="1.5" />
          </svg>
        );

      case 'heart':
      case 'herz':
        return (
          <svg viewBox="0 0 200 200" width={size} height={size} className={className}>
            <path
              d="M 100 165 C 50 125 30 95 30 65 C 30 40 50 25 75 25 C 90 25 98 32 100 40 C 102 32 110 25 125 25 C 150 25 170 40 170 65 C 170 95 150 125 100 165 Z"
              fill="#f43f5e"
              stroke="#be123c"
              strokeWidth="5"
              className={animated ? 'animate-[pulse_1.8s_ease-in-out_infinite]' : ''}
            />
            {/* Highlight */}
            <ellipse cx="65" cy="55" rx="8" ry="16" fill="#fecdd3" opacity="0.6" transform="rotate(-25 65 55)" />
          </svg>
        );

      case 'moon':
      case 'mond':
        return (
          <svg viewBox="0 0 200 200" width={size} height={size} className={className}>
            <path
              d="M 130 30 C 70 35 40 85 45 135 C 50 160 70 175 90 175 C 55 140 60 80 130 30 Z"
              fill="#facc15"
              stroke="#ca8a04"
              strokeWidth="4"
            />
            {/* Sleeping face on moon */}
            <circle cx="72" cy="110" r="3" fill="#854d0e" />
            <path d="M 78 122 Q 84 126 88 120" fill="none" stroke="#854d0e" strokeWidth="2.5" strokeLinecap="round" />
            {/* Mini star */}
            <polygon points="140,95 143,103 151,104 145,110 147,118 140,114 133,118 135,110 129,104 137,103" fill="#fbbf24" />
          </svg>
        );

      case 'boat':
      case 'schiff':
      case 'boot':
        return (
          <svg viewBox="0 0 200 200" width={size} height={size} className={className}>
            {/* Waves */}
            <path d="M 20 145 Q 60 135 100 145 T 180 145" fill="none" stroke="#0284c7" strokeWidth="6" strokeLinecap="round" />
            {/* Boat hull */}
            <path d="M 40 120 L 160 120 L 140 150 L 60 150 Z" fill="#b45309" stroke="#78350f" strokeWidth="4" />
            {/* Mast */}
            <line x1="100" y1="40" x2="100" y2="120" stroke="#78350f" strokeWidth="4" />
            {/* Sail */}
            <polygon points="102,45 155,110 102,110" fill="#ffffff" stroke="#cbd5e1" strokeWidth="3" />
            <polygon points="98,55 60,110 98,110" fill="#f87171" stroke="#ef4444" strokeWidth="3" />
          </svg>
        );

      default: {
        const emojiMap: Record<string, string> = {
          koala: '🐨',
          maus: '🐭', mouse: '🐭',
          pferd: '🐴', horse: '🐴',
          elefant: '🐘', elephant: '🐘',
          lowe: '🦁', löwe: '🦁', lion: '🦁',
          tiger: '🐯',
          affe: '🐵', monkey: '🐵',
          panda: '🐼',
          pinguin: '🐧', penguin: '🐧',
          zebra: '🦓',
          giraffe: '🦒',
          fuchs: '🦊', fox: '🦊',
          wolf: '🐺',
          delfin: '🐬', delphin: '🐬', dolphin: '🐬',
          wal: '🐳', whale: '🐳',
          schildkroete: '🐢', schildkröte: '🐢', turtle: '🐢',
          krokodil: '🐊', crocodile: '🐊',
          ziege: '🐐', goat: '🐐',
          igel: '🦔', hedgehog: '🦔',
          biene: '🐝', bee: '🐝',
          marienkafer: '🐞', marienkäfer: '🐞', ladybug: '🐞',
          dino: '🦖', dinosaurier: '🦖',
          schneemann: '⛄', snowman: '⛄',
          zug: '🚂', train: '🚂',
          uhr: '⏰', clock: '⏰',
          ente: '🦆', duck: '🦆',
          schaf: '🐑', sheep: '🐑',
          schwein: '🐷', pig: '🐷',
          bar: '🐻', bär: '🐻', bear: '🐻',
          frosch: '🐸', frog: '🐸',
          hase: '🐰', rabbit: '🐰',
          kuh: '🐮', cow: '🐮',
          schmetterling: '🦋', butterfly: '🦋',
          krone: '👑', crown: '👑',
          wolke: '☁️', cloud: '☁️',
          regenbogen: '🌈', rainbow: '🌈',
          flugzeug: '✈️', airplane: '✈️',
          rakete: '🚀', rocket: '🚀',
          schiff: '🚢', ship: '🚢', boot: '⛵', boat: '⛵',
          fahrrad: '🚲', bike: '🚲',
          buch: '📖', book: '📖',
          eis: '🍦', ice: '🍦',
          apfel: '🍎', apple: '🍎',
          banane: '🍌', banana: '🍌',
          erdbeere: '🍓', strawberry: '🍓',
          kirsche: '🍒', cherry: '🍒',
          karotte: '🥕', carrot: '🥕',
          pizza: '🍕',
          kuchen: '🎂', cake: '🎂',
          sonnenblume: '🌻', sunflower: '🌻',
          pilz: '🍄', mushroom: '🍄',
          feuer: '🔥', fire: '🔥',
          wasser: '💧', water: '💧',
          berg: '🏔️', mountain: '🏔️',
          schloss: '🏰', castle: '🏰',
          geschenk: '🎁', gift: '🎁',
          ballon: '🎈', balloon: '🎈',
          sonne: '☀️', sun: '☀️',
          mond: '🌙', moon: '🌙',
          stern: '⭐', star: '⭐',
          auto: '🚗', car: '🚗',
        };
        const matchedEmoji = emojiMap[norm];
        if (matchedEmoji) {
          return (
            <svg viewBox="0 0 200 200" width={size} height={size} className={className}>
              <circle cx="100" cy="100" r="72" fill="#fef3c7" stroke="#f59e0b" strokeWidth="4" />
              <text x="100" y="108" fontSize="72" textAnchor="middle" dominantBaseline="central">
                {matchedEmoji}
              </text>
            </svg>
          );
        }

        // Friendly child letter emblem badge with stars
        const initial = type.trim() ? type.trim().charAt(0).toUpperCase() : '★';
        return (
          <svg viewBox="0 0 200 200" width={size} height={size} className={className}>
            <circle cx="100" cy="100" r="72" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="5" />
            <circle cx="100" cy="100" r="54" fill="#ffffff" />
            <text x="100" y="105" fontSize="56" fontWeight="900" fill="#0284c7" textAnchor="middle" dominantBaseline="central" fontFamily="sans-serif">
              {initial}
            </text>
            <polygon points="100,28 104,38 114,39 106,47 109,57 100,52 91,57 94,47 86,39 96,38" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
            <polygon points="155,75 158,82 165,83 160,88 162,95 155,92 148,95 150,88 145,83 152,82" fill="#fbbf24" />
            <polygon points="45,125 48,132 55,133 50,138 52,145 45,142 38,145 40,138 35,133 42,132" fill="#fbbf24" />
          </svg>
        );
      }
    }
  };

  return (
    <div className="flex items-center justify-center p-2 transition-transform duration-300">
      {renderIllustration()}
    </div>
  );
};
