import { useState, useCallback } from "react";
import { Copy, Check, Users, Link2, Share2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface InviteSystemProps {
  sessionId: string;
  sessionName: string;
  isProducer: boolean;
  onJoinWithCode?: (code: string) => Promise<boolean>;
}

// Generate a unique 6-character invite code
const generateInviteCode = (sessionId: string): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed confusing chars like 0, O, I, 1
  const hash = sessionId.split("").reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  let code = "";
  let seed = Math.abs(hash);
  for (let i = 0; i < 6; i++) {
    code += chars[seed % chars.length];
    seed = Math.floor(seed / chars.length) + Date.now() % 1000;
  }
  return code;
};

export const InviteSystem = ({
  sessionId,
  sessionName,
  isProducer,
  onJoinWithCode,
}: InviteSystemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [activeTab, setActiveTab] = useState<"invite" | "join">("invite");

  const inviteCode = generateInviteCode(sessionId);
  const inviteUrl = `${window.location.origin}?join=${inviteCode}`;

  const handleCopyCode = useCallback(() => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    toast.success("Invite code copied!");
    setTimeout(() => setCopied(false), 2000);
  }, [inviteCode]);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(inviteUrl);
    toast.success("Invite link copied!");
  }, [inviteUrl]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${sessionName}`,
          text: `Join my music session on Crowd Studio! Use code: ${inviteCode}`,
          url: inviteUrl,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      handleCopyLink();
    }
  }, [sessionName, inviteCode, inviteUrl, handleCopyLink]);

  const handleJoinSession = useCallback(async () => {
    if (!joinCode.trim() || joinCode.length !== 6) {
      toast.error("Please enter a valid 6-character code");
      return;
    }

    setIsJoining(true);
    try {
      const success = await onJoinWithCode?.(joinCode.toUpperCase());
      if (success) {
        toast.success("Joined session successfully!");
        setIsOpen(false);
        setJoinCode("");
      } else {
        toast.error("Invalid invite code or session not found");
      }
    } catch (error) {
      toast.error("Failed to join session");
    } finally {
      setIsJoining(false);
    }
  }, [joinCode, onJoinWithCode]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1 text-xs">
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">Invite</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md glass-panel border-ai-purple/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-ai-purple">
            <Users className="w-5 h-5" />
            Collaborate Together
          </DialogTitle>
          <DialogDescription>
            Invite others to join your music session or join an existing one
          </DialogDescription>
        </DialogHeader>

        {/* Tab Selection */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={activeTab === "invite" ? "default" : "outline"}
            size="sm"
            className={`flex-1 ${activeTab === "invite" ? "bg-ai-purple hover:bg-ai-purple/90" : ""}`}
            onClick={() => setActiveTab("invite")}
          >
            <Share2 className="w-4 h-4 mr-1" />
            Invite Others
          </Button>
          <Button
            variant={activeTab === "join" ? "default" : "outline"}
            size="sm"
            className={`flex-1 ${activeTab === "join" ? "bg-ai-cyan hover:bg-ai-cyan/90" : ""}`}
            onClick={() => setActiveTab("join")}
          >
            <UserPlus className="w-4 h-4 mr-1" />
            Join Session
          </Button>
        </div>

        {activeTab === "invite" ? (
          <div className="space-y-4">
            {/* Session Info */}
            <div className="p-3 rounded-lg bg-background/50 border border-border/30">
              <p className="text-xs text-muted-foreground">Current Session</p>
              <p className="font-display text-sm text-foreground">{sessionName}</p>
              {isProducer && (
                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-ai-gold/20 text-ai-gold text-[10px]">
                  👑 You're the Producer
                </span>
              )}
            </div>

            {/* Invite Code */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Invite Code
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-3 rounded-lg bg-background/80 border-2 border-ai-purple/50 text-center">
                  <span className="font-mono text-2xl font-bold tracking-[0.3em] text-ai-purple">
                    {inviteCode}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyCode}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Invite Link */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Or share link
              </label>
              <div className="flex items-center gap-2">
                <Input
                  value={inviteUrl}
                  readOnly
                  className="text-xs bg-background/50"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                  className="shrink-0"
                >
                  <Link2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Share Button */}
            <Button
              className="w-full bg-ai-purple hover:bg-ai-purple/90"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Invite
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Join with Code */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Enter Invite Code
              </label>
              <Input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                placeholder="XXXXXX"
                className="font-mono text-xl text-center tracking-[0.3em] uppercase bg-background/80 border-2 border-ai-cyan/50"
                maxLength={6}
              />
              <p className="text-[10px] text-muted-foreground text-center">
                Enter the 6-character code shared with you
              </p>
            </div>

            {/* Join Button */}
            <Button
              className="w-full bg-ai-cyan hover:bg-ai-cyan/90 text-black"
              onClick={handleJoinSession}
              disabled={isJoining || joinCode.length !== 6}
            >
              {isJoining ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Joining...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Join Session
                </>
              )}
            </Button>
          </div>
        )}

        {/* Info */}
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          {activeTab === "invite"
            ? "Anyone with this code can join and contribute to your session"
            : "You'll join as a contributor and can submit clips for voting"}
        </p>
      </DialogContent>
    </Dialog>
  );
};
