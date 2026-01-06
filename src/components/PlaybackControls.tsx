import { Play, Pause, SkipBack, SkipForward, Sparkles } from "lucide-react";
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
    <div className="glass-panel p-2 sm:p-4">
      <div className="flex items-center justify-between gap-2">
        {/* Left: Engine status */}
        <div className="hidden sm:flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              isPlaying ? "bg-ai-cyan animate-pulse" : "bg-muted-foreground"
            )} />
            <span className="text-[10px] sm:text-xs font-display">
              AI: <span className={isPlaying ? "text-ai-cyan" : "text-muted-foreground"}>
                {isPlaying ? "GENERATING" : "IDLE"}
              </span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-ai-purple" />
            <span className="text-[10px] text-ai-purple font-display">NOVA AI</span>
          </div>
        </div>

        {/* Center: Playback controls */}
        <div className="flex flex-col items-center gap-1 sm:gap-2 flex-1 sm:flex-none">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground hover:text-foreground"
            >
              <SkipBack className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            
            <Button
              onClick={onPlayPause}
              className={cn(
                "h-10 w-10 sm:h-12 sm:w-12 rounded-full transition-all duration-300",
                isPlaying 
                  ? "bg-gradient-to-r from-ai-purple to-ai-pink hover:opacity-90 glow-box" 
                  : "bg-ai-purple/20 border border-ai-purple hover:bg-ai-purple/30"
              )}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Play className="h-4 w-4 sm:h-5 sm:w-5 ml-0.5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground hover:text-foreground"
            >
              <SkipForward className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs">
            <span className="font-display text-lg sm:text-2xl ai-gradient-text">{bpm}</span>
            <span className="text-muted-foreground">BPM</span>
          </div>
        </div>

        {/* Right: Time and status */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex gap-1">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-ai-purple animate-pulse" />
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-ai-pink animate-pulse" style={{ animationDelay: "0.2s" }} />
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-ai-cyan animate-pulse" style={{ animationDelay: "0.4s" }} />
          </div>
          <span className="font-display text-xs sm:text-sm text-ai-pink">{currentTime}</span>
        </div>
      </div>
    </div>
  );
};
