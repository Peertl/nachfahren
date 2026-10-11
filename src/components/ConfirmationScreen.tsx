import React, { useEffect, useState } from 'react';
import { ThumbsUp, ThumbsDown, Volume2, Sparkles, Globe } from 'lucide-react';
import { WordMetadata, SupportedLanguage } from '../types';
import { ChildIllustration } from './ChildIllustration';
import { speakText, playSound } from '../utils/audio';

interface ConfirmationScreenProps {
  wordData: WordMetadata;
  onConfirm: () => void;
  onRetrySentence: () => void;
  onPickNewWord: () => void;
  onSwitchToTranslation?: (translatedWord: string, targetLang: SupportedLanguage) => void;
}

export const ConfirmationScreen: React.FC<ConfirmationScreenProps> = ({
  wordData,
  onConfirm,
  onRetrySentence,
  onPickNewWord,
  onSwitchToTranslation,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    readWordAloud();
  }, [wordData]);

  const readWordAloud = () => {
    setIsPlayingAudio(true);
    const isDe = wordData.sourceLang === 'de';
    const questionText = isDe
      ? `Hast du ${wordData.displayWord} gesagt?`
      : `Did you say ${wordData.displayWord}?`;

    speakText(questionText, wordData.sourceLang, () => {
      setIsPlayingAudio(false);
    });
  };

  const handleConfirm = () => {
    playSound.strokeSuccess();
    onConfirm();
  };

  const handleThumbDown = () => {
    playSound.tap();
    const promptText = wordData.sourceLang === 'de'
      ? 'Verwende das Wort im ganzen Satz'
      : 'Use the word in a full sentence';

    // Speak clearly first, then activate microphone so synthesizer audio isn't picked up by mic
    speakText(promptText, wordData.sourceLang, () => {
      onRetrySentence();
    });
  };

  const handleChooseOtherWord = () => {
    playSound.tap();
    onPickNewWord();
  };

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 flex flex-col items-center text-center">
      <div className="w-full bg-white rounded-3xl border-2 border-amber-200/90 p-5 sm:p-8 shadow-xl space-y-5 animate-in fade-in zoom-in duration-200">
        {/* Header & WordType Badge */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs uppercase tracking-widest font-black text-amber-700 bg-amber-100/70 px-3 py-0.5 rounded-full inline-block">
              Worterkennung
            </span>
            {wordData.wordType && (
              <span
                className={`text-xs font-black px-2.5 py-0.5 rounded-full inline-block ${
                  wordData.wordType === 'verb'
                    ? 'bg-rose-100 text-rose-800'
                    : wordData.wordType === 'adjektiv'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {wordData.wordType === 'verb'
                  ? '🔴 Verb (Tuwort)'
                  : wordData.wordType === 'adjektiv'
                  ? '🟡 Adjektiv (Wiewort)'
                  : '🟦 Nomen (Namenwort)'}
              </span>
            )}
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-black text-amber-950">
            {wordData.sourceLang === 'de' ? 'Habe ich dich richtig verstanden?' : 'Did I understand you correctly?'}
          </h2>
        </div>

        {/* Child illustration */}
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 mx-auto bg-gradient-to-b from-amber-50 to-orange-50/50 rounded-full border-4 border-amber-200/60 shadow-inner flex items-center justify-center overflow-hidden">
          <ChildIllustration
            type={wordData.illustrationType}
            size={145}
            animated={true}
          />
        </div>

        {/* Recognized Word Display */}
        <div className="flex flex-col items-center justify-center gap-1">
          <div className="flex items-center gap-3">
            <span className="font-display text-4xl sm:text-6xl font-black text-amber-900 tracking-wide">
              {wordData.detectedWord}
            </span>
            <button
              onClick={() => {
                playSound.tap();
                readWordAloud();
              }}
              disabled={isPlayingAudio}
              title="Wort noch einmal vorlesen"
              className="p-2 sm:p-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-2xl active:scale-95 transition-all shadow-2xs cursor-pointer"
            >
              <Volume2 className={`w-5 h-5 ${isPlayingAudio ? 'animate-pulse text-amber-600' : ''}`} />
            </button>
          </div>

          {wordData.translation && (
            <span className="text-sm font-semibold text-slate-500">
              {wordData.sourceLang === 'de' ? 'Englisch:' : 'Deutsch:'}{' '}
              <strong className="text-amber-800">{wordData.translation}</strong>
            </span>
          )}
        </div>

        {/* Clear, direct decision buttons:
            1. Daumen hoch -> Ja, genau! Loslegen
            2. Daumen runter -> "Verwende das Wort im ganzen Satz" & Mikrofon direkt aktiv
            3. Ganz neues Wort wählen */}
        <div className="pt-2 flex flex-col gap-3 max-w-lg mx-auto w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            {/* 1. DAUMEN HOCH (JA, GENAU) */}
            <button
              onClick={handleConfirm}
              className="group flex flex-col items-center justify-center p-4 sm:p-5 bg-gradient-to-b from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-2xl sm:rounded-3xl shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/20 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                <ThumbsUp className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <span className="font-display text-lg sm:text-xl font-black tracking-tight">Ja, genau!</span>
              <span className="text-xs font-semibold text-emerald-100">Buchstaben nachfahren</span>
            </button>

            {/* 2. DAUMEN RUNTER (NEIN, FALSCH) -> sagt 'Verwende das Wort im ganzen Satz' */}
            <button
              onClick={handleThumbDown}
              className="group flex flex-col items-center justify-center p-4 sm:p-5 bg-gradient-to-b from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white rounded-2xl sm:rounded-3xl shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/20 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                <ThumbsDown className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <span className="font-display text-lg sm:text-xl font-black tracking-tight">Nein, falsch</span>
              <span className="text-xs font-semibold text-rose-100">Im ganzen Satz sagen</span>
            </button>
          </div>

          {/* 3. AUF ENGLISCH / DEUTSCH SCHREIBEN OPTION */}
          {wordData.translation && onSwitchToTranslation && (
            <button
              onClick={() => {
                playSound.tap();
                onSwitchToTranslation(wordData.translation, wordData.sourceLang === 'de' ? 'en' : 'de');
              }}
              className="group flex items-center justify-center gap-2.5 py-3.5 px-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:via-indigo-700 hover:to-violet-700 text-white rounded-2xl shadow-sm hover:shadow active:scale-95 transition-all cursor-pointer font-bold text-sm sm:text-base border border-blue-400/30"
              title={wordData.sourceLang === 'de' ? 'Das Wort auf Englisch schreiben' : 'Das Wort auf Deutsch schreiben'}
            >
              <Globe className="w-5 h-5 text-blue-200 group-hover:rotate-12 transition-transform" />
              <span>{wordData.sourceLang === 'de' ? '🇬🇧 Auf Englisch schreiben:' : '🇩🇪 Auf Deutsch schreiben:'}</span>
              <span className="bg-white/20 px-3 py-0.5 rounded-xl font-black tracking-wide underline decoration-white/50">
                {wordData.translation}
              </span>
            </button>
          )}

          {/* 4. GANZ NEUES WORT WÄHLEN BUTTON */}
          <button
            onClick={handleChooseOtherWord}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Ganz anderes Wort aus der Liste wählen</span>
          </button>
        </div>
      </div>
    </div>
  );
};
