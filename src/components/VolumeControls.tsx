import { Volume2, VolumeX, Piano, Drum, Guitar, Waves, SlidersHorizontal } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface InstrumentVolumes {
  piano: number;
  drums: number;
  bass: number;
  synth: number;
  master: number;
}

interface VolumeControlsProps {
  volumes: InstrumentVolumes;
  onVolumeChange: (instrument: keyof InstrumentVolumes, value: number) => void;
}

export const VolumeControls = ({ volumes, onVolumeChange }: VolumeControlsProps) => {
  const [mutedChannels, setMutedChannels] = useState<Record<string, boolean>>({});
  const [preMuteVolumes, setPreMuteVolumes] = useState<Record<string, number>>({});
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleMute = (instrument: keyof InstrumentVolumes) => {
    if (mutedChannels[instrument]) {
      onVolumeChange(instrument, preMuteVolumes[instrument] || 80);
      setMutedChannels(prev => ({ ...prev, [instrument]: false }));
    } else {
      setPreMuteVolumes(prev => ({ ...prev, [instrument]: volumes[instrument] }));
      onVolumeChange(instrument, 0);
      setMutedChannels(prev => ({ ...prev, [instrument]: true }));
    }
  };

  const instruments: { key: keyof InstrumentVolumes; label: string; icon: React.ReactNode; color: string }[] = [
    { key: "master", label: "MASTER", icon: <SlidersHorizontal className="w-3 h-3" />, color: "ai-gold" },
    { key: "piano", label: "PIANO", icon: <Piano className="w-3 h-3" />, color: "ai-purple" },
    { key: "drums", label: "DRUMS", icon: <Drum className="w-3 h-3" />, color: "ai-pink" },
    { key: "bass", label: "BASS", icon: <Guitar className="w-3 h-3" />, color: "ai-blue" },
    { key: "synth", label: "SYNTH", icon: <Waves className="w-3 h-3" />, color: "ai-cyan" },
  ];

  return (
    <div className="glass-panel p-3 sm:p-4 space-y-3">
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Volume2 className="h-4 w-4 text-ai-gold" />
        <h3 className="font-display text-xs font-semibold tracking-wider text-ai-gold">
          VOLUME MIXER
        </h3>
        <span className="ml-auto text-[10px] text-muted-foreground">
          {isExpanded ? "▲" : "▼"}
        </span>
      </div>

      {isExpanded && (
        <div className="grid gap-2">
          {instruments.map(({ key, label, icon, color }) => (
            <div key={key} className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className={`h-6 w-6 shrink-0 text-${color}`}
                onClick={() => toggleMute(key)}
              >
                {mutedChannels[key] ? (
                  <VolumeX className="h-3 w-3 text-muted-foreground" />
                ) : (
                  icon
                )}
              </Button>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className={`font-display text-[9px] tracking-wider text-${color} ${key === "master" ? "font-bold" : ""}`}>
                    {label}
                  </span>
                  <span className="text-[9px] text-muted-foreground font-mono">
                    {Math.round(volumes[key])}%
                  </span>
                </div>
                <Slider
                  value={[volumes[key]]}
                  onValueChange={(value) => onVolumeChange(key, value[0])}
                  max={100}
                  step={1}
                  variant="primary"
                  className={`h-1 ${mutedChannels[key] ? "opacity-50" : ""}`}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
