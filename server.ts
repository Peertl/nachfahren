import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Endpoint to process speech / sentence and extract target word (Nomen, Verb, or Adjektiv)
app.post('/api/process-word', async (req: Request, res: Response) => {
  try {
    const { spokenText, sourceLang = 'de', targetLang = 'en', isSentenceRetry = false } = req.body;

    if (!spokenText || typeof spokenText !== 'string') {
      return res.status(400).json({ error: 'spokenText is required' });
    }

    const trimmed = spokenText.trim();

    // Fast-path: If single word or matches dictionary, answer immediately in 1ms!
    const cleanWord = extractFallbackWord(trimmed, sourceLang);
    const knownTrans = getFallbackTranslation(cleanWord, sourceLang);
    const isSingleWord = !trimmed.trim().includes(' ');
    if (isSingleWord || (knownTrans && knownTrans.toLowerCase() !== cleanWord.toLowerCase())) {
      const wordType = detectWordType(cleanWord);
      const displayWord = formatWordByType(cleanWord, wordType);
      return res.json({
        detectedWord: displayWord,
        displayWord: displayWord,
        wordType: wordType,
        translation: knownTrans.toLowerCase() !== cleanWord.toLowerCase() ? knownTrans : '',
        category: wordType === 'verb' ? 'Verben (Tuwörter)' : wordType === 'adjektiv' ? 'Adjektive (Wiewörter)' : 'Nomen',
        phonetic: displayWord,
        simpleSentence: `${displayWord}`,
        illustrationType: mapIllustrationType(displayWord),
        color: wordType === 'verb' ? '#ef4444' : wordType === 'adjektiv' ? '#f59e0b' : '#3b82f6',
      });
    }

    // If Gemini is available, use it for intelligent sentence parsing & translation
    if (ai) {
      try {
        const prompt = `
Du bist ein Sprach- und Schreib-Lernassistent für Kinder im Alter von 5 bis 8 Jahren (App "Nachfahren").
Das Kind hat folgenden Text eingesprochen (${sourceLang === 'de' ? 'auf Deutsch' : 'auf Englisch'}): "${trimmed}".
${isSentenceRetry ? 'Hinweis: Das Kind sollte das Wort in einem Satz verwenden, da es zuvor nicht richtig erkannt wurde.' : ''}

WICHTIG: Das Wort kann ein Substantiv/Nomen (z.B. Katze, Hund), ein VERB / Tuwort (z.B. laufen, schwimmen, malen, singen, springen, lachen, schlafen, spielen) oder ein ADJEKTIV / Wiewort (z.B. schnell, bunt, groß, klein, lustig, schön, stark) sein!
Beachte die deutsche Rechtschreibung der Grundschule:
- Nomen werden großgeschrieben (z.B. "Katze")
- Verben werden kleingeschrieben (z.B. "laufen")
- Adjektive werden kleingeschrieben (z.B. "schnell")

Antworte NUR mit reinem JSON im folgenden Format:
{
  "word": "laufen",
  "wordType": "verb",
  "translation": "run",
  "category": "Verben",
  "phonetic": "lau-fen",
  "simpleSentence": "Ich kann ganz schnell laufen.",
  "illustrationType": "run",
  "color": "#ef4444"
}

Erlaubte wordType: "nomen", "verb", "adjektiv".
Erlaubte illustrationType: "cat", "dog", "sun", "moon", "star", "car", "house", "tree", "fish", "flower", "ball", "apple", "heart", "bird", "run", "swim", "paint", "sing", "fly", "sleep", "play", "fast", "colorful", "strong", "generic".
`;

        // Fast race: max 2.2 seconds for Gemini, otherwise instant fallback
        const geminiPromise = ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Gemini timeout')), 2200)
        );

        const response = await Promise.race([geminiPromise, timeoutPromise]);

        const textOutput = response.text?.trim();
        if (textOutput) {
          const parsed = JSON.parse(textOutput);
          const word = parsed.word || trimmed;
          const wordType = parsed.wordType || detectWordType(word);
          const displayWord = formatWordByType(word, wordType);

          return res.json({
            detectedWord: displayWord,
            displayWord: displayWord,
            wordType: wordType,
            translation: parsed.translation || '',
            category: parsed.category || (wordType === 'verb' ? 'Verben (Tuwörter)' : wordType === 'adjektiv' ? 'Adjektive (Wiewörter)' : 'Nomen'),
            phonetic: parsed.phonetic || '',
            simpleSentence: parsed.simpleSentence || '',
            illustrationType: parsed.illustrationType || mapIllustrationType(displayWord),
            color: parsed.color || '#3b82f6',
          });
        }
      } catch (geminiError) {
        console.warn('Gemini extraction fallback:', geminiError);
      }
    }

    // Fast robust fallback when Gemini is offline or not configured
    const fallbackWord = extractFallbackWord(trimmed, sourceLang);
    const wordType = detectWordType(fallbackWord);
    const displayWord = formatWordByType(fallbackWord, wordType);
    const translation = getFallbackTranslation(displayWord, sourceLang);

    return res.json({
      detectedWord: displayWord,
      displayWord: displayWord,
      wordType: wordType,
      translation: translation,
      category: wordType === 'verb' ? 'Verben (Tuwörter)' : wordType === 'adjektiv' ? 'Adjektive (Wiewörter)' : 'Nomen',
      phonetic: displayWord,
      simpleSentence: sourceLang === 'de' ? `Hier ist das Wort: ${displayWord}` : `Here is the word: ${displayWord}`,
      illustrationType: mapIllustrationType(displayWord),
      color: '#3b82f6',
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error processing word' });
  }
});

function detectWordType(word: string): 'nomen' | 'verb' | 'adjektiv' {
  const w = word.toLowerCase();
  const verbs = new Set(['laufen', 'schwimmen', 'malen', 'singen', 'springen', 'spielen', 'lachen', 'schlafen', 'fliegen', 'essen', 'tanzen', 'lesen', 'sehen', 'hören', 'gehen', 'run', 'swim', 'paint', 'sing', 'jump', 'play', 'laugh', 'sleep', 'fly', 'eat', 'dance']);
  const adjs = new Set(['schnell', 'bunt', 'groß', 'klein', 'lustig', 'schön', 'stark', 'leise', 'laut', 'mutig', 'warm', 'kalt', 'fast', 'colorful', 'big', 'small', 'funny', 'pretty', 'strong', 'quiet', 'loud', 'brave', 'warm', 'cold']);

  if (verbs.has(w) || w.endsWith('en') && w.length > 4 && !w.startsWith('kuch') && !w.startsWith('gart')) {
    return 'verb';
  }
  if (adjs.has(w) || w.endsWith('ig') || w.endsWith('lich')) {
    return 'adjektiv';
  }
  return 'nomen';
}

function formatWordByType(word: string, type: 'nomen' | 'verb' | 'adjektiv'): string {
  if (type === 'verb' || type === 'adjektiv') {
    return word.toLowerCase();
  }
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function extractFallbackWord(text: string, lang: string): string {
  const words = text
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 1) {
    return words[0];
  }

  const deStopWords = new Set(['ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'der', 'die', 'das', 'ein', 'eine', 'einen', 'einem', 'einer', 'sehe', 'mag', 'habe', 'ist', 'sind', 'und', 'in', 'im', 'mein', 'meine', 'kann', 'will', 'möchte', 'gesagt', 'wort']);
  const enStopWords = new Set(['i', 'you', 'he', 'she', 'it', 'we', 'they', 'the', 'a', 'an', 'see', 'like', 'have', 'is', 'are', 'and', 'in', 'my', 'can', 'want', 'said', 'word']);

  const stopWords = lang === 'de' ? deStopWords : enStopWords;
  const filtered = words.filter(w => !stopWords.has(w.toLowerCase()));

  if (filtered.length > 0) {
    return filtered[filtered.length - 1];
  }

  return words[0] || 'Katze';
}

function getFallbackTranslation(word: string, lang: string): string {
  const dictDeToEn: Record<string, string> = {
    katze: 'Cat',
    hund: 'Dog',
    sonne: 'Sun',
    mond: 'Moon',
    stern: 'Star',
    auto: 'Car',
    haus: 'House',
    baum: 'Tree',
    fisch: 'Fish',
    blume: 'Flower',
    ball: 'Ball',
    apfel: 'Apple',
    herz: 'Heart',
    vogel: 'Bird',
    koala: 'Koala',
    äpfel: 'Apples',
    öl: 'Oil',
    übung: 'Practice',
    // Verben
    laufen: 'run',
    schwimmen: 'swim',
    malen: 'paint',
    singen: 'sing',
    spielen: 'play',
    lachen: 'laugh',
    schlafen: 'sleep',
    fliegen: 'fly',
    essen: 'eat',
    tanzen: 'dance',
    springen: 'jump',
    // Adjektive
    schnell: 'fast',
    bunt: 'colorful',
    groß: 'big',
    klein: 'small',
    lustig: 'funny',
    stark: 'strong',
    schön: 'pretty',
    mutig: 'brave',
  };

  const dictEnToDe: Record<string, string> = {
    cat: 'Katze',
    dog: 'Hund',
    sun: 'Sonne',
    moon: 'Mond',
    star: 'Stern',
    car: 'Auto',
    house: 'Haus',
    tree: 'Baum',
    fish: 'Fisch',
    flower: 'Blume',
    ball: 'Ball',
    apple: 'Apfel',
    heart: 'Herz',
    bird: 'Vogel',
    koala: 'Koala',
    apples: 'Äpfel',
    oil: 'Öl',
    practice: 'Übung',
    // Verben
    run: 'laufen',
    swim: 'schwimmen',
    paint: 'malen',
    sing: 'singen',
    play: 'spielen',
    laugh: 'lachen',
    sleep: 'schlafen',
    fly: 'fliegen',
    eat: 'essen',
    dance: 'tanzen',
    jump: 'springen',
    // Adjektive
    fast: 'schnell',
    colorful: 'bunt',
    big: 'groß',
    small: 'klein',
    funny: 'lustig',
    strong: 'stark',
    pretty: 'schön',
    brave: 'mutig',
  };

  const lower = word.toLowerCase();
  if (lang === 'de') {
    return dictDeToEn[lower] || word;
  }
  return dictEnToDe[lower] || word;
}

function mapIllustrationType(word: string): string {
  const w = word.toLowerCase();
  if (w.includes('katz') || w.includes('cat')) return 'cat';
  if (w.includes('hund') || w.includes('dog')) return 'dog';
  if (w.includes('sonn') || w.includes('sun')) return 'sun';
  if (w.includes('mond') || w.includes('moon')) return 'moon';
  if (w.includes('stern') || w.includes('star')) return 'star';
  if (w.includes('auto') || w.includes('car')) return 'car';
  if (w.includes('haus') || w.includes('house')) return 'house';
  if (w.includes('baum') || w.includes('tree')) return 'tree';
  if (w.includes('fisch') || w.includes('fish')) return 'fish';
  if (w.includes('blum') || w.includes('flower')) return 'flower';
  if (w.includes('ball')) return 'ball';
  if (w.includes('apfel') || w.includes('apple')) return 'apple';
  if (w.includes('herz') || w.includes('heart')) return 'heart';
  if (w.includes('vogel') || w.includes('bird')) return 'bird';
  if (w.includes('koala')) return 'koala';
  // Verbs & Adjectives
  if (w.includes('lauf') || w.includes('run')) return 'run';
  if (w.includes('schwimm') || w.includes('swim')) return 'swim';
  if (w.includes('mal') || w.includes('paint')) return 'paint';
  if (w.includes('sing')) return 'sing';
  if (w.includes('flieg') || w.includes('fly')) return 'fly';
  if (w.includes('schlaf') || w.includes('sleep')) return 'sleep';
  if (w.includes('spiel') || w.includes('play')) return 'play';
  if (w.includes('schnell') || w.includes('fast')) return 'fast';
  if (w.includes('bunt') || w.includes('color')) return 'colorful';
  if (w.includes('stark') || w.includes('strong')) return 'strong';
  return 'generic';
}

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Nachfahren child learning server running on port ${port}`);
  });
}

startServer();
