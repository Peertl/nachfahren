export interface StrokePoint {
  x: number; // 0 to 100 percentage
  y: number; // 0 to 100 percentage
}

export interface LetterStroke {
  id: number;
  label: string; // e.g., "1. Von oben nach unten links"
  start: StrokePoint;
  end: StrokePoint;
  pathD: string; // SVG path command string
  checkpoints: StrokePoint[]; // Intermediate points to ensure correct direction & order
}

export type HouseFloor = 'roof' | 'living' | 'cellar'; // Dach, Wohnbereich, Keller

export interface LetterData {
  char: string;
  isUpper: boolean;
  floors: HouseFloor[]; // Which floors the letter occupies in the Schreibhaus
  strokes: LetterStroke[];
}

export type SupportedLanguage = 'de' | 'en' | 'es' | 'fr';

export type LetterCasingMode = 'title' | 'upper' | 'lower'; // Katze | KATZE | katze

export type WordType = 'nomen' | 'verb' | 'adjektiv';

export interface WordMetadata {
  detectedWord: string;
  displayWord: string;
  translation: string;
  category: string;
  wordType?: WordType;
  phonetic?: string;
  simpleSentence?: string;
  illustrationType: string;
  color?: string;
  sourceLang: SupportedLanguage;
  targetLang: SupportedLanguage;
}

export type AppPhase =
  | 'input'           // Child speaks or selects word
  | 'confirm'         // App read it aloud; child gives thumbs up/down
  | 'retry_prompt'    // Thumbs down: app asks to repeat or use in sentence
  | 'trace'           // Tracing letters stroke by stroke
  | 'word_complete';  // Word mastered, celebration, English translation switch

export interface SoundEffectOptions {
  volume?: number;
}
