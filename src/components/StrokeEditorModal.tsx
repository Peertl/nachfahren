import React, { useState, useEffect } from 'react';
import { X, ArrowUp, ArrowDown, RotateCw, RotateCcw, Check, RefreshCw, Sparkles, HelpCircle } from 'lucide-react';
import { LetterData, LetterStroke, HouseFloor } from '../types';
import { CANONICAL_LETTER_STROKES } from '../data/letterStrokes';
import { strokeStorage } from '../utils/strokeStorage';
import { SchreibhausGuide } from './SchreibhausGuide';
import { playSound } from '../utils/audio';
import { reverseSvgPathD } from '../utils/svgPathUtils';

interface StrokeEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  onPracticeChar?: (char: string) => void;
  initialChar?: string;
}

export const StrokeEditorModal: React.FC<StrokeEditorModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  onPracticeChar,
  initialChar = 'A',
}) => {
  const [selectedChar, setSelectedChar] = useState<string>(initialChar);
  const [letterData, setLetterData] = useState<LetterData>(strokeStorage.getLetter(initialChar));
  const [activeTab, setActiveTab] = useState<'upper' | 'lower' | 'umlauts'>('upper');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialChar) {
      const norm = initialChar.normalize('NFC');
      setSelectedChar(norm);
      setLetterData(strokeStorage.getLetter(norm));
      if (['Ä', 'Ö', 'Ü', 'ä', 'ö', 'ü', 'ß'].includes(norm)) {
        setActiveTab('umlauts');
      } else if (norm.toLowerCase() === norm && norm !== norm.toUpperCase()) {
        setActiveTab('lower');
      } else {
        setActiveTab('upper');
      }
    }
  }, [initialChar, isOpen]);

  if (!isOpen) return null;

  const handleSelectChar = (char: string) => {
    const norm = char.normalize('NFC');
    playSound.tap();
    setSelectedChar(norm);
    setLetterData(strokeStorage.getLetter(norm));
    setHasUnsavedChanges(false);
    setSuccessMessage(null);
  };

  // Reorder stroke up
  const handleMoveStrokeUp = (index: number) => {
    if (index === 0) return;
    playSound.tap();
    const newStrokes = [...letterData.strokes];
    const temp = newStrokes[index - 1];
    newStrokes[index - 1] = newStrokes[index];
    newStrokes[index] = temp;

    // renumber ids & labels
    const updated = newStrokes.map((s, i) => ({
      ...s,
      id: i + 1,
      label: `${i + 1}. ${s.label.replace(/^\d+\.\s*/, '')}`,
    }));

    setLetterData(prev => ({ ...prev, strokes: updated }));
    setHasUnsavedChanges(true);
  };

  // Reorder stroke down
  const handleMoveStrokeDown = (index: number) => {
    if (index === letterData.strokes.length - 1) return;
    playSound.tap();
    const newStrokes = [...letterData.strokes];
    const temp = newStrokes[index + 1];
    newStrokes[index + 1] = newStrokes[index];
    newStrokes[index] = temp;

    // renumber ids & labels
    const updated = newStrokes.map((s, i) => ({
      ...s,
      id: i + 1,
      label: `${i + 1}. ${s.label.replace(/^\d+\.\s*/, '')}`,
    }));

    setLetterData(prev => ({ ...prev, strokes: updated }));
    setHasUnsavedChanges(true);
  };

  // Invert stroke start & end direction
  const handleReverseStroke = (index: number) => {
    playSound.tap();
    const newStrokes = [...letterData.strokes];
    const stroke = newStrokes[index];

    // Swap start and end
    const swappedStart = { ...stroke.end };
    const swappedEnd = { ...stroke.start };
    const reversedCheckpoints = stroke.checkpoints ? [...stroke.checkpoints].reverse() : [];
    const reversedPath = reverseSvgPathD(stroke.pathD);

    // Ensure swapped start matches the exact M coordinates of the reversed path
    const m = reversedPath.match(/M\s*([\d.-]+)[\s,]+([\d.-]+)/);
    const actualStart = m ? { x: parseFloat(m[1]), y: parseFloat(m[2]) } : swappedStart;

    newStrokes[index] = {
      ...stroke,
      start: actualStart,
      end: swappedEnd,
      checkpoints: reversedCheckpoints,
      pathD: reversedPath,
      label: `${index + 1}. Richtung umgekehrt`,
    };

    const updatedLetter = { ...letterData, strokes: newStrokes };
    setLetterData(updatedLetter);
    // Instantly save to storage so tracing immediately picks up the new direction
    strokeStorage.saveLetter(updatedLetter);
    setHasUnsavedChanges(true);
    setSuccessMessage(`Richtung von Strich ${index + 1} umgekehrt & gespeichert!`);
    onSaved();
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Toggle house floors
  const handleToggleFloor = (floor: HouseFloor) => {
    playSound.tap();
    const exists = letterData.floors.includes(floor);
    let newFloors: HouseFloor[];
    if (exists) {
      newFloors = letterData.floors.filter(f => f !== floor);
    } else {
      newFloors = [...letterData.floors, floor];
    }
    setLetterData(prev => ({ ...prev, floors: newFloors }));
    setHasUnsavedChanges(true);
  };

  // Save customized letter data
  const handleSave = () => {
    playSound.strokeSuccess();
    strokeStorage.saveLetter(letterData);
    setHasUnsavedChanges(false);
    setSuccessMessage(`Strichfolge für „${selectedChar}“ erfolgreich gespeichert!`);
    onSaved();
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Save customized letter data and immediately start tracing this letter
  const handleSaveAndPractice = () => {
    playSound.strokeSuccess();
    strokeStorage.saveLetter(letterData);
    setHasUnsavedChanges(false);
    onSaved();
    if (onPracticeChar) {
      onPracticeChar(selectedChar);
    } else {
      onClose();
    }
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      strokeStorage.saveLetter(letterData);
      onSaved();
    }
    onClose();
  };

  // Reset current letter to canonical default
  const handleResetCurrent = () => {
    playSound.tap();
    const norm = (selectedChar || 'A').normalize('NFC');
    strokeStorage.resetLetter(norm);
    const standard = CANONICAL_LETTER_STROKES[norm] || {
      char: norm,
      isUpper: norm === norm.toUpperCase() && norm !== norm.toLowerCase(),
      floors: norm === norm.toUpperCase() ? ['roof', 'living'] : ['living'],
      strokes: [],
    };
    setLetterData(standard);
    setHasUnsavedChanges(false);
    setSuccessMessage(`Auf Grundschul-Vorgabe für „${norm}“ zurückgesetzt.`);
    onSaved();
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Reset all letters
  const handleResetAll = () => {
    if (window.confirm('Möchtest du wirklich alle Buchstaben auf die offiziellen Grundschul-Standards zurücksetzen?')) {
      playSound.tap();
      strokeStorage.resetAll();
      const norm = (selectedChar || 'A').normalize('NFC');
      setLetterData(strokeStorage.getLetter(norm));
      setHasUnsavedChanges(false);
      setSuccessMessage('Alle Buchstaben auf Grundschul-Standard zurückgesetzt.');
      onSaved();
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ'.split('');
  const lowerChars = 'abcdefghijklmnopqrstuvwxyzäöüß'.split('');
  const umlautChars = ['Ä', 'Ö', 'Ü', 'ä', 'ö', 'ü', 'ß'];

  const displayedChars =
    activeTab === 'upper' ? upperChars : activeTab === 'lower' ? lowerChars : umlautChars;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border-2 border-amber-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-100 bg-amber-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-xl font-black text-amber-950">
                Buchstaben-Werkstatt & Strichfolge-Editor
              </h2>
              <p className="text-xs text-amber-900/70 font-medium">
                Strichreihenfolge, Richtung & Schreibhaus-Linien nach Grundschul-Vorgaben anpassen
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Success message banner */}
        {successMessage && (
          <div className="px-6 py-2.5 bg-emerald-500 text-white text-xs font-bold flex items-center justify-between animate-in fade-in">
            <span>✓ {successMessage}</span>
          </div>
        )}

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Character selector (4 cols) */}
          <div className="md:col-span-4 flex flex-col space-y-3">
            {/* Tabs for Upper / Lower / Umlauts */}
            <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold text-slate-600">
              <button
                onClick={() => setActiveTab('upper')}
                className={`flex-1 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'upper' ? 'bg-white text-amber-950 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                A–Z
              </button>
              <button
                onClick={() => setActiveTab('lower')}
                className={`flex-1 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'lower' ? 'bg-white text-amber-950 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                a–z
              </button>
              <button
                onClick={() => setActiveTab('umlauts')}
                className={`flex-1 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'umlauts' ? 'bg-white text-amber-950 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                Ä, Ö, Ü, ß
              </button>
            </div>

            {/* Letter Grid */}
            <div className="grid grid-cols-5 gap-2 max-h-72 overflow-y-auto p-1 bg-amber-50/40 rounded-2xl border border-amber-100">
              {displayedChars.map(char => {
                const isSelected = char === selectedChar;
                const isCustomized = strokeStorage.hasCustom(char);

                return (
                  <button
                    key={char}
                    onClick={() => handleSelectChar(char)}
                    className={`relative aspect-square rounded-xl font-display text-lg font-black flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-white shadow-md scale-105 ring-2 ring-amber-300'
                        : isCustomized
                        ? 'bg-amber-100 text-amber-950 border border-amber-300 hover:bg-amber-200'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <span>{char}</span>
                    {isCustomized && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-orange-500" title="Benutzerdefiniert angepasst" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
              💡 <strong>Tipp:</strong> Punkte markieren Buchstaben, die du selbst angepasst hast. Du kannst jeden Buchstaben jederzeit auf die Standard-Reihenfolge zurücksetzen.
            </div>
          </div>

          {/* Right Column: Visual Preview & Stroke Reordering (8 cols) */}
          <div className="md:col-span-8 flex flex-col space-y-4">
            {/* Top row: Current letter title + Schreibhaus indicator */}
            <div className="flex items-center justify-between bg-amber-50/60 p-3 rounded-2xl border border-amber-200/80">
              <div className="flex items-center gap-3">
                <span className="font-display text-4xl font-black text-amber-950 px-3 py-1 bg-white rounded-xl border border-amber-200 shadow-xs">
                  {selectedChar}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-amber-950">
                    Buchstabe {selectedChar} ({letterData.isUpper ? 'Großbuchstabe' : 'Kleinbuchstabe'})
                  </h3>
                  <span className="text-xs text-amber-800/70">
                    {letterData.strokes.length} Striche definiert
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleSaveAndPractice}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black shadow-xs active:scale-95 transition-all cursor-pointer ml-2"
                  title={`Diesen Buchstaben „${selectedChar}“ jetzt im Schreibblock nachfahren`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Jetzt nachfahren</span>
                </button>
              </div>

              {/* Schreibhaus Floors toggle for this letter */}
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-slate-500 mr-1 hidden sm:inline">Wohnt in:</span>
                <button
                  type="button"
                  onClick={() => handleToggleFloor('roof')}
                  className={`px-2 py-1 text-xs font-bold rounded-lg border transition-colors ${
                    letterData.floors.includes('roof')
                      ? 'bg-amber-400 text-amber-950 border-amber-500'
                      : 'bg-white text-slate-400 border-slate-200'
                  }`}
                >
                  🏠 Dach
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleFloor('living')}
                  className={`px-2 py-1 text-xs font-bold rounded-lg border transition-colors ${
                    letterData.floors.includes('living')
                      ? 'bg-emerald-400 text-emerald-950 border-emerald-500'
                      : 'bg-white text-slate-400 border-slate-200'
                  }`}
                >
                  🛋️ Wohnen
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleFloor('cellar')}
                  className={`px-2 py-1 text-xs font-bold rounded-lg border transition-colors ${
                    letterData.floors.includes('cellar')
                      ? 'bg-indigo-400 text-indigo-950 border-indigo-500'
                      : 'bg-white text-slate-400 border-slate-200'
                  }`}
                >
                  📦 Keller
                </button>
              </div>
            </div>

            {/* Visual Canvas Mini-Preview showing stroke numbered badges */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              <div className="sm:col-span-7 bg-white rounded-2xl border-2 border-amber-200 p-2 relative aspect-square max-h-56 mx-auto w-full shadow-inner">
                {/* 4 Lineatur guidelines (Anton App standard y=10, 38, 66, 94) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {/* Dachlinie (y=10) */}
                  <line x1="0" y1="10" x2="100" y2="10" stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="3 2" />
                  {/* Trennlinie 1 (Mittellinie, y=38) */}
                  <line x1="0" y1="38" x2="100" y2="38" stroke="#0284c7" strokeWidth="1.2" strokeDasharray="3 2" />
                  {/* Trennlinie 2 (Grundlinie, y=66) - Dicke durchgezogene Linie */}
                  <line x1="0" y1="66" x2="100" y2="66" stroke="#0f172a" strokeWidth="2.2" />
                  {/* Kellerlinie (y=94) */}
                  <line x1="0" y1="94" x2="100" y2="94" stroke="#818cf8" strokeWidth="0.8" strokeDasharray="3 2" />
                </svg>

                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {/* All strokes preview */}
                  {letterData.strokes.map(s => (
                    <g key={`preview-${s.id}`}>
                      <path
                        d={s.pathD}
                        fill="none"
                        stroke="#cbd5e1"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {/* Direction arrow line */}
                      <circle cx={s.start.x} cy={s.start.y} r="5" fill="#22c55e" stroke="#ffffff" strokeWidth="1.5" />
                      <text
                        x={s.start.x}
                        y={s.start.y + 1.5}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="#ffffff"
                        fontSize="3.8"
                        fontWeight="900"
                      >
                        {s.id}
                      </text>
                      <circle cx={s.end.x} cy={s.end.y} r="3.5" fill="#f97316" stroke="#ffffff" strokeWidth="1" />
                    </g>
                  ))}
                </svg>
              </div>

              {/* Mini Schreibhaus graphic */}
              <div className="sm:col-span-5 h-56">
                <SchreibhausGuide char={selectedChar} activeFloors={letterData.floors} className="h-full" />
              </div>
            </div>

            {/* Strokes List with Reordering Controls */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700">Reihenfolge der Striche (1 = zuerst schreiben):</span>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {letterData.strokes.map((stroke, index) => (
                  <div
                    key={stroke.id}
                    className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-amber-50/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-black flex items-center justify-center shrink-0">
                        {stroke.id}
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        {stroke.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Move Up */}
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMoveStrokeUp(index)}
                        title="Nach oben (früher schreiben)"
                        className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      {/* Move Down */}
                      <button
                        type="button"
                        disabled={index === letterData.strokes.length - 1}
                        onClick={() => handleMoveStrokeDown(index)}
                        title="Nach unten (später schreiben)"
                        className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Invert direction */}
                      <button
                        type="button"
                        onClick={() => handleReverseStroke(index)}
                        title="Schreibrichtung umkehren (Start ↔ Ende)"
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold"
                      >
                        <RotateCw className="w-3 h-3 text-amber-600" />
                        <span>Umkehren</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleResetCurrent}
              className="flex-1 sm:flex-none px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-200 transition-colors"
            >
              Diesen Buchstaben zurücksetzen
            </button>
            <button
              onClick={handleResetAll}
              className="flex-1 sm:flex-none px-3 py-2 text-xs font-bold text-rose-600 hover:text-rose-800 rounded-xl hover:bg-rose-50 transition-colors"
            >
              Alle auf Standard
            </button>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap sm:flex-nowrap">
            <button
              onClick={handleClose}
              className="flex-1 sm:flex-none px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Schließen
            </button>

            <button
              onClick={handleSave}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer"
              title="Strichreihenfolge speichern"
            >
              <Check className="w-4 h-4" />
              <span>Speichern</span>
            </button>

            <button
              onClick={handleSaveAndPractice}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-700 text-white text-sm font-black rounded-xl shadow-md active:scale-95 transition-all cursor-pointer"
              title={`Strichfolge speichern und „${selectedChar}“ sofort auf dem Schreibblock nachfahren`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Speichern & sofort nachfahren ✏️</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
