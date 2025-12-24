import { MusicParameter } from "./MusicParameter";

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
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">🎹</span>
        <h2 className="font-display text-sm font-semibold tracking-wider text-primary glow-text">
          INSTRUMENTS
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="glass-panel p-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎹</span>
            <div>
              <h3 className="font-display text-xs font-semibold tracking-wider text-primary">PIANO</h3>
              <p className="text-[10px] text-muted-foreground">Grand keys</p>
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

        <div className="glass-panel p-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">🥁</span>
            <div>
              <h3 className="font-display text-xs font-semibold tracking-wider text-accent">DRUMS</h3>
              <p className="text-[10px] text-muted-foreground">Full kit</p>
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

        <div className="glass-panel p-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎸</span>
            <div>
              <h3 className="font-display text-xs font-semibold tracking-wider text-primary">BASS</h3>
              <p className="text-[10px] text-muted-foreground">Deep low end</p>
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

        <div className="glass-panel p-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎛️</span>
            <div>
              <h3 className="font-display text-xs font-semibold tracking-wider text-accent">SYNTH</h3>
              <p className="text-[10px] text-muted-foreground">Electronic</p>
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
