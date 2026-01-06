import { Slider } from "@/components/ui/slider";

interface MusicParameterProps {
  label: string;
  sublabel: string;
  value: number;
  onChange: (value: number) => void;
  onInteract?: (value: number) => void;
  min?: number;
  max?: number;
  unit?: string;
  variant?: "primary" | "accent";
}

export const MusicParameter = ({
  label,
  sublabel,
  value,
  onChange,
  onInteract,
  min = 0,
  max = 100,
  unit = "%",
  variant = "primary",
}: MusicParameterProps) => {
  const displayValue = unit === "BPM" ? value : value;

  const handleChange = (newValue: number) => {
    onChange(newValue);
    onInteract?.(newValue);
  };
  
  return (
    <div className="glass-panel p-2 sm:p-4 space-y-2 sm:space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className={`font-display text-xs sm:text-sm font-semibold tracking-wider ${variant === "accent" ? "text-ai-pink glow-text-accent" : "text-ai-purple glow-text"}`}>
            {label}
          </h3>
          <p className="text-[9px] sm:text-xs text-muted-foreground">{sublabel}</p>
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
          className="cursor-pointer"
        />
        <div className="flex justify-between text-[8px] sm:text-[10px] text-muted-foreground">
          <span>{min}{unit}</span>
          <span>{max}{unit}</span>
        </div>
      </div>
    </div>
  );
};
