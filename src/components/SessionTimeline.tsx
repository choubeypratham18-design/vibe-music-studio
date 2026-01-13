import { useState } from "react";
import { Play, Pause, Plus, Layers, Music, ChevronLeft, ChevronRight, Lock, Unlock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AudioClip } from "./ClipSubmission";

interface SessionSection {
  id: string;
  name: string;
  bars: number;
  isActive: boolean;
  isLocked: boolean;
  clips: AudioClip[];
}

interface SessionTimelineProps {
  sections: SessionSection[];
  currentSection: string;
  onSelectSection: (sectionId: string) => void;
  onAddSection: () => void;
  onRemoveClip: (sectionId: string, clipId: string) => void;
  onToggleLock: (sectionId: string) => void;
  isPlaying: boolean;
  playheadPosition: number;
  isProducer: boolean;
}

const sectionColors: Record<string, string> = {
  intro: "from-ai-blue/30 to-ai-blue/10",
  verse: "from-ai-purple/30 to-ai-purple/10",
  chorus: "from-ai-pink/30 to-ai-pink/10",
  bridge: "from-ai-cyan/30 to-ai-cyan/10",
  outro: "from-ai-gold/30 to-ai-gold/10",
  drop: "from-ai-pink/40 to-ai-purple/20",
};

const typeColors: Record<string, string> = {
  drums: "bg-ai-pink/60",
  bass: "bg-ai-purple/60",
  melody: "bg-ai-blue/60",
  vocals: "bg-ai-gold/60",
  fx: "bg-ai-cyan/60",
  sample: "bg-primary/60",
};

export const SessionTimeline = ({
  sections,
  currentSection,
  onSelectSection,
  onAddSection,
  onRemoveClip,
  onToggleLock,
  isPlaying,
  playheadPosition,
  isProducer,
}: SessionTimelineProps) => {
  const [viewOffset, setViewOffset] = useState(0);
  const [hoveredClip, setHoveredClip] = useState<string | null>(null);

  const visibleSections = sections.slice(viewOffset, viewOffset + 4);
  const canScrollLeft = viewOffset > 0;
  const canScrollRight = viewOffset + 4 < sections.length;

  const totalBars = sections.reduce((acc, s) => acc + s.bars, 0);
  const currentBar = Math.floor((playheadPosition / 100) * totalBars);

  return (
    <div className="glass-panel p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-ai-purple" />
          <h2 className="font-display text-xs font-semibold tracking-wider text-ai-purple">
            SESSION TIMELINE
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground font-mono">
            Bar {currentBar + 1} / {totalBars}
          </span>
          {isProducer && (
            <Button
              size="sm"
              variant="outline"
              onClick={onAddSection}
              className="h-6 px-2 text-[10px] hover:bg-ai-purple/20 hover:border-ai-purple/50"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Section
            </Button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setViewOffset(Math.max(0, viewOffset - 1))}
          disabled={!canScrollLeft}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <div className="flex-1 overflow-hidden">
          <div className="flex gap-2">
            {visibleSections.map((section) => (
              <div
                key={section.id}
                onClick={() => onSelectSection(section.id)}
                className={`
                  flex-1 min-w-0 rounded-lg cursor-pointer transition-all
                  bg-gradient-to-b ${sectionColors[section.name.toLowerCase()] || sectionColors.verse}
                  border-2 ${section.id === currentSection 
                    ? "border-ai-purple shadow-lg shadow-ai-purple/20" 
                    : "border-transparent hover:border-border/50"
                  }
                  ${section.isLocked ? "opacity-75" : ""}
                `}
              >
                {/* Section Header */}
                <div className="flex items-center justify-between px-2 py-1 border-b border-white/10">
                  <span className="font-display text-[10px] font-semibold uppercase truncate">
                    {section.name}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] text-muted-foreground">
                      {section.bars} bars
                    </span>
                    {isProducer && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleLock(section.id);
                        }}
                        className="p-0.5 hover:bg-white/10 rounded"
                      >
                        {section.isLocked ? (
                          <Lock className="w-3 h-3 text-ai-gold" />
                        ) : (
                          <Unlock className="w-3 h-3 text-muted-foreground" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Clips Stack */}
                <div className="p-2 space-y-1 min-h-[80px]">
                  {section.clips.length === 0 ? (
                    <div className="flex items-center justify-center h-16 text-muted-foreground">
                      <Music className="w-4 h-4 opacity-30" />
                    </div>
                  ) : (
                    section.clips.map((clip) => (
                      <div
                        key={clip.id}
                        onMouseEnter={() => setHoveredClip(clip.id)}
                        onMouseLeave={() => setHoveredClip(null)}
                        className={`
                          relative flex items-center gap-1 px-2 py-1 rounded text-[10px]
                          ${typeColors[clip.type]} backdrop-blur-sm
                          transition-all hover:scale-[1.02]
                        `}
                      >
                        <span className="truncate flex-1">{clip.name}</span>
                        <span className="text-[9px] opacity-70">{clip.duration}s</span>
                        
                        {/* Remove Button (Producer only, on hover) */}
                        {isProducer && hoveredClip === clip.id && !section.isLocked && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveClip(section.id, clip.id);
                            }}
                            className="absolute right-0 top-0 bottom-0 w-6 flex items-center justify-center bg-destructive/80 rounded-r hover:bg-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => setViewOffset(Math.min(sections.length - 4, viewOffset + 1))}
          disabled={!canScrollRight}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Playhead Indicator */}
      {isPlaying && (
        <div className="relative h-1 bg-muted/30 rounded-full overflow-hidden">
          <div 
            className="absolute h-full bg-gradient-to-r from-ai-purple to-ai-pink transition-all duration-100"
            style={{ width: `${playheadPosition}%` }}
          />
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-lg shadow-ai-purple/50"
            style={{ left: `${playheadPosition}%` }}
          />
        </div>
      )}

      {/* Section Legend */}
      <div className="flex flex-wrap gap-2 justify-center">
        {Object.entries(typeColors).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded ${color}`} />
            <span className="text-[9px] text-muted-foreground capitalize">{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
