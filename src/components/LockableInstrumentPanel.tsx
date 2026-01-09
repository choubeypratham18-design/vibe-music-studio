import { Piano, Drum, Guitar, Waves, Lock, Unlock } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

interface LockableInstrumentPanelProps {
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
  lockedParams: Set<string>;
  onToggleLock: (param: string) => void;
}

interface InstrumentCardProps {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  value: number;
  onChange: (value: number) => void;
  onInteract?: (value: number) => void;
  colorClass: string;
  paramKey: string;
  isLocked: boolean;
  onToggleLock: () => void;
}

const InstrumentCard = ({
  icon,
  label,
  sublabel,
  value,
  onChange,
  onInteract,
  colorClass,
  isLocked,
  onToggleLock,
}: InstrumentCardProps) => {
  const handleChange = (newValue: number) => {
    if (isLocked) return;
    onChange(newValue);
    onInteract?.(newValue);
  };

  return (
    <div className={`glass-panel p-2 sm:p-3 space-y-2 transition-all ${isLocked ? "opacity-70" : ""}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={colorClass}>{icon}</div>
          <div>
            <h3 className={`font-display text-[10px] sm:text-xs font-semibold tracking-wider ${colorClass}`}>
              {label}
            </h3>
            <p className="text-[9px] text-muted-foreground hidden sm:block">{sublabel}</p>
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={onToggleLock}
          className={`h-6 w-6 p-0 ${
            isLocked 
              ? "text-ai-pink hover:text-ai-pink/80" 
              : "text-muted-foreground hover:text-ai-purple"
          }`}
          title={isLocked ? "Unlock" : "Lock"}
        >
          {isLocked ? (
            <Lock className="w-3 h-3" />
          ) : (
            <Unlock className="w-3 h-3" />
          )}
        </Button>
      </div>
      
      <div className="flex items-center gap-2">
        <Slider
          value={[value]}
          onValueChange={(vals) => handleChange(vals[0])}
          min={0}
          max={100}
          step={1}
          className={`flex-1 ${isLocked ? "pointer-events-none" : ""}`}
          disabled={isLocked}
        />
        <span className={`font-display text-xs font-bold ${colorClass} w-8 text-right`}>
          {value}%
        </span>
      </div>
      {isLocked && (
        <p className="text-[8px] text-ai-pink text-center">LOCKED</p>
      )}
    </div>
  );
};

export const LockableInstrumentPanel = ({
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
  lockedParams,
  onToggleLock,
}: LockableInstrumentPanelProps) => {
  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="flex items-center justify-between mb-1 sm:mb-2">
        <div className="flex items-center gap-2">
          <Piano className="w-4 h-4 text-ai-purple" />
          <h2 className="font-display text-xs font-semibold tracking-wider text-ai-purple">
            INSTRUMENTS
          </h2>
        </div>
        <span className="text-[9px] text-muted-foreground">
          {lockedParams.size > 0 && `${lockedParams.size} locked`}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <InstrumentCard
          icon={<Piano className="w-4 h-4" />}
          label="PIANO"
          sublabel="Grand keys"
          value={piano}
          onChange={onPianoChange}
          onInteract={onPianoInteract}
          colorClass="text-ai-purple"
          paramKey="piano"
          isLocked={lockedParams.has("piano")}
          onToggleLock={() => onToggleLock("piano")}
        />

        <InstrumentCard
          icon={<Drum className="w-4 h-4" />}
          label="DRUMS"
          sublabel="Full kit"
          value={drums}
          onChange={onDrumsChange}
          onInteract={onDrumsInteract}
          colorClass="text-ai-pink"
          paramKey="drums"
          isLocked={lockedParams.has("drums")}
          onToggleLock={() => onToggleLock("drums")}
        />

        <InstrumentCard
          icon={<Guitar className="w-4 h-4" />}
          label="BASS"
          sublabel="Deep low end"
          value={bass}
          onChange={onBassChange}
          onInteract={onBassInteract}
          colorClass="text-ai-blue"
          paramKey="bass"
          isLocked={lockedParams.has("bass")}
          onToggleLock={() => onToggleLock("bass")}
        />

        <InstrumentCard
          icon={<Waves className="w-4 h-4" />}
          label="SYNTH"
          sublabel="Electronic"
          value={synth}
          onChange={onSynthChange}
          onInteract={onSynthInteract}
          colorClass="text-ai-cyan"
          paramKey="synth"
          isLocked={lockedParams.has("synth")}
          onToggleLock={() => onToggleLock("synth")}
        />
      </div>
    </div>
  );
};
