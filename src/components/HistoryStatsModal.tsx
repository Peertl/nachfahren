import React from 'react';
import { X, Award, Sparkles, RotateCcw, Trash2, Calendar, BookOpen } from 'lucide-react';
import { historyStorage, CompletedWordItem } from '../utils/historyStorage';
import { playSound } from '../utils/audio';

interface HistoryStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWord: (word: string) => void;
}

export const HistoryStatsModal: React.FC<HistoryStatsModalProps> = ({
  isOpen,
  onClose,
  onSelectWord,
}) => {
  if (!isOpen) return null;

  const history = historyStorage.getCompletedWords();
  const stats = historyStorage.getStats();

  const handleClearHistory = () => {
    if (window.confirm('Möchtest du die Historie wirklich zurücksetzen?')) {
      playSound.tap();
      historyStorage.clearHistory();
      onClose();
    }
  };

  const handleReplayWord = (word: string) => {
    playSound.tap();
    onSelectWord(word);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border-2 border-amber-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-100 bg-amber-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-xl font-black text-amber-950">
                Erfolge, Historie & Statistik
              </h2>
              <p className="text-xs text-amber-900/70 font-medium">
                Alle Wörter, die deine Tochter bereits erfolgreich nachgefahren hat
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* STATS OVERVIEW CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-center">
              <span className="text-2xl font-black text-amber-950 font-display block">
                {stats.totalWords}
              </span>
              <span className="text-[11px] font-bold text-amber-800/80">Wörter gesamt</span>
            </div>

            <div className="p-3.5 bg-orange-50 border border-orange-200 rounded-2xl text-center">
              <span className="text-2xl font-black text-orange-950 font-display block">
                {stats.totalLetters}
              </span>
              <span className="text-[11px] font-bold text-orange-800/80">Buchstaben</span>
            </div>

            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-center">
              <span className="text-2xl font-black text-blue-950 font-display block">
                {stats.nomenCount}
              </span>
              <span className="text-[11px] font-bold text-blue-800/80">🟦 Nomen</span>
            </div>

            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-center">
              <span className="text-2xl font-black text-rose-950 font-display block">
                {stats.verbCount}
              </span>
              <span className="text-[11px] font-bold text-rose-800/80">🔴 Verben</span>
            </div>

            <div className="p-3.5 bg-amber-50 border border-yellow-300 rounded-2xl text-center col-span-2 sm:col-span-1">
              <span className="text-2xl font-black text-amber-950 font-display block">
                {stats.adjektivCount}
              </span>
              <span className="text-[11px] font-bold text-amber-800/80">🟡 Adjektive</span>
            </div>
          </div>

          {/* HISTORY WORDS LIST */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-amber-950 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-amber-700" />
                <span>Bisher geschriebene Wörter ({history.length})</span>
              </h3>

              {history.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 font-bold transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Historie löschen</span>
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl space-y-2">
                <Sparkles className="w-8 h-8 text-amber-400 mx-auto animate-bounce" />
                <p className="text-sm font-bold text-slate-700">Noch keine Wörter in der Historie!</p>
                <p className="text-xs text-slate-500">
                  Sobald deine Tochter ihr erstes Wort fertig nachgefahren hat, wird es hier als Erfolg gesammelt.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                {history.map((item: CompletedWordItem) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-2xl hover:border-amber-300 hover:bg-amber-50/30 transition-all shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-display text-xl font-black text-slate-900 tracking-wide">
                        {item.word}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        item.wordType === 'verb'
                          ? 'bg-rose-100 text-rose-800'
                          : item.wordType === 'adjektiv'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {item.wordType === 'verb' ? 'Verb' : item.wordType === 'adjektiv' ? 'Adjektiv' : 'Nomen'}
                      </span>
                    </div>

                    <button
                      onClick={() => handleReplayWord(item.word)}
                      title="Dieses Wort noch einmal nachfahren"
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-xl transition-colors active:scale-95"
                    >
                      <RotateCcw className="w-3 h-3 text-amber-700" />
                      <span>Üben</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3.5 bg-slate-50 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};
