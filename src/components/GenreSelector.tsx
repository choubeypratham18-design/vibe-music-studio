import { cn } from "@/lib/utils";
import { Zap, Gauge, Rocket } from "lucide-react";

interface Genre {
  id: string;
  name: string;
  subtitle: string;
  icon: React.ReactNode;
  bpm: number;
}

interface GenreSelectorProps {
  selectedGenre: string;
  onSelect: (genre: string) => void;
  onPlaySound?: (genre: string) => void;
  onBpmChange?: (bpm: number) => void;
}

const genres: Genre[] = [
  { id: "roots", name: "ROOTS", subtitle: "Slow", icon: <Gauge className="w-5 h-5" />, bpm: 70 },
  { id: "groove", name: "GROOVE", subtitle: "Medium", icon: <Zap className="w-5 h-5" />, bpm: 110 },
  { id: "future", name: "FUTURE", subtitle: "Fast", icon: <Rocket className="w-5 h-5" />, bpm: 150 },
];

export const GenreSelector = ({ selectedGenre, onSelect, onPlaySound, onBpmChange }: GenreSelectorProps) => {
  const handleSelect = (genreId: string) => {
    onSelect(genreId);
    onPlaySound?.(genreId);
    
    const genre = genres.find(g => g.id === genreId);
    if (genre && onBpmChange) {
      onBpmChange(genre.bpm);
    }
  };

  return (
    <div className="glass-panel p-3 sm:p-4 space-y-2 sm:space-y-3">
      <h3 className="font-display text-xs font-semibold tracking-wider text-ai-gold">
        SPEED CONTROL
      </h3>
      <div className="flex gap-1 sm:gap-2">
        {genres.map((genre) => (
          <button
            key={genre.id}
            onClick={() => handleSelect(genre.id)}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-2 sm:py-3 px-1 sm:px-2 rounded-lg border transition-all duration-300",
              selectedGenre === genre.id
                ? "border-ai-purple bg-ai-purple/10 glow-box"
                : "border-border bg-card/50 hover:border-ai-purple/50 hover:bg-card"
            )}
          >
            <span className={cn(
              selectedGenre === genre.id ? "text-ai-purple" : "text-muted-foreground"
            )}>
              {genre.icon}
            </span>
            <span className={cn(
              "font-display text-[10px] sm:text-xs font-semibold tracking-wider",
              selectedGenre === genre.id ? "text-ai-purple" : "text-foreground"
            )}>
              {genre.name}
            </span>
            <span className="text-[9px] sm:text-[10px] text-muted-foreground">{genre.subtitle}</span>
            <span className={cn(
              "text-[9px] sm:text-[10px] font-mono",
              selectedGenre === genre.id ? "text-ai-purple" : "text-muted-foreground"
            )}>
              {genre.bpm} BPM
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
