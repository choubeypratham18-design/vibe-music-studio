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
import { WaveformVisualizer } from "@/components/WaveformVisualizer";
import { PresetManager } from "@/components/PresetManager";
import { AIPromptInput } from "@/components/AIPromptInput";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<"left" | "right">("right");

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
    getAnalyser,
  } = useAudioEngine();

  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  // Get analyser when playing starts
  useEffect(() => {
    if (isPlaying) {
      const analyserNode = getAnalyser();
      setAnalyser(analyserNode);
    }
  }, [isPlaying, getAnalyser]);

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
        description: "Write some lyrics to generate AI music",
      });
      return;
    }

    setIsGenerating(true);
    toast.info("AI Processing...", {
      description: "Analyzing your input and generating unique music",
    });
    
    const generatedParams = generateFromLyrics(lyrics, selectedGenre);
    
    setTimeout(() => {
      setHarmony(generatedParams.harmony);
      setAtmosphere(generatedParams.atmosphere);
      setPiano(generatedParams.piano);
      setSynth(generatedParams.synth);
      setDrums(generatedParams.drums);
      setBass(generatedParams.bass);
      setTexture(generatedParams.texture);
      
      setIsGenerating(false);
      setIsPlaying(true);
      toast.success("AI Music Generated!", {
        description: `${selectedGenre.toUpperCase()} at ${rhythm} BPM - Mood: ${generatedParams.harmony > 50 ? 'Upbeat' : 'Chill'}`,
      });
    }, 2500);
  };

  const handleAIPromptGenerate = (params: {
    harmony: number;
    rhythm: number;
    texture: number;
    atmosphere: number;
    piano: number;
    drums: number;
    bass: number;
    synth: number;
    genre: string;
  }) => {
    setHarmony(params.harmony);
    setRhythm(params.rhythm);
    setTexture(params.texture);
    setAtmosphere(params.atmosphere);
    setPiano(params.piano);
    setDrums(params.drums);
    setBass(params.bass);
    setSynth(params.synth);
    setSelectedGenre(params.genre);
    setIsPlaying(true);
  };

  const handleLoadPreset = (params: {
    harmony: number;
    rhythm: number;
    texture: number;
    atmosphere: number;
    piano: number;
    drums: number;
    bass: number;
    synth: number;
    genre: string;
  }) => {
    setHarmony(params.harmony);
    setRhythm(params.rhythm);
    setTexture(params.texture);
    setAtmosphere(params.atmosphere);
    setPiano(params.piano);
    setDrums(params.drums);
    setBass(params.bass);
    setSynth(params.synth);
    setSelectedGenre(params.genre);
  };

  const handleVocalizeOnly = () => {
    if (!lyrics.trim()) {
      toast.warning("Please enter lyrics first");
      return;
    }
    toast.info("Vocalization Mode", {
      description: "Generating vocals...",
    });
  };

  const handleStartRecording = () => {
    if (!isPlaying) {
      toast.warning("Start playing music first");
      return;
    }
    startRecording();
    toast.info("Recording Started");
  };

  const handleStopRecording = async () => {
    await stopRecording();
    toast.success("Recording Stopped", {
      description: `Recorded ${recordingTime} seconds`,
    });
  };

  const handleExport = async (format: 'wav' | 'mp3' = 'wav') => {
    const blob = await exportRecording(format);
    if (blob) {
      toast.success(`Track Exported as ${format.toUpperCase()}!`);
    } else {
      toast.warning("No recording to export");
    }
  };

  const handleBpmChange = (bpm: number) => {
    setRhythm(bpm);
    toast.info(`Speed: ${bpm} BPM`);
  };

  return (
    <div className="min-h-screen overflow-hidden relative">
      <UniverseBackground isPlaying={isPlaying} intensity={musicIntensity} />
      
      <div className="relative z-10 flex flex-col h-screen">
        <Header 
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          isMenuOpen={isMobileMenuOpen} 
        />
        
        {/* Mobile Panel Toggle */}
        <div className="lg:hidden flex border-b border-border/30 bg-background/50 backdrop-blur-sm">
          <button
            onClick={() => setActivePanel("left")}
            className={`flex-1 py-2 text-xs font-display ${activePanel === "left" ? "text-ai-purple border-b-2 border-ai-purple" : "text-muted-foreground"}`}
          >
            PARAMETERS
          </button>
          <button
            onClick={() => setActivePanel("right")}
            className={`flex-1 py-2 text-xs font-display ${activePanel === "right" ? "text-ai-pink border-b-2 border-ai-pink" : "text-muted-foreground"}`}
          >
            CONTROLS
          </button>
        </div>

        <main className="flex-1 flex overflow-hidden">
          {/* Left Panel - Parameters */}
          <aside className={`
            ${activePanel === "left" ? "flex" : "hidden"} lg:flex
            w-full lg:w-72 xl:w-80 p-2 sm:p-4 space-y-2 sm:space-y-4 overflow-y-auto 
            border-r border-border/30 bg-background/30 backdrop-blur-sm flex-col
          `}>
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
              sublabel="Tempo & sync"
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
              sublabel="Reverb & Delay"
              value={atmosphere}
              onChange={setAtmosphere}
              onInteract={playAtmosphere}
              variant="primary"
            />
            <VolumeControls 
              volumes={volumes} 
              onVolumeChange={updateVolume} 
            />
            <PresetManager
              currentParams={{ harmony, rhythm, texture, atmosphere, piano, drums, bass, synth, genre: selectedGenre }}
              onLoadPreset={handleLoadPreset}
            />
          </aside>

          {/* Center - Visualization (hidden on mobile, shown on larger screens) */}
          <section className="hidden lg:flex flex-1 p-2 sm:p-4 relative flex-col gap-2 sm:gap-4">
            <ParticleVisualization
              isPlaying={isPlaying}
              bpm={rhythm}
              harmony={harmony}
              rhythm={rhythm}
              texture={texture}
              atmosphere={atmosphere}
            />
            <WaveformVisualizer
              isPlaying={isPlaying}
              analyser={analyser}
              piano={piano}
              drums={drums}
              bass={bass}
              synth={synth}
            />
            <Equalizer
              isPlaying={isPlaying}
              analyser={analyser}
              piano={piano}
              drums={drums}
              bass={bass}
              synth={synth}
              harmony={harmony}
              rhythm={rhythm}
            />
          </section>

          {/* Right Panel - Controls */}
          <aside className={`
            ${activePanel === "right" ? "flex" : "hidden"} lg:flex
            w-full lg:w-80 xl:w-96 p-2 sm:p-4 space-y-2 sm:space-y-4 overflow-y-auto 
            border-l border-border/30 bg-background/30 backdrop-blur-sm flex-col
          `}>
            {/* Mobile-only visualizations */}
            <div className="lg:hidden space-y-2">
              <Equalizer
                isPlaying={isPlaying}
                analyser={analyser}
                piano={piano}
                drums={drums}
                bass={bass}
                synth={synth}
                harmony={harmony}
                rhythm={rhythm}
              />
              <WaveformVisualizer
                isPlaying={isPlaying}
                analyser={analyser}
                piano={piano}
                drums={drums}
                bass={bass}
                synth={synth}
              />
            </div>

            <AIPromptInput onGenerate={handleAIPromptGenerate} />

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
        <footer className="border-t border-border/30 bg-background/50 backdrop-blur-sm">
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
