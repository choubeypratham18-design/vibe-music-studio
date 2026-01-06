import { Users, Sparkles } from "lucide-react";

export const GlobalTelepathy = () => {
  const activeUsers = [
    { id: 1, status: "creating" },
    { id: 2, status: "listening" },
    { id: 3, status: "creating" },
    { id: 4, status: "live" },
    { id: 5, status: "listening" },
  ];

  return (
    <div className="glass-panel p-3 sm:p-4 space-y-2 sm:space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-ai-gold" />
        <h3 className="font-display text-xs font-semibold tracking-wider text-ai-gold">
          AI NETWORK
        </h3>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        {activeUsers.map((user, index) => (
          <div
            key={user.id}
            className="relative"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-ai-purple to-ai-pink flex items-center justify-center text-[10px] sm:text-xs border border-ai-purple/30 animate-pulse-glow">
              <Users className="w-3 h-3 text-white" />
            </div>
            {user.status === "live" && (
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-ai-cyan rounded-full border border-background animate-pulse" />
            )}
          </div>
        ))}
        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-muted/50 border border-dashed border-muted-foreground flex items-center justify-center text-[10px] text-muted-foreground">
          +42
        </div>
      </div>

      <div className="flex gap-0.5 h-6 sm:h-8 items-end">
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-gradient-to-t from-ai-purple/50 to-ai-pink rounded-t"
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
