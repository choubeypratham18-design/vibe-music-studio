import { Circle, Square, Download } from "lucide-react";
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
    <div className="glass-panel p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Circle className={cn(
          "h-4 w-4",
          isRecording ? "text-destructive fill-destructive animate-pulse" : "text-muted-foreground"
        )} />
        <h3 className="font-display text-sm font-semibold tracking-wider text-primary glow-text">
          RECORDING
        </h3>
        {isRecording && (
          <span className="ml-auto text-xs text-destructive animate-pulse font-display">
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
              "flex-1 gap-2 font-display text-xs",
              "bg-destructive/20 border border-destructive/50 text-destructive",
              "hover:bg-destructive/30",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <Circle className="h-3 w-3 fill-current" />
            START REC
          </Button>
        ) : (
          <Button
            onClick={onStopRecording}
            className={cn(
              "flex-1 gap-2 font-display text-xs",
              "bg-destructive border border-destructive text-destructive-foreground",
              "hover:bg-destructive/90 animate-pulse"
            )}
          >
            <Square className="h-3 w-3 fill-current" />
            STOP REC
          </Button>
        )}

        <Button
          onClick={onExport}
          disabled={isRecording}
          variant="outline"
          className={cn(
            "gap-2 font-display text-xs",
            "border-primary/50 text-primary hover:bg-primary/10",
            "disabled:opacity-50"
          )}
        >
          <Download className="h-3 w-3" />
          EXPORT
        </Button>
      </div>

      <p className="text-[10px] text-muted-foreground text-center">
        {!isPlaying 
          ? "Play music to start recording" 
          : isRecording 
            ? "Recording in progress..." 
            : "Ready to record"}
      </p>
    </div>
  );
};
