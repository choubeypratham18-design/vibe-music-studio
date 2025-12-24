import { Radio } from "lucide-react";

export const Header = () => {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border/50">
      <div>
        <h1 className="font-display text-xl font-bold tracking-wider text-primary glow-text">
          VIBE<span className="text-accent">VERSE</span> OS
        </h1>
        <p className="text-xs text-muted-foreground">The Live Reality Engine v1.0.0</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5">
          <Radio className="h-3 w-3 text-primary animate-pulse" />
          <span className="text-xs font-display text-primary">LIVE</span>
        </div>
      </div>
    </header>
  );
};
