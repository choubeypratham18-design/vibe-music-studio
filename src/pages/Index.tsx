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
import { useAudioEngine } from "@/hooks/useAudioEngine";
import { toast } from "sonner";

const Index = () => {
  const [harmony, setHarmony] = useState(20);
  const [rhythm, setRhythm] = useState(77);
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

  useEffect(() => {
    if (isPlaying) {
      startPlayback({ bpm: rhythm, harmony, texture, atmosphere, piano, drums, bass, synth });
    } else {
      stopPlayback();
    }
  }, [isPlaying, rhythm, harmony, texture, atmosphere, piano, drums, bass, synth, startPlayback, stopPlayback]);

  const handleGenerate = () => {
    setIsGenerating(true);
    toast.info("Reality Engine initializing...", {
      description: "Generating your unique vibe composition",
    });
    
    setTimeout(() => {
      setIsGenerating(false);
      setIsPlaying(true);
      toast.success("Vibe Generated!", {
        description: `${selectedGenre.toUpperCase()} track ready at ${rhythm} BPM`,
      });
    }, 3000);
  };

  const handleVocalizeOnly = () => {
    toast.info("Vocalization Mode", {
      description: "Generating vocals for your lyrics...",
    });
  };

  const handleStartRecording = () => {
    startRecording();
    toast.info("Recording Started", {
      description: "Your music is being captured...",
    });
  };

  const handleStopRecording = async () => {
    await stopRecording();
    toast.success("Recording Stopped", {
      description: "Your recording is ready to export",
    });
  };

  const handleExport = async () => {
    await exportRecording();
    toast.success("Track Exported!", {
      description: "Your music has been downloaded",
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
          <section className="flex-1 p-4 relative">
            <ParticleVisualization
              isPlaying={isPlaying}
              bpm={rhythm}
              harmony={harmony}
              rhythm={rhythm}
              texture={texture}
              atmosphere={atmosphere}
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
