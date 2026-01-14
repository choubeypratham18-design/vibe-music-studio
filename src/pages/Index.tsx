import { useState, useEffect, useCallback, useMemo } from "react";
import { Header } from "@/components/Header";
import { UniverseBackground } from "@/components/UniverseBackground";
import { PlaybackControls } from "@/components/PlaybackControls";
import { KeyboardShortcutsHint } from "@/components/KeyboardShortcutsHint";
import { ClipSubmission, AudioClip } from "@/components/ClipSubmission";
import { VotingSystem } from "@/components/VotingSystem";
import { SessionTimeline } from "@/components/SessionTimeline";
import { AIDJPanel } from "@/components/AIDJPanel";
import { CrowdParticipants } from "@/components/CrowdParticipants";
import { GenreSelector } from "@/components/GenreSelector";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import { useRealtimeSession } from "@/hooks/useRealtimeSession";
import { toast } from "sonner";
import { Crown, Mic, Share2, Settings, Music, Layers, Users, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SessionSection {
  id: string;
  name: string;
  bars: number;
  isActive: boolean;
  isLocked: boolean;
  clips: AudioClip[];
}

const initialSections: SessionSection[] = [
  { id: "intro", name: "Intro", bars: 8, isActive: true, isLocked: false, clips: [] },
  { id: "verse1", name: "Verse", bars: 16, isActive: false, isLocked: false, clips: [] },
  { id: "chorus1", name: "Chorus", bars: 16, isActive: false, isLocked: false, clips: [] },
  { id: "verse2", name: "Verse", bars: 16, isActive: false, isLocked: false, clips: [] },
  { id: "chorus2", name: "Chorus", bars: 16, isActive: false, isLocked: false, clips: [] },
  { id: "bridge", name: "Bridge", bars: 8, isActive: false, isLocked: false, clips: [] },
  { id: "outro", name: "Outro", bars: 8, isActive: false, isLocked: false, clips: [] },
];

const Index = () => {
  // Realtime session hook
  const {
    session,
    clips: realtimeClips,
    participants,
    sections: realtimeSections,
    isConnected,
    isLoading,
    userId,
    submitClip,
    voteOnClip,
    updateClipStatus,
    addSection,
    toggleSectionLock,
    isProducer,
  } = useRealtimeSession();
  
  // Local state
  const [localSections, setLocalSections] = useState<SessionSection[]>(initialSections);
  const [currentSection, setCurrentSection] = useState("intro");
  
  // Voting state
  const [votingTimeLeft, setVotingTimeLeft] = useState(120);
  
  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [playheadPosition, setPlayheadPosition] = useState(0);
  const [currentTime, setCurrentTime] = useState("00:00:00");
  
  // Audio parameters
  const [selectedGenre, setSelectedGenre] = useState("groove");
  const [bpm, setBpm] = useState(session?.bpm || 120);
  
  // Mobile panel state
  const [activeTab, setActiveTab] = useState("submit");
  
  const { playGenreSound, startPlayback, stopPlayback } = useAudioEngine();

  // Convert realtime clips to local format
  const clips: AudioClip[] = useMemo(() => 
    realtimeClips.map(c => ({
      id: c.id,
      name: c.name,
      duration: c.duration,
      submittedBy: {
        id: c.submitted_by_id,
        name: c.submitted_by_name,
        avatar: c.submitted_by_avatar,
      },
      type: c.type,
      waveform: c.waveform,
      status: c.status,
      votes: { up: c.votes_up, down: c.votes_down },
      timestamp: new Date(c.created_at),
      aiScore: c.ai_score,
    })),
  [realtimeClips]);

  // Convert realtime sections to local format
  const sections: SessionSection[] = useMemo(() => {
    if (realtimeSections.length === 0) return localSections;
    return realtimeSections.map(s => ({
      id: s.id,
      name: s.name,
      bars: s.bars,
      isActive: s.id === currentSection,
      isLocked: s.is_locked,
      clips: clips.filter(c => c.status === "approved" && (c as any).section_id === s.id),
    }));
  }, [realtimeSections, currentSection, clips, localSections]);
  
  const musicIntensity = clips.length * 10 + bpm / 2;
  const sessionName = session?.name || "Crowd Banger #1";

  // Clock
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Voting countdown
  useEffect(() => {
    if (votingTimeLeft <= 0) {
      // Auto-process votes when time runs out
      processVotingResults();
      setVotingTimeLeft(120);
      return;
    }
    
    const interval = setInterval(() => {
      setVotingTimeLeft((prev) => prev - 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [votingTimeLeft]);

  // Playhead animation
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setPlayheadPosition((prev) => (prev >= 100 ? 0 : prev + 0.5));
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  // Process voting results - now uses realtime
  const processVotingResults = useCallback(() => {
    const votingClips = clips.filter((c) => c.status === "voting");
    votingClips.forEach((clip) => {
      if (clip.votes.up > clip.votes.down) {
        updateClipStatus(clip.id, "approved", currentSection);
        toast.info(`"${clip.name}" passed voting!`, {
          description: "Waiting for producer approval",
        });
      } else {
        updateClipStatus(clip.id, "rejected");
      }
    });
  }, [clips, updateClipStatus, currentSection]);

  // Handle clip submission - now uses realtime
  const handleSubmitClip = useCallback(async (clip: AudioClip) => {
    const status = isProducer ? "approved" : "voting";
    
    await submitClip({
      name: clip.name,
      duration: clip.duration,
      type: clip.type,
      waveform: clip.waveform,
      status,
      ai_score: clip.aiScore,
      submitted_by_id: userId,
      submitted_by_name: clip.submittedBy.name,
      submitted_by_avatar: clip.submittedBy.avatar,
      section_id: status === "approved" ? currentSection : undefined,
    });
  }, [isProducer, submitClip, userId, currentSection]);

  // Handle voting - now uses realtime
  const handleVote = useCallback(async (clipId: string, vote: "up" | "down") => {
    const success = await voteOnClip(clipId, vote);
    if (success) {
      toast.success(`Vote recorded: ${vote === "up" ? "👍" : "👎"}`);
    }
  }, [voteOnClip]);

  // Producer approval - now uses realtime
  const handleProducerApprove = useCallback(async (clipId: string) => {
    const clip = clips.find((c) => c.id === clipId);
    if (!clip) return;

    await updateClipStatus(clipId, "approved", currentSection);

    toast.success(`Approved "${clip.name}"`, {
      description: `Added to ${sections.find((s) => s.id === currentSection)?.name}`,
    });
  }, [clips, updateClipStatus, currentSection, sections]);

  // Producer rejection - now uses realtime
  const handleProducerReject = useCallback(async (clipId: string) => {
    const clip = clips.find((c) => c.id === clipId);
    await updateClipStatus(clipId, "rejected");
    toast.info(`Rejected "${clip?.name}"`);
  }, [clips, updateClipStatus]);

  // Section management
  const handleSelectSection = useCallback((sectionId: string) => {
    setCurrentSection(sectionId);
    toast.info(`Working on: ${sections.find((s) => s.id === sectionId)?.name}`);
  }, [sections]);

  const handleAddSection = useCallback(async () => {
    const sectionNames = ["Drop", "Breakdown", "Build", "Hook", "Verse", "Chorus"];
    const randomName = sectionNames[Math.floor(Math.random() * sectionNames.length)];
    
    if (session) {
      await addSection(randomName, 8);
    } else {
      // Fallback for local state
      const newSection: SessionSection = {
        id: `section-${Date.now()}`,
        name: randomName,
        bars: 8,
        isActive: false,
        isLocked: false,
        clips: [],
      };
      setLocalSections((prev) => [...prev, newSection]);
    }
    toast.success(`Added ${randomName} section`);
  }, [session, addSection]);

  const handleRemoveClip = useCallback((sectionId: string, clipId: string) => {
    // For now, removing clips from sections is handled locally
    setLocalSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, clips: s.clips.filter((c) => c.id !== clipId) }
          : s
      )
    );
    toast.info("Clip removed from section");
  }, []);

  const handleToggleSectionLock = useCallback(async (sectionId: string) => {
    if (session) {
      await toggleSectionLock(sectionId);
    } else {
      setLocalSections((prev) =>
        prev.map((s) =>
          s.id === sectionId ? { ...s, isLocked: !s.isLocked } : s
        )
      );
    }
  }, [session, toggleSectionLock]);

  // AI suggestion handler
  const handleAISuggestion = useCallback((suggestion: any) => {
    if (suggestion.action?.clipId) {
      handleProducerApprove(suggestion.action.clipId);
    } else {
      toast.info("AI suggestion noted", {
        description: suggestion.title,
      });
    }
  }, [handleProducerApprove]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onPlayPause: () => setIsPlaying(!isPlaying),
    onLockAll: () => {
      setLocalSections((prev) => prev.map((s) => ({ ...s, isLocked: true })));
      toast.success("All sections locked");
    },
    onUnlockAll: () => {
      setLocalSections((prev) => prev.map((s) => ({ ...s, isLocked: false })));
      toast.success("All sections unlocked");
    },
    onUndo: () => toast.info("Undo not available in this view"),
    onToggleAB: () => toast.info("A/B mode coming soon"),
  });

  const handleBpmChange = (newBpm: number) => {
    setBpm(newBpm);
    toast.info(`Tempo: ${newBpm} BPM`);
  };

  return (
    <div className="min-h-screen overflow-hidden relative">
      <UniverseBackground isPlaying={isPlaying} intensity={musicIntensity} />
      
      <div className="relative z-10 flex flex-col h-screen">
        {/* Header */}
        <header className="border-b border-border/30 bg-background/50 backdrop-blur-sm px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Music className="w-6 h-6 text-ai-purple" />
                <span className="font-display text-lg font-bold ai-gradient-text hidden sm:inline">
                  CROWD STUDIO
                </span>
              </div>
              <div className="h-6 w-px bg-border/50 hidden sm:block" />
              <div className="flex items-center gap-2">
                <span className="text-sm font-display text-foreground">{sessionName}</span>
                {isProducer && (
                  <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-ai-gold/20 text-ai-gold border border-ai-gold/30">
                    <Crown className="w-3 h-3" />
                    PRODUCER
                  </span>
                )}
                {/* Connection status */}
                <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full ${isConnected ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                  {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                  {isConnected ? 'LIVE' : 'OFFLINE'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="hidden sm:flex gap-1 text-xs">
                <Share2 className="w-4 h-4" />
                Invite
              </Button>
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Mobile Tabs */}
        <div className="lg:hidden border-b border-border/30 bg-background/50">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start rounded-none bg-transparent border-0 h-10 px-2">
              <TabsTrigger value="submit" className="flex-1 text-xs gap-1 data-[state=active]:text-ai-cyan data-[state=active]:border-b-2 data-[state=active]:border-ai-cyan rounded-none">
                <Mic className="w-3 h-3" />
                Submit
              </TabsTrigger>
              <TabsTrigger value="vote" className="flex-1 text-xs gap-1 data-[state=active]:text-ai-gold data-[state=active]:border-b-2 data-[state=active]:border-ai-gold rounded-none">
                <Users className="w-3 h-3" />
                Vote
              </TabsTrigger>
              <TabsTrigger value="timeline" className="flex-1 text-xs gap-1 data-[state=active]:text-ai-purple data-[state=active]:border-b-2 data-[state=active]:border-ai-purple rounded-none">
                <Layers className="w-3 h-3" />
                Timeline
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Main Content */}
        <main className="flex-1 flex overflow-hidden">
          {/* Left Panel - Submit & Vote */}
          <aside className="hidden lg:flex w-80 xl:w-96 p-4 space-y-4 overflow-y-auto border-r border-border/30 bg-background/30 backdrop-blur-sm flex-col">
            <ClipSubmission
              onSubmitClip={handleSubmitClip}
              sessionSection={sections.find((s) => s.id === currentSection)?.name || "Intro"}
              isProducer={isProducer}
            />
            
            <VotingSystem
              clips={clips}
              onVote={handleVote}
              onProducerApprove={handleProducerApprove}
              onProducerReject={handleProducerReject}
              isProducer={isProducer}
              votingTimeLeft={votingTimeLeft}
            />
          </aside>

          {/* Center - Timeline & Visualization */}
          <section className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
            {/* Desktop Timeline */}
            <div className="hidden lg:block">
              <SessionTimeline
                sections={sections}
                currentSection={currentSection}
                onSelectSection={handleSelectSection}
                onAddSection={handleAddSection}
                onRemoveClip={handleRemoveClip}
                onToggleLock={handleToggleSectionLock}
                isPlaying={isPlaying}
                playheadPosition={playheadPosition}
                isProducer={isProducer}
              />
            </div>

            {/* Mobile Content */}
            <div className="lg:hidden">
              <Tabs value={activeTab} className="w-full">
                <TabsContent value="submit" className="mt-0 space-y-4">
                  <ClipSubmission
                    onSubmitClip={handleSubmitClip}
                    sessionSection={sections.find((s) => s.id === currentSection)?.name || "Intro"}
                    isProducer={isProducer}
                  />
                </TabsContent>
                <TabsContent value="vote" className="mt-0 space-y-4">
                  <VotingSystem
                    clips={clips}
                    onVote={handleVote}
                    onProducerApprove={handleProducerApprove}
                    onProducerReject={handleProducerReject}
                    isProducer={isProducer}
                    votingTimeLeft={votingTimeLeft}
                  />
                  <CrowdParticipants sessionId={session?.id || "demo"} isProducer={isProducer} />
                </TabsContent>
                <TabsContent value="timeline" className="mt-0">
                  <SessionTimeline
                    sections={sections}
                    currentSection={currentSection}
                    onSelectSection={handleSelectSection}
                    onAddSection={handleAddSection}
                    onRemoveClip={handleRemoveClip}
                    onToggleLock={handleToggleSectionLock}
                    isPlaying={isPlaying}
                    playheadPosition={playheadPosition}
                    isProducer={isProducer}
                  />
                </TabsContent>
              </Tabs>
            </div>

            {/* Genre Selector - Desktop */}
            <div className="hidden lg:block">
              <GenreSelector
                selectedGenre={selectedGenre}
                onSelect={setSelectedGenre}
                onPlaySound={playGenreSound}
                onBpmChange={handleBpmChange}
              />
            </div>

            {/* Session Stats */}
            <div className="glass-panel p-4">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-display text-ai-purple">{sections.reduce((acc, s) => acc + s.clips.length, 0)}</p>
                  <p className="text-[10px] text-muted-foreground">Clips Added</p>
                </div>
                <div>
                  <p className="text-2xl font-display text-ai-gold">{clips.filter((c) => c.status === "voting" || c.status === "pending").length}</p>
                  <p className="text-[10px] text-muted-foreground">Pending</p>
                </div>
                <div>
                  <p className="text-2xl font-display text-ai-cyan">{bpm}</p>
                  <p className="text-[10px] text-muted-foreground">BPM</p>
                </div>
                <div>
                  <p className="text-2xl font-display text-ai-pink">{sections.reduce((acc, s) => acc + s.bars, 0)}</p>
                  <p className="text-[10px] text-muted-foreground">Total Bars</p>
                </div>
              </div>
            </div>
          </section>

          {/* Right Panel - AI & Participants */}
          <aside className="hidden lg:flex w-80 xl:w-96 p-4 space-y-4 overflow-y-auto border-l border-border/30 bg-background/30 backdrop-blur-sm flex-col">
            <AIDJPanel
              clips={clips}
              currentSection={currentSection}
              genre={selectedGenre}
              bpm={bpm}
              onApplySuggestion={handleAISuggestion}
              isProducer={isProducer}
            />
            
            <CrowdParticipants sessionId={session?.id || "demo"} isProducer={isProducer} />
            
            {/* Mobile Genre Selector */}
            <div className="lg:hidden">
              <GenreSelector
                selectedGenre={selectedGenre}
                onSelect={setSelectedGenre}
                onPlaySound={playGenreSound}
                onBpmChange={handleBpmChange}
              />
            </div>
          </aside>
        </main>

        {/* Keyboard Shortcuts */}
        <KeyboardShortcutsHint />

        {/* Footer - Playback */}
        <footer className="border-t border-border/30 bg-background/50 backdrop-blur-sm">
          <PlaybackControls
            isPlaying={isPlaying}
            onPlayPause={() => setIsPlaying(!isPlaying)}
            bpm={bpm}
            currentTime={currentTime}
          />
        </footer>
      </div>
    </div>
  );
};

export default Index;
