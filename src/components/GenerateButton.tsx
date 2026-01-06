import { Sparkles, Volume2, Loader2, Wand2 } from "lucide-react";
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
    <div className="space-y-2 sm:space-y-3">
      <Button
        onClick={onGenerate}
        disabled={isGenerating}
        className="w-full h-10 sm:h-12 bg-gradient-to-r from-ai-purple/20 via-ai-pink/20 to-ai-blue/20 border border-ai-purple/50 text-ai-purple hover:from-ai-purple/30 hover:via-ai-pink/30 hover:to-ai-blue/30 hover:border-ai-purple font-display tracking-wider transition-all duration-300 glow-box text-xs sm:text-sm"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            AI GENERATING...
          </>
        ) : (
          <>
            <Wand2 className="mr-2 h-4 w-4" />
            GENERATE WITH AI
          </>
        )}
      </Button>

      <Button
        onClick={onVocalizeOnly}
        variant="outline"
        className="w-full h-8 sm:h-10 border-ai-pink/30 text-ai-pink hover:bg-ai-pink/10 font-display tracking-wider text-[10px] sm:text-xs"
      >
        <Volume2 className="mr-2 h-3 w-3" />
        VOCALIZE ONLY
      </Button>

      <p className="text-[9px] sm:text-[10px] text-center text-muted-foreground">
        AI ANALYZES YOUR INPUT → GENERATES UNIQUE MUSIC
      </p>
    </div>
  );
};
