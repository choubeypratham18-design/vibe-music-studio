import { useState, useRef, useCallback, useEffect } from "react";

interface AudioPlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isLoading: boolean;
}

export const useAudioPlayback = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const audioBufferCacheRef = useRef<Map<string, AudioBuffer>>(new Map());
  const startTimeRef = useRef<number>(0);
  const [playbackState, setPlaybackState] = useState<Map<string, AudioPlaybackState>>(new Map());

  // Initialize AudioContext on first user interaction
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
    }
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  // Generate a demo audio buffer (sine wave with envelope)
  const generateDemoAudio = useCallback((clipType: string, duration: number): AudioBuffer => {
    const ctx = initAudioContext();
    const sampleRate = ctx.sampleRate;
    const length = sampleRate * Math.min(duration, 5); // Max 5 seconds for demo
    const buffer = ctx.createBuffer(2, length, sampleRate);

    // Different sounds based on clip type
    const frequencies: Record<string, number[]> = {
      drums: [100, 150, 80], // Low punchy
      bass: [60, 80, 100], // Deep bass
      melody: [440, 523, 659, 784], // Musical notes (A4, C5, E5, G5)
      vocals: [300, 400, 350], // Mid-range vocal frequencies
      fx: [800, 1200, 1600], // High FX sounds
      sample: [220, 330, 440], // Harmonic sample
    };

    const freqs = frequencies[clipType] || frequencies.sample;
    
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        // Envelope
        const attack = Math.min(1, t * 10);
        const release = Math.min(1, (duration - t) * 5);
        const envelope = attack * release;
        
        // Mix multiple frequencies
        let sample = 0;
        freqs.forEach((freq, idx) => {
          const phase = Math.sin(2 * Math.PI * freq * t + (idx * 0.3));
          sample += phase * (1 / freqs.length);
        });
        
        // Add some rhythm for drums
        if (clipType === "drums") {
          const beatPhase = Math.floor(t * 8) % 2;
          sample *= beatPhase ? 0.3 : 1;
        }
        
        data[i] = sample * envelope * 0.5;
      }
    }

    return buffer;
  }, [initAudioContext]);

  // Load or generate audio for a clip
  const loadAudio = useCallback(async (clipId: string, audioUrl?: string, clipType: string = "sample", duration: number = 3): Promise<AudioBuffer> => {
    // Check cache first
    if (audioBufferCacheRef.current.has(clipId)) {
      return audioBufferCacheRef.current.get(clipId)!;
    }

    const ctx = initAudioContext();
    let buffer: AudioBuffer;

    if (audioUrl) {
      try {
        setPlaybackState(prev => {
          const newState = new Map(prev);
          newState.set(clipId, { isPlaying: false, currentTime: 0, duration: 0, isLoading: true });
          return newState;
        });

        const response = await fetch(audioUrl);
        const arrayBuffer = await response.arrayBuffer();
        buffer = await ctx.decodeAudioData(arrayBuffer);
      } catch (error) {
        console.warn("Failed to load audio, generating demo:", error);
        buffer = generateDemoAudio(clipType, duration);
      }
    } else {
      // Generate demo audio
      buffer = generateDemoAudio(clipType, duration);
    }

    audioBufferCacheRef.current.set(clipId, buffer);
    
    setPlaybackState(prev => {
      const newState = new Map(prev);
      newState.set(clipId, { isPlaying: false, currentTime: 0, duration: buffer.duration, isLoading: false });
      return newState;
    });

    return buffer;
  }, [initAudioContext, generateDemoAudio]);

  // Play a clip
  const playClip = useCallback(async (clipId: string, audioUrl?: string, clipType: string = "sample", duration: number = 3) => {
    const ctx = initAudioContext();
    
    // Stop any currently playing clip
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch {}
      sourceNodeRef.current.disconnect();
    }

    const buffer = await loadAudio(clipId, audioUrl, clipType, duration);
    
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(gainNodeRef.current!);
    sourceNodeRef.current = source;
    startTimeRef.current = ctx.currentTime;

    source.onended = () => {
      setPlaybackState(prev => {
        const newState = new Map(prev);
        const current = newState.get(clipId);
        if (current) {
          newState.set(clipId, { ...current, isPlaying: false, currentTime: 0 });
        }
        return newState;
      });
    };

    source.start(0);
    
    setPlaybackState(prev => {
      const newState = new Map(prev);
      const current = newState.get(clipId) || { isPlaying: false, currentTime: 0, duration: buffer.duration, isLoading: false };
      newState.set(clipId, { ...current, isPlaying: true, currentTime: 0 });
      return newState;
    });

    return clipId;
  }, [initAudioContext, loadAudio]);

  // Stop a clip
  const stopClip = useCallback((clipId: string) => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch {}
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }

    setPlaybackState(prev => {
      const newState = new Map(prev);
      const current = newState.get(clipId);
      if (current) {
        newState.set(clipId, { ...current, isPlaying: false, currentTime: 0 });
      }
      return newState;
    });
  }, []);

  // Toggle play/pause
  const togglePlayClip = useCallback(async (clipId: string, audioUrl?: string, clipType?: string, duration?: number) => {
    const state = playbackState.get(clipId);
    if (state?.isPlaying) {
      stopClip(clipId);
      return null;
    }
    return playClip(clipId, audioUrl, clipType, duration);
  }, [playbackState, playClip, stopClip]);

  // Set volume
  const setVolume = useCallback((volume: number) => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = Math.max(0, Math.min(1, volume));
    }
  }, []);

  // Get state for a specific clip
  const getClipState = useCallback((clipId: string): AudioPlaybackState => {
    return playbackState.get(clipId) || { isPlaying: false, currentTime: 0, duration: 0, isLoading: false };
  }, [playbackState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sourceNodeRef.current) {
        try {
          sourceNodeRef.current.stop();
        } catch {}
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    playClip,
    stopClip,
    togglePlayClip,
    setVolume,
    getClipState,
    initAudioContext,
    playbackState,
  };
};
