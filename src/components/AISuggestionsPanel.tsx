import { useState, useEffect } from "react";
import { Sparkles, Check, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Suggestion {
  id: string;
  parameter: string;
  currentValue: number;
  suggestedValue: number;
  reason: string;
  unit?: string;
}

interface AISuggestionsPanelProps {
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
  lockedParams: Set<string>;
  onApplySuggestion: (param: string, value: number) => void;
  isPlaying: boolean;
}

const suggestionReasons = [
  "adds warmth to the mix",
  "creates better groove",
  "enhances the low end",
  "brightens the overall sound",
  "adds more punch",
  "creates more space",
  "increases energy",
  "smooths the transition",
  "balances the frequencies",
  "adds movement",
];

export const AISuggestionsPanel = ({
  currentParams,
  lockedParams,
  onApplySuggestion,
  isPlaying,
}: AISuggestionsPanelProps) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSuggestions = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const paramKeys = Object.keys(currentParams) as (keyof typeof currentParams)[];
      const unlockedParams = paramKeys.filter(p => !lockedParams.has(p));
      
      if (unlockedParams.length === 0) {
        toast.info("All parameters are locked", {
          description: "Unlock some parameters to get AI suggestions",
        });
        setIsGenerating(false);
        return;
      }

      // Pick 2-3 random unlocked parameters
      const shuffled = [...unlockedParams].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, Math.min(3, shuffled.length));

      const newSuggestions: Suggestion[] = selected.map((param, idx) => {
        const current = currentParams[param];
        const min = param === "rhythm" ? 60 : 0;
        const max = param === "rhythm" ? 180 : 100;
        const unit = param === "rhythm" ? " BPM" : "%";
        
        // Generate a meaningful change
        let change = Math.floor(Math.random() * 30) - 15;
        if (Math.abs(change) < 5) change = change < 0 ? -10 : 10;
        
        let suggested = Math.max(min, Math.min(max, current + change));
        
        return {
          id: `${param}-${Date.now()}-${idx}`,
          parameter: param,
          currentValue: current,
          suggestedValue: suggested,
          reason: suggestionReasons[Math.floor(Math.random() * suggestionReasons.length)],
          unit,
        };
      });

      setSuggestions(newSuggestions);
      setIsGenerating(false);
      toast.success("AI suggestions ready!", {
        description: "Review and approve changes below",
      });
    }, 1500);
  };

  const handleApprove = (suggestion: Suggestion) => {
    onApplySuggestion(suggestion.parameter, suggestion.suggestedValue);
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    toast.success(`Applied: ${suggestion.parameter} → ${suggestion.suggestedValue}${suggestion.unit}`);
  };

  const handleReject = (suggestion: Suggestion) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    toast.info(`Rejected: ${suggestion.parameter} suggestion`);
  };

  const formatParam = (param: string) => param.toUpperCase();
  const formatChange = (current: number, suggested: number) => {
    const diff = suggested - current;
    return diff > 0 ? `+${diff}` : `${diff}`;
  };

  return (
    <div className="glass-panel p-3 sm:p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-ai-purple animate-pulse" />
          <h2 className="font-display text-xs font-semibold tracking-wider text-ai-purple">
            AI CO-PILOT
          </h2>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={generateSuggestions}
          disabled={isGenerating || !isPlaying}
          className="h-7 px-2 text-xs gap-1 hover:bg-ai-purple/20"
        >
          <RefreshCw className={`w-3 h-3 ${isGenerating ? "animate-spin" : ""}`} />
          {isGenerating ? "Analyzing..." : "Get Ideas"}
        </Button>
      </div>

      {!isPlaying && (
        <p className="text-xs text-muted-foreground text-center py-2">
          Start playing to get AI suggestions
        </p>
      )}

      {suggestions.length === 0 && isPlaying && !isGenerating && (
        <p className="text-xs text-muted-foreground text-center py-2">
          Click "Get Ideas" for AI recommendations
        </p>
      )}

      <div className="space-y-2">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="bg-background/40 rounded-lg p-2 sm:p-3 border border-ai-purple/20 hover:border-ai-purple/40 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-display text-xs font-semibold text-ai-pink">
                    {formatParam(suggestion.parameter)}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-ai-purple/20 text-ai-purple font-mono">
                    {suggestion.currentValue} → {suggestion.suggestedValue}
                    <span className="text-ai-cyan ml-1">
                      ({formatChange(suggestion.currentValue, suggestion.suggestedValue)})
                    </span>
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 italic">
                  "{suggestion.reason}"
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleApprove(suggestion)}
                  className="h-7 w-7 p-0 hover:bg-green-500/20 hover:text-green-400"
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleReject(suggestion)}
                  className="h-7 w-7 p-0 hover:bg-red-500/20 hover:text-red-400"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[9px] text-muted-foreground text-center">
        You're in control • AI suggests, you decide
      </p>
    </div>
  );
};
