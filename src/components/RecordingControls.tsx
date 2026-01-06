import { Mic, Square, Download, CircleDot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RecordingControlsProps {
  isRecording: boolean;
  isPlaying: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onExport: () => void;
}

export const RecordingControls = ({
  isRecording,
  isPlaying,
  onStartRecording,
  onStopRecording,
  onExport,
}: RecordingControlsProps) => {
  return (
    <div className="glass-panel p-3 sm:p-4 space-y-2 sm:space-y-3">
      <div className="flex items-center gap-2">
        <CircleDot className={cn(
          "h-4 w-4",
          isRecording ? "text-destructive animate-pulse" : "text-muted-foreground"
        )} />
        <h3 className="font-display text-xs font-semibold tracking-wider text-ai-purple">
          RECORDING
        </h3>
        {isRecording && (
          <span className="ml-auto text-[10px] text-destructive animate-pulse font-display">
            ● REC
          </span>
        )}
      </div>

      <div className="flex gap-2">
        {!isRecording ? (
          <Button
            onClick={onStartRecording}
            disabled={!isPlaying}
            className={cn(
              "flex-1 gap-1 sm:gap-2 font-display text-[10px] sm:text-xs h-8 sm:h-9",
              "bg-destructive/20 border border-destructive/50 text-destructive",
              "hover:bg-destructive/30",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <Mic className="h-3 w-3" />
            <span className="hidden sm:inline">START</span> REC
          </Button>
        ) : (
          <Button
            onClick={onStopRecording}
            className={cn(
              "flex-1 gap-1 sm:gap-2 font-display text-[10px] sm:text-xs h-8 sm:h-9",
              "bg-destructive border border-destructive text-destructive-foreground",
              "hover:bg-destructive/90 animate-pulse"
            )}
          >
            <Square className="h-3 w-3 fill-current" />
            STOP
          </Button>
        )}

        <Button
          onClick={onExport}
          disabled={isRecording}
          variant="outline"
          className={cn(
            "gap-1 sm:gap-2 font-display text-[10px] sm:text-xs h-8 sm:h-9",
            "border-ai-cyan/50 text-ai-cyan hover:bg-ai-cyan/10",
            "disabled:opacity-50"
          )}
        >
          <Download className="h-3 w-3" />
          <span className="hidden sm:inline">EXPORT</span>
        </Button>
      </div>

      <p className="text-[9px] sm:text-[10px] text-muted-foreground text-center">
        {!isPlaying 
          ? "Play music to start recording" 
          : isRecording 
            ? "Recording in progress..." 
            : "Ready to record"}
      </p>
    </div>
  );
};
