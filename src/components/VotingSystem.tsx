import { useState } from "react";
import { ThumbsUp, ThumbsDown, Play, Pause, Sparkles, Crown, Clock, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { AudioClip } from "./ClipSubmission";

interface VotingSystemProps {
  clips: AudioClip[];
  onVote: (clipId: string, vote: "up" | "down") => void;
  onProducerApprove: (clipId: string) => void;
  onProducerReject: (clipId: string) => void;
  isProducer: boolean;
  votingTimeLeft: number;
}

export const VotingSystem = ({
  clips,
  onVote,
  onProducerApprove,
  onProducerReject,
  isProducer,
  votingTimeLeft,
}: VotingSystemProps) => {
  const [playingClipId, setPlayingClipId] = useState<string | null>(null);
  const [votedClips, setVotedClips] = useState<Set<string>>(new Set());

  const pendingClips = clips.filter(c => c.status === "voting" || c.status === "pending");
  
  const handleVote = (clipId: string, vote: "up" | "down") => {
    if (votedClips.has(clipId)) {
      toast.warning("You've already voted on this clip");
      return;
    }
    onVote(clipId, vote);
    setVotedClips(prev => new Set([...prev, clipId]));
    toast.success(`Vote recorded: ${vote === "up" ? "👍" : "👎"}`);
  };

  const togglePlay = (clipId: string) => {
    setPlayingClipId(playingClipId === clipId ? null : clipId);
  };

  const getVotePercentage = (clip: AudioClip) => {
    const total = clip.votes.up + clip.votes.down;
    if (total === 0) return 50;
    return (clip.votes.up / total) * 100;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (pendingClips.length === 0) {
    return (
      <div className="glass-panel p-4">
        <div className="flex items-center gap-2 mb-4">
          <ThumbsUp className="w-4 h-4 text-ai-gold" />
          <h2 className="font-display text-xs font-semibold tracking-wider text-ai-gold">
            VOTING
          </h2>
        </div>
        <div className="text-center py-6 text-muted-foreground">
          <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-xs">No clips pending votes</p>
          <p className="text-[10px] mt-1">Submit a clip to start the voting!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ThumbsUp className="w-4 h-4 text-ai-gold" />
          <h2 className="font-display text-xs font-semibold tracking-wider text-ai-gold">
            VOTING
          </h2>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-ai-gold/20 text-ai-gold">
            {pendingClips.length}
          </span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span className="text-[10px] font-mono">{formatTime(votingTimeLeft)}</span>
        </div>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {pendingClips.map((clip) => (
          <div
            key={clip.id}
            className={`
              bg-background/40 rounded-lg p-3 border transition-all
              ${clip.status === "voting" 
                ? "border-ai-gold/40 hover:border-ai-gold/60" 
                : "border-border/30 hover:border-border/50"
              }
            `}
          >
            {/* Clip Header */}
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => togglePlay(clip.id)}
                className="w-8 h-8 rounded-full bg-ai-purple/20 hover:bg-ai-purple/30 flex items-center justify-center transition-all"
              >
                {playingClipId === clip.id ? (
                  <Pause className="w-4 h-4 text-ai-purple" />
                ) : (
                  <Play className="w-4 h-4 text-ai-purple ml-0.5" />
                )}
              </button>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-display text-xs font-semibold truncate">
                    {clip.name}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground">
                    {clip.type}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span>{clip.submittedBy.avatar} {clip.submittedBy.name}</span>
                  <span>•</span>
                  <span>{clip.duration}s</span>
                </div>
              </div>

              {/* AI Score */}
              {clip.aiScore && (
                <div className="flex items-center gap-1 px-2 py-1 rounded bg-ai-cyan/10 border border-ai-cyan/20">
                  <Sparkles className="w-3 h-3 text-ai-cyan" />
                  <span className="text-[10px] font-mono text-ai-cyan">{clip.aiScore}%</span>
                </div>
              )}
            </div>

            {/* Waveform Preview */}
            <div className="flex items-end gap-0.5 h-8 mb-3">
              {clip.waveform.map((val, i) => (
                <div
                  key={i}
                  className={`
                    flex-1 rounded-full transition-all
                    ${playingClipId === clip.id ? "bg-ai-purple" : "bg-muted-foreground/30"}
                  `}
                  style={{ 
                    height: `${Math.max(10, val * 0.8)}%`,
                    animationDelay: `${i * 50}ms`,
                  }}
                />
              ))}
            </div>

            {/* Vote Progress Bar */}
            <div className="mb-3">
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-green-400">👍 {clip.votes.up}</span>
                <span className="text-red-400">👎 {clip.votes.down}</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden bg-red-500/30">
                <div 
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{ width: `${getVotePercentage(clip)}%` }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {isProducer ? (
                // Producer Controls
                <>
                  <Button
                    size="sm"
                    onClick={() => onProducerApprove(clip.id)}
                    className="flex-1 h-8 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onProducerReject(clip.id)}
                    className="flex-1 h-8 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
                  >
                    <XCircle className="w-3 h-3 mr-1" />
                    Reject
                  </Button>
                </>
              ) : (
                // Collaborator Voting
                <>
                  <Button
                    size="sm"
                    onClick={() => handleVote(clip.id, "up")}
                    disabled={votedClips.has(clip.id)}
                    className={`
                      flex-1 h-8 transition-all
                      ${votedClips.has(clip.id) 
                        ? "opacity-50" 
                        : "hover:bg-green-500/20 hover:text-green-400 hover:border-green-500/30"
                      }
                    `}
                    variant="outline"
                  >
                    <ThumbsUp className="w-3 h-3 mr-1" />
                    Vote Up
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleVote(clip.id, "down")}
                    disabled={votedClips.has(clip.id)}
                    className={`
                      flex-1 h-8 transition-all
                      ${votedClips.has(clip.id) 
                        ? "opacity-50" 
                        : "hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30"
                      }
                    `}
                    variant="outline"
                  >
                    <ThumbsDown className="w-3 h-3 mr-1" />
                    Vote Down
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Producer Status */}
      {isProducer && (
        <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-ai-gold/10 border border-ai-gold/20">
          <Crown className="w-4 h-4 text-ai-gold" />
          <span className="text-[10px] text-ai-gold font-display">
            Producer Mode: Final approval required
          </span>
        </div>
      )}
    </div>
  );
};
