import { Volume2, VolumeX } from "lucide-react";
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

  const toggleMute = (instrument: keyof InstrumentVolumes) => {
    if (mutedChannels[instrument]) {
      // Unmute
      onVolumeChange(instrument, preMuteVolumes[instrument] || 80);
      setMutedChannels(prev => ({ ...prev, [instrument]: false }));
    } else {
      // Mute
      setPreMuteVolumes(prev => ({ ...prev, [instrument]: volumes[instrument] }));
      onVolumeChange(instrument, 0);
      setMutedChannels(prev => ({ ...prev, [instrument]: true }));
    }
  };

  const instruments: { key: keyof InstrumentVolumes; label: string; icon: string; color: string }[] = [
    { key: "master", label: "MASTER", icon: "🎚️", color: "primary" },
    { key: "piano", label: "PIANO", icon: "🎹", color: "primary" },
    { key: "drums", label: "DRUMS", icon: "🥁", color: "accent" },
    { key: "bass", label: "BASS", icon: "🎸", color: "primary" },
    { key: "synth", label: "SYNTH", icon: "🎛️", color: "accent" },
  ];

  return (
    <div className="glass-panel p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Volume2 className="h-4 w-4 text-primary" />
        <h3 className="font-display text-sm font-semibold tracking-wider text-primary glow-text">
          VOLUME MIXER
        </h3>
      </div>

      <div className="grid gap-3">
        {instruments.map(({ key, label, icon, color }) => (
          <div key={key} className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={() => toggleMute(key)}
            >
              {mutedChannels[key] ? (
                <VolumeX className="h-4 w-4 text-muted-foreground" />
              ) : (
                <span className="text-sm">{icon}</span>
              )}
            </Button>
            
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className={`font-display text-[10px] tracking-wider ${
                  color === "accent" ? "text-accent" : "text-primary"
                } ${key === "master" ? "font-bold" : ""}`}>
                  {label}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {Math.round(volumes[key])}%
                </span>
              </div>
              <Slider
                value={[volumes[key]]}
                onValueChange={(value) => onVolumeChange(key, value[0])}
                max={100}
                step={1}
                variant={color === "accent" ? "accent" : "primary"}
                className={`h-1 ${mutedChannels[key] ? "opacity-50" : ""}`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
