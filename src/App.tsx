import React, { useState } from 'react';
import { Volume2, RotateCcw } from 'lucide-react';
import { Header } from './components/Header';
import { WordRecognizer } from './components/WordRecognizer';
import { ConfirmationScreen } from './components/ConfirmationScreen';
import { LetterTracingCanvas } from './components/LetterTracingCanvas';
import { WordProgressRail } from './components/WordProgressRail';
import { WordCelebration } from './components/WordCelebration';
import { StrokeEditorModal } from './components/StrokeEditorModal';
import { HistoryStatsModal } from './components/HistoryStatsModal';
import { AppPhase, SupportedLanguage, WordMetadata, LetterCasingMode, WordType } from './types';
import { ChildIllustration } from './components/ChildIllustration';
import { PRESET_WORDS } from './data/wordLibrary';
import { historyStorage } from './utils/historyStorage';
import { playSound, speakText } from './utils/audio';

function formatWordWithCasing(word: string, mode: LetterCasingMode, wordType?: WordType, category?: string): string {
  const clean = (word || '').normalize('NFC').trim();
  if (!clean) return '';
  // If practicing a single letter (e.g. from Buchstaben-Werkstatt), preserve exact casing (e.g. 't' or 'A')
  if (category === 'Buchstaben' || clean.length === 1) {
    if (mode === 'upper') return clean.toUpperCase();
    if (mode === 'lower') return clean.toLowerCase();
    return clean;
  }
  if (mode === 'upper') return clean.toUpperCase();
  if (mode === 'lower') return clean.toLowerCase();
  // Grundschul-Standard: Verben und Adjektive kleinschreiben, Nomen großschreiben!
  if (wordType === 'verb' || wordType === 'adjektiv') {
    return clean.toLowerCase();
  }
  return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
}

function extractLetterTokens(word: string, mode: LetterCasingMode, wordType?: WordType, category?: string): string[] {
  const formatted = formatWordWithCasing(word, mode, wordType, category);
  return formatted.normalize('NFC').replace(/[^a-zA-ZÄÖÜäöüß]/g, '').split('');
}

