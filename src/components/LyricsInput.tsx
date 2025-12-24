import { Textarea } from "@/components/ui/textarea";

interface LyricsInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const LyricsInput = ({ value, onChange }: LyricsInputProps) => {
  return (
    <div className="glass-panel p-4 space-y-3">
      <h3 className="font-display text-sm font-semibold tracking-wider text-accent glow-text-accent">
        SOUL PATCH — VIBE CREATOR
      </h3>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter lyrics to generate multiple song variations..."
        className="min-h-[100px] bg-muted/50 border-border/50 resize-none text-sm placeholder:text-muted-foreground/50 focus:border-primary focus:ring-primary/20"
      />
    </div>
  );
};
