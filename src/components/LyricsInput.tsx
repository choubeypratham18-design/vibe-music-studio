import { Textarea } from "@/components/ui/textarea";
import { Music2 } from "lucide-react";

interface LyricsInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const LyricsInput = ({ value, onChange }: LyricsInputProps) => {
  return (
    <div className="glass-panel p-3 sm:p-4 space-y-2 sm:space-y-3">
      <div className="flex items-center gap-2">
        <Music2 className="w-4 h-4 text-ai-pink" />
        <h3 className="font-display text-xs font-semibold tracking-wider text-ai-pink">
          LYRICS INPUT
        </h3>
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter lyrics for AI to analyze and generate matching music..."
        className="min-h-[80px] sm:min-h-[100px] bg-muted/50 border-border/50 resize-none text-xs sm:text-sm placeholder:text-muted-foreground/50 focus:border-ai-pink focus:ring-ai-pink/20"
      />
    </div>
  );
};
