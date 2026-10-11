import React, { useState, useEffect, useRef } from 'react';
import { Mic, Sparkles, ArrowRight, Dices, Award } from 'lucide-react';
import { PRESET_WORDS, PresetWord, getAvailablePresetWords } from '../data/wordLibrary';
import { SupportedLanguage, WordMetadata, WordType } from '../types';
import { historyStorage } from '../utils/historyStorage';
import { playSound, speakText } from '../utils/audio';

interface WordRecognizerProps {
  currentLang: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onWordSelected: (metadata: WordMetadata) => void;
  onDirectStart: (metadata: WordMetadata) => void;
  onOpenHistory: () => void;
  initialSentenceHint?: string;
  isRetryMode?: boolean;
  autoStartListening?: boolean;
  onListeningStarted?: () => void;
}

export const WordRecognizer: React.FC<WordRecognizerProps> = ({
  currentLang,
  onLanguageChange,
  onWordSelected,
  onDirectStart,
  onOpenHistory,
  initialSentenceHint,
  isRetryMode = false,
  autoStartListening = false,
  onListeningStarted,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [typedWord, setTypedWord] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcriptPreview, setTranscriptPreview] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | WordType>('all');
  const [shuffleSeed, setShuffleSeed] = useState(0);

  const recognitionInstanceRef = useRef<any>(null);
  const lastTranscriptRef = useRef('');
  const hasDispatchedRef = useRef(false);
  const debounceTimerRef = useRef<any>(null);

  // Get completed words to filter out
  const completedSet = historyStorage.getCompletedWordSet();
  const availableWords = getAvailablePresetWords(completedSet, categoryFilter, 10, shuffleSeed, currentLang);
  const stats = historyStorage.getStats();

  const stopListening = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (recognitionInstanceRef.current) {
      try {
        recognitionInstanceRef.current.abort();
      } catch {
        // ignore
      }
      recognitionInstanceRef.current = null;
    }
    setIsListening(false);
  };

  const startListening = () => {
    stopListening();
    // Stop any synthesizer audio so mic does not pick up voice prompts
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setShowManualInput(true);
      setSpeechError('Auf diesem Gerät ist die automatische Spracherkennung nicht direkt verfügbar. Wähle einfach ein Wort aus!');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = currentLang === 'de' ? 'de-DE' : 'en-US';

      lastTranscriptRef.current = '';
      hasDispatchedRef.current = false;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
        setTranscriptPreview('');
      };

      const dispatchWord = (transcriptToDispatch: string) => {
        const text = transcriptToDispatch.trim();
        if (!text || hasDispatchedRef.current) return;
        hasDispatchedRef.current = true;
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
          debounceTimerRef.current = null;
        }
        stopListening();
        handleSpeechExtracted(text);
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        const isFinal = !!event.results[current].isFinal;

        lastTranscriptRef.current = transcript;
        setTranscriptPreview(transcript);

        if (isFinal) {
          dispatchWord(transcript);
        } else {
          // Auto-commit debounce: When the child pauses for 600ms, commit immediately on attempt 1!
          if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
          }
          debounceTimerRef.current = setTimeout(() => {
            if (lastTranscriptRef.current && !hasDispatchedRef.current) {
              dispatchWord(lastTranscriptRef.current);
            }
          }, 600);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        if (event.error === 'not-allowed') {
          setSpeechError('Mikrofon-Zugriff bitte im Browser erlauben oder unten ein Wort auswählen.');
          stopListening();
        } else if (event.error === 'no-speech') {
          // If no speech event was emitted but we already captured an interim transcript, commit it!
          if (lastTranscriptRef.current && !hasDispatchedRef.current) {
            dispatchWord(lastTranscriptRef.current);
          } else {
            setSpeechError('Es wurde nichts gehört. Bitte sprich etwas lauter oder probiere es noch einmal!');
            stopListening();
          }
        } else {
          if (event.error !== 'aborted') {
            setSpeechError('Spracherkennung kurz nicht erreichbar. Wähle ein Wort oder tippe es ein.');
          }
          stopListening();
        }
      };

      recognition.onend = () => {
        // Fallback: If recognition ended and an interim transcript was captured without isFinal, commit it now!
        if (lastTranscriptRef.current && !hasDispatchedRef.current) {
          dispatchWord(lastTranscriptRef.current);
        } else {
          setIsListening(false);
        }
      };

      recognitionInstanceRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Could not start SpeechRecognition:', err);
      setIsListening(false);
      setSpeechError('Mikrofon konnte nicht direkt gestartet werden. Bitte probiere es erneut!');
    }
  };

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  const toggleListening = () => {
    playSound.tap();
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setShowManualInput(true);
      setSpeechError('Auf diesem Gerät ist die automatische Spracherkennung nicht direkt verfügbar. Wähle einfach ein Wort aus!');
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Directly open microphone when entering retry mode
  useEffect(() => {
    if (autoStartListening && !isListening) {
      // Small timeout to ensure prompt audio is completed and hardware is ready
      const t = setTimeout(() => {
        startListening();
        if (onListeningStarted) onListeningStarted();
      }, 150);
      return () => clearTimeout(t);
    }
  }, [autoStartListening]);

  // Called when speech recognition produces text -> MUST ask via confirmation screen!
  const handleSpeechExtracted = async (text: string) => {
    if (!text.trim()) return;

    const isDe = currentLang === 'de';
    const clean = text.trim();
    // Normalize punctuation
    const tokens = clean
      .toLowerCase()
      .replace(/[.,!?;:"'«»]/g, ' ')
      .split(/\s+/)
      .filter(Boolean);

    // Stop-word filtering for fast instant recognition (e.g. "der Hund", "eine Katze", "das Auto", "Ich habe Sonne gesagt")
    const deStopWords = new Set(['der', 'die', 'das', 'den', 'dem', 'des', 'ein', 'eine', 'einen', 'einem', 'einer', 'mein', 'meine', 'dein', 'deine', 'sein', 'seine', 'ihr', 'ihre', 'ich', 'du', 'er', 'sie', 'es', 'wir', 'habe', 'sehe', 'möchte', 'mag', 'will', 'bitte', 'gesagt', 'wort', 'schreibe', 'ist', 'sind', 'und', 'im', 'in']);
    const enStopWords = new Set(['the', 'a', 'an', 'my', 'your', 'his', 'her', 'their', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'have', 'see', 'like', 'want', 'please', 'said', 'word', 'write', 'is', 'are', 'and', 'in']);
    const stopWords = isDe ? deStopWords : enStopWords;
    const meaningfulTokens = tokens.filter(t => !stopWords.has(t));
    const targetToken = meaningfulTokens.length > 0 ? meaningfulTokens[meaningfulTokens.length - 1] : tokens[tokens.length - 1];

    // 1. FAST-PATH: Direct match or token match in PRESET_WORDS (0ms instant response without delay!)
    const matchedPreset = PRESET_WORDS.find(p => {
      const de = p.de.toLowerCase();
      const en = p.en.toLowerCase();
      return (
        tokens.includes(de) ||
        tokens.includes(en) ||
        meaningfulTokens.includes(de) ||
        meaningfulTokens.includes(en) ||
        clean.toLowerCase() === de ||
        clean.toLowerCase() === en
      );
    });

    if (matchedPreset) {
      onWordSelected({
        detectedWord: isDe ? matchedPreset.de : matchedPreset.en,
        displayWord: isDe ? matchedPreset.de : matchedPreset.en,
        translation: isDe ? matchedPreset.en : matchedPreset.de,
        category: matchedPreset.category,
        wordType: matchedPreset.wordType,
        phonetic: isDe ? matchedPreset.phoneticDe : matchedPreset.phoneticEn,
        simpleSentence: isDe ? matchedPreset.sentenceDe : matchedPreset.sentenceEn,
        illustrationType: matchedPreset.illustrationType,
        color: matchedPreset.color,
        sourceLang: currentLang,
        targetLang: isDe ? 'en' : 'de',
      });
      return;
    }

    // 2. FAST-PATH: Single spoken word or simple phrase with 1 core word (0ms instant response!)
    if (tokens.length === 1 || meaningfulTokens.length === 1) {
      const singleWord = targetToken;
      const isVerb = singleWord.endsWith('en') || singleWord.endsWith('eln') || singleWord.endsWith('ern');
      const isAdj = ['rot', 'blau', 'gelb', 'grün', 'weiß', 'schwarz', 'groß', 'klein', 'schnell', 'bunt', 'stark', 'schön', 'warm', 'kalt', 'lieb', 'nett', 'froh', 'mutig', 'klug'].includes(singleWord);
      const wordType: WordType = isVerb ? 'verb' : isAdj ? 'adjektiv' : 'nomen';
      const formatted = wordType === 'nomen'
        ? singleWord.charAt(0).toUpperCase() + singleWord.slice(1)
        : singleWord.toLowerCase();

      const quickDeToEn: Record<string, string> = {
        koala: 'koala', katze: 'cat', hund: 'dog', sonne: 'sun', mond: 'moon', stern: 'star',
        auto: 'car', haus: 'house', baum: 'tree', fisch: 'fish', blume: 'flower', ball: 'ball',
        apfel: 'apple', herz: 'heart', vogel: 'bird', maus: 'mouse', pferd: 'horse', elefant: 'elephant',
        löwe: 'lion', lowe: 'lion', tiger: 'tiger', affe: 'monkey', panda: 'panda', pinguin: 'penguin',
        zebra: 'zebra', frosch: 'frog', hase: 'rabbit', kuh: 'cow', schwein: 'pig', schaf: 'sheep',
        ente: 'duck', bär: 'bear', bar: 'bear', wolke: 'cloud', regenbogen: 'rainbow', buch: 'book',
        eis: 'ice cream', zug: 'train', flugzeug: 'airplane', rakete: 'rocket', uhr: 'clock', krone: 'crown',
        laufen: 'run', schwimmen: 'swim', malen: 'paint', singen: 'sing', spielen: 'play', schlafen: 'sleep',
        fliegen: 'fly', essen: 'eat', schnell: 'fast', bunt: 'colorful', groß: 'big', klein: 'small',
        stark: 'strong', schön: 'pretty', mutig: 'brave',
      };
      const quickEnToDe: Record<string, string> = {
        koala: 'Koala', cat: 'Katze', dog: 'Hund', sun: 'Sonne', moon: 'Mond', star: 'Stern',
        car: 'Auto', house: 'Haus', tree: 'Baum', fish: 'Fisch', flower: 'Blume', ball: 'Ball',
        apple: 'Apfel', heart: 'Herz', bird: 'Vogel', mouse: 'Maus', horse: 'Pferd', elephant: 'Elefant',
        lion: 'Löwe', tiger: 'Tiger', monkey: 'Affe', panda: 'Panda', penguin: 'Pinguin',
        zebra: 'Zebra', frog: 'Frosch', rabbit: 'Hase', cow: 'Kuh', pig: 'Schwein', sheep: 'Schaf',
        duck: 'Ente', bear: 'Bär', cloud: 'Wolke', rainbow: 'Regenbogen', book: 'Buch',
        train: 'Zug', airplane: 'Flugzeug', rocket: 'Rakete', clock: 'Uhr', crown: 'Krone',
        run: 'laufen', swim: 'schwimmen', paint: 'malen', sing: 'singen', play: 'spielen', sleep: 'schlafen',
        fly: 'fliegen', eat: 'essen', fast: 'schnell', colorful: 'bunt', big: 'groß', small: 'klein',
        strong: 'stark', pretty: 'schön', brave: 'mutig',
      };
      const fastTrans = isDe
        ? (quickDeToEn[singleWord.toLowerCase()] || '')
        : (quickEnToDe[singleWord.toLowerCase()] || '');

      onWordSelected({
        detectedWord: formatted,
        displayWord: formatted,
        translation: fastTrans,
        category: isVerb ? 'Verben (Tuwörter)' : isAdj ? 'Adjektive (Wiewörter)' : 'Nomen',
        wordType: wordType,
        phonetic: formatted,
        simpleSentence: '',
        illustrationType: singleWord.toLowerCase(),
        color: '#3b82f6',
        sourceLang: currentLang,
        targetLang: isDe ? 'en' : 'de',
      });
      return;
    }

    // 3. Fallback for custom full sentence requiring server extraction
    setIsProcessing(true);

    try {
      const response = await fetch('/api/process-word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spokenText: text,
          sourceLang: currentLang,
          targetLang: currentLang === 'de' ? 'en' : 'de',
          isSentenceRetry: isRetryMode,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        onWordSelected({
          detectedWord: data.detectedWord || text,
          displayWord: data.displayWord || text,
          translation: data.translation || '',
          category: data.category || 'Wörter',
          wordType: data.wordType,
          phonetic: data.phonetic,
          simpleSentence: data.simpleSentence,
          illustrationType: data.illustrationType || 'generic',
          color: data.color || '#f59e0b',
          sourceLang: currentLang,
          targetLang: currentLang === 'de' ? 'en' : 'de',
        });
        return;
      }
    } catch (err) {
      console.warn('API extraction error, using client fallback:', err);
    } finally {
      setIsProcessing(false);
    }

    // Client fallback
    onWordSelected({
      detectedWord: text.trim(),
      displayWord: text.trim(),
      translation: currentLang === 'de' ? 'Word' : 'Wort',
      category: 'Wörter',
      illustrationType: 'generic',
      color: '#f59e0b',
      sourceLang: currentLang,
      targetLang: currentLang === 'de' ? 'en' : 'de',
    });
  };

  // Called when user picks a card from suggestions:
  // "Wenn ich ein Wort aus der Liste auswähle, muss er mich nicht mehr fragen, ob ich das Wort gesagt habe. Er soll das Wort aber einmal vorlesen."
  const handleCardClick = (preset: PresetWord) => {
    playSound.tap();
    const word = currentLang === 'de' ? preset.de : preset.en;
    const trans = currentLang === 'de' ? preset.en : preset.de;

    const metadata: WordMetadata = {
      detectedWord: word,
      displayWord: word,
      translation: trans,
      category: preset.category,
      wordType: preset.wordType,
      phonetic: currentLang === 'de' ? preset.phoneticDe : preset.phoneticEn,
      simpleSentence: currentLang === 'de' ? preset.sentenceDe : preset.sentenceEn,
      illustrationType: preset.illustrationType,
      color: preset.color,
      sourceLang: currentLang,
      targetLang: currentLang === 'de' ? 'en' : 'de',
    };

    // Read word aloud once
    speakText(word, currentLang);

    // Directly start writing without asking!
    onDirectStart(metadata);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedWord.trim()) return;
    playSound.tap();
    const clean = typedWord.trim();
    speakText(clean, currentLang);
    onDirectStart({
      detectedWord: clean,
      displayWord: clean,
      translation: '',
      category: 'Wörter',
      illustrationType: 'generic',
      color: '#3b82f6',
      sourceLang: currentLang,
      targetLang: currentLang === 'de' ? 'en' : 'de',
    });
  };

  const handleShuffle = () => {
    playSound.tap();
    setShuffleSeed(prev => prev + 1);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-3 flex flex-col items-center text-center">
      {/* Top Banner with Stats button */}
      <div className="w-full flex items-center justify-between mb-2">
        <button
          onClick={onOpenHistory}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs transition-colors shadow-2xs"
        >
          <Award className="w-3.5 h-3.5 text-amber-700" />
          <span>Erfolge & Historie ({stats.totalWords} Wörter)</span>
        </button>

        {/* Language Selection Segment */}
        <div className="flex items-center gap-1.5 p-1 bg-amber-100/90 rounded-2xl border border-amber-200 shadow-2xs">
          <span className="text-[11px] font-bold text-amber-900/70 pl-2 hidden sm:inline">Sprache:</span>
          <button
            onClick={() => {
              playSound.tap();
              onLanguageChange('de');
            }}
            title="Wörter auf Deutsch sprechen & schreiben"
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentLang === 'de'
                ? 'bg-white text-amber-950 shadow-xs font-black'
                : 'text-amber-900/70 hover:text-amber-950'
            }`}
          >
            🇩🇪 Deutsch
          </button>
          <button
            onClick={() => {
              playSound.tap();
              onLanguageChange('en');
            }}
            title="Speak & write words in English"
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentLang === 'en'
                ? 'bg-white text-amber-950 shadow-xs font-black'
                : 'text-amber-900/70 hover:text-amber-950'
            }`}
          >
            🇬🇧 English
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="space-y-1.5 mb-4">
        <h1 className="font-display text-3xl sm:text-4xl font-black text-amber-950 tracking-tight">
          {currentLang === 'de' ? 'Was möchtest du nachfahren?' : 'What do you want to trace?'}
        </h1>
        <p className="text-sm sm:text-base font-medium text-amber-900/70 max-w-xl mx-auto">
          {isRetryMode
            ? currentLang === 'de'
              ? 'Verwende das Wort im ganzen Satz!'
              : 'Use the word in a full sentence!'
            : currentLang === 'de'
            ? 'Sprich ins Mikrofon oder tippe direkt auf eine Wortkarte zum Loslegen!'
            : 'Speak into the mic or tap a word card to start tracing!'}
        </p>
      </div>

      {/* Big Tactile Microphone Button */}
      <div className="relative my-3 flex items-center justify-center">
        {isListening && (
          <>
            <div className="absolute w-36 h-36 rounded-full bg-amber-400/20 animate-ping" />
            <div className="absolute w-48 h-48 rounded-full bg-orange-300/25 animate-pulse" />
          </>
        )}

        <button
          onClick={toggleListening}
          disabled={isProcessing}
          aria-label={isListening ? 'Zuhören beenden' : 'Mikrofon aktivieren'}
          className={`relative z-10 w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center text-white shadow-lg transition-all duration-300 active:scale-90 ${
            isListening
              ? 'bg-gradient-to-tr from-rose-500 to-red-500 scale-105 shadow-rose-500/40'
              : 'bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 hover:scale-105 hover:shadow-xl shadow-orange-500/30'
          }`}
        >
          {isProcessing ? (
            <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 animate-spin text-white" />
          ) : isListening ? (
            <Mic className="w-12 h-12 sm:w-14 sm:h-14 animate-bounce text-white" />
          ) : (
            <Mic className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
          )}

          <span className="mt-0.5 text-[11px] font-black uppercase tracking-wider">
            {isProcessing
              ? (currentLang === 'de' ? 'Zaubert...' : 'Thinking...')
              : isListening
              ? (currentLang === 'de' ? 'Ich höre zu!' : 'Listening!')
              : (currentLang === 'de' ? 'Sprechen' : 'Speak')}
          </span>
        </button>
      </div>

      {/* Live transcript feedback */}
      {transcriptPreview && (
        <div className="mt-2 px-5 py-2 bg-amber-50 rounded-2xl border border-amber-200 text-amber-950 text-base sm:text-lg font-bold animate-pulse">
          🗣️ „{transcriptPreview}“
        </div>
      )}

      {speechError && (
        <div className="mt-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-xl text-orange-950 text-xs font-medium max-w-md">
          {speechError}
        </div>
      )}

      {/* Keyboard input option */}
      <div className="mt-2 mb-4 w-full max-w-md">
        {!showManualInput ? (
          <button
            onClick={() => setShowManualInput(true)}
            className="text-xs font-bold text-amber-900/60 hover:text-amber-900 underline underline-offset-4 transition-colors"
          >
            {currentLang === 'de' ? 'Oder eigenes Wort tippen ⌨️' : 'Or type your own word ⌨️'}
          </button>
        ) : (
          <form onSubmit={handleManualSubmit} className="flex gap-2 p-1 bg-white rounded-2xl border-2 border-amber-300 shadow-sm">
            <input
              type="text"
              value={typedWord}
              onChange={(e) => setTypedWord(e.target.value)}
              placeholder={currentLang === 'de' ? 'Z.B. laufen, Katze, schnell...' : 'E.g. run, cat, fast...'}
              className="flex-1 px-3 py-1.5 text-base font-bold text-slate-800 placeholder:text-slate-400 focus:outline-hidden"
              autoFocus
            />
            <button
              type="submit"
              disabled={!typedWord.trim()}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold rounded-xl transition-colors flex items-center gap-1 text-sm"
            >
              <span>Los</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </div>

      {/* PRESET SUGGESTIONS SECTION WITH SHUFFLE & FILTERS */}
      <div className="w-full text-left space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          {/* Word Category filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-amber-100/60 rounded-xl border border-amber-200/60 text-xs font-bold">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                categoryFilter === 'all' ? 'bg-white text-amber-950 shadow-2xs' : 'text-amber-900/70 hover:text-amber-950'
              }`}
            >
              Alle
            </button>
            <button
              onClick={() => setCategoryFilter('nomen')}
              className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                categoryFilter === 'nomen' ? 'bg-white text-blue-900 shadow-2xs' : 'text-blue-900/70 hover:text-blue-950'
              }`}
            >
              <span className="w-2 h-2 rounded-xs bg-blue-500" />
              <span>Nomen</span>
            </button>
            <button
              onClick={() => setCategoryFilter('verb')}
              className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                categoryFilter === 'verb' ? 'bg-white text-rose-900 shadow-2xs' : 'text-rose-900/70 hover:text-rose-950'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Verben</span>
            </button>
            <button
              onClick={() => setCategoryFilter('adjektiv')}
              className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                categoryFilter === 'adjektiv' ? 'bg-white text-amber-950 shadow-2xs' : 'text-amber-900/70 hover:text-amber-950'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Adjektive</span>
            </button>
          </div>

          {/* Shuffle button */}
          <button
            onClick={handleShuffle}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-amber-200 hover:bg-amber-50 text-amber-900 text-xs font-bold transition-all shadow-2xs self-start sm:self-auto"
          >
            <Dices className="w-3.5 h-3.5 text-amber-700" />
            <span>Neue Wörter würfeln</span>
          </button>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
          {availableWords.map((preset) => {
            const word = currentLang === 'de' ? preset.de : preset.en;
            return (
              <button
                key={`${preset.de}-${preset.wordType}`}
                onClick={() => handleCardClick(preset)}
                className="flex flex-col items-center justify-center p-3 bg-white hover:bg-amber-50/90 border border-amber-100 hover:border-amber-300 rounded-2xl shadow-2xs hover:shadow-sm transition-all active:scale-95 text-center group cursor-pointer"
              >
                <span className="text-3xl mb-1 transform group-hover:scale-110 transition-transform">
                  {preset.emoji}
                </span>
                <span className="font-display font-black text-slate-800 text-sm tracking-wide">
                  {word}
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md mt-1 ${
                  preset.wordType === 'verb'
                    ? 'bg-rose-100 text-rose-800'
                    : preset.wordType === 'adjektiv'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {preset.wordType === 'verb' ? 'Verb' : preset.wordType === 'adjektiv' ? 'Adjektiv' : 'Nomen'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
