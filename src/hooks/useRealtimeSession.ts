import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

export interface RealtimeClip {
  id: string;
  session_id: string;
  name: string;
  duration: number;
  type: "drums" | "bass" | "melody" | "vocals" | "fx" | "sample";
  audio_url?: string;
  waveform: number[];
  status: "pending" | "voting" | "approved" | "rejected";
  votes_up: number;
  votes_down: number;
  ai_score?: number;
  submitted_by_id: string;
  submitted_by_name: string;
  submitted_by_avatar: string;
  section_id?: string;
  created_at: string;
}

export interface RealtimeParticipant {
  id: string;
  session_id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  role: "producer" | "contributor" | "listener";
  is_online: boolean;
  last_seen: string;
}

export interface RealtimeSection {
  id: string;
  session_id: string;
  name: string;
  bars: number;
  position: number;
  is_locked: boolean;
}

export interface RealtimeSession {
  id: string;
  name: string;
  producer_id: string;
  genre: string;
  bpm: number;
  is_active: boolean;
}

// Generate a unique user ID for this browser session
const getUserId = () => {
  let userId = localStorage.getItem("crowd_studio_user_id");
  if (!userId) {
    userId = `user-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    localStorage.setItem("crowd_studio_user_id", userId);
  }
  return userId;
};

const getUserName = () => {
  let userName = localStorage.getItem("crowd_studio_user_name");
  if (!userName) {
    const adjectives = ["Creative", "Funky", "Groovy", "Cool", "Fresh", "Bold"];
    const nouns = ["Producer", "Beatmaker", "Artist", "Musician", "Creator", "DJ"];
    userName = `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
    localStorage.setItem("crowd_studio_user_name", userName);
  }
  return userName;
};

