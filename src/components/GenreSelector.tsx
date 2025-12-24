import { cn } from "@/lib/utils";

interface Genre {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
}

interface GenreSelectorProps {
  selectedGenre: string;
  onSelect: (genre: string) => void;
  onPlaySound?: (genre: string) => void;
}

const genres: Genre[] = [
  { id: "roots", name: "ROOTS", subtitle: "Acoustic", icon: "🎸" },
  { id: "groove", name: "GROOVE", subtitle: "Funk", icon: "🎹" },
  { id: "future", name: "FUTURE", subtitle: "Cyber", icon: "⚡" },
];

export const GenreSelector = ({ selectedGenre, onSelect, onPlaySound }: GenreSelectorProps) => {
  const handleSelect = (genreId: string) => {
    onSelect(genreId);
    onPlaySound?.(genreId);
  };

  return (
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
        </button>
      ))}
    </div>
  );
};
