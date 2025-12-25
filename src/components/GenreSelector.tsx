import { cn } from "@/lib/utils";

interface Genre {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  bpm: number;
}

interface GenreSelectorProps {
  selectedGenre: string;
  onSelect: (genre: string) => void;
  onPlaySound?: (genre: string) => void;
  onBpmChange?: (bpm: number) => void;
}

const genres: Genre[] = [
  { id: "roots", name: "ROOTS", subtitle: "Slow", icon: "🎸", bpm: 70 },
  { id: "groove", name: "GROOVE", subtitle: "Medium", icon: "🎹", bpm: 110 },
  { id: "future", name: "FUTURE", subtitle: "Fast", icon: "⚡", bpm: 150 },
];

export const GenreSelector = ({ selectedGenre, onSelect, onPlaySound, onBpmChange }: GenreSelectorProps) => {
  const handleSelect = (genreId: string) => {
    onSelect(genreId);
    onPlaySound?.(genreId);
    
    // Find the genre and update BPM
    const genre = genres.find(g => g.id === genreId);
    if (genre && onBpmChange) {
      onBpmChange(genre.bpm);
    }
  };

  return (
    <div className="glass-panel p-4 space-y-3">
      <h3 className="font-display text-sm font-semibold tracking-wider text-accent glow-text-accent">
        SPEED CONTROL
      </h3>
      <div className="flex gap-2">
        {genres.map((genre) => (
          <button
            key={genre.id}
            onClick={() => handleSelect(genre.id)}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-lg border transition-all duration-300",
              selectedGenre === genre.id
                ? "border-primary bg-primary/10 glow-box"
                : "border-border bg-card/50 hover:border-primary/50 hover:bg-card"
            )}
          >
            <span className="text-xl">{genre.icon}</span>
            <span className={cn(
              "font-display text-xs font-semibold tracking-wider",
              selectedGenre === genre.id ? "text-primary" : "text-foreground"
            )}>
              {genre.name}
            </span>
            <span className="text-[10px] text-muted-foreground">{genre.subtitle}</span>
            <span className={cn(
              "text-[10px] font-mono",
              selectedGenre === genre.id ? "text-primary" : "text-muted-foreground"
            )}>
              {genre.bpm} BPM
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
