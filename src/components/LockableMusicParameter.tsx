import { Slider } from "@/components/ui/slider";
import { Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LockableMusicParameterProps {
  label: string;
  sublabel: string;
  value: number;
  onChange: (value: number) => void;
  onInteract?: (value: number) => void;
  min?: number;
  max?: number;
  unit?: string;
  variant?: "primary" | "accent";
  isLocked: boolean;
  onToggleLock: () => void;
  paramKey: string;
}

export const LockableMusicParameter = ({
  label,
  sublabel,
  value,
  onChange,
  onInteract,
  min = 0,
  max = 100,
  unit = "%",
  variant = "primary",
  isLocked,
  onToggleLock,
}: LockableMusicParameterProps) => {
  const displayValue = unit === " BPM" ? value : value;

  const handleChange = (newValue: number) => {
    if (isLocked) return;
    onChange(newValue);
    onInteract?.(newValue);
  };

  return (
    <div className={`glass-panel p-2 sm:p-4 space-y-2 sm:space-y-3 transition-all ${isLocked ? "opacity-70" : ""}`}>
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={onToggleLock}
            className={`h-6 w-6 p-0 ${
              isLocked 
                ? "text-ai-pink hover:text-ai-pink/80" 
                : "text-muted-foreground hover:text-ai-purple"
            }`}
            title={isLocked ? "Unlock parameter" : "Lock parameter"}
          >
            {isLocked ? (
              <Lock className="w-3.5 h-3.5" />
            ) : (
              <Unlock className="w-3.5 h-3.5" />
            )}
          </Button>
          <div>
            <h3 className={`font-display text-xs sm:text-sm font-semibold tracking-wider ${variant === "accent" ? "text-ai-pink glow-text-accent" : "text-ai-purple glow-text"}`}>
              {label}
            </h3>
            <p className="text-[9px] sm:text-xs text-muted-foreground">{sublabel}</p>
          </div>
        </div>
        <span className={`font-display text-base sm:text-lg font-bold ${variant === "accent" ? "text-ai-pink" : "text-ai-purple"}`}>
          {displayValue}{unit}
        </span>
      </div>

      <div className="space-y-1">
        <Slider
          value={[value]}
          onValueChange={(vals) => handleChange(vals[0])}
          min={min}
          max={max}
          step={1}
          variant={variant}
          className={`cursor-pointer ${isLocked ? "pointer-events-none" : ""}`}
          disabled={isLocked}
        />
        <div className="flex justify-between text-[8px] sm:text-[10px] text-muted-foreground">
          <span>{min}{unit}</span>
          {isLocked && (
            <span className="text-ai-pink text-[8px]">LOCKED</span>
          )}
          <span>{max}{unit}</span>
        </div>
      </div>
    </div>
  );
};
