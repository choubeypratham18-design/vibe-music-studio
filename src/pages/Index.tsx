import { useState, useEffect, useCallback, useRef } from "react";
import { Header } from "@/components/Header";
import { ParticleVisualization } from "@/components/ParticleVisualization";
import { LyricsInput } from "@/components/LyricsInput";
import { GenreSelector } from "@/components/GenreSelector";
import { GenerateButton } from "@/components/GenerateButton";
import { GlobalTelepathy } from "@/components/GlobalTelepathy";
import { PlaybackControls } from "@/components/PlaybackControls";
import { UniverseBackground } from "@/components/UniverseBackground";
import { VolumeControls } from "@/components/VolumeControls";
import { RecordingControls } from "@/components/RecordingControls";
import { Equalizer } from "@/components/Equalizer";
import { WaveformVisualizer } from "@/components/WaveformVisualizer";
import { PresetManager } from "@/components/PresetManager";
import { AIPromptInput } from "@/components/AIPromptInput";
import { LockableMusicParameter } from "@/components/LockableMusicParameter";
import { LockableInstrumentPanel } from "@/components/LockableInstrumentPanel";
import { AISuggestionsPanel } from "@/components/AISuggestionsPanel";
import { ParameterHistory, HistoryEntry } from "@/components/ParameterHistory";
import { CollaborativeFeedback } from "@/components/CollaborativeFeedback";
import { ABComparisonMode } from "@/components/ABComparisonMode";
import { KeyboardShortcutsHint } from "@/components/KeyboardShortcutsHint";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
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

  // Lock state for producer control
  const [lockedParams, setLockedParams] = useState<Set<string>>(new Set());

  // History tracking
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const lastSavedParams = useRef<string>("");

  // A/B Comparison mode
  const [isABModeEnabled, setIsABModeEnabled] = useState(false);

  // All parameter keys for lock/unlock all
  const allParamKeys = ["harmony", "rhythm", "texture", "atmosphere", "piano", "drums", "bass", "synth"];

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

  // Get current params object
  const getCurrentParams = useCallback(() => ({
    harmony,
    rhythm,
    texture,
    atmosphere,
    piano,
    drums,
    bass,
    synth,
  }), [harmony, rhythm, texture, atmosphere, piano, drums, bass, synth]);

  // Save to history when params change significantly
  useEffect(() => {
    const currentParamsStr = JSON.stringify(getCurrentParams());
    if (currentParamsStr !== lastSavedParams.current) {
      const timeoutId = setTimeout(() => {
        // Only save if actually changed
        if (currentParamsStr !== lastSavedParams.current) {
          const newEntry: HistoryEntry = {
            id: `history-${Date.now()}`,
            timestamp: new Date(),
            params: getCurrentParams(),
            label: generateHistoryLabel(),
          };
          setHistory(prev => [newEntry, ...prev].slice(0, 20)); // Keep last 20
          lastSavedParams.current = currentParamsStr;
        }
      }, 2000); // Debounce 2 seconds

      return () => clearTimeout(timeoutId);
    }
  }, [getCurrentParams]);

  const generateHistoryLabel = () => {
    const labels = [
      "Mix adjustment",
      "Parameter tweak",
      "Sound change",
      "Level update",
      "Tone shift",
    ];
    return labels[Math.floor(Math.random() * labels.length)];
  };

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

  // Toggle lock for a parameter
  const handleToggleLock = (param: string) => {
    setLockedParams(prev => {
      const newSet = new Set(prev);
      if (newSet.has(param)) {
        newSet.delete(param);
        toast.info(`${param.toUpperCase()} unlocked`);
      } else {
        newSet.add(param);
        toast.info(`${param.toUpperCase()} locked`, {
          description: "AI suggestions won't affect this parameter",
        });
      }
      return newSet;
    });
  };

  // Lock all parameters
  const handleLockAll = useCallback(() => {
    setLockedParams(new Set(allParamKeys));
    toast.success("All parameters locked", {
      description: "AI and collaborator suggestions won't affect any parameter",
    });
  }, []);

  // Unlock all parameters
  const handleUnlockAll = useCallback(() => {
    setLockedParams(new Set());
    toast.success("All parameters unlocked");
  }, []);

  // Undo - revert to last history entry
  const handleUndo = useCallback(() => {
    if (history.length > 0) {
      const lastEntry = history[0];
      handleRevertToHistory(lastEntry.params);
      toast.info("Undone to previous state");
    } else {
      toast.warning("No history to undo");
    }
  }, [history]);

  // Toggle A/B mode
  const handleToggleAB = useCallback(() => {
    setIsABModeEnabled(prev => !prev);
  }, []);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onPlayPause: () => setIsPlaying(prev => !prev),
    onLockAll: handleLockAll,
    onUnlockAll: handleUnlockAll,
    onUndo: handleUndo,
    onToggleAB: handleToggleAB,
  });

  // Apply AI suggestion
  const handleApplySuggestion = (param: string, value: number) => {
    if (lockedParams.has(param)) return;
    
    switch (param) {
      case "harmony": setHarmony(value); break;
      case "rhythm": setRhythm(value); break;
      case "texture": setTexture(value); break;
      case "atmosphere": setAtmosphere(value); break;
      case "piano": setPiano(value); break;
      case "drums": setDrums(value); break;
      case "bass": setBass(value); break;
      case "synth": setSynth(value); break;
    }
  };

  // Revert to history entry
  const handleRevertToHistory = (params: HistoryEntry["params"]) => {
    setHarmony(params.harmony);
    setRhythm(params.rhythm);
    setTexture(params.texture);
    setAtmosphere(params.atmosphere);
    setPiano(params.piano);
    setDrums(params.drums);
    setBass(params.bass);
    setSynth(params.synth);
  };

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
      // Respect locked parameters
      if (!lockedParams.has("harmony")) setHarmony(generatedParams.harmony);
      if (!lockedParams.has("atmosphere")) setAtmosphere(generatedParams.atmosphere);
      if (!lockedParams.has("piano")) setPiano(generatedParams.piano);
      if (!lockedParams.has("synth")) setSynth(generatedParams.synth);
      if (!lockedParams.has("drums")) setDrums(generatedParams.drums);
      if (!lockedParams.has("bass")) setBass(generatedParams.bass);
      if (!lockedParams.has("texture")) setTexture(generatedParams.texture);
      
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
    // Respect locked parameters
    if (!lockedParams.has("harmony")) setHarmony(params.harmony);
    if (!lockedParams.has("rhythm")) setRhythm(params.rhythm);
    if (!lockedParams.has("texture")) setTexture(params.texture);
    if (!lockedParams.has("atmosphere")) setAtmosphere(params.atmosphere);
    if (!lockedParams.has("piano")) setPiano(params.piano);
    if (!lockedParams.has("drums")) setDrums(params.drums);
    if (!lockedParams.has("bass")) setBass(params.bass);
    if (!lockedParams.has("synth")) setSynth(params.synth);
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
    // Respect locked parameters when loading presets
    if (!lockedParams.has("harmony")) setHarmony(params.harmony);
    if (!lockedParams.has("rhythm")) setRhythm(params.rhythm);
    if (!lockedParams.has("texture")) setTexture(params.texture);
    if (!lockedParams.has("atmosphere")) setAtmosphere(params.atmosphere);
    if (!lockedParams.has("piano")) setPiano(params.piano);
    if (!lockedParams.has("drums")) setDrums(params.drums);
    if (!lockedParams.has("bass")) setBass(params.bass);
    if (!lockedParams.has("synth")) setSynth(params.synth);
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
    if (!lockedParams.has("rhythm")) {
      setRhythm(bpm);
      toast.info(`Speed: ${bpm} BPM`);
    } else {
      toast.warning("BPM is locked");
    }
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
            <LockableMusicParameter
              label="HARMONY"
              sublabel="Chord tension"
              value={harmony}
              onChange={setHarmony}
              onInteract={playHarmony}
              variant="primary"
              isLocked={lockedParams.has("harmony")}
              onToggleLock={() => handleToggleLock("harmony")}
              paramKey="harmony"
            />
            <LockableMusicParameter
              label="RHYTHM"
              sublabel="Tempo & sync"
              value={rhythm}
              onChange={setRhythm}
              onInteract={playRhythm}
              min={60}
              max={180}
              unit=" BPM"
              variant="accent"
              isLocked={lockedParams.has("rhythm")}
              onToggleLock={() => handleToggleLock("rhythm")}
              paramKey="rhythm"
            />
            <LockableMusicParameter
              label="TEXTURE"
              sublabel="Acoustic ↔ Digital"
              value={texture}
              onChange={setTexture}
              onInteract={playTexture}
              variant="primary"
              isLocked={lockedParams.has("texture")}
              onToggleLock={() => handleToggleLock("texture")}
              paramKey="texture"
            />
            <LockableMusicParameter
              label="ATMOSPHERE"
              sublabel="Reverb & Delay"
              value={atmosphere}
              onChange={setAtmosphere}
              onInteract={playAtmosphere}
              variant="primary"
              isLocked={lockedParams.has("atmosphere")}
              onToggleLock={() => handleToggleLock("atmosphere")}
              paramKey="atmosphere"
            />
            <VolumeControls 
              volumes={volumes} 
              onVolumeChange={updateVolume} 
            />
            <PresetManager
              currentParams={{ harmony, rhythm, texture, atmosphere, piano, drums, bass, synth, genre: selectedGenre }}
              onLoadPreset={handleLoadPreset}
            />
            
            {/* History Panel */}
            <ParameterHistory
              currentParams={getCurrentParams()}
              history={history}
              onRevert={handleRevertToHistory}
              onPreview={handleRevertToHistory}
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

            {/* Collaborative Feedback */}
            <CollaborativeFeedback
              currentParams={getCurrentParams()}
              onApplySuggestion={handleApplySuggestion}
            />

            {/* A/B Comparison Mode */}
            <ABComparisonMode
              currentParams={getCurrentParams()}
              onApplyParams={handleRevertToHistory}
              isEnabled={isABModeEnabled}
              onToggle={handleToggleAB}
            />

            {/* AI Co-Pilot Suggestions */}
            <AISuggestionsPanel
              currentParams={getCurrentParams()}
              lockedParams={lockedParams}
              onApplySuggestion={handleApplySuggestion}
              isPlaying={isPlaying}
            />

            <AIPromptInput onGenerate={handleAIPromptGenerate} />

            <LockableInstrumentPanel
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
              lockedParams={lockedParams}
              onToggleLock={handleToggleLock}
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

        {/* Keyboard Shortcuts Hint */}
        <KeyboardShortcutsHint />

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
