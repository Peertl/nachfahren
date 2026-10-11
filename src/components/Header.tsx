import React from 'react';
import { Sparkles, Volume2, VolumeX, Mic, Wrench, Award } from 'lucide-react';
import { SupportedLanguage, LetterCasingMode } from '../types';

interface HeaderProps {
  currentLang: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  casingMode: LetterCasingMode;
  onCasingModeChange: (mode: LetterCasingMode) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onNewWordClick: () => void;
  onOpenWorkshop: () => void;
  onOpenHistory: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onLanguageChange,
  casingMode,
  onCasingModeChange,
  soundEnabled,
  onToggleSound,
  onNewWordClick,
  onOpenWorkshop,
  onOpenHistory,
}) => {
  return (
    <header className="flex items-center justify-between gap-4 sm:gap-8 px-4 sm:px-6 py-3 bg-white/95 backdrop-blur-md border-b border-amber-100 shadow-xs sticky top-0 z-40">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-2 shrink-0">
        <a href="/" className="flex items-center gap-2 font-display text-xl sm:text-2xl font-black tracking-tight text-amber-950 whitespace-nowrap">
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-400 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
          </span>
          <span>Nachfahren</span>
        </a>
      </div>

      {/* Zone 2: Casing Mode & Language & Workshop (Clean Controls) */}
      <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-semibold text-slate-600">
        {/* Casing selector: Gemischt (Katze) vs GROSS (KATZE) vs klein (katze) */}
        <div className="flex items-center p-0.5 bg-amber-50 rounded-xl border border-amber-200/80">
          <button
            onClick={() => onCasingModeChange('title')}
            title="Schulschrift: Groß- und Kleinschreibung (z. B. Katze)"
            className={`px-2 sm:px-2.5 py-1 text-xs rounded-lg transition-all ${
              casingMode === 'title'
                ? 'bg-white text-amber-950 font-black shadow-xs'
                : 'text-amber-900/60 hover:text-amber-950'
            }`}
          >
            Aa
          </button>
          <button
            onClick={() => onCasingModeChange('upper')}
            title="Nur Großbuchstaben (z. B. KATZE)"
            className={`px-2 sm:px-2.5 py-1 text-xs rounded-lg transition-all ${
              casingMode === 'upper'
                ? 'bg-white text-amber-950 font-black shadow-xs'
                : 'text-amber-900/60 hover:text-amber-950'
            }`}
          >
            AA
          </button>
          <button
            onClick={() => onCasingModeChange('lower')}
            title="Nur Kleinbuchstaben (z. B. katze)"
            className={`px-2 sm:px-2.5 py-1 text-xs rounded-lg transition-all ${
              casingMode === 'lower'
                ? 'bg-white text-amber-950 font-black shadow-xs'
                : 'text-amber-900/60 hover:text-amber-950'
            }`}
          >
            aa
          </button>
        </div>

        {/* Language switch */}
        <div className="flex items-center gap-1 p-0.5 bg-amber-50 rounded-xl border border-amber-200/80">
          <button
            onClick={() => onLanguageChange('de')}
            title="Wörter auf Deutsch schreiben"
            className={`px-2 sm:px-2.5 py-1 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              currentLang === 'de'
                ? 'bg-white text-amber-950 shadow-xs'
                : 'text-amber-800/70 hover:text-amber-950'
            }`}
          >
            🇩🇪 DE
          </button>
          <button
            onClick={() => onLanguageChange('en')}
            title="Write words in English"
            className={`px-2 sm:px-2.5 py-1 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              currentLang === 'en'
                ? 'bg-white text-amber-950 shadow-xs'
                : 'text-amber-800/70 hover:text-amber-950'
            }`}
          >
            🇬🇧 EN
          </button>
        </div>

        {/* Buchstaben-Werkstatt Button */}
        <button
          onClick={onOpenWorkshop}
          title="Buchstaben-Werkstatt: Strichreihenfolge & Schreibhaus anpassen"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-100/80 hover:bg-amber-200/70 text-amber-900 text-xs font-bold transition-colors whitespace-nowrap"
        >
          <Wrench className="w-3.5 h-3.5 text-amber-800" />
          <span className="hidden sm:inline">Buchstaben-Werkstatt</span>
        </button>

        {/* Erfolge & Statistik Button */}
        <button
          onClick={onOpenHistory}
          title="Erfolge & Statistik: Alle geschriebenen Wörter ansehen"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-orange-100/80 hover:bg-orange-200/70 text-orange-950 text-xs font-bold transition-colors whitespace-nowrap"
        >
          <Award className="w-3.5 h-3.5 text-orange-600" />
          <span className="hidden md:inline">Erfolge & Statistik</span>
        </button>

        {/* Sound toggle */}
        <button
          onClick={onToggleSound}
          title={soundEnabled ? 'Ton ausschalten' : 'Ton einschalten'}
          className="p-1.5 rounded-xl text-amber-900/80 hover:bg-amber-100 transition-colors"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
        </button>
      </div>

      {/* Zone 3: 1 Primary Action */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onNewWordClick}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl hover:from-amber-600 hover:to-orange-600 shadow-xs active:scale-95 transition-all whitespace-nowrap"
        >
          <Mic className="w-4 h-4" />
          <span>Neues Wort</span>
        </button>
      </div>
    </header>
  );
};
