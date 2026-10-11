import { WordType } from '../types';

export interface CompletedWordItem {
  id: string;
  word: string;
  wordType?: WordType;
  lang: string;
  timestamp: number;
  letterCount: number;
}

const STORAGE_KEY = 'nachfahren_history_words';

export const historyStorage = {
  getCompletedWords(): CompletedWordItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch (e) {
      console.warn('Error reading history words:', e);
      return [];
    }
  },

  getCompletedWordSet(): Set<string> {
    const list = this.getCompletedWords();
    const set = new Set<string>();
    list.forEach(item => {
      set.add(item.word.toLowerCase());
    });
    return set;
  },

  addCompletedWord(word: string, wordType?: WordType, lang: string = 'de'): void {
    if (typeof window === 'undefined') return;
    try {
      const list = this.getCompletedWords();
      // Remove any previous entry for this exact word so the newest is at the top
      const filtered = list.filter(item => item.word.toLowerCase() !== word.toLowerCase());
      const newItem: CompletedWordItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        word,
        wordType,
        lang,
        timestamp: Date.now(),
        letterCount: word.replace(/[^a-zA-ZÄÖÜäöüß]/g, '').length,
      };
      filtered.unshift(newItem);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (e) {
      console.warn('Error saving completed word:', e);
    }
  },

  getStats() {
    const list = this.getCompletedWords();
    const totalWords = list.length;
    let totalLetters = 0;
    let nomenCount = 0;
    let verbCount = 0;
    let adjektivCount = 0;

    list.forEach(item => {
      totalLetters += item.letterCount;
      if (item.wordType === 'verb') verbCount++;
      else if (item.wordType === 'adjektiv') adjektivCount++;
      else nomenCount++;
    });

    return {
      totalWords,
      totalLetters,
      nomenCount,
      verbCount,
      adjektivCount,
    };
  },

  clearHistory(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  },
};
