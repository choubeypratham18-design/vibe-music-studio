import { useState, useEffect } from "react";
import { Users, Crown, Music, Star, TrendingUp } from "lucide-react";

interface Participant {
  id: string;
  name: string;
  avatar: string;
  role: "producer" | "contributor" | "listener";
  contributions: number;
  isOnline: boolean;
  lastActive?: Date;
}

interface CrowdParticipantsProps {
  sessionId: string;
  isProducer: boolean;
}

// Simulated participants
const mockParticipants: Participant[] = [
  { id: "1", name: "Producer", avatar: "👑", role: "producer", contributions: 0, isOnline: true },
  { id: "2", name: "Alex", avatar: "🎧", role: "contributor", contributions: 5, isOnline: true },
  { id: "3", name: "Maya", avatar: "🎹", role: "contributor", contributions: 3, isOnline: true },
  { id: "4", name: "Jordan", avatar: "🥁", role: "contributor", contributions: 7, isOnline: true },
  { id: "5", name: "Sam", avatar: "🎸", role: "contributor", contributions: 2, isOnline: false },
  { id: "6", name: "Chris", avatar: "🎤", role: "listener", contributions: 0, isOnline: true },
  { id: "7", name: "Taylor", avatar: "🎵", role: "listener", contributions: 0, isOnline: true },
];

export const CrowdParticipants = ({ sessionId, isProducer }: CrowdParticipantsProps) => {
  const [participants, setParticipants] = useState<Participant[]>(mockParticipants);
  const [isExpanded, setIsExpanded] = useState(false);

  // Simulate random participant activity
  useEffect(() => {
    const interval = setInterval(() => {
      setParticipants((prev) =>
        prev.map((p) => ({
          ...p,
          isOnline: p.role === "producer" ? true : Math.random() > 0.1,
        }))
      );
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const onlineCount = participants.filter((p) => p.isOnline).length;
  const topContributors = [...participants]
    .filter((p) => p.contributions > 0)
    .sort((a, b) => b.contributions - a.contributions)
    .slice(0, 3);

  const getRoleColor = (role: string) => {
    switch (role) {
      case "producer":
        return "text-ai-gold";
      case "contributor":
        return "text-ai-purple";
      default:
        return "text-muted-foreground";
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "producer":
        return "bg-ai-gold/20 text-ai-gold border-ai-gold/30";
      case "contributor":
        return "bg-ai-purple/20 text-ai-purple border-ai-purple/30";
      default:
        return "bg-muted/20 text-muted-foreground border-border/30";
    }
  };

  return (
    <div className="glass-panel p-4 space-y-3">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-ai-pink" />
          <h2 className="font-display text-xs font-semibold tracking-wider text-ai-pink">
            CROWD
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {participants.slice(0, 5).map((p) => (
              <div
                key={p.id}
                className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-sm
                  ${p.isOnline ? "bg-card border-2 border-background" : "opacity-50"}
                  ${p.role === "producer" ? "ring-2 ring-ai-gold" : ""}
                `}
                title={p.name}
              >
                {p.avatar}
              </div>
            ))}
            {participants.length > 5 && (
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] bg-muted text-muted-foreground border-2 border-background">
                +{participants.length - 5}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] text-muted-foreground">{onlineCount} online</span>
          </div>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Top Contributors */}
          {topContributors.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <TrendingUp className="w-3 h-3" />
                <span>Top Contributors</span>
              </div>
              <div className="flex gap-2">
                {topContributors.map((p, idx) => (
                  <div
                    key={p.id}
                    className="flex-1 flex items-center gap-2 bg-background/40 rounded-lg px-2 py-1.5"
                  >
                    {idx === 0 && <Star className="w-3 h-3 text-ai-gold" />}
                    <span className="text-sm">{p.avatar}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-display truncate">{p.name}</p>
                      <p className="text-[9px] text-muted-foreground">{p.contributions} clips</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Participants */}
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {participants.map((p) => (
              <div
                key={p.id}
                className={`
                  flex items-center gap-2 px-2 py-1.5 rounded-lg
                  ${p.isOnline ? "bg-background/30" : "opacity-50"}
                `}
              >
                <div className="relative">
                  <span className="text-sm">{p.avatar}</span>
                  {p.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-500 border border-background" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className={`text-xs font-display truncate ${getRoleColor(p.role)}`}>
                      {p.name}
                    </span>
                    {p.role === "producer" && <Crown className="w-3 h-3 text-ai-gold" />}
                  </div>
                </div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded border ${getRoleBadge(p.role)}`}>
                  {p.role}
                </span>
                {p.contributions > 0 && (
                  <div className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
                    <Music className="w-2.5 h-2.5" />
                    {p.contributions}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Session Stats */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/30">
            <div className="text-center">
              <p className="text-lg font-display text-ai-pink">{participants.length}</p>
              <p className="text-[9px] text-muted-foreground">Total</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-display text-ai-purple">
                {participants.filter((p) => p.role === "contributor").length}
              </p>
              <p className="text-[9px] text-muted-foreground">Contributors</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-display text-ai-gold">
                {participants.reduce((acc, p) => acc + p.contributions, 0)}
              </p>
              <p className="text-[9px] text-muted-foreground">Clips</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
