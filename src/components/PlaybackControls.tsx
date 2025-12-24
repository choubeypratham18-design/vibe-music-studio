import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PlaybackControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  bpm: number;
  currentTime: string;
}

export const PlaybackControls = ({
  isPlaying,
  onPlayPause,
  bpm,
  currentTime,
}: PlaybackControlsProps) => {
  return (
    <div className="glass-panel p-4">
      <div className="flex items-center justify-between">
        {/* Left: Engine status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              isPlaying ? "bg-green-400 animate-pulse" : "bg-muted-foreground"
            )} />
            <span className="text-xs font-display">
              ENGINE: <span className={isPlaying ? "text-green-400" : "text-muted-foreground"}>
                {isPlaying ? "ACTIVE" : "STANDBY"}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">⚡ NODES:</span>
            <span className="text-xs text-primary font-display">1,245</span>
          </div>
        </div>

        {/* Center: Playback controls */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            
            <Button
              onClick={onPlayPause}
              className={cn(
                "h-12 w-12 rounded-full transition-all duration-300",
                isPlaying 
                  ? "bg-primary hover:bg-primary/90 glow-box" 
                  : "bg-primary/20 border border-primary hover:bg-primary/30"
              )}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">◉ TRANSMITTING</span>
            <span className="font-display text-2xl text-foreground">{bpm}</span>
            <span className="text-muted-foreground">BPM</span>
          </div>
        </div>

        {/* Right: Time and status */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            className="font-display text-xs border-accent/50 text-accent hover:bg-accent/10"
          >
            PAST
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" style={{ animationDelay: "0.2s" }} />
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" style={{ animationDelay: "0.4s" }} />
              <div className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" style={{ animationDelay: "0.6s" }} />
            </div>
          </div>
          <span className="font-display text-sm text-accent">{currentTime}</span>
        </div>
      </div>
    </div>
  );
};
