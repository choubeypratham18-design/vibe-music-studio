import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { MusicParameter } from "@/components/MusicParameter";
import { ParticleVisualization } from "@/components/ParticleVisualization";
import { LyricsInput } from "@/components/LyricsInput";
import { GenreSelector } from "@/components/GenreSelector";
import { GenerateButton } from "@/components/GenerateButton";
import { GlobalTelepathy } from "@/components/GlobalTelepathy";
import { PlaybackControls } from "@/components/PlaybackControls";
import { InstrumentPanel } from "@/components/InstrumentPanel";
import { UniverseBackground } from "@/components/UniverseBackground";
import { VolumeControls } from "@/components/VolumeControls";
import { RecordingControls } from "@/components/RecordingControls";
import { Equalizer } from "@/components/Equalizer";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import { toast } from "sonner";

const Index = () => {
  const [harmony, setHarmony] = useState(20);
  const [rhythm, setRhythm] = useState(110);
  const [texture, setTexture] = useState(12);
  const [atmosphere, setAtmosphere] = useState(40);
  const [piano, setPiano] = useState(50);
  const [drums, setDrums] = useState(60);
  const [bass, setBass] = useState(45);
  const [synth, setSynth] = useState(55);
  const [lyrics, setLyrics] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("groove");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTime, setCurrentTime] = useState("00:00:00");
  const [recordingTime, setRecordingTime] = useState(0);

  const { 
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
  } = useAudioEngine();

  // Calculate overall intensity for universe background
  const musicIntensity = (harmony + rhythm / 2 + texture + atmosphere + piano + drums + bass + synth) / 8;

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Recording time tracker
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      setRecordingTime(0);
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    if (isPlaying) {
      startPlayback({ bpm: rhythm, harmony, texture, atmosphere, piano, drums, bass, synth, lyrics, genre: selectedGenre });
    } else {
      stopPlayback();
    }
  }, [isPlaying, rhythm, harmony, texture, atmosphere, piano, drums, bass, synth, startPlayback, stopPlayback, lyrics, selectedGenre]);

  const handleGenerate = () => {
    if (!lyrics.trim()) {
      toast.warning("Please enter lyrics first", {
        description: "Write some lyrics in Soul Patch to generate music",
      });
      return;
    }

    setIsGenerating(true);
    toast.info("Reality Engine initializing...", {
      description: "Analyzing lyrics and generating your unique vibe composition",
    });
    
    // Generate parameters from lyrics
    const generatedParams = generateFromLyrics(lyrics, selectedGenre);
    
    setTimeout(() => {
      // Apply generated parameters
      setHarmony(generatedParams.harmony);
      setAtmosphere(generatedParams.atmosphere);
      setPiano(generatedParams.piano);
      setSynth(generatedParams.synth);
      setDrums(generatedParams.drums);
      setBass(generatedParams.bass);
      setTexture(generatedParams.texture);
      
      setIsGenerating(false);
      setIsPlaying(true);
      toast.success("Vibe Generated from Lyrics!", {
        description: `${selectedGenre.toUpperCase()} track ready at ${rhythm} BPM - Mood: ${generatedParams.harmony > 50 ? 'Happy' : 'Melancholic'}`,
      });
    }, 3000);
  };

  const handleVocalizeOnly = () => {
    if (!lyrics.trim()) {
      toast.warning("Please enter lyrics first", {
        description: "Write some lyrics to vocalize",
      });
      return;
    }
    toast.info("Vocalization Mode", {
      description: "Generating vocals for your lyrics...",
    });
  };

  const handleStartRecording = () => {
    if (!isPlaying) {
      toast.warning("Start playing music first", {
        description: "Play music before recording",
      });
      return;
    }
    startRecording();
    toast.info("Recording Started", {
      description: "Your music is being captured...",
    });
  };

  const handleStopRecording = async () => {
    await stopRecording();
    toast.success("Recording Stopped", {
      description: `Recorded ${recordingTime} seconds - Ready to export`,
    });
  };

  const handleExport = async () => {
    const blob = await exportRecording();
    if (blob) {
      toast.success("Track Exported!", {
        description: "Your music has been downloaded to your system",
      });
    } else {
      toast.warning("No recording to export", {
        description: "Record some music first before exporting",
      });
    }
  };

  const handleBpmChange = (bpm: number) => {
    setRhythm(bpm);
    toast.info(`Speed Changed: ${bpm} BPM`, {
      description: bpm <= 80 ? "Slow tempo" : bpm <= 120 ? "Medium tempo" : "Fast tempo",
    });
  };

  return (
    <div className="min-h-screen overflow-hidden relative">
      {/* Universe Background */}
      <UniverseBackground isPlaying={isPlaying} intensity={musicIntensity} />
      
      {/* Content Layer */}
      <div className="relative z-10">
        <Header />
        
        <main className="h-[calc(100vh-73px-88px)] flex">
          {/* Left Panel - Parameters */}
          <aside className="w-72 p-4 space-y-4 overflow-y-auto border-r border-border/30 bg-background/30 backdrop-blur-sm">
            <MusicParameter
              label="HARMONY"
              sublabel="Chord tension"
              value={harmony}
              onChange={setHarmony}
              onInteract={playHarmony}
              variant="primary"
            />
            <MusicParameter
              label="RHYTHM"
              sublabel="Tempo & syncopation"
              value={rhythm}
              onChange={setRhythm}
              onInteract={playRhythm}
              min={60}
              max={180}
              unit=" BPM"
              variant="accent"
            />
            <MusicParameter
              label="TEXTURE"
              sublabel="Acoustic ↔ Digital"
              value={texture}
              onChange={setTexture}
              onInteract={playTexture}
              variant="primary"
            />
            <MusicParameter
              label="ATMOSPHERE"
              sublabel="Reverb & Delay mix"
              value={atmosphere}
              onChange={setAtmosphere}
              onInteract={playAtmosphere}
              variant="primary"
            />

            {/* Volume Controls */}
            <VolumeControls 
              volumes={volumes} 
              onVolumeChange={updateVolume} 
            />
          </aside>

          {/* Center - Visualization */}
          <section className="flex-1 p-4 relative flex flex-col gap-4">
            <ParticleVisualization
              isPlaying={isPlaying}
              bpm={rhythm}
              harmony={harmony}
              rhythm={rhythm}
              texture={texture}
              atmosphere={atmosphere}
            />
            
            {/* Equalizer Display */}
            <Equalizer
              isPlaying={isPlaying}
              piano={piano}
              drums={drums}
              bass={bass}
              synth={synth}
              harmony={harmony}
              rhythm={rhythm}
            />
          </section>

          {/* Right Panel - Controls */}
          <aside className="w-96 p-4 space-y-4 overflow-y-auto border-l border-border/30 bg-background/30 backdrop-blur-sm">
            <InstrumentPanel
              piano={piano}
              drums={drums}
              bass={bass}
              synth={synth}
              onPianoChange={setPiano}
              onDrumsChange={setDrums}
              onBassChange={setBass}
              onSynthChange={setSynth}
              onPianoInteract={playPiano}
              onDrumsInteract={playDrums}
              onBassInteract={playBass}
              onSynthInteract={playSynth}
            />

            {/* Recording Controls */}
            <RecordingControls
              isRecording={isRecording}
              isPlaying={isPlaying}
              onStartRecording={handleStartRecording}
              onStopRecording={handleStopRecording}
              onExport={handleExport}
            />

            <LyricsInput value={lyrics} onChange={setLyrics} />
            
            <GenerateButton
              onGenerate={handleGenerate}
              onVocalizeOnly={handleVocalizeOnly}
              isGenerating={isGenerating}
            />

            <GenreSelector
              selectedGenre={selectedGenre}
              onSelect={setSelectedGenre}
              onPlaySound={playGenreSound}
              onBpmChange={handleBpmChange}
            />

            <GlobalTelepathy />
          </aside>
        </main>

        {/* Bottom - Playback */}
        <footer className="h-[88px] border-t border-border/30 bg-background/50 backdrop-blur-sm">
          <PlaybackControls
            isPlaying={isPlaying}
            onPlayPause={() => setIsPlaying(!isPlaying)}
            bpm={rhythm}
            currentTime={currentTime}
          />
        </footer>
      </div>
    </div>
  );
};

export default Index;
