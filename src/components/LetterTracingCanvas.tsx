import React, { useState, useRef, useEffect } from 'react';
import { Volume2, RotateCcw, HelpCircle, Settings, Home, Sparkles } from 'lucide-react';
import { LetterData, LetterStroke, StrokePoint, SupportedLanguage, HouseFloor } from '../types';
import { strokeStorage } from '../utils/strokeStorage';
import { playSound, speakText, isSpeaking } from '../utils/audio';

interface LetterTracingCanvasProps {
  char: string;
  onLetterCompleted: () => void;
  lang: SupportedLanguage;
  onOpenEditor?: () => void;
  onPickNewWord?: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
}

export const LetterTracingCanvas: React.FC<LetterTracingCanvasProps> = ({
  char,
  onLetterCompleted,
  lang,
  onOpenEditor,
  onPickNewWord,
}) => {
  const [letterData, setLetterData] = useState<LetterData>(strokeStorage.getLetter(char));
  const [currentStrokeIdx, setCurrentStrokeIdx] = useState(0);
  const [completedStrokes, setCompletedStrokes] = useState<number[]>([]);
  const [drawnPath, setDrawnPath] = useState<StrokePoint[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentProgressIdx, setCurrentProgressIdx] = useState(0);
  const [sampledPoints, setSampledPoints] = useState<StrokePoint[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showDemoAnimation, setShowDemoAnimation] = useState(false);
  const [demoProgress, setDemoProgress] = useState(0);

  const containerRef = useRef<SVGSVGElement | null>(null);
  const pathSamplerRef = useRef<SVGPathElement | null>(null);

  // Reload letter data whenever char changes
  useEffect(() => {
    const data = strokeStorage.getLetter(char);
    setLetterData(data);
    setCurrentStrokeIdx(0);
    setCompletedStrokes([]);
    setDrawnPath([]);
    setIsDrawing(false);
    setCurrentProgressIdx(0);
    setParticles([]);
  }, [char]);

  // Read letter aloud only if no speech is currently playing (e.g. word spoken)
  useEffect(() => {
    if (isSpeaking()) {
      return;
    }
    // Small timeout to give any just-triggered word speech a tick to register
    const timer = setTimeout(() => {
      if (!isSpeaking()) {
        speakLetter();
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [char]);

  const speakLetter = () => {
    speakText(char, lang);
  };

  const activeStroke: LetterStroke | undefined = letterData.strokes[currentStrokeIdx];

  // Mathematical curve sampling:
  // Samples 20-40 points along the TRUE mathematical SVG curve of the active stroke
  // This guarantees the child CANNOT cut corners or bypass curves like the hook of 't'
  useEffect(() => {
    if (!activeStroke) {
      setSampledPoints([]);
      return;
    }

    const sampleFromDom = () => {
      if (pathSamplerRef.current) {
        try {
          const pathEl = pathSamplerRef.current;
          const totalLen = pathEl.getTotalLength();
          if (totalLen > 0) {
            const sampleCount = Math.max(20, Math.min(40, Math.round(totalLen / 2)));
            const pts: StrokePoint[] = [];
            for (let i = 0; i <= sampleCount; i++) {
              const pt = pathEl.getPointAtLength((i / sampleCount) * totalLen);
              pts.push({ x: pt.x, y: pt.y });
            }
            setSampledPoints(pts);
            setCurrentProgressIdx(0);
            return true;
          }
        } catch (err) {
          console.warn('Path sampling error, using fallback:', err);
        }
      }
      return false;
    };

    // First try DOM sampling
    if (!sampleFromDom()) {
      // Immediate fallback from checkpoints
      const fallback = [
        activeStroke.start,
        ...(activeStroke.checkpoints || []),
        activeStroke.end,
      ];
      setSampledPoints(fallback);
      setCurrentProgressIdx(0);

      // Re-sample on next animation frame once SVG path is rendered
      const frameId = requestAnimationFrame(() => {
        sampleFromDom();
      });
      return () => cancelAnimationFrame(frameId);
    }
  }, [activeStroke, currentStrokeIdx]);

  // Compute exact position on the curve for the demo animation dot ("Zeig mir den Strich")
  const getPointOnActiveStroke = (progress: number): StrokePoint => {
    if (pathSamplerRef.current) {
      try {
        const pathEl = pathSamplerRef.current;
        const totalLen = pathEl.getTotalLength();
        if (totalLen > 0) {
          const clampedProg = Math.max(0, Math.min(1, progress));
          const pt = pathEl.getPointAtLength(clampedProg * totalLen);
          return { x: pt.x, y: pt.y };
        }
      } catch {
        // fallback to sampled points below
      }
    }

    if (sampledPoints && sampledPoints.length > 0) {
      const clampedProg = Math.max(0, Math.min(1, progress));
      const rawIdx = clampedProg * (sampledPoints.length - 1);
      const low = Math.floor(rawIdx);
      const high = Math.min(sampledPoints.length - 1, Math.ceil(rawIdx));
      if (low === high) return sampledPoints[low];
      const frac = rawIdx - low;
      return {
        x: sampledPoints[low].x + (sampledPoints[high].x - sampledPoints[low].x) * frac,
        y: sampledPoints[low].y + (sampledPoints[high].y - sampledPoints[low].y) * frac,
      };
    }

    if (activeStroke) {
      return {
        x: activeStroke.start.x + (activeStroke.end.x - activeStroke.start.x) * progress,
        y: activeStroke.start.y + (activeStroke.end.y - activeStroke.start.y) * progress,
      };
    }

    return { x: 50, y: 50 };
  };

  // Coordinate mapping for unified SVG viewBox: 0 0 160 100
  // Left 0..44 = Anton App Schreibhaus
  // Right 48..148 = Writing Notebook Canvas (Letter coordinates 0..100 map directly to 48..148)
  const CANVAS_OFFSET_X = 48;
  const CANVAS_WIDTH = 100;

  const getCoordinates = (e: React.PointerEvent<SVGSVGElement>): StrokePoint | null => {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    const rawX = ((e.clientX - rect.left) / rect.width) * 160;
    const rawY = ((e.clientY - rect.top) / rect.height) * 100;

    const letterX = rawX - CANVAS_OFFSET_X;
    const letterY = rawY;

    return {
      x: Math.max(0, Math.min(CANVAS_WIDTH, letterX)),
      y: Math.max(0, Math.min(100, letterY)),
    };
  };

  const distance = (p1: StrokePoint, p2: StrokePoint) => {
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!activeStroke) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    const point = getCoordinates(e);
    if (!point) return;

    // Strict start point detection: child must touch within 15 units of the start marker
    const distToStart = distance(point, activeStroke.start);
    if (distToStart <= 15) {
      setIsDrawing(true);
      setDrawnPath([point]);
      setCurrentProgressIdx(0);
      playSound.tap();
    }
  };

  const burstParticles = (x: number, y: number) => {
    const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'];
    const newParticles: Particle[] = Array.from({ length: 16 }).map((_, i) => ({
      id: Date.now() + i,
      x: x + CANVAS_OFFSET_X + (Math.random() - 0.5) * 16,
      y: y + (Math.random() - 0.5) * 16,
      color: colors[i % colors.length],
      size: 5 + Math.random() * 6,
    }));
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles([]);
    }, 900);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDrawing || !activeStroke) return;
    const point = getCoordinates(e);
    if (!point) return;

    setDrawnPath(prev => [...prev, point]);

    // STRICT FORWARD CORRIDOR ADVANCEMENT:
    // Child's finger must advance forward along the true mathematical curve points.
    // Checks a forward lookahead window so fast swipes don't freeze the progress.
    let nextIdx = currentProgressIdx;
    const searchLimit = Math.min(sampledPoints.length, currentProgressIdx + 12);
    for (let i = currentProgressIdx; i < searchLimit; i++) {
      if (distance(point, sampledPoints[i]) <= 16) {
        nextIdx = Math.max(nextIdx, i + 1);
      }
    }
    if (nextIdx !== currentProgressIdx) {
      setCurrentProgressIdx(nextIdx);
    }

    // End point validation:
    // 1. Must reach the end marker (<= 14 units)
    // 2. Must have traced through at least 65% of all points on the curve (no skipping across corners!)
    const distToEnd = distance(point, activeStroke.end);
    const requiredProgress = Math.max(1, Math.round(sampledPoints.length * 0.65));
    const allProgressCompleted = currentProgressIdx >= requiredProgress;

    if (distToEnd <= 14 && allProgressCompleted) {
      completeCurrentStroke(point);
    }
  };

  const completeCurrentStroke = (currentPoint: StrokePoint) => {
    if (!activeStroke) return;
    burstParticles(activeStroke.end.x, activeStroke.end.y);
    playSound.strokeSuccess();

    const newCompleted = [...completedStrokes, activeStroke.id];
    setCompletedStrokes(newCompleted);

    const nextIdx = currentStrokeIdx + 1;
    if (nextIdx < letterData.strokes.length) {
      const nextStroke = letterData.strokes[nextIdx];

      // CONTINUOUS WRITING ("Ohne Absetzen", z. B. bei Z, z, V, v, W, w):
      // Does the next stroke start right at the vertex/corner where the current stroke ended?
      const connectsSeamlessly = distance(activeStroke.end, nextStroke.start) <= 4;

      if (connectsSeamlessly) {
        // Child can KEEP finger down without lifting! Seamless flow into next stroke
        setCurrentStrokeIdx(nextIdx);
        setDrawnPath([activeStroke.end]);
        setCurrentProgressIdx(0);
        return;
      }

      // Detached stroke (needs pen lift, e.g. crossbar of t, A, H, F, E):
      // Finger MUST be lifted. Reset drawing state!
      setIsDrawing(false);
      setDrawnPath([]);
      setCurrentStrokeIdx(nextIdx);
      setCurrentProgressIdx(0);
    } else {
      // ENTIRE LETTER IS COMPLETE!
      setIsDrawing(false);
      setDrawnPath([]);
      playSound.letterComplete();
      setTimeout(() => {
        onLetterCompleted();
      }, 700);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    if (!isDrawing) return;
    // If finger lifted prematurely before stroke reached the end, reset drawn path for this stroke
    setIsDrawing(false);
    setDrawnPath([]);
    setCurrentProgressIdx(0);
  };

  const handleResetLetter = () => {
    playSound.tap();
    setCurrentStrokeIdx(0);
    setCompletedStrokes([]);
    setDrawnPath([]);
    setIsDrawing(false);
    setCurrentProgressIdx(0);
  };

  const triggerDemo = () => {
    playSound.tap();
    setShowDemoAnimation(true);
    setDemoProgress(0);
    const start = performance.now();
    const duration = 1400;

    const animate = (time: number) => {
      const elapsed = time - start;
      const progress = Math.min(1, elapsed / duration);
      setDemoProgress(progress);
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setTimeout(() => setShowDemoAnimation(false), 300);
      }
    };
    requestAnimationFrame(animate);
  };

  const handleHouseFloorClick = (floor: HouseFloor) => {
    playSound.tap();
    if (floor === 'roof') {
      speakText('Das ist das Dach! Hier wohnen die großen Buchstaben wie A und B und die mit langem Hals wie b, d, k oder t.', 'de');
    } else if (floor === 'living') {
      speakText('Das ist das gemütliche Wohnzimmer! Hier wohnen die kleinen Buchstaben wie a, c, e, m, n, o, r, s und u.', 'de');
    } else if (floor === 'cellar') {
      speakText('Das ist der Keller! Buchstaben wie g, j, p, q und y hängen ihre Beinchen hier hinunter.', 'de');
    }
  };

  const hasRoof = letterData.floors.includes('roof');
  const hasLiving = letterData.floors.includes('living');
  const hasCellar = letterData.floors.includes('cellar');

  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto select-none px-2 sm:px-4">
      {/* Top Header bar for current letter */}
      <div className="flex items-center justify-between w-full mb-2 sm:mb-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-xs sm:text-sm font-bold text-amber-900/70">
            {lang === 'de' ? 'Buchstabe' : 'Letter'}:
          </span>
          <span className="font-display text-3xl sm:text-4xl font-black text-amber-950 px-2.5 py-0.5 bg-white rounded-xl border border-amber-200 shadow-2xs">
            {char}
          </span>
          <button
            onClick={speakLetter}
            title="Buchstabe anhören"
            className="p-2 sm:p-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 transition-colors shadow-2xs active:scale-95"
          >
            <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Floor indicator badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-white border border-amber-200 rounded-xl text-xs font-bold text-amber-900">
          <Home className="w-3.5 h-3.5 text-amber-600" />
          <span>Wohnt in:</span>
          <div className="flex items-center gap-1">
            {hasRoof && <span className="px-1.5 py-0.2 bg-amber-100 text-amber-900 rounded-md">Dach</span>}
            {hasLiving && <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-900 rounded-md">Wohnen</span>}
            {hasCellar && <span className="px-1.5 py-0.2 bg-indigo-100 text-indigo-900 rounded-md">Keller</span>}
          </div>
        </div>

        {/* Current stroke counter and Workshop button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900/80 bg-amber-100/80 px-2.5 py-1 rounded-xl">
            <span>{lang === 'de' ? 'Strich' : 'Stroke'}:</span>
            <span className="px-1.5 py-0.2 bg-white text-amber-950 rounded-md font-black">
              {Math.min(currentStrokeIdx + 1, letterData.strokes.length || 1)} / {letterData.strokes.length || 1}
            </span>
          </div>

          {onOpenEditor && (
            <button
              onClick={onOpenEditor}
              title="Strichfolge in der Buchstaben-Werkstatt anpassen"
              className="flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-white border border-amber-200 hover:bg-amber-50 text-amber-900 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline">Werkstatt</span>
            </button>
          )}

          {onPickNewWord && (
            <button
              onClick={onPickNewWord}
              title="Anderes Wort zum Nachfahren auswählen"
              className="flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-950 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline">Anderes Wort</span>
            </button>
          )}
        </div>
      </div>

      {/* UNIFIED NOTEBOOK CONTAINER (Anton App 1:1 Schreibhaus & Lineatur Alignment) */}
      <div className="w-full relative bg-white rounded-3xl border-4 border-amber-300/90 shadow-xl overflow-hidden touch-none select-none">
        {/* Main Unified SVG Canvas (viewBox: 0 0 160 100) */}
        <svg
          ref={containerRef}
          viewBox="0 0 160 100"
          className="w-full h-auto block cursor-crosshair touch-none"
          preserveAspectRatio="xMidYMid meet"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <defs>
            {/* Hidden sampler path for mathematical curve measurement */}
            {activeStroke && (
              <path ref={pathSamplerRef} d={activeStroke.pathD} />
            )}

            {/* Gradients for House */}
            <linearGradient id="roofActive" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="roofInactive" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="100%" stopColor="#fde68a" />
            </linearGradient>
            <linearGradient id="livingActive" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="livingInactive" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ecfdf5" />
              <stop offset="100%" stopColor="#d1fae5" />
            </linearGradient>
            <linearGradient id="cellarActive" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
            <linearGradient id="cellarInactive" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#e0e7ff" />
              <stop offset="100%" stopColor="#c7d2fe" />
            </linearGradient>

            {/* Filter for glow */}
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* ==================================================== */}
          {/* 1. NOTEBOOK FLOOR BACKGROUND BANDS (Dach / Wohnen / Keller) */}
          {/* ==================================================== */}
          {/* Dach Band: y = 10 bis y = 38 (warm golden sunshine tint) */}
          <rect
            x="44"
            y="10"
            width="114"
            height="28"
            fill="#fefce8"
            opacity={hasRoof ? "0.9" : "0.5"}
          />

          {/* Wohnzimmer Band: y = 38 bis y = 66 (clean white paper / soft mint tint) */}
          <rect
            x="44"
            y="38"
            width="114"
            height="28"
            fill="#ffffff"
            opacity="1.0"
          />

          {/* Keller Band: y = 66 bis y = 94 (soft cool ground / lavender tint) */}
          <rect
            x="44"
            y="66"
            width="114"
            height="28"
            fill="#f5f3ff"
            opacity={hasCellar ? "0.9" : "0.4"}
          />

          {/* Subtle partition line between House and Tracing Canvas at x = 44 */}
          <line
            x1="44"
            y1="6"
            x2="44"
            y2="98"
            stroke="#fef3c7"
            strokeWidth="1.2"
          />

          {/* ==================================================== */}
          {/* 2. ANTON APP SCHREIBHAUS (x = 4 bis 42)              */}
          {/* Exactly matching y = 10, y = 38, y = 66, y = 94      */}
          {/* ==================================================== */}
          {/* A. DACH (y = 10 bis y = 38) */}
          <g
            onClick={() => handleHouseFloorClick('roof')}
            className="cursor-pointer group"
          >
            {/* Chimney */}
            <rect x="30" y="11" width="6" height="14" fill="#b91c1c" rx="1" />
            <rect x="29" y="10" width="8" height="2.5" fill="#991b1b" rx="0.5" />

            {/* Roof Triangle (peak at 23, 10; eaves at 5, 38 and 41, 38) */}
            <polygon
              points="23,10 5,38 41,38"
              fill={hasRoof ? 'url(#roofActive)' : 'url(#roofInactive)'}
              stroke="#b45309"
              strokeWidth="1.8"
              filter={hasRoof ? 'url(#softGlow)' : undefined}
            />
            {/* Attic Window */}
            <circle cx="23" cy="24" r="5" fill="#ffffff" stroke="#b45309" strokeWidth="1.2" />
            <line x1="23" y1="19" x2="23" y2="29" stroke="#b45309" strokeWidth="0.8" />
            <line x1="18" y1="24" x2="28" y2="24" stroke="#b45309" strokeWidth="0.8" />

            {/* Roof Label */}
            <text
              x="23"
              y="35"
              textAnchor="middle"
              fontSize="4.5"
              fontWeight="900"
              fill={hasRoof ? '#ffffff' : '#92400e'}
            >
              DACH
            </text>
          </g>

          {/* B. WOHNZIMMER (y = 38 bis y = 66) */}
          <g
            onClick={() => handleHouseFloorClick('living')}
            className="cursor-pointer group"
          >
            {/* Living room body */}
            <rect
              x="7"
              y="38"
              width="32"
              height="28"
              fill={hasLiving ? 'url(#livingActive)' : 'url(#livingInactive)'}
              stroke="#047857"
              strokeWidth="1.8"
              filter={hasLiving ? 'url(#softGlow)' : undefined}
            />
            {/* Window with curtains */}
            <rect x="11" y="42" width="11" height="11" rx="1.5" fill="#ffffff" stroke="#047857" strokeWidth="1" />
            <line x1="16.5" y1="42" x2="16.5" y2="53" stroke="#047857" strokeWidth="0.6" />
            <line x1="11" y1="47.5" x2="22" y2="47.5" stroke="#047857" strokeWidth="0.6" />

            {/* Door with golden handle */}
            <rect x="25" y="44" width="10" height="22" rx="1.5" fill="#d97706" stroke="#92400e" strokeWidth="1" />
            <circle cx="27" cy="55" r="1" fill="#fde68a" />

            {/* Living room Label */}
            <text
              x="17"
              y="62"
              textAnchor="middle"
              fontSize="4"
              fontWeight="900"
              fill={hasLiving ? '#ffffff' : '#065f46'}
            >
              WOHNEN
            </text>
          </g>

          {/* C. KELLER (y = 66 bis y = 94) */}
          <g
            onClick={() => handleHouseFloorClick('cellar')}
            className="cursor-pointer group"
          >
            {/* Cellar stone foundation */}
            <rect
              x="8"
              y="66"
              width="30"
              height="28"
              fill={hasCellar ? 'url(#cellarActive)' : 'url(#cellarInactive)'}
              stroke="#4338ca"
              strokeWidth="1.8"
              filter={hasCellar ? 'url(#softGlow)' : undefined}
            />
            {/* Masonry stone lines */}
            <line x1="8" y1="74" x2="38" y2="74" stroke="#4338ca" strokeWidth="0.6" strokeDasharray="4 2" />
            <line x1="8" y1="84" x2="38" y2="84" stroke="#4338ca" strokeWidth="0.6" strokeDasharray="3 3" />

            {/* Cellar barred window */}
            <rect x="15" y="72" width="16" height="9" rx="1" fill="#312e81" stroke="#4338ca" strokeWidth="0.8" />
            <line x1="19" y1="72" x2="19" y2="81" stroke="#c7d2fe" strokeWidth="0.8" />
            <line x1="23" y1="72" x2="23" y2="81" stroke="#c7d2fe" strokeWidth="0.8" />
            <line x1="27" y1="72" x2="27" y2="81" stroke="#c7d2fe" strokeWidth="0.8" />

            {/* Cellar Label */}
            <text
              x="23"
              y="91"
              textAnchor="middle"
              fontSize="4"
              fontWeight="900"
              fill={hasCellar ? '#ffffff' : '#3730a3'}
            >
              KELLER
            </text>
          </g>

          {/* ==================================================== */}
          {/* 3. THE 4 CONTINUOUS NOTEBOOK GUIDELINES              */}
          {/* Extends seamlessly from Schreibhaus into Schreibfeld */}
          {/* ==================================================== */}
          {/* 1. Dachspitze / Dachlinie (y = 10) */}
          <line
            x1="5"
            y1="10"
            x2="158"
            y2="10"
            stroke="#38bdf8"
            strokeWidth="0.8"
            strokeDasharray="3 2"
          />

          {/* 2. TRENNLINIE 1: Mittellinie (y = 38) - Klar & deutlich */}
          {/* Trennt Dach und Wohnbereich */}
          <line
            x1="2"
            y1="38"
            x2="158"
            y2="38"
            stroke="#0284c7"
            strokeWidth="1.2"
            strokeDasharray="4 2"
          />

          {/* 3. TRENNLINIE 2: GRUNDLINIE (y = 66) - DICK & DURCHGEZOGEN! */}
          {/* Trennt Wohnbereich und Keller - Die Haupt-Schreiblinie! */}
          <line
            x1="2"
            y1="66"
            x2="158"
            y2="66"
            stroke="#0f172a"
            strokeWidth="2.4"
          />

          {/* 4. Kellerlinie (y = 94) */}
          <line
            x1="5"
            y1="94"
            x2="158"
            y2="94"
            stroke="#818cf8"
            strokeWidth="0.8"
            strokeDasharray="3 2"
          />

          {/* Indicator badges on the right margin of the lines */}
          <g className="pointer-events-none select-none">
            {/* Trennlinie 1 Badge */}
            <rect x="127" y="34.5" width="31" height="7" rx="3" fill="#0284c7" opacity="0.9" />
            <text x="142.5" y="39.2" textAnchor="middle" fontSize="3" fontWeight="900" fill="#ffffff">
              Trennlinie 1 (Mitte)
            </text>

            {/* Grundlinie Badge */}
            <rect x="131" y="62.5" width="27" height="7" rx="3" fill="#0f172a" opacity="0.95" />
            <text x="144.5" y="67.2" textAnchor="middle" fontSize="3.2" fontWeight="900" fill="#ffffff">
              Grundlinie ★
            </text>
          </g>

          {/* ==================================================== */}
          {/* 4. LETTER TRACING GRAPHICS (Offset x = 48)            */}
          {/* Refined stroke width (7 units) so 'e' has spacious room */}
          {/* ==================================================== */}
          <g transform={`translate(${CANVAS_OFFSET_X}, 0)`}>
            {/* Background letter ghost outline of ALL strokes */}
            {letterData.strokes.map(stroke => (
              <path
                key={`bg-${stroke.id}`}
                d={stroke.pathD}
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}

            {/* Completed Strokes (Vibrant Emerald) */}
            {letterData.strokes.map(stroke => {
              const isCompleted = completedStrokes.includes(stroke.id);
              if (!isCompleted) return null;
              return (
                <path
                  key={`completed-${stroke.id}`}
                  d={stroke.pathD}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              );
            })}

            {/* Active Stroke Ghost Guide with Directional Marker */}
            {activeStroke && (
              <>
                <path
                  ref={pathSamplerRef}
                  d={activeStroke.pathD}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="7"
                  strokeDasharray="1.5 3.5"
                  strokeLinecap="round"
                  opacity="0.8"
                />

                {/* Animated pulsating Start Point Marker */}
                <circle
                  cx={activeStroke.start.x}
                  cy={activeStroke.start.y}
                  r="5"
                  fill="#22c55e"
                  opacity="0.35"
                  className="animate-ping"
                />
                <circle
                  cx={activeStroke.start.x}
                  cy={activeStroke.start.y}
                  r="4"
                  fill="#22c55e"
                  stroke="#ffffff"
                  strokeWidth="1.2"
                />
                <text
                  x={activeStroke.start.x}
                  y={activeStroke.start.y + 1.2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#ffffff"
                  fontSize="3"
                  fontWeight="900"
                >
                  {activeStroke.id}
                </text>

                {/* End Point Target Marker */}
                <circle
                  cx={activeStroke.end.x}
                  cy={activeStroke.end.y}
                  r="3.2"
                  fill="#ea580c"
                  stroke="#ffffff"
                  strokeWidth="1"
                />

                {/* Animated Pencil Demo Dot following the exact curve */}
                {showDemoAnimation && (() => {
                  const demoPt = getPointOnActiveStroke(demoProgress);
                  return (
                    <g className="pointer-events-none">
                      <circle
                        cx={demoPt.x}
                        cy={demoPt.y}
                        r="6"
                        fill="#ec4899"
                        opacity="0.35"
                        className="animate-ping"
                      />
                      <circle
                        cx={demoPt.x}
                        cy={demoPt.y}
                        r="4.5"
                        fill="#ec4899"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                      <circle
                        cx={demoPt.x}
                        cy={demoPt.y}
                        r="1.5"
                        fill="#ffffff"
                      />
                    </g>
                  );
                })()}
              </>
            )}

            {/* Currently drawn finger path by the child */}
            {drawnPath.length > 1 && (
              <path
                d={`M ${drawnPath.map(p => `${p.x} ${p.y}`).join(' L ')}`}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </g>

          {/* Celebration Sparkles */}
          {particles.map(p => (
            <circle
              key={p.id}
              cx={p.x}
              cy={p.y}
              r={p.size / 2}
              fill={p.color}
              className="animate-ping"
            />
          ))}
        </svg>
      </div>

      {/* Helpful Child Tool Actions */}
      <div className="flex items-center justify-center gap-2.5 sm:gap-4 mt-3 sm:mt-4 w-full flex-wrap">
        <button
          onClick={triggerDemo}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs sm:text-sm font-bold active:scale-95 transition-all shadow-2xs cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 text-amber-700" />
          <span>{lang === 'de' ? 'Zeig mir den Strich' : 'Show stroke'}</span>
        </button>

        <button
          onClick={handleResetLetter}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-bold active:scale-95 transition-all shadow-2xs cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-slate-500" />
          <span>{lang === 'de' ? 'Buchstabe neu' : 'Reset letter'}</span>
        </button>

        {onPickNewWord && (
          <button
            onClick={onPickNewWord}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-amber-50 text-amber-950 border border-amber-300 rounded-xl text-xs sm:text-sm font-bold active:scale-95 transition-all shadow-2xs cursor-pointer"
            title="Anderes Wort zum Nachfahren auswählen"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>{lang === 'de' ? 'Anderes Wort' : 'New word'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
