import { useRef, useCallback, useEffect, useState } from "react";

interface AudioEngineOptions {
  bpm: number;
  harmony: number;
  texture: number;
  atmosphere: number;
  piano: number;
  drums: number;
  bass: number;
  synth: number;
  lyrics?: string;
  genre?: string;
}

interface InstrumentVolumes {
  piano: number;
  drums: number;
  bass: number;
  synth: number;
  master: number;
}

// Musical scales and patterns
const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  pentatonic: [0, 2, 4, 7, 9],
  blues: [0, 3, 5, 6, 7, 10],
};

const CHORD_PATTERNS = {
  roots: [[0, 4, 7], [0, 3, 7], [0, 5, 7]],
  groove: [[0, 4, 7], [0, 3, 7, 10], [0, 4, 7, 11]],
  future: [[0, 4, 7, 11], [0, 3, 6, 10], [0, 5, 7, 10]],
};

// Note frequencies
const NOTE_FREQUENCIES: { [key: string]: number } = {
  'C2': 65.41, 'D2': 73.42, 'E2': 82.41, 'F2': 87.31, 'G2': 98.00, 'A2': 110.00, 'B2': 123.47,
  'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
  'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
  'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
};

export const useAudioEngine = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const compressorRef = useRef<DynamicsCompressorNode | null>(null);
  const reverbRef = useRef<ConvolverNode | null>(null);
  const delayRef = useRef<DelayNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const isPlayingRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const sequencerRef = useRef<NodeJS.Timeout[]>([]);
  const currentStepRef = useRef(0);
  
  // Recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const destinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recordedBlobRef = useRef<Blob | null>(null);
  
  // Instrument volumes
  const [volumes, setVolumes] = useState<InstrumentVolumes>({
    piano: 80,
    drums: 80,
    bass: 80,
    synth: 80,
    master: 70,
  });

  const instrumentGainsRef = useRef<{
    piano: GainNode | null;
    drums: GainNode | null;
    bass: GainNode | null;
    synth: GainNode | null;
  }>({
    piano: null,
    drums: null,
    bass: null,
    synth: null,
  });

  // Create reverb impulse response
  const createReverbIR = useCallback((ctx: AudioContext, duration: number = 2, decay: number = 2) => {
    const length = ctx.sampleRate * duration;
    const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }
    return impulse;
  }, []);

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
      const ctx = audioContextRef.current;

      // Create compressor for better dynamics
      compressorRef.current = ctx.createDynamicsCompressor();
      compressorRef.current.threshold.value = -24;
      compressorRef.current.knee.value = 30;
      compressorRef.current.ratio.value = 12;
      compressorRef.current.attack.value = 0.003;
      compressorRef.current.release.value = 0.25;

      // Create master gain
      masterGainRef.current = ctx.createGain();
      masterGainRef.current.gain.value = volumes.master / 100;
      
      // Create analyser for visualization
      analyserRef.current = ctx.createAnalyser();
      analyserRef.current.fftSize = 2048;

      // Connect chain
      compressorRef.current.connect(masterGainRef.current);
      masterGainRef.current.connect(analyserRef.current);
      analyserRef.current.connect(ctx.destination);

      // Create recording destination
      destinationRef.current = ctx.createMediaStreamDestination();
      masterGainRef.current.connect(destinationRef.current);

      // Create reverb
      reverbRef.current = ctx.createConvolver();
      reverbRef.current.buffer = createReverbIR(ctx, 2.5, 2.5);
      const reverbGain = ctx.createGain();
      reverbGain.gain.value = 0.3;
      reverbRef.current.connect(reverbGain);
      reverbGain.connect(compressorRef.current);

      // Create delay effect
      delayRef.current = ctx.createDelay(1.0);
      delayRef.current.delayTime.value = 0.375;
      const delayFeedback = ctx.createGain();
      delayFeedback.gain.value = 0.3;
      const delayFilter = ctx.createBiquadFilter();
      delayFilter.type = "lowpass";
      delayFilter.frequency.value = 2000;
      delayRef.current.connect(delayFilter);
      delayFilter.connect(delayFeedback);
      delayFeedback.connect(delayRef.current);
      delayFeedback.connect(compressorRef.current);

      // Create instrument-specific gain nodes
      instrumentGainsRef.current.piano = ctx.createGain();
      instrumentGainsRef.current.drums = ctx.createGain();
      instrumentGainsRef.current.bass = ctx.createGain();
      instrumentGainsRef.current.synth = ctx.createGain();

      instrumentGainsRef.current.piano.gain.value = volumes.piano / 100;
      instrumentGainsRef.current.drums.gain.value = volumes.drums / 100;
      instrumentGainsRef.current.bass.gain.value = volumes.bass / 100;
      instrumentGainsRef.current.synth.gain.value = volumes.synth / 100;

      instrumentGainsRef.current.piano.connect(compressorRef.current);
      instrumentGainsRef.current.drums.connect(compressorRef.current);
      instrumentGainsRef.current.bass.connect(compressorRef.current);
      instrumentGainsRef.current.synth.connect(compressorRef.current);
    }
    return audioContextRef.current;
  }, [createReverbIR, volumes]);

  // Update volume function
  const updateVolume = useCallback((instrument: keyof InstrumentVolumes, value: number) => {
    setVolumes(prev => ({ ...prev, [instrument]: value }));
    
    if (instrument === 'master' && masterGainRef.current) {
      masterGainRef.current.gain.setValueAtTime(value / 100, audioContextRef.current?.currentTime || 0);
    } else if (instrumentGainsRef.current[instrument as keyof typeof instrumentGainsRef.current]) {
      const gainNode = instrumentGainsRef.current[instrument as keyof typeof instrumentGainsRef.current];
      if (gainNode) {
        gainNode.gain.setValueAtTime(value / 100, audioContextRef.current?.currentTime || 0);
      }
    }
  }, []);

  // Start recording
  const startRecording = useCallback(() => {
    const ctx = initAudioContext();
    if (ctx.state === "suspended") ctx.resume();

    if (destinationRef.current) {
      recordedChunksRef.current = [];
      mediaRecorderRef.current = new MediaRecorder(destinationRef.current.stream);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    }
  }, [initAudioContext]);

  // Stop recording
  const stopRecording = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
          setIsRecording(false);
          recordedBlobRef.current = blob;
          resolve(blob);
        };
        mediaRecorderRef.current.stop();
      } else {
        setIsRecording(false);
        resolve(null);
      }
    });
  }, []);

  // Export recording as downloadable file
  const exportRecording = useCallback(async () => {
    let blob = recordedBlobRef.current;
    
    if (isRecording && mediaRecorderRef.current) {
      blob = await stopRecording();
    }
    
    if (blob && blob.size > 0) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nova-ai-track-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      recordedBlobRef.current = null;
      return blob;
    }
    return null;
  }, [isRecording, stopRecording]);

  // Generate music based on lyrics
  const generateFromLyrics = useCallback((lyrics: string, genre: string) => {
    const words = lyrics.toLowerCase().split(/\s+/);
    const happyWords = ['happy', 'joy', 'love', 'bright', 'sun', 'dance', 'smile', 'light', 'party', 'fun'];
    const sadWords = ['sad', 'cry', 'dark', 'rain', 'tears', 'lonely', 'pain', 'night', 'broken', 'lost'];
    const energyWords = ['fire', 'fast', 'run', 'jump', 'power', 'strong', 'wild', 'free', 'crazy', 'loud'];
    
    let mood = 50;
    let energy = 50;
    
    words.forEach(word => {
      if (happyWords.some(w => word.includes(w))) mood += 8;
      if (sadWords.some(w => word.includes(w))) mood -= 8;
      if (energyWords.some(w => word.includes(w))) energy += 8;
    });
    
    mood = Math.max(0, Math.min(100, mood));
    energy = Math.max(0, Math.min(100, energy));
    
    return {
      harmony: mood,
      atmosphere: 100 - mood,
      piano: mood > 50 ? 70 : 40,
      synth: energy > 50 ? 80 : 30,
      drums: energy,
      bass: 50 + (energy - 50) * 0.5,
      texture: Math.abs(mood - 50),
    };
  }, []);

  // Frequency helper
  const getFrequency = useCallback((baseNote: number, semitones: number) => {
    return baseNote * Math.pow(2, semitones / 12);
  }, []);

  // ===== PIANO SYNTHESIS =====
  const playPiano = useCallback((value: number, noteOverride?: number) => {
    const ctx = initAudioContext();
    if (ctx.state === "suspended") ctx.resume();

    const pianoGain = instrumentGainsRef.current.piano || masterGainRef.current!;
    const intensity = value / 100;
    
    // Select note based on value or override
    const baseNotes = [NOTE_FREQUENCIES['C4'], NOTE_FREQUENCIES['E4'], NOTE_FREQUENCIES['G4'], NOTE_FREQUENCIES['B4']];
    const noteIndex = noteOverride !== undefined ? noteOverride % baseNotes.length : Math.floor(intensity * (baseNotes.length - 1));
    const baseFreq = baseNotes[noteIndex];

    // Piano harmonics with realistic decay
    const harmonics = [1, 2, 3, 4, 5, 6, 7, 8];
    const harmonicGains = [1, 0.5, 0.33, 0.25, 0.2, 0.16, 0.14, 0.12];

    const now = ctx.currentTime;

    harmonics.forEach((harmonic, i) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = "sine";
      osc.frequency.value = baseFreq * harmonic;

      filter.type = "lowpass";
      filter.frequency.value = 5000 - (harmonic * 300);

      const vol = harmonicGains[i] * 0.15 * intensity;
      oscGain.gain.setValueAtTime(0, now);
      oscGain.gain.linearRampToValueAtTime(vol, now + 0.008);
      oscGain.gain.exponentialRampToValueAtTime(vol * 0.5, now + 0.1);
      oscGain.gain.exponentialRampToValueAtTime(vol * 0.2, now + 0.4);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(pianoGain);

      if (reverbRef.current && i === 0) {
        oscGain.connect(reverbRef.current);
      }

      osc.start(now);
      osc.stop(now + 1.5);
    });
  }, [initAudioContext]);

  // ===== DRUMS SYNTHESIS =====
  const playDrums = useCallback((value: number, pattern?: number) => {
    const ctx = initAudioContext();
    if (ctx.state === "suspended") ctx.resume();

    const drumsGain = instrumentGainsRef.current.drums || masterGainRef.current!;
    const intensity = value / 100;
    const now = ctx.currentTime;
    const step = pattern || 0;

    // Kick on beats 1 and 3
    if (step % 4 === 0 || step % 4 === 2) {
      const kickOsc = ctx.createOscillator();
      const kickOsc2 = ctx.createOscillator();
      const kickGain = ctx.createGain();
      const kickFilter = ctx.createBiquadFilter();

      kickOsc.type = "sine";
      kickOsc2.type = "triangle";
      kickOsc.frequency.setValueAtTime(180, now);
      kickOsc.frequency.exponentialRampToValueAtTime(35, now + 0.1);
      kickOsc2.frequency.setValueAtTime(80, now);
      kickOsc2.frequency.exponentialRampToValueAtTime(30, now + 0.08);

      kickFilter.type = "lowpass";
      kickFilter.frequency.value = 200;

      kickGain.gain.setValueAtTime(0.8 * intensity, now);
      kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      kickOsc.connect(kickGain);
      kickOsc2.connect(kickFilter);
      kickFilter.connect(kickGain);
      kickGain.connect(drumsGain);

      kickOsc.start(now);
      kickOsc.stop(now + 0.35);
      kickOsc2.start(now);
      kickOsc2.stop(now + 0.15);
    }

    // Snare on beats 2 and 4
    if (step % 4 === 1 || step % 4 === 3) {
      const snareOsc = ctx.createOscillator();
      const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseData.length; i++) {
        noiseData[i] = Math.random() * 2 - 1;
      }
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const snareGain = ctx.createGain();
      const noiseGain = ctx.createGain();
      const snareFilter = ctx.createBiquadFilter();
      const noiseFilter = ctx.createBiquadFilter();

      snareOsc.type = "triangle";
      snareOsc.frequency.setValueAtTime(200, now);
      snareOsc.frequency.exponentialRampToValueAtTime(120, now + 0.08);

      snareFilter.type = "bandpass";
      snareFilter.frequency.value = 1000;

      noiseFilter.type = "highpass";
      noiseFilter.frequency.value = 2000;

      snareGain.gain.setValueAtTime(0.5 * intensity, now);
      snareGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      noiseGain.gain.setValueAtTime(0.4 * intensity, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      snareOsc.connect(snareFilter);
      snareFilter.connect(snareGain);
      snareGain.connect(drumsGain);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(drumsGain);

      snareOsc.start(now);
      snareOsc.stop(now + 0.15);
      noiseSource.start(now);
      noiseSource.stop(now + 0.15);
    }

    // Hi-hat on every beat
    const hihatBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate);
    const hihatData = hihatBuffer.getChannelData(0);
    for (let i = 0; i < hihatData.length; i++) {
      hihatData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / hihatData.length, 2);
    }
    const hihatSource = ctx.createBufferSource();
    hihatSource.buffer = hihatBuffer;

    const hihatGain = ctx.createGain();
    const hihatFilter = ctx.createBiquadFilter();

    hihatFilter.type = "highpass";
    hihatFilter.frequency.value = 7000;

    const hihatVol = step % 2 === 0 ? 0.25 : 0.15;
    hihatGain.gain.setValueAtTime(hihatVol * intensity, now);
    hihatGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    hihatSource.connect(hihatFilter);
    hihatFilter.connect(hihatGain);
    hihatGain.connect(drumsGain);

    hihatSource.start(now);
    hihatSource.stop(now + 0.08);

    // Tom fills occasionally
    if (intensity > 0.6 && step % 8 === 7) {
      [150, 120, 100].forEach((freq, i) => {
        const tomOsc = ctx.createOscillator();
        const tomGain = ctx.createGain();

        tomOsc.type = "sine";
        tomOsc.frequency.setValueAtTime(freq, now + i * 0.06);
        tomOsc.frequency.exponentialRampToValueAtTime(freq * 0.6, now + i * 0.06 + 0.15);

        tomGain.gain.setValueAtTime(0.35 * intensity, now + i * 0.06);
        tomGain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.2);

        tomOsc.connect(tomGain);
        tomGain.connect(drumsGain);

        tomOsc.start(now + i * 0.06);
        tomOsc.stop(now + i * 0.06 + 0.2);
      });
    }
  }, [initAudioContext]);

  // ===== BASS SYNTHESIS =====
  const playBass = useCallback((value: number, noteOverride?: number) => {
    const ctx = initAudioContext();
    if (ctx.state === "suspended") ctx.resume();

    const bassGainNode = instrumentGainsRef.current.bass || masterGainRef.current!;
    const intensity = value / 100;
    const now = ctx.currentTime;

    const bassNotes = [NOTE_FREQUENCIES['C2'], NOTE_FREQUENCIES['E2'], NOTE_FREQUENCIES['G2'], NOTE_FREQUENCIES['A2']];
    const noteIndex = noteOverride !== undefined ? noteOverride % bassNotes.length : Math.floor(Math.random() * bassNotes.length);
    const baseFreq = bassNotes[noteIndex];

    // Main bass oscillator
    const bassOsc = ctx.createOscillator();
    const bassOsc2 = ctx.createOscillator();
    const bassGain = ctx.createGain();
    const bassFilter = ctx.createBiquadFilter();

    bassOsc.type = "sawtooth";
    bassOsc2.type = "square";
    bassOsc.frequency.value = baseFreq;
    bassOsc2.frequency.value = baseFreq;
    bassOsc2.detune.value = 5;

    bassFilter.type = "lowpass";
    bassFilter.frequency.setValueAtTime(300, now);
    bassFilter.frequency.exponentialRampToValueAtTime(150 + (value * 3), now + 0.05);
    bassFilter.Q.value = 4;

    bassGain.gain.setValueAtTime(0.5 * intensity, now);
    bassGain.gain.exponentialRampToValueAtTime(0.3 * intensity, now + 0.1);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    bassOsc.connect(bassFilter);
    bassOsc2.connect(bassFilter);
    bassFilter.connect(bassGain);
    bassGain.connect(bassGainNode);

    bassOsc.start(now);
    bassOsc.stop(now + 0.5);
    bassOsc2.start(now);
    bassOsc2.stop(now + 0.5);

    // Sub bass
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    const subFilter = ctx.createBiquadFilter();

    subOsc.type = "sine";
    subOsc.frequency.value = baseFreq / 2;

    subFilter.type = "lowpass";
    subFilter.frequency.value = 80;

    subGain.gain.setValueAtTime(0.4 * intensity, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    subOsc.connect(subFilter);
    subFilter.connect(subGain);
    subGain.connect(bassGainNode);

    subOsc.start(now);
    subOsc.stop(now + 0.6);
  }, [initAudioContext]);

  // ===== SYNTH SYNTHESIS =====
  const playSynth = useCallback((value: number, noteOverride?: number) => {
    const ctx = initAudioContext();
    if (ctx.state === "suspended") ctx.resume();

    const synthGainNode = instrumentGainsRef.current.synth || masterGainRef.current!;
    const intensity = value / 100;
    const now = ctx.currentTime;

    const synthNotes = [NOTE_FREQUENCIES['C4'], NOTE_FREQUENCIES['E4'], NOTE_FREQUENCIES['G4'], NOTE_FREQUENCIES['B4'], NOTE_FREQUENCIES['C5']];
    const noteIndex = noteOverride !== undefined ? noteOverride % synthNotes.length : Math.floor(Math.random() * synthNotes.length);
    const baseFreq = synthNotes[noteIndex];

    // Super saw with multiple detuned oscillators
    const detuneAmounts = [-20, -10, -5, 0, 5, 10, 20];
    const waveTypes: OscillatorType[] = ["sawtooth", "sawtooth", "sawtooth", "sawtooth", "square", "sawtooth", "sawtooth"];

    detuneAmounts.forEach((detune, i) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = waveTypes[i];
      osc.frequency.value = baseFreq;
      osc.detune.value = detune;

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(400, now);
      filter.frequency.exponentialRampToValueAtTime(2000 + (value * 40), now + 0.1);
      filter.frequency.exponentialRampToValueAtTime(600, now + 0.5);
      filter.Q.value = 2;

      const vol = 0.08 * intensity;
      oscGain.gain.setValueAtTime(0, now);
      oscGain.gain.linearRampToValueAtTime(vol, now + 0.02);
      oscGain.gain.setValueAtTime(vol, now + 0.3);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(synthGainNode);

      if (delayRef.current && i === 0) {
        oscGain.connect(delayRef.current);
      }
      if (reverbRef.current && i === 3) {
        oscGain.connect(reverbRef.current);
      }

      osc.start(now);
      osc.stop(now + 0.8);
    });

    // Add shimmer/sparkle on high intensities
    if (intensity > 0.5) {
      const sparkleOsc = ctx.createOscillator();
      const sparkleGain = ctx.createGain();

      sparkleOsc.type = "sine";
      sparkleOsc.frequency.value = baseFreq * 4;

      sparkleGain.gain.setValueAtTime(0.04 * intensity, now);
      sparkleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      sparkleOsc.connect(sparkleGain);
      sparkleGain.connect(synthGainNode);

      sparkleOsc.start(now);
      sparkleOsc.stop(now + 0.4);
    }
  }, [initAudioContext]);

  // ===== HARMONY PAD =====
  const playHarmony = useCallback((value: number) => {
    const ctx = initAudioContext();
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;
    const intensity = value / 100;
    const baseFreq = 220;

    const chordNotes = [baseFreq, baseFreq * 1.25, baseFreq * 1.5, baseFreq * 2];

    chordNotes.forEach((freq) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = "sine";
      osc.frequency.value = freq;

      filter.type = "lowpass";
      filter.frequency.value = 800 + (value * 10);

      oscGain.gain.setValueAtTime(0, now);
      oscGain.gain.linearRampToValueAtTime(0.1 * intensity, now + 0.3);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 2);

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(masterGainRef.current!);

      if (reverbRef.current) {
        oscGain.connect(reverbRef.current);
      }

      osc.start(now);
      osc.stop(now + 2);
    });
  }, [initAudioContext]);

  // ===== RHYTHM CLICK =====
  const playRhythm = useCallback((bpm: number) => {
    const ctx = initAudioContext();
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);
    
    gainNode.gain.setValueAtTime(0.4, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    
    osc.connect(gainNode);
    gainNode.connect(masterGainRef.current!);
    
    osc.start(now);
    osc.stop(now + 0.15);
  }, [initAudioContext]);

  // ===== TEXTURE =====
  const playTexture = useCallback((value: number) => {
    const ctx = initAudioContext();
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;
    const types: OscillatorType[] = ["sine", "triangle", "square", "sawtooth"];
    const typeIndex = Math.floor((value / 100) * 3);
    const type = types[typeIndex];
    const frequency = 330 + (value * 1.5);

    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = type;
    osc2.type = "sine";
    osc.frequency.value = frequency;
    osc2.frequency.value = frequency * 1.5;

    filter.type = "bandpass";
    filter.frequency.value = frequency;
    filter.Q.value = 1;

    gainNode.gain.setValueAtTime(0.15, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(masterGainRef.current!);

    osc.start(now);
    osc.stop(now + 0.6);
    osc2.start(now);
    osc2.stop(now + 0.6);
  }, [initAudioContext]);

  // ===== ATMOSPHERE =====
  const playAtmosphere = useCallback((value: number) => {
    const ctx = initAudioContext();
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;
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
      filter.Q.value = 1;

      gainNode.gain.setValueAtTime(0.02, now);
      gainNode.gain.linearRampToValueAtTime(0.1 * (value / 100), now + 0.5);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 2);

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(masterGainRef.current!);

      if (reverbRef.current) {
        gainNode.connect(reverbRef.current);
      }

      osc.start(now);
      osc.stop(now + 2);
    });
  }, [initAudioContext]);

  // ===== GENRE SOUNDS =====
  const playGenreSound = useCallback((genre: string) => {
    const ctx = initAudioContext();
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;

    switch (genre) {
      case "roots":
        // Acoustic guitar-like strum
        [196, 247, 294, 330, 392].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0, now + i * 0.03);
          gain.gain.linearRampToValueAtTime(0.15, now + i * 0.03 + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.03 + 0.5);
          osc.connect(gain);
          gain.connect(masterGainRef.current!);
          osc.start(now + i * 0.03);
          osc.stop(now + i * 0.03 + 0.5);
        });
        break;
      case "groove":
        // Funky bass
        const bassOsc = ctx.createOscillator();
        const bassGain = ctx.createGain();
        const bassFilter = ctx.createBiquadFilter();
        bassOsc.type = "sawtooth";
        bassOsc.frequency.setValueAtTime(82, now);
        bassOsc.frequency.setValueAtTime(98, now + 0.1);
        bassOsc.frequency.setValueAtTime(82, now + 0.2);
        bassFilter.type = "lowpass";
        bassFilter.frequency.value = 500;
        bassGain.gain.setValueAtTime(0.3, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        bassOsc.connect(bassFilter);
        bassFilter.connect(bassGain);
        bassGain.connect(masterGainRef.current!);
        bassOsc.start(now);
        bassOsc.stop(now + 0.4);
        break;
      case "future":
        // Futuristic arp
        [440, 554, 659, 880, 1109].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();
          osc.type = "sawtooth";
          osc.frequency.value = freq;
          filter.type = "lowpass";
          filter.frequency.value = 3000;
          gain.gain.setValueAtTime(0, now + i * 0.05);
          gain.gain.linearRampToValueAtTime(0.12, now + i * 0.05 + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.2);
          osc.connect(filter);
          filter.connect(gain);
          gain.connect(masterGainRef.current!);
          if (delayRef.current) gain.connect(delayRef.current);
          osc.start(now + i * 0.05);
          osc.stop(now + i * 0.05 + 0.2);
        });
        break;
    }
  }, [initAudioContext]);

  // ===== FULL PLAYBACK SEQUENCER =====
  const startPlayback = useCallback((options: AudioEngineOptions) => {
    if (isPlayingRef.current) return;
    isPlayingRef.current = true;
    currentStepRef.current = 0;

    const ctx = initAudioContext();
    if (ctx.state === "suspended") ctx.resume();

    const beatInterval = 60000 / options.bpm / 2; // 8th notes
    
    // Chord progression for melody
    const chordProgression = [0, 0, 3, 3, 4, 4, 0, 0]; // I-I-IV-IV-V-V-I-I in scale degrees
    let currentChord = 0;

    intervalRef.current = setInterval(() => {
      if (!isPlayingRef.current) return;

      const step = currentStepRef.current;

      // Change chord every 8 steps
      if (step % 8 === 0) {
        currentChord = chordProgression[(step / 8) % chordProgression.length];
      }

      // Drums on every step
      if (options.drums > 10) {
        playDrums(options.drums, step);
      }

      // Bass on beats 1, 2.5, 3 (syncopated)
      if ((step % 4 === 0 || step % 4 === 2) && options.bass > 10) {
        playBass(options.bass, currentChord);
      }

      // Piano chord hits on beats 1 and 3
      if (step % 8 === 0 && options.piano > 10) {
        playPiano(options.piano, currentChord);
        playPiano(options.piano, currentChord + 2);
      }

      // Synth arpeggios
      if (step % 2 === 0 && options.synth > 10) {
        const arpNote = (step / 2) % 4;
        playSynth(options.synth, currentChord + arpNote);
      }

      // Harmony pad every 16 steps
      if (step % 16 === 0) {
        playHarmony(options.harmony);
      }

      // Atmosphere every 32 steps
      if (step % 32 === 0) {
        playAtmosphere(options.atmosphere);
      }

      // Texture fills
      if (step % 8 === 7 && options.texture > 30) {
        playTexture(options.texture);
      }

      currentStepRef.current++;
    }, beatInterval);
  }, [initAudioContext, playDrums, playBass, playPiano, playSynth, playHarmony, playAtmosphere, playTexture]);

  const stopPlayback = useCallback(() => {
    isPlayingRef.current = false;
    currentStepRef.current = 0;
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    sequencerRef.current.forEach(t => clearTimeout(t));
    sequencerRef.current = [];
    
    oscillatorsRef.current.forEach(osc => {
      try { osc.stop(); } catch {}
    });
    oscillatorsRef.current = [];
  }, []);

  // Get analyser for external visualization
  const getAnalyser = useCallback(() => {
    initAudioContext();
    return analyserRef.current;
  }, [initAudioContext]);

  useEffect(() => {
    return () => {
      stopPlayback();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopPlayback]);

  return {
    playNote: playPiano,
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
    isRecording,
    startRecording,
    stopRecording,
    exportRecording,
    volumes,
    updateVolume,
    generateFromLyrics,
    getAnalyser,
  };
};
