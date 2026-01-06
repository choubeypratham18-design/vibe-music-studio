import { MusicParameter } from "./MusicParameter";
import { Piano, Drum, Guitar, Waves } from "lucide-react";

interface InstrumentPanelProps {
  piano: number;
  drums: number;
  bass: number;
  synth: number;
  onPianoChange: (value: number) => void;
  onDrumsChange: (value: number) => void;
  onBassChange: (value: number) => void;
  onSynthChange: (value: number) => void;
  onPianoInteract?: (value: number) => void;
  onDrumsInteract?: (value: number) => void;
  onBassInteract?: (value: number) => void;
  onSynthInteract?: (value: number) => void;
}

export const InstrumentPanel = ({
  piano,
  drums,
  bass,
  synth,
  onPianoChange,
  onDrumsChange,
  onBassChange,
  onSynthChange,
  onPianoInteract,
  onDrumsInteract,
  onBassInteract,
  onSynthInteract,
}: InstrumentPanelProps) => {
  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="flex items-center gap-2 mb-1 sm:mb-2">
        <Piano className="w-4 h-4 text-ai-purple" />
        <h2 className="font-display text-xs font-semibold tracking-wider text-ai-purple">
          INSTRUMENTS
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <div className="glass-panel p-2 sm:p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Piano className="w-4 h-4 text-ai-purple" />
            <div>
              <h3 className="font-display text-[10px] sm:text-xs font-semibold tracking-wider text-ai-purple">PIANO</h3>
              <p className="text-[9px] text-muted-foreground hidden sm:block">Grand keys</p>
            </div>
          </div>
          <MusicParameter
            label=""
            sublabel=""
            value={piano}
            onChange={onPianoChange}
            onInteract={onPianoInteract}
            variant="primary"
          />
        </div>

        <div className="glass-panel p-2 sm:p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Drum className="w-4 h-4 text-ai-pink" />
            <div>
              <h3 className="font-display text-[10px] sm:text-xs font-semibold tracking-wider text-ai-pink">DRUMS</h3>
              <p className="text-[9px] text-muted-foreground hidden sm:block">Full kit</p>
            </div>
          </div>
          <MusicParameter
            label=""
            sublabel=""
            value={drums}
            onChange={onDrumsChange}
            onInteract={onDrumsInteract}
            variant="accent"
          />
        </div>

        <div className="glass-panel p-2 sm:p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Guitar className="w-4 h-4 text-ai-blue" />
            <div>
              <h3 className="font-display text-[10px] sm:text-xs font-semibold tracking-wider text-ai-blue">BASS</h3>
              <p className="text-[9px] text-muted-foreground hidden sm:block">Deep low end</p>
            </div>
          </div>
          <MusicParameter
            label=""
            sublabel=""
            value={bass}
            onChange={onBassChange}
            onInteract={onBassInteract}
            variant="primary"
          />
        </div>

        <div className="glass-panel p-2 sm:p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Waves className="w-4 h-4 text-ai-cyan" />
            <div>
              <h3 className="font-display text-[10px] sm:text-xs font-semibold tracking-wider text-ai-cyan">SYNTH</h3>
              <p className="text-[9px] text-muted-foreground hidden sm:block">Electronic</p>
            </div>
          </div>
          <MusicParameter
            label=""
            sublabel=""
            value={synth}
            onChange={onSynthChange}
            onInteract={onSynthInteract}
            variant="accent"
          />
        </div>
      </div>
    </div>
  );
};
