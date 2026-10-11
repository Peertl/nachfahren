// Audio synthesizer using Web Audio API for zero latency and no external audio file dependencies

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const playSound = {
  tap: () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // Audio autoplay policy fallback
    }
  },

  strokeSuccess: () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.12); // E5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {
      // Ignore
    }
  },

  letterComplete: () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      // Arpeggio C5 -> E5 -> G5 -> C6
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.18, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.25);
      });
    } catch {
      // Ignore
    }
  },

  wordCelebration: () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      // Fanfare G4 -> C5 -> E5 -> G5 -> C6 sustained
      const notes = [392.0, 523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = idx === notes.length - 1 ? 'triangle' : 'sine';
        const start = now + idx * 0.1;
        const dur = idx === notes.length - 1 ? 0.7 : 0.2;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.22, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + dur);
      });
    } catch {
      // Ignore
    }
  },

  encouragement: () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(392, now + 0.25);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // Ignore
    }
  },
};

// Speech Synthesis Helper with high-quality natural voice selection
let cachedVoices: SpeechSynthesisVoice[] = [];
let isVoicesLoaded = false;

function loadVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    cachedVoices = voices;
    isVoicesLoaded = true;
  }
  return cachedVoices;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    loadVoices();
  };
}

// Find the most natural, human-sounding voice for a language
function findBestNaturalVoice(langCode: string): SpeechSynthesisVoice | undefined {
  const voices = cachedVoices.length > 0 ? cachedVoices : loadVoices();
  if (!voices || voices.length === 0) return undefined;

  const targetPrefix = langCode.slice(0, 2).toLowerCase(); // 'de', 'en', etc.
  const langVoices = voices.filter(v => v.lang.toLowerCase().startsWith(targetPrefix));
  if (langVoices.length === 0) return undefined;

  // Score voices: prioritize Neural / Natural / Google / Premium / Enhanced voices
  const scored = langVoices.map(voice => {
    let score = 0;
    const nameLower = voice.name.toLowerCase();

    // Highest quality neural/natural online voices
    if (nameLower.includes('natural')) score += 100;
    if (nameLower.includes('neural')) score += 100;
    if (nameLower.includes('online')) score += 50;
    if (nameLower.includes('google')) score += 80; // Google Deutsch in Chrome is exceptionally natural
    if (nameLower.includes('premium')) score += 70;
    if (nameLower.includes('enhanced')) score += 60;

    // Friendly female / child-suited voices on Apple/Windows
    if (nameLower.includes('anna') || nameLower.includes('katja') || nameLower.includes('marlene')) score += 40;
    if (nameLower.includes('conrad') || nameLower.includes('markus') || nameLower.includes('martin')) score += 30;

    // Penalize robotic compact voices
    if (nameLower.includes('compact')) score -= 40;
    if (nameLower.includes('espeak')) score -= 80;

    // Exact regional match (e.g. de-DE)
    if (voice.lang.toLowerCase() === langCode.toLowerCase()) score += 15;

    return { voice, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.voice;
}

let isCurrentlySpeaking = false;

export function isSpeaking(): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
  return isCurrentlySpeaking || window.speechSynthesis.speaking;
}

export function speakText(
  text: string,
  lang: 'de' | 'en' | 'es' | 'fr' = 'de',
  onEnd?: () => void
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return false;
  }

  try {
    window.speechSynthesis.cancel(); // Stop previous utterance

    const utterance = new SpeechSynthesisUtterance(text);
    const langCode = lang === 'de' ? 'de-DE' : lang === 'en' ? 'en-US' : lang === 'es' ? 'es-ES' : 'fr-FR';
    utterance.lang = langCode;

    // Natural child-friendly cadence (warm, clear, slightly relaxed speed)
    utterance.rate = 0.94;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const naturalVoice = findBestNaturalVoice(langCode);
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    isCurrentlySpeaking = true;

    const cleanup = () => {
      isCurrentlySpeaking = false;
      if (onEnd) onEnd();
    };

    utterance.onend = cleanup;
    utterance.onerror = cleanup;

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (e) {
    console.warn('SpeechSynthesis error:', e);
    isCurrentlySpeaking = false;
    if (onEnd) onEnd();
    return false;
  }
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
