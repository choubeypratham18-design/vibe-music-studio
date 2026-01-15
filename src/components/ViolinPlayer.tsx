import { useCallback, useRef } from "react";
import { Music2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface ViolinPlayerProps {
  value: number;
  onChange: (value: number) => void;
  onPlay: (value: number, note?: number) => void;
}

export const ViolinPlayer = ({ value, onChange, onPlay }: ViolinPlayerProps) => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  // Violin synthesis using FM synthesis
  const playViolin = useCallback((noteIndex: number = 0) => {
    const ctx = initAudioContext();
    const now = ctx.currentTime;
    const intensity = value / 100;

    // Violin frequencies (G3, D4, A4, E5 - open strings)
    const violinNotes = [196.00, 293.66, 440.00, 659.25];
    const baseFreq = violinNotes[noteIndex % violinNotes.length];

    // Create modulator for FM synthesis (bow effect)
    const modulator = ctx.createOscillator();
    const modulatorGain = ctx.createGain();
    modulator.type = "triangle";
    modulator.frequency.value = 5 + Math.random() * 3; // Vibrato
    modulatorGain.gain.value = 8;

    // Create carrier (main violin sound)
    const carrier = ctx.createOscillator();
    const carrierGain = ctx.createGain();
    carrier.type = "sawtooth";
    carrier.frequency.value = baseFreq;

    // Connect modulator to carrier frequency
    modulator.connect(modulatorGain);
    modulatorGain.connect(carrier.frequency);

    // Create harmonics for richness
    const harmonics = [1, 2, 3, 4, 5];
    const harmonicGains = [1, 0.4, 0.2, 0.1, 0.05];

    const masterGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    filter.type = "lowpass";
    filter.frequency.value = 2000 + value * 30;
    filter.Q.value = 2;

    // Envelope - violin bow attack
    carrierGain.gain.setValueAtTime(0, now);
    carrierGain.gain.linearRampToValueAtTime(0.3 * intensity, now + 0.1);
    carrierGain.gain.setValueAtTime(0.25 * intensity, now + 0.3);
    carrierGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

    carrier.connect(carrierGain);
    carrierGain.connect(filter);
    filter.connect(masterGain);
    masterGain.connect(ctx.destination);
    masterGain.gain.value = 0.4;

    // Add harmonics
    harmonics.forEach((h, i) => {
      const harmOsc = ctx.createOscillator();
      const harmGain = ctx.createGain();
      harmOsc.type = "sawtooth";
      harmOsc.frequency.value = baseFreq * h;
      harmGain.gain.setValueAtTime(0, now);
      harmGain.gain.linearRampToValueAtTime(0.1 * harmonicGains[i] * intensity, now + 0.1);
      harmGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      harmOsc.connect(harmGain);
      harmGain.connect(filter);
      harmOsc.start(now);
      harmOsc.stop(now + 1.5);
    });

    modulator.start(now);
    carrier.start(now);
    modulator.stop(now + 1.5);
    carrier.stop(now + 1.5);

    onPlay(value, noteIndex);
  }, [value, initAudioContext, onPlay]);

  const handleSliderInteraction = () => {
    playViolin(Math.floor(Math.random() * 4));
  };

  return (
    <div className="glass-panel p-3 sm:p-4">
      <div className="flex items-center gap-2 mb-3">
        <Music2 className="w-4 h-4 text-ai-pink" />
        <h3 className="font-display text-xs font-semibold tracking-wider text-ai-pink">
          VIOLIN
        </h3>
        <span className="ml-auto text-[10px] text-muted-foreground font-mono">
          {value}%
        </span>
      </div>

      {/* Violin Strings Visual */}
      <div className="flex justify-around mb-3 gap-1">
        {["G", "D", "A", "E"].map((string, index) => (
          <button
            key={string}
            onClick={() => playViolin(index)}
            className="flex-1 h-16 rounded-lg bg-background/50 border border-ai-pink/30 
                       hover:border-ai-pink hover:bg-ai-pink/10 transition-all 
                       flex flex-col items-center justify-center gap-1 group"
          >
            <div className="w-0.5 h-8 bg-gradient-to-b from-ai-pink/80 to-ai-pink/20 
                          group-hover:animate-pulse" />
            <span className="text-[10px] font-display text-ai-pink/70 group-hover:text-ai-pink">
              {string}
            </span>
          </button>
        ))}
      </div>

      {/* Volume Slider */}
      <div className="space-y-2">
        <Slider
          value={[value]}
          onValueChange={(v) => onChange(v[0])}
          onPointerUp={handleSliderInteraction}
          min={0}
          max={100}
          step={1}
          className="w-full"
        />
        <p className="text-[10px] text-muted-foreground text-center">
          Click strings or adjust intensity
        </p>
      </div>
    </div>
  );
};
