import { useState } from "react";
import { GitCompare, Copy, ArrowLeftRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ABComparisonModeProps {
  currentParams: {
    harmony: number;
    rhythm: number;
    texture: number;
    atmosphere: number;
    piano: number;
    drums: number;
    bass: number;
    synth: number;
  };
  onApplyParams: (params: ABComparisonModeProps["currentParams"]) => void;
  isEnabled: boolean;
  onToggle: () => void;
}

export const ABComparisonMode = ({
  currentParams,
  onApplyParams,
  isEnabled,
  onToggle,
}: ABComparisonModeProps) => {
  const [configA, setConfigA] = useState<typeof currentParams | null>(null);
  const [configB, setConfigB] = useState<typeof currentParams | null>(null);
  const [activeConfig, setActiveConfig] = useState<"A" | "B">("A");

  const handleSaveToSlot = (slot: "A" | "B") => {
    if (slot === "A") {
      setConfigA({ ...currentParams });
      toast.success("Saved to Slot A");
    } else {
      setConfigB({ ...currentParams });
      toast.success("Saved to Slot B");
    }
  };

  const handleSwitchConfig = () => {
    const targetConfig = activeConfig === "A" ? configB : configA;
    if (!targetConfig) {
      toast.warning(`Slot ${activeConfig === "A" ? "B" : "A"} is empty`);
      return;
    }
    
    onApplyParams(targetConfig);
    setActiveConfig(activeConfig === "A" ? "B" : "A");
    toast.info(`Switched to Config ${activeConfig === "A" ? "B" : "A"}`);
  };

  const handleApplyConfig = (slot: "A" | "B") => {
    const config = slot === "A" ? configA : configB;
    if (!config) {
      toast.warning(`Slot ${slot} is empty`);
      return;
    }
    onApplyParams(config);
    setActiveConfig(slot);
  };

  const handleChooseWinner = (slot: "A" | "B") => {
    const config = slot === "A" ? configA : configB;
    if (config) {
      onApplyParams(config);
      toast.success(`Applied Config ${slot} as final choice!`);
    }
    onToggle();
  };

  const formatParamDiff = (key: string, a: number | undefined, b: number | undefined) => {
    if (a === undefined || b === undefined) return null;
    const diff = b - a;
    if (diff === 0) return null;
    return (
      <span className={diff > 0 ? "text-green-400" : "text-red-400"}>
        {diff > 0 ? "+" : ""}{diff}
      </span>
    );
  };

  if (!isEnabled) {
    return (
      <Button
        onClick={onToggle}
        variant="outline"
        className="w-full h-9 text-xs font-display border-ai-blue/30 text-ai-blue hover:bg-ai-blue/20 hover:border-ai-blue/50"
      >
        <GitCompare className="w-4 h-4 mr-2" />
        A/B COMPARISON MODE
        <span className="ml-2 text-[9px] text-muted-foreground">(Shift+A)</span>
      </Button>
    );
  }

  return (
    <div className="glass-panel p-3 sm:p-4 space-y-3 border-ai-blue/40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-ai-blue" />
          <h2 className="font-display text-xs font-semibold tracking-wider text-ai-blue">
            A/B COMPARISON
          </h2>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={onToggle}
          className="h-6 w-6 p-0 hover:bg-red-500/20 hover:text-red-400"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Config Slots */}
      <div className="grid grid-cols-2 gap-2">
        {/* Slot A */}
        <div
          className={`
            p-3 rounded-lg border transition-all cursor-pointer
            ${activeConfig === "A" 
              ? "bg-ai-purple/20 border-ai-purple shadow-[0_0_15px_rgba(147,51,234,0.3)]" 
              : "bg-background/40 border-border/30 hover:border-ai-purple/40"
            }
          `}
          onClick={() => configA && handleApplyConfig("A")}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-display text-sm font-bold text-ai-purple">A</span>
            {activeConfig === "A" && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-ai-purple text-white">
                ACTIVE
              </span>
            )}
          </div>
          {configA ? (
            <div className="space-y-1">
              {Object.entries(configA).slice(0, 4).map(([key, value]) => (
                <div key={key} className="flex justify-between text-[10px]">
                  <span className="text-muted-foreground">{key.slice(0, 3).toUpperCase()}</span>
                  <span className="text-foreground">{value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[10px] text-muted-foreground">Empty</p>
          )}
          <Button
            size="sm"
            onClick={(e) => { e.stopPropagation(); handleSaveToSlot("A"); }}
            className="w-full mt-2 h-6 text-[10px] bg-ai-purple/20 hover:bg-ai-purple/30 text-ai-purple border border-ai-purple/30"
          >
            <Copy className="w-3 h-3 mr-1" />
            Save Current
          </Button>
        </div>

        {/* Slot B */}
        <div
          className={`
            p-3 rounded-lg border transition-all cursor-pointer
            ${activeConfig === "B" 
              ? "bg-ai-pink/20 border-ai-pink shadow-[0_0_15px_rgba(236,72,153,0.3)]" 
              : "bg-background/40 border-border/30 hover:border-ai-pink/40"
            }
          `}
          onClick={() => configB && handleApplyConfig("B")}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-display text-sm font-bold text-ai-pink">B</span>
            {activeConfig === "B" && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-ai-pink text-white">
                ACTIVE
              </span>
            )}
          </div>
          {configB ? (
            <div className="space-y-1">
              {Object.entries(configB).slice(0, 4).map(([key, value]) => (
                <div key={key} className="flex justify-between text-[10px]">
                  <span className="text-muted-foreground">{key.slice(0, 3).toUpperCase()}</span>
                  <span className="text-foreground">{value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[10px] text-muted-foreground">Empty</p>
          )}
          <Button
            size="sm"
            onClick={(e) => { e.stopPropagation(); handleSaveToSlot("B"); }}
            className="w-full mt-2 h-6 text-[10px] bg-ai-pink/20 hover:bg-ai-pink/30 text-ai-pink border border-ai-pink/30"
          >
            <Copy className="w-3 h-3 mr-1" />
            Save Current
          </Button>
        </div>
      </div>

      {/* Quick Switch */}
      <Button
        onClick={handleSwitchConfig}
        disabled={!configA || !configB}
        className="w-full h-9 bg-gradient-to-r from-ai-purple to-ai-pink hover:opacity-90 disabled:opacity-30"
      >
        <ArrowLeftRight className="w-4 h-4 mr-2" />
        Switch A ↔ B
      </Button>

      {/* Diff View */}
      {configA && configB && (
        <div className="bg-background/40 rounded-lg p-2 border border-border/30">
          <span className="text-[10px] text-muted-foreground font-display">DIFFERENCES (A → B)</span>
          <div className="grid grid-cols-4 gap-1 mt-2">
            {Object.keys(configA).map((key) => {
              const diff = formatParamDiff(
                key, 
                configA[key as keyof typeof configA], 
                configB[key as keyof typeof configB]
              );
              if (!diff) return null;
              return (
                <div key={key} className="text-center">
                  <span className="text-[9px] text-muted-foreground block">
                    {key.slice(0, 3).toUpperCase()}
                  </span>
                  <span className="text-xs font-display">{diff}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Choose Winner */}
      {configA && configB && (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => handleChooseWinner("A")}
            className="flex-1 h-8 bg-ai-purple/20 hover:bg-ai-purple/30 text-ai-purple border border-ai-purple/30"
          >
            <Check className="w-3 h-3 mr-1" />
            Choose A
          </Button>
          <Button
            size="sm"
            onClick={() => handleChooseWinner("B")}
            className="flex-1 h-8 bg-ai-pink/20 hover:bg-ai-pink/30 text-ai-pink border border-ai-pink/30"
          >
            <Check className="w-3 h-3 mr-1" />
            Choose B
          </Button>
        </div>
      )}
    </div>
  );
};
