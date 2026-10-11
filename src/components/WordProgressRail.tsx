import React from 'react';
import { Check, Star } from 'lucide-react';
import { playSound } from '../utils/audio';

interface WordProgressRailProps {
  letters: string[];
  currentIdx: number;
  onSelectLetter: (index: number) => void;
}

export const WordProgressRail: React.FC<WordProgressRailProps> = ({
  letters,
  currentIdx,
  onSelectLetter,
}) => {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 my-4 overflow-x-auto py-2 px-4 max-w-full">
      {letters.map((char, index) => {
        const isDone = index < currentIdx;
        const isCurrent = index === currentIdx;

        return (
          <button
            key={`${char}-${index}`}
            onClick={() => {
              playSound.tap();
              onSelectLetter(index);
            }}
            className={`relative flex flex-col items-center justify-center w-12 h-14 sm:w-16 sm:h-18 rounded-2xl font-display text-2xl sm:text-3xl font-black transition-all duration-300 ${
              isCurrent
                ? 'bg-amber-400 text-amber-950 ring-4 ring-amber-300 shadow-md scale-108 -translate-y-1'
                : isDone
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'bg-white text-slate-400 border border-slate-200'
            }`}
          >
            <span>{char}</span>

            {/* Status icon badge */}
            {isDone && (
              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-600 border border-white flex items-center justify-center shadow-xs">
                <Check className="w-3 h-3 text-white stroke-[3]" />
              </div>
            )}

            {isCurrent && (
              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-600 border border-white flex items-center justify-center shadow-xs animate-bounce">
                <Star className="w-3 h-3 text-white fill-white" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};