export const useRealtimeSession = (sessionId?: string) => {
  const [session, setSession] = useState<RealtimeSession | null>(null);
  const [clips, setClips] = useState<RealtimeClip[]>([]);
  const [participants, setParticipants] = useState<RealtimeParticipant[]>([]);
  const [sections, setSections] = useState<RealtimeSection[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  
  const userId = getUserId();
  const userName = getUserName();

  // Create or join a session
  const createOrJoinSession = useCallback(async (name: string, isProducer: boolean = false) => {
    try {
      // Try to find existing active session first
      const { data: existingSession } = await supabase
        .from("sessions")
        .select("*")
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();

      let currentSession: RealtimeSession;

      if (existingSession) {
        currentSession = existingSession as RealtimeSession;
      } else {
        // Create new session
        const { data: newSession, error } = await supabase
          .from("sessions")
          .insert({
            name,
            producer_id: userId,
            genre: "groove",
            bpm: 120,
          })
          .select()
          .single();

        if (error) throw error;
        currentSession = newSession as RealtimeSession;

        // Create default sections
        const defaultSections = [
          { name: "Intro", bars: 8, position: 0 },
          { name: "Verse", bars: 16, position: 1 },
          { name: "Chorus", bars: 16, position: 2 },
          { name: "Verse 2", bars: 16, position: 3 },
          { name: "Chorus 2", bars: 16, position: 4 },
          { name: "Bridge", bars: 8, position: 5 },
          { name: "Outro", bars: 8, position: 6 },
        ];

        await supabase.from("sections").insert(
          defaultSections.map((s) => ({ ...s, session_id: currentSession.id }))
        );
      }

      setSession(currentSession);

      // Join as participant
      const role = currentSession.producer_id === userId ? "producer" : isProducer ? "producer" : "contributor";
      
      await supabase.from("participants").upsert({
        session_id: currentSession.id,
        user_id: userId,
        user_name: userName,
        user_avatar: role === "producer" ? "👑" : "🎧",
        role,
        is_online: true,
        last_seen: new Date().toISOString(),
      });

      return currentSession;
    } catch (error) {
      console.error("Error creating/joining session:", error);
      toast.error("Failed to join session");
      return null;
    }
  }, [userId, userName]);

  // Load session data
  const loadSessionData = useCallback(async (sid: string) => {
    try {
      setIsLoading(true);

      const [clipsRes, participantsRes, sectionsRes] = await Promise.all([
        supabase.from("clips").select("*").eq("session_id", sid).order("created_at", { ascending: true }),
        supabase.from("participants").select("*").eq("session_id", sid),
        supabase.from("sections").select("*").eq("session_id", sid).order("position", { ascending: true }),
      ]);

      if (clipsRes.data) {
        setClips(clipsRes.data.map(c => ({
          ...c,
          type: c.type as RealtimeClip["type"],
          status: c.status as RealtimeClip["status"],
          waveform: Array.isArray(c.waveform) ? (c.waveform as number[]) : [],
          audio_url: c.audio_url || undefined,
          ai_score: c.ai_score || undefined,
          section_id: c.section_id || undefined,
        })));
      }

      if (participantsRes.data) {
        setParticipants(participantsRes.data.map(p => ({
          ...p,
          role: p.role as RealtimeParticipant["role"],
        })));
      }

      if (sectionsRes.data) {
        setSections(sectionsRes.data);
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error loading session data:", error);
      setIsLoading(false);
    }
  }, []);

  // Subscribe to realtime changes
  const subscribeToSession = useCallback((sid: string) => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
    }

    const channel = supabase
      .channel(`session-${sid}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "clips", filter: `session_id=eq.${sid}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newClip = payload.new as any;
            setClips((prev) => {
              if (prev.some((c) => c.id === newClip.id)) return prev;
              toast.info(`New clip submitted: ${newClip.name}`);
              return [...prev, {
                ...newClip,
                waveform: Array.isArray(newClip.waveform) ? newClip.waveform : [],
              }];
            });
          } else if (payload.eventType === "UPDATE") {
            const updatedClip = payload.new as any;
            setClips((prev) =>
              prev.map((c) =>
                c.id === updatedClip.id
                  ? { ...updatedClip, waveform: Array.isArray(updatedClip.waveform) ? updatedClip.waveform : [] }
                  : c
              )
            );
          } else if (payload.eventType === "DELETE") {
            setClips((prev) => prev.filter((c) => c.id !== payload.old.id));
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "participants", filter: `session_id=eq.${sid}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newParticipant = payload.new as any;
            setParticipants((prev) => {
              if (prev.some((p) => p.id === newParticipant.id)) return prev;
              if (newParticipant.user_id !== userId) {
                toast.info(`${newParticipant.user_name} joined the session`);
              }
              return [...prev, newParticipant];
            });
          } else if (payload.eventType === "UPDATE") {
            setParticipants((prev) =>
              prev.map((p) => (p.id === payload.new.id ? (payload.new as RealtimeParticipant) : p))
            );
          } else if (payload.eventType === "DELETE") {
            const oldParticipant = payload.old as any;
            setParticipants((prev) => prev.filter((p) => p.id !== oldParticipant.id));
            if (oldParticipant.user_id !== userId) {
              toast.info(`${oldParticipant.user_name || 'Someone'} left the session`);
            }
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sections", filter: `session_id=eq.${sid}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setSections((prev) => [...prev, payload.new as RealtimeSection].sort((a, b) => a.position - b.position));
          } else if (payload.eventType === "UPDATE") {
            setSections((prev) =>
              prev.map((s) => (s.id === payload.new.id ? (payload.new as RealtimeSection) : s))
            );
          } else if (payload.eventType === "DELETE") {
            setSections((prev) => prev.filter((s) => s.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    channelRef.current = channel;
  }, [userId]);

  // Submit a clip
  const submitClip = useCallback(
    async (clipData: Omit<RealtimeClip, "id" | "session_id" | "created_at" | "votes_up" | "votes_down">) => {
      if (!session) return null;

      const { data, error } = await supabase
        .from("clips")
        .insert({
          session_id: session.id,
          name: clipData.name,
          duration: clipData.duration,
          type: clipData.type,
          audio_url: clipData.audio_url,
          waveform: clipData.waveform as unknown as Json,
          status: clipData.status,
          ai_score: clipData.ai_score,
          submitted_by_id: clipData.submitted_by_id,
          submitted_by_name: clipData.submitted_by_name,
          submitted_by_avatar: clipData.submitted_by_avatar,
          section_id: clipData.section_id,
        })
        .select()
        .single();

      if (error) {
        console.error("Error submitting clip:", error);
        toast.error("Failed to submit clip");
        return null;
      }

      return data;
    },
    [session]
  );

  // Vote on a clip
  const voteOnClip = useCallback(async (clipId: string, voteType: "up" | "down") => {
    // Check if user already voted
    const { data: existingVote } = await supabase
      .from("votes")
      .select("*")
      .eq("clip_id", clipId)
      .eq("user_id", userId)
      .maybeSingle();

    if (existingVote) {
      toast.warning("You've already voted on this clip");
      return false;
    }

    // Insert vote
    const { error: voteError } = await supabase.from("votes").insert({
      clip_id: clipId,
      user_id: userId,
      vote_type: voteType,
    });

    if (voteError) {
      console.error("Error voting:", voteError);
      return false;
    }

    // Update clip vote count
    const clip = clips.find((c) => c.id === clipId);
    if (clip) {
      await supabase
        .from("clips")
        .update({
          votes_up: voteType === "up" ? clip.votes_up + 1 : clip.votes_up,
          votes_down: voteType === "down" ? clip.votes_down + 1 : clip.votes_down,
        })
        .eq("id", clipId);
    }

    return true;
  }, [clips, userId]);

  // Producer approve/reject clip
  const updateClipStatus = useCallback(async (clipId: string, status: "approved" | "rejected", sectionId?: string) => {
    const { error } = await supabase
      .from("clips")
      .update({ status, section_id: sectionId })
      .eq("id", clipId);

    if (error) {
      console.error("Error updating clip status:", error);
      return false;
    }

    return true;
  }, []);

  // Add section
  const addSection = useCallback(async (name: string, bars: number = 8) => {
    if (!session) return null;

    const position = sections.length;
    const { data, error } = await supabase
      .from("sections")
      .insert({
        session_id: session.id,
        name,
        bars,
        position,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding section:", error);
      return null;
    }

    return data;
  }, [session, sections]);

  // Toggle section lock
  const toggleSectionLock = useCallback(async (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;

    await supabase
      .from("sections")
      .update({ is_locked: !section.is_locked })
      .eq("id", sectionId);
  }, [sections]);

  // Update presence
  useEffect(() => {
    if (!session) return;

    const interval = setInterval(async () => {
      await supabase
        .from("participants")
        .update({ last_seen: new Date().toISOString(), is_online: true })
        .eq("session_id", session.id)
        .eq("user_id", userId);
    }, 30000);

    return () => clearInterval(interval);
  }, [session, userId]);

  // Initialize session
  useEffect(() => {
    const init = async () => {
      const currentSession = await createOrJoinSession("Crowd Banger #1", true);
      if (currentSession) {
        await loadSessionData(currentSession.id);
        subscribeToSession(currentSession.id);
      }
    };

    init();

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, []);

  return {
    session,
    clips,
    participants,
    sections,
    isConnected,
    isLoading,
    userId,
    userName,
    submitClip,
    voteOnClip,
    updateClipStatus,
    addSection,
    toggleSectionLock,
    isProducer: session?.producer_id === userId,
  };
};
