import { useState, useCallback, useEffect } from "react";
import { Piano } from "lucide-react";

interface PianoKeyboardProps {
  onPlayNote: (frequency: number, velocity: number) => void;
  isEnabled?: boolean;
}

// Piano note frequencies (C3 to C5 - 2 octaves)
const PIANO_NOTES = [
  { note: "C3", frequency: 130.81, isBlack: false },
  { note: "C#3", frequency: 138.59, isBlack: true },
  { note: "D3", frequency: 146.83, isBlack: false },
  { note: "D#3", frequency: 155.56, isBlack: true },
  { note: "E3", frequency: 164.81, isBlack: false },
  { note: "F3", frequency: 174.61, isBlack: false },
  { note: "F#3", frequency: 185.00, isBlack: true },
  { note: "G3", frequency: 196.00, isBlack: false },
  { note: "G#3", frequency: 207.65, isBlack: true },
  { note: "A3", frequency: 220.00, isBlack: false },
  { note: "A#3", frequency: 233.08, isBlack: true },
  { note: "B3", frequency: 246.94, isBlack: false },
  { note: "C4", frequency: 261.63, isBlack: false },
  { note: "C#4", frequency: 277.18, isBlack: true },
  { note: "D4", frequency: 293.66, isBlack: false },
  { note: "D#4", frequency: 311.13, isBlack: true },
  { note: "E4", frequency: 329.63, isBlack: false },
  { note: "F4", frequency: 349.23, isBlack: false },
  { note: "F#4", frequency: 369.99, isBlack: true },
  { note: "G4", frequency: 392.00, isBlack: false },
  { note: "G#4", frequency: 415.30, isBlack: true },
  { note: "A4", frequency: 440.00, isBlack: false },
  { note: "A#4", frequency: 466.16, isBlack: true },
  { note: "B4", frequency: 493.88, isBlack: false },
  { note: "C5", frequency: 523.25, isBlack: false },
];

// Keyboard mapping for computer keyboard
const KEYBOARD_MAP: { [key: string]: number } = {
  'a': 0, 'w': 1, 's': 2, 'e': 3, 'd': 4, 'f': 5, 't': 6, 'g': 7, 
  'y': 8, 'h': 9, 'u': 10, 'j': 11, 'k': 12, 'o': 13, 'l': 14, 
  'p': 15, ';': 16, "'": 17,
};

export const PianoKeyboard = ({ onPlayNote, isEnabled = true }: PianoKeyboardProps) => {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  const playNote = useCallback((note: typeof PIANO_NOTES[0]) => {
    if (!isEnabled) return;
    onPlayNote(note.frequency, 80);
    setActiveKeys((prev) => new Set([...prev, note.note]));
    setTimeout(() => {
      setActiveKeys((prev) => {
        const next = new Set(prev);
        next.delete(note.note);
        return next;
      });
    }, 200);
  }, [onPlayNote, isEnabled]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isEnabled) return;
      const key = e.key.toLowerCase();
      if (KEYBOARD_MAP[key] !== undefined && !pressedKeys.has(key)) {
        const noteIndex = KEYBOARD_MAP[key];
        if (noteIndex < PIANO_NOTES.length) {
          setPressedKeys((prev) => new Set([...prev, key]));
          playNote(PIANO_NOTES[noteIndex]);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      setPressedKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isEnabled, pressedKeys, playNote]);

  // Get white keys only for layout
  const whiteKeys = PIANO_NOTES.filter((n) => !n.isBlack);
  const blackKeys = PIANO_NOTES.filter((n) => n.isBlack);

  // Calculate black key positions
  const getBlackKeyPosition = (index: number) => {
    const blackKeyPattern = [1, 2, 4, 5, 6, 8, 9, 11, 12, 13, 15, 16]; // positions after white keys
    return blackKeyPattern[index] || 0;
  };

  return (
    <div className="glass-panel p-3 sm:p-4">
      <div className="flex items-center gap-2 mb-3">
        <Piano className="w-4 h-4 text-ai-purple" />
        <h3 className="font-display text-xs font-semibold tracking-wider text-ai-purple">
          PIANO KEYBOARD
        </h3>
        <span className="ml-auto text-[10px] text-muted-foreground">
          Use A-L keys to play
        </span>
      </div>

      {/* Piano Keys Container */}
      <div className="relative h-24 sm:h-32 overflow-x-auto">
        <div className="relative h-full min-w-[600px]">
          {/* White Keys */}
          <div className="flex h-full">
            {whiteKeys.map((note, index) => (
              <button
                key={note.note}
                className={`
                  relative flex-1 h-full rounded-b-md border border-border/30
                  transition-all duration-75 flex items-end justify-center pb-1
                  ${activeKeys.has(note.note)
                    ? "bg-ai-purple/40 shadow-lg shadow-ai-purple/30 transform scale-[0.98]"
                    : "bg-white/90 hover:bg-white"
                  }
                `}
                onMouseDown={() => playNote(note)}
                onTouchStart={(e) => {
                  e.preventDefault();
                  playNote(note);
                }}
              >
                <span className={`text-[8px] ${activeKeys.has(note.note) ? 'text-white' : 'text-gray-500'}`}>
                  {note.note.replace(/[0-9]/g, '')}
                </span>
              </button>
            ))}
          </div>

          {/* Black Keys */}
          <div className="absolute top-0 left-0 right-0 h-[60%] pointer-events-none">
            {blackKeys.map((note, index) => {
              const position = getBlackKeyPosition(index);
              const leftPercent = ((position) / whiteKeys.length) * 100 - 2.2;
              
              return (
                <button
                  key={note.note}
                  className={`
                    absolute w-[5%] h-full rounded-b-md pointer-events-auto
                    transition-all duration-75 z-10
                    ${activeKeys.has(note.note)
                      ? "bg-ai-purple shadow-lg shadow-ai-purple/50 transform scale-[0.98]"
                      : "bg-gray-900 hover:bg-gray-800"
                    }
                  `}
                  style={{ left: `${leftPercent}%` }}
                  onMouseDown={() => playNote(note)}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    playNote(note);
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Hint */}
      <p className="text-[10px] text-muted-foreground mt-2 text-center">
        Click keys or use keyboard (A-L = C3-B4)
      </p>
    </div>
  );
};
