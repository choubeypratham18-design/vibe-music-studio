import { useRef, useCallback, useEffect } from "react";

interface AudioEngineOptions {
  bpm: number;
  harmony: number;
  texture: number;
  atmosphere: number;
}

export const useAudioEngine = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const reverbRef = useRef<ConvolverNode | null>(null);
  const delayRef = useRef<DelayNode | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const isPlayingRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
      masterGainRef.current = audioContextRef.current.createGain();
      masterGainRef.current.gain.value = 0.3;
      masterGainRef.current.connect(audioContextRef.current.destination);

      // Create delay effect
      delayRef.current = audioContextRef.current.createDelay(1.0);
      delayRef.current.delayTime.value = 0.3;
      
      const delayGain = audioContextRef.current.createGain();
      delayGain.gain.value = 0.3;
      delayRef.current.connect(delayGain);
      delayGain.connect(masterGainRef.current);
    }
    return audioContextRef.current;
  }, []);

  // Play a single note with specific instrument type
  const playNote = useCallback((frequency: number, duration: number, type: OscillatorType = "sine", volume: number = 0.2) => {
    const ctx = initAudioContext();
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    
    osc.connect(gainNode);
    gainNode.connect(masterGainRef.current!);
    
    if (delayRef.current) {
      gainNode.connect(delayRef.current);
    }

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);

    return osc;
  }, [initAudioContext]);

  // Harmony sound - Chord progression
  const playHarmony = useCallback((value: number) => {
    const ctx = initAudioContext();
    if (ctx.state === "suspended") ctx.resume();

    const baseFreq = 220 + (value * 2);
    const frequencies = [
      baseFreq,
      baseFreq * 1.25,  // Major third
      baseFreq * 1.5,   // Perfect fifth
      baseFreq * 2,     // Octave
    ];

    frequencies.forEach((freq, i) => {
      setTimeout(() => {
        playNote(freq, 0.8, "sine", 0.15);
      }, i * 50);
    });
  }, [initAudioContext, playNote]);

  // Rhythm sound - Percussion/beat
  const playRhythm = useCallback((bpm: number) => {
    const ctx = initAudioContext();
    if (ctx.state === "suspended") ctx.resume();

    // Kick-like sound
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    
    osc.connect(gainNode);
    gainNode.connect(masterGainRef.current!);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);

    // Hi-hat like sound
    const noise = ctx.createOscillator();
    const noiseGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    noise.type = "square";
    noise.frequency.value = 8000 + (bpm * 20);
    filter.type = "highpass";
    filter.frequency.value = 5000;
    
    noiseGain.gain.setValueAtTime(0.1, ctx.currentTime + 0.05);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(masterGainRef.current!);
    
    noise.start(ctx.currentTime + 0.05);
    noise.stop(ctx.currentTime + 0.15);
  }, [initAudioContext]);

  // Texture sound - Synth pad with different waveforms
  const playTexture = useCallback((value: number) => {
    const ctx = initAudioContext();
    if (ctx.state === "suspended") ctx.resume();

    // Blend between acoustic (sine) and digital (sawtooth) based on value
    const types: OscillatorType[] = ["sine", "triangle", "square", "sawtooth"];
    const typeIndex = Math.floor((value / 100) * 3);
    const type = types[typeIndex];
    
    const frequency = 330 + (value * 1.5);
    
    playNote(frequency, 0.6, type, 0.2);
    playNote(frequency * 1.5, 0.6, type, 0.1);
  }, [initAudioContext, playNote]);

  // Atmosphere sound - Ambient pad with reverb/delay
  const playAtmosphere = useCallback((value: number) => {
    const ctx = initAudioContext();
    if (ctx.state === "suspended") ctx.resume();

    const baseFreq = 110;
    
    // Create ambient drone
    const frequencies = [baseFreq, baseFreq * 1.5, baseFreq * 2, baseFreq * 3];
    
    frequencies.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      osc.type = "sine";
      osc.frequency.value = freq;
      
      filter.type = "lowpass";
      filter.frequency.value = 500 + (value * 20);
      filter.Q.value = 2;
      
      gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.15 * (value / 100), ctx.currentTime + 0.2);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
      
      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(masterGainRef.current!);
      
      if (delayRef.current) {
        gainNode.connect(delayRef.current);
      }
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.5);
    });
  }, [initAudioContext]);

  // Genre-specific sounds
  const playGenreSound = useCallback((genre: string) => {
    const ctx = initAudioContext();
    if (ctx.state === "suspended") ctx.resume();

    switch (genre) {
      case "roots":
        // Acoustic guitar-like sound
        playNote(196, 0.3, "triangle", 0.2);
        playNote(247, 0.3, "triangle", 0.15);
        playNote(294, 0.3, "triangle", 0.15);
        break;
      case "groove":
        // Funky bass + synth
        playNote(82, 0.2, "sawtooth", 0.25);
        setTimeout(() => playNote(110, 0.15, "square", 0.15), 100);
        setTimeout(() => playNote(165, 0.15, "square", 0.1), 200);
        break;
      case "future":
        // Electronic futuristic sound
        playNote(440, 0.1, "sawtooth", 0.15);
        playNote(550, 0.1, "sawtooth", 0.15);
        setTimeout(() => playNote(660, 0.2, "square", 0.1), 50);
        setTimeout(() => playNote(880, 0.3, "sine", 0.1), 100);
        break;
    }
  }, [initAudioContext, playNote]);

  // Full playback loop
  const startPlayback = useCallback((options: AudioEngineOptions) => {
    if (isPlayingRef.current) return;
    isPlayingRef.current = true;

    const ctx = initAudioContext();
    if (ctx.state === "suspended") ctx.resume();

    const beatInterval = 60000 / options.bpm;
    let beatCount = 0;

    intervalRef.current = setInterval(() => {
      if (!isPlayingRef.current) return;

      // Play rhythm on every beat
      playRhythm(options.bpm);

      // Play harmony on every 4th beat
      if (beatCount % 4 === 0) {
        playHarmony(options.harmony);
      }

      // Play texture variation
      if (beatCount % 2 === 0) {
        playTexture(options.texture);
      }

      // Play atmosphere ambient pad every 8 beats
      if (beatCount % 8 === 0) {
        playAtmosphere(options.atmosphere);
      }

      beatCount++;
    }, beatInterval);
  }, [initAudioContext, playRhythm, playHarmony, playTexture, playAtmosphere]);

  const stopPlayback = useCallback(() => {
    isPlayingRef.current = false;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    oscillatorsRef.current.forEach(osc => {
      try {
        osc.stop();
      } catch {}
    });
    oscillatorsRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      stopPlayback();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopPlayback]);

  return {
    playNote,
    playHarmony,
    playRhythm,
    playTexture,
    playAtmosphere,
    playGenreSound,
    startPlayback,
    stopPlayback,
  };
};
