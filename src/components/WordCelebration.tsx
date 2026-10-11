import React, { useEffect, useState } from 'react';
import { Volume2, Sparkles, ArrowRight, RotateCcw, Globe } from 'lucide-react';
import { WordMetadata } from '../types';
import { ChildIllustration } from './ChildIllustration';
import { playSound, speakText } from '../utils/audio';

interface WordCelebrationProps {
  wordData: WordMetadata;
  onTraceTranslation: () => void;
  onPickNewWord: () => void;
  onRepeatWord: () => void;
}

export const WordCelebration: React.FC<WordCelebrationProps> = ({
  wordData,
  onTraceTranslation,
  onPickNewWord,
  onRepeatWord,
}) => {
  const [isPlayingTranslationAudio, setIsPlayingTranslationAudio] = useState(false);

  useEffect(() => {
    // Fanfare sound
    playSound.wordCelebration();

    // Congratulate child
    const isDe = wordData.sourceLang === 'de';
    const praiseText = isDe
      ? `Toll gemacht! Du hast das Wort ${wordData.displayWord} geschrieben!`
      : `Awesome job! You wrote the word ${wordData.displayWord}!`;

    speakText(praiseText, wordData.sourceLang);
  }, [wordData]);

  const playTranslationAudio = () => {
    if (!wordData.translation) return;
    setIsPlayingTranslationAudio(true);
    speakText(wordData.translation, wordData.targetLang, () => {
      setIsPlayingTranslationAudio(false);
    });
  };

  const hasTranslation = Boolean(wordData.translation && wordData.translation.trim().length > 0);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col items-center text-center animate-in fade-in zoom-in duration-400">
      <div className="w-full bg-white rounded-3xl border-3 border-amber-300 p-6 sm:p-10 shadow-xl space-y-6">
        {/* Celebration Badges */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-100 text-amber-900 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-amber-600 animate-spin" />
            <span>{wordData.sourceLang === 'de' ? 'Wort geschafft!' : 'Word Completed!'}</span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-black text-amber-950">
            {wordData.sourceLang === 'de' ? 'Fantastisch geschrieben! 🎉' : 'Fantastic writing! 🎉'}
          </h2>
        </div>

        {/* Dancing Word Illustration */}
        <div className="relative w-48 h-48 mx-auto bg-gradient-to-b from-amber-50 to-orange-50 rounded-full border-4 border-amber-300 shadow-inner flex items-center justify-center animate-bounce-subtle">
          <ChildIllustration
            type={wordData.illustrationType}
            size={175}
            animated={true}
          />
        </div>

        {/* Written word display */}
        <div className="space-y-1">
          <span className="font-display text-5xl font-black text-emerald-600 tracking-wider">
            {wordData.detectedWord}
          </span>
          {wordData.simpleSentence && (
            <p className="text-sm font-medium text-slate-500 italic">
              „{wordData.simpleSentence}“
            </p>
          )}
        </div>

        {/* English Translation Section */}
        {hasTranslation && (
          <div className="p-5 bg-gradient-to-br from-sky-50 to-indigo-50/60 rounded-3xl border-2 border-sky-200/80 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-sky-900/80">
              <span className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-sky-600" />
                {wordData.sourceLang === 'de' ? 'Übersetzung auf Englisch' : 'Translation in German'}
              </span>
              <span>{wordData.targetLang === 'en' ? '🇬🇧 Englisch' : '🇩🇪 Deutsch'}</span>
            </div>

            <div className="flex items-center justify-center gap-3">
              <span className="font-display text-3xl font-black text-sky-950">
                {wordData.translation}
              </span>
              <button
                onClick={playTranslationAudio}
                title="Aussprache anhören"
                className="p-2.5 rounded-xl bg-sky-200 hover:bg-sky-300 text-sky-950 transition-colors shadow-xs active:scale-95"
              >
                <Volume2 className={`w-5 h-5 ${isPlayingTranslationAudio ? 'animate-pulse text-sky-700' : ''}`} />
              </button>
            </div>

            <p className="text-xs text-sky-900/70 font-medium">
              {wordData.sourceLang === 'de'
                ? 'Höre dir an, wie man das Wort auf Englisch ausspricht, und lerne es zu schreiben!'
                : 'Listen to how to pronounce it in German and learn to write it!'}
            </p>

            <button
              onClick={onTraceTranslation}
              className="w-full flex items-center justify-center gap-2 py-3 px-5 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl font-bold text-base shadow-sm active:scale-95 transition-all"
            >
              <span>{wordData.sourceLang === 'de' ? '🇬🇧 Jetzt auf Englisch nachfahren' : '🇩🇪 Jetzt auf Deutsch nachfahren'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Actions: Repeat or New Word */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={onRepeatWord}
            className="flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-bold text-sm active:scale-95 transition-all"
          >
            <RotateCcw className="w-4 h-4 text-slate-600" />
            <span>{wordData.sourceLang === 'de' ? 'Noch einmal üben' : 'Practice again'}</span>
          </button>

          <button
            onClick={onPickNewWord}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl font-bold text-base shadow-md active:scale-95 transition-all"
          >
            <Sparkles className="w-5 h-5" />
            <span>{wordData.sourceLang === 'de' ? 'Nächstes Wort wählen' : 'Choose next word'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
