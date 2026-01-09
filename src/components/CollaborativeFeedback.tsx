import { useState, useEffect } from "react";
import { Users, MessageSquare, ThumbsUp, ThumbsDown, Send, Zap, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  isProducer: boolean;
  isOnline: boolean;
}

interface FeedbackItem {
  id: string;
  userId: string;
  userName: string;
  message: string;
  type: "suggestion" | "vote" | "comment";
  vote?: "up" | "down";
  timestamp: Date;
  parameter?: string;
  suggestedValue?: number;
}

interface CollaborativeFeedbackProps {
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
  onApplySuggestion: (param: string, value: number) => void;
}

// Simulated collaborators for demo
const mockCollaborators: Collaborator[] = [
  { id: "1", name: "You (Producer)", avatar: "👑", isProducer: true, isOnline: true },
  { id: "2", name: "Alex", avatar: "🎧", isProducer: false, isOnline: true },
  { id: "3", name: "Maya", avatar: "🎹", isProducer: false, isOnline: true },
  { id: "4", name: "Jordan", avatar: "🥁", isProducer: false, isOnline: false },
];

export const CollaborativeFeedback = ({
  currentParams,
  onApplySuggestion,
}: CollaborativeFeedbackProps) => {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);

  // Simulate incoming feedback
  useEffect(() => {
    const suggestions = [
      { userId: "2", userName: "Alex", message: "Maybe boost the bass a bit?", parameter: "bass", suggestedValue: Math.min(100, currentParams.bass + 15) },
      { userId: "3", userName: "Maya", message: "The synth sounds great at this level!", type: "comment" as const },
      { userId: "2", userName: "Alex", message: "Try slowing down the tempo", parameter: "rhythm", suggestedValue: Math.max(60, currentParams.rhythm - 10) },
    ];

    const interval = setInterval(() => {
      if (Math.random() > 0.7 && feedback.length < 10) {
        const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
        const newFeedback: FeedbackItem = {
          id: `feedback-${Date.now()}`,
          userId: randomSuggestion.userId,
          userName: randomSuggestion.userName,
          message: randomSuggestion.message,
          type: randomSuggestion.parameter ? "suggestion" : "comment",
          timestamp: new Date(),
          parameter: randomSuggestion.parameter,
          suggestedValue: randomSuggestion.suggestedValue,
        };
        setFeedback(prev => [newFeedback, ...prev].slice(0, 15));
        toast.info(`${randomSuggestion.userName}: ${randomSuggestion.message}`, {
          icon: "💬",
        });
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [currentParams, feedback.length]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const newFeedback: FeedbackItem = {
      id: `feedback-${Date.now()}`,
      userId: "1",
      userName: "You",
      message: newMessage,
      type: "comment",
      timestamp: new Date(),
    };
    setFeedback(prev => [newFeedback, ...prev]);
    setNewMessage("");
    toast.success("Message sent to collaborators");
  };

  const handleApprove = (item: FeedbackItem) => {
    if (item.parameter && item.suggestedValue !== undefined) {
      onApplySuggestion(item.parameter, item.suggestedValue);
      toast.success(`Applied ${item.userName}'s suggestion`, {
        description: `${item.parameter.toUpperCase()}: ${item.suggestedValue}`,
      });
      setFeedback(prev => prev.filter(f => f.id !== item.id));
    }
  };

  const handleReject = (item: FeedbackItem) => {
    setFeedback(prev => prev.filter(f => f.id !== item.id));
    toast.info("Suggestion dismissed");
  };

  const onlineCount = mockCollaborators.filter(c => c.isOnline).length;

  return (
    <div className="glass-panel p-3 sm:p-4 space-y-3">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-ai-gold" />
          <h2 className="font-display text-xs font-semibold tracking-wider text-ai-gold">
            COLLABORATORS
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {mockCollaborators.slice(0, 4).map((collab) => (
              <div
                key={collab.id}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-sm
                  ${collab.isOnline ? "bg-ai-purple/30 border border-ai-purple/50" : "bg-muted/50 border border-border/50 opacity-50"}
                  ${collab.isProducer ? "ring-2 ring-ai-gold" : ""}
                `}
                title={`${collab.name}${collab.isProducer ? " (Producer)" : ""}`}
              >
                {collab.avatar}
              </div>
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground">
            {onlineCount} online
          </span>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Live Feedback Stream */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {feedback.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-3">
                Waiting for collaborator feedback...
              </p>
            ) : (
              feedback.map((item) => (
                <div
                  key={item.id}
                  className={`
                    bg-background/40 rounded-lg p-2 border transition-all
                    ${item.type === "suggestion" 
                      ? "border-ai-gold/40 hover:border-ai-gold/60" 
                      : "border-border/30"
                    }
                  `}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-display text-xs font-semibold text-foreground">
                          {item.userName}
                        </span>
                        {item.userId === "1" && (
                          <Crown className="w-3 h-3 text-ai-gold" />
                        )}
                        {item.type === "suggestion" && (
                          <span className="text-[9px] px-1 py-0.5 rounded bg-ai-gold/20 text-ai-gold">
                            SUGGESTION
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.message}
                      </p>
                      {item.parameter && (
                        <div className="flex items-center gap-1 mt-1">
                          <Zap className="w-3 h-3 text-ai-gold" />
                          <span className="text-[10px] text-ai-gold">
                            {item.parameter.toUpperCase()}: {currentParams[item.parameter as keyof typeof currentParams]} → {item.suggestedValue}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {item.type === "suggestion" && item.userId !== "1" && (
                      <div className="flex gap-1 shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleApprove(item)}
                          className="h-6 w-6 p-0 hover:bg-green-500/20 hover:text-green-400"
                          title="Approve suggestion"
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleReject(item)}
                          className="h-6 w-6 p-0 hover:bg-red-500/20 hover:text-red-400"
                          title="Dismiss suggestion"
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Message Input */}
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Send feedback to collaborators..."
              className="flex-1 h-8 text-xs bg-background/50 border-border/50"
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <Button
              size="sm"
              onClick={handleSendMessage}
              className="h-8 px-3 bg-ai-gold/20 hover:bg-ai-gold/30 text-ai-gold border border-ai-gold/30"
            >
              <Send className="w-3 h-3" />
            </Button>
          </div>

          {/* Producer Status */}
          <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-ai-gold/10 border border-ai-gold/20">
            <Crown className="w-4 h-4 text-ai-gold" />
            <span className="text-xs text-ai-gold font-display">
              You are the Producer - All changes require your approval
            </span>
          </div>
        </>
      )}
    </div>
  );
};
