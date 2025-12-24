import { Sparkles, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GenerateButtonProps {
  onGenerate: () => void;
  onVocalizeOnly: () => void;
  isGenerating: boolean;
}

export const GenerateButton = ({
  onGenerate,
  onVocalizeOnly,
  isGenerating,
}: GenerateButtonProps) => {
  return (
    <div className="space-y-3">
      <Button
        onClick={onGenerate}
        disabled={isGenerating}
        className="w-full h-12 bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/50 text-primary hover:from-primary/30 hover:to-accent/30 hover:border-primary font-display tracking-wider transition-all duration-300 glow-box"
      >
        <Sparkles className="mr-2 h-4 w-4" />
        {isGenerating ? "GENERATING..." : "GENERATE FULL SONG"}
      </Button>

      <Button
        onClick={onVocalizeOnly}
        variant="outline"
        className="w-full h-10 border-primary/30 text-primary hover:bg-primary/10 font-display tracking-wider text-xs"
      >
        <Volume2 className="mr-2 h-3 w-3" />
        VOCALIZE ONLY
      </Button>

      <p className="text-[10px] text-center text-muted-foreground">
        SELECT VARIATION → AUTO-GENERATES SONG + VOCALS
      </p>
    </div>
  );
};
