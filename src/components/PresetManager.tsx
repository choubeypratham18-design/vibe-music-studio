import { useState, useEffect } from "react";
import { Save, FolderOpen, Trash2, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Preset {
  id: string;
  name: string;
  params: {
    harmony: number;
    rhythm: number;
    texture: number;
    atmosphere: number;
    piano: number;
    drums: number;
    bass: number;
    synth: number;
    genre: string;
  };
  createdAt: number;
  isFavorite?: boolean;
}

interface PresetManagerProps {
  currentParams: {
    harmony: number;
    rhythm: number;
    texture: number;
    atmosphere: number;
    piano: number;
    drums: number;
    bass: number;
    synth: number;
    genre: string;
  };
  onLoadPreset: (params: Preset["params"]) => void;
}

const DEFAULT_PRESETS: Preset[] = [
  {
    id: "preset-chill",
    name: "Chill Vibes",
    params: { harmony: 60, rhythm: 85, texture: 30, atmosphere: 70, piano: 65, drums: 40, bass: 50, synth: 55, genre: "groove" },
    createdAt: 0,
    isFavorite: true,
  },
  {
    id: "preset-energetic",
    name: "High Energy",
    params: { harmony: 80, rhythm: 140, texture: 70, atmosphere: 40, piano: 45, drums: 90, bass: 85, synth: 80, genre: "future" },
    createdAt: 0,
    isFavorite: true,
  },
  {
    id: "preset-ambient",
    name: "Ambient Dream",
    params: { harmony: 40, rhythm: 70, texture: 20, atmosphere: 90, piano: 70, drums: 20, bass: 35, synth: 75, genre: "roots" },
    createdAt: 0,
    isFavorite: true,
  },
];

export const PresetManager = ({ currentParams, onLoadPreset }: PresetManagerProps) => {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [presetName, setPresetName] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("ai-music-presets");
    if (saved) {
      setPresets([...DEFAULT_PRESETS, ...JSON.parse(saved)]);
    } else {
      setPresets(DEFAULT_PRESETS);
    }
  }, []);

  const savePreset = () => {
    if (!presetName.trim()) {
      toast.error("Please enter a preset name");
      return;
    }

    const newPreset: Preset = {
      id: `preset-${Date.now()}`,
      name: presetName,
      params: currentParams,
      createdAt: Date.now(),
    };

    const userPresets = presets.filter((p) => !p.id.startsWith("preset-chill") && !p.id.startsWith("preset-energetic") && !p.id.startsWith("preset-ambient"));
    const updatedPresets = [...userPresets, newPreset];
    localStorage.setItem("ai-music-presets", JSON.stringify(updatedPresets));
    setPresets([...DEFAULT_PRESETS, ...updatedPresets]);
    setPresetName("");
    toast.success(`Preset "${presetName}" saved!`);
  };

  const deletePreset = (id: string) => {
    if (DEFAULT_PRESETS.some((p) => p.id === id)) {
      toast.error("Cannot delete default presets");
      return;
    }
    const updated = presets.filter((p) => p.id !== id);
    const userPresets = updated.filter((p) => !DEFAULT_PRESETS.some((d) => d.id === p.id));
    localStorage.setItem("ai-music-presets", JSON.stringify(userPresets));
    setPresets(updated);
    toast.success("Preset deleted");
  };

  const loadPreset = (preset: Preset) => {
    onLoadPreset(preset.params);
    toast.success(`Loaded "${preset.name}"`);
  };

  return (
    <div className="glass-panel p-3 sm:p-4 space-y-3">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-ai-pink" />
          <h3 className="font-display text-xs font-semibold tracking-wider text-ai-pink">
            PRESETS
          </h3>
        </div>
        <span className="text-[10px] text-muted-foreground">
          {presets.length} saved
        </span>
      </div>

      {isExpanded && (
        <>
          {/* Save new preset */}
          <div className="flex gap-2">
            <Input
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="Preset name..."
              className="h-8 text-xs bg-muted/50 border-border/50"
            />
            <Button
              onClick={savePreset}
              size="sm"
              className="h-8 px-3 bg-ai-purple/20 border border-ai-purple/50 text-ai-purple hover:bg-ai-purple/30"
            >
              <Save className="w-3 h-3" />
            </Button>
          </div>

          {/* Preset list */}
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {presets.map((preset) => (
              <div
                key={preset.id}
                className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
              >
                {preset.isFavorite && (
                  <Star className="w-3 h-3 text-ai-gold fill-ai-gold" />
                )}
                <button
                  onClick={() => loadPreset(preset)}
                  className="flex-1 text-left text-xs text-foreground/80 hover:text-foreground truncate"
                >
                  {preset.name}
                </button>
                <span className="text-[9px] text-muted-foreground">
                  {preset.params.rhythm} BPM
                </span>
                <Button
                  onClick={() => loadPreset(preset)}
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                >
                  <FolderOpen className="w-3 h-3" />
                </Button>
                {!preset.isFavorite && (
                  <Button
                    onClick={() => deletePreset(preset.id)}
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
