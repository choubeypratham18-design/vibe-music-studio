import { useState } from "react";
import { History, RotateCcw, Eye, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface HistoryEntry {
  id: string;
  timestamp: Date;
  params: {
    harmony: number;
    rhythm: number;
    texture: number;
    atmosphere: number;
    piano: number;
    drums: number;
    bass: number;
    synth: number;
  };
  label: string;
}

interface ParameterHistoryProps {
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
  history: HistoryEntry[];
  onRevert: (params: HistoryEntry["params"]) => void;
  onPreview?: (params: HistoryEntry["params"]) => void;
}

export const ParameterHistory = ({
  currentParams,
  history,
  onRevert,
  onPreview,
}: ParameterHistoryProps) => {
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getTimeDiff = (date: Date) => {
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  const handlePreview = (entry: HistoryEntry) => {
    if (previewingId === entry.id) {
      setPreviewingId(null);
      onPreview?.(currentParams);
    } else {
      setPreviewingId(entry.id);
      onPreview?.(entry.params);
      toast.info("Previewing...", {
        description: `Showing state from ${getTimeDiff(entry.timestamp)}`,
      });
    }
  };

  const handleRevert = (entry: HistoryEntry) => {
    onRevert(entry.params);
    setPreviewingId(null);
    toast.success("Reverted!", {
      description: `Restored to "${entry.label}"`,
    });
  };

  const visibleHistory = isExpanded ? history : history.slice(0, 3);

  return (
    <div className="glass-panel p-3 sm:p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-ai-cyan" />
          <h2 className="font-display text-xs font-semibold tracking-wider text-ai-cyan">
            MIX HISTORY
          </h2>
        </div>
        <span className="text-[10px] text-muted-foreground">
          {history.length} versions
        </span>
      </div>

      {history.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-3">
          Make changes to start tracking history
        </p>
      ) : (
        <div className="space-y-2">
          {visibleHistory.map((entry, index) => (
            <div
              key={entry.id}
              className={`
                bg-background/40 rounded-lg p-2 sm:p-3 border transition-all
                ${previewingId === entry.id 
                  ? "border-ai-cyan shadow-[0_0_10px_rgba(34,211,238,0.3)]" 
                  : "border-border/30 hover:border-ai-cyan/40"
                }
              `}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-xs font-semibold text-foreground truncate">
                      {entry.label}
                    </span>
                    {index === 0 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-ai-purple/20 text-ai-purple">
                        LATEST
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>{getTimeDiff(entry.timestamp)}</span>
                    <span className="hidden sm:inline">• {formatTime(entry.timestamp)}</span>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handlePreview(entry)}
                    className={`h-7 w-7 p-0 ${
                      previewingId === entry.id 
                        ? "bg-ai-cyan/20 text-ai-cyan" 
                        : "hover:bg-ai-cyan/20 hover:text-ai-cyan"
                    }`}
                    title="Preview this version"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRevert(entry)}
                    className="h-7 w-7 p-0 hover:bg-ai-purple/20 hover:text-ai-purple"
                    title="Revert to this version"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Compact param preview */}
              <div className="flex flex-wrap gap-1 mt-2">
                {Object.entries(entry.params).slice(0, 4).map(([key, value]) => (
                  <span
                    key={key}
                    className="text-[9px] px-1 py-0.5 rounded bg-background/60 text-muted-foreground"
                  >
                    {key.slice(0, 3).toUpperCase()}: {value}
                  </span>
                ))}
                <span className="text-[9px] text-muted-foreground">+4 more</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {history.length > 3 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full h-7 text-xs text-muted-foreground hover:text-ai-cyan"
        >
          {isExpanded ? "Show less" : `Show ${history.length - 3} more`}
        </Button>
      )}
    </div>
  );
};

export type { HistoryEntry };
