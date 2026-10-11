import { LetterData } from '../types';
import { CANONICAL_LETTER_STROKES } from '../data/letterStrokes';
import { reverseSvgPathD } from './svgPathUtils';

const STORAGE_PREFIX = 'nachfahren_v7_stroke_';

// Cleanup stale keys from previous prototypes with uncalibrated coordinates
function cleanupStaleStorage() {
  if (typeof window === 'undefined') return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.startsWith('wortzauber_custom_stroke_') ||
          key.startsWith('nachfahren_custom_stroke_') ||
          key.startsWith('nachfahren_v2_stroke_') ||
          key.startsWith('nachfahren_v3_stroke_') ||
          key.startsWith('nachfahren_v4_stroke_') ||
          key.startsWith('nachfahren_v5_stroke_') ||
          key.startsWith('nachfahren_v6_stroke_'))
      ) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  } catch {
    // ignore
  }
}

if (typeof window !== 'undefined') {
  cleanupStaleStorage();
}

export const strokeStorage = {
  getLetter(char: string): LetterData {
    const norm = (char || '').normalize('NFC');
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`${STORAGE_PREFIX}${norm}`);
        if (stored) {
          const parsed = JSON.parse(stored) as LetterData;
          // Validate that uppercase letters never enter Keller (> 68)
          const isUpper = parsed.char === parsed.char.toUpperCase() && parsed.char !== parsed.char.toLowerCase();
          let hasInvalidY = false;
          if (isUpper) {
            for (const s of parsed.strokes) {
              if (s.start.y > 68 || s.end.y > 68) {
                hasInvalidY = true;
                break;
              }
            }
          }
          if (!hasInvalidY) {
            // Auto-repair any strokes that were reversed without updating pathD
            parsed.strokes.forEach(s => {
              const m = s.pathD.match(/M\s*([\d.-]+)[\s,]+([\d.-]+)/i);
              if (m) {
                const px = parseFloat(m[1]);
                const py = parseFloat(m[2]);
                const distToStart = Math.hypot(px - s.start.x, py - s.start.y);
                const distToEnd = Math.hypot(px - s.end.x, py - s.end.y);
                if (distToEnd < 6 && distToStart > 6) {
                  s.pathD = reverseSvgPathD(s.pathD);
                }
              }
            });
            return parsed;
          } else {
            // Delete corrupt/old entry
            localStorage.removeItem(`${STORAGE_PREFIX}${norm}`);
          }
        }
      } catch (e) {
        console.warn('Error reading customized stroke:', e);
      }
    }

    return CANONICAL_LETTER_STROKES[norm] || {
      char: norm,
      isUpper: norm === norm.toUpperCase() && norm !== norm.toLowerCase(),
      floors: norm === norm.toUpperCase() ? ['roof', 'living'] : ['living'],
      strokes: [],
    };
  },

  saveLetter(letterData: LetterData): void {
    if (typeof window === 'undefined') return;
    try {
      const norm = (letterData.char || '').normalize('NFC');
      const dataToSave = { ...letterData, char: norm };
      localStorage.setItem(`${STORAGE_PREFIX}${norm}`, JSON.stringify(dataToSave));
    } catch (e) {
      console.warn('Error saving customized stroke:', e);
    }
  },

  hasCustom(char: string): boolean {
    if (typeof window === 'undefined') return false;
    const norm = (char || '').normalize('NFC');
    return Boolean(localStorage.getItem(`${STORAGE_PREFIX}${norm}`));
  },

  resetLetter(char: string): void {
    if (typeof window === 'undefined') return;
    const norm = (char || '').normalize('NFC');
    localStorage.removeItem(`${STORAGE_PREFIX}${norm}`);
  },

  resetAll(): void {
    if (typeof window === 'undefined') return;
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  },

  getAllCustomizedChars(): string[] {
    if (typeof window === 'undefined') return [];
    const chars: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        chars.push(key.replace(STORAGE_PREFIX, ''));
      }
    }
    return chars;
  },
};