export default function App() {
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>('de');
  const [casingMode, setCasingMode] = useState<LetterCasingMode>('title'); // 'title' is German Grundschule standard
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [appPhase, setAppPhase] = useState<AppPhase>('input');
  const [isRetryMode, setIsRetryMode] = useState(false);
  const [retrySentenceHint, setRetrySentenceHint] = useState<string | undefined>(undefined);

  // Active word session state
  const [activeWord, setActiveWord] = useState<WordMetadata | null>(null);
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);

  // Buchstaben-Werkstatt & History modal states
  const [isWorkshopOpen, setIsWorkshopOpen] = useState(false);
  const [workshopInitialChar, setWorkshopInitialChar] = useState('A');
  const [workshopVersion, setWorkshopVersion] = useState(0);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [autoStartMic, setAutoStartMic] = useState(false);

  const handleLanguageChange = (lang: SupportedLanguage) => {
    setCurrentLang(lang);
    if (activeWord) {
      setActiveWord(prev => (prev ? { ...prev, sourceLang: lang } : null));
    }
  };

  const handleCasingModeChange = (mode: LetterCasingMode) => {
    playSound.tap();
    setCasingMode(mode);
    setCurrentLetterIndex(0);
  };

  // Called from Speech Recognition (requires thumbs up/down confirmation!)
  const handleWordSelected = (metadata: WordMetadata) => {
    setActiveWord(metadata);
    setCurrentLetterIndex(0);
    setIsRetryMode(false);
    setRetrySentenceHint(undefined);
    setAppPhase('confirm');
  };

  // Called when clicking a card or typing a word directly:
  // "Wenn ich ein Wort aus der Liste auswähle, muss er mich nicht mehr fragen, ob ich das Wort gesagt habe. Er soll das Wort aber einmal vorlesen."
  const handleDirectStart = (metadata: WordMetadata) => {
    setActiveWord(metadata);
    setCurrentLetterIndex(0);
    setIsRetryMode(false);
    setAutoStartMic(false);
    setRetrySentenceHint(undefined);
    setAppPhase('trace');
    speakText(metadata.displayWord, currentLang);
  };

  const handleSelectWordFromHistory = (wordToReplay: string) => {
    // Try to find matching preset word metadata
    const preset = PRESET_WORDS.find(
      w => w.de.toLowerCase() === wordToReplay.toLowerCase() || w.en.toLowerCase() === wordToReplay.toLowerCase()
    );

    const isDe = currentLang === 'de';
    const metadata: WordMetadata = preset
      ? {
          detectedWord: isDe ? preset.de : preset.en,
          displayWord: isDe ? preset.de : preset.en,
          translation: isDe ? preset.en : preset.de,
          category: preset.category,
          wordType: preset.wordType,
          phonetic: isDe ? preset.phoneticDe : preset.phoneticEn,
          simpleSentence: isDe ? preset.sentenceDe : preset.sentenceEn,
          illustrationType: preset.illustrationType,
          color: preset.color,
          sourceLang: currentLang,
          targetLang: currentLang === 'de' ? 'en' : 'de',
        }
      : {
          detectedWord: wordToReplay,
          displayWord: wordToReplay,
          translation: '',
          category: 'Wörter',
          illustrationType: 'generic',
          color: '#3b82f6',
          sourceLang: currentLang,
          targetLang: currentLang === 'de' ? 'en' : 'de',
        };

    handleDirectStart(metadata);
  };

  const handleConfirmWord = () => {
    setCurrentLetterIndex(0);
    setAppPhase('trace');
  };

  // When child clicked "Nein, nochmal sprechen": opens microphone directly without asking or giving examples!
  const handleRetrySpeech = () => {
    setIsRetryMode(true);
    setAutoStartMic(true);
    setRetrySentenceHint(undefined);
    setAppPhase('input');
  };

  // Practice single letter directly from workshop
  const handlePracticeLetter = (charToPractice: string) => {
    const norm = (charToPractice || 'A').normalize('NFC');
    setIsWorkshopOpen(false);
    setWorkshopVersion(v => v + 1);
    const isDe = currentLang === 'de';
    const metadata: WordMetadata = {
      detectedWord: norm,
      displayWord: norm,
      translation: '',
      category: 'Buchstaben',
      illustrationType: 'generic',
      color: '#3b82f6',
      sourceLang: currentLang,
      targetLang: isDe ? 'en' : 'de',
    };
    setActiveWord(metadata);
    setCurrentLetterIndex(0);
    setIsRetryMode(false);
    setAutoStartMic(false);
    setAppPhase('trace');
  };

  const handlePickNewWord = () => {
    playSound.tap();
    setActiveWord(null);
    setCurrentLetterIndex(0);
    setIsRetryMode(false);
    setAutoStartMic(false);
    setRetrySentenceHint(undefined);
    setAppPhase('input');
  };

  const handleLetterCompleted = () => {
    if (!activeWord) return;
    const currentLetters = extractLetterTokens(activeWord.displayWord, casingMode, activeWord.wordType, activeWord.category);

    if (currentLetterIndex + 1 < currentLetters.length) {
      setCurrentLetterIndex(prev => prev + 1);
    } else {
      // Word completely written: save to history!
      historyStorage.addCompletedWord(
        activeWord.displayWord,
        activeWord.wordType,
        activeWord.sourceLang
      );
      setAppPhase('word_complete');
    }
  };

  const handleTraceTranslation = () => {
    if (!activeWord || !activeWord.translation) return;
    handleSwitchToTranslation(activeWord.translation, activeWord.targetLang);
  };

  const handleSwitchToTranslation = (translatedWord: string, targetLang: SupportedLanguage) => {
    playSound.tap();
    const cleanTrans = translatedWord.trim();
    if (!cleanTrans) return;

    // Check if preset word matches
    const preset = PRESET_WORDS.find(
      w => w.de.toLowerCase() === cleanTrans.toLowerCase() || w.en.toLowerCase() === cleanTrans.toLowerCase()
    );

    const isDe = targetLang === 'de';
    const newMetadata: WordMetadata = preset
      ? {
          detectedWord: isDe ? preset.de : preset.en,
          displayWord: isDe ? preset.de : preset.en,
          translation: isDe ? preset.en : preset.de,
          category: preset.category,
          wordType: preset.wordType,
          phonetic: isDe ? preset.phoneticDe : preset.phoneticEn,
          simpleSentence: isDe ? preset.sentenceDe : preset.sentenceEn,
          illustrationType: preset.illustrationType,
          color: preset.color,
          sourceLang: targetLang,
          targetLang: isDe ? 'en' : 'de',
        }
      : {
          detectedWord: cleanTrans,
          displayWord: cleanTrans,
          translation: activeWord ? activeWord.displayWord : '',
          category: activeWord ? activeWord.category : 'Nomen',
          wordType: activeWord ? activeWord.wordType : 'nomen',
          illustrationType: activeWord ? activeWord.illustrationType : cleanTrans.toLowerCase(),
          color: activeWord ? activeWord.color : '#3b82f6',
          sourceLang: targetLang,
          targetLang: isDe ? 'en' : 'de',
        };

    setCurrentLang(targetLang);
    setActiveWord(newMetadata);
    setCurrentLetterIndex(0);
    setAppPhase('trace');
    speakText(newMetadata.displayWord, targetLang);
  };

  const handleRepeatWord = () => {
    playSound.tap();
    setCurrentLetterIndex(0);
    setAppPhase('trace');
  };

  const handleOpenWorkshop = (char?: string) => {
    playSound.tap();
    const norm = (char || currentChar || 'A').normalize('NFC');
    setWorkshopInitialChar(norm);
    setIsWorkshopOpen(true);
  };

  const handleWorkshopSaved = () => {
    // Increment workshopVersion to immediately force re-render and reload fresh customized strokes
    setWorkshopVersion(v => v + 1);
  };

  const currentLetters = activeWord
    ? extractLetterTokens(activeWord.displayWord, casingMode, activeWord.wordType, activeWord.category)
    : [];

  const currentChar = currentLetters[currentLetterIndex] || 'A';
  const displayFormattedWord = activeWord
    ? formatWordWithCasing(activeWord.displayWord, casingMode, activeWord.wordType, activeWord.category)
    : '';

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/70 via-orange-50/30 to-amber-100/30 text-slate-800 flex flex-col selection:bg-amber-200">
      <Header
        currentLang={currentLang}
        onLanguageChange={handleLanguageChange}
        casingMode={casingMode}
        onCasingModeChange={handleCasingModeChange}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(prev => !prev)}
        onNewWordClick={handlePickNewWord}
        onOpenWorkshop={() => handleOpenWorkshop(currentChar)}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      <main className="flex-1 flex flex-col justify-center py-3 sm:py-5 px-2 sm:px-6">
        {/* PHASE 1: WORD RECOGNITION & INPUT */}
        {appPhase === 'input' && (
          <WordRecognizer
            currentLang={currentLang}
            onLanguageChange={handleLanguageChange}
            onWordSelected={handleWordSelected}
            onDirectStart={handleDirectStart}
            onOpenHistory={() => setIsHistoryOpen(true)}
            initialSentenceHint={undefined}
            isRetryMode={isRetryMode}
            autoStartListening={autoStartMic}
            onListeningStarted={() => setAutoStartMic(false)}
          />
        )}

        {/* PHASE 2: WORD CONFIRMATION (THUMBS UP / DOWN) */}
        {appPhase === 'confirm' && activeWord && (
          <ConfirmationScreen
            wordData={{
              ...activeWord,
              detectedWord: displayFormattedWord,
            }}
            onConfirm={handleConfirmWord}
            onRetrySentence={handleRetrySpeech}
            onPickNewWord={handlePickNewWord}
            onSwitchToTranslation={handleSwitchToTranslation}
          />
        )}

        {/* PHASE 3: STROKE-BY-STROKE LETTER TRACING WITH SCHREIBHAUS */}
        {appPhase === 'trace' && activeWord && (
          <div className="max-w-2xl mx-auto w-full flex flex-col items-center">
            {/* Top word illustration, title, audio & option to pick a new word */}
            <div className="w-full flex items-center justify-between gap-2 mb-2 bg-amber-100/60 p-2 sm:p-2.5 rounded-2xl border border-amber-200/80">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white border border-amber-200 flex items-center justify-center shadow-xs overflow-hidden shrink-0">
                  <ChildIllustration
                    type={activeWord.illustrationType}
                    size={38}
                    animated={false}
                  />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] sm:text-[11px] font-bold text-amber-800/70 uppercase tracking-wider">
                      {currentLang === 'de' ? 'Nachfahren:' : 'Tracing:'}
                    </span>
                    {activeWord.wordType && (
                      <span className={`text-[9px] sm:text-[10px] font-black px-1.5 py-0.2 rounded-md ${
                        activeWord.wordType === 'verb'
                          ? 'bg-rose-100 text-rose-800'
                          : activeWord.wordType === 'adjektiv'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {activeWord.wordType === 'verb' ? 'Verb (Tuwort)' : activeWord.wordType === 'adjektiv' ? 'Adjektiv (Wiewort)' : 'Nomen'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-xl sm:text-2xl font-black text-amber-950">
                      {displayFormattedWord}
                    </h2>
                    <button
                      onClick={() => speakText(activeWord.displayWord, currentLang)}
                      title="Ganzes Wort vorlesen"
                      className="p-1 sm:p-1.5 rounded-lg bg-white hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors shadow-2xs active:scale-95 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action buttons: Switch to translation + New Word */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {activeWord.translation && (
                  <button
                    onClick={() => handleSwitchToTranslation(activeWord.translation, currentLang === 'de' ? 'en' : 'de')}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-950 border border-indigo-200 text-xs font-bold shadow-2xs active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                    title={currentLang === 'de' ? `Auf Englisch nachfahren: ${activeWord.translation}` : `Auf Deutsch nachfahren: ${activeWord.translation}`}
                  >
                    <span>{currentLang === 'de' ? '🇬🇧' : '🇩🇪'}</span>
                    <span className="hidden sm:inline">{currentLang === 'de' ? 'Auf Englisch:' : 'Auf Deutsch:'}</span>
                    <span className="underline decoration-indigo-300 font-extrabold">{activeWord.translation}</span>
                  </button>
                )}

                {/* Option during tracing to pick a new word */}
                <button
                  onClick={handlePickNewWord}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-white hover:bg-amber-50 text-amber-950 border border-amber-300 text-xs sm:text-sm font-bold shadow-2xs active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                  title="Anderes Wort zum Nachfahren auswählen"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                  <span>Neues Wort</span>
                </button>
              </div>
            </div>

            {/* Letter Progress Rail */}
            <WordProgressRail
              letters={currentLetters}
              currentIdx={currentLetterIndex}
              onSelectLetter={(idx) => setCurrentLetterIndex(idx)}
            />

            {/* Interactive Tracing Canvas with Anton App Schreibhaus */}
            <div className="w-full mt-1">
              <LetterTracingCanvas
                key={`${currentChar}-${currentLetterIndex}-${workshopVersion}`}
                char={currentChar}
                onLetterCompleted={handleLetterCompleted}
                lang={currentLang}
                onOpenEditor={() => handleOpenWorkshop(currentChar)}
                onPickNewWord={handlePickNewWord}
              />
            </div>
          </div>
        )}

        {/* PHASE 4: WORD CELEBRATION & TRANSLATION */}
        {appPhase === 'word_complete' && activeWord && (
          <WordCelebration
            wordData={{
              ...activeWord,
              detectedWord: displayFormattedWord,
            }}
            onTraceTranslation={handleTraceTranslation}
            onPickNewWord={handlePickNewWord}
            onRepeatWord={handleRepeatWord}
          />
        )}
      </main>

      {/* Buchstaben-Werkstatt Modal */}
      <StrokeEditorModal
        isOpen={isWorkshopOpen}
        onClose={() => setIsWorkshopOpen(false)}
        onSaved={handleWorkshopSaved}
        onPracticeChar={handlePracticeLetter}
        initialChar={workshopInitialChar}
      />

      {/* Erfolge, Historie & Statistik Modal */}
      <HistoryStatsModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectWord={handleSelectWordFromHistory}
      />

      <footer className="py-2.5 px-6 text-center text-xs font-semibold text-amber-900/50 flex items-center justify-center gap-3">
        <span>Nachfahren · Buchstaben & Wörter schreiben lernen</span>
      </footer>
    </div>
  );
}
