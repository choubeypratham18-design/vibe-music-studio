import { Users } from "lucide-react";

export const GlobalTelepathy = () => {
  const activeUsers = [
    { id: 1, avatar: "🎵", status: "creating" },
    { id: 2, avatar: "🎸", status: "listening" },
    { id: 3, avatar: "🎹", status: "creating" },
    { id: 4, avatar: "🎤", status: "live" },
    { id: 5, avatar: "🎧", status: "listening" },
  ];

  return (
    <div className="glass-panel p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-accent" />
        <h3 className="font-display text-sm font-semibold tracking-wider text-accent glow-text-accent">
          GLOBAL TELEPATHY
        </h3>
      </div>

      <div className="flex items-center gap-2">
        {activeUsers.map((user, index) => (
          <div
            key={user.id}
            className="relative"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm border border-primary/30 animate-pulse-glow">
              {user.avatar}
            </div>
            {user.status === "live" && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-background animate-pulse" />
            )}
          </div>
        ))}
        <div className="w-8 h-8 rounded-full bg-muted/50 border border-dashed border-muted-foreground flex items-center justify-center text-xs text-muted-foreground">
          +42
        </div>
      </div>

      <div className="flex gap-1 h-8 items-end">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-gradient-to-t from-primary/50 to-primary rounded-t"
            style={{
              height: `${Math.random() * 100}%`,
              animation: "pulse 1s ease-in-out infinite",
              animationDelay: `${i * 0.05}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};
