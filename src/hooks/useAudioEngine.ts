import { useRef, useCallback, useEffect } from "react";

interface AudioEngineOptions {
  bpm: number;
  harmony: number;
  texture: number;
  atmosphere: number;
  piano: number;
  drums: number;
  bass: number;
  synth: number;
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

  // Piano sound - Realistic piano with harmonics and decay
  const playPiano = useCallback((value: number) => {
    const ctx = initAudioContext();
    if (ctx.state === "suspended") ctx.resume();

    // Piano notes based on value (C major scale across octaves)
    const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
    const noteIndex = Math.floor((value / 100) * (notes.length - 1));
    const baseFreq = notes[noteIndex];

    // Piano has multiple harmonics with quick attack and longer decay
    const harmonics = [1, 2, 3, 4, 5];
    const volumes = [0.3, 0.15, 0.08, 0.04, 0.02];

    harmonics.forEach((harmonic, i) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = "sine";
      osc.frequency.value = baseFreq * harmonic;

      filter.type = "lowpass";
      filter.frequency.value = 4000;

      // Piano-like envelope: quick attack, gradual decay
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(volumes[i], ctx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(volumes[i] * 0.3, ctx.currentTime + 0.3);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(masterGainRef.current!);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.2);
    });
  }, [initAudioContext]);

  // Drums - Full drum kit sounds
  const playDrums = useCallback((value: number) => {
    const ctx = initAudioContext();
    if (ctx.state === "suspended") ctx.resume();

    const intensity = value / 100;

    // Kick drum
    const kickOsc = ctx.createOscillator();
    const kickGain = ctx.createGain();
    kickOsc.type = "sine";
    kickOsc.frequency.setValueAtTime(150 * (0.5 + intensity), ctx.currentTime);
    kickOsc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.15);
    kickGain.gain.setValueAtTime(0.6, ctx.currentTime);
    kickGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    kickOsc.connect(kickGain);
    kickGain.connect(masterGainRef.current!);
    kickOsc.start(ctx.currentTime);
    kickOsc.stop(ctx.currentTime + 0.3);

    // Snare drum (noise + tone)
    const snareOsc = ctx.createOscillator();
    const snareGain = ctx.createGain();
    const snareFilter = ctx.createBiquadFilter();
    snareOsc.type = "triangle";
    snareOsc.frequency.value = 200;
    snareFilter.type = "highpass";
    snareFilter.frequency.value = 1000;
    snareGain.gain.setValueAtTime(0.3 * intensity, ctx.currentTime + 0.1);
    snareGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    snareOsc.connect(snareFilter);
    snareFilter.connect(snareGain);
    snareGain.connect(masterGainRef.current!);
    snareOsc.start(ctx.currentTime + 0.1);
    snareOsc.stop(ctx.currentTime + 0.25);

    // Hi-hat
    const hihatOsc = ctx.createOscillator();
    const hihatGain = ctx.createGain();
    const hihatFilter = ctx.createBiquadFilter();
    hihatOsc.type = "square";
    hihatOsc.frequency.value = 8000 + (value * 50);
    hihatFilter.type = "highpass";
    hihatFilter.frequency.value = 7000;
    hihatGain.gain.setValueAtTime(0.15 * intensity, ctx.currentTime);
    hihatGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    hihatOsc.connect(hihatFilter);
    hihatFilter.connect(hihatGain);
    hihatGain.connect(masterGainRef.current!);
    hihatOsc.start(ctx.currentTime);
    hihatOsc.stop(ctx.currentTime + 0.08);

    // Tom drum
    if (value > 50) {
      const tomOsc = ctx.createOscillator();
      const tomGain = ctx.createGain();
      tomOsc.type = "sine";
      tomOsc.frequency.setValueAtTime(120, ctx.currentTime + 0.15);
      tomOsc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.35);
      tomGain.gain.setValueAtTime(0.25, ctx.currentTime + 0.15);
      tomGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      tomOsc.connect(tomGain);
      tomGain.connect(masterGainRef.current!);
      tomOsc.start(ctx.currentTime + 0.15);
      tomOsc.stop(ctx.currentTime + 0.4);
    }
  }, [initAudioContext]);

  // Bass - Deep bass sounds
  const playBass = useCallback((value: number) => {
    const ctx = initAudioContext();
    if (ctx.state === "suspended") ctx.resume();

    // Bass notes (low frequencies)
    const bassNotes = [41.2, 43.65, 49.0, 55.0, 61.74, 65.41, 73.42, 82.41];
    const noteIndex = Math.floor((value / 100) * (bassNotes.length - 1));
    const baseFreq = bassNotes[noteIndex];

    // Main bass oscillator
    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();
    const bassFilter = ctx.createBiquadFilter();

    bassOsc.type = "sawtooth";
    bassOsc.frequency.value = baseFreq;

    bassFilter.type = "lowpass";
    bassFilter.frequency.value = 200 + (value * 3);
    bassFilter.Q.value = 5;

    bassGain.gain.setValueAtTime(0.4, ctx.currentTime);
    bassGain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.1);
    bassGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

    bassOsc.connect(bassFilter);
    bassFilter.connect(bassGain);
    bassGain.connect(masterGainRef.current!);

    bassOsc.start(ctx.currentTime);
    bassOsc.stop(ctx.currentTime + 0.5);

    // Sub bass for extra depth
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();

    subOsc.type = "sine";
    subOsc.frequency.value = baseFreq / 2;

    subGain.gain.setValueAtTime(0.3, ctx.currentTime);
    subGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

    subOsc.connect(subGain);
    subGain.connect(masterGainRef.current!);

    subOsc.start(ctx.currentTime);
    subOsc.stop(ctx.currentTime + 0.6);
  }, [initAudioContext]);

  // Synthesizer - Electronic synth sounds
  const playSynth = useCallback((value: number) => {
    const ctx = initAudioContext();
    if (ctx.state === "suspended") ctx.resume();

    const synthNotes = [220, 277.18, 329.63, 369.99, 440, 554.37, 659.25, 739.99];
    const noteIndex = Math.floor((value / 100) * (synthNotes.length - 1));
    const baseFreq = synthNotes[noteIndex];

    // Detuned oscillators for rich synth sound
    const detune = [-10, 0, 10, 7];
    const waveTypes: OscillatorType[] = ["sawtooth", "square", "sawtooth", "triangle"];

    detune.forEach((det, i) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = waveTypes[i];
      osc.frequency.value = baseFreq;
      osc.detune.value = det;

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(500, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(2000 + (value * 30), ctx.currentTime + 0.1);
      filter.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.4);
      filter.Q.value = 3;

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.2);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(masterGainRef.current!);

      if (delayRef.current && i === 0) {
        gainNode.connect(delayRef.current);
      }

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.8);
    });

    // Add some sparkle with high frequency
    const sparkleOsc = ctx.createOscillator();
    const sparkleGain = ctx.createGain();

    sparkleOsc.type = "sine";
    sparkleOsc.frequency.value = baseFreq * 4;

    sparkleGain.gain.setValueAtTime(0.05, ctx.currentTime);
    sparkleGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    sparkleOsc.connect(sparkleGain);
    sparkleGain.connect(masterGainRef.current!);

    sparkleOsc.start(ctx.currentTime);
    sparkleOsc.stop(ctx.currentTime + 0.3);
  }, [initAudioContext]);

  // Harmony sound - Chord progression
  const playHarmony = useCallback((value: number) => {
    const ctx = initAudioContext();
    if (ctx.state === "suspended") ctx.resume();

    const baseFreq = 220 + (value * 2);
    const frequencies = [
      baseFreq,
      baseFreq * 1.25,
      baseFreq * 1.5,
      baseFreq * 2,
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
        playNote(196, 0.3, "triangle", 0.2);
        playNote(247, 0.3, "triangle", 0.15);
        playNote(294, 0.3, "triangle", 0.15);
        break;
      case "groove":
        playNote(82, 0.2, "sawtooth", 0.25);
        setTimeout(() => playNote(110, 0.15, "square", 0.15), 100);
        setTimeout(() => playNote(165, 0.15, "square", 0.1), 200);
        break;
      case "future":
        playNote(440, 0.1, "sawtooth", 0.15);
        playNote(550, 0.1, "sawtooth", 0.15);
        setTimeout(() => playNote(660, 0.2, "square", 0.1), 50);
        setTimeout(() => playNote(880, 0.3, "sine", 0.1), 100);
        break;
    }
  }, [initAudioContext, playNote]);

  // Full playback loop with all instruments
  const startPlayback = useCallback((options: AudioEngineOptions) => {
    if (isPlayingRef.current) return;
    isPlayingRef.current = true;

    const ctx = initAudioContext();
    if (ctx.state === "suspended") ctx.resume();

    const beatInterval = 60000 / options.bpm;
    let beatCount = 0;

    intervalRef.current = setInterval(() => {
      if (!isPlayingRef.current) return;

      // Drums on every beat (if enabled)
      if (options.drums > 10) {
        playDrums(options.drums);
      }

      // Bass on 1 and 3 beats
      if (beatCount % 2 === 0 && options.bass > 10) {
        playBass(options.bass);
      }

      // Piano chord on every 4th beat
      if (beatCount % 4 === 0 && options.piano > 10) {
        playPiano(options.piano);
      }

      // Synth lead melody
      if (beatCount % 2 === 1 && options.synth > 10) {
        playSynth(options.synth);
      }

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
  }, [initAudioContext, playDrums, playBass, playPiano, playSynth, playRhythm, playHarmony, playTexture, playAtmosphere]);

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
    playPiano,
    playDrums,
    playBass,
    playSynth,
    startPlayback,
    stopPlayback,
  };
};
